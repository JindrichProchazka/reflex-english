# Expanded drill bank and persistent prompt recency

## Implementation plan

1. Expand the twelve existing modules to 100–150 original variants each, keeping existing exercise IDs/text and adding practical contexts and further patterns inside existing modules. Explicit editorial CEFR/context tags make distribution inspectable; no AI enrichment or runtime sentence templates.
2. Add a pure recent-variant selector to the shared session engine. Prefer never/recently unseen variants, aim for 30 intervening prompts, fall back to least-recently shown variants for constrained pools, and never displace due priority, five-prompt retries or closing recall.
3. Store bounded per-drill prompt IDs in the existing IndexedDB settings table, transactionally with session presentation/answer writes. Refresh history from storage across tabs/sessions, bootstrap old attempt evidence, include it in backups and keep old snapshots resumable. No new engine or learning mode.
4. Validate IDs, normalized exact/near duplicates, accepted answers, metadata, count and target coverage. Report actual counts, difficulty/topic tags and reviewed similarity warnings.
5. Add recency/persistence/rollback/backup/small-pool tests and browser coverage. Run lint, all unit/integration tests, build and relevant desktop/mobile Playwright regressions.

## Content policy

CEFR labels are editorial estimates of the sentence/task, not a certified assessment. Advanced contexts add natural precision, clause structure and relevant collocations rather than rare-word filler. Short Czech meaning cues remain where several quantifiers/prepositions otherwise fit. Accepted alternatives remain explicit.

Existing grammar/lesson baselines and all historical attempt/worksheet/session snapshots are retained. New content is appended under stable concept IDs, with new patterns added only within an existing module. Original snapshots may contain a smaller variant pool; their state, prompt and answers are not rewritten.

## Current bank

| Module | Concepts | Prompts |
| --- | ---: | ---: |
| IN / ON / AT | 12 | 120 |
| Articles | 14 | 140 |
| Quantifiers | 10 | 100 |
| DO / MAKE / TAKE / HAVE | 12 | 120 |
| SAY / TELL / SPEAK / TALK | 13 | 130 |
| SINCE / FOR / AGO | 10 | 100 |
| Present Perfect vs Past Simple | 10 | 100 |
| Past Simple vs Past Continuous | 10 | 100 |
| THIS / THAT / THESE / THOSE | 10 | 100 |
| WHO / WHICH / THAT | 10 | 100 |
| Common Prepositions | 12 | 120 |
| Verb + Preposition Patterns | 19 | 133 |
| **Total** | **142** | **1,363** |

This adds 973 original sentences to the original 390. Existing IDs/text are retained; new variants have append-only `:bank:` IDs. New concepts within existing modules cover a/an sound-versus-spelling contrasts, speak up/for and talk-through patterns, and refer to, result in, consist of, contribute to, participate in, suffer from and rely on. No drill module or learning mode is added.

The editorial distribution is **B1: 384 (28.2%), B2: 645 (47.3%), C1: 334 (24.5%)**. Tags describe the sentence/task context, not a CEFR certification of the learner or an assertion that an article itself is C1. Legacy sentences have explicit tags too; nothing classifies content through AI or keyword inference at runtime.

| Primary context tag | Prompts |
| --- | ---: |
| University / lectures / teachers / assignments | 205 |
| Office / meetings / project work | 203 |
| Engineering / controls / troubleshooting | 148 |
| Household / practical situations | 133 |
| Social conversation | 117 |
| Manufacturing / production | 114 |
| Travel | 100 |
| Sport / training | 87 |
| Laboratory / measurements / testing | 85 |
| Hotels / restaurants / cafés | 68 |
| Commuting / public transport | 56 |
| Errands | 47 |

Tags assign one primary context per sentence; topics overlap in real use. Technical engineering/lab/production accounts for 25.5%, university 15.0%, office/project work 14.9%, household/social/errands 21.8%, travel/commuting/hospitality 16.4%, sport 6.4%.

## Selection and persistence

