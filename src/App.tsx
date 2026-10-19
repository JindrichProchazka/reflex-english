import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { Link, Route, Routes, useNavigate, useParams } from 'react-router-dom';
import {
  loadDashboard,
  loadReviewSession,
  recordAnswer,
  prepareAssessment,
  revealReference,
  sessionContent,
  sessionExercise,
} from './application/learning';
import { drillById, drillForConcept } from './content/drills';
import { APP_NAME } from './config';
import { db } from './data/database';
import type { Session } from './domain/models';
import { answerChoices, responseInstruction } from './domain/answer-input';
import { sessionSummary } from './domain/session-summary';
import { SessionSummary } from './features/SessionSummary';
import { stageLabel } from './domain/vocabulary';
import { dataOrigin, restoreChannel } from './application/data-events';
import { WeakAreasCard } from './features/WeakAreasCard';
import { PwaNotice, usePwaState } from './features/Pwa';
import { useInputViewport } from './features/useInputViewport';
import { keepFocusedInputVisible } from './application/viewport';
const VocabularyEditor = lazy(() =>
  import('./features/Vocabulary').then((m) => ({
    default: m.VocabularyEditor,
  })),
);
const VocabularyLibrary = lazy(() =>
  import('./features/Vocabulary').then((m) => ({
    default: m.VocabularyLibrary,
  })),
);
const VocabularyLesson = lazy(() =>
  import('./features/Vocabulary').then((m) => ({
    default: m.VocabularyLesson,
  })),
);
const PrintablePractice = lazy(() =>
  import('./features/Printable').then((m) => ({
    default: m.PrintablePractice,
  })),
);
const WorksheetPage = lazy(() =>
  import('./features/Printable').then((m) => ({ default: m.WorksheetPage })),
);
const BackupPage = lazy(() =>
  import('./features/Backup').then((m) => ({ default: m.BackupPage })),
);
const WeakAreasPage = lazy(() =>
  import('./features/WeakAreas').then((m) => ({ default: m.WeakAreasPage })),
);
const DrillsPage = lazy(() =>
  import('./features/Drills').then((m) => ({ default: m.DrillsPage })),
);

const date = (timestamp: number) =>
  new Date(timestamp).toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
