import type { VocabularyStage } from './vocabulary-models';
import type {
  LessonEvidence,
  RecallDirection,
  StudyMode,
} from './study-models';
export type Mastery = 'new' | 'learning' | 'reviewing' | 'mastered';
export interface Exercise {
  id: string;
  conceptId: string;
  prompt: string;
  answer: string;
  hint: string;
  explanation: string;
  evaluation?: 'controlled' | 'self';
  acceptedAnswers?: string[];
  rubric?: string;
  stage?: VocabularyStage;
  contextId?: string;
  productive?: boolean;
  lessonEvidence?: LessonEvidence;
  entryId?: string;
  instruction?: string;
  lessonId?: string;
}
export interface Concept {
  id: string;
  title: string;
  group: string;
  exercises: Exercise[];
}
export interface Evidence {
  at: number;
  sessionId: string;
  exerciseId: string;
  stage?: VocabularyStage;
  productive?: boolean;
  contextId?: string;
}
export interface ReviewItem {
  conceptId: string;
  status: Mastery;
  dueAt: number;
  intervalIndex: number;
  successes: Evidence[];
  recentReviews: boolean[];
  lastAdvancedSession?: string;
  lastErrorSession?: string;
  lastReviewedAt?: number;
  vocabularyPreference?: 'active' | 'passive';
  requireProductive?: boolean;
  productiveUseAt?: number;
  answerExposedAt?: number;
}
export type TaskKind = 'initial' | 'delayed' | 'final' | 'interleave';
export interface Task {
  conceptId: string;
  kind: TaskKind;
  readyAfter: number;
  priority?: number;
  dueAt?: number;
}
export interface Session {
  id: string;
  startedAt: number;
  completedAt?: number;
  queue: Task[];
  current: Task | null;
  exerciseId: string;
  wrongCount: number;
  processed: number;
  failed: string[];
  seen: Record<string, number>;
  feedback: 'none' | 'hint' | 'correction';
  acquisition?: boolean;
  module?: 'prepositions' | 'vocabulary';
  lessonId?: string;
  studyMode?: StudyMode;
  testDirection?: RecallDirection;
  personalWords?: boolean;
  worksheetId?: string;
  weakAreaIds?: string[];
  content?: Concept[];
  assessment?: {
    answer: string;
    durationMs: number;
    at: number;
    referenceRevealed: boolean;
  };
  ordering?: {
    seed: number;
    recentTargets: Concept['group'][];
    counts: Partial<Record<Concept['group'], number>>;
    lastPresented: Record<string, number>;
    lastConceptId?: string;
  };
}
export interface Attempt {
  id: string;
  sessionId: string;
  conceptId: string;
  exerciseId: string;
  prompt: string;
  expected: string;
  answer: string;
  correct: boolean;
  at: number;
  durationMs: number | null;
  assistance: 'none' | 'hint' | 'answer';
  taskKind: TaskKind | 'paper';
  source: 'typed' | 'paper';
  evaluator:
    'accepted-answer-v1' | 'self-assessment-v1' | 'paper-self-assessment-v1';
  worksheetId?: string;
  worksheetItemId?: string;
  answerRecorded?: boolean;
  masteryEligible?: boolean;
  exerciseSnapshot?: Exercise;
  recentExposureBlocked?: boolean;
  lessonId?: string;
  studyMode?: StudyMode;
  lessonEvidence?: LessonEvidence;
  entryId?: string;
  grade?: 'correct' | 'minor' | 'wrong';
  stage?: VocabularyStage;
  productive?: boolean;
  contextId?: string;
  referenceRevealed?: boolean;
}
export interface Mistake {
  conceptId: string;
  category: 'preposition' | 'vocabulary' | 'collocation' | 'phrase';
  occurrences: number;
  attemptIds: string[];
  dates: number[];
  prompt: string;
  answer: string;
  correctAnswer: string;
  explanation: string;
  lastReviewAt: number;
  nextReviewAt: number;
  status: Mastery;
  answerRecorded?: boolean;
}
