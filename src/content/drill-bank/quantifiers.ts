import { b1, b2, c1, prefix } from './types';
export const quantifierAdditions = prefix('quantifiers', {
  'some-plural': [
    b1(
      'sport',
      'I packed ___ clean socks for after training. (nějaké)',
      'some',
      'a few',
    ),
    b2(
      'university',
      'The tutor gave us ___ suggestions for narrowing the project topic. (nějaké)',
      'some',
      'a few',
    ),
    c1(
      'manufacturing',
      'We have identified ___ inconsistencies between the inspection records, although their cause remains unclear. (nějaké)',
      'some',
      'a few',
    ),
    b2(
      'social',
      'Let us invite ___ neighbours over once the decorating is finished. (nějaké)',
      'some',
      'a few',
    ),
  ],
  'some-mass': [
    b1(
      'hospitality',
      'Could you bring ___ bread with the soup? (trochu)',
      'some',
      'a little',
    ),
    b2(
      'university',
      'I need ___ advice on how to structure the discussion section. (nějaké)',
      'some',
      'a little',
    ),
    c1(
      'engineering',
      'There is ___ evidence of overheating, but not enough to justify replacing the entire drive. (nějaké)',
      'some',
      'a little',
    ),
    b2(
      'household',
      'We should leave ___ space behind the fridge for ventilation. (trochu)',
      'some',
      'a little',
    ),
  ],
  'any-negative': [
    b2(
      'commuting',
      'The ticket machine did not accept ___ coins at all. (žádné)',
    ),
    c1(
      'laboratory',
      'The repeated trial did not provide ___ evidence at all that the change had improved repeatability. (žádné)',
    ),
    b2(
      'errands',
      'I cannot find ___ receipt for the purchase at all. (žádnou)',
    ),
    b2(
      'office',
      'We have not received ___ confirmation of the revised date at all. (žádné)',
    ),
  ],
  'any-question': [
    b2(
      'travel',
      'Did the airline offer ___ explanation at all for the cancellation? (nějaké vůbec)',
    ),
    b2(
      'university',
      'Are there ___ questions at all before we start the experiment? (nějaké vůbec)',
    ),
    c1(
      'manufacturing',
      'Has the investigation established ___ connection at all between the raw material and the failures? (nějakou vůbec)',
    ),
    b2(
      'household',
      'Is there ___ detergent left at all, or should I buy more? (nějaký vůbec)',
    ),
  ],
  much: [
    b1(
      'hospitality',
      'How ___ sugar would you like in your tea? (kolik cukru)',
    ),
    b2(
      'university',
      'I did not get ___ feedback on the first draft. (mnoho zpětné vazby)',
    ),
    c1(
      'engineering',
      'How ___ confidence can we place in a model that has only been checked against one operating condition? (kolik důvěry)',
    ),
    b2(
      'commuting',
      'There was not ___ traffic once we had left the ring road. (mnoho provozu)',
    ),
    b2(
      'household',
      'How ___ paint will we need for the smaller bedroom? (kolik barvy)',
    ),
    c1(
      'office',
      'We do not have ___ flexibility in the schedule unless the customer agrees to postpone the inspection. (mnoho volnosti)',
    ),
    b2(
      'sport',
      'I have not had ___ energy for evening training recently. (mnoho energie)',
    ),
    b2(
      'laboratory',
      'Was there ___ variation between the repeated measurements? (mnoho kolísání)',
    ),
    c1(
      'manufacturing',
      'The revised procedure should not require ___ additional equipment, provided the existing gauges remain suitable. (mnoho dalšího vybavení)',
    ),
  ],
  many: [
    b1('social', 'How ___ people are coming to the barbecue? (kolik lidí)'),
    b2(
      'engineering',
      'We tried ___ possible settings before the motion became stable. (mnoho nastavení)',
    ),
    c1(
      'university',
      'How ___ independent sources support the conclusion, rather than simply referring back to the same original study? (kolik zdrojů)',
    ),
    b2(
      'travel',
      'There are not ___ direct connections to the airport before sunrise. (mnoho spojů)',
    ),
    b2(
      'office',
      'How ___ copies should I print for the meeting? (kolik kopií)',
    ),
    c1(
      'manufacturing',
      'Too ___ separate approvals can delay a minor change without necessarily making the decision any safer. (příliš mnoho schválení)',
    ),
    b2(
      'household',
      'We do not need ___ plates if only four guests are coming. (mnoho talířů)',
    ),
    b2(
      'sport',
      'How ___ laps did you manage before the rain started? (kolik kol)',
    ),
    b2(
      'laboratory',
      'There were ___ more readings in the second file than we expected. (mnohem více odečtů)',
    ),
  ],
  few: [
    b2(
      'university',
      '___ students understood the instructions, so the lecturer explained them again. (málo; nedostatečný počet)',
    ),
    b2(
      'commuting',
      '___ taxis were available, and several passengers missed their connections. (málo)',
    ),
    c1(
      'laboratory',
      '___ observations survived the quality checks, making the apparent trend difficult to defend. (málo; téměř žádné)',
    ),
    b2('social', 'She had ___ friends nearby and often felt isolated. (málo)'),
    b2(
      'manufacturing',
      'There were ___ spare parts, not enough to keep the line running. (málo)',
    ),
    c1(
      'office',
      '___ alternatives would satisfy both the budget limit and the customer’s requirements, leaving us little room to negotiate. (málo)',
    ),
    b2(
      'sport',
      'With so ___ players available, we had to cancel the match. (málo)',
    ),
    b2(
      'travel',
      '___ hotels had rooms left, and none were within our budget. (málo)',
    ),
    c1(
      'engineering',
      'Too ___ operating conditions were tested to justify claiming that the controller would remain stable throughout its range. (příliš málo)',
    ),
  ],
  'a-few': [
    b2(
      'university',
      'I have ___ examples ready, so we can start the presentation. (několik; nějaké jsou)',
    ),
    b2(
      'errands',
      'There are ___ clean jars in the cupboard if you need them. (pár)',
    ),
    c1(
      'office',
      'We can offer ___ practical concessions without changing the central terms of the agreement. (několik; něco nabídnout můžeme)',
    ),
    b2(
      'commuting',
      'The driver waited ___ seconds so the last passenger could board. (pár)',
    ),
    b2(
      'laboratory',
      'Let us take ___ extra readings to check that result. (několik)',
    ),
    c1(
      'engineering',
      'After correcting the wiring, we retained ___ representative traces to show how the response had changed. (několik)',
    ),
    b2('sport', 'I can lend you ___ cones for your training session. (pár)'),
    b2(
      'social',
      'We still have ___ weekends free before the wedding. (několik)',
    ),
    b2(
      'manufacturing',
      'Keep ___ labelled samples in case the customer asks for a comparison. (pár)',
    ),
  ],
  little: [
    b2(
      'household',
      'There was ___ hot water, so only one of us could shower. (málo; nedostatek)',
    ),
    b2(
      'university',
      'I had ___ understanding of the method and could not explain my results. (málo)',
    ),
    c1(
      'manufacturing',
      'The records provide ___ reassurance that the same fault would be detected before the next batch was released. (málo)',
    ),
    b2(
      'office',
      'We had ___ choice but to delay the launch. (málo možností; téměř žádný výběr)',
    ),
    b2(
      'sport',
      'He showed ___ enthusiasm for another early-morning session. (málo nadšení)',
    ),
    c1(
      'engineering',
      'There is ___ justification for increasing the gain until the source of the measurement noise has been established. (málo důvodů)',
    ),
    b2(
      'hospitality',
      'The café had ___ seating space, and we could not all sit together. (málo místa)',
    ),
    b2(
      'errands',
      'I made ___ effort to negotiate and ended up paying the full price. (málo úsilí)',
    ),
    c1(
      'social',
      'She had ___ patience left for explanations that avoided addressing what had actually happened. (málo trpělivosti)',
    ),
  ],
  'a-little': [
    b2(
      'laboratory',
      'There is ___ room on this bench for one more small instrument. (trochu; dost na přístroj)',
    ),
    b2(
      'hospitality',
      'Could you add ___ lemon juice, just enough to sharpen the flavour? (trochu)',
    ),
    c1(
      'office',
      'With ___ flexibility on both sides, we should be able to find a date that does not disrupt either team. (trochou)',
    ),
    b2(
      'university',
      'I have ___ background knowledge, enough to follow the introduction. (trochu)',
    ),
    b2(
      'household',
      'We saved ___ money by repairing the handle ourselves. (trochu)',
    ),
    c1(
      'engineering',
      'Allow ___ clearance so that the shaft can expand without putting an unnecessary load on the bearings. (trochu vůle)',
    ),
    b2('sport', 'I need ___ rest before I can attempt the final set. (trochu)'),
    b2(
      'travel',
      'There is ___ daylight left, enough to find the campsite. (trochu)',
    ),
    b2(
      'social',
      'She gave me ___ encouragement when I was about to give up. (trochu)',
    ),
  ],
});
