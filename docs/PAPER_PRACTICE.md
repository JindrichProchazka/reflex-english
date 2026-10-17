# Paper practice

Paper is another input method for the same learning system. A generated Worksheet has a stable UUID, creation/completion dates, source/type/direction, immutable numbered question snapshots, results, exposure marker and revision. IndexedDB v4 adds the worksheet table and worksheet-ID attempt index without deleting earlier records.

## Generation and print

- Sources: complete lesson, selected words as a small vocabulary set, due reviews, recent conceptual mistakes across vocabulary/grammar, and weak items.
- Types: bidirectional recall, sentence gaps, phrase/collocation recall, Czech→English sentence translation, sentence repair and mixed tests. Initial content provides 150 authored Czech translation prompts; gap variants reuse the lesson's two examples. Repair uses explicit small grammar transformations (modal infinitives, need + to, subject agreement, articles and polite imperatives), with a rule in the key.
- Short/medium/long request 10/20/40 questions. Balance types and concepts, keep source order meaningful, remove identical prompts and never manufacture duplicates to fill a small source. The preview reports the shorter actual count when needed.
- Preview and key are separate routes and DOM trees. The A4 print stylesheet hides app navigation, adds handwriting lines and keeps question blocks together. Native browser Print / Save as PDF is sufficient. No PDF backend exists.
- Keys list expected answers, explicit alternatives and short explanations. Open translation/repair references acknowledge other natural answers. Selected lesson words implement set-based generation without reintroducing the retired metadata-heavy library UI.

## Shared result pipeline

Both recordAnswer and submitPaperResults call persistLearningResult inside their enclosing transaction. It stores Attempt, updates ReviewItem through the same scheduler, groups Mistake history, and updates separate lesson recall/context evidence. Paper attempts retain source/evaluator, grade, worksheet/item IDs, optional transcription and null response duration.

Minor problems are weaker evidence, invalidate clean review history, and schedule six-hour review. Wrong answers reset to ten-minute review. Correct answers follow the normal schedule only when unassisted and eligible. Any concept failed anywhere in a paper batch cannot gain stronger evidence from another correct item in that batch. Process minor results, wrong results, then correct results so a severe error retains the shortest interval.

Draft grades do not create attempts. Complete submission is atomic and idempotent, with deterministic per-item attempt IDs; no unanswered item becomes an attempt. Revision checks prevent stale drafts from overwriting newer answer-key exposure or submitted data. Confirmed deletion removes only the worksheet, retaining learning history.

## Assistance and retrieval

Every answer-key opening saves exposure before the answers render, including reopening an old key. All results subsequently submitted from that sheet are assisted. Previously submitted attempts are immutable; opening a key later does not rewrite their provenance, but does affect future retrieval eligibility.

The shared result writer also checks recent concept exposure when grading typed or other paper work. Correct responses cannot earn clean evidence immediately after viewing a key. Five distinct intervening correct, unassisted typed prompts, or at least a day since exposure, allow later clean retrieval. The direct digital-corrections action provides five intervening prompts before exposed concepts, with canonical variants and normal retry/closing recall.

Lesson pages show optional paper completion. Paper can contribute unassisted skills but is never a mandatory lesson-pass condition. Viewing the key cannot pass the lesson. Paper translation is self-assessed rather than semantically judged by string comparison.

## Verification and limits

Unit/integration tests cover all types/lessons, selection and uniqueness, source coverage, stable IDs/snapshots, key separation/failure-to-save protection, drafts/stale writes, mixed results, scheduling/mastery, exposure across entry methods, rollback, idempotency, reload, deletion and delayed digital follow-up. Desktop/mobile Playwright generates an A4 browser PDF, checks print navigation/answer separation, enters mixed results, verifies shared mistakes and reload/offline persistence, and confirms deletion behavior.

Manual grades cannot verify what was actually written on paper or whether an external answer source was used. Focused small sets can produce fewer than the requested questions. Browser/printer header/footer settings remain user-controlled. No AI, OCR, scanning, server-side PDF generation or cloud synchronization is included. JSON backup/restore now protects worksheet snapshots, drafts, grades, exposure and shared learning history; see BACKUP_FORMAT.md.
