import type { Concept, Mistake } from '../domain/models';
import { concepts as prepositions } from './prepositions';
import { expandDrills } from './drill-bank';

export interface DrillModule {
  id: string;
  title: string;
  description: string;
  category: Mistake['category'];
  concepts: Concept[];
}
type Variant = string | [prompt: string, answer: string, ...accepted: string[]];
type Rule = [
  id: string,
  title: string,
  target: string,
  hint: string,
  explanation: string,
  variants: Variant[],
];
function module(
  id: string,
  title: string,
  description: string,
  category: Mistake['category'],
  rules: Rule[],
): DrillModule {
  return {
    id,
    title,
    description,
    category,
    concepts: rules.map(([key, label, target, hint, explanation, variants]) => {
      const conceptId = `drill:${id}:${key}`;
      return {
        id: conceptId,
        title: label,
        group: target,
        exercises: variants.map((variant, i) => {
          const [prompt, answer, ...alternatives] =
            typeof variant === 'string' ? [variant, target] : variant;
          return {
            id: `${conceptId}:${i}`,
            conceptId,
            prompt,
            answer,
            acceptedAnswers: [answer, ...alternatives],
            hint,
            explanation,
            productive: true,
            contextId: `${conceptId}:${i}`,
            instruction:
              id === 'articles'
                ? 'Type a, an, the or - for no article.'
                : id === 'present-perfect-past-simple' ||
                    id === 'past-simple-continuous'
                  ? 'Type the complete missing verb form. The verb is in brackets.'
                  : 'Type the missing word or phrase. Follow the sentence meaning.',
          };
        }),
      };
    }),
  };
}

const articles = module(
  'articles',
  'Articles',
  'A, an, the or no article: reference, general meaning and everyday expressions.',
  'article',
  [
    [
      'first-consonant',
      'First mention: a countable item',
      'a',
      'This is one new, non-specific countable item. Check the following sound.',
      'Use a for one non-specific singular countable noun before a consonant sound.',
      [
        'I need ___ notebook; any cheap one will do.',
        'We are looking for ___ technician, not a particular person.',
        'She bought ___ bicycle yesterday; I have not seen it yet.',
      ],
    ],
    [
      'first-vowel',
      'First mention: a vowel sound',
      'an',
      'Listen to the first sound, rather than just the first letter.',
      'Use an before a vowel sound, including the silent h in hour.',
      [
        'Could you lend me ___ umbrella? Any one is fine.',
        'The repair will take about ___ hour.',
        'We need ___ electrician to inspect this wiring.',
      ],
    ],
    [
      'known',
      'A previously introduced item',
      'the',
      'The listener can identify which item you mean.',
      'Use the when an earlier mention identifies the noun.',
      [
        'I bought a notebook. ___ notebook is on my desk.',
        'We found a fault in the cable. ___ fault has now been repaired.',
        'A visitor left a bag here. I put ___ bag behind reception.',
      ],
    ],
    [
      'identified',
      'A clearly identified reference',
      'the',
      'The sentence identifies one particular thing.',
      'Use the for a specific item that both speaker and listener can identify.',
      [
        'Please close ___ door directly behind you.',
        'Can you pass me ___ report that you signed this morning?',
        'I spoke to ___ receptionist who checked us in yesterday.',
      ],
    ],
    [
      'profession-a',
      'Naming a profession',
      'a',
      'A job title is a singular countable noun here.',
      'Use a before a profession beginning with a consonant sound.',
      [
        'My sister is ___ mechanical engineer.',
        'He works as ___ project manager.',
        'After university, she became ___ teacher.',
      ],
    ],
    [
      'profession-an',
      'Professions with vowel sounds',
      'an',
      'A profession still needs an article; listen to its first sound.',
      'Use an before a profession beginning with a vowel sound.',
      [
        'My neighbour is ___ architect.',
        'She qualified as ___ accountant last year.',
        'He works as ___ electrical engineer.',
      ],
    ],
    [
      'plural-general',
      'Plural nouns in general',
      '-',
      'This means the whole category, not one identified group.',
      'General plural nouns normally take no article. Type -.',
      [
        '___ Engineers often work in teams. (Engineers in general.)',
        '___ Buses are useful in large cities. (Buses in general.)',
        '___ Children learn through play. (Children in general.)',
      ],
    ],
    [
      'mass-general',
      'Uncountable nouns in general',
      '-',
      'This is a substance or abstract idea in general.',
      'General uncountable nouns normally take no article. Type -.',
      [
        '___ Water is essential for life. (Water in general.)',
        '___ Information is useful only when it is accurate. (Information in general.)',
        '___ Research takes time. (Research in general.)',
      ],
    ],
    [
      'unique',
      'Unique shared references',
      'the',
      'There is one shared reference in this ordinary context.',
      'Use the for shared unique references such as the sun, the moon and the equator.',
      [
        '___ sun was already setting when we left.',
        'We could see ___ moon clearly last night.',
        'The ship crossed ___ equator yesterday.',
      ],
    ],
    [
      'superlative',
      'Superlatives in a group',
      'the',
      'The comparison identifies one extreme within a group.',
      'A superlative with a following noun normally uses the.',
      [
        'This is ___ most reliable sensor in the catalogue.',
        'She gave ___ clearest explanation in the class.',
        'We chose ___ cheapest suitable ticket available.',
      ],
    ],
    [
      'institution',
      'Institutions used for their usual purpose',
      '-',
      'Focus on the usual activity, not a particular building.',
      'Go to school / university as a learner, and go to bed to sleep, normally have no article.',
      [
        'Our children go to ___ school to study every weekday.',
        'After her final school exams, she went to ___ university to study physics.',
        'I am exhausted; I am going to ___ bed to sleep.',
      ],
    ],
    [
      'fixed',
      'Everyday fixed expressions',
      '-',
      'This is an everyday fixed expression without a determiner.',
      'Have breakfast, travel by train and be at home normally take no article.',
      [
        'I usually have ___ breakfast before seven.',
        'We travelled by ___ train, not by car.',
        'He is at ___ home this afternoon.',
      ],
    ],
  ],
);

