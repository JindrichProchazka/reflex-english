import { afterEach, expect, it } from 'vitest';
import { LearningDatabase } from '../src/data/database';
import { advancedLessons } from '../src/content/advanced-lessons';
import { initialStudyLessons } from '../src/content/study-lessons';
import {
  beginLessonSession,
  loadStudyLibrary,
  seedStudyLessons,
} from '../src/application/study';
import { recordAnswer, sessionExercise } from '../src/application/learning';
import { lessonContent, lessonProgressSummary } from '../src/domain/study';
import {
  generateWorksheet,
  lessonWorksheetPool,
} from '../src/domain/worksheets';
import { exportBackup, restoreBackup } from '../src/application/backup';
import { materializeBackup, parseBackup } from '../src/domain/backup';
import { DAY } from '../src/domain/scheduler';
it('never resolves new lesson IDs against the old immutable content-v1 baseline', async () => {
  const db = database();
  await loadStudyLibrary(db);
  const backup = await exportBackup(db);
  backup.builtInContent.version = 1;
  expect(() => parseBackup(JSON.stringify(backup))).toThrow(
    'unknown built-in studyLessons reference',
  );
});
import type { Session } from '../src/domain/models';
import { phraseEvaluator } from '../src/domain/evaluation';
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
const now = 30 * DAY;
it('ships the ten specified practical advanced lessons with separate unseen practice contexts', () => {
  expect(advancedLessons.map((l) => l.level)).toEqual([
    'B2',
    'B2/C1',
    'C1',
    'B2/C1',
    'B2/C1',
    'C1',
    'C1',
    'C1',
    'C1/C2',
    'C1/C2',
  ]);
  expect(advancedLessons).toHaveLength(10);
  for (const lesson of advancedLessons) {
    expect(lesson.words).toHaveLength(15);
    expect(new Set(lesson.words.map((w) => w.id)).size).toBe(15);
    for (const word of lesson.words) {
      expect(word.czech.length).toBeGreaterThan(2);
      expect(word.paperTranslation).toBeTruthy();
      expect(word.contextExamples).toHaveLength(2);
      expect(new Set([...word.examples, ...word.contextExamples!]).size).toBe(
        4,
      );
      for (const example of [...word.examples, ...word.contextExamples!])
        expect(example.toLowerCase()).toContain(word.english.toLowerCase());
      const generated = lessonContent(lesson, 'context', 'mixed').find(
        (c) => c.exercises[0].entryId === word.id,
      )!;
      expect(
        generated.exercises
          .filter((e) => e.lessonEvidence === 'production')
          .every((e) => !word.examples.includes(e.answer)),
      ).toBe(true);
      expect(generated.exercises[0].contextId).not.toBe(
        generated.exercises[2].contextId,
      );
    }
    const pool = lessonWorksheetPool(lesson);
    for (const kind of [
      'recall',
      'gap',
      'phrase',
      'translation',
      'repair',
      'mixed',
    ] as const) {
      const sheet = generateWorksheet(
        'test',
        lesson.title,
        {
          source: 'lesson',
          lessonId: lesson.id,
          kind,
          direction: 'mixed',
          count: 20,
        },
        pool,
        now,
      );
      expect(sheet.questions.length).toBeGreaterThan(0);
      expect(sheet.questions.every((q) => q.lessonId === lesson.id)).toBe(true);
    }
  }
});
it('accepts mobile smart apostrophes in authored advanced phrases without semantic guessing', () => {
  expect(
    phraseEvaluator.evaluate('I’m not entirely convinced', [
      "I'm not entirely convinced",
    ]),
  ).toBe(true);
  expect(
    phraseEvaluator.evaluate('I agree', ["I'm not entirely convinced"]),
  ).toBe(false);
});
it('adds new lessons once without overwriting edited original content or progress', async () => {
  const db = database();
  await db.studyLessons.bulkAdd(initialStudyLessons);
  await db.metadata.put({ key: 'study-lessons-v1', value: '1' });
  await db.studyLessons.update('hotel', { title: 'My existing hotel lesson' });
  await db.lessonProgress.put({
    lessonId: 'hotel',
    items: { 'hotel-1': { csEn: true } },
    updatedAt: now,
  });
  await seedStudyLessons(db);
  await seedStudyLessons(db);
  expect(await db.studyLessons.count()).toBe(20);
  expect((await db.studyLessons.get('hotel'))!.title).toBe(
    'My existing hotel lesson',
  );
  expect((await db.lessonProgress.get('hotel'))!.items['hotel-1'].csEn).toBe(
    true,
  );
  await db.studyLessons.update('automation', {
    title: 'My edited automation lesson',
  });
  await seedStudyLessons(db);
  expect((await db.studyLessons.get('automation'))!.title).toBe(
    'My edited automation lesson',
  );
});
it('restores a genuine data-v1/content-v1 backup, then adds the new curriculum without losing old progress', async () => {
  const old = database();
  await old.studyLessons.bulkAdd(initialStudyLessons);
  await old.metadata.put({ key: 'study-lessons-v1', value: '1' });
  await old.lessonProgress.put({
    lessonId: 'hotel',
    items: { 'hotel-1': { enCs: true } },
    updatedAt: now,
  });
  const backup = await exportBackup(old);
  backup.dataVersion = 1;
  backup.builtInContent.version = 1;
  const parsed = parseBackup(JSON.stringify(backup));
  expect(parsed.dataVersion).toBe(4);
  expect(materializeBackup(parsed).studyLessons).toHaveLength(10);
  const restored = database();
  await restoreBackup(restored, parsed, {
    confirmed: true,
    onSafetyBackup: () => {},
  });
  expect((await loadStudyLibrary(restored)).lessons).toHaveLength(20);
  expect(
    (await restored.lessonProgress.get('hotel'))!.items['hotel-1'].enCs,
  ).toBe(true);
});
it('retains separate recall/context progress through a full new lesson, backup and reopen', async () => {
  const db = database();
  let tick = 0;
  async function complete(initial: Session) {
    let s = initial;
    for (let i = 0; s.current && i < 150; i++)
      s = (
        await recordAnswer(db, s, sessionExercise(s).answer, 500, now + ++tick)
      ).session;
    expect(s.completedAt).toBeDefined();
  }
  await complete(
    await beginLessonSession(db, 'measurement', 'recall', 'mixed', now),
  );
  const lesson = (await db.studyLessons.get('measurement'))!;
  expect(
    lessonProgressSummary(lesson, await db.lessonProgress.get(lesson.id)),
  ).toMatchObject({ recall: 15, context: 0, passed: false });
  await complete(
    await beginLessonSession(db, 'measurement', 'context', 'mixed', now),
  );
  const backup = await exportBackup(db);
  expect(backup.dataVersion).toBe(4);
  expect(backup.builtInContent.version).toBe(2);
  const restored = database();
  await restoreBackup(restored, backup, {
    confirmed: true,
    onSafetyBackup: () => {},
  });
  restored.close();
  const reopened = database(restored.name);
  expect(
    lessonProgressSummary(
      (await reopened.studyLessons.get(lesson.id))!,
      await reopened.lessonProgress.get(lesson.id),
    ),
  ).toMatchObject({ recall: 15, context: 15, passed: true });
});
