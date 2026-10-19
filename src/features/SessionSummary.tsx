import { Link } from 'react-router-dom';
import type { sessionSummary } from '../domain/session-summary';
import { relativeReview } from '../domain/session-summary';
import type { Session } from '../domain/models';

export function SessionSummary({
  session,
  summary,
}: {
  session: Session;
  summary: ReturnType<typeof sessionSummary>;
}) {
  return (
    <section className="summary">
      <p className="eyebrow">PRACTICE SAVED</p>
      <h1>Good practice.</h1>
      <p className="lede">
        {summary.revisited
          ? 'You retrieved the difficult concepts again after a delay and in closing recall.'
          : 'Clean recall. Your next reviews are scheduled.'}
      </p>
      <div className="stats" aria-label="Session results">
        {[
          [
            'First-attempt accuracy',
            summary.accuracy === null ? '—' : `${summary.accuracy}%`,
          ],
          ['Total attempts', summary.attempts],
          ['Concepts revisited', summary.revisited],
          ['Concepts completed cleanly', summary.clean],
        ].map(([label, value]) => (
          <div key={label}>
            <strong>{value}</strong>
            <span>{label}</span>
          </div>
        ))}
      </div>
      {summary.weak.length ? (
        <section className="card" aria-label="Needs more practice">
          <h2>Needs more practice</h2>
          <ul className="review-list">
            {summary.weak.slice(0, 5).map((item) => (
              <li key={item.id}>
                <strong>{item.title}</strong>
                <span>
                  {' '}
                  —{' '}
                  {item.review
                    ? `review ${relativeReview(item.review.dueAt)}`
                    : 'review scheduled'}
                </span>
              </li>
            ))}
          </ul>
          {summary.weak.length > 5 && (
            <p className="fine">
              {summary.weak.length - 5} more in scheduled reviews.
            </p>
          )}
        </section>
      ) : (
        <p className="clean-session">
          Everything recalled cleanly. No difficult concepts to revisit from
          this session.
        </p>
      )}
      <details className="card scheduled-details">
        <summary>View all scheduled reviews</summary>
        <ul className="review-list">
          {summary.items.map((item) => (
            <li key={item.id}>
              <strong>{item.title}</strong>
              {item.review && (
                <div className="fine">
                  {item.review.status} ·{' '}
                  <time dateTime={new Date(item.review.dueAt).toISOString()}>
                    {new Date(item.review.dueAt).toLocaleString(undefined, {
                      dateStyle: 'medium',
                      timeStyle: 'short',
                    })}
                  </time>
                </div>
              )}
            </li>
          ))}
        </ul>
      </details>
      <div className="summary-actions">
        <Link className="button" to="/">
          Back to home
        </Link>
        {session.lessonId && (
          <Link
            className="button"
            to={`/vocabulary/lessons/${session.lessonId}?mode=${session.studyMode === 'recall' ? 'context' : 'learn'}`}
          >
            {session.studyMode === 'recall'
              ? 'Continue to Use in Context'
              : 'Return to lesson progress'}
          </Link>
        )}
        {summary.weak.length > 0 && (
          <Link className="button secondary" to="/mistakes">
            Review mistakes
          </Link>
        )}
        {session.weakAreaIds && (
          <Link to="/mistakes">Return to weak areas</Link>
        )}
        {session.drillId && (
          <Link to="/drills">Return to Quick Reflex Drills</Link>
        )}
        {session.module === 'vocabulary' && !session.weakAreaIds && (
          <Link to="/vocabulary">Return to vocabulary library</Link>
        )}
      </div>
    </section>
  );
}