const quantifiers = module(
  'quantifiers',
  'Quantifiers',
  'Countable and uncountable quantities, including few/a few and little/a little.',
  'grammar',
  [
    [
      'some-plural',
      'An unspecified positive quantity',
      'some',
      'The Czech cue means an unspecified positive amount, not a large quantity.',
      'Some expresses an unspecified positive quantity. Follow the meaning cue, not just sentence polarity.',
      [
        [
          'We ordered ___ replacement parts. (nějaké náhradní díly)',
          'some',
          'a few',
        ],
        [
          'I have ___ questions about the assignment. (nějaké otázky)',
          'some',
          'a few',
        ],
        [
          'She brought ___ sandwiches for the journey. (nějaké sendviče)',
          'some',
          'a few',
        ],
      ],
    ],
    [
      'some-mass',
      'An unspecified amount of a substance',
      'some',
      'The cue asks for an unspecified amount.',
      'Some works with uncountable nouns as well as plural nouns.',
      [
        [
          'Could I have ___ water, please? (trochu vody; polite request)',
          'some',
          'a little',
        ],
        [
          'We need ___ information about the booking. (nějaké informace)',
          'some',
          'a little',
        ],
        ['Would you like ___ coffee? (nabídka kávy)', 'some', 'a little'],
      ],
    ],
    [
      'any-negative',
      'No amount remaining',
      'any',
      'The negative sentence means not even one or not any at all.',
      'Use any in these negative sentences meaning no amount or no items.',
      [
        'We do not have ___ spare batteries at all. (žádné)',
        'There is not ___ milk left at all. (žádné)',
        'She did not make ___ mistakes at all. (žádné)',
      ],
    ],
    [
      'any-question',
      'Neutral questions about availability',
      'any',
      'This is a neutral question: is there any at all?',
      'Any asks whether an unspecified quantity exists in a neutral question.',
      [
        'Are there ___ seats available at all? (nějaká vůbec)',
        'Do you have ___ evidence at all? (nějaké vůbec)',
        'Is there ___ chance of an earlier appointment at all? (nějaká vůbec)',
      ],
    ],
    [
      'much',
      'A large uncountable amount',
      'much',
      'The noun is uncountable and the cue means a large amount.',
      'Much describes a large amount of an uncountable noun, especially in negatives and questions.',
      [
        'We do not have ___ time before departure. (mnoho času)',
        'How ___ money did the repair cost? (kolik peněz)',
        'There is not ___ space in this suitcase. (mnoho místa)',
      ],
    ],
    [
      'many',
      'A large countable number',
      'many',
      'You can count these items individually.',
      'Many goes with plural countable nouns.',
      [
        'How ___ students submitted the report? (kolik studentů)',
        'There are not ___ trains on Sundays. (mnoho vlaků)',
        'We tested ___ different designs. (mnoho návrhů)',
      ],
    ],
    [
      'few',
      'A disappointingly small number',
      'few',
      'The meaning is negative: almost none, fewer than needed.',
      'Few without a means almost no countable items; the speaker sees the number as insufficient.',
      [
        '___ applicants had the required skills, so we reopened recruitment. (málo, nedostatek)',
        'There were ___ buses, and most passengers could not get home. (málo)',
        'We had ___ reliable measurements, too few to draw a conclusion. (málo)',
      ],
    ],
    [
      'a-few',
      'A small but useful number',
      'a few',
      'The meaning is positive: a small number is available.',
      'A few means some countable items, often enough for the present purpose.',
      [
        'I have ___ minutes, so I can help you now. (pár minut)',
        'We found ___ suitable candidates and invited them. (několik)',
        'She saved ___ seats for our team. (pár míst)',
      ],
    ],
    [
      'little',
      'An insufficient uncountable amount',
      'little',
      'The meaning is negative: almost none of an uncountable thing.',
      'Little without a means almost no uncountable quantity, often less than needed.',
      [
        'There is ___ hope of repairing it; we should replace it. (málo naděje)',
        'We made ___ progress despite weeks of work. (málo pokroku)',
        'He had ___ experience and could not do the job alone. (málo zkušeností)',
      ],
    ],
    [
      'a-little',
      'A small but useful amount',
      'a little',
      'The meaning is positive: some amount is available.',
      'A little means a small amount of an uncountable thing, enough to be useful.',
      [
        'There is ___ time left, enough to check one answer. (trochu času)',
        'Add ___ oil, just enough to cover the pan. (trochu oleje)',
        'I have ___ experience, so I can show you the basics. (trochu zkušeností)',
      ],
    ],
  ],
);

