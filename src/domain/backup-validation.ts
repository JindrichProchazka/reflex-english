// Small strict schema vocabulary, shared by file validation and future migrations.
type Rule = (value: unknown, path: string) => void;
export function invalid(path: string): never {
  throw new Error(`Invalid backup: ${path}.`);
}
export const string: Rule = (v, p) => {
  if (typeof v !== 'string') invalid(p);
};
export const number: Rule = (v, p) => {
  if (typeof v !== 'number' || !Number.isFinite(v) || v < 0) invalid(p);
};
export const integer: Rule = (v, p) => {
  number(v, p);
  if (!Number.isSafeInteger(v)) invalid(p);
};
const signedInteger: Rule = (v, p) => {
  if (typeof v !== 'number' || !Number.isSafeInteger(v)) invalid(p);
};
export const boolean: Rule = (v, p) => {
  if (typeof v !== 'boolean') invalid(p);
};
export const enumeration =
  (...values: (string | number)[]): Rule =>
  (v, p) => {
    if (!values.includes(v as string)) invalid(p);
  };
export const optional =
  (rule: Rule): Rule =>
  (v, p) => {
    if (v !== undefined) rule(v, p);
  };
export const nullable =
  (rule: Rule): Rule =>
  (v, p) => {
    if (v !== null) rule(v, p);
  };
export const array =
  (rule: Rule): Rule =>
  (v, p) => {
    if (!Array.isArray(v)) invalid(p);
    v.forEach((item, i) => rule(item, `${p}[${i}]`));
  };
function record(v: unknown, p: string): asserts v is Record<string, unknown> {
  if (
    !v ||
    typeof v !== 'object' ||
    Array.isArray(v) ||
    Object.getPrototypeOf(v) !== Object.prototype
  )
    invalid(p);
  if (
    Object.keys(v).some((k) =>
      ['__proto__', 'constructor', 'prototype'].includes(k),
    )
  )
    invalid(p);
}
export const dictionary =
  (rule: Rule): Rule =>
  (v, p) => {
    record(v, p);
    Object.entries(v).forEach(([k, item]) => rule(item, `${p}.${k}`));
  };
export const object =
  (fields: Record<string, Rule>): Rule =>
  (v, p) => {
    record(v, p);
    for (const k of Object.keys(v))
      if (!Object.hasOwn(fields, k)) invalid(`${p}.${k} (unsupported field)`);
    for (const [k, rule] of Object.entries(fields)) rule(v[k], `${p}.${k}`);
  };
export const json: Rule = (v, p) => {
  if (v === null || typeof v === 'string' || typeof v === 'boolean') return;
  if (typeof v === 'number' && Number.isFinite(v)) return;
  if (Array.isArray(v)) return array(json)(v, p);
  dictionary(json)(v, p);
};
const strings = array(string),
  ns = optional(number),
  ss = optional(string),
  bs = optional(boolean);
