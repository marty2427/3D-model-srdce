import { useMemo, useState } from 'react'
import { useStore } from '../store'
import { defaultRiskInput, estimateRisk, riskCategory, riskFactors, type RiskInput } from '../data/prevention'
import { RichText } from '../components/RichText'
import { SectionTitle, Toggle } from '../components/ui'

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex items-center justify-between gap-2 py-1 text-sm">
      <span className="text-ink/90">{label}</span>
      {children}
    </label>
  )
}

function Range({ value, min, max, step = 1, onChange, unit }: { value: number; min: number; max: number; step?: number; onChange: (v: number) => void; unit: string }) {
  return (
    <span className="flex items-center gap-2">
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} className="w-28 accent-[#ff5a4a] sm:w-36" />
      <span className="w-20 text-right tabular-nums text-accent-2">
        {value} {unit}
      </span>
    </span>
  )
}

function YesNo({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <span className="flex rounded-md border border-line bg-panel-2 p-0.5 text-xs">
      {[
        [false, 'Ne'],
        [true, 'Ano'],
      ].map(([v, l]) => (
        <button
          key={String(v)}
          type="button"
          onClick={() => onChange(v as boolean)}
          className={`rounded px-2.5 py-0.5 ${value === v ? 'bg-accent text-white' : 'text-muted hover:text-ink'}`}
        >
          {l as string}
        </button>
      ))}
    </span>
  )
}

/** Interaktivní kalkulačka rizika – výsledek se promítá do modelu (plát v RIA). */
function RiskCalculator() {
  const setRiskLevel = useStore((s) => s.setRiskLevel)
  const [inp, setInp] = useState<RiskInput>(defaultRiskInput)
  const pct = useMemo(() => estimateRisk(inp), [inp])
  const cat = riskCategory(pct)
  const set = <K extends keyof RiskInput>(k: K, v: RiskInput[K]) => {
    const next = { ...inp, [k]: v }
    setInp(next)
    setRiskLevel(riskCategory(estimateRisk(next)).level)
  }
  // co by pomohlo nejvíc
  const whatIf = useMemo(() => {
    const opts: { label: string; pct: number }[] = []
    if (inp.smoker) opts.push({ label: 'přestat kouřit', pct: estimateRisk({ ...inp, smoker: false }) })
    if (inp.sbp > 130) opts.push({ label: 'tlak na 130', pct: estimateRisk({ ...inp, sbp: 130 }) })
    if (inp.chol > 5) opts.push({ label: 'cholesterol na 5,0', pct: estimateRisk({ ...inp, chol: 5 }) })
    if (!inp.active) opts.push({ label: 'pravidelný pohyb', pct: estimateRisk({ ...inp, active: true }) })
    if (inp.bmi > 25) opts.push({ label: 'BMI na 25', pct: estimateRisk({ ...inp, bmi: 25 }) })
    return opts.sort((a, b) => a.pct - b.pct).slice(0, 3)
  }, [inp])

  return (
    <div>
      <div className="rounded-xl border border-line bg-panel-2 p-3">
        <Field label="Věk">
          <Range value={inp.age} min={30} max={79} onChange={(v) => set('age', v)} unit="let" />
        </Field>
        <Field label="Pohlaví">
          <span className="flex rounded-md border border-line bg-panel p-0.5 text-xs">
            {(
              [
                ['m', 'Muž'],
                ['f', 'Žena'],
              ] as const
            ).map(([v, l]) => (
              <button key={v} type="button" onClick={() => set('sex', v)} className={`rounded px-2.5 py-0.5 ${inp.sex === v ? 'bg-accent text-white' : 'text-muted hover:text-ink'}`}>
                {l}
              </button>
            ))}
          </span>
        </Field>
        <Field label="Kouření">
          <YesNo value={inp.smoker} onChange={(v) => set('smoker', v)} />
        </Field>
        <Field label="Systolický tlak">
          <Range value={inp.sbp} min={100} max={200} step={5} onChange={(v) => set('sbp', v)} unit="mmHg" />
        </Field>
        <Field label="Celkový cholesterol">
          <Range value={inp.chol} min={3} max={9} step={0.1} onChange={(v) => set('chol', Number(v.toFixed(1)))} unit="mmol/l" />
        </Field>
        <Field label="Cukrovka">
          <YesNo value={inp.diabetes} onChange={(v) => set('diabetes', v)} />
        </Field>
        <Field label="BMI">
          <Range value={inp.bmi} min={18} max={45} step={0.5} onChange={(v) => set('bmi', v)} unit="kg/m²" />
        </Field>
        <Field label="Pohyb ≥ 150 min/týden">
          <YesNo value={inp.active} onChange={(v) => set('active', v)} />
        </Field>
        <Field label="Infarkt v rodině (předčasný)">
          <YesNo value={inp.family} onChange={(v) => set('family', v)} />
        </Field>
      </div>

      <div className="mt-3 rounded-xl border p-3" style={{ borderColor: cat.color + '66', background: cat.color + '14' }}>
        <div className="text-[11px] font-semibold uppercase tracking-wider text-muted">Orientační 10leté riziko srdečně-cévní příhody</div>
        <div className="mt-1 flex items-baseline gap-2">
          <span className="text-3xl font-bold tabular-nums" style={{ color: cat.color }}>
            {pct < 10 ? pct.toFixed(1) : Math.round(pct)} %
          </span>
          <span className="font-semibold" style={{ color: cat.color }}>
            {cat.label}
          </span>
        </div>
        <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-line">
          <div className="h-full rounded-full transition-all" style={{ width: `${Math.min(100, (pct / 30) * 100)}%`, background: cat.color }} />
        </div>
        <p className="mt-2 text-sm">{cat.advice}</p>
        {whatIf.length > 0 && (
          <div className="mt-2 text-xs text-muted">
            <span className="font-semibold text-ink">Co by pomohlo nejvíc: </span>
            {whatIf.map((w, i) => (
              <span key={w.label}>
                {i > 0 && ' · '}
                {w.label} → <span className="tabular-nums text-ink">{w.pct < 10 ? w.pct.toFixed(1) : Math.round(w.pct)} %</span>
              </span>
            ))}
          </div>
        )}
      </div>
      <p className="mt-2 text-[11px] leading-snug text-muted">
        Zjednodušený model inspirovaný evropskými tabulkami SCORE2 – pouze pro ilustraci vlivu jednotlivých faktorů. Skutečné riziko určí lékař podle laboratorních hodnot.
        Velikost plátu v RIA na modelu je jen symbolická.
      </p>
    </div>
  )
}

