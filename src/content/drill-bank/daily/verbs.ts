import { b2, c1, bankConcept } from '../types';

export const differConcept = bankConcept(
  'verb-preposition-patterns',
  'differ',
  'Differ from: comparison',
  'from',
  'Compare one value, approach or object with another. Check the fixed pattern after differ.',
  'Use differ from when stating how one thing is unlike another. A difference does not by itself explain its cause.',
  [
    b2(
      'university',
      'My interpretation differs ___ the explanation in the lecture notes, so I would like to ask about it.',
    ),
    b2(
      'university',
      'How does the replacement assignment differ ___ the task completed by the rest of the class?',
    ),
    b2(
      'university',
      "The assessment criteria differ ___ last year's version in two important respects.",
    ),
    c1(
      'engineering',
      'The measured value differs ___ the model prediction, but the discrepancy is smaller than the combined uncertainty.',
    ),
    c1(
      'engineering',
      'Although the units agree, the reported pressure differs ___ the reference value because the two gauges use different zero points.',
    ),
    b2(
      'engineering',
      'This connector differs ___ the original part in its pin arrangement, not merely its colour.',
    ),
    b2(
      'engineering',
      'The new controller differs ___ its predecessor by allowing the sampling interval to be configured.',
    ),
    b2(
      'office',
      'The approved drawing differs ___ the copy that production received this morning.',
    ),
    b2(
      'travel',
      "The arrival time on my ticket differs ___ the time shown in the airline's latest message.",
    ),
    b2(
      'household',
      'The replacement filter differs ___ the one shown in the appliance manual.',
    ),
    b2(
      'household',
      'The total on this bill differs ___ the amount we agreed with the repair service.',
    ),
    b2(
      'sport',
      'My training plan differs ___ yours because we are preparing for different event distances.',
    ),
    c1(
      'advanced',
      'Our recommendation differs ___ the earlier proposal because it acknowledges constraints that the original comparison omitted.',
    ),
    c1(
      'advanced',
      'A defensible interpretation may differ ___ the majority view without being inconsistent with the available evidence.',
    ),
  ],
);

