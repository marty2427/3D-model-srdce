import { useEffect, useState } from 'react'
import { useStore, type TreatmentId } from '../store'
import { stentVsBypass, treatmentList, treatments } from '../data/treatments'
import { Timeline } from '../components/Timeline'
import { RichText } from '../components/RichText'
import { SectionTitle, Toggle } from '../components/ui'
import { VesselInset } from '../three/VesselInset'
import { useHeartParams } from '../three/params'

const STEP_SECONDS = 8

export function TreatmentTimeline() {
  const treatment = useStore((s) => s.treatment)
  const step = useStore((s) => s.treatmentStep)
  const setStep = useStore((s) => s.setTreatmentStep)
  const auto = useStore((s) => s.autoSteps)
  const setAuto = useStore((s) => s.setAutoSteps)
  const setPlaying = useStore((s) => s.setPlaying)
  const steps = treatments[treatment].steps
  useEffect(() => setPlaying(true), [setPlaying])
  useEffect(() => {
    if (!auto) return
    const id = window.setTimeout(() => {
      if (step >= steps.length - 1) setAuto(false)
      else setStep(step + 1)
    }, STEP_SECONDS * 1000)
    return () => window.clearTimeout(id)
  }, [auto, step, steps.length, setStep, setAuto])

  return (
    <Timeline
      steps={steps.map((s) => ({ name: s.short }))}
      current={step}
      onStep={(i) => {
        setAuto(false)
        setStep(Math.max(0, i))
      }}
      playing={auto}
      onPlayToggle={() => {
        if (!auto && step >= steps.length - 1) setStep(0)
        setAuto(!auto)
      }}
      label={auto ? `Přehrávání – další krok za ${STEP_SECONDS} s` : `${treatments[treatment].name} · krok ${step + 1} z ${steps.length}`}
    />
  )
}

