import { Html } from '@react-three/drei'
import { structures } from '../data/structures'
import { labelDefs, type LabelDef } from '../data/labels'
import { useStore } from '../store'


/** Textové popisky struktur (HTML nad 3D scénou). */
export function Labels({ only, cutaway }: { only?: LabelDef['layer'][]; cutaway: boolean }) {
  const layers = useStore((s) => s.layers)
  const select = useStore((s) => s.select)
  const selected = useStore((s) => s.selected)
  if (!layers.popisky) return null
  return (
    <>
      {labelDefs
        .filter((l) => (only ? only.includes(l.layer) : layers[l.layer]))
        .filter((l) => !l.cutOnly || cutaway)
        .map((l) => (
          <Html key={l.id} position={l.at} zIndexRange={[5, 0]} style={{ pointerEvents: 'none' }}>
            <button
              type="button"
              className={`label-chip ${selected === l.id ? '!border-accent-2 !text-accent-2' : ''}`}
              style={{ pointerEvents: 'auto', cursor: 'pointer' }}
              onClick={() => select(l.id)}
            >
              {l.short ?? structures[l.id].name}
            </button>
          </Html>
        ))}
    </>
  )
}
