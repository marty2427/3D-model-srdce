import { create } from 'zustand'
import type { StructureId } from './data/structures'

export type Mode =
  | 'anatomie'
  | 'funkce'
  | 'prevodni'
  | 'nemoci'
  | 'infarkt'
  | 'lecba'
  | 'prevence'

export type LayerId = 'svalovina' | 'chlopne' | 'koronarni' | 'prevodni' | 'cevy' | 'popisky'

export type DiseaseId =
  | 'ichs'
  | 'infarkt'
  | 'fibrilace'
  | 'komorova-tachykardie'
  | 'selhani'
  | 'aortalni-stenoza'
  | 'mitralni-insuficience'

export type TreatmentId = 'pci' | 'cabg' | 'trombolyza' | 'kardiostimulator'

export interface AppState {
  mode: Mode
  setMode: (m: Mode) => void

  selected: StructureId | null
  select: (id: StructureId | null) => void
  hovered: StructureId | null
  setHovered: (id: StructureId | null) => void

  cutaway: boolean
  transparent: boolean
  toggleCutaway: () => void
  toggleTransparent: () => void
  resetSignal: number
  requestReset: () => void

  layers: Record<LayerId, boolean>
  toggleLayer: (l: LayerId) => void

  playing: boolean
  setPlaying: (p: boolean) => void
  speed: number
  setSpeed: (s: number) => void
  /** Krokování srdečního cyklu: index fáze nebo null (volný běh) */
  cycleStep: number | null
  setCycleStep: (s: number | null) => void

  disease: DiseaseId | null
  setDisease: (d: DiseaseId | null) => void

  infarctStep: number
  setInfarctStep: (s: number) => void
  /** automatické přehrávání kroků (infarkt, léčba) */
  autoSteps: boolean
  setAutoSteps: (a: boolean) => void

  treatment: TreatmentId
  setTreatment: (t: TreatmentId) => void
  treatmentStep: number
  setTreatmentStep: (s: number) => void

  /** ilustrativní úroveň rizika z kalkulačky (0–1) */
  riskLevel: number
  setRiskLevel: (r: number) => void

  panelOpen: boolean
  setPanelOpen: (o: boolean) => void
  menuOpen: boolean
  setMenuOpen: (o: boolean) => void
}

export const useStore = create<AppState>((set) => ({
  mode: 'anatomie',
  setMode: (mode) =>
    set((s) => ({
      mode,
      selected: null,
      playing: true,
      cycleStep: null,
      speed: mode === 'funkce' ? 0.25 : mode === 'prevodni' ? 0.25 : 1,
      // převodní systém je vidět jen průhledným srdcem
      transparent: mode === 'prevodni' || mode === 'funkce' ? true : mode === 'anatomie' ? false : s.transparent,
      cutaway: mode === 'anatomie' ? s.cutaway : false,
      panelOpen: mode === 'prevence',
      menuOpen: false,
      autoSteps: false,
    })),

  selected: null,
  select: (id) => set({ selected: id, panelOpen: id !== null }),
  hovered: null,
  setHovered: (hovered) => set({ hovered }),

  cutaway: false,
  transparent: false,
  toggleCutaway: () => set((s) => ({ cutaway: !s.cutaway })),
  toggleTransparent: () => set((s) => ({ transparent: !s.transparent })),
  resetSignal: 0,
  requestReset: () => set((s) => ({ resetSignal: s.resetSignal + 1 })),

  layers: {
    svalovina: true,
    chlopne: true,
    koronarni: true,
    prevodni: false,
    cevy: true,
    popisky: true,
  },
  toggleLayer: (l) => set((s) => ({ layers: { ...s.layers, [l]: !s.layers[l] } })),

  playing: true,
  setPlaying: (playing) => set({ playing }),
  speed: 1,
  setSpeed: (speed) => set({ speed }),
  cycleStep: null,
  setCycleStep: (cycleStep) => set({ cycleStep, playing: cycleStep === null }),

  disease: null,
  setDisease: (disease) => set({ disease, selected: null, panelOpen: disease !== null }),

  infarctStep: 0,
  setInfarctStep: (infarctStep) => set({ infarctStep }),
  autoSteps: false,
  setAutoSteps: (autoSteps) => set({ autoSteps }),

  treatment: 'pci',
  setTreatment: (treatment) =>
    set((s) => ({ treatment, treatmentStep: 0, autoSteps: false, transparent: treatment === 'kardiostimulator' ? true : s.transparent })),
  treatmentStep: 0,
  setTreatmentStep: (treatmentStep) => set({ treatmentStep }),

  riskLevel: 0.15,
  setRiskLevel: (riskLevel) => set({ riskLevel }),

  panelOpen: false,
  setPanelOpen: (panelOpen) => set({ panelOpen }),
  menuOpen: false,
  setMenuOpen: (menuOpen) => set({ menuOpen }),
}))
