# Reflex English

A local-first English practice notebook for a Czech speaker working toward practical B2/C1. V1 (`1.0.0`) includes Quick Reflex Drills, twenty vocabulary lessons, delayed retrieval, Weak Areas, printable practice and JSON backups. It runs as a static GitHub Pages PWA with no account, backend or cloud synchronization.

Production URL: **https://JindrichProchazka.github.io/reflex-english/**

## Run locally

Use Node.js 24 LTS with npm (`.nvmrc` records the major version; minimum supported Node is 22.12).

```sh
npm install
npm run dev
```

Open the URL Vite prints (normally http://localhost:5173). For a phone on the same network, use the printed network URL and allow the development server through your firewall. Local-network HTTP supports practice, but installation/service-worker offline support requires HTTPS or localhost. Different origins, ports, browsers and devices have independent learning databases.

In the Codex environment used to implement this slice, npm was absent from PATH. A downloaded, ignored npm runtime is available at `.tools/package/bin/npm-cli.js`: replace `npm` with `node .tools/package/bin/npm-cli.js` if needed in that environment. The committed lockfile supports normal `npm ci` elsewhere.

## Practice

From Home, open **Quick Reflex Drills**, choose an area, then Start Quick, Start Normal or Due Review. The hub includes the original IN / ON / AT drill and eleven other areas, with **143 concepts and 2,560 authored sentence variants**. Cards show mastery counts, due concepts, first-attempt accuracy and recent mistakes. All modules share the existing correction, scheduling, Weak Areas, backup and offline systems. See [Quick Reflex Drills](docs/QUICK_REFLEX_DRILLS.md) and the [expanded content bank](docs/DRILL_CONTENT_BANK.md) for counts, contexts and session rules.

New content begins in short focused pairs. Mixed review uses seeded constrained ordering: balance targets, avoid more than two identical targets and adjacent variants of one concept when alternatives exist. Due items stay ahead of optional/new practice; ready failed-item retries override cosmetic constraints. Seed and ordering state are saved with the session so reload does not reshuffle it. An optional IN / ON / AT guide is available on Home. Bounded grammar drills use large answer buttons that submit immediately and mark the selected incorrect choice. Verb-form drills, broad Verb + Preposition Patterns, vocabulary and sentence production remain typed, as does correction reproduction. Articles show a dash button for no article. Authored grammatical alternatives remain accepted; case, whitespace, apostrophes and final punctuation are normalized. Controlled checking cannot grade arbitrary free English.

- First error: a targeted hint, without the correct answer.
- Second error: the answer and explanation; the learner must type it again.
- After resolving an error, the concept returns after five intervening prompts and again in closing recall. An error on a retry repeats this loop. If a late error leaves too few prompts, alternate concepts provide the spacing.
- Even initially correct concepts get a delayed same-session recall. Quick starts with five concepts (about 10–11 prompts), Normal with ten (about 20). Errors, reference exposure and closing recall can extend sessions. Due Review uses only previously practised due concepts and needs six distinct due concepts to guarantee five intervening prompts; use Quick for a smaller due pool. Leaving saves the current place after the last submitted answer. Legacy IN / ON / AT sessions remain resumable with their original size/order.
- The shared selector prefers a different sentence outside the last 50 prompts, with bounded per-drill history saved in IndexedDB before each new presentation. History survives page closure and backup/restore. Due priority and failed retries can override the cooldown; small/legacy pools use the least-recent different variant. Reopening an unfinished session resumes its existing question.
- Corrections return in 10 minutes. Clean spaced successes progress through 1, 3, 7, 14, 30 and 60 days. The same session cannot advance an interval twice; rapid restarts within 24 hours do not manufacture spaced evidence. A failure resets the interval progression and blocks strong credit for that session. Hint-assisted recall is weaker and never earns clean mastery evidence.
- First successful recall starts learning. Distinct spaced sessions permit reviewing. Mastery needs four clean spaced successes spanning seven days, three recent error-free reviews and varied productive contexts. A mastered error demotes to reviewing. Mastered concepts still return.

Response duration is stored for each submission without a speed penalty. It measures elapsed time while the current page is open; reload starts a new timer, and time away from a still-open page can be included. Accuracy takes priority.

## Vocabulary

Choose a lesson from home. Twenty lessons contain 300 useful words and phrases, progressing from B1 through C1/C2. The original ten cover hotel/reception, teacher, study department, airport, train/bus, factory, project work, troubleshooting, restaurant and everyday problems. Ten more cover careers, negotiation, advanced troubleshooting, automation, manufacturing, measurement, presentations, complaints, advanced everyday language and academic/professional discussion. Each entry has a Czech meaning, explicit accepted equivalents and two Learn examples. New lessons also have two separate unseen context sentences and an authored Czech printable translation. High levels use precise practical English rather than obscure vocabulary.

1. **Learn:** review English, Czech and optional examples in a clear list.
2. **Vocabulary Test:** type English→Czech, Czech→English or mixed answers. Explicit Czech equivalents are accepted.
3. **Use in Context:** type the missing word/phrase for gap-fill (a completed frame is also accepted). Separate sentence-production exercises explicitly request the whole sentence and reject phrase-only responses.
4. **Printable Practice:** generate a saved A4 worksheet, write by hand and record the results later.

Recall and context progress are separate. To pass lesson practice, every entry needs unassisted success in both recall directions, gap completion and sentence production. Reading Learn or copying corrections does not pass anything. A lesson pass is not long-term mastery: future spaced reviews still apply. Incorrect items receive a first hint, a second-error correction/reproduction, a retry after five other prompts and closing recall. Repeat sessions prioritize due items. Sessions and their authored content snapshots survive reload.

Personal words need only English and Czech meaning; they join the same review system. A small personal set uses IN / ON / AT questions as intervening practice when needed to keep the five-question delay real. Existing personal entries and earlier learning history are preserved. The new UI has no metadata management, automatic enrichment or AI evaluation. Older saved vocabulary sessions remain resumable.

Checking is literal against authored accepted answers, with case, whitespace and final punctuation normalized. Context production intentionally uses a given sentence frame; it does not claim to evaluate arbitrary English semantically. See `docs/VOCABULARY_ARCHITECTURE.md` for the simple V1 model and compatibility boundary.

## Printable practice

Open Printable Practice on any lesson, or use the printable-practice link on home. Choose a lesson, selected lesson words, due reviews, recent mistakes across vocabulary/grammar, or weak items. Choose recall, context gaps, phrase recall, sentence translation, sentence repair or a mixed test, with 10/20/up to 40 questions. A focused source with fewer unique items produces a shorter sheet rather than repeating questions.

The worksheet preview is an A4 exercise-only document with numbering, handwriting lines, optional name/date fields, lesson title and a persistent worksheet ID. Use Print worksheet / Save as PDF. The separate Answer key route can be printed independently. Browser print headers/footers can be turned off in the print dialog. Translation keys are reference answers; other natural wording can be valid.

Every sheet stays in Worksheet history with its contents, drafts, dates, status and result summary. Grade Correct / Minor problem / Wrong; correct answers need no transcription. Grades save as selected; Save draft also preserves optional typed notes. Submit after grading all items. Duplicate submission cannot add attempts twice. Deletion asks for confirmation and removes only the worksheet display, keeping learning attempts and mistakes.

Paper attempts use the same transactional result writer, scheduler, mastery, mistake notebook and lesson progress as typed answers. Unknown paper response time is stored as null, not a fabricated duration. Wrong items return in 10 minutes; minor problems use a weaker six-hour interval. Correct key-exposed items earn no clean evidence and are capped to an earlier review. Mixed results on one concept cannot erase its failure within the same paper batch.

Opening the key durably marks the worksheet assisted before answers appear; reopening an old key records fresh exposure. Recent exposure also prevents immediate copying in digital practice from earning clean credit. Five intervening unassisted typed questions or a later-day retrieval can establish clean evidence again. The Review corrections digitally action starts with five other prompts. Paper practice is optional for lesson passing. Manual grading remains the learner's judgment; there is no AI, OCR, handwriting scanning, server PDF service or sync.

See `docs/PAPER_PRACTICE.md` for implementation details and limitations.

## Implementation files

- `src/domain/`: pure typed session state machine, normalization/evaluator interface, mastery and scheduling policies.
- `src/content/prepositions.ts`: editable structured concept definitions and sentence variants, independent of scheduling.
- `src/application/learning.ts`: start/resume and transactional answer-submission use cases.
- `src/data/database.ts`: versioned Dexie/IndexedDB tables for attempts, conceptual mistakes, reviews, sessions and vocabulary/curriculum records.
- `src/content/study-lessons.ts` and `advanced-lessons.ts`: twenty lessons, 300 expressions, 600 Learn examples and 300 additional unseen contexts. The initial ten lessons remain the content-v1 backup baseline.
- `src/domain/study*.ts`, `src/application/study.ts`: lesson exercises, progress, simple personal capture and practice use cases.
- `src/features/Vocabulary.tsx`: lesson library, Learn/Test/Context screens and two-field personal editor.
- `src/domain/worksheets.ts`, `src/application/worksheets.ts`, `src/features/Printable.tsx`: generation, persistent worksheet lifecycle, grading, preview/key/history UI.
- `src/application/results.ts`: shared atomic learning-result writer for paper and typed answers.
- `src/content/paper-translations.ts` and embedded advanced word translations: 300 authored Czech sentence prompts; repair questions use deterministic grammar transformations of lesson examples.
- Older vocabulary content/models/use cases remain only for compatibility with earlier data and saved sessions; the new lesson flow does not use the former enrichment workflow.
- `src/App.tsx`: mobile-first React home, shared review UI and persistent completion summary. HashRouter supports static project hosting.

Each answer transaction saves raw input, prompt/answer snapshots, timing, assistance, evaluation provenance, conceptual mistake history, next review and session transition together. Stale submissions from another tab are rejected. UI feedback changes only after the transaction commits.

## Verify

```sh
npm run lint
npm test
npm run build
npx playwright install chromium webkit
npm run test:e2e
```

Vitest covers learning rules, persistence, backups, weakness and update policy. Playwright runs the release regression matrix on desktop Chromium, Pixel-sized Chromium and WebKit at iPhone widths 375, 390 and 430. It checks the real production subpath, manifest/icons, reloads, offline close/reopen and new offline attempts, plus a two-build waiting-worker update with preserved progress. Native A4 PDF generation is checked in Chromium; WebKit checks the same paper flow and print CSS. These are emulations, not a physical-iPhone installation test. Tests use isolated browser contexts and a separate preview port (4186), leaving personal local learning data alone.

```sh
npm run build
npm run preview
```

Open **http://localhost:4173/reflex-english/** for the production preview. Development stays at the normal root URL, while builds/previews use `/reflex-english/`. Hash routes such as `/reflex-english/#/vocabulary/lessons/hotel` refresh without a custom server.

The production service worker precaches the shell, built-in learning content, lazy feature bundles, manifest and icons. Open the app online once and check **Data / Backup → Offline & updates** for readiness. Then close/reopen the cached app offline; progress and new attempts remain in IndexedDB. The development server intentionally does not install a service worker. HTTPS or localhost is required for installation/offline support.

New builds are checked on registration, returning to the app, returning online and hourly while the app remains open. **Data / Backup → Check for updates** also requests a check. While the app is open, an available update waits for **Update available → Update now**; **Later** keeps the current build. After all app tabs are closed, the browser may naturally activate the waiting build for the next opening. Submitted answers and saved progress remain; unsubmitted text is not a saved attempt and can be lost on reload. Other open app tabs may reload too. Before confirmed activation/reload, the app waits for pending IndexedDB transactions. Only app asset caches are replaced; updates never clear the learning database.

## GitHub Pages deployment

Repository: **JindrichProchazka/reflex-english**. Public URL: **https://JindrichProchazka.github.io/reflex-english/**.

1. In the repository, open **Settings → Pages → Build and deployment → Source**, and choose **GitHub Actions**. See [GitHub's publishing-source instructions](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site).
2. Review and commit the local source/configuration files, including `.github/workflows/pages.yml`, and push to **main**. The application source must be committed; uploading only README does not publish the app. `node_modules/`, `dist/`, test outputs and local environment files are ignored.
3. The **Validate and deploy Reflex English** workflow installs locked dependencies with `npm ci`, runs lint and unit/integration tests, builds, runs all Chromium/WebKit release checks, uploads `dist/` and deploys with GitHub's Pages Actions. Pull requests run checks without publishing. You can also use **Actions → Validate and deploy Reflex English → Run workflow**, selecting **main**.
4. Wait for successful **build** and **deploy** jobs and open the deployment URL. If your `github-pages` environment requires approval, approve it; allow deployments from main. Actions must be enabled. No custom server, personal access token, API key or `gh-pages` branch is required.

The workflow follows [GitHub's custom Pages workflow approach](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages), with read-only build permissions and Pages/OIDC write permissions only for deployment. It never deploys a failing build. Current local work still needs to be committed/pushed; creating the workflow locally does not publish the site. See [release checklist](docs/RELEASE.md).

## Install on iPhone

1. Open **https://JindrichProchazka.github.io/reflex-english/** in **Safari** after deployment succeeds.
2. Tap **Share** (open Safari's menu first if needed).
3. Choose **Add to Home Screen**. If offered, keep **Open as Web App** enabled.
4. Tap **Add**, then launch **Reflex** from the Home Screen.
5. While online, open a lesson and **Data / Backup**; confirm version **1.0.0** and offline readiness. Complete an answer, close the app, enable Airplane Mode and reopen it. Confirm the saved progress is present and another answer can be stored. Turn Airplane Mode off afterward.

Learning data is local to each browser/device. **Desktop and iPhone do not synchronize automatically.** Localhost preview and the public GitHub Pages origin also have different stores. Before moving existing progress, export JSON from the old app, open **Data / Backup → Import backup** in the intended browser/installed app, review the summary and confirm replacement. Verify the restored progress there. Keep occasional JSON copies in Files or another location outside browser storage.

## Data safety and current limits

Learning data stays in this browser's IndexedDB and survives normal reloads/restarts. Clearing site data, using private browsing or browser storage eviction can remove it. Database version 5 adds a settings table without deleting earlier history. Sessions and worksheets snapshot their content, so editing vocabulary cannot rewrite ongoing practice or its history.

Open **Data / Backup** in the header to export all user data as a readable JSON file. It includes vocabulary, separate lesson skills, reviews/mastery, raw attempts and mistakes, active sessions, worksheet snapshots/drafts/results/key exposure, settings and legacy records. Unchanged bundled lessons use versioned references. The page shows record counts and the last prepared JSON export date; the browser cannot verify that you kept the downloaded file. Personal vocabulary CSV is also available, but JSON is the authoritative full backup.

To restore, choose **Import backup**, inspect the contents and export date, then explicitly choose **Replace current local learning data** or **Cancel**. Replacement removes current local data rather than merging. Validation and version checks happen before any changes. A single IndexedDB transaction captures a safety copy, clears/writes all tables and verifies the stored rows before committing. Failure rolls back the entire replacement. Download the before-restore safety backup before leaving this page or reloading: it exists only in memory. Other open app tabs refresh their data view after a successful restore.

Current exports use `schemaVersion: 1`, `dataVersion: 4` and vocabulary built-in content version 2, with an app version and export timestamp. Original data-v1/v2/v3 backups are still accepted and retain their original baseline. Drill sessions include content/recency snapshots and bounded prompt history in settings; progress uses the existing review/attempt/mistake tables. Migrations are separate from UI code. Newer/unsupported formats are rejected. See [Backup format](docs/BACKUP_FORMAT.md). The import UI accepts files up to 50 MB; processing is in memory. Files are plain JSON, not encrypted. There is no cloud copy, account or synchronization: keep exported files outside browser storage.

Additional grammar topics, fuller scenario flows, voice and AI evaluation remain later milestones.

Review sessions cover all 12 grammar concepts, prioritizing due and previously failed items; optional early practice does not skip spacing requirements. Weak Areas provides grouped mistake history and targeted review. Progress views remain deliberately small and practical.

## Mistakes / Weak Areas

Open **Practice weak areas** on Home to see recent/repeated errors, grouped concepts, overdue weak items, source lessons/topics, categories and meaningful improvement. Filter vocabulary, grammar, lesson/context, recent, repeated or mastered-but-relapsed history. Vocabulary recall/context and matching personal words share a display group; each underlying skill keeps its own schedule and mastery. Paper and digital attempts appear together with raw answers, timing and reference answers.

Each concept has Practice now, Review examples, source-lesson links where available and mistake history. Opening references first records exposure, then makes the correct examples available. Focused practice uses the existing typed correction engine and shared persistence: it leaves five other prompts before exposed targets, repeats failed concepts in a different variant, checks closing recall and updates future dates. Short queues include grammar fillers. No second learning engine or mastery store is introduced.

The domain score combines recent failed encounters, repetition, mastery, due/overdue state, first-attempt accuracy and recency, reduced by clean retrievals. Labels are Needs attention, Weak, Improving and Stable. Untouched words are not called weak, and Stable is not a mastery award. See [Weak Areas rules](docs/WEAK_AREAS.md) for weights and limitations. No charts or gamification were added.

Recommended next: one authored real-life scenario using the same evidence and review pipeline. See `docs/PRODUCT_SPEC.md`, `docs/IMPLEMENTATION_PLAN.md` and `AGENTS.md` for the complete scope and rules.

Completion shows first-attempt accuracy, total attempts, revisited and clean concepts. A short Needs more practice list names actual expressions with relative review dates; expand View all scheduled reviews for exact times. See [learning UX refinements](docs/LEARNING_UX.md) for answer controls, compatibility and regression coverage.

The daily-use content expansion adds 1,197 literal authored prompts, preserving the original 1,363. `npm run validate:drills` enforces counts, answer/concept coverage, duplicate checks, richer-context coverage and the requested domain/difficulty tolerances. `npm run report:drills` writes the developer-only `docs/DRILL_BANK_REPORT.json`. No learner data migration is required; snapshots and full data-v4 backups remain compatible.
