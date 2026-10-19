import type { DrillModule } from './drills';
import { drillTopics } from './drill-bank/types';
import { normalizeAnswer } from '../domain/evaluation';
import { drillDomain, domainTargets, drillTargetCounts } from './drill-policy';

const words = (text: string) =>
  text
    .normalize('NFKC')
    .toLowerCase()
    .replace(/[’‘]/g, "'")
    .replace(/[^\p{L}\p{N}_']+/gu, ' ')
    .trim()
    .split(/\s+/);
/** Bounded token edit distance catches short lexical substitutions, not meaning. */
function close(a: string[], b: string[]) {
  if (Math.abs(a.length - b.length) > 2 || Math.min(a.length, b.length) < 8)
    return false;
  let previous = b.map((_, i) => i + 1);
  previous.unshift(0);
  for (let i = 1; i <= a.length; i++) {
    const next = [i];
    for (let j = 1; j <= b.length; j++)
      next[j] = Math.min(
        next[j - 1] + 1,
        previous[j] + 1,
        previous[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1),
      );
    previous = next;
  }
  return previous[b.length] <= 2;
}
export function validateDrillContent(modules: DrillModule[], minimum?: number) {
  const errors: string[] = [],
    duplicates: [string, string][] = [],
    nearDuplicates: [string, string][] = [];
  const levels: Record<string, number> = { B1: 0, B2: 0, C1: 0 },
    topics: Record<string, number> = {},
    domains: Record<string, number> = {};
  let newPrompts = 0,
    richNewPrompts = 0;
  const literal = new Map<string, string>(),
    exactDuplicates: [string, string][] = [];
  const ids = new Set<string>(),
    concepts = new Set<string>(),
    moduleIds = new Set<string>(),
    exact = new Map<string, string>();
  const items: { id: string; tokens: string[] }[] = [];
  const counts = modules.map((module) => {
    if (moduleIds.has(module.id))
      errors.push(`Duplicate module ID: ${module.id}`);
    moduleIds.add(module.id);
    const targets: Record<string, number> = {};
    let count = 0;
    for (const concept of module.concepts) {
      if (concepts.has(concept.id))
        errors.push(`Duplicate concept ID: ${concept.id}`);
      concepts.add(concept.id);
      if (concept.exercises.length < 7)
        errors.push(`Underrepresented concept: ${concept.id}`);
      for (const exercise of concept.exercises) {
        count++;
        if (ids.has(exercise.id))
          errors.push(`Duplicate exercise ID: ${exercise.id}`);
        ids.add(exercise.id);
        if (
          exercise.conceptId !== concept.id ||
          !exercise.id.trim() ||
          !exercise.hint?.trim() ||
          !exercise.explanation?.trim() ||
          !exercise.answer?.trim() ||
          exercise.prompt !== exercise.prompt?.trim() ||
          (exercise.prompt?.match(/___/g)?.length ?? 0) !== 1
        )
          errors.push(`Malformed exercise: ${exercise.id}`);
        if (
          !exercise.acceptedAnswers?.length ||
          exercise.acceptedAnswers.some((a) => !a.trim()) ||
          !exercise.acceptedAnswers.some(
            (a) => normalizeAnswer(a) === normalizeAnswer(exercise.answer),
          )
        )
          errors.push(`Missing accepted answer: ${exercise.id}`);
        if (!exercise.level || !(exercise.level in levels))
          errors.push(`Missing/invalid level: ${exercise.id}`);
        else levels[exercise.level]++;
        if (
          !drillTopics.includes(exercise.topic as (typeof drillTopics)[number])
        )
          errors.push(`Missing/invalid topic: ${exercise.id}`);
        else {
          topics[exercise.topic!] = (topics[exercise.topic!] ?? 0) + 1;
          const domain = drillDomain(exercise.topic!);
          domains[domain] = (domains[domain] ?? 0) + 1;
        }
        targets[concept.group] = (targets[concept.group] ?? 0) + 1;
        const tokens = words(exercise.prompt),
          key = tokens.join(' '),
          prior = exact.get(key);
        if (prior) duplicates.push([prior, exercise.id]);
        else exact.set(key, exercise.id);
        const identical = literal.get(exercise.prompt);
        if (identical) exactDuplicates.push([identical, exercise.id]);
        else literal.set(exercise.prompt, exercise.id);
        if (
          exercise.id.includes(':daily:') ||
          concept.id === 'drill:verb-preposition-patterns:differ'
        ) {
          newPrompts++;
          // Inspectable structural proxy, not an automatic CEFR/semantic verdict.
          if (
            tokens.length >= 14 &&
            /\b(although|because|before|after|while|when|unless|until|despite|rather than|without|which|that|even if|so that|provided|whether|otherwise)\b/i.test(
              exercise.prompt,
            )
          )
            richNewPrompts++;
        }
        items.push({ id: exercise.id, tokens });
      }
    }
    if (count < (minimum ?? drillTargetCounts[module.id] ?? 100))
      errors.push(`Insufficient prompts: ${module.id} (${count})`);
    const conceptSizes = module.concepts.map((c) => c.exercises.length);
    if (Math.max(...conceptSizes) > 3.5 * Math.min(...conceptSizes))
      errors.push(`Concept imbalance: ${module.id}`);
    const minimumShare = Math.min(0.12, 0.35 / Object.keys(targets).length);
    for (const [target, n] of Object.entries(targets))
      if (n / count < minimumShare)
        errors.push(`Underrepresented target: ${module.id} / ${target}`);
    return {
      id: module.id,
      count,
      concepts: module.concepts.length,
      targets,
      conceptCounts: Object.fromEntries(
        module.concepts.map((c) => [c.id, c.exercises.length]),
      ),
    };
  });
  // Shingle candidates avoid quadratic full edit-distance checks across the bank.
  const shingles = new Map<string, number[]>(),
    pairs = new Set<string>();
  items.forEach((item, i) => {
    for (const key of new Set(
      item.tokens.slice(2).map((_, j) => item.tokens.slice(j, j + 3).join(' ')),
    )) {
      for (const previous of shingles.get(key) ?? [])
        pairs.add(`${previous}:${i}`);
      shingles.set(key, [...(shingles.get(key) ?? []), i]);
    }
  });
  for (const key of pairs) {
    const [a, b] = key.split(':').map(Number);
    if (
      items[a].tokens.join(' ') !== items[b].tokens.join(' ') &&
      close(items[a].tokens, items[b].tokens)
    )
      nearDuplicates.push([items[a].id, items[b].id]);
  }
  if (duplicates.length)
    errors.push(`${duplicates.length} normalized exact duplicate prompts`);
  if (modules.length === Object.keys(drillTargetCounts).length) {
    for (const [domain, target] of Object.entries(domainTargets))
      if (Math.abs((domains[domain] ?? 0) / items.length - target) > 0.02)
        errors.push(`Topic imbalance: ${domain}`);
    for (const [level, target] of Object.entries({
      B1: 0.2,
      B2: 0.55,
      C1: 0.25,
    }))
      if (Math.abs(levels[level] / items.length - target) > 0.02)
        errors.push(`Difficulty imbalance: ${level}`);
    if (newPrompts && richNewPrompts / newPrompts < 0.25)
      errors.push('Insufficient richer new contexts');
  }
  return {
    total: items.length,
    modules: counts,
    levels,
    topics,
    domains,
    newPrompts,
    richNewPrompts,
    exactDuplicates,
    duplicates,
    nearDuplicates,
    errors,
  };
}