type Dashboard = Awaited<ReturnType<typeof loadDashboard>>;
function useDashboard() {
  const [data, setData] = useState<Dashboard>();
  const [error, setError] = useState('');
  useEffect(() => {
    let alive = true;
    loadDashboard(db)
      .then((d) => {
        if (alive) setData(d);
      })
      .catch(() => {
        if (alive)
          setError(
            'Local storage could not be opened. Allow browser storage and reload.',
          );
      });
    return () => {
      alive = false;
    };
  }, []);
  return { data, error };
}
function Home() {
  const { data, error } = useDashboard();
  if (error) return <p role="alert">{error}</p>;
  if (!data) return <p role="status">Opening your practice notebook…</p>;
  const clean = data.attempts.filter((a) => a.assistance === 'none');
  return (
    <>
      <section className="intro">
        <p className="eyebrow">A LITTLE PRACTICE, WELL REMEMBERED</p>
        <h1>
          Make room for
          <br />
          better English.
        </h1>
        <p className="lede">
          Recall it. Refine it. Come back to it.
          <br />
          Build confidence one useful pattern at a time.
        </p>
      </section>
      <div className="stats" aria-label="Learning progress">
        <Stat label="Reviews due" value={data.due} />
        <Stat label="Attempts saved" value={data.attempts.length} />
        <Stat label="Sessions completed" value={data.completed} />
      </div>
      <section className="card feature">
        <p className="eyebrow">YOUR VOCABULARY LESSONS</p>
        <h2>Learn words for situations you face.</h2>
        <p>
          Hotel reception, university, travel, production and everyday problems.
        </p>
        <div className="word-actions">
          <Link className="button" to="/vocabulary">
            Choose a vocabulary lesson
          </Link>
          <Link to="/vocabulary/new">Add a personal word</Link>
        </div>
        <p className="fine">
          Learn → Vocabulary Test → Use in Context → spaced review.
        </p>
      </section>
      <section className="card feature">
        <div>
          <p className="eyebrow">SHORT GRAMMAR & COLLOCATION PRACTICE</p>
          <h2>Quick Reflex Drills</h2>
          <p>Build automatic recall of useful grammar and everyday patterns.</p>
          <p className="muted">
            Choose an area, then Quick, Normal or Due Review. Mistakes add
            retrieval practice, never penalties.
          </p>
        </div>
        <Link className="button" to="/drills">
          Open Quick Reflex Drills <span aria-hidden="true">→</span>
        </Link>
        {data.active && (
          <p>
            <Link to={`/review/${data.active.id}`}>
              Continue previous IN / ON / AT review
            </Link>
          </p>
        )}
        <p className="fine">
          You can leave at any time. Your place is saved after every answer.
        </p>
      </section>
      <WeakAreasCard />
      <section className="two-col">
        <div className="card">
          <h2>Practice that stays with you</h2>
          <p>
            New patterns start in short focused pairs. Later encounters mix
            similar contexts, so you learn the distinction.
          </p>
          <p>
            Type the missing word or verb form. If you miss it, a hint comes
            first. You’ll meet the concept again in another sentence.
          </p>
          <details>
            <summary>Before you start: a short guide</summary>
            <p>
              <strong>AT</strong> marks a point: at 7:30, at the bus stop, at
              work.
            </p>
            <p>
              <strong>IN</strong> marks a period or an enclosed area: in
              September, in Prague, in a car.
            </p>
            <p>
              <strong>ON</strong> marks days, surfaces and public transport: on
              Monday, on the table, on a bus.
            </p>
            <p>
              Compare in the morning with on Monday morning; in the classroom
              with at school. Meaning and context matter.
            </p>
          </details>
        </div>
        <div className="card">
          <h2>Your learning notebook</h2>
          <p>
            <strong>
              {
                data.reviews.filter(
                  (r) => r.status === 'learning' || r.status === 'reviewing',
                ).length
              }
            </strong>{' '}
            concepts learning ·{' '}
            <strong>
              {data.reviews.filter((r) => r.status === 'mastered').length}
            </strong>{' '}
            mastered
          </p>
          <p>
            First-attempt accuracy:{' '}
            {clean.length
              ? `${Math.round((clean.filter((a) => a.correct).length / clean.length) * 100)}%`
              : 'not enough practice yet'}
          </p>
          <p className="fine">
            Mastery grows over days, not repeated answers in a minute.
          </p>
        </div>
      </section>
      {data.mistakes.length > 0 && (
        <section className="card">
          <p className="eyebrow">AREAS TO REVISIT</p>
          <h2>Keep the useful mistakes</h2>
          <ul className="mistakes">
            {data.mistakes.slice(0, 3).map((m) => (
              <li key={m.conceptId}>
                <strong>
                  {drillForConcept(m.conceptId)?.concepts.find(
                    (c) => c.id === m.conceptId,
                  )?.title ?? 'Vocabulary to revisit'}
                </strong>
                <p>
                  {m.prompt}{' '}
                  <span className="muted">
                    {m.answerRecorded === false
                      ? 'Paper answer not transcribed'
                      : `You wrote “${m.answer}”`}{' '}
                    · {m.occurrences} incorrect attempts
                  </span>
                </p>
                <p>
                  <Link to="/mistakes">
                    View mistake history and corrections
                  </Link>
                </p>
                <small>Next review: {date(m.nextReviewAt)}</small>
                <p>
                  <Link
                    to={
                      m.conceptId.startsWith('lesson:')
                        ? `/vocabulary/lessons/${m.conceptId.split(':')[1]}?mode=${m.conceptId.endsWith(':context') ? 'context' : 'recall'}`
                        : m.conceptId.startsWith('vocab:')
                          ? '/vocabulary'
                          : '/drills'
                    }
                  >
                    {m.conceptId.startsWith('lesson:')
                      ? 'Review this lesson'
                      : m.conceptId.startsWith('vocab:')
                        ? 'Review personal words'
                        : 'Return to review'}
                  </Link>
                </p>
              </li>
            ))}
          </ul>
        </section>
      )}
      <p>
        <Link to="/printable">Printable practice & worksheet history</Link> ·{' '}
        <Link to="/printable?source=mistakes">
          Practice my recent mistakes on paper
        </Link>
      </p>
    </>
  );
}
function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <strong>{value}</strong>
      <span>{label}</span>
    </div>
  );
}
function Review() {
  const { id } = useParams();
  const [session, setSession] = useState<Session>();
  const [answer, setAnswer] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');
  const [choice, setChoice] = useState<{ exerciseId: string; value: string }>();
  const input = useRef<HTMLTextAreaElement>(null);
  const buttons = useRef<HTMLDivElement>(null);
  const began = useRef(0);
  const submitting = useRef(false);
  useEffect(() => {
    let alive = true;
    loadReviewSession(db, id ?? '')
      .then((s) => {
        if (alive) {
          if (s) setSession(s);
          else
            setError(
              'This session was not found. Return home to start practice.',
            );
        }
      })
      .catch(() => {
        if (alive) setError('Could not load your session. Reload to retry.');
      });
    return () => {
      alive = false;
    };
  }, [id]);
  useEffect(() => {
    began.current = performance.now();
  }, [session]);
  useEffect(() => {
    if (busy) return;
    input.current?.focus({ preventScroll: true });
    buttons.current?.querySelector('button')?.focus({ preventScroll: true });
    const frame = requestAnimationFrame(keepFocusedInputVisible);
    return () => cancelAnimationFrame(frame);
  }, [session, busy]);
  async function handleSubmitAnswer(
    value: string,
    durationMs: number,
    tapped = false,
  ) {
    if (!session || !value.trim() || submitting.current) return;
    submitting.current = true;
    if (tapped) setChoice({ exerciseId: session.exerciseId, value });
    setBusy(true);
    setError('');
    try {
      const exercise = sessionExercise(session);
      if (exercise.evaluation === 'self' && session.wrongCount < 2) {
        setSession(await prepareAssessment(db, session, value, durationMs));
        setAnswer('');
        return;
      }
      const result = await recordAnswer(db, session, value, durationMs);
      setSession(result.session);
      setAnswer('');
      setNotice(
        result.correct
          ? session.wrongCount
            ? 'Correct. You’ll recall this again after other questions.'
            : 'Correct. Keep going.'
          : '',
      );
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : 'Could not save your answer. Try again.',
      );
    } finally {
      // Keep the new prompt disabled through a rapid second tap/double-click.
      if (tapped) await new Promise((resolve) => setTimeout(resolve, 350));
      submitting.current = false;
      setBusy(false);
      input.current?.focus({ preventScroll: true });
    }
  }
  async function assess(grade: 'correct' | 'minor' | 'wrong') {
    if (!session?.assessment || submitting.current) return;
    submitting.current = true;
    setBusy(true);
    setError('');
    try {
      const result = await recordAnswer(
        db,
        session,
        session.assessment.answer,
        session.assessment.durationMs,
        Date.now(),
        grade,
      );
      setSession(result.session);
      setAnswer('');
      setNotice(
        result.correct ? 'Assessment saved. Keep recalling and using it.' : '',
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not save assessment.');
    } finally {
      submitting.current = false;
      setBusy(false);
    }
  }
  async function showReference() {
    if (!session || submitting.current) return;
    submitting.current = true;
    setBusy(true);
    try {
      setSession(await revealReference(db, session));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not reveal reference.');
    } finally {
      submitting.current = false;
      setBusy(false);
    }
  }
  if (!session)
    return (
      <p role={error ? 'alert' : 'status'}>
        {error || 'Loading your session…'}
      </p>
    );
  if (session.completedAt) return <Summary session={session} />;
  const exercise = sessionExercise(session);
  const options = answerChoices(
    drillForConcept(exercise.conceptId)?.id,
    exercise,
  );
  const initial = session.current?.kind === 'initial';
  const concept = sessionContent(session).find(
    (c) => c.id === exercise.conceptId,
  )!;
  const vocabulary =
    session.module === 'vocabulary' &&
    (!session.weakAreaIds || Boolean(exercise.entryId));
  const drill = drillById(session.drillId ?? '');
  const preposition =
    !exercise.entryId &&
    (drillForConcept(exercise.conceptId)?.category ?? 'preposition') ===
      'preposition';
  return (
    <section className="practice">
      <div className="practice-meta">
        <Link
          to={
            session.weakAreaIds
              ? '/mistakes'
              : session.worksheetId
                ? `/worksheets/${session.worksheetId}/results`
                : vocabulary
                  ? '/vocabulary'
                  : drill
                    ? '/drills'
                    : '/'
          }
        >
          ← Save & return{' '}
          {session.weakAreaIds
            ? 'to weak areas'
            : session.worksheetId
              ? 'to paper results'
              : vocabulary
                ? 'to vocabulary'
                : drill
                  ? 'to drills'
                  : 'home'}
        </Link>
        <span>{session.processed} prompts completed</span>
      </div>
      <p className="eyebrow">
        {session.weakAreaIds
          ? 'WEAK AREAS'
          : vocabulary
            ? 'VOCABULARY'
            : (drill?.title ??
              drillForConcept(exercise.conceptId)?.title ??
              'IN / ON / AT')}{' '}
        ·{' '}
        {initial && session.acquisition
          ? 'FOCUSED PRACTICE'
          : session.current?.kind === 'final'
            ? 'CLOSING RECALL'
            : 'MIXED RECALL'}
      </p>
      <h1 className="practice-title">
        {session.weakAreaIds
          ? 'Focused weak-area practice'
          : session.worksheetId
            ? 'Review paper practice'
            : session.studyMode === 'context'
              ? 'Use in Context'
              : session.studyMode === 'recall'
                ? 'Vocabulary Test'
                : vocabulary
                  ? stageLabel(exercise.stage!)
                  : 'Find the missing word.'}
      </h1>
      <p className="muted">
        {session.feedback === 'correction'
          ? 'Type the reference answer to reproduce it.'
          : options
            ? 'Choose the missing word or phrase.'
            : responseInstruction(exercise)
              ? responseInstruction(exercise)
              : vocabulary
                ? 'Recall the meaning, then make the language useful.'
                : initial
                  ? concept.title
                  : 'Recall the missing form from the meaning of the sentence.'}
      </p>
      <div className="card exercise">
        <p className="prompt" data-testid="prompt">
          {exercise.prompt}
        </p>
        {session.assessment ? (
          <section className="assessment" aria-label="Self-assessment">
            <h2>Assess your response</h2>
            <p className="submitted-answer">{session.assessment.answer}</p>
            <p>{exercise.rubric}</p>
            <p className="fine">
              Open language has many valid answers. Judge meaning and natural
              use; this is your assessment, not an automatic language verdict.
            </p>
            {session.assessment.referenceRevealed ? (
              <div className="reference">
                <strong>Reference (other natural answers are possible)</strong>
                <p>{exercise.answer}</p>
                <p className="fine">
                  Reference revealed: this attempt is assisted and will not
                  establish mastery.
                </p>
              </div>
            ) : (
              <button
                className="secondary"
                disabled={busy}
                onClick={showReference}
              >
                Show reference (assisted)
              </button>
            )}
            <div className="grade-actions">
              <button disabled={busy} onClick={() => assess('correct')}>
                Correct
              </button>
              <button
                className="secondary"
                disabled={busy}
                onClick={() => assess('minor')}
              >
                Minor problem
              </button>
              <button
                className="secondary"
                disabled={busy}
                onClick={() => assess('wrong')}
              >
                Wrong
              </button>
            </div>
          </section>
        ) : options && session.feedback !== 'correction' ? (
          <div
            className="answer-buttons"
            ref={buttons}
            role="group"
            aria-label="Answer choices"
            aria-describedby="feedback"
            aria-busy={busy}
          >
            {options.map((option) => (
              <button
                type="button"
                key={option}
                disabled={busy}
                aria-label={
                  option === '-' ? 'No article' : option.toUpperCase()
                }
                aria-pressed={
                  choice?.exerciseId === exercise.id && choice.value === option
                }
                data-result={
                  choice?.exerciseId === exercise.id &&
                  choice.value === option &&
                  session.feedback === 'hint'
                    ? 'incorrect'
                    : undefined
                }
                onKeyDown={(event) => {
                  if (event.repeat) event.preventDefault();
                }}
                onClick={() =>
                  void handleSubmitAnswer(
                    option,
                    performance.now() - began.current,
                    true,
                  )
                }
              >
                {option === '-' ? '—' : option.toUpperCase()}
              </button>
            ))}
          </div>
        ) : (
          <form
            onSubmit={(event) => {
              event.preventDefault();
              void handleSubmitAnswer(
                answer,
                performance.now() - began.current,
              );
            }}
          >
            <label htmlFor="answer">
              {preposition ? 'Missing preposition' : 'Your answer'}
            </label>
            <div className="answer-row">
              <textarea
                ref={input}
                id="answer"
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                autoComplete="off"
                autoCorrect="off"
                enterKeyHint={vocabulary ? 'enter' : 'done'}
                autoCapitalize="none"
                spellCheck={false}
                required
                disabled={busy}
                aria-describedby="feedback"
                rows={vocabulary ? 3 : 1}
                onKeyDown={(e) => {
                  if (!vocabulary && e.key === 'Enter') {
                    e.preventDefault();
                    e.currentTarget.form?.requestSubmit();
                  }
                }}
              />
              <button disabled={busy || !answer.trim()}>
                {busy
                  ? 'Saving…'
                  : session.feedback === 'correction'
                    ? 'Reproduce answer'
                    : exercise.evaluation === 'self'
                      ? 'Assess response'
                      : 'Check answer'}
              </button>
            </div>
          </form>
        )}
        <div
          id="feedback"
          role="status"
          aria-live="polite"
          className={`feedback ${session.feedback !== 'none' ? 'needs-work' : ''}`}
        >
          {session.feedback === 'hint' && (
            <>
              <strong>Not quite. Try again.</strong>
              <p>{exercise.hint}</p>
            </>
          )}
          {session.feedback === 'correction' && (
            <>
              <strong>The answer is “{exercise.answer}”.</strong>
              <p>{exercise.explanation}</p>
              <p>
                Type the reference answer to reproduce it. Then we’ll return to
                this concept after other questions.
              </p>
            </>
          )}
          {session.feedback === 'none' && notice}
        </div>
        {error && <p role="alert">{error}</p>}
      </div>
      <p className="fine">
        Accuracy before speed. Pauses are fine. Failed concepts return after
        five other prompts and in a closing recall.
      </p>
    </section>
  );
}
function Summary({ session }: { session: Session }) {
  const [summary, setSummary] = useState<ReturnType<typeof sessionSummary>>();
  const [error, setError] = useState('');
  useEffect(() => {
    let alive = true;
    Promise.all([
      loadDashboard(db),
      db.vocabulary.toArray(),
      db.studyLessons.toArray(),
    ])
      .then(([data, words, lessons]) => {
        if (alive)
          setSummary(
            sessionSummary(
              session,
              data.attempts,
              data.reviews,
              sessionContent(session),
              [...words, ...lessons.flatMap((lesson) => lesson.words)],
            ),
          );
      })
      .catch(() => {
        if (alive) setError('Could not load your summary. Reload to retry.');
      });
    return () => {
      alive = false;
    };
  }, [session]);
  if (error) return <p role="alert">{error}</p>;
  if (!summary) return <p role="status">Loading your summary…</p>;
  return <SessionSummary session={session} summary={summary} />;
}
export default function App() {
  useInputViewport();
  const { applying } = usePwaState();
  const navigate = useNavigate();
  const [dataEpoch, setDataEpoch] = useState(0);
  useEffect(() => {
    if (typeof BroadcastChannel === 'undefined') return;
    const channel = new BroadcastChannel(restoreChannel);
    channel.onmessage = (event) => {
      if (event.data?.origin === dataOrigin) return;
      navigate('/data');
      setDataEpoch((n) => n + 1);
    };
    return () => channel.close();
  }, [navigate]);
  return (
    <>
      <header>
        <Link className="brand" to="/">
          <span className="brand-mark" aria-hidden="true">
            r.
          </span>
          {APP_NAME}
        </Link>
        <span className="header-note">A personal practice notebook</span>
        <Link to="/data">Data / Backup</Link>
      </header>
      <PwaNotice />
      <main inert={applying}>
        <Suspense
          fallback={<p role="status">Opening your practice notebook…</p>}
        >
          <Routes key={dataEpoch}>
            <Route path="/mistakes" element={<WeakAreasPage />} />
            <Route path="/data" element={<BackupPage />} />
            <Route path="/drills" element={<DrillsPage />} />
            <Route path="/" element={<Home />} />
            <Route path="/review/:id" element={<Review />} />
            <Route path="/vocabulary" element={<VocabularyLibrary />} />
            <Route path="/printable" element={<PrintablePractice />} />
            <Route path="/worksheets/:id/:view?" element={<WorksheetPage />} />
            <Route
              path="/vocabulary/lessons/:lessonId"
              element={<VocabularyLesson />}
            />
            <Route path="/vocabulary/new" element={<VocabularyEditor />} />
            <Route path="/vocabulary/:id/edit" element={<VocabularyEditor />} />
            <Route
              path="*"
              element={
                <>
                  <h1>Page not found</h1>
                  <Link to="/">Return home</Link>
                </>
              }
            />
          </Routes>
        </Suspense>
      </main>
      <footer>
        Built around recall, with room to make mistakes.{' '}
        <span>Your learning stays in this browser.</span>
      </footer>
    </>
  );
}
