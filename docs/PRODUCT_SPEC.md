You are the lead software engineer and product designer for a personal English-learning application.

Build a working application, not only a mock-up or project scaffold.

WORKING NAME

Use “Reflex English” as the temporary application name. Keep the name easy to change later.

PRODUCT PURPOSE

The application is a personal English trainer for a Czech native speaker currently around B1–B2 who wants to progress toward strong B2/C1 practical English.

The primary goal is automatic language production: the user should not have to consciously reason about basic vocabulary, prepositions, tense patterns, collocations and common sentence structures. Repeated correct retrieval should gradually turn them into automatic responses — essentially language “muscle memory”.

This must NOT behave like a typical gamified language application. Do not implement hearts, lives, punishments, coins, meaningless XP, forced daily streaks, or exercises where a mistake simply disappears after the user sees the correct answer once.

A mistake is valuable learning data.

Every meaningful mistake must be saved, revisited and practised again until the learner demonstrates that the item can be retrieved correctly after a delay and in more than one context.

PEDAGOGICAL MODEL

Base the learning engine around retrieval practice, spaced practice, corrective feedback, mastery learning and real-world task-based language practice.

Do not rely primarily on passive recognition.

Prefer productive recall:

Czech idea -> English production.
Meaning -> vocabulary recall.
Sentence with missing preposition -> user types the preposition.
Real-life situation -> user produces a sentence.
Wrong sentence -> user repairs it.
Vocabulary -> user eventually uses it in a sentence.

Multiple-choice exercises should NOT be the default. Use them only where pedagogically justified or as an optional easier mode.

When the user gives a wrong answer, do not immediately make the mistake disappear.

Use this correction loop:

First incorrect attempt:
Tell the learner that something is wrong.
Give a small hint when possible, such as “check the preposition”, “check the tense”, or “think about the collocation”.
Do not reveal the complete answer yet.

Second incorrect attempt:
Show the correct answer and a short explanation.
Require the learner to actively reproduce the correct answer.

Then place the failed item back into the current session after approximately 3–5 other questions.

A failed item should appear again near the end of the session.

It must also receive an earlier future review date.

A lesson is not considered successful merely because every question has been shown.

NEW MATERIAL VS MIXED PRACTICE

Do not blindly interleave brand-new material.

When a learner first encounters a grammar rule, vocabulary group or phrase pattern, allow focused/block practice so that the basic representation can form.

After the learner begins succeeding, progressively mix the item with similar or confusable material.

For example:

First teach AT for several clear contexts.
Teach IN and ON.
Then create mixed IN / ON / AT retrieval exercises.

The same principle applies to tense contrasts and similar vocabulary.

MASTERY MODEL

Use these states:

new
learning
reviewing
mastered

Mastery must require success over time, not success three times in one minute.

A reasonable initial rule is:

An item moves from new to learning after the first successful retrieval.

It moves to reviewing once it has been successfully recalled in more than one session.

It becomes mastered after at least four successful spaced retrievals covering at least seven days, including productive recall, with no error in the last three reviews.

If a mastered item is answered incorrectly, reduce its status and schedule it sooner.

Keep this logic isolated inside a scheduling service so the algorithm can be changed later without rewriting the application.

SPACING

Use a simple transparent initial review schedule rather than an unnecessarily complicated algorithm.

Suggested successful-review progression:

same-session delayed retrieval
1 day
3 days
7 days
14 days
30 days
60 days

Incorrect answers move the item back to short review intervals.

A correct answer after using a hint counts as weaker than a correct first attempt.

Do not remove mastered material permanently. It should still return occasionally.

AUTOMATICITY

Measure response time, but do not punish the learner for being slow.

Store response duration with each attempt.

Later reviews should be able to show whether the learner is becoming both more accurate and faster.

Create an optional “Fluency / Reflex mode” where already-known material is practised quickly.

Accuracy always has priority over speed.

APPLICATION MODES

The main experience should contain these concepts:

Quick Review
A short session suitable for a bus ride or waiting somewhere. It should automatically select due reviews, recent mistakes and weak skills.

Lessons
Structured teaching units containing explanation, examples, controlled practice, productive retrieval and eventually real-world usage.

Vocabulary
Personal vocabulary learning with spaced retrieval.

Grammar & Reflex Drills
Short focused drills such as IN / AT / ON, articles, tense contrasts, common collocations and sentence patterns.

Real-life Scenarios
Practical situations such as hotel check-in, ordering food, travelling by train or bus, speaking to a teacher, asking for clarification, participating in a meeting, workplace communication and similar situations.

Mistakes
A personal error notebook automatically generated from incorrect answers.

Progress
Useful learning statistics rather than gamification.

HOME SCREEN

The mobile-first home screen should immediately answer:

What should I practise now?
What am I weak at?
What did I recently get wrong?

Provide prominent actions for:

Continue / Review Due Items
Quick 5-Minute Practice
Add a Word
Lessons
Weak Areas / Mistakes

Show the number of reviews currently due.

VOCABULARY SYSTEM

Allow the user to manually add a word or phrase discovered in a book, conversation, school, video, etc.

A vocabulary entry should support:

English word or phrase
Czech meaning
part of speech
short explanation
collocations or common phrase patterns
example sentence
user-created sentence
source or context where the word was found
tags/topic
notes
active vs passive vocabulary preference

Adding a personal word should automatically put it into the learning queue.

Do not train vocabulary only as English -> Czech.

Use several forms of recall over time.

Early phase:
recognise the meaning and recall the English form.

Later phase:
Czech -> English.
Cloze sentence.
Recall the collocation.
Create/use the word in a sentence.
Understand the word in a different context.

A vocabulary item should only count as strongly mastered after productive use, not merely recognition.

PERSONAL MISTAKE SYSTEM

Every incorrect answer should create or update a mistake record.

Store:

exercise or skill
original prompt
user’s incorrect answer
correct answer
short explanation
error category
number of occurrences
dates encountered
last review date
next review date
current mastery status

Common error categories should include:

preposition
tense
article
word order
collocation
vocabulary
spelling
grammar
phrase
other

If the same conceptual mistake appears multiple times, group the attempts rather than creating meaningless duplicates.

Example:

User repeatedly writes:
“arrive to Prague”

Concept:
arrive + in/at, not arrive + to

The system should train the concept using several examples rather than only repeating the exact same sentence.

INITIAL PERSONAL ERROR CONTENT

Seed a small demonstration set using these real learner mistakes:

“do a shower” -> “take a shower”

“arrive to Prague” -> “arrive in Prague”

“I checked my bus if everything was okay” -> natural pattern such as “I checked whether my bus was on time”

past narrative:
“When I arrived at class, the class has already begun”
-> “When I arrived at class, the class had already started.”