The shared domain selector uses a per-drill 30-prompt cooldown. It prefers variants outside that window, then never/least-recently shown alternatives, with seeded ties. It avoids the last variant of the same concept whenever another variant exists. When all candidates are recent it chooses a least-recent different variant; it never removes an exercise or breaks a failed-retry deadline to satisfy a cosmetic gap. Concept ties also deprioritize fully recent variant pools within the existing target/priority constraints. Original due/weak priority, focused acquisition, constrained target ordering and closing recall remain in the same engine.

The existing settings table stores `drill-history:<module-id>` → `{version: 1, promptIds: [...]}`, capped at 96 presentation IDs. Session snapshots hold the matching bounded history and concept ownership for the pure selector. New sessions save the first presentation before returning to the UI. Answer transactions refresh history from IndexedDB, select/save the next presentation and commit it with attempts, mistakes, mastery, schedules and session state. This prevents one active tab from overwriting another tab’s history. Wrong guesses and copied corrections on the current prompt do not manufacture additional presentations or learning evidence.

Existing typed attempts bootstrap missing history once, collapsing consecutive attempts on the same presentation and excluding paper grades. Legacy session loading adopts recency without changing its current question, queue or content snapshot. Pure vocabulary exercises retain their existing stage/direction rotation; grammar fillers and focused grammar/worksheet practice share drill recency. Reopening an unfinished session intentionally resumes its current question without counting another presentation.

Backup envelope 1 / data v4 includes settings history, optional session `promptHistory` and optional exercise level/topic metadata. Data-v1/v2/v3 backups still migrate without rewriting old evidence. IndexedDB stays v5 and vocabulary content baselines stay v1/v2. History is a selection aid, not another mastery or scheduling model.

## Validation and limits

`npm run validate:drills` runs the content checks. To print the machine-readable report, use `npm run validate:drills -- --disableConsoleIntercept`. The current report has **zero duplicate module/concept/exercise IDs, zero normalized exact duplicate prompts, zero near-duplicate candidates and zero validation errors**. Checks also enforce one answer gap, non-empty hints/explanations, explicit accepted answers, valid editorial tags, minimum module/concept coverage and target representation.

Near-duplicate detection uses shared word shingles and a token edit distance of at most two for sentences of at least eight tokens. It catches small lexical substitutions without claiming semantic comparison. Tests inject exact duplicates, near templates and malformed/underrepresented content to verify that the checks fail as intended. It cannot prove that every pair is semantically different or that every natural English alternative has been enumerated.

The cooldown is a preference under the available concept/priority pool. A failed concept, an urgent due review or a very small/legacy pool can require an earlier exact repeat. Six due concepts are still needed for a due-only session to guarantee five intervening prompts without silently adding non-due material. Controlled literal evaluation and editorial CEFR labels retain their existing limits; no AI evaluator or sentence generator is introduced.

## Verification (2026-10-18)

- `npm run lint`: passed.
- `npm run validate:drills -- --disableConsoleIntercept`: all four validation tests passed; report totals/labels/contexts are recorded above.
- `npm test`: all 168 unit/integration tests in 14 files passed, including original scheduler/Weak Areas checks and recency, bounded persistence, cross-session freshness, transaction rollback, backward-compatible restore and old-snapshot adoption.
- `npm run build`: passed; all feature/content chunks are included in the PWA precache.
- `npm run test:e2e`: all 85 tests passed across desktop Chromium, Pixel-sized Chromium and WebKit at 375/390/430 px. The recency journey completes two Normal sessions, reloads mid-session, closes/reopens the page, verifies at least 30 intervening prompts before repeats and checks the JSON backup history. Existing learning, correction, paper, Weak Areas, restore, offline and confirmed-update regressions pass too.

The new browser test initially checked the exercise loop before asynchronous session loading finished; an explicit visible-prompt wait fixed that test race. The complete final matrix passed with no retries or skips. These are automated browser results, not physical-iPhone verification or a claim of public deployment.
