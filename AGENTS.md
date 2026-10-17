# Reflex English: rules for contributors

## Source of truth and current scope

- Read `docs/PRODUCT_SPEC.md` before implementation; it contains the complete product specification and printable-practice addition.
- `docs/IMPLEMENTATION_PLAN.md` describes the architecture and delivery order. IN / ON / AT, Vocabulary, printable practice, local backup/restore, Mistakes / Weak Areas and the twenty-lesson curriculum are authorized; implement later product milestones only when authorized. Read `docs/VOCABULARY_ARCHITECTURE.md`, `docs/PAPER_PRACTICE.md`, `docs/WEAK_AREAS.md` and `docs/BACKUP_FORMAT.md` for evidence and data-protection rules.
- Keep the temporary product name centrally configurable.

## Product and pedagogy

- Serve a Czech native speaker at B1–B2 progressing toward practical B2/C1. Prioritize accurate, automatic production through retrieval, spacing, corrective feedback, mastery and practical tasks.
- Prefer typed productive recall; multiple choice is an optional justified aid. English is the primary UI language; concise Czech explanations and Czech prompts are appropriate.
- Never introduce hearts, lives, punishments, coins, meaningless XP or forced streaks. Speed is informative, never punitive; accuracy comes first.
- Teach new material in focused practice before progressively mixing confusable material.
- First wrong answer: targeted hint without revealing the answer. Second wrong answer: answer plus brief explanation, followed by active reproduction. Requeue after five other completed prompts using a different sentence variant, then check again in closing recall; schedule an earlier future review. Repeated failure restarts this loop.
- Mixed review uses seeded constrained ordering in the session layer: balance target prepositions, avoid streaks longer than two and adjacent variants of the same concept where possible. Use brief focused pairs for acquisition. Due-item tiers and ready failed-item retries take precedence over cosmetic balancing. Persist ordering state and preserve old sessions when fields are absent.
- Showing or copying an answer does not establish mastery. Finish quick sessions only after the initial queue and successful delayed retrieval of failed items; handle short queues explicitly without pretending an immediate retry is delayed retrieval.
- Prioritize due reviews, recent mistakes and weak concepts before new material. A normal initial quick queue has roughly 10–15 prompts; corrective practice can extend it.
- States are `new`, `learning`, `reviewing`, `mastered`. First successful retrieval starts learning; success across sessions permits reviewing. Mastery requires at least four successful spaced retrievals over at least seven days, productive recall, and no errors in the last three reviews. Errors demote mastered items; hints weaken evidence. Mastered items continue returning.
- Start with transparent spacing: delayed same-session retrieval, then 1, 3, 7, 14, 30 and 60 days. Keep policy isolated and configurable.
- Preserve every attempt, timestamps, duration, assistance and evaluation provenance. Group conceptual mistakes while retaining individual history. Train concepts in varied contexts.
- Vocabulary mastery requires productive use. Personal vocabulary enters the learning queue automatically.
- V1 vocabulary is lesson-based: Home → choose lesson → Learn → Vocabulary Test → Use in Context → spaced review. Keep library management secondary. No semantic AI evaluation, automatic enrichment, metadata-heavy forms or seven-stage vocabulary workflow in the new V1 UI.
- Each vocabulary lesson owns title, topic, difficulty and about 15–25 practical words/phrases with Czech meanings and two examples. The original ten lessons remain intact; ten additional lessons progress from B2 to C1/C2 through careers, negotiation, engineering, measurement, presentations, complaints and precise everyday/professional language. High levels must mean natural precision, not obscure filler. New lessons have separate unseen authored context examples and Czech paper translations.
- Group weak vocabulary by normalized word/phrase across recall/context and paper/digital history; retain distinct underlying skill review IDs and source lessons. Grammar uses stable concept IDs, never arbitrary similarity between wrong strings. Derive weakness from existing evidence; do not persist a competing mastery model or treat unseen seed items as failures. Labels and transparent scoring prioritize practice, never award mastery. First-attempt accuracy excludes hints/copies but includes unassisted wrong paper responses even though they cannot earn mastery.
- Weak-area sessions must use `startSession`, `recordAnswer` and the shared result writer with five-prompt delayed varied retrieval, closing recall and normal scheduling. Include distinct filler concepts for short focused queues. Persist reference exposure before displaying correct examples/answers; protect all same-word skill variants and defer exposed targets behind five other prompts. Keep old snapshots as history and prefer current controlled variants for practice when available.
- Curriculum upgrades are additive and idempotent: seed only missing new IDs, preserve edited lessons/progress/active snapshots, and keep the first ten lessons as the immutable content-v1 backup resolver. Current backups use data/content v2; old v1 backups must remain restorable.
- Learn displays the list without awarding learning evidence. Vocabulary Test uses typed English→Czech, Czech→English or mixed recall. Use in Context uses authored sentence gaps and whole-sentence completion with explicit accepted answers. Do not claim literal comparison can judge arbitrary English. Preserve the existing five-prompt correction/retry and future-review loop.
- Keep recall and context-use progress separate. Passing requires both recall directions, context understanding and sentence production for every lesson entry, demonstrated without assistance; copying a correction cannot pass an item. A lesson practice pass is distinct from mastery over spaced days. Recognition alone cannot establish vocabulary mastery.
- Personal capture and editing require only English and Czech meaning. Existing personal words and history must survive migrations. Keep older tables/session snapshots for compatibility, but do not expose the previous enrichment/relationship-management workflow. New lesson progress updates must commit atomically with attempts and scheduling.
- Controlled answers use explicit accepted answers/patterns. Arbitrary English cannot be reliably graded by string comparison. Open production uses a reference and self-grading until a future evaluator exists.

