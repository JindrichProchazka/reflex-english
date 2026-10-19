import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, expect, it } from 'vitest';
import { HashRouter } from 'react-router-dom';
import { contextConcept } from '../src/domain/study';
import {
  acceptedExerciseAnswers,
  phraseEvaluator,
} from '../src/domain/evaluation';
import { answerChoices, responseInstruction } from '../src/domain/answer-input';
import { relativeReview, sessionSummary } from '../src/domain/session-summary';
import { SessionSummary } from '../src/features/SessionSummary';
import { startSession } from '../src/domain/session';
import { drills, drillById } from '../src/content/drills';
import type { Attempt, Session } from '../src/domain/models';
import { newReview } from '../src/domain/scheduler';
import { db } from '../src/data/database';
import App from '../src/App';
import { beginLessonSession } from '../src/application/study';
import { recordAnswer, sessionExercise } from '../src/application/learning';

beforeEach(async () => {
  await db.open();
});
afterEach(async () => {
  cleanup();
  window.location.hash = '/';
  await db.delete();
});
const word: import('../src/domain/study-models').LessonWord = {
  id: 'breakfast',
  english: 'breakfast included',
  czech: 'snídaně v ceně',
  examples: [
    'We would like breakfast included in our booking.',
    'Is breakfast included in the price?',
  ],
  acceptedEnglish: ['breakfast provided'],
};
const concept = contextConcept(word, 'breakfast-context');
const gap = concept.exercises[0],
  sentence = concept.exercises[1];
