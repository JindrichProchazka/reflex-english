import type { Concept } from '../domain/models';

// Each row is a reusable concept, with contrasting contexts in separate rows.
const rows: [string, string, 'AT' | 'IN' | 'ON', string, string, string[]][] = [
  [
    'clock',
    'Clock times',
    'AT',
    'Think about an exact point in time.',
    'Use at for clock times.',
    [
      'The bus leaves ___ 7:30.',
      'Our meeting begins ___ noon.',
      'The film starts ___ midnight.',
    ],
  ],
  [
    'point',
    'Meeting points',
    'AT',
    'Think of a meeting point, rather than being inside it.',
    'Use at when a place is a point for meeting or an activity.',
    [
      'Meet me ___ the bus stop.',
      'We will meet ___ the entrance.',
      'Please wait ___ the ticket desk.',
    ],
  ],
  [
    'activity',
    'Places as activities',
    'AT',
    'Focus on the activity associated with this place.',
    'Use at school / at work for the activity, rather than the inside of a building.',
    [
      'She is ___ work today.',
      'The children are ___ school today.',
      'He is studying ___ university.',
    ],
  ],
  [
    'address',
    'Exact addresses',
    'AT',
    'Think about a precise address.',
    'Use at for an exact street address.',
    [
      'The office is ___ 14 King Street.',
      'She lives ___ 8 Park Road.',
      'Meet us ___ 20 Green Lane.',
    ],
  ],
  [
    'month',
    'Months and years',
    'IN',
    'Think about a longer period of time.',
    'Use in for months and years.',
    [
      'My course begins ___ September.',
      'I moved here ___ 2022.',
      'Her birthday is ___ April.',
    ],
  ],
  [
    'daypart',
    'Parts of the day',
    'IN',
    'Think about a general part of the day.',
    'Use in the morning / afternoon / evening. A specific day changes the pattern: on Monday morning.',
    [
      'I usually study ___ the morning.',
      'We often walk ___ the evening.',
      'The library is quiet ___ the afternoon.',
    ],
  ],
  [
    'city',
    'Cities and countries',
    'IN',
    'Think of a place within a larger area.',
    'Use in for cities and countries.',
    [
      'We live ___ Prague.',
      'She works ___ Germany.',
      'They arrived ___ Brno yesterday.',
    ],
  ],
  [
    'inside',
    'Inside buildings and vehicles',
    'IN',
    'The sentence emphasizes being inside an enclosed space.',
    'Use in for the inside of a room/building, and for cars or taxis.',
    [
      'The keys are ___ the car.',
      'Her bag is ___ the classroom.',
      'There are three passengers ___ the taxi.',
    ],
  ],
  [
    'day',
    'Days and dates',
    'ON',
    'Think about a particular day on a calendar.',
    'Use on for days and dates.',
    [
      'The lesson is ___ Monday.',
      'We leave ___ 12 June.',
      'The exam is ___ Friday.',
    ],
  ],
  [
    'specificday',
    'Specific parts of a day',
    'ON',
    'A named day makes this more specific than a general part of the day.',
    'Use on for a specific day, including Monday morning or Friday evening.',
    [
      'We meet ___ Monday morning.',
      'The concert is ___ Friday evening.',
      'I arrived ___ Tuesday afternoon.',
    ],
  ],
  [
    'transport',
    'Public transport',
    'ON',
    'Think about travelling aboard public transport.',
    'Use on a bus / train / plane, but in a car / taxi.',
    [
      'I read ___ the bus.',
      'She is ___ the train to Prague.',
      'We met ___ the plane.',
    ],
  ],
  [
    'surface',
    'Surfaces',
    'ON',
    'Think about contact with a surface.',
    'Use on for something resting on a surface.',
    [
      'The book is ___ the table.',
      'The timetable is ___ the wall.',
      'His phone is ___ the desk.',
    ],
  ],
];
export const concepts: Concept[] = rows.map(
  ([id, title, group, hint, explanation, prompts]) => ({
    id,
    title,
    group,
    exercises: prompts.map((prompt, i) => ({
      id: `${id}-${i}`,
      conceptId: id,
      prompt,
      answer: group.toLowerCase(),
      hint,
      explanation,
    })),
  }),
);
export const exerciseById = (id: string) => {
  const exercise = concepts
    .flatMap((c) => c.exercises)
    .find((e) => e.id === id);
  if (!exercise) throw new Error(`Unknown exercise: ${id}`);
  return exercise;
};
