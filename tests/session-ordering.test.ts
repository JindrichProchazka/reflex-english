import { describe, expect, it } from 'vitest';
import { concepts } from '../src/content/prepositions';
import type { Session } from '../src/domain/models';
import { newReview } from '../src/domain/scheduler';
import {
  RETRIEVAL_GAP,
  startSession,
  submitToSession,
} from '../src/domain/session';

const now = Date.UTC(2026, 9, 17);
const known = concepts.map((c) => ({
  ...newReview(c.id, now),
  status: 'reviewing' as const,
}));
const target = (s: Session) =>
  concepts.find((c) => c.id === s.current!.conceptId)!.group;
const correct = (s: Session) => submitToSession(s, true, now + 1, concepts);
const failAndResolve = (s: Session) =>
  correct(
    submitToSession(
      submitToSession(s, false, now, concepts),
      false,
      now,
      concepts,
    ),
  );
function waitForRetry(s: Session, id: string) {
  for (let i = 0; i < RETRIEVAL_GAP; i++) {
    expect(s.current!.conceptId).not.toBe(id);
    s = correct(s);
  }
  expect(s.current).toMatchObject({ conceptId: id, kind: 'delayed' });
  return s;
}

describe('constrained session ordering', () => {
  it('balances all three targets without avoidable streaks or adjacent concept variants across 60 seeds', () => {
    const orders = new Set<string>();
    for (let seed = 0; seed < 60; seed++) {
      let s = startSession(`mixed-${seed}`, now, concepts, known);
      const groups: string[] = [];
      const ids: string[] = [];
      const counts: Record<string, number> = { AT: 0, IN: 0, ON: 0 };
      for (let i = 0; s.current && i < 80; i++) {
        groups.push(target(s));
        ids.push(s.current.conceptId);
        counts[target(s)]++;
        expect(
          Math.max(...Object.values(counts)) -
            Math.min(...Object.values(counts)),
        ).toBeLessThanOrEqual(1);
        if (groups.length >= 3)
          expect(new Set(groups.slice(-3)).size).toBeGreaterThan(1);
        if (ids.length >= 2) expect(ids.at(-1)).not.toBe(ids.at(-2));
        s = correct(s);
      }
      expect(s.completedAt).toBeDefined();
      expect(groups).toHaveLength(24);
      expect(counts).toEqual({ AT: 8, IN: 8, ON: 8 });
      orders.add(ids.join(','));
    }
    expect(orders.size).toBeGreaterThan(40);
  });

  it('retains short focused pairs for first acquisition without long answer streaks', () => {
    let s = startSession('acquisition', now, concepts, []);
    const groups: string[] = [];
    for (let i = 0; i < 12; i++) {
      groups.push(target(s));
      s = correct(s);
    }
    expect(groups[0]).toBe(groups[1]);
    for (let i = 2; i < groups.length; i++)
      expect(new Set(groups.slice(i - 2, i + 1)).size).toBeGreaterThan(1);
  });

  it('preserves due-item tiers even when they require an otherwise unwanted streak', () => {
    const dueIds = concepts.filter((c) => c.group === 'AT').map((c) => c.id);
    const reviews = known.map((r) => ({
      ...r,
      dueAt: dueIds.includes(r.conceptId) ? now - 100 : now + 1000,
    }));
    let s = startSession('due-priority', now, concepts, reviews);
    for (let i = 0; i < dueIds.length; i++) {
      expect(dueIds).toContain(s.current!.conceptId);
      expect(s.current!.kind).toBe('initial');
      s = correct(s);
    }
    expect(dueIds).not.toContain(s.current!.conceptId);
  });

  it('keeps uneven target counts workable rather than dropping items', () => {
    // Six concepts allow five intervening prompts; AT still dominates this pool.
    const content = concepts.filter(
      (c) => c.group === 'AT' || c.id === 'day' || c.id === 'city',
    );
    let s = startSession('uneven', now, content, known);
    const initial = new Set<string>();
    for (let i = 0; s.current && i < 80; i++) {
      if (s.current.kind === 'initial') initial.add(s.current.conceptId);
      s = submitToSession(s, true, now + 1, content);
    }
    expect(s.completedAt).toBeDefined();
    expect(initial.size).toBe(content.length);
  });

  it('replays identically after a saved session reload and supports legacy records', () => {
    let s = startSession('saved-order', now, concepts, known);
    for (let i = 0; i < 5; i++) s = correct(s);
    expect(correct(JSON.parse(JSON.stringify(s)))).toEqual(correct(s));
    const legacy = structuredClone(s);
    delete legacy.ordering;
    delete legacy.acquisition;
    for (const task of legacy.queue) {
      delete task.priority;
      delete task.dueAt;
    }
    const resumed = correct(legacy);
    expect(resumed.ordering).toBeDefined();
    expect(resumed.processed).toBe(s.processed + 1);
  });
});

describe('failed retrieval deadlines', () => {
  it('returns after five other prompts with a different variant, repeats the loop after another failure and closes successfully', () => {
    let s = startSession('repeat-failure', now, concepts, known);
    const id = s.current!.conceptId;
    const original = s.exerciseId;
    s = waitForRetry(failAndResolve(s), id);
    const delayed = s.exerciseId;
    expect(delayed).not.toBe(original);
    s = waitForRetry(failAndResolve(s), id);
    expect(s.exerciseId).not.toBe(delayed);
    expect(s.completedAt).toBeUndefined();
    s = correct(s);
    const recalledAt = s.processed;
    let closing = 0;
    for (let i = 0; s.current && i < 100; i++) {
      if (s.current.conceptId === id) {
        expect(s.current.kind).toBe('final');
        expect(s.processed - recalledAt).toBeGreaterThanOrEqual(RETRIEVAL_GAP);
        closing++;
      }
      s = correct(s);
    }
    expect(closing).toBe(1);
    expect(s.completedAt).toBeDefined();
  });

  it('ready failed-item retries override an undesirable target streak', () => {
    let s = startSession('retry-priority', now, concepts, known);
    const id = s.current!.conceptId;
    const group = target(s);
    s = failAndResolve(s);
    for (let i = 0; i < RETRIEVAL_GAP - 1; i++) s = correct(s);
    s.ordering!.recentTargets = [group, group];
    s = correct(s);
    expect(s.current).toMatchObject({ conceptId: id, kind: 'delayed' });
  });

  it('several failures each meet their own five-prompt deadline', () => {
    let s = startSession('multiple-failures', now, concepts, known);
    const deadlines = new Map<string, number>();
    for (let i = 0; i < 3; i++) {
      const id = s.current!.conceptId;
      s = failAndResolve(s);
      deadlines.set(id, s.processed + RETRIEVAL_GAP);
    }
    const checked = new Set<string>();
    for (let i = 0; s.current && i < 100; i++) {
      const id = s.current.conceptId;
      if (
        s.current.kind === 'delayed' &&
        deadlines.has(id) &&
        !checked.has(id)
      ) {
        expect(s.processed).toBe(deadlines.get(id));
        checked.add(id);
      }
      s = correct(s);
    }
    expect(checked.size).toBe(3);
    expect(s.completedAt).toBeDefined();
  });
});
