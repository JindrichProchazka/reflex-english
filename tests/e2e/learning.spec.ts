import { answer } from './answer';
import { test, expect } from '@playwright/test';
import { drillById } from '../../src/content/drills';
const concepts = drillById('in-on-at')!.concepts;

test('mistakes lead to delayed retrieval, completion and durable progress', async ({
  page,
  context,
}) => {
  await page.goto('./');
  await expect(page.getByRole('heading', { name: /Make room/ })).toBeVisible();
  await page.screenshot({
    path: `test-results/home-${test.info().project.name}.png`,
    fullPage: true,
  });
  await page.getByRole('link', { name: /Open Quick Reflex Drills/ }).click();
  await page
    .getByRole('region', { name: 'IN / ON / AT', exact: true })
    .getByRole('button', { name: 'Start Normal' })
    .click();
  const prompt = page.getByTestId('prompt');
  const original = await prompt.innerText();
  const first = concepts
    .flatMap((c) => c.exercises)
    .find((e) => e.prompt === original)!;
  await answer(page, 'wrong');
  await expect(page.getByText('Not quite. Try again.')).toBeVisible();
  await expect(page.getByText(/The answer is/)).toHaveCount(0);
  await page.reload();
  await expect(page.getByText('Not quite. Try again.')).toBeVisible();
  await answer(page, 'wrong');
  await expect(
    page.getByText(`The answer is “${first.answer}”.`),
  ).toBeVisible();
  await answer(page, first.answer);
  await expect(prompt).not.toHaveText(original);
  const seenKinds: string[] = [];
  let steps = 0;
  while (await prompt.isVisible()) {
    if (++steps > 150) throw new Error('Session did not terminate');
    const text = await prompt.innerText();
    const exercise = concepts
      .flatMap((c) => c.exercises)
      .find((e) => e.prompt === text)!;
    if (exercise.conceptId === first.conceptId) {
      if (seenKinds.length === 0) expect(steps).toBe(6);
      expect(text).not.toBe(original);
      seenKinds.push(await page.locator('.practice > .eyebrow').innerText());
    }
    await answer(page, exercise.answer);
    // Read the next prompt or saved state atomically: the final prompt can
    // disappear between a visibility check and an innerText() call.
    await expect
      .poll(async () => {
        const next = await prompt
          .or(page.getByText('PRACTICE SAVED', { exact: true }))
          .allTextContents();
        return next.length === 1 && next[0] !== text;
      })
      .toBe(true);
  }
  expect(seenKinds).toHaveLength(2);
  expect(seenKinds[1]).toContain('CLOSING RECALL');
  await expect(page.getByText('PRACTICE SAVED', { exact: true })).toBeVisible();
  await expect(
    page.getByRole('heading', { name: 'Needs more practice' }),
  ).toBeVisible();
  const weak = page.getByRole('region', { name: 'Needs more practice' });
  await expect(weak).toContainText(
    concepts.find((c) => c.id === first.conceptId)!.title,
  );
  await expect(weak).toContainText(
    /review (today|tomorrow|in \d+ (days|weeks))/,
  );
  await expect(page.locator('main time').first()).not.toBeVisible();
  await page.getByText('View all scheduled reviews', { exact: true }).click();
  await expect(page.locator('main time').first()).toBeVisible();
  await page.getByText('View all scheduled reviews', { exact: true }).click();
  await expect(page.locator('body')).toHaveJSProperty(
    'scrollWidth',
    await page.evaluate(() => innerWidth),
  );
  await page.screenshot({
    path: `test-results/session-summary-${test.info().project.name}.png`,
    fullPage: true,
  });
  await page.reload();
  await expect(page.getByText('PRACTICE SAVED', { exact: true })).toBeVisible();
  await page.getByRole('link', { name: 'Back to home' }).click();
  const stats = page.getByLabel('Learning progress');
  await expect(stats).toContainText(`${steps + 3}Attempts saved`);
  await expect(stats).toContainText('1Sessions completed');
  await expect(
    page.getByText('2 incorrect attempts', { exact: false }),
  ).toBeVisible();
  await expect(page.locator('body')).toHaveJSProperty(
    'scrollWidth',
    await page.evaluate(() => window.innerWidth),
  );
  // The production PWA can reopen the cached app without a connection.
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
  });
  await context.setOffline(true);
  await page.reload();
  await expect(
    page.getByRole('link', { name: /Open Quick Reflex Drills/ }),
  ).toBeVisible();
  await expect(page.getByLabel('Learning progress')).toContainText(
    '1Sessions completed',
  );
  await context.setOffline(false);
});
