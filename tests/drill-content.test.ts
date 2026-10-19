import { expect, it } from 'vitest';
import { drills } from '../src/content/drills';
import { validateDrillContent } from '../src/content/drill-validation';
import { expandDailyDrills } from '../src/content/drill-bank/daily';
it('validates the expanded authored bank and reports distribution', () => {
  const report = validateDrillContent(drills);
  console.info('DRILL_BANK_REPORT', JSON.stringify(report));
  expect(report.errors).toEqual([]);
  expect(report.total).toBe(2560);
  expect(report.newPrompts).toBe(1197);
  expect(report.richNewPrompts / report.newPrompts).toBeGreaterThanOrEqual(
    0.25,
  );
  expect(report.modules.map((m) => m.count)).toEqual([
    220, 260, 220, 220, 200, 180, 220, 200, 160, 160, 240, 280,
  ]);
  expect(report.levels.B1 / report.total).toBeCloseTo(0.2, 1);
  expect(report.levels.B2 / report.total).toBeCloseTo(0.55, 1);
  expect(report.levels.C1 / report.total).toBeCloseTo(0.25, 1);
  expect(report.nearDuplicates).toEqual([]);
  expect(report.exactDuplicates).toEqual([]);
  expect(report.domains).toEqual({
    university: 461,
    engineering: 563,
    workplace: 384,
    travel: 307,
    everyday: 461,
    sport: 205,
    advanced: 179,
  });
});
it('detects duplicate IDs and normalized exact prompts', () => {
  const modules = structuredClone([drills[0]]);
  const [first, second] = modules[0].concepts[0].exercises;
  second.id = first.id;
  second.prompt = first.prompt.toUpperCase();
  const report = validateDrillContent(modules);
  expect(report.errors.some((e) => e.includes('Duplicate exercise ID'))).toBe(
    true,
  );
  expect(report.duplicates).toHaveLength(1);
});
it('flags near-identical lexical substitutions rather than treating them as new variety', () => {
  const modules = structuredClone([drills[0]]);
  modules[0].concepts[0].exercises[0].prompt =
    'We waited ___ the bus outside the laboratory for nearly an hour.';
  modules[0].concepts[0].exercises[1].prompt =
    'We waited ___ the train outside the laboratory for nearly an hour.';
  expect(validateDrillContent(modules).nearDuplicates).toContainEqual([
    modules[0].concepts[0].exercises[0].id,
    modules[0].concepts[0].exercises[1].id,
  ]);
});
it('rejects missing answers, malformed prompts and underrepresented concepts/targets', () => {
  const modules = structuredClone([drills[0]]);
  modules[0].concepts[0].exercises[0].acceptedAnswers = [];
  modules[0].concepts[0].exercises[1].prompt =
    'No answer gap in this malformed item.';
  modules[0].concepts[0].exercises = modules[0].concepts[0].exercises.slice(
    0,
    2,
  );
  modules[0].concepts = [
    modules[0].concepts[0],
    ...modules[0].concepts.filter((c) => c.group !== 'AT'),
  ];
  const report = validateDrillContent(modules);
  expect(report.errors.some((e) => e.includes('Missing accepted answer'))).toBe(
    true,
  );
  expect(report.errors.some((e) => e.includes('Malformed exercise'))).toBe(
    true,
  );
  expect(
    report.errors.some((e) => e.includes('Underrepresented concept')),
  ).toBe(true);
  expect(report.errors.some((e) => e.includes('Underrepresented target'))).toBe(
    true,
  );
  expect(report.errors.some((e) => e.includes('Insufficient prompts'))).toBe(
    true,
  );
});

it('rejects whole-bank topic and difficulty imbalance rather than silently choosing another mix', () => {
  const modules = structuredClone(drills);
  for (const module of modules)
    for (const concept of module.concepts)
      for (const exercise of concept.exercises) {
        exercise.topic = 'engineering';
        exercise.level = 'B1';
      }
  const report = validateDrillContent(modules);
  expect(report.errors).toContain('Topic imbalance: university');
  expect(report.errors).toContain('Difficulty imbalance: B2');
});

it('appends literal variants without mutating or changing any of the original 1,363 IDs/text/accepted answers', () => {
  const original = drills.map((m) => ({
    ...m,
    concepts: m.concepts
      .filter((c) => c.id !== 'drill:verb-preposition-patterns:differ')
      .map((c) => ({
        ...c,
        exercises: c.exercises.filter((e) => !e.id.includes(':daily:')),
      })),
  }));
  const before = structuredClone(original);
  expect(
    original.flatMap((m) => m.concepts.flatMap((c) => c.exercises)),
  ).toHaveLength(1363);
  const expanded = expandDailyDrills(original).flatMap((m) =>
    m.concepts.flatMap((c) => c.exercises),
  );
  for (const exercise of before.flatMap((m) =>
    m.concepts.flatMap((c) => c.exercises),
  ))
    expect(expanded.find((e) => e.id === exercise.id)).toEqual(exercise);
  expect(original).toEqual(before);
});
