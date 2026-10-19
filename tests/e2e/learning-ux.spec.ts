import { expect, test } from '@playwright/test';
import { drills, drillById } from '../../src/content/drills';
import { studyLessons } from '../../src/content/study-lessons';
import { lessonContent } from '../../src/domain/study';
import { acceptedExerciseAnswers } from '../../src/domain/evaluation';
import { answer, expectPromptChanged } from './answer';

test('answer buttons wrap at phone widths, reject rapid duplicate taps and support keyboard; verb forms stay typed', async ({
  page,
}) => {
  await page.goto('./#/drills');
  await page
    .getByRole('region', { name: 'IN / ON / AT', exact: true })
    .getByRole('button', { name: 'Start Quick', exact: true })
    .click();
  const prompt = page.getByTestId('prompt');
  const text = await prompt.innerText();
  const exercise = drillById('in-on-at')!
    .concepts.flatMap((c) => c.exercises)
    .find((e) => e.prompt === text)!;
  const group = page.getByRole('group', { name: 'Answer choices' });
  await expect(group.getByRole('button')).toHaveCount(3);
  await expect(page.getByRole('textbox')).toHaveCount(0);
  for (const button of await group.getByRole('button').all()) {
    const box = await button.boundingBox();
    expect(box!.height).toBeGreaterThanOrEqual(44);
    expect(box!.width).toBeGreaterThanOrEqual(44);
  }
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  const correct = group.getByRole('button', {
    name: exercise.answer.toUpperCase(),
    exact: true,
  });
  await correct.dblclick();
  await expectPromptChanged(page, text);
  await page.getByRole('link', { name: 'Data / Backup', exact: true }).click();
  await expect(
    page.getByRole('region', { name: 'Current local data' }),
  ).toContainText('Attempts: 1');
  await page.goBack();
  await expect(prompt).toBeVisible();
  const nextText = await prompt.innerText();
  const next = drillById('in-on-at')!
    .concepts.flatMap((c) => c.exercises)
    .find((e) => e.prompt === nextText)!;
  const keyButton = group.getByRole('button', {
    name: next.answer.toUpperCase(),
    exact: true,
  });
  await keyButton.focus();
  await expect(keyButton).toBeFocused();
  await page.keyboard.press('Enter');
  await expectPromptChanged(page, nextText);
  await page.screenshot({
    path: `test-results/button-drill-${test.info().project.name}.png`,
  });
  await page.goto('./#/drills');
  for (const id of [
    'present-perfect-past-simple',
    'past-simple-continuous',
    'verb-preposition-patterns',
  ]) {
    await page
      .getByRole('region', { name: drillById(id)!.title, exact: true })
      .getByRole('button', { name: 'Start Quick', exact: true })
      .click();
    await expect(
      page.locator('#answer'),
    ).toBeVisible();
    await expect(
      page.getByRole('group', { name: 'Answer choices' }),
    ).toHaveCount(0);
    await page.goto('./#/drills');
  }
  // All bounded-module layouts are exercised, including eight-option sets.
  for (const drill of drills.filter(
    (d) =>
      ![
        'present-perfect-past-simple',
        'past-simple-continuous',
        'in-on-at',
        'verb-preposition-patterns',
      ].includes(d.id),
  )) {
    await page
      .getByRole('region', { name: drill.title, exact: true })
      .getByRole('button', { name: 'Start Quick', exact: true })
      .click();
    await expect(prompt).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await page.goto('./#/drills');
  }
});

test('context accepts missing phrases and complete frames, while sentence production rejects phrase-only answers', async ({
  page,
}) => {
  await page.goto('./#/vocabulary/lessons/hotel?mode=context');
  await page.getByRole('button', { name: 'Start context practice' }).click();
  const prompt = page.getByTestId('prompt');
  const exercises = lessonContent(studyLessons[0], 'context', 'mixed').flatMap(
    (c) => c.exercises,
  );
  let gaps = 0,
    production = false;
  for (let i = 0; i < 45; i++) {
    const text = await prompt.innerText();
    const full =
      (await page.locator('main .muted').innerText()) ===
      'Type the whole sentence.';
    const e = exercises.find(
      (e) => e.prompt === text && (e.lessonEvidence === 'production') === full,
    )!;
    expect(e).toBeDefined();
    if (full) {
      const word = studyLessons[0].words.find((w) => w.id === e.entryId)!;
      await answer(page, word.english);
      await expect(page.getByText('Not quite. Try again.')).toBeVisible();
      await expect(prompt).toHaveText(text);
      await answer(page, e.answer);
      await expectPromptChanged(page, text);
      production = true;
      break;
    }
    await expect(page.locator('main .muted')).toHaveText(
      'Type the missing word or phrase.',
    );
    const value = gaps++ % 2 ? acceptedExerciseAnswers(e).at(-1)! : e.answer;
    await answer(page, `  ${value.toUpperCase().replaceAll(' ', '  ')}  `);
    await expectPromptChanged(page, text);
    await expect(page.getByText('Not quite. Try again.')).toHaveCount(0);
  }
  expect(gaps).toBeGreaterThanOrEqual(2);
  expect(production).toBe(true);
  await page.reload();
  await expect(prompt).toBeVisible();
});