“I had no idea how would the end”
-> “I had no idea how it would end.”

“I am using them incorrectly again”
-> useful pattern “I keep using them incorrectly.”

These should demonstrate the mistake-learning architecture rather than being hard-coded special cases.

GRAMMAR AND MICRO-DRILLS

Create a system where grammar topics are defined as reusable skill modules.

The first fully implemented module should be:

IN / ON / AT for time and place.

It should contain a short explanation, examples, focused acquisition exercises and mixed retrieval exercises.

The user must type the answer. Do not present IN / ON / AT as three large buttons by default.

If a mistake occurs, explain the relevant rule briefly and requeue that pattern.

The second initial topic should cover:

past simple vs past continuous vs past perfect in practical storytelling.

The third initial topic should demonstrate:

present perfect vs past simple.

The architecture must make adding future topics easy.

Examples of later topics include articles, conditionals, question formation, word order, common verb-preposition combinations and other small areas that intermediate learners are often expected to already know.

TRANSLATION DRILLS

Support Czech -> English translation exercises.

The learner prefers receiving the idea in Czech without being given the target English structure as a hint.

Example:

“Když jsem dnes přišel do školy, hodina už začala.”

The learner produces the English sentence.

For controlled exercises, maintain accepted answers or patterns.

Do not falsely claim that simple string comparison can perfectly judge arbitrary English.

For open translations where multiple answers may be correct, show a reference answer and allow the learner to grade their own answer as:

correct
minor problem
wrong

Keep the evaluation layer behind an interface so an AI evaluator can be added safely later.

REAL-LIFE SCENARIOS

Lessons should eventually lead into practical tasks.

Implement at least one complete initial scenario:

Hotel check-in.

The flow should contain useful vocabulary and phrases, short preparation, a guided interaction and productive responses.

The user should need to communicate meaning rather than select canned responses.

Also provide initial scenario structures/content for:

ordering food or coffee
train/bus travel
talking to a teacher or university staff member

A scenario should be able to create review items from mistakes made during the scenario.

LESSON STRUCTURE

A normal lesson should follow approximately this learning sequence:

Short goal and context.

Small amount of explanation.

Useful target vocabulary/phrases.

Controlled practice.

Retrieval without visible answers.

Mixed practice with previously learned material.

Real-life application.

Session summary.

Mistakes are scheduled for future review automatically.

Do not force the learner to complete large lessons when they only have five minutes.

QUICK SESSION ENGINE

A quick session should prioritize:

items already due
recent mistakes
weak concepts
then a small amount of new material if appropriate

Do not let new material push overdue reviews away.

A normal quick session may start with roughly 10–15 prompts, but mistakes can extend the session because failed items need delayed retrieval.

The session finishes when the initial queue has been processed and every item failed during the session has been successfully retrieved again after a short delay.

DATA MODEL

Create clear TypeScript models and persistence for at least:

VocabularyEntry
Skill
Lesson
Exercise
ReviewItem
Attempt
Mistake
Scenario
UserSettings

Attempt should retain enough information to reconstruct learning history.

Store timestamps and response duration.

Do not store only aggregate scores.

TECHNOLOGY

Build the first version as a local-first Progressive Web App.

Use:

React
Vite
TypeScript
Tailwind CSS
IndexedDB through Dexie
React Router using HashRouter so GitHub Pages routing remains reliable
vite-plugin-pwa
Vitest
React Testing Library
Playwright
ESLint
Prettier
npm

Do not add a backend to V1.

Do not add authentication.

Do not expose or require an OpenAI API key.

Architect free-response evaluation through an interface/provider so an AI evaluator can be added later through a secure backend.

OFFLINE AND MOBILE

The app must work well on a phone.

The primary use case includes practising while travelling by bus or walking.

Make the application installable as a PWA.

Previously loaded content and the local learning database should work offline.

Use large touch targets and a clean interface.

Do not create a childish visual style.

Use a minimal, adult, modern interface.

USER INTERFACE LANGUAGE

Use English as the primary interface language because additional exposure is useful.

Allow short Czech explanations where necessary.

Exercises themselves can intentionally switch between Czech and English depending on their purpose.

VOICE

Design the exercise system so spoken answers can be supported later.

If the browser supports speech recognition through a safe progressive-enhancement approach, it may be added as an optional input method, but text input must always work and voice functionality must never block the core application.

DATA SAFETY

Because V1 has no account or cloud sync, provide:

Export all learning data as JSON.

Import the exported JSON.

Export personal vocabulary as CSV.

Use versioned IndexedDB migrations so future application versions do not silently destroy progress.

CONTENT ARCHITECTURE

Built-in lessons and exercises should be separated from application logic.

Store seed learning content in easily editable structured files.

User-created vocabulary and learning history live in IndexedDB.

Adding a new grammar module or scenario should not require editing the scheduling engine.

STATISTICS

Do not optimise statistics for engagement.

Show useful learning information such as:

reviews due
mastered items
items currently learning
retention / first-attempt accuracy
recent mistakes
most frequent error categories
weakest topics
response-time trend where meaningful

Allow opening a weak topic directly from the progress screen.

FIRST VERSION SCOPE

The first usable vertical slice must contain:

working home screen
quick review engine
spaced scheduling
mistake and retry loop
persistent IndexedDB storage
add/edit personal vocabulary
vocabulary practice
IN / ON / AT drill module
basic tense drill content
at least one real-life scenario
mistake notebook
basic progress page
JSON backup/restore
CSV vocabulary export
PWA/offline support
GitHub Pages deployment workflow
automated tests for important learning logic

Do not stop after scaffolding these features.

Deliver a usable application.

ENGINEERING QUALITY

Separate pedagogy/domain logic from React UI components.

The scheduler and answer-evaluation logic should be testable without rendering React.

Use clear names and avoid unnecessary abstractions.

Do not introduce dependencies unless they provide a clear benefit.

Add unit tests specifically covering:

wrong-answer requeue behaviour
review scheduling
mastery promotion/demotion
hint-assisted answers
persistence
answer normalization

Add at least one Playwright end-to-end test covering:

start quick review -> answer incorrectly -> receive correction -> encounter the item again -> answer correctly -> session completes -> progress remains after page reload.

ACCESSIBILITY

Use semantic HTML.

Inputs must have labels.

Interactive elements must be keyboard accessible.

Maintain good contrast.

VERIFICATION

Before considering the task finished:

run lint
run unit tests
run the production build
run the relevant Playwright test

Fix failures rather than merely reporting them.

Create a clear README explaining local development, tests, deployment, backup/import and the core learning philosophy.

