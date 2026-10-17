import { test, expect } from '@playwright/test';
import { studyLessons } from '../../src/content/study-lessons';
import {
  generateWorksheet,
  lessonWorksheetPool,
} from '../../src/domain/worksheets';

test('lesson → A4 worksheet → separate key → mixed paper results → shared review → reload', async ({
  page,
  context,
  browserName,
}) => {
  await page.goto('./#/vocabulary/lessons/hotel');
  await page
    .getByRole('link', { name: 'Printable Practice', exact: true })
    .click();
  await page
    .getByRole('link', { name: 'Create lesson worksheet', exact: true })
    .click();
  await page.getByLabel('Worksheet type').selectOption('mixed');
  await page.getByLabel('Length', { exact: true }).selectOption('10');
  await page
    .getByRole('button', { name: 'Generate worksheet', exact: true })
    .click();
  const article = page.getByRole('article', {
    name: 'Printable worksheet',
    exact: true,
  });
  await expect(article).toBeVisible();
  await expect(article.locator('.worksheet-question')).toHaveCount(10);
  const snapshot = generateWorksheet(
    'test',
    'hotel',
    {
      source: 'lesson',
      lessonId: 'hotel',
      kind: 'mixed',
      direction: 'mixed',
      count: 10,
    },
    lessonWorksheetPool(studyLessons[0]),
    0,
  );
  await expect(article).not.toContainText(
    snapshot.questions[0].exercise.answer,
  );
  await expect(article.locator('.key-answer')).toHaveCount(0);
  const sheetPath = new URL(page.url()).hash;
  await page.evaluate(() => {
    window.print = () => {
      document.body.dataset.printCalled = 'yes';
    };
  });
  await page
    .getByRole('button', { name: 'Print worksheet / Save as PDF', exact: true })
    .click();
  await expect(page.locator('body')).toHaveAttribute(
    'data-print-called',
    'yes',
  );
  await page.emulateMedia({ media: 'print' });
  await expect(page.locator('header')).not.toBeVisible();
  await expect(page.locator('footer')).not.toBeVisible();
  await expect(
    page.getByRole('navigation', { name: 'Worksheet views' }),
  ).not.toBeVisible();
  await expect(article.locator('.worksheet-question').first()).toHaveCSS(
    'break-inside',
    'avoid',
  );
  await expect(article.locator('.question-prompt').first()).toHaveCSS(
    'font-size',
    '16px',
  );
  await page.screenshot({
    path: `test-results/print-worksheet-${test.info().project.name}.png`,
    fullPage: true,
  });
  // Browser-native PDF is QA for the print CSS, not a PDF-generation backend.
  if (browserName === 'chromium') {
    const pdf = await page.pdf({
      format: 'A4',
      path: `test-results/worksheet-${test.info().project.name}.pdf`,
    });
    expect(pdf.subarray(0, 4).toString()).toBe('%PDF');
    expect(
      (pdf.toString('latin1').match(/\/Type\s*\/Page\b/g) ?? []).length,
    ).toBeGreaterThanOrEqual(2);
  }
  await page.emulateMedia({ media: 'screen' });
  await page.getByRole('link', { name: 'Answer key', exact: true }).click();
  const key = page.getByRole('article', { name: 'Answer key', exact: true });
  await expect(key).toBeVisible();
  await expect(key).toContainText(snapshot.questions[0].exercise.answer);
  await expect(key).toContainText('other natural answers may also be valid');
  await page.screenshot({
    path: `test-results/print-key-${test.info().project.name}.png`,
    fullPage: true,
  });
  await page.getByRole('link', { name: 'Enter results', exact: true }).click();
  await expect(
    page.getByText('The answer key has been viewed.', { exact: false }),
  ).toBeVisible();
  const first = page.getByRole('listitem', { name: 'Question 1', exact: true });
  const second = page.getByRole('listitem', {
    name: 'Question 2',
    exact: true,
  });
  await first.getByRole('button', { name: '✗ Wrong', exact: true }).click();
  await first
    .getByLabel('What you wrote (optional)')
    .fill('my handwritten mistake');
  await second
    .getByRole('button', { name: '~ Minor problem', exact: true })
    .click();
  await page
    .getByRole('button', { name: 'Mark remaining correct', exact: true })
    .click();
  await page
    .getByRole('button', { name: 'Submit paper results', exact: true })
    .click();
  await expect(
    page.getByRole('heading', { name: 'Paper practice completed' }),
  ).toBeVisible();
  await expect(
    page.getByText('8 correct · 1 minor problems · 1 wrong', { exact: false }),
  ).toBeVisible();
  await page.reload();
  await expect(
    page.getByRole('heading', { name: 'Paper practice completed' }),
  ).toBeVisible();
  await expect(first).toContainText('my handwritten mistake');
  await page.getByRole('link', { name: 'Back to lesson', exact: true }).click();
  await expect(
    page.getByText('Paper worksheets completed: 1.', { exact: false }),
  ).toBeVisible();
  await expect(page.getByLabel('Lesson progress')).toContainText(
    'Vocabulary recall: 0/15',
  );
  await expect(page.getByLabel('Lesson progress')).toContainText(
    'Context use: 0/15',
  );
  await page.getByRole('link', { name: 'Reflex English', exact: true }).click();
  await expect(
    page.getByText('You wrote “my handwritten mistake”', { exact: false }),
  ).toBeVisible();
  await page.goto(`./${sheetPath}/results`);
  await expect(
    page.getByRole('heading', { name: 'Paper practice completed' }),
  ).toBeVisible();
  await page
    .getByRole('link', { name: 'Printable practice & history', exact: false })
    .click();
  await expect(
    page.getByRole('region', { name: 'Worksheet history' }),
  ).toContainText('Completed');
  await page.goto(`./${sheetPath}/results`);
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
  });
  await context.setOffline(true);
  await page.reload();
  await expect(
    page.getByRole('heading', { name: 'Paper practice completed' }),
  ).toBeVisible();
  await expect(first).toContainText('my handwritten mistake');
  await context.setOffline(false);
});

test('worksheet deletion asks for confirmation and can be cancelled', async ({
  page,
}) => {
  await page.goto('./#/printable?lesson=hotel');
  await page.getByLabel('Length', { exact: true }).selectOption('10');
  await page.getByRole('button', { name: 'Generate worksheet' }).click();
  await expect(
    page.getByRole('article', { name: 'Printable worksheet' }),
  ).toBeVisible();
  await page
    .getByRole('link', { name: 'Printable practice & history', exact: false })
    .click();
  const history = page.getByRole('region', { name: 'Worksheet history' });
  await history
    .getByRole('button', { name: 'Delete worksheet', exact: true })
    .click();
  const dialog = page.getByRole('alertdialog', { name: 'Delete worksheet' });
  await expect(dialog).toBeVisible();
  await dialog.getByRole('button', { name: 'Keep worksheet' }).click();
  await expect(
    history.getByRole('link', { name: 'Open', exact: true }),
  ).toBeVisible();
  await history
    .getByRole('button', { name: 'Delete worksheet', exact: true })
    .click();
  await dialog.getByRole('button', { name: 'Confirm deletion' }).click();
  await expect(history).toContainText('No worksheets yet.');
});
