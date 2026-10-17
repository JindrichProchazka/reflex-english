import type { Attempt, ReviewItem } from './models';
export const DAY = 86_400_000;
export const INTERVALS = [1, 3, 7, 14, 30, 60];
export const newReview = (conceptId: string, now: number): ReviewItem => ({
  conceptId,
  status: 'new',
  dueAt: now,
  intervalIndex: 0,
  successes: [],
  recentReviews: [],
});
export function schedule(previous: ReviewItem, attempt: Attempt): ReviewItem {
  const item = structuredClone(previous);
  item.lastReviewedAt = attempt.at;
  if (!attempt.correct) {
    item.status = item.status === 'mastered' ? 'reviewing' : item.status;
    item.intervalIndex =
      attempt.grade === 'minor' ? Math.max(0, item.intervalIndex - 1) : 0;
    item.lastErrorSession = attempt.sessionId;
    item.recentReviews = [...item.recentReviews, false].slice(-3);
    item.dueAt =
      attempt.at + (attempt.grade === 'minor' ? 6 * 60 * 60_000 : 10 * 60_000);
    return item;
  }
  if (attempt.assistance === 'answer' || attempt.masteryEligible === false) {
    if (attempt.source === 'paper')
      item.dueAt = Math.min(item.dueAt, attempt.at + DAY);
    return item;
  }
  if (item.status === 'new') item.status = 'learning';
  if (item.lastErrorSession === attempt.sessionId) {
    item.dueAt = Math.min(item.dueAt, attempt.at + 10 * 60_000);
    return item;
  }
  if (attempt.assistance === 'hint') {
    item.dueAt = Math.min(item.dueAt, attempt.at + DAY);
    return item;
  }
  if (attempt.productive) item.productiveUseAt = attempt.at;
  const last = item.successes.at(-1);
  // Repeated/copy answers and rapid session restarts cannot manufacture spacing.
  if (
    item.lastAdvancedSession === attempt.sessionId ||
    (last && attempt.at - last.at < DAY)
  )
    return item;
  item.successes.push({
    at: attempt.at,
    sessionId: attempt.sessionId,
    exerciseId: attempt.exerciseId,
    stage: attempt.stage,
    productive: attempt.productive,
    contextId: attempt.contextId,
  });
  item.lastAdvancedSession = attempt.sessionId;
  item.recentReviews = [...item.recentReviews, true].slice(-3);
  if (item.successes.length > 1) item.status = 'reviewing';
  const varied = new Set(item.successes.map((e) => e.exerciseId)).size >= 2;
  const productiveUse =
    (!item.requireProductive || item.productiveUseAt !== undefined) &&
    (item.vocabularyPreference !== 'active' ||
      ['sentence', 'different-context', 'scenario'].every((stage) =>
        item.successes.some((e) => e.stage === stage && e.productive),
      ));
  if (
    item.successes.length >= 4 &&
    attempt.at - item.successes[0].at >= 7 * DAY &&
    item.recentReviews.length === 3 &&
    item.recentReviews.every(Boolean) &&
    varied &&
    productiveUse
  )
    item.status = 'mastered';
  item.dueAt = attempt.at + INTERVALS[item.intervalIndex] * DAY;
  item.intervalIndex = Math.min(item.intervalIndex + 1, INTERVALS.length - 1);
  return item;
}
