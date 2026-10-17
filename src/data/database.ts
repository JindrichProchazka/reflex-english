import Dexie, { type EntityTable } from 'dexie';
import type { Attempt, Mistake, ReviewItem, Session } from '../domain/models';
import type { LessonProgress, StudyLesson } from '../domain/study-models';
import type { Worksheet } from '../domain/worksheet-models';
import type {
  Lesson,
  Skill,
  Topic,
  VocabularyEntry,
  VocabularyLink,
  VocabularySet,
} from '../domain/vocabulary-models';

export class LearningDatabase extends Dexie {
  reviews!: EntityTable<ReviewItem, 'conceptId'>;
  attempts!: EntityTable<Attempt, 'id'>;
  mistakes!: EntityTable<Mistake, 'conceptId'>;
  sessions!: EntityTable<Session, 'id'>;
  vocabulary!: EntityTable<VocabularyEntry, 'id'>;
  vocabularySets!: EntityTable<VocabularySet, 'id'>;
  lessons!: EntityTable<Lesson, 'id'>;
  topics!: EntityTable<Topic, 'id'>;
  skills!: EntityTable<Skill, 'id'>;
  vocabularyLinks!: EntityTable<VocabularyLink, 'id'>;
  metadata!: EntityTable<{ key: string; value: string }, 'key'>;
  studyLessons!: EntityTable<StudyLesson, 'id'>;
  lessonProgress!: EntityTable<LessonProgress, 'lessonId'>;
  worksheets!: EntityTable<Worksheet, 'id'>;
  settings!: EntityTable<{ key: string; value: unknown }, 'key'>;
  constructor(name = 'reflex-english') {
    super(name);
    this.version(1).stores({
      reviews: 'conceptId, dueAt, status',
      attempts: 'id, sessionId, conceptId, at',
      mistakes: 'conceptId',
      sessions: 'id, startedAt',
    });
    // Additive migration: all existing grammar attempts/reviews/sessions survive.
    this.version(2).stores({
      vocabulary: 'id, category, origin, preference, updatedAt',
      vocabularySets: 'id',
      lessons: 'id',
      topics: 'id',
      skills: 'id',
      vocabularyLinks: 'id, entryId, [entryId+kind], [kind+targetId]',
      metadata: 'key',
    });
    this.version(3).stores({
      studyLessons: 'id',
      lessonProgress: 'lessonId, updatedAt',
    });
    this.version(4).stores({
      worksheets: 'id, lessonId, createdAt, completedAt',
      attempts: 'id, sessionId, conceptId, at, worksheetId',
    });
    this.version(5).stores({ settings: 'key' });
  }
}
export const db = new LearningDatabase();