const collocations = module(
  'do-make-take-have',
  'DO / MAKE / TAKE / HAVE',
  'Useful collocations for daily life, university and work.',
  'collocation',
  [
    [
      'decision',
      'Decisions',
      'make',
      'Think of forming a choice, not carrying out a task.',
      'The usual collocation is make a decision.',
      [
        'We need to ___ a decision before Friday.',
        'Please ___ a decision about the supplier today.',
        'I cannot ___ a decision without the test results.',
      ],
    ],
    [
      'mistake',
      'Errors',
      'make',
      'An error is produced, rather than performed as a task.',
      'Use make a mistake.',
      [
        'Try not to ___ the same mistake twice.',
        'It is easy to ___ a mistake with these units.',
        'Check the address so you do not ___ a mistake.',
      ],
    ],
    [
      'progress',
      'Advancing the work',
      'make',
      'Think of achieving movement towards a goal.',
      'Use make progress; progress is uncountable.',
      [
        'We hope to ___ progress on the prototype today.',
        'Regular practice helps you ___ progress.',
        'We cannot ___ much progress without the missing data.',
      ],
    ],
    [
      'homework',
      'Study tasks',
      'do',
      'This is carrying out an assigned task.',
      'Use do homework, without a before homework.',
      [
        'I usually ___ my homework after dinner.',
        'Can you ___ your homework before the trip?',
        'The students ___ their homework in the library.',
      ],
    ],
    [
      'research',
      'Investigating a question',
      'do',
      'Think of carrying out investigative work.',
      'Do research is a common collocation; conduct research is a more formal alternative outside this drill.',
      [
        'We need to ___ more research before choosing a material.',
        'They ___ research into battery life.',
        'I want to ___ some research for my final project.',
      ],
    ],
    [
      'best',
      'Maximum effort',
      'do',
      'This fixed expression refers to making your best effort.',
      'Use do your best.',
      [
        'Please ___ your best, even if the task is unfamiliar.',
        'We will ___ our best to meet the deadline.',
        'I always try to ___ my best in presentations.',
      ],
    ],
    [
      'shower',
      'Washing routines',
      'take',
      'More than one of these verbs is natural in British English.',
      'Take a shower and have a shower are both natural.',
      [
        ['I want to ___ a shower after the journey.', 'take', 'have'],
        ['You can ___ a shower before breakfast.', 'take', 'have'],
        ['I usually ___ a shower after work.', 'take', 'have'],
      ],
    ],
    [
      'break',
      'Pausing work',
      'take',
      'Think of pausing; a British alternative is also accepted.',
      'Take a break and have a break are both natural.',
      [
        ['Let us ___ a break before the next test.', 'take', 'have'],
        ['We should ___ a short break now.', 'take', 'have'],
        ['You can ___ a break once the machine is safe.', 'take', 'have'],
      ],
    ],
    [
      'responsibility',
      'Accepting responsibility',
      'take',
      'The speaker actively accepts responsibility.',
      'Use take responsibility for something.',
      [
        'Will you ___ responsibility for the final checks?',
        'Someone must ___ responsibility for this decision.',
        'I am ready to ___ responsibility for the team.',
      ],
    ],
    [
      'meeting',
      'Meeting arrangements',
      'have',
      'Think of an arranged event on your calendar.',
      'Use have a meeting when describing an arranged event.',
      [
        'We ___ a meeting with the supervisor every Monday.',
        'I ___ a meeting at ten, so I cannot join you.',
        'Do you ___ a meeting with the client this afternoon?',
      ],
    ],
    [
      'experience',
      'Relevant experience',
      'have',
      'This describes possessing relevant knowledge from past work.',
      'Use have experience in or with something.',
      [
        'Do you ___ experience with this software?',
        'They ___ experience in quality control.',
        'I ___ experience of working in a busy reception.',
      ],
    ],
    [
      'problem',
      'A difficulty to resolve',
      'have',
      'This describes experiencing a difficulty.',
      'Use have a problem.',
      [
        'We ___ a problem with the cooling system.',
        'Do you ___ a problem with the booking?',
        'I ___ a problem opening the file.',
      ],
    ],
  ],
);

const speech = module(
  'say-tell-speak-talk',
  'SAY / TELL / SPEAK / TALK',
  'Messages, listeners, languages and conversations.',
  'collocation',
  [
    [
      'say-words',
      'Reporting spoken words',
      'say',
      'The object is the message, not a person.',
      'Say introduces words or a message without a person as its direct object.',
      [
        'What did the technician ___ about the fault?',
        'Please ___ something if the instructions are unclear.',
        'I did not hear what you wanted to ___.',
      ],
    ],
    [
      'say-that',
      'Reporting a statement',
      'say',
      'There is no person between the verb and that.',
      'Use say that when reporting a statement without a direct listener object.',
      [
        'Did she ___ that the room was ready?',
        'They did not ___ that the deadline had changed.',
        'What did he ___ that made everyone laugh?',
      ],
    ],
    [
      'tell-person',
      'Giving someone information',
      'tell',
      'The verb is followed directly by the listener.',
      'Tell takes a person as a direct object: tell someone something.',
      [
        'Please ___ me your booking number.',
        'Can you ___ us the results?',
        'Do not ___ the customer the wrong price.',
      ],
    ],
    [
      'tell-that',
      'Reporting a statement to someone',
      'tell',
      'A person appears directly before the that clause.',
      'Use tell someone that; say needs to before a person.',
      [
        'Please ___ the teacher that I will be late.',
        'Did you ___ her that the gate had changed?',
        'We must ___ the team that the test failed.',
      ],
    ],
    [
      'language',
      'Language ability',
      'speak',
      'This refers to ability in a named language.',
      'Use speak with a language name when describing language ability.',
      [
        'Can you ___ English?',
        'They ___ Czech at home.',
        'I need someone who can ___ German.',
      ],
    ],
    [
      'conversation-to',
      'Talking to a person',
      'talk',
      'Two common verbs can describe a conversation here.',
      'Talk to and speak to are both natural for a conversation.',
      [
        ['Can I ___ to the receptionist?', 'talk', 'speak'],
        ['I need to ___ to my supervisor.', 'talk', 'speak'],
        ['Please ___ to a member of staff.', 'talk', 'speak'],
      ],
    ],
    [
      'topic',
      'Discussing a topic',
      'talk',
      'The next word introduces the topic of a conversation.',
      'Talk about and speak about can both introduce a topic.',
      [
        ['We should ___ about the schedule.', 'talk', 'speak'],
        ['Can we ___ about your assignment?', 'talk', 'speak'],
        ['They want to ___ about the design changes.', 'talk', 'speak'],
      ],
    ],
    [
      'tell-truth',
      'Truth and stories',
      'tell',
      'This is a fixed expression with an object.',
      'Use tell the truth, tell a story and tell a lie.',
      [
        'Please ___ the truth about what happened.',
        'Could you ___ us a story about your first job?',
        'I would never ___ a lie in a safety report.',
      ],
    ],
    [
      'say-to',
      'Addressing a message to someone',
      'say',
      'Notice the preposition before the listener.',
      'Say something to someone, but tell someone something.',
      [
        'What did you ___ to the driver?',
        'What should I ___ to the examiner?',
        'Did you ___ anything to the receptionist?',
      ],
    ],
    [
      'tell-instruction',
      'Giving an instruction',
      'tell',
      'The listener is followed by a to-infinitive.',
      'Use tell someone to do something.',
      [
        'Please ___ him to wait outside.',
        'Can you ___ the students to check their email?',
        'Did you ___ the supplier to send a replacement?',
      ],
    ],
  ],
);