Create an AGENTS.md describing the important architectural and pedagogical rules so future coding agents do not accidentally turn the product into a generic flashcard or gamification application.

GITHUB PAGES

Configure automated deployment using GitHub Actions.

The repository name may not be known in advance, so make deployment configuration robust for a GitHub Pages project site.

Use routing compatible with static GitHub Pages.

WORKFLOW

First inspect the repository.

If it is empty, initialise the project using the stack defined above.

Before writing large amounts of code, briefly document the architecture you intend to build.

Then implement the vertical slice.

Do not repeatedly stop to ask for minor design decisions.

When something is unspecified, choose the simplest implementation consistent with this specification.

Only ask me a question when missing information would block implementation or force an irreversible major architectural decision.

At the end, report:

what was implemented
important architectural decisions
tests executed and their results
how to run the app locally
how to deploy/open it from GitHub Pages
known limitations
the most sensible next development milestone
PRINTABLE PRACTICE

The learner finds handwriting useful for retention and automaticity.

Support optional printable practice worksheets. Paper exercises are not a replacement for the digital learning system but another input method.

Allow the learner to generate a printable worksheet based on:

- reviews currently due
- recent mistakes
- a selected grammar topic
- selected vocabulary
- a lesson
- weak areas

Provide printer-friendly A4 layouts without navigation or unnecessary UI.

Useful worksheet types include:

- Czech -> English sentence translation
- fill in the correct preposition
- tense transformation
- sentence repair
- vocabulary recall
- cloze exercises
- short free-production prompts

Do not print the answers directly next to the exercises.

Provide a separate answer key.

After completing a worksheet on paper, allow the learner to open the worksheet in the app and record each item as:

Correct
Minor mistake
Wrong

For incorrect items, optionally allow entering what the learner wrote.

These results must feed into the same Attempt, Mistake, mastery and spaced-review systems as normal digital exercises.

Each generated worksheet should have an internal ID so its results can later be recorded digitally.

For V1, normal browser printing / Save as PDF is sufficient. Do not build a complicated PDF-generation backend.

The print layout should work well on standard A4 paper.


VOCABULARY CONTENT ARCHITECTURE AND FIRST IMPLEMENTATION

Before implementing the Vocabulary module, refine its content architecture.

The vocabulary system must NOT be designed primarily around words from a single book or as a generic flashcard collection.

The learner needs three complementary vocabulary sources:

1. CURRICULUM VOCABULARY

Create structured vocabulary sets attached to lessons/topics.

The model should be inspired by good coursebook progression:
a lesson introduces a coherent set of useful vocabulary and phrases,
teaches them,
practises retrieval,
and later requires them in realistic communication.

Vocabulary difficulty should be able to progress from intermediate B1/B2 toward strong B2/C1.

Important curriculum domains include:

- everyday practical English
- university and studying
- engineering and technical English
- meetings and project work
- travel and accommodation
- workplace communication
- social conversation
- describing problems and solutions
- expressing opinions, disagreement and uncertainty
- less commonly taught everyday objects and actions

The learner is a mechatronics university student, so technical English is particularly valuable.

Examples of technical domains that should be possible later:

- mechanics
- electronics
- automation
- control engineering
- measurement
- manufacturing
- programming
- troubleshooting
- laboratory work
- technical presentations

Do not hard-code the entire curriculum now.

Instead, design a reusable content structure where lessons can own vocabulary sets and vocabulary can also appear in multiple lessons/topics.

2. PERSONAL VOCABULARY

The learner must be able to add a word or phrase encountered anywhere:
books, lectures, conversations, work, videos, technical documentation, etc.

Personal vocabulary joins the same scheduling and mastery system as built-in material.

It must be possible to associate a personal entry with:
- a lesson
- one or more topics
- source/context
- technical/everyday/academic/etc. category

3. MISTAKE-DERIVED LANGUAGE

Words, collocations and phrases generated from the learner's real mistakes should also feed the same learning system.

Example:
"arrive to Prague"
should create practice around the conceptual pattern
"arrive in / arrive at",
not merely repeat the original sentence.

VOCABULARY LEARNING PHILOSOPHY

Do not reduce vocabulary learning to front/back cards.

A word should progress through several levels:

1. recognition
2. meaning recall
3. English production from Czech/context
4. collocation or phrase recall
5. use inside a sentence
6. use in a different context
7. use inside a realistic task or scenario

Active vocabulary should require productive use before mastery.

Passive vocabulary may require less production.

LESSON INTEGRATION

Lessons should be able to define:

- title
- level
- topic/domain
- communicative goal
- target vocabulary
- target phrases/collocations
- grammar focus
- controlled exercises
- productive exercises
- real-life task/scenario

Example conceptual lesson:

University: Discussing a project deadline

Vocabulary:
deadline
requirement
feasible
approach
estimate
postpone
clarify
submit
drawback
alternative

The final task should require the learner to actually use several of these items to solve a realistic communication problem.

TECHNICAL VOCABULARY

Technical language should not consist only of translations of nouns.

Include:
- useful verbs
- adjective/noun combinations
- common technical collocations
- phrases used when explaining systems
- phrases for describing cause/effect
- troubleshooting language
- measurement and uncertainty language
- presentation/discussion language

For example, learning "bearing" alone is less useful than eventually understanding and producing language such as:
"the bearing is worn"
"replace the bearing"
"bearing failure"
"excessive bearing play"

EVERYDAY VOCABULARY

Also support vocabulary that native speakers use routinely but language courses often neglect, especially names of objects and ordinary actions.

Examples of domains:
home
kitchen
tools
clothing
transport
shops
repairs
cleaning
body movement
weather
administrative situations

PERSONAL WORD INBOX

Provide a very fast way to capture a word.

The minimal flow should allow:
English word/phrase
Czech meaning or note
Save

The learner should not be forced to complete a large form when quickly saving a word.

Additional metadata can be added later.

Keep the full edit form available.

ARCHITECTURE

VocabularyEntry should not own all curriculum structure.

Create appropriate relationships between:
VocabularyEntry
VocabularySet / vocabulary grouping
Lesson
Topic
Skill

Built-in content and user-created content should use compatible domain models where practical.

Do not make built-in lesson vocabulary impossible to edit or extend in the future.

FIRST IMPLEMENTATION

Now implement the Vocabulary module using this architecture and the existing learning pipeline.

For demonstration content, do NOT focus on The Alchemist.

Instead seed a small representative set from three areas:

A. University / study English
B. Engineering / technical English
C. Practical everyday English

Keep the seed small; it exists to test the architecture, not to create the full curriculum.

Also allow the user to add arbitrary personal words.

Follow all existing rules in PRODUCT_SPEC.md and AGENTS.md.

