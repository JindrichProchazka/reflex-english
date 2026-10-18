export const BACKUP_SCHEMA_VERSION = 1;
export const DATA_VERSION = 4;

// Each future migration must return a new document without touching IndexedDB.
// Do not treat an unversioned/foreign JSON file as an older Reflex backup.
const migrations: Record<
  number,
  (document: Record<string, unknown>) => Record<string, unknown>
> = {};
export function migrateBackup(input: unknown): unknown {
  if (!input || typeof input !== 'object' || Array.isArray(input))
    throw new Error('Choose a Reflex English JSON backup.');
  let document = input as Record<string, unknown>;
  const version = document.schemaVersion;
  if (
    typeof version !== 'number' ||
    !Number.isSafeInteger(version) ||
    version < 1
  )
    throw new Error('The backup has no supported schema version.');
  if (version > BACKUP_SCHEMA_VERSION)
    throw new Error('This backup needs a newer version of the application.');
  while (document.schemaVersion !== BACKUP_SCHEMA_VERSION) {
    const migrate = migrations[document.schemaVersion as number];
    if (!migrate)
      throw new Error(
        'This older backup cannot be migrated by this application.',
      );
    document = migrate(document);
  }
  // Data v2 adds optional unseen contexts, advanced CEFR labels and focused
  // session IDs. Existing rows require no rewriting; retain old content refs.
  if (document.dataVersion === 1) document = { ...document, dataVersion: 2 };
  // Data v3 adds optional drill-session identity and grammar mistake categories.
  // Bundled vocabulary baselines and all historical rows stay unchanged.
  if (document.dataVersion === 2) document = { ...document, dataVersion: 3 };
  // Data v4 adds optional prompt recency snapshots and editorial drill metadata.
  // Bounded per-drill history lives in the already backed-up settings table.
  if (document.dataVersion === 3) document = { ...document, dataVersion: 4 };
  return document;
}