const sinceForAgo = module(
  'since-for-ago',
  'SINCE / FOR / AGO',
  'Starting points, durations and completed past references.',
  'grammar',
  [
    [
      'since-year',
      'A starting year',
      'since',
      'The year is a starting point, not a duration.',
      'Since marks the beginning of a period continuing to the reference time.',
      [
        'I have lived here ___ 2020.',
        'She has worked at the factory ___ 2019.',
        'We have used this software ___ 2023.',
      ],
    ],
    [
      'since-day',
      'A starting day',
      'since',
      'This names the beginning of the period.',
      'Use since before a named starting day or date.',
      [
        'The machine has been out of service ___ Monday.',
        'I have not seen him ___ 12 June.',
        'The office has been closed ___ Friday.',
      ],
    ],
    [
      'since-event',
      'An event as the starting point',
      'since',
      'The clause names the event when the period began.',
      'Since can introduce a past event that starts a continuing period.',
      [
        'I have known her ___ we started university.',
        'The error has appeared regularly ___ we installed the update.',
        'He has felt better ___ he changed his routine.',
      ],
    ],
    [
      'since-time',
      'A starting clock time',
      'since',
      'This is a point on the clock, not elapsed time.',
      'Use since before a clock time when the period continues up to now.',
      [
        'We have been waiting ___ nine o’clock.',
        'The system has been offline ___ noon.',
        'I have been working on this ___ 7:30.',
      ],
    ],
    [
      'for-years',
      'A duration in years',
      'for',
      'This is the length of the period.',
      'For marks duration, including periods continuing up to now.',
      [
        'I have lived here ___ six years.',
        'She has studied engineering ___ three years.',
        'We have known each other ___ a decade.',
      ],
    ],
    [
      'for-short',
      'Short durations',
      'for',
      'The quantity tells you how long.',
      'Use for with a duration, not since.',
      [
        'We have been waiting ___ twenty minutes.',
        'The pump has been running ___ two hours.',
        'I have had this headache ___ three days.',
      ],
    ],
    [
      'for-finished',
      'A finished duration',
      'for',
      'A duration can also describe a completed past period.',
      'For describes how long, even with past simple when the period is finished.',
      [
        'I worked there ___ two years before I moved away.',
        'We stayed in Brno ___ three nights last week.',
        'The power was off ___ half an hour yesterday.',
      ],
    ],
    [
      'ago-short',
      'Counting back from now',
      'ago',
      'The phrase comes after the amount of elapsed time.',
      'Ago follows a duration and locates a completed event before now, usually with past simple.',
      [
        'The train left ten minutes ___.',
        'I sent the email an hour ___.',
        'The alarm stopped a few seconds ___.',
      ],
    ],
    [
      'ago-long',
      'A completed event further back',
      'ago',
      'This tells you when a completed event happened.',
      'Use duration + ago with a finished past event.',
      [
        'We moved here five years ___.',
        'She graduated two months ___.',
        'They replaced the motor three weeks ___.',
      ],
    ],
    [
      'since-expressions',
      'Named starting moments',
      'since',
      'The following expression identifies one starting moment.',
      'Since then, since yesterday and since last week identify starting points.',
      [
        'We have not had a failure ___ then.',
        'The road has been closed ___ yesterday.',
        'I have had no reply ___ last week.',
      ],
    ],
  ],
);

const perfectPast = module(
  'present-perfect-past-simple',
  'Present Perfect vs Past Simple',
  'Experience, unfinished periods and events at finished past times.',
  'tense',
  [
    [
      'experience',
      'Life experience without a finished time',
      'present-perfect',
      'The question concerns experience up to now, without a finished past time.',
      'Use present perfect for life experience up to now when no finished time is specified.',
      [
        ['I ___ (visit) Vienna twice in my life so far.', 'have visited'],
        [
          'She ___ (work) with several robot brands in her career so far.',
          'has worked',
        ],
        ['We ___ (see) this fault before, so we recognise it.', 'have seen'],
      ],
    ],
    [
      'never',
      'Experience with never',
      'present-perfect',
      'The period extends over the person’s life up to now.',
      'Use have/has + past participle for experience up to now; place never between them.',
      [
        ['I ___ (never / fly) in a helicopter in my life.', 'have never flown'],
        [
          'He ___ (never / use) this machine in his career so far.',
          'has never used',
        ],
        [
          'We ___ (never / meet) the new manager before today.',
          'have never met',
        ],
      ],
    ],
    [
      'ever',
      'Questions about experience',
      'present-perfect',
      'This asks about any experience up to now; include the auxiliary.',
      'Questions use have/has + subject + ever + past participle.',
      [
        [
          '___ (you / ever / attend) an international conference in your life?',
          'Have you ever attended',
        ],
        [
          '___ (she / ever / drive) a manual car in her life?',
          'Has she ever driven',
        ],
        [
          '___ (they / ever / build) a prototype like this before?',
          'Have they ever built',
        ],
      ],
    ],
    [
      'unfinished',
      'An unfinished period up to now',
      'present-perfect',
      'The sentence explicitly says the period is still continuing.',
      'Present perfect with so far connects completed actions to an unfinished period.',
      [
        [
          'We ___ (complete) three tests so far this morning; it is still morning.',
          'have completed',
        ],
        [
          'She ___ (write) two reports so far this week; it is only Tuesday.',
          'has written',
        ],
        [
          'I ___ (read) five chapters so far today; I am still studying.',
          'have read',
        ],
      ],
    ],
    [
      'recent',
      'A recent event with a present result',
      'present-perfect',
      'Use the standard British-English present-perfect pattern for this current result.',
      'Present perfect connects a recent event to a present result. Some varieties also use past simple; both are accepted here.',
      [
        [
          'I ___ (lose) my pass, so I cannot get into the building now.',
          'have lost',
          'lost',
        ],
        [
          'The pump ___ (stop), so there is no flow now.',
          'has stopped',
          'stopped',
        ],
        [
          'She ___ (break) her glasses, so she cannot read this now.',
          'has broken',
          'broke',
        ],
      ],
    ],
    [
      'already-just',
      'Already and just',
      'present-perfect',
      'Include the adverb inside the complete verb phrase.',
      'Present perfect is common with already and just in British English; past simple is also natural in other varieties.',
      [
        [
          'We ___ (already / book) the room, so we do not need another reservation.',
          'have already booked',
          'already booked',
        ],
        [
          'She ___ (just / send) the file; check your inbox now.',
          'has just sent',
          'just sent',
        ],
        [
          'I ___ (already / finish) the calculation; here is the result.',
          'have already finished',
          'already finished',
        ],
      ],
    ],
    [
      'yet',
      'Not completed up to now',
      'present-perfect',
      'The task remains incomplete now; include the negative auxiliary.',
      'Have/has not + past participle + yet describes an action not completed up to now. Past-simple alternatives are accepted too.',
      [
        [
          'I ___ (not / receive) a reply yet.',
          'have not received',
          "haven't received",
          'did not receive',
          "didn't receive",
        ],
        [
          'She ___ (not / submit) her assignment yet.',
          'has not submitted',
          "hasn't submitted",
          'did not submit',
          "didn't submit",
        ],
        [
          'They ___ (not / decide) which supplier to use yet.',
          'have not decided',
          "haven't decided",
          'did not decide',
          "didn't decide",
        ],
      ],
    ],
    [
      'yesterday',
      'A specific finished past time',
      'past-simple',
      'The time expression places the event in a finished past period.',
      'Use past simple with yesterday, last week and other finished past times.',
      [
        ['I ___ (send) the application yesterday.', 'sent'],
        ['She ___ (meet) the client last Friday.', 'met'],
        ['We ___ (test) the new sensor last week.', 'tested'],
      ],
    ],
    [
      'dated',
      'A dated completed event',
      'past-simple',
      'An explicit past date locates the completed event.',
      'Use past simple for a completed event at a specified past time.',
      [
        ['He ___ (graduate) in 2021.', 'graduated'],
        ['They ___ (open) this production line in 2018.', 'opened'],
        ['I ___ (buy) this laptop two years ago.', 'bought'],
      ],
    ],
    [
      'finished-period',
      'A period that has ended',
      'past-simple',
      'The sentence explicitly closes the period.',
      'Use past simple when the relevant period is finished, even if the day itself continues.',
      [
        [
          'I ___ (answer) six emails this morning; it is now evening.',
          'answered',
        ],
        [
          'She ___ (work) in reception during her holiday job in 2022.',
          'worked',
        ],
        ['We ___ (run) four trials during yesterday’s session.', 'ran'],
      ],
    ],
  ],
);

