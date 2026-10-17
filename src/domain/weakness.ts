import type { Attempt, Concept, Mastery, Mistake, ReviewItem } from './models';
import { DAY, newReview, schedule } from './scheduler';

export interface WeakTarget {
  concept: Concept;
  groupId: string;
  title: string;
  type: 'grammar' | 'vocabulary' | 'lesson';
  topic: string;
  lessonId?: string;
  lessonTitle?: string;
}
export type WeakLabel = 'Needs attention' | 'Weak' | 'Improving' | 'Stable';
export interface WeakArea {
  id: string;
  title: string;
  targets: WeakTarget[];
  attempts: Attempt[];
  errors: Attempt[];
  occurrences: number;
  lastMistakeAt?: number;
  nextReviewAt?: number;
  mastery: Mastery;
  score: number;
  label: WeakLabel;
  firstAccuracy: number | null;
  overdue: boolean;
  relapsed: boolean;
  improving: boolean;
  signals: Record<string, number>;
  cleanAfterError: number;
}
export interface WeaknessInput {
  targets: WeakTarget[];
  attempts: Attempt[];
  mistakes: Mistake[];
  reviews: ReviewItem[];
}

export function firstRetrievals(attempts: Attempt[]) {
  return attempts.filter(
    (a) =>
      a.assistance === 'none' &&
      (!a.correct || a.masteryEligible !== false) &&
      !a.recentExposureBlocked,
  );
}
function relapsed(attempts: Attempt[], reviews: ReviewItem[]) {
  const byConcept = new Map<string, Attempt[]>();
  for (const a of attempts)
    byConcept.set(a.conceptId, [...(byConcept.get(a.conceptId) ?? []), a]);
  for (const [id, history] of byConcept) {
    const original = reviews.find((r) => r.conceptId === id);
    let state: ReviewItem = {
      ...newReview(id, history[0].at),
      requireProductive: original?.requireProductive,
      vocabularyPreference: original?.vocabularyPreference,
    };
    let lastRelapse = 0;
    for (const a of history) {
      if (!a.correct && state.status === 'mastered') lastRelapse = a.at;
      state = schedule(state, a);
    }
    if (lastRelapse && state.status !== 'mastered') return true;
  }
  return false;
}
export function weaknessScore(
  attempts: Attempt[],
  reviews: ReviewItem[],
  now: number,
) {
  const errors = attempts.filter((a) => !a.correct);
  const first = firstRetrievals(attempts);
  const accuracy = first.length
    ? first.filter((a) => a.correct).length / first.length
    : null;
  const lastError = errors.at(-1)?.at;
  const encounters = (list: Attempt[]) =>
    new Set(list.map((a) => `${a.sessionId}:${a.exerciseId}`)).size;
  const cleanAfterError =
    lastError === undefined
      ? 0
      : first.filter((a) => a.at > lastError && a.correct).length;
  const relevant = reviews.filter(
    (r) =>
      r.lastReviewedAt !== undefined ||
      attempts.some((a) => a.conceptId === r.conceptId),
  );
  const rank: Mastery[] = ['new', 'learning', 'reviewing', 'mastered'];
  const mastery: Mastery = relevant.length
    ? rank[Math.min(...relevant.map((r) => rank.indexOf(r.status)))]
    : 'new';
  const dueAt = relevant.length
    ? Math.min(...relevant.map((r) => r.dueAt))
    : undefined;
  const age =
    lastError === undefined ? Infinity : Math.max(0, now - lastError) / DAY;
  const signals = {
    'Incorrect encounters in the last 7 days': Math.min(
      30,
      encounters(errors.filter((a) => a.at >= now - 7 * DAY)) * 6,
    ),
    'Repeated failed encounters': Math.min(15, encounters(errors) * 3),
    'Current mastery':
      mastery === 'mastered' ? 0 : mastery === 'reviewing' ? 6 : 12,
    'Due or overdue review':
      dueAt !== undefined && dueAt <= now
        ? Math.min(12, 6 + Math.floor((now - dueAt) / DAY))
        : 0,
    'First-attempt accuracy':
      accuracy === null ? 0 : Math.round((1 - accuracy) * 20),
    'Recency of the last error': age < 1 ? 10 : age < 7 ? 6 : age < 30 ? 3 : 0,
    'Clean retrievals since the last error': -Math.min(18, cleanAfterError * 3),
  };
  const score = Math.max(
    0,
    Math.min(
      100,
      Object.values(signals).reduce((a, b) => a + b, 0),
    ),
  );
  const label: WeakLabel =
    score >= 60
      ? 'Needs attention'
      : score >= 35
        ? 'Weak'
        : score >= 15
          ? 'Improving'
          : 'Stable';
  const recent = first.filter((a) => a.at >= now - 7 * DAY),
    previous = first.filter(
      (a) => a.at < now - 7 * DAY && a.at >= now - 14 * DAY,
    );
  const rate = (list: Attempt[]) =>
    list.filter((a) => a.correct).length / list.length;
  const improving =
    cleanAfterError >= 3 ||
    (recent.length >= 3 &&
      previous.length >= 3 &&
      rate(recent) - rate(previous) >= 0.2);
  return {
    score,
    label,
    firstAccuracy: accuracy,
    signals,
    mastery,
    nextReviewAt: dueAt,
    overdue: dueAt !== undefined && dueAt < now && mastery !== 'mastered',
    lastMistakeAt: lastError,
    cleanAfterError,
    improving,
  };
}
export function buildWeakAreas(input: WeaknessInput, now: number): WeakArea[] {
  const groups = new Map<string, WeakTarget[]>();
  const attemptsByConcept = new Map<string, Attempt[]>();
  for (const a of input.attempts) {
    const list = attemptsByConcept.get(a.conceptId) ?? [];
    list.push(a);
    attemptsByConcept.set(a.conceptId, list);
  }
  for (const target of input.targets) {
    const hasEvidence =
      attemptsByConcept.has(target.concept.id) ||
      input.mistakes.some((m) => m.conceptId === target.concept.id);
    if (!hasEvidence) continue;
    groups.set(target.groupId, [...(groups.get(target.groupId) ?? []), target]);
  }
  return [...groups]
    .map(([id, targets]) => {
      const ids = new Set(targets.map((t) => t.concept.id));
      const attempts = targets
        .flatMap((t) => attemptsByConcept.get(t.concept.id) ?? [])
        .sort((a, b) => a.at - b.at || a.id.localeCompare(b.id));
      const reviews = input.reviews.filter((r) => ids.has(r.conceptId));
      const errors = attempts.filter((a) => !a.correct);
      const occurrences = Math.max(
        errors.length,
        input.mistakes
          .filter((m) => ids.has(m.conceptId))
          .reduce((n, m) => n + m.occurrences, 0),
      );
      const signal = weaknessScore(attempts, reviews, now);
      return {
        id,
        title: targets[0].title,
        targets,
        attempts,
        errors,
        occurrences,
        ...signal,
        relapsed: relapsed(attempts, reviews),
      };
    })
    .sort(
      (a, b) =>
        b.score - a.score ||
        (b.lastMistakeAt ?? 0) - (a.lastMistakeAt ?? 0) ||
        a.id.localeCompare(b.id),
    );
}
export const needsPractice = (area: WeakArea) =>
  area.label === 'Needs attention' || area.label === 'Weak';
