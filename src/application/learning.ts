import { concepts } from '../content/prepositions';
import { LearningDatabase } from '../data/database';
import { controlledEvaluator, phraseEvaluator } from '../domain/evaluation';
import { newId } from '../domain/id';
import type { Attempt, Session } from '../domain/models';
import { persistLearningResult } from './results';
import { startSession, submitToSession } from '../domain/session';

export const sessionContent = (session: Session) => session.content ?? concepts;
export function sessionExercise(session: Session) {
  const exercise = sessionContent(session)
    .flatMap((c) => c.exercises)
    .find((e) => e.id === session.exerciseId);
  if (!exercise) throw new Error('Exercise not found in this session.');
  return exercise;
}
async function checkedSession(db: LearningDatabase, expected: Session) {
  const session = await db.sessions.get(expected.id);
  if (!session || JSON.stringify(session) !== JSON.stringify(expected))
    throw new Error('This session changed in another tab. Reload to continue.');
  if (!session.current || session.completedAt)
    throw new Error('Session already complete.');
  return session;
}
export async function prepareAssessment(
  db: LearningDatabase,
  expected: Session,
  answer: string,
  durationMs: number,
  now = Date.now(),
) {
  if (!answer.trim()) throw new Error('Type an answer first.');
  return db.transaction('rw', db.sessions, async () => {
    const session = await checkedSession(db, expected);
    if (
      sessionExercise(session).evaluation !== 'self' ||
      session.wrongCount >= 2 ||
      session.assessment
    )
      throw new Error('This answer does not need self-assessment.');
    session.assessment = {
      answer,
      durationMs: Math.max(0, durationMs),
      at: now,
      referenceRevealed: false,
    };
    await db.sessions.put(session);
    return session;
  });
}
export async function revealReference(db: LearningDatabase, expected: Session) {
  return db.transaction('rw', db.sessions, async () => {
    const session = await checkedSession(db, expected);
    if (!session.assessment) throw new Error('Submit your response first.');
    session.assessment.referenceRevealed = true;
    await db.sessions.put(session);
    return session;
  });
}

export async function loadDashboard(db: LearningDatabase, now = Date.now()) {
  const [reviews, attempts, mistakes, sessions] = await Promise.all([
    db.reviews.toArray(),
    db.attempts.toArray(),
    db.mistakes.toArray(),
    db.sessions.toArray(),
  ]);
  return {
    reviews,
    attempts,
    mistakes,
    due: reviews.filter(
      (r) => r.dueAt <= now && (r.status !== 'new' || r.lastErrorSession),
    ).length,
    active: sessions.find((s) => s.module !== 'vocabulary' && !s.completedAt),
    completed: sessions.filter((s) => s.completedAt).length,
  };
}
export async function beginSession(db: LearningDatabase, now = Date.now()) {
  return db.transaction('rw', db.sessions, db.reviews, async () => {
    const active = (await db.sessions.toArray()).find(
      (s) => s.module !== 'vocabulary' && !s.completedAt,
    );
    if (active) return active;
    const reviews = await db.reviews.toArray();
    const session = startSession(newId(), now, concepts, reviews);
    session.module = 'prepositions';
    await db.sessions.add(session);
    return session;
  });
}
export async function recordAnswer(
  db: LearningDatabase,
  expected: Session,
  answer: string,
  durationMs: number,
  now = Date.now(),
  grade?: 'correct' | 'minor' | 'wrong',
) {
  if (!answer.trim()) throw new Error('Type an answer first.');
  return db.transaction(
    'rw',
    db.sessions,
    db.reviews,
    db.attempts,
    db.mistakes,
    db.lessonProgress,
    async () => {
      const session = await checkedSession(db, expected);
      const exercise = sessionExercise(session);
      const selfAssessed =
        exercise.evaluation === 'self' && session.wrongCount < 2;
      if (
        selfAssessed &&
        (!grade || !session.assessment || session.assessment.answer !== answer)
      )
        throw new Error('Submit and assess this response before continuing.');
      const correct = selfAssessed
        ? grade === 'correct'
        : (exercise.entryId ? phraseEvaluator : controlledEvaluator).evaluate(
            answer,
            exercise.acceptedAnswers ?? [exercise.answer],
          );
      const attempt: Attempt = {
        id: newId(),
        sessionId: session.id,
        conceptId: exercise.conceptId,
        exerciseId: exercise.id,
        prompt: exercise.prompt,
        expected: exercise.answer,
        answer,
        correct,
        at: selfAssessed ? session.assessment!.at : now,
        durationMs: selfAssessed
          ? session.assessment!.durationMs
          : Math.max(0, durationMs),
        assistance:
          session.wrongCount >= 2 || session.assessment?.referenceRevealed
            ? 'answer'
            : session.wrongCount === 1
              ? 'hint'
              : 'none',
        taskKind: session.current!.kind,
        source: 'typed',
        evaluator: selfAssessed ? 'self-assessment-v1' : 'accepted-answer-v1',
        grade: selfAssessed ? grade : correct ? 'correct' : 'wrong',
        stage: exercise.stage,
        productive: exercise.productive,
        contextId: exercise.contextId,
        referenceRevealed:
          session.assessment?.referenceRevealed ?? session.wrongCount >= 2,
        lessonId: session.lessonId ?? exercise.lessonId,
        worksheetId: session.worksheetId,
        studyMode:
          session.studyMode ??
          (exercise.lessonId
            ? exercise.lessonEvidence === 'enCs' ||
              exercise.lessonEvidence === 'csEn'
              ? 'recall'
              : 'context'
            : undefined),
        entryId: exercise.entryId,
        lessonEvidence: exercise.lessonEvidence,
      };
      const next = submitToSession(
        session,
        correct,
        now,
        sessionContent(session),
      );
      await persistLearningResult(
        db,
        attempt,
        exercise,
        concepts.some((c) => c.id === exercise.conceptId)
          ? 'preposition'
          : session.module === 'vocabulary'
            ? exercise.stage === 'collocation'
              ? 'collocation'
              : 'vocabulary'
            : 'preposition',
      );
      await db.sessions.put(next);
      return { session: next, correct };
    },
  );
}
