import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen, within } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { LearningDatabase, db as uiDb } from '../src/data/database';
import {
  createWorksheet,
  viewAnswerKey,
  savePaperDraft,
  submitPaperResults,
  deleteWorksheet,
  beginWorksheetReview,
} from '../src/application/worksheets';
import {
  beginSession,
  recordAnswer,
  sessionExercise,
} from '../src/application/learning';
import { beginLessonSession, loadStudyLibrary } from '../src/application/study';
import { studyLessons } from '../src/content/study-lessons';
import { paperTranslations } from '../src/content/paper-translations';
import {
  generateWorksheet,
  lessonWorksheetPool,
} from '../src/domain/worksheets';
import { WorksheetPage } from '../src/features/Printable';
import type {
  Worksheet,
  WorksheetKind,
  WorksheetOptions,
  PaperResult,
} from '../src/domain/worksheet-models';
import { DAY, newReview } from '../src/domain/scheduler';

const now = Date.UTC(2026, 9, 17);
const options: WorksheetOptions = {
  source: 'lesson',
  lessonId: 'hotel',
  kind: 'mixed',
  direction: 'mixed',
  count: 10,
};
const databases: LearningDatabase[] = [];
function database() {
  const db = new LearningDatabase(crypto.randomUUID());
  databases.push(db);
  return db;
}
function allCorrect(sheet: Worksheet): Record<string, PaperResult> {
  return Object.fromEntries(
    sheet.questions.map((q) => [q.id, { grade: 'correct' }]),
  );
}
afterEach(async () => {
  cleanup();
  for (const db of databases) await db.delete();
  databases.length = 0;
  await uiDb.delete();
});

describe('worksheet generation', () => {
  it('generates every worksheet kind from all twenty lessons with explicit reference translations', () => {
    for (const lesson of studyLessons) {
      expect(paperTranslations[lesson.id]).toHaveLength(lesson.words.length);
      const pool = lessonWorksheetPool(lesson);
      for (const kind of [
        'recall',
        'gap',
        'phrase',
        'translation',
        'repair',
        'mixed',
      ] as WorksheetKind[]) {
        const sheet = generateWorksheet(
          'test',
          lesson.title,
          { ...options, lessonId: lesson.id, kind, count: 40 },
          pool,
          now,
        );
        expect(sheet.questions.length).toBeGreaterThan(0);
        expect(sheet.questions.length).toBeLessThanOrEqual(40);
        expect(sheet.questions.every((q) => q.lessonId === lesson.id)).toBe(
          true,
        );
        expect(
          new Set(
            sheet.questions.map(
              (q) => `${q.exercise.prompt}|${q.exercise.instruction}`,
            ),
          ).size,
        ).toBe(sheet.questions.length);
        expect(new Set(sheet.questions.map((q) => q.id)).size).toBe(
          sheet.questions.length,
        );
        if (kind === 'mixed')
          expect(new Set(sheet.questions.map((q) => q.kind)).size).toBe(5);
        else expect(sheet.questions.every((q) => q.kind === kind)).toBe(true);
      }
    }
  });
  it('limits focused one-direction recall to unique items, and separates selected vocabulary sets', async () => {
    const db = database();
    const focused = await createWorksheet(
      db,
      { ...options, kind: 'recall', direction: 'cs-en', count: 40 },
      now,
    );
    expect(focused.questions).toHaveLength(15);
    expect(
      focused.questions.every((q) => q.exercise.lessonEvidence === 'csEn'),
    ).toBe(true);
    const selected = await createWorksheet(
      db,
      { ...options, source: 'selection', entryIds: ['hotel-1', 'hotel-2'] },
      now,
    );
    expect(
      selected.questions.every((q) =>
        ['hotel-1', 'hotel-2'].includes(q.exercise.entryId!),
      ),
    ).toBe(true);
    await expect(
      createWorksheet(
        db,
        { ...options, source: 'selection', entryIds: [] },
        now,
      ),
    ).rejects.toThrow('Select at least');
  });
  it('persists unique IDs and original question snapshots across reload and later content edits', async () => {
    const db = database();
    const a = await createWorksheet(db, options, now),
      b = await createWorksheet(db, options, now);
    expect(a.id).not.toBe(b.id);
    const lesson = (await db.studyLessons.get('hotel'))!;
    lesson.words[0].english = 'changed after printing';
    await db.studyLessons.put(lesson);
    db.close();
    const reopened = new LearningDatabase(db.name);
    databases.push(reopened);
    expect(await reopened.worksheets.get(a.id)).toEqual(a);
  });
  it('selects due, recent mistake and weak concepts across vocabulary and grammar', async () => {
    const db = database();
    const grammar = await beginSession(db, now);
    await recordAnswer(db, grammar, 'wrong', 100, now);
    const lesson = await beginLessonSession(
      db,
      'hotel',
      'recall',
      'cs-en',
      now,
    );
    await recordAnswer(db, lesson, 'wrong', 100, now);
    const recent = await createWorksheet(
      db,
      { ...options, source: 'mistakes', lessonId: undefined, count: 40 },
      now,
    );
    expect(recent.questions.some((q) => q.category === 'preposition')).toBe(
      true,
    );
    expect(recent.questions.some((q) => q.lessonId === 'hotel')).toBe(true);
    const due = await createWorksheet(
      db,
      { ...options, source: 'due', lessonId: undefined },
      now + DAY,
    );
    expect(
      due.questions.some(
        (q) => q.exercise.conceptId === grammar.current!.conceptId,
      ),
    ).toBe(true);
    const weak = await createWorksheet(
      db,
      { ...options, source: 'weak', lessonId: undefined },
      now,
    );
    expect(weak.questions.some((q) => q.lessonId === 'hotel')).toBe(true);
  });
  it('does not invent learning data for an empty due source', async () => {
    const db = database();
    await expect(
      createWorksheet(
        db,
        { ...options, source: 'due', lessonId: undefined },
        now,
      ),
    ).rejects.toThrow('No matching questions');
    expect(await db.worksheets.count()).toBe(0);
    expect(await db.attempts.count()).toBe(0);
  });
});

