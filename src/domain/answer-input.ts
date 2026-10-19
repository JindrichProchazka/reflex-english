import type { Exercise } from './models';

// Explicit module answer spaces, never distractors inferred from the right answer.
const choices: Record<string, string[]> = {
  'in-on-at': ['in', 'on', 'at'],
  articles: ['a', 'an', 'the', '-'],
  quantifiers: [
    'some',
    'any',
    'much',
    'many',
    'few',
    'a few',
    'little',
    'a little',
  ],
  'do-make-take-have': ['do', 'make', 'take', 'have'],
  'say-tell-speak-talk': ['say', 'tell', 'speak', 'talk'],
  'since-for-ago': ['since', 'for', 'ago'],
  'this-that-these-those': ['this', 'that', 'these', 'those'],
  'who-which-that': ['who', 'which', 'that'],
  'common-prepositions': ['to', 'for', 'with', 'about'],
};
export function answerChoices(
  moduleId: string | undefined,
  exercise: Exercise,
) {
  const options = moduleId ? choices[moduleId] : undefined;
  // Old snapshots or future authored forms outside the bounded set stay typed.
  if (exercise.entryId || exercise.evaluation === 'self' || !options) return;
  if (
    !(exercise.acceptedAnswers ?? [exercise.answer]).every((a) =>
      options.includes(a.toLowerCase()),
    )
  )
    return;
  return options;
}

export function lessonResponseType(exercise: Exercise) {
  if (exercise.lessonEvidence === 'understanding') return 'gap';
  if (exercise.lessonEvidence === 'production') return 'sentence';
}
export function responseInstruction(exercise: Exercise) {
  const type = lessonResponseType(exercise);
  return type === 'gap'
    ? 'Type the missing word or phrase.'
    : type === 'sentence'
      ? 'Type the whole sentence.'
      : exercise.instruction;
}