## Architecture

- V1 is a local-first PWA: React, Vite, TypeScript, Tailwind CSS, Dexie/IndexedDB, React Router `HashRouter`, vite-plugin-pwa, npm, Vitest, React Testing Library, Playwright, ESLint and Prettier.
- No V1 backend, authentication or exposed/required OpenAI API key. Future AI evaluation must use a provider interface and secure backend.
- Keep scheduling, mastery, session queues and answer evaluation independent of React and testable without UI rendering. Use simple explicit services rather than unnecessary abstractions.
- Persist VocabularyEntry, Skill, Lesson, Exercise, ReviewItem, Attempt, Mistake, Scenario and UserSettings with stable IDs and versioned migrations. Preserve raw evidence, not only aggregate scores.
- Keep editable structured built-in content separate from UI and learning logic; user vocabulary and history belong in IndexedDB. Adding modules must not modify the scheduler.
- Treat answer submission as one consistent persistence operation across attempt, mistake, mastery and scheduling updates. Preserve and resume session state across reloads.
- Support JSON backup/restore and vocabulary CSV export. Validate import versions and data before applying changes; do not silently overwrite or destroy progress.
- Backup all persisted user data, including legacy vocabulary, raw history, mastery/reviews, session snapshots, worksheet drafts/results/exposure and settings. Only omit unchanged bundled content with versioned resolvable references. Adding a persisted table/field requires updating backup schemas and tests.
- Restore requires a validated preview, explicit replacement confirmation and a pre-replacement in-memory downloadable safety copy. Clear/write/verify every table within one transaction; any failure aborts it. Keep migrations and validation outside React. Retain old content baseline resolvers when content versions change. Refresh application state and other open tabs after a verified commit; never clear the restoring tab's safety copy with its own notification. No merging or cloud sync in V1.
- Use mobile-first adult styling, semantic HTML, labelled inputs, keyboard access, good contrast and large touch targets. Offline cached content and local data must remain usable. Voice is optional progressive enhancement; text always works.
- GitHub Pages must support project-site base paths and static hash routing. Deploy through GitHub Actions.
- V1 stabilization targets `JindrichProchazka/reflex-english`, version 1.0.0 and production base `/reflex-english/`. Keep dev at `/`, production/preview at the project base, HashRouter, manifest ID/scope/start URL and service worker scoped consistently. No custom runtime server.
- Keep release work limited to stabilization: no new learning features, AI, accounts, backend or sync. Use the Pages artifact/deploy Actions flow, require lint/unit/build/browser checks before publishing, and deploy main only. Do not claim public deployment happened merely because a local workflow exists.
- PWA updates wait for explicit learner confirmation. Preserve IndexedDB, wait for in-flight writes before activation/reload, and handle controller changes even if a tab installed its first worker earlier in the same visit. Asset-cache cleanup is separate from learning data. Check for updates on return/online/hourly and provide a manual action.
- iPhone checks must include WebKit at 375/390/430 px, safe areas, 16px form text, large touch targets, keyboard viewport changes, long-word wrapping and offline reopening. Keep print CSS separate. Never describe emulation as a physical-iPhone installation test; document the remaining on-device checklist in `docs/RELEASE.md`.

