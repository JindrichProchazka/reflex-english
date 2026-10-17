import type { StudyLesson } from '../domain/study-models';
import { advancedLessons } from './advanced-lessons';

// Authored, controlled language: every example contains the exact target phrase.
// Additional Czech equivalents are separated by semicolons, not AI-generated.
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
        const [english, czech, first, second] = line.trim().split('|');
        return {
          id: `${id}-${index + 1}`,
          english,
          czech: czech.split(';')[0],
          acceptedCzech: czech.split(';'),
          examples: [first, second],
        };
      }),
  };
}

export const initialStudyLessons: StudyLesson[] = [
  lesson(
    'hotel',
    'Hotel / reception',
    'Travel & accommodation',
    'B1',
    'Check in, explain a problem and arrange your stay.',
    `
reservation|rezervace|I have a reservation for tonight.|Can you find my reservation?
check in|ubytovat se;přihlásit se k pobytu|Can I check in now?|We need to check in before dinner.
check out|odhlásit se z hotelu;ukončit pobyt|What time do we check out?|We would like to check out early.
single room|jednolůžkový pokoj|I booked a single room.|Is a single room available tonight?
double room|dvoulůžkový pokoj|We need a double room.|Does the double room have a desk?
available|volný;k dispozici;dostupný|Is a room available tonight?|The meeting room is available after lunch.
key card|karta od pokoje;přístupová karta|My key card does not work.|Could I have another key card?
breakfast included|snídaně v ceně|Is breakfast included in the price?|We would like breakfast included in our booking.
reception desk|recepce;recepční pult|Please ask at the reception desk.|Leave the key at the reception desk.
late arrival|pozdní příjezd|Please note our late arrival.|Is there a charge for late arrival?
luggage storage|úschovna zavazadel;uložení zavazadel|Do you offer luggage storage?|Where is the luggage storage area?
extra charge|příplatek;poplatek navíc|Is there an extra charge for parking?|Please explain this extra charge.
quiet room|tichý pokoj;klidný pokoj|Could we have a quiet room?|I asked for a quiet room away from the lift.
extend my stay|prodloužit si pobyt;prodloužit svůj pobyt|Can I extend my stay by one night?|I would like to extend my stay until Friday.
receipt|účtenka;doklad o zaplacení|Could I have a receipt?|Please send the receipt by email.
`,
  ),
  lesson(
    'teacher',
    'Talking to a teacher',
    'University & studying',
    'B1/B2',
    'Discuss assignments, clarify expectations and request feedback.',
    `
submit an assignment|odevzdat úkol;odevzdat práci|I need to submit an assignment today.|Where can I submit an assignment online?
meet the deadline|dodržet termín;stihnout termín|I will try to meet the deadline.|We need help to meet the deadline.
ask for clarification|požádat o vysvětlení;požádat o upřesnění|May I ask for clarification?|Please ask for clarification before starting.
office hours|konzultační hodiny|When are your office hours?|Can I visit during office hours?
lecture|přednáška|The lecture starts at nine.|I have a question about the lecture.
attend a seminar|zúčastnit se semináře;navštívit seminář|I need to attend a seminar on Monday.|Can I attend a seminar with another group?
feedback|zpětná vazba|Could you give me some feedback?|Your feedback helped me improve the report.
assessment criteria|kritéria hodnocení|Where can I find the assessment criteria?|Could you explain the assessment criteria?
extension|prodloužení lhůty;prodloužení termínu|Could I request an extension?|An extension would help me finish the experiment.
make up for|nahradit;vynahradit|How can I make up for the missed class?|I will do extra work to make up for my absence.
revise my work|přepracovat svou práci;upravit svou práci|May I revise my work after your feedback?|I need time to revise my work.
refer to|odkazovat na;odkázat na|Please refer to the course handbook.|Can I refer to this diagram in my answer?
understand the requirements|rozumět požadavkům;pochopit požadavky|I want to understand the requirements first.|We need to understand the requirements for the report.
hand in|odevzdat|When should I hand in the report?|May I hand in a printed copy?
explain in more detail|vysvětlit podrobněji|Could you explain in more detail?|Please explain in more detail how the method works.
`,
  ),
  lesson(
    'study-office',
    'University office / study department',
    'University administration',
    'B1/B2',
    'Handle enrolment, documents and study arrangements.',
    `
enrol in a course|zapsat se do kurzu;přihlásit se do kurzu|How can I enrol in a course?|I would like to enrol in a course next term.
student ID|studentský průkaz|Please show your student ID.|I need a replacement student ID.
proof of enrolment|potvrzení o studiu|Could I get proof of enrolment?|The bank needs proof of enrolment.
application form|formulář žádosti;přihláška|Where can I find the application form?|Please sign the application form.
fill in a form|vyplnit formulář|Do I need to fill in a form?|You can fill in a form online.
required documents|požadované dokumenty;potřebné dokumenty|Please bring the required documents.|Where should I upload the required documents?
transcript of records|výpis studijních výsledků;výpis známek|I need a transcript of records.|Can you email my transcript of records?
tuition fees|školné|When are tuition fees due?|Does this programme charge tuition fees?
scholarship|stipendium|I would like to apply for a scholarship.|What are the conditions for this scholarship?
appointment|schůzka;domluvená schůzka|Do I need an appointment?|I would like to change my appointment.
credit transfer|uznání kreditů;převod kreditů|Who handles credit transfer?|I have a question about credit transfer.
request a certificate|požádat o potvrzení;požádat o osvědčení|How can I request a certificate?|I need to request a certificate in English.
change my timetable|změnit si rozvrh;změnit svůj rozvrh|Can I change my timetable?|I need to change my timetable because two classes overlap.
supporting documents|podpůrné dokumenty;přílohy žádosti|Please attach the supporting documents.|Are these supporting documents sufficient?
processing time|doba vyřízení;doba zpracování|What is the usual processing time?|The processing time is about one week.
`,
  ),
  lesson(
    'airport',
    'Airport',
    'Air travel',
    'B1/B2',
    'Check baggage, find your flight and handle changes.',
    `
boarding pass|palubní vstupenka|Please show your boarding pass.|I cannot find my boarding pass.
departure gate|odletová brána|Where is the departure gate?|Has the departure gate changed?
carry-on baggage|příruční zavazadlo;příruční zavazadla|Is this allowed in carry-on baggage?|What is the limit for carry-on baggage?
checked baggage|odbavené zavazadlo;odbavená zavazadla|Does my ticket include checked baggage?|Where can I collect my checked baggage?
security check|bezpečnostní kontrola|Please remove your laptop at the security check.|How long does the security check take?
connecting flight|navazující let;přestupní let|I might miss my connecting flight.|Where do I board my connecting flight?
flight delay|zpoždění letu|There is a flight delay.|Who can explain the flight delay?
boarding time|čas nástupu do letadla|What is the boarding time?|The boarding time has changed.
passport control|pasová kontrola|Follow the signs to passport control.|Do we go through passport control here?
baggage claim|výdej zavazadel|Where is baggage claim?|My bag did not arrive at baggage claim.
departure board|odletová tabule|Check the departure board.|The departure board shows a new gate.
miss a flight|zmeškat let|I do not want to miss a flight.|What happens if I miss a flight?
window seat|místo u okna;sedadlo u okna|Could I have a window seat?|Is a window seat still available?
aisle seat|místo do uličky;sedadlo do uličky|I would prefer an aisle seat.|May I change to an aisle seat?
rebook my flight|přebookovat svůj let;změnit rezervaci letu|Can I rebook my flight?|I need to rebook my flight for tomorrow.
`,
  ),
  lesson(
    'transport',
    'Train and bus travel',
    'Ground transport',
    'B1',
    'Buy tickets, change services and check travel information.',
    `
return ticket|zpáteční jízdenka|I would like a return ticket.|How much is a return ticket to Prague?
single ticket|jednosměrná jízdenka|Could I buy a single ticket?|A single ticket is enough for today.
platform|nástupiště|Which platform does the train leave from?|Please wait on the platform.
bus stop|autobusová zastávka|Where is the nearest bus stop?|The bus stop is outside the station.
timetable|jízdní řád;rozvrh|Is this timetable up to date?|Can I see the timetable for Sunday?
change trains|přestoupit na jiný vlak;přestupovat|Do I need to change trains?|We have ten minutes to change trains.
seat reservation|rezervace místa;rezervace sedadla|Do I need a seat reservation?|My ticket includes a seat reservation.
validate the ticket|označit jízdenku;ověřit platnost jízdenky|Where should I validate the ticket?|You must validate the ticket before boarding.
get off|vystoupit|Where should I get off?|We need to get off at the next stop.
get on|nastoupit|Can we get on at this door?|Wait for passengers to leave before you get on.
miss the connection|zmeškat přípoj;nestihnout přípoj|We might miss the connection.|What should I do if I miss the connection?
replacement bus|náhradní autobus|Where does the replacement bus leave from?|We need to take a replacement bus.
running late|má zpoždění;opožděný|The train is running late.|Our bus is running late again.
destination|cíl cesty;cílová stanice|What is your final destination?|Please select your destination on the screen.
request stop|zastávka na znamení|This is a request stop.|Press the button before a request stop.
`,
  ),
  lesson(
    'factory',
    'Factory / production',
    'Manufacturing',
    'B1/B2',
    'Discuss safety, production flow and product quality.',
    `
production line|výrobní linka|The production line stops at six.|We need to inspect the production line.
quality control|kontrola kvality|This part must pass quality control.|Who is responsible for quality control?
safety instructions|bezpečnostní pokyny|Please read the safety instructions.|Always follow the safety instructions.
protective equipment|ochranné prostředky;ochranné vybavení|Wear the required protective equipment.|Where can I get protective equipment?
raw material|surovina;výchozí materiál|We need more raw material.|Check the quality of the raw material.
finished product|hotový výrobek|Inspect each finished product.|The finished product is ready for packing.
assembly process|montážní proces;postup montáže|Can you explain the assembly process?|We want to improve the assembly process.
defective part|vadný díl;vadná součástka|Do not use a defective part.|Place the defective part in this container.
production target|výrobní cíl;cíl výroby|We need to meet the production target.|Is this production target realistic?
maintenance schedule|plán údržby;harmonogram údržby|Please check the maintenance schedule.|The maintenance schedule has changed.
shift change|střídání směn;výměna směn|Report any problems at shift change.|The machine stopped during shift change.
stock shortage|nedostatek zásob|We have a stock shortage.|A stock shortage may delay production.
reduce waste|snížit množství odpadu;omezit plýtvání|We need to reduce waste.|This change will help us reduce waste.
inspect the equipment|zkontrolovat zařízení;provést kontrolu zařízení|Please inspect the equipment before use.|We need to inspect the equipment after the repair.
meet the specification|splnit specifikaci;vyhovět specifikaci|Each part must meet the specification.|Will this material meet the specification?
`,
  ),
  lesson(
    'project',
    'Office / project work',
    'Workplace communication',
    'B2',
    'Coordinate work, manage expectations and agree on decisions.',
    `
meet the deadline|dodržet termín;stihnout termín|Can we meet the deadline with this team?|We need a clear plan to meet the deadline.
project requirements|požadavky projektu;projektové požadavky|Let us review the project requirements.|Have the project requirements changed?
feasible approach|proveditelný postup;realistický přístup|We need a feasible approach.|Is this a feasible approach within our budget?
provide an estimate|poskytnout odhad;vypracovat odhad|Could you provide an estimate today?|We need more data to provide an estimate.
postpone the meeting|odložit schůzku;přesunout schůzku na později|Can we postpone the meeting?|We may need to postpone the meeting until Friday.
clarify the scope|upřesnit rozsah;objasnit rozsah|We should clarify the scope first.|Could you clarify the scope of this task?
raise a concern|vyjádřit obavu;upozornit na problém|I would like to raise a concern.|Please raise a concern before we approve the design.
agree on priorities|dohodnout se na prioritách|Let us agree on priorities.|We need to agree on priorities before Monday.
keep track of|sledovat;mít přehled o|How do we keep track of changes?|This list helps us keep track of tasks.
follow up on|navázat na;ověřit další vývoj|I will follow up on your request.|Could you follow up on the open issues?
potential drawback|možná nevýhoda;potenciální nevýhoda|What is the main potential drawback?|We should discuss this potential drawback.
alternative solution|alternativní řešení;jiné řešení|Can you suggest an alternative solution?|We need an alternative solution for the delay.
allocate resources|přidělit zdroje;rozdělit prostředky|How should we allocate resources?|We need to allocate resources more carefully.
reach an agreement|dosáhnout dohody;dohodnout se|We hope to reach an agreement today.|Can we reach an agreement on the next steps?
take responsibility for|převzít odpovědnost za;nést odpovědnost za|I will take responsibility for the report.|Who will take responsibility for testing?
`,
  ),
  lesson(
    'troubleshooting',
    'Technical troubleshooting',
    'Engineering & diagnostics',
    'B2',
    'Describe faults, test causes and report reliable measurements.',
    `
machine failure|porucha stroje;selhání stroje|A machine failure stopped production.|We need to find the cause of the machine failure.
troubleshoot a problem|hledat a odstranit závadu;řešit technický problém|We need to troubleshoot a problem with the motor.|Can you help me troubleshoot a problem in the control system?
identify the cause|zjistit příčinu;určit příčinu|We need to identify the cause of the vibration.|These tests will help us identify the cause.
faulty component|vadná součástka;vadná součást|Replace the faulty component.|Could a faulty component explain these readings?
loose connection|uvolněný spoj;uvolněné spojení|Check for a loose connection.|A loose connection can interrupt the signal.
power supply|napájecí zdroj;napájení|Check the power supply first.|The power supply is unstable.
calibrate the sensor|kalibrovat snímač;kalibrovat senzor|We must calibrate the sensor before testing.|Can you calibrate the sensor against this reference?
measurement error|chyba měření|This difference may be a measurement error.|How can we reduce the measurement error?
within tolerance|v toleranci;v mezích tolerance|The diameter is within tolerance.|Are these readings within tolerance?
excessive vibration|nadměrné vibrace;nadměrné chvění|The motor has excessive vibration.|Excessive vibration may indicate bearing wear.
replace the bearing|vyměnit ložisko|We need to replace the bearing.|Can we replace the bearing without removing the motor?
isolate the fault|lokalizovat závadu;izolovat závadu|Test each section to isolate the fault.|We need to isolate the fault before replacing parts.
reproduce the issue|zopakovat problém;reprodukovat problém|Can you reproduce the issue under load?|We could not reproduce the issue during the test.
under load|při zatížení;pod zatížením|The motor overheats under load.|Test the system under load before delivery.
verify the results|ověřit výsledky|Please verify the results with a second measurement.|We need to verify the results before changing the design.
`,
  ),
  lesson(
    'restaurant',
    'Restaurant / café',
    'Food & service',
    'B1',
    'Order, explain preferences and resolve small service problems.',
    `
book a table|rezervovat stůl|Could I book a table for two?|I would like to book a table for tonight.
menu|jídelní lístek;nabídka|Could we see the menu?|Is there an English menu?
daily special|denní nabídka;dnešní specialita|What is the daily special?|Does the daily special include soup?
tap water|voda z kohoutku;kohoutková voda|Could we have some tap water?|Is tap water available?
food allergy|potravinová alergie;alergie na potraviny|I have a food allergy.|Please tell the waiter about your food allergy.
without onions|bez cibule|Could I have it without onions?|Please prepare the salad without onions.
side dish|příloha|Which side dish would you recommend?|Does the meal include a side dish?
takeaway|jídlo s sebou;s sebou|Is this available as a takeaway?|I would like a takeaway, please.
split the bill|rozdělit účet|Could we split the bill?|We would like to split the bill between three people.
pay by card|platit kartou;zaplatit kartou|Can I pay by card?|I would prefer to pay by card.
service charge|poplatek za obsluhu|Is the service charge included?|What does this service charge cover?
order a coffee|objednat si kávu;objednat kávu|I would like to order a coffee.|Can we order a coffee before lunch?
still water|neperlivá voda|Could I have still water?|We ordered still water for the table.
sparkling water|perlivá voda|I would like sparkling water.|Do you have sparkling water in a small bottle?
wrong order|nesprávná objednávka;špatná objednávka|I think this is the wrong order.|Could you check this wrong order for us?
`,
  ),
  lesson(
    'everyday',
    'Everyday practical problems',
    'Home, shops & repairs',
    'B1/B2',
    'Describe ordinary problems, arrange repairs and ask for help.',
    `
request a refund|požádat o vrácení peněz;žádat vrácení peněz|I would like to request a refund.|How can I request a refund for this item?
proof of purchase|doklad o koupi;doklad o nákupu|Do you need proof of purchase?|I have proof of purchase on my phone.
faulty appliance|vadný spotřebič;porouchaný spotřebič|I need to return a faulty appliance.|Can you repair this faulty appliance?
plug in the charger|zapojit nabíječku|Please plug in the charger.|Can I plug in the charger here?
power socket|elektrická zásuvka;zásuvka|Is there a power socket near the desk?|This power socket does not work.
wipe up a spill|utřít rozlitou tekutinu;utřít rozlitou vodu|I need to wipe up a spill.|Use this cloth to wipe up a spill.
blocked drain|ucpaný odtok;ucpaný odpad|We have a blocked drain in the kitchen.|Who can fix this blocked drain?
leaking tap|kapající kohoutek;netěsnící kohoutek|Could you repair the leaking tap?|A leaking tap is wasting water.
arrange a repair|domluvit opravu;zařídit opravu|I need to arrange a repair.|Can we arrange a repair for next week?
spare key|náhradní klíč|Do you have a spare key?|I left a spare key with my neighbour.
collect a parcel|vyzvednout balík;vyzvednout zásilku|Where can I collect a parcel?|I need an ID to collect a parcel.
delivery address|doručovací adresa;adresa doručení|Please check the delivery address.|Can I change the delivery address?
run out of|dojít;spotřebovat všechny zásoby|We might run out of milk.|Do not let the printer run out of paper.
come loose|uvolnit se|This screw may come loose.|The handle has started to come loose.
keep the receipt|uschovat účtenku;nechat si účtenku|Please keep the receipt.|You should keep the receipt until the repair is complete.
`,
  ),
];
export const studyLessons: StudyLesson[] = [
  ...initialStudyLessons,
  ...advancedLessons,
];
