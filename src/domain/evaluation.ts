import type { Exercise } from './models';
import { lessonResponseType } from './answer-input';

export interface AnswerEvaluator {
  evaluate(answer: string, accepted: string[]): boolean;
}
export const normalizeAnswer = (answer: string) =>
  answer.normalize('NFKC').trim().toLowerCase();
export const controlledEvaluator: AnswerEvaluator = {
  evaluate: (answer, accepted) =>
    accepted.some(
      (value) => normalizeAnswer(value) === normalizeAnswer(answer),
    ),
};
// Literal checking for authored lesson frames, not semantic sentence grading.
const normalizePhrase = (text: string) =>
  normalizeAnswer(text)
    .replace(/[’‘]/g, "'")
    .replace(/\s+/g, ' ')
    .replace(/\s*([,;:])\s*/g, '$1')
    .replace(/[.!?,;:]+$/, '')
    .trim();
export const phraseEvaluator: AnswerEvaluator = {
  evaluate: (answer, accepted) =>
    accepted.some(
      (value) => normalizePhrase(value) === normalizePhrase(answer),
    ),
};

export function acceptedExerciseAnswers(exercise: Exercise) {
  const accepted = exercise.acceptedAnswers ?? [exercise.answer];
  if (lessonResponseType(exercise) !== 'gap') return accepted;
  // Only an authored, single-gap frame can accept its completed sentence.
  // This also fixes resumed legacy lesson snapshots without rewriting them.
  const frame = exercise.prompt.split('\n').slice(1).join('\n');
  if (frame.split('___').length !== 2) return accepted;
  return [
    ...accepted,
    ...accepted.map((answer) => frame.replace('___', () => answer)),
  ];
}
