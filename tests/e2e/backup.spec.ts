import { expect, test, type Page } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import { studyLessons } from '../../src/content/study-lessons';
import { lessonContent } from '../../src/domain/study';
import type { Backup } from '../../src/domain/backup';

async function exported(page: Page, button = 'Export backup') {
  const pending = page.waitForEvent('download');
  await page.getByRole('button', { name: button, exact: true }).click();
  const download = await pending;
  const text = await readFile((await download.path())!, 'utf8');
  await expect(
    page.getByRole('button', { name: button, exact: true }),
  ).toBeEnabled();
  return { text, backup: JSON.parse(text) as Backup };
}
async function addWord(page: Page, english: string, czech: string) {
  await page.goto('./#/vocabulary');
  const personal = page.getByRole('region', {
    name: 'Personal words',
    exact: true,
  });
  await personal
    .getByLabel('English word or phrase', { exact: true })
    .fill(english);
  await personal.getByLabel('Czech meaning', { exact: true }).fill(czech);
  await personal
    .getByRole('button', { name: 'Save word', exact: true })
    .click();
  await expect(personal.getByRole('status')).toContainText(
    `Saved “${english}”`,
  );
}
async function selectBackup(page: Page, text: string) {
  await page.getByLabel('Import backup', { exact: true }).setInputFiles({
    name: 'backup.json',
    mimeType: 'application/json',
    buffer: Buffer.from(text),
  });
}

