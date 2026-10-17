import { afterEach, describe, expect, it } from 'vitest';
import { LearningDatabase } from '../src/data/database';
import {
  exportBackup,
  markExported,
  personalVocabularyCsv,
  restoreBackup,
} from '../src/application/backup';
import {
  backupSummary,
  canonical,
  materializeBackup,
  parseBackup,
  tableNames,
  validateBackup,
  type Backup,
} from '../src/domain/backup';
import { beginLessonSession, savePersonalWord } from '../src/application/study';
import {
  beginSession,
  recordAnswer,
  sessionExercise,
} from '../src/application/learning';
import { seedVocabulary } from '../src/application/vocabulary';
import {
  createWorksheet,
  savePaperDraft,
  submitPaperResults,
  viewAnswerKey,
} from '../src/application/worksheets';

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
const confirmed = { confirmed: true, onSafetyBackup: () => {} };
async function populate(db: LearningDatabase) {
  await seedVocabulary(db, 1000);
  await db.topics.update('study', { title: 'My edited topic' });
  await db.vocabularyLinks.add({
    id: 'link',
    entryId: 'seed:deadline',
    kind: 'topic',
    targetId: 'study',
  });
  await savePersonalWord(db, 'meet the deadline', 'dodržet termín');
  const lesson = await beginLessonSession(db, 'hotel', 'recall', 'cs-en', 2000);
  await recordAnswer(db, lesson, sessionExercise(lesson).answer, 345, 2100);
  const grammar = await beginSession(db, 3000);
  const error = await recordAnswer(db, grammar, 'wrong', 678, 3100);
  await recordAnswer(db, error.session, 'wrong again', 789, 3200);
  const sheet = await createWorksheet(
    db,
    {
      source: 'lesson',
      lessonId: 'hotel',
      kind: 'mixed',
      direction: 'mixed',
      count: 10,
    },
    4000,
  );
  const exposed = await viewAnswerKey(db, sheet.id, 4100);
  await submitPaperResults(
    db,
    sheet.id,
    exposed.revision,
    Object.fromEntries(
      sheet.questions.map((q, i) => [
        q.id,
        {
          grade: i === 0 ? 'wrong' : i === 1 ? 'minor' : 'correct',
          ...(i === 0 ? { writtenAnswer: 'paper mistake' } : {}),
        },
      ]),
    ),
    4200,
  );
  const draft = await createWorksheet(
    db,
    {
      source: 'lesson',
      lessonId: 'airport',
      kind: 'recall',
      direction: 'cs-en',
      count: 10,
    },
    5000,
  );
  await savePaperDraft(db, draft.id, draft.revision, {
    [draft.questions[0].id]: {
      grade: 'minor',
      writtenAnswer: 'unfinished draft',
    },
  });
  await db.settings.put({
    key: 'preferences',
    value: { sound: false, nested: ['Czech', null, 1] },
  });
  await markExported(db, new Date(6000).toISOString());
}
describe('versioned full learning backup', () => {
  it('exports every table, metadata, settings, raw evidence and editable content; omits unchanged built-in content', async () => {
    const db = database();
    await populate(db);
    const backup = await exportBackup(db, 7000);
    expect(backup.schemaVersion).toBe(1);
    expect(backup.dataVersion).toBe(2);
    expect(backup.appVersion).toBe('1.0.0');
    expect(backup.exportedAt).toBe(new Date(7000).toISOString());
    expect(Object.keys(backup.data).sort()).toEqual([...tableNames].sort());
    expect(backup.data.studyLessons).toHaveLength(0);
    expect(backup.builtInContent.tables.studyLessons).toHaveLength(20);
    expect(backup.data.topics).toEqual([
      { id: 'study', title: 'My edited topic', domain: 'academic' },
    ]);
    expect(backup.data.worksheets).toHaveLength(2);
    expect(backup.data.settings).toHaveLength(2);
    expect(
      backup.data.attempts.some(
        (a) => a.durationMs === 678 && a.answer === 'wrong',
      ),
    ).toBe(true);
    expect(parseBackup(JSON.stringify(backup))).toEqual(backup);
    const materialized = materializeBackup(backup);
    for (const name of tableNames)
      expect(materialized[name].map(canonical).sort(), name).toEqual(
        (await db.table(name).toArray()).map(canonical).sort(),
      );
  });
  it('transactionally replaces rather than merges, preserves paper/vocabulary/schedules/mastery and reloads with progress', async () => {
    const source = database();
    await populate(source);
    const backup = await exportBackup(source);
    const target = database();
    await savePersonalWord(target, 'remove me', 'smazat');
    await target.metadata.put({ key: 'extra', value: 'remove' });
    let safety: Backup | undefined;
    const verified = await restoreBackup(
      target,
      JSON.parse(JSON.stringify(backup)),
      {
        confirmed: true,
        onSafetyBackup: (b) => {
          safety = b;
        },
      },
    );
    expect(safety!.data.vocabulary[0].english).toBe('remove me');
    expect(validateBackup(safety)).toEqual(safety);
    expect(backupSummary(verified)).toEqual(backupSummary(backup));
    target.close();
    const reopened = database(target.name);
    const roundtrip = await exportBackup(reopened);
    expect(materializeBackup(roundtrip)).toEqual(materializeBackup(backup));
    expect(await reopened.metadata.get('extra')).toBeUndefined();
    expect((await reopened.lessonProgress.toArray())[0].items).not.toEqual({});
    expect(
      roundtrip.data.worksheets.find((s) => s.completedAt)?.results,
    ).toEqual(backup.data.worksheets.find((s) => s.completedAt)?.results);
    expect(
      roundtrip.data.worksheets.some(
        (s) => !s.completedAt && Object.keys(s.results).length === 1,
      ),
    ).toBe(true);
    // Safety backup is itself a valid reversible replacement.
    await restoreBackup(reopened, safety, confirmed);
    expect((await reopened.vocabulary.toArray()).map((w) => w.english)).toEqual(
      ['remove me'],
    );
  });
  it.each([
    'json',
    'future',
    'data-version',
    'missing-table',
    'duplicate',
    'invalid-review',
    'bad-result',
    'bad-reference',
    'unsafe-key',
  ])(
    'rejects %s before writes, leaving current data unchanged',
    async (kind) => {
      const db = database();
      await populate(db);
      const original = await exportBackup(db, 7000);
      const bad = structuredClone(original);
      if (kind === 'future') bad.schemaVersion = 99;
      if (kind === 'data-version') bad.dataVersion = 99;
      if (kind === 'missing-table')
        delete (bad.data as Partial<typeof bad.data>).attempts;
      if (kind === 'duplicate')
        bad.data.vocabulary.push(bad.data.vocabulary[0]);
      if (kind === 'invalid-review')
        Object.assign(bad.data.reviews[0], { dueAt: 'tomorrow' });
      if (kind === 'bad-result')
        bad.data.worksheets[0].results.missing = { grade: 'wrong' };
      if (kind === 'bad-reference')
        bad.data.sessions[0].queue[0].conceptId = 'missing';
      if (kind === 'unsafe-key')
        Object.defineProperty(bad.data.lessonProgress[0].items, '__proto__', {
          value: {},
          enumerable: true,
        });
      await expect(
        (async () =>
          restoreBackup(
            db,
            parseBackup(kind === 'json' ? 'not json' : JSON.stringify(bad)),
            confirmed,
          ))(),
      ).rejects.toThrow();
      expect(await exportBackup(db, 7000)).toEqual(original);
    },
  );
  it('requires confirmation even for valid backups', async () => {
    const db = database();
    await savePersonalWord(db, 'stay', 'zůstat');
    const before = await exportBackup(db, 7000);
    await expect(
      restoreBackup(db, before, { ...confirmed, confirmed: false }),
    ).rejects.toThrow('Confirm');
    expect(await exportBackup(db, 7000)).toEqual(before);
  });
  it('rolls back all clears and writes after a mid-restore failure, with a valid safety copy', async () => {
    const source = database();
    await populate(source);
    const backup = await exportBackup(source);
    const target = database();
    await savePersonalWord(target, 'keep me', 'ponechat');
    const before = await exportBackup(target, 7000);
    let safety: Backup | undefined;
    const hook = () => {
      throw new Error('Simulated storage failure');
    };
    target.worksheets.hook('creating', hook);
    await expect(
      restoreBackup(target, backup, {
        confirmed: true,
        onSafetyBackup: (b) => {
          safety = b;
        },
      }),
    ).rejects.toThrow('Simulated storage failure');
    target.worksheets.hook('creating').unsubscribe(hook);
    expect(await exportBackup(target, 7000)).toEqual(before);
    expect(materializeBackup(safety!)).toEqual(materializeBackup(before));
  });
  it('keeps edited built-in lessons and supports historical attempts whose worksheets were deleted', async () => {
    const source = database();
    await populate(source);
    await source.studyLessons.update('hotel', { title: 'My hotel lesson' });
    await source.worksheets.clear();
    const backup = await exportBackup(source);
    expect(backup.data.studyLessons[0].title).toBe('My hotel lesson');
    const target = database();
    await restoreBackup(target, backup, confirmed);
    expect((await target.studyLessons.get('hotel'))!.title).toBe(
      'My hotel lesson',
    );
    expect((await target.attempts.toArray()).some((a) => a.worksheetId)).toBe(
      true,
    );
  });
  it('aborts replacement when read-back verification detects altered stored values', async () => {
    const source = database();
    await populate(source);
    const backup = await exportBackup(source);
    const target = database();
    await savePersonalWord(target, 'untouched', 'beze změny');
    const before = await exportBackup(target, 7000);
    target.reviews.hook('creating', (_key, row) => {
      row.dueAt += 1;
    });
    await expect(restoreBackup(target, backup, confirmed)).rejects.toThrow(
      'could not be verified',
    );
    expect(await exportBackup(target, 7000)).toEqual(before);
  });
  it('exports quoted UTF-8 CSV for personal words without static vocabulary', async () => {
    const db = database();
    await seedVocabulary(db);
    await savePersonalWord(db, '=SUM(A1), "x"', 'český\nvýznam');
    const csv = personalVocabularyCsv(await exportBackup(db));
    expect(csv).toBe(
      '\uFEFFEnglish,Czech\r\n"\'=SUM(A1), ""x""","český\nvýznam"',
    );
  });
});
