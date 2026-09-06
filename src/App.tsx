import { useEffect, type ReactNode } from 'react'
import { useStore } from './store'
import { Scene } from './three/Scene'
import { LeftMenu, modes } from './components/LeftMenu'
import { RightPanel } from './components/RightPanel'
import { ViewControls } from './components/ViewControls'
import { tickHeartClock } from './lib/heartClock'
import { conductionSteps, cyclePhases } from './lib/cycle'
import { useHeartParams } from './three/params'
import { AnatomyMenu, AnatomyPanel } from './modes/AnatomyMode'
import { FunctionMenu, FunctionPanel, FunctionTimeline } from './modes/FunctionMode'
import { ConductionMenu, ConductionPanel, ConductionTimeline } from './modes/ConductionMode'
import { EcgStrip } from './components/EcgStrip'

/** Řídí hodiny srdce (fázi cyklu) podle přehrávání, rychlosti a rytmu. */
function useHeartClockDriver() {
  const params = useHeartParams()
  useEffect(() => {
    let raf = 0
    const loop = (now: number) => {
      const s = useStore.getState()
      const list = s.mode === 'prevodni' ? conductionSteps : cyclePhases
      const range: [number, number] | undefined =
        s.cycleStep !== null && list[s.cycleStep] ? [list[s.cycleStep].from, list[s.cycleStep].to] : undefined
      tickHeartClock(now, s.playing || s.cycleStep !== null, s.speed, { bpm: params.bpm, irregularity: params.irregularity }, Math.random, range)
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [params.bpm, params.irregularity])
}

interface ModeUI {
  menu: ReactNode
  panel: ReactNode
  panelTitle?: string
  timeline?: ReactNode
  ecg?: boolean
}

function useModeUI(): ModeUI {
  const mode = useStore((s) => s.mode)
  switch (mode) {
    case 'anatomie':
      return { menu: <AnatomyMenu />, panel: <AnatomyPanel />, panelTitle: 'Anatomie' }
    case 'funkce':
      return { menu: <FunctionMenu />, panel: <FunctionPanel />, panelTitle: 'Jak srdce funguje', timeline: <FunctionTimeline /> }
    case 'prevodni':
      return { menu: <ConductionMenu />, panel: <ConductionPanel />, panelTitle: 'Převodní systém', timeline: <ConductionTimeline />, ecg: true }
    default:
      return {
        menu: <p className="text-sm text-muted">Tento režim se připravuje.</p>,
        panel: <p className="text-sm text-muted">Tento režim se připravuje.</p>,
      }
  }
}

export default function App() {
  useHeartClockDriver()
  const mode = useStore((s) => s.mode)
  const setMenuOpen = useStore((s) => s.setMenuOpen)
  const setPanelOpen = useStore((s) => s.setPanelOpen)
  const panelOpen = useStore((s) => s.panelOpen)
  const selected = useStore((s) => s.selected)
  const ui = useModeUI()
  const current = modes.find((m) => m.id === mode)!

  return (
    <div className="flex h-full flex-col md:flex-row">
      {/* mobilní horní lišta */}
      <header className="flex items-center gap-2 border-b border-line bg-panel px-3 py-2 md:hidden">
        <button
          type="button"
          onClick={() => setMenuOpen(true)}
          className="rounded-md border border-line px-2.5 py-1.5 text-sm"
          aria-label="Otevřít menu"
        >
          ☰
        </button>
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-bold">
            {current.icon} {current.name}
          </div>
        </div>
        <button
          type="button"
          onClick={() => setPanelOpen(!panelOpen)}
          className="rounded-md border border-line px-2.5 py-1.5 text-sm"
          aria-label="Otevřít vysvětlení"
        >
          ℹ︎
        </button>
      </header>

      <LeftMenu>{ui.menu}</LeftMenu>

      <main className="relative flex min-h-0 min-w-0 flex-1 flex-col">
        <div className="relative min-h-0 flex-1">
          <Scene />
          <div className="pointer-events-none absolute left-3 top-3 z-10 flex flex-col gap-2">
            <ViewControls />
          </div>
          <div className="pointer-events-none absolute right-3 top-3 z-10 hidden md:block">
            {!panelOpen && (
              <button
                type="button"
                onClick={() => setPanelOpen(true)}
                className="pointer-events-auto rounded-lg border border-line bg-panel/90 px-3 py-1.5 text-sm text-ink backdrop-blur hover:border-muted/60"
              >
                ℹ︎ Vysvětlení
              </button>
            )}
          </div>
          {!selected && (
            <div className="pointer-events-none absolute bottom-3 left-3 z-10 hidden text-[11px] text-muted md:block">
              Klikněte na strukturu pro popis • táhněte pro otočení • kolečko = zoom • pravé tlačítko = posun
            </div>
          )}
        </div>
        {ui.ecg && <EcgStrip />}
        {ui.timeline && <div className="border-t border-line bg-panel">{ui.timeline}</div>}
      </main>

      <RightPanel content={ui.panel} title={ui.panelTitle} />
    </div>
  )
}
