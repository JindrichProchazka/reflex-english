import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { db } from '../data/database';
import {
  beginWeakSession,
  loadWeakAreas,
  mistakeCategory,
  revealWeakReferences,
} from '../application/weakness';
import {
  filterWeakAreas,
  needsPractice,
  weaknessProgress,
  type WeakArea,
  type WeakFilter,
} from '../domain/weakness';
import type { Attempt } from '../domain/models';

const date = (at?: number) =>
  at === undefined ? 'Not scheduled' : new Date(at).toLocaleString();
const detailLink = (id: string, view = 'history') =>
  `/mistakes?concept=${encodeURIComponent(id)}&view=${view}`;
type Data = Awaited<ReturnType<typeof loadWeakAreas>>;
function correctExamples(data: Data, area: WeakArea) {
  const examples = [
    ...new Set(
      [...data.catalog.values()]
        .filter((t) => t.groupId === area.id)
        .flatMap((t) => t.concept.exercises)
        .filter((e) => !e.entryId || e.lessonEvidence === 'production')
        .map((e) => (e.entryId ? e.answer : e.prompt.replace('___', e.answer))),
    ),
  ].slice(0, 4);
  return examples.length
    ? examples
    : [area.targets[0].concept.exercises[0].explanation];
}
function improvementText(area: WeakArea) {
  return area.cleanAfterError >= 3
    ? `${area.cleanAfterError} clean retrievals since the last error.`
    : 'Higher first-attempt accuracy than the previous week, with at least three observations in each week.';
}
function LessonLinks({ area }: { area: WeakArea }) {
  const lessons = Array.from(
    new Map(
      area.targets
        .filter((t) => t.lessonId && t.lessonTitle)
        .map((t) => [t.lessonId!, t]),
    ).values(),
  );
  return (
    <>
      {lessons.map((t) => (
        <p key={t.lessonId}>
          <Link to={`/vocabulary/lessons/${t.lessonId}`}>
            Open lesson: {t.lessonTitle ?? t.lessonId}
          </Link>
        </p>
      ))}
      {!lessons.length && (
        <p className="fine">{area.targets[0].topic} · No source lesson</p>
      )}
    </>
  );
}
function ErrorRows({
  attempts,
  area,
  references,
}: {
  attempts: Attempt[];
  area: WeakArea;
  references: boolean;
}) {
  return (
    <ol className="mistakes">
      {[...attempts]
        .reverse()
        .slice(0, 12)
        .map((a) => (
          <li key={a.id}>
            <p className="fine">
              <time dateTime={new Date(a.at).toISOString()}>{date(a.at)}</time>{' '}
              · {a.source === 'paper' ? 'Paper' : 'Digital'} ·{' '}
              {mistakeCategory(a)}
            </p>
            <p>{a.prompt}</p>
            <p>
              {a.answerRecorded === false
                ? 'Paper answer not transcribed'
                : `You wrote “${a.answer}”`}
            </p>
            {references && (
              <p>
                Correct / reference answer: <strong>{a.expected}</strong>
              </p>
            )}
            <p className="fine">
              {area.targets.find((t) => t.concept.id === a.conceptId)
                ?.lessonTitle ?? area.targets[0].topic}{' '}
              · Current status: {area.label} · {area.mastery}
            </p>
          </li>
        ))}
    </ol>
  );
}
export function WeakAreasPage() {
  const [search, setSearch] = useSearchParams(),
    navigate = useNavigate();
  const groupId = search.get('concept'),
    view = search.get('view');
  const [data, setData] = useState<Data>();
  const [filter, setFilter] = useState<WeakFilter>('all');
  const [references, setReferences] = useState<string[]>([]);
  const [busy, setBusy] = useState(false),
    [error, setError] = useState('');
  useEffect(() => {
    let alive = true;
    loadWeakAreas(db)
      .then(async (result) => {
        if (groupId && view === 'examples') {
          await revealWeakReferences(db, groupId);
          if (alive) setReferences((ids) => [...new Set([...ids, groupId])]);
        }
        if (alive) setData(result);
      })
      .catch((e) => {
        if (alive) setError(e.message);
      });
    return () => {
      alive = false;
    };
  }, [groupId, view]);
  async function practice(id?: string) {
    setBusy(true);
    setError('');
    try {
      const session = await beginWeakSession(db, id);
      navigate(`/review/${session.id}`);
    } catch (e) {
      setError((e as Error).message);
      setBusy(false);
    }
  }
  async function reveal(id: string) {
    setBusy(true);
    setError('');
    try {
      await revealWeakReferences(db, id);
      setReferences((ids) => [...new Set([...ids, id])]);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  if (!data)
    return (
      <p role={error ? 'alert' : 'status'}>
        {error || 'Opening your mistake notebook…'}
      </p>
    );
  const progress = weaknessProgress(data.areas),
    area = data.areas.find((a) => a.id === groupId);
  const filtered = filterWeakAreas(data.areas, filter, data.now);
  const recent = filtered
    .flatMap((a) => a.errors.map((attempt) => ({ area: a, attempt })))
    .sort((a, b) => b.attempt.at - a.attempt.at)
    .slice(0, 10);
  const repeated = [...filtered]
    .filter((a) => a.occurrences >= 2)
    .sort((a, b) => b.occurrences - a.occurrences)
    .slice(0, 5);
  const actions = (a: WeakArea) => (
    <div className="word-actions">
      <button disabled={busy} onClick={() => practice(a.id)}>
        Practice now
      </button>
      <Link to={detailLink(a.id, 'examples')}>Review examples</Link>
      <Link to={detailLink(a.id)}>View mistake history</Link>
    </div>
  );
  return (
    <section>
      <Link to="/">← Home</Link>
      <p className="eyebrow">RECALL, REFINE, RETURN</p>
      <h1>Mistakes / Weak Areas</h1>
      {error && <p role="alert">{error}</p>}
      {groupId ? (
        area ? (
          <>
            <button className="secondary" onClick={() => setSearch({})}>
              ← All weak areas
            </button>
            <article className="card" aria-label="Mistake detail">
              <h2>{area.title}</h2>
              <p>
                <strong>{area.label}</strong> · Mastery: {area.mastery}
              </p>
              <p>
                {area.occurrences} incorrect attempts · Last mistake:{' '}
                {date(area.lastMistakeAt)}
              </p>
              <p>
                Next review: {date(area.nextReviewAt)}
                {area.overdue ? ' · Overdue' : ''}
              </p>
              {area.relapsed && (
                <p>Previously mastered, then retrieved incorrectly.</p>
              )}
              <p>
                First-attempt accuracy:{' '}
                {area.firstAccuracy === null
                  ? 'Not enough evidence'
                  : `${Math.round(area.firstAccuracy * 100)}%`}
              </p>
              <p>
                {area.improving
                  ? improvementText(area)
                  : 'Improvement is assessed from clean retrievals, not copied corrections.'}
              </p>
              {actions(area)}
              <LessonLinks area={area} />
              <h3>Explanation and correct examples</h3>
              {references.includes(area.id) ? (
                <>
                  <p>
                    {area.errors.at(-1)?.exerciseSnapshot?.explanation ??
                      area.targets[0].concept.exercises[0].explanation}
                  </p>
                  <ul>
                    {correctExamples(data, area).map((example) => (
                      <li key={example}>{example}</li>
                    ))}
                  </ul>
                  <p className="fine">
                    References opened. Targeted practice leaves room for five
                    other prompts before checking these items.
                  </p>
                </>
              ) : (
                <>
                  <p>
                    Open references when you want to study the correction.
                    Practice will check recall after intervening prompts.
                  </p>
                  <button
                    className="secondary"
                    disabled={busy}
                    onClick={() => reveal(area.id)}
                  >
                    Show explanation and reference answers
                  </button>
                </>
              )}
              <h3>Recent incorrect examples</h3>
              <ErrorRows
                attempts={area.errors}
                area={area}
                references={references.includes(area.id)}
              />
              {!area.errors.length && <p>No incorrect answers recorded.</p>}
              <details>
                <summary>How this is assessed</summary>
                <p>
                  This is a practice-priority signal, not a mastery award.
                  Positive values increase attention; clean retrievals reduce
                  it.
                </p>
                <ul>
                  {Object.entries(area.signals).map(([label, value]) => (
                    <li key={label}>
                      {label}: {value}
                    </li>
                  ))}
                </ul>
              </details>
            </article>
          </>
        ) : (
          <p role="alert">
            This concept was not found.{' '}
            <Link to="/mistakes">View all weak areas</Link>
          </p>
        )
      ) : (
        <>
          <p>
            Paper and digital practice share one history. A practice-priority
            label is separate from long-term mastery.
          </p>
          <section className="card" aria-label="Weakness summary">
            <h2>{progress.attention} concepts need attention</h2>
            <div className="word-actions">
              <button
                disabled={
                  busy ||
                  !data.areas.some(
                    (a) => needsPractice(a) || a.label === 'Improving',
                  )
                }
                onClick={() => practice()}
              >
                Practice weak areas now
              </button>
              <Link to="/printable?source=mistakes">
                Practice mistakes on paper
              </Link>
            </div>
            {data.sessions
              .filter((s) => s.weakAreaIds && !s.completedAt)
              .map((s) => (
                <p key={s.id}>
                  <Link to={`/review/${s.id}`}>Continue focused practice</Link>
                </p>
              ))}
            <details>
              <summary>How weakness is assessed</summary>
              <p>
                We combine failed encounters in the last seven days (up to 30),
                repeated failures (15), mastery state (12), due/overdue review
                (12), first-attempt error rate (20) and error recency (10).
                Clean retrievals since the last error reduce the signal by up to
                18. Labels: Needs attention ≥60, Weak ≥35, Improving ≥15, Stable
                below 15. Multiple retries on one prompt count as one failed
                encounter in this signal; every raw mistake remains in history.
              </p>
            </details>
          </section>
          <label htmlFor="weak-filter">Filter mistakes</label>
          <select
            id="weak-filter"
            value={filter}
            onChange={(e) => setFilter(e.target.value as WeakFilter)}
          >
            {Object.entries({
              all: 'All',
              vocabulary: 'Vocabulary',
              grammar: 'Grammar',
              lesson: 'Lesson / context',
              recent: 'Recent (7 days)',
              repeated: 'Repeated',
              relapsed: 'Mastered but relapsed',
            }).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
          <section className="card" aria-label="Current weak concepts">
            <h2>Weakest concepts</h2>
            {!filtered.length && (
              <p>
                No matching practice history yet. Mistakes will appear after a
                review or paper worksheet.
              </p>
            )}
            {filtered.map((a) => (
              <article className="weak-concept" key={a.id} aria-label={a.title}>
                <h3>{a.title}</h3>
                <p>
                  <strong>{a.label}</strong> · {a.occurrences} incorrect
                  attempts · {a.mastery}
                  {a.overdue ? ' · Overdue' : ''}
                </p>
                {actions(a)}
                <LessonLinks area={a} />
              </article>
            ))}
          </section>
          <section className="card" aria-label="Repeated mistakes">
            <h2>Most repeated mistakes</h2>
            {repeated.length ? (
              <ul>
                {repeated.map((a) => (
                  <li key={a.id}>
                    <Link to={detailLink(a.id)}>{a.title}</Link> ·{' '}
                    {a.occurrences} incorrect attempts
                  </li>
                ))}
              </ul>
            ) : (
              <p>No repeated mistakes in this filter.</p>
            )}
          </section>
          <section className="card" aria-label="Overdue weak items">
            <h2>Overdue weak items</h2>
            {filtered.some((a) => a.overdue && needsPractice(a)) ? (
              <ul>
                {filtered
                  .filter((a) => a.overdue && needsPractice(a))
                  .map((a) => (
                    <li key={a.id}>
                      <Link to={detailLink(a.id)}>{a.title}</Link> ·{' '}
                      {date(a.nextReviewAt)}
                    </li>
                  ))}
              </ul>
            ) : (
              <p>No overdue weak items in this filter.</p>
            )}
          </section>
          <section className="card" aria-label="Recent mistakes">
            <h2>Recent mistakes</h2>
            {!recent.length && <p>No incorrect answers in this filter.</p>}
            {recent.map(({ area: a, attempt }) => (
              <article key={attempt.id}>
                <h3>
                  <Link to={detailLink(a.id)}>{a.title}</Link>
                </h3>
                <ErrorRows
                  attempts={[attempt]}
                  area={a}
                  references={references.includes(a.id)}
                />
                {!references.includes(a.id) && (
                  <button
                    disabled={busy}
                    className="secondary"
                    onClick={() => reveal(a.id)}
                  >
                    Show reference: {a.title}
                  </button>
                )}
              </article>
            ))}
          </section>
          <section className="card" aria-label="Learning patterns">
            <h2>Learning patterns</h2>
            <h3>Most frequent mistake categories</h3>
            <ul>
              {progress.categories.map(([category, count]) => (
                <li key={category}>
                  {category}: {count}
                </li>
              ))}
            </ul>
            <h3>Weakest lessons</h3>
            {!progress.lessons.length && <p>No lesson evidence yet.</p>}
            <ul>
              {progress.lessons.slice(0, 5).map((l) => (
                <li key={l.id}>
                  <Link to={`/vocabulary/lessons/${l.id}`}>{l.title}</Link> ·{' '}
                  {l.weak}/{l.practised} practised words need attention
                </li>
              ))}
            </ul>
            <h3>Weakest topics</h3>
            <ul>
              {progress.topics.slice(0, 5).map((t) => (
                <li key={t.title}>
                  {t.title} · {t.weak}/{t.practised} practised concepts need
                  attention
                </li>
              ))}
            </ul>
            <h3>Recent improvement</h3>
            {!progress.improving.length ? (
              <p>
                More clean retrievals are needed to show a meaningful change.
              </p>
            ) : (
              <ul>
                {progress.improving.slice(0, 5).map((a) => (
                  <li key={a.id}>
                    <Link to={detailLink(a.id)}>{a.title}</Link> ·{' '}
                    {improvementText(a)}
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      )}
    </section>
  );
}
