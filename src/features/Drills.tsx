import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  beginDrillSession,
  loadDrills,
  type DrillSize,
} from '../application/drills';
import { db } from '../data/database';

type Progress = Awaited<ReturnType<typeof loadDrills>>;
export function DrillsPage() {
  const navigate = useNavigate();
  const [progress, setProgress] = useState<Progress>();
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    let alive = true;
    loadDrills(db)
      .then((data) => {
        if (alive) setProgress(data);
      })
      .catch(() => {
        if (alive)
          setError('Could not read local drill progress. Reload to retry.');
      });
    return () => {
      alive = false;
    };
  }, []);
  async function start(id: string, size: DrillSize) {
    if (busy) return;
    setBusy(true);
    setError('');
    try {
      const session = await beginDrillSession(db, id, size);
      navigate(`/review/${session.id}`);
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : 'Could not save this session. Try again.',
      );
      setBusy(false);
    }
  }
  return (
    <>
      <Link to="/">← Home</Link>
      <h1>Quick Reflex Drills</h1>
      <p className="lede">
        Short typed practice for language you want to recall automatically.
      </p>
      <p>
        Quick: about 10 prompts · Normal: about 20 · Due Review: due concepts
        only.
      </p>
      <p className="fine">
        These sizes include delayed recall. Corrections and closing recall can
        add questions. Your place is saved after every answer.
      </p>
      {error && <p role="alert">{error}</p>}
      {!progress && !error && <p role="status">Loading your drills…</p>}
      <div className="drill-grid">
        {progress?.map(
          ({ drill, counts, due, accuracy, recentMistakes, active }) => (
            <section
              className="card drill-card"
              key={drill.id}
              aria-label={drill.title}
            >
              <h2>{drill.title}</h2>
              <p>{drill.description}</p>
              <dl className="drill-progress">
                <div>
                  <dt>Mastery</dt>
                  <dd>
                    {counts.mastered} / {drill.concepts.length} concepts
                    mastered
                  </dd>
                </div>
                <div>
                  <dt>Learning state</dt>
                  <dd>
                    {counts.new} new · {counts.learning} learning ·{' '}
                    {counts.reviewing} reviewing
                  </dd>
                </div>
                <div>
                  <dt>Due reviews</dt>
                  <dd>{due}</dd>
                </div>
                <div>
                  <dt>Recent first-attempt accuracy</dt>
                  <dd>
                    {accuracy === null
                      ? 'No unassisted practice yet'
                      : `${accuracy}%`}{' '}
                    <span className="fine">(last 30 days)</span>
                  </dd>
                </div>
              </dl>
              <div className="word-actions">
                <button
                  disabled={busy}
                  onClick={() => start(drill.id, 'quick')}
                >
                  {active.some((s) => s.drillSize === 'quick')
                    ? 'Continue Quick'
                    : 'Start Quick'}
                </button>
                <button
                  className="secondary"
                  disabled={busy}
                  onClick={() => start(drill.id, 'normal')}
                >
                  {active.some((s) => s.drillSize === 'normal')
                    ? 'Continue Normal'
                    : 'Start Normal'}
                </button>
                <button
                  className="secondary"
                  disabled={
                    busy ||
                    (due < 6 && !active.some((s) => s.drillSize === 'due'))
                  }
                  onClick={() => start(drill.id, 'due')}
                >
                  {active.some((s) => s.drillSize === 'due')
                    ? 'Continue Due Review'
                    : 'Due Review'}
                </button>
              </div>
              {due > 0 && due < 6 && (
                <p className="fine">
                  Due Review needs six distinct due concepts for five
                  intervening questions. Quick provides other questions for a
                  smaller due pool.
                </p>
              )}
              <p className="fine">
                {drill.concepts.reduce((n, c) => n + c.exercises.length, 0)}{' '}
                authored sentence variants. Mastery develops across spaced days.
              </p>
              <p>
                Recent mistakes:{' '}
                {recentMistakes.length
                  ? recentMistakes
                      .slice(0, 3)
                      .map(
                        (m) =>
                          drill.concepts.find((c) => c.id === m.conceptId)
                            ?.title,
                      )
                      .join(' · ')
                  : 'None recorded in the last 30 days'}
              </p>
              {recentMistakes.length > 0 && (
                <Link to="/mistakes?filter=grammar">
                  Review mistakes in Weak Areas
                </Link>
              )}
            </section>
          ),
        )}
      </div>
    </>
  );
}
