import { afterEach, describe, expect, it } from 'vitest';
import { drills, drillById, grammarConcepts } from '../src/content/drills';
import { beginDrillSession, loadDrills } from '../src/application/drills';
import {
  beginSession,
  recordAnswer,
  sessionExercise,
} from '../src/application/learning';
import {
  beginWeakSession,
  loadWeakAreas,
  revealWeakReferences,
} from '../src/application/weakness';
import { exportBackup, restoreBackup } from '../src/application/backup';
import {
  createWorksheet,
  submitPaperResults,
} from '../src/application/worksheets';
import { parseBackup } from '../src/domain/backup';
import { phraseEvaluator } from '../src/domain/evaluation';
import { newReview, schedule, DAY } from '../src/domain/scheduler';
import { startSession, submitToSession } from '../src/domain/session';
import { LearningDatabase } from '../src/data/database';
import type { Attempt, Session } from '../src/domain/models';

const now = Date.UTC(2026, 9, 18);
const databases: LearningDatabase[] = [];
const database = (name: string = crypto.randomUUID()) => {
  const db = new LearningDatabase(name);
  databases.push(db);
  return db;
};
afterEach(async () => {
  databases.forEach((db) => db.close());
  for (const name of new Set(databases.map((db) => db.name)))
    await new LearningDatabase(name).delete();
  databases.length = 0;
});
const correct = (s: Session) => submitToSession(s, true, now, s.content!);
async function finish(db: LearningDatabase, session: Session) {
  let s = session;
  for (let i = 0; s.current && i < 160; i++)
    s = (await recordAnswer(db, s, sessionExercise(s).answer, 234, now + i + 1))
      .session;
  expect(s.completedAt).toBeDefined();
  return s;
}

describe('authored drill catalogue', () => {
  it('has stable unique concept/exercise IDs, enough variants and no duplicated sentences', () => {
    expect(drills).toHaveLength(12);
    expect(new Set(grammarConcepts.map((c) => c.id)).size).toBe(
      grammarConcepts.length,
    );
    const exercises = grammarConcepts.flatMap((c) => c.exercises);
    expect(new Set(exercises.map((e) => e.id)).size).toBe(exercises.length);
    expect(new Set(exercises.map((e) => e.prompt)).size).toBe(exercises.length);
  });
  it.each(drills.map((d) => [d.id, d] as const))(
    '%s loads and evaluates every accepted authored answer',
    (_id, drill) => {
      expect(drill.concepts.length).toBeGreaterThanOrEqual(10);
      expect(
        drill.concepts.flatMap((c) => c.exercises).length,
      ).toBeGreaterThanOrEqual(30);
      for (const concept of drill.concepts) {
        expect(concept.exercises.length).toBeGreaterThanOrEqual(3);
        for (const exercise of concept.exercises) {
          expect(exercise.conceptId).toBe(concept.id);
          expect(exercise.prompt).toContain('___');
          expect(exercise.hint.length).toBeGreaterThan(10);
          expect(exercise.explanation.length).toBeGreaterThan(10);
          for (const answer of exercise.acceptedAnswers ?? [exercise.answer])
            expect(
              phraseEvaluator.evaluate(
                `  ${answer.toUpperCase()}  `,
                exercise.acceptedAnswers ?? [exercise.answer],
              ),
            ).toBe(true);
          expect(
            phraseEvaluator.evaluate(
              'incorrect placeholder',
              exercise.acceptedAnswers ?? [exercise.answer],
            ),
          ).toBe(false);
        }
      }
    },
  );
  it('uses a dash for no article and accepts natural alternatives instead of false corrections', () => {
    const absent = drillById('articles')!.concepts.find((c) =>
      c.id.endsWith(':mass-general'),
    )!.exercises[0];
    expect(absent.answer).toBe('-');
    expect(phraseEvaluator.evaluate('none', absent.acceptedAnswers!)).toBe(
      false,
    );
    const relative = drillById('who-which-that')!.concepts[0].exercises[0];
    expect(relative.acceptedAnswers).toEqual(['who', 'that']);
    const shower = drillById('do-make-take-have')!.concepts.find((c) =>
      c.id.endsWith(':shower'),
    )!.exercises[0];
    expect(shower.acceptedAnswers).toEqual(['take', 'have']);
    const contraction = drillById('present-perfect-past-simple')!.concepts.find(
      (c) => c.id.endsWith(':yet'),
    )!.exercises[0];
    expect(
      phraseEvaluator.evaluate(
        ' haven’t   received. ',
        contraction.acceptedAnswers!,
      ),
    ).toBe(true);
  });
});

