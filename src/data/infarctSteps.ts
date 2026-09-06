export interface InfarctStep {
  title: string
  short: string
  text: string
  /** co sledovat na modelu / EKG */
  watch: string
}

/** Sedm kroků vzniku infarktu myokardu. */
export const infarctSteps: InfarctStep[] = [
  {
    title: 'Zdravá věnčitá tepna',
    short: 'Zdravá tepna',
    text:
      'Stěna tepny má tři vrstvy: vnitřní hladkou výstelku (intima, [[endokard|endotel]]), svalovou střední vrstvu (media) a zevní vazivo (adventicie). ' +
      'Průsvit ([[lumen]]) je volný, krev proudí bez odporu a svalovina srdce dostává tolik kyslíku, kolik potřebuje – v klidu i při zátěži.',
    watch: 'Na vloženém řezu cévou vidíte hladkou výstelku a volný tok krve. RIA na modelu je celá jasně červená.',
  },
  {
    title: 'Ukládání aterosklerotického plátu',
    short: 'Vznik plátu',
    text:
      'Poškozeným endotelem (vysoký tlak, kouření, cukrovka) proniká do stěny [[ldl|LDL cholesterol]]. Tam se oxiduje a přitahuje bílé krvinky, které ho pohlcují a mění se v „pěnové buňky“. ' +
      'Hromadí se tukové jádro, nad kterým tělo vytvoří vazivovou čepičku. Tento proces – [[ateroskleroza]] – běží tiše po desítky let, často už od mládí.',
    watch: 'Žluté částice (LDL) pronikají do stěny a plát pod výstelkou roste. Zatím nebolí a průtok je téměř normální.',
  },
  {
    title: 'Zúžení lumen – námahová angina pectoris',
    short: 'Zúžení, angina',
    text:
      '[[plat|Plát]] zužuje průsvit o více než 70 %. V klidu krev ještě protéká, ale při námaze potřebuje svalovina 3–5× více kyslíku a zúžená tepna to nedokáže dodat. ' +
      'Vzniká přechodná [[ischemie]] a typická svíravá bolest za hrudní kostí – [[angina|angina pectoris]] –, která po zastavení do několika minut ustoupí.',
    watch: 'Průtok za zúžením slábne (tepna za lézí tmavne). Na EKG se při zátěži objevuje deprese úseku ST.',
  },
  {
    title: 'Ruptura plátu',
    short: 'Ruptura plátu',
    text:
      'Nebezpečný není velký plát, ale plát s tenkou čepičkou a velkým tukovým jádrem. Zánět čepičku oslabí a tlak krve nebo prudké zvýšení tepu ji protrhne. ' +
      'Do krve se obnaží tukové jádro a kolagen – látky, které tělo vnímá jako „ránu“, kterou je třeba zacelit.',
    watch: 'Čepička plátu praská a jádro se otevírá do krevního proudu. Na destičky působí jako spouštěč srážení.',
  },
  {
    title: 'Nasedání trombu – uzávěr tepny',
    short: 'Trombus, uzávěr',
    text:
      'Krevní destičky se okamžitě lepí na obnažené jádro, aktivují se a shlukují. Spustí se koagulační kaskáda a vzniká fibrinová síť – během minut se vytvoří [[trombus]], ' +
      'který tepnu zcela uzavře. Tok krve za uzávěrem se zastaví. Právě v této chvíli začíná infarkt a začíná odpočet: „čas jsou svaly“.',
    watch: 'Tmavý trombus vyplňuje průsvit, částice krve se před ním zastavují. RIA za uzávěrem je bez toku.',
  },
  {
    title: 'Ischemie myokardu',
    short: 'Ischemie',
    text:
      'Svalovina za uzávěrem přestává dostávat kyslík. Buňky během sekund přecházejí na nouzový metabolismus, hromadí se kyselina mléčná, srdce v postižené oblasti se přestává stahovat. ' +
      'Nemocný cítí silnou, neustupující bolest na hrudi, studený pot, úzkost. Ischemie je zatím **vratná** – rychlé zprůchodnění tepny svalovinu zachrání.',
    watch: 'Přední stěna levé komory v povodí RIA tmavne a stahuje se slaběji. Na EKG se zvedá úsek ST – elevace ST ([[stemi|STEMI]]).',
  },
  {
    title: 'Nekróza svaloviny – změny na EKG',
    short: 'Nekróza',
    text:
      'Po 20–30 minutách začínají buňky odumírat, nejprve u vnitřní vrstvy a postupně směrem k povrchu. Po 6–12 hodinách je bez léčby odumřelá celá zásobená oblast. ' +
      'Mrtvé buňky uvolňují do krve [[troponin]]. Odumřelá svalovina se během týdnů nahradí jizvou, která se nestahuje a může být zdrojem arytmií nebo srdečního selhání.',
    watch: 'Postižená stěna zešedne (nekróza). Na EKG přetrvávají elevace ST a vzniká hluboký kmit Q – trvalá „elektrická jizva“.',
  },
]
