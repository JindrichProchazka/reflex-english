# Authored Quick Reflex Drill bank: daily-use refinement

The bank contains **2,560 prompts across the same twelve modules and 143 stable concepts**. This adds **1,197 literal authored sentences** to the original 1,363, retaining every original ID, prompt, accepted answer and editorial tag. Differ from is added as a stable concept inside the existing Verb + Preposition Patterns module. No learning mode, scheduler, mastery model, database table or data version is added.

## Catalogue

| Module | Concepts | Prompts |
| --- | ---: | ---: |
| IN / ON / AT | 12 | 220 |
| Articles | 14 | 260 |
| Quantifiers | 10 | 220 |
| DO / MAKE / TAKE / HAVE | 12 | 220 |
| SAY / TELL / SPEAK / TALK | 13 | 200 |
| SINCE / FOR / AGO | 10 | 180 |
| Present Perfect vs Past Simple | 10 | 220 |
| Past Simple vs Past Continuous | 10 | 200 |
| THIS / THAT / THESE / THOSE | 10 | 160 |
| WHO / WHICH / THAT | 10 | 160 |
| Common Prepositions | 12 | 240 |
| Verb + Preposition Patterns | 20 | 280 |
| **Total** | **143** | **2,560** |

Each concept has 10–28 controlled sentence variants. The original address concept remains at ten; no new street-address examples were needed. New content covers lectures, assignments, credit transfers, practical measurement, sensors/controllers/mechanical assemblies, work handovers, travel problems, household tasks, training/recovery and evaluating evidence. New technical contexts avoid treating resolution, repeatability and uncertainty as interchangeable or assuming that a symptom establishes its cause.

## Requested distribution

The complete bank uses **B1: 516 (20.16%), B2: 1,392 (54.38%), C1: 652 (25.47%)**, against the requested 20/55/25 mix. These are editorial estimates of sentence/context difficulty, not certified CEFR assessment. Natural clauses, dependencies and reasoning establish the richer contexts, not rare-word decoration.

| User-specified domain | Prompts | Share |
| --- | ---: | ---: |
| University / studying | 461 | 18.01% |
| Engineering / mechatronics / laboratories | 563 | 21.99% |
| Workplace / manufacturing / project work | 384 | 15.00% |
| Travel / commuting / administration | 307 | 11.99% |
| Everyday practical life / home / errands / social | 461 | 18.01% |
| Sport / training / hobbies | 205 | 8.01% |
| Advanced professional / abstract discussion | 179 | 6.99% |

Existing granular tags remain intact. The explicit mapping in `src/content/drill-policy.ts` groups laboratory with engineering; office/manufacturing with workplace; travel/commuting/hospitality with travel; household/errands/social with everyday. New advanced discussion has its own tag. Every sentence has one primary domain; contexts can overlap in actual use. We applied the user's requested distribution to the combined bank, rather than applying it only to additions and leaving the overall mix unchanged.

A conservative structural proxy finds **330 / 1,197 additions (27.57%)** with at least fourteen tokens and a contextual clause/dependency marker. This checks the minimum 25% richer-context requirement without claiming semantic understanding. Longer technical/abstract contexts use meaningful contrast, time sequence, consequence or a qualification of evidence. Some other natural contexts do not satisfy the proxy; it is not a language-quality score.

## Literal content architecture and compatibility

`src/content/drill-bank/daily/` contains twelve authored sentence files. The compact format is literal `concept|prompt|answer|accepted alternatives`, with explicit `@topic LEVEL` metadata sections. `authoring.ts` parses data; it does not generate sentences from noun substitutions or runtime templates. Default answers inherit the original concept's accepted alternatives (including natural speak/talk, take/have and relative-clause alternatives); verb-form rows explicitly author the required conjugation and relevant contractions/spelling variants. Quantifier meaning cues distinguish amount/existence and few/a few/little/a little.

Existing IDs/text are never renumbered: additions use per-concept `:daily:` IDs, and the new differ concept has its own namespaced IDs. Append future rows without reordering existing per-concept rows. Tests compare all 1,363 earlier exercise records after expansion and confirm the source is not mutated. Old active snapshots retain their original 3-, 10- or 140-prompt pools rather than being silently upgraded. New sessions use the current bank. Old reviews/mastery/mistakes, attempts, lesson progress and all vocabulary content-v1/v2 resolvers remain unchanged.

## Exact anti-repetition behaviour

The shared selector now targets **50 other per-drill presentations before an exact repeat**, keeping the **96-ID bounded history** in the existing settings records and session snapshots. There is no new storage schema. History is saved transactionally before presentation, refreshed before advancement, retained across reload/PWA reopening and included in full data-v4 backups. Old v1/v2/v3 backups remain restorable through existing migrations; old v4 snapshots remain unchanged.

