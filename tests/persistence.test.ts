import { afterEach, describe, expect, it } from 'vitest';
import {
  beginSession,
  loadDashboard,
  recordAnswer,
  sessionExercise,
} from '../src/application/learning';
import { LearningDatabase } from '../src/data/database';

const databases: LearningDatabase[] = [];
function database(name: string = crypto.randomUUID()) {
  const db = new LearningDatabase(name);
  databases.push(db);
  return db;
}
afterEach(async () => {
  for (const db of databases) db.close();
  for (const name of new Set(databases.map((db) => db.name))) {
    const db = new LearningDatabase(name);
    await db.delete();
  }
  databases.length = 0;
});
describe('IndexedDB learning transactions', () => {
  it('retains raw attempts, timing, conceptual mistakes, review state and in-flight corrections across reopen', async () => {
    const db = database();
    const s = await beginSession(db, 1000);
    const first = await recordAnswer(db, s, 'wrong', 321, 1100);
    await recordAnswer(db, first.session, 'still wrong', 654, 1200);
    db.close();
    const reopened = database(db.name);
    const data = await loadDashboard(reopened, 1300);
    expect(data.attempts).toHaveLength(2);
    expect(data.attempts.map((a) => a.durationMs).sort()).toEqual([321, 654]);
    expect(data.attempts.every((a) => a.prompt && a.expected && a.at)).toBe(
      true,
    );
    expect(data.mistakes).toHaveLength(1);
    expect(data.mistakes[0].occurrences).toBe(2);
    expect(data.mistakes[0].attemptIds).toHaveLength(2);
    expect(data.reviews[0].dueAt).toBe(601200);
    expect(data.active?.feedback).toBe('correction');
    expect((await beginSession(reopened)).id).toBe(s.id);
    const corrected = await recordAnswer(
      reopened,
      data.active!,
      sessionExercise(s).answer,
      777,
      1400,
    );
    expect(corrected.session.queue.some((t) => t.kind === 'final')).toBe(true);
    const attempt = (await reopened.attempts.toArray()).find((a) => a.correct)!;
    expect(attempt.assistance).toBe('answer');
  });
  it('rejects stale submissions without adding duplicate attempts', async () => {
    const db = database();
    const s = await beginSession(db);
    await recordAnswer(db, s, 'wrong', 100);
    await expect(recordAnswer(db, s, 'wrong', 100)).rejects.toThrow(
      'another tab',
    );
    expect(await db.attempts.count()).toBe(1);
  });
  it('rolls back every update if persistence fails mid-transaction', async () => {
    const db = database();
    const s = await beginSession(db);
    const hook = () => {
      throw new Error('Simulated write failure');
    };
    db.reviews.hook('creating', hook);
    await expect(recordAnswer(db, s, 'wrong', 100)).rejects.toThrow(
      'Simulated',
    );
    db.reviews.hook('creating').unsubscribe(hook);
    expect(await db.attempts.count()).toBe(0);
    expect(await db.mistakes.count()).toBe(0);
    expect((await db.sessions.get(s.id))?.wrongCount).toBe(0);
  });
});
