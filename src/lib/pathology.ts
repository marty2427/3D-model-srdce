import type { AppState } from '../store'

export type EcgKind = 'normal' | 'ischemia' | 'stemi' | 'evolved-mi' | 'af' | 'vt' | 'hf' | 'lvh' | 'brady' | 'paced'

/** Parametry modelu odvozené z aktuálního režimu, nemoci a kroku animace. */
export interface HeartParams {
  bpm: number
  irregularity: number
  /** síla stahu komor 0–1 */
  contractility: number
  /** síla stahu síní 0–1 */
  atrialKick: number
  /** chaotický třes síní */
  atrialFibrillation: boolean
  /** rychlý chaotický rytmus komor */
  ventricularTachycardia: boolean
  lvDilate: number
  rvDilate: number
  /** relativní velikost dutiny LK (menší = silnější stěna) */
  lvCavity: number
  /** velikost plátu v RIA 0–1 */
  ladPlaque: number
  /** prasklý plát */
  ladRupture: boolean
  /** trombus v RIA 0–1 */
  ladThrombus: number
  /** průtok za lézí 0–1 */
  ladFlow: number
  /** postižení přední stěny: 0 nic, 0.5 ischemie, 1 nekróza */
  infarct: number
  aorticStenosis: boolean
  mitralRegurgitation: boolean
  ecg: EcgKind
  /** stent v RIA 0–1 (rozvinutí) */
  stent: number
  /** balonek nafouknutý 0–1 */
  balloon: number
  /** katetr/vodič zaveden 0–1 */
  wire: number
  /** bypassy: 0 nic, 0.5 štěp odebrán (in situ), 1 našitý */
  graftLima: number
  graftSvg: number
  /** tok štěpem 0–1 */
  graftFlow: number
  /** kardiostimulátor */
  pacemaker: number
  /** trombolýza – rozpouštění trombu 0–1 */
  lysis: number
  /** LDL částice pronikající do stěny (ukládání plátu) 0–1 */
  ldl: number
}

export const defaultParams: HeartParams = {
  bpm: 70,
  irregularity: 0,
  contractility: 1,
  atrialKick: 1,
  atrialFibrillation: false,
  ventricularTachycardia: false,
  lvDilate: 1,
  rvDilate: 1,
  lvCavity: 0.7,
  ladPlaque: 0,
  ladRupture: false,
  ladThrombus: 0,
  ladFlow: 1,
  infarct: 0,
  aorticStenosis: false,
  mitralRegurgitation: false,
  ecg: 'normal',
  stent: 0,
  balloon: 0,
  wire: 0,
  graftLima: 0,
  graftSvg: 0,
  graftFlow: 0,
  pacemaker: 0,
  lysis: 0,
  ldl: 0,
}

export function getHeartParams(s: Pick<AppState, 'mode' | 'disease' | 'infarctStep' | 'treatment' | 'treatmentStep'>): HeartParams {
  const p: HeartParams = { ...defaultParams }

  if (s.mode === 'nemoci' && s.disease) {
    switch (s.disease) {
      case 'ichs':
        p.ladPlaque = 0.7
        p.ladFlow = 0.45
        p.ecg = 'ischemia'
        p.bpm = 88
        break
      case 'infarkt':
        p.ladPlaque = 0.7
        p.ladRupture = true
        p.ladThrombus = 1
        p.ladFlow = 0
        p.infarct = 1
        p.ecg = 'stemi'
        p.bpm = 95
        p.contractility = 0.7
        break
      case 'fibrilace':
        p.atrialFibrillation = true
        p.atrialKick = 0
        p.irregularity = 1
        p.bpm = 110
        p.ecg = 'af'
        break
      case 'komorova-tachykardie':
        p.ventricularTachycardia = true
        p.bpm = 180
        p.ecg = 'vt'
        p.contractility = 0.45
        p.atrialKick = 0.3
        break
      case 'selhani':
        p.lvDilate = 1.28
        p.rvDilate = 1.12
        p.lvCavity = 0.84
        p.contractility = 0.35
        p.bpm = 96
        p.ecg = 'hf'
        break
      case 'aortalni-stenoza':
        p.aorticStenosis = true
        p.lvCavity = 0.55
        p.ecg = 'lvh'
        p.bpm = 74
        break
      case 'mitralni-insuficience':
        p.mitralRegurgitation = true
        p.lvDilate = 1.12
        p.ecg = 'normal'
        p.bpm = 80
        break
    }
  }

  if (s.mode === 'infarkt') {
    const st = s.infarctStep
    if (st === 1) p.ldl = 1
    if (st >= 1) p.ladPlaque = st === 1 ? 0.35 : 0.72
    if (st >= 2) {
      p.ladFlow = 0.5
      p.ecg = 'ischemia'
      p.bpm = 92
    }
    if (st >= 3) p.ladRupture = true
    if (st >= 4) {
      p.ladThrombus = 1
      p.ladFlow = 0
      p.bpm = 98
    }
    if (st >= 5) {
      p.infarct = 0.5
      p.ecg = 'stemi'
      p.contractility = 0.8
    }
    if (st >= 6) {
      p.infarct = 1
      p.ecg = 'evolved-mi'
      p.contractility = 0.65
    }
  }

  if (s.mode === 'lecba') {
    const st = s.treatmentStep
    // výchozí stav: uzavřená RIA (kromě kardiostimulátoru)
    if (s.treatment !== 'kardiostimulator') {
      p.ladPlaque = 0.72
      p.ladRupture = true
      p.ladThrombus = 1
      p.ladFlow = 0
      p.infarct = 0.5
      p.ecg = 'stemi'
      p.bpm = 96
      p.contractility = 0.8
    }
    switch (s.treatment) {
      case 'pci':
        if (st >= 1) p.wire = 1
        if (st >= 2) {
          p.balloon = 1
          p.ladThrombus = 0.3
        }
        if (st >= 3) {
          p.balloon = 0
          p.stent = 1
          p.ladThrombus = 0
          p.ladPlaque = 0.2
        }
        if (st >= 4) {
          p.wire = 0
          p.ladFlow = 1
          p.infarct = 0.15
          p.ecg = 'normal'
          p.bpm = 76
          p.contractility = 0.95
        }
        break
      case 'cabg':
        if (st >= 1) {
          p.graftLima = 0.5
          p.graftSvg = 0.5
        }
        if (st >= 2) {
          p.graftLima = 1
          p.graftSvg = 1
        }
        if (st >= 3) {
          p.graftFlow = 1
          p.ladFlow = 1
          p.infarct = 0.15
          p.ecg = 'normal'
          p.bpm = 76
          p.contractility = 0.95
        }
        break
      case 'trombolyza':
        if (st >= 1) p.lysis = 0.15
        if (st >= 2) {
          p.lysis = 0.7
          p.ladThrombus = 0.4
          p.ladFlow = 0.4
        }
        if (st >= 3) {
          p.lysis = 1
          p.ladThrombus = 0
          p.ladFlow = 0.8
          p.infarct = 0.2
          p.ecg = 'normal'
          p.bpm = 80
          p.contractility = 0.9
        }
        break
      case 'kardiostimulator':
        p.bpm = 34
        p.ecg = 'brady'
        p.atrialKick = 0.6
        if (st >= 1) p.pacemaker = 1
        if (st >= 2) {
          p.bpm = 70
          p.ecg = 'paced'
          p.atrialKick = 1
        }
        break
    }
  }

  return p
}
