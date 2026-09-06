/**
 * Popisy anatomických struktur srdce.
 * Text může obsahovat odkazy na slovníček ve tvaru [[klic]] nebo [[klic|zobrazený text]].
 */
export type StructureId =
  | 'prava-sin'
  | 'leva-sin'
  | 'prava-komora'
  | 'leva-komora'
  | 'septum'
  | 'trikuspidalni'
  | 'pulmonalni'
  | 'mitralni'
  | 'aortalni'
  | 'horni-duta-zila'
  | 'dolni-duta-zila'
  | 'plicnice'
  | 'plicni-zily'
  | 'aorta'
  | 'ria'
  | 'rcx'
  | 'rca'
  | 'sa-uzel'
  | 'av-uzel'
  | 'hisuv-svazek'
  | 'tawarova-ramenka'
  | 'purkynova-vlakna'
  | 'plat'
  | 'trombus'
  | 'stent'
  | 'bypass-lima'
  | 'bypass-svg'
  | 'kardiostimulator'

export type StructureGroup = 'dutina' | 'chlopen' | 'ceva' | 'koronarni' | 'prevodni' | 'patologie' | 'lecba'

export interface StructureInfo {
  id: StructureId
  name: string
  latin?: string
  group: StructureGroup
  /** Krátká věta – co struktura dělá */
  fn: string
  /** Delší popis */
  text: string
  /** Zajímavost / klinická poznámka */
  note?: string
}

