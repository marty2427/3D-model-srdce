import { useEffect, useState } from 'react'
import { useStore } from '../store'
import { conductionSteps } from '../lib/cycle'
import { heartClock, setHeartPhase } from '../lib/heartClock'
import { Timeline } from '../components/Timeline'
import { RichText } from '../components/RichText'
import { SectionTitle, Toggle } from '../components/ui'
import { structures } from '../data/structures'

const SPEEDS = [0.1, 0.25, 0.5, 1]

/** Index aktuálně aktivního kroku šíření vzruchu (podle fáze cyklu). */
function useLiveConductionStep() {
  const [idx, setIdx] = useState(-1)
  useEffect(() => {
    let raf = 0
    const loop = () => {
      const p = heartClock.phase
      let i = -1
      // poslední krok, jehož rozsah obsahuje fázi (kroky se překrývají → vezmeme nejpozdější začátek)
      for (let k = 0; k < conductionSteps.length; k++) {
        if (p >= conductionSteps[k].from && p < conductionSteps[k].to) i = k
      }
      setIdx((prev) => (prev === i ? prev : i))
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [])
  return idx
}

const progressFn = () => heartClock.phase

export function ConductionTimeline() {
  const playing = useStore((s) => s.playing)
  const setPlaying = useStore((s) => s.setPlaying)
  const speed = useStore((s) => s.speed)
  const setSpeed = useStore((s) => s.setSpeed)
  const cycleStep = useStore((s) => s.cycleStep)
  const setCycleStep = useStore((s) => s.setCycleStep)
  const live = useLiveConductionStep()
  const current = cycleStep ?? live

  const onStep = (i: number) => {
    if (i < 0) {
      setCycleStep(null)
      return
    }
    setCycleStep(i)
    setHeartPhase(conductionSteps[i].from)
  }
  const onPlayToggle = () => {
    if (cycleStep !== null) {
      setCycleStep(null)
      setPlaying(true)
    } else setPlaying(!playing)
  }

  return (
    <Timeline
      steps={conductionSteps.map((p) => ({ name: p.name }))}
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
          ? `Krokování: opakuje se úsek „${conductionSteps[cycleStep].name}“ – ▶ spustí celý cyklus`
          : 'Šíření vzruchu (žlutá záře) synchronně s EKG'
      }
    />
  )
}

export function ConductionMenu() {
  const layers = useStore((s) => s.layers)
  const toggleLayer = useStore((s) => s.toggleLayer)
  const transparent = useStore((s) => s.transparent)
  const toggleTransparent = useStore((s) => s.toggleTransparent)
  const select = useStore((s) => s.select)
  const parts = ['sa-uzel', 'av-uzel', 'hisuv-svazek', 'tawarova-ramenka', 'purkynova-vlakna'] as const
  return (
    <div>
      <SectionTitle>Zobrazení</SectionTitle>
      <Toggle on={transparent} onChange={toggleTransparent} label="Průhledná svalovina" />
      <Toggle on={layers.svalovina} onChange={() => toggleLayer('svalovina')} label="Svalovina" />
      <Toggle on={layers.koronarni} onChange={() => toggleLayer('koronarni')} label="Koronární tepny" />
      <Toggle on={layers.popisky} onChange={() => toggleLayer('popisky')} label="Popisky" />
      <SectionTitle>Části převodního systému</SectionTitle>
      <div className="flex flex-col gap-1">
        {parts.map((id) => (
          <button
            key={id}
            type="button"
            onClick={() => select(id)}
            className="rounded-md border border-line bg-panel-2 px-2 py-1 text-left text-xs hover:border-accent-2/60"
          >
            <span className="mr-1.5 inline-block h-2 w-2 rounded-full bg-accent-2" />
            {structures[id].name}
          </button>
        ))}
      </div>
      <p className="mt-3 text-xs text-muted">Zpomalte animaci na 0,1× a sledujte, jak žlutá záře postupuje od SA uzlu ke komorám a jak se přitom kreslí EKG.</p>
    </div>
  )
}

export function ConductionPanel() {
  const cycleStep = useStore((s) => s.cycleStep)
  const live = useLiveConductionStep()
  const idx = cycleStep ?? live
  const st = idx >= 0 ? conductionSteps[idx] : null
  return (
    <div className="text-sm leading-relaxed">
      {st ? (
        <div className="fade-up" key={st.id}>
          <div className="text-[11px] font-semibold uppercase tracking-wider text-accent-2">
            Krok {idx + 1} z {conductionSteps.length}
          </div>
          <h2 className="mt-1 text-lg font-bold">{st.name}</h2>
          <RichText text={st.text} className="mt-2" />
        </div>
      ) : (
        <div className="fade-up">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-accent-2">Klidová fáze</div>
          <h2 className="mt-1 text-lg font-bold">Diastola – plnění komor</h2>
          <p className="mt-2">Převodní systém je v klidu, buňky SA uzlu se pomalu samovolně depolarizují a připravují další vzruch. Na EKG je rovná (izoelektrická) linie.</p>
        </div>
      )}
      <div className="mt-5 border-t border-line pt-4 text-xs text-muted">
        <h3 className="mb-1 font-semibold text-ink">Jak číst EKG</h3>
        <RichText text="[[p-vlna|Vlna P]] = aktivace síní. [[pr-interval|Interval PQ]] = zdržení v AV uzlu. [[qrs|Komplex QRS]] = aktivace komor. [[st-usek|Úsek ST]] = komory plně depolarizované. [[t-vlna|Vlna T]] = repolarizace komor." />
        <RichText className="mt-2" text="Normální srdeční frekvence je 60–100/min. Pod 60 mluvíme o [[bradykardie|bradykardii]], nad 100 o [[tachykardie|tachykardii]]." />
      </div>
    </div>
  )
}
