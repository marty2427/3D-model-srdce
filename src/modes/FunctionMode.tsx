import { useState } from 'react'
import { useStore } from '../store'
import { cyclePhases } from '../lib/cycle'
import { useCyclePhaseIndex } from '../lib/useCyclePhaseIndex'
import { heartClock, setHeartPhase } from '../lib/heartClock'
import { Timeline } from '../components/Timeline'
import { RichText } from '../components/RichText'
import { SectionTitle, Toggle } from '../components/ui'
import { CirculationDiagram } from '../components/CirculationDiagram'

const SPEEDS = [0.1, 0.25, 0.5, 1]


const progressFn = () => heartClock.phase

export function FunctionTimeline() {
  const playing = useStore((s) => s.playing)
  const setPlaying = useStore((s) => s.setPlaying)
  const speed = useStore((s) => s.speed)
  const setSpeed = useStore((s) => s.setSpeed)
  const cycleStep = useStore((s) => s.cycleStep)
  const setCycleStep = useStore((s) => s.setCycleStep)
  const live = useCyclePhaseIndex()
  const current = cycleStep ?? live

  const onStep = (i: number) => {
    if (i < 0) {
      setCycleStep(null)
      return
    }
    setCycleStep(i)
    setHeartPhase(cyclePhases[i].from + 0.001)
  }
  const onPlayToggle = () => {
    if (cycleStep !== null) {
      setCycleStep(null)
      setPlaying(true)
    } else setPlaying(!playing)
  }

  return (
    <Timeline
      steps={cyclePhases.map((p) => ({ name: p.name, from: p.from, to: p.to }))}
      current={current}
      onStep={onStep}
      playing={playing && cycleStep === null}
      onPlayToggle={onPlayToggle}
      speed={speed}
      speeds={SPEEDS}
      onSpeed={setSpeed}
      progressFn={progressFn}
      allowFree
      label={
        cycleStep !== null
          ? `Krokování: smyčka fáze „${cyclePhases[cycleStep].name}“ – ▶ spustí celý cyklus`
          : `Srdeční cyklus • ${Math.round(60 / heartClock.beatLength)} tepů/min (zpomaleno ${speed}×)`
      }
    />
  )
}

export function FunctionMenu() {
  const layers = useStore((s) => s.layers)
  const toggleLayer = useStore((s) => s.toggleLayer)
  const transparent = useStore((s) => s.transparent)
  const toggleTransparent = useStore((s) => s.toggleTransparent)
  return (
    <div>
      <SectionTitle>Zobrazení</SectionTitle>
      <Toggle on={transparent} onChange={toggleTransparent} label="Průhledná svalovina" />
      <Toggle on={layers.chlopne} onChange={() => toggleLayer('chlopne')} label="Chlopně" />
      <Toggle on={layers.popisky} onChange={() => toggleLayer('popisky')} label="Popisky" />
      <SectionTitle>Legenda</SectionTitle>
      <div className="space-y-1 text-sm">
        <div className="flex items-center gap-2">
          <span className="inline-block h-3 w-3 rounded-full bg-[#ff4d45]" /> okysličená krev (z plic do těla)
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-block h-3 w-3 rounded-full bg-[#5b8cff]" /> odkysličená krev (z těla do plic)
        </div>
      </div>
      <p className="mt-3 text-xs text-muted">Dole na časové ose zpomalte animaci nebo krokujte jednotlivé fáze cyklu.</p>
    </div>
  )
}

export function FunctionPanel() {
  const cycleStep = useStore((s) => s.cycleStep)
  const live = useCyclePhaseIndex()
  const idx = cycleStep ?? live
  const ph = cyclePhases[idx]
  const [tab, setTab] = useState<'cyklus' | 'obeh'>('cyklus')
  return (
    <div className="text-sm leading-relaxed">
      <div className="mb-3 flex gap-1 rounded-lg border border-line bg-panel-2 p-0.5">
        {(
          [
            ['cyklus', 'Srdeční cyklus'],
            ['obeh', 'Krevní oběh'],
          ] as const
        ).map(([k, l]) => (
          <button
            key={k}
            type="button"
            onClick={() => setTab(k)}
            className={`flex-1 rounded-md px-2 py-1 text-xs font-medium ${tab === k ? 'bg-accent text-white' : 'text-muted hover:text-ink'}`}
          >
            {l}
          </button>
        ))}
      </div>
      {tab === 'cyklus' ? (
        <div className="fade-up" key={idx}>
          <div className="text-[11px] font-semibold uppercase tracking-wider text-accent-2">
            Fáze {idx + 1} z {cyclePhases.length}
          </div>
          <h2 className="mt-1 text-lg font-bold">{ph.name}</h2>
          <RichText text={ph.text} className="mt-2" />
          <div className="mt-4 space-y-2 text-xs text-muted">
            <RichText text="Celý cyklus trvá v klidu asi 0,8 s. [[systola|Systola]] komor zabírá zhruba třetinu, [[diastola]] dvě třetiny – v diastole si srdce „odpočine“ a zároveň se plní věnčité tepny." />
            <RichText text="Za minutu srdce přečerpá asi 5 litrů krve ([[minutovy-objem|minutový objem]]); při zátěži až 25 litrů." />
          </div>
        </div>
      ) : (
        <div className="fade-up">
          <h2 className="text-lg font-bold">Malý a velký krevní oběh</h2>
          <CirculationDiagram />
          <RichText
            className="mt-2"
            text="Krev projde oběma oběhy za sebou: **malý oběh** vede z pravé komory plicnicí do plic, kde se krev okysličí, a plicními žílami do levé síně. **Velký oběh** vede z levé komory aortou do orgánů a dutými žílami zpět do pravé síně."
          />
          <RichText
            className="mt-2"
            text="Obě poloviny srdce pracují současně a přečerpají stejný objem – jen proti různému odporu. Proto je stěna levé komory přibližně třikrát silnější než stěna pravé."
          />
        </div>
      )}
    </div>
  )
}
