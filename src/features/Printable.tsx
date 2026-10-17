import { useEffect, useRef, useState } from 'react';
import {
  Link,
  useNavigate,
  useParams,
  useSearchParams,
} from 'react-router-dom';
import { loadStudyLibrary } from '../application/study';
import {
  beginWorksheetReview,
  createWorksheet,
  deleteWorksheet,
  savePaperDraft,
  submitPaperResults,
  viewAnswerKey,
} from '../application/worksheets';
import { db } from '../data/database';
import { questionLabel, worksheetSummary } from '../domain/worksheets';
import type {
  PaperGrade,
  PaperResult,
  Worksheet,
  WorksheetKind,
  WorksheetOptions,
  WorksheetSource,
} from '../domain/worksheet-models';
import type { RecallDirection, StudyLesson } from '../domain/study-models';

const message = (error: unknown) =>
  error instanceof Error
    ? error.message
    : 'Could not save this worksheet. Please try again.';
const date = (at: number) => new Date(at).toLocaleDateString();
const kinds: [WorksheetKind, string][] = [
  ['mixed', 'Mixed lesson test'],
  ['recall', 'Vocabulary recall'],
  ['gap', 'Fill in the word'],
  ['phrase', 'Phrase / collocation recall'],
  ['translation', 'Sentence translation'],
  ['repair', 'Sentence repair'],
];

