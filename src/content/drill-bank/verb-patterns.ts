import { b1, b2, c1, prefix, bankConcept } from './types';
export const verbPatternAdditions = prefix('verb-preposition-patterns', {
  'arrive-area': [
    b1('travel', 'We should arrive ___ Vienna in time for lunch.'),
    b2(
      'university',
      'The visiting lecturer arrived ___ Denmark a week before the conference.',
    ),
    c1(
      'office',
      'By the time the replacement engineer arrived ___ Poland, the local team had already isolated the intermittent fault.',
    ),
    b2(
      'social',
      'My cousin arrived ___ London with only a small suitcase and a temporary job.',
    ),
  ],
  'arrive-point': [
    b1('commuting', 'What time should we arrive ___ the bus terminal?'),
    b2(
      'hospitality',
      'If you arrive ___ the hotel before noon, reception can store your bags.',
    ),
    c1(
      'manufacturing',
      'All visitors arriving ___ the site must be briefed before entering an area where machinery is operating.',
    ),
    b2(
      'university',
      'I arrived ___ the lecture hall just as everyone was finding a seat.',
    ),
  ],
  depend: [
    b1('social', 'Whether we eat outside will depend ___ the weather.'),
    b2(
      'university',
      'Your choice of method should depend ___ the question you are trying to answer.',
    ),
    c1(
      'engineering',
      'The appropriate sampling rate depends ___ how quickly the relevant signal can change, not merely on the available storage.',
    ),
    b2(
      'household',
      'The final repair cost will depend ___ whether the frame also needs replacing.',
    ),
  ],
  listen: [
    b1(
      'sport',
      'Please listen ___ the coach before starting the next exercise.',
    ),
    b2(
      'university',
      'I find it hard to take detailed notes and listen ___ the explanation at the same time.',
    ),
    c1(
      'office',
      'We should listen ___ the objections carefully enough to understand whether they concern the objective or only the proposed approach.',
    ),
    b2(
      'commuting',
      'Do you listen ___ anything useful during your journey to work?',
    ),
  ],
  wait: [
    b2(
      'commuting',
      'Can you wait ___ me outside the station while I collect my bike?',
    ),
    b2('office', 'We are still waiting ___ approval from the project sponsor.'),
    c1(
      'manufacturing',
      'The next shift should wait ___ confirmation that the isolation has been removed before attempting to restart the line.',
    ),
    b2(
      'social',
      'I waited ___ a quiet moment before asking whether everything was all right.',
    ),
  ],
  ask: [
    b2('hospitality', 'Would it be reasonable to ask ___ a quieter table?'),
    b2(
      'university',
      'You should ask ___ an extension before the deadline, not after it.',
    ),
    c1(
      'engineering',
      'We need to ask ___ evidence that the replacement component is suitable, rather than rely on a verbal assurance.',
    ),
    b2('errands', 'I asked ___ a receipt because the purchase was for work.'),
  ],
  belong: [
    b2('university', 'Does this annotated copy belong ___ your tutor?'),
    b2('household', 'The tools in the blue case belong ___ our neighbour.'),
    c1(
      'laboratory',
      'Samples without a clear label cannot confidently be said to belong ___ the same experimental series.',
    ),
    c1(
      'office',
      'The decision belongs ___ the person accountable for the budget, although everyone affected should have an opportunity to comment.',
    ),
  ],
  deal: [
    b2(
      'household',
      'I will deal ___ the insurance forms if you arrange the repair.',
    ),
    b2(
      'university',
      'The student office deals ___ questions about registration and course changes.',
    ),
    c1(
      'manufacturing',
      'A procedure that deals ___ the immediate defect may still leave the underlying cause unaddressed.',
    ),
    c1(
      'office',
      'How should we deal ___ a request that falls outside the agreed scope but is genuinely urgent?',
    ),
  ],
  agree: [
    b2(
      'social',
      'I agree ___ your sister that the earlier train would be less stressful.',
    ),
    b2(
      'university',
      'Do you agree ___ the author’s interpretation of the result?',
    ),
    c1(
      'engineering',
      'We agree ___ the inspector that the current evidence does not justify operating beyond the tested range.',
    ),
    b2(
      'office',
      'You do not have to agree ___ me, but please explain which assumption you would change.',
    ),
  ],
  apologize: [
    b2(
      'university',
      'I should apologize ___ interrupting the discussion before you had finished.',
    ),
    b2('hospitality', 'The manager called to apologize ___ charging us twice.'),
    c1(
      'office',
      'We can apologize ___ the inconvenience without making claims about the cause before the investigation is complete.',
    ),
    c1(
      'social',
      'She wanted to apologize ___ how she had spoken, rather than pretend that the disagreement had never happened.',
    ),
  ],
  apply: [
    b2(
      'university',
      'Are you planning to apply ___ a placement during the summer?',
    ),
    b2(
      'office',
      'I did not apply ___ the promotion because the role involved too much travel.',
    ),
    c1(
      'engineering',
      'The team intends to apply ___ funding once the pilot results are strong enough to support a credible proposal.',
    ),
    b2('errands', 'Where do I apply ___ a replacement student travel pass?'),
  ],
  focus: [
    b2(
      'sport',
      'Today we will focus ___ technique rather than the number of repetitions.',
    ),
    b2(
      'university',
      'Your conclusion should focus ___ what the evidence actually supports.',
    ),
    c1(
      'manufacturing',
      'The audit will focus ___ how deviations are recorded and resolved, not merely on whether the paperwork exists.',
    ),
    c1(
      'engineering',
      'We should focus ___ reproducing the operating condition in which the fault appears before replacing more components.',
    ),
  ],
});
export const additionalVerbConcepts = [
  bankConcept(
    'verb-preposition-patterns',
    'refer',
    'Directing someone to information',
    'to',
    'The pattern directs the reader or listener to another source.',
    'Use refer to a document, person or earlier point.',
    [
      b2(
        'university',
        'Please refer ___ the marking criteria before choosing what to include.',
      ),
      b2(
        'office',
        'The customer was referring ___ the earlier quotation, not the revised one.',
      ),
      c1(
        'engineering',
        'When the manual refers ___ a safe state, it means a defined condition rather than simply the absence of motion.',
      ),
      b2('errands', 'The assistant referred me ___ the returns desk upstairs.'),
      b2(
        'laboratory',
        'Which measurement does the note at the bottom of the table refer ___?',
      ),
      c1(
        'manufacturing',
        'The inspection record must refer ___ the exact drawing revision against which the part was assessed.',
      ),
      c1(
        'social',
        'I did not realise you were referring ___ our conversation last week until you mentioned the cancelled trip.',
      ),
    ],
  ),
  bankConcept(
    'verb-preposition-patterns',
    'result',
    'Introducing an outcome',
    'in',
    'The noun after the gap is the outcome, not the original cause.',
    'Use result in for an outcome; result from introduces the cause.',
    [
      b2(
        'commuting',
        'The broken rail resulted ___ delays across the whole network.',
      ),
      b2(
        'university',
        'Missing the submission deadline can result ___ a lower mark.',
      ),
      c1(
        'engineering',
        'Increasing the gain may result ___ a faster response while also making the system more sensitive to noise.',
      ),
      b2(
        'household',
        'A blocked drain can result ___ water entering the kitchen.',
      ),
      b2(
        'office',
        'The discussion resulted ___ an agreement to postpone the launch.',
      ),
      c1(
        'manufacturing',
        'Moving the check earlier resulted ___ fewer defective parts reaching final assembly, although the total number produced did not change.',
      ),
      c1(
        'laboratory',
        'A small systematic offset can result ___ a misleading conclusion if it is treated as random variation.',
      ),
    ],
  ),
  bankConcept(
    'verb-preposition-patterns',
    'consist',
    'Describing the parts of a whole',
    'of',
    'The following items are the components of the whole.',
    'Use consist of to describe what something is made up of.',
    [
      b2(
        'university',
        'The assessment consists ___ a written report and a short presentation.',
      ),
      b2(
        'sport',
        'Our warm-up consists ___ easy running followed by mobility exercises.',
      ),
      c1(
        'engineering',
        'The feedback path consists ___ a sensor, a signal-conditioning stage and the controller’s input processing.',
      ),
      b2(
        'hospitality',
        'The set lunch consists ___ soup, a main course and a small dessert.',
      ),
      b2(
        'office',
        'The project team consists ___ people from three departments.',
      ),
      c1(
        'laboratory',
        'The quoted uncertainty consists ___ several contributions, none of which should be omitted merely because it is difficult to estimate.',
      ),
      b2(
        'household',
        'The repair kit consists ___ two seals, a washer and a small tube of grease.',
      ),
    ],
  ),
  bankConcept(
    'verb-preposition-patterns',
    'contribute',
    'Adding to a result or shared effort',
    'to',
    'This pattern introduces the result or shared activity being influenced.',
    'Use contribute to a result, discussion or project.',
    [
      b2(
        'university',
        'Everyone is expected to contribute ___ the group discussion.',
      ),
      b2('household', 'Poor ventilation can contribute ___ damp walls.'),
      c1(
        'engineering',
        'Mechanical backlash may contribute ___ the positioning error without being its only significant source.',
      ),
      b2(
        'sport',
        'Good recovery contributes ___ consistent training over several months.',
      ),
      b2(
        'office',
        'I would like to contribute ___ the planning stage, not just carry out the final tasks.',
      ),
      c1(
        'manufacturing',
        'Several small deviations can contribute ___ a failure even when no individual step appears unacceptable in isolation.',
      ),
      c1(
        'social',
        'A willingness to admit uncertainty can contribute ___ trust rather than undermine it.',
      ),
    ],
  ),
  bankConcept(
    'verb-preposition-patterns',
    'participate',
    'Taking part in an activity',
    'in',
    'The object names the activity or event someone takes part in.',
    'Use participate in an activity, study or discussion.',
    [
      b2(
        'university',
        'Would you like to participate ___ the student research conference?',
      ),
      b2(
        'sport',
        'You can participate ___ the training session without entering the competition.',
      ),
      c1(
        'laboratory',
        'Anyone choosing to participate ___ the study must understand how their measurements will be recorded and used.',
      ),
      b2(
        'office',
        'Two colleagues will participate ___ the supplier review remotely.',
      ),
      b2(
        'social',
        'We were invited to participate ___ a neighbourhood clean-up.',
      ),
      c1(
        'manufacturing',
        'Operators should participate ___ reviewing the procedure, since they are most likely to notice impractical assumptions.',
      ),
      b2(
        'university',
        'Do we need to register separately to participate ___ the workshop?',
      ),
    ],
  ),
  bankConcept(
    'verb-preposition-patterns',
    'suffer',
    'Experiencing an illness or difficulty',
    'from',
    'The pattern introduces the condition or problem being experienced.',
    'Use suffer from an illness or recurring problem.',
    [
      b2(
        'sport',
        'She sometimes suffers ___ knee pain after long downhill runs.',
      ),
      b2('household', 'This room suffers ___ poor ventilation in winter.'),
      c1(
        'engineering',
        'The measurements may suffer ___ a shared reference error that cannot be removed by averaging more samples.',
      ),
      b2('travel', 'Do you suffer ___ motion sickness on winding roads?'),
      b2(
        'office',
        'The proposal suffers ___ a lack of clear responsibilities.',
      ),
      c1(
        'manufacturing',
        'The older line still suffers ___ irregular material supply, despite improvements to the assembly process itself.',
      ),
      b2('social', 'He suffers ___ hay fever when the grass is being cut.'),
    ],
  ),
  bankConcept(
    'verb-preposition-patterns',
    'rely',
    'Depending on a source or person',
    'on',
    'This introduces the person or thing being depended on.',
    'Use rely on. Rely upon is also grammatical in more formal language.',
    [
      b2(
        'commuting',
        'I cannot rely ___ the last bus if the meeting runs late.',
        'on',
        'upon',
      ),
      b2(
        'university',
        'Try not to rely ___ a single source for your central claim.',
        'on',
        'upon',
      ),
      c1(
        'engineering',
        'We should not rely ___ the displayed value until we understand how the signal is filtered and scaled.',
        'on',
        'upon',
      ),
      b2(
        'household',
        'Can I rely ___ you to be home when the plumber arrives?',
        'on',
        'upon',
      ),
      b2(
        'office',
        'The estimate relies ___ the supplier meeting the agreed delivery date.',
        'on',
        'upon',
      ),
      c1(
        'manufacturing',
        'A safety procedure should not rely ___ everyone remembering a warning that appears only during initial training.',
        'on',
        'upon',
      ),
      c1(
        'laboratory',
        'The conclusion relies ___ the assumption that the two samples were exposed to comparable environmental conditions.',
        'on',
        'upon',
      ),
    ],
  ),
];