const narrative = module(
  'past-simple-continuous',
  'Past Simple vs Past Continuous',
  'Completed events, background actions, interruptions and practical storytelling.',
  'tense',
  [
    [
      'complete',
      'One completed event',
      'past-simple',
      'This presents a completed event, not an action in progress.',
      'Past simple presents the event as a whole.',
      [
        ['The technician ___ (replace) the fuse and left.', 'replaced'],
        ['I ___ (send) the final report at five and went home.', 'sent'],
        [
          'She ___ (unlock) the office, then switched on the lights.',
          'unlocked',
        ],
      ],
    ],
    [
      'background-i',
      'An action already in progress',
      'past-continuous',
      'The action was already in progress at the stated moment.',
      'Use was + -ing for an action in progress with I/he/she/it.',
      [
        [
          'At 8:15, I ___ (wait) for the bus; I was still there at 8:30.',
          'was waiting',
        ],
        [
          'At that moment, she ___ (write) her report; she had not finished it.',
          'was writing',
        ],
        [
          'At noon, he ___ (repair) the pump; the repair continued until two.',
          'was repairing',
        ],
      ],
    ],
    [
      'background-we',
      'An ongoing group activity',
      'past-continuous',
      'The activity was continuing at that moment; check subject agreement.',
      'Use were + -ing with we/you/they for an action already in progress.',
      [
        [
          'At ten, we ___ (discuss) the fault; the discussion was still in progress.',
          'were discussing',
        ],
        [
          'At midnight, they ___ (drive) through Austria; they were still on the road.',
          'were driving',
        ],
        [
          'At the time of the inspection, you ___ (test) the brakes; the test was ongoing.',
          'were testing',
        ],
      ],
    ],
    [
      'interruption-long',
      'The longer interrupted action',
      'past-continuous',
      'Fill the background action that was in progress when the shorter event happened.',
      'Past continuous describes the ongoing background; past simple marks the interruption.',
      [
        ['I ___ (cook) dinner when the power suddenly failed.', 'was cooking'],
        [
          'She ___ (present) the results when the alarm rang.',
          'was presenting',
        ],
        [
          'We ___ (cross) the square when it suddenly started to rain.',
          'were crossing',
        ],
      ],
    ],
    [
      'interruption-event',
      'The event that interrupts',
      'past-simple',
      'Fill the short event that interrupts the background action.',
      'Use past simple for the interrupting event.',
      [
        [
          'We were checking the wiring when the lights suddenly ___ (go) out.',
          'went',
        ],
        [
          'I was carrying the tray when I suddenly ___ (drop) a cup.',
          'dropped',
        ],
        ['She was reading when the phone suddenly ___ (ring).', 'rang'],
      ],
    ],
    [
      'parallel-one',
      'Two simultaneous ongoing actions',
      'past-continuous',
      'Both activities were in progress at the same time.',
      'Past continuous can describe two simultaneous activities, often joined by while.',
      [
        [
          'While I was recording the readings, she ___ (adjust) the settings; both tasks were ongoing.',
          'was adjusting',
        ],
        [
          'While he was drawing the layout, I ___ (calculate) the load; both tasks were ongoing.',
          'was calculating',
        ],
        [
          'While we were waiting, the guide ___ (explain) the route; both activities were in progress.',
          'was explaining',
        ],
      ],
    ],
    [
      'parallel-many',
      'Parallel group activities',
      'past-continuous',
      'The two groups were doing ongoing activities simultaneously.',
      'Use were + -ing for an ongoing plural-subject action.',
      [
        [
          'While I was giving the talk, they ___ (take) notes continuously.',
          'were taking',
        ],
        [
          'While the engineers were testing, we ___ (monitor) the temperature continuously.',
          'were monitoring',
        ],
        [
          'While she was serving customers, her colleagues ___ (prepare) orders continuously.',
          'were preparing',
        ],
      ],
    ],
    [
      'story-sequence',
      'A sequence of finished events',
      'past-simple',
      'Each action is one step in a completed sequence.',
      'Past simple moves a story forward through successive events.',
      [
        [
          'I opened the box, ___ (check) the contents and signed the form.',
          'checked',
        ],
        [
          'She read the message, ___ (call) reception and cancelled the booking.',
          'called',
        ],
        [
          'We stopped the machine, ___ (remove) the guard and inspected the belt.',
          'removed',
        ],
      ],
    ],
    [
      'story-scene',
      'Setting the scene',
      'past-continuous',
      'This describes the ongoing scene behind the main event.',
      'Past continuous sets a scene around a completed main event.',
      [
        [
          'Rain ___ (fall) steadily as I stepped out of the station.',
          'was falling',
        ],
        [
          'People ___ (queue) outside when we arrived; the queue was still moving slowly.',
          'were queuing',
          'were queueing',
        ],
        [
          'The fans ___ (run) continuously when the supervisor entered.',
          'were running',
        ],
      ],
    ],
    [
      'finished-count',
      'A counted completed result',
      'past-simple',
      'A finished quantity or complete result is specified.',
      'Past simple describes a completed counted result rather than an unfinished background activity.',
      [
        [
          'During yesterday’s shift, we ___ (produce) exactly 200 parts in total.',
          'produced',
        ],
        ['She ___ (read) the whole report yesterday and returned it.', 'read'],
        [
          'They ___ (build) the complete rig last month and handed it over.',
          'built',
        ],
      ],
    ],
  ],
);

