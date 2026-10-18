import { expect, it } from 'vitest';
import { drills } from '../src/content/drills';
import { validateDrillContent } from '../src/content/drill-validation';
it('validates the expanded authored bank and reports distribution', () => {
  const report = validateDrillContent(drills);
  console.info('DRILL_BANK_REPORT', JSON.stringify(report));
  expect(report.errors).toEqual([]);
  expect(report.total).toBeGreaterThanOrEqual(1200);
  expect(report.modules.every((m) => m.count >= 100 && m.count <= 150)).toBe(
    true,
  );
  expect(report.levels.B1 / report.total).toBeGreaterThanOrEqual(0.25);
  expect(report.levels.B1 / report.total).toBeLessThanOrEqual(0.3);
  expect(report.levels.B2 / report.total).toBeGreaterThanOrEqual(0.45);
  expect(report.levels.B2 / report.total).toBeLessThanOrEqual(0.5);
  expect(report.levels.C1 / report.total).toBeGreaterThanOrEqual(0.2);
  expect(report.levels.C1 / report.total).toBeLessThanOrEqual(0.25);
  expect(report.nearDuplicates).toEqual([]);
  expect(Object.keys(report.topics)).toHaveLength(12);
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
