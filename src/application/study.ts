import { concepts as grammarContent } from '../content/prepositions';
import { initialStudyLessons, studyLessons } from '../content/study-lessons';
import type { LearningDatabase } from '../data/database';
import { newId } from '../domain/id';
import { newReview } from '../domain/scheduler';
import { startSession } from '../domain/session';
import { lessonContent, recallConcept } from '../domain/study';
import type {
  LessonWord,
  RecallDirection,
  StudyMode,
} from '../domain/study-models';
import { emptyVocabulary } from './vocabulary';

export async function seedStudyLessons(db: LearningDatabase) {
  await db.transaction('rw', db.studyLessons, db.metadata, async () => {
    if (!(await db.metadata.get('study-lessons-v1'))) {
      for (const lesson of initialStudyLessons)
        if (!(await db.studyLessons.get(lesson.id)))
          await db.studyLessons.add(lesson);
      await db.metadata.put({ key: 'study-lessons-v1', value: '1' });
    }
    if (!(await db.metadata.get('study-lessons-v2'))) {
      for (const lesson of studyLessons.slice(initialStudyLessons.length))
        if (!(await db.studyLessons.get(lesson.id)))
          await db.studyLessons.add(lesson);
      await db.metadata.put({ key: 'study-lessons-v2', value: '1' });
    }
  });
}
export async function loadStudyLibrary(db: LearningDatabase) {
  await seedStudyLessons(db);
  const [lessons, progress, words, reviews, sessions, worksheets] =
    await Promise.all([
      db.studyLessons.toArray(),
      db.lessonProgress.toArray(),
      db.vocabulary.toArray(),
      db.reviews.toArray(),
      db.sessions.toArray(),
      db.worksheets.toArray(),
    ]);
  return {
    lessons: studyLessons
      .map((l) => lessons.find((s) => s.id === l.id)!)
      .filter(Boolean),
    progress,
    words: words.filter((w) => w.origin !== 'curriculum'),
    reviews,
    active: sessions.filter((s) => s.module === 'vocabulary' && !s.completedAt),
    paperCompleted: Object.fromEntries(
      lessons.map((l) => [
        l.id,
        worksheets.filter(
          (w) => w.completedAt && w.questions.some((q) => q.lessonId === l.id),
        ).length,
      ]),
    ),
  };
}
export async function beginLessonSession(
  db: LearningDatabase,
  lessonId: string,
  mode: StudyMode,
  direction: RecallDirection = 'mixed',
  now = Date.now(),
) {
  await seedStudyLessons(db);
  return db.transaction(
    'rw',
    db.studyLessons,
    db.sessions,
    db.reviews,
    async () => {
      const active = (await db.sessions.toArray()).find(
        (s) =>
          s.lessonId === lessonId &&
          s.studyMode === mode &&
          (mode === 'context' || s.testDirection === direction) &&
          !s.completedAt,
      );
      if (active) return active;
      const lesson = await db.studyLessons.get(lessonId);
      if (!lesson) throw new Error('Lesson not found.');
      const content = lessonContent(lesson, mode, direction);
      for (const c of content) {
        const review = (await db.reviews.get(c.id)) ?? newReview(c.id, now);
        review.requireProductive = true;
        await db.reviews.put(review);
      }
      const s = startSession(newId(), now, content, await db.reviews.toArray());
      Object.assign(s, {
        module: 'vocabulary',
        lessonId,
        studyMode: mode,
        testDirection: direction,
        content,
        acquisition: false,
      });
      await db.sessions.add(s);
      return s;
    },
  );
}
export async function savePersonalWord(
  db: LearningDatabase,
  english: string,
  czech: string,
  id?: string,
) {
  if (!english.trim() || !czech.trim())
    throw new Error('Enter an English word or phrase and a Czech meaning.');
  return db.transaction('rw', db.vocabulary, db.reviews, async () => {
    const previous = id ? await db.vocabulary.get(id) : undefined;
    if (id && (!previous || previous.origin === 'curriculum'))
      throw new Error('Personal word not found.');
    const now = Date.now();
    const word = {
      ...emptyVocabulary(),
      ...previous,
      id: previous?.id ?? newId(),
      english: english.trim(),
      meaning: czech.trim(),
      createdAt: previous?.createdAt ?? now,
      updatedAt: now,
    };
    await db.vocabulary.put(word);
    const review =
      (await db.reviews.get(`vocab:${word.id}`)) ??
      newReview(`vocab:${word.id}`, now);
    review.requireProductive = true;
    delete review.vocabularyPreference;
    await db.reviews.put(review);
    return word;
  });
}
export async function beginPersonalSession(
  db: LearningDatabase,
  selectedId?: string,
  direction: RecallDirection = 'mixed',
  now = Date.now(),
) {
  return db.transaction(
    'rw',
    db.vocabulary,
    db.sessions,
    db.reviews,
    async () => {
      const active = (await db.sessions.toArray()).find(
        (s) =>
          s.personalWords && s.testDirection === direction && !s.completedAt,
      );
      if (active) return active;
      const words = (await db.vocabulary.toArray()).filter(
        (w) => w.origin !== 'curriculum',
      );
      if (
        !words.length ||
        (selectedId && !words.some((w) => w.id === selectedId))
      )
        throw new Error('Add a personal word first.');
      const content = words.map((word, index) => {
        const item: LessonWord = {
          id: word.id,
          english: word.english,
          czech: word.meaning.split(';')[0],
          acceptedCzech: word.meaning.split(';').map((s) => s.trim()),
          examples: ['', ''],
        };
        return recallConcept(item, `vocab:${word.id}`, direction, index);
      });
      const reviews = await db.reviews.toArray();
      for (const c of content) {
        const review =
          reviews.find((r) => r.conceptId === c.id) ?? newReview(c.id, now);
        delete review.vocabularyPreference;
        review.requireProductive = true;
        await db.reviews.put(review);
      }
      const due = content.filter(
        (c) =>
          !reviews.some((r) => r.conceptId === c.id) ||
          reviews.find((r) => r.conceptId === c.id)!.dueAt <= now,
      );
      const ordered = [...(due.length ? due : content)].sort((a, b) => {
        const rank = (id: string) => {
          const r = reviews.find((r) => r.conceptId === id);
          return r && r.status !== 'new' && r.dueAt <= now ? 0 : 1;
        };
        return rank(a.id) - rank(b.id);
      });
      const ids = selectedId
        ? [`vocab:${selectedId}`]
        : ordered.slice(0, 12).map((c) => c.id);
      const s = startSession(
        newId(),
        now,
        [...content, ...grammarContent],
        await db.reviews.toArray(),
        ids,
      );
      Object.assign(s, {
        module: 'vocabulary',
        personalWords: true,
        studyMode: 'recall',
        testDirection: direction,
        content: [...content, ...grammarContent],
        acquisition: false,
      });
      await db.sessions.add(s);
      return s;
    },
  );
}
