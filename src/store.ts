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

  treatment: TreatmentId
  setTreatment: (t: TreatmentId) => void
  treatmentStep: number
  setTreatmentStep: (s: number) => void

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
      speed: mode === 'funkce' ? 0.3 : mode === 'prevodni' ? 0.35 : 1,
      // převodní systém je vidět jen průhledným srdcem
      transparent: mode === 'prevodni' ? true : s.transparent,
      panelOpen: false,
      menuOpen: false,
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

  treatment: 'pci',
  setTreatment: (treatment) => set({ treatment, treatmentStep: 0, playing: false }),
  treatmentStep: 0,
  setTreatmentStep: (treatmentStep) => set({ treatmentStep }),

  panelOpen: false,
  setPanelOpen: (panelOpen) => set({ panelOpen }),
  menuOpen: false,
  setMenuOpen: (menuOpen) => set({ menuOpen }),
}))
