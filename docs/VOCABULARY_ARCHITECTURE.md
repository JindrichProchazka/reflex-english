# Vocabulary architecture — simplified V1

This design supersedes the earlier metadata-heavy library and seven-stage UI. The core product is lesson-based vocabulary practice. No semantic AI evaluation or automatic enrichment is implemented.

## Simple content and flow

`StudyLesson` owns an ID, title, topic, level, description and 15–25 `LessonWord` records. Each word holds English, Czech, accepted literal equivalents and two authored Learn examples. Twenty lessons supply 300 expressions and 600 Learn examples. The ten advanced B2–C1/C2 lessons additionally supply two unseen `contextExamples` per entry and a Czech `paperTranslation`. Context generation uses those unseen frames when present, while the original lessons retain their existing examples. Content lives in `src/content/study-lessons.ts` and `advanced-lessons.ts`; no backend, joins or enrichment job is needed to load a lesson.

Home → choose lesson → Learn → Vocabulary Test → Use in Context → future mistake review.

- Learn shows English/Czech and optional examples. Merely viewing the list awards no progress.
- Vocabulary Test supports typed English→Czech, Czech→English and mixed direction. Mixed tests alternate direction on delayed encounters.
- Use in Context alternates a missing phrase and a whole sentence completed from a different given frame. The Czech meaning and the English situation constrain the task. This demonstrates comprehension and controlled sentence use without pretending that string matching can judge arbitrary English.
- Personal words require only English and Czech. Existing metadata, if any, is retained internally but is not part of the V1 capture/edit experience.
- Printable Practice is the fourth lesson mode: persistent A4 worksheets, a separate key and manual grades use the same learning-result writer. Completed paper practice is visible but optional. See PAPER_PRACTICE.md for exposure and scheduling rules.

## Shared learning pipeline

The content adapter emits ordinary `Concept`/`Exercise` records. Existing session ordering, first-error hint, second-error correction and reproduction, five-prompt delayed retrieval, closing recall and spaced scheduler are reused. Failed items continue to take precedence over cosmetic ordering. Each lesson/session/mode has its own resumable snapshot.

Recall and context have separate review IDs, so practicing one cannot move the other's future date. Recall mastery also requires productive retrieval; recognition alone cannot qualify. Personal-word review IDs stay compatible with earlier saves. Small personal sets use existing grammar concepts as intervening retrieval when necessary.

The literal lesson evaluator normalizes case, whitespace and final punctuation and accepts only the authored alternatives. Czech diacritics and actual word order/content still matter. No arbitrary translation or semantic judgment is claimed.

## Separate progress and mastery

`LessonProgress` stores per-entry flags: English→Czech, Czech→English, context understanding and sentence production. Incorrect responses invalidate the corresponding flag. Only unassisted success can establish it; a copied or hinted correction cannot. Every flag update commits in the same IndexedDB transaction as Attempt, Mistake, ReviewItem and Session.

A lesson practice pass requires all four flags for every word. The UI separately displays recall and context-use progress, including the two component skills under each. Passing practice is distinct from long-term mastery, which still requires spaced successes across days and future reviews. There is no XP or reward system.

## Persistence and compatibility

IndexedDB version 3 added `studyLessons` and `lessonProgress`; the database is now version 5 after worksheet/settings additions. No new table is needed for advanced content or derived weakness. Curriculum marker `study-lessons-v2` adds only missing advanced lesson IDs in the same seed transaction, preserving existing edits, progress and snapshots. Legacy tables/functions remain readable. Backup data/content versions are now 2; old content-v1 references resolve against `initialStudyLessons`, never the expanded list. New personal capture still uses two fields.

## Verification

Test all lesson sizes and example targets, both recall directions, mixed tests, explicit Czech equivalents, literal sentence completion, five-prompt varied retry, closing recall, separate progress/passing, atomic writes, v2→v3 retention and two-field personal capture. Browser tests cover the full lesson path, reload/offline progress, direct recall directions, personal capture/editing and unchanged grammar practice on desktop and mobile.
