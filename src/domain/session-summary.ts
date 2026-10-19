import type { Attempt, Concept, ReviewItem, Session } from './models';
import { firstRetrievals } from './weakness';

export function relativeReview(dueAt: number, now = Date.now()) {
  // Calendar days, not elapsed 24-hour periods (also correct across DST).
  const day = (time: number) => {
    const d = new Date(time);
    return Date.UTC(d.getFullYear(), d.getMonth(), d.getDate());
  };
  const days = Math.round((day(dueAt) - day(now)) / 86400000);
  if (days <= 0) return 'today';
  if (days === 1) return 'tomorrow';
  if (days === 7) return 'in 1 week';
  if (days > 7 && days % 7 === 0) return `in ${days / 7} weeks`;
  return `in ${days} days`;
}

export function sessionSummary(
  session: Session,
  allAttempts: Attempt[],
  reviews: ReviewItem[],
  content: Concept[],
  words: { id: string; english: string }[] = [],
) {
  const attempts = allAttempts.filter((a) => a.sessionId === session.id);
  const first = firstRetrievals(attempts);
  const ids = [...new Set(attempts.map((a) => a.conceptId))];
  const difficult = new Set([
    ...session.failed,
    ...attempts
      .filter(
        (a) =>
          !a.correct || a.assistance !== 'none' || a.masteryEligible === false,
      )
      .map((a) => a.conceptId),
  ]);
  const items = ids.map((id) => {
    const concept = content.find((c) => c.id === id);
    const exercise = concept?.exercises[0];
    const word = words.find((w) => w.id === exercise?.entryId);
    // Immutable old snapshots still have the authored English — Czech explanation.
    const snapshotWord = exercise?.entryId
      ? exercise.explanation.split(' — ')[0]
      : undefined;
    return {
      id,
      title: word?.english ?? snapshotWord ?? concept?.title ?? id,
      review: reviews.find((r) => r.conceptId === id),
      difficult: difficult.has(id),
    };
  });
  return {
    attempts: attempts.length,
    accuracy: first.length
      ? Math.round((first.filter((a) => a.correct).length / first.length) * 100)
      : null,
    revisited: items.filter((i) => i.difficult).length,
    clean: items.filter(
      (i) =>
        !i.difficult && first.some((a) => a.conceptId === i.id && a.correct),
    ).length,
    items,
    weak: items.filter((i) => i.difficult),
  };
}
