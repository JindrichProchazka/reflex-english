import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { db } from '../data/database';
import { loadWeakAreas } from '../application/weakness';
import { needsPractice } from '../domain/weakness';

export function WeakAreasCard() {
  const [count, setCount] = useState<number>();
  useEffect(() => {
    let alive = true;
    loadWeakAreas(db)
      .then((data) => {
        if (alive) setCount(data.areas.filter(needsPractice).length);
      })
      .catch(() => {
        if (alive) setCount(undefined);
      });
    return () => {
      alive = false;
    };
  }, []);
  return (
    <section className="card feature" aria-label="Weak Areas">
      <p className="eyebrow">LEARN FROM YOUR MISTAKES</p>
      <h2>Weak Areas</h2>
      <p>
        {count === undefined
          ? 'Review the patterns that need another look.'
          : `${count} ${count === 1 ? 'concept needs' : 'concepts need'} attention`}
      </p>
      <Link className="button" to="/mistakes">
        Practice weak areas
      </Link>
    </section>
  );
}
