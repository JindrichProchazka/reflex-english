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
    .replace(/[.!?]+$/, '')
    .trim();
export const phraseEvaluator: AnswerEvaluator = {
  evaluate: (answer, accepted) =>
    accepted.some(
      (value) => normalizePhrase(value) === normalizePhrase(answer),
    ),
};
