import type { DiseaseId } from '../store'

export interface DiseaseInfo {
  id: DiseaseId
  name: string
  category: 'ischemicka' | 'arytmie' | 'selhani' | 'chlopne'
  short: string
  /** Co se děje (patofyziologie) */
  what: string
  /** Co vidíte na modelu a na EKG */
  model: string
  causes: string[]
  symptoms: string[]
  risks: string[]
  treatment: string[]
}

export const diseaseCategories: { id: DiseaseInfo['category']; name: string }[] = [
  { id: 'ischemicka', name: 'Ischemická choroba srdeční' },
  { id: 'arytmie', name: 'Arytmie' },
  { id: 'selhani', name: 'Srdeční selhání' },
  { id: 'chlopne', name: 'Chlopenní vady' },
]

export const diseases: Record<DiseaseId, DiseaseInfo> = {
  ichs: {
    id: 'ichs',
    name: 'Ischemická choroba srdeční (stabilní angina pectoris)',
    category: 'ischemicka',
    short: 'Zúžení věnčité tepny aterosklerotickým plátem – při námaze srdce „nestíhá“.',
    what:
      'Ve stěně věnčité tepny se desítky let ukládá [[ldl|LDL cholesterol]] a vzniká [[plat|aterosklerotický plát]]. Jakmile zúží průsvit o více než 50–70 %, ' +
      'v klidu ještě stačí, ale při námaze svalovina za zúžením trpí nedostatkem kyslíku – vzniká [[ischemie]] a bolest ([[angina|angina pectoris]]). Po odpočinku bolest během minut ustoupí.',
    model:
      'V RIA je vidět žlutavý plát zužující průsvit; tepna za ním je tmavší (menší průtok). Na EKG je při zátěži typická **deprese úseku ST** a oploštění vlny T.',
    causes: ['Ateroskleróza věnčitých tepen (naprostá většina případů)', 'Vzácně spazmus tepny, zánět, vrozené anomálie'],
    symptoms: [
      'Svíravá, tlaková bolest za hrudní kostí při námaze, stresu nebo chladu',
      'Šíření bolesti do levé paže, krku, čelisti nebo mezi lopatky',
      'Dušnost při námaze, ústup obtíží v klidu do 10 minut',
      'U diabetiků a seniorů může být „němá“ – jen dušnost či únava',
    ],
    risks: ['Kouření', 'Vysoký LDL cholesterol', 'Vysoký krevní tlak', 'Cukrovka', 'Obezita a nedostatek pohybu', 'Věk, mužské pohlaví, rodinná zátěž'],
    treatment: [
      'Změna životního stylu: nekouřit, pohyb, strava, hmotnost',
      '[[statin|Statiny]], kyselina acetylsalicylová, [[beta-blokator|betablokátory]], nitráty při bolesti',
      'Léčba tlaku a cukrovky',
      'Při významném zúžení [[pci|PCI]] se [[stent|stentem]] nebo [[cabg|bypass]]',
    ],
  },
  infarkt: {
    id: 'infarkt',
    name: 'Akutní infarkt myokardu',
    category: 'ischemicka',
    short: 'Náhlý uzávěr věnčité tepny krevní sraženinou – část svaloviny odumírá.',
    what:
      'Praskne tenká čepička plátu, obnaží se jeho obsah a během minut se na něm vytvoří [[trombus]], který tepnu uzavře. Svalovina za uzávěrem přestane dostávat kyslík; ' +
      'po 20–30 minutách začínají buňky odumírat ([[nekroza|nekróza]]) od vnitřní vrstvy k povrchu. Do 6–12 hodin je bez léčby odumřelá celá zásobená oblast. „Čas jsou svaly.“',
    model:
      'RIA je uzavřena tmavým trombem, tepna za ním neprokrvuje. Přední stěna levé komory se zbarví do tmava (ischemie) a nehýbe se tak silně. Na EKG jsou **elevace úseku ST** ([[stemi|STEMI]]).',
    causes: ['Ruptura nebo eroze aterosklerotického plátu s trombózou (90 %)', 'Vzácně spazmus, embolie do věnčité tepny, disekce tepny'],
    symptoms: [
      'Silná, svíravá bolest na hrudi trvající déle než 20 minut, neustupuje v klidu',
      'Šíření do paže, krku, zad; studený pot, nevolnost, úzkost („strach ze smrti“)',
      'Dušnost, slabost, bušení srdce, u části nemocných jen dušnost či nevolnost',
      'Při podezření okamžitě volat 155 – každá minuta se počítá',
    ],
    risks: ['Stejné jako u ICHS: kouření, LDL cholesterol, hypertenze, diabetes', 'Stres, akutní infekce, chlad, ranní hodiny', 'Předchozí infarkt nebo angina pectoris'],
    treatment: [
      'Okamžitá záchranná služba, kyselina acetylsalicylová, kyslík při hypoxii, léky proti bolesti',
      'Co nejrychlejší zprůchodnění tepny: primární [[pci|PCI]] do 120 minut, jinak [[tromboliza]]',
      'Dlouhodobě: duální [[antiagregace|antiagregační léčba]], [[statin|statin]], [[beta-blokator|betablokátor]], ACE inhibitor',
      'Kardiorehabilitace a důsledná změna životního stylu',
    ],
  },
  fibrilace: {
    id: 'fibrilace',
    name: 'Fibrilace síní',
    category: 'arytmie',
    short: 'Nejčastější arytmie – síně se chaoticky chvějí místo pravidelného stahu.',
    what:
      'V síních (často u ústí plicních žil) krouží stovky chaotických vzruchů za minutu. Síně se účinně nestahují, jen se „třesou“. [[av-uzel|AV uzel]] propouští k komorám jen část impulzů, ' +
      'a to zcela nepravidelně. Krev v síních (hlavně v oušku levé síně) stagnuje a mohou v ní vznikat sraženiny – hlavní nebezpečí je **cévní mozková příhoda**.',
    model:
      'Síně se chvějí bez koordinovaného stahu, komory bijí nepravidelně a rychleji. Na EKG chybí vlna P, základní linie je zvlněná a vzdálenosti mezi QRS jsou **zcela nepravidelné**.',
    causes: ['Vysoký krevní tlak, srdeční selhání, chlopenní vady', 'Ischemická choroba srdeční, zvýšená funkce štítné žlázy', 'Alkohol („holiday heart“), spánková apnoe, obezita', 'Věk – po 80. roce ji má každý desátý'],
    symptoms: ['Bušení srdce, nepravidelný tep', 'Únava, dušnost, snížená výkonnost', 'Závratě, tlak na hrudi', 'Až třetina nemocných nic necítí – arytmie se zjistí náhodně nebo až mrtvicí'],
    risks: ['Věk nad 65 let', 'Hypertenze', 'Srdeční selhání a chlopenní vady', 'Diabetes, obezita, nadměrný alkohol', 'Hypertyreóza'],
    treatment: [
      '[[antikoagulace|Antikoagulační léčba]] (warfarin, DOAC) k prevenci mrtvice – nejdůležitější krok',
      'Kontrola frekvence ([[beta-blokator|betablokátory]]) nebo návrat k rytmu (antiarytmika, elektrická kardioverze)',
      'Katetrizační ablace – elektrická izolace plicních žil',
      'Léčba příčiny: tlak, štítná žláza, apnoe, omezení alkoholu',
    ],
  },
  'komorova-tachykardie': {
    id: 'komorova-tachykardie',
    name: 'Komorová tachykardie',
    category: 'arytmie',
    short: 'Rychlý rytmus vznikající přímo v komorách – život ohrožující stav.',
    what:
      'Vzruch krouží kolem jizvy po infarktu nebo v nemocné svalovině komor rychlostí 150–250/min. Komory se stahují tak rychle a nekoordinovaně, že se nestačí naplnit – ' +
      'krevní tlak klesá. Může přejít do **fibrilace komor**, při které srdce nepumpuje vůbec a bez [[defibrilace]] nastává do minut smrt.',
    model:
      'Komory se stahují velmi rychle a mělce, síně jsou mimo hru. Na EKG jsou **široké, bizarní komplexy QRS** bez vln P o frekvenci kolem 180/min.',
    causes: ['Jizva po infarktu myokardu (nejčastěji)', 'Kardiomyopatie, srdeční selhání', 'Vrozené poruchy iontových kanálů (syndrom dlouhého QT, Brugada)', 'Iontové rozvraty, některé léky, drogy'],
    symptoms: ['Náhlé silné bušení srdce', 'Slabost, závrať, ztráta vědomí (synkopa)', 'Dušnost, bolest na hrudi', 'Náhlá srdeční zástava'],
    risks: ['Prodělaný infarkt, snížená ejekční frakce', 'Srdeční selhání', 'Rodinný výskyt náhlé smrti', 'Nedostatek draslíku či hořčíku'],
    treatment: [
      'Při oběhové nestabilitě okamžitá elektrická kardioverze / [[defibrilace]]',
      'Antiarytmika (amiodaron), [[beta-blokator|betablokátory]]',
      'Implantace [[icd|ICD]] – přístroj sám arytmii rozpozná a ukončí',
      'Katetrizační ablace ložiska, léčba základní nemoci',
    ],
  },
  selhani: {
    id: 'selhani',
    name: 'Srdeční selhání (dilatace, snížená ejekční frakce)',
    category: 'selhani',
    short: 'Oslabené srdce nepřečerpá dost krve – dutiny se rozšiřují, tekutina se hromadí.',
    what:
      'Poškozená svalovina (po infarktu, dlouholetém vysokém tlaku nebo při kardiomyopatii) se stahuje slabě. [[ef|Ejekční frakce]] klesá z normálních 60 % třeba na 30 %. ' +
      'Srdce se snaží kompenzovat [[dilatace|dilatací]] a zrychlením, ale tím se dále vyčerpává. Krev se hromadí před srdcem – v plicích (dušnost) a v žilách těla ([[edem|otoky]]).',
    model:
      'Levá i pravá komora jsou zvětšené, stěna tenčí a stah viditelně slabší – jen malá část krve je vypuzena. Tep je rychlejší. Na EKG bývá **rozšířený QRS** (blokáda levého raménka) a nižší voltáž.',
    causes: ['Ischemická choroba srdeční a prodělaný infarkt (nejčastější)', 'Dlouholetá hypertenze', 'Kardiomyopatie (dilatační, alkoholová, poinfekční)', 'Chlopenní vady, arytmie, vrozené vady'],
    symptoms: ['Dušnost při námaze, později v klidu a vleže (nutnost spát vpolosedě)', 'Otoky kotníků a bérců, přibývání na váze z tekutiny', 'Únava, snížená výkonnost', 'Noční kašel, časté noční močení, nechutenství'],
    risks: ['Prodělaný infarkt', 'Neléčená hypertenze', 'Diabetes, obezita', 'Nadměrný alkohol, některé chemoterapeutika', 'Věk'],
    treatment: [
      'Léky prodlužující život: ACE inhibitory/ARNI, [[beta-blokator|betablokátory]], antagonisté mineralokortikoidů, glifloziny',
      'Diuretika na otoky a dušnost, omezení soli a tekutin',
      'Resynchronizační léčba (biventrikulární [[kardiostimulator]]), [[icd|ICD]]',
      'Léčba příčiny; v konečném stadiu mechanická podpora nebo transplantace',
    ],
  },
  'aortalni-stenoza': {
    id: 'aortalni-stenoza',
    name: 'Aortální stenóza',
    category: 'chlopne',
    short: 'Ztuhlá, zvápenatělá aortální chlopeň se málo otevírá – levá komora pumpuje proti překážce.',
    what:
      'Cípy aortální chlopně zvápenatí (degenerace s věkem, dvojcípá chlopeň) a otevírají se jen na zlomek plochy. Levá komora musí vyvinout obrovský tlak, aby krev protlačila – ' +
      'zbytní ([[hypertrofie]]) a nakonec selhává. Přísun krve do věnčitých tepen a do mozku při námaze nestačí.',
    model:
      'Aortální chlopeň má silné, žlutavé (zvápenatělé) cípy a otevírá se jen nepatrně. Stěna levé komory je zesílená. Na EKG jsou **vysoké voltáže** a známky přetížení („strain“ – deprese ST, negativní T).',
    causes: ['Degenerativní kalcifikace ve stáří (nejčastější)', 'Vrozeně dvojcípá aortální chlopeň', 'Revmatická horečka (dnes vzácně)'],
    symptoms: ['Dušnost při námaze', 'Angina pectoris (bolest na hrudi) i bez zúžení věnčitých tepen', 'Závratě a mdloby při námaze', 'Typický šelest, který lékař slyší fonendoskopem'],
    risks: ['Věk nad 65 let', 'Dvojcípá chlopeň', 'Hypertenze, vysoký cholesterol, kouření', 'Chronické onemocnění ledvin'],
    treatment: [
      'Léky vadu neodstraní – pouze zmírní příznaky',
      'Chirurgická náhrada chlopně (mechanická nebo biologická)',
      'Katetrizační implantace (TAVI) – bez otevření hrudníku, u starších a rizikových',
      'Pravidelné [[echokardiografie|echokardiografické]] sledování u lehčích forem',
    ],
  },
  'mitralni-insuficience': {
    id: 'mitralni-insuficience',
    name: 'Mitrální insuficience (nedomykavost)',
    category: 'chlopne',
    short: 'Mitrální chlopeň se nedovírá – část krve teče při stahu zpět do levé síně.',
    what:
      'Cípy, šlašinky nebo papilární svaly mitrální chlopně jsou poškozené (prolaps, ruptura šlašinky, dilatace komory, infarkt). Při každé systole se část krve vrací do levé síně ' +
      'místo do aorty. Síň i komora se objemově přetěžují, [[dilatace|dilatují]] a časem se rozvíjí srdeční selhání a [[fibrilace|fibrilace síní]].',
    model:
      'Cípy mitrální chlopně se při systole nedovírají a částice krve proudí zpět z levé komory do levé síně. Levá komora je mírně zvětšená.',
    causes: ['Degenerativní prolaps mitrální chlopně (nejčastější)', 'Dilatace levé komory při srdečním selhání', 'Infarkt s poškozením papilárního svalu', 'Infekční endokarditida, revmatická horečka'],
    symptoms: ['Dlouho bez příznaků', 'Postupně dušnost při námaze, únava', 'Bušení srdce (fibrilace síní)', 'Otoky, noční dušnost při pokročilé vadě'],
    risks: ['Prolaps mitrální chlopně', 'Prodělaný infarkt', 'Srdeční selhání', 'Endokarditida (i.v. drogy, špatný chrup, zubní výkony u rizikových)'],
    treatment: [
      'Léčba srdečního selhání a fibrilace síní',
      'Chirurgická plastika (oprava) chlopně – preferovaná, zachová vlastní chlopeň',
      'Náhrada chlopně, pokud oprava není možná',
      'Katetrizační sponka na cípy (MitraClip) u rizikových pacientů',
    ],
  },
}

export const diseaseList = Object.values(diseases)
