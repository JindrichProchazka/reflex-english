export type RecallDirection = 'en-cs' | 'cs-en' | 'mixed';
export type StudyMode = 'recall' | 'context';
export type LessonEvidence = 'enCs' | 'csEn' | 'understanding' | 'production';
export interface LessonWord {
  id: string;
  english: string;
  czech: string;
  examples: [string, string];
  contextExamples?: [string, string];
  paperTranslation?: string;
  acceptedCzech?: string[];
  acceptedEnglish?: string[];
}
export interface StudyLesson {
  id: string;
  title: string;
  topic: string;
  level: 'B1' | 'B1/B2' | 'B2' | 'B2/C1' | 'C1' | 'C1/C2';
  description: string;
  words: LessonWord[];
}
export interface LessonProgress {
  lessonId: string;
  items: Record<string, Partial<Record<LessonEvidence, boolean>>>;
  updatedAt: number;
}
