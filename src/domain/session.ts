import type { Concept, ReviewItem, Session, Task } from './models';

export const RETRIEVAL_GAP = 5;

function seedFrom(id: string) {
  let seed = 2166136261;
  for (const char of id) seed = Math.imul(seed ^ char.charCodeAt(0), 16777619);
  return seed >>> 0 || 1;
}

function nextRandom(s: Session) {
  const state = s.ordering!;
  let seed = state.seed;
  seed ^= seed << 13;
  seed ^= seed >>> 17;
  seed ^= seed << 5;
  state.seed = seed >>> 0 || 1;
  return state.seed / 4294967296;
}

function ensureOrdering(s: Session, content: Concept[]) {
  if (s.ordering) return;
  // Old persisted sessions have no ordering state. Remember their current prompt
  // rather than resetting progress or changing any outstanding retrieval task.
  const previous = content.find((c) => c.id === s.current?.conceptId);
  s.ordering = {
    seed: seedFrom(s.id),
    recentTargets: previous ? [previous.group] : [],
    counts: previous ? { [previous.group]: 1 } : {},
    lastPresented: previous ? { [previous.id]: s.processed - 1 } : {},
    lastConceptId: previous?.id,
  };
}

function balancedTask(s: Session, tasks: Task[], content: Concept[]): Task {
  const state = s.ordering!;
  const byId = new Map(content.map((c) => [c.id, c]));
  const last = state.recentTargets.at(-1);
  const repeated = last && state.recentTargets.at(-2) === last;
  let pool = tasks;
  // These constraints apply within a learning-priority tier, never ahead of a
  // ready failed-item retry or at the expense of an overdue review.
  if (repeated && pool.some((t) => byId.get(t.conceptId)!.group !== last)) {
    pool = pool.filter((t) => byId.get(t.conceptId)!.group !== last);
  }
  if (pool.some((t) => t.conceptId !== state.lastConceptId)) {
    pool = pool.filter((t) => t.conceptId !== state.lastConceptId);
  }
  let groups = [...new Set(pool.map((t) => byId.get(t.conceptId)!.group))];
  // Brief focused acquisition pairs, followed by varied contexts in mixed recall.
  const pair =
    s.acquisition &&
    pool.every((t) => t.kind === 'initial') &&
    last &&
    !repeated &&
    groups.includes(last);
  if (pair) groups = [last];
  else {
    const min = Math.min(...groups.map((group) => state.counts[group] ?? 0));
    groups = groups.filter((group) => (state.counts[group] ?? 0) === min);
  }
  const target = groups[Math.floor(nextRandom(s) * groups.length)];
  const candidates = pool.filter(
    (t) => byId.get(t.conceptId)!.group === target,
  );
  // Oldest due item within a target, then least recently presented concept.
  // Seeded tie-breaking varies sessions while making every transition replayable.
  const scored = candidates.map((task) => ({ task, tie: nextRandom(s) }));
  scored.sort(
    (a, b) =>
      (a.task.dueAt ?? Infinity) - (b.task.dueAt ?? Infinity) ||
      (state.lastPresented[a.task.conceptId] ?? -1) -
        (state.lastPresented[b.task.conceptId] ?? -1) ||
      a.tie - b.tie,
  );
  return scored[0].task;
}

