import { b1, b2, c1, prefix } from './types';
export const perfectPastAdditions = prefix('present-perfect-past-simple', {
  experience: [
    b1(
      'travel',
      'I ___ (stay) in a hostel several times in my life so far.',
      'have stayed',
    ),
    b2(
      'university',
      'Our tutor ___ (supervise) several projects like this during her career so far.',
      'has supervised',
    ),
    c1(
      'engineering',
      'We ___ (encounter) comparable faults before, although none has involved this particular combination of operating conditions.',
      'have encountered',
    ),
    b2(
      'sport',
      'He ___ (complete) two half-marathons in his life so far.',
      'has completed',
    ),
  ],
  never: [
    b2(
      'university',
      'I ___ (never / defend) a project in front of an external examiner in my life.',
      'have never defended',
    ),
    b2(
      'household',
      'She ___ (never / replace) a tap herself before now.',
      'has never replaced',
    ),
    c1(
      'laboratory',
      'We ___ (never / observe) a drift this large during any of our trials to date.',
      'have never observed',
    ),
    c1(
      'office',
      'He ___ (never / negotiate) a contract with several departments sharing responsibility before now.',
      'has never negotiated',
    ),
  ],
  ever: [
    b2(
      'engineering',
      '___ (you / ever / program) a PLC in your career so far?',
      'Have you ever programmed',
    ),
    b2(
      'travel',
      '___ (she / ever / miss) an international connection before?',
      'Has she ever missed',
    ),
    c1(
      'manufacturing',
      '___ (they / ever / investigate) a failure that appeared only after the product had left the factory?',
      'Have they ever investigated',
    ),
    b2(
      'university',
      '___ (he / ever / give) a lecture to a mixed-language group before?',
      'Has he ever given',
    ),
  ],
  unfinished: [
    b2(
      'office',
      'We ___ (receive) four enquiries so far this week, and it is only Wednesday.',
      'have received',
    ),
    b2(
      'sport',
      'She ___ (train) three times so far this month; the month is still in progress.',
      'has trained',
    ),
    c1(
      'laboratory',
      'The team ___ (reject) two explanations so far during this ongoing investigation, but several plausible alternatives remain.',
      'has rejected',
      'have rejected',
    ),
    c1(
      'university',
      'I ___ (revise) the research question twice so far this semester, which still has several weeks to run.',
      'have revised',
    ),
  ],
  recent: [
    b2(
      'commuting',
      'The service ___ (resume), so passengers can board again now.',
      'has resumed',
      'resumed',
    ),
    b2(
      'household',
      'I ___ (spill) coffee on the keyboard, and now several keys do not work.',
      'have spilled',
      'have spilt',
      'spilled',
      'spilt',
    ),
    c1(
      'engineering',
      'The coupling ___ (fail), which is why the motor is turning but the load is no longer moving.',
      'has failed',
      'failed',
    ),
    c1(
      'office',
      'The customer ___ (withdraw) the request, so we need to reconsider whether the remaining work is still necessary.',
      'has withdrawn',
      'withdrew',
    ),
  ],
  'already-just': [
    b2(
      'hospitality',
      'We ___ (already / pay) the bill; here is the receipt.',
      'have already paid',
      'already paid',
    ),
    b2(
      'university',
      'The lecturer ___ (just / upload) the slides, so they should be available now.',
      'has just uploaded',
      'just uploaded',
    ),
    c1(
      'manufacturing',
      'They ___ (already / isolate) the suspected batch, so it cannot accidentally be used while the investigation continues.',
      'have already isolated',
      'already isolated',
    ),
    c1(
      'engineering',
      'I ___ (just / notice) that both signals use the same reference, which may explain why the errors occur together.',
      'have just noticed',
      'just noticed',
    ),
  ],
  yet: [
    b2(
      'travel',
      'We ___ (not / choose) accommodation yet.',
      'have not chosen',
      "haven't chosen",
      'did not choose',
      "didn't choose",
    ),
    b2(
      'household',
      'The plumber ___ (not / confirm) a date yet.',
      'has not confirmed',
      "hasn't confirmed",
      'did not confirm',
      "didn't confirm",
    ),
    c1(
      'laboratory',
      'The investigators ___ (not / establish) whether the apparent improvement exceeds the uncertainty of the measurement yet.',
      'have not established',
      "haven't established",
      'did not establish',
      "didn't establish",
    ),
    c1(
      'office',
      'She ___ (not / approve) the revised scope yet, so we should not treat it as an agreed commitment.',
      'has not approved',
      "hasn't approved",
      'did not approve',
      "didn't approve",
    ),
  ],
  yesterday: [
    b1(
      'sport',
      'I ___ (leave) my training shoes at the sports centre yesterday.',
      'left',
    ),
    b2(
      'university',
      'Our supervisor ___ (ask) for a shorter introduction during yesterday’s consultation.',
      'asked',
    ),
    c1(
      'manufacturing',
      'The inspector ___ (reject) the batch last Tuesday because the material records did not match the delivery note.',
      'rejected',
    ),
    b2(
      'office',
      '___ (you / speak) to the customer yesterday afternoon?',
      'Did you speak',
    ),
    b2(
      'household',
      'The electrician ___ (not / find) a fault during yesterday’s visit.',
      'did not find',
      "didn't find",
    ),
    c1(
      'laboratory',
      'We ___ (exclude) the first reading yesterday after establishing that the sample had not reached the required temperature.',
      'excluded',
    ),
    b2(
      'travel',
      'They ___ (cancel) our flight last night because of the wind.',
      'cancelled',
      'canceled',
    ),
    b2(
      'social',
      'What ___ (she / say) when you called her last Sunday?',
      'did she say',
    ),
    c1(
      'engineering',
      'The replacement drive ___ (behave) normally during the trial last Friday, but that single result did not establish long-term reliability.',
      'behaved',
    ),
    b2(
      'errands',
      'I ___ (return) the wrong-size jacket to the shop yesterday.',
      'returned',
    ),
    b2(
      'commuting',
      'We ___ (not / catch) the earlier train yesterday morning.',
      'did not catch',
      "didn't catch",
    ),
    c1(
      'university',
      'The examiner ___ (challenge) the assumption during last week’s defence, prompting a useful discussion of the model’s limitations.',
      'challenged',
    ),
    b2(
      'hospitality',
      'How much ___ (the hotel / charge) for parking last weekend?',
      'did the hotel charge',
    ),
    b2(
      'sport',
      'She ___ (improve) her personal best at Saturday’s race.',
      'improved',
    ),
  ],
  dated: [
    b2(
      'engineering',
      'The plant ___ (install) its first automated inspection station in 2012.',
      'installed',
    ),
    b2(
      'university',
      'I ___ (begin) my final-year project in September 2024.',
      'began',
    ),
    c1(
      'office',
      'Both sides ___ (sign) the original agreement on 14 May 2020, before the additional services were proposed.',
      'signed',
    ),
    b2(
      'social',
      'My grandparents ___ (move) to this village in 1978.',
      'moved',
    ),
    b2(
      'travel',
      '___ (you / visit) the museum during your trip in 2019?',
      'Did you visit',
    ),
    c1(
      'manufacturing',
      'The first documented failure ___ (occur) in March 2016, although similar parts had been in service for several years.',
      'occurred',
    ),
    b2(
      'household',
      'We ___ (not / replace) the windows when we renovated the flat in 2021.',
      'did not replace',
      "didn't replace",
    ),
    b2('sport', 'She ___ (win) her first regional title in 2018.', 'won'),
    c1(
      'laboratory',
      'The laboratory ___ (adopt) the revised method in 2022 after completing a comparison against the previous procedure.',
      'adopted',
    ),
    b2('errands', 'I ___ (pay) for the annual pass on 2 January.', 'paid'),
    b2(
      'commuting',
      'When ___ (the council / open) the new tram route in 2023?',
      'did the council open',
    ),
    c1(
      'engineering',
      'The design team ___ (select) that material in 2014 on the basis of the operating conditions expected at the time.',
      'selected',
    ),
    b2(
      'university',
      'Our department ___ (not / offer) this course in 2010.',
      'did not offer',
      "didn't offer",
    ),
    b2(
      'hospitality',
      'The owners ___ (reopen) the restaurant in June 2021 after a complete refurbishment.',
      'reopened',
    ),
  ],
  'finished-period': [
    b2(
      'university',
      'During the completed summer placement, I ___ (learn) to prepare a basic inspection report.',
      'learned',
      'learnt',
    ),
    b2(
      'office',
      'We ___ (answer) all six enquiries during last month’s campaign, which ended on Friday.',
      'answered',
    ),
    c1(
      'manufacturing',
      'The team ___ (document) every deviation during the pilot run, which finished before routine production began.',
      'documented',
    ),
    b2(
      'sport',
      'He ___ (not / compete) during the 2020 season, which has long since ended.',
      'did not compete',
      "didn't compete",
    ),
    b2(
      'household',
      'While we lived in the old flat from 2017 to 2020, the boiler ___ (break) twice.',
      'broke',
    ),
    c1(
      'laboratory',
      'During the now-completed conditioning stage, the sample ___ (lose) less mass than the reference specimen.',
      'lost',
    ),
    b2(
      'travel',
      '___ (you / enjoy) the walking tour on your holiday last month?',
      'Did you enjoy',
    ),
    b2(
      'commuting',
      'I ___ (cycle) to work every day during the week when the buses were on strike last year.',
      'cycled',
    ),
    c1(
      'engineering',
      'The original arrangement ___ (meet) the requirements throughout the contract that ended in 2020.',
      'met',
    ),
    b2(
      'social',
      'We ___ (see) each other regularly during the course that finished two years ago.',
      'saw',
    ),
    b2(
      'hospitality',
      'The hotel ___ (not / provide) evening meals during our stay last winter.',
      'did not provide',
      "didn't provide",
    ),
    c1(
      'office',
      'The review ___ (reveal) several unclear responsibilities during the phase that closed before the present manager took over.',
      'revealed',
    ),
    b2(
      'errands',
      'How often ___ (you / use) the gym during your membership that expired in July?',
      'did you use',
    ),
    b2(
      'university',
      'She ___ (write) three reports during her completed placement at the factory.',
      'wrote',
    ),
  ],
});
