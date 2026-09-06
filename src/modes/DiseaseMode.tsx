import { useStore, type DiseaseId } from '../store'
import { diseaseCategories, diseaseList, diseases } from '../data/diseases'
import { RichText } from '../components/RichText'
import { SectionTitle, Toggle } from '../components/ui'
import { ecgLabel } from '../lib/ecg'
import { useHeartParams } from '../three/params'

export function DiseaseMenu() {
  const disease = useStore((s) => s.disease)
  const setDisease = useStore((s) => s.setDisease)
  const transparent = useStore((s) => s.transparent)
  const toggleTransparent = useStore((s) => s.toggleTransparent)
  const cutaway = useStore((s) => s.cutaway)
  const toggleCutaway = useStore((s) => s.toggleCutaway)
  return (
    <div>
      <SectionTitle>Vyberte patologii</SectionTitle>
      <button
        type="button"
        onClick={() => setDisease(null)}
        className={`mb-2 w-full rounded-md border px-2 py-1.5 text-left text-sm ${
          disease === null ? 'border-accent-2 bg-accent-2/10 text-accent-2' : 'border-line bg-panel-2 hover:border-muted/60'
        }`}
      >
        ✓ Zdravé srdce (bez patologie)
      </button>
      {diseaseCategories.map((c) => (
        <div key={c.id} className="mb-2">
          <div className="mb-1 text-[11px] font-medium text-muted">{c.name}</div>
          <div className="flex flex-col gap-1">
            {diseaseList
              .filter((d) => d.category === c.id)
              .map((d) => (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => setDisease(d.id as DiseaseId)}
                  className={`rounded-md border px-2 py-1.5 text-left text-xs leading-snug transition-colors ${
                    disease === d.id ? 'border-accent bg-accent/15 text-white' : 'border-line bg-panel-2 text-ink/90 hover:border-muted/60'
                  }`}
                >
                  {d.name.split(' (')[0]}
                </button>
              ))}
          </div>
        </div>
      ))}
      <SectionTitle>Zobrazení</SectionTitle>
      <Toggle on={transparent} onChange={toggleTransparent} label="Průhledná svalovina" />
      <Toggle on={cutaway} onChange={toggleCutaway} label="Řez srdcem" />
    </div>
  )
}

function List({ title, items, color }: { title: string; items: string[]; color: string }) {
  return (
    <div className="mt-4">
      <h3 className={`mb-1 text-[11px] font-semibold uppercase tracking-wider ${color}`}>{title}</h3>
      <ul className="space-y-1 pl-4 text-sm leading-relaxed marker:text-muted">
        {items.map((it, i) => (
          <li key={i} className="list-disc">
            <RichText text={it} className="inline" />
          </li>
        ))}
      </ul>
    </div>
  )
}

export function DiseasePanel() {
  const disease = useStore((s) => s.disease)
  const params = useHeartParams()
  if (!disease) {
    return (
      <div className="text-sm leading-relaxed">
        <h2 className="text-lg font-bold">Nemoci srdce</h2>
        <p className="mt-2">Vyberte v levém menu patologii. Projeví se přímo na 3D modelu (zúžená tepna, odumřelá stěna, chvějící se síně, rozšířené komory, vadná chlopeň) i na EKG křivce pod modelem.</p>
        <p className="mt-2 text-muted">Kardiovaskulární nemoci jsou v Česku příčinou asi 40 % všech úmrtí – většině z nich lze předcházet.</p>
      </div>
    )
  }
  const d = diseases[disease]
  return (
    <div className="fade-up text-sm leading-relaxed" key={d.id}>
      <div className="text-[11px] font-semibold uppercase tracking-wider text-accent-2">{diseaseCategories.find((c) => c.id === d.category)?.name}</div>
      <h2 className="mt-1 text-lg font-bold leading-tight">{d.name}</h2>
      <p className="mt-1 text-muted">{d.short}</p>
      <div className="mt-3 rounded-lg border border-accent/30 bg-accent/10 p-3">
        <div className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-accent">Co se děje</div>
        <RichText text={d.what} />
      </div>
      <div className="mt-3 rounded-lg border border-line bg-panel-2 p-3">
        <div className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-accent-2">Na modelu a EKG</div>
        <RichText text={d.model} />
        <div className="mt-2 text-xs text-muted">
          EKG: {ecgLabel[params.ecg]} · frekvence {params.bpm}/min{params.irregularity ? ' (nepravidelně)' : ''}
        </div>
      </div>
      <List title="Příčiny" items={d.causes} color="text-accent-2" />
      <List title="Příznaky" items={d.symptoms} color="text-accent" />
      <List title="Rizikové faktory" items={d.risks} color="text-[#ff9f6b]" />
      <List title="Jak se léčí" items={d.treatment} color="text-[#7ef29a]" />
    </div>
  )
}
