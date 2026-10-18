import type { LearningDatabase } from '../data/database';
import { grammarConcepts, drillForConcept, drillById } from '../content/drills';
import { seedStudyLessons } from './study';
import { lessonContent, recallConcept } from '../domain/study';
import { newId } from '../domain/id';
import { newReview } from '../domain/scheduler';
import { startTrackedSession } from './prompt-history';
import {
  buildWeakAreas,
  needsPractice,
  type WeakTarget,
} from '../domain/weakness';
import type { Attempt, Concept } from '../domain/models';

const wordGroup = (english: string) =>
  `word:${english.normalize('NFKC').toLocaleLowerCase('en').replace(/[’‘]/g, "'").replace(/\s+/g, ' ').trim()}`;
async function readWeakness(db: LearningDatabase, now: number) {
  const [lessons, words, attempts, mistakes, reviews, sessions] =
    await Promise.all([
      db.studyLessons.toArray(),
      db.vocabulary.toArray(),
      db.attempts.toArray(),
      db.mistakes.toArray(),
      db.reviews.toArray(),
      db.sessions.toArray(),
    ]);
  const catalog = new Map<string, WeakTarget>();
  for (const concept of grammarConcepts)
    catalog.set(concept.id, {
      concept,
      groupId: `grammar:${concept.id}`,
      title: concept.title,
      type: 'grammar',
      topic: drillForConcept(concept.id)!.title,
    });
  for (const lesson of lessons)
    for (const mode of ['recall', 'context'] as const) {
      for (const concept of lessonContent(lesson, mode, 'mixed')) {
        const word = lesson.words.find(
          (w) => w.id === concept.exercises[0].entryId,
        )!;
        catalog.set(concept.id, {
          concept: { ...concept, title: word.english },
          groupId: wordGroup(word.english),
          title: word.english,
          type: 'lesson',
          topic: lesson.topic,
          lessonId: lesson.id,
          lessonTitle: lesson.title,
        });
      }
    }
  for (const word of words) {
    const concept = recallConcept(
      {
        id: word.id,
        english: word.english,
        czech: word.meaning.split(';')[0],
        acceptedCzech: word.meaning.split(';').map((s) => s.trim()),
        examples: ['', ''],
      },
      `vocab:${word.id}`,
      'mixed',
    );
    catalog.set(concept.id, {
      concept,
      groupId: wordGroup(word.english),
      title: word.english,
      type: 'vocabulary',
      topic: 'Personal / saved vocabulary',
    });
  }
  // Preserve actionable old/deleted-source concepts from immutable history.
  const saved = sessions.flatMap((s) => s.content ?? []);
  for (const concept of saved)
    if (!catalog.has(concept.id)) {
      const example = concept.exercises[0];
      if (!example) continue;
      const title = example.explanation.split(' — ')[0] || concept.title;
      catalog.set(concept.id, {
        concept,
        groupId: example.entryId ? wordGroup(title) : `grammar:${concept.id}`,
        title,
        type: example.entryId ? 'vocabulary' : 'grammar',
        topic: 'Saved practice',
        lessonId: example.lessonId,
      });
    }
  for (const attempt of [...attempts].sort((a, b) => a.at - b.at)) {
    let target = catalog.get(attempt.conceptId);
    if (!target) {
      const exercise = attempt.exerciseSnapshot ?? {
        id: attempt.exerciseId,
        conceptId: attempt.conceptId,
        prompt: attempt.prompt,
        answer: attempt.expected,
        hint: 'Recall the corrected form and check the context.',
        explanation:
          mistakes.find((m) => m.conceptId === attempt.conceptId)
            ?.explanation ?? `Reference: ${attempt.expected}`,
        entryId: attempt.entryId,
        lessonId: attempt.lessonId,
      };
      const title = exercise.entryId
        ? exercise.explanation.split(' — ')[0]
        : attempt.conceptId;
      const concept: Concept = {
        id: attempt.conceptId,
        title,
        group: exercise.entryId ? 'saved-vocabulary' : 'saved-grammar',
        exercises: [exercise],
      };
      target = {
        concept,
        groupId: exercise.entryId
          ? wordGroup(title)
          : `grammar:${attempt.conceptId}`,
        title,
        type: exercise.lessonId
          ? 'lesson'
          : exercise.entryId
            ? 'vocabulary'
            : 'grammar',
        topic: 'Saved practice',
        lessonId: exercise.lessonId,
      };
      catalog.set(concept.id, target);
    } else if (
      target.topic === 'Saved practice' &&
      attempt.exerciseSnapshot &&
      !target.concept.exercises.some((e) => e.id === attempt.exerciseId)
    ) {
      // Only missing-source concepts need historical variants for practice.
      // Current authored concepts already have four controlled variants; keep
      // old paper/self-assessed snapshots in history instead of rotating them
      // into an otherwise controlled test.
      target.concept = {
        ...target.concept,
        exercises: [...target.concept.exercises, attempt.exerciseSnapshot],
      };
    }
  }
  return {
    areas: buildWeakAreas(
      { targets: [...catalog.values()], attempts, mistakes, reviews },
      now,
    ),
    catalog,
    reviews,
    sessions,
    attempts,
    now,
  };
}
export async function loadWeakAreas(db: LearningDatabase, now = Date.now()) {
  await seedStudyLessons(db);
  return db.transaction(
    'r',
    [
      db.studyLessons,
      db.vocabulary,
      db.attempts,
      db.mistakes,
      db.reviews,
      db.sessions,
    ],
    () => readWeakness(db, now),
  );
}
export async function revealWeakReferences(
  db: LearningDatabase,
  groupId: string,
  now = Date.now(),
) {
  await seedStudyLessons(db);
  return db.transaction(
    'rw',
    [
      db.studyLessons,
      db.vocabulary,
      db.attempts,
      db.mistakes,
      db.reviews,
      db.sessions,
    ],
    async () => {
      const data = await readWeakness(db, now),
        area = data.areas.find((a) => a.id === groupId);
      if (!area) throw new Error('This concept has no saved practice yet.');
      for (const target of [...data.catalog.values()].filter(
        (t) => t.groupId === groupId,
      )) {
        const review =
          (await db.reviews.get(target.concept.id)) ??
          newReview(target.concept.id, now);
        review.answerExposedAt = now;
        await db.reviews.put(review);
      }
      return area;
    },
  );
}
export async function beginWeakSession(
  db: LearningDatabase,
  groupId?: string,
  now = Date.now(),
) {
  await seedStudyLessons(db);
  return db.transaction(
    'rw',
    [
      db.studyLessons,
      db.vocabulary,
      db.attempts,
      db.mistakes,
      db.reviews,
      db.sessions,
      db.settings,
    ],
    async () => {
      const data = await readWeakness(db, now);
      const selected = groupId
        ? data.areas.filter((a) => a.id === groupId)
        : data.areas
            .filter((a) => needsPractice(a) || a.label === 'Improving')
            .slice(0, 6);
      if (!selected.length)
        throw new Error('No weak concepts need practice right now.');
      const areaIds = selected.map((a) => a.id).sort();
      const existing = data.sessions.find(
        (s) =>
          s.weakAreaIds &&
          JSON.stringify([...s.weakAreaIds].sort()) ===
            JSON.stringify(areaIds) &&
          !s.completedAt,
      );
      if (existing) return existing;
      const targets = selected
        .flatMap((a) => a.targets)
        .sort((a, b) => {
          const rank = (id: string) => {
            const r = data.reviews.find((r) => r.conceptId === id);
            return r && r.dueAt <= now ? 0 : 1;
          };
          return rank(a.concept.id) - rank(b.concept.id);
        })
        .slice(0, 12);
      const targetIds = targets.map((t) => t.concept.id);
      const exposed = (id: string) =>
        data.reviews.some(
          (r) =>
            r.conceptId === id &&
            r.answerExposedAt !== undefined &&
            now - r.answerExposedAt < 86_400_000,
        ) ||
        data.attempts.some(
          (a) =>
            a.conceptId === id &&
            a.referenceRevealed &&
            now - a.at < 86_400_000,
        );
      const deferred = targetIds.filter(exposed);
      // Retain varied grammar fillers even for a single failed word, so delayed
      // retries/closing recall can use five OTHER prompts in the shared engine.
      const filler = drillById('in-on-at')!
        .concepts.filter((c) => !targetIds.includes(c.id))
        .slice(0, 5);
      const content = [...targets.map((t) => t.concept), ...filler];
      for (const target of targets)
        if (!data.reviews.some((r) => r.conceptId === target.concept.id))
          await db.reviews.put(newReview(target.concept.id, now));
      const session = await startTrackedSession(
        db,
        newId(),
        now,
        content,
        await db.reviews.toArray(),
        [...(deferred.length ? filler.map((c) => c.id) : []), ...targetIds],
        deferred,
      );
      Object.assign(session, {
        module: 'vocabulary',
        weakAreaIds: areaIds,
        content,
        acquisition: false,
      });
      await db.sessions.add(session);
      return session;
    },
  );
}
export function mistakeCategory(attempt: Attempt) {
  return attempt.entryId
    ? attempt.lessonEvidence === 'production'
      ? 'Sentence production'
      : attempt.lessonEvidence === 'understanding'
        ? 'Context / collocation'
        : 'Vocabulary recall'
    : `Grammar / ${drillForConcept(attempt.conceptId)?.category ?? 'preposition'}`;
}
