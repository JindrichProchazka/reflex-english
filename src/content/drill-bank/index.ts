import type { DrillModule } from '../drills';
import { bankExercise } from './types';
import { expandDailyDrills } from './daily';
import { legacyB2, legacyTopics } from './legacy-tags';
import { prepositionAdditions } from './prepositions';
import { articleAdditions, additionalArticleConcepts } from './articles';
import { quantifierAdditions } from './quantifiers';
import { collocationAdditions } from './collocations';
import { speechAdditions, additionalSpeechConcepts } from './speech';
import { timeAdditions } from './time';
import { perfectPastAdditions } from './perfect-past';
import { narrativeAdditions } from './narrative';
import { demonstrativeAdditions } from './demonstratives';
import { relativeAdditions } from './relatives';
import { commonPrepositionAdditions } from './common-prepositions';
import { verbPatternAdditions, additionalVerbConcepts } from './verb-patterns';

export function expandDrills(base: DrillModule[]): DrillModule[] {
  const additions = {
    ...prepositionAdditions,
    ...articleAdditions,
    ...quantifierAdditions,
    ...collocationAdditions,
    ...speechAdditions,
    ...timeAdditions,
    ...perfectPastAdditions,
    ...narrativeAdditions,
    ...demonstrativeAdditions,
    ...relativeAdditions,
    ...commonPrepositionAdditions,
    ...verbPatternAdditions,
  };
  const extra = {
    articles: additionalArticleConcepts,
    'say-tell-speak-talk': additionalSpeechConcepts,
    'verb-preposition-patterns': additionalVerbConcepts,
  };
  const known = new Set(base.flatMap((m) => m.concepts.map((c) => c.id)));
  for (const id of Object.keys(additions))
    if (!known.has(id)) throw new Error(`Unknown drill concept ${id}`);
  return expandDailyDrills(
    base.map((m) => ({
      ...m,
      concepts: [
        ...m.concepts.map((c) => ({
          ...c,
          exercises: [
            ...c.exercises.map((e, i) => {
              const topic = legacyTopics[c.id]?.[i];
              if (!topic) throw new Error(`Missing editorial metadata ${e.id}`);
              return {
                ...e,
                acceptedAnswers: e.acceptedAnswers ?? [e.answer],
                level: legacyB2.has(c.id) ? ('B2' as const) : ('B1' as const),
                topic,
              };
            }),
            ...(additions[c.id] ?? []).map((row, i) => bankExercise(c, row, i)),
          ],
        })),
        ...(extra[m.id as keyof typeof extra] ?? []),
      ],
    })),
  );
}
