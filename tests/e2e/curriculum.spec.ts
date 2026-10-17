import { expect, test, type Page } from '@playwright/test';
import { advancedLessons } from '../../src/content/advanced-lessons';
import { lessonContent } from '../../src/domain/study';
import type { StudyMode } from '../../src/domain/study-models';
async function complete(page: Page, mode: StudyMode) {
  const lesson = advancedLessons.find((l) => l.id === 'measurement')!;
  const exercises = lessonContent(lesson, mode, 'mixed').flatMap(
      (c) => c.exercises,
    ),
    prompt = page.getByTestId('prompt');
  await expect(prompt).toBeVisible();
  for (let i = 0; i < 120 && (await prompt.isVisible()); i++) {
    const text = await prompt.innerText();
    const full =
      mode === 'context' &&
      (await page.locator('main .muted').innerText()).includes(
        'WHOLE sentence',
      );
    const exercise = exercises.find(
      (e) =>
        e.prompt === text &&
        (mode !== 'context' || (e.lessonEvidence === 'production') === full),
    );
    expect(exercise).toBeDefined();
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
  await expect(page.getByText('PRACTICE SAVED', { exact: true })).toBeVisible();
}
test('twenty lessons → advanced recall + unseen contexts → persisted pass → printable translation', async ({
  page,
}) => {
  test.setTimeout(90000);
  await page.goto('./#/vocabulary');
  await expect(page.getByRole('article')).toHaveCount(20);
  for (const lesson of advancedLessons)
    await expect(
      page.getByRole('article', { name: lesson.title, exact: true }),
    ).toContainText(lesson.level);
  await page
    .getByRole('article', {
      name: 'Measurement, Testing & Uncertainty',
      exact: true,
    })
    .getByRole('link', { name: 'Open lesson', exact: true })
    .click();
  await expect(page.locator('.learn-list > li')).toHaveCount(15);
  await expect(
    page.getByText('We estimated the measurement uncertainty.', {
      exact: true,
    }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Ready for Vocabulary Test' }).click();
  await page.getByRole('button', { name: 'Start vocabulary test' }).click();
  await complete(page, 'recall');
  await page.getByRole('link', { name: 'Continue to Use in Context' }).click();
  await expect(page.getByLabel('Lesson progress')).toContainText(
    'Vocabulary recall: 15/15',
  );
  await expect(page.getByLabel('Lesson progress')).toContainText(
    'Context use: 0/15',
  );
  await page.getByRole('button', { name: 'Start context practice' }).click();
  await complete(page, 'context');
  await page.getByRole('link', { name: 'Return to lesson progress' }).click();
  await page.reload();
  await expect(
    page.getByText('Lesson practice passed.', { exact: false }),
  ).toBeVisible();
  await expect(page.getByLabel('Lesson progress')).toContainText(
    'Context use: 15/15',
  );
  await page
    .getByRole('link', { name: 'Printable Practice', exact: true })
    .click();
  await page
    .getByRole('link', { name: 'Create lesson worksheet', exact: true })
    .click();
  await page.getByLabel('Worksheet type').selectOption('translation');
  await page.getByLabel('Length', { exact: true }).selectOption('10');
  await page
    .getByRole('button', { name: 'Generate worksheet', exact: true })
    .click();
  const sheet = page.getByRole('article', {
    name: 'Printable worksheet',
    exact: true,
  });
  await expect(sheet.locator('.worksheet-question')).toHaveCount(10);
  await expect(sheet).toContainText('Odhadli jsme nejistotu měření.');
  await expect(sheet).not.toContainText(
    'We estimated the measurement uncertainty.',
  );
  await page.getByRole('link', { name: 'Answer key', exact: true }).click();
  await expect(
    page.getByRole('article', { name: 'Answer key', exact: true }),
  ).toContainText('We estimated the measurement uncertainty.');
  await page.reload();
  await expect(
    page.getByRole('article', { name: 'Answer key', exact: true }),
  ).toContainText('We estimated the measurement uncertainty.');
});
