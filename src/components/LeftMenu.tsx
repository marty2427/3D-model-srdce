import type { ReactNode } from 'react'
import { useStore } from '../store'
import { modes } from '../data/modes'


/** Levé menu s režimy a ovládáním aktuálního režimu. Na mobilu je to výsuvný panel. */
export function LeftMenu({ children }: { children?: ReactNode }) {
  const mode = useStore((s) => s.mode)
  const setMode = useStore((s) => s.setMode)
  const open = useStore((s) => s.menuOpen)
  const setOpen = useStore((s) => s.setMenuOpen)

  return (
    <>
      {open && <div className="fixed inset-0 z-30 bg-black/50 md:hidden" onClick={() => setOpen(false)} />}
      <nav
        className={`fixed inset-y-0 left-0 z-40 flex w-[290px] flex-col border-r border-line bg-panel transition-transform duration-300 md:static md:z-auto md:w-[280px] md:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
        aria-label="Režimy"
      >
        <div className="flex items-center gap-2 border-b border-line px-4 py-3">
          <span className="text-2xl" aria-hidden>
            🫀
          </span>
          <div className="min-w-0">
            <div className="text-base font-bold leading-tight">3D model srdce</div>
            <div className="text-[11px] text-muted">Interaktivní vzdělávací nástroj</div>
          </div>
          <button
            type="button"
            className="ml-auto rounded-md px-2 py-1 text-muted hover:bg-line hover:text-ink md:hidden"
            onClick={() => setOpen(false)}
            aria-label="Zavřít menu"
          >
            ✕
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">
          <ul className="p-2">
            {modes.map((m, i) => (
              <li key={m.id}>
                <button
                  type="button"
                  onClick={() => setMode(m.id)}
                  className={`flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left transition-colors ${
                    mode === m.id ? 'bg-accent/15 text-white ring-1 ring-accent/50' : 'text-ink/90 hover:bg-line/60'
                  }`}
                  aria-current={mode === m.id ? 'page' : undefined}
                >
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-md bg-panel-2 text-lg" aria-hidden>
                    {m.icon}
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold leading-tight">
                      <span className="mr-1 text-muted">{i + 1}.</span>
                      {m.name}
                    </span>
                    <span className="block truncate text-[11px] text-muted">{m.hint}</span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
          {children && <div className="border-t border-line px-3 py-3">{children}</div>}
        </div>
        <div className="border-t border-line px-4 py-2 text-[10px] leading-snug text-muted">
          Vzdělávací pomůcka, nenahrazuje lékařskou péči. Model je zjednodušený.
        </div>
      </nav>
    </>
  )
}