export type WeakFilter =
  | 'all'
  | 'vocabulary'
  | 'grammar'
  | 'lesson'
  | 'recent'
  | 'repeated'
  | 'relapsed';
export function filterWeakAreas(
  areas: WeakArea[],
  filter: WeakFilter,
  now: number,
) {
  return areas.filter(
    (a) =>
      filter === 'all' ||
      (filter === 'vocabulary' &&
        a.targets.some((t) => t.type !== 'grammar')) ||
      (filter === 'grammar' && a.targets.some((t) => t.type === 'grammar')) ||
      (filter === 'lesson' && a.targets.some((t) => t.type === 'lesson')) ||
      (filter === 'recent' &&
        a.lastMistakeAt !== undefined &&
        a.lastMistakeAt >= now - 7 * DAY) ||
      (filter === 'repeated' && a.occurrences >= 2) ||
      (filter === 'relapsed' && a.relapsed),
  );
}
export function weaknessProgress(areas: WeakArea[]) {
  const categories = new Map<string, number>();
  const lessons = new Map<
    string,
    {
      id: string;
      title: string;
      weak: number;
      practised: number;
      total: number;
    }
  >();
  const topics = new Map<
    string,
    { title: string; weak: number; practised: number; total: number }
  >();
  for (const area of areas) {
    for (const error of area.errors) {
      const target = area.targets.find(
        (t) => t.concept.id === error.conceptId,
      )!;
      const category =
        target.type === 'grammar'
          ? 'Grammar / prepositions'
          : error.lessonEvidence === 'production'
            ? 'Sentence production'
            : error.lessonEvidence === 'understanding'
              ? 'Context / collocations'
              : 'Vocabulary recall';
      categories.set(category, (categories.get(category) ?? 0) + 1);
    }
    const seenLessons = new Set<string>();
    for (const target of area.targets) {
      if (target.lessonId && !seenLessons.has(target.lessonId)) {
        seenLessons.add(target.lessonId);
        const item = lessons.get(target.lessonId) ?? {
          id: target.lessonId,
          title: target.lessonTitle ?? target.lessonId,
          weak: 0,
          practised: 0,
          total: 0,
        };
        item.practised++;
        item.total += area.score;
        if (needsPractice(area)) item.weak++;
        lessons.set(item.id, item);
      }
    }
    for (const topic of new Set(area.targets.map((t) => t.topic))) {
      const item = topics.get(topic) ?? {
        title: topic,
        weak: 0,
        practised: 0,
        total: 0,
      };
      item.practised++;
      item.total += area.score;
      if (needsPractice(area)) item.weak++;
      topics.set(topic, item);
    }
  }
  const rank = (
    a: { weak: number; total: number; practised: number },
    b: typeof a,
  ) => b.weak - a.weak || b.total / b.practised - a.total / a.practised;
  return {
    categories: [...categories].sort((a, b) => b[1] - a[1]),
    lessons: [...lessons.values()].sort(rank),
    topics: [...topics.values()].sort(rank),
    attention: areas.filter(needsPractice).length,
    improving: areas.filter((a) => a.improving),
  };
}
