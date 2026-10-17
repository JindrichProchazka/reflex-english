import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HashRouter } from 'react-router-dom';
import { afterEach, expect, it } from 'vitest';
import App from '../src/App';
import { db } from '../src/data/database';
import { concepts } from '../src/content/prepositions';

afterEach(async () => {
  cleanup();
  window.location.hash = '/';
  await db.delete();
});
it('supports labelled typed input, hides the full answer on first failure and reveals it on the second', async () => {
  window.location.hash = '/';
  const user = userEvent.setup();
  render(
    <HashRouter>
      <App />
    </HashRouter>,
  );
  await user.click(
    await screen.findByRole('button', { name: /start review/i }),
  );
  await user.type(await screen.findByLabelText('Missing preposition'), 'wrong');
  const prompt = screen.getByTestId('prompt').textContent;
  const expected = concepts
    .flatMap((c) => c.exercises)
    .find((e) => e.prompt === prompt)!.answer;
  await user.click(screen.getByRole('button', { name: 'Check answer' }));
  await screen.findByText('Not quite. Try again.');
  expect(screen.queryByText(/The answer is/)).not.toBeInTheDocument();
  await user.type(screen.getByLabelText('Missing preposition'), 'wrong');
  await user.click(screen.getByRole('button', { name: 'Check answer' }));
  expect(
    await screen.findByText(`The answer is “${expected}”.`),
  ).toBeInTheDocument();
  expect(
    screen.getByRole('button', { name: 'Reproduce answer' }),
  ).toBeDisabled();
});