The selector excludes the latest variant of a concept whenever another exists. It first prefers variants outside the last 50 presentations, then never/least-recently presented variants with seeded ties. Concept ties also deprioritize exhausted pools inside the existing priority/order constraints. Due priority, balanced targets, acquisition pairs, ready failed retrieval and closing recall retain precedence. Failed concepts return after five completed intervening prompts, preferably with different wording; repeat failures restart the same correction loop. We do not delay a due concept just to meet the cosmetic cooldown. Small/exhausted/legacy pools can repeat sooner, using the least-recent different variant. An unfinished session resumes its current prompt without counting another presentation. Hints/copies do not manufacture extra presentations.

The bounded record intentionally retains the most recent 96 IDs rather than an ever-growing global history. Future fully recent pools fall back; there is no promise that every prompt is seen before an old prompt returns. Due-only sessions still require six distinct due concepts to guarantee five intervening questions without adding non-due filler.

## Learner UX

The compact completion summary names actual words/concepts, shows four metrics and at most five difficult items with relative review dates, and hides exact timestamps inside optional scheduling details. Gap understanding accepts the missing phrase or completed authored frame; production requires the whole sentence. Input instructions are explicit, including resumed snapshots.

Nine bounded drills use immediate-submit, keyboard-accessible answer buttons: IN/ON/AT, Articles, Quantifiers, DO/MAKE/TAKE/HAVE, SAY/TELL/SPEAK/TALK, SINCE/FOR/AGO, THIS/THAT/THESE/THOSE, WHO/WHICH/THAT and Common Prepositions. Incorrect selections have a visible selected/feedback state. The synchronous submission lock and brief rapid-tap guard remain. Verb + Preposition Patterns stays typed because its complete answer space is broader; both tense contrasts require actual verb forms and stay typed. Vocabulary, phrases, translations, sentences and all active correction reproduction remain typed. The same result writer, feedback loop and scheduler handle every submission.

## Developer validation and reproducible report

- `npm run validate:drills` runs the content regression checks.
- `npm run report:drills` writes deterministic `docs/DRILL_BANK_REPORT.json` and prints it. It reuses Vite's installed TypeScript transform without opening a listening server, adding dependencies or exposing a learner-facing report.
- The report lists module/target/concept counts, editorial levels, granular topics, seven-domain totals, new/richer counts, raw exact/normalized duplicates, near candidates and validation errors.
- Checks enforce the module-specific minimums, IDs/ownership, one gap, accepted answers, nonempty hints/explanations, valid metadata, minimum and relative concept/target representation. Full-bank domain and difficulty shares must stay within two percentage points of the requested targets. The richer-addition proxy must stay at least 25%.
- Near detection uses shared word shingles and token edit distance at most two for sentences of at least eight tokens. It flags obvious lexical substitutions but cannot establish semantic uniqueness. The current report has **zero duplicate IDs, zero raw exact duplicates, zero normalized duplicates, zero near candidates and zero errors**.

## Verification

See the final results below. Unit coverage includes the 50-prompt preference over sixteen Normal sessions per module, saturated/small pools, due priority, varied five-prompt failure/repeat failure/closing recall, bounded storage, cross-session refresh, rollback, backup/reopen and old v4 snapshot preservation. Browser recency coverage now completes three Normal sessions (60 prompts), reloads mid-session, closes/reopens the page and checks exact history in the JSON backup. Scheduling and mastery tests retain their existing rules.

The earlier 1,363-prompt increment and its historical test results are recorded in the initial Quick Reflex Drills documentation. This refinement supersedes its 30-prompt and 100–150/module targets. All browser emulation is distinct from physical-iPhone testing, and no local verification implies deployment.


### Final results (2026-10-19)

- Lint passed; `git diff --check` passed.
- All **180 unit/integration tests in 15 files** passed. No scheduler/mastery policy was modified to satisfy a test. The content minimum and obsolete fixed variant-count assertions were updated to the new catalogue; Quick/Normal budgets remain five/ten initial concepts and about 10/20 clean prompts.
- `npm run validate:drills`: **6 passed**. `npm run report:drills` regenerated the checked-in report with zero findings/errors.
- Production build passed: 102 modules, 26 precached entries (~881 KiB total); the expanded shared content/history chunk is ~282 KiB raw / 92 KiB gzip. No added dependency/backend or new persistence migration.
- Canonical full browser command attempted **95 tests**: all **38 desktop/mobile Chromium regressions passed**; **57 WebKit cases failed before page creation** because the Windows host blocked the installed WebKit executable (`spawn UNKNOWN`). Direct launch reconfirmed “Zásada řízení aplikací tento soubor zablokovala.” No security policy was changed or bypassed. WebKit remains unverified and must be rerun on an authorized host where it can launch.
- Supplemental Chromium checks at **375/390/430 px: 9 passed** (20.3 seconds), using the ignored local width configuration described in LEARNING_UX.md. These are not Safari/WebKit or physical-iPhone results.
- Desktop/phone screenshots were inspected, including the two-column compact metrics, readable relative review row, expandable details, action wrapping and reflex buttons. No public deployment was performed by this task.
