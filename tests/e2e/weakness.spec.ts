import { expect, test, type Page } from '@playwright/test';
import { drillById } from '../../src/content/drills';
const concepts = drillById('in-on-at')!.concepts;
const exerciseFor = (prompt: string) =>
  concepts.flatMap((c) => c.exercises).find((e) => e.prompt === prompt)!;
async function correct(page: Page) {
  const prompt = page.getByTestId('prompt'),
    text = await prompt.innerText();
  const exercise = exerciseFor(text);
  expect(exercise).toBeDefined();
  await page
    .getByLabel('Missing preposition', { exact: true })
    .fill(exercise.answer);
  await page.getByRole('button', { name: 'Check answer', exact: true }).click();
  await expect
    .poll(async () => {
      const next = await prompt
        .or(page.getByText('PRACTICE SAVED', { exact: true }))
        .allTextContents();
      return next.length === 1 && next[0] !== text;
    })
    .toBe(true);
}
test('Home → grouped weakness → references → focused correction / delayed retry / closing → paper history → reload', async ({
  page,
}) => {
  test.setTimeout(90000);
  await page.goto('./');
  await page.getByRole('link', { name: /Open Quick Reflex Drills/ }).click();
  await page
    .getByRole('region', { name: 'IN / ON / AT', exact: true })
    .getByRole('button', { name: 'Start Normal' })
    .click();
  const original = exerciseFor(await page.getByTestId('prompt').innerText());
  const concept = concepts.find((c) => c.id === original.conceptId)!;
  await page.getByLabel('Missing preposition', { exact: true }).fill('wrong');
  await page.getByRole('button', { name: 'Check answer', exact: true }).click();
  await expect(page.getByText('Not quite. Try again.')).toBeVisible();
  await page.getByRole('link', { name: '← Save & return to drills' }).click();
  await page.getByRole('link', { name: '← Home', exact: true }).click();
  const homeCard = page.getByRole('region', {
    name: 'Weak Areas',
    exact: true,
  });
  await expect(homeCard).toContainText('1 concept needs attention');
  await homeCard
    .getByRole('link', { name: 'Practice weak areas', exact: true })
    .click();
  await page
    .getByLabel('Filter mistakes', { exact: true })
    .selectOption('grammar');
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  const target = page.getByRole('article', {
    name: concept.title,
    exact: true,
  });
  await expect(target).toContainText('1 incorrect attempts');
  await target
    .getByRole('link', { name: 'View mistake history', exact: true })
    .click();
  const detail = page.getByRole('article', {
    name: 'Mistake detail',
    exact: true,
  });
  await expect(detail).toContainText(original.prompt);
  await expect(detail).toContainText('You wrote “wrong”');
  await detail
    .getByRole('link', { name: 'Review examples', exact: true })
    .click();
  await expect(
    detail.getByText('References opened.', { exact: false }),
  ).toBeVisible();
  await expect(detail).toContainText(original.explanation);
  await detail
    .getByRole('button', { name: 'Practice now', exact: true })
    .click();
  await expect(
    page.getByRole('heading', { name: 'Focused weak-area practice' }),
  ).toBeVisible();
  for (let i = 0; i < 5; i++) {
    expect(
      exerciseFor(await page.getByTestId('prompt').innerText()).conceptId,
    ).not.toBe(concept.id);
    await correct(page);
  }
  const failedPrompt = await page.getByTestId('prompt').innerText();
  expect(exerciseFor(failedPrompt).conceptId).toBe(concept.id);
  await page.getByLabel('Missing preposition', { exact: true }).fill('wrong');
  await page.getByRole('button', { name: 'Check answer', exact: true }).click();
  await expect(page.getByText('Not quite. Try again.')).toBeVisible();
  await page
    .getByLabel('Missing preposition', { exact: true })
    .fill('still wrong');
  await page.getByRole('button', { name: 'Check answer', exact: true }).click();
  await expect(
    page.getByText(`The answer is “${exerciseFor(failedPrompt).answer}”.`),
  ).toBeVisible();
  await page
    .getByLabel('Missing preposition', { exact: true })
    .fill(exerciseFor(failedPrompt).answer);
  await page
    .getByRole('button', { name: 'Reproduce answer', exact: true })
    .click();
  await expect(page.getByTestId('prompt')).not.toHaveText(failedPrompt);
  for (let i = 0; i < 5; i++) {
    expect(
      exerciseFor(await page.getByTestId('prompt').innerText()).conceptId,
    ).not.toBe(concept.id);
    await correct(page);
  }
  expect(
    exerciseFor(await page.getByTestId('prompt').innerText()).conceptId,
  ).toBe(concept.id);
  await expect(page.getByTestId('prompt')).not.toHaveText(failedPrompt);
  let final = false;
  for (
    let i = 0;
    i < 100 && (await page.getByTestId('prompt').isVisible());
    i++
  ) {
    if ((await page.locator('.eyebrow').innerText()).includes('CLOSING RECALL'))
      final = true;
    await correct(page);
  }
  expect(final).toBe(true);
  await expect(page.getByText('PRACTICE SAVED', { exact: true })).toBeVisible();
  await page
    .getByRole('link', { name: 'Return to weak areas', exact: true })
    .click();
  await page
    .getByLabel('Filter mistakes', { exact: true })
    .selectOption('repeated');
  await page
    .getByRole('article', { name: concept.title, exact: true })
    .getByRole('link', { name: 'View mistake history', exact: true })
    .click();
  await expect(detail).toContainText('3 incorrect attempts');
  await page.reload();
  await expect(detail).toContainText('3 incorrect attempts');
  await page.goto('./#/printable?source=mistakes');
  await page
    .getByRole('button', { name: 'Generate worksheet', exact: true })
    .click();
  await expect(
    page.getByRole('article', { name: 'Printable worksheet', exact: true }),
  ).toBeVisible();
  await page.getByRole('link', { name: 'Enter results', exact: true }).click();
  await page
    .getByRole('listitem', { name: 'Question 1', exact: true })
    .getByRole('button', { name: '✗ Wrong', exact: true })
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
  await page.goto('./#/mistakes');
  await page
    .getByRole('article', { name: concept.title, exact: true })
    .getByRole('link', { name: 'View mistake history', exact: true })
    .click();
  await expect(detail).toContainText('4 incorrect attempts');
  await expect(detail).toContainText('Paper');
  await expect(detail).toContainText('Digital');
  await page.screenshot({
    path: `test-results/weakness-detail-${test.info().project.name}.png`,
    fullPage: true,
  });
});