Implement:
- vocabulary library
- quick add
- full add/edit
- topic/lesson/category relationships
- active/passive distinction
- vocabulary practice through the existing scheduler
- productive recall progression
- persistence
- filtering/search
- tests

Do not implement the full curriculum yet.

At the end, report how the content model supports future Headway-like lesson progression without coupling lesson content to the learning engine.

Run lint, tests, production build and relevant Playwright tests before finishing.

VOCABULARY SIMPLIFICATION — CURRENT V1 RULES

This refinement supersedes the earlier vocabulary UI and content-management workflow wherever they conflict.

V1 is lesson-based vocabulary learning, with no semantic AI evaluation, automatic enrichment or complex vocabulary database workflow. Each lesson has title, topic, difficulty and approximately 15–25 useful words/phrases, Czech meanings and optional short examples.

Modes:
1. LEARN: show the complete vocabulary list with English, Czech and examples.
2. VOCABULARY TEST: typed English → Czech, Czech → English or mixed direct recall. Wrong answers use first-error feedback, correction, delayed retrieval after approximately five prompts and future scheduling.
3. USE IN CONTEXT: use vocabulary from the same lesson in sentence gaps, short translation/phrase tasks, situation-based word production or controlled short sentences. No claim of semantic AI grading.

Keep recall progress separate from context use. A lesson passes only after the learner can recall its expressions, understand them in context and use them in simple sentences. This practice pass does not replace the spaced mastery rules.

Initial lessons, each with approximately 15–25 practical expressions, collocations and phrases:
- Hotel / reception
- Talking to a teacher
- University office / study department
- Airport
- Train and bus travel
- Factory / production
- Office / project work
- Technical troubleshooting
- Restaurant / café
- Everyday practical problems

Progress from B1/B2 toward stronger B2 vocabulary. Prefer expressions such as meet the deadline, submit an assignment, ask for clarification, boarding pass, departure gate, carry-on baggage, production line, quality control, machine failure and troubleshoot a problem over isolated rare nouns.

Personal capture needs only English word/phrase and Czech meaning. No required metadata, CEFR level, part of speech, collocations, categories or explanations. Personal words join the same review system.

The library primarily shows lessons, personal words, learning state and progress; management is secondary. The main flow is Home → choose lesson → review vocabulary → test vocabulary → use vocabulary in context → review mistakes later.

Reuse the existing scheduler, persistence, correction loop and mastery. Preserve earlier learning data. Test lesson loading, both recall directions, context exercises, wrong-answer retry, lesson progress persistence and personal-word addition. Run lint, tests, production build and relevant Playwright tests before completion.


PRINTABLE PAPER PRACTICE — IMPLEMENTATION REQUIREMENTS

Implement printable paper practice for the existing lesson-based English learning system.

The learner finds handwriting useful for retention and automaticity.

The goal is NOT to replace the digital learning system, but to offer a paper-based practice mode that still feeds back into the same mistake, mastery and spaced-review system.

Follow PRODUCT_SPEC.md and AGENTS.md.

CORE WORKFLOW

The user should be able to:

1. Open a vocabulary lesson.
2. Choose “Printable practice”.
3. Select the type of worksheet.
4. Generate a clean A4 worksheet.
5. Print it or save it as PDF using the browser.
6. Complete it by hand.
7. Open the same worksheet later in the app.
8. Check answers using a separate answer key.
9. Record results digitally.
10. Wrong answers must enter the same review and mistake system as normal digital exercises.

PRINTABLE WORKSHEET TYPES

Support at least:

1. Vocabulary recall
- English -> Czech
- Czech -> English
- mixed direction

2. Fill in the word
Use lesson vocabulary inside sentences.

Example:
“The flight was ______ by two hours.”

3. Phrase / collocation recall

Example:
“________ the deadline”

Expected:
“meet”

4. Sentence translation

Short Czech -> English sentences using vocabulary from the selected lesson.

5. Sentence repair

Example:
“I need submit my assignment until Friday.”

Learner rewrites the sentence correctly.

6. Mixed lesson test

Create a longer worksheet combining:
- vocabulary recall
- context gaps
- phrase recall
- short translations

This should be useful as an end-of-lesson paper test.

WORKSHEET GENERATION

A worksheet should be generated from:

- selected lesson
- selected vocabulary set
- due reviews
- recent mistakes
- weak items

For V1, prioritize lesson-based generation.

Allow the user to choose approximately:

- Short: 10 questions
- Medium: 20 questions
- Long: 30–40 questions

Avoid unnecessary duplicate questions.

Use different sentence variants where available.

Do not make every question use the same exercise type unless the user explicitly selects a focused worksheet.

PRINT LAYOUT

Create a clean printer-friendly A4 layout.

Requirements:

- no app navigation in print
- large readable text
- enough whitespace for handwriting
- clear numbering
- lesson title
- worksheet ID
- optional date field
- optional learner name field
- page breaks that do not split questions awkwardly

Use CSS print styles.

Do NOT build a server-side PDF generator.

Browser Print / Save as PDF is sufficient for V1.

ANSWER KEY

Do not print answers directly with the worksheet.

Provide a separate “Answer key” view.

The answer key should contain:

- question number
- expected answer
- acceptable variants where available
- short explanation where useful

For open translation questions where multiple answers may be correct, show a reference answer and clearly indicate that other natural answers may also be valid.

PAPER RESULT ENTRY

Every generated worksheet must receive a persistent internal worksheet ID.

Store:

- worksheet ID
- lesson
- creation date
- included exercise IDs / concepts
- exercise type
- result state
- completion date

After completing the worksheet on paper, the learner should be able to open it in the app and record each item as:

- Correct
- Minor problem
- Wrong

For wrong or minor answers, optionally allow entering what the learner wrote.

Do NOT require manually typing every correct answer into the app.

The result-entry UI should be fast.

Example:

1. ✓ Correct
2. ✓ Correct
3. ✗ Wrong
4. ~ Minor problem
5. ✓ Correct

SUBMITTING PAPER RESULTS

When paper results are submitted:

Correct:
record a successful attempt.

Minor problem:
record a weaker attempt and schedule earlier review.

Wrong:
create/update mistake data and schedule the concept for near-term review.

Paper attempts must use the same:
- scheduler
- mastery system
- mistake tracking
- progress statistics

as digital exercises.

Do not create a separate paper-learning system.

IMPORTANT PEDAGOGICAL RULE

A learner should not be able to mark an item as mastered only because they saw the answer key.

Viewing the answer key means the item was assisted.

If an incorrect item is revealed in the answer key, it should require later unassisted retrieval before mastery can increase.

LESSON INTEGRATION

Every lesson page should include:

Learn
Vocabulary Test
Use in Context
Printable Practice

