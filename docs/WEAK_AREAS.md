# Mistakes / Weak Areas and curriculum expansion

The Home card opens `/mistakes`. The page shows recent and repeated mistakes, weakest practised concepts, overdue weak items, source lessons/topics, mistake categories and evidence of improvement. Concept details retain raw errors, dates, reference answers, correct examples, occurrence count, next review and mastery. Reference answers/examples are an explicit study action; exposure is saved before they are displayed. Paper and digital errors appear in one history.

## Grouping and evidence

`src/application/weakness.ts` resolves current grammar, lesson and saved-vocabulary targets, falling back to immutable session/attempt snapshots when the source no longer exists. Grammar groups use stable concept IDs, so different sentences exercising one skill remain together. This is explicit content identity, not AI clustering of arbitrary wrong sentences. Vocabulary groups normalize the target English phrase (case, Unicode, apostrophes and spaces), combining recall/context, paper/digital and matching personal words across lessons. Individual concept IDs, raw attempts, source lessons, schedules and mastery remain separate.

`src/domain/weakness.ts` derives groups and statistics from existing data. Nothing writes a parallel score/mastery table. Untouched seed items are excluded. Counts retain every incorrect event, including minor paper problems; the priority signal counts a failed session/exercise encounter once, so repeated guesses on one prompt do not dominate it.

First-attempt accuracy uses unassisted submissions, excluding copies/exposure-blocked correct responses and hint-assisted retries. An unassisted incorrect paper response counts even though it is ineligible for mastery. This measures first submissions to individual prompts, including delayed retrieval prompts; it is not limited to the first exercise in a session.

## Transparent priority signal

| Signal | Contribution |
| --- | --- |
| Failed encounters in the last 7 days | 6 each, maximum 30 |
| Failed encounters over history | 3 each, maximum 15 |
| Current least-developed practised mastery state | new/learning 12; reviewing 6; mastered 0 |
| Due/overdue review | 6 plus whole overdue days, maximum 12 |
| First-attempt error rate | rounded error proportion × 20 |
| Time since latest incorrect attempt | under 1 day 10; under 7 days 6; under 30 days 3; otherwise 0 |
| Clean retrievals after latest error | subtract 3 each, maximum reduction 18 |

Clamp the total to 0–100. Labels are Needs attention ≥60, Weak ≥35, Improving ≥15 and Stable below 15. The score is shown only as an inspectable explanation of priority; it is not a reward, grade or independent mastery decision. Overdue/mastery use only practised underlying skills. Relapse is detected by replaying actual scheduler evidence and finding an error after mastery, without falsely treating every reviewing item as previously mastered.

Meaningful recent improvement requires at least three clean retrievals since the latest error, or at least a 20 percentage-point improvement between the last two seven-day windows, each with at least three observations. Clean same-session retrieval can show recovery, while the scheduler still prevents it from establishing spaced mastery. Lesson/topic denominators count practised word groups, not every untouched entry. A word linked to several lessons is visible in each source without duplicating its overall concept group.

## Focused practice

Practice now selects underlying targets from the chosen word/concept; the general action selects up to six priority groups and twelve underlying targets. Existing matching in-progress focused sessions resume. The application calls the existing `startSession` and saves a normal `Session` with `weakAreaIds` and a content snapshot. Typed submissions still use `recordAnswer` → `submitToSession` → `persistLearningResult`, with unchanged scheduling/mastery. Lesson evidence is inferred from the current exercise so mixed recall/context targets still update the right separate progress flags.

Five distinct grammar fillers are available to support short queues. Exposed targets start after five other prompts. New errors use the same hint, correction, varied five-prompt retry, repeated-failure requeue and closing recall as normal sessions. Current controlled content is preferred over historical paper/self-assessment variants; old snapshots remain untouched in history. Missing-source targets may have fewer variants. Showing references protects all same-word skill variants (including unpractised context) against immediate copying in any practice entry point.

## Additional curriculum

Each new lesson has fifteen entries with Czech equivalents, two Learn examples, two different authored practice contexts and a Czech translation of its first Learn example for paper use. New lessons preserve Learn / Vocabulary Test / Use in Context / Printable Practice and separate recall/context progress.

| Lesson | Level |
| --- | --- |
| Job Interview & Career Discussion | B2 |
| Advanced Meetings & Negotiation | B2/C1 |
| Technical Troubleshooting II | C1 |
| Mechatronics & Automation | B2/C1 |
| Mechanical Engineering & Manufacturing | B2/C1 |
| Measurement, Testing & Uncertainty | C1 |
| Technical Presentation & Defense | C1 |
| Everyday Problems & Complaints | C1 |
| Advanced Everyday English | C1/C2 |
| Academic & Professional English | C1/C2 |

Technical examples distinguish accuracy from precision, uncertainty from error, and diagnosis from unsupported cause claims. Czech metrology terminology follows the accuracy/precision/trueness distinction described in [ÚNMZ terminology materials](https://www.unmz.gov.cz/sborniky_th/sb10/terminologie.pdf); `accuracy` is not taught as a synonym for trueness. Examples teach usable laboratory/project/workplace language. Level labels describe content ambition, not a certified CEFR assessment. Context practice tests controlled phrase/sentence completion in unseen frames, not arbitrary semantic free production. Smart apostrophes are accepted alongside straight apostrophes. Paper open-ended production remains self-assessed.

Curriculum seeding is additive/idempotent. It preserves original ten lesson IDs/content, user edits, progress and in-flight sessions. `initialStudyLessons` remains the immutable content-v1 backup baseline. Current exports use data v4 / vocabulary content v2 after Quick Reflex Drills; old data-v1/v2 backups remain supported. Quick Reflex Drills resolve from the bundled registry as grammar targets with stable concept IDs and module topics; their attempts, error categories and mastery feed this same Weak Areas pipeline. Feature pages are lazy loaded, with all build chunks included in the offline PWA precache.

Tests cover grouping, filtering, exact scoring signals, recency, copy/hint exclusion, incorrect paper accuracy, improvement, actual mastered relapse, shared paper/digital groups, focused repeat failure/delayed retry/closing, exposure protection, backup/reopen, all lesson levels/targets/unseen contexts/worksheet types, old-curriculum preservation and full new-lesson progress. Desktop/mobile Playwright covers the focused journey and a complete advanced lesson with printable translation, alongside existing learning, paper and backup regressions.