const demonstratives = module(
  'this-that-these-those',
  'THIS / THAT / THESE / THOSE',
  'Near and far references, singular and plural, in real conversations.',
  'grammar',
  [
    [
      'near-item',
      'One item close to the speaker',
      'this',
      'The speaker is holding one item.',
      'Use this for a singular thing near the speaker.',
      [
        '___ cable in my hand is damaged.',
        'Can you read ___ label I am holding?',
        '___ cup here in my hand is yours.',
      ],
    ],
    [
      'far-item',
      'One item away from the speaker',
      'that',
      'The speaker points to one item in the distance.',
      'Use that for a singular thing farther from the speaker.',
      [
        '___ tower over there is the control centre.',
        'Can you see ___ sign across the street?',
        '___ bag at the far end of the hall is mine.',
      ],
    ],
    [
      'near-items',
      'Several items close to the speaker',
      'these',
      'There is more than one item, close to the speaker.',
      'Use these for plural things near the speaker.',
      [
        '___ screws here in my hand are too short.',
        'Please check ___ readings on the sheet I am holding.',
        '___ keys here in my palm belong to reception.',
      ],
    ],
    [
      'far-items',
      'Several items away from the speaker',
      'those',
      'The speaker points to more than one distant item.',
      'Use those for plural things farther from the speaker.',
      [
        '___ buses across the car park are ours.',
        'Can you see ___ lights on the distant hill?',
        '___ boxes at the far end of the warehouse are empty.',
      ],
    ],
    [
      'near-person',
      'Introducing someone beside you',
      'this',
      'You are introducing one person standing next to you.',
      'This is is commonly used to introduce a person beside the speaker.',
      [
        '___ is Eva, standing beside me; she is our new technician.',
        '___ is my tutor here next to me.',
        '___ is Pavel, my colleague standing here with me.',
      ],
    ],
    [
      'near-people',
      'Introducing a group beside you',
      'these',
      'You are introducing several people next to you.',
      'Use these are to introduce a nearby group.',
      [
        '___ are my teammates standing here beside me.',
        '___ are our visitors here with me at the desk.',
        '___ are the two students next to me.',
      ],
    ],
    [
      'far-people',
      'Identifying a distant group',
      'those',
      'The people are plural and physically farther away.',
      'Use those are for a group farther from the speaker.',
      [
        '___ are the engineers over there beside the crane.',
        '___ are our guests at the far end of the platform.',
        '___ are the lecturers across the courtyard.',
      ],
    ],
    [
      'current-reference',
      'The current time period',
      'this',
      'The named time period includes now.',
      'This week/month/year refers to the current period.',
      [
        'I am busy ___ week; I mean the week we are in now.',
        '___ month is almost over; today is the 28th.',
        'We plan to graduate ___ year, the current calendar year.',
      ],
    ],
    [
      'past-reference',
      'A previously mentioned past occasion',
      'that',
      'The speaker refers back to one specific past occasion.',
      'That can refer back to a previously identified occasion at a distance in time.',
      [
        'Our flight was cancelled last Friday. ___ day was exhausting.',
        'I remember the interview in 2020. ___ morning changed my plans.',
        'We tested the old prototype in June 2019. ___ test revealed a serious fault.',
      ],
    ],
    [
      'near-pages',
      'Several items directly in front of you',
      'these',
      'The plural items are here in front of the speaker.',
      'These refers to several things close to the speaker in the present situation.',
      [
        '___ two diagrams here on my screen show the new design.',
        '___ forms here in front of me need a signature.',
        '___ examples here on this page use technical vocabulary.',
      ],
    ],
  ],
);