Printable Practice should use the same lesson vocabulary and phrases.

The lesson progress screen should be able to show that paper practice was completed, but paper practice should not be mandatory to pass the lesson.

MISTAKE WORKSHEETS

Also support generating a worksheet from recent mistakes.

Example:

“Practice my recent mistakes”

This should select concepts the learner recently answered incorrectly across vocabulary and grammar.

This is especially important because the learner wants to repeatedly confront weak areas until they become automatic.

PERSISTENCE

Store generated worksheets in IndexedDB.

A page reload must not lose:
- generated worksheets
- worksheet contents
- submitted results

Old worksheets should remain viewable.

Allow deletion of worksheets from history, but require confirmation.

UI

Keep the UI minimal and adult.

Suggested structure:

Printable practice
→ Choose source
→ Choose worksheet type
→ Choose length
→ Generate
→ Preview
→ Print

Worksheet history:
- lesson
- date
- number of questions
- completed / not completed
- score/result summary
- Open
- Enter results

TESTING

Add unit/integration tests for:

- worksheet generation
- lesson-based question selection
- avoiding unnecessary duplicates
- persistent worksheet IDs
- answer-key separation
- paper result submission
- wrong paper answer creating/updating mistake data
- scheduling after paper attempts
- assisted answer not increasing mastery
- persistence after reload

Add Playwright flow:

open lesson
→ generate printable worksheet
→ open print preview page
→ open answer key
→ enter mixed paper results
→ submit
→ verify wrong item enters review system
→ reload
→ verify worksheet and results persist

Run:
- lint
- unit/integration tests
- production build
- relevant Playwright tests

Fix failures before finishing.

Do not implement:
- AI evaluation
- automatic OCR
- scanning handwritten worksheets
- server-side PDFs
- cloud sync

At the end report:
- what was implemented
- how printable practice integrates with the existing learning engine
- important files changed
- tests and results
- known limitations
- recommended next step

---

# JSON backup and restore (authorized refinement, 2026-10-17)

Implement JSON backup and restore for all user learning data.

Goal: Protect the learner's progress before adding more features. Follow PRODUCT_SPEC.md and AGENTS.md.

## BACKUP

Add an easy “Export backup” action. Export all user-created and user-progress data into one JSON file. The backup must include at least:

- vocabulary entries
- lesson progress
- review state
- attempts
- mistakes
- mastery state
- generated worksheets
- worksheet results
- settings
- any other persisted user learning data

Do not export static built-in lesson content unless necessary for referential integrity.

Include backup metadata:

- schema version
- app version if available
- export timestamp
- data version

Use a human-readable JSON structure where practical.

## RESTORE

Add “Import backup”. The user selects a JSON backup file. Before modifying the database:

1. Parse the file.
2. Validate the schema.
3. Check backup version compatibility.
4. Show a summary of what will be restored.
5. Require explicit confirmation.

Do not destroy existing data silently. For V1, support two restore modes:

1. Replace current local learning data
2. Cancel

Do not attempt complicated merging yet. Before replacement:

- create an automatic temporary safety backup in memory or downloadable form if practical
- clearly warn the user that current local progress will be replaced

If restore fails at any stage, keep the existing database unchanged.

## VERSIONING

Design backup format so future versions can migrate older backups. Add `schemaVersion` at the backup root. Keep backup migrations separate from UI code.

## PERSISTENCE SAFETY

Restore should run transactionally where possible. Do not partially import half a backup. After successful restore:

- reload/reinitialize application state
- verify restored data is available
- show success confirmation

## SETTINGS / UI

Add a simple Data / Backup section. Suggested actions: Export backup, Import backup. Show last export date if available and current local-data status. Do not overcomplicate the UI.

## OPTIONAL CSV

Keep the existing vocabulary CSV export if already present or add a simple CSV export for personal vocabulary if it is low effort. JSON remains the authoritative full backup format.

## TESTS

Add tests for:

- exporting all persisted learning data
- valid backup structure
- schema version
- successful restore
- failed validation leaving existing data untouched
- replacement restore
- worksheets surviving export/import
- vocabulary surviving export/import
- mistakes and review schedules surviving export/import
- progress surviving reload after restore

Add a Playwright flow:

create learning progress → add personal word → create/grade worksheet → export backup → modify/delete some local data → import backup → confirm replacement → verify original progress is restored → reload → verify persistence

Run lint, unit/integration tests, production build and relevant Playwright tests. Fix failures before finishing. Do not implement cloud sync in this task.

At the end report what was implemented, backup format, restore safety behaviour, tests and results, known limitations and recommended next step.

---

# Weak Areas and expanded curriculum (authorized refinement, 2026-10-17)

Implement two additions:

A) Mistakes / Weak Areas
B) Expand the lesson curriculum with 10 additional lessons

Follow PRODUCT_SPEC.md and AGENTS.md.

PART A — MISTAKES / WEAK AREAS

Implement a focused Mistakes / Weak Areas module using the existing attempt, mistake, mastery and scheduler data.

Goal:
Give the learner one place to see what they repeatedly get wrong and start targeted practice directly from those weak areas.

CORE VIEW

Add a Mistakes / Weak Areas page accessible from Home.

Show:
- recent mistakes
- most repeated mistakes
- weakest concepts
- weak lessons/topics
- overdue weak items

Do not use gamification.

MISTAKE GROUPING

Group repeated mistakes by concept where possible.

Examples:
- arrive to Prague
- arrive to school
- arrive to the hotel

should be grouped under:
arrive + in / at, not arrive + to

For vocabulary:
group by word/phrase.

For grammar:
group by concept/skill.

For lesson/context exercises:
link back to source lesson when possible.

WEAKNESS SIGNAL

Create a simple transparent weakness score based on:
- recent incorrect attempts
- repeated failures
- current mastery state
- due/overdue review
- first-attempt accuracy
- recency

Prefer labels:
- Needs attention
- Weak
- Improving
- Stable

Keep scoring logic in the domain layer and test it.

DIRECT ACTIONS

Each weak concept should provide:
- Practice now
- Review examples
- Open lesson
- View mistake history

Practice now must reuse the existing learning engine:
- typed recall where appropriate
- correction loop
- five-prompt delayed retry
- future scheduling
- mastery updates

Do not build a second engine.

RECENT MISTAKES

Show:
- date/time
- prompt
- learner answer
- correct/reference answer
- category
- source lesson/topic
- current status

MISTAKE DETAIL

Show:
- concept/target
- short explanation
- recent incorrect examples
- correct examples
- occurrence count
- last mistake date
- next review
- mastery state
- source lesson/topic

PAPER AND DIGITAL

Printable-practice mistakes must appear together with digital mistakes.

FILTERS

