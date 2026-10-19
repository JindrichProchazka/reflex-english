import type { Attempt, Concept, Exercise } from './models';
import type {
  LessonEvidence,
  LessonProgress,
  LessonWord,
  RecallDirection,
  StudyLesson,
  StudyMode,
} from './study-models';

export const lessonConceptId = (
  lessonId: string,
  entryId: string,
  mode: StudyMode,
) => `lesson:${lessonId}:${entryId}:${mode}`;
export function recallConcept(
  word: LessonWord,
  id: string,
  direction: RecallDirection,
  offset = 0,
): Concept {
  const exercises: Exercise[] = [0, 1, 2, 3].map((index) => {
    const enCs =
      direction === 'en-cs' ||
      (direction === 'mixed' && (index + offset) % 2 === 0);
    const answer = enCs ? word.czech : word.english;
    return {
      id: `${id}:${index}`,
      conceptId: id,
      entryId: word.id,
      prompt: `${enCs ? 'English → Czech' : 'Czech → English'}\n${enCs ? word.english : word.czech}\n${index < 2 ? 'Recall the lesson expression.' : 'Retrieve it again without looking at the list.'}`,
      answer,
      acceptedAnswers: enCs
        ? [word.czech, ...(word.acceptedCzech ?? [])]
        : [word.english, ...(word.acceptedEnglish ?? [])],
      hint: enCs
        ? 'Think about the Czech meaning in this lesson. Check your wording and spelling.'
        : 'Recall the English expression from this lesson. Check the phrase and spelling.',
      explanation: `${word.english} — ${word.czech}.`,
      evaluation: 'controlled',
      stage: enCs ? 'meaning-recall' : 'english-production',
      productive: !enCs,
      lessonEvidence: enCs ? 'enCs' : 'csEn',
      contextId: `recall:${index}`,
      instruction: enCs
        ? 'Type the Czech meaning. Listed equivalents are accepted.'
        : 'Type the English word or phrase from Learn.',
    };
  });
  return {
    id,
    title: 'Vocabulary recall',
    group: offset % 2 ? 'recall-b' : 'recall-a',
    exercises,
  };
}
export function contextConcept(
  word: LessonWord,
  id: string,
  offset = 0,
): Concept {
  const exercises: Exercise[] = [0, 1, 2, 3].map((index) => {
    const fullSentence = index % 2 === 1;
    const example = (word.contextExamples ?? word.examples)[
      index === 0 || index === 3 ? 0 : 1
    ];
    const start = example
      .toLocaleLowerCase()
      .indexOf(word.english.toLocaleLowerCase());
    if (start < 0)
      throw new Error(`Missing target expression in example: ${word.id}`);
    const cloze =
      example.slice(0, start) +
      '___' +
      example.slice(start + word.english.length);
    return {
      id: `${id}:${index}`,
      conceptId: id,
      entryId: word.id,
      prompt: `Meaning: ${word.czech}\n${cloze}`,
      answer: fullSentence ? example : word.english,
      acceptedAnswers: fullSentence
        ? [example]
        : [word.english, ...(word.acceptedEnglish ?? [])],
      hint: fullSentence
        ? 'Keep the given sentence frame. Fill its gap with the lesson expression, then type the whole sentence.'
        : 'Use the phrase from this lesson that fits the meaning and the sentence.',
      explanation: `${word.english} — ${word.czech}. Model sentence: ${example}`,
      evaluation: 'controlled',
      productive: true,
      stage: fullSentence ? 'sentence' : 'collocation',
      lessonEvidence: fullSentence ? 'production' : 'understanding',
      contextId: `example:${index === 0 || index === 3 ? 0 : 1}`,
      instruction: fullSentence
        ? 'Type the whole sentence.'
        : 'Type the missing word or phrase.',
    };
  });
  return {
    id,
    title: 'Use vocabulary in context',
    group: offset % 2 ? 'context-b' : 'context-a',
    exercises,
  };
}
export function lessonContent(
  lesson: StudyLesson,
  mode: StudyMode,
  direction: RecallDirection,
): Concept[] {
  return lesson.words.map((word, index) => {
    const concept =
      mode === 'context'
        ? contextConcept(word, lessonConceptId(lesson.id, word.id, mode), index)
        : recallConcept(
            word,
            lessonConceptId(lesson.id, word.id, mode),
            direction,
            index,
          );
    return {
      ...concept,
      exercises: concept.exercises.map((e) => ({ ...e, lessonId: lesson.id })),
    };
  });
}
export function updateLessonProgress(
  previous: LessonProgress | undefined,
  attempt: Attempt,
): LessonProgress {
  if (!attempt.lessonId || !attempt.entryId || !attempt.lessonEvidence)
    throw new Error('Lesson evidence is missing.');
  const progress = structuredClone(
    previous ?? {
      lessonId: attempt.lessonId,
      items: {},
      updatedAt: attempt.at,
    },
  );
  const item = progress.items[attempt.entryId] ?? {};
  if (!attempt.correct) item[attempt.lessonEvidence] = false;
  else if (attempt.assistance === 'none' && attempt.masteryEligible !== false)
    item[attempt.lessonEvidence] = true;
  progress.items[attempt.entryId] = item;
  progress.updatedAt = attempt.at;
  return progress;
}
export function lessonProgressSummary(
  lesson: StudyLesson,
  progress?: LessonProgress,
) {
  const count = (keys: LessonEvidence[]) =>
    lesson.words.filter((w) =>
      keys.every((key) => progress?.items[w.id]?.[key]),
    ).length;
  const recall = count(['enCs', 'csEn']);
  const context = count(['understanding', 'production']);
  return {
    recall,
    context,
    enCs: count(['enCs']),
    csEn: count(['csEn']),
    understanding: count(['understanding']),
    production: count(['production']),
    total: lesson.words.length,
    passed: recall === lesson.words.length && context === lesson.words.length,
  };
}
