import type { StudyLesson } from './study-models';
import type {
  Worksheet,
  WorksheetOptions,
  WorksheetQuestion,
} from './worksheet-models';
import { lessonConceptId, recallConcept, contextConcept } from './study';
import type { Exercise } from './models';
import { paperTranslations } from '../content/paper-translations';

function repairSentence(
  sentence: string,
): { wrong: string; rule: string } | undefined {
  const rules: [RegExp, string, string][] = [
    [
      /\b(The [a-z]+) is\b/,
      '$1 are',
      'A singular subject takes “is”, not “are”.',
    ],
    [
      /\b(The [a-z]+) has\b/,
      '$1 have',
      'A singular subject takes “has”, not “have”.',
    ],
    [
      /\b(can|could|may|should|will|would) (?!to\b|I\b|we\b|you\b|he\b|she\b|they\b|it\b)/i,
      '$1 to ',
      'A modal is followed by the base verb without “to”.',
    ],
    [
      /\b((?:Can|Could|May) (?:I|we|you)) /i,
      '$1 to ',
      'After a modal verb, use the base verb without “to”.',
    ],
    [
      /\b(need|needs|would like) to /i,
      '$1 ',
      'Use “to” before the verb after need / would like.',
    ],
    [/\bI have\b/, 'I has', 'Use “have” with I, not “has”.'],
    [
      /\bWe need\b/,
      'We needs',
      'Use the base verb with “we”, without an -s ending.',
    ],
    [
      /^Please /,
      'Please to ',
      'A polite instruction uses “please” followed by the base verb, without “to”.',
    ],
    [
      /\ba (reservation|single room|double room|quiet room|receipt|question|replacement bus|return ticket|window seat|power socket|food allergy|feasible approach|defective part|faulty appliance)\b/i,
      'an $1',
      'Use “a” before a consonant sound.',
    ],
    [
      /\ban (appointment|extension|application)\b/i,
      'a $1',
      'Use “an” before a vowel sound.',
    ],
    [/\bWe have\b/, 'We has', 'Use “have” with “we”.'],
    [/\bmust /, 'must to ', 'Use the base verb without “to” after “must”.'],
  ];
  for (const [pattern, replacement, rule] of rules)
    if (pattern.test(sentence))
      return { wrong: sentence.replace(pattern, replacement), rule };
}
export function lessonWorksheetPool(lesson: StudyLesson): WorksheetQuestion[] {
  return lesson.words.flatMap((word, index) => {
    const recallId = lessonConceptId(lesson.id, word.id, 'recall');
    const contextId = lessonConceptId(lesson.id, word.id, 'context');
    const common = { lessonId: lesson.id, lessonTitle: lesson.title };
    const question = (
      kind: WorksheetQuestion['kind'],
      suffix: string,
      exercise: Exercise,
      openEnded = false,
    ): WorksheetQuestion => ({
      ...common,
      kind,
      id: `${word.id}:${kind}:${suffix}`,
      exercise: {
        ...exercise,
        id: `${exercise.id}:paper:${kind}:${suffix}`,
        lessonId: lesson.id,
      },
      category: kind === 'recall' ? 'vocabulary' : 'phrase',
      openEnded,
    });
    const enCs = recallConcept(word, recallId, 'en-cs').exercises[0];
    const csEn = recallConcept(word, recallId, 'cs-en').exercises[0];
    const base = contextConcept(word, contextId).exercises;
    const items = [
      question('recall', 'en-cs', enCs),
      question('recall', 'cs-en', csEn),
      ...[0, 2].map((variant, i) => question('gap', `${i}`, base[variant])),
    ];
    const words = word.english.split(' ');
    let phrase: string;
    if (words.length > 1) phrase = `___ ${words.slice(1).join(' ')}`;
    else {
      const sentence = word.examples[0];
      const start = sentence.toLowerCase().indexOf(word.english.toLowerCase());
      phrase =
        sentence.slice(0, start).trim().split(/\s+/).slice(-2).join(' ') +
        ' ___ ' +
        sentence
          .slice(start + word.english.length)
          .trim()
          .split(/\s+/)
          .slice(0, 2)
          .join(' ');
    }
    items.push(
      question('phrase', '0', {
        ...base[0],
        id: `${contextId}:phrase`,
        prompt: `Recall the missing part of the phrase (${word.czech}):\n${phrase}`,
        answer: words.length > 1 ? words[0] : word.english,
        acceptedAnswers: [words.length > 1 ? words[0] : word.english],
        stage: 'collocation',
        instruction: 'Write only the missing part.',
        lessonEvidence: undefined,
      }),
    );
    const translation =
      word.paperTranslation ?? paperTranslations[lesson.id]?.[index];
    if (translation)
      items.push(
        question(
          'translation',
          '0',
          {
            ...base[1],
            id: `${contextId}:translation`,
            prompt: translation,
            answer: word.examples[0],
            acceptedAnswers: [word.examples[0]],
            explanation: `${word.english} — ${word.czech}. Use the lesson expression to convey the Czech sentence naturally.`,
            evaluation: 'self',
            rubric:
              'Use the lesson vocabulary to communicate the Czech sentence naturally. Other natural translations can be correct.',
            instruction:
              'Translate into English using vocabulary from this lesson.',
            lessonEvidence: 'production',
            stage: 'sentence',
          },
          true,
        ),
      );
    for (const [i, sentence] of word.examples.entries()) {
      const repair = repairSentence(sentence);
      if (repair)
        items.push(
          question(
            'repair',
            `${i}`,
            {
              ...base[1],
              id: `${contextId}:repair:${i}`,
              prompt: repair.wrong,
              answer: sentence,
              acceptedAnswers: [sentence],
              explanation: repair.rule,
              evaluation: 'self',
              rubric: repair.rule,
              instruction: 'Rewrite the sentence correctly.',
              stage: 'sentence',
              lessonEvidence: 'production',
            },
            true,
          ),
        );
    }
    return items;
  });
}

