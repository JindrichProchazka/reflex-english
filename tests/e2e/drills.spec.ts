import { test, expect } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import { drills, drillById } from '../../src/content/drills';
import type { Backup } from '../../src/domain/backup';

test('Quick Reflex Drills → articles → error/correction → varied delayed retry → closing → saved progress after reload', async ({
  page,
  context,
}) => {
  test.setTimeout(90000);
  await page.goto('./');
  await page.getByRole('link', { name: /Open Quick Reflex Drills/ }).click();
  await expect(
    page.getByRole('heading', { name: 'Quick Reflex Drills', exact: true }),
  ).toBeVisible();
  for (const drill of drills) {
    const card = page.getByRole('region', { name: drill.title, exact: true });
    await expect(card).toContainText(
      `${drill.concepts.reduce((n, c) => n + c.exercises.length, 0)} authored sentence variants`,
    );
    await expect(
      card.getByRole('button', { name: 'Start Quick', exact: true }),
    ).toBeEnabled();
    await expect(
      card.getByRole('button', { name: 'Due Review', exact: true }),
    ).toBeDisabled();
  }
  await expect(page.locator('body')).toHaveJSProperty(
    'scrollWidth',
    await page.evaluate(() => window.innerWidth),
  );
  await page.screenshot({
    path: `test-results/drills-hub-${test.info().project.name}.png`,
  });
  const articles = page.getByRole('region', { name: 'Articles', exact: true });
  await articles
    .getByRole('button', { name: 'Start Quick', exact: true })
    .click();
  const prompt = page.getByTestId('prompt'),
    input = page.getByLabel('Your answer', { exact: true });
  const exercises = drillById('articles')!.concepts.flatMap((c) => c.exercises);
  const originalText = await prompt.innerText();
  const original = exercises.find((e) => e.prompt === originalText)!;
  await input.fill('wrong');
  await page.getByRole('button', { name: 'Check answer', exact: true }).click();
  await expect(
    page.getByText('Not quite. Try again.', { exact: true }),
  ).toBeVisible();
  await expect(page.getByText(/The answer is/)).toHaveCount(0);
  await page.reload();
  await expect(
    page.getByText('Not quite. Try again.', { exact: true }),
  ).toBeVisible();
  await input.fill('still wrong');
  await page.getByRole('button', { name: 'Check answer', exact: true }).click();
  await expect(
    page.getByText(`The answer is “${original.answer}”.`, { exact: true }),
  ).toBeVisible();
  await input.fill(original.answer);
  await page
    .getByRole('button', { name: 'Reproduce answer', exact: true })
    .click();
  await expect(prompt).not.toHaveText(original.prompt);
  let steps = 0,
    returns = 0;
  while (await prompt.isVisible()) {
    if (++steps > 70) throw new Error('Drill failed to complete');
    const text = await prompt.innerText(),
      exercise = exercises.find((e) => e.prompt === text)!;
    expect(exercise).toBeDefined();
    if (exercise.conceptId === original.conceptId) {
      returns++;
      expect(exercise.id).not.toBe(original.id);
      if (returns === 1) expect(steps).toBe(6);
      if (returns === 2)
        await expect(page.locator('.practice > .eyebrow')).toContainText(
          'CLOSING RECALL',
        );
    }
    await input.fill(exercise.answer);
    await page
      .getByRole('button', { name: 'Check answer', exact: true })
      .click();
    await expect
      .poll(async () => {
        const next = await prompt
          .or(page.getByText('PRACTICE SAVED', { exact: true }))
          .allTextContents();
        return next.length === 1 && next[0] !== text;
      })
      .toBe(true);
  }
  expect(returns).toBe(2);
  await page.reload();
  await expect(page.getByText('PRACTICE SAVED', { exact: true })).toBeVisible();
  await page
    .getByRole('link', { name: 'Return to Quick Reflex Drills', exact: true })
    .click();
  await expect(articles).toContainText('Recent mistakes:');
  await expect(articles).toContainText(
    drillById('articles')!.concepts.find((c) => c.id === original.conceptId)!
      .title,
  );
  await expect(articles).not.toContainText('No unassisted practice yet');
  const progress = await articles.locator('dl').innerText();
  await page.reload();
  await expect.poll(() => articles.locator('dl').innerText()).toBe(progress);
  await articles
    .getByRole('link', { name: 'Review mistakes in Weak Areas' })
    .click();
  await expect(
    page.getByRole('heading', { name: /Mistakes.*Weak Areas/ }),
  ).toBeVisible();
  await expect(
    page.getByText('Articles', { exact: false }).first(),
  ).toBeVisible();
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
  });
  await context.setOffline(true);
  await page.goto('./#/drills');
  await expect(articles.locator('dl')).toBeVisible();
  expect(await articles.locator('dl').innerText()).toBe(progress);
  await context.setOffline(false);
});

