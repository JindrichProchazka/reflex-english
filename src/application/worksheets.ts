import type { LearningDatabase } from '../data/database';
import { concepts as grammarConcepts } from '../content/prepositions';
import { newId } from '../domain/id';
import { generateWorksheet, lessonWorksheetPool } from '../domain/worksheets';
import type {
  PaperResult,
  WorksheetOptions,
  WorksheetQuestion,
} from '../domain/worksheet-models';
import { recallConcept, lessonContent } from '../domain/study';
import { seedStudyLessons } from './study';
import { persistLearningResult } from './results';
import type { Attempt, Concept, Exercise } from '../domain/models';
import { startSession } from '../domain/session';
import { newReview } from '../domain/scheduler';

export async function createWorksheet(
  db: LearningDatabase,
  options: WorksheetOptions,
  now = Date.now(),
) {
  await seedStudyLessons(db);
  const [lessons, words, reviews, mistakes, attempts] = await Promise.all([
    db.studyLessons.toArray(),
    db.vocabulary.toArray(),
    db.reviews.toArray(),
    db.mistakes.toArray(),
    db.attempts.toArray(),
  ]);
  if (
    !['lesson', 'selection', 'due', 'mistakes', 'weak'].includes(
      options.source,
    ) ||
    !['recall', 'gap', 'phrase', 'translation', 'repair', 'mixed'].includes(
      options.kind,
    ) ||
    !['en-cs', 'cs-en', 'mixed'].includes(options.direction)
  )
    throw new Error('Choose valid worksheet options.');
  const lesson = lessons.find((l) => l.id === options.lessonId);
  let pool: WorksheetQuestion[];
  let title: string;
  if (options.source === 'lesson' || options.source === 'selection') {
    if (!lesson) throw new Error('Choose a vocabulary lesson.');
    if (options.source === 'selection' && !options.entryIds?.length)
      throw new Error('Select at least one word.');
    pool = lessonWorksheetPool(lesson).filter(
      (q) =>
        options.source !== 'selection' ||
        options.entryIds!.includes(q.exercise.entryId!),
    );
    title = lesson.title;
  } else {
    pool = lessons.flatMap(lessonWorksheetPool);
    pool.push(
      ...grammarConcepts.flatMap((c) =>
        c.exercises.map((e) => ({
          id: `grammar:${e.id}`,
          kind: 'gap' as const,
          exercise: e,
          category: 'preposition' as const,
        })),
      ),
    );
    for (const word of words.filter((w) => w.origin !== 'curriculum')) {
      for (const direction of ['en-cs', 'cs-en'] as const) {
        const exercise = recallConcept(
          {
            id: word.id,
            english: word.english,
            czech: word.meaning.split(';')[0],
            acceptedCzech: word.meaning.split(';').map((s) => s.trim()),
            examples: ['', ''],
          },
          `vocab:${word.id}`,
          direction,
        ).exercises[0];
        pool.push({
          id: `personal:${word.id}:${direction}`,
          kind: 'recall',
          exercise,
          category: 'vocabulary',
        });
      }
    }
    const known = new Set(pool.map((q) => q.exercise.conceptId));
    for (const mistake of mistakes.filter((m) => !known.has(m.conceptId))) {
      const last = attempts
        .filter((a) => a.conceptId === mistake.conceptId)
        .sort((a, b) => b.at - a.at)[0];
      const exercise: Exercise = last?.exerciseSnapshot ?? {
        id: `saved:${mistake.conceptId}`,
        conceptId: mistake.conceptId,
        prompt: mistake.prompt,
        answer: mistake.correctAnswer,
        explanation: mistake.explanation,
        hint: 'Recall the correction and its meaning.',
        evaluation: 'controlled',
      };
      pool.push({
        id: `saved:${exercise.id}`,
        kind: exercise.prompt.includes('___') ? 'gap' : 'repair',
        exercise,
        category: mistake.category,
        lessonId: last?.lessonId,
        lessonTitle: lessons.find((l) => l.id === last?.lessonId)?.title,
        openEnded: exercise.evaluation === 'self',
      });
    }
    let ids: string[];
    if (options.source === 'due') {
      ids = reviews
        .filter(
          (r) => r.dueAt <= now && (r.status !== 'new' || r.lastErrorSession),
        )
        .sort((a, b) => a.dueAt - b.dueAt)
        .map((r) => r.conceptId);
      title = 'Due reviews';
    } else if (options.source === 'mistakes') {
      ids = [...mistakes]
        .sort((a, b) => (b.dates.at(-1) ?? 0) - (a.dates.at(-1) ?? 0))
        .slice(0, 30)
        .map((m) => m.conceptId);
      title = 'Recent mistakes';
    } else {
      ids = reviews
        .filter(
          (r) =>
            r.status !== 'mastered' &&
            (r.status === 'learning' ||
              r.status === 'reviewing' ||
              r.lastErrorSession),
        )
        .sort((a, b) => a.dueAt - b.dueAt)
        .map((r) => r.conceptId);
      title = 'Weak items';
    }
    pool = pool
      .filter((q) => ids.includes(q.exercise.conceptId))
      .sort(
        (a, b) =>
          ids.indexOf(a.exercise.conceptId) - ids.indexOf(b.exercise.conceptId),
      );
  }
  const sheet = generateWorksheet(
    newId(),
    title,
    {
      ...options,
      lessonId:
        options.source === 'lesson' || options.source === 'selection'
          ? options.lessonId
          : undefined,
    },
    pool,
    now,
  );
  await db.worksheets.add(sheet);
  return sheet;
}
export async function viewAnswerKey(
  db: LearningDatabase,
  id: string,
  now = Date.now(),
) {
  return db.transaction('rw', db.worksheets, db.reviews, async () => {
    const sheet = await db.worksheets.get(id);
    if (!sheet) throw new Error('Worksheet not found.');
    // Every opening is fresh answer exposure, including a key printed days ago.
    sheet.keyViewedAt = now;
    sheet.revision++;
    await db.worksheets.put(sheet);
    for (const conceptId of new Set(
      sheet.questions.map((q) => q.exercise.conceptId),
    )) {
      const review =
        (await db.reviews.get(conceptId)) ?? newReview(conceptId, now);
      review.answerExposedAt = now;
      await db.reviews.put(review);
    }
    return sheet;
  });
}
function validateResults(
  questions: WorksheetQuestion[],
  results: Record<string, PaperResult>,
  complete: boolean,
) {
  if (Object.keys(results).some((id) => !questions.some((q) => q.id === id)))
    throw new Error('Result does not belong to this worksheet.');
  for (const value of Object.values(results))
    if (
      !['correct', 'minor', 'wrong'].includes(value.grade) ||
      (value.writtenAnswer !== undefined &&
        typeof value.writtenAnswer !== 'string')
    )
      throw new Error('Choose a valid grade for each question.');
  if (complete && questions.some((q) => !results[q.id]))
    throw new Error('Grade every question before submitting.');
}
export async function savePaperDraft(
  db: LearningDatabase,
  id: string,
  revision: number,
  results: Record<string, PaperResult>,
) {
  return db.transaction('rw', db.worksheets, async () => {
    const sheet = await db.worksheets.get(id);
    if (!sheet) throw new Error('Worksheet not found.');
    if (sheet.completedAt)
      throw new Error('These results have already been submitted.');
    if (sheet.revision !== revision)
      throw new Error(
        'This worksheet changed in another view. Reload before saving.',
      );
    validateResults(sheet.questions, results, false);
    sheet.results = structuredClone(results);
    sheet.revision++;
    await db.worksheets.put(sheet);
    return sheet;
  });
}
export async function submitPaperResults(
  db: LearningDatabase,
  id: string,
  revision: number,
  results: Record<string, PaperResult>,
  now = Date.now(),
) {
  return db.transaction(
    'rw',
    [db.worksheets, db.attempts, db.reviews, db.mistakes, db.lessonProgress],
    async () => {
      const sheet = await db.worksheets.get(id);
      if (!sheet) throw new Error('Worksheet not found.');
      if (sheet.completedAt) return sheet; // A networkless double click is still only one submission.
      if (sheet.revision !== revision)
        throw new Error(
          'This worksheet changed in another view. Reload before submitting.',
        );
      validateResults(sheet.questions, results, true);
      const failed = new Set(
        sheet.questions
          .filter((q) => results[q.id].grade !== 'correct')
          .map((q) => q.exercise.conceptId),
      );
      // Record failures before successes, so a correct item later in the same batch
      // cannot erase its conceptual error or manufacture delayed retrieval.
      const rank = { minor: 0, wrong: 1, correct: 2 };
      const ordered = [...sheet.questions].sort(
        (a, b) => rank[results[a.id].grade] - rank[results[b.id].grade],
      );
      for (const q of ordered) {
        const result = results[q.id];
        const attempt: Attempt = {
          id: `${sheet.id}:${q.id}`,
          sessionId: `paper:${sheet.id}`,
          conceptId: q.exercise.conceptId,
          exerciseId: q.exercise.id,
          prompt: q.exercise.prompt,
          expected: q.exercise.answer,
          answer: result.writtenAnswer?.trim() ?? '',
          answerRecorded: !!result.writtenAnswer?.trim(),
          correct: result.grade === 'correct',
          grade: result.grade,
          at: now,
          durationMs: null,
          assistance: sheet.keyViewedAt !== undefined ? 'answer' : 'none',
          referenceRevealed: sheet.keyViewedAt !== undefined,
          masteryEligible:
            sheet.keyViewedAt === undefined &&
            !failed.has(q.exercise.conceptId),
          taskKind: 'paper',
          source: 'paper',
          evaluator: 'paper-self-assessment-v1',
          worksheetId: sheet.id,
          worksheetItemId: q.id,
          lessonId: q.lessonId,
          entryId: q.exercise.entryId,
          lessonEvidence: q.exercise.lessonEvidence,
          studyMode: q.kind === 'recall' ? 'recall' : 'context',
          stage: q.exercise.stage,
          productive: q.exercise.productive,
          contextId: q.exercise.contextId,
        };
        await persistLearningResult(db, attempt, q.exercise, q.category);
      }
      sheet.results = structuredClone(results);
      sheet.completedAt = now;
      sheet.submittedAssisted = sheet.keyViewedAt !== undefined;
      sheet.revision++;
      await db.worksheets.put(sheet);
      return sheet;
    },
  );
}
export async function deleteWorksheet(
  db: LearningDatabase,
  id: string,
  confirmed: boolean,
) {
  if (!confirmed) throw new Error('Confirm worksheet deletion first.');
  await db.worksheets.delete(id); // Learning attempts and mistake history remain intact.
}
export async function beginWorksheetReview(
  db: LearningDatabase,
  id: string,
  now = Date.now(),
) {
  return db.transaction(
    'rw',
    db.worksheets,
    db.sessions,
    db.reviews,
    db.studyLessons,
    async () => {
      const active = (await db.sessions.toArray()).find(
        (s) => s.worksheetId === id && !s.completedAt,
      );
      if (active) return active;
      const sheet = await db.worksheets.get(id);
      if (!sheet?.completedAt)
        throw new Error('Submit the paper results first.');
      const targets = sheet.questions.filter(
        (q) =>
          sheet.results[q.id].grade !== 'correct' ||
          sheet.keyViewedAt !== undefined,
      );
      if (!targets.length)
        throw new Error('No corrections need reviewing from this worksheet.');
      const content: Concept[] = [];
      for (const q of sheet.questions) {
        let concept = content.find((c) => c.id === q.exercise.conceptId);
        if (!concept) {
          concept = {
            id: q.exercise.conceptId,
            title: q.lessonTitle ?? 'Worksheet review',
            group: q.kind,
            exercises: [],
          };
          content.push(concept);
        }
        if (!concept.exercises.some((e) => e.id === q.exercise.id))
          concept.exercises.push(q.exercise);
      }
      const targetIds = [...new Set(targets.map((q) => q.exercise.conceptId))];
      const canonical = [
        ...grammarConcepts,
        ...(await db.studyLessons.toArray()).flatMap((l) =>
          [
            ...lessonContent(l, 'recall', 'mixed'),
            ...lessonContent(l, 'context', 'mixed'),
          ].map((c) => ({
            ...c,
            exercises: c.exercises.map((e) => ({ ...e, lessonId: l.id })),
          })),
        ),
      ];
      for (const concept of content) {
        const matching = canonical.find((c) => c.id === concept.id);
        if (matching)
          concept.exercises.push(
            ...matching.exercises.filter(
              (e) => !concept.exercises.some((old) => old.id === e.id),
            ),
          );
      }
      const filler = canonical
        .filter((c) => !targetIds.includes(c.id))
        .slice(0, 5);
      for (const concept of filler)
        if (!content.some((c) => c.id === concept.id)) content.push(concept);
      const s = startSession(
        newId(),
        now,
        content,
        await db.reviews.toArray(),
        [...filler.map((c) => c.id), ...targetIds],
        targetIds,
      );
      Object.assign(s, {
        content,
        module: 'vocabulary',
        worksheetId: sheet.id,
        studyMode: 'recall',
        acquisition: false,
      });
      await db.sessions.add(s);
      return s;
    },
  );
}
