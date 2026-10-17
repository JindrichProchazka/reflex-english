import { afterEach, describe, expect, it } from 'vitest';
import { LearningDatabase } from '../src/data/database';
import {
  buildWeakAreas,
  filterWeakAreas,
  weaknessProgress,
  weaknessScore,
  type WeakTarget,
} from '../src/domain/weakness';
import { DAY, newReview, schedule } from '../src/domain/scheduler';
import type { Attempt, ReviewItem } from '../src/domain/models';
import {
  beginSession,
  recordAnswer,
  sessionExercise,
} from '../src/application/learning';
import {
  beginLessonSession,
  beginPersonalSession,
  savePersonalWord,
} from '../src/application/study';
import {
  beginWeakSession,
  loadWeakAreas,
  revealWeakReferences,
} from '../src/application/weakness';
import {
  createWorksheet,
  submitPaperResults,
} from '../src/application/worksheets';
import { exportBackup, restoreBackup } from '../src/application/backup';

const now = 30 * DAY;
const databases: LearningDatabase[] = [];
function database(name: string = crypto.randomUUID()) {
  const db = new LearningDatabase(name);
  databases.push(db);
  return db;
}
afterEach(async () => {
  databases.forEach((db) => db.close());
  for (const name of new Set(databases.map((db) => db.name)))
    await new LearningDatabase(name).delete();
  databases.length = 0;
});
let counter = 0;
function attempt(overrides: Partial<Attempt> = {}): Attempt {
  const id = `attempt-${++counter}`;
  return {
    id,
    sessionId: id,
    conceptId: 'arrive',
    exerciseId: id,
    prompt: 'We arrive ___ Prague.',
    expected: 'in',
    answer: 'to',
    correct: false,
    at: now,
    durationMs: 400,
    assistance: 'none',
    source: 'typed',
    evaluator: 'accepted-answer-v1',
    taskKind: 'initial',
    ...overrides,
  };
}
const grammar: WeakTarget = {
  concept: {
    id: 'arrive',
    title: 'arrive + in / at, not to',
    group: 'prepositions',
    exercises: [],
  },
  title: 'arrive + in / at, not to',
  groupId: 'grammar:arrive',
  type: 'grammar',
  topic: 'Arrival prepositions',
};
describe('transparent weakness signals and grouping', () => {
  it('groups contrasting arrival sentences by conceptual target, not incorrect answer text', () => {
    const attempts = ['Prague', 'school', 'the hotel'].map((place) =>
      attempt({ prompt: `We arrive ___ ${place}.` }),
    );
    const areas = buildWeakAreas(
      { targets: [grammar], attempts, mistakes: [], reviews: [] },
      now,
    );
    expect(areas).toHaveLength(1);
    expect(areas[0].occurrences).toBe(3);
    expect(areas[0].errors).toHaveLength(3);
    expect(areas[0].title).toBe('arrive + in / at, not to');
    expect(filterWeakAreas(areas, 'grammar', now)).toHaveLength(1);
    expect(filterWeakAreas(areas, 'vocabulary', now)).toHaveLength(0);
    expect(filterWeakAreas(areas, 'repeated', now)).toHaveLength(1);
    expect(filterWeakAreas(areas, 'recent', now)).toHaveLength(1);
  });
  it('combines errors, repeated encounters, mastery, due state, accuracy and recency with explicit weights', () => {
    const review = {
      ...newReview('arrive', now),
      status: 'learning' as const,
      lastReviewedAt: now,
      dueAt: now - 3 * DAY,
    };
    const failures = [0, 1, 2, 3]
      .map((i) => attempt({ at: now - i * 100 }))
      .reverse();
    const weak = weaknessScore(failures, [review], now);
    expect(weak.label).toBe('Needs attention');
    expect(weak.overdue).toBe(true);
    expect(weak.firstAccuracy).toBe(0);
    expect(weak.signals).toMatchObject({
      'Incorrect encounters in the last 7 days': 24,
      'Repeated failed encounters': 12,
      'Current mastery': 12,
      'Due or overdue review': 9,
      'First-attempt accuracy': 20,
      'Recency of the last error': 10,
    });
    const older = weaknessScore(
      failures.map((a) => ({ ...a, at: a.at - 40 * DAY })),
      [{ ...review, dueAt: now + DAY }],
      now,
    );
    expect(older.score).toBeLessThan(weak.score);
    const mastered = weaknessScore(
      failures,
      [{ ...review, status: 'mastered' }],
      now,
    );
    expect(mastered.score).toBeLessThan(weak.score);
  });
  it('does not inflate encounter signals for repeated guesses or credit hinted/copied corrections as first-attempt improvement', () => {
    const first = attempt();
    const retry = attempt({
      sessionId: first.sessionId,
      exerciseId: first.exerciseId,
      assistance: 'hint',
      at: now + 1,
    });
    const copy = attempt({ correct: true, assistance: 'answer', at: now + 2 });
    const signals = weaknessScore([first, retry, copy], [], now + 3);
    expect(signals.signals['Incorrect encounters in the last 7 days']).toBe(6);
    expect(signals.signals['Repeated failed encounters']).toBe(3);
    expect(signals.firstAccuracy).toBe(0);
    expect(signals.improving).toBe(false);
    expect(signals.cleanAfterError).toBe(0);
  });
  it('shows meaningful recovery only from clean retrievals and allows stable items without claiming mastery', () => {
    const error = attempt({ at: now - 10 * DAY });
    const successes = [1, 2, 3, 4, 5, 6].map((i) =>
      attempt({ correct: true, answer: 'in', at: now - (7 - i) * DAY }),
    );
    const review = {
      ...newReview('arrive', now),
      status: 'reviewing' as const,
      lastReviewedAt: now,
      dueAt: now + DAY,
    };
    const recovery = weaknessScore([error, ...successes], [review], now);
    expect(recovery.improving).toBe(true);
    expect(recovery.cleanAfterError).toBe(6);
    expect(recovery.label).toBe('Stable');
    expect(recovery.mastery).toBe('reviewing');
  });
  it('detects mastered-but-relapsed by replaying actual scheduling evidence', () => {
    const attempts = [0, 2, 5, 8].map((day, i) =>
      attempt({
        correct: true,
        answer: 'in',
        exerciseId: `variant-${i % 2}`,
        at: (10 + day) * DAY,
      }),
    );
    let review: ReviewItem = newReview('arrive', 10 * DAY);
    for (const a of attempts) review = schedule(review, a);
    expect(review.status).toBe('mastered');
    attempts.push(attempt({ at: now }));
    review = schedule(review, attempts.at(-1)!);
    const areas = buildWeakAreas(
      { targets: [grammar], attempts, mistakes: [], reviews: [review] },
      now,
    );
    expect(areas[0].relapsed).toBe(true);
    expect(areas[0].mastery).toBe('reviewing');
    expect(filterWeakAreas(areas, 'relapsed', now)).toHaveLength(1);
  });
  it('does not call untouched seeded concepts weak', () => {
    expect(
      buildWeakAreas(
        {
          targets: [grammar],
          attempts: [],
          mistakes: [],
          reviews: [newReview('arrive', now)],
        },
        now,
      ),
    ).toEqual([]);
  });
  it('counts an unassisted wrong paper response in first-attempt accuracy despite its ineligible mastery flag', () => {
    const paper = attempt({
      source: 'paper',
      durationMs: null,
      grade: 'wrong',
      taskKind: 'paper',
      evaluator: 'paper-self-assessment-v1',
      masteryEligible: false,
    });
    expect(weaknessScore([paper], [], now).firstAccuracy).toBe(0);
  });
});
describe('shared targeted practice and persistence', () => {
  it('combines paper, lesson recall/context and personal-word errors by phrase, retaining source lessons', async () => {
    const db = database();
    const lesson = await beginLessonSession(
      db,
      'career',
      'recall',
      'cs-en',
      now,
    );
    const exercise = sessionExercise(lesson);
    await recordAnswer(db, lesson, 'wrong', 123, now + 1);
    const word = (await db.studyLessons.get('career'))!.words.find(
      (w) => w.id === exercise.entryId,
    )!;
    const personal = await savePersonalWord(db, word.english, word.czech);
    const session = await beginPersonalSession(
      db,
      personal.id,
      'cs-en',
      now + 2,
    );
    await recordAnswer(db, session, 'wrong too', 456, now + 3);
    const sheet = await createWorksheet(
      db,
      {
        source: 'selection',
        lessonId: 'career',
        entryIds: [word.id],
        kind: 'mixed',
        direction: 'mixed',
        count: 10,
      },
      now + 4,
    );
    await submitPaperResults(
      db,
      sheet.id,
      sheet.revision,
      Object.fromEntries(
        sheet.questions.map((q) => [
          q.id,
          { grade: 'wrong', writtenAnswer: 'paper error' },
        ]),
      ),
      now + 5,
    );
    const data = await loadWeakAreas(db, now + 6);
    const area = data.areas.find((a) => a.title === word.english)!;
    expect(data.areas.filter((a) => a.title === word.english)).toHaveLength(1);
    expect(new Set(area.errors.map((a) => a.source))).toEqual(
      new Set(['typed', 'paper']),
    );
    expect(area.occurrences).toBe(sheet.questions.length + 2);
    expect(area.targets.some((t) => t.concept.id.endsWith(':context'))).toBe(
      true,
    );
    expect(
      area.targets.some((t) => t.concept.id === `vocab:${personal.id}`),
    ).toBe(true);
    expect(filterWeakAreas([area], 'lesson', now + 6)).toHaveLength(1);
    const progress = weaknessProgress(data.areas);
    expect(progress.lessons[0]).toMatchObject({
      id: 'career',
      weak: 1,
      practised: 1,
    });
    expect(progress.categories.reduce((n, [, count]) => n + count, 0)).toBe(
      sheet.questions.length + 2,
    );
    const backup = await exportBackup(db);
    const restored = database();
    await restoreBackup(restored, backup, {
      confirmed: true,
      onSafetyBackup: () => {},
    });
    restored.close();
    const reopened = database(restored.name);
    const reloaded = (await loadWeakAreas(reopened, now + 6)).areas.find(
      (a) => a.id === area.id,
    )!;
    expect(reloaded.errors).toEqual(area.errors);
    expect(reloaded.signals).toEqual(area.signals);
  });
  it('uses the existing correction, five-prompt varied delayed retry, repeated failure and closing recall loop', async () => {
    const db = database();
    const original = await beginSession(db, now);
    const target = sessionExercise(original).conceptId;
    await recordAnswer(db, original, 'wrong', 100, now + 1);
    const area = (await loadWeakAreas(db, now + 2)).areas.find((a) =>
      a.targets.some((t) => t.concept.id === target),
    )!;
    let s = await beginWeakSession(db, area.id, now + 3);
    expect(s.current!.conceptId).toBe(target);
    expect((await beginWeakSession(db, area.id, now + 4)).id).toBe(s.id);
    const firstPrompt = sessionExercise(s).prompt;
    s = (await recordAnswer(db, s, 'wrong', 100, now + 5)).session;
    expect(s.feedback).toBe('hint');
    s = (await recordAnswer(db, s, 'wrong again', 100, now + 6)).session;
    expect(s.feedback).toBe('correction');
    s = (await recordAnswer(db, s, sessionExercise(s).answer, 100, now + 7))
      .session;
    for (let i = 0; i < 5; i++) {
      expect(s.current!.conceptId).not.toBe(target);
      s = (
        await recordAnswer(db, s, sessionExercise(s).answer, 100, now + 8 + i)
      ).session;
    }
    expect(s.current).toMatchObject({ conceptId: target, kind: 'delayed' });
    expect(sessionExercise(s).prompt).not.toBe(firstPrompt);
    s = (await recordAnswer(db, s, 'wrong once more', 100, now + 20)).session;
    s = (await recordAnswer(db, s, sessionExercise(s).answer, 100, now + 21))
      .session;
    for (let i = 0; i < 5; i++) {
      expect(s.current!.conceptId).not.toBe(target);
      s = (
        await recordAnswer(db, s, sessionExercise(s).answer, 100, now + 22 + i)
      ).session;
    }
    expect(s.current).toMatchObject({ conceptId: target, kind: 'delayed' });
    let closing = 0;
    for (let i = 0; s.current && i < 80; i++) {
      if (s.current.conceptId === target && s.current.kind === 'final')
        closing++;
      s = (
        await recordAnswer(db, s, sessionExercise(s).answer, 100, now + 40 + i)
      ).session;
    }
    expect(s.completedAt).toBeDefined();
    expect(closing).toBe(1);
    expect(s.queue).toEqual([]);
    expect((await db.reviews.get(target))!.dueAt).toBeLessThan(now + DAY);
    db.close();
    const reopened = database(db.name);
    expect((await reopened.sessions.get(s.id))!.weakAreaIds).toEqual([area.id]);
    expect(
      (await loadWeakAreas(reopened, now + 150)).areas.find(
        (a) => a.id === area.id,
      )!.occurrences,
    ).toBe(4);
    const backup = await exportBackup(reopened);
    const restored = database();
    await restoreBackup(restored, backup, {
      confirmed: true,
      onSafetyBackup: () => {},
    });
    expect((await restored.sessions.get(s.id))!.weakAreaIds).toEqual([area.id]);
  });
  it('records reference exposure before revealing examples and defers the target for five other prompts', async () => {
    const db = database();
    const original = await beginLessonSession(
      db,
      'automation',
      'recall',
      'cs-en',
      now,
    );
    await recordAnswer(db, original, 'wrong', 100, now + 1);
    const data = await loadWeakAreas(db, now + 2),
      area = data.areas.find((a) =>
        a.targets.some((t) => t.concept.id === original.current!.conceptId),
      )!;
    await revealWeakReferences(db, area.id, now + 3);
    const sibling = [...data.catalog.values()].filter(
      (t) => t.groupId === area.id,
    );
    expect(sibling.length).toBe(2);
    for (const t of sibling)
      expect((await db.reviews.get(t.concept.id))!.answerExposedAt).toBe(
        now + 3,
      );
    let s = await beginWeakSession(db, area.id, now + 4);
    for (let i = 0; i < 5; i++) {
      expect(
        area.targets.some((t) => t.concept.id === s.current!.conceptId),
      ).toBe(false);
      s = (
        await recordAnswer(db, s, sessionExercise(s).answer, 100, now + 5 + i)
      ).session;
    }
    expect(
      area.targets.some((t) => t.concept.id === s.current!.conceptId),
    ).toBe(true);
    s = (await recordAnswer(db, s, sessionExercise(s).answer, 100, now + 12))
      .session;
    const clean = (await db.attempts.toArray()).find(
      (a) => a.sessionId === s.id && a.entryId,
    )!;
    expect(clean.assistance).toBe('none');
    expect(clean.masteryEligible).not.toBe(false);
  });
  it('rolls back exposure for every related skill if a reference-reveal write fails', async () => {
    const db = database();
    const s = await beginLessonSession(
      db,
      'automation',
      'recall',
      'cs-en',
      now,
    );
    await recordAnswer(db, s, 'wrong', 100, now + 1);
    const area = (await loadWeakAreas(db, now + 2)).areas.find((a) =>
      a.targets.some((t) => t.concept.id === s.current!.conceptId),
    )!;
    const before = await db.reviews.toArray();
    const fail = () => {
      throw new Error('Exposure write failed');
    };
    db.reviews.hook('creating', fail);
    await expect(revealWeakReferences(db, area.id, now + 3)).rejects.toThrow(
      'Exposure write failed',
    );
    db.reviews.hook('creating').unsubscribe(fail);
    expect(await db.reviews.toArray()).toEqual(before);
  });
});
