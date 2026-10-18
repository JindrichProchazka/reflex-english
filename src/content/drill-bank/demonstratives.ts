import { b1, b2, c1, prefix } from './types';
export const demonstrativeAdditions = prefix('this-that-these-those', {
  'near-item': [
    b1('hospitality', 'Is ___ chair here beside me free?'),
    b2(
      'engineering',
      'Could you identify ___ connector I am holding up to the camera?',
    ),
    c1(
      'laboratory',
      '___ sample here in my hand was conditioned differently, so its result should not be pooled with the others.',
    ),
    b2(
      'errands',
      'I would like to return ___ jacket I am wearing; the zip has broken.',
    ),
    b2(
      'university',
      '___ paragraph here under my finger needs a clearer reference.',
    ),
    c1(
      'office',
      'Before we sign anything, I would like to clarify ___ clause I am pointing to on the document in front of us.',
    ),
    b2(
      'household',
      'Can ___ little key in my hand really open the garage door?',
    ),
  ],
  'far-item': [
    b1('travel', 'Is ___ building over there our hotel?'),
    b2(
      'manufacturing',
      '___ crane on the far side of the yard belongs to the installation team.',
    ),
    c1(
      'engineering',
      'If you follow the cable across the hall, ___ cabinet against the distant wall contains the main drive.',
    ),
    b2(
      'sport',
      'We need to run as far as ___ gate at the other end of the field.',
    ),
    b2(
      'errands',
      'Could you bring me ___ box on the highest shelf over there?',
    ),
    c1(
      'commuting',
      '___ queue across the square is for the replacement bus, not for the ticket office beside us.',
    ),
    c1(
      'social',
      'Do you recognise ___ person waving at us from the opposite side of the river?',
    ),
  ],
  'near-items': [
    b1(
      'household',
      '___ cups here beside me are clean; the ones in the sink are not.',
    ),
    b2(
      'laboratory',
      'Please label ___ three tubes I am holding before we put them in the rack.',
    ),
    c1(
      'engineering',
      '___ two terminals here under the probe are electrically connected even though the drawing shows them separately.',
    ),
    b2(
      'university',
      'I do not understand ___ comments here on my marked assignment.',
    ),
    b2('sport', 'Can I borrow ___ spare gloves lying next to my bag here?'),
    c1(
      'office',
      '___ figures on the sheet in front of me exclude transport costs, which may explain the apparent difference.',
    ),
    b2('errands', 'Are ___ batteries I have in my hand the correct size?'),
  ],
  'far-items': [
    b2(
      'travel',
      '___ mountains on the distant horizon are already covered in snow.',
    ),
    b2(
      'manufacturing',
      'Do ___ pallets across the loading yard need to go inside today?',
    ),
    c1(
      'engineering',
      '___ warning lights at the far end of the corridor indicate a separate system, so they are not part of our test.',
    ),
    b2('sport', 'Can you move ___ cones over there near the far goal?'),
    b2(
      'social',
      '___ people waiting on the opposite platform seem to be looking for us.',
    ),
    c1(
      'laboratory',
      'The new sensors are here on the bench; ___ older units behind the glass partition are being retained for comparison.',
    ),
    c1(
      'household',
      'If you look across the courtyard, ___ windows on the top floor belong to the flat that was recently renovated.',
    ),
  ],
  'near-person': [
    b1(
      'social',
      '___ is Martin, standing beside me; we met at the climbing club.',
    ),
    b2('university', 'Professor, ___ is my project partner here next to me.'),
    c1(
      'office',
      '___ is the colleague sitting beside me who will coordinate the handover once the installation has been accepted.',
    ),
    b2(
      'hospitality',
      '___ is my sister here with me; could we have adjoining rooms?',
    ),
    b2('sport', '___ is our new goalkeeper, standing here on my left.'),
    c1(
      'engineering',
      '___ is the engineer here at the table who can explain why we changed the feedback arrangement.',
    ),
    b2('social', 'Everyone, ___ is Petra, here with me at the door.'),
  ],
  'near-people': [
    b2(
      'office',
      '___ are the colleagues here beside me who will be joining the review.',
    ),
    b2(
      'university',
      '___ are our exchange students standing here at the front.',
    ),
    c1(
      'manufacturing',
      '___ are the two inspectors here with me who will verify the documentation before the batch is released.',
    ),
    b2(
      'social',
      '___ are my neighbours here next to me; they have just moved in.',
    ),
    b2(
      'sport',
      '___ are the volunteers standing here who will mark the route.',
    ),
    c1(
      'engineering',
      '___ are the technicians here at our table who traced the fault to the shared power supply.',
    ),
    c1(
      'university',
      '___ are the people sitting beside me whose questions helped us reconsider the original research design.',
    ),
  ],
  'far-people': [
    b2(
      'university',
      '___ students at the far end of the courtyard are waiting for the same lecture.',
    ),
    b2('sport', '___ are our opponents warming up on the distant pitch.'),
    c1(
      'manufacturing',
      '___ people across the workshop are visitors, so they will need an escort before entering the restricted area.',
    ),
    b2(
      'travel',
      'Are ___ the guides holding signs outside the terminal across the road?',
    ),
    b2('social', 'I think ___ are your cousins over there beyond the crowd.'),
    c1(
      'office',
      '___ delegates on the far side of the room represent the supplier, rather than the independent inspection company.',
    ),
    b2(
      'commuting',
      '___ passengers on the opposite side of the barrier have already had their tickets checked.',
    ),
  ],
  'current-reference': [
    b2(
      'university',
      '___ semester, the one we are currently in, includes a longer laboratory project.',
    ),
    b2(
      'office',
      'Can we finish the review ___ week, before the current week ends?',
    ),
    c1(
      'manufacturing',
      'Our priority ___ quarter, meaning the current reporting period, is to improve traceability rather than increase output.',
    ),
    b2('social', 'I have not seen her ___ month; today is already the 20th.'),
    b2('sport', '___ season is going well so far, but several matches remain.'),
    c1(
      'university',
      '___ academic year, which is still in progress, has been unusually demanding because two major deadlines coincide.',
    ),
    c1(
      'household',
      'We have used less electricity ___ winter so far, although the coldest part of the current winter may still be ahead.',
    ),
  ],
  'past-reference': [
    b2(
      'social',
      'We met on a rainy evening in 2018. I still remember ___ evening clearly.',
    ),
    b2(
      'engineering',
      'The first prototype failed during a test in 2019. ___ failure changed the design completely.',
    ),
    c1(
      'university',
      'My first presentation was in 2020. Looking back, ___ experience taught me more about preparation than any later success.',
    ),
    b2(
      'travel',
      'Our car broke down during a trip in 2015. We still laugh about ___ trip.',
    ),
    b2(
      'sport',
      'The final in 2017 went to penalties. ___ match remains the club’s most memorable one.',
    ),
    c1(
      'office',
      'We reached an agreement at a meeting in 2021, but the assumptions behind ___ agreement no longer apply.',
    ),
    b2(
      'household',
      'We moved house in 2014. ___ summer was exhausting, as I remember it.',
    ),
  ],
  'near-pages': [
    b2(
      'university',
      'Could you look at ___ equations here on the page in front of me?',
    ),
    b2(
      'office',
      '___ notes here in my notebook are from yesterday’s customer call.',
    ),
    c1(
      'laboratory',
      '___ traces here on my screen show the raw signal, before any filtering or averaging has been applied.',
    ),
    b2(
      'household',
      'Are ___ measurements here on the sketch wide enough for the new cupboard?',
    ),
    b2('travel', '___ two tickets here in my hand are for the return journey.'),
    c1(
      'engineering',
      'Do ___ diagrams here in front of us describe the installed system, or only the arrangement proposed in the original bid?',
    ),
    c1(
      'manufacturing',
      '___ inspection sheets here on my desk need to be signed by the person who actually performed the checks.',
    ),
  ],
});
