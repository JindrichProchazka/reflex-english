import { afterEach, describe, expect, it, vi } from 'vitest';
import { drills, drillById } from '../src/content/drills';
import { concepts as legacyGrammar } from '../src/content/prepositions';
import { beginDrillSession } from '../src/application/drills';
import {
  loadReviewSession,
  recordAnswer,
  sessionExercise,
} from '../src/application/learning';
import {
  historyKey,
  readPromptHistory,
} from '../src/application/prompt-history';
import { exportBackup, restoreBackup } from '../src/application/backup';
import { LearningDatabase } from '../src/data/database';
import {
  recentVariant,
  PROMPT_COOLDOWN,
  PROMPT_HISTORY_LIMIT,
} from '../src/domain/prompt-history';
import { startSession, submitToSession } from '../src/domain/session';
import { parseBackup } from '../src/domain/backup';
import { newReview } from '../src/domain/scheduler';
import type { Attempt, PromptHistory, Session } from '../src/domain/models';

const now = Date.UTC(2026, 9, 18),
  databases: LearningDatabase[] = [];
const database = (name: string = crypto.randomUUID()) => {
  const db = new LearningDatabase(name);
  databases.push(db);
  return db;
};
afterEach(async () => {
  vi.restoreAllMocks();
  databases.forEach((db) => db.close());
  for (const name of new Set(databases.map((db) => db.name)))
    await new LearningDatabase(name).delete();
  databases.length = 0;
});
const stored = async (db: LearningDatabase, id: string) =>
  (await db.settings.get(historyKey(id)))!.value as {
    version: number;
    promptIds: string[];
  };