export const dailyVerbs = `
@university B2
arrive-area|Several exchange students arrive ___ the country before accommodation registration opens.
arrive-point|I arrived ___ the lecture theatre in time, but the session had moved online.
depend|Whether I can take this module depends ___ approval from the programme coordinator.
listen|Please listen ___ the whole explanation before deciding which method to use.
wait|Our group is waiting ___ feedback on the proposed dissertation topic.
ask|I need to ask ___ clarification rather than guess what the assignment requires.
belong|Does this calculator belong ___ someone in our laboratory group?
deal|The study department deals ___ requests to transfer credits from another university.
agree|I agree ___ your interpretation of the task, but we should check the deadline.
apologize|I should apologise ___ sending the teacher a draft with the wrong attachment.
apply|Can international students apply ___ this scholarship before their exchange place is confirmed?
focus|The introduction should focus ___ the research question rather than describe every detail of the setup.
refer|This comment refers ___ the first draft, not the corrected version I submitted yesterday.
result|Missing the registration deadline can result ___ losing access to the course materials.
consist|Our final assessment consists ___ a written report and a short oral defence.
contribute|Each group member should contribute ___ the discussion instead of only editing the slides.
participate|I would like to participate ___ the international project even if the extra credits do not count towards my degree.
suffer|My concentration suffers ___ the constant interruptions in the shared study room.
rely|We cannot rely ___ an unofficial timetable screenshot when booking travel for an examination.|on|upon
arrive-point|Please arrive ___ the laboratory reception before the safety briefing begins.
depend|The number of credits depends ___ which optional assignments you complete.
ask|Students can ask ___ an extension when a documented problem prevents submission on time.
agree|I do not entirely agree ___ the lecturer, but I want to explain my reasoning politely.
refer|The teacher asked us to refer ___ the uncertainty estimate when discussing the final result.
participate|Students who participate ___ the workshop must bring a short example from their own project.
@engineering C1
arrive-point|By the time we arrived ___ the test facility, the technician had isolated the suspect power supply.
depend|Because the output depends ___ the excitation voltage, we used a regulated supply for the comparison.
listen|Listen ___ the motor as the speed increases, but do not infer a specific fault from sound alone.
wait|We must wait ___ the chamber temperature to stabilise before interpreting the drift as a sensor problem.
ask|The test team asked ___ traceable calibration evidence rather than accepting a nominal specification as sufficient.
belong|These raw traces belong ___ the earlier trial and cannot support a conclusion about the revised mounting.
deal|The diagnostic procedure deals ___ plausible failure mechanisms in a fixed order to avoid changing several variables at once.
agree|I agree ___ the conclusion about the cable fault, although the controller still needs a separate check.
apologize|The supplier apologised ___ omitting a configuration change that materially affected the timing comparison.
apply|We need to apply ___ formal approval before increasing the load beyond the validated operating range.
focus|The next test should focus ___ distinguishing electrical interference from a genuine change in the measured quantity.
result|A loose shield connection can result ___ an intermittent disturbance that disappears when the cable is moved.
refer|The limit refers ___ continuous operation under specified cooling conditions, not an unrestricted short-duration overload.
@engineering B2
consist|The feedback loop consists ___ a sensor, a controller and an actuator with a suitable power stage.
contribute|Cable movement may contribute ___ the noise we see while the machine is running.
participate|Two apprentices will participate ___ the guarded demonstration after completing the safety briefing.
suffer|The positioning accuracy suffers ___ backlash in the mechanical transmission.
rely|The controller relies ___ the encoder signal to maintain the required shaft position.|on|upon
arrive-area|The replacement sensors should arrive ___ the country next week, subject to customs clearance.
arrive-point|The service engineer arrived ___ the factory before the first production shift.
depend|The current drawn by the motor depends ___ its operating conditions and load.
listen|We listened ___ the recorded bearing noise at a lower playback volume.
wait|The technician is waiting ___ the correct fuse before restoring power to the bench.
ask|Could you ask ___ the latest pinout before reconnecting the replacement sensor?
belong|These mounting bolts belong ___ the old actuator and do not fit the new housing.
deal|The first section of the manual deals ___ safe isolation of the electrical supply.
agree|The maintenance team agreed ___ the inspector that the cracked cover needed replacing.
apologize|I apologised ___ disconnecting the logger before its data had been saved.
apply|Our laboratory plans to apply ___ funding to replace its ageing calibration equipment.
focus|For this trial, focus ___ the startup transient rather than the steady operating value.
refer|The note below the diagram refers ___ the connector viewed from its cable side.
result|Using the wrong range can result ___ a reading that appears precise but is not useful.
consist|The revised test sequence consists ___ an initial check, a loaded run and a final inspection.
contribute|An unbalanced rotating part can contribute ___ vibration without being the only source.
participate|I participated ___ the inspection to learn how the reference points are identified.
@office B2
wait|Production is waiting ___ the approved drawing before machining the revised bracket.
deal|A named project owner should deal ___ the unresolved delivery questions.
apply|We applied ___ permission to move the inspection station during the shutdown.
focus|Tomorrow's handover will focus ___ changes that affect the next shift.
rely|Please do not rely ___ a verbal promise when the delivery date needs formal confirmation.|on|upon
agree|I agree ___ the inspector about the proposed plan, provided maintenance can spare a technician.
@travel B1
arrive-area|What time do we arrive ___ Prague if the connection is on time?
arrive-point|We should arrive ___ the airport two hours before departure.
@travel B2
wait|I am waiting ___ a replacement ticket after the booking app charged me twice.
ask|You can ask ___ assistance if you cannot carry your bicycle up the station stairs.
belong|Does this luggage belong ___ the passenger who left at the previous stop?
apologize|The driver apologised ___ stopping at the wrong platform entrance.
apply|Do I need to apply ___ a travel permit before booking the research visit?
refer|The reservation code refers ___ the outward journey only, not the return connection.
result|A missed transfer could result ___ an unexpected overnight stay.
consist|The journey consists ___ two train sections and a short replacement-bus transfer.
@household B1
listen|Please listen ___ the message before calling customer support again.
wait|I am waiting ___ the washing machine to finish.
ask|Can I ask ___ a receipt in case I need to return the charger?
belong|This spare key belongs ___ our neighbour.
deal|Who should deal ___ the leaking tap while the landlord is away?
agree|I agree ___ you that we should repair the chair rather than throw it away.
apologize|I need to apologise ___ returning the borrowed ladder late.
focus|It is hard to focus ___ cooking when the doorbell keeps ringing.
rely|We rely ___ a shared shopping list to avoid buying the same things twice.|on|upon
arrive-point|The plumber should arrive ___ our building before lunch.
depend|What we cook tonight depends ___ what is left in the fridge.
@household B2
arrive-area|My sister arrived ___ the city yesterday but has not collected her flat keys yet.
result|Leaving the charger under a blanket could result ___ overheating.
consist|Our return parcel consists ___ the appliance, its cable and the original accessories.
contribute|Keeping the shared hallway clear contributes ___ everyone's safety.
participate|We decided to participate ___ the neighbourhood tool-sharing scheme.
suffer|The old door suffers ___ repeated swelling when the weather is damp.
listen|I listened ___ the repair technician's advice before ordering another replacement part.
depend|Whether we can fix the shelf depends ___ how badly the wall fixing is damaged.
@sport B2
arrive-area|We arrived ___ the region a day early to recover from the journey before racing.
arrive-point|Please arrive ___ the sports centre with enough time to check your equipment.
depend|The length of our ride depends ___ the weather and how the group is feeling.
listen|Listen ___ the coach's safety briefing before entering the pool.
belong|The spare wheel belongs ___ another rider, so ask before borrowing it.
contribute|Easy recovery sessions contribute ___ a sustainable training routine.
participate|You can participate ___ the shorter event without entering the full race series.
suffer|My recovery suffers ___ trying to fit hard training around too little sleep.
rely|Do not rely ___ a phone battery alone for navigation on a long unfamiliar route.|on|upon
deal|The ride leader helped deal ___ a puncture before the group continued.
apply|Our club will apply ___ permission to hold the event in the park.
consist|Today's session consists ___ a warm-up, four controlled intervals and an easy finish.
@advanced C1
arrive-area|The delegates arrived ___ the host country with different expectations about what the negotiation could achieve.
arrive-point|We arrived ___ the venue before the formal discussion so that the minority position could be explained privately.
depend|The strength of the recommendation depends ___ assumptions that should be visible to anyone reading the summary.
listen|We should listen ___ the objection fully before deciding that it falls outside the agreed scope.
wait|It would be premature to proceed while we wait ___ independent confirmation of the central claim.
ask|The reviewer asked ___ a comparison that separated the cost of implementation from the cost of maintaining the change.
belong|Responsibility for the final recommendation belongs ___ the panel, even when outside experts provide the estimates.
deal|The revised proposal deals ___ exceptional cases explicitly rather than assuming that they are too rare to matter.
agree|I agree ___ the broad reasoning, but I am less confident that the evidence justifies this particular threshold.
apologize|We should apologise ___ implying consensus when the recorded discussion contained a substantive unresolved objection.
apply|An organisation may apply ___ independent accreditation without assuming that approval will settle every question of quality.
focus|The debate should focus ___ what would change the conclusion, rather than repeat positions that are already clear.
refer|The stated benefit refers ___ an average outcome and should not be presented as a guarantee for each individual.
result|Treating a provisional estimate as a fixed promise may result ___ decisions that are difficult to reverse later.
consist|The evidence base consists ___ several related studies whose shared assumptions limit their independence.
contribute|A well-chosen counterexample can contribute ___ understanding even when it does not invalidate the overall approach.
participate|People should be able to participate ___ the consultation without accepting its initial framing of the problem.
suffer|The argument suffers ___ an ambiguity that allows two incompatible interpretations to appear equivalent.
rely|We cannot rely ___ a convenient proxy once evidence shows that it excludes the outcomes we care about.|on|upon
depend|Whether an exception is justified depends ___ the purpose of the rule as well as the burden it creates.
listen|It is worth listening ___ a dissenting reviewer who can identify precisely where the inference becomes unsupported.
ask|Before accepting the claim, ask ___ evidence that could distinguish it from a plausible alternative explanation.
agree|The participants agreed ___ the assessor that uncertainty should be recorded rather than concealed behind a single estimate.
focus|A useful reassessment would focus ___ the assumptions most likely to fail under realistic constraints.
result|Ignoring a minority concern can result ___ an apparently simple policy whose practical effects are uneven.
suffer|The credibility of a recommendation suffers ___ presenting reasonable uncertainty as though it were mere indecision.
`;