function selectNext(s: Session, content: Concept[]) {
  ensureOrdering(s, content);
  const hasNormal = s.queue.some((t) => t.kind !== 'final');
  const ready = s.queue.filter(
    (t) => t.readyAfter <= s.processed && (!hasNormal || t.kind !== 'final'),
  );
  let task: Task | undefined;
  const failedRetries = ready.filter(
    (t) => t.kind === 'delayed' && s.failed.includes(t.conceptId),
  );
  if (failedRetries.length) {
    // Deadlines win over visual balance, including a third identical target.
    task = failedRetries.sort((a, b) => a.readyAfter - b.readyAfter)[0];
  } else if (ready.length) {
    const priority = (t: Task) =>
      t.kind === 'initial' ? (t.priority ?? 3) : 4;
    const tier = Math.min(...ready.map(priority));
    task = balancedTask(
      s,
      ready.filter((t) => priority(t) === tier),
      content,
    );
  } else if (s.queue.length) {
    // Late failures still get five other completed prompts. Never use the
    // cooling-down concept itself as filler, even when several concepts failed.
    const cooling = new Set(
      s.queue.filter((t) => t.readyAfter > s.processed).map((t) => t.conceptId),
    );
    const reserved = new Set(
      s.queue.filter((t) => t.kind === 'final').map((t) => t.conceptId),
    );
    const available = content.filter((c) => !cooling.has(c.id));
    const unreserved = available.filter((c) => !reserved.has(c.id));
    const alternatives = unreserved.length ? unreserved : available;
    if (!alternatives.length)
      throw new Error('Not enough distinct concepts for delayed retrieval.');
    task = balancedTask(
      s,
      alternatives.map((c) => ({
        conceptId: c.id,
        kind: 'interleave',
        readyAfter: 0,
      })),
      content,
    );
  }
  if (task && task.kind !== 'interleave')
    s.queue.splice(s.queue.indexOf(task), 1);
  s.current = task ?? null;
  s.wrongCount = 0;
  s.feedback = 'none';
  if (task) {
    const c = content.find((c) => c.id === task.conceptId)!;
    const count = s.seen[c.id] ?? 0;
    s.exerciseId = c.exercises[count % c.exercises.length].id;
    s.seen[c.id] = count + 1;
    const state = s.ordering!;
    state.recentTargets = [...state.recentTargets, c.group].slice(-2);
    state.counts[c.group] = (state.counts[c.group] ?? 0) + 1;
    state.lastPresented[c.id] = s.processed;
    state.lastConceptId = c.id;
  }
}

export function startSession(
  id: string,
  now: number,
  content: Concept[],
  reviews: ReviewItem[],
  initialIds?: string[],
  deferredIds?: string[],
): Session {
  const byId = new Map(reviews.map((r) => [r.conceptId, r]));
  const rank = (r?: ReviewItem) =>
    r && r.status !== 'new' && r.dueAt <= now
      ? 0
      : r?.lastErrorSession
        ? 1
        : r?.status === 'new' || !r
          ? 3
          : 2;
  const s: Session = {
    id,
    startedAt: now,
    queue: content
      .filter((c) => !initialIds || initialIds.includes(c.id))
      .map((c) => ({
        conceptId: c.id,
        kind: 'initial',
        readyAfter: deferredIds?.includes(c.id) ? RETRIEVAL_GAP : 0,
        priority: rank(byId.get(c.id)),
        dueAt: rank(byId.get(c.id)) === 0 ? byId.get(c.id)!.dueAt : undefined,
      })),
    current: null,
    exerciseId: '',
    wrongCount: 0,
    processed: 0,
    failed: [],
    acquisition: content.every(
      (c) => !byId.get(c.id) || byId.get(c.id)!.status === 'new',
    ),
    seen: Object.fromEntries(
      content.map((c) => [c.id, byId.get(c.id)?.successes.length ?? 0]),
    ),
    feedback: 'none',
  };
  selectNext(s, content);
  return s;
}

export function submitToSession(
  previous: Session,
  correct: boolean,
  now: number,
  content: Concept[],
): Session {
  const s = structuredClone(previous);
  if (!s.current || s.completedAt) throw new Error('Session already complete');
  const task = s.current;
  delete s.assessment;
  if (!correct) {
    s.wrongCount++;
    s.feedback = s.wrongCount === 1 ? 'hint' : 'correction';
    if (!s.failed.includes(task.conceptId)) s.failed.push(task.conceptId);
    return s;
  }
  s.processed++;
  if (s.wrongCount > 0) {
    s.queue = s.queue.filter((t) => t.conceptId !== task.conceptId);
    s.queue.push({
      conceptId: task.conceptId,
      kind: 'delayed',
      readyAfter: s.processed + RETRIEVAL_GAP,
    });
    s.queue.push({
      conceptId: task.conceptId,
      kind: 'final',
      readyAfter: s.processed + 2 * RETRIEVAL_GAP + 1,
    });
  } else if (task.kind === 'initial') {
    s.queue.push({
      conceptId: task.conceptId,
      kind: 'delayed',
      readyAfter: s.processed + RETRIEVAL_GAP,
    });
  } else if (task.kind === 'delayed') {
    const final = s.queue.find(
      (t) => t.conceptId === task.conceptId && t.kind === 'final',
    );
    if (final) final.readyAfter = s.processed + RETRIEVAL_GAP;
  }
  selectNext(s, content);
  if (!s.current) s.completedAt = now;
  return s;
}
