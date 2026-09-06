# 3D model srdce

Interaktivní vzdělávací webová aplikace v češtině. Anatomicky zjednodušený, ale odborně správný 3D model srdce sestavený z primitiv a vlastní geometrie (bez externích .glb souborů), takže funguje i offline.

## Režimy

1. **Anatomie** – vrstvy (svalovina, chlopně, velké cévy, koronární tepny, převodní systém), popisky, klikatelné struktury s panelem (název, funkce, popis).
2. **Jak srdce funguje** – animace srdečního cyklu (systola/diastola) se zpomalením a krokováním pěti fází, otevírání/zavírání chlopní, částice okysličené (červené) a odkysličené (modré) krve, schéma malého a velkého oběhu.
3. **Převodní systém** – SA uzel, AV uzel, Hisův svazek, Tawarova raménka, Purkyňova vlákna; animace šíření vzruchu synchronizovaná s EKG křivkou pod modelem, krokování osmi úseků.
4. **Nemoci** – ischemická choroba srdeční, infarkt myokardu, fibrilace síní, komorová tachykardie, srdeční selhání, aortální stenóza, mitrální insuficience. Každá se projeví na modelu i na EKG; u každé příčiny, příznaky, rizikové faktory a léčba.
5. **Infarkt krok za krokem** – sedm kroků od zdravé tepny přes plát, zúžení, rupturu a trombus k ischemii a nekróze; vložený 3D řez věnčitou tepnou, změny na modelu a EKG, přehrát / krok vpřed / zpět.
6. **Léčba** – PCI se stentem (katetr, balonek, stent, obnovený průtok), aortokoronární bypass (odběr LIMA a v. saphena magna, našití za uzávěr, tok štěpy), trombolýza, kardiostimulátor; srovnání stent × bypass.
7. **Prevence** – rizikové faktory a orientační kalkulačka rizika, jejíž výsledek se symbolicky promítne do věnčité tepny na modelu.

Odborné pojmy v textech mají slovníčkový tooltip (najetím myší nebo klepnutím). Rozhraní je responzivní (desktop i mobil), tmavé.

## Ovládání 3D scény

- rotace: tažení levým tlačítkem / jedním prstem
- zoom: kolečko / dva prsty
- posun: pravé tlačítko / dva prsty
- tlačítka: řez srdcem, průhlednost, reset pohledu

## Technologie

- React 19 + Vite + TypeScript
- three.js, @react-three/fiber, @react-three/drei
- Tailwind CSS 4
- zustand (stav aplikace)
- @react-three/postprocessing + n8ao (ambientní okluze a vyhlazení, jen na desktopu)

## Vývoj

```bash
npm install
npm run dev
```

Kontrola typů a lint:

```bash
npx tsc -b
npm run lint
```

## Build a nasazení na Cloudflare Pages

```bash
npm run build
```

Výstup je statický v adresáři `dist/`. V Cloudflare Pages nastavte:

- Build command: `npm run build`
- Build output directory: `dist`

Soubory `public/_redirects` (SPA fallback) a `public/_headers` se do buildu kopírují automaticky.

## Struktura kódu

- `src/three/` – 3D model (geometrie cév a dutin, chlopně, převodní systém, částice krve, léze, stent, bypassy, kardiostimulátor, vložený řez cévou)
- `src/lib/` – kinematika cyklu, hodiny srdce, generátor EKG, parametry patologií
- `src/data/` – české texty: struktury, slovníček, nemoci, kroky infarktu, léčba, prevence
- `src/modes/` – UI jednotlivých režimů (levé menu, pravý panel, časová osa)
- `src/components/` – layout, časová osa, EKG pás, slovníčkové tooltipy

Aplikace je vzdělávací pomůcka a nenahrazuje lékařskou péči.
