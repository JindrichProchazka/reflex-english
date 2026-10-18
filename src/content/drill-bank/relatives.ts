import { b1, b2, c1, prefix } from './types';
export const relativeAdditions = prefix('who-which-that', {
  'people-subject': [
    b1('social', 'The person ___ found my wallet left it at reception.'),
    b2(
      'university',
      'Students need a tutor ___ can explain the method without doing the work for them.',
    ),
    c1(
      'engineering',
      'We need an engineer ___ can distinguish a plausible explanation from a cause supported by the measurements.',
    ),
    b2(
      'sport',
      'The runner ___ finished beside me had never entered a race before.',
    ),
    b2(
      'household',
      'Do you know anyone ___ repairs washing machines at weekends?',
    ),
    c1(
      'office',
      'The colleague ___ questioned the estimate was not rejecting the proposal; she was asking how the figures had been obtained.',
    ),
    b2('travel', 'The guide ___ led yesterday’s walk spoke excellent English.'),
  ],
  'people-service': [
    b1(
      'hospitality',
      'The waiter ___ served us remembered our order from last time.',
    ),
    b2(
      'errands',
      'I would like to speak to the adviser ___ dealt with my original request.',
    ),
    c1(
      'manufacturing',
      'The inspector ___ released the batch needs to explain how the missing records were taken into account.',
    ),
    b2(
      'university',
      'Is the lecturer ___ teaches control engineering available after class?',
    ),
    b2(
      'commuting',
      'The driver ___ helped us with the luggage was very patient.',
    ),
    c1(
      'office',
      'We should involve the person ___ handles customer complaints, since they know which problems tend to recur.',
    ),
    c1(
      'household',
      'The electrician ___ replaced the board also checked whether the older circuits were properly labelled.',
    ),
  ],
  'people-plural': [
    b1(
      'sport',
      'Players ___ arrive late should warm up before joining the game.',
    ),
    b2(
      'university',
      'People ___ have not submitted the form cannot register for the laboratory session.',
    ),
    c1(
      'manufacturing',
      'Operators ___ notice an unusual sound should report it even if the machine continues to produce acceptable parts.',
    ),
    b2(
      'social',
      'Friends ___ listen carefully are often more helpful than people who immediately offer advice.',
    ),
    b2(
      'travel',
      'Passengers ___ need assistance should contact the airline before travelling.',
    ),
    c1(
      'office',
      'Colleagues ___ challenge a proposal constructively can improve it without necessarily agreeing with every part of it.',
    ),
    b2(
      'engineering',
      'Technicians ___ work on live equipment need the appropriate authorisation.',
    ),
  ],
  'people-object': [
    b2(
      'university',
      'The supervisor ___ I asked for advice recommended a simpler experiment.',
    ),
    b2('social', 'The friend ___ you introduced me to lives near my office.'),
    c1(
      'office',
      'The consultant ___ we brought in to review the contract identified a risk that neither side had noticed.',
    ),
    b2(
      'hospitality',
      'The receptionist ___ we thanked had arranged an earlier room for us.',
    ),
    b2(
      'sport',
      'The coach ___ they appointed last season used to play for the club.',
    ),
    c1(
      'engineering',
      'The specialist ___ the team consulted suggested checking the common reference before replacing either instrument.',
    ),
    c1(
      'university',
      'The examiner ___ she had expected to question the results focused instead on the assumptions behind the comparison.',
    ),
  ],
  'things-subject': [
    b1('household', 'Is there a switch ___ turns off the outside light?'),
    b2(
      'engineering',
      'We need a sensor ___ can withstand repeated cleaning with this solvent.',
    ),
    c1(
      'laboratory',
      'An instrument ___ produces repeatable values is not necessarily free from a systematic error.',
    ),
    b2(
      'commuting',
      'The train ___ leaves from platform five stops at the airport.',
    ),
    b2(
      'university',
      'Choose a topic ___ gives you enough scope for an independent argument.',
    ),
    c1(
      'manufacturing',
      'We need a process ___ prevents an unlabelled part from reaching final assembly, rather than merely detecting it afterwards.',
    ),
    b2(
      'hospitality',
      'I would prefer a room ___ overlooks the courtyard rather than the road.',
    ),
  ],
  'things-object': [
    b2(
      'errands',
      'The replacement ___ the shop sent does not fit the original bracket.',
    ),
    b2(
      'office',
      'Have you checked the attachment ___ I included in my last message?',
    ),
    c1(
      'engineering',
      'The explanation ___ the supplier offered does not account for the fault occurring only after the motor warms up.',
    ),
    b2(
      'travel',
      'The route ___ you suggested avoids the roadworks completely.',
    ),
    b2(
      'university',
      'The source ___ she quoted is available through the university library.',
    ),
    c1(
      'laboratory',
      'The uncertainty ___ we reported includes the effect of temperature, but not variation between different operators.',
    ),
    c1(
      'household',
      'The guarantee ___ the installer described on the phone appears to exclude the very fault we are trying to resolve.',
    ),
  ],
  'things-plural': [
    b2(
      'manufacturing',
      'Components ___ fail the pressure test must be kept separate from accepted stock.',
    ),
    b2(
      'university',
      'Assignments ___ arrive after the deadline need an approved extension.',
    ),
    c1(
      'engineering',
      'Signals ___ share the same power supply may exhibit correlated errors even when the sensors themselves are independent.',
    ),
    b2(
      'sport',
      'Shoes ___ fit well when walking may still rub during a long run.',
    ),
    b2(
      'office',
      'Messages ___ require a decision should include the relevant deadline.',
    ),
    c1(
      'laboratory',
      'Readings ___ were excluded from the analysis should remain in the raw data with an explanation for their exclusion.',
    ),
    b2(
      'household',
      'Clothes ___ cannot go in the dryer are hanging in the bathroom.',
    ),
  ],
  all: [
    b2('office', 'All ___ needs approval is the revised delivery date.'),
    b2('household', 'All ___ was left in the fridge was a little milk.'),
    c1(
      'university',
      'All ___ can reasonably be concluded from this comparison is that the two methods behave differently under these conditions.',
    ),
    b2(
      'travel',
      'All ___ stood between us and the hotel was a steep final climb.',
    ),
    b2(
      'engineering',
      'All ___ connects the sensor to the controller is this single cable.',
    ),
    c1(
      'manufacturing',
      'All ___ remains unresolved is whether the fault originated before or after the material was transferred.',
    ),
    c1(
      'social',
      'All ___ mattered to her was that we had made the effort to come, rather than how much the present had cost.',
    ),
  ],
  everything: [
    b2(
      'university',
      'Everything ___ appears in the bibliography should be cited in the report.',
    ),
    b2('travel', 'Everything ___ was in the lost bag has now been replaced.'),
    c1(
      'engineering',
      'Everything ___ depends on the measured position must be checked if the encoder reference is changed.',
    ),
    b2('household', 'Everything ___ needs washing is already in the basket.'),
    b2(
      'office',
      'Everything ___ was agreed during the call is recorded in the summary.',
    ),
    c1(
      'laboratory',
      'Everything ___ could have affected the result should be documented, including changes that initially seemed irrelevant.',
    ),
    b2(
      'sport',
      'Everything ___ belongs to the club must be returned after the tournament.',
    ),
  ],
  superlative: [
    b2(
      'household',
      'That is the simplest repair ___ would solve the leak without replacing the whole tap.',
    ),
    b2(
      'university',
      'This is the clearest example ___ demonstrates the limitation of the method.',
    ),
    c1(
      'engineering',
      'We chose the least powerful actuator ___ could still meet the requirement under the worst expected load.',
    ),
    b2(
      'travel',
      'It is the earliest connection ___ allows us enough time to change platforms.',
    ),
    b2(
      'office',
      'What is the smallest change ___ would make the proposal acceptable?',
    ),
    c1(
      'manufacturing',
      'This is the most reliable evidence ___ links the surface damage to the handling procedure rather than the machining process.',
    ),
    c1(
      'laboratory',
      'Use the narrowest measurement range ___ can cover the expected variation without clipping the peaks.',
    ),
  ],
});
