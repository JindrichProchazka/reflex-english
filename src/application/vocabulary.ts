import {
  lessons,
  skills,
  topics,
  vocabularySeed,
  vocabularySets,
} from '../content/vocabulary';
import type { LearningDatabase } from '../data/database';
import { newId } from '../domain/id';
import { newReview } from '../domain/scheduler';
import { startSession } from '../domain/session';
import {
  entryRelations,
  vocabularyConcept,
  vocabularyConceptId,
  vocabularyPracticeIds,
} from '../domain/vocabulary';
import type {
  VocabularyCatalog,
  VocabularyEntry,
  VocabularyLink,
  VocabularyStage,
} from '../domain/vocabulary-models';

export async function seedVocabulary(db: LearningDatabase, now = Date.now()) {
  return db.transaction(
    'rw',
    [
      db.vocabulary,
      db.vocabularySets,
      db.lessons,
      db.topics,
      db.skills,
      db.reviews,
      db.metadata,
    ],
    async () => {
      if (await db.metadata.get('vocabulary-seed-v1')) return;
      await db.vocabulary.bulkAdd(
        vocabularySeed.map((e) => ({ ...e, createdAt: now, updatedAt: now })),
      );
      await db.vocabularySets.bulkAdd(vocabularySets);
      await db.lessons.bulkAdd(lessons);
      await db.topics.bulkAdd(topics);
      await db.skills.bulkAdd(skills);
      for (const entry of vocabularySeed)
        await db.reviews.add({
          ...newReview(vocabularyConceptId(entry.id), now),
          vocabularyPreference: entry.preference,
        });
      await db.metadata.put({ key: 'vocabulary-seed-v1', value: '1' });
    },
  );
}
export async function loadVocabulary(
  db: LearningDatabase,
): Promise<VocabularyCatalog> {
  await seedVocabulary(db);
  const [entries, sets, storedLessons, storedTopics, storedSkills, links] =
    await Promise.all([
      db.vocabulary.toArray(),
      db.vocabularySets.toArray(),
      db.lessons.toArray(),
      db.topics.toArray(),
      db.skills.toArray(),
      db.vocabularyLinks.toArray(),
    ]);
  return {
    entries,
    sets,
    lessons: storedLessons,
    topics: storedTopics,
    skills: storedSkills,
    links,
  };
}
export type VocabularyDraft = Omit<
  VocabularyEntry,
  'id' | 'createdAt' | 'updatedAt'
