import Dexie from 'dexie';
import { afterEach, describe, expect, it } from 'vitest';
import { studyLessons } from '../src/content/study-lessons';
import { LearningDatabase } from '../src/data/database';
import {
  beginLessonSession,
  beginPersonalSession,
  loadStudyLibrary,
  savePersonalWord,
} from '../src/application/study';
import { recordAnswer, sessionExercise } from '../src/application/learning';
import { lessonContent, lessonProgressSummary } from '../src/domain/study';
import { phraseEvaluator } from '../src/domain/evaluation';
import { DAY, newReview, schedule } from '../src/domain/scheduler';
import type { Attempt, Session } from '../src/domain/models';

const now = Date.UTC(2026, 9, 17);
const databases: LearningDatabase[] = [];
function database(name: string = crypto.randomUUID()) {
  const db = new LearningDatabase(name);
  databases.push(db);
  return db;
}
afterEach(async () => {
  for (const db of databases) db.close();
  for (const name of new Set(databases.map((db) => db.name)))
    await new LearningDatabase(name).delete();
  databases.length = 0;
});
async function complete(db: LearningDatabase, initial: Session) {
  let s = initial;
  for (let i = 0; s.current && i < 160; i++)
    s = (
      await recordAnswer(db, s, sessionExercise(s).answer, 400, now + i + 10)
    ).session;
  expect(s.completedAt).toBeDefined();
  return s;
}

describe('authored lesson loading and literal exercises', () => {
  it('loads twenty practical lessons with 15–25 entries and usable sentence contexts each', async () => {
    const db = database();
    const library = await loadStudyLibrary(db);
    expect(library.lessons).toHaveLength(20);
    expect(new Set(library.lessons.map((l) => l.id)).size).toBe(20);
    for (const lesson of library.lessons) {
      expect(lesson.words.length).toBeGreaterThanOrEqual(15);
      expect(lesson.words.length).toBeLessThanOrEqual(25);
      for (const word of lesson.words) {
        expect(word.czech).toBeTruthy();
        expect(word.examples[0]).not.toBe(word.examples[1]);
        for (const example of word.examples)
          expect(example.toLowerCase()).toContain(word.english.toLowerCase());
      }
      expect(
        lessonContent(lesson, 'context', 'mixed').flatMap((c) => c.exercises),
      ).toHaveLength(lesson.words.length * 4);
    }
    expect(await db.vocabulary.count()).toBe(0); // No legacy enrichment workflow or sample-word database needed.
    expect(lessonProgressSummary(library.lessons[0]).passed).toBe(false);
  });
  it('accepts explicit Czech equivalents and superficial typing differences, not semantic guesses', () => {
    const word = studyLessons[0].words[2];
    const exercise = lessonContent(studyLessons[0], 'recall', 'en-cs')[2]
      .exercises[0];
    expect(
      phraseEvaluator.evaluate(
        word.acceptedCzech![1],
        exercise.acceptedAnswers!,
      ),
    ).toBe(true);
    expect(
      phraseEvaluator.evaluate('  Could   I check in now  ', [
        'Could I check in now?',
      ]),
    ).toBe(true);
    expect(
      phraseEvaluator.evaluate('Could I NOT check in now?', [
        'Could I check in now?',
      ]),
    ).toBe(false);
  });
});

