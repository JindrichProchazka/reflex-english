import { b1, b2, c1, prefix } from './types';
export const commonPrepositionAdditions = prefix('common-prepositions', {
  recipient: [
    b1(
      'social',
      'I gave the spare ticket ___ a friend who had missed the sale.',
    ),
    b2(
      'university',
      'Please forward the feedback ___ everyone who contributed to the assignment.',
    ),
    c1(
      'manufacturing',
      'The discrepancy should be reported ___ the person authorised to release the batch, rather than left in an informal shift note.',
    ),
    b2(
      'hospitality',
      'Could you pass this message ___ the guest in room twelve?',
    ),
    b2(
      'engineering',
      'The controller sends the measured position ___ the monitoring system.',
    ),
    c1(
      'office',
      'We need to explain the revised assumptions ___ the customer before asking them to accept a higher estimate.',
    ),
    b2(
      'household',
      'I handed the old keys ___ the new tenant after checking the meter readings.',
    ),
  ],
  destination: [
    b1('commuting', 'Which bus goes ___ the railway station from here?'),
    b2(
      'sport',
      'We drove ___ the climbing centre because the outdoor wall was closed.',
    ),
    c1(
      'manufacturing',
      'Parts should return ___ the inspection area if their labels become unreadable at any stage of assembly.',
    ),
    b2(
      'university',
      'I need to get ___ campus before the student office closes.',
    ),
    b2(
      'travel',
      'Are you travelling ___ Budapest directly, or changing in Vienna?',
    ),
    c1(
      'engineering',
      'The technician went back ___ the control room to compare the live readings with the archived trend.',
    ),
    c1(
      'office',
      'We may have to send someone ___ the supplier’s site if the disagreement cannot be resolved from the photographs.',
    ),
  ],
  response: [
    b1('errands', 'Did the shop reply ___ your request for a refund?'),
    b2(
      'university',
      'I am still waiting for a response ___ the question I raised after the lecture.',
    ),
    c1(
      'office',
      'Our response ___ the complaint should address the actual loss, rather than simply repeat the terms of the contract.',
    ),
    b2(
      'engineering',
      'The actuator should respond ___ a change in the control signal.',
    ),
    b2('social', 'I never received an answer ___ the invitation.'),
    c1(
      'manufacturing',
      'How did the team respond ___ the evidence that the same defect had occurred in an earlier batch?',
    ),
    b2(
      'household',
      'The landlord has not replied ___ the message about the heating yet.',
    ),
  ],
  beneficiary: [
    b1(
      'household',
      'I made an extra sandwich ___ you in case you get home late.',
    ),
    b2(
      'university',
      'These practice questions were prepared ___ students who missed the revision seminar.',
    ),
    c1(
      'office',
      'The summary was written ___ decision-makers who need the main implications without every intermediate calculation.',
    ),
    b2(
      'social',
      'We have kept a place ___ your sister if she decides to join us.',
    ),
    b2(
      'hospitality',
      'Is the smaller breakfast ___ the child sitting beside you?',
    ),
    c1(
      'manufacturing',
      'A separate storage area has been reserved ___ material awaiting investigation, so it cannot be confused with usable stock.',
    ),
    b2('sport', 'I booked two lanes ___ the beginners’ group.'),
  ],
  purpose: [
    b2(
      'engineering',
      'This cable is intended ___ carrying signals, not supplying power.',
    ),
    b2('household', 'We use that cupboard ___ storing cleaning products.'),
    c1(
      'laboratory',
      'The additional trial was designed ___ checking whether the apparent improvement could be reproduced with a fresh sample.',
    ),
    b2(
      'office',
      'Could we borrow the smaller room ___ a confidential conversation?',
    ),
    b2(
      'sport',
      'These shoes are better ___ running on wet paths than on a track.',
    ),
    c1(
      'manufacturing',
      'A temporary fixture ___ aligning the shafts would reduce the risk of damaging the bearings during assembly.',
    ),
    b2(
      'travel',
      'Keep some cash ___ the bus in case the ticket machine rejects your card.',
    ),
  ],
  reason: [
    b2('social', 'Thanks ___ reminding me about the appointment.'),
    b2(
      'university',
      'I am sorry ___ missing the consultation; I wrote down the wrong time.',
    ),
    c1(
      'office',
      'We would like to thank the review team ___ identifying the ambiguity before the agreement was signed.',
    ),
    b2(
      'hospitality',
      'The manager apologised ___ the noise from the work upstairs.',
    ),
    b2('household', 'Thank you ___ taking the parcel in while I was out.'),
    c1(
      'manufacturing',
      'The supplier accepted responsibility ___ sending parts that did not match the approved drawing.',
    ),
    c1(
      'engineering',
      'The inspection report should explain the reason ___ rejecting the assembly, not merely record that it failed.',
    ),
  ],
  companion: [
    b2('travel', 'Will you be sharing the cabin ___ anyone else?'),
    b2(
      'university',
      'I worked ___ two exchange students on the laboratory report.',
    ),
    c1(
      'office',
      'We should discuss the options ___ the people who will have to carry out the revised procedure.',
    ),
    b2('sport', 'I prefer to train ___ someone who runs at a similar pace.'),
    b2(
      'social',
      'Could your grandmother come ___ us, or would the walk be too long?',
    ),
    c1(
      'manufacturing',
      'The operator should inspect the first part ___ a qualified colleague before releasing the machine for routine production.',
    ),
    b2('household', 'My flatmate shares the garage ___ the family next door.'),
  ],
  tool: [
    b2('household', 'Can you reach the screw ___ a longer screwdriver?'),
    b2(
      'laboratory',
      'Record the temperature ___ an independent thermometer as a cross-check.',
    ),
    c1(
      'manufacturing',
      'The surface should be inspected ___ a suitable magnifier before the scratches are dismissed as cosmetic.',
    ),
    b2('sport', 'We marked the route ___ small reusable flags.'),
    b2('errands', 'I paid ___ my debit card because I had no cash.'),
    c1(
      'engineering',
      'The gap was measured ___ a gauge that had been checked against a traceable reference.',
    ),
    c1(
      'household',
      'Protect the floor ___ a sheet before removing the radiator, even if you expect only a small amount of water.',
    ),
  ],
  feature: [
    b2(
      'hospitality',
      'Have you got a quiet room ___ a desk large enough for a laptop?',
    ),
    b2(
      'engineering',
      'We need an encoder ___ a higher resolution for the slower motion.',
    ),
    c1(
      'office',
      'A quotation ___ a clearly defined scope is easier to compare than one that leaves installation and testing unspecified.',
    ),
    b2('household', 'Choose a container ___ a lid that seals properly.'),
    b2(
      'travel',
      'I would prefer a seat ___ enough legroom to work comfortably.',
    ),
    c1(
      'manufacturing',
      'The team proposed a fixture ___ interchangeable inserts so that the same base could support several product sizes.',
    ),
    b2('sport', 'Do you sell running jackets ___ reflective panels?'),
  ],
  topic: [
    b2(
      'university',
      'Could I ask ___ how this assignment will be assessed before I start writing?',
    ),
    b2(
      'social',
      'We ended up having a long discussion ___ how the neighbourhood had changed.',
    ),
    c1(
      'engineering',
      'The presentation contained useful information ___ the limitations of the sensor, not just its nominal performance.',
    ),
    b2('travel', 'Where can I find details ___ the replacement bus service?'),
    b2(
      'household',
      'I received a leaflet ___ reducing heat loss through older windows.',
    ),
    c1(
      'office',
      'Before raising concerns ___ the proposal, it helps to distinguish a missing explanation from an actual contradiction.',
    ),
    c1(
      'laboratory',
      'The students asked thoughtful questions ___ why repeated readings could agree closely yet still differ from the reference.',
    ),
  ],
  concern: [
    b2(
      'sport',
      'I am worried ___ my ankle, so I will skip the harder session.',
    ),
    b2(
      'university',
      'She was excited ___ presenting her first independent project.',
    ),
    c1(
      'manufacturing',
      'We are concerned ___ the lack of records, because the batch cannot be traced confidently to an approved material supply.',
    ),
    b2(
      'household',
      'Are you anxious ___ the repair bill, or about how long it will take?',
    ),
    b2(
      'travel',
      'I am more worried ___ missing the connection than about arriving a little late.',
    ),
    c1(
      'office',
      'The client seemed uneasy ___ committing to a date before the remaining technical questions had been answered.',
    ),
    b2(
      'social',
      'There is no need to be embarrassed ___ asking for clarification.',
    ),
  ],
  thinking: [
    b2(
      'university',
      'Have you thought ___ how you will explain the unexpected result?',
    ),
    b2(
      'errands',
      'I would like to read ___ the warranty before deciding whether to pay for an extension.',
    ),
    c1(
      'engineering',
      'We need to think ___ how the system behaves during startup, rather than assess only its steady operation.',
    ),
    b2(
      'social',
      'She is curious ___ what it is like to live in a smaller town.',
    ),
    b2(
      'sport',
      'I have been learning ___ how recovery affects long-term training.',
    ),
    c1(
      'office',
      'Could you find out more ___ the assumptions behind the supplier’s estimate before we use it in our own proposal?',
    ),
    c1(
      'household',
      'Thinking ___ the total cost over several years changed my view of which heating option was actually cheaper.',
    ),
  ],
});