> & { id?: string; updatedAt?: number };
export type Associations = {
  topics: string[];
  lessons: string[];
  sets: string[];
};
export function emptyVocabulary(): VocabularyDraft {
  return {
    english: '',
    meaning: '',
    partOfSpeech: '',
    explanation: '',
    collocations: [],
    examples: [],
    userSentence: '',
    source: '',
    notes: '',
    tags: [],
    preference: 'active',
    level: 'B1',
    category: 'everyday',
    origin: 'personal',
  };
}
export async function saveVocabulary(
  db: LearningDatabase,
  draft: VocabularyDraft,
  associations?: Associations,
  now = Date.now(),
) {
  const english = draft.english.trim(),
    meaning = draft.meaning.trim();
  if (!english || !meaning)
    throw new Error(
      'Enter an English word or phrase and a Czech meaning or note.',
    );
  if (
    !['active', 'passive'].includes(draft.preference) ||
    !['B1', 'B2', 'C1'].includes(draft.level) ||
    ![
      'academic',
      'technical',
      'everyday',
      'workplace',
      'travel',
      'social',
    ].includes(draft.category)
  )
    throw new Error('Choose a valid preference, level and category.');
  return db.transaction(
    'rw',
    [
      db.vocabulary,
      db.vocabularyLinks,
      db.vocabularySets,
      db.topics,
      db.lessons,
      db.reviews,
      db.mistakes,
    ],
    async () => {
      const previous = draft.id ? await db.vocabulary.get(draft.id) : undefined;
      if (draft.id && !previous)
        throw new Error('This entry no longer exists. Reload the library.');
      if (previous && draft.updatedAt !== previous.updatedAt)
        throw new Error(
          'This entry changed in another tab. Reload before editing.',
        );
      if (
        draft.origin === 'mistake' &&
        (!draft.mistakeConceptId ||
          !(await db.mistakes.get(draft.mistakeConceptId)))
      )
        throw new Error('Choose an existing mistake as the source.');
      const entry: VocabularyEntry = {
        ...draft,
        id: previous?.id ?? newId(),
        english,
        meaning,
        createdAt: previous?.createdAt ?? now,
        updatedAt: Math.max(now, (previous?.updatedAt ?? 0) + 1),
      };
      if (associations) {
        for (const [ids, table] of [
          [associations.topics, db.topics],
          [associations.lessons, db.lessons],
          [associations.sets, db.vocabularySets],
        ] as const) {
          for (const id of ids)
            if (!(await table.get(id)))
              throw new Error(
                'A selected relationship no longer exists. Reload the editor.',
              );
        }
        await db.vocabularyLinks.where('entryId').equals(entry.id).delete();
        const links: VocabularyLink[] = [];
        for (const [kind, ids] of [
          ['topic', associations.topics],
          ['lesson', associations.lessons],
          ['set', associations.sets],
        ] as const) {
          for (const targetId of new Set(ids))
            links.push({
              id: `${entry.id}:${kind}:${targetId}`,
              entryId: entry.id,
              kind,
              targetId,
            });
        }
        if (links.length) await db.vocabularyLinks.bulkPut(links);
        // Set memberships are the canonical grouping; the editor can move even a
        // seeded entry without rewriting lesson definitions or scheduler code.
        for (const set of await db.vocabularySets.toArray()) {
          set.members = set.members.filter((m) => m.entryId !== entry.id);
          if (associations.sets.includes(set.id))
            set.members.push({
              entryId: entry.id,
              role: entry.english.includes(' ') ? 'phrase' : 'word',
            });
          await db.vocabularySets.put(set);
        }
      }
      await db.vocabulary.put(entry);
      const id = vocabularyConceptId(entry.id);
      const review = (await db.reviews.get(id)) ?? newReview(id, now);
      if (review.vocabularyPreference !== entry.preference)
        review.dueAt = Math.min(review.dueAt, now);
      if (
        review.vocabularyPreference !== entry.preference &&
        entry.preference === 'active' &&
        review.status === 'mastered'
      )
        review.status = 'reviewing';
      review.vocabularyPreference = entry.preference;
      await db.reviews.put(review);
      return entry;
    },
  );
}
export async function beginVocabularySession(
  db: LearningDatabase,
  selectedId?: string,
  now = Date.now(),
  focus?: VocabularyStage,
) {
  await seedVocabulary(db, now);
  return db.transaction(
    'rw',
    [
      db.sessions,
      db.reviews,
      db.vocabulary,
      db.vocabularySets,
      db.lessons,
      db.topics,
      db.skills,
      db.vocabularyLinks,
    ],
    async () => {
      const active = (await db.sessions.toArray()).find(
        (s) => s.module === 'vocabulary' && !s.completedAt,
      );
      if (active) return active;
      const catalog = await loadVocabularyWithoutSeed(db);
      if (selectedId && !catalog.entries.some((e) => e.id === selectedId))
        throw new Error('Vocabulary entry not found.');
      const reviews = await db.reviews.toArray();
      const content = catalog.entries.map((e) =>
        vocabularyConcept(
          e,
          reviews.find((r) => r.conceptId === vocabularyConceptId(e.id)),
          catalog,
          focus,
        ),
      );
      // Keep enough alternate concepts in the snapshot for genuine delayed recall,
      // even when practising just one chosen personal word.
      const s = startSession(
        newId(),
        now,
        content,
        reviews,
        selectedId
          ? [vocabularyConceptId(selectedId)]
          : vocabularyPracticeIds(catalog.entries, reviews, now),
      );
      s.module = 'vocabulary';
      s.content = content;
      await db.sessions.add(s);
      return s;
    },
  );
}
async function loadVocabularyWithoutSeed(
  db: LearningDatabase,
): Promise<VocabularyCatalog> {
  const [entries, sets, storedLessons, storedTopics, storedSkills, links] =
    await Promise.all([
      db.vocabulary.toArray(),
      db.vocabularySets.toArray(),
      db.lessons.toArray(),
      db.topics.toArray(),
      db.skills.toArray(),
      db.vocabularyLinks.toArray(),
    ]);
  return {
    entries,
    sets,
    lessons: storedLessons,
    topics: storedTopics,
    skills: storedSkills,
    links,
  };
}
export function associationsFor(
  catalog: VocabularyCatalog,
  entryId: string,
): Associations {
  const links = catalog.links.filter((l) => l.entryId === entryId);
  return {
    topics: links.filter((l) => l.kind === 'topic').map((l) => l.targetId),
    lessons: links.filter((l) => l.kind === 'lesson').map((l) => l.targetId),
    sets: entryRelations(catalog, entryId).sets.map((s) => s.id),
  };
}
