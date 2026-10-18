import type { Concept, PromptHistory } from './models';
export const PROMPT_COOLDOWN = 30;
export const PROMPT_HISTORY_LIMIT = 96;
export const historyFor = (
  history: PromptHistory | undefined,
  conceptId: string,
) =>
  Object.values(history ?? {}).find((entry) =>
    entry.conceptIds.includes(conceptId),
  );
export function rememberPrompt(
  history: PromptHistory | undefined,
  conceptId: string,
  exerciseId: string,
) {
  const entry = historyFor(history, conceptId);
  if (entry && entry.recentIds.at(-1) !== exerciseId)
    entry.recentIds = [...entry.recentIds, exerciseId].slice(
      -PROMPT_HISTORY_LIMIT,
    );
}
export function recentVariant(
  concept: Concept,
  recentIds: string[],
  random: () => number,
) {
  const recent = new Set(recentIds.slice(-PROMPT_COOLDOWN));
  const lastForConcept = [...recentIds]
    .reverse()
    .find((id) => concept.exercises.some((e) => e.id === id));
  // A retry must use a different sentence whenever a variant exists, including
  // legacy three-sentence snapshots whose whole pool may be inside the window.
  let pool = concept.exercises.filter(
    (e) => concept.exercises.length === 1 || e.id !== lastForConcept,
  );
  const fresh = pool.filter((e) => !recent.has(e.id));
  if (fresh.length) pool = fresh;
  const oldest = Math.min(...pool.map((e) => recentIds.lastIndexOf(e.id)));
  pool = pool.filter((e) => recentIds.lastIndexOf(e.id) === oldest);
  return pool[Math.min(pool.length - 1, Math.floor(random() * pool.length))];
}
