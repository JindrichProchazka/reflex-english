import type { LearningDatabase } from '../data/database';
import type { Attempt, Exercise, Mistake } from '../domain/models';
import { newReview, schedule } from '../domain/scheduler';
import { updateLessonProgress } from '../domain/study';

/** Shared by digital submissions and paper batches, inside their caller's transaction. */
export async function persistLearningResult(
  db: LearningDatabase,
  input: Attempt,
  exercise: Exercise,
  category: Mistake['category'],
) {
  const attempt = structuredClone(input);
  const previous =
    (await db.reviews.get(attempt.conceptId)) ??
    newReview(attempt.conceptId, attempt.at);
  if (attempt.source === 'paper' && attempt.referenceRevealed)
    previous.answerExposedAt = attempt.at;
  if (
    attempt.correct &&
    attempt.assistance === 'none' &&
    previous.answerExposedAt !== undefined &&
    attempt.at - previous.answerExposedAt < 86_400_000
  ) {
    const intervening = await db.attempts
      .where('at')
      .aboveOrEqual(previous.answerExposedAt)
      .filter(
        (a) =>
          a.source === 'typed' &&
          a.conceptId !== attempt.conceptId &&
          a.correct &&
          a.assistance === 'none',
      )
      .toArray();
    if (
      new Set(intervening.map((a) => `${a.sessionId}:${a.exerciseId}`)).size < 5
    ) {
      attempt.assistance = 'answer';
      attempt.recentExposureBlocked = true;
      attempt.masteryEligible = false;
    }
  }
  if (exercise.entryId) previous.requireProductive = true;
  const review = schedule(previous, attempt);
  await db.attempts.add({
    ...attempt,
    exerciseSnapshot: structuredClone(exercise),
  });
  await db.reviews.put(review);
  if (attempt.lessonId && attempt.entryId && attempt.lessonEvidence) {
    await db.lessonProgress.put(
      updateLessonProgress(
        await db.lessonProgress.get(attempt.lessonId),
        attempt,
      ),
    );
  }
  const old = await db.mistakes.get(attempt.conceptId);
  if (!attempt.correct || old) {
    const mistake: Mistake = old ?? {
      conceptId: attempt.conceptId,
      category,
      occurrences: 0,
      attemptIds: [],
      dates: [],
      prompt: exercise.prompt,
      answer: '',
      correctAnswer: exercise.answer,
      explanation: exercise.explanation,
      lastReviewAt: attempt.at,
      nextReviewAt: review.dueAt,
      status: review.status,
    };
    if (!attempt.correct) {
      mistake.occurrences++;
      mistake.attemptIds.push(attempt.id);
      mistake.dates.push(attempt.at);
      Object.assign(mistake, {
        prompt: exercise.prompt,
        answer: attempt.answer,
        correctAnswer: exercise.answer,
        explanation: exercise.explanation,
        answerRecorded: attempt.answerRecorded ?? true,
      });
    }
    Object.assign(mistake, {
      lastReviewAt: attempt.at,
      nextReviewAt: review.dueAt,
      status: review.status,
    });
    await db.mistakes.put(mistake);
  }
  return review;
}
