import { describe, expect, it } from 'vitest';
import { concepts } from '../src/content/prepositions';
import { controlledEvaluator, normalizeAnswer } from '../src/domain/evaluation';
import type { Attempt, ReviewItem } from '../src/domain/models';
import { DAY, newReview, schedule } from '../src/domain/scheduler';
import { startSession, submitToSession } from '../src/domain/session';

const now = Date.UTC(2026, 0, 1);
function attempt(overrides: Partial<Attempt> = {}): Attempt {
  return {
    id: 'a',
    sessionId: 's1',
    conceptId: 'clock',
    exerciseId: 'clock-0',
    prompt: 'At ___ noon',
    expected: 'at',
    answer: 'at',
    correct: true,
    at: now,
    durationMs: 600,
    assistance: 'none',
    taskKind: 'initial',
    source: 'typed',
    evaluator: 'accepted-answer-v1',
    ...overrides,
  };
}
describe('controlled evaluation', () => {
  it('normalizes Unicode, case and surrounding whitespace only', () => {
    expect(normalizeAnswer('  ＡＴ \n')).toBe('at');
    expect(controlledEvaluator.evaluate(' IN ', ['in'])).toBe(true);
    for (const answer of ['', 'into', 'a t', 'at.', 'in or at'])
      expect(controlledEvaluator.evaluate(answer, ['at'])).toBe(false);
  });
});
describe('session corrections and delayed recall', () => {
  it('hints first, then reveals, and requires reproduction before advancing', () => {
    const start = startSession('s', now, concepts, []);
    const first = submitToSession(start, false, now, concepts);
    expect(first.feedback).toBe('hint');
    expect(first.exerciseId).toBe(start.exerciseId);
    const second = submitToSession(first, false, now, concepts);
    expect(second.feedback).toBe('correction');
    expect(second.processed).toBe(0);
    expect(start.wrongCount).toBe(0);
  });
  it('returns failure after five other prompts, varies context, then retrieves at the end', () => {
    let s = startSession('s', now, concepts, []);
    const failed = s.current!.conceptId;
    const original = s.exerciseId;
    s = submitToSession(s, false, now, concepts);
    s = submitToSession(s, false, now, concepts);
    s = submitToSession(s, true, now, concepts);
    for (let i = 0; i < 5; i++) {
      expect(s.current!.conceptId).not.toBe(failed);
      s = submitToSession(s, true, now, concepts);
    }
    expect(s.current).toMatchObject({ conceptId: failed, kind: 'delayed' });
    expect(s.exerciseId).not.toBe(original);
    const encounters: string[] = [];
    for (let i = 0; !s.completedAt && i < 150; i++) {
      if (s.current!.conceptId === failed) encounters.push(s.current!.kind);
      s = submitToSession(s, true, now + 1, concepts);
    }
    expect(encounters).toEqual(['delayed', 'final']);
    expect(s.completedAt).toBe(now + 1);
  });
  it('does not complete on a closing error; inserts intervening concepts even at the end', () => {
    let s = startSession('s', now, concepts, []);
    s.queue = [];
    s.current!.kind = 'final';
    const failed = s.current!.conceptId;
    s = submitToSession(s, false, now, concepts);
    s = submitToSession(s, true, now, concepts);
    expect(s.completedAt).toBeUndefined();
    for (let i = 0; i < 5; i++) {
      expect(s.current!.conceptId).not.toBe(failed);
      expect(s.current!.kind).toBe('interleave');
      s = submitToSession(s, true, now, concepts);
    }
    expect(s.current!.kind).toBe('delayed');
    for (let i = 0; !s.completedAt && i < 100; i++)
      s = submitToSession(s, true, now + 1, concepts);
    expect(s.completedAt).toBeDefined();
  });
  it('also requeues a hinted correct answer and preserves closing recall', () => {
    let s = startSession('s', now, concepts, []);
    const id = s.current!.conceptId;
    s = submitToSession(s, false, now, concepts);
    s = submitToSession(s, true, now, concepts);
    expect(
      s.queue.filter((t) => t.conceptId === id).map((t) => t.kind),
    ).toEqual(['delayed', 'final']);
  });
  it('prioritizes overdue concepts ahead of fresh content', () => {
    const overdue = {
      ...newReview('surface', now - DAY),
      status: 'reviewing' as const,
    };
    expect(startSession('s', now, concepts, [overdue]).current!.conceptId).toBe(
      'surface',
    );
  });
});
describe('spacing and mastery', () => {
  it('rotates productive contexts between spaced sessions', () => {
    const review = schedule(newReview('clock', now), attempt());
    const s = startSession('next-session', now + DAY, concepts, [review]);
    expect(s.current!.conceptId).toBe('clock');
    expect(s.exerciseId).toBe('clock-1');
  });
  it('uses transparent intervals and never advances twice in the same session', () => {
    let r = newReview('clock', now);
    const intervals = [1, 3, 7, 14, 30, 60, 60];
    let time = now;
    for (let i = 0; i < intervals.length; i++) {
      const a = attempt({
        sessionId: `s${i}`,
        at: time,
        exerciseId: `clock-${i % 3}`,
      });
      r = schedule(r, a);
      expect(r.dueAt).toBe(time + intervals[i] * DAY);
      const repeat = schedule(r, { ...a, at: time + 1000 });
      expect(repeat.successes.length).toBe(r.successes.length);
      expect(repeat.dueAt).toBe(r.dueAt);
      time = r.dueAt;
    }
    expect(r.status).toBe('mastered');
  });
  it('requires multiple sessions, seven days, varied productive contexts and clean last three reviews', () => {
    let r = schedule(newReview('clock', now), attempt());
    expect(r.status).toBe('learning');
    const rapid = schedule(r, attempt({ sessionId: 'rapid', at: now + 1000 }));
    expect(rapid.successes).toHaveLength(1);
    for (const [i, day] of [1, 3, 7].entries()) {
      r = schedule(
        r,
        attempt({
          sessionId: `later${i}`,
          at: now + day * DAY,
          exerciseId: `clock-${i % 3}`,
        }),
      );
      expect(r.status).toBe(day === 7 ? 'mastered' : 'reviewing');
    }
    const demoted = schedule(
      r,
      attempt({ sessionId: 'error', at: now + 8 * DAY, correct: false }),
    );
    expect(demoted.status).toBe('reviewing');
    expect(demoted.dueAt).toBe(now + 8 * DAY + 600_000);
    expect(
      schedule(
        demoted,
        attempt({ sessionId: 'error', at: now + 8 * DAY + 5000 }),
      ).status,
    ).toBe('reviewing');
  });
  it('never awards clean mastery evidence for hinted or reproduced answers', () => {
    for (const assistance of ['hint', 'answer'] as const) {
      const r = schedule(newReview('clock', now), attempt({ assistance }));
      expect(r.successes).toHaveLength(0);
      expect(r.status).not.toBe('mastered');
    }
    let r: ReviewItem = schedule(
      newReview('clock', now),
      attempt({ correct: false }),
    );
    r = schedule(r, attempt({ at: now + 5000 }));
    expect(r.successes).toHaveLength(0);
    expect(r.dueAt).toBe(now + 600_000);
  });
  it('requires varied contexts and does not promote with recent errors', () => {
    let r = newReview('clock', now);
    for (let i = 0; i < 5; i++)
      r = schedule(r, attempt({ sessionId: `s${i}`, at: now + i * 3 * DAY }));
    expect(r.status).toBe('reviewing');
    r = schedule(
      r,
      attempt({ sessionId: 'bad', at: now + 15 * DAY, correct: false }),
    );
    for (let i = 0; i < 2; i++)
      r = schedule(
        r,
        attempt({
          sessionId: `clean${i}`,
          exerciseId: 'clock-1',
          at: now + (16 + i) * DAY,
        }),
      );
    expect(r.status).toBe('reviewing');
    r = schedule(
      r,
      attempt({
        sessionId: 'third-clean',
        exerciseId: 'clock-2',
        at: now + 18 * DAY,
      }),
    );
    expect(r.status).toBe('mastered');
  });
});