test('recent exact prompts stay avoided across completed sessions, page closure and reload; history is in the JSON backup', async ({
  page: originalPage,
  context,
}) => {
  test.setTimeout(120000);
  let page = originalPage;
  const drill = drillById('articles')!,
    exercises = drill.concepts.flatMap((c) => c.exercises);
  const seen: string[] = [];
  for (let round = 0; round < 2; round++) {
    await page.goto('./#/drills');
    await page
      .getByRole('region', { name: 'Articles', exact: true })
      .getByRole('button', { name: 'Start Normal', exact: true })
      .click();
    const prompt = page.getByTestId('prompt');
    await expect(prompt).toBeVisible();
    let steps = 0;
    while (await prompt.isVisible()) {
      if (++steps > 30)
        throw new Error('Clean Normal session exceeded expected size');
      const text = await prompt.innerText(),
        exercise = exercises.find((e) => e.prompt === text)!;
      expect(exercise).toBeDefined();
      const previous = seen.lastIndexOf(exercise.id);
      if (previous >= 0)
        expect(seen.length - previous - 1).toBeGreaterThanOrEqual(30);
      seen.push(exercise.id);
      await page
        .getByLabel('Your answer', { exact: true })
        .fill(exercise.answer);
      await page
        .getByRole('button', { name: 'Check answer', exact: true })
        .click();
      await expect
        .poll(async () => {
          const next = await prompt
            .or(page.getByText('PRACTICE SAVED', { exact: true }))
            .allTextContents();
          return next.length === 1 && next[0] !== text;
        })
        .toBe(true);
      if (steps === 5) {
        const nextText = await prompt.innerText();
        await page.reload();
        await expect(prompt).toHaveText(nextText);
      }
    }
    expect(steps).toBe(20);
    await expect(
      page.getByText('PRACTICE SAVED', { exact: true }),
    ).toBeVisible();
    if (round === 0) {
      await page.close();
      page = await context.newPage();
    }
  }
  await page.getByRole('link', { name: 'Data / Backup', exact: true }).click();
  const exportButton = page.getByRole('button', {
    name: 'Export backup',
    exact: true,
  });
  await expect(exportButton).toBeEnabled();
  const [download] = await Promise.all([
    page.waitForEvent('download'),
    exportButton.click(),
  ]);
  const path = await download.path();
  if (!path) throw new Error('No JSON backup download');
  const backup = JSON.parse(await readFile(path, 'utf8')) as Backup;
  const history = backup.data.settings.find(
    (s) => s.key === 'drill-history:articles',
  )!.value as { version: number; promptIds: string[] };
  expect(backup.dataVersion).toBe(4);
  expect(history.version).toBe(1);
  expect(history.promptIds).toEqual(seen);
  expect(history.promptIds.length).toBeLessThanOrEqual(96);
  await expect(exportButton).toBeEnabled();
  await page.goto('./#/drills');
  const card = page.getByRole('region', { name: 'Articles', exact: true });
  await expect(card).toContainText('100%');
  await expect(card).toContainText('None recorded in the last 30 days');
  await page.close();
});