test('progress → personal word → graded worksheet → export → change/delete → confirmed restore → reload', async ({
  page,
}) => {
  test.setTimeout(60000);
  await page.goto('./#/vocabulary/lessons/hotel');
  await page.getByRole('button', { name: 'Ready for Vocabulary Test' }).click();
  await page.getByLabel('Test direction').selectOption('cs-en');
  await page.getByRole('button', { name: 'Start vocabulary test' }).click();
  const prompt = page.getByTestId('prompt');
  const text = await prompt.innerText();
  const exercise = lessonContent(studyLessons[0], 'recall', 'cs-en')
    .flatMap((c) => c.exercises)
    .find((e) => e.prompt === text)!;
  await page.getByLabel('Your answer', { exact: true }).fill(exercise.answer);
  await page.getByRole('button', { name: 'Check answer', exact: true }).click();
  await expect(prompt).not.toHaveText(text);
  await addWord(page, 'keep this phrase', 'zachovat tuto frázi');
  await page.goto('./#/printable?lesson=hotel');
  await page.getByLabel('Worksheet type').selectOption('mixed');
  await page.getByLabel('Length', { exact: true }).selectOption('10');
  await page
    .getByRole('button', { name: 'Generate worksheet', exact: true })
    .click();
  await expect(
    page.getByRole('article', { name: 'Printable worksheet', exact: true }),
  ).toBeVisible();
  const worksheetHash = new URL(page.url()).hash;
  await page.getByRole('link', { name: 'Enter results', exact: true }).click();
  const first = page.getByRole('listitem', { name: 'Question 1', exact: true });
  await first.getByRole('button', { name: '✗ Wrong', exact: true }).click();
  await first
    .getByLabel('What you wrote (optional)')
    .fill('original written mistake');
  await page
    .getByRole('button', { name: 'Mark remaining correct', exact: true })
    .click();
  await page
    .getByRole('button', { name: 'Submit paper results', exact: true })
    .click();
  await expect(
    page.getByRole('heading', { name: 'Paper practice completed' }),
  ).toBeVisible();
  await page.getByRole('link', { name: 'Data / Backup', exact: true }).click();
  const original = await exported(page);
  expect(original.backup.schemaVersion).toBe(1);
  expect(original.backup.data.attempts).toHaveLength(11);
  expect(original.backup.data.mistakes.length).toBeGreaterThan(0);
  expect(original.backup.data.lessonProgress.length).toBeGreaterThan(0);
  expect(original.backup.data.worksheets[0].completedAt).toBeDefined();
  await expect(
    page.getByRole('region', { name: 'Current local data' }),
  ).not.toContainText('Not yet exported');
  await addWord(page, 'remove after restore', 'odstranit po obnovení');
  await page.goto('./#/printable');
  await page
    .getByRole('button', { name: 'Delete worksheet', exact: true })
    .click();
  await page
    .getByRole('alertdialog')
    .getByRole('button', { name: 'Confirm deletion' })
    .click();
  await expect(
    page.getByRole('region', { name: 'Worksheet history' }),
  ).toContainText('No worksheets yet.');
  await page.getByRole('link', { name: 'Data / Backup', exact: true }).click();
  await selectBackup(page, original.text);
  const otherTab = await page.context().newPage();
  await otherTab.goto('./#/vocabulary');
  await expect(
    otherTab.getByRole('region', { name: 'Personal words', exact: true }),
  ).toContainText('remove after restore');
  const preview = page.getByRole('region', { name: 'Restore preview' });
  await expect(preview).toContainText(
    'All current local learning data will be replaced.',
  );
  await expect(preview).toContainText('Worksheet results: 10');
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({
    path: `test-results/backup-preview-${test.info().project.name}.png`,
    fullPage: true,
  });
  await expect(
    page.getByRole('region', { name: 'Current local data' }),
  ).toContainText('Worksheets: 0');
  await preview
    .getByRole('button', {
      name: 'Replace current local learning data',
      exact: true,
    })
    .click();
  await expect(page.getByRole('status')).toContainText(
    'Backup restored successfully.',
  );
  await expect(otherTab).toHaveURL(/#\/data$/);
  await expect(
    otherTab.getByRole('region', { name: 'Current local data' }),
  ).toContainText('Worksheets: 1');
  await otherTab.close();
  const safety = await exported(page, 'Download safety backup');
  expect(safety.backup.data.worksheets).toHaveLength(0);
  expect(
    safety.backup.data.vocabulary.some(
      (v) => v.english === 'remove after restore',
    ),
  ).toBe(true);
  await page.reload();
  const restored = await exported(page);
  expect(restored.backup.data).toEqual(original.backup.data);
  expect(restored.backup.builtInContent).toEqual(
    original.backup.builtInContent,
  );
  await page.goto('./#/vocabulary');
  const personal = page.getByRole('region', {
    name: 'Personal words',
    exact: true,
  });
  await expect(personal).toContainText('keep this phrase');
  await expect(personal).not.toContainText('remove after restore');
  await page.goto(`./${worksheetHash}/results`);
  await expect(
    page.getByRole('heading', { name: 'Paper practice completed' }),
  ).toBeVisible();
  await expect(
    page.getByRole('listitem', { name: 'Question 1', exact: true }),
  ).toContainText('original written mistake');
  await page.goto('./#/vocabulary/lessons/hotel');
  await expect(page.getByLabel('Lesson progress')).toContainText(
    'Czech → English',
  );
});

test('import preview can be cancelled and malformed/newer backups leave local data unchanged', async ({
  page,
}) => {
  await addWord(page, 'stay here', 'zůstat zde');
  await page.getByRole('link', { name: 'Data / Backup', exact: true }).click();
  const original = await exported(page);
  await selectBackup(page, original.text);
  await expect(
    page.getByRole('region', { name: 'Restore preview' }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Cancel', exact: true }).click();
  await expect(page.getByRole('status')).toContainText('Import cancelled.');
  await expect(
    page.getByRole('region', { name: 'Restore preview' }),
  ).toHaveCount(0);
  await selectBackup(page, '{invalid');
  await expect(page.getByRole('alert')).toContainText('not valid JSON');
  await selectBackup(
    page,
    JSON.stringify({ ...original.backup, schemaVersion: 999 }),
  );
  await expect(page.getByRole('alert')).toContainText('newer version');
  await expect(
    page.getByRole('button', {
      name: 'Replace current local learning data',
      exact: true,
    }),
  ).toHaveCount(0);
  await page.reload();
  await expect(
    page.getByRole('region', { name: 'Current local data' }),
  ).toContainText('Vocabulary: 1');
});
