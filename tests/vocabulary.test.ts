import Dexie from 'dexie';
import { afterEach, describe, expect, it } from 'vitest';
import { LearningDatabase } from '../src/data/database';
import {
  associationsFor,
  beginVocabularySession,
  emptyVocabulary,
  loadVocabulary,
  saveVocabulary,
  seedVocabulary,
} from '../src/application/vocabulary';
import {
  beginSession,
  prepareAssessment,
  recordAnswer,
  revealReference,
  sessionExercise,
} from '../src/application/learning';
import {
  entryRelations,
  filterVocabulary,
  STAGES,
  vocabularyConcept,
  vocabularyConceptId,
  vocabularyStage,
  vocabularyPracticeIds,
} from '../src/domain/vocabulary';
import { DAY, newReview, schedule } from '../src/domain/scheduler';
import type { Attempt, ReviewItem } from '../src/domain/models';
import {
  vocabularySeed,
  lessons,
  topics,
  skills,
  vocabularySets,
} from '../src/content/vocabulary';
import type { VocabularyCatalog } from '../src/domain/vocabulary-models';

const now = Date.UTC(2026, 9, 17);
const catalog: VocabularyCatalog = {
  entries: vocabularySeed,
  sets: vocabularySets,
  lessons,
  topics,
  skills,
  links: [],
};
const entry = vocabularySeed[0];
const databases: LearningDatabase[] = [];
function database(name: string = crypto.randomUUID()) {
  const db = new LearningDatabase(name);
  databases.push(db);
  return db;
}
afterEach(async () => {
  for (const db of databases) db.close();
  for (const name of new Set(databases.map((db) => db.name)))
    await new LearningDatabase(name).delete();
  databases.length = 0;
});

describe('curriculum-independent vocabulary models', () => {
  it('selects due reviews before new entries, excludes future-only items when due work exists, and caps short sessions', () => {
    const reviews = vocabularySeed.map((e) =>
      newReview(vocabularyConceptId(e.id), now + DAY),
    );
    reviews[4] = { ...reviews[4], status: 'reviewing', dueAt: now - DAY };
    reviews[8].dueAt = now;
    expect(vocabularyPracticeIds(vocabularySeed, reviews, now, 2)).toEqual([
      reviews[4].conceptId,
      reviews[8].conceptId,
    ]);
    expect(vocabularyPracticeIds(vocabularySeed, reviews, now, 1)).toHaveLength(
      1,
    );
  });
  it('reuses one entry across sets, lessons and direct topic links', () => {
    const extended = structuredClone(catalog);
    extended.sets[1].members.push({ entryId: entry.id, role: 'word' });
    extended.links.push({
      id: 'link',
      entryId: entry.id,
      kind: 'topic',
      targetId: 'everyday',
    });
    const relations = entryRelations(extended, entry.id);
    expect(relations.sets).toHaveLength(2);
    expect(relations.lessons).toHaveLength(2);
    expect(relations.topics).toHaveLength(3);
    expect(
      filterVocabulary(extended, { lesson: 'lab-fault', search: 'deadline' }),
    ).toEqual([entry]);
    expect(
      filterVocabulary(extended, { category: 'technical', search: 'deadline' }),
    ).toEqual([]);
    expect(
      filterVocabulary(extended, { topic: 'everyday', search: 'termín' }),
    ).toEqual([entry]);
  });
  it('progresses through seven evidence-based stages, with lighter passive requirements', () => {
    const review = newReview(vocabularyConceptId(entry.id), now);
    for (const stage of STAGES) {
      expect(vocabularyStage(entry, review)).toBe(stage);
      const concept = vocabularyConcept(entry, review, catalog);
      expect(concept.exercises.every((e) => e.stage === stage)).toBe(true);
      if (stage !== 'recognition' && stage !== 'meaning-recall')
        expect(concept.title).toBe(entry.meaning);
      review.successes.push({
        at: now,
        exerciseId: `${stage}:0`,
        sessionId: stage,
        stage,
        productive: !['recognition', 'meaning-recall'].includes(stage),
      });
    }
    expect(vocabularyStage({ ...entry, preference: 'passive' }, review)).toBe(
      'meaning-recall',
    );
    const open = vocabularyConcept(entry, review, catalog);
    expect(open.exercises[0].evaluation).toBe('self');
    expect(open.exercises[0].prompt).toContain(lessons[0].task.prompt);
  });
  it('keeps quick-captured notes usable without inventing accepted English sentences', () => {
    const minimal = {
      ...entry,
      examples: [],
      collocations: [],
      explanation: '',
      userSentence: '',
    };
    for (const stage of STAGES) {
      const exercise = vocabularyConcept(minimal, undefined, catalog, stage)
        .exercises[0];
      expect(exercise.prompt).toBeTruthy();
      expect(exercise.answer).toBeTruthy();
      expect(exercise.evaluation).toBe(
        stage === 'english-production' ? 'controlled' : 'self',
      );
    }
  });
  it('gates active mastery on sentence, different-context and realistic-task use', () => {
    let review: ReviewItem = {
      ...newReview('vocab:test', now),
      vocabularyPreference: 'active',
    };
    const make = (i: number, stage: Attempt['stage']): Attempt => ({
      id: `${i}`,
      sessionId: `s${i}`,
      conceptId: review.conceptId,
      exerciseId: `${stage}:${i}`,
      prompt: 'Test',
      expected: 'Reference',
      answer: 'Response',
      correct: true,
      at: now + i * 3 * DAY,
      durationMs: 100,
      assistance: 'none',
      taskKind: 'initial',
      source: 'typed',
      evaluator: 'self-assessment-v1',
      stage,
      productive: !['recognition', 'meaning-recall'].includes(stage!),
    });
    for (let i = 0; i < 4; i++)
      review = schedule(review, make(i, 'meaning-recall'));
    expect(review.status).toBe('reviewing');
    review = schedule(review, make(4, 'sentence'));
    review = schedule(review, make(5, 'different-context'));
    expect(review.status).toBe('reviewing');
    review = schedule(review, make(6, 'scenario'));
    expect(review.status).toBe('mastered');
    let passive: ReviewItem = {
      ...newReview('vocab:passive', now),
      vocabularyPreference: 'passive',
    };
    for (let i = 0; i < 4; i++)
      passive = schedule(passive, {
        ...make(i, 'meaning-recall'),
        conceptId: passive.conceptId,
      });
    expect(passive.status).toBe('mastered');
  });
});