async function complete(db: LearningDatabase, session: Session) {
  let s = session;
  for (let i = 0; s.current && i < 120; i++)
    s = (
      await recordAnswer(
        db,
        s,
        sessionExercise(s).answer,
        200,
        session.startedAt + i,
      )
    ).session;
  expect(s.completedAt).toBeDefined();
  return s;
}
describe('pure prompt recency in the shared engine', () => {
  it.each(drills.map((d) => [d.id, d] as const))(
    '%s normally leaves at least fifty other prompts before exact repetition across sessions',
    (_id, drill) => {
      let history: PromptHistory = {
        [drill.id]: {
          conceptIds: drill.concepts.map((c) => c.id),
          recentIds: [],
        },
      };
      const last = new Map<string, number>();
      let index = 0;
      for (let round = 0; round < 16; round++) {
        let s = startSession(
          `recency-${round}`,
          now,
          drill.concepts,
          [],
          undefined,
          undefined,
          { initialLimit: 10, mixed: true, promptHistory: history },
        );
        for (let step = 0; s.current && step < 60; step++) {
          const previous = last.get(s.exerciseId);
          if (previous !== undefined)
            expect(
              index - previous - 1,
              `${drill.id} ${s.exerciseId}`,
            ).toBeGreaterThanOrEqual(PROMPT_COOLDOWN);
          last.set(s.exerciseId, index++);
          s = submitToSession(s, true, now, drill.concepts);
        }
        expect(s.completedAt).toBeDefined();
        history = s.promptHistory!;
        expect(history[drill.id].recentIds.length).toBeLessThanOrEqual(
          PROMPT_HISTORY_LIMIT,
        );
      }
    },
  );
  it('uses the least-recent different variant for small or exhausted pools', () => {
    const concept = legacyGrammar[0],
      [a, b, c] = concept.exercises;
    expect(recentVariant(concept, [a.id, b.id, c.id], () => 0.5).id).toBe(a.id);
    expect(recentVariant(concept, [a.id, b.id, a.id, c.id], () => 0.5).id).toBe(
      b.id,
    );
    expect(
      recentVariant({ ...concept, exercises: [a] }, [a.id], () => 0).id,
    ).toBe(a.id);
  });
  it('preserves the five-prompt failure deadline, using a new context even with a saturated history', () => {
    const content = drillById('articles')!.concepts;
    const history = {
      articles: {
        conceptIds: content.map((c) => c.id),
        recentIds: content
          .flatMap((c) => c.exercises.map((e) => e.id))
          .slice(-96),
      },
    };
    let s = startSession(
      'failed-recent',
      now,
      content,
      [],
      undefined,
      undefined,
      { initialLimit: 5, promptHistory: history },
    );
    const failed = s.current!.conceptId,
      original = s.exerciseId;
    s = submitToSession(s, false, now, content);
    s = submitToSession(s, false, now, content);
    s = submitToSession(s, true, now, content);
    for (let i = 0; i < 5; i++) {
      expect(s.current!.conceptId).not.toBe(failed);
      s = submitToSession(s, true, now, content);
    }
    expect(s.current).toMatchObject({ conceptId: failed, kind: 'delayed' });
    expect(s.exerciseId).not.toBe(original);
  });
  it('never replaces a higher-priority due concept just because all its variants were recently seen', () => {
    const content = drillById('articles')!.concepts,
      target = content[0];
    const s = startSession(
      'due-recent',
      now,
      content,
      [{ ...newReview(target.id, now), status: 'reviewing' }],
      undefined,
      undefined,
      {
        initialLimit: 5,
        promptHistory: {
          articles: {
            conceptIds: content.map((c) => c.id),
            recentIds: target.exercises.map((e) => e.id),
          },
        },
      },
    );
    expect(s.current!.conceptId).toBe(target.id);
  });
});
describe('bounded IndexedDB history and compatibility', () => {
  it('restores data-v4 sessions from the 1,363-prompt bank without rewriting their snapshots or progress', async () => {
    const db = database();
    const content = drillById('articles')!.concepts.map((c) => ({
      ...c,
      exercises: c.exercises.filter((e) => !e.id.includes(':daily:')),
    }));
    expect(content.flatMap((c) => c.exercises)).toHaveLength(140);
    const old = startSession(
      'old-bank-v4',
      now,
      content,
      [],
      undefined,
      undefined,
      { initialLimit: 5 },
    );
    Object.assign(old, {
      content,
      module: 'drill',
      drillId: 'articles',
      drillSize: 'quick',
    });
    await db.sessions.add(old);
    const failed = (await recordAnswer(db, old, 'wrong', 222, now + 1)).session;
    const backup = parseBackup(JSON.stringify(await exportBackup(db, now + 2)));
    expect(backup.dataVersion).toBe(4);
    const restored = database();
    await restoreBackup(restored, backup, {
      confirmed: true,
      onSafetyBackup: () => {},
    });
    const resumed = (await loadReviewSession(restored, failed.id))!;
    expect(resumed.content).toEqual(failed.content);
    expect(resumed.queue).toEqual(failed.queue);
    expect(resumed.exerciseId).toBe(failed.exerciseId);
    expect(resumed.feedback).toBe('hint');
    expect(await restored.attempts.count()).toBe(1);
    expect(
      (await restored.reviews.get(failed.current!.conceptId))?.lastErrorSession,
    ).toBe(failed.id);
    const current = await beginDrillSession(
      restored,
      'articles',
      'normal',
      now + 3,
    );
    expect(current.content!.flatMap((c) => c.exercises)).toHaveLength(260);
    expect((await restored.sessions.get(failed.id))!.content).toEqual(
      failed.content,
    );
  });
  it('records an unanswered prompt before display, resumes it on reopen without adding a fake presentation, and awards no mastery', async () => {
    const db = database(),
      s = await beginDrillSession(db, 'articles', 'quick', now);
    expect((await stored(db, 'articles')).promptIds).toEqual([s.exerciseId]);
    expect(await db.attempts.count()).toBe(0);
    expect(await db.reviews.count()).toBe(0);
    db.close();
    const reopened = database(db.name);
    expect(await loadReviewSession(reopened, s.id)).toEqual(s);
    expect(await beginDrillSession(reopened, 'articles', 'quick', now)).toEqual(
      s,
    );
    expect((await stored(reopened, 'articles')).promptIds).toEqual([
      s.exerciseId,
    ]);
    const normal = await beginDrillSession(reopened, 'articles', 'normal', now);
    expect(normal.exerciseId).not.toBe(s.exerciseId);
    expect((await stored(reopened, 'articles')).promptIds).toEqual([
      s.exerciseId,
      normal.exerciseId,
    ]);
    expect(await reopened.attempts.count()).toBe(0);
  });
  it('does not count hint/correction guesses as additional prompt presentations', async () => {
    const db = database(),
      s = await beginDrillSession(db, 'quantifiers', 'quick', now);
    let next = (await recordAnswer(db, s, 'wrong', 200, now)).session;
    next = (await recordAnswer(db, next, 'wrong', 200, now + 1)).session;
    expect((await stored(db, 'quantifiers')).promptIds).toEqual([s.exerciseId]);
    await recordAnswer(db, next, sessionExercise(next).answer, 200, now + 2);
    expect((await stored(db, 'quantifiers')).promptIds).toHaveLength(2);
  });
  it('refreshes shared recency across two active sessions instead of overwriting the other tab’s presentations', async () => {
    const db = database(),
      quick = await beginDrillSession(db, 'articles', 'quick', now);
    const normal = await beginDrillSession(db, 'articles', 'normal', now);
    const next = (
      await recordAnswer(db, quick, sessionExercise(quick).answer, 200, now + 1)
    ).session;
    const ids = (await stored(db, 'articles')).promptIds;
    expect(ids).toEqual([quick.exerciseId, normal.exerciseId, next.exerciseId]);
    expect(new Set(ids).size).toBe(3);
  });
  it('keeps per-drill history bounded over repeated sessions and exports/restores it across database reopen', async () => {
    const db = database();
    for (let i = 0; i < 6; i++)
      await complete(
        db,
        await beginDrillSession(db, 'in-on-at', 'normal', now + i * 1000),
      );
    const before = await stored(db, 'in-on-at');
    expect(before.promptIds).toHaveLength(PROMPT_HISTORY_LIMIT);
    const backup = parseBackup(JSON.stringify(await exportBackup(db, now)));
    expect(backup.dataVersion).toBe(4);
    const restored = database();
    await restoreBackup(restored, backup, {
      confirmed: true,
      onSafetyBackup: () => {},
    });
    restored.close();
    const reopened = database(restored.name);
    expect(await stored(reopened, 'in-on-at')).toEqual(before);
    const fresh = await beginDrillSession(
      reopened,
      'in-on-at',
      'normal',
      now + 10000,
    );
    expect(before.promptIds.slice(-50)).not.toContain(fresh.exerciseId);
  });
  it('rolls back attempts, schedules, session and prompt history together when saving recency fails', async () => {
    const db = database(),
      s = await beginDrillSession(db, 'articles', 'quick', now),
      before = await stored(db, 'articles');
    vi.spyOn(db.settings, 'put').mockRejectedValueOnce(new Error('quota'));
    await expect(
      recordAnswer(db, s, sessionExercise(s).answer, 200, now + 1),
    ).rejects.toThrow('quota');
    expect(await db.attempts.count()).toBe(0);
    expect(await db.reviews.count()).toBe(0);
    expect(await db.sessions.get(s.id)).toEqual(s);
    expect(await stored(db, 'articles')).toEqual(before);
  });
  it('bootstraps legacy attempt evidence without treating repeated guesses or paper grades as new digital presentations', async () => {
    const db = database(),
      [a, b] = legacyGrammar[0].exercises;
    const evidence = (
      id: string,
      exerciseId: string,
      at: number,
      source: Attempt['source'] = 'typed',
    ): Attempt => ({
      id,
      sessionId: 'old',
      conceptId: a.conceptId,
      exerciseId,
      at,
      prompt: a.prompt,
      answer: '',
      expected: a.answer,
      correct: true,
      durationMs: 100,
      assistance: 'none',
      taskKind: 'initial',
      source,
      evaluator: 'accepted-answer-v1',
    });
    await db.attempts.bulkAdd([
      evidence('a', a.id, 1),
      evidence('guess', a.id, 2),
      evidence('b', b.id, 3),
      evidence('paper', a.id, 4, 'paper'),
      evidence('again', a.id, 5),
    ]);
    const history = await readPromptHistory(
      db,
      drillById('in-on-at')!.concepts,
    );
    expect(history['in-on-at'].recentIds).toEqual([a.id, b.id, a.id]);
  });
  it('loads a data-v3 three-variant session without rewriting its content and adopts recency without changing the current question', async () => {
    const db = database(),
      old = startSession('legacy', now, legacyGrammar, []);
    old.module = 'prepositions';
    await db.sessions.add(old);
    const backup = await exportBackup(db);
    backup.dataVersion = 3;
    const restored = database();
    await restoreBackup(restored, parseBackup(JSON.stringify(backup)), {
      confirmed: true,
      onSafetyBackup: () => {},
    });
    const resumed = (await loadReviewSession(restored, old.id))!;
    expect(resumed.exerciseId).toBe(old.exerciseId);
    expect(resumed.queue).toEqual(old.queue);
    expect(resumed.content).toBeUndefined();
    expect((await stored(restored, 'in-on-at')).promptIds).toEqual([
      old.exerciseId,
    ]);
    expect(
      (
        await recordAnswer(
          restored,
          resumed,
          sessionExercise(resumed).answer,
          100,
          now,
        )
      ).correct,
    ).toBe(true);
  });
});
