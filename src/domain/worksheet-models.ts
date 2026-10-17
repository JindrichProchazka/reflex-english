import type { Exercise, Mistake } from './models';
import type { RecallDirection } from './study-models';
export type WorksheetKind =
  'recall' | 'gap' | 'phrase' | 'translation' | 'repair' | 'mixed';
export type WorksheetSource =
  'lesson' | 'selection' | 'due' | 'mistakes' | 'weak';
export type PaperGrade = 'correct' | 'minor' | 'wrong';
export interface PaperResult {
  grade: PaperGrade;
  writtenAnswer?: string;
}
export interface WorksheetQuestion {
  id: string;
  kind: Exclude<WorksheetKind, 'mixed'>;
  exercise: Exercise;
  lessonId?: string;
  lessonTitle?: string;
  category: Mistake['category'];
  openEnded?: boolean;
}
export interface Worksheet {
  id: string;
  title: string;
  lessonId?: string;
  createdAt: number;
  completedAt?: number;
  source: WorksheetSource;
  kind: WorksheetKind;
  direction: RecallDirection;
  requestedCount: number;
  questions: WorksheetQuestion[];
  results: Record<string, PaperResult>;
  keyViewedAt?: number;
  revision: number;
  includeNameDate?: boolean;
  submittedAssisted?: boolean;
}
export interface WorksheetOptions {
  source: WorksheetSource;
  lessonId?: string;
  entryIds?: string[];
  kind: WorksheetKind;
  direction: RecallDirection;
  count: 10 | 20 | 40;
  includeNameDate?: boolean;
}
