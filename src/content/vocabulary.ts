import type {
  Category,
  Lesson,
  Topic,
  VocabularyEntry,
  VocabularySet,
  Skill,
} from '../domain/vocabulary-models';

export const topics: Topic[] = [
  { id: 'study', title: 'University & studying', domain: 'academic' },
  {
    id: 'engineering',
    title: 'Engineering & troubleshooting',
    domain: 'technical',
  },
  { id: 'everyday', title: 'Practical everyday English', domain: 'everyday' },
];
export const skills: Skill[] = [
  {
    id: 'clarification',
    title: 'Clarifying and negotiating',
    description:
      'Check understanding, explain uncertainty and agree on next steps.',
  },
  {
    id: 'problem-solving',
    title: 'Describing problems and solutions',
    description:
      'Explain symptoms, causes, measurements and corrective action.',
  },
];
type SeedRow = [string, string, string, Category, string[], string[], string];
const rows: SeedRow[] = [
  [
    'deadline',
    'deadline',
    'termín odevzdání',
    'academic',
    ['meet a deadline', 'extend the deadline'],
    [
      'We need to meet the deadline for the lab report.',
      'Could we extend the deadline by two days?',
    ],
    'noun',
  ],
  [
    'clarify',
    'clarify',
    'objasnit; upřesnit',
    'academic',
    ['clarify the requirements', 'clarify a point'],
    [
      'Could you clarify the requirements before we submit the report?',
      'Let me clarify a point about the test procedure.',
    ],
    'verb',
  ],
  [
    'feasible',
    'feasible',
    'proveditelný; uskutečnitelný',
    'academic',
    ['a feasible approach', 'technically feasible'],
    [
      'Is this approach feasible before the deadline?',
      'The alternative design is technically feasible.',
    ],
    'adjective',
  ],
  [
    'bearing',
    'bearing',
    'ložisko',
    'technical',
    ['replace the bearing', 'bearing failure', 'excessive bearing play'],
    [
      'The bearing is worn and needs to be replaced.',
      'Excessive bearing play can cause vibration.',
    ],
    'noun',
  ],
  [
    'calibrate',
    'calibrate',
    'kalibrovat',
    'technical',
    ['calibrate a sensor', 'calibrate the instrument'],
    [
      'Calibrate the sensor before taking measurements.',
      'We calibrated the instrument against a known reference.',
    ],
    'verb',
  ],
  [
    'troubleshoot',
    'troubleshoot',
    'hledat a odstraňovat závady',
    'technical',
    ['troubleshoot a circuit', 'troubleshoot a control system'],
    [
      'We need to troubleshoot the circuit before replacing parts.',
      'She troubleshot the control system by checking each signal.',
    ],
    'verb',
  ],
  [
    'spill',
    'spill',
    'rozlít; rozsypat',
    'everyday',
    ['spill some water', 'wipe up a spill'],
    [
      'I spilled some water on the kitchen floor.',
      'Please wipe up the spill before someone slips.',
    ],
    'verb / noun',
  ],
  [
    'refund',
    'refund',
    'vrácení peněz; vrátit peníze',
    'everyday',
    ['request a refund', 'a full refund'],
    [
      'I would like to request a refund for this faulty kettle.',
      'The shop offered a full refund without a receipt.',
    ],
    'noun / verb',
  ],
  [
    'plug-in',
    'plug in',
    'zapojit do zásuvky',
    'everyday',
    ['plug in the charger', 'plug the cable in'],
    [
      'Please plug in the charger beside the desk.',
      'Check the socket before you plug the cable in.',
    ],
    'phrasal verb',
  ],
];
export const vocabularySeed: VocabularyEntry[] = rows.map(
  ([id, english, meaning, category, collocations, examples, partOfSpeech]) => ({
    id: `seed:${id}`,
    english,
    meaning,
    category,
    collocations,
    examples,
    partOfSpeech,
    explanation: `Notice the useful patterns: ${collocations.join('; ')}.`,
    level: category === 'technical' ? 'B2' : 'B1',
    preference: 'active',
    origin: 'curriculum',
    source: 'Reflex English demonstration content',
    notes: '',
    userSentence: '',
    tags: [],
    createdAt: 0,
    updatedAt: 0,
  }),
);
export const vocabularySets: VocabularySet[] = topics.map((topic) => ({
  id: `set:${topic.id}`,
  title: topic.title,
  topicIds: [topic.id],
  members: vocabularySeed
    .filter((e) => e.category === topic.domain)
    .map((e) => ({
      entryId: e.id,
      role: e.partOfSpeech === 'phrasal verb' ? 'phrase' : 'word',
    })),
}));
export const lessons: Lesson[] = [
  {
    id: 'project-deadline',
    title: 'University: Discussing a project deadline',
    level: 'B2',
    topicIds: ['study'],
    vocabularySetIds: ['set:study'],
    skillIds: ['clarification'],
    communicativeGoal:
      'Negotiate a realistic project deadline and clarify the requirements.',
    grammarFocus: ['polite requests', 'questions'],
    controlledExercises: [
      'Recall English from Czech and complete useful collocations.',
    ],
    productiveExercises: ['Explain whether an approach is feasible.'],
    task: {
      prompt:
        'Your lab report may be late. Ask your project partner to clarify the requirements, discuss a feasible approach, and propose a new deadline. Use several of the lesson phrases.',
      reference:
        'Could you clarify the requirements? This approach is feasible, but could we extend the deadline by two days?',
      criteria:
        'Communicate the delay, clarify requirements and propose a feasible next step. Use the target expression naturally.',
    },
  },
  {
    id: 'lab-fault',
    title: 'Engineering: Investigating a machine fault',
    level: 'B2',
    topicIds: ['engineering'],
    vocabularySetIds: ['set:engineering'],
    skillIds: ['problem-solving'],
    communicativeGoal:
      'Report a fault, check measurements and explain a corrective action.',
    grammarFocus: ['cause and effect', 'instructions'],
    controlledExercises: ['Retrieve technical verbs and collocations.'],
    productiveExercises: ['Describe symptoms and explain a test.'],
    task: {
      prompt:
        'A laboratory motor is vibrating and sensor readings are uncertain. Explain the bearing problem, ask a colleague to calibrate the sensor, and propose how to troubleshoot the system.',
      reference:
        'The bearing is worn. Let us calibrate the sensor, then troubleshoot the control system before replacing the bearing.',
      criteria:
        'Describe symptoms, uncertainty and a sensible diagnostic step. Use the target expression with a technical verb or collocation.',
    },
  },
  {
    id: 'everyday-problems',
    title: 'Everyday: Sorting out a small problem',
    level: 'B1',
    topicIds: ['everyday'],
    vocabularySetIds: ['set:everyday'],
    skillIds: ['problem-solving'],
    communicativeGoal:
      'Describe an ordinary problem and ask for practical help.',
    grammarFocus: ['requests', 'past events'],
    controlledExercises: ['Recall everyday actions and phrases.'],
    productiveExercises: ['Explain what happened and request help.'],
    task: {
      prompt:
        'You bought a faulty kettle. Describe the spill it caused, explain that you checked the socket and plugged it in correctly, and request a refund.',
      reference:
        'I plugged in the kettle correctly, but it leaked and I spilled water on the floor. Could I request a refund?',
      criteria:
        'Explain the problem clearly and ask for help. Use the target expression naturally and include another everyday action.',
    },
  },
];
