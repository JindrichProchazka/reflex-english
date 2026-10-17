import { useEffect, useState } from 'react';
import {
  Link,
  useNavigate,
  useParams,
  useSearchParams,
} from 'react-router-dom';
import {
  beginLessonSession,
  beginPersonalSession,
  loadStudyLibrary,
  savePersonalWord,
} from '../application/study';
import { db } from '../data/database';
import { lessonProgressSummary } from '../domain/study';
import type { RecallDirection, StudyMode } from '../domain/study-models';

const errorMessage = (error: unknown) =>
  error instanceof Error
    ? error.message
    : 'Could not save your practice. Please try again.';
type Library = Awaited<ReturnType<typeof loadStudyLibrary>>;
function useStudyLibrary() {
  const [data, setData] = useState<Library>();
  const [error, setError] = useState('');
  const [revision, setRevision] = useState(0);
  useEffect(() => {
    let alive = true;
    loadStudyLibrary(db)
      .then((value) => {
        if (alive) setData(value);
      })
      .catch((e) => {
        if (alive) setError(errorMessage(e));
      });
    return () => {
      alive = false;
    };
  }, [revision]);
  return { data, error, reload: () => setRevision((v) => v + 1) };
}
function Direction({
  value,
  onChange,
  id = 'test-direction',
}: {
  value: RecallDirection;
  onChange: (value: RecallDirection) => void;
  id?: string;
}) {
  return (
    <div>
      <label htmlFor={id}>Test direction</label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value as RecallDirection)}
      >
        <option value="en-cs">English → Czech</option>
        <option value="cs-en">Czech → English</option>
        <option value="mixed">Mixed direction</option>
      </select>
    </div>
  );
}
export function VocabularyLibrary() {
  const { data, error, reload } = useStudyLibrary();
  const [english, setEnglish] = useState(''),
    [czech, setCzech] = useState('');
  const [direction, setDirection] = useState<RecallDirection>('mixed');
  const [busy, setBusy] = useState(false),
    [failure, setFailure] = useState(''),
    [notice, setNotice] = useState('');
  const navigate = useNavigate();
  async function add(event: React.FormEvent) {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setFailure('');
    try {
      const word = await savePersonalWord(db, english, czech);
      setEnglish('');
      setCzech('');
      setNotice(`Saved “${word.english}” to your review queue.`);
      reload();
    } catch (e) {
      setFailure(errorMessage(e));
    } finally {
      setBusy(false);
    }
  }
  async function practise(id?: string) {
    if (busy) return;
    setBusy(true);
    setFailure('');
    try {
      const s = await beginPersonalSession(db, id, direction);
      navigate(`/review/${s.id}`);
    } catch (e) {
      setFailure(errorMessage(e));
      setBusy(false);
    }
  }
  if (error) return <p role="alert">{error}</p>;
  if (!data) return <p role="status">Loading your lessons…</p>;
  return (
    <>
      <p className="eyebrow">USEFUL ENGLISH, ONE LESSON AT A TIME</p>
      <h1>Choose a situation.</h1>
      <p className="lede">
        Learn the words. Recall them. Put them into sentences.
      </p>
      <section aria-label="Vocabulary lessons">
        <h2>Vocabulary lessons</h2>
        <div className="lesson-grid">
          {data.lessons.map((lesson) => {
            const progress = lessonProgressSummary(
              lesson,
              data.progress.find((p) => p.lessonId === lesson.id),
            );
            const due = data.reviews.filter(
              (r) =>
                r.conceptId.startsWith(`lesson:${lesson.id}:`) &&
                r.dueAt <= Date.now() &&
                r.status !== 'new',
            ).length;
            return (
              <article
                className="card lesson-card"
                key={lesson.id}
                aria-label={lesson.title}
              >
                <p className="eyebrow">
                  {lesson.level} · {lesson.words.length} words & phrases
                </p>
                <h3>{lesson.title}</h3>
                <p>{lesson.description}</p>
                <p className="fine">{lesson.topic}</p>
                <div className="lesson-progress">
                  <span>
                    Recall{' '}
                    <strong>
                      {progress.recall}/{progress.total}
                    </strong>
                  </span>
                  <span>
                    Context use{' '}
                    <strong>
                      {progress.context}/{progress.total}
                    </strong>
                  </span>
                </div>
                <p className="fine">
                  {progress.passed
                    ? 'Practice passed — keep your spaced reviews going.'
                    : progress.enCs ||
                        progress.csEn ||
                        progress.understanding ||
                        progress.production
                      ? 'Learning in progress'
                      : 'Ready to learn'}
                  {due ? ` · ${due} reviews due` : ''}
                </p>
                <Link
                  className="button"
                  to={`/vocabulary/lessons/${lesson.id}`}
                >
                  Open lesson
                </Link>
              </article>
            );
          })}
        </div>
      </section>
      <section className="card personal-section" aria-label="Personal words">
        <h2>Your own words</h2>
        <p>
          Found a useful word somewhere? English and a Czech meaning are enough.
        </p>
        <form className="quick-add" onSubmit={add}>
          <div>
            <label htmlFor="personal-english">English word or phrase</label>
            <input
              id="personal-english"
              value={english}
              onChange={(e) => setEnglish(e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="personal-czech">Czech meaning</label>
            <input
              id="personal-czech"
              value={czech}
              onChange={(e) => setCzech(e.target.value)}
              required
            />
          </div>
          <button disabled={busy}>Save word</button>
        </form>
        <p role="status">{notice}</p>
        {data.words.length > 0 && (
          <>
            <div className="toolbar">
              <Direction
                value={direction}
                onChange={setDirection}
                id="personal-direction"
              />
              <button disabled={busy} onClick={() => practise()}>
                Test personal words
              </button>
            </div>
            <ul className="personal-list">
              {data.words.map((word) => (
                <li key={word.id}>
                  <div>
                    <strong>{word.english}</strong>
                    <span>{word.meaning}</span>
                    <small>
                      {data.reviews.find(
                        (r) => r.conceptId === `vocab:${word.id}`,
                      )?.status ?? 'new'}
                    </small>
                  </div>
                  <div className="word-actions">
                    <button
                      className="secondary"
                      disabled={busy}
                      onClick={() => practise(word.id)}
                    >
                      Practise
                    </button>
                    <Link
                      to={`/vocabulary/${encodeURIComponent(word.id)}/edit`}
                    >
                      Edit
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          </>
        )}
      </section>
      {data.active.length > 0 && (
        <section className="card">
          <h2>Saved practice</h2>
          <ul className="personal-list">
            {data.active.map((s) => (
              <li key={s.id}>
                <Link to={`/review/${s.id}`}>
                  Continue{' '}
                  {s.lessonId
                    ? data.lessons.find((l) => l.id === s.lessonId)?.title
                    : s.personalWords
                      ? 'personal words'
                      : 'earlier vocabulary practice'}{' '}
                  · {s.studyMode === 'context' ? 'context use' : 'recall'}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
      {failure && <p role="alert">{failure}</p>}
    </>
  );
}
export function VocabularyLesson() {
  const { lessonId } = useParams();
  const { data, error } = useStudyLibrary();
  const [params, setParams] = useSearchParams();
  const selected = params.get('mode');
  const mode =
    selected === 'recall' || selected === 'context' || selected === 'print'
      ? selected
      : 'learn';
  const [direction, setDirection] = useState<RecallDirection>('mixed');
  const [showExamples, setShowExamples] = useState(true);
  const [busy, setBusy] = useState(false),
    [failure, setFailure] = useState('');
  const navigate = useNavigate();
  async function start(studyMode: StudyMode) {
    if (!lessonId || busy) return;
    setBusy(true);
    setFailure('');
    try {
      const s = await beginLessonSession(db, lessonId, studyMode, direction);
      navigate(`/review/${s.id}`);
    } catch (e) {
      setFailure(errorMessage(e));
      setBusy(false);
    }
  }
  if (error) return <p role="alert">{error}</p>;
  if (!data) return <p role="status">Loading lesson…</p>;
  const lesson = data.lessons.find((l) => l.id === lessonId);
  if (!lesson)
    return (
      <p role="alert">
        Lesson not found. <Link to="/vocabulary">Choose a lesson</Link>
      </p>
    );
  const progress = lessonProgressSummary(
    lesson,
    data.progress.find((p) => p.lessonId === lesson.id),
  );
  const active = data.active.find(
    (s) =>
      s.lessonId === lesson.id &&
      s.studyMode === mode &&
      (mode === 'context' || s.testDirection === direction),
  );
  return (
    <>
      <Link to="/vocabulary">← All vocabulary lessons</Link>
      <p className="eyebrow lesson-kicker">
        {lesson.topic} · {lesson.level}
      </p>
      <h1 className="lesson-heading">{lesson.title}</h1>
      <p className="lede">{lesson.description}</p>
      <div className="lesson-progress card" aria-label="Lesson progress">
        <div>
          <strong>
            Vocabulary recall: {progress.recall}/{progress.total}
          </strong>
          <small>
            English → Czech {progress.enCs}/{progress.total} · Czech → English{' '}
            {progress.csEn}/{progress.total}
          </small>
        </div>
        <div>
          <strong>
            Context use: {progress.context}/{progress.total}
          </strong>
          <small>
            Understand {progress.understanding}/{progress.total} · Produce{' '}
            {progress.production}/{progress.total}
          </small>
        </div>
      </div>
      <nav className="study-tabs" aria-label="Study modes">
        {[
          ['learn', 'Learn'],
          ['recall', 'Vocabulary Test'],
          ['context', 'Use in Context'],
          ['print', 'Printable Practice'],
        ].map(([value, label]) => (
          <Link
            key={value}
            to={`?mode=${value}`}
            aria-current={mode === value ? 'page' : undefined}
          >
            {label}
          </Link>
        ))}
      </nav>
      {mode === 'print' && (
        <section className="card">
          <h2>Printable Practice</h2>
          <p>
            Generate an A4 worksheet, write your answers by hand, then record
            the results here. The answer key is separate.
          </p>
          <Link className="button" to={`/printable?lesson=${lesson.id}`}>
            Create lesson worksheet
          </Link>
          <p className="fine">
            Paper worksheets completed: {data.paperCompleted[lesson.id] ?? 0}.
            Paper practice is optional; digital recall and context tests can
            still pass the lesson.
          </p>
        </section>
      )}
      {(data.paperCompleted[lesson.id] ?? 0) > 0 && mode !== 'print' && (
        <p className="fine">
          Paper worksheets completed: {data.paperCompleted[lesson.id]}. Optional
          paper results are included in your learning history.
        </p>
      )}
      {mode === 'learn' && (
        <section className="card">
          <div className="toolbar">
            <h2>Learn the lesson vocabulary</h2>
            <label className="check-label">
              <input
                type="checkbox"
                checked={showExamples}
                onChange={(e) => setShowExamples(e.target.checked)}
              />
              Show examples
            </label>
          </div>
          <p className="fine">
            {lesson.words.length} useful words and phrases. Reading the list
            does not count as passing a test.
          </p>
          <ul className="learn-list">
            {lesson.words.map((word) => (
              <li key={word.id}>
                <div>
                  <strong>{word.english}</strong>
                  <span>{word.czech}</span>
                </div>
                {showExamples && <p>{word.examples[0]}</p>}
              </li>
            ))}
          </ul>
          <button onClick={() => setParams({ mode: 'recall' })}>
            Ready for Vocabulary Test
          </button>
        </section>
      )}
      {mode === 'recall' && (
        <section className="card">
          <h2>Vocabulary Test</h2>
          <p>
            Type the lesson words and phrases from memory. Use the English
            expression from Learn, or a listed Czech equivalent. Both directions
            contribute separately to recall progress.
          </p>
          <Direction value={direction} onChange={setDirection} />
          <button
            className="start-test"
            onClick={() => start('recall')}
            disabled={busy}
          >
            {active ? 'Continue vocabulary test' : 'Start vocabulary test'}
          </button>
          <p className="fine">
            {lesson.words.length} entries plus delayed recall. Mistakes return
            after five other questions and in closing recall.
          </p>
        </section>
      )}
      {mode === 'context' && (
        <section className="card">
          <h2>Use in Context</h2>
          <p>
            First fill a gap with the lesson phrase. Then complete a different
            example by typing the whole sentence. The sentence frame keeps
            checking simple and predictable.
          </p>
          <p className="fine">
            These are controlled exercises using the lesson wording, not AI
            evaluation of arbitrary English. Capitalization, extra spaces and
            final punctuation do not affect checking.
          </p>
          <button
            className="start-test"
            onClick={() => start('context')}
            disabled={busy}
          >
            {active ? 'Continue context practice' : 'Start context practice'}
          </button>
        </section>
      )}
      {failure && <p role="alert">{failure}</p>}
      <p className="fine">
        {progress.passed
          ? 'Lesson practice passed. Long-term mastery still requires successful spaced reviews.'
          : 'Pass this lesson by recalling every expression in both directions and demonstrating understanding and sentence use for every entry.'}
      </p>
    </>
  );
}
export function VocabularyEditor() {
  const { id } = useParams();
  const { data, error } = useStudyLibrary();
  if (error) return <p role="alert">{error}</p>;
  if (!data) return <p role="status">Loading personal words…</p>;
  const word = id ? data.words.find((w) => w.id === id) : undefined;
  if (id && !word)
    return (
      <p role="alert">
        Personal word not found. <Link to="/vocabulary">Return to lessons</Link>
      </p>
    );
  return (
    <PersonalForm
      key={id ?? 'new'}
      id={id}
      initialEnglish={word?.english ?? ''}
      initialCzech={word?.meaning ?? ''}
    />
  );
}
function PersonalForm({
  id,
  initialEnglish,
  initialCzech,
}: {
  id?: string;
  initialEnglish: string;
  initialCzech: string;
}) {
  const [english, setEnglish] = useState(initialEnglish),
    [czech, setCzech] = useState(initialCzech);
  const [busy, setBusy] = useState(false),
    [error, setError] = useState('');
  const navigate = useNavigate();
  async function save(event: React.FormEvent) {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setError('');
    try {
      await savePersonalWord(db, english, czech, id);
      navigate('/vocabulary');
    } catch (e) {
      setError(errorMessage(e));
      setBusy(false);
    }
  }
  return (
    <>
      <Link to="/vocabulary">← Vocabulary lessons</Link>
      <h1 className="editor-heading">
        {id ? 'Edit your word.' : 'Add a personal word.'}
      </h1>
      <form className="card editor-form" onSubmit={save}>
        <div>
          <label htmlFor="edit-english">English word or phrase</label>
          <input
            id="edit-english"
            value={english}
            onChange={(e) => setEnglish(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="edit-czech">Czech meaning</label>
          <input
            id="edit-czech"
            value={czech}
            onChange={(e) => setCzech(e.target.value)}
            required
          />
        </div>
        <button disabled={busy}>Save word</button>
        {error && <p role="alert">{error}</p>}
      </form>
    </>
  );
}
