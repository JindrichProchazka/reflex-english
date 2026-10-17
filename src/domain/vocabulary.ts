import type { Concept, Exercise, ReviewItem } from './models';
import type {
  VocabularyCatalog,
  VocabularyEntry,
  VocabularyStage,
} from './vocabulary-models';

export const vocabularyConceptId = (id: string) => `vocab:${id}`;
export const STAGES: VocabularyStage[] = [
  'recognition',
  'meaning-recall',
  'english-production',
  'collocation',
  'sentence',
  'different-context',
  'scenario',
];
export const stageLabel = (stage: VocabularyStage) =>
  ({
    recognition: 'Recognition in context',
    'meaning-recall': 'Meaning recall',
    'english-production': 'English from Czech / context',
    collocation: 'Collocation recall',
    sentence: 'Use in a sentence',
    'different-context': 'Use in another context',
    scenario: 'Realistic communication',
  })[stage];
export function vocabularyStage(
  entry: VocabularyEntry,
  review?: ReviewItem,
): VocabularyStage {
  const stages = entry.preference === 'passive' ? STAGES.slice(0, 2) : STAGES;
  return (
    stages.find((stage) => !review?.successes.some((e) => e.stage === stage)) ??
    stages.at(-1)!
  );
}
export function entryRelations(catalog: VocabularyCatalog, entryId: string) {
  const extra = catalog.links.filter((l) => l.entryId === entryId);
  const sets = catalog.sets.filter(
    (s) =>
      s.members.some((m) => m.entryId === entryId) ||
      extra.some((l) => l.kind === 'set' && l.targetId === s.id),
  );
  const lessons = catalog.lessons.filter(
    (l) =>
      l.vocabularySetIds.some((id) => sets.some((s) => s.id === id)) ||
      extra.some((link) => link.kind === 'lesson' && link.targetId === l.id),
  );
  const topics = catalog.topics.filter(
    (t) =>
      sets.some((s) => s.topicIds.includes(t.id)) ||
      lessons.some((l) => l.topicIds.includes(t.id)) ||
      extra.some((l) => l.kind === 'topic' && l.targetId === t.id),
  );
  return { sets, lessons, topics };
}
export function vocabularyConcept(
  entry: VocabularyEntry,
  review: ReviewItem | undefined,
  catalog: VocabularyCatalog,
  focus?: VocabularyStage,
): Concept {
  const stage = focus ?? vocabularyStage(entry, review);
  const id = vocabularyConceptId(entry.id);
  const lesson = entryRelations(catalog, entry.id).lessons[0];
  const examples = entry.examples.length
    ? entry.examples
    : [entry.userSentence || entry.english, entry.english];
  const exercises: Exercise[] = [0, 1, 2].map((index) => {
    const example = examples[index % examples.length];
    const context = [
      'your studies or work',
      'a conversation with a friend',
      'a practical problem',
    ][index];
    let prompt: string;
    let answer: string;
    if (stage === 'recognition') {
      prompt = `Read “${entry.english}” in context: ${example}\n${['Explain its meaning in Czech.', 'Explain the meaning in your own words.', 'Describe its meaning to someone else.'][index]}`;
      answer = entry.meaning;
    } else if (stage === 'meaning-recall') {
      prompt = `What does “${entry.english}” mean? ${['Give the Czech meaning.', 'Explain it without looking at your notes.', 'Describe what it means to someone else.'][index]}`;
      answer = entry.meaning;
    } else if (stage === 'english-production') {
      prompt = `Recall the English word or phrase for: ${entry.meaning}\n${['Type the expression you saved.', 'Retrieve it without looking at your notes.', 'Use the form from your vocabulary.'][index]}`;
      answer = entry.english;
    } else if (stage === 'collocation') {
      prompt = `Recall a natural collocation or phrase for: ${entry.meaning}.\nConnect it to ${context}.`;
      answer =
        entry.collocations[index % Math.max(1, entry.collocations.length)] ??
        example;
    } else if (stage === 'scenario') {
      prompt = `${lesson?.task.prompt ?? `Explain a small problem and request help in ${context}.`}\nUse the English expression for “${entry.meaning}” and another useful phrase.\n${['Prepare a spoken explanation.', 'Write a short message to a colleague or friend.', 'Give a follow-up explaining your proposed action.'][index]}`;
      answer = lesson?.task.reference
        ? `${lesson.task.reference}${lesson.task.reference.toLowerCase().includes(entry.english.toLowerCase()) ? '' : `\nTarget-language example: ${example}`}`
        : example;
    } else {
      prompt = `Write a complete sentence using the English expression for “${entry.meaning}”.\n${stage === 'different-context' ? 'Change the situation from your earlier examples: ' : 'Imagine '}${context}.`;
      answer = example;
    }
    return {
      id: `${id}:${stage}:${index}`,
      conceptId: id,
      prompt,
      answer,
      hint:
        stage === 'english-production'
          ? 'Recall the word or phrase you saved. Check its form and spelling.'
          : 'Check the meaning and the natural word combination. Is the intended message clear?',
      explanation:
        entry.explanation ||
        `Reference expression: ${entry.english} — ${entry.meaning}. ${entry.examples.length || entry.userSentence ? 'Other natural answers may also be correct.' : 'No model sentence has been saved yet. The reference is the expression, not a complete answer to this task; assess your full sentence yourself, or enrich this entry with examples.'}`,
      evaluation: stage === 'english-production' ? 'controlled' : 'self',
      acceptedAnswers: [answer],
      stage,
      productive: !['recognition', 'meaning-recall'].includes(stage),
      contextId: `${stage}:${index}`,
      rubric:
        stage === 'recognition' || stage === 'meaning-recall'
          ? `Does your response convey the meaning of “${entry.english}” in this context? A Czech paraphrase is fine.`
          : stage === 'scenario'
            ? (lesson?.task.criteria ??
              'Use the target expression naturally, communicate a practical problem, and propose or request an action.')
            : `Use the English expression for the Czech meaning, in a natural ${stage === 'collocation' ? 'word combination' : 'complete sentence'}. Check meaning, grammar and fit to the situation.`,
    };
  });
  return {
    id,
    title:
      stage === 'recognition' || stage === 'meaning-recall'
        ? entry.english
        : entry.meaning,
    group: entry.category,
    exercises,
  };
}

