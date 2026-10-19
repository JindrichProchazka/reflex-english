import { cleanup, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HashRouter } from 'react-router-dom';
import { afterEach, expect, it } from 'vitest';
import App from '../src/App';
import { db } from '../src/data/database';
import { drillById } from '../src/content/drills';
const concepts = drillById('in-on-at')!.concepts;

afterEach(async () => {
  cleanup();
  window.location.hash = '/';
  await db.delete();
});
it('supports labelled answer buttons, hides the full answer on first failure and requires typed correction on the second', async () => {
  window.location.hash = '/';
  const user = userEvent.setup();
  render(
    <HashRouter>
      <App />
    </HashRouter>,
  );
  await user.click(
    await screen.findByRole('link', { name: /Open Quick Reflex Drills/ }),
  );
  await user.click(
    within(
      await screen.findByRole('region', { name: 'IN / ON / AT' }),
    ).getByRole('button', { name: 'Start Normal' }),
  );
  await screen.findByRole('group', { name: 'Answer choices' });
  const prompt = screen.getByTestId('prompt').textContent;
  const expected = concepts
    .flatMap((c) => c.exercises)
    .find((e) => e.prompt === prompt)!.answer;
  const wrong = ['in', 'on', 'at'].find((a) => a !== expected)!;
  await user.click(screen.getByRole('button', { name: wrong.toUpperCase() }));
  await screen.findByText('Not quite. Try again.');
  expect(screen.queryByText(/The answer is/)).not.toBeInTheDocument();
  await new Promise((r) => setTimeout(r, 400));
  await user.click(screen.getByRole('button', { name: wrong.toUpperCase() }));
  expect(
    await screen.findByText(`The answer is “${expected}”.`),
  ).toBeInTheDocument();
  expect(
    await screen.findByRole('button', { name: 'Reproduce answer' }),
  ).toBeDisabled();
});
