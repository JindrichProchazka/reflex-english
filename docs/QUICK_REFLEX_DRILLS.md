# Quick Reflex Drills

## Implementation plan

1. Author a bundled typed drill registry: retain IN / ON / AT IDs, add eleven modules with explicit accepted alternatives, hints and explanations. Group variants by stable grammatical concept, not by sentence. The subsequent content expansion supplies 100–150 variants per module; see DRILL_CONTENT_BANK.md.
2. Extend the existing session planner with an optional initial-concept budget and constrained ordering. Quick selects five concepts (about 10–11 clean prompts including delayed recall); Normal selects ten (about 20). Retain focused pairs for first acquisition and mixed balance afterward. Failed retries and closing recall can extend either. Prioritize due, mistakes and weak/practised concepts before new concepts.
3. Add a hub with module cards, derived mastery counts, due count, recent first-attempt accuracy, recent errors and resumable Quick/Normal/Due sessions. Keep the existing review UI and answer writer. Home links to the hub rather than listing all modules.
4. Resolve new grammar targets in Weak Areas and paper pools. Keep the existing scheduler, result transactions and IndexedDB tables. Extend backup validation/data version additively for drill session fields and grammar mistake categories; preserve old imports.
5. Test content, accepted answers, sizes, ordering, repeated failure/delayed/closing retrieval, due-only selection, mastery/scheduling, Weak Areas and backup/reopen. Run lint, all unit tests, production build and browser regression.

## Rules and limits

- No second engine, AI, backend, gamification or sync. Controlled typed answers only; no semantic grading claim.
- Article omission is typed as `-`. Relative clauses and speak/talk contexts accept authored valid alternatives rather than marking natural English wrong. Quantifier meanings use short Czech cues where English alone admits several answers.
- Due Review selects only due, previously practised concepts and uses only those concepts as retry fillers. Six distinct due concepts are needed to guarantee five intervening prompts even if every initial question fails. With a smaller due pool, offer Quick instead of silently adding new material or pretending immediate repetition is delayed recall.
- A session snapshots its module content; additive content updates never rewrite old sessions or history. Module progress is derived from review/attempt/mistake records, with no parallel mastery table. Recent means the last 30 days; accuracy uses the same unassisted evidence filter as Weak Areas.
- Existing IN / ON / AT review links and legacy session snapshots remain valid.

## Authored catalogue

| Module | Concepts | Prompt variants |
| --- | ---: | ---: |
| IN / ON / AT (existing) | 12 | 120 |
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

Each current concept has 7–17 different authored sentence contexts, with globally unique IDs. Original three-variant snapshots remain resumable. Verb-form drills group ordering by tense, rather than by the spelling of a conjugated answer. British-English present-perfect patterns are the reference; explicitly accepted recent-event/already/just/yet alternatives avoid rejecting natural past-simple usage. Defining object relative clauses ask for an explicit relative word even where omission would be valid in free writing. The recent-variant selector and editorial distribution are documented in DRILL_CONTENT_BANK.md.

The shared ordering selector also preserves enough minority targets to avoid a forced tail when a run-of-two ordering is feasible (for example, seven present-perfect and three past-simple concepts). Feasibility is checked within the current priority tier before count balancing/focused pairs; it never displaces a ready failed-item retry or a higher-priority due concept. Impossible pools retain the normal fallback rather than dropping exercises.

Data v3 introduced optional drill identity/size and grammar categories; current data v4 also includes bounded prompt history and editorial exercise metadata. Vocabulary content baselines remain v1/v2, IndexedDB stays v5, and data-v1/v2/v3 imports migrate without rewriting history. No new persisted progress table is introduced.

## Initial increment verification (2026-10-18)

Lint passed; all 142 unit/integration tests in 12 files passed; production build passed (all feature/content chunks precached); all 80 Playwright regressions passed across desktop Chromium, Pixel-sized Chromium and WebKit at 375/390/430 px. Coverage includes all modules' loading/evaluation, accepted alternatives, balanced and uneven pools, five-prompt varied retries/repeated failure/closing, Quick/Normal sizes, due-only pools, exposure protection, separate progress, mastery/scheduling, Weak Areas, paper and backup/reopen. The browser drill journey covers Home → hub → Articles → two errors/correction → different delayed variant → closing recall → completion → reload → module progress/Weak Areas → offline hub. Hub screenshots were inspected at desktop and phone widths. Browser emulation is not a physical-iPhone verification.
