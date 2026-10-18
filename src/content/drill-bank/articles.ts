import { b1, b2, c1, prefix, bankConcept } from './types';
export const articleAdditions = prefix('articles', {
  'first-consonant': [
    b1('errands', 'Could I have ___ paper bag for these rolls, please?'),
    b2(
      'engineering',
      'We need ___ replacement motor, but any model with the correct rating will do.',
    ),
    c1(
      'university',
      'The brief asks for ___ practical example of feedback, without specifying which application we should choose.',
    ),
    b2(
      'sport',
      'I am looking for ___ training partner who can run on weekday evenings.',
    ),
    b2(
      'household',
      'There is ___ strange noise coming from somewhere behind the fridge.',
    ),
    c1(
      'office',
      'Before committing to a supplier, we should request ___ written estimate that includes installation and disposal.',
    ),
    b2(
      'social',
      'She suggested finding ___ quiet café where we could hear each other.',
    ),
  ],
  'first-vowel': [
    b1('hospitality', 'Would you like ___ extra towel for the swimming pool?'),
    b2(
      'university',
      'Could you give us ___ example of a suitable research question?',
    ),
    c1(
      'engineering',
      'The controller needs ___ independent power source so that a failure in the main circuit cannot disable the alarm.',
    ),
    b2(
      'household',
      'I found ___ unopened packet of rice at the back of the cupboard.',
    ),
    b2(
      'travel',
      'We had to make ___ unexpected stop because someone felt unwell.',
    ),
    c1(
      'office',
      'There is ___ inconsistency between the delivery note and the invoice that we need the supplier to explain.',
    ),
    b2(
      'laboratory',
      'Please record ___ average value rather than choosing a single convenient reading.',
    ),
  ],
  known: [
    b1('household', 'We bought a new lamp. ___ lamp needs a different bulb.'),
    b2(
      'laboratory',
      'A sample arrived without a label. We placed ___ sample in a separate tray.',
    ),
    c1(
      'office',
      'I raised a concern during the briefing. ___ concern has not appeared in the minutes, although we discussed it at length.',
    ),
    b2(
      'travel',
      'They booked a small apartment near the station. ___ apartment has a shared entrance.',
    ),
    b2(
      'sport',
      'Our club hired a coach for the race. ___ coach will wait at the finish.',
    ),
    c1(
      'engineering',
      'The team proposed a modification to the bracket. ___ modification reduces vibration without increasing the assembly weight.',
    ),
    b2(
      'social',
      'A friend lent me a novel. I finished ___ novel on the journey home.',
    ),
  ],
  identified: [
    b2(
      'university',
      'Please upload your work through ___ link in yesterday’s course email.',
    ),
    b2(
      'errands',
      'I would like to collect ___ parcel addressed to me, rather than send a new one.',
    ),
    c1(
      'laboratory',
      'Use ___ reference sample marked with a blue triangle; the others belong to an earlier calibration batch.',
    ),
    b2('household', 'Could you switch off ___ light above the kitchen sink?'),
    b2(
      'hospitality',
      'We would prefer ___ table beside the window, if it is free.',
    ),
    c1(
      'manufacturing',
      'Only ___ procedure approved by the safety officer may be used during this particular changeover.',
    ),
    c1(
      'office',
      'Have you read ___ version of the contract attached to the message, rather than the draft in the shared folder?',
    ),
  ],
  'profession-a': [
    b1('social', 'Her brother works as ___ bus driver in the city.'),
    b2(
      'manufacturing',
      'We are recruiting ___ maintenance technician for the evening shift.',
    ),
    c1(
      'university',
      'After several years in industry, she retrained as ___ physics teacher and brought practical examples into her lessons.',
    ),
    b2(
      'office',
      'I did not realise your neighbour was ___ software developer.',
    ),
    b2(
      'sport',
      'He used to be ___ professional cyclist before he became a coach.',
    ),
    c1(
      'engineering',
      'As ___ control engineer, you need to distinguish a faulty measurement from a genuine change in the process.',
    ),
    b2(
      'hospitality',
      'She started her first summer job as ___ receptionist at a small hotel.',
    ),
  ],
  'profession-an': [
    b2('social', 'Is your cousin still working as ___ interpreter?'),
    b2(
      'manufacturing',
      'We need ___ experienced inspector to review the rejected parts.',
    ),
    c1(
      'office',
      'The dispute was referred to ___ independent adviser who had no previous connection with either company.',
    ),
    b2(
      'university',
      'She hopes to qualify as ___ occupational therapist after this course.',
    ),
    b2(
      'engineering',
      'An electrical fault should be inspected by ___ appropriately qualified electrician.',
    ),
    c1(
      'laboratory',
      'The department appointed ___ external examiner to ensure that the assessment process remained independent.',
    ),
    c1(
      'travel',
      'The group was accompanied by ___ emergency physician because several participants had existing medical conditions.',
    ),
  ],
  'plural-general': [
    b2(
      'engineering',
      '___ Sensors convert physical quantities into signals. (Sensors in general.)',
    ),
    b2(
      'social',
      '___ Good friends can disagree without falling out. (Good friends in general.)',
    ),
    c1(
      'manufacturing',
      '___ Preventive inspections often cost less than unexpected shutdowns. (Preventive inspections in general.)',
    ),
    b2(
      'commuting',
      '___ Trams are usually easier to board with a bicycle than narrow buses. (Trams in general.)',
    ),
    b2(
      'sport',
      '___ Runners need recovery as well as training. (Runners in general.)',
    ),
    c1(
      'university',
      '___ Clear assessment criteria help students understand what independent work is expected. (Criteria in general.)',
    ),
    b2(
      'household',
      '___ Rechargeable batteries should not go in ordinary household waste. (Rechargeable batteries in general.)',
    ),
  ],
  'mass-general': [
    b2(
      'office',
      '___ Experience is useful, but it does not remove the need to check assumptions. (Experience in general.)',
    ),
    b2(
      'household',
      '___ Electricity becomes expensive when an old heater runs all day. (Electricity in general.)',
    ),
    c1(
      'laboratory',
      '___ Precision concerns consistency, whereas accuracy concerns agreement with a reference. (Precision in general.)',
    ),
    b2(
      'sport',
      '___ Regular exercise can fit into a busy week without long gym sessions. (Exercise in general.)',
    ),
    b2(
      'university',
      '___ Feedback is more useful when it arrives before the next assignment. (Feedback in general.)',
    ),
    c1(
      'manufacturing',
      '___ Reliable documentation allows a replacement technician to understand why a setting was changed. (Documentation in general.)',
    ),
    c1(
      'social',
      '___ Trust takes time to build and can be damaged by promises that nobody intended to keep. (Trust in general.)',
    ),
  ],
  unique: [
    b2('travel', 'Clouds hid ___ sun for most of our walk.'),
    b2(
      'university',
      'The lecturer asked how far ___ Earth travels during one orbit of the sun.',
      'the',
      '-',
    ),
    c1(
      'engineering',
      'Positioning equipment relative to ___ equator can affect how a satellite antenna must be aligned.',
    ),
    b2('social', 'A bright ring was visible around ___ moon after sunset.'),
    b2('travel', 'Our route took us across ___ equator for the first time.'),
    c1(
      'laboratory',
      'Radiation from ___ sun can influence outdoor measurements even when the air temperature appears stable.',
    ),
    b2(
      'sport',
      'By the time training ended, ___ sun was already below the stadium roof.',
    ),
  ],
  superlative: [
    b2(
      'errands',
      'Which shop offers ___ best value for a basic replacement kettle?',
    ),
    b2(
      'university',
      'That was ___ most useful comment I received on the draft.',
    ),
    c1(
      'engineering',
      'We selected ___ least complicated solution that still met all the essential safety requirements.',
    ),
    b2(
      'travel',
      'The earliest departure is not necessarily ___ fastest route.',
    ),
    b2('sport', 'She recorded ___ quickest lap of the whole training session.'),
    c1(
      'manufacturing',
      'Rejecting the batch may be ___ safest option until the source of contamination has been established.',
    ),
    c1(
      'office',
      'What is ___ most realistic deadline we can offer without assuming that every delivery will arrive on time?',
    ),
  ],
  institution: [
    b2(
      'household',
      'After the late shift, I went straight to ___ bed to sleep.',
    ),
    b2(
      'university',
      'She decided to go to ___ university rather than start a full-time job.',
    ),
    c1(
      'social',
      'Children who miss several weeks of ___ school may need support when they return to their usual classes. (Education as an activity.)',
    ),
    b2(
      'university',
      'Did you enjoy studying at ___ college before you started your apprenticeship?',
    ),
    b2(
      'household',
      'I should be in ___ bed by now; I need to get up at five. (Resting or sleeping.)',
    ),
    c1(
      'office',
      'He continued working part-time while he was at ___ university, which made the final semester particularly demanding.',
    ),
    b2(
      'social',
      'The children are old enough to walk to ___ school without us. (To attend lessons.)',
    ),
  ],
  fixed: [
    b2(
      'travel',
      'Travelling by ___ air would save time, but the train is much cheaper.',
    ),
    b2(
      'household',
      'I will be at ___ home all morning if the courier needs a signature.',
    ),
    c1(
      'university',
      'We met for ___ lunch to compare our findings before submitting the joint report.',
    ),
    b2(
      'sport',
      'She goes to training on ___ foot whenever the weather allows.',
    ),
    b2('hospitality', 'Will you be joining us for ___ dinner tonight?'),
    c1(
      'office',
      'The forms must be delivered by ___ hand because the originals need to be checked in person.',
    ),
    c1(
      'social',
      'We kept in touch by ___ phone while she was abroad, despite the awkward time difference.',
    ),
  ],
});
export const additionalArticleConcepts = [
  bankConcept(
    'articles',
    'unusual-vowel-sound',
    'Vowel sounds behind spelling and abbreviations',
    'an',
    'Say the following word or abbreviation aloud; its first sound matters.',
    'Use an before a vowel sound, including silent h and letter names such as M, L and X.',
    [
      b1('errands', 'The dentist said I needed ___ X-ray of the tooth.'),
      b2('engineering', 'The panel has ___ LED indicator beside each output.'),
      b2('university', 'She is studying for ___ MSc in renewable energy.'),
      c1(
        'office',
        'We need ___ honest assessment of the remaining risks, even if it makes the proposal less attractive.',
      ),
      b2('social', 'It was ___ honour to be invited to speak at the reunion.'),
      b2(
        'travel',
        'The doctor recommended ___ MRI scan before I planned any more long journeys.',
      ),
      c1(
        'manufacturing',
        'The camera recorded ___ X-ray image of the casting so that internal defects could be assessed without cutting it open.',
      ),
      b2(
        'engineering',
        'We connected ___ LCD screen to display the current setpoint.',
      ),
      c1(
        'university',
        'Her supervisor described the placement as ___ invaluable opportunity to test the assumptions behind the model.',
      ),
      b2(
        'office',
        'Please save the diagram as ___ SVG file so that we can resize it clearly.',
      ),
    ],
  ),
  bankConcept(
    'articles',
    'unusual-consonant-sound',
    'Consonant sounds behind vowel letters',
    'a',
    'Say the following word aloud; a written vowel may begin with a consonant sound.',
    'Use a before the /j/ sound in university, useful and USB, and the /w/ sound in one.',
    [
      b1('university', 'She studies at ___ university near her family’s home.'),
      b2(
        'office',
        'You will need ___ user account before accessing the shared documents.',
      ),
      b2(
        'engineering',
        'The recorder connects through ___ USB adapter rather than a network cable.',
      ),
      c1(
        'manufacturing',
        'This is ___ useful distinction because a repeatable process may still produce parts outside the specified tolerance.',
      ),
      b2('travel', 'The pass includes ___ one-way journey from the airport.'),
      b2(
        'office',
        'We contacted ___ European supplier that could deliver within a week.',
      ),
      c1(
        'university',
        'The placement offered ___ unique opportunity to examine how the theoretical model behaved under actual operating constraints.',
      ),
      b2(
        'hospitality',
        'There is ___ one-time cleaning fee in addition to the room charge.',
      ),
      c1(
        'engineering',
        'The supplier proposed ___ unified interface that would allow the older drives to remain in service during the upgrade.',
      ),
      b2(
        'sport',
        'Every volunteer will receive ___ uniform before the tournament starts.',
      ),
    ],
  ),
];
