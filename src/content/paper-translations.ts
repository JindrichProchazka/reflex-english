import { advancedLessons } from './advanced-lessons';
// Czech prompts correspond to the first authored example of each lesson word.
// These are reference translations; other natural English answers can be valid.
export const paperTranslations: Record<string, string[]> = Object.fromEntries(
  Object.entries({
    hotel: `Na dnešní noc mám rezervaci.
Mohu se ubytovat hned?
V kolik hodin se máme odhlásit z hotelu?
Rezervoval jsem si jednolůžkový pokoj.
Potřebujeme dvoulůžkový pokoj.
Je na dnešní noc volný pokoj?
Moje karta od pokoje nefunguje.
Je snídaně zahrnutá v ceně?
Zeptejte se prosím na recepci.
Poznamenejte si prosím náš pozdní příjezd.
Nabízíte úschovu zavazadel?
Je za parkování příplatek?
Mohli bychom dostat tichý pokoj?
Mohu si prodloužit pobyt o jednu noc?
Mohl bych dostat účtenku?`,
    teacher: `Dnes musím odevzdat úkol.
Pokusím se dodržet termín.
Mohu požádat o vysvětlení?
Kdy máte konzultační hodiny?
Přednáška začíná v devět.
V pondělí se musím zúčastnit semináře.
Mohl byste mi dát zpětnou vazbu?
Kde najdu kritéria hodnocení?
Mohl bych požádat o prodloužení lhůty?
Jak mohu nahradit zameškanou hodinu?
Mohu po vaší zpětné vazbě přepracovat svou práci?
Podívejte se prosím do příručky ke kurzu.
Nejdříve chci porozumět požadavkům.
Kdy mám odevzdat zprávu?
Mohl byste to vysvětlit podrobněji?`,
    'study-office': `Jak se mohu zapsat do kurzu?
Ukažte prosím svůj studentský průkaz.
Mohl bych dostat potvrzení o studiu?
Kde najdu formulář žádosti?
Musím vyplnit formulář?
Přineste prosím požadované dokumenty.
Potřebuji výpis studijních výsledků.
Kdy je splatné školné?
Rád bych požádal o stipendium.
Musím se předem objednat na schůzku?
Kdo má na starosti uznání kreditů?
Jak mohu požádat o potvrzení?
Mohu si změnit rozvrh?
Přiložte prosím podpůrné dokumenty.
Jaká je obvyklá doba vyřízení?`,
    airport: `Ukažte prosím palubní vstupenku.
Kde je odletová brána?
Je to povoleno v příručním zavazadle?
Zahrnuje moje letenka odbavené zavazadlo?
Při bezpečnostní kontrole prosím vyndejte notebook.
Možná zmeškám navazující let.
Let má zpoždění.
V kolik hodin je nástup do letadla?
Jděte podle značek k pasové kontrole.
Kde je výdej zavazadel?
Podívejte se na odletovou tabuli.
Nechci zmeškat let.
Mohl bych dostat místo u okna?
Raději bych místo do uličky.
Mohu si přebookovat let?`,
    transport: `Chtěl bych zpáteční jízdenku.
Mohl bych si koupit jednosměrnou jízdenku?
Ze kterého nástupiště vlak odjíždí?
Kde je nejbližší autobusová zastávka?
Je tento jízdní řád aktuální?
Musím přestoupit na jiný vlak?
Potřebuji rezervaci místa?
Kde si mám označit jízdenku?
Kde mám vystoupit?
Můžeme nastoupit těmito dveřmi?
Možná zmeškáme přípoj.
Odkud odjíždí náhradní autobus?
Vlak má zpoždění.
Jaký je konečný cíl vaší cesty?
Toto je zastávka na znamení.`,
    factory: `Výrobní linka končí v šest.
Tento díl musí projít kontrolou kvality.
Přečtěte si prosím bezpečnostní pokyny.
Používejte požadované ochranné prostředky.
Potřebujeme více suroviny.
Zkontrolujte každý hotový výrobek.
Můžete vysvětlit montážní proces?
Nepoužívejte vadný díl.
Musíme splnit výrobní cíl.
Zkontrolujte prosím plán údržby.
Při střídání směn hlaste všechny problémy.
Máme nedostatek zásob.
Musíme omezit plýtvání.
Před použitím prosím zkontrolujte zařízení.
Každý díl musí splňovat specifikaci.`,
    project: `Dokážeme s tímto týmem dodržet termín?
Projděme si požadavky projektu.
Potřebujeme proveditelný postup.
Mohl byste dnes poskytnout odhad?
Můžeme schůzku odložit?
Nejdříve bychom měli upřesnit rozsah.
Rád bych vyjádřil obavu.
Dohodněme se na prioritách.
Jak sledujeme změny?
Zjistím další vývoj vaší žádosti.
Jaká je hlavní možná nevýhoda?
Můžete navrhnout alternativní řešení?
Jak bychom měli přidělit zdroje?
Doufáme, že dnes dosáhneme dohody.
Převezmu odpovědnost za zprávu.`,
    troubleshooting: `Výrobu zastavila porucha stroje.
Musíme vyřešit technický problém s motorem.
Musíme zjistit příčinu vibrací.
Vyměňte vadnou součástku.
Zkontrolujte, zda není uvolněný spoj.
Nejdříve zkontrolujte napájecí zdroj.
Před testováním musíme kalibrovat snímač.
Tento rozdíl může být způsoben chybou měření.
Průměr je v toleranci.
Motor má nadměrné vibrace.
Musíme vyměnit ložisko.
Testujte jednotlivé části, abyste lokalizovali závadu.
Dokážete problém zopakovat při zatížení?
Motor se při zatížení přehřívá.
Ověřte prosím výsledky druhým měřením.`,
    restaurant: `Mohl bych rezervovat stůl pro dva?
Mohli bychom se podívat na jídelní lístek?
Jaká je dnešní nabídka?
Mohli bychom dostat vodu z kohoutku?
Mám potravinovou alergii.
Mohl bych to dostat bez cibule?
Jakou přílohu byste doporučil?
Je možné si to vzít s sebou?
Mohli bychom rozdělit účet?
Mohu zaplatit kartou?
Je poplatek za obsluhu zahrnutý?
Rád bych si objednal kávu.
Mohl bych dostat neperlivou vodu?
Rád bych perlivou vodu.
Myslím, že tohle je nesprávná objednávka.`,
    everyday: `Rád bych požádal o vrácení peněz.
Potřebujete doklad o koupi?
Musím vrátit vadný spotřebič.
Zapojte prosím nabíječku.
Je u stolu elektrická zásuvka?
Musím utřít rozlitou tekutinu.
V kuchyni máme ucpaný odtok.
Mohl byste opravit kapající kohoutek?
Musím domluvit opravu.
Máte náhradní klíč?
Kde si mohu vyzvednout balík?
Zkontrolujte prosím doručovací adresu.
Možná nám dojde mléko.
Tento šroub se může uvolnit.
Uschovejte prosím účtenku.`,
  }).map(([id, text]) => [id, text.split('\n')]),
);
Object.assign(
  paperTranslations,
  Object.fromEntries(
    advancedLessons.map((l) => [l.id, l.words.map((w) => w.paperTranslation!)]),
  ),
);