Allow:
- vocabulary
- grammar
- lesson/context
- recent
- repeated
- mastered-but-relapsed

HOME INTEGRATION

Home should show a small Weak Areas card such as:

“3 concepts need attention”

with:
“Practice weak areas”

PROGRESS INTEGRATION

Show:
- most frequent mistake categories
- weakest lessons/topics
- current weak concepts
- recent improvement where meaningful

Do not add meaningless charts.

PART B — ADD 10 NEW LESSONS

The current 10-lesson curriculum works well.

Add 10 more lessons, for a total of 20.

Keep the same lesson architecture:
- Learn
- Vocabulary Test
- Use in Context
- Printable Practice

Each lesson should have approximately 15–25 useful words/phrases.

Prefer useful phrases, collocations and realistic expressions over isolated rare nouns.

Difficulty can range from B2 to C2 where appropriate.

Do not make C1/C2 lessons artificially difficult by filling them with obscure vocabulary. Prefer precise, natural, high-level English used in real situations.

Add these lessons:

11. Job Interview & Career Discussion — B2
Focus on:
- introducing experience
- strengths and weaknesses
- responsibilities
- achievements
- problem solving
- motivation
- salary/conditions discussion
- asking intelligent questions

Useful language may include:
relevant experience
responsible for
strengths and weaknesses
career progression
hands-on experience
meet expectations
take initiative
work under pressure
long-term goals
suitable candidate

12. Advanced Meetings & Negotiation — B2/C1
Focus on:
- disagreement
- compromise
- clarification
- trade-offs
- proposing alternatives
- reaching decisions
- politely challenging someone

Useful language may include:
from my perspective
I see your point, however
trade-off
compromise
feasible alternative
raise a concern
reach an agreement
clarify the requirement
underlying issue
reasonable compromise

13. Technical Troubleshooting II — C1
Focus on:
- diagnosing faults
- cause and effect
- intermittent issues
- system behavior
- testing assumptions
- corrective actions

Include phrases such as:
intermittent fault
root cause
failure mode
reproduce the issue
rule out
narrow down
underlying cause
corrective action
unexpected behavior
faulty component

14. Mechatronics & Automation — B2/C1
Focus on:
- sensors
- actuators
- PLCs
- control systems
- feedback
- motion
- signal processing
- industrial automation

Include:
actuator
encoder
feedback loop
control signal
setpoint
process variable
closed-loop control
sampling rate
signal noise
response time
dead zone
overshoot
steady state
disturbance
compensation

15. Mechanical Engineering & Manufacturing — B2/C1
Focus on:
- tolerances
- fits
- bearings
- shafts
- machining
- wear
- assembly
- production quality

Include:
tolerance
clearance
interference fit
shaft
bearing
wear
surface finish
machining
assembly
alignment
backlash
fatigue
yield strength
deformation
quality control

16. Measurement, Testing & Uncertainty — C1
Focus on:
- measurement
- calibration
- uncertainty
- accuracy
- repeatability
- error sources
- data interpretation

Include:
measurement uncertainty
accuracy
precision
repeatability
resolution
calibration
offset
drift
systematic error
random error
confidence interval
measurement range
sensitivity
noise
outlier

17. Technical Presentation & Defense — C1
Focus on:
- presenting a project
- explaining design choices
- defending decisions
- answering questions
- describing limitations

Include:
the main objective
design constraint
our approach was based on
the results indicate
the limitation of this method
a reasonable assumption
to justify the choice
to evaluate performance
in comparison with
further improvement

18. Everyday Problems & Complaints — C1
Focus on high-level but practical daily communication:
- complaint handling
- refunds
- damaged goods
- missed bookings
- wrong bills
- service problems
- explaining complex everyday issues

Useful language:
I’d like to raise an issue
there seems to be a discrepancy
I was charged for
the item arrived damaged
I’d appreciate a refund
this does not match
the problem occurred when
could you clarify
I’d like this resolved
I was under the impression that

19. Advanced Everyday English — C1/C2
Focus on natural high-level everyday language, not academic jargon.

Use:
- nuanced reactions
- uncertainty
- subtle disagreement
- explaining impressions
- describing annoying/awkward situations
- natural idiomatic but broadly useful phrases

Examples:
to some extent
that being said
I’m not entirely convinced
it turned out that
I ended up
it caught me off guard
I can’t quite put my finger on it
it doesn’t add up
I’d rather not jump to conclusions
it’s not as straightforward as it seems

20. Academic & Professional English — C1/C2
Focus on:
- precise discussion
- evaluation
- argumentation
- uncertainty
- evidence
- conclusions
- limitations
- recommendations

Include:
to assess whether
to account for
to be consistent with
to arise from
to a significant extent
to draw a conclusion
to support the assumption
to challenge the claim
a major drawback
a reasonable interpretation
the available evidence
a potential limitation
from a practical standpoint

CONTENT QUALITY

For every new lesson:
- avoid trivial filler
- avoid obscure dictionary-only vocabulary
- use realistic examples
- include phrases/collocations, not only individual words
- ensure Czech translations are accurate
- include at least two example sentences where the current lesson format supports it
- make context exercises actually test meaning/use, not just copy the example sentence

For technical lessons:
prioritize language that an engineering student would genuinely use in:
- university
- laboratories
- project work
- technical documentation
- presentations
- troubleshooting
- industry

TESTING

Add tests for:
- new lesson loading
- lesson progress
- context exercise generation
- printable practice compatibility
- Weak Areas grouping
- weakness scoring
- focused weak-area sessions
- paper and digital mistakes combining
- persistence

Run:
- lint
- unit/integration tests
- production build
- relevant Playwright tests

Fix failures before finishing.

At the end report:
- what was implemented
- the 10 new lessons and their levels
- how weakness scoring works
- how weak-area practice reuses the existing engine
- tests and results
- known limitations

---

# V1 release, GitHub Pages and iPhone stabilization (2026-10-17)

Finalize Reflex English V1 for real daily use and deployment to GitHub Pages.

Do not add new learning features in this task.

The goal is to make the current application production-ready, deploy it safely as a GitHub Pages PWA, polish the mobile experience, and verify that it can be used normally on an iPhone.

Follow PRODUCT_SPEC.md and AGENTS.md.

REPOSITORY / DEPLOYMENT TARGET

Repository:
JindrichProchazka/reflex-english

Expected GitHub Pages project URL:
https://JindrichProchazka.github.io/reflex-english/

Configure the app specifically so it works correctly when hosted under the /reflex-english/ subpath.

GITHUB PAGES

Create or verify a GitHub Actions workflow that:

- installs dependencies
- runs lint
- runs tests
- builds the production app
- uploads the build artifact
- deploys it to GitHub Pages