const mastery = enumeration('new', 'learning', 'reviewing', 'mastered');
const stage = enumeration(
  'recognition',
  'meaning-recall',
  'english-production',
  'collocation',
  'sentence',
  'different-context',
  'scenario',
);
const evidence = enumeration('enCs', 'csEn', 'understanding', 'production');
const direction = enumeration('en-cs', 'cs-en', 'mixed');
const mode = enumeration('recall', 'context');
const category = enumeration(
  'academic',
  'technical',
  'everyday',
  'workplace',
  'travel',
  'social',
);
const mistakeCategory = enumeration(
  'preposition',
  'vocabulary',
  'collocation',
  'phrase',
);
const level = enumeration('B1', 'B2', 'C1');
const grade = enumeration('correct', 'minor', 'wrong');
const kind = enumeration('recall', 'gap', 'phrase', 'translation', 'repair');
const exercise = object({
  id: string,
  conceptId: string,
  prompt: string,
  answer: string,
  hint: string,
  explanation: string,
  evaluation: optional(enumeration('controlled', 'self')),
  acceptedAnswers: optional(strings),
  rubric: ss,
  stage: optional(stage),
  contextId: ss,
  productive: bs,
  lessonEvidence: optional(evidence),
  entryId: ss,
  instruction: ss,
  lessonId: ss,
});
const concept = object({
  id: string,
  title: string,
  group: string,
  exercises: array(exercise),
});
const task = object({
  conceptId: string,
  kind: enumeration('initial', 'delayed', 'final', 'interleave'),
  readyAfter: integer,
  priority: ns,
  dueAt: ns,
});
export const rowSchemas: Record<string, Rule> = {
  reviews: object({
    conceptId: string,
    status: mastery,
    dueAt: number,
    intervalIndex: integer,
    successes: array(
      object({
        at: number,
        sessionId: string,
        exerciseId: string,
        stage: optional(stage),
        productive: bs,
        contextId: ss,
      }),
    ),
    recentReviews: array(boolean),
    lastAdvancedSession: ss,
    lastErrorSession: ss,
    lastReviewedAt: ns,
    vocabularyPreference: optional(enumeration('active', 'passive')),
    requireProductive: bs,
    productiveUseAt: ns,
    answerExposedAt: ns,
  }),
  attempts: object({
    id: string,
    sessionId: string,
    conceptId: string,
    exerciseId: string,
    prompt: string,
    expected: string,
    answer: string,
    correct: boolean,
    at: number,
    durationMs: nullable(number),
    assistance: enumeration('none', 'hint', 'answer'),
    taskKind: enumeration('initial', 'delayed', 'final', 'interleave', 'paper'),
    source: enumeration('typed', 'paper'),
    evaluator: enumeration(
      'accepted-answer-v1',
      'self-assessment-v1',
      'paper-self-assessment-v1',
    ),
    worksheetId: ss,
    worksheetItemId: ss,
    answerRecorded: bs,
    masteryEligible: bs,
    exerciseSnapshot: optional(exercise),
    recentExposureBlocked: bs,
    lessonId: ss,
    studyMode: optional(mode),
    lessonEvidence: optional(evidence),
    entryId: ss,
    grade: optional(grade),
    stage: optional(stage),
    productive: bs,
    contextId: ss,
    referenceRevealed: bs,
  }),
  mistakes: object({
    conceptId: string,
    category: mistakeCategory,
    occurrences: integer,
    attemptIds: strings,
    dates: array(number),
    prompt: string,
    answer: string,
    correctAnswer: string,
    explanation: string,
    lastReviewAt: number,
    nextReviewAt: number,
    status: mastery,
    answerRecorded: bs,
  }),
  sessions: object({
    id: string,
    startedAt: number,
    completedAt: ns,
    queue: array(task),
    current: nullable(task),
    exerciseId: string,
    wrongCount: integer,
    processed: integer,
    failed: strings,
    seen: dictionary(integer),
    feedback: enumeration('none', 'hint', 'correction'),
    acquisition: bs,
    module: optional(enumeration('prepositions', 'vocabulary')),
    lessonId: ss,
    studyMode: optional(mode),
    testDirection: optional(direction),
    personalWords: bs,
    worksheetId: ss,
    weakAreaIds: optional(strings),
    content: optional(array(concept)),
    assessment: optional(
      object({
        answer: string,
        durationMs: number,
        at: number,
        referenceRevealed: boolean,
      }),
    ),
    ordering: optional(
      object({
        seed: number,
        recentTargets: strings,
        counts: dictionary(integer),
        lastPresented: dictionary(signedInteger),
        lastConceptId: ss,
      }),
    ),
  }),
  vocabulary: object({
    id: string,
    english: string,
    meaning: string,
    partOfSpeech: string,
    explanation: string,
    collocations: strings,
    examples: strings,
    userSentence: string,
    source: string,
    notes: string,
    tags: strings,
    preference: enumeration('active', 'passive'),
    level,
    category,
    origin: enumeration('curriculum', 'personal', 'mistake'),
    mistakeConceptId: ss,
    createdAt: number,
    updatedAt: number,
  }),
  vocabularySets: object({
    id: string,
    title: string,
    topicIds: strings,
    members: array(
      object({
        entryId: string,
        role: enumeration('word', 'phrase', 'collocation'),
      }),
    ),
  }),
  lessons: object({
    id: string,
    title: string,
    level,
    topicIds: strings,
    communicativeGoal: string,
    vocabularySetIds: strings,
    skillIds: strings,
    grammarFocus: strings,
    controlledExercises: strings,
    productiveExercises: strings,
    task: object({ prompt: string, reference: string, criteria: string }),
  }),
  topics: object({ id: string, title: string, domain: category, parentId: ss }),
  skills: object({ id: string, title: string, description: string }),
  vocabularyLinks: object({
    id: string,
    entryId: string,
    kind: enumeration('topic', 'lesson', 'set'),
    targetId: string,
  }),
  metadata: object({ key: string, value: string }),
  settings: object({ key: string, value: json }),
  studyLessons: object({
    id: string,
    title: string,
    topic: string,
    level: enumeration('B1', 'B1/B2', 'B2', 'B2/C1', 'C1', 'C1/C2'),
    description: string,
    words: array(
      object({
        id: string,
        english: string,
        czech: string,
        examples: (v, p) => {
          strings(v, p);
          if ((v as unknown[]).length !== 2) invalid(p);
        },
        contextExamples: optional((v, p) => {
          strings(v, p);
          if ((v as unknown[]).length !== 2) invalid(p);
        }),
        paperTranslation: ss,
        acceptedCzech: optional(strings),
        acceptedEnglish: optional(strings),
      }),
    ),
  }),
  lessonProgress: object({
    lessonId: string,
    items: dictionary(
      object({ enCs: bs, csEn: bs, understanding: bs, production: bs }),
    ),
    updatedAt: number,
  }),
  worksheets: object({
    id: string,
    title: string,
    lessonId: ss,
    createdAt: number,
    completedAt: ns,
    source: enumeration('lesson', 'selection', 'due', 'mistakes', 'weak'),
    kind: enumeration(
      'recall',
      'gap',
      'phrase',
      'translation',
      'repair',
      'mixed',
    ),
    direction,
    requestedCount: integer,
    questions: array(
      object({
        id: string,
        kind,
        exercise,
        lessonId: ss,
        lessonTitle: ss,
        category: mistakeCategory,
        openEnded: bs,
      }),
    ),
    results: dictionary(object({ grade, writtenAnswer: ss })),
    keyViewedAt: ns,
    revision: integer,
    includeNameDate: bs,
    submittedAssisted: bs,
  }),
};
