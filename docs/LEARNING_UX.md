# Learning UX refinements · 2026-10-19

## Completion

The completion page derives first-attempt accuracy, all saved attempts, distinct concepts requiring revisiting and concepts completed cleanly from existing evidence. Accuracy uses the same unassisted evidence filter as Weak Areas; copies/hints are excluded. A clean concept has an eligible successful retrieval and no errors or assistance in this session. Reading the summary awards no evidence.

Needs more practice lists at most five actual words/phrases or grammar concept names. Names resolve from persisted lesson/personal words, with immutable exercise explanations as a legacy vocabulary fallback. Relative labels use local calendar days (today, tomorrow, in 2 days, in 1 week), avoiding DST/24-hour rounding errors. Exact dates/statuses remain accessible in the collapsed View all scheduled reviews section. A clean session has a compact positive message. Home, context continuation and relevant mistakes actions remain available.

## Context answers

The existing explicit `lessonEvidence` discriminator separates `understanding` gap-fill from `production` whole-sentence tasks; no new persisted format or inferred instruction parsing is needed. `responseInstruction` presents “Type the missing word or phrase.” or “Type the whole sentence.” respectively, also for old session snapshots.

Gap-fill retains its phrase as canonical answer and preserves all authored accepted equivalents. The evaluator additionally expands those equivalents into the single authored sentence frame. It accepts either representation, normalizing case, internal/outer whitespace, apostrophes, punctuation spacing and trailing sentence punctuation (including comma/semicolon/colon). It never accepts a fragment for whole-sentence production. Meaning-changing punctuation, arbitrary translations and semantic alternatives are not inferred. Old prompts, histories, lesson content baselines and active snapshots are not rewritten.

## Reflex controls

`src/domain/answer-input.ts` defines explicit, stable answer spaces independent of React:

- IN / ON / AT
- Articles (dash means no article)
- Quantifiers (eight options, including a few/a little)
- DO / MAKE / TAKE / HAVE
- SAY / TELL / SPEAK / TALK
- SINCE / FOR / AGO
- THIS / THAT / THESE / THOSE
- WHO / WHICH / THAT
- Common Prepositions (to/for/with/about)
- Verb + Preposition Patterns remains typed because the complete answer space includes broader patterns and accepted alternatives.

Buttons are used only when the current exercise's entire authored accepted set is contained in the module's bounded set. The entire Verb + Preposition Patterns module remains typed, preserving alternatives such as `upon`. Items in other modules outside their bounded set also remain typed. Present Perfect vs Past Simple and Past Simple vs Past Continuous test actual verb forms, so remain typed. Vocabulary, open/self-assessed language and full sentences remain typed. The second-error correction always requires typed reproduction, not tapping a displayed answer.

Buttons submit immediately through `recordAnswer`, with a synchronous ref lock and a short 350 ms rapid-activation guard. Held-key repeat is ignored. Disabled state/focus handling prevents accidental double answers while retaining ordinary Tab/Enter/Space controls. Controls wrap with 56 px minimum height and visible focus. Correct answers advance automatically, with live feedback; there is no extra submit/next step. First-error hints, correction, five-prompt varied retry, closing recall, scheduling and mastery policies are unchanged.

There is no new database table, data version or alternate learning engine. Existing digital answer/source fields, raw answer text, duration, assistance and controlled-evaluation provenance use the same transactional writer. Learning-state backups remain data v4.

## Verification

Regression tests cover relative dates, real names, compact/clean/capped summaries and expandable schedules; missing-phrase/full-frame normalization, wrong phrases and whole-sentence requirements; safe answer sets, rapid activation, keyboard answering, error/retry/closing and typed verb forms. Browser coverage includes desktop Chromium, mobile Chromium and WebKit at 375/390/430 px. Browser emulation is not physical-iPhone verification; the on-device checklist remains in RELEASE.md.


## Initial UX increment results (2026-10-19)

- `npm run lint`: passed.
- `npm test`: 177 unit/integration tests passed in 15 files, including all existing scheduler, persistence, content-validation and backup tests.
- `npm run build`: passed; the final production/PWA assets were used for browser tests.
- `npm run test:e2e -- --project=desktop --project=mobile`: all 38 tests passed (1.2 minutes). This includes correction/delayed/closing retrieval, two completed Normal sessions with persistent recency, vocabulary pass, Weak Areas, paper, backup/restore, offline reopening and confirmed PWA updates.
- Supplemental Chromium viewport tests at 375/390/430 px: all 9 passed (20.5 seconds), covering controls/keyboard/rapid taps, context answer semantics, completion/relative names/hidden exact times/expanded details and reload. An ignored local `.tools/ux-chromium.config.ts` supplied these explicit viewports without changing the canonical WebKit projects.
- The canonical full 95-test run was attempted: 38 Chromium tests passed and all 57 WebKit cases failed before page creation because Windows Application Control blocked `ms-playwright/webkit-2370/Playwright.exe` (`spawn UNKNOWN`). Direct launch confirmed the policy message “Zásada řízení aplikací tento soubor zablokovala.” No security policy was changed or bypassed. These are blocked verification checks, not passing WebKit results. Rerun the three canonical iPhone projects on an authorized host where WebKit can launch.
- Desktop/mobile screenshots were inspected for the button layout and compact summary. Physical-iPhone verification remains outstanding.

The later 2,560-prompt refinement retains these summary/gap/button fixes, adds a selected incorrect-answer state, keeps the entire broad Verb + Preposition Patterns module typed, and increases the repeat preference to 50. Its final 180-unit/38-Chromium/9-extra-viewport results and the repeated WebKit host-policy block are recorded in DRILL_CONTENT_BANK.md.
