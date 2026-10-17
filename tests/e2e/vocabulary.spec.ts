import { expect, test, type Page } from '@playwright/test';
import { studyLessons } from '../../src/content/study-lessons';
import { lessonContent } from '../../src/domain/study';
import type { RecallDirection, StudyMode } from '../../src/domain/study-models';

async function finishLesson(
  page: Page,
  mode: StudyMode,
  direction: RecallDirection,
  failed?: { id: string; prompt: string },
) {
  const content = lessonContent(studyLessons[0], mode, direction).flatMap(
    (c) => c.exercises,
  );
  const prompt = page.getByTestId('prompt');
  await expect(prompt).toBeVisible();
  let steps = 0,
    returns = 0;
  while (await prompt.isVisible()) {
    if (++steps > 130) throw new Error('Lesson did not complete.');
    const text = await prompt.innerText();
    const production =
      mode === 'context' &&
      (await page.locator('main .muted').innerText()).includes(
        'WHOLE sentence',
      );
    const exercise = content.find(
      (e) =>
        e.prompt === text &&
        (mode !== 'context' ||
          (e.lessonEvidence === 'production') === production),
    );
    expect(exercise).toBeDefined();
    if (exercise!.conceptId === failed?.id) {
      if (returns === 0) expect(steps).toBe(6);
      expect(text).not.toBe(failed.prompt);
      returns++;
    }
    await page
      .getByLabel('Your answer', { exact: true })
      .fill(exercise!.answer);
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
  if (failed) expect(returns).toBe(2);
}

test('home → learn → mixed recall with correction → context → persisted lesson pass', async ({
  page,
  context,
}) => {
  await page.goto('./');
  await page.getByRole('link', { name: 'Choose a vocabulary lesson' }).click();
  await expect(
    page.getByRole('heading', { name: 'Vocabulary lessons', exact: true }),
  ).toBeVisible();
  await expect(page.getByRole('article')).toHaveCount(20);
  await page
    .getByRole('article', { name: 'Hotel / reception', exact: true })
    .getByRole('link', { name: 'Open lesson' })
    .click();
  await expect(
    page.getByRole('heading', { name: 'Learn the lesson vocabulary' }),
  ).toBeVisible();
  await expect(page.locator('.learn-list > li')).toHaveCount(15);
  await expect(
    page.getByText('I have a reservation for tonight.', { exact: true }),
  ).toBeVisible();
  await page.screenshot({
    path: `test-results/lesson-learn-${test.info().project.name}.png`,
    fullPage: true,
  });
  await page.getByRole('button', { name: 'Ready for Vocabulary Test' }).click();
  await page.getByLabel('Test direction').selectOption('mixed');
  await page.getByRole('button', { name: 'Start vocabulary test' }).click();
  const prompt = page.getByTestId('prompt');
  const original = await prompt.innerText();
  const exercise = lessonContent(studyLessons[0], 'recall', 'mixed')
    .flatMap((c) => c.exercises)
    .find((e) => e.prompt === original)!;
  await page.getByLabel('Your answer', { exact: true }).fill('wrong');
  await page.getByRole('button', { name: 'Check answer', exact: true }).click();
  await expect(page.getByText('Not quite. Try again.')).toBeVisible();
  await expect(page.getByText(/The answer is/)).toHaveCount(0);
  await page.reload();
  await expect(page.getByText('Not quite. Try again.')).toBeVisible();
  await page.getByLabel('Your answer', { exact: true }).fill('wrong again');
  await page.getByRole('button', { name: 'Check answer', exact: true }).click();
  await expect(
    page.getByText(`The answer is “${exercise.answer}”.`),
  ).toBeVisible();
  await page.getByLabel('Your answer', { exact: true }).fill(exercise.answer);
  await page.getByRole('button', { name: 'Reproduce answer' }).click();
  await expect(prompt).not.toHaveText(original);
  await finishLesson(page, 'recall', 'mixed', {
    id: exercise.conceptId,
    prompt: original,
  });
  await page.getByRole('link', { name: 'Continue to Use in Context' }).click();
  await expect(page.getByLabel('Lesson progress')).toContainText(
    'Vocabulary recall: 15/15',
  );
  await expect(page.getByLabel('Lesson progress')).toContainText(
    'Context use: 0/15',
  );
  await page.getByRole('button', { name: 'Start context practice' }).click();
  await finishLesson(page, 'context', 'mixed');
  await page.getByRole('link', { name: 'Return to lesson progress' }).click();
  await expect(page.getByLabel('Lesson progress')).toContainText(
    'Context use: 15/15',
  );
  await expect(
    page.getByText('Lesson practice passed.', { exact: false }),
  ).toBeVisible();
  await page.reload();
  await expect(page.getByLabel('Lesson progress')).toContainText(
    'Vocabulary recall: 15/15',
  );
  await expect(page.getByLabel('Lesson progress')).toContainText(
    'Context use: 15/15',
  );
  await page.screenshot({
    path: `test-results/lesson-progress-${test.info().project.name}.png`,
    fullPage: true,
  });
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
  });
  await context.setOffline(true);
  await page.reload();
  await expect(page.getByLabel('Lesson progress')).toContainText(
    'Context use: 15/15',
  );
  await context.setOffline(false);
});

