import { b1, b2, c1, prefix } from './types';
export const narrativeAdditions = prefix('past-simple-continuous', {
  complete: [
    b1(
      'errands',
      'I ___ (collect) the parcel, signed the form and left the shop.',
      'collected',
    ),
    b2(
      'engineering',
      'The technician ___ (disconnect) the supply and then removed the damaged connector.',
      'disconnected',
    ),
    c1(
      'laboratory',
      'After checking the calibration record, we ___ (repeat) the complete measurement series and archived both sets of results.',
      'repeated',
    ),
    b2(
      'social',
      'She ___ (read) the message, smiled and put her phone away.',
      'read',
    ),
    b2(
      'travel',
      'We ___ (buy) the tickets at the machine and boarded the next tram.',
      'bought',
    ),
    c1(
      'office',
      'The manager ___ (summarise) the agreed actions, assigned a responsible person to each and closed the meeting.',
      'summarised',
      'summarized',
    ),
    b2(
      'household',
      'I ___ (turn) off the water before I unscrewed the leaking connection.',
      'turned',
    ),
  ],
  'background-i': [
    b1(
      'household',
      'At six, I ___ (make) dinner; the vegetables were still in the pan.',
      'was making',
    ),
    b2(
      'university',
      'When you called, she ___ (revise) for her exam; she continued studying afterwards.',
      'was revising',
    ),
    c1(
      'engineering',
      'At the moment the trace was captured, the actuator ___ (move) slowly towards its reference position and had not yet stopped.',
      'was moving',
    ),
    b2(
      'commuting',
      'I ___ (not / pay) attention to the announcements when the platform changed; I was reading.',
      'was not paying',
      "wasn't paying",
    ),
    b2(
      'office',
      'He ___ (draft) the reply when I looked in; he had not reached the conclusion.',
      'was drafting',
    ),
    c1(
      'laboratory',
      'Throughout the observation period, the chamber ___ (cool) gradually; it had not reached a stable temperature when the reading was taken.',
      'was cooling',
    ),
    b2(
      'sport',
      'At that point in the race, she ___ (run) just behind the leading group.',
      'was running',
    ),
  ],
  'background-we': [
    b1(
      'social',
      'At eight, we ___ (eat) dinner; nobody had finished yet.',
      'were eating',
    ),
    b2(
      'travel',
      'What ___ (you / do) when the announcement came? I mean the activity already in progress.',
      'were you doing',
    ),
    c1(
      'manufacturing',
      'When the inspector entered, the operators ___ (adjust) the guide rails; the changeover was still under way.',
      'were adjusting',
    ),
    b2(
      'university',
      'We ___ (not / use) the laboratory at noon; we were still attending the lecture.',
      'were not using',
      "weren't using",
    ),
    b2(
      'office',
      'They ___ (review) the draft when I joined the call, and the review continued for another hour.',
      'were reviewing',
    ),
    c1(
      'engineering',
      'During the recorded interval, both drives ___ (accelerate) continuously, so their speed was not constant.',
      'were accelerating',
    ),
    c1(
      'household',
      'When you saw us outside, we ___ (wait) for the landlord; we had already been there for twenty minutes.',
      'were waiting',
    ),
  ],
  'interruption-long': [
    b2(
      'university',
      'I ___ (explain) my calculation when the lecturer stopped me to ask about the units.',
      'was explaining',
    ),
    b2(
      'household',
      'She ___ (hang) the washing outside when it suddenly began to rain.',
      'was hanging',
    ),
    c1(
      'engineering',
      'We ___ (compare) the two position signals when a brief interruption in the supply caused the logger to restart.',
      'were comparing',
    ),
    b2(
      'sport',
      'He ___ (stretch) beside the track when the coach called everyone together.',
      'was stretching',
    ),
    b2(
      'travel',
      'They ___ (look) for their platform when an employee offered to help.',
      'were looking',
    ),
    c1(
      'office',
      'I ___ (outline) the risks when the customer interrupted to clarify which operating conditions were actually required.',
      'was outlining',
    ),
    b2(
      'errands',
      'We ___ (queue) at the checkout when the fire alarm went off.',
      'were queuing',
      'were queueing',
    ),
  ],
  'interruption-event': [
    b1(
      'social',
      'I was walking home when I suddenly ___ (see) an old friend across the road.',
      'saw',
    ),
    b2(
      'laboratory',
      'We were taking readings when the display suddenly ___ (freeze).',
      'froze',
    ),
    c1(
      'manufacturing',
      'The line was running normally when a loose label suddenly ___ (block) the optical sensor and triggered a stop.',
      'blocked',
    ),
    b2(
      'travel',
      'She was looking for her passport when the airline suddenly ___ (call) her name.',
      'called',
    ),
    b2(
      'household',
      'I was cleaning the filter when the retaining clip suddenly ___ (snap).',
      'snapped',
    ),
    c1(
      'engineering',
      'We were monitoring the unloaded response when the coupling suddenly ___ (slip), changing the relationship between motor and shaft position.',
      'slipped',
    ),
    c1(
      'sport',
      'He was approaching the final bend when another runner suddenly ___ (move) into his path.',
      'moved',
    ),
  ],
  'parallel-one': [
    b2(
      'university',
      'While my partner was checking the sources, I ___ (rewrite) the introduction; both tasks were ongoing.',
      'was rewriting',
    ),
    b2(
      'household',
      'While I was preparing the vegetables, she ___ (wash) the dishes continuously.',
      'was washing',
    ),
    c1(
      'laboratory',
      'While the instrument was logging the force, the camera ___ (record) the deformation throughout the same interval.',
      'was recording',
    ),
    b2(
      'social',
      'While we were setting the table, he ___ (prepare) drinks; we all finished together.',
      'was preparing',
    ),
    b2(
      'sport',
      'While I was running my final lap, she ___ (time) the slower group; both activities were still in progress.',
      'was timing',
    ),
    c1(
      'engineering',
      'While one channel was tracking the commanded motion, the other ___ (measure) the actual displacement continuously.',
      'was measuring',
    ),
    b2(
      'office',
      'While the chair was speaking, I ___ (take) notes throughout the explanation.',
      'was taking',
    ),
  ],
  'parallel-many': [
    b2(
      'manufacturing',
      'While the fitter was aligning the shaft, we ___ (check) the guard clearances; both checks were ongoing.',
      'were checking',
    ),
    b2(
      'university',
      'While the tutor was answering questions, the other students ___ (work) on the example continuously.',
      'were working',
    ),
    c1(
      'office',
      'While one team was reviewing the commercial terms, the engineers ___ (assess) technical feasibility throughout the same period.',
      'were assessing',
    ),
    b2(
      'sport',
      'While she was demonstrating the movement, we ___ (watch) her foot placement carefully.',
      'were watching',
    ),
    b2(
      'household',
      'While I was cleaning upstairs, they ___ (carry) boxes into the garage; both jobs were ongoing.',
      'were carrying',
    ),
    c1(
      'laboratory',
      'While the chamber was approaching the target temperature, two technicians ___ (prepare) the next series of specimens.',
      'were preparing',
    ),
    c1(
      'travel',
      'While we were speaking to the airline, our friends ___ (search) continuously for alternative routes home.',
      'were searching',
    ),
  ],
  'story-sequence': [
    b2(
      'commuting',
      'She checked the departure board, ___ (change) platforms and caught the earlier train.',
      'changed',
    ),
    b2(
      'university',
      'I saved the file, ___ (upload) it and waited for the confirmation message.',
      'uploaded',
    ),
    c1(
      'engineering',
      'We isolated the supply, ___ (verify) that the circuit was dead and only then removed the cover.',
      'verified',
    ),
    b2(
      'household',
      'He shut the window, ___ (lock) the door and set the alarm.',
      'locked',
    ),
    b2(
      'hospitality',
      'The waiter checked our booking, ___ (lead) us to a table and brought the menus.',
      'led',
    ),
    c1(
      'manufacturing',
      'The inspector compared the marks, ___ (identify) the affected batch and requested that it be quarantined.',
      'identified',
    ),
    c1(
      'office',
      'She reviewed the evidence, ___ (acknowledge) the uncertainty and proposed a limited trial rather than an immediate full rollout.',
      'acknowledged',
    ),
  ],
  'story-scene': [
    b2(
      'travel',
      'A cold wind ___ (blow) across the platform as we stepped off the train.',
      'was blowing',
    ),
    b2(
      'hospitality',
      'Music ___ (play) quietly in the café when we walked in.',
      'was playing',
    ),
    c1(
      'manufacturing',
      'A warning indicator ___ (flash) repeatedly above the cabinet as the supervisor approached the stopped line.',
      'was flashing',
    ),
    b2(
      'sport',
      'The spectators ___ (cheer) continuously as the runners entered the stadium.',
      'were cheering',
    ),
    b2(
      'household',
      'Water ___ (drip) from the ceiling when I opened the bathroom door.',
      'was dripping',
    ),
    c1(
      'laboratory',
      'The displayed value ___ (fluctuate) noticeably as the visitor leaned over to read the instrument.',
      'was fluctuating',
    ),
    b2(
      'university',
      'Students ___ (discuss) the final question as the lecturer returned to the room.',
      'were discussing',
    ),
  ],
  'finished-count': [
    b2(
      'university',
      'By the end of yesterday’s workshop, each group ___ (submit) exactly one final design.',
      'submitted',
    ),
    b2(
      'errands',
      'During Saturday’s shopping trip, I ___ (buy) all five items on the list and then went home.',
      'bought',
    ),
    c1(
      'laboratory',
      'The completed trial ___ (produce) a total of twenty valid observations, all of which were retained in the analysis.',
      'produced',
    ),
    b2(
      'sport',
      'She ___ (swim) exactly twenty lengths yesterday and then left the pool.',
      'swam',
    ),
    b2(
      'office',
      'We ___ (resolve) all three outstanding questions in yesterday’s meeting and recorded the decisions.',
      'resolved',
    ),
    c1(
      'manufacturing',
      'During the shift that ended at six, the line ___ (assemble) 480 complete units and no partial assemblies remained.',
      'assembled',
    ),
    c1(
      'engineering',
      'The scheduled test ___ (cover) the full operating range yesterday, after which the temporary instrumentation was removed.',
      'covered',
    ),
  ],
});
