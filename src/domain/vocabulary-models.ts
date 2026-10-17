export type VocabularyStage =
  | 'recognition'
  | 'meaning-recall'
  | 'english-production'
  | 'collocation'
  | 'sentence'
  | 'different-context'
  | 'scenario';
export type Level = 'B1' | 'B2' | 'C1';
export type Category =
  'academic' | 'technical' | 'everyday' | 'workplace' | 'travel' | 'social';
export interface VocabularyEntry {
  id: string;
  english: string;
  meaning: string;
  partOfSpeech: string;
  explanation: string;
  collocations: string[];
  examples: string[];
  userSentence: string;
  source: string;
  notes: string;
  tags: string[];
  preference: 'active' | 'passive';
  level: Level;
  category: Category;
  origin: 'curriculum' | 'personal' | 'mistake';
  mistakeConceptId?: string;
  createdAt: number;
  updatedAt: number;
}
export interface Topic {
  id: string;
  title: string;
  domain: Category;
  parentId?: string;
}
export interface Skill {
  id: string;
  title: string;
  description: string;
}
export interface VocabularySet {
  id: string;
  title: string;
  topicIds: string[];
  members: { entryId: string; role: 'word' | 'phrase' | 'collocation' }[];
}
export interface Lesson {
  id: string;
  title: string;
  level: Level;
  topicIds: string[];
  communicativeGoal: string;
  vocabularySetIds: string[];
  skillIds: string[];
  grammarFocus: string[];
  controlledExercises: string[];
  productiveExercises: string[];
  task: { prompt: string; reference: string; criteria: string };
}
export interface VocabularyLink {
  id: string;
  entryId: string;
  kind: 'topic' | 'lesson' | 'set';
  targetId: string;
}
export interface VocabularyCatalog {
  entries: VocabularyEntry[];
  sets: VocabularySet[];
  lessons: Lesson[];
  topics: Topic[];
  skills: Skill[];
  links: VocabularyLink[];
}