Use the current recommended GitHub Pages Actions approach.

Deployment should run automatically after pushes to the main branch.

Also allow manual workflow dispatch if practical.

Do not require a custom server.

VITE / ROUTING

Verify production configuration for GitHub Pages.

Important:
- static asset paths must work under /reflex-english/
- HashRouter must continue to work correctly
- refreshing/opening nested application routes must not break
- PWA assets and service worker paths must work under the project-site base path

Do not break localhost development.

PWA

Verify and finalize the Progressive Web App configuration.

The app should:

- have a valid web app manifest
- have application name “Reflex English”
- have a short name suitable for the iPhone home screen
- use standalone display mode where supported
- define an appropriate theme/background
- have appropriate application icons
- install correctly from a supported mobile browser
- cache the application shell and built-in learning content
- allow previously loaded learning functionality to work offline
- preserve IndexedDB learning data

Do not make network access mandatory for normal learning.

IOS / SAFARI

Polish for iPhone usage.

Check:
- viewport configuration
- safe areas / notch / Dynamic Island spacing
- touch target sizes
- keyboard interaction
- input fields staying visible when the keyboard opens
- horizontal overflow
- very long words / lesson names wrapping correctly
- printable pages remaining separate from normal mobile UI

Add appropriate Apple-specific metadata where useful for Add to Home Screen.

Do not use brittle iOS-only hacks unless necessary.

MOBILE UX POLISH

Review the existing main flows at approximately:
- 375px width
- 390px width
- 430px width

Prioritize:
- Home
- Lessons
- Vocabulary Test
- Use in Context
- Weak Areas
- Personal vocabulary
- Printable Practice configuration
- Data / Backup

Fix obvious mobile usability issues.

Do not redesign the whole visual identity.

OFFLINE BEHAVIOUR

Verify this scenario:

1. Open deployed application online.
2. Use the application and create progress.
3. Close it.
4. Reopen the installed/cached application without network access.
5. Existing learning content should open.
6. Local progress should remain available.
7. New local attempts should still be stored.

When network returns, no special sync is required because V1 remains local-first.

UPDATE BEHAVIOUR

Because this is a PWA, avoid leaving users permanently stuck on an old cached build.

Implement a sensible update mechanism.

Prefer a simple user-friendly behaviour such as:
- detect a new application version
- show a small “Update available” action
- reload into the new version after confirmation

Do not destroy IndexedDB user progress when updating the application.

DATA SAFETY

Verify that:
- PWA updates do not clear IndexedDB
- application upgrades preserve learning history
- existing backup/restore still works in production

Add a visible reminder in the Data / Backup area that browser-local data should occasionally be backed up.

RELEASE VERSION

Set the application/version metadata to an initial V1 release such as:

1.0.0

Expose the version somewhere unobtrusive, for example in Data / Backup or About.

README

Update README with clear instructions for:

Local development:
npm install
npm run dev

Production build:
npm run build

GitHub Pages deployment

Expected public URL

iPhone installation:
1. Open the deployed site in Safari.
2. Use Share.
3. Choose Add to Home Screen.
4. Launch Reflex English from the home screen.

Explain that learning data is local to each browser/device in V1.

Explain that desktop and iPhone data do NOT automatically synchronize.

Mention JSON backup/restore as the current way to move or protect progress.

TESTING

Add or update automated tests where appropriate.

Run:
- lint
- all unit/integration tests
- production build
- all relevant desktop Playwright tests
- all relevant mobile Playwright tests

Add/verify tests for:
- production base path
- PWA manifest
- offline reopening
- IndexedDB persistence across reloads
- existing learning progress surviving application updates where practically testable
- important mobile routes

Perform a release regression pass covering:

Home
IN / ON / AT
lesson Learn
Vocabulary Test
Use in Context
Weak Areas
Printable Practice
Backup export/import

Fix failures before finishing.

DO NOT

Do not add:
- AI
- backend
- accounts
- cloud synchronization
- new lesson systems
- new learning modes
- gamification

This task is stabilization, deployment and mobile release only.

AT THE END REPORT

Report:

1. What was changed.
2. Exact production URL expected after deployment.
3. GitHub Pages configuration required in repository settings, if any.
4. Whether a commit/push is still required from me.
5. All test results.
6. How to verify the deployment.
7. Exact iPhone installation instructions.
8. Known V1 limitations.
9. Any action I must perform manually before the public app works.

Do not consider the task complete until the production build and release checks pass.

---

# Quick Reflex Drills (2026-10-18)

Add a unified Quick Reflex Drills hub, prominently linked from Home. The hub is the entry point for choosing short grammar/collocation practice, rather than listing every module on Home. Reuse the existing IN / ON / AT session engine, scheduler, correction loop, delayed retry, mastery, Weak Areas and persistence. Do not create another engine or add AI, backend, gamification or cloud sync.

Each drill card shows title, short description, mastery/learning progress, due reviews, recent first-attempt accuracy and recent mistakes. Provide Start Quick (approximately 10 prompts), Start Normal (approximately 20) and Due Review (due concepts only). Use constrained balanced ordering; preserve due priority and failed-retry deadlines. Initial-concept budgets include clean delayed recall, and corrections/closing recall can extend sessions. Keep progress separate per drill, derived from ordinary concept/review/attempt/mistake evidence.

Keep IN / ON / AT available and add:

1. Articles: a, an, the, no article (typed `-`); first mention/known reference, singular countable nouns, professions, general plurals/uncountables, unique things, superlatives, institutions and fixed expressions.
2. Quantifiers: some, any, much, many, few, a few, little, a little; countability, positive/negative/questions and the positive/negative meaning difference of the small-quantity pairs.
3. DO / MAKE / TAKE / HAVE: practical collocations including decisions, mistakes, progress, homework, research, your best, showers, breaks, responsibility, meetings, experience and problems.
4. SAY / TELL / SPEAK / TALK: messages, person objects, that clauses, named languages, conversations and topics.
5. SINCE / FOR / AGO: starting points, durations and completed past references in realistic tense contexts.
6. Present Perfect vs Past Simple: experience, unfinished periods, specific finished times, recent events, already/yet/just and ever/never; produce the complete verb form.
7. Past Simple vs Past Continuous: completed events, background, interruption, simultaneous actions and storytelling; produce the complete verb form.
8. THIS / THAT / THESE / THOSE: singular/plural, near/far and conversational references.
9. WHO / WHICH / THAT: practical defining clauses about people and things; accept valid grammatical alternatives.
10. Common Prepositions: to, for, with and about with high-frequency phrases/verbs.
11. Verb + Preposition Patterns: arrive in/at, depend on, listen to, wait for, ask for, belong to, deal with, agree with, apologize for, apply for and focus on in everyday, university and technical contexts.