const relatives = module(
  'who-which-that',
  'WHO / WHICH / THAT',
  'Practical defining relative clauses; valid alternatives are accepted.',
  'grammar',
  [
    [
      'people-subject',
      'A person doing an action',
      'people',
      'The relative word refers to a person and is the subject of the clause.',
      'Who or that can introduce a defining clause about a person.',
      [
        ['The engineer ___ designed this rig works in Brno.', 'who', 'that'],
        ['We need someone ___ understands the control system.', 'who', 'that'],
        ['The student ___ won the award is in my class.', 'who', 'that'],
      ],
    ],
    [
      'people-service',
      'Identifying a person by their role',
      'people',
      'The antecedent is a person; this is a defining clause.',
      'Who and that are both accepted for people in these defining clauses.',
      [
        ['The receptionist ___ checked us in was very helpful.', 'who', 'that'],
        ['The teacher ___ runs this course is away today.', 'who', 'that'],
        ['The driver ___ brought us here is waiting outside.', 'who', 'that'],
      ],
    ],
    [
      'people-plural',
      'Defining a group of people',
      'people',
      'The plural noun names people, not things.',
      'Who or that can define a group of people.',
      [
        ['People ___ work here must wear safety shoes.', 'who', 'that'],
        [
          'Students ___ need extra time should contact the office.',
          'who',
          'that',
        ],
        [
          'Technicians ___ maintain this equipment need training.',
          'who',
          'that',
        ],
      ],
    ],
    [
      'people-object',
      'A person as the object of a clause',
      'people',
      'The person is the object; who, whom or that can be used.',
      'Who, whom and that are accepted as object relatives here. In free writing the relative can also be omitted; this drill asks for a word.',
      [
        ['The colleague ___ I called is on holiday.', 'who', 'whom', 'that'],
        [
          'The tutor ___ we met yesterday teaches mechanics.',
          'who',
          'whom',
          'that',
        ],
        [
          'The manager ___ she recommended has accepted the role.',
          'who',
          'whom',
          'that',
        ],
      ],
    ],
    [
      'things-subject',
      'A thing doing an action',
      'things',
      'The relative word refers to a thing, not a person.',
      'Which or that can introduce a defining clause about a thing.',
      [
        ['The sensor ___ measures pressure is faulty.', 'which', 'that'],
        ['I need a cable ___ fits this socket.', 'which', 'that'],
        ['The bus ___ stops here goes to the university.', 'which', 'that'],
      ],
    ],
    [
      'things-object',
      'Identifying a thing as an object',
      'things',
      'This is a defining clause about an object.',
      'Which and that are both accepted; object relatives can also be omitted in free writing.',
      [
        ['The report ___ you sent is complete.', 'which', 'that'],
        ['The tool ___ I borrowed is on your desk.', 'which', 'that'],
        ['The ticket ___ she bought is valid all day.', 'which', 'that'],
      ],
    ],
    [
      'things-plural',
      'Defining several things',
      'things',
      'The plural antecedent names things.',
      'Which or that can define plural things.',
      [
        ['The files ___ contain the results are encrypted.', 'which', 'that'],
        ['The parts ___ failed inspection are marked red.', 'which', 'that'],
        [
          'The courses ___ include laboratory work are popular.',
          'which',
          'that',
        ],
      ],
    ],
    [
      'all',
      'A clause after all',
      'that',
      'All is used as a pronoun here, followed by a defining clause.',
      'Use that after pronoun all in these defining clauses.',
      [
        'All ___ remains is the final inspection.',
        'All ___ matters now is everyone’s safety.',
        'All ___ was missing was a signature.',
      ],
    ],
    [
      'everything',
      'A clause after everything',
      'that',
      'The antecedent is the indefinite pronoun everything.',
      'That is the standard relative after everything in these defining clauses.',
      [
        'Everything ___ happened is in the incident log.',
        'Everything ___ was damaged has been replaced.',
        'Everything ___ is required is listed below.',
      ],
    ],
    [
      'superlative',
      'Defining a thing after a superlative',
      'things',
      'This defines a thing after a superlative; two relatives are possible.',
      'That is common after superlatives; which is also grammatical in these defining clauses.',
      [
        [
          'This is the best solution ___ meets every requirement.',
          'that',
          'which',
        ],
        [
          'It is the cheapest device ___ supports this protocol.',
          'that',
          'which',
        ],
        ['This is the smallest motor ___ can drive the load.', 'that', 'which'],
      ],
    ],
  ],
);

const commonPrepositions = module(
  'common-prepositions',
  'Common Prepositions',
  'TO / FOR / WITH / ABOUT in high-frequency phrases.',
  'preposition',
  [
    [
      'recipient',
      'The recipient of a message',
      'to',
      'The preposition marks the person receiving something.',
      'Send/give something to someone.',
      [
        'Please send the report ___ my supervisor.',
        'Give the key ___ the receptionist.',
        'I emailed the drawing ___ the supplier.',
      ],
    ],
    [
      'destination',
      'Movement towards a destination',
      'to',
      'This marks a destination, not the person benefiting.',
      'Go/travel/return to a named destination.',
      [
        'We are travelling ___ Vienna tomorrow.',
        'She returned ___ the laboratory after lunch.',
        'Please go ___ reception first.',
      ],
    ],
    [
      'response',
      'A response directed towards something',
      'to',
      'This is the fixed pattern for the thing being answered.',
      'Use reply/respond to and an answer to.',
      [
        'Please reply ___ this email by Friday.',
        'How should we respond ___ the complaint?',
        'We need an answer ___ this question.',
      ],
    ],
    [
      'beneficiary',
      'The intended user or beneficiary',
      'for',
      'This means intended for someone’s use or benefit.',
      'Use for to identify the intended recipient or beneficiary of a prepared item.',
      [
        'This seat is reserved ___ wheelchair users.',
        'I bought this adapter ___ my sister to use.',
        'We prepared a guide ___ new students.',
      ],
    ],
    [
      'purpose',
      'What something is used for',
      'for',
      'The following phrase gives the intended use.',
      'Use for + noun or -ing to describe purpose.',
      [
        'This tool is used ___ cutting cables.',
        'We need a room ___ the interview.',
        'These gloves are designed ___ handling hot parts.',
      ],
    ],
    [
      'reason',
      'The reason for thanks or an apology',
      'for',
      'This introduces what the thanks or apology concerns.',
      'Use thank someone for and be sorry for an action.',
      [
        'Thank you ___ your help.',
        'I am sorry ___ the delay.',
        'We thanked them ___ checking the results.',
      ],
    ],
    [
      'companion',
      'Being together with someone',
      'with',
      'The person accompanies the subject.',
      'Use with to describe accompaniment.',
      [
        'I am travelling ___ my colleagues.',
        'She shares an office ___ two engineers.',
        'Would you like to come ___ us?',
      ],
    ],
    [
      'tool',
      'An instrument used for a task',
      'with',
      'This identifies the tool used to perform the action.',
      'Use with to name an instrument.',
      [
        'Tighten the bolt ___ a torque wrench.',
        'Measure the gap ___ a feeler gauge.',
        'Clean the surface ___ a soft cloth.',
      ],
    ],
    [
      'feature',
      'A feature that something has',
      'with',
      'The noun phrase identifies an included feature.',
      'Use with to describe possession of an included feature.',
      [
        'We need a room ___ a private bathroom.',
        'Choose a laptop ___ enough memory.',
        'I ordered coffee ___ milk.',
      ],
    ],
    [
      'topic',
      'The subject of information',
      'about',
      'The preposition names the topic, rather than a destination.',
      'Use about for the subject of a conversation or information.',
      [
        'Can you give me information ___ the course?',
        'I have a question ___ the test procedure.',
        'We had a conversation ___ the new timetable.',
      ],
    ],
    [
      'concern',
      'The subject of worry or excitement',
      'about',
      'This identifies what causes the feeling.',
      'Use worried/excited/concerned about a topic.',
      [
        'She is worried ___ the deadline.',
        'We are excited ___ the new project.',
        'He is concerned ___ the measurement error.',
      ],
    ],
    [
      'thinking',
      'Considering a topic',
      'about',
      'The missing word introduces the topic being considered.',
      'Think about, read about and learn about introduce a topic.',
      [
        'I need time to think ___ your proposal.',
        'We read ___ the accident in the local paper.',
        'They want to learn ___ renewable energy.',
      ],
    ],
  ],
);