export function generateWorksheet(
  id: string,
  title: string,
  options: WorksheetOptions,
  pool: WorksheetQuestion[],
  now: number,
): Worksheet {
  if (![10, 20, 40].includes(options.count))
    throw new Error('Choose a supported worksheet length.');
  let candidates = pool.filter(
    (q) => options.kind === 'mixed' || q.kind === options.kind,
  );
  if (options.direction !== 'mixed')
    candidates = candidates.filter(
      (q) =>
        q.kind !== 'recall' ||
        q.exercise.lessonEvidence ===
          (options.direction === 'en-cs' ? 'enCs' : 'csEn'),
    );
  const unique = new Map<string, WorksheetQuestion>();
  for (const q of candidates) {
    const key = `${q.exercise.prompt.trim()}|${q.exercise.instruction ?? ''}`;
    if (!unique.has(key)) unique.set(key, q);
  }
  candidates = [...unique.values()];
  if (!candidates.length)
    throw new Error(
      'No matching questions are available. Try Mixed lesson test or a different source.',
    );
  const questions: WorksheetQuestion[] = [];
  const counts = new Map<string, number>();
  const typeCounts = new Map<string, number>();
  // Balance exercise types and concepts. Stable source order preserves due/mistake
  // priority; no random repeats are introduced to fill a requested length.
  while (candidates.length && questions.length < options.count) {
    const kinds = [...new Set(candidates.map((q) => q.kind))];
    const kind = kinds.sort(
      (a, b) => (typeCounts.get(a) ?? 0) - (typeCounts.get(b) ?? 0),
    )[0];
    const ofKind = candidates.filter((q) => q.kind === kind);
    const best = [...ofKind].sort(
      (a, b) =>
        (counts.get(a.exercise.entryId ?? a.exercise.conceptId) ?? 0) -
        (counts.get(b.exercise.entryId ?? b.exercise.conceptId) ?? 0),
    )[0];
    questions.push(structuredClone(best));
    counts.set(
      best.exercise.entryId ?? best.exercise.conceptId,
      (counts.get(best.exercise.entryId ?? best.exercise.conceptId) ?? 0) + 1,
    );
    typeCounts.set(kind, (typeCounts.get(kind) ?? 0) + 1);
    candidates.splice(candidates.indexOf(best), 1);
  }
  return {
    id,
    title,
    lessonId: options.lessonId,
    createdAt: now,
    source: options.source,
    kind: options.kind,
    direction: options.direction,
    requestedCount: options.count,
    questions,
    results: {},
    revision: 0,
    includeNameDate: options.includeNameDate ?? true,
  };
}
export const worksheetSummary = (worksheet: Worksheet) => ({
  correct: Object.values(worksheet.results).filter((r) => r.grade === 'correct')
    .length,
  minor: Object.values(worksheet.results).filter((r) => r.grade === 'minor')
    .length,
  wrong: Object.values(worksheet.results).filter((r) => r.grade === 'wrong')
    .length,
});
export const questionLabel = (kind: WorksheetQuestion['kind']) =>
  ({
    recall: 'Vocabulary recall',
    gap: 'Fill in the word',
    phrase: 'Phrase / collocation recall',
    translation: 'Sentence translation',
    repair: 'Sentence repair',
  })[kind];
