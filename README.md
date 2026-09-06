# 3D model srdce

Interaktivní vzdělávací webová aplikace v češtině: anatomie srdce, srdeční cyklus, převodní systém, nemoci, infarkt krok za krokem, léčba a prevence.

## Technologie

- React + Vite + TypeScript
- three.js, @react-three/fiber, @react-three/drei
- Tailwind CSS
- Statický build připravený pro Cloudflare Pages

Model srdce je sestaven z primitiv a vlastní geometrie (žádné externí .glb soubory), takže aplikace funguje i offline.

## Vývoj

```bash
npm install
npm run dev
```

## Build a nasazení na Cloudflare Pages

```bash
npm run build
```

Výstup je v adresáři `dist/`. V Cloudflare Pages nastavte:

- Build command: `npm run build`
- Build output directory: `dist`

Soubory `public/_redirects` a `public/_headers` se do buildu zkopírují automaticky.