const verbPrepositions = module(
  'verb-preposition-patterns',
  'Verb + Preposition Patterns',
  'Common fixed patterns for everyday, university and technical English.',
  'preposition',
  [
    [
      'arrive-area',
      'Arriving in a city or country',
      'in',
      'The destination is a city or country, not a point or building.',
      'Use arrive in for cities and countries; never arrive to in this meaning.',
      [
        'We arrived ___ Prague before lunch.',
        'She will arrive ___ Germany tomorrow.',
        'They arrived ___ Brno on Monday.',
      ],
    ],
    [
      'arrive-point',
      'Arriving at a building or point',
      'at',
      'The destination is a point or building.',
      'Use arrive at for a station, airport, office or similar point.',
      [
        'Please arrive ___ the station ten minutes early.',
        'We arrived ___ the factory at eight.',
        'She arrived ___ the airport before dawn.',
      ],
    ],
    [
      'depend',
      'Depending on a condition',
      'on',
      'This verb has a fixed preposition for the condition it relies on.',
      'Use depend on.',
      [
        'The result will depend ___ the temperature.',
        'Our schedule depends ___ the delivery date.',
        'You can depend ___ this team.',
      ],
    ],
    [
      'listen',
      'Listening attentively',
      'to',
      'The verb needs a preposition before the sound or speaker.',
      'Use listen to someone or something.',
      [
        'Please listen ___ the instructions.',
        'I listen ___ podcasts on the bus.',
        'You should listen ___ the safety officer.',
      ],
    ],
    [
      'wait',
      'Waiting for an arrival or result',
      'for',
      'This names what you expect to arrive or happen.',
      'Use wait for someone or something.',
      [
        'We are waiting ___ the test results.',
        'Please wait ___ your supervisor.',
        'I waited ___ the bus in the rain.',
      ],
    ],
    [
      'ask',
      'Requesting something',
      'for',
      'The object is the thing being requested.',
      'Ask for something; ask about something means request information on a topic.',
      [
        'You can ask ___ a refund if the item is faulty.',
        'I need to ask ___ clarification.',
        'She asked ___ a replacement key.',
      ],
    ],
    [
      'belong',
      'Ownership or membership',
      'to',
      'This identifies the owner or group.',
      'Use belong to.',
      [
        'Does this charger belong ___ you?',
        'These drawings belong ___ the design team.',
        'The spare keys belong ___ reception.',
      ],
    ],
    [
      'deal',
      'Handling a problem or task',
      'with',
      'This names the matter that needs handling.',
      'Use deal with a problem or situation.',
      [
        'We need to deal ___ the complaint today.',
        'Who will deal ___ the supplier issue?',
        'She deals ___ technical enquiries.',
      ],
    ],
    [
      'agree',
      'Sharing someone’s view',
      'with',
      'The object is the person whose opinion you share.',
      'Use agree with someone. Agree on is used for a decision or shared topic.',
      [
        'I agree ___ you about the risk.',
        'Do you agree ___ the supervisor?',
        'We agree ___ the inspector’s assessment.',
      ],
    ],
    [
      'apologize',
      'Apologizing for an action',
      'for',
      'The object names the action or problem being apologized for.',
      'Use apologize for an action; apologize to identifies the person.',
      [
        'I apologize ___ sending the wrong file.',
        'We should apologize ___ the delay.',
        'He apologized ___ interrupting the meeting.',
      ],
    ],
    [
      'apply',
      'Applying for an opportunity',
      'for',
      'The object is the position or funding requested.',
      'Use apply for a job, grant or position; apply to identifies the receiving institution.',
      [
        'She plans to apply ___ a research grant.',
        'I want to apply ___ this engineering position.',
        'They applied ___ funding for the prototype.',
      ],
    ],
    [
      'focus',
      'Directing attention',
      'on',
      'This identifies the target of your attention.',
      'Use focus on.',
      [
        'Let us focus ___ the main fault first.',
        'The course focuses ___ practical communication.',
        'Please focus ___ the measurement uncertainty.',
      ],
    ],
  ],
);

export const drills: DrillModule[] = expandDrills([
  {
    id: 'in-on-at',
    title: 'IN / ON / AT',
    description:
      'Time, place, buildings and transport: the original reflex drill.',
    category: 'preposition',
    concepts: prepositions,
  },
  articles,
  quantifiers,
  collocations,
  speech,
  sinceForAgo,
  perfectPast,
  narrative,
  demonstratives,
  relatives,
  commonPrepositions,
  verbPrepositions,
]);
export const drillById = (id: string) =>
  drills.find((drill) => drill.id === id);
export const drillForConcept = (id: string) =>
  drills.find((drill) => drill.concepts.some((concept) => concept.id === id));
export const grammarConcepts = drills.flatMap((drill) => drill.concepts);
