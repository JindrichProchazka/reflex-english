import type { LearningDatabase } from '../data/database';
import type { Table } from 'dexie';
import { initialStudyLessons, studyLessons } from '../content/study-lessons';
import { lessons, skills, topics, vocabularySets } from '../content/vocabulary';
import { concepts } from '../content/prepositions';
import { version as appVersion } from '../../package.json';
import {
  BACKUP_SCHEMA_VERSION,
  DATA_VERSION,
  migrateBackup,
} from './backup-migrations';
import {
  array,
  enumeration,
  invalid,
  object,
  rowSchemas,
  string,
} from './backup-validation';

export const tableNames = [
  'reviews',
  'attempts',
  'mistakes',
  'sessions',
  'vocabulary',
  'vocabularySets',
  'lessons',
  'topics',
  'skills',
  'vocabularyLinks',
  'metadata',
  'studyLessons',
  'lessonProgress',
  'worksheets',
  'settings',
] as const;
export type TableName = (typeof tableNames)[number];
export type Snapshot = {
  [K in TableName]: LearningDatabase[K] extends Table<infer Row>
    ? Row[]
    : never;
};
// Version these immutable baselines when shipping a content change. Retain old
// baseline resolvers so future applications can read earlier backup references.
const baseline = { studyLessons, lessons, topics, skills, vocabularySets };
const baselines = {
  1: { ...baseline, studyLessons: initialStudyLessons },
  2: baseline,
};
type ContentTable = keyof typeof baseline;
const contentTables = Object.keys(baseline) as ContentTable[];
export interface Backup {
  format: 'reflex-english-backup';
  schemaVersion: number;
  dataVersion: number;
  appVersion: string;
  exportedAt: string;
  builtInContent: { version: 1 | 2; tables: Record<ContentTable, string[]> };
  data: Snapshot;
}
// Object property order is immaterial; IDs and all field values are preserved.
export function canonical(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(canonical).join(',')}]`;
  if (value && typeof value === 'object')
    return `{${Object.entries(value)
      .filter(([, v]) => v !== undefined)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => `${JSON.stringify(k)}:${canonical(v)}`)
      .join(',')}}`;
  return JSON.stringify(value);
}
export function makeBackup(snapshot: Snapshot, now = Date.now()): Backup {
  const data = structuredClone(snapshot);
  const tables = {} as Record<ContentTable, string[]>;
  for (const name of contentTables) {
    tables[name] = [];
    const rows = data[name] as { id: string }[];
    const retained = rows.filter((row) => {
      const bundled = baseline[name].find((b) => b.id === row.id);
      if (!bundled || canonical(bundled) !== canonical(row)) return true;
      tables[name].push(row.id);
      return false;
    });
    Object.assign(data, { [name]: retained });
  }
  return {
    format: 'reflex-english-backup',
    schemaVersion: BACKUP_SCHEMA_VERSION,
    dataVersion: DATA_VERSION,
    appVersion,
    exportedAt: new Date(now).toISOString(),
    builtInContent: { version: 2, tables },
    data,
  };
}
export function materializeBackup(backup: Backup): Snapshot {
  const data = structuredClone(backup.data);
  for (const name of contentTables) {
    const rows = backup.builtInContent.tables[name].map((id) => {
      const row = baselines[backup.builtInContent.version][name].find(
        (b) => b.id === id,
      );
      if (!row) invalid(`unknown built-in ${name} reference`);
      return structuredClone(row);
    });
    Object.assign(data, { [name]: [...data[name], ...rows] });
  }
  return data;
}
const schema = object({
  format: enumeration('reflex-english-backup'),
  schemaVersion: enumeration(BACKUP_SCHEMA_VERSION),
  dataVersion: enumeration(DATA_VERSION),
  appVersion: string,
  exportedAt: string,
  builtInContent: object({
    version: enumeration(1, 2),
    tables: object(
      Object.fromEntries(contentTables.map((k) => [k, array(string)])),
    ),
  }),
  data: object(
    Object.fromEntries(tableNames.map((k) => [k, array(rowSchemas[k])])),
  ),
});
function unique(values: string[], path: string) {
  if (values.some((v) => !v.trim()) || new Set(values).size !== values.length)
    invalid(`${path} (empty or duplicate ID)`);
}
export function validateBackup(input: unknown): Backup {
  const migrated = migrateBackup(input);
  schema(migrated, 'document');
  const backup = migrated as Backup;
  if (!Number.isFinite(Date.parse(backup.exportedAt))) invalid('exportedAt');
  const data = materializeBackup(backup);
  for (const name of tableNames) {
    const key = ['reviews', 'mistakes'].includes(name)
      ? 'conceptId'
      : name === 'lessonProgress'
        ? 'lessonId'
        : ['metadata', 'settings'].includes(name)
          ? 'key'
          : 'id';
    unique(
      (data[name] as unknown as Record<string, string>[]).map(
        (row) => row[key],
      ),
      name,
    );
  }
  for (const lesson of data.studyLessons)
    unique(
      lesson.words.map((w) => w.id),
      `lesson ${lesson.id} words`,
    );
  for (const progress of data.lessonProgress) {
    const lesson = data.studyLessons.find((l) => l.id === progress.lessonId);
    if (
      !lesson ||
      Object.keys(progress.items).some(
        (id) => !lesson.words.some((w) => w.id === id),
      )
    )
      invalid('lesson progress references');
  }
  for (const sheet of data.worksheets) {
    unique(
      sheet.questions.map((q) => q.id),
      'worksheet questions',
    );
    if (
      !sheet.questions.length ||
      Object.keys(sheet.results).some(
        (id) => !sheet.questions.some((q) => q.id === id),
      )
    )
      invalid('worksheet results');
    if (
      sheet.completedAt !== undefined &&
      sheet.questions.some((q) => !sheet.results[q.id])
    )
      invalid('incomplete submitted worksheet');
  }
  for (const session of data.sessions) {
    if (
      session.module === 'drill' &&
      (!session.drillId || !session.drillSize || !session.content?.length)
    )
      invalid('drill session identity/content');
    const content = session.content ?? concepts;
    unique(
      content.map((c) => c.id),
      'session concepts',
    );
    unique(
      content.flatMap((c) => c.exercises.map((e) => e.id)),
      'session exercises',
    );
    if (
      [...session.queue, ...(session.current ? [session.current] : [])].some(
        (t) => !content.some((c) => c.id === t.conceptId),
      )
    )
      invalid('session task references');
    if (
      session.current &&
      !content.some(
        (c) =>
          c.id === session.current!.conceptId &&
          c.exercises.some((e) => e.id === session.exerciseId),
      )
    )
      invalid('session current exercise');
  }
  // Deleted worksheets legitimately leave historical attempts and snapshots.
  // Never require those history-only foreign keys to resolve to a live worksheet.
  const attemptIds = new Set(data.attempts.map((a) => a.id));
  for (const mistake of data.mistakes) {
    if (mistake.attemptIds.some((id) => !attemptIds.has(id)))
      invalid('mistake attempt references');
  }
  const seed = data.metadata.some(
    (m) => m.key === 'study-lessons-v1' || m.key === 'study-lessons-v2',
  );
  const seededLessons = data.metadata.some((m) => m.key === 'study-lessons-v2')
    ? studyLessons
    : initialStudyLessons;
  if (
    seed &&
    seededLessons.some((l) => !data.studyLessons.some((s) => s.id === l.id))
  )
    invalid('incomplete seeded lesson content');
  return structuredClone(backup);
}
export function parseBackup(text: string): Backup {
  let input: unknown;
  try {
    input = JSON.parse(text);
  } catch {
    throw new Error('The file is not valid JSON.');
  }
  return validateBackup(input);
}
export function backupSummary(backup: Backup) {
  const data = materializeBackup(backup);
  return {
    attempts: data.attempts.length,
    reviews: data.reviews.length,
    mistakes: data.mistakes.length,
    sessions: data.sessions.length,
    vocabulary: data.vocabulary.length,
    lessonProgress: data.lessonProgress.length,
    worksheets: data.worksheets.length,
    worksheetResults: data.worksheets.reduce(
      (n, w) => n + Object.keys(w.results).length,
      0,
    ),
    settings: data.settings.length,
  };
}
