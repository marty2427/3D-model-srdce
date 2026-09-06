import type { TreatmentId } from '../store'

export interface TreatmentStep {
  title: string
  short: string
  text: string
  watch: string
}

export interface TreatmentInfo {
  id: TreatmentId
  name: string
  short: string
  intro: string
  steps: TreatmentStep[]
  /** kdy se volí */
  when: string[]
  /** výhody / nevýhody */
  pros: string[]
  cons: string[]
  /** zobrazit vložený řez cévou */
  inset: boolean
}

export const treatments: Record<TreatmentId, TreatmentInfo> = {
  pci: {
    id: 'pci',
    name: 'PCI – koronární angioplastika se stentem',
    short: 'Zprůchodnění tepny katetrem: balonek roztáhne zúžení a stent ho podepře.',
    intro:
      '[[pci|Perkutánní koronární intervence]] je dnes hlavní léčba infarktu i významných zúžení. Provádí se v katetrizačním sále, při místním znecitlivění, přes tepnu na zápěstí. ' +
      'Od příjezdu do nemocnice do otevření tepny by mělo uplynout méně než 60–90 minut.',
    steps: [
      {
        title: 'Uzavřená tepna – výchozí stav',
        short: 'Uzávěr',
        text: 'RIA je uzavřena trombem nasedajícím na prasklý plát. Svalovina za uzávěrem trpí ischemií, na EKG jsou elevace ST. Pacient je převezen přímo do katetrizačního centra.',
        watch: 'Průsvit tepny je zcela vyplněn tmavým trombem, krev za ním neteče.',
      },
      {
        title: 'Zavedení katetru a vodiče',
        short: 'Katetr',
        text:
          'Tepnou na zápěstí (a. radialis) se zavede tenký [[katetr]] až k odstupu věnčité tepny z aorty. Nástřik kontrastní látky ([[koronarografie]]) ukáže místo uzávěru. ' +
          'Uzávěrem se pak protáhne tenoučký kovový vodič (0,36 mm), po kterém se posouvají další nástroje.',
        watch: 'Do řezu cévy vjíždí zleva lesklý vodič a prochází skrz trombus za místo uzávěru.',
      },
      {
        title: 'Nafouknutí balonku',
        short: 'Balonek',
        text:
          'Po vodiči se do zúžení zavede balonkový katetr. Balonek se na několik sekund nafoukne tlakem 8–20 atmosfér, rozdrtí a roztlačí plát i trombus do stěny tepny (angioplastika). ' +
          'V této chvíli může pacient krátce cítit bolest na hrudi.',
        watch: 'Průsvitný balonek se v místě léze roztahuje a stlačuje plát ke stěně. Trombus se rozpadá.',
      },
      {
        title: 'Rozvinutí stentu',
        short: 'Stent',
        text:
          'Na dalším balonku je nasazen [[stent]] – kovová síťka. Nafouknutím balonku se rozvine, zatlačí do stěny tepny a trvale ji podepře. Moderní stenty uvolňují lék, který brání ' +
          'opětovnému zúžení. Balonek se vyfoukne a s vodičem vytáhne, stent zůstává navždy.',
        watch: 'Kovová síťka stentu se rozvíjí a drží tepnu otevřenou v celé šíři.',
      },
      {
        title: 'Obnovení průtoku',
        short: 'Průtok obnoven',
        text:
          'Krev opět volně proudí k svalovině. Bolest ustupuje během minut, elevace ST na EKG se zmenšují. Část svaloviny se zachránila („čas jsou svaly“). ' +
          'Následuje 6–12 měsíců duální [[antiagregace|antiagregační léčby]], [[statin]], [[beta-blokator|betablokátor]], ACE inhibitor a kardiorehabilitace.',
        watch: 'Částice krve opět protékají řezem i celou RIA na modelu, přední stěna se zbarvuje zpět a EKG se normalizuje.',
      },
    ],
    when: [
      'Akutní infarkt (STEMI) – primární PCI je léčba první volby',
      'Nestabilní angina pectoris a NSTEMI',
      'Stabilní angina s 1–2 zúženými tepnami, kde léky nestačí',
      'Vhodná anatomie: krátká, dobře přístupná zúžení',
    ],
    pros: ['Bez otevření hrudníku, místní znecitlivění', 'Hospitalizace 2–3 dny, rychlá rekonvalescence', 'Lze provést okamžitě při infarktu'],
    cons: ['Ve stentu může vzniknout sraženina nebo nové zúžení', 'Nutná dlouhodobá antiagregační léčba', 'Hůře řeší mnohočetné a dlouhé zúžení'],
    inset: true,
  },
  cabg: {
    id: 'cabg',
    name: 'Aortokoronární bypass (CABG)',
    short: 'Chirurgické přemostění zúžené tepny vlastní cévou pacienta.',
    intro:
      '[[cabg|Bypass]] „obchází“ zúžení: štěp přivede krev z aorty nebo z hrudní tepny do věnčité tepny až za místo uzávěru. Operuje se v celkové anestezii, obvykle přes hrudní kost, ' +
      'často s pomocí mimotělního oběhu. Typicky se našívají 2–4 bypassy najednou.',
    steps: [
      {
        title: 'Indikace – kdy bypass',
        short: 'Indikace',
        text:
          'Bypass se volí, když jsou zúžené všechny tři hlavní tepny, kmen levé věnčité tepny, u diabetiků, nebo když zúžení nelze dobře řešit stentem. ' +
          'Na modelu je uzavřená RIA a předpokládejme i zúžení RCX.',
        watch: 'Uzavřená RIA (tmavý trombus) a tmavá, neprokrvená přední stěna.',
      },
      {
        title: 'Odběr štěpů',
        short: 'Odběr štěpů',
        text:
          'Nejlepší štěp je [[a-mammaria|levá vnitřní hrudní tepna (LIMA)]]: chirurg ji uvolní od zadní plochy hrudní stěny, ale horní konec nechá napojený na podklíčkovou tepnu. ' +
          'Jako další štěp slouží úsek [[v-saphena|velké povrchové žíly]] z dolní končetiny, případně tepna z předloktí (a. radialis).',
        watch: 'Na modelu se objevuje LIMA sbíhající po přední hrudní stěně (oranžová) a připravený žilní štěp u aorty.',
      },
      {
        title: 'Našití štěpů za místo uzávěru',
        short: 'Našití',
        text:
          'Dolní konec LIMA se jemnými stehy (tenčími než vlas) našije na RIA **za** uzávěrem. Žilní štěp se jedním koncem našije na vzestupnou aortu a druhým na RCX (nebo RCA) za zúžením. ' +
          'Uzavřený úsek tepny zůstává na místě – krev ho prostě obejde.',
        watch: 'LIMA se stáčí k RIA a napojuje se pod trombem; žilní štěp vede z aorty na boční stěnu.',
      },
      {
        title: 'Obnovený tok krve',
        short: 'Průtok obnoven',
        text:
          'Po uvolnění svorek proudí krev štěpy do svaloviny. LIMA zůstává průchodná po 10 letech u více než 90 % pacientů, žilní štěpy asi u 50–60 %. ' +
          'Následuje 1–2 týdny hospitalizace, 2–3 měsíce rekonvalescence, trvale [[statin]] a kyselina acetylsalicylová.',
        watch: 'Částice krve tečou LIMA do RIA za uzávěr, přední stěna se prokrvuje. Původní uzávěr zůstal, ale už nevadí.',
      },
    ],
    when: [
      'Postižení všech tří tepen nebo kmene levé věnčité tepny',
      'Diabetici s mnohočetným postižením',
      'Dlouhá, vápenatá nebo opakovaně se uzavírající zúžení',
      'Kombinace s operací chlopně',
    ],
    pros: ['Trvanlivější výsledek u mnohočetného postižení', 'Tepenný štěp (LIMA) vydrží desítky let', 'Řeší i to, co stent nedokáže'],
    cons: ['Velká operace v celkové anestezii, otevření hrudníku', 'Delší hospitalizace a rekonvalescence', 'Vyšší riziko komplikací u starších a oslabených'],
    inset: false,
  },
  trombolyza: {
    id: 'trombolyza',
    name: 'Trombolýza',
    short: 'Rozpuštění sraženiny lékem podaným do žíly, když PCI není včas dostupná.',
    intro:
      '[[tromboliza|Trombolýza]] aktivuje tělu vlastní systém rozpouštění sraženin (plazmin). Lék (altepláza, tenektepláza) se podá do žíly, nejlépe do 30 minut od příjezdu lékaře – ' +
      'v Česku se používá jen tam, kde by převoz na PCI trval déle než 2 hodiny, což je dnes výjimečné.',
    steps: [
      {
        title: 'Uzavřená tepna – výchozí stav',
        short: 'Uzávěr',
        text: 'RIA je uzavřena čerstvým trombem. Čím je sraženina mladší, tím lépe se rozpouští – po 12 hodinách už trombolýza nemá smysl.',
        watch: 'Průsvit vyplněný trombem, krev za ním neteče.',
      },
      {
        title: 'Podání léku do žíly',
        short: 'Podání léku',
        text:
          'Lékař záchranné služby nebo nemocnice podá trombolytikum nitrožilně jako injekci nebo krátkou infuzi. Lék se krví dostane ke sraženině a začne rozkládat fibrinovou síť, která ji drží pohromadě.',
        watch: 'Tyrkysové částice léku přitékají krví ke trombu.',
      },
      {
        title: 'Rozpouštění trombu',
        short: 'Rozpouštění',
        text:
          'Během 30–90 minut se sraženina rozpadá a průtok se částečně obnovuje. U 60–70 % nemocných se tepna otevře. Vedlejším účinkem je celkově zvýšená krvácivost – nejzávažnější komplikací je krvácení do mozku (asi 1 %).',
        watch: 'Trombus se zmenšuje, mezi jeho zbytky se objevuje první tok.',
      },
      {
        title: 'Obnovený průtok a další péče',
        short: 'Průtok obnoven',
        text:
          'Prasklý plát zůstává na místě, proto se pacient co nejdříve převeze na [[pci|PCI]] a zúžení se ošetří [[stent|stentem]] (do 24 hodin). Dále stejná dlouhodobá léčba jako po infarktu.',
        watch: 'Krev opět protéká, plát ale zůstává – tepna je stále zúžená.',
      },
    ],
    when: ['STEMI, když PCI není dosažitelná do 120 minut', 'Nejlépe do 3 hodin od začátku bolesti', 'Bez rizika krvácení (nedávná operace, mrtvice, úraz)'],
    pros: ['Lze podat kdekoli, i v sanitce', 'Rychlé zahájení léčby', 'Nevyžaduje katetrizační sál'],
    cons: ['Otevře tepnu jen u 60–70 % nemocných', 'Riziko krvácení včetně krvácení do mozku', 'Plát zůstává, obvykle je stejně nutná PCI'],
    inset: true,
  },
  kardiostimulator: {
    id: 'kardiostimulator',
    name: 'Kardiostimulátor',
    short: 'Elektrický „náhradní udavatel rytmu“ při příliš pomalém tepu.',
    intro:
      '[[kardiostimulator|Kardiostimulátor]] neléčí ucpanou tepnu, ale poruchu převodního systému: když SA uzel selhává nebo AV uzel nepropouští vzruchy (AV blokáda), ' +
      'srdce bije příliš pomalu ([[bradykardie]]) a nemocný omdlévá. Přístroj sleduje vlastní rytmus a chybějící stahy doplní elektrickým impulzem.',
    steps: [
      {
        title: 'Bradykardie – pomalý tep',
        short: 'Bradykardie',
        text:
          'Nemocný SA uzel nebo blokáda převodu způsobí tep kolem 30–40/min. Mozek dostává málo krve – únava, závratě, náhlé mdloby (Adams-Stokesův záchvat). ' +
          'Nejčastější příčinou je stárnutí převodního systému, někdy infarkt spodní stěny (RCA zásobuje AV uzel) nebo léky.',
        watch: 'Srdce na modelu tepe velmi pomalu, EKG ukazuje řídké komplexy.',
      },
      {
        title: 'Implantace přístroje a elektrod',
        short: 'Implantace',
        text:
          'Při místním znecitlivění se pod kůži pod levou klíční kostí vytvoří kapsa pro přístroj velikosti zapalovače. Elektrody se zavedou podklíčkovou žílou přes horní dutou žílu ' +
          'do pravé síně a do hrotu pravé komory, kde se zachytí ve svalovině. Výkon trvá asi hodinu.',
        watch: 'Na modelu se objevuje přístroj v podkoží a elektroda vedoucí horní dutou žílou do hrotu pravé komory.',
      },
      {
        title: 'Stimulace – obnovený rytmus',
        short: 'Stimulace',
        text:
          'Přístroj snímá vlastní aktivitu a jakmile tep klesne pod nastavenou mez (např. 60/min), vyšle impulz o síle 1–3 V. Na EKG je před QRS vidět úzký „hrot“ stimulu. ' +
          'Baterie vydrží 8–12 let, poté se vymění jen přístroj. Moderní přístroje zrychlují tep při námaze a umožňují vyšetření magnetickou rezonancí.',
        watch: 'Hrot elektrody v pravé komoře zabliká při každém impulzu, tep se vrací na 70/min a na EKG je před QRS stimulační hrot.',
      },
    ],
    when: ['Symptomatická bradykardie (sick sinus syndrom)', 'AV blokáda II. a III. stupně', 'Srdeční selhání s blokádou raménka (resynchronizace)', 'Po některých operacích srdce'],
    pros: ['Malý výkon při místním znecitlivění', 'Okamžitý účinek, návrat k běžnému životu', 'Baterie na 8–12 let'],
    cons: ['Trvalé cizí těleso, kontroly 1–2× ročně', 'Riziko infekce kapsy nebo dislokace elektrody', 'Neléčí ischemii ani selhání pumpy'],
    inset: false,
  },
}

export const treatmentList = Object.values(treatments)

/** Srovnání stent vs. bypass */
export const stentVsBypass: { crit: string; stent: string; bypass: string }[] = [
  { crit: 'Způsob', stent: 'Katetrem přes tepnu na zápěstí', bypass: 'Operace, otevření hrudníku' },
  { crit: 'Anestezie', stent: 'Místní', bypass: 'Celková' },
  { crit: 'Doba výkonu', stent: '30–90 minut', bypass: '3–5 hodin' },
  { crit: 'Hospitalizace', stent: '1–3 dny', bypass: '7–10 dní' },
  { crit: 'Rekonvalescence', stent: 'Dny', bypass: '2–3 měsíce' },
  { crit: 'Nejvhodnější pro', stent: 'Infarkt, 1–2 krátká zúžení', bypass: 'Kmen, 3 tepny, diabetici' },
  { crit: 'Trvanlivost', stent: '5–10 % nové zúžení ve stentu', bypass: 'LIMA > 90 % po 10 letech' },
  { crit: 'Dlouhodobé léky', stent: 'Duální antiagregace 6–12 měsíců', bypass: 'Kys. acetylsalicylová trvale' },
]