export function PreventionMenu() {
  const riskLevel = useStore((s) => s.riskLevel)
  const setPanelOpen = useStore((s) => s.setPanelOpen)
  const layers = useStore((s) => s.layers)
  const toggleLayer = useStore((s) => s.toggleLayer)
  const transparent = useStore((s) => s.transparent)
  const toggleTransparent = useStore((s) => s.toggleTransparent)
  return (
    <div>
      <SectionTitle>Prevence</SectionTitle>
      <p className="text-xs leading-relaxed text-muted">
        Až 80 % infarktů lze odvrátit. Vyzkoušejte v panelu vpravo kalkulačku rizika – model ukáže, jak by mohla vypadat věnčitá tepna při dlouhodobém působení rizikových faktorů.
      </p>
      <button type="button" onClick={() => setPanelOpen(true)} className="mt-2 w-full rounded-md border border-accent/60 bg-accent/15 px-2 py-1.5 text-sm font-medium text-white hover:bg-accent/25">
        Otevřít kalkulačku rizika
      </button>
      <div className="mt-3 text-xs text-muted">
        Aktuální ilustrace na modelu: <span className="text-accent-2">{riskLevel < 0.2 ? 'zdravá tepna' : riskLevel < 0.5 ? 'malý plát' : riskLevel < 0.85 ? 'významné zúžení' : 'kritické zúžení'}</span>
      </div>
      <SectionTitle>Zobrazení</SectionTitle>
      <Toggle on={transparent} onChange={toggleTransparent} label="Průhledná svalovina" />
      <Toggle on={layers.popisky} onChange={() => toggleLayer('popisky')} label="Popisky" />
    </div>
  )
}

export function PreventionPanel() {
  const [tab, setTab] = useState<'kalkulacka' | 'faktory'>('kalkulacka')
  return (
    <div className="text-sm leading-relaxed">
      <div className="mb-3 flex gap-1 rounded-lg border border-line bg-panel-2 p-0.5">
        {(
          [
            ['kalkulacka', 'Kalkulačka rizika'],
            ['faktory', 'Rizikové faktory'],
          ] as const
        ).map(([k, l]) => (
          <button key={k} type="button" onClick={() => setTab(k)} className={`flex-1 rounded-md px-2 py-1 text-xs font-medium ${tab === k ? 'bg-accent text-white' : 'text-muted hover:text-ink'}`}>
            {l}
          </button>
        ))}
      </div>
      {tab === 'kalkulacka' ? (
        <div className="fade-up">
          <h2 className="text-lg font-bold">Jaké je moje riziko?</h2>
          <p className="mb-3 text-muted">Posuňte hodnoty a sledujte, jak se mění odhad rizika i tepna na modelu.</p>
          <RiskCalculator />
        </div>
      ) : (
        <div className="fade-up">
          <h2 className="text-lg font-bold">Rizikové faktory</h2>
          <p className="text-muted">Čím více faktorů se sejde, tím více se jejich účinek násobí – dva „mírné“ faktory dohromady mohou znamenat vysoké riziko.</p>
          {[
            { m: false, title: 'Neovlivnitelné' },
            { m: true, title: 'Ovlivnitelné – tady se rozhoduje' },
          ].map((g) => (
            <div key={g.title}>
              <h3 className={`mb-1 mt-4 text-[11px] font-semibold uppercase tracking-wider ${g.m ? 'text-[#7ef29a]' : 'text-muted'}`}>{g.title}</h3>
              <div className="space-y-2">
                {riskFactors
                  .filter((f) => f.modifiable === g.m)
                  .map((f) => (
                    <div key={f.name} className="rounded-lg border border-line bg-panel-2 p-2.5">
                      <div className="font-semibold">{f.name}</div>
                      <RichText text={f.text} className="mt-0.5 text-xs text-ink/90" />
                      {f.target && (
                        <div className="mt-1 text-xs">
                          <span className="font-semibold text-accent-2">Cíl: </span>
                          <RichText text={f.target} className="inline" />
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
