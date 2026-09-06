import { useEffect } from 'react'
import { useStore } from '../store'
import { infarctSteps } from '../data/infarctSteps'
import { Timeline } from '../components/Timeline'
import { RichText } from '../components/RichText'
import { SectionTitle, Toggle } from '../components/ui'
import { VesselInset } from '../three/VesselInset'
import { useHeartParams } from '../three/params'

const STEP_SECONDS = 8

/** Automatické přehrávání kroků. */
function useAutoAdvance(enabled: boolean, step: number, max: number, setStep: (s: number) => void, stop: () => void) {
  useEffect(() => {
    if (!enabled) return
    const id = window.setTimeout(() => {
      if (step >= max) stop()
      else setStep(step + 1)
    }, STEP_SECONDS * 1000)
    return () => window.clearTimeout(id)
  }, [enabled, step, max, setStep, stop])
}

export function InfarctTimeline() {
  const step = useStore((s) => s.infarctStep)
  const setStep = useStore((s) => s.setInfarctStep)
  const playing = useStore((s) => s.playing)
  const setPlaying = useStore((s) => s.setPlaying)
  // v tomto režimu znamená "playing" automatický posun kroků; srdce tepe vždy
  const auto = useStore((s) => s.autoSteps)
  const setAuto = useStore((s) => s.setAutoSteps)
  useAutoAdvance(auto, step, infarctSteps.length - 1, setStep, () => setAuto(false))
  useEffect(() => {
    if (!playing) setPlaying(true)
  }, [playing, setPlaying])

  return (
    <Timeline
      steps={infarctSteps.map((s) => ({ name: s.short }))}
      current={step}
      onStep={(i) => {
        setAuto(false)
        setStep(Math.max(0, i))
      }}
      playing={auto}
      onPlayToggle={() => {
        if (!auto && step >= infarctSteps.length - 1) setStep(0)
        setAuto(!auto)
      }}
      label={auto ? `Přehrávání – další krok za ${STEP_SECONDS} s` : `Krok ${step + 1} z ${infarctSteps.length}: ${infarctSteps[step].title}`}
    />
  )
}

export function InfarctMenu() {
  const transparent = useStore((s) => s.transparent)
  const toggleTransparent = useStore((s) => s.toggleTransparent)
  const layers = useStore((s) => s.layers)
  const toggleLayer = useStore((s) => s.toggleLayer)
  const step = useStore((s) => s.infarctStep)
  const setStep = useStore((s) => s.setInfarctStep)
  const setAuto = useStore((s) => s.setAutoSteps)
  return (
    <div>
      <SectionTitle>Kroky</SectionTitle>
      <ol className="flex flex-col gap-1">
        {infarctSteps.map((s, i) => (
          <li key={i}>
            <button
              type="button"
              onClick={() => {
                setAuto(false)
                setStep(i)
              }}
              className={`flex w-full items-center gap-2 rounded-md border px-2 py-1 text-left text-xs transition-colors ${
                i === step ? 'border-accent bg-accent/15 text-white' : i < step ? 'border-line bg-panel-2 text-muted' : 'border-line bg-panel-2 text-ink/90 hover:border-muted/60'
              }`}
            >
              <span className={`grid h-5 w-5 shrink-0 place-items-center rounded-full text-[10px] font-bold ${i <= step ? 'bg-accent text-white' : 'bg-line text-muted'}`}>
                {i + 1}
              </span>
              {s.title}
            </button>
          </li>
        ))}
      </ol>
      <SectionTitle>Zobrazení</SectionTitle>
      <Toggle on={transparent} onChange={toggleTransparent} label="Průhledná svalovina" />
      <Toggle on={layers.popisky} onChange={() => toggleLayer('popisky')} label="Popisky" />
      <p className="mt-3 text-xs text-muted">Řez cévou vlevo dole ukazuje, co se děje uvnitř RIA. Na velkém modelu sledujte tepnu a přední stěnu levé komory.</p>
    </div>
  )
}

export function InfarctPanel() {
  const step = useStore((s) => s.infarctStep)
  const st = infarctSteps[step]
  return (
    <div className="fade-up text-sm leading-relaxed" key={step}>
      <div className="text-[11px] font-semibold uppercase tracking-wider text-accent-2">
        Krok {step + 1} z {infarctSteps.length}
      </div>
      <h2 className="mt-1 text-lg font-bold leading-tight">{st.title}</h2>
      <RichText text={st.text} className="mt-2" />
      <div className="mt-3 rounded-lg border border-line bg-panel-2 p-3">
        <div className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-accent">Co sledovat</div>
        <RichText text={st.watch} />
      </div>
      {step === infarctSteps.length - 1 && (
        <div className="mt-3 rounded-lg border border-[#7ef29a]/30 bg-[#7ef29a]/10 p-3">
          <div className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-[#7ef29a]">A co dál?</div>
          <p>Jak se uzavřená tepna zprůchodní stentem, bypassem nebo trombolýzou, ukazuje režim <strong>6. Léčba</strong>.</p>
        </div>
      )}
    </div>
  )
}

/** Překryv nad 3D scénou s vloženým řezem cévy. */
export function InfarctOverlay() {
  const params = useHeartParams()
  const step = useStore((s) => s.infarctStep)
  return <VesselInset params={params} caption={infarctSteps[step].short} />
}