it('gap-fill accepts the missing phrase, authored equivalents and complete frame with harmless normalization', () => {
  expect(responseInstruction(gap)).toBe('Type the missing word or phrase.');
  for (const answer of [
    'breakfast included',
    '  BREAKFAST   INCLUDED! ',
    'breakfast included,',
    'We would like breakfast included in our booking',
    '  WE would  like breakfast included in our booking. ',
    'breakfast provided',
    'We would like breakfast provided in our booking.',
  ])
    expect(
      phraseEvaluator.evaluate(answer, acceptedExerciseAnswers(gap)),
      answer,
    ).toBe(true);
  for (const answer of [
    'breakfast',
    'room service',
    'We would hate breakfast included in our booking.',
  ])
    expect(
      phraseEvaluator.evaluate(answer, acceptedExerciseAnswers(gap)),
      answer,
    ).toBe(false);
});
it('full-sentence production has a distinct instruction and rejects the isolated phrase', () => {
  expect(responseInstruction(sentence)).toBe('Type the whole sentence.');
  expect(
    phraseEvaluator.evaluate(word.english, acceptedExerciseAnswers(sentence)),
  ).toBe(false);
  expect(
    phraseEvaluator.evaluate(
      sentence.answer.toUpperCase(),
      acceptedExerciseAnswers(sentence),
    ),
  ).toBe(true);
});
it('gap answers use the transactional writer and preserve understanding vs production evidence', async () => {
  let s = await beginLessonSession(db, 'hotel', 'context');
  const e = sessionExercise(s);
  expect(e.lessonEvidence).toBe('understanding');
  const full = acceptedExerciseAnswers(e).at(-1)!;
  const result = await recordAnswer(db, s, full, 321);
  expect(result.correct).toBe(true);
  expect((await db.lessonProgress.get('hotel'))?.items[e.entryId!]).toEqual({
    understanding: true,
  });
  s = result.session;
  expect(await db.attempts.count()).toBe(1);
  expect(s.processed).toBe(1);
});
it('closed answer sets cover safe modules, while verb-form, vocabulary and unknown answers remain typed', () => {
  for (const drill of drills)
    for (const c of drill.concepts)
      for (const e of c.exercises) {
        const options = answerChoices(drill.id, e);
        if (
          [
            'present-perfect-past-simple',
            'past-simple-continuous',
            'verb-preposition-patterns',
          ].includes(drill.id)
        )
          expect(options).toBeUndefined();
        if (options) expect(options).toContain(e.answer.toLowerCase());
      }
  expect(answerChoices('in-on-at', gap)).toBeUndefined();
  const e = drillById('articles')!.concepts[0].exercises[0];
  expect(
    answerChoices('articles', {
      ...e,
      answer: 'another phrase',
      acceptedAnswers: ['another phrase'],
    }),
  ).toBeUndefined();
  expect(answerChoices('articles', e)).toEqual(['a', 'an', 'the', '-']);
});
const now = new Date(2026, 9, 19, 23, 55).getTime();
it('relative review labels use local calendar days, not precise timestamps or elapsed hours', () => {
  const due = (days: number) => new Date(2026, 9, 19 + days, 9).getTime();
  expect(relativeReview(due(-1), now)).toBe('today');
  expect(relativeReview(due(0), now)).toBe('today');
  expect(relativeReview(due(1), now)).toBe('tomorrow');
  expect(relativeReview(due(2), now)).toBe('in 2 days');
  expect(relativeReview(due(7), now)).toBe('in 1 week');
});
function summaryFixture(clean = false) {
  const s: Session = {
    ...startSession('summary', now, [concept], []),
    completedAt: now,
    failed: clean ? [] : [concept.id],
  };
  const attempt: Attempt = {
    id: 'a',
    sessionId: s.id,
    exerciseId: gap.id,
    conceptId: concept.id,
    prompt: gap.prompt,
    expected: gap.answer,
    answer: clean ? gap.answer : 'wrong',
    correct: clean,
    at: now,
    durationMs: 5,
    assistance: 'none',
    taskKind: 'initial',
    source: 'typed',
    evaluator: 'accepted-answer-v1',
  };
  const review = {
    ...newReview(concept.id, now),
    dueAt: Date.now() + 86400000,
  };
  return {
    s,
    summary: sessionSummary(s, [attempt], [review], [concept], [word]),
  };
}
it('summary shows vocabulary names, relative dates, four metrics and expandable exact scheduling details', async () => {
  const { s, summary } = summaryFixture();
  const user = userEvent.setup();
  render(
    <HashRouter>
      <SessionSummary session={s} summary={summary} />
    </HashRouter>,
  );
  const weak = screen.getByRole('region', { name: 'Needs more practice' });
  expect(weak).toHaveTextContent('breakfast included');
  expect(weak).toHaveTextContent('review tomorrow');
  expect(weak.querySelector('time')).toBeNull();
  expect(screen.getByLabelText('Session results')).toHaveTextContent(
    'Concepts completed cleanly',
  );
  expect(
    screen.getByText('View all scheduled reviews').closest('details'),
  ).not.toHaveAttribute('open');
  await user.click(screen.getByText('View all scheduled reviews'));
  expect(
    screen.getByText('View all scheduled reviews').closest('details'),
  ).toHaveAttribute('open');
  expect(document.querySelector('time')).not.toBeNull();
  expect(
    screen.getByRole('link', { name: 'Review mistakes' }),
  ).toBeInTheDocument();
});
it('clean summary has a positive state and no empty weakness section', () => {
  const { s, summary } = summaryFixture(true);
  render(
    <HashRouter>
      <SessionSummary session={s} summary={summary} />
    </HashRouter>,
  );
  expect(summary.clean).toBe(1);
  expect(summary.revisited).toBe(0);
  expect(summary.accuracy).toBe(100);
  expect(screen.getByText(/Everything recalled cleanly/)).toBeInTheDocument();
  expect(
    screen.queryByRole('heading', { name: 'Needs more practice' }),
  ).toBeNull();
});
it('compact summary caps weak concepts at five while details retain all names', () => {
  const { s, summary } = summaryFixture();
  summary.items = Array.from({ length: 7 }, (_, i) => ({
    ...summary.items[0],
    id: `id${i}`,
    title: `word${i}`,
  }));
  summary.weak = summary.items;
  render(
    <HashRouter>
      <SessionSummary session={s} summary={summary} />
    </HashRouter>,
  );
  expect(
    within(
      screen.getByRole('region', { name: 'Needs more practice' }),
    ).getAllByRole('listitem'),
  ).toHaveLength(5);
  expect(document.querySelector('details')!.textContent).toContain('word6');
});
it('rapid button activation saves only one attempt; keyboard Enter submits a correct answer', async () => {
  const content = drillById('in-on-at')!.concepts;
  const s = startSession('tap-test', Date.now(), content, []);
  s.content = content;
  s.module = 'drill';
  s.drillId = 'in-on-at';
  await db.sessions.add(s);
  window.location.hash = `/review/${s.id}`;
  render(
    <HashRouter>
      <App />
    </HashRouter>,
  );
  const group = await screen.findByRole('group', { name: 'Answer choices' });
  const wrong = ['in', 'on', 'at'].find(
    (a) => a !== sessionExercise(s).answer,
  )!;
  const button = within(group).getByRole('button', {
    name: wrong.toUpperCase(),
  });
  fireEvent.click(button);
  fireEvent.click(button);
  await screen.findByText('Not quite. Try again.');
  expect(await db.attempts.count()).toBe(1);
  expect(button).toHaveAttribute('aria-pressed', 'true');
  expect(button).toHaveAttribute('data-result', 'incorrect');
  await new Promise((resolve) => setTimeout(resolve, 400));
  const user = userEvent.setup();
  const correct = within(group).getByRole('button', {
    name: sessionExercise(s).answer.toUpperCase(),
  });
  correct.focus();
  await user.keyboard('{Enter}');
  await screen.findByText(
    'Correct. You’ll recall this again after other questions.',
  );
  expect(await db.attempts.count()).toBe(2);
});
