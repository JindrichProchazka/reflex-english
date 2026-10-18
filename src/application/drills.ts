import type { LearningDatabase } from '../data/database';
import { drillById, drills } from '../content/drills';
import { newId } from '../domain/id';
import { startTrackedSession } from './prompt-history';
import { firstRetrievals } from '../domain/weakness';
import type { ReviewItem, Session } from '../domain/models';

export type DrillSize = 'quick' | 'normal' | 'due';
export const isDue = (review: ReviewItem, now: number) =>
  review.dueAt <= now &&
  (review.status !== 'new' || Boolean(review.lastErrorSession));

export async function loadDrills(db: LearningDatabase, now = Date.now()) {
  const [reviews, attempts, mistakes, sessions] = await db.transaction(
    'r',
    [db.reviews, db.attempts, db.mistakes, db.sessions],
    () =>
      Promise.all([
        db.reviews.toArray(),
        db.attempts.toArray(),
        db.mistakes.toArray(),
        db.sessions.toArray(),
      ]),
  );
  return drills.map((drill) => {
    const ids = new Set(drill.concepts.map((c) => c.id));
    const ownReviews = reviews.filter((r) => ids.has(r.conceptId));
    const first = firstRetrievals(
      attempts.filter(
        (a) => ids.has(a.conceptId) && a.at >= now - 30 * 86_400_000,
      ),
    );
    const counts = {
      new: drill.concepts.length,
      learning: 0,
      reviewing: 0,
      mastered: 0,
    };
    for (const review of ownReviews) {
      counts.new--;
      counts[review.status]++;
    }
    return {
      drill,
      counts,
      due: ownReviews.filter((r) => isDue(r, now)).length,
      accuracy: first.length
        ? Math.round(
            (first.filter((a) => a.correct).length / first.length) * 100,
          )
        : null,
      recentMistakes: mistakes
        .filter(
          (m) =>
            ids.has(m.conceptId) &&
            (m.dates.at(-1) ?? 0) >= now - 30 * 86_400_000,
        )
        .sort((a, b) => (b.dates.at(-1) ?? 0) - (a.dates.at(-1) ?? 0)),
      active: sessions.filter((s) => s.drillId === drill.id && !s.completedAt),
    };
  });
}

export async function beginDrillSession(
  db: LearningDatabase,
  drillId: string,
  size: DrillSize,
  now = Date.now(),
): Promise<Session> {
  const drill = drillById(drillId);
  if (!drill || !['quick', 'normal', 'due'].includes(size))
    throw new Error('Choose a valid drill and session size.');
  return db.transaction(
    'rw',
    db.sessions,
    db.reviews,
    db.attempts,
    db.settings,
    async () => {
      const active = (await db.sessions.toArray()).find(
        (s) => s.drillId === drillId && s.drillSize === size && !s.completedAt,
      );
      if (active) return active;
      const reviews = await db.reviews.toArray();
      const dueIds = new Set(
        reviews.filter((r) => isDue(r, now)).map((r) => r.conceptId),
      );
      const content =
        size === 'due'
          ? drill.concepts.filter((c) => dueIds.has(c.id))
          : drill.concepts;
      if (size === 'due' && content.length < 6)
        throw new Error(
          content.length
            ? 'Due Review needs six distinct due concepts for five intervening questions. Use Quick for a shorter due pool.'
            : 'No concepts are due in this drill.',
        );
      const attempts = await db.attempts.toArray();
      const deferred = content
        .filter((c) => {
          const exposedAt = attempts.reduce(
            (latest, a) =>
              a.conceptId === c.id && a.referenceRevealed
                ? Math.max(latest, a.at)
                : latest,
            reviews.find((r) => r.conceptId === c.id)?.answerExposedAt ??
              -Infinity,
          );
          if (now - exposedAt >= 86_400_000) return false;
          const intervening = attempts.filter(
            (a) =>
              a.at >= exposedAt &&
              a.conceptId !== c.id &&
              a.source === 'typed' &&
              a.correct &&
              a.assistance === 'none',
          );
          return (
            new Set(intervening.map((a) => `${a.sessionId}:${a.exerciseId}`))
              .size < 5
          );
        })
        .map((c) => c.id);
      // A pool containing exclusively freshly revealed answers cannot supply
      // unexposed intervening retrieval. Do not claim copies are clean recall.
      if (deferred.length === content.length)
        throw new Error(
          'All these answers were recently revealed. Practise another drill first or return tomorrow for unassisted retrieval.',
        );
      const session = await startTrackedSession(
        db,
        newId(),
        now,
        content,
        reviews,
        undefined,
        deferred,
        {
          initialLimit:
            size === 'quick' ? 5 : size === 'normal' ? 10 : undefined,
        },
      );
      Object.assign(session, {
        module: 'drill',
        drillId,
        drillSize: size,
        content,
      });
      await db.sessions.add(session);
      return session;
    },
  );
}
