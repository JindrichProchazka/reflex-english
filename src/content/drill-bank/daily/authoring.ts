import type { DrillModule } from '../../drills';
import type { DrillLevel, DrillTopic } from '../types';

/** Compact literal authoring format, not a sentence/template generator.
 * @topic LEVEL sets explicit editorial metadata; concept|sentence|answer|alternatives.
 * An omitted answer preserves the concept's original accepted alternatives.
 */
export function appendAuthored(
  module: DrillModule,
  source: string,
): DrillModule {
  const counters: Record<string, number> = {};
  let topic: DrillTopic, level: DrillLevel;
  const concepts = module.concepts.map((c) => ({
    ...c,
    exercises: [...c.exercises],
  }));
  for (const line of source
    .trim()
    .split('\n')
    .map((s) => s.trim())
    .filter(Boolean)) {
    if (line.startsWith('@')) {
      const [domain, difficulty] = line.slice(1).split(' ');
      topic = domain as DrillTopic;
      level = difficulty as DrillLevel;
      continue;
    }
    const [key, prompt, answer, ...alternatives] = line.split('|');
    const concept = concepts.find((c) => c.id.split(':').at(-1) === key);
    if (!concept || !topic! || !level!)
      throw new Error(`Invalid authored row: ${module.id} / ${line}`);
    const reference = concept.exercises[0];
    const index = counters[key] ?? 0;
    counters[key] = index + 1;
    const id = `${concept.id}:daily:${index}`;
    concepts
      .find((c) => c.id === concept.id)!
      .exercises.push({
        ...reference,
        id,
        contextId: id,
        prompt,
        level,
        topic,
        answer: answer ?? reference.answer,
        acceptedAnswers:
          answer === undefined
            ? (reference.acceptedAnswers ?? [reference.answer])
            : [answer, ...alternatives],
      });
  }
  return { ...module, concepts };
}
