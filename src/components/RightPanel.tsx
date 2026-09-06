import type { ReactNode } from 'react'
import { useStore } from '../store'
import { structures } from '../data/structures'
import { RichText } from './RichText'

const groupLabel: Record<string, string> = {
  dutina: 'Srdeční dutina',
  chlopen: 'Chlopeň',
  ceva: 'Velká céva',
  koronarni: 'Věnčitá (koronární) tepna',
  prevodni: 'Převodní systém',
  patologie: 'Patologie',
  lecba: 'Léčba',
}

/** Obsah panelu pro vybranou strukturu. */
function StructureContent() {
  const selected = useStore((s) => s.selected)
  if (!selected) return null
  const st = structures[selected]
  return (
    <div className="fade-up">
      <div className="text-[11px] font-semibold uppercase tracking-wider text-accent-2">{groupLabel[st.group]}</div>
      <h2 className="mt-1 text-xl font-bold leading-tight">{st.name}</h2>
      {st.latin && <div className="mt-0.5 text-sm italic text-muted">{st.latin}</div>}
      <div className="mt-4 rounded-lg border border-accent/30 bg-accent/10 p-3 text-sm leading-relaxed">
        <div className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-accent">Funkce</div>
        <RichText text={st.fn} />
      </div>
      <RichText text={st.text} className="mt-4 text-sm leading-relaxed text-ink/90" />
      {st.note && (
        <div className="mt-4 rounded-lg border border-line bg-panel-2 p-3 text-sm leading-relaxed text-ink/90">
          <span className="mr-1.5 font-semibold text-accent-2">Věděli jste?</span>
          <RichText text={st.note} className="inline" />
        </div>
      )}
    </div>
  )
}

/**
 * Výsuvný panel vpravo. Zobrazuje vybranou strukturu, nebo obsah dodaný režimem (`content`).
 */
export function RightPanel({ content, title }: { content?: ReactNode; title?: string }) {
  const open = useStore((s) => s.panelOpen)
  const setOpen = useStore((s) => s.setPanelOpen)
  const selected = useStore((s) => s.selected)
  const select = useStore((s) => s.select)
  const hasContent = selected !== null || !!content
  const visible = open && hasContent

  const close = () => {
    setOpen(false)
    select(null)
  }

  return (
    <>
      {/* mobilní podklad */}
      {visible && <div className="fixed inset-0 z-30 bg-black/50 md:hidden" onClick={close} />}
      {/* desktop: panel je součástí layoutu a zasouvá se změnou šířky */}
      <aside
        className={`hidden shrink-0 overflow-hidden border-line bg-panel transition-[width] duration-300 md:flex md:flex-col ${
          visible ? 'w-[360px] border-l' : 'w-0'
        }`}
        aria-hidden={!visible}
      >
        <div className="flex w-[360px] min-h-0 flex-1 flex-col">
          <PanelBody title={selected ? 'Struktura' : (title ?? 'Vysvětlení')} onClose={close}>
            {selected ? <StructureContent /> : content}
          </PanelBody>
        </div>
      </aside>
      {/* mobil: spodní list */}
      <aside
        className={`fixed inset-x-0 bottom-0 z-40 flex max-h-[72vh] flex-col rounded-t-2xl border-t border-line bg-panel/95 shadow-2xl shadow-black/50 backdrop-blur transition-transform duration-300 md:hidden ${
          visible ? 'translate-y-0' : 'translate-y-full'
        }`}
        aria-hidden={!visible}
      >
        <PanelBody title={selected ? 'Struktura' : (title ?? 'Vysvětlení')} onClose={close}>
          {selected ? <StructureContent /> : content}
        </PanelBody>
      </aside>
    </>
  )
}

function PanelBody({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  return (
    <>
      <div className="flex shrink-0 items-center justify-between border-b border-line px-4 py-2.5">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted">{title}</span>
        <button type="button" onClick={onClose} className="rounded-md px-2 py-1 text-muted hover:bg-line hover:text-ink" aria-label="Zavřít panel">
          ✕
        </button>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">{children}</div>
    </>
  )
}