describe('shared lesson learning loop and progress', () => {
  it('English → Czech updates only that recall direction, never context progress', async () => {
    const db = database();
    const s = await beginLessonSession(db, 'hotel', 'recall', 'en-cs', now);
    const exercise = sessionExercise(s);
    expect(exercise.lessonEvidence).toBe('enCs');
    expect(exercise.prompt).toContain('English → Czech');
    await complete(db, s);
    const progress = lessonProgressSummary(
      studyLessons[0],
      await db.lessonProgress.get('hotel'),
    );
    expect(progress).toMatchObject({
      enCs: 15,
      csEn: 0,
      recall: 0,
      context: 0,
      passed: false,
    });
  });
  it('Czech → English requires the saved English expression and stores productive evidence', async () => {
    const db = database();
    let s = await beginLessonSession(db, 'teacher', 'recall', 'cs-en', now);
    const exercise = sessionExercise(s);
    expect(exercise.lessonEvidence).toBe('csEn');
    expect(exercise.productive).toBe(true);
    s = (await recordAnswer(db, s, exercise.answer.toUpperCase(), 654, now + 1))
      .session;
    expect(
      (await db.lessonProgress.get('teacher'))?.items[exercise.entryId!],
    ).toEqual({ csEn: true });
    expect((await db.attempts.toArray())[0]).toMatchObject({
      lessonId: 'teacher',
      studyMode: 'recall',
      lessonEvidence: 'csEn',
      durationMs: 654,
    });
    expect((await db.reviews.get(exercise.conceptId))?.productiveUseAt).toBe(
      now + 1,
    );
    expect(s.wrongCount).toBe(0);
  });
  it('mixed direction and context both complete before a lesson passes; progress survives reopen', async () => {
    const db = database();
    const first = await beginLessonSession(db, 'hotel', 'recall', 'mixed', now);
    await complete(db, first);
    expect(
      lessonProgressSummary(
        studyLessons[0],
        await db.lessonProgress.get('hotel'),
      ),
    ).toMatchObject({ recall: 15, context: 0, passed: false });
    await complete(
      db,
      await beginLessonSession(db, 'hotel', 'context', 'mixed', now + 200),
    );
    db.close();
    const reopened = database(db.name);
    const progress = lessonProgressSummary(
      studyLessons[0],
      await reopened.lessonProgress.get('hotel'),
    );
    expect(progress).toMatchObject({
      recall: 15,
      context: 15,
      understanding: 15,
      production: 15,
      passed: true,
    });
    expect(
      (await reopened.attempts.toArray()).some(
        (a) => a.lessonEvidence === 'production' && a.productive,
      ),
    ).toBe(true);
  });
  it('wrong answer hints, then corrects; copies do not pass; five prompts precede varied retry and closing recall', async () => {
    const db = database();
    let s = await beginLessonSession(db, 'airport', 'recall', 'mixed', now);
    const original = sessionExercise(s);
    const failedId = original.conceptId;
    s = (await recordAnswer(db, s, 'wrong', 200, now + 1)).session;
    expect(s.feedback).toBe('hint');
    s = (await recordAnswer(db, s, 'wrong again', 250, now + 2)).session;
    expect(s.feedback).toBe('correction');
    s = (await recordAnswer(db, s, original.answer, 300, now + 3)).session;
    expect(
      (await db.lessonProgress.get('airport'))?.items[original.entryId!][
        original.lessonEvidence!
      ],
    ).toBe(false);
    for (let i = 0; i < 5; i++) {
      expect(s.current!.conceptId).not.toBe(failedId);
      s = (
        await recordAnswer(db, s, sessionExercise(s).answer, 400, now + i + 4)
      ).session;
    }
    expect(s.current).toMatchObject({ conceptId: failedId, kind: 'delayed' });
    expect(sessionExercise(s).prompt).not.toBe(original.prompt);
    let closing = false;
    for (let i = 0; s.current && i < 160; i++) {
      if (s.current.conceptId === failedId && s.current.kind === 'final')
        closing = true;
      s = (
        await recordAnswer(db, s, sessionExercise(s).answer, 400, now + i + 20)
      ).session;
    }
    expect(closing).toBe(true);
    expect(s.completedAt).toBeDefined();
    expect((await db.mistakes.get(failedId))?.occurrences).toBe(2);
    expect((await db.reviews.get(failedId))?.dueAt).toBeLessThan(now + DAY);
    expect(
      lessonProgressSummary(
        studyLessons[3],
        await db.lessonProgress.get('airport'),
      ).recall,
    ).toBe(15);
  });
  it('context requires both the missing phrase and a complete sentence, not recall alone', async () => {
    const db = database();
    let s = await beginLessonSession(
      db,
      'troubleshooting',
      'context',
      'mixed',
      now,
    );
    const first = sessionExercise(s);
    expect(first.lessonEvidence).toBe('understanding');
    s = (await recordAnswer(db, s, first.answer, 500, now + 1)).session;
    expect(
      (await db.lessonProgress.get('troubleshooting'))?.items[first.entryId!],
    ).toEqual({ understanding: true });
    const production = s.content!.find((c) => c.id === first.conceptId)!
      .exercises[1];
    expect(production.lessonEvidence).toBe('production');
    expect(production.instruction).toContain('WHOLE sentence');
    expect(
      phraseEvaluator.evaluate(first.answer, production.acceptedAnswers!),
    ).toBe(false);
    await complete(db, s);
    expect(
      lessonProgressSummary(
        studyLessons[7],
        await db.lessonProgress.get('troubleshooting'),
      ),
    ).toMatchObject({ context: 15, recall: 0, passed: false });
  });
  it('updates attempt and lesson progress atomically on a storage failure', async () => {
    const db = database();
    const s = await beginLessonSession(db, 'hotel', 'recall', 'mixed', now);
    const hook = () => {
      throw new Error('Progress write failed');
    };
    db.lessonProgress.hook('creating', hook);
    await expect(
      recordAnswer(db, s, sessionExercise(s).answer, 100, now + 1),
    ).rejects.toThrow('Progress write failed');
    db.lessonProgress.hook('creating').unsubscribe(hook);
    expect(await db.attempts.count()).toBe(0);
    expect((await db.sessions.get(s.id))?.processed).toBe(0);
  });
  it('personal words need only two fields, retain old data and can use real intervening practice', async () => {
    const db = database();
    const word = await savePersonalWord(
      db,
      'torque ripple',
      'kolísání točivého momentu',
    );
    expect((await loadStudyLibrary(db)).words).toHaveLength(1);
    expect(await db.reviews.get(`vocab:${word.id}`)).toBeDefined();
    await expect(savePersonalWord(db, '', 'note')).rejects.toThrow('English');
    const s = await beginPersonalSession(db, word.id, 'cs-en', now);
    expect(sessionExercise(s)).toMatchObject({
      answer: 'torque ripple',
      lessonEvidence: 'csEn',
    });
    await complete(db, s);
    expect(await db.lessonProgress.count()).toBe(0);
    const updated = await savePersonalWord(
      db,
      'torque ripple',
      'zvlnění točivého momentu',
      word.id,
    );
    expect(updated.meaning).toBe('zvlnění točivého momentu');
  });
  it('migrates prior vocabulary and grammar without replacing their history', async () => {
    const name = crypto.randomUUID();
    const old = new Dexie(name);
    old.version(1).stores({
      reviews: 'conceptId, dueAt, status',
      attempts: 'id, sessionId, conceptId, at',
      mistakes: 'conceptId',
      sessions: 'id, startedAt',
    });
    old.version(2).stores({
      vocabulary: 'id, category, origin, preference, updatedAt',
      vocabularySets: 'id',
      lessons: 'id',
      topics: 'id',
      skills: 'id',
      vocabularyLinks: 'id, entryId, [entryId+kind], [kind+targetId]',
      metadata: 'key',
    });
    await old.table('vocabulary').put({
      id: 'old-word',
      english: 'bearing',
      meaning: 'ložisko',
      origin: 'personal',
      source: 'lecture',
    });
    await old.table('attempts').put({
      id: 'old-attempt',
      sessionId: 'old-session',
      at: now,
      answer: 'at',
    });
    old.close();
    const db = database(name);
    const library = await loadStudyLibrary(db);
    expect(library.words[0]).toMatchObject({
      id: 'old-word',
      source: 'lecture',
    });
    expect(await db.attempts.get('old-attempt')).toMatchObject({
      answer: 'at',
    });
  });
  it('does not master personal or lesson recall using recognition alone', () => {
    let r = { ...newReview('test', now), requireProductive: true };
    for (let i = 0; i < 5; i++) {
      const a: Attempt = {
        id: `${i}`,
        sessionId: `${i}`,
        conceptId: 'test',
        exerciseId: `${i}`,
        prompt: 'test',
        expected: 'test',
        answer: 'test',
        correct: true,
        at: now + i * 3 * DAY,
        durationMs: 100,
        assistance: 'none',
        taskKind: 'initial',
        source: 'typed',
        evaluator: 'accepted-answer-v1',
        productive: false,
      };
      r = { ...schedule(r, a), requireProductive: true };
    }
    expect(r.status).toBe('reviewing');
  });
});