export const structures: Record<StructureId, StructureInfo> = {
  'prava-sin': {
    id: 'prava-sin',
    name: 'Pravá síň',
    latin: 'atrium dextrum',
    group: 'dutina',
    fn: 'Přijímá [[odkysličená|odkysličenou krev]] z celého těla a předává ji pravé komoře.',
    text:
      'Do pravé síně ústí horní a dolní dutá žíla a koronární sinus (žíla odvádějící krev ze srdeční stěny). ' +
      'Stěna síně je tenká, protože krev do komory přechází z velké části pasivně – síň ji jen v závěru [[diastola|diastoly]] „dotlačí“ svým stahem. ' +
      'V horní části pravé síně, u ústí horní duté žíly, leží [[sa-uzel|SA uzel]], přirozený udavatel rytmu.',
    note: 'Tlak v pravé síni je velmi nízký (0–5 mm Hg); jeho vzestup se u srdečního selhání projeví náplní krčních žil a otoky nohou.',
  },
  'leva-sin': {
    id: 'leva-sin',
    name: 'Levá síň',
    latin: 'atrium sinistrum',
    group: 'dutina',
    fn: 'Přijímá [[okysličená|okysličenou krev]] z plic čtyřmi plicními žilami a předává ji levé komoře.',
    text:
      'Levá síň leží nejvíce vzadu ze všech srdečních dutin, těsně před jícnem. Má o něco silnější stěnu než pravá síň, protože pracuje proti vyšším tlakům. ' +
      'Její stah (síňová systola) doplní levou komoru asi o pětinu objemu. ' +
      'Z levé síně vybíhá ouško (auricula), kde při [[fibrilace|fibrilaci síní]] nejčastěji vznikají krevní sraženiny.',
    note: 'Zvětšení levé síně na echokardiografii je častý následek vysokého tlaku nebo vady mitrální chlopně.',
  },
  'prava-komora': {
    id: 'prava-komora',
    name: 'Pravá komora',
    latin: 'ventriculus dexter',
    group: 'dutina',
    fn: 'Pumpuje odkysličenou krev do plic (malý krevní oběh).',
    text:
      'Pravá komora tvoří většinu přední plochy srdce. Její stěna je tenká (3–5 mm), protože plicní oběh klade malý odpor – tlak v ní dosahuje jen asi 25 mm Hg. ' +
      'Dutina má tvar půlměsíce obepínajícího levou komoru. Krev z ní odchází výtokovým traktem (infundibulum) přes pulmonální chlopeň do plicnice.',
    note: 'Přetížení pravé komory vzniká např. při plicní embolii nebo chronických plicních nemocech (tzv. cor pulmonale).',
  },
  'leva-komora': {
    id: 'leva-komora',
    name: 'Levá komora',
    latin: 'ventriculus sinister',
    group: 'dutina',
    fn: 'Hlavní pumpa srdce – vhání okysličenou krev do aorty a celého těla (velký oběh).',
    text:
      'Levá komora má nejsilnější stěnu ze všech dutin (10–15 mm), protože musí překonat tlak v aortě (asi 120 mm Hg). ' +
      'Její kuželovitý tvar končí srdečním hrotem (apex). Uvnitř jsou dva [[papilarni-svaly|papilární svaly]], které šlašinkami drží cípy mitrální chlopně. ' +
      'Výkonnost levé komory se vyjadřuje [[ef|ejekční frakcí]] – podílem krve vypuzené jedním stahem.',
    note: 'Přední stěnu a hrot zásobuje RIA (LAD), spodní stěnu většinou RCA, boční stěnu RCX. Podle uzavřené tepny proto vznikají „přední“, „spodní“ nebo „boční“ infarkty.',
  },
  septum: {
    id: 'septum',
    name: 'Mezikomorová přepážka',
    latin: 'septum interventriculare',
    group: 'dutina',
    fn: 'Odděluje pravou a levou komoru; probíhá v ní převodní systém.',
    text:
      'Svalová přepážka funkčně patří k levé komoře a podílí se na jejím stahu. V její horní části běží [[hisuv-svazek|Hisův svazek]] a obě Tawarova raménka. ' +
      'Přední dvě třetiny septa zásobuje RIA, zadní třetinu obvykle RCA.',
    note: 'Vrozený otvor v přepážce (defekt septa) je jednou z nejčastějších vrozených srdečních vad.',
  },

  trikuspidalni: {
    id: 'trikuspidalni',
    name: 'Trikuspidální chlopeň',
    latin: 'valva tricuspidalis',
    group: 'chlopen',
    fn: 'Trojcípá chlopeň mezi pravou síní a pravou komorou; brání návratu krve do síně při stahu komory.',
    text:
      'Má tři cípy (přední, zadní a septální), které jsou šlašinkami připojeny k papilárním svalům pravé komory. ' +
      'Otevírá se v [[diastola|diastole]], kdy krev proudí ze síně do komory, a zavírá se na začátku [[systola|systoly]] komory.',
    note: 'Zavření trikuspidální a mitrální chlopně slyšíme jako první srdeční ozvu („lub“).',
  },
  pulmonalni: {
    id: 'pulmonalni',
    name: 'Pulmonální chlopeň',
    latin: 'valva trunci pulmonalis',
    group: 'chlopen',
    fn: 'Poloměsíčitá chlopeň mezi pravou komorou a plicnicí.',
    text:
      'Skládá se ze tří kapsovitých cípů (semilunárních). Otevírá se tlakem krve při stahu pravé komory a zavírá se, jakmile tlak v plicnici převýší tlak v komoře. ' +
      'Nemá šlašinky – její cípy se naplní krví tekoucí zpět a tím se uzavřou.',
    note: 'Zavření pulmonální a aortální chlopně tvoří druhou srdeční ozvu („dub“).',
  },
  mitralni: {
    id: 'mitralni',
    name: 'Mitrální chlopeň',
    latin: 'valva mitralis (bicuspidalis)',
    group: 'chlopen',
    fn: 'Dvojcípá chlopeň mezi levou síní a levou komorou.',
    text:
      'Má přední a zadní cíp, které drží šlašinky od dvou papilárních svalů. Název dostala podle podoby s biskupskou mitrou. ' +
      'Je vystavena nejvyšším tlakům v srdci: při systole levé komory na ni působí tlak přes 120 mm Hg. ' +
      'Její nedomykavost ([[insuficience]]) patří mezi nejčastější chlopenní vady.',
    note: 'Při infarktu může prasknout papilární sval – vzniká náhlá těžká mitrální nedomykavost, život ohrožující stav.',
  },
  aortalni: {
    id: 'aortalni',
    name: 'Aortální chlopeň',
    latin: 'valva aortae',
    group: 'chlopen',
    fn: 'Poloměsíčitá chlopeň mezi levou komorou a aortou.',
    text:
      'Tři semilunární cípy se otevírají při vypuzení krve z levé komory a zavírají se na začátku diastoly. ' +
      'Těsně nad cípy jsou tři rozšíření (Valsalvovy siny), ze dvou z nich odstupují věnčité tepny. Věnčité tepny se tedy plní hlavně v diastole, kdy se cípy zavřou.',
    note: 'Aortální [[stenoza|stenóza]] je nejčastější chlopenní vada vyžadující operaci nebo katetrizační náhradu (TAVI).',
  },

  'horni-duta-zila': {
    id: 'horni-duta-zila',
    name: 'Horní dutá žíla',
    latin: 'vena cava superior',
    group: 'ceva',
    fn: 'Přivádí odkysličenou krev z hlavy, krku a horních končetin do pravé síně.',
    text:
      'Vzniká soutokem obou brachiocefalických žil za pravým okrajem hrudní kosti. Nemá chlopně; krev v ní proudí díky tlakovému spádu a sání hrudníku při nádechu.',
  },
  'dolni-duta-zila': {
    id: 'dolni-duta-zila',
    name: 'Dolní dutá žíla',
    latin: 'vena cava inferior',
    group: 'ceva',
    fn: 'Přivádí odkysličenou krev z dolní poloviny těla do pravé síně.',
    text:
      'Největší žíla těla. Prochází bránicí a ústí do spodní části pravé síně. Přivádí krev z dolních končetin, břišních orgánů a ledvin.',
  },
  plicnice: {
    id: 'plicnice',
    name: 'Plicnice',
    latin: 'truncus pulmonalis',
    group: 'ceva',
    fn: 'Jediná tepna těla vedoucí odkysličenou krev – z pravé komory do plic.',
    text:
      'Kmen plicnice odstupuje z pravé komory, běží vzhůru a dozadu a dělí se na pravou a levou plicní tepnu. ' +
      'Tlak v plicním oběhu je nízký (asi 25/10 mm Hg), proto má plicnice tenčí stěnu než aorta.',
    note: 'Ucpání větve plicnice krevní sraženinou z žil nohou se nazývá plicní embolie.',
  },
  'plicni-zily': {
    id: 'plicni-zily',
    name: 'Plicní žíly',
    latin: 'venae pulmonales',
    group: 'ceva',
    fn: 'Čtyři žíly vedoucí okysličenou krev z plic do levé síně.',
    text:
      'Z každé plíce odcházejí dvě plicní žíly (horní a dolní). Jsou jedinými žílami těla, které vedou okysličenou krev. ' +
      'V jejich ústí do levé síně často vznikají elektrické impulzy spouštějící [[fibrilace|fibrilaci síní]] – proto se při katetrizační ablaci tato ústí elektricky izolují.',
  },
  aorta: {
    id: 'aorta',
    name: 'Aorta (srdečnice)',
    latin: 'aorta',
    group: 'ceva',
    fn: 'Největší tepna těla – rozvádí okysličenou krev z levé komory do celého organismu.',
    text:
      'Z levé komory vystupuje vzestupná aorta, která se stáčí v aortální oblouk (z něj odstupují tepny pro hlavu a horní končetiny) a pokračuje jako sestupná aorta hrudníkem a břichem. ' +
      'Pružná stěna aorty se při systole roztáhne a v diastole se smrští, čímž udržuje plynulý tok krve („pružníkový efekt“).',
    note: 'Roztažení aorty na více než 5 cm se nazývá aneurysma a hrozí prasknutím.',
  },

  ria: {
    id: 'ria',
    name: 'RIA – přední mezikomorová větev (LAD)',
    latin: 'ramus interventricularis anterior',
    group: 'koronarni',
    fn: 'Nejdůležitější věnčitá tepna – zásobuje přední stěnu levé komory, hrot a většinu přepážky.',
    text:
      'Odstupuje z kmene levé věnčité tepny a běží v předním mezikomorovém žlábku k hrotu. Vydává septální a diagonální větve. ' +
      'Zásobuje až polovinu svaloviny levé komory, proto je její uzávěr nejnebezpečnější. ' +
      'Její jméno v angličtině zní LAD (left anterior descending); v Česku se používá zkratka RIA.',
    note: 'Uzávěr počátku RIA bývá nazýván „widowmaker“ – „tvůrce vdov“ – kvůli vysoké úmrtnosti bez rychlé léčby.',
  },
  rcx: {
    id: 'rcx',
    name: 'RCX – ramus circumflexus',
    latin: 'ramus circumflexus',
    group: 'koronarni',
    fn: 'Zásobuje boční a část zadní stěny levé komory a levou síň.',
    text:
      'Druhá hlavní větev levé věnčité tepny. Obtáčí srdce v levém síňokomorovém žlábku dozadu a vydává marginální větve pro boční stěnu. ' +
      'U části lidí zásobuje i spodní stěnu (tzv. levotypový oběh).',
    note: 'Infarkt v povodí RCX bývá na standardním EKG hůře viditelný („elektricky němá“ boční stěna).',
  },
  rca: {
    id: 'rca',
    name: 'RCA – pravá věnčitá tepna',
    latin: 'arteria coronaria dextra',
    group: 'koronarni',
    fn: 'Zásobuje pravou komoru, spodní stěnu levé komory, SA a AV uzel.',
    text:
      'Odstupuje z pravého aortálního sinu, běží v pravém síňokomorovém žlábku kolem srdce dozadu a u většiny lidí končí jako zadní mezikomorová větev (RIP). ' +
      'U 60 % lidí vydává tepnu pro SA uzel a u 90 % tepnu pro AV uzel.',
    note: 'Spodní infarkt (uzávěr RCA) proto často doprovází pomalý tep nebo blokáda převodu v AV uzlu.',
  },

  'sa-uzel': {
    id: 'sa-uzel',
    name: 'SA uzel (sinoatriální)',
    latin: 'nodus sinuatrialis',
    group: 'prevodni',
    fn: 'Přirozený udavatel rytmu – spouští každý srdeční stah.',
    text:
      'Shluk specializovaných buněk o velikosti asi 15 × 3 mm v horní části pravé síně, u ústí horní duté žíly. ' +
      'Jeho buňky se samy spontánně depolarizují 60–100× za minutu. Rychlost ovlivňuje vegetativní nervstvo: sympatikus zrychluje, parasympatikus (bloudivý nerv) zpomaluje.',
    note: 'Selhání SA uzlu (sick sinus syndrom) je častým důvodem implantace kardiostimulátoru.',
  },
  'av-uzel': {
    id: 'av-uzel',
    name: 'AV uzel (atrioventrikulární)',
    latin: 'nodus atrioventricularis',
    group: 'prevodni',
    fn: 'Zpomalí vzruch o asi 0,1 s, aby se komory stihly naplnit, a chrání je před příliš rychlým rytmem síní.',
    text:
      'Leží ve spodní části mezisíňové přepážky u ústí koronárního sinu. Je jediným elektrickým spojením mezi síněmi a komorami – jinde je odděluje vazivový skelet. ' +
      'Zdržení v AV uzlu tvoří na EKG úsek PQ. Při fibrilaci síní AV uzel „filtruje“ stovky impulzů za minutu a k komorám pustí jen část.',
  },
  'hisuv-svazek': {
    id: 'hisuv-svazek',
    name: 'Hisův svazek',
    latin: 'fasciculus atrioventricularis',
    group: 'prevodni',
    fn: 'Vede vzruch z AV uzlu do mezikomorové přepážky.',
    text:
      'Krátký svazek vodivých vláken (asi 1–2 cm), který proráží vazivový skelet srdce a v horní části septa se dělí na pravé a levé Tawarovo raménko. ' +
      'Vede vzruch rychle (1–4 m/s).',
  },
  'tawarova-ramenka': {
    id: 'tawarova-ramenka',
    name: 'Tawarova raménka',
    latin: 'crus dextrum et sinistrum',
    group: 'prevodni',
    fn: 'Pravé a levé raménko rozvádějí vzruch po obou stranách přepážky směrem k hrotu.',
    text:
      'Levé raménko se dále dělí na přední a zadní svazek. Raménka běží pod endokardem po obou stranách septa a končí sítí Purkyňových vláken. ' +
      'Přerušení raménka (blokáda raménka) rozšíří na EKG komplex QRS, protože se postižená komora aktivuje opožděně.',
  },
  'purkynova-vlakna': {
    id: 'purkynova-vlakna',
    name: 'Purkyňova vlákna',
    latin: 'rami subendocardiales',
    group: 'prevodni',
    fn: 'Síť vláken pod endokardem, která bleskově aktivuje svalovinu obou komor.',
    text:
      'Nejrychleji vodící tkáň srdce (až 4 m/s). Díky ní se celá komorová svalovina aktivuje během přibližně 80 ms – od hrotu k bázi, takže krev je vytlačena směrem k tepnám. ' +
      'Popsal je český fyziolog Jan Evangelista Purkyně v roce 1839.',
  },

  plat: {
    id: 'plat',
    name: 'Aterosklerotický plát',
    group: 'patologie',
    fn: 'Ložisko cholesterolu a zánětu ve stěně tepny, které zužuje její průsvit.',
    text:
      'Vzniká desítky let: [[ldl|LDL cholesterol]] proniká do stěny tepny, oxiduje se a přitahuje bílé krvinky (makrofágy), z nichž vznikají pěnové buňky. ' +
      'Postupně se tvoří tukové jádro kryté vazivovou čepičkou. Tenká čepička se může protrhnout a spustit vznik sraženiny.',
  },
  trombus: {
    id: 'trombus',
    name: 'Trombus (krevní sraženina)',
    group: 'patologie',
    fn: 'Sraženina z krevních destiček a fibrinu, která uzavírá tepnu.',
    text:
      'Po prasknutí plátu se obnaží jeho obsah, na který se okamžitě lepí krevní destičky. Aktivuje se srážení krve a během minut může sraženina zcela ucpat tepnu.',
  },
  stent: {
    id: 'stent',
    name: 'Koronární stent',
    group: 'lecba',
    fn: 'Kovová síťka rozvinutá balonkem, která drží tepnu trvale otevřenou.',
    text:
      'Moderní stenty jsou potažené lékem, který brání opětovnému zúžení. Po implantaci je nutná duální [[antiagregace|antiagregační léčba]] (obvykle 6–12 měsíců), aby se ve stentu nevytvořila sraženina.',
  },
  'bypass-lima': {
    id: 'bypass-lima',
    name: 'Bypass z a. mammaria interna (LIMA)',
    group: 'lecba',
    fn: 'Tepenný štěp přivádějící krev z hrudní stěny na RIA za místo zúžení.',
    text:
      'Levá vnitřní hrudní tepna (LIMA) se uvolní od hrudní stěny, její horní konec zůstává napojený na podklíčkovou tepnu a dolní konec se našije na RIA. ' +
      'Tepenný štěp je velmi odolný vůči ateroskleróze – po 10 letech je průchodný u více než 90 % pacientů.',
  },
  'bypass-svg': {
    id: 'bypass-svg',
    name: 'Žilní bypass (v. saphena magna)',
    group: 'lecba',
    fn: 'Žilní štěp našitý mezi aortu a věnčitou tepnu za zúžením.',
    text:
      'Úsek [[v-saphena|velké povrchové žíly]] z dolní končetiny se našije jedním koncem na vzestupnou aortu a druhým na tepnu za stenózou (např. RCA nebo RCX). ' +
      'Žilní štěpy stárnou rychleji než tepenné – po 10 letech je průchodných asi 50–60 %.',
  },
  kardiostimulator: {
    id: 'kardiostimulator',
    name: 'Kardiostimulátor',
    group: 'lecba',
    fn: 'Přístroj s baterií a elektrodami, který stimuluje srdce, když vlastní rytmus selže.',
    text:
      'Implantuje se pod kůži pod klíční kostí, elektrody se zavádějí žilou do pravé síně a/nebo pravé komory. ' +
      'Přístroj sleduje vlastní rytmus a vydává impulz jen tehdy, když srdce samo nestačí.',
  },
}

export const structureList = Object.values(structures)
