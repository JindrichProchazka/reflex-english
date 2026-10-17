import type { LearningDatabase } from '../data/database';
import {
  canonical,
  makeBackup,
  materializeBackup,
  tableNames,
  validateBackup,
  type Backup,
  type Snapshot,
} from '../domain/backup';

async function snapshot(db: LearningDatabase): Promise<Snapshot> {
  return Object.fromEntries(
    await Promise.all(
      tableNames.map(async (name) => [
        name,
        await db.table(name).orderBy(':id').toArray(),
      ]),
    ),
  ) as Snapshot;
}
function tables(db: LearningDatabase) {
  // Fail closed when a future database table has not been added to the format.
  if (
    db.tables.length !== tableNames.length ||
    db.tables.some(
      (t) => !tableNames.includes(t.name as (typeof tableNames)[number]),
    )
  )
    throw new Error('The backup format must be updated for this database.');
  return tableNames.map((name) => db.table(name));
}
export async function exportBackup(db: LearningDatabase, now = Date.now()) {
  await db.open();
  return db.transaction('r', tables(db), async () =>
    validateBackup(makeBackup(await snapshot(db), now)),
  );
}
export async function markExported(db: LearningDatabase, exportedAt: string) {
  await db.settings.put({ key: 'lastBackupExportAt', value: exportedAt });
}
export async function restoreBackup(
  db: LearningDatabase,
  input: unknown,
  options: { confirmed: boolean; onSafetyBackup: (backup: Backup) => void },
) {
  // Validate again at the service boundary, even if the preview was validated.
  const backup = validateBackup(input);
  if (!options.confirmed)
    throw new Error('Confirm replacement before restoring.');
  const restored = materializeBackup(backup);
  // Freeze expected VALUES before passing objects through database hooks. A
  // hook can mutate an input row; comparing it with itself would miss corruption.
  const signature = (rows: unknown[]) => canonical(rows.map(canonical).sort());
  const expected = Object.fromEntries(
    tableNames.map((name) => [name, signature(restored[name])]),
  );
  await db.open();
  return db.transaction('rw', tables(db), async () => {
    const previous = await snapshot(db);
    const safety = validateBackup(makeBackup(previous));
    options.onSafetyBackup(safety);
    for (const name of tableNames) {
      await db.table(name).clear();
      await db.table(name).bulkPut(restored[name]);
    }
    const actual = await snapshot(db);
    for (const name of tableNames) {
      if (signature(actual[name]) !== expected[name])
        throw new Error(
          'Restored data could not be verified. Replacement was rolled back.',
        );
    }
    return validateBackup(makeBackup(actual));
  });
}
export async function localDataStatus(db: LearningDatabase) {
  const backup = await exportBackup(db);
  return {
    backup,
    lastExport: backup.data.settings.find((s) => s.key === 'lastBackupExportAt')
      ?.value,
  };
}
export function personalVocabularyCsv(backup: Backup) {
  const quote = (value: string) =>
    `"${(/^[=+@\-\t\r]/.test(value) ? "'" : '') + value.replaceAll('"', '""')}"`;
  return (
    '\uFEFFEnglish,Czech\r\n' +
    backup.data.vocabulary
      .filter((v) => v.origin !== 'curriculum')
      .map((v) => [v.english, v.meaning].map(quote).join(','))
      .join('\r\n')
  );
}
