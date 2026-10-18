import { b1, b2, c1, prefix, bankConcept } from './types';
export const speechAdditions = prefix('say-tell-speak-talk', {
  'say-words': [
    b1('social', 'What did you ___ when she invited you?'),
    b2(
      'university',
      'If you disagree with the interpretation, please ___ so during the discussion.',
    ),
    c1(
      'office',
      'I would be careful not to ___ anything that could be understood as a promise before the budget has been approved.',
    ),
    b2(
      'hospitality',
      'Did the receptionist ___ whether breakfast was included?',
    ),
    b2('engineering', 'What does the manual ___ about resetting the drive?'),
    c1(
      'manufacturing',
      'The report does not ___ why the rejected samples were returned to the same container as the accepted parts.',
    ),
    b2(
      'household',
      'The instructions ___ we should leave the door open after cleaning.',
    ),
  ],
  'say-that': [
    b1('travel', 'Did they ___ that the platform had changed?'),
    b2(
      'university',
      'You did not ___ that the appendix counted towards the word limit.',
    ),
    c1(
      'laboratory',
      'We cannot ___ that the method is reliable until the result has been reproduced under comparable conditions.',
    ),
    b2('office', 'I would not ___ that the proposal is ready to send yet.'),
    b2('sport', 'The coach did ___ that attendance was optional this week.'),
    c1(
      'engineering',
      'It would be misleading to ___ that the fault has been eliminated when we have only prevented the alarm from appearing.',
    ),
    c1(
      'social',
      'I did not ___ that I disliked the idea; I asked whether we had considered the cost.',
    ),
  ],
  'tell-person': [
    b1('errands', 'Could you ___ me where to collect the order?'),
    b2(
      'university',
      'Please ___ your partner which part of the report you intend to write.',
    ),
    c1(
      'manufacturing',
      'We should ___ the next shift exactly what was changed, rather than assume that the updated settings are self-explanatory.',
    ),
    b2('hospitality', 'Can you ___ us whether late checkout is available?'),
    b2('social', 'I forgot to ___ him my new phone number.'),
    c1(
      'office',
      'Before anyone commits to another date, please ___ me which dependencies are still outside our control.',
    ),
    b2(
      'sport',
      'Do not ___ the whole team about the surprise celebration yet.',
    ),
  ],
  'tell-that': [
    b1('household', 'Please ___ Mum that I will bring the shopping home.'),
    b2(
      'engineering',
      'Did anyone ___ the electrician that the panel was still live?',
    ),
    c1(
      'university',
      'I need to ___ my supervisor that the original sample is no longer available, because that affects the comparison.',
    ),
    b2(
      'commuting',
      'Can you ___ the driver that someone left a bag on the back seat?',
    ),
    b2('office', 'We should ___ the client that the revised drawing is ready.'),
    c1(
      'manufacturing',
      'Do not ___ the customer that the batch has passed until every required inspection has actually been completed.',
    ),
    c1(
      'social',
      'I meant to ___ you that the invitation was genuine, even though the message sounded rather formal.',
    ),
  ],
  language: [
    b2(
      'travel',
      'Does anyone at the station ___ enough English to explain the disruption?',
    ),
    b2(
      'university',
      'We normally ___ English during the joint seminar with the visiting students.',
    ),
    c1(
      'office',
      'You do not need to ___ flawless English to contribute, but you should be able to explain uncertainty clearly.',
    ),
    b2(
      'social',
      'My grandparents ___ Slovak with each other even though they live here.',
    ),
    b2(
      'hospitality',
      'I can understand French menus, but I cannot ___ French confidently.',
    ),
    c1(
      'engineering',
      'Candidates must be able to ___ English well enough to discuss a technical fault with an overseas supplier.',
    ),
    b2('sport', 'Do the two coaches ___ the same language?'),
  ],
  'conversation-to': [
    b2(
      'university',
      'Could I ___ to you after the lecture about my topic?',
      'talk',
      'speak',
    ),
    b2(
      'errands',
      'I would prefer to ___ to someone before submitting a formal complaint.',
      'talk',
      'speak',
    ),
    c1(
      'office',
      'You should ___ to the person directly involved before drawing conclusions from an account passed through several colleagues.',
      'talk',
      'speak',
    ),
    b2(
      'hospitality',
      'May I ___ to the manager about the noise last night?',
      'talk',
      'speak',
    ),
    b2(
      'household',
      'I need to ___ to the plumber before ordering a replacement tap.',
      'talk',
      'speak',
    ),
    c1(
      'manufacturing',
      'Please ___ to the safety officer if you are unsure whether the isolation procedure applies to this particular machine.',
      'talk',
      'speak',
    ),
    c1(
      'social',
      'Would it help to ___ to someone who has been through a similar situation?',
      'talk',
      'speak',
    ),
  ],
  topic: [
    b2(
      'social',
      'We spent most of lunch planning what to ___ about at the reunion.',
      'talk',
      'speak',
    ),
    b2(
      'university',
      'I would like to ___ about the assumptions behind your calculation.',
      'talk',
      'speak',
    ),
    c1(
      'office',
      'Can we ___ openly about the risks without treating every concern as an objection to the whole project?',
      'talk',
      'speak',
    ),
    b2(
      'sport',
      'The coach will ___ about recovery before we start training.',
      'talk',
      'speak',
    ),
    b2(
      'travel',
      'Let us ___ about transport once we have agreed where to stay.',
      'talk',
      'speak',
    ),
    c1(
      'engineering',
      'We need to ___ about what the sensor can actually measure, rather than what we would like its output to represent.',
      'talk',
      'speak',
    ),
    b2(
      'household',
      'When would be a good time to ___ about sharing the household bills?',
      'talk',
      'speak',
    ),
  ],
  'tell-truth': [
    b2(
      'social',
      'It takes courage to ___ the truth when you know someone will be disappointed.',
    ),
    b2(
      'university',
      'The lecturer likes to ___ a short story before introducing a new problem.',
    ),
    c1(
      'manufacturing',
      'Please ___ the truth about the inspection sequence, even if it reveals that a step was missed.',
    ),
    b2(
      'household',
      'Did the children ___ you a story about how the window broke?',
    ),
    b2('office', 'I would never ask a colleague to ___ a lie on my behalf.'),
    c1(
      'social',
      'You can ___ the same story honestly from two perspectives without either person deliberately inventing what happened.',
    ),
    c1(
      'engineering',
      'The readings should ___ us the truth about the process, not merely confirm what we hoped the adjustment would achieve.',
    ),
  ],
  'say-to': [
    b2(
      'social',
      'What could I ___ to her that would not sound like an excuse?',
    ),
    b2(
      'office',
      'I did not know what to ___ to the customer after the second delay.',
    ),
    c1(
      'university',
      'Think carefully about what you want to ___ to the examiner if they challenge the main assumption in your model.',
    ),
    b2(
      'travel',
      'Did you ___ anything to the passenger who found your wallet?',
    ),
    b2(
      'household',
      'What did the electrician ___ to you about the old wiring?',
    ),
    c1(
      'manufacturing',
      'We should agree what to ___ to the supplier before different departments give them conflicting instructions.',
    ),
    b2(
      'sport',
      'Is there anything you would like to ___ to the team before the match?',
    ),
  ],
  'tell-instruction': [
    b2(
      'university',
      'Please ___ everyone to submit one file rather than separate attachments.',
    ),
    b2(
      'household',
      'Can you ___ the delivery driver to ring the downstairs bell?',
    ),
    c1(
      'engineering',
      'Do not ___ the operator to bypass the interlock simply because the fault is difficult to reproduce.',
    ),
    b2(
      'travel',
      'Did the staff ___ passengers to keep their original tickets?',
    ),
    b2(
      'office',
      'I will ___ the team to leave enough time for a proper review.',
    ),
    c1(
      'laboratory',
      'We should ___ participants to report anything unusual, rather than waiting until the end of the trial to ask.',
    ),
    c1(
      'sport',
      'The coach had to ___ us to slow down because the exercise was intended to improve technique rather than speed.',
    ),
  ],
});
export const additionalSpeechConcepts = [
  bankConcept(
    'say-tell-speak-talk',
    'speak-up',
    'Making your voice or concern heard',
    'speak',
    'Think of raising your voice or openly expressing a concern.',
    'Use speak up to be heard, and speak out to express a concern openly.',
    [
      b1('social', 'Could you ___ up? I cannot hear you from the back.'),
      b2('university', 'Please ___ up if you cannot see the screen clearly.'),
      b2(
        'office',
        'I wish people felt able to ___ up before a small problem became serious.',
      ),
      c1(
        'manufacturing',
        'Workers must be able to ___ out about unsafe conditions without worrying that a genuine concern will be held against them.',
      ),
      b2(
        'travel',
        'You will need to ___ up because the announcement is very loud.',
      ),
      c1(
        'engineering',
        'The junior engineer was the first to ___ up when the proposed test appeared to exceed the equipment’s limits.',
      ),
      b2('sport', 'Please ___ up rather than continue training with pain.'),
      b2(
        'household',
        'If the music is bothering you, ___ up and we can turn it down.',
      ),
      c1(
        'university',
        'It can be difficult to ___ out when everyone else seems confident, even though your objection may be well founded.',
      ),
      b2(
        'social',
        'Do not be afraid to ___ up when your name is called incorrectly.',
      ),
    ],
  ),
  bankConcept(
    'say-tell-speak-talk',
    'speak-for',
    'Representing a view or a group',
    'speak',
    'The verb means represent someone’s views, not merely chat.',
    'Use speak for someone, speak on behalf of a group and speak for yourself.',
    [
      b2(
        'office',
        'I can only ___ for my own team; the other department may see it differently.',
      ),
      b2(
        'university',
        'Who will ___ on behalf of the students at the committee meeting?',
      ),
      c1(
        'manufacturing',
        'No single operator can ___ for both shifts unless the concerns of each group have actually been collected.',
      ),
      b2(
        'social',
        'Please ___ for yourself; I am quite happy with the arrangement.',
      ),
      c1(
        'office',
        'I am not authorised to ___ on behalf of the company about a contract that is still being negotiated.',
      ),
      b2('sport', 'The captain was asked to ___ for the team after the final.'),
      b2(
        'university',
        'Can someone ___ on behalf of the group when we present the conclusion?',
      ),
      c1(
        'engineering',
        'The test results should ___ for themselves, but the limitations still need to be explained rather than left implicit.',
      ),
      b2(
        'social',
        'I would not presume to ___ for everyone who lives in the building.',
      ),
      b2(
        'office',
        'Before you ___ for us, check that you understand which points we have actually agreed.',
      ),
    ],
  ),
  bankConcept(
    'say-tell-speak-talk',
    'talk-through',
    'Discussing a decision or procedure',
    'talk',
    'This is a conversational phrasal pattern: explain steps or discuss a choice.',
    'Use talk something over, talk someone through a process and talk someone into something.',
    [
      b2(
        'university',
        'Could you ___ me through the first step of the calculation?',
      ),
      b2(
        'household',
        'Let us ___ it over before we agree to the builder’s proposal.',
      ),
      c1(
        'office',
        'I do not want to ___ anyone into accepting the deadline before they have considered the work it involves.',
      ),
      b2(
        'engineering',
        'Can you ___ the technician through the startup sequence over the phone?',
      ),
      b2(
        'travel',
        'We need to ___ the options over before the cheaper fare expires.',
      ),
      c1(
        'laboratory',
        'Please ___ us through how the raw readings became the values reported in the final table.',
      ),
      b2(
        'sport',
        'Do not let your friends ___ you into training before the injury has healed.',
      ),
      b2(
        'social',
        'We should ___ things over rather than exchange annoyed messages.',
      ),
      c1(
        'manufacturing',
        'Before signing the record, ask someone to ___ you through any deviation from the approved procedure.',
      ),
      b2(
        'office',
        'Could we ___ the budget over once more with the person who prepared it?',
      ),
    ],
  ),
];
