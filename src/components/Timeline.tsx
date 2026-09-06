import { useEffect, useRef, type ReactNode } from 'react'
import { Btn } from './ui'

export interface TimelineStep {
  name: string
  /** začátek kroku v jednotkách průběhu 0–1 (pro proporcionální šířku) */
  from?: number
  to?: number
}

interface TimelineProps {
  steps: TimelineStep[]
  current: number
  onStep: (i: number) => void
  playing: boolean
  onPlayToggle: () => void
  speed?: number
  speeds?: number[]
  onSpeed?: (s: number) => void
  /** funkce vracející průběh 0–1 (čte se každý snímek, bez re-renderu) */
  progressFn?: () => number
  /** krok = -1 znamená volný běh (žádný krok nevybrán) */
  allowFree?: boolean
  label?: ReactNode
  /** vlastní obsah vpravo (např. EKG legenda) */
  extra?: ReactNode
}

/** Časová osa animace: přehrát / pauza, krok vpřed / vzad, rychlost, ukazatel průběhu. */
export function Timeline({
  steps,
  current,
  onStep,
  playing,
  onPlayToggle,
  speed,
  speeds,
  onSpeed,
  progressFn,
  allowFree,
  label,
  extra,
}: TimelineProps) {
  const bar = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!progressFn) return
    let raf = 0
    const loop = () => {
      if (bar.current) bar.current.style.left = `${progressFn() * 100}%`
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [progressFn])

  const canBack = current > 0 || (allowFree && current === -1)
  const canFwd = current < steps.length - 1

  return (
    <div className="flex flex-col gap-2 px-3 py-2 md:flex-row md:items-center md:gap-4">
      <div className="flex items-center gap-1.5">
        <Btn onClick={() => onStep(current <= 0 ? (allowFree ? -1 : 0) : current - 1)} disabled={!canBack} title="Krok zpět" aria-label="Krok zpět">
          ⏮
        </Btn>
        <Btn onClick={onPlayToggle} active={playing} title={playing ? 'Pozastavit' : 'Přehrát'} aria-label={playing ? 'Pozastavit' : 'Přehrát'} className="min-w-[44px] justify-center">
          {playing ? '⏸' : '▶'}
        </Btn>
        <Btn onClick={() => onStep(Math.min(steps.length - 1, current + 1))} disabled={!canFwd} title="Krok vpřed" aria-label="Krok vpřed">
          ⏭
        </Btn>
        {speeds && onSpeed && (
          <div className="ml-1 flex items-center gap-0.5 rounded-lg border border-line bg-panel-2 p-0.5" role="group" aria-label="Rychlost">
            {speeds.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => onSpeed(s)}
                className={`rounded-md px-1.5 py-0.5 text-[11px] font-medium ${speed === s ? 'bg-accent text-white' : 'text-muted hover:text-ink'}`}
              >
                {s}×
              </button>
            ))}
          </div>
        )}
      </div>
      <div className="min-w-0 flex-1">
        {label && <div className="mb-1 truncate text-[11px] text-muted">{label}</div>}
        <div className="relative flex h-9 w-full gap-0.5 overflow-hidden rounded-lg">
          {steps.map((s, i) => {
            const w = s.from !== undefined && s.to !== undefined ? `${(s.to - s.from) * 100}%` : undefined
            return (
              <button
                key={i}
                type="button"
                onClick={() => onStep(i)}
                style={w ? { width: w, flex: 'none' } : undefined}
                className={`line-clamp-2 min-w-0 flex-1 border px-1.5 text-left text-[10px] leading-[1.15] transition-colors sm:text-[11px] ${
                  i === current ? 'border-accent/70 bg-accent/25 text-white' : 'border-line bg-panel-2 text-muted hover:text-ink'
                }`}
                title={s.name}
              >
                <span className="mr-1 opacity-60">{i + 1}.</span>
                {s.name}
              </button>
            )
          })}
          {progressFn && <div ref={bar} className="pointer-events-none absolute top-0 h-full w-0.5 bg-accent-2 shadow-[0_0_6px_#ffd166]" />}
        </div>
      </div>
      {extra}
    </div>
  )
}
