import { expect, type Page } from '@playwright/test';

export async function answer(page: Page, value: string) {
  const choices = page.getByRole('group', {
    name: 'Answer choices',
    exact: true,
  });
  if (await choices.count()) {
    const label = value === '-' ? 'No article' : value.toUpperCase();
    const requested = choices.getByRole('button', { name: label, exact: true });
    if (await requested.count()) await requested.click();
    else {
      // Wrong-answer tests select a real incorrect option from the bounded set.
      const text = await page.getByTestId('prompt').innerText();
      const { drills } = await import('../../src/content/drills');
      const exercise = drills
        .flatMap((d) => d.concepts)
        .flatMap((c) => c.exercises)
        .find((e) => e.prompt === text)!;
      const accepted = (exercise.acceptedAnswers ?? [exercise.answer]).map(
        (a) => a.toUpperCase(),
      );
      const buttons = choices.getByRole('button');
      for (let i = 0; i < (await buttons.count()); i++) {
        const button = buttons.nth(i);
        const option = await button.getAttribute('aria-label');
        if (!accepted.includes(option === 'No article' ? '-' : option!)) {
          await button.click();
          return;
        }
      }
      throw new Error('No wrong option available');
    }
  } else {
    await page.locator('#answer').fill(value);
    await page
      .getByRole('button', { name: /^(Check answer|Reproduce answer)$/ })
      .click();
  }
}

export async function expectPromptChanged(page: Page, text: string) {
  await expect
    .poll(async () => {
      const next = await page
        .getByTestId('prompt')
        .or(page.getByText('PRACTICE SAVED', { exact: true }))
        .allTextContents();
      return next.length === 1 && next[0] !== text;
    })
    .toBe(true);
}
