# Implementation plan

## Quick Reflex Drills increment (2026-10-18)

The authorized drill expansion is documented in [QUICK_REFLEX_DRILLS.md](QUICK_REFLEX_DRILLS.md). A bundled registry feeds the shared session planner/result writer, a `/drills` hub derives per-module progress, and optional session identity fields preserve resumption/backups. It adds eleven areas while retaining original IN / ON / AT IDs and all existing learning history. No separate engine, schema table, backend or sync is introduced.

The subsequent [content-bank expansion](DRILL_CONTENT_BANK.md) supplies 1,363 explicitly authored prompts across the same twelve modules, editorial level/context tags, automated content validation and bounded per-drill recency stored transactionally in settings. Backups use data v4 while retaining old imports and vocabulary content baselines. The shared scheduler and correction/closing rules remain unchanged.

## Scope and repository findings

The initial repository contained only README.md and Git metadata. The complete specification is in PRODUCT_SPEC.md. The current learning application is stabilized as version 1.0.0: IN / ON / AT, lesson Vocabulary, printable practice, JSON backups, Weak Areas and twenty lessons, with GitHub Pages workflow, confirmed PWA updates and iPhone/WebKit release checks. See VOCABULARY_ARCHITECTURE.md, PAPER_PRACTICE.md, WEAK_AREAS.md, BACKUP_FORMAT.md and RELEASE.md. Public publication still requires committing/pushing the local source and enabling the Pages Actions source; local verification is distinct from a completed remote deployment. Broader learning features remain separate milestones.

The specification calls its complete V1 feature set the first usable vertical slice. Deliver it through the increments below; the first increment that exercises real learning is the review loop, not the complete V1 acceptance milestone.

## Proposed architecture

- **Platform:** React + Vite + TypeScript + Tailwind, npm, HashRouter and vite-plugin-pwa. A local-only installable PWA with Dexie persistence and GitHub Pages deployment; no account, backend or API key.
- **Domain (`src/domain/`):** typed learning entities; pure scheduler/mastery policies; session state machine; normalization and evaluation-provider interface. Inject time and queue inputs for deterministic tests. Distinguish first-attempt, hinted, correction reproduction and delayed recall evidence.
- **Application (`src/application/`):** use cases for starting/resuming sessions, submitting answers, recording worksheet grades, adding vocabulary, backup/restore and progress queries. One shared result-recording pipeline updates attempts, conceptual mistakes, review items and mastery atomically.
- **Persistence (`src/data/`):** Dexie schema, repositories, migrations, transactional writes and validated imports. Retain append-only attempt evidence and persisted session progress; derive useful statistics from history. Persist stable concept IDs rather than grouping mistakes by raw answer text.
- **Content (`src/content/`):** structured typed grammar modules, lessons, exercises, scenarios and seed mistakes. Reference stable content IDs and versions; snapshot prompts/expected answers in attempts and worksheets to preserve history when content changes.
- **UI (`src/features/`, `src/components/`):** home, quick review, vocabulary, lessons/drills, scenarios, mistakes, progress, settings/backups and printable worksheets. Keep pedagogical decisions out of components.
- **Evaluation:** deterministic accepted-answer checking for controlled work; reference-answer self-assessment for open work. Grades are correct, minor problem and wrong. Minor problems remain recorded learning errors and provide weaker evidence, never a clean success for mastery; make exact interval adjustments a documented scheduler policy. An evaluator interface leaves room for secure future AI evaluation.
- **Paper input:** Worksheet and WorksheetItem records have stable IDs, source references, prompt/answer snapshots and per-item completion state. Grade each item through the shared pipeline with paper/self-assessment metadata and nullable timing. Make submission idempotent. Separate exercise and answer-key print views use A4 CSS with no navigation. Generating or printing a worksheet does not complete reviews or move their due dates.

## Practical implementation order

1. **Foundation and domain contract.** Initialize the required stack, routing, tooling and test setup. Define the specified entities plus Session and Worksheet models; establish schema versioning, content IDs, grade semantics and a controllable clock. Create a minimal home and seed a small IN / ON / AT set.
2. **First working learning loop.** Build persisted quick review with typed responses, accepted-answer normalization, first-error hint, second-error correction/reproduction, delayed requeue, end-of-session retrieval, scheduling and mastery. Home shows due count and starts/resumes practice. Persist each transition. Test the learning policies and the full correction/reload journey before broadening features.
3. **Personal vocabulary and mistake notebook.** Add/edit vocabulary, automatically enqueue it, support several productive recall forms and conceptual mistake grouping. Include the six specified seed mistakes as ordinary content. Add JSON backup/validated restore and vocabulary CSV export early so real trial data is recoverable.
4. **Complete teaching content and scenarios.** Finish IN / ON / AT focused-to-mixed learning, basic narrative tenses, present perfect vs past simple, and lesson progression. Complete hotel check-in with productive/self-graded responses; provide the other scenario structures. All errors use the same result pipeline.
5. **Progress and session refinement.** Show due/learning/mastered counts, first-attempt accuracy, weak topics, recent mistakes, error categories and meaningful response trends. Link weaknesses to practice; ensure overdue items take priority over new work. Handle sessions with too few distinct prompts for 3–5-question delays explicitly: use available interleaving and retain future due review rather than claiming immediate retries satisfy spacing.
6. **Printable practice.** Generate stored worksheets from each requested source; support all listed exercise types, A4 exercise pages and a separate answer key. Add reopen-by-ID and item grading, optional incorrect written answers and duplicate-submission protection. Verify paper results affect shared history and scheduling, and inspect A4 browser-print output.
7. **V1 readiness.** Complete offline/install/update behavior, project-site-safe GitHub Pages configuration and deployment workflow, mobile/keyboard/accessibility checks and README. Run lint, unit tests, production build and required Playwright journey; verify reload, offline use and backup round-trip. Ship only after the complete V1 scope and printable addition work.

## Recommended first implementation

Implement steps 1–2 together as a narrow end-to-end learning loop using IN / ON / AT. It proves the central promise: an error becomes durable learning data, returns after intervening work, changes future scheduling, and survives reload. This establishes the shared foundation for vocabulary, scenarios and paper grading.

## Verification approach

Unit-test the scheduler, mastery, hint evidence, normalization, conceptual mistake aggregation and queue transitions independently of React. Use IndexedDB integration tests for transactional result submission, migrations, session resumption, backup round-trip and paper-result idempotency. Use React Testing Library for accessible correction/self-grade interactions. Playwright must cover wrong answer → correction → delayed encounter → correct retrieval → completion → reload with preserved progress. Exercise offline content after initial caching and validate project-site deployment paths. A4 print verification must check spacing, page breaks, handwriting room and separate answers.

## Unknowns and chosen defaults

No blocking unknowns or irreversible decisions are outstanding. Keep interval details, weak-topic weighting and hint/minor-error penalties explicit and changeable in policy modules. Paper timing is unknown, not zero; self-assessment remains distinguishable from automatic evaluation. Defer optional voice, optional reflex mode and AI evaluation until the core V1 is stable. Determine the deployment base path from repository metadata when implementing GitHub Actions, so the repository name is not a blocker.