export function TreatmentMenu() {
  const treatment = useStore((s) => s.treatment)
  const setTreatment = useStore((s) => s.setTreatment)
  const step = useStore((s) => s.treatmentStep)
  const setStep = useStore((s) => s.setTreatmentStep)
  const setAuto = useStore((s) => s.setAutoSteps)
  const transparent = useStore((s) => s.transparent)
  const toggleTransparent = useStore((s) => s.toggleTransparent)
  const layers = useStore((s) => s.layers)
  const toggleLayer = useStore((s) => s.toggleLayer)
  const t = treatments[treatment]
  return (
    <div>
      <SectionTitle>Zákrok</SectionTitle>
      <div className="flex flex-col gap-1">
        {treatmentList.map((tr) => (
          <button
            key={tr.id}
            type="button"
            onClick={() => setTreatment(tr.id as TreatmentId)}
            className={`rounded-md border px-2 py-1.5 text-left text-xs leading-snug transition-colors ${
              treatment === tr.id ? 'border-accent bg-accent/15 text-white' : 'border-line bg-panel-2 text-ink/90 hover:border-muted/60'
            }`}
          >
            {tr.name}
          </button>
        ))}
      </div>
      <SectionTitle>Kroky</SectionTitle>
      <ol className="flex flex-col gap-1">
        {t.steps.map((s, i) => (
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
    </div>
  )
}

export function TreatmentPanel() {
  const treatment = useStore((s) => s.treatment)
  const step = useStore((s) => s.treatmentStep)
  const t = treatments[treatment]
  const st = t.steps[step]
  const [tab, setTab] = useState<'postup' | 'srovnani' | 'kdy'>('postup')
  return (
    <div className="text-sm leading-relaxed">
      <div className="mb-3 flex gap-1 rounded-lg border border-line bg-panel-2 p-0.5">
        {(
          [
            ['postup', 'Postup'],
            ['kdy', 'Kdy a proč'],
            ['srovnani', 'Stent × bypass'],
          ] as const
        ).map(([k, l]) => (
          <button
            key={k}
            type="button"
            onClick={() => setTab(k)}
            className={`flex-1 rounded-md px-1.5 py-1 text-xs font-medium ${tab === k ? 'bg-accent text-white' : 'text-muted hover:text-ink'}`}
          >
            {l}
          </button>
        ))}
      </div>
      {tab === 'postup' && (
        <div className="fade-up" key={`${treatment}-${step}`}>
          <div className="text-[11px] font-semibold uppercase tracking-wider text-accent-2">
            {t.name} · krok {step + 1} z {t.steps.length}
          </div>
          <h2 className="mt-1 text-lg font-bold leading-tight">{st.title}</h2>
          <RichText text={st.text} className="mt-2" />
          <div className="mt-3 rounded-lg border border-line bg-panel-2 p-3">
            <div className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-accent">Co sledovat</div>
            <RichText text={st.watch} />
          </div>
          {step === 0 && <RichText text={t.intro} className="mt-3 text-xs text-muted" />}
        </div>
      )}
      {tab === 'kdy' && (
        <div className="fade-up" key={treatment}>
          <h2 className="text-lg font-bold leading-tight">{t.name}</h2>
          <p className="mt-1 text-muted">{t.short}</p>
          <RichText text={t.intro} className="mt-2" />
          <h3 className="mb-1 mt-4 text-[11px] font-semibold uppercase tracking-wider text-accent-2">Kdy se volí</h3>
          <ul className="list-disc space-y-1 pl-4">
            {t.when.map((w, i) => (
              <li key={i}>{w}</li>
            ))}
          </ul>
          <h3 className="mb-1 mt-4 text-[11px] font-semibold uppercase tracking-wider text-[#7ef29a]">Výhody</h3>
          <ul className="list-disc space-y-1 pl-4">
            {t.pros.map((w, i) => (
              <li key={i}>{w}</li>
            ))}
          </ul>
          <h3 className="mb-1 mt-4 text-[11px] font-semibold uppercase tracking-wider text-accent">Nevýhody a rizika</h3>
          <ul className="list-disc space-y-1 pl-4">
            {t.cons.map((w, i) => (
              <li key={i}>{w}</li>
            ))}
          </ul>
        </div>
      )}
      {tab === 'srovnani' && (
        <div className="fade-up">
          <h2 className="text-lg font-bold">Stent, nebo bypass?</h2>
          <p className="mt-1 text-muted">
            O volbě rozhoduje „heart team“ (kardiolog + kardiochirurg) podle nálezu na koronarografii, věku a dalších nemocí pacienta.
          </p>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-left text-[11px] uppercase tracking-wider text-muted">
                  <th className="py-1 pr-2"></th>
                  <th className="py-1 pr-2 text-accent-2">Stent (PCI)</th>
                  <th className="py-1 text-[#ff9f6b]">Bypass (CABG)</th>
                </tr>
              </thead>
              <tbody>
                {stentVsBypass.map((r) => (
                  <tr key={r.crit} className="border-t border-line align-top">
                    <td className="py-1.5 pr-2 font-medium text-ink/90">{r.crit}</td>
                    <td className="py-1.5 pr-2">{r.stent}</td>
                    <td className="py-1.5">{r.bypass}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <RichText
            className="mt-3 text-xs text-muted"
            text="Zjednodušeně: **stent** je rychlý a šetrný, ideální při infarktu a u jednoho či dvou zúžení. **Bypass** je větší zásah, ale u rozsáhlého postižení (kmen, tři tepny, diabetici) dává trvanlivější výsledek a delší přežití."
          />
        </div>
      )}
    </div>
  )
}

export function TreatmentOverlay() {
  const params = useHeartParams()
  const treatment = useStore((s) => s.treatment)
  const step = useStore((s) => s.treatmentStep)
  const t = treatments[treatment]
  if (!t.inset) return null
  return <VesselInset params={params} caption={t.steps[step].short} />
}
