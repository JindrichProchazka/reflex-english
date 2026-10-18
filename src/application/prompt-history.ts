import type { LearningDatabase } from '../data/database';
import { drillForConcept } from '../content/drills';
import { concepts as legacyGrammar } from '../content/prepositions';
import type { Concept, PromptHistory, Session } from '../domain/models';
import { PROMPT_HISTORY_LIMIT, rememberPrompt } from '../domain/prompt-history';
import { startSession } from '../domain/session';

export const historyKey = (moduleId: string) => `drill-history:${moduleId}`;
export async function readPromptHistory(
  db: LearningDatabase,
  content: Concept[],
): Promise<PromptHistory> {
  const history: PromptHistory = {};
  for (const concept of content) {
    const owner = drillForConcept(concept.id);
    if (!owner) continue;
    if (!history[owner.id]) {
      const value = (await db.settings.get(historyKey(owner.id)))?.value;
      let recentIds: string[];
      if (
        value &&
        typeof value === 'object' &&
        'version' in value &&
        value.version === 1 &&
        'promptIds' in value &&
        Array.isArray(value.promptIds) &&
        value.promptIds.every((id) => typeof id === 'string')
      ) {
        recentIds = value.promptIds.slice(-PROMPT_HISTORY_LIMIT);
      } else {
        // Bootstrap old progress without duplicating hint/copy attempts on the
        // same presentation. No fabricated timestamps or changes to old rows.
        const attempts = (await db.attempts.toArray())
          .filter(
            (a) =>
              a.source === 'typed' &&
              drillForConcept(a.conceptId)?.id === owner.id,
          )
          .sort((a, b) => a.at - b.at || a.id.localeCompare(b.id));
        recentIds = [];
        let last = '';
        for (const attempt of attempts) {
          const presentation = `${attempt.sessionId}:${attempt.exerciseId}`;
          if (presentation !== last) recentIds.push(attempt.exerciseId);
          last = presentation;
        }
        recentIds = recentIds.slice(-PROMPT_HISTORY_LIMIT);
      }
      history[owner.id] = { conceptIds: [], recentIds };
    }
    history[owner.id].conceptIds.push(concept.id);
  }
  return history;
}
export async function savePromptHistory(
  db: LearningDatabase,
  session: Session,
) {
  for (const [id, entry] of Object.entries(session.promptHistory ?? {}))
    await db.settings.put({
      key: historyKey(id),
      value: {
        version: 1,
        promptIds: entry.recentIds.slice(-PROMPT_HISTORY_LIMIT),
      },
    });
}
export async function startTrackedSession(
  db: LearningDatabase,
  ...args: Parameters<typeof startSession>
) {
  const [id, now, content, reviews, initialIds, deferred, options] = args;
  const session = startSession(
    id,
    now,
    content,
    reviews,
    initialIds,
    deferred,
    { ...options, promptHistory: await readPromptHistory(db, content) },
  );
  await savePromptHistory(db, session);
  return session;
}
export async function refreshPromptHistory(
  db: LearningDatabase,
  session: Session,
) {
  const adoptingLegacy = !session.promptHistory;
  const history = await readPromptHistory(db, session.content ?? legacyGrammar);
  if (!Object.keys(history).length) return;
  session.promptHistory = history;
  if (adoptingLegacy && session.current)
    rememberPrompt(history, session.current.conceptId, session.exerciseId);
}
