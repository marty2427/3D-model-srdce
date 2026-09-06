import { useStore, type LayerId } from '../store'
import { SectionTitle, Toggle } from '../components/ui'
import { structureList } from '../data/structures'
import { RichText } from '../components/RichText'

const layerLabels: { id: LayerId; label: string }[] = [
  { id: 'svalovina', label: 'Svalovina (dutiny)' },
  { id: 'chlopne', label: 'Chlopně' },
  { id: 'cevy', label: 'Velké cévy' },
  { id: 'koronarni', label: 'Koronární tepny' },
  { id: 'prevodni', label: 'Převodní systém' },
  { id: 'popisky', label: 'Popisky struktur' },
]

export function AnatomyMenu() {
  const layers = useStore((s) => s.layers)
  const toggleLayer = useStore((s) => s.toggleLayer)
  const select = useStore((s) => s.select)
  const selected = useStore((s) => s.selected)
  const groups: { g: string; label: string }[] = [
    { g: 'dutina', label: 'Dutiny' },
    { g: 'chlopen', label: 'Chlopně' },
    { g: 'ceva', label: 'Velké cévy' },
    { g: 'koronarni', label: 'Koronární tepny' },
    { g: 'prevodni', label: 'Převodní systém' },
  ]
  return (
    <div>
      <SectionTitle>Vrstvy</SectionTitle>
      {layerLabels.map((l) => (
        <Toggle key={l.id} on={layers[l.id]} onChange={() => toggleLayer(l.id)} label={l.label} />
      ))}
      <SectionTitle>Struktury</SectionTitle>
      <p className="mb-2 text-xs text-muted">Klikněte na strukturu v modelu nebo v seznamu.</p>
      {groups.map((gr) => (
        <div key={gr.g} className="mb-2">
          <div className="mb-1 text-[11px] font-medium text-muted">{gr.label}</div>
          <div className="flex flex-wrap gap-1">
            {structureList
              .filter((s) => s.group === gr.g)
              .map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => select(s.id)}
                  className={`rounded-md border px-2 py-0.5 text-xs transition-colors ${
                    selected === s.id ? 'border-accent-2 bg-accent-2/15 text-accent-2' : 'border-line bg-panel-2 text-ink/90 hover:border-muted/60'
                  }`}
                >
                  {s.name.split(' – ')[0].split(' (')[0]}
                </button>
              ))}
          </div>
        </div>
      ))}
    </div>
  )
}

export function AnatomyPanel() {
  return (
    <div className="space-y-3 text-sm leading-relaxed">
      <h2 className="text-lg font-bold">Anatomie srdce</h2>
      <RichText text="Srdce je dutý svalový orgán velikosti pěsti (asi 300 g), uložený v hrudníku mezi plícemi, ze dvou třetin vlevo od střední čáry. Tvoří ho čtyři dutiny: dvě [[sino|síně]] a dvě [[komora|komory]]." />
      <RichText text="Pravá polovina srdce přijímá [[odkysličená|odkysličenou krev]] z těla a posílá ji do plic (malý oběh). Levá polovina přijímá [[okysličená|okysličenou krev]] z plic a vhání ji do celého těla (velký oběh)." />
      <RichText text="Stěna srdce má tři vrstvy: [[endokard]], [[myokard]] a [[epikard]]. Celé srdce je uloženo v [[perikard|osrdečníku]]. Svalovinu zásobují věnčité tepny – právě jejich zúžení je podstatou nejčastějších srdečních nemocí." />
      <p className="text-muted">Tip: otáčejte tažením myší, zoomujte kolečkem, posouvejte pravým tlačítkem. Na mobilu jedním nebo dvěma prsty.</p>
    </div>
  )
}