Use typed productive recall with realistic short authored sentences; do not default to multiple-choice. Aim for at least 30–50 variants per module where practical and avoid repetitive templates. Where multiple answers are natural, author accepted alternatives or constrain meaning with a short cue rather than pretending literal comparison judges arbitrary English.

Every error follows first-error hint without the full answer, second-error correction, active reproduction, a varied retry after five other completed prompts, repeated delayed retry after further failure, closing recall and earlier spaced review. Failed concepts must appear in Mistakes / Weak Areas and all history must survive reload and backup/restore. A due-only pool must not silently add new items; see QUICK_REFLEX_DRILLS.md for the explicit small-pool spacing limit.

Test module loading, evaluation, retries, balance, sizes, persistence, Weak Areas, mastery/scheduling and a browser journey through the hub, error, delayed recall, completion and reload. Run lint, all unit/integration tests, production build and relevant Playwright regression, fixing failures. Report implemented modules, variant counts, test results and limitations.


---

# Expanded drill content bank and anti-repetition (2026-10-18)

Expand the Quick Reflex Drills content bank substantially and improve anti-repetition behavior.

Goal:
The learner should rarely encounter the exact same sentence twice in a short period. The system should reinforce the language pattern, not make the learner memorize individual prompt sentences.

Do not add new drill modules in this task.

CURRENT MODULES

- IN / ON / AT
- Articles
- Quantifiers
- DO / MAKE / TAKE / HAVE
- SAY / TELL / SPEAK / TALK
- SINCE / FOR / AGO
- Present Perfect vs Past Simple
- Past Simple vs Past Continuous
- THIS / THAT / THESE / THOSE
- WHO / WHICH / THAT
- Common Prepositions
- Verb + Preposition Patterns

CONTENT SIZE

Increase each module to approximately 100–150 high-quality prompt variants where practical.

Target total:
at least approximately 1,200 prompts across the drill system.

Do not satisfy the count by creating near-duplicate sentence templates.

PERSONALIZED CONTENT

Bias examples toward situations relevant to the learner:

- university and lectures
- talking to teachers
- assignments and deadlines
- project work
- engineering / mechatronics
- laboratories
- technical troubleshooting
- manufacturing / production
- measurements and testing
- office / meetings
- commuting
- public transport
- travel
- hotels
- restaurants / cafés
- sports and training
- everyday errands
- household / practical situations
- social conversation

Also keep enough general everyday English so the learner is not over-specialized.

DIFFICULTY DISTRIBUTION

Aim approximately for:

- 25–30% B1
- 45–50% B2
- 20–25% C1

Do not make C1 examples artificially difficult by using obscure vocabulary.

Advanced sentences should be harder because of natural grammar, collocations and context.

CONTENT STYLE

Create original sentences.

Do not copy textbook examples or copyrighted exercise banks.

The style may be inspired by good English coursebooks:
clear, natural, context-rich and pedagogically useful.

Prefer sentences a real person could plausibly say, hear or encounter.

Examples of the desired style:

"The sensor output started fluctuating after the motor warmed up."

"I submitted the assignment yesterday, but I haven't received any feedback yet."

"We need to rule out a wiring fault before replacing the controller."

"She has worked on this project since the beginning of the semester."

"I told the supervisor about the problem before the meeting started."

Avoid generic artificial examples such as:

"The man has a book."
"The girl went to the shop."
"John likes apples."

unless they are genuinely useful for a beginner concept.

VARIETY

Vary:

- sentence subject
- tense
- vocabulary
- sentence length
- grammatical structure
- topic
- formality
- technical vs everyday context
- positive / negative / question forms

Do not create simple lexical substitutions of the same sentence.

Bad:
"I waited for the bus."
"I waited for the train."
"I waited for my friend."

Better:
"I waited for the bus for nearly half an hour."
"We're still waiting for approval from the supervisor."
"Can you wait for me outside the laboratory?"

CONCEPT COVERAGE

Ensure balanced representation of all target concepts.

Examples:

Articles:
- a
- an
- the
- no article

Quantifiers:
- some
- any
- much
- many
- few
- a few
- little
- a little

DO / MAKE / TAKE / HAVE:
balance all four verbs across several collocation types.

SAY / TELL / SPEAK / TALK:
cover distinct usage patterns, not only direct substitutions.

Present Perfect vs Past Simple:
include:
- finished past time
- life experience
- unfinished time
- already / yet / just
- ever / never
- recent consequences
- specific time references

Past Simple vs Past Continuous:
include:
- interrupted actions
- background descriptions
- simultaneous actions
- narrative sequences

Verb + Preposition:
include a broad practical set such as:
- depend on
- focus on
- listen to
- wait for
- ask for
- apply for
- apologize for
- deal with
- agree with
- belong to
- arrive in
- arrive at
- refer to
- result in
- consist of
- contribute to
- participate in
- suffer from
- rely on

TECHNICAL ENGLISH

Use technical examples naturally where appropriate.

Examples should include language relevant to:
- control engineering
- PLCs
- sensors
- actuators
- mechanics
- manufacturing
- measurements
- testing
- troubleshooting

Do not turn every drill into technical English.

ANTI-REPETITION

Improve prompt-selection logic.

Track recently seen prompt IDs per drill.

Deprioritize recently shown exact prompts.

The learner should normally see a substantial number of other prompts before the same exact sentence appears again.

Aim for at least 30 other prompts before exact repetition when the content pool allows it.

Exceptions:
- failed-item delayed retrieval
- scheduled spaced review
- very small due pools

Even during delayed retrieval, prefer a different sentence variant testing the same concept rather than repeating the exact original sentence.

PERSISTENCE

Persist recent-prompt history in IndexedDB so closing/reopening the app does not immediately reset repetition avoidance.

Keep history bounded so it does not grow indefinitely.

CONTENT VALIDATION

Add automated validation for authored drill content.

Check:
- duplicate IDs
- exact duplicate prompts
- near-identical duplicates where practical
- missing accepted answers
- malformed items
- underrepresented target concepts
- minimum prompt count per module

TESTING

Add/update tests for:
- minimum content-bank size
- concept balance
- duplicate detection
- recent-prompt avoidance
- history persistence
- failed concept retry with a different variant
- fallback behavior with small due pools
- existing scheduler and Weak Areas integration

Run:
- lint
- full unit/integration test suite
- production build
- relevant Playwright tests

Do not add AI, backend, cloud sync or new learning modes.

At the end report:
- prompt count per module
- total prompt count
- approximate CEFR distribution
- topic/context distribution
- duplicate validation results
- anti-repetition behavior
- tests and results
- known limitations