describe('vocabulary persistence and shared learning pipeline', () => {
  it('seeds once, permits built-in edits and preserves edits on later loads', async () => {
    const db = database();
    await seedVocabulary(db, now);
    const saved = await saveVocabulary(
      db,
      { ...(await db.vocabulary.get(entry.id))!, english: 'deadline (edited)' },
      undefined,
      now + 1,
    );
    await seedVocabulary(db, now + 2);
    expect((await loadVocabulary(db)).entries).toHaveLength(9);
    expect((await db.vocabulary.get(saved.id))?.english).toBe(
      'deadline (edited)',
    );
  });
  it('quick-adds arbitrary words, persists all metadata and relationships and rejects stale edits', async () => {
    const db = database();
    await seedVocabulary(db, now);
    const added = await saveVocabulary(
      db,
      {
        ...emptyVocabulary(),
        english: '  backlash ',
        meaning: 'vůle v převodech',
      },
      undefined,
      now,
    );
    expect(added.english).toBe('backlash');
    expect((await db.reviews.get(vocabularyConceptId(added.id)))?.dueAt).toBe(
      now,
    );
    const links = {
      topics: ['engineering', 'study'],
      lessons: ['lab-fault', 'project-deadline'],
      sets: ['set:engineering', 'set:study'],
    };
    const edited = await saveVocabulary(
      db,
      {
        ...added,
        preference: 'passive',
        category: 'technical',
        source: 'Mechanics lecture',
        collocations: ['excessive backlash'],
        examples: ['The gearbox has excessive backlash.'],
        userSentence: 'We measured the backlash.',
        notes: 'Check the gear pair.',
        tags: ['mechanics'],
        level: 'C1',
      },
      links,
      now + 1,
    );
    db.close();
    const reopened = database(db.name);
    const loaded = await loadVocabulary(reopened);
    expect(loaded.entries.find((e) => e.id === added.id)).toEqual(edited);
    expect(associationsFor(loaded, added.id)).toEqual(links);
    expect(entryRelations(loaded, added.id).lessons).toHaveLength(2);
    await expect(saveVocabulary(reopened, added)).rejects.toThrow(
      'another tab',
    );
    await expect(
      saveVocabulary(reopened, {
        ...emptyVocabulary(),
        english: 'only a word',
      }),
    ).rejects.toThrow('Czech meaning');
  });
  it('migrates v1 databases without losing grammar history or active sessions', async () => {
    const name = crypto.randomUUID();
    const old = new Dexie(name);
    old.version(1).stores({
      reviews: 'conceptId, dueAt, status',
      attempts: 'id, sessionId, conceptId, at',
      mistakes: 'conceptId',
      sessions: 'id, startedAt',
    });
    await old
      .table('reviews')
      .put({ ...newReview('clock', now), status: 'learning' });
    await old.table('attempts').put({
      id: 'old-attempt',
      sessionId: 'old-session',
      conceptId: 'clock',
      at: now,
      answer: 'on',
    });
    await old
      .table('sessions')
      .put({ id: 'old-session', startedAt: now, completedAt: now + 1 });
    old.close();
    const upgraded = database(name);
    await seedVocabulary(upgraded, now);
    expect(await upgraded.attempts.get('old-attempt')).toMatchObject({
      answer: 'on',
    });
    expect(await upgraded.reviews.get('clock')).toMatchObject({
      status: 'learning',
    });
    expect(await upgraded.sessions.get('old-session')).toMatchObject({
      completedAt: now + 1,
    });
    expect(await upgraded.vocabulary.count()).toBe(9);
  });
  it('snapshots practice, separates active modules, and persists pending self-assessments across reload', async () => {
    const db = database();
    await seedVocabulary(db, now);
    const grammar = await beginSession(db, now);
    const s = await beginVocabularySession(db, entry.id, now);
    expect(s.id).not.toBe(grammar.id);
    expect(sessionExercise(s).stage).toBe('recognition');
    const pending = await prepareAssessment(
      db,
      s,
      'termín odevzdání práce',
      321,
      now + 1,
    );
    db.close();
    const reopened = database(db.name);
    expect((await reopened.sessions.get(s.id))?.assessment?.answer).toBe(
      'termín odevzdání práce',
    );
    await saveVocabulary(
      reopened,
      {
        ...(await reopened.vocabulary.get(entry.id))!,
        english: 'changed entry',
      },
      undefined,
      now + 2,
    );
    expect(sessionExercise((await reopened.sessions.get(s.id))!).prompt).toBe(
      sessionExercise(s).prompt,
    );
    const result = await recordAnswer(
      reopened,
      pending,
      pending.assessment!.answer,
      999,
      now + 4,
      'correct',
    );
    const attempts = await reopened.attempts.toArray();
    expect(attempts[0]).toMatchObject({
      durationMs: 321,
      evaluator: 'self-assessment-v1',
      stage: 'recognition',
      assistance: 'none',
    });
    expect(result.session.processed).toBe(1);
    expect(
      (await reopened.reviews.get(vocabularyConceptId(entry.id)))?.successes,
    ).toHaveLength(1);
  });
  it('records minor problems as mistakes, hints before revealing, then requires reproduction and delayed recall', async () => {
    const db = database();
    await seedVocabulary(db, now);
    let s = await beginVocabularySession(db, entry.id, now, 'sentence');
    s = await prepareAssessment(
      db,
      s,
      'This deadline are yesterday.',
      500,
      now + 1,
    );
    s = (await recordAnswer(db, s, s.assessment!.answer, 0, now + 2, 'minor'))
      .session;
    expect(s.feedback).toBe('hint');
    expect(s.assessment).toBeUndefined();
    s = await prepareAssessment(
      db,
      s,
      'The deadline were today.',
      600,
      now + 3,
    );
    s = (await recordAnswer(db, s, s.assessment!.answer, 0, now + 4, 'wrong'))
      .session;
    expect(s.feedback).toBe('correction');
    const answer = sessionExercise(s).answer;
    s = (await recordAnswer(db, s, answer, 100, now + 5)).session;
    expect(
      s.queue
        .filter((t) => t.conceptId === vocabularyConceptId(entry.id))
        .map((t) => t.kind),
    ).toEqual(['delayed', 'final']);
    const mistake = await db.mistakes.get(vocabularyConceptId(entry.id));
    expect(mistake).toMatchObject({ category: 'vocabulary', occurrences: 2 });
    expect(
      (await db.reviews.get(vocabularyConceptId(entry.id)))?.successes,
    ).toHaveLength(0);
    expect(
      (await db.attempts.toArray()).find((a) => a.grade === 'minor'),
    ).toBeDefined();
  });
  it('does not award strong evidence for reference-assisted self-assessment', async () => {
    const db = database();
    await seedVocabulary(db, now);
    let s = await beginVocabularySession(db, entry.id, now, 'scenario');
    s = await prepareAssessment(
      db,
      s,
      'I need another day for the project.',
      100,
      now + 1,
    );
    s = await revealReference(db, s);
    await recordAnswer(db, s, s.assessment!.answer, 100, now + 2, 'correct');
    expect((await db.attempts.toArray())[0]).toMatchObject({
      assistance: 'answer',
      referenceRevealed: true,
    });
    expect(
      (await db.reviews.get(vocabularyConceptId(entry.id)))?.successes,
    ).toHaveLength(0);
  });
  it('creates mistake-derived language with conceptual source links and varied practice', async () => {
    const db = database();
    const grammar = await beginSession(db, now);
    await recordAnswer(db, grammar, 'wrong', 100, now + 1);
    await seedVocabulary(db, now);
    const mistake = (await db.mistakes.toArray())[0];
    const word = await saveVocabulary(
      db,
      {
        ...emptyVocabulary(),
        english: 'arrive in / arrive at',
        meaning: 'dorazit do města / na místo',
        origin: 'mistake',
        mistakeConceptId: mistake.conceptId,
        collocations: ['arrive in Prague', 'arrive at the station'],
        examples: ['We arrived in Prague.', 'She arrived at the station.'],
      },
      undefined,
      now + 2,
    );
    expect(await db.vocabulary.get(word.id)).toMatchObject({
      origin: 'mistake',
      mistakeConceptId: mistake.conceptId,
    });
    const s = await beginVocabularySession(db, word.id, now + 3);
    const exercise = s.content!.find(
      (c) => c.id === vocabularyConceptId(word.id),
    )!;
    expect(exercise.exercises[0].prompt).not.toBe(exercise.exercises[1].prompt);
  });
});
