import type { StudyLesson } from '../domain/study-models';

// English | Czech equivalents | two Learn examples | two unseen practice
// contexts | Czech translation of the first Learn example for paper production.
function lesson(
  id: string,
  title: string,
  topic: string,
  level: StudyLesson['level'],
  description: string,
  rows: string,
): StudyLesson {
  return {
    id,
    title,
    topic,
    level,
    description,
    words: rows
      .trim()
      .split('\n')
      .map((line, index) => {
        const [
          english,
          meanings,
          first,
          second,
          contextA,
          contextB,
          paperTranslation,
        ] = line.trim().split('|');
        return {
          id: `${id}-${index + 1}`,
          english,
          czech: meanings.split(';')[0],
          acceptedCzech: meanings.split(';'),
          examples: [first, second],
          contextExamples: [contextA, contextB],
          paperTranslation,
        };
      }),
  };
}

export const advancedLessons: StudyLesson[] = [
  lesson(
    'career',
    'Job Interview & Career Discussion',
    'Careers & interviews',
    'B2',
    'Explain your experience, discuss responsibilities and ask about working conditions.',
    `
relevant experience|relevantní zkušenosti;odpovídající zkušenosti|I have relevant experience in testing.|Which relevant experience would you highlight?|My laboratory work gave me relevant experience for this role.|Please describe your relevant experience with customer projects.|Mám relevantní zkušenosti s testováním.
responsible for|zodpovědný za;odpovědný za|I was responsible for final inspections.|Who is responsible for training new staff?|In my previous role, I was responsible for scheduling repairs.|The successful applicant will be responsible for a small team.|Byl jsem zodpovědný za závěrečné kontroly.
strengths and weaknesses|silné a slabé stránky|Let us discuss your strengths and weaknesses.|I can describe my strengths and weaknesses honestly.|Reflecting on my strengths and weaknesses helped me choose this role.|How do your strengths and weaknesses affect teamwork?|Pojďme probrat vaše silné a slabé stránky.
career progression|kariérní postup;profesní růst|What opportunities for career progression do you offer?|Training supports my career progression.|I would like to understand the path for career progression here.|The annual review includes a discussion of career progression.|Jaké možnosti kariérního postupu nabízíte?
hands-on experience|praktické zkušenosti|I gained hands-on experience in the workshop.|The placement offers hands-on experience.|Building the prototype gave me hands-on experience with assembly.|We value hands-on experience as well as theoretical knowledge.|V dílně jsem získal praktické zkušenosti.
meet expectations|splnit očekávání;naplnit očekávání|I want to meet expectations from the start.|Clear objectives help us meet expectations.|What would I need to deliver to meet expectations during probation?|Regular feedback helps new employees meet expectations.|Chci od začátku splnit očekávání.
take initiative|převzít iniciativu;projevit iniciativu|I am willing to take initiative.|We encourage graduates to take initiative.|When the instructions were unclear, I decided to take initiative.|Can you describe a time you had to take initiative?|Jsem ochoten převzít iniciativu.
work under pressure|pracovat pod tlakem|I can work under pressure calmly.|How do you work under pressure?|Urgent repairs taught me to work under pressure without skipping checks.|This position sometimes requires you to work under pressure.|Dokážu v klidu pracovat pod tlakem.
long-term goals|dlouhodobé cíle|My long-term goals include leading projects.|What are your long-term goals?|This training programme fits my long-term goals in engineering.|How would this position support your long-term goals?|Mezi mé dlouhodobé cíle patří vedení projektů.
suitable candidate|vhodný uchazeč;vhodný kandidát|I believe I am a suitable candidate.|We are looking for a suitable candidate.|My combination of testing and teamwork makes me a suitable candidate.|What qualities would make someone a suitable candidate for this team?|Věřím, že jsem vhodný uchazeč.
key achievement|klíčový úspěch;významný úspěch|My key achievement was reducing downtime.|Please describe one key achievement.|Completing the installation ahead of schedule was a key achievement.|Which key achievement best demonstrates your problem-solving skills?|Mým klíčovým úspěchem bylo zkrácení prostojů.
salary expectations|platová očekávání;mzdové požadavky|Could we discuss my salary expectations?|What are your salary expectations?|My salary expectations depend on the responsibilities and benefits.|The recruiter asked me to explain my salary expectations.|Mohli bychom probrat má platová očekávání?
notice period|výpovědní lhůta;výpovědní doba|My notice period is two months.|When does your notice period end?|I can confirm a starting date after checking my notice period.|The proposed start date must allow for my notice period.|Moje výpovědní lhůta je dva měsíce.
constructive feedback|konstruktivní zpětná vazba|I welcome constructive feedback.|My supervisor gave me constructive feedback.|How does the team provide constructive feedback during probation?|I used constructive feedback to improve my technical reports.|Uvítám konstruktivní zpětnou vazbu.
contribute to the team|přispět k práci týmu;přispívat k práci týmu|I want to contribute to the team.|How could you contribute to the team?|My experience with testing would help me contribute to the team.|I would like to contribute to the team while developing new skills.|Chci přispět k práci týmu.
`,
  ),
  lesson(
    'negotiation',
    'Advanced Meetings & Negotiation',
    'Meetings & decisions',
    'B2/C1',
    'Disagree respectfully, weigh trade-offs and reach workable agreements.',
    `
from my perspective|z mého pohledu|From my perspective, the deadline is realistic.|It looks different from my perspective.|From my perspective, reliability matters more than a small cost reduction.|Could I explain the situation from my perspective?|Z mého pohledu je termín realistický.
I see your point, however|chápu váš názor, nicméně;rozumím vašemu názoru, nicméně|I see your point, however, we need more evidence.|I see your point, however, the budget is limited.|I see your point, however, removing that test would increase risk.|I see your point, however, the customer has not approved the change.|Chápu váš názor, nicméně potřebujeme více důkazů.
trade-off|kompromis mezi protichůdnými požadavky;kompromis|There is a trade-off between cost and reliability.|Every design involves a trade-off.|Reducing the weight creates a trade-off with stiffness.|We should explain the trade-off before choosing the cheaper option.|Mezi náklady a spolehlivostí existuje kompromis.
compromise|kompromis|We need a compromise on the delivery date.|Could you suggest a compromise?|Neither side accepted the original proposal, so we explored a compromise.|A compromise would allow both departments to use the equipment.|Potřebujeme kompromis ohledně data dodání.
feasible alternative|proveditelná alternativa;uskutečnitelná alternativa|Can you propose a feasible alternative?|We have one feasible alternative.|Renting the equipment may be a feasible alternative to buying it.|Before rejecting the plan, let us consider a feasible alternative.|Můžete navrhnout proveditelnou alternativu?
raise a concern|vyjádřit obavu;upozornit na problém|I would like to raise a concern.|Please raise a concern before we approve this.|May I raise a concern about maintenance access?|The operator wanted to raise a concern about the revised procedure.|Rád bych vyjádřil obavu.
reach an agreement|dospět k dohodě;dosáhnout dohody|We hope to reach an agreement today.|Both sides want to reach an agreement.|We need to reach an agreement on who pays for the additional tests.|It may take another meeting to reach an agreement.|Doufáme, že dnes dospějeme k dohodě.
clarify the requirement|upřesnit požadavek;objasnit požadavek|Could you clarify the requirement?|We must clarify the requirement first.|Before estimating the cost, we should clarify the requirement for accuracy.|Please clarify the requirement so that both teams test the same thing.|Mohl byste upřesnit požadavek?
underlying issue|hlavní skrytý problém;podstata problému|The underlying issue is a lack of information.|We have not addressed the underlying issue.|Changing the deadline will not resolve the underlying issue of missing staff.|Let us identify the underlying issue rather than argue about symptoms.|Hlavním skrytým problémem je nedostatek informací.
reasonable compromise|rozumný kompromis;přijatelný kompromis|This seems like a reasonable compromise.|Can we find a reasonable compromise?|Keeping the essential tests and delaying the extras is a reasonable compromise.|A staged delivery could offer a reasonable compromise for both sides.|Tohle se zdá být rozumný kompromis.
propose an alternative|navrhnout alternativu|May I propose an alternative?|We should propose an alternative to cancellation.|If the supplier cannot deliver, I suggest we propose an alternative.|Could your team propose an alternative that meets the safety requirements?|Mohu navrhnout alternativu?
common ground|společné stanovisko;společný základ|We have found some common ground.|Let us start with our common ground.|Both teams value reliability, which gives us common ground.|Identifying common ground helped us discuss the remaining disagreement.|Našli jsme určité společné stanovisko.
subject to approval|podléhající schválení;za předpokladu schválení|The revised budget is subject to approval.|Our offer is subject to approval.|We can reserve the equipment, subject to approval from the manager.|The proposed change remains subject to approval by the customer.|Upravený rozpočet podléhá schválení.
take that into account|vzít to v úvahu;zohlednit to|We should take that into account.|Please take that into account when planning.|The night shift has fewer technicians, so we must take that into account.|If delivery takes longer, we need to take that into account.|Měli bychom to vzít v úvahu.
agree on the next steps|dohodnout se na dalších krocích|Let us agree on the next steps.|Can we agree on the next steps today?|Before closing the meeting, we should agree on the next steps.|Both departments need to agree on the next steps for the trial.|Pojďme se dohodnout na dalších krocích.
`,
  ),
  lesson(
    'troubleshooting-2',
    'Technical Troubleshooting II',
    'Fault diagnosis & reliability',
    'C1',
    'Describe intermittent behaviour, test assumptions and explain corrective action.',
    `
intermittent fault|občasná závada;přerušovaná závada|We are investigating an intermittent fault.|An intermittent fault can be difficult to trace.|The alarm appears only after warm-up, suggesting an intermittent fault.|Please log when the intermittent fault occurs.|Vyšetřujeme občasnou závadu.
root cause|kořenová příčina;prvotní příčina|We have not identified the root cause.|The report explains the root cause.|Replacing the fuse restored power but did not remove the root cause.|What evidence links the damaged connector to the root cause?|Nezjistili jsme kořenovou příčinu.
failure mode|způsob poruchy;poruchový režim|This failure mode affects the cooling system.|We documented each failure mode.|Bearing seizure is one failure mode considered in the analysis.|The test was designed to investigate a different failure mode.|Tento způsob poruchy ovlivňuje chladicí systém.
reproduce the issue|zopakovat problém;reprodukovat problém|Can you reproduce the issue?|We need to reproduce the issue safely.|Please record the exact steps needed to reproduce the issue.|The technician could reproduce the issue only at maximum load.|Dokážete zopakovat problém?
rule out|vyloučit|We need to rule out a wiring fault.|This test may rule out overheating.|Checking the supply voltage helped us rule out a power problem.|We cannot rule out contamination without inspecting the filter.|Musíme vyloučit závadu kabeláže.
narrow down|zúžit okruh;zúžit|These tests will narrow down the possibilities.|We can narrow down the search.|Disconnecting each branch helped us narrow down the source of interference.|Use the event log to narrow down when the fault started.|Tyto testy zúží okruh možností.
underlying cause|skrytá příčina;základní příčina|The underlying cause remains unclear.|We must investigate the underlying cause.|The repeated resets were symptoms of an underlying cause in the power supply.|Cleaning the sensor did not address the underlying cause of contamination.|Skrytá příčina zůstává nejasná.
corrective action|nápravné opatření|The report recommends corrective action.|We agreed on a corrective action.|Replacing the damaged cable was the immediate corrective action.|How will you verify that the corrective action has worked?|Zpráva doporučuje nápravné opatření.
unexpected behavior|neočekávané chování|The controller shows unexpected behavior.|Please describe the unexpected behavior.|We observed unexpected behavior after changing the sampling interval.|The log records unexpected behavior during the restart sequence.|Regulátor vykazuje neočekávané chování.
faulty component|vadná součástka;vadný komponent|We replaced the faulty component.|Label the faulty component before storage.|The bench test identified a faulty component in the input circuit.|Do not discard the faulty component until the investigation is complete.|Vyměnili jsme vadnou součástku.
under load|při zatížení;pod zatížením|The motor vibrates under load.|We tested the drive under load.|The fault disappears at idle but returns under load.|Measure the supply voltage while the actuator operates under load.|Motor při zatížení vibruje.
isolate the fault|lokalizovat závadu;izolovat závadu|We need to isolate the fault.|This procedure helps isolate the fault.|Test each signal path separately to isolate the fault.|It took several controlled tests to isolate the fault to one connector.|Musíme lokalizovat závadu.
working hypothesis|pracovní hypotéza|Our working hypothesis is overheating.|The measurements support our working hypothesis.|We treated a loose connection as a working hypothesis, not a conclusion.|Which test could disprove your working hypothesis?|Naší pracovní hypotézou je přehřívání.
operating conditions|provozní podmínky|Record the operating conditions during testing.|The operating conditions changed overnight.|Try to match the operating conditions present when the alarm appeared.|The report should include temperature, load and other operating conditions.|Během testování zaznamenejte provozní podmínky.
verify the fix|ověřit opravu;ověřit odstranění závady|We must verify the fix.|Please verify the fix before release.|Repeat the original test sequence to verify the fix.|A successful restart alone is not enough to verify the fix.|Musíme ověřit opravu.
`,
  ),
  lesson(
    'automation',
    'Mechatronics & Automation',
    'Control systems & industrial automation',
    'B2/C1',
    'Discuss sensors, motion, PLC signals and closed-loop system behaviour.',
    `
actuator|akční člen;pohon|The actuator moves the valve.|We selected an electric actuator.|The PLC sends a command to the actuator controlling the gate.|Check whether the actuator moves when the output is enabled.|Akční člen pohybuje ventilem.
encoder|enkodér;snímač polohy|The encoder measures shaft position.|Check the encoder cable.|The drive lost its position reference when the encoder signal disappeared.|We compared the encoder reading with the commanded position.|Enkodér měří polohu hřídele.
feedback loop|zpětnovazební smyčka;smyčka zpětné vazby|The feedback loop includes the position sensor.|We tested the feedback loop.|A broken sensor cable interrupted the feedback loop.|Before tuning the controller, verify the feedback loop connections.|Zpětnovazební smyčka zahrnuje snímač polohy.
control signal|řídicí signál|The control signal reaches the drive.|We recorded the control signal.|The valve remained closed despite a changing control signal.|Use the oscilloscope to inspect the control signal at the input.|Řídicí signál dorazí k pohonu.
setpoint|žádaná hodnota;požadovaná hodnota|The temperature setpoint is adjustable.|We increased the setpoint gradually.|The operator entered a new speed setpoint on the panel.|Compare the measured temperature with the setpoint before changing the gains.|Žádaná hodnota teploty je nastavitelná.
process variable|regulovaná veličina;procesní veličina|Temperature is the process variable.|We logged the process variable.|The display shows the process variable alongside its target value.|A failed sensor produced an implausible process variable reading.|Regulovanou veličinou je teplota.
closed-loop control|řízení se zpětnou vazbou;uzavřená regulační smyčka|The drive uses closed-loop control.|We are testing closed-loop control.|The new design uses closed-loop control to maintain shaft speed.|Explain how the sensor is used in closed-loop control.|Pohon používá řízení se zpětnou vazbou.
sampling rate|vzorkovací frekvence;vzorkovací kmitočet|The sampling rate is configurable.|We documented the sampling rate.|Choose a sampling rate appropriate for the signal being measured.|The recorded data include the sampling rate used during acquisition.|Vzorkovací frekvence je nastavitelná.
signal noise|šum signálu;šum v signálu|The filter reduces signal noise.|We observed signal noise on the input.|Poor cable routing increased signal noise near the motor drive.|Compare the raw and filtered traces to assess signal noise.|Filtr snižuje šum signálu.
response time|doba odezvy|We measured the response time.|The response time met the requirement.|The customer asked how the response time changes under load.|Include the response time when comparing the two sensors.|Změřili jsme dobu odezvy.
dead zone|pásmo necitlivosti;mrtvé pásmo|The valve has a small dead zone.|We measured the dead zone.|Small input changes produced no movement within the dead zone.|Account for the dead zone when interpreting the actuator response.|Ventil má malé pásmo necitlivosti.
overshoot|překmit|The response shows significant overshoot.|We reduced the overshoot during tuning.|The temperature briefly exceeded its target because of overshoot.|Compare the overshoot before and after adjusting the controller.|Odezva vykazuje výrazný překmit.
steady state|ustálený stav|The system has reached steady state.|Record the error at steady state.|Wait for steady state before comparing the measured speeds.|The simulation reports the remaining deviation at steady state.|Systém dosáhl ustáleného stavu.
disturbance|porucha působící na systém;rušivý vliv|A disturbance affected the output.|We introduced a disturbance during testing.|An abrupt change in load acted as a disturbance to the drive.|How quickly does the controller respond to an external disturbance?|Porucha působící na systém ovlivnila výstup.
compensation|kompenzace|The controller includes friction compensation.|We adjusted the compensation settings.|Temperature compensation reduced the effect of sensor drift.|Describe the compensation used for the measured mechanical backlash.|Regulátor zahrnuje kompenzaci tření.
`,
  ),
  lesson(
    'manufacturing',
    'Mechanical Engineering & Manufacturing',
    'Mechanical design & manufacturing',
    'B2/C1',
    'Discuss fits, machining, wear, assembly and production quality.',
    `
tolerance|tolerance;dovolená odchylka|The drawing specifies a tight tolerance.|Check the tolerance before machining.|The measured diameter is outside the specified tolerance.|Can this process consistently achieve the required tolerance?|Výkres předepisuje úzkou toleranci.
clearance|vůle;mezera|We measured the clearance between the parts.|The clearance allows relative movement.|Insufficient clearance caused the moving parts to rub.|Check the clearance after the housing has warmed up.|Změřili jsme vůli mezi součástmi.
interference fit|uložení s přesahem|The hub uses an interference fit.|We calculated the interference fit.|The assembly procedure accounts for the force needed for an interference fit.|Explain why an interference fit was chosen for this joint.|Náboj používá uložení s přesahem.
shaft|hřídel|The shaft transmits torque.|Inspect the shaft for damage.|A crack was found near the shoulder of the shaft.|Support the shaft before removing the bearing housing.|Hřídel přenáší točivý moment.
bearing|ložisko|The bearing supports the rotating shaft.|We replaced the worn bearing.|An unusual noise suggested damage to the bearing.|Check the bearing temperature during the trial run.|Ložisko podpírá rotující hřídel.
wear|opotřebení|The surface shows signs of wear.|We inspected the gear for wear.|Abrasive particles accelerated wear on the sliding surfaces.|Record the wear after each endurance test.|Povrch vykazuje známky opotřebení.
surface finish|jakost povrchu;kvalita povrchu|The drawing specifies the surface finish.|We inspected the surface finish.|Changing the cutting parameters improved the surface finish.|The sealing surface requires a better surface finish than the bracket.|Výkres předepisuje jakost povrchu.
machining|obrábění|The part requires further machining.|We estimated the machining time.|Leave enough material for final machining after heat treatment.|The supplier proposed a different machining process for the slot.|Součást vyžaduje další obrábění.
assembly|montáž;sestava|The assembly procedure includes an inspection.|We revised the assembly instructions.|Incorrect orientation of the spacer delayed assembly.|Confirm that every component is clean before final assembly.|Montážní postup zahrnuje kontrolu.
alignment|vyrovnání;souosost|We checked the alignment of the shafts.|Correct alignment reduces unwanted loading.|The technician adjusted the alignment before tightening the mounts.|Recheck the alignment after replacing the motor.|Zkontrolovali jsme souosost hřídelů.
backlash|vůle v převodu;zubová vůle|We measured the backlash in the gearbox.|The specification limits the backlash.|Reversing the drive revealed excessive backlash in the transmission.|Include backlash when estimating the positioning error.|Změřili jsme vůli v převodovce.
fatigue|únava materiálu|The crack may have resulted from fatigue.|We evaluated fatigue under cyclic loading.|Repeated bending caused fatigue near the welded joint.|The design review included an assessment of fatigue life.|Trhlina mohla vzniknout únavou materiálu.
yield strength|mez kluzu|The material certificate lists the yield strength.|We compared the yield strength of two alloys.|The calculation uses the specified yield strength for this material.|Check whether the yield strength is sufficient for the expected loading.|Materiálový certifikát uvádí mez kluzu.
deformation|deformace|The test caused permanent deformation.|We measured the deformation under load.|The bracket showed visible deformation after the overload test.|The simulation predicts deformation around the mounting holes.|Zkouška způsobila trvalou deformaci.
quality control|kontrola kvality;řízení kvality|The batch is ready for quality control.|We improved the quality control procedure.|The inspection record is part of our quality control process.|A recurring defect prompted a review of quality control.|Šarže je připravena ke kontrole kvality.
`,
  ),
  lesson(
    'measurement',
    'Measurement, Testing & Uncertainty',
    'Metrology & experimental work',
    'C1',
    'Discuss measurement quality, calibration, uncertainty and interpretation of data.',
    `
measurement uncertainty|nejistota měření|We estimated the measurement uncertainty.|The report includes measurement uncertainty.|State the measurement uncertainty alongside the reported result.|Which contributions dominate the measurement uncertainty in this experiment?|Odhadli jsme nejistotu měření.
accuracy|přesnost měření;celková přesnost měření;přesnost|We checked the instrument's accuracy.|The specification describes the required accuracy.|Compare the reading with a reference to assess accuracy.|High repeatability alone does not demonstrate accuracy.|Zkontrolovali jsme přesnost přístroje.
precision|preciznost měření;shodnost opakovaných měření;preciznost|We evaluated the precision of repeated measurements.|The method offers good precision.|Closely grouped readings suggest good precision under these conditions.|Discuss precision separately from agreement with the reference value.|Vyhodnotili jsme shodnost opakovaných měření.
repeatability|opakovatelnost|We tested repeatability under unchanged conditions.|The results show good repeatability.|Use the same instrument and procedure when evaluating repeatability.|The report distinguishes repeatability from variation between laboratories.|Testovali jsme opakovatelnost za nezměněných podmínek.
resolution|rozlišení|The display has a resolution of one millivolt.|We recorded the sensor resolution.|A finer resolution does not by itself establish measurement accuracy.|The small change could not be distinguished at this resolution.|Displej má rozlišení jeden milivolt.
calibration|kalibrace|The instrument requires calibration.|We checked the calibration record.|The laboratory compared the instrument with a reference during calibration.|Record the conditions used for calibration.|Přístroj vyžaduje kalibraci.
offset|posun nuly;offset|The sensor has a small offset.|We measured the offset at zero input.|Subtract the measured offset before comparing the two traces.|A constant offset shifted every reading by the same amount.|Snímač má malý posun nuly.
drift|drift;časový posun údaje|The instrument shows gradual drift.|We monitored drift throughout the experiment.|The zero reading changed over time because of drift.|Temperature changes may contribute to the observed drift.|Přístroj vykazuje postupný drift.
systematic error|systematická chyba|We investigated a possible systematic error.|The correction addresses a systematic error.|A misadjusted reference introduced a systematic error into the results.|Repeated measurements alone did not remove the systematic error.|Zkoumali jsme možnou systematickou chybu.
random error|náhodná chyba|We estimated the effect of random error.|The readings vary because of random error.|The repeated measurements help characterize random error.|Discuss how random error contributes to the spread of readings.|Odhadli jsme vliv náhodné chyby.
confidence interval|interval spolehlivosti|We reported a confidence interval for the mean.|The confidence interval is relatively wide.|State the confidence level used for the confidence interval.|More variable observations produced a wider confidence interval in this analysis.|Uvedli jsme interval spolehlivosti pro průměr.
measurement range|měřicí rozsah|The signal exceeds the measurement range.|Choose a suitable measurement range.|The instrument saturated because the input was outside its measurement range.|Record the measurement range selected for each test.|Signál překračuje měřicí rozsah.
sensitivity|citlivost|We measured the sensor sensitivity.|The sensitivity depends on the configuration.|Compare the output change with the input change to evaluate sensitivity.|The report states the sensitivity at the chosen operating point.|Změřili jsme citlivost snímače.
noise|šum|The recorded signal contains noise.|Shielding reduced the noise.|The small response was difficult to distinguish from the noise.|Estimate the noise level before interpreting the smallest variations.|Zaznamenaný signál obsahuje šum.
outlier|odlehlá hodnota|We investigated the outlier before excluding it.|One outlier affected the mean.|Check the laboratory notes for an explanation of this outlier.|Do not remove an outlier solely because it is inconvenient.|Odlehlou hodnotu jsme před vyloučením prozkoumali.
`,
  ),
  lesson(
    'presentation',
    'Technical Presentation & Defense',
    'Presentations & design reviews',
    'C1',
    'Explain objectives, defend design choices and acknowledge limitations.',
    `
the main objective|hlavní cíl|The main objective was to reduce vibration.|We defined the main objective clearly.|The main objective of this prototype is to test the control strategy.|Could you explain how the results address the main objective?|Hlavním cílem bylo snížit vibrace.
design constraint|konstrukční omezení;návrhové omezení|Space was the main design constraint.|We documented each design constraint.|The available power supply imposed a design constraint on the actuator.|Which design constraint had the greatest effect on your choice?|Prostor byl hlavním konstrukčním omezením.
our approach was based on|náš přístup byl založen na|Our approach was based on experimental data.|Our approach was based on a simplified model.|Our approach was based on comparing measured and predicted responses.|In the first stage, our approach was based on a small laboratory trial.|Náš přístup byl založen na experimentálních datech.
the results indicate|výsledky naznačují;výsledky ukazují|The results indicate a reduction in vibration.|The results indicate that further testing is necessary.|The results indicate that the modified mount performs better under load.|Within the tested range, the results indicate a consistent improvement.|Výsledky naznačují snížení vibrací.
the limitation of this method|omezení této metody|The limitation of this method is its cost.|We should explain the limitation of this method.|The limitation of this method becomes apparent at very low speeds.|How would you address the limitation of this method in future work?|Omezením této metody jsou její náklady.
a reasonable assumption|rozumný předpoklad;opodstatněný předpoklad|Constant temperature is a reasonable assumption here.|We consider this a reasonable assumption.|For the short test period, negligible wear is a reasonable assumption.|What evidence makes a linear response a reasonable assumption?|Konstantní teplota je zde rozumný předpoklad.
justify the choice|zdůvodnit volbu;odůvodnit volbu|We need to justify the choice of material.|Can you justify the choice of sensor?|Use the measured requirements to justify the choice of drive.|The panel asked us to justify the choice rather than list alternatives.|Musíme zdůvodnit volbu materiálu.
evaluate performance|vyhodnotit funkční vlastnosti;vyhodnotit výkon|We used three tests to evaluate performance.|How will you evaluate performance?|The prototype allowed us to evaluate performance under realistic loading.|Define the criteria before you evaluate performance.|K vyhodnocení funkčních vlastností jsme použili tři zkoušky.
in comparison with|ve srovnání s;v porovnání s|The design is lighter in comparison with the original.|Costs increased in comparison with last year.|The response was faster in comparison with the baseline controller.|Explain the benefit in comparison with the existing solution.|Konstrukce je ve srovnání s původní lehčí.
further improvement|další zlepšení|The results leave room for further improvement.|We proposed a further improvement.|Reducing cable interference is one opportunity for further improvement.|What would you prioritize for further improvement of the prototype?|Výsledky ponechávají prostor pro další zlepšení.
within the scope of|v rámci rozsahu;v mezích rozsahu|This test is within the scope of the project.|Calibration is within the scope of our study.|Long-term endurance testing was not within the scope of this thesis.|Keep your conclusions within the scope of the measurements presented.|Tato zkouška spadá do rozsahu projektu.
as shown in the figure|jak je znázorněno na obrázku|The peak occurs here, as shown in the figure.|The load increases, as shown in the figure.|The modified response settles sooner, as shown in the figure.|Both sensors follow the same trend, as shown in the figure.|Vrchol nastává zde, jak je znázorněno na obrázku.
practical implications|praktické důsledky;praktické dopady|We discussed the practical implications.|What are the practical implications of this result?|The lower stiffness has practical implications for positioning accuracy.|Consider the practical implications before recommending the design.|Probrali jsme praktické důsledky.
address the question|odpovědět na otázku;zabývat se otázkou|Let me address the question directly.|We need more data to address the question.|I will address the question about reliability after presenting the test results.|Does your conclusion address the question posed at the start?|Dovolte mi odpovědět na otázku přímo.
on the basis of|na základě|We selected the motor on the basis of test results.|The decision was made on the basis of cost.|Can you defend the design on the basis of the available evidence?|We revised the model on the basis of the measured deviations.|Motor jsme vybrali na základě výsledků zkoušek.
`,
  ),
  lesson(
    'complaints',
    'Everyday Problems & Complaints',
    'Service problems & complaints',
    'C1',
    'Explain service problems precisely and negotiate a reasonable resolution.',
    `
I'd like to raise an issue|rád bych upozornil na problém;ráda bych upozornila na problém|I'd like to raise an issue with my booking.|I'd like to raise an issue about the delivery.|I'd like to raise an issue concerning the final invoice.|Before I pay, I'd like to raise an issue with the charges.|Rád bych upozornil na problém s mou rezervací.
there seems to be a discrepancy|zdá se, že je tu nesrovnalost;zdá se, že došlo k nesrovnalosti|There seems to be a discrepancy in the bill.|There seems to be a discrepancy between these totals.|There seems to be a discrepancy between the quoted and charged price.|I checked the receipt, and there seems to be a discrepancy.|Zdá se, že je na účtu nesrovnalost.
I was charged for|bylo mi účtováno za;účtovali mi za|I was charged for breakfast twice.|I was charged for a service I did not use.|According to the invoice, I was charged for an extra night.|Could you explain why I was charged for delivery?|Snídaně mi byla účtována dvakrát.
the item arrived damaged|zboží dorazilo poškozené;položka dorazila poškozená|The item arrived damaged yesterday.|I reported that the item arrived damaged.|I took photographs because the item arrived damaged.|The packaging was intact, but the item arrived damaged.|Zboží včera dorazilo poškozené.
I'd appreciate a refund|ocenil bych vrácení peněz;ocenila bych vrácení peněz|I'd appreciate a refund for the cancelled service.|I'd appreciate a refund rather than a voucher.|As no replacement is available, I'd appreciate a refund.|I'd appreciate a refund of the additional delivery charge.|Ocenil bych vrácení peněz za zrušenou službu.
this does not match|toto neodpovídá;tohle neodpovídá|This does not match the description online.|This does not match what we agreed.|This does not match the room category shown on my confirmation.|I ordered a different model, and this does not match my order.|Toto neodpovídá popisu na internetu.
the problem occurred when|problém nastal, když|The problem occurred when I tried to pay.|The problem occurred when the device restarted.|The problem occurred when I changed the delivery address.|For clarity, the problem occurred when the booking was confirmed.|Problém nastal, když jsem se pokusil zaplatit.
could you clarify|mohl byste upřesnit;mohli byste objasnit|Could you clarify the cancellation policy?|Could you clarify this charge?|Before I accept the offer, could you clarify what it covers?|Could you clarify why my booking was changed?|Mohl byste upřesnit storno podmínky?
I'd like this resolved|rád bych, aby se to vyřešilo;ráda bych, aby se to vyřešilo|I'd like this resolved before Friday.|I'd like this resolved without another visit.|I have already contacted support twice, and I'd like this resolved.|I'd like this resolved before the next payment is taken.|Rád bych, aby se to vyřešilo před pátkem.
I was under the impression that|měl jsem za to, že;domníval jsem se, že|I was under the impression that delivery was included.|I was under the impression that the booking was confirmed.|I was under the impression that this repair was covered by the warranty.|When I ordered, I was under the impression that installation was included.|Měl jsem za to, že doručení je zahrnuto v ceně.
proof of payment|doklad o zaplacení;potvrzení o platbě|I can provide proof of payment.|Please attach proof of payment.|The bank transfer confirmation serves as my proof of payment.|Do you need proof of payment to investigate the missing booking?|Mohu poskytnout doklad o zaplacení.
replacement item|náhradní zboží;náhradní kus|When will the replacement item arrive?|The replacement item works correctly.|Please confirm that the replacement item has been dispatched.|I would accept a replacement item if it arrives before my trip.|Kdy dorazí náhradní zboží?
inconvenience caused|způsobené nepříjemnosti;způsobené obtíže|I appreciate your apology for the inconvenience caused.|We discussed the inconvenience caused by the delay.|The response did not acknowledge the inconvenience caused by two missed deliveries.|Could you offer a solution that reflects the inconvenience caused?|Oceňuji vaši omluvu za způsobené nepříjemnosti.
follow up on|navázat na;ověřit stav|I am calling to follow up on my complaint.|Please follow up on the missing parcel.|I would like to follow up on the refund promised last week.|Who should I contact to follow up on this case?|Volám, abych navázal na svou stížnost.
escalate the matter|předat záležitost k vyššímu řešení;předat záležitost nadřízenému|I would like to escalate the matter.|We may need to escalate the matter.|If you cannot authorize a refund, could you escalate the matter?|I hope we can resolve this without having to escalate the matter.|Rád bych předal záležitost k vyššímu řešení.
`,
  ),
  lesson(
    'advanced-everyday',
    'Advanced Everyday English',
    'Nuance & everyday conversation',
    'C1/C2',
    'Express uncertainty, explain impressions and handle awkward situations naturally.',
    `
to some extent|do určité míry;do jisté míry|I agree to some extent.|The delay was unavoidable to some extent.|To some extent, the confusion came from our unclear instructions.|I understand your frustration to some extent, but I need more details.|Do určité míry souhlasím.
that being said|přesto;nicméně|The room is small; that being said, it is comfortable.|It was expensive; that being said, it works well.|The journey was tiring; that being said, I would go again.|The first attempt failed; that being said, we learned a great deal.|Pokoj je malý, přesto je pohodlný.
I'm not entirely convinced|nejsem zcela přesvědčen;nejsem úplně přesvědčený|I'm not entirely convinced this is necessary.|I'm not entirely convinced by that explanation.|I'm not entirely convinced that changing the date will help.|The offer sounds attractive, but I'm not entirely convinced.|Nejsem zcela přesvědčen, že je to nutné.
it turned out that|ukázalo se, že|It turned out that we had the wrong address.|It turned out that the shop was closed.|After several calls, it turned out that the parcel was next door.|It turned out that we had both misunderstood the invitation.|Ukázalo se, že jsme měli špatnou adresu.
I ended up|nakonec jsem;skončil jsem|I ended up taking the train.|I ended up staying an extra night.|When the meeting was cancelled, I ended up working from home.|I ended up paying for a taxi because the last bus had left.|Nakonec jsem jel vlakem.
it caught me off guard|zaskočilo mě to;překvapilo mě to|It caught me off guard when she asked.|I had no warning, so it caught me off guard.|I expected a routine update, but it caught me off guard.|The sudden change was manageable, although it caught me off guard.|Zaskočilo mě, když se zeptala.
I can't quite put my finger on it|nedokážu přesně říct, čím to je;nedokážu to přesně pojmenovat|Something feels wrong, but I can't quite put my finger on it.|I can't quite put my finger on it, but the room feels different.|The explanation is unconvincing, although I can't quite put my finger on it.|I can't quite put my finger on it, but his tone has changed.|Něco mi nesedí, ale nedokážu přesně říct, čím to je.
it doesn't add up|něco na tom nesedí;nedává to smysl|I checked the story, and it doesn't add up.|It doesn't add up when you compare the dates.|They said they left early, but it doesn't add up with the receipt time.|The explanation sounds plausible until you check it; then it doesn't add up.|Ověřil jsem ten příběh a něco na něm nesedí.
I'd rather not jump to conclusions|raději bych nedělal ukvapené závěry;raději bych nevyvozoval unáhlené závěry|I'd rather not jump to conclusions before we speak.|I'd rather not jump to conclusions from one message.|The delay is unusual, but I'd rather not jump to conclusions.|I'd rather not jump to conclusions until we hear both sides.|Raději bych nedělal ukvapené závěry, než si promluvíme.
it's not as straightforward as it seems|není to tak jednoduché, jak se zdá|It's not as straightforward as it seems.|I checked the conditions; it's not as straightforward as it seems.|The application looks simple, but it's not as straightforward as it seems.|Once you consider everyone's schedule, it's not as straightforward as it seems.|Není to tak jednoduché, jak se zdá.
in hindsight|zpětně;z dnešního pohledu|In hindsight, I should have called first.|The choice seems obvious in hindsight.|In hindsight, booking a later train would have been less stressful.|I can see in hindsight why that comment sounded rude.|Zpětně jsem měl nejdříve zavolat.
give someone the benefit of the doubt|dát někomu šanci navzdory pochybnostem;předpokládat dobrou vůli|I try to give someone the benefit of the doubt.|It can help to give someone the benefit of the doubt.|Before assuming dishonesty, I prefer to give someone the benefit of the doubt.|Would you give someone the benefit of the doubt after one missed call?|Snažím se dát člověku šanci navzdory pochybnostem.
get the wrong end of the stick|špatně něco pochopit;nesprávně si něco vyložit|It is easy to get the wrong end of the stick.|I do not want to get the wrong end of the stick.|Without hearing the tone, you might get the wrong end of the stick.|Please explain the context so I do not get the wrong end of the stick.|Člověk může snadno něco špatně pochopit.
put things into perspective|vidět věci v souvislostech;zasadit věci do širších souvislostí|The conversation helped put things into perspective.|A short break can put things into perspective.|Talking to someone outside the project helped me put things into perspective.|Compare this setback with the overall progress to put things into perspective.|Rozhovor mi pomohl vidět věci v souvislostech.
I wouldn't go that far|tak daleko bych nezašel;to bych netvrdil|I wouldn't go that far, but it was disappointing.|I wouldn't go that far in my criticism.|You call it a disaster; I wouldn't go that far.|I agree it needs improvement, although I wouldn't go that far.|Tak daleko bych nezašel, ale bylo to zklamání.
`,
  ),
  lesson(
    'academic-professional',
    'Academic & Professional English',
    'Evidence, argument & evaluation',
    'C1/C2',
    'Evaluate evidence, qualify conclusions and make precise practical recommendations.',
    `
assess whether|posoudit, zda;vyhodnotit, zda|We need to assess whether the method is suitable.|The study will assess whether training helps.|Use the pilot data to assess whether a larger trial is justified.|How would you assess whether the recommendation is practical?|Musíme posoudit, zda je metoda vhodná.
account for|zohlednit;vysvětlit|The model must account for temperature changes.|Several factors may account for the difference.|Did the analysis account for variation between the operators?|A missing calibration step could account for the unexpected result.|Model musí zohlednit změny teploty.
be consistent with|být v souladu s;odpovídat|The result appears to be consistent with our model.|The recommendation should be consistent with the evidence.|A credible explanation must be consistent with all the observations.|The revised estimate may be consistent with the independent measurements.|Výsledek se zdá být v souladu s naším modelem.
arise from|vyplývat z;vznikat z|The difference may arise from sampling.|These difficulties can arise from unclear instructions.|Some of the uncertainty may arise from how the samples were selected.|Could the observed variation arise from differences in test conditions?|Rozdíl může vyplývat ze vzorkování.
to a significant extent|do značné míry;ve značné míře|The outcome depends on preparation to a significant extent.|The changes helped to a significant extent.|To a significant extent, the result reflects the assumptions in the model.|The revised procedure reduced operator variation to a significant extent.|Výsledek do značné míry závisí na přípravě.
draw a conclusion|vyvodit závěr;učinit závěr|We cannot draw a conclusion yet.|Use the evidence to draw a conclusion.|The sample is too small to draw a conclusion about all suppliers.|What additional information would let you draw a conclusion?|Zatím nemůžeme vyvodit závěr.
support the assumption|podpořit předpoklad;podporovat předpoklad|The measurements support the assumption of linearity.|These observations support the assumption.|Does the available data set support the assumption of constant friction?|We need independent evidence to support the assumption used in the calculation.|Měření podporují předpoklad linearity.
challenge the claim|zpochybnit tvrzení|The new evidence may challenge the claim.|We should challenge the claim respectfully.|A contradictory result is a reason to challenge the claim, not ignore the data.|How could an independent experiment challenge the claim about efficiency?|Nové důkazy mohou zpochybnit tvrzení.
a major drawback|zásadní nevýhoda;významný nedostatek|High cost is a major drawback.|The delay remains a major drawback.|The need for specialist equipment is a major drawback of this approach.|Although accurate, the method has a major drawback in field use.|Vysoké náklady jsou zásadní nevýhodou.
a reasonable interpretation|rozumná interpretace;opodstatněný výklad|This is a reasonable interpretation of the data.|We offered a reasonable interpretation.|Is there a reasonable interpretation that does not assume equipment failure?|The pattern allows a reasonable interpretation, but not a certain conclusion.|Tohle je rozumná interpretace dat.
the available evidence|dostupné důkazy;dostupné podklady|The available evidence supports further testing.|We reviewed the available evidence.|Our recommendation reflects the available evidence rather than personal preference.|The available evidence is insufficient to establish a causal relationship.|Dostupné důkazy podporují další testování.
a potential limitation|možné omezení;potenciální omezení|The sample size is a potential limitation.|We identified a potential limitation.|Using only one sensor type introduces a potential limitation to the comparison.|Please discuss a potential limitation that could affect generalization.|Velikost vzorku je možným omezením.
from a practical standpoint|z praktického hlediska|From a practical standpoint, the simpler method is preferable.|Consider the proposal from a practical standpoint.|From a practical standpoint, access for maintenance may outweigh a small efficiency gain.|How would you evaluate the recommendation from a practical standpoint?|Z praktického hlediska je jednodušší metoda vhodnější.
on balance|po zvážení všech okolností;celkově vzato|On balance, we recommend a limited trial.|The change is beneficial on balance.|On balance, the benefits justify testing the approach under controlled conditions.|There are risks, but on balance we favour the revised procedure.|Po zvážení všech okolností doporučujeme omezenou zkoušku.
warrant further investigation|vyžadovat další zkoumání;zasluhovat další zkoumání|The unexpected results warrant further investigation.|These differences warrant further investigation.|The recurring discrepancy may warrant further investigation before deployment.|Do the observed changes warrant further investigation or fall within expected variation?|Neočekávané výsledky vyžadují další zkoumání.
`,
  ),
];
