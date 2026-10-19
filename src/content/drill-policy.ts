export const drillTargetCounts: Record<string, number> = {
  'in-on-at': 220,
  articles: 260,
  quantifiers: 220,
  'do-make-take-have': 220,
  'say-tell-speak-talk': 200,
  'since-for-ago': 180,
  'present-perfect-past-simple': 220,
  'past-simple-continuous': 200,
  'this-that-these-those': 160,
  'who-which-that': 160,
  'common-prepositions': 240,
  'verb-preposition-patterns': 280,
};
export const domainTargets = {
  university: 0.18,
  engineering: 0.22,
  workplace: 0.15,
  travel: 0.12,
  everyday: 0.18,
  sport: 0.08,
  advanced: 0.07,
};
// Preserve original editorial tags; map them transparently into the seven
// user-specified reporting domains rather than rewriting historical metadata.
const domains: Record<string, keyof typeof domainTargets> = {
  university: 'university',
  engineering: 'engineering',
  laboratory: 'engineering',
  office: 'workplace',
  manufacturing: 'workplace',
  travel: 'travel',
  commuting: 'travel',
  hospitality: 'travel',
  household: 'everyday',
  errands: 'everyday',
  social: 'everyday',
  sport: 'sport',
  advanced: 'advanced',
};
export const drillDomain = (topic: string) => domains[topic];