describe('paper results in the shared learning engine', () => {
  it('keeps submitted provenance immutable if the key is opened only afterwards', async () => {
    const db = database();
    const sheet = await createWorksheet(db, options, now);
    await submitPaperResults(db, sheet.id, 0, allCorrect(sheet), now);
    const before = await db.attempts.toArray();
    await viewAnswerKey(db, sheet.id, now + DAY);
    expect(await db.attempts.toArray()).toEqual(before);
    expect((await db.worksheets.get(sheet.id))?.submittedAssisted).toBe(false);
  });
  it('updates an existing conceptual paper mistake rather than creating duplicates', async () => {
    const db = database();
    for (let i = 0; i < 2; i++) {
      const sheet = await createWorksheet(
        db,
        { ...options, kind: 'recall', direction: 'cs-en' },
        now + i,
      );
      const results = allCorrect(sheet);
      results[sheet.questions[0].id] = { grade: 'wrong' };
      await submitPaperResults(db, sheet.id, 0, results, now + i);
    }
    const mistakes = await db.mistakes.toArray();
    expect(mistakes).toHaveLength(1);
    expect(mistakes[0].occurrences).toBe(2);
    expect(mistakes[0].attemptIds).toHaveLength(2);
  });
  it('records fresh exposure every time an old key is reopened', async () => {
    const db = database();
    const sheet = await createWorksheet(db, options, now);
    const first = await viewAnswerKey(db, sheet.id, now);
    const later = await viewAnswerKey(db, sheet.id, now + 10 * DAY);
    expect(later.keyViewedAt).toBe(now + 10 * DAY);
    expect(later.revision).toBe(first.revision + 1);
    expect(
      (await db.reviews.get(sheet.questions[0].exercise.conceptId))
        ?.answerExposedAt,
    ).toBe(now + 10 * DAY);
  });
  it('cannot bypass answer-key assistance by immediately switching to a normal digital lesson', async () => {
    const db = database();
    const sheet = await createWorksheet(
      db,
      { ...options, kind: 'recall', direction: 'cs-en', count: 40 },
      now,
    );
    await viewAnswerKey(db, sheet.id, now);
    let s = await beginLessonSession(db, 'hotel', 'recall', 'cs-en', now + 1);
    // Force an exposed item first; non-exposed words may be selected by balance.
    const exposed = new Set(sheet.questions.map((q) => q.exercise.conceptId));
    for (let i = 0; i < 16 && !exposed.has(s.current!.conceptId); i++)
      s = (
        await recordAnswer(db, s, sessionExercise(s).answer, 100, now + 2 + i)
      ).session;
    const exercise = sessionExercise(s);
    await recordAnswer(db, s, exercise.answer, 100, now + 20);
    const attempt = (await db.attempts.toArray()).find(
      (a) => a.conceptId === exercise.conceptId,
    )!;
    expect(attempt).toMatchObject({
      assistance: 'answer',
      recentExposureBlocked: true,
    });
    expect((await db.reviews.get(exercise.conceptId))?.successes).toHaveLength(
      0,
    );
    expect(
      (await db.lessonProgress.get('hotel'))?.items[exercise.entryId!]?.csEn,
    ).not.toBe(true);
  });
  it('records mixed grades, missing transcription and unknown timing; mistakes and scheduling persist', async () => {
    const db = database();
    const sheet = await createWorksheet(db, options, now);
    const results = allCorrect(sheet);
    results[sheet.questions[0].id] = {
      grade: 'wrong',
      writtenAnswer: 'my wrong paper answer',
    };
    // Pick another concept so its weaker six-hour interval is independently visible.
    const minor = sheet.questions.find(
      (q) => q.exercise.conceptId !== sheet.questions[0].exercise.conceptId,
    )!;
    results[minor.id] = { grade: 'minor' };
    const done = await submitPaperResults(
      db,
      sheet.id,
      sheet.revision,
      results,
      now + 100,
    );
    expect(done.completedAt).toBe(now + 100);
    expect(await db.attempts.count()).toBe(10);
    const attempts = await db.attempts.toArray();
    expect(
      attempts.every(
        (a) =>
          a.source === 'paper' &&
          a.durationMs === null &&
          a.evaluator === 'paper-self-assessment-v1',
      ),
    ).toBe(true);
    expect(
      attempts
        .filter((a) => a.grade === 'correct')
        .every((a) => !a.answerRecorded && a.answer === ''),
    ).toBe(true);
    expect(
      await db.mistakes.get(sheet.questions[0].exercise.conceptId),
    ).toMatchObject({
      answer: 'my wrong paper answer',
      occurrences: 1,
      nextReviewAt: now + 100 + 600_000,
    });
    expect((await db.reviews.get(minor.exercise.conceptId))?.dueAt).toBe(
      now + 100 + 6 * 3_600_000,
    );
    db.close();
    const reopened = new LearningDatabase(db.name);
    databases.push(reopened);
    expect((await reopened.worksheets.get(sheet.id))?.results).toEqual(results);
    expect((await loadStudyLibrary(reopened)).paperCompleted.hotel).toBe(1);
  });
  it('correct unassisted paper recall earns normal evidence, but answer-key exposure cannot promote mastery or lesson skills', async () => {
    const db = database();
    const plain = await createWorksheet(
      db,
      { ...options, kind: 'recall', direction: 'cs-en' },
      now,
    );
    await submitPaperResults(db, plain.id, 0, allCorrect(plain), now);
    expect(
      (await db.reviews.get(plain.questions[0].exercise.conceptId))?.successes,
    ).toHaveLength(1);
    const sheet = await createWorksheet(
      db,
      { ...options, kind: 'recall', direction: 'cs-en' },
      now + 8 * DAY,
    );
    const conceptId = sheet.questions[0].exercise.conceptId;
    await db.reviews.put({
      ...newReview(conceptId, now),
      status: 'reviewing',
      intervalIndex: 3,
      dueAt: now + 30 * DAY,
      requireProductive: true,
      productiveUseAt: now,
      successes: [0, 1, 4].map((day, i) => ({
        at: now + day * DAY,
        sessionId: `old${i}`,
        exerciseId: `old${i}`,
        productive: true,
      })),
      recentReviews: [true, true, true],
    });
    const exposed = await viewAnswerKey(db, sheet.id, now + 8 * DAY);
    await submitPaperResults(
      db,
      sheet.id,
      exposed.revision,
      allCorrect(exposed),
      now + 8 * DAY,
    );
    const review = (await db.reviews.get(conceptId))!;
    expect(review.status).toBe('reviewing');
    expect(review.successes).toHaveLength(3);
    expect(review.dueAt).toBeLessThanOrEqual(now + 9 * DAY);
    expect(
      (await db.attempts.where('worksheetId').equals(sheet.id).toArray())
        .length,
    ).toBe(10);
  });
  it('persists exposure before revealing answers and blocks stale submissions after another view opens the key', async () => {
    const db = database();
    const sheet = await createWorksheet(db, options, now);
    const draft = await savePaperDraft(db, sheet.id, 0, {
      [sheet.questions[0].id]: { grade: 'wrong', writtenAnswer: 'saved note' },
    });
    const exposed = await viewAnswerKey(db, sheet.id, now + 1);
    await expect(
      submitPaperResults(
        db,
        sheet.id,
        draft.revision,
        allCorrect(sheet),
        now + 2,
      ),
    ).rejects.toThrow('another view');
    await submitPaperResults(
      db,
      sheet.id,
      exposed.revision,
      allCorrect(exposed),
      now + 2,
    );
    expect(
      (await db.reviews.toArray()).every((r) => r.successes.length === 0),
    ).toBe(true);
    expect(
      (await db.lessonProgress.toArray()).every((p) =>
        Object.values(p.items).every(
          (item) => !Object.values(item).some(Boolean),
        ),
      ),
    ).toBe(true);
  });
  it('rejects incomplete grading, is idempotent and preserves learning records on confirmed deletion', async () => {
    const db = database();
    const sheet = await createWorksheet(db, options, now);
    await expect(submitPaperResults(db, sheet.id, 0, {}, now)).rejects.toThrow(
      'every question',
    );
    const done = await submitPaperResults(
      db,
      sheet.id,
      0,
      allCorrect(sheet),
      now,
    );
    await submitPaperResults(
      db,
      sheet.id,
      done.revision,
      allCorrect(sheet),
      now + 1,
    );
    expect(await db.attempts.count()).toBe(sheet.questions.length);
    await expect(deleteWorksheet(db, sheet.id, false)).rejects.toThrow(
      'Confirm',
    );
    expect(await db.worksheets.get(sheet.id)).toBeDefined();
    await deleteWorksheet(db, sheet.id, true);
    expect(await db.worksheets.get(sheet.id)).toBeUndefined();
    expect(await db.attempts.count()).toBe(sheet.questions.length);
  });
  it('does not allow a same-worksheet success to cancel a conceptual failure', async () => {
    const db = database();
    const sheet = await createWorksheet(
      db,
      { ...options, kind: 'recall', count: 40 },
      now,
    );
    const q = sheet.questions[0];
    const results = allCorrect(sheet);
    results[q.id] = { grade: 'wrong' };
    await submitPaperResults(db, sheet.id, 0, results, now);
    expect(
      (await db.reviews.get(q.exercise.conceptId))?.successes,
    ).toHaveLength(0);
    const progress = await db.lessonProgress.get('hotel');
    expect(
      Object.values(progress?.items[q.exercise.entryId!] ?? {}).some(Boolean),
    ).toBe(false);
  });
  it('rolls back the entire paper batch if a shared learning write fails', async () => {
    const db = database();
    const sheet = await createWorksheet(db, options, now);
    const hook = () => {
      throw new Error('Simulated review write failure');
    };
    db.reviews.hook('creating', hook);
    await expect(
      submitPaperResults(db, sheet.id, 0, allCorrect(sheet), now),
    ).rejects.toThrow('Simulated');
    db.reviews.hook('creating').unsubscribe(hook);
    expect(await db.attempts.count()).toBe(0);
    expect((await db.worksheets.get(sheet.id))?.completedAt).toBeUndefined();
  });
  it('starts digital correction review with five intervening questions before exposed concepts', async () => {
    const db = database();
    const sheet = await createWorksheet(
      db,
      { ...options, source: 'selection', entryIds: ['hotel-1'] },
      now,
    );
    const results = Object.fromEntries(
      sheet.questions.map((q) => [q.id, { grade: 'wrong' as const }]),
    );
    await submitPaperResults(db, sheet.id, 0, results, now);
    const targets = new Set(sheet.questions.map((q) => q.exercise.conceptId));
    let s = await beginWorksheetReview(db, sheet.id, now + 1);
    for (let i = 0; i < 5; i++) {
      expect(targets.has(s.current!.conceptId)).toBe(false);
      s = (
        await recordAnswer(db, s, sessionExercise(s).answer, 200, now + 2 + i)
      ).session;
    }
    expect(targets.has(s.current!.conceptId)).toBe(true);
  });
});