export function PrintablePractice() {
  const [params] = useSearchParams();
  const [lessons, setLessons] = useState<StudyLesson[]>([]),
    [history, setHistory] = useState<Worksheet[]>([]);
  const [source, setSource] = useState<WorksheetSource>(
    params.get('source') === 'mistakes' ? 'mistakes' : 'lesson',
  );
  const [lessonId, setLessonId] = useState(params.get('lesson') ?? 'hotel');
  const [entryIds, setEntryIds] = useState<string[]>([]);
  const [kind, setKind] = useState<WorksheetKind>('mixed'),
    [direction, setDirection] = useState<RecallDirection>('mixed');
  const [count, setCount] = useState<10 | 20 | 40>(20),
    [includeNameDate, setIncludeNameDate] = useState(true);
  const [busy, setBusy] = useState(false),
    [error, setError] = useState(''),
    [deleting, setDeleting] = useState<string>();
  const navigate = useNavigate();
  useEffect(() => {
    let alive = true;
    Promise.all([
      loadStudyLibrary(db),
      db.worksheets.orderBy('createdAt').reverse().toArray(),
    ])
      .then(([library, sheets]) => {
        if (alive) {
          setLessons(library.lessons);
          setHistory(sheets);
        }
      })
      .catch((e) => {
        if (alive) setError(message(e));
      });
    return () => {
      alive = false;
    };
  }, []);
  async function generate(event: React.FormEvent) {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setError('');
    try {
      const sheet = await createWorksheet(db, {
        source,
        lessonId,
        entryIds,
        kind,
        direction,
        count,
        includeNameDate,
      });
      navigate(`/worksheets/${sheet.id}`);
    } catch (e) {
      setError(message(e));
      setBusy(false);
    }
  }
  async function remove() {
    if (!deleting || busy) return;
    setBusy(true);
    setError('');
    try {
      await deleteWorksheet(db, deleting, true);
      setHistory((s) => s.filter((w) => w.id !== deleting));
      setDeleting(undefined);
    } catch (e) {
      setError(message(e));
    } finally {
      setBusy(false);
    }
  }
  const selected = lessons.find((l) => l.id === lessonId);
  const lessonSource = source === 'lesson' || source === 'selection';
  return (
    <>
      <p className="eyebrow">RETRIEVAL, WITH ROOM TO WRITE</p>
      <h1>Printable practice.</h1>
      <p className="lede">
        Write by hand, then bring the results back into your learning notebook.
      </p>
      <form className="card paper-options" onSubmit={generate}>
        <h2>Create a worksheet</h2>
        <div className="form-grid">
          <div>
            <label htmlFor="paper-source">Source</label>
            <select
              id="paper-source"
              value={source}
              onChange={(e) => setSource(e.target.value as WorksheetSource)}
            >
              <option value="lesson">Selected lesson</option>
              <option value="selection">Selected words from a lesson</option>
              <option value="due">Due reviews</option>
              <option value="mistakes">Recent mistakes</option>
              <option value="weak">Weak items</option>
            </select>
          </div>
          {lessonSource && (
            <div>
              <label htmlFor="paper-lesson">Lesson</label>
              <select
                id="paper-lesson"
                value={lessonId}
                onChange={(e) => {
                  setLessonId(e.target.value);
                  setEntryIds([]);
                }}
              >
                {lessons.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.title}
                  </option>
                ))}
              </select>
            </div>
          )}
          <div>
            <label htmlFor="paper-type">Worksheet type</label>
            <select
              id="paper-type"
              value={kind}
              onChange={(e) => setKind(e.target.value as WorksheetKind)}
            >
              {kinds.map(([id, label]) => (
                <option key={id} value={id}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="paper-length">Length</label>
            <select
              id="paper-length"
              value={count}
              onChange={(e) =>
                setCount(Number(e.target.value) as WorksheetOptions['count'])
              }
            >
              <option value={10}>Short · 10 questions</option>
              <option value={20}>Medium · 20 questions</option>
              <option value={40}>Long · up to 40 questions</option>
            </select>
          </div>
          <div>
            <label htmlFor="paper-direction">Recall direction</label>
            <select
              id="paper-direction"
              value={direction}
              onChange={(e) => setDirection(e.target.value as RecallDirection)}
            >
              <option value="mixed">Mixed direction</option>
              <option value="en-cs">English → Czech</option>
              <option value="cs-en">Czech → English</option>
            </select>
          </div>
        </div>
        {!lessonSource && (
          <p className="fine">
            Selects your existing learning data across vocabulary and grammar.
            Empty sources do not create artificial practice history.
          </p>
        )}
        {source === 'selection' && selected && (
          <fieldset>
            <legend>Vocabulary set for this worksheet</legend>
            <button
              type="button"
              className="secondary"
              onClick={() => setEntryIds(selected.words.map((w) => w.id))}
            >
              Select all words
            </button>
            {selected.words.map((w) => (
              <label className="check-label" key={w.id}>
                <input
                  type="checkbox"
                  checked={entryIds.includes(w.id)}
                  onChange={(e) =>
                    setEntryIds((ids) =>
                      e.target.checked
                        ? [...ids, w.id]
                        : ids.filter((id) => id !== w.id),
                    )
                  }
                />
                {w.english} · {w.czech}
              </label>
            ))}
          </fieldset>
        )}
        <label className="check-label">
          <input
            type="checkbox"
            checked={includeNameDate}
            onChange={(e) => setIncludeNameDate(e.target.checked)}
          />
          Include optional name and date fields
        </label>
        <p className="fine">
          A4 browser print / Save as PDF. Answers are kept in a separate view.
          If fewer unique questions are available, the worksheet will be
          shorter.
        </p>
        <button disabled={busy || !lessons.length}>
          {busy ? 'Saving worksheet…' : 'Generate worksheet'}
        </button>
      </form>
      {error && <p role="alert">{error}</p>}
      <section aria-label="Worksheet history">
        <h2>Worksheet history</h2>
        {history.length === 0 && (
          <p>
            No worksheets yet. Generated sheets and submitted results stay in
            this browser.
          </p>
        )}
        <ul className="paper-history">
          {history.map((sheet) => {
            const summary = worksheetSummary(sheet);
            return (
              <li className="card" key={sheet.id}>
                <h3>{sheet.title}</h3>
                <p>
                  {date(sheet.createdAt)} · {sheet.questions.length} questions ·{' '}
                  {sheet.completedAt ? 'Completed' : 'Not completed'}
                </p>
                <p className="fine">{sheet.id}</p>
                {sheet.completedAt && (
                  <p>
                    {summary.correct} correct · {summary.minor} minor problems ·{' '}
                    {summary.wrong} wrong
                    {sheet.submittedAssisted ? ' · assisted' : ''}
                  </p>
                )}
                <div className="word-actions">
                  <Link to={`/worksheets/${sheet.id}`}>Open</Link>
                  <Link to={`/worksheets/${sheet.id}/results`}>
                    {sheet.completedAt ? 'View results' : 'Enter results'}
                  </Link>
                  <button
                    className="secondary"
                    disabled={busy}
                    onClick={() => setDeleting(sheet.id)}
                  >
                    Delete worksheet
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      </section>
      {deleting && (
        <section
          role="alertdialog"
          aria-label="Delete worksheet"
          className="card"
        >
          <h2>Delete this worksheet?</h2>
          <p>
            The saved sheet and its result display will be removed. Recorded
            learning attempts, mistakes and review dates remain.
          </p>
          <div className="word-actions">
            <button disabled={busy} onClick={remove}>
              Confirm deletion
            </button>
            <button
              className="secondary"
              disabled={busy}
              onClick={() => setDeleting(undefined)}
            >
              Keep worksheet
            </button>
          </div>
        </section>
      )}
    </>
  );
}

export function WorksheetPage() {
  const { id, view } = useParams();
  const [sheet, setSheet] = useState<Worksheet>(),
    [error, setError] = useState('');
  const [loadedView, setLoadedView] = useState('');
  useEffect(() => {
    let alive = true;
    const load =
      view === 'key'
        ? viewAnswerKey(db, id ?? '')
        : db.worksheets.get(id ?? '');
    load
      .then((value) => {
        if (alive) {
          if (value) {
            setSheet(value);
            setLoadedView(`${id}:${view ?? 'sheet'}`);
            setError('');
          } else setError('Worksheet not found.');
        }
      })
      .catch((e) => {
        if (alive) setError(message(e));
      });
    return () => {
      alive = false;
    };
  }, [id, view]);
  if (error)
    return (
      <p role="alert">
        {error} <Link to="/printable">Worksheet history</Link>
      </p>
    );
  if (
    !sheet ||
    loadedView !== `${id}:${view ?? 'sheet'}` ||
    sheet.id !== id ||
    (view === 'key' && sheet.keyViewedAt === undefined)
  )
    return <p role="status">Opening saved worksheet…</p>;
  if (view && !['key', 'results'].includes(view))
    return (
      <p role="alert">
        Worksheet view not found.{' '}
        <Link to={`/worksheets/${id}`}>Open worksheet</Link>
      </p>
    );
  const key = view === 'key';
  return (
    <>
      <div className="no-print paper-navigation">
        <Link to="/printable">← Printable practice & history</Link>
        {sheet.lessonId && (
          <Link to={`/vocabulary/lessons/${sheet.lessonId}?mode=print`}>
            Back to lesson
          </Link>
        )}
        <nav aria-label="Worksheet views">
          <Link
            to={`/worksheets/${id}`}
            aria-current={!view ? 'page' : undefined}
          >
            Worksheet
          </Link>
          <Link
            to={`/worksheets/${id}/key`}
            aria-current={key ? 'page' : undefined}
          >
            Answer key
          </Link>
          <Link
            to={`/worksheets/${id}/results`}
            aria-current={view === 'results' ? 'page' : undefined}
          >
            Enter results
          </Link>
        </nav>
      </div>
      {view === 'results' ? (
        <PaperResults
          key={`${sheet.id}:${sheet.keyViewedAt ?? 0}`}
          initial={sheet}
          onUpdate={setSheet}
        />
      ) : (
        <>
          <div className="no-print paper-toolbar">
            <button onClick={() => window.print()}>
              {key
                ? 'Print answer key / Save as PDF'
                : 'Print worksheet / Save as PDF'}
            </button>
            <p className="fine">
              Use A4 paper. Your browser may offer its own headers and footers;
              turn those off for a clean page.
            </p>
            {sheet.questions.length < sheet.requestedCount && (
              <p>
                Generated {sheet.questions.length} unique questions from the{' '}
                {sheet.requestedCount} requested.
              </p>
            )}
            {key && (
              <p role="status">
                Answer key viewed. Unsubmitted results are now assisted and
                cannot establish mastery. Other natural translations may also be
                valid.
              </p>
            )}
          </div>
          <article
            className={`print-sheet ${key ? 'answer-key' : ''}`}
            aria-label={key ? 'Answer key' : 'Printable worksheet'}
          >
            <div className="sheet-heading">
              <p className="eyebrow">
                REFLEX ENGLISH ·{' '}
                {key ? 'SEPARATE ANSWER KEY' : 'PAPER PRACTICE'}
              </p>
              <h1>{sheet.title}</h1>
              <p className="sheet-id">Worksheet ID: {sheet.id}</p>
              <p>
                Created: {date(sheet.createdAt)} · {sheet.questions.length}{' '}
                questions
              </p>
              {!key && sheet.includeNameDate && (
                <p className="name-date">
                  Name: ____________________________{' '}
                  <span>Date: __________________</span>
                </p>
              )}
            </div>
            {!key && (
              <p className="sheet-instructions">
                Write your answers in the space below each question. Keep the
                answer key separate until you have finished.
              </p>
            )}
            <ol className="worksheet-questions">
              {sheet.questions.map((q, index) => (
                <li
                  className="worksheet-question"
                  key={q.id}
                  data-question-id={q.id}
                >
                  <div className="question-number">{index + 1}.</div>
                  <div className="question-body">
                    <p className="question-type">
                      {questionLabel(q.kind)}
                      {!sheet.lessonId && q.lessonTitle
                        ? ` · ${q.lessonTitle}`
                        : ''}
                    </p>
                    {key ? (
                      <>
                        <p className="key-answer">{q.exercise.answer}</p>
                        {(q.exercise.acceptedAnswers ?? []).filter(
                          (a) => a !== q.exercise.answer,
                        ).length > 0 && (
                          <p>
                            Also accepted:{' '}
                            {[...new Set(q.exercise.acceptedAnswers)]
                              .filter((a) => a !== q.exercise.answer)
                              .join('; ')}
                          </p>
                        )}
                        {q.openEnded && (
                          <p className="key-reference">
                            Reference answer — other natural answers may also be
                            valid.
                          </p>
                        )}
                        <p className="key-explanation">
                          {q.exercise.explanation}
                        </p>
                      </>
                    ) : (
                      <>
                        <p className="question-instruction">
                          {q.exercise.instruction ??
                            'Write the missing answer.'}
                        </p>
                        <p className="question-prompt">{q.exercise.prompt}</p>
                        <div
                          className={`handwriting-space ${q.kind === 'translation' || q.kind === 'repair' ? 'sentence-space' : ''}`}
                          aria-label="Space for handwriting"
                        >
                          <div />
                          <div />
                          {(q.kind === 'translation' ||
                            q.kind === 'repair') && <div />}
                        </div>
                      </>
                    )}
                  </div>
                </li>
              ))}
            </ol>
          </article>
        </>
      )}
    </>
  );
}
function PaperResults({
  initial,
  onUpdate,
}: {
  initial: Worksheet;
  onUpdate: (sheet: Worksheet) => void;
}) {
  const [sheet, setSheet] = useState(initial),
    [results, setResults] = useState<Record<string, PaperResult>>(
      initial.results,
    );
  const [busy, setBusy] = useState(false),
    [error, setError] = useState(''),
    [notice, setNotice] = useState('');
  const working = useRef(false);
  const navigate = useNavigate();
  function update(value: Worksheet) {
    setSheet(value);
    setResults(value.results);
    onUpdate(value);
  }
  async function save(next = results) {
    if (working.current) return;
    working.current = true;
    setBusy(true);
    setError('');
    try {
      update(await savePaperDraft(db, sheet.id, sheet.revision, next));
      setNotice('Draft saved.');
    } catch (e) {
      setError(message(e));
    } finally {
      working.current = false;
      setBusy(false);
    }
  }
  async function grade(id: string, value: PaperGrade) {
    await save({ ...results, [id]: { ...results[id], grade: value } });
  }
  async function submit() {
    if (working.current) return;
    working.current = true;
    setBusy(true);
    setError('');
    try {
      update(await submitPaperResults(db, sheet.id, sheet.revision, results));
      setNotice('Paper results saved to your learning history.');
    } catch (e) {
      setError(message(e));
    } finally {
      working.current = false;
      setBusy(false);
    }
  }
  async function review() {
    if (working.current) return;
    working.current = true;
    setBusy(true);
    try {
      const s = await beginWorksheetReview(db, sheet.id);
      navigate(`/review/${s.id}`);
    } catch (e) {
      setError(message(e));
      working.current = false;
      setBusy(false);
    }
  }
  const summary = worksheetSummary({ ...sheet, results });
  const graded = Object.keys(results).length;
  return (
    <section className="paper-results">
      <p className="eyebrow">PAPER PRACTICE · RESULT ENTRY</p>
      <h1>{sheet.title}</h1>
      <p className="fine">Worksheet ID: {sheet.id}</p>
      <p>
        {sheet.completedAt
          ? `Completed ${date(sheet.completedAt)}.`
          : `${graded}/${sheet.questions.length} questions graded.`}{' '}
        {summary.correct} correct · {summary.minor} minor problems ·{' '}
        {summary.wrong} wrong
      </p>
      {sheet.keyViewedAt !== undefined && (
        <p className="card">
          {sheet.completedAt
            ? sheet.submittedAssisted
              ? 'The answer key was viewed before submission. Correct responses were recorded as assisted; unassisted retrieval is still needed.'
              : 'The answer key was viewed after these results were submitted. Earlier learning evidence is unchanged.'
            : 'The answer key has been viewed. These results will be assisted and cannot increase mastery or pass lesson skills.'}
        </p>
      )}
      {!sheet.completedAt && (
        <>
          <p>
            Mark each item. You do not need to type correct answers. For minor
            problems or wrong answers, you can optionally record what you wrote.
          </p>
          <p className="fine">
            Grades save as you choose them. Use Save draft to keep typed notes.
            Submit once you have graded every question.
          </p>
          <button
            className="secondary"
            disabled={busy}
            onClick={() =>
              save(
                Object.fromEntries(
                  sheet.questions.map((q) => [
                    q.id,
                    results[q.id] ?? { grade: 'correct' },
                  ]),
                ),
              )
            }
          >
            Mark remaining correct
          </button>
        </>
      )}
      <ol className="paper-grade-list">
        {sheet.questions.map((q, index) => (
          <li className="card" key={q.id} aria-label={`Question ${index + 1}`}>
            <h2>
              {index + 1}. {questionLabel(q.kind)}
            </h2>
            <p className="question-prompt">{q.exercise.prompt}</p>
            <p className="fine">{q.exercise.instruction}</p>
            {sheet.completedAt ? (
              <>
                <strong>
                  Result:{' '}
                  {results[q.id]?.grade === 'minor'
                    ? 'Minor problem'
                    : results[q.id]?.grade === 'correct'
                      ? 'Correct'
                      : 'Wrong'}
                </strong>
                {results[q.id]?.writtenAnswer && (
                  <p>You wrote: {results[q.id].writtenAnswer}</p>
                )}
              </>
            ) : (
              <>
                <div
                  className="grade-actions"
                  role="group"
                  aria-label={`Grade question ${index + 1}`}
                >
                  {(['correct', 'minor', 'wrong'] as const).map((value) => (
                    <button
                      key={value}
                      aria-pressed={results[q.id]?.grade === value}
                      className={
                        results[q.id]?.grade === value ? '' : 'secondary'
                      }
                      disabled={busy}
                      onClick={() => grade(q.id, value)}
                    >
                      {value === 'correct'
                        ? '✓ Correct'
                        : value === 'minor'
                          ? '~ Minor problem'
                          : '✗ Wrong'}
                    </button>
                  ))}
                </div>
                {results[q.id] && results[q.id].grade !== 'correct' && (
                  <div className="written-answer">
                    <label htmlFor={`written-${q.id}`}>
                      What you wrote (optional)
                    </label>
                    <textarea
                      id={`written-${q.id}`}
                      value={results[q.id].writtenAnswer ?? ''}
                      onChange={(e) =>
                        setResults((r) => ({
                          ...r,
                          [q.id]: { ...r[q.id], writtenAnswer: e.target.value },
                        }))
                      }
                    />
                  </div>
                )}
              </>
            )}
          </li>
        ))}
      </ol>
      {!sheet.completedAt ? (
        <div className="word-actions">
          <button className="secondary" disabled={busy} onClick={() => save()}>
            Save draft
          </button>
          <button
            disabled={busy || graded !== sheet.questions.length}
            onClick={submit}
          >
            {busy ? 'Saving…' : 'Submit paper results'}
          </button>
        </div>
      ) : (
        <div className="card">
          <h2>Paper practice completed</h2>
          <p>
            Your attempts, mistakes and review dates have been updated in the
            same learning system as digital practice. Paper is optional for
            passing a lesson.
          </p>
          {(summary.wrong + summary.minor > 0 || sheet.submittedAssisted) && (
            <button disabled={busy} onClick={review}>
              Review corrections digitally
            </button>
          )}
        </div>
      )}
      <p role="status">{notice}</p>
      {error && <p role="alert">{error}</p>}
    </section>
  );
}
