import type { Concept, Exercise } from '../../domain/models';
export const drillTopics = [
  'university',
  'engineering',
  'laboratory',
  'manufacturing',
  'office',
  'commuting',
  'travel',
  'hospitality',
  'sport',
  'household',
  'errands',
  'social',
] as const;
export type DrillTopic = (typeof drillTopics)[number];
export type DrillLevel = 'B1' | 'B2' | 'C1';
export interface BankRow {
  level: DrillLevel;
  topic: DrillTopic;
  prompt: string;
  answer?: string;
  alternatives: string[];
}
const row =
  (level: DrillLevel) =>
  (
    topic: DrillTopic,
    prompt: string,
    answer?: string,
    ...alternatives: string[]
  ): BankRow => ({ level, topic, prompt, answer, alternatives });
export const b1 = row('B1'),
  b2 = row('B2'),
  c1 = row('C1');
export type Additions = Record<string, BankRow[]>;
export const prefix = (module: string, additions: Additions): Additions =>
  Object.fromEntries(
    Object.entries(additions).map(([id, rows]) => [
      `drill:${module}:${id}`,
      rows,
    ]),
  );
export function bankExercise(
  concept: Concept,
  row: BankRow,
  index: number,
): Exercise {
  const reference = concept.exercises[0];
  const answer = row.answer ?? reference.answer;
  return {
    ...reference,
    id: `${concept.id}:bank:${index}`,
    contextId: `${concept.id}:bank:${index}`,
    prompt: row.prompt,
    answer,
    acceptedAnswers:
      row.answer === undefined && !row.alternatives.length
        ? (reference.acceptedAnswers ?? [answer])
        : [answer, ...row.alternatives],
    level: row.level,
    topic: row.topic,
  };
}
export function bankConcept(
  owner: string,
  id: string,
  title: string,
  group: string,
  hint: string,
  explanation: string,
  rows: BankRow[],
): Concept {
  const conceptId = `drill:${owner}:${id}`;
  const concept: Concept = {
    id: conceptId,
    title,
    group,
    exercises: [
      {
        id: '',
        conceptId,
        prompt: '',
        answer: group,
        hint,
        explanation,
        productive: true,
        instruction:
          'Type the missing word or phrase. Follow the sentence meaning.',
      },
    ],
  };
  concept.exercises = rows.map((row, i) => bankExercise(concept, row, i));
  return concept;
}