describe('separate question and answer-key views', () => {
  it('renders questions and handwriting space without answer data; key opens only after durable exposure', async () => {
    await uiDb.open();
    const sheet = await createWorksheet(
      uiDb,
      { ...options, kind: 'recall', direction: 'cs-en' },
      now,
    );
    render(
      <MemoryRouter initialEntries={[`/worksheets/${sheet.id}`]}>
        <Routes>
          <Route path="/worksheets/:id/:view?" element={<WorksheetPage />} />
        </Routes>
      </MemoryRouter>,
    );
    const article = await screen.findByRole('article', {
      name: 'Printable worksheet',
    });
    expect(
      within(article).getAllByLabelText('Space for handwriting'),
    ).toHaveLength(10);
    expect(article).not.toHaveTextContent(sheet.questions[0].exercise.answer);
    expect(
      within(article).queryByText(/Reference answer/),
    ).not.toBeInTheDocument();
    cleanup();
    render(
      <MemoryRouter initialEntries={[`/worksheets/${sheet.id}/key`]}>
        <Routes>
          <Route path="/worksheets/:id/:view?" element={<WorksheetPage />} />
        </Routes>
      </MemoryRouter>,
    );
    const key = await screen.findByRole('article', { name: 'Answer key' });
    expect(key).toHaveTextContent(sheet.questions[0].exercise.answer);
    expect((await uiDb.worksheets.get(sheet.id))?.keyViewedAt).toBeDefined();
  });
  it('does not display the key when its exposure marker cannot be saved', async () => {
    await uiDb.open();
    const sheet = await createWorksheet(
      uiDb,
      { ...options, kind: 'recall', direction: 'cs-en' },
      now,
    );
    const hook = () => {
      throw new Error('Exposure write failed');
    };
    uiDb.worksheets.hook('updating', hook);
    render(
      <MemoryRouter initialEntries={[`/worksheets/${sheet.id}/key`]}>
        <Routes>
          <Route path="/worksheets/:id/:view?" element={<WorksheetPage />} />
        </Routes>
      </MemoryRouter>,
    );
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Exposure write failed',
    );
    expect(
      screen.queryByRole('article', { name: 'Answer key' }),
    ).not.toBeInTheDocument();
    uiDb.worksheets.hook('updating').unsubscribe(hook);
  });
});