for (const direction of ['en-cs', 'cs-en'] as const) {
  test(`typed ${direction} recall persists independently of context`, async ({
    page,
  }) => {
    await page.goto('./#/vocabulary/lessons/hotel?mode=recall');
    await page.getByLabel('Test direction').selectOption(direction);
    await page.getByRole('button', { name: 'Start vocabulary test' }).click();
    await expect(page.getByTestId('prompt')).toContainText(
      direction === 'en-cs' ? 'English → Czech' : 'Czech → English',
    );
    await finishLesson(page, 'recall', direction);
    await page
      .getByRole('link', { name: 'Continue to Use in Context' })
      .click();
    await page.reload();
    await expect(page.getByLabel('Lesson progress')).toContainText(
      direction === 'en-cs' ? 'English → Czech 15/15' : 'Czech → English 15/15',
    );
    await expect(page.getByLabel('Lesson progress')).toContainText(
      'Context use: 0/15',
    );
  });
}

test('personal capture and editing use only English and Czech, with persisted review state', async ({
  page,
}) => {
  await page.goto('./#/vocabulary');
  const personal = page.getByRole('region', {
    name: 'Personal words',
    exact: true,
  });
  await personal
    .getByLabel('English word or phrase', { exact: true })
    .fill('torque ripple');
  await personal
    .getByLabel('Czech meaning', { exact: true })
    .fill('kolísání točivého momentu');
  await personal
    .getByRole('button', { name: 'Save word', exact: true })
    .click();
  await expect(personal.getByRole('status')).toContainText(
    'Saved “torque ripple”',
  );
  await page.reload();
  await expect(personal).toContainText('torque ripple');
  await personal.getByRole('link', { name: 'Edit', exact: true }).click();
  await expect(page.getByRole('textbox')).toHaveCount(2);
  await page
    .getByLabel('Czech meaning', { exact: true })
    .fill('zvlnění točivého momentu');
  await page.getByRole('button', { name: 'Save word', exact: true }).click();
  await expect(page).toHaveURL(/#\/vocabulary$/);
  await expect(personal).toContainText('zvlnění točivého momentu');
  await page.getByLabel('Test direction').selectOption('cs-en');
  await personal.getByRole('button', { name: 'Practise', exact: true }).click();
  await expect(page.getByTestId('prompt')).toContainText(
    'zvlnění točivého momentu',
  );
  await page.getByLabel('Your answer', { exact: true }).fill('torque ripple');
  await page.getByRole('button', { name: 'Check answer', exact: true }).click();
  await page
    .getByRole('link', { name: '← Save & return to vocabulary' })
    .click();
  await page.reload();
  await expect(personal).toContainText('learning');
});
