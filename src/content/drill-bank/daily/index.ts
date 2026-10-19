import type { DrillModule } from '../../drills';
import { appendAuthored } from './authoring';
import { dailyPrepositions } from './prepositions';
import { dailyArticles } from './articles';
import { dailyQuantifiers } from './quantifiers';
import { dailyCollocations } from './collocations';
import { dailySpeech } from './speech';
import { dailyTime } from './time';
import { dailyPerfectPast } from './perfect-past';
import { dailyNarrative } from './narrative';
import { dailyDemonstratives } from './demonstratives';
import { dailyRelatives } from './relatives';
import { dailyCommon } from './common';
import { dailyVerbs, differConcept } from './verbs';

const sources: Record<string, string> = {
  'in-on-at': dailyPrepositions,
  articles: dailyArticles,
  quantifiers: dailyQuantifiers,
  'do-make-take-have': dailyCollocations,
  'say-tell-speak-talk': dailySpeech,
  'since-for-ago': dailyTime,
  'present-perfect-past-simple': dailyPerfectPast,
  'past-simple-continuous': dailyNarrative,
  'this-that-these-those': dailyDemonstratives,
  'who-which-that': dailyRelatives,
  'common-prepositions': dailyCommon,
  'verb-preposition-patterns': dailyVerbs,
};
export function expandDailyDrills(modules: DrillModule[]) {
  return modules.map((module) =>
    appendAuthored(
      module.id === 'verb-preposition-patterns'
        ? { ...module, concepts: [...module.concepts, differConcept] }
        : module,
      sources[module.id],
    ),
  );
}