describe('shared session planning and correction', () => {
  it('does not exhaust the minority tense early in a feasible seven-to-three pool', () => {
    const drill = drillById('present-perfect-past-simple')!;
    for (let seed = 0; seed < 60; seed++) {
      let s = startSession(
        `uneven-${seed}`,
        now,
        drill.concepts,
        [],
        undefined,
        undefined,
        { initialLimit: 10, mixed: true },
      );
      const groups: string[] = [];
      for (let i = 0; i < 10; i++) {
        groups.push(
          drill.concepts.find((c) => c.id === s.current!.conceptId)!.group,
        );
        if (groups.length >= 3)
          expect(new Set(groups.slice(-3)).size).toBeGreaterThan(1);
        s = submitToSession(s, true, now, drill.concepts);
      }
      expect(groups.filter((g) => g === 'present-perfect')).toHaveLength(7);
      expect(groups.filter((g) => g === 'past-simple')).toHaveLength(3);
    }
  });
  it.each(drills.map((d) => [d.id, d] as const))(
    '%s uses five-prompt varied retries, repeats failures and requires closing recall',
    (_id, drill) => {
      let s = startSession(
        'failure',
        now,
        drill.concepts,
        [],
        undefined,
        undefined,
        { initialLimit: 5, mixed: true },
      );
      s.content = drill.concepts;
      const firstId = s.current!.conceptId,
        firstExercise = s.exerciseId;
      function fail() {
        s = submitToSession(s, false, now, drill.concepts);
        expect(s.feedback).toBe('hint');
        s = submitToSession(s, false, now, drill.concepts);
        expect(s.feedback).toBe('correction');
        s = correct(s);
      }
      function intervening() {
        for (let i = 0; i < 5; i++) {
          expect(s.current!.conceptId).not.toBe(firstId);
          s = correct(s);
        }
        expect(s.current).toMatchObject({
          conceptId: firstId,
          kind: 'delayed',
        });
      }
      fail();
      intervening();
      expect(s.exerciseId).not.toBe(firstExercise);
      const delayed = s.exerciseId;
      fail();
      intervening();
      expect(s.exerciseId).not.toBe(delayed);
      s = correct(s);
      const afterDelayed = s.processed;
      let final = false;
      for (let i = 0; s.current && i < 100; i++) {
        if (s.current.conceptId === firstId) {
          expect(s.current.kind).toBe('final');
          expect(s.processed - afterDelayed).toBeGreaterThanOrEqual(5);
          final = true;
        }
        s = correct(s);
      }
      expect(final).toBe(true);
      expect(s.completedAt).toBeDefined();
    },
  );
  it('balances each mixed module and avoids avoidable three-answer streaks over many seeds', () => {
    for (const drill of drills)
      for (let seed = 0; seed < 20; seed++) {
        let s = startSession(
          `balanced-${seed}`,
          now,
          drill.concepts,
          [],
          undefined,
          undefined,
          { initialLimit: 10, mixed: true },
        );
        const groups: string[] = [];
        for (let i = 0; i < 10; i++) {
          const concept = drill.concepts.find(
            (c) => c.id === s.current!.conceptId,
          )!;
          const alternatives = s.queue
            .filter((t) => t.kind === 'initial')
            .map(
              (t) => drill.concepts.find((c) => c.id === t.conceptId)!.group,
            );
          const last = groups.at(-1);
          if (
            groups.length >= 2 &&
            last === groups.at(-2) &&
            alternatives.some((g) => g !== last)
          )
            expect(concept.group).not.toBe(last);
          groups.push(concept.group);
          s = submitToSession(s, true, now, drill.concepts);
        }
        expect(new Set(groups).size).toBeGreaterThanOrEqual(2);
      }
  });
  it('makes Quick about 10 and Normal about 20 clean prompts with balanced, distinct initial concepts', async () => {
    const db = database();
    for (const drill of drills) {
      const quick = await beginDrillSession(db, drill.id, 'quick', now);
      const normal = await beginDrillSession(db, drill.id, 'normal', now);
      expect(
        [quick.current!, ...quick.queue].filter((t) => t.kind === 'initial'),
      ).toHaveLength(5);
      expect(
        [normal.current!, ...normal.queue].filter((t) => t.kind === 'initial'),
      ).toHaveLength(10);
      const quickEnd = await finish(db, quick);
      expect(quickEnd.processed).toBeGreaterThanOrEqual(10);
      expect(quickEnd.processed).toBeLessThanOrEqual(12);
      expect((await finish(db, normal)).processed).toBe(20);
    }
  });
  it('prioritizes due concepts before new work within the initial budget', async () => {
    const db = database(),
      drill = drillById('articles')!;
    const due = drill.concepts.slice(-5);
    await db.reviews.bulkPut(
      due.map((c, i) => ({
        ...newReview(c.id, now - 500 - i),
        status: 'reviewing' as const,
      })),
    );
    let s = await beginDrillSession(db, drill.id, 'quick', now);
    for (let i = 0; i < 5; i++) {
      expect(due.map((c) => c.id)).toContain(s.current!.conceptId);
      s = correct(s);
    }
  });
  it('Due Review stays strictly within due concepts, including every error retry and filler', async () => {
    const db = database(),
      drill = drillById('quantifiers')!,
      due = drill.concepts.slice(0, 6);
    await db.reviews.bulkPut(
      due.map((c) => ({
        ...newReview(c.id, now - 1),
        status: 'learning' as const,
      })),
    );
    let s = await beginDrillSession(db, drill.id, 'due', now);
    expect(s.content).toHaveLength(6);
    let count = 0;
    while (s.current && count++ < 150) {
      expect(due.map((c) => c.id)).toContain(s.current.conceptId);
      if (s.current.kind === 'initial')
        s = submitToSession(s, false, now, s.content!);
      s = correct(s);
    }
    expect(s.completedAt).toBeDefined();
    expect(s.failed).toHaveLength(6);
  });
  it('handles too-small due pools explicitly without creating a partial session or adding new items', async () => {
    const db = database(),
      drill = drillById('articles')!;
    await expect(beginDrillSession(db, drill.id, 'due', now)).rejects.toThrow(
      'No concepts',
    );
    await db.reviews.put({
      ...newReview(drill.concepts[0].id, now),
      status: 'learning',
    });
    await expect(beginDrillSession(db, drill.id, 'due', now)).rejects.toThrow(
      'six distinct',
    );
    expect(await db.sessions.count()).toBe(0);
  });
});