## Printable practice

- Paper is an optional input method for the same learning system. Generate worksheets from due reviews, recent mistakes, grammar topics, vocabulary, lessons or weak areas.
- Persist a Worksheet with a stable internal ID and immutable item snapshots so later results refer to the original prompts and answer key.
- Use printer-friendly A4 browser print / Save as PDF in V1; no PDF-generation backend. Hide navigation and unnecessary UI. Put answers in a separate answer key, never next to exercises.
- Support translation, preposition completion, tense transformation, sentence repair, vocabulary recall, cloze and short free production.
- Record each paper item as Correct, Minor mistake or Wrong, with optional written answer for incorrect items. Route results through the shared Attempt/Mistake/mastery/review pipeline, retaining paper origin and self-assessment provenance.
- Do not invent paper response duration or count answer-key exposure as unassisted retrieval. Avoid duplicate submissions; unanswered worksheet items are not completed attempts.
- V1 worksheet types are recall (both directions/mixed), gaps, phrase recall, Czech→English sentence translation, sentence repair and mixed lesson tests. Generate from lessons, selected lesson words, due reviews, recent mistakes or weak items. Cap focused sheets at available unique questions instead of duplicating to fill the requested 10/20/40 length.
- Persist answer-key exposure before rendering answers, on every opening. Key-exposed paper results are assisted. Recent key exposure also blocks immediate clean credit in digital practice until five intervening unassisted prompts or a later-day retrieval. Paper corrections start digital review after five other prompts.
- Digital and paper submissions must call the same transactional result writer. Paper grades include optional transcription, nullable duration and paper/self-assessment provenance. A conceptual failure in a paper batch blocks stronger credit from other correct questions on that concept in the same batch. Minor problems receive weaker evidence and an earlier interval; wrong answers get near-term review.
- Save drafts without attempts, submit complete batches atomically and idempotently, reject stale writes after key exposure, and require confirmation before deleting a worksheet. Deletion retains attempt/mistake history. Paper completion is visible per lesson but is never mandatory to pass.

## Content and verification

- First full grammar module: IN / ON / AT for time and place, with typed focused and mixed practice. Follow with past narrative tenses and present perfect vs past simple.
- Complete hotel check-in first; add starter structures for food/coffee, travel and teacher/university interactions. Seed the six personal-error examples from the specification as ordinary content.
- Implement the entire stated V1 scope incrementally; a scaffold is not the usable product.
- Test wrong-answer requeues, scheduling, mastery promotion/demotion, hint-assisted answers, persistence and normalization. Include the required Playwright error/correction/delayed-retry/completion/reload journey.
- For implementation completion run lint, unit tests, production build and relevant Playwright tests, fixing failures. Document development, tests, deployment, backup/import and learning philosophy in README.
