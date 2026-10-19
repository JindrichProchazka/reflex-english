# Local JSON backup, envelope format 1 / data version 4

The Data / Backup page protects all local learning data. JSON is authoritative; personal-word CSV is a convenience export only. No account, backend, encryption, merging or cloud synchronization is involved.

```json
{
  "format": "reflex-english-backup",
  "schemaVersion": 1,
  "dataVersion": 4,
  "appVersion": "1.0.0",
  "exportedAt": "2026-10-17T12:00:00.000Z",
  "builtInContent": {
    "version": 2,
    "tables": {
      "studyLessons": [], "lessons": [], "topics": [],
      "skills": [], "vocabularySets": []
    }
  },
  "data": {
    "reviews": [], "attempts": [], "mistakes": [], "sessions": [],
    "vocabulary": [], "vocabularySets": [], "lessons": [], "topics": [],
    "skills": [], "vocabularyLinks": [], "metadata": [], "studyLessons": [],
    "lessonProgress": [], "worksheets": [], "settings": []
  }
}
```

`schemaVersion` versions the file envelope, `dataVersion` versions record schemas, and `builtInContent.version` identifies immutable bundled content. These are independent of Dexie's database version (currently 5). `appVersion` is informational, read from package.json. The timestamp uses UTC ISO 8601. Data is pretty-printed with two spaces.

All fifteen tables are included in a consistent read transaction. Raw attempts retain timing, answers, assistance and provenance; review records include mastery and future due dates. Sessions include active correction/retry state and content snapshots. Worksheets include immutable questions, draft/transcribed grades, completion, revisions and answer-key exposure. Settings use key/JSON-value records. Seed markers and old vocabulary/relationship records are preserved.

For five content tables, an unchanged built-in row is represented by its ID in `builtInContent.tables`; changed/custom rows are in `data`. Restore resolves the versioned references before validating IDs and writing. All vocabulary entries remain embedded because they are mutable and can be referenced by legacy sets, sessions and reviews. Grammar content is bundled, while exercise/session/worksheet snapshots remain embedded wherever needed for historical integrity. Deleting a worksheet intentionally leaves historical attempts; these history-only references are valid.

`src/domain/backup-validation.ts` defines strict recursive record schemas. `backup.ts` validates the envelope, unique IDs, lesson skills, current session tasks/exercises, worksheet results/completeness and mistake history. Unsupported fields/versions, malformed records and unsafe object keys fail before database access. The file picker accepts up to 50 MB. Parse/validation errors never enable replacement. Cancelling performs no writes.

`src/domain/backup-migrations.ts` owns format upgrades. Data v1→v2 is an additive pure migration: existing rows are retained and versioned as v2, which permits optional `contextExamples`, `paperTranslation`, focused-session `weakAreaIds` and advanced level labels. Content v1 continues resolving the unchanged original ten lessons; content v2 resolves all twenty. A restored old curriculum receives the missing ten lessons on the next library/Weak Areas load, preserving old edits/progress. There are no invented pre-v1 files. Future migrations must retain old baseline resolvers. The application export fails closed if a new database table has not been added to the format.

Data v2→v3 additively permits `module: "drill"`, `drillId`, `drillSize` and article/tense/grammar mistake categories. Old rows are unchanged. Active drill sessions embed their entire content pool so correction/retry/order state remains resumable after restore. New static drill content does not add a database table or alter the vocabulary content-v1/v2 baselines. Both old data versions remain importable; older app versions reject data-v3 exports rather than partially restoring them.

Data v3→v4 additively permits optional exercise `level`/`topic` and session `promptHistory` (per-module concept ownership and at most 96 recent IDs). Settings also carry `drill-history:<module-id>` records with `{version: 1, promptIds: [...]}` bounded to 96 on application writes. They are included automatically in the same snapshot/restore transaction as every other setting. All old data versions remain importable. Restoring v1/v2/v3 progress bootstraps missing recency from existing typed attempts without changing raw evidence or old prompt snapshots. Newer data-v4 exports require an app supporting v4.

`src/application/backup.ts` revalidates at the restore boundary, requires confirmation and performs these steps in one read/write transaction covering every table:

1. Read the latest current rows; prepare a validated, downloadable safety backup in memory.
2. Clear every table and write the fully materialized backup rows.
3. Read all rows back, comparing every value (independent of property/row ordering) with the expected data; validate the result again.
4. Commit only after verification. An exception, quota failure or mismatch aborts every clear and write.

The UI receives the verified state only after commit, resets its preview and shows success. Pages load from IndexedDB on mount. Other open tabs receive a document-origin-tagged BroadcastChannel notification and remount their data view; the restoring tab retains its success and safety copy. Notification failure cannot be reported as restore failure after a successful commit.

The safety copy is temporary: leaving the page, reloading or closing the tab loses it unless downloaded. It is an ordinary valid backup and can reverse the replacement through the same confirmation flow. Restore retains the backed-up settings, including the last export marker as it existed at snapshot time. Downloads are prepared by the browser; the application cannot prove a file was saved or retained. Backups can contain private vocabulary and raw answers and are plain JSON.

Tests cover every table, unchanged-content omission and edited-content retention, strict version/schema rejection, no-write cancellation/validation, replacement without merging, safety-copy reversal, transactional rollback and verification mismatch, worksheet drafts/results/exposure, personal vocabulary/CSV, active corrections, raw timing, mistakes/mastery/dates and database reopen. Desktop/mobile Playwright covers learning → personal word → graded worksheet → download → add/delete → preview → confirm → safety download → reload, compares the restored records and checks another open tab refreshes.

The 2,560-prompt daily-use expansion adds no persisted fields, tables or schema versions. The bounded 96-ID record is unchanged; only the selection preference increases from 30 to 50 intervening prompts. New sessions snapshot the expanded pool; restored old v4 snapshots retain their original smaller pool and IDs. The original 1,363 prompt records are retained unchanged. Metadata includes an additional editorial `advanced` topic string, already supported by the v4 string schema.