export interface VocabularyFilters {
  search?: string;
  topic?: string;
  lesson?: string;
  category?: string;
  origin?: string;
  preference?: string;
}
export function vocabularyPracticeIds(
  entries: VocabularyEntry[],
  reviews: ReviewItem[],
  now: number,
  limit = 12,
) {
  const byId = new Map(reviews.map((r) => [r.conceptId, r]));
  const eligible = entries.filter(
    (e) =>
      !byId.get(vocabularyConceptId(e.id)) ||
      byId.get(vocabularyConceptId(e.id))!.dueAt <= now,
  );
  const pool = eligible.length ? eligible : entries;
  const rank = (entry: VocabularyEntry) => {
    const r = byId.get(vocabularyConceptId(entry.id));
    return r && r.status !== 'new' && r.dueAt <= now
      ? 0
      : r?.lastErrorSession
        ? 1
        : 2;
  };
  return [...pool]
    .sort(
      (a, b) =>
        rank(a) - rank(b) ||
        (byId.get(vocabularyConceptId(a.id))?.dueAt ?? now) -
          (byId.get(vocabularyConceptId(b.id))?.dueAt ?? now),
    )
    .slice(0, limit)
    .map((e) => vocabularyConceptId(e.id));
}
export function filterVocabulary(
  catalog: VocabularyCatalog,
  filters: VocabularyFilters,
) {
  const query =
    filters.search?.normalize('NFKC').toLocaleLowerCase().trim() ?? '';
  return catalog.entries.filter((entry) => {
    const relations = entryRelations(catalog, entry.id);
    return (
      (!query ||
        [
          entry.english,
          entry.meaning,
          entry.source,
          entry.notes,
          ...entry.tags,
          ...entry.collocations,
        ]
          .join(' ')
          .toLocaleLowerCase()
          .includes(query)) &&
      (!filters.topic ||
        relations.topics.some((t) => t.id === filters.topic)) &&
      (!filters.lesson ||
        relations.lessons.some((l) => l.id === filters.lesson)) &&
      (!filters.category || entry.category === filters.category) &&
      (!filters.origin || entry.origin === filters.origin) &&
      (!filters.preference || entry.preference === filters.preference)
    );
  });
}
