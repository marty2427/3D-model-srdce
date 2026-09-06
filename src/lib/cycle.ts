/**
 * Kinematika srdečního cyklu. Fáze cyklu p ∈ [0, 1):
 *   0.00–0.15  systola síní (vlna P, stah síní)
 *   0.15–0.20  izovolumická kontrakce komor (QRS, všechny chlopně zavřené)
 *   0.20–0.45  ejekce (poloměsíčité chlopně otevřené)
 *   0.45–0.52  izovolumická relaxace (vlna T)
 *   0.52–1.00  plnění komor (AV chlopně otevřené)
 */
export interface CyclePhase {
  id: string
  name: string
  from: number
  to: number
  text: string
}

export const cyclePhases: CyclePhase[] = [
  {
    id: 'sinova-systola',
    name: 'Systola síní',
    from: 0.0,
    to: 0.15,
    text:
      'Vzruch ze [[sa-uzel|SA uzlu]] se šíří síněmi (vlna P). Obě síně se stahují a „dotlačí“ do komor posledních asi 20 % krve. ' +
      'AV chlopně (trikuspidální a mitrální) jsou otevřené, poloměsíčité zavřené.',
  },
  {
    id: 'izovolumicka-kontrakce',
    name: 'Izovolumická kontrakce',
    from: 0.15,
    to: 0.2,
    text:
      'Komory se začínají stahovat (komplex QRS). Tlak v nich prudce roste a zavře AV chlopně – slyšíme 1. ozvu. ' +
      'Poloměsíčité chlopně jsou ještě zavřené, objem komor se nemění.',
  },
  {
    id: 'ejekce',
    name: 'Ejekce – vypuzení krve',
    from: 0.2,
    to: 0.45,
    text:
      'Tlak v komorách převýší tlak v aortě a plicnici, otevřou se aortální a pulmonální chlopeň a krev je vypuzena. ' +
      'Levá komora vypudí asi 70 ml ([[tepovy-objem|tepový objem]]), tedy 55–70 % svého obsahu ([[ef|ejekční frakce]]).',
  },
  {
    id: 'izovolumicka-relaxace',
    name: 'Izovolumická relaxace',
    from: 0.45,
    to: 0.52,
    text:
      'Komory se uvolňují (vlna T), tlak v nich klesá pod tlak v tepnách a poloměsíčité chlopně se zavřou – 2. ozva. ' +
      'AV chlopně jsou ještě zavřené. Věnčité tepny se právě teď nejvíce plní krví.',
  },
  {
    id: 'plneni',
    name: 'Plnění komor',
    from: 0.52,
    to: 1.0,
    text:
      'Tlak v komorách klesne pod tlak v síních, AV chlopně se otevřou a krev nasátá v síních proudí do komor – zprvu rychle, pak pomaleji. ' +
      'Většina plnění je pasivní, bez stahu síní.',
  },
]

export const smoothstep = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)))
  return t * t * (3 - 2 * t)
}

/** Míra stahu komor 0–1 */
export const ventricleContraction = (p: number) =>
  smoothstep(0.15, 0.32, p) * (1 - smoothstep(0.42, 0.58, p))

/** Míra stahu síní 0–1 */
export const atrialContraction = (p: number) => (p < 0.15 ? Math.sin((Math.PI * p) / 0.15) : 0)

/** Otevření AV chlopní 0–1 (zavřené 0.15–0.52) */
export const avValveOpen = (p: number) => 1 - smoothstep(0.13, 0.17, p) * (1 - smoothstep(0.5, 0.56, p))

/** Otevření poloměsíčitých chlopní 0–1 */
export const semilunarOpen = (p: number) => smoothstep(0.19, 0.23, p) * (1 - smoothstep(0.43, 0.47, p))

export const phaseIndex = (p: number) => {
  for (let i = 0; i < cyclePhases.length; i++) {
    if (p >= cyclePhases[i].from && p < cyclePhases[i].to) return i
  }
  return cyclePhases.length - 1
}