describe('existing persistence, Weak Areas, backups and mastery', () => {
  it('resumes each size separately, preserves correction/review/timing and does not hijack legacy IN/ON/AT sessions', async () => {
    const db = database(),
      s = await beginDrillSession(db, 'articles', 'quick', now);
    const wrong = (await recordAnswer(db, s, 'wrong', 567, now)).session;
    const normal = await beginDrillSession(db, 'articles', 'normal', now);
    expect(normal.id).not.toBe(s.id);
    const legacy = await beginSession(db, now);
    expect(legacy.module).toBe('prepositions');
    db.close();
    const reopened = database(db.name);
    expect(await beginDrillSession(reopened, 'articles', 'quick', now)).toEqual(
      wrong,
    );
    expect((await reopened.attempts.toArray())[0].durationMs).toBe(567);
    expect((await reopened.reviews.toArray())[0].dueAt).toBe(now + 600000);
    expect(
      (await loadDrills(reopened, now)).find((d) => d.drill.id === 'articles'),
    ).toMatchObject({ accuracy: 0, recentMistakes: [{ category: 'article' }] });
    expect(
      (await loadDrills(reopened, now)).find(
        (d) => d.drill.id === 'quantifiers',
      ),
    ).toMatchObject({
      accuracy: null,
      due: 0,
      counts: { new: 10, learning: 0, reviewing: 0, mastered: 0 },
    });
  });
  it('accepts a natural collocation alternative through the real answer writer', async () => {
    const db = database(),
      drill = drillById('do-make-take-have')!;
    const target = drill.concepts.find((c) => c.id.endsWith(':shower'))!;
    const s = startSession('alternative', now, drill.concepts, [], [target.id]);
    Object.assign(s, {
      module: 'drill',
      drillId: drill.id,
      drillSize: 'quick',
      content: drill.concepts,
    });
    await db.sessions.add(s);
    const result = await recordAnswer(db, s, ' HAVE. ', 345, now + 1);
    expect(result.correct).toBe(true);
    expect(await db.mistakes.count()).toBe(0);
    expect((await db.attempts.toArray())[0]).toMatchObject({
      answer: ' HAVE. ',
      expected: 'take',
      correct: true,
      assistance: 'none',
    });
  });
  it('protects freshly revealed drill answers but unlocks after five other unassisted prompts', async () => {
    const db = database(),
      drill = drillById('articles')!;
    await db.reviews.bulkPut(
      drill.concepts.map((c) => ({
        ...newReview(c.id, now),
        answerExposedAt: now,
      })),
    );
    await expect(beginDrillSession(db, drill.id, 'quick', now)).rejects.toThrow(
      'recently revealed',
    );
    expect(await db.sessions.count()).toBe(0);
    let other = await beginDrillSession(db, 'quantifiers', 'quick', now + 1);
    for (let i = 0; i < 5; i++)
      other = (
        await recordAnswer(
          db,
          other,
          sessionExercise(other).answer,
          100,
          now + i + 2,
        )
      ).session;
    expect(
      (await beginDrillSession(db, drill.id, 'quick', now + 10)).module,
    ).toBe('drill');
  });
  it('new grammar failures appear in Weak Areas and focused practice uses current variants and the shared writer', async () => {
    const db = database(),
      s = await beginDrillSession(db, 'past-simple-continuous', 'quick', now);
    await recordAnswer(db, s, 'wrong', 100, now);
    const data = await loadWeakAreas(db, now),
      area = data.areas.find(
        (a) => a.targets[0].concept.id === s.current!.conceptId,
      )!;
    expect(area.targets[0].topic).toBe('Past Simple vs Past Continuous');
    expect(area.occurrences).toBe(1);
    expect((await db.mistakes.toArray())[0].category).toBe('tense');
    await revealWeakReferences(db, area.id, now + 1);
    let focused = await beginWeakSession(db, area.id, now + 2);
    for (let i = 0; i < 5; i++) {
      expect(focused.current!.conceptId).not.toBe(s.current!.conceptId);
      focused = (
        await recordAnswer(
          db,
          focused,
          sessionExercise(focused).answer,
          100,
          now + i + 3,
        )
      ).session;
    }
    expect(focused.current!.conceptId).toBe(s.current!.conceptId);
    expect(
      focused.content!.find((c) => c.id === s.current!.conceptId)!.exercises,
    ).toHaveLength(10);
    await finish(db, focused);
  });
  it('round-trips active drills, grammar mistakes, worksheets, attempts and schedules through backup/reopen', async () => {
    const db = database(),
      session = await beginDrillSession(db, 'articles', 'quick', now);
    const wrong = (await recordAnswer(db, session, 'wrong', 400, now)).session;
    const sheet = await createWorksheet(
      db,
      { source: 'mistakes', kind: 'gap', count: 10, direction: 'mixed' },
      now + 1,
    );
    expect(sheet.questions[0].category).toBe('article');
    await submitPaperResults(
      db,
      sheet.id,
      sheet.revision,
      Object.fromEntries(
        sheet.questions.map((q) => [q.id, { grade: 'wrong' as const }]),
      ),
      now + 2,
    );
    const backup = parseBackup(JSON.stringify(await exportBackup(db, now + 3)));
    expect(backup.dataVersion).toBe(4);
    const restored = database();
    await restoreBackup(restored, backup, {
      confirmed: true,
      onSafetyBackup: () => {},
    });
    restored.close();
    const reopened = database(restored.name);
    expect(await reopened.sessions.get(session.id)).toEqual(wrong);
    expect(await reopened.reviews.toArray()).toEqual(
      await db.reviews.toArray(),
    );
    expect(await reopened.worksheets.get(sheet.id)).toEqual(
      await db.worksheets.get(sheet.id),
    );
    expect(
      (await loadWeakAreas(reopened, now + 4)).areas
        .find((a) => a.targets[0].concept.id === session.current!.conceptId)!
        .errors.map((a) => a.source)
        .sort(),
    ).toEqual([...Array(sheet.questions.length).fill('paper'), 'typed']);
    const v2 = await exportBackup(database(), now);
    v2.dataVersion = 2;
    expect(parseBackup(JSON.stringify(v2)).dataVersion).toBe(4);
  });
  it('drill retrieval follows unchanged spaced mastery and error demotion rules', () => {
    const concept = drillById('present-perfect-past-simple')!.concepts[0];
    let review = newReview(concept.id, now);
    const evidence = (
      day: number,
      sessionId: string,
      correct = true,
    ): Attempt => ({
      id: sessionId,
      sessionId,
      conceptId: concept.id,
      exerciseId: concept.exercises[day % 3].id,
      prompt: concept.exercises[0].prompt,
      answer: '',
      expected: '',
      correct,
      at: now + day * DAY,
      durationMs: 300,
      assistance: 'none',
      taskKind: 'initial',
      source: 'typed',
      evaluator: 'accepted-answer-v1',
      productive: true,
    });
    review = schedule(review, evidence(0, 'first'));
    expect(review.status).toBe('learning');
    expect(review.dueAt).toBe(now + DAY);
    review = schedule(review, evidence(1, 'second'));
    expect(review.status).toBe('reviewing');
    review = schedule(review, evidence(4, 'third'));
    review = schedule(review, evidence(11, 'fourth'));
    expect(review.status).toBe('mastered');
    review = schedule(review, evidence(12, 'error', false));
    expect(review.status).toBe('reviewing');
    expect(review.dueAt).toBe(now + 12 * DAY + 600000);
  });
});
