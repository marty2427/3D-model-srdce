import { useId, useState, type ReactNode } from 'react'
import { glossary } from '../data/glossary'

/** Pojem ze slovníčku s tooltipem po najetí / zaměření. */
export function Term({ k, children }: { k: string; children?: ReactNode }) {
  const [open, setOpen] = useState(false)
  const id = useId()
  const g = glossary[k]
  if (!g) return <>{children ?? k}</>
  return (
    <span
      className="term"
      tabIndex={0}
      aria-describedby={id}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
      onClick={() => setOpen((o) => !o)}
    >
      {children ?? g.term}
      {open && (
        <span
          id={id}
          role="tooltip"
          className="absolute left-1/2 bottom-full z-50 mb-2 w-64 -translate-x-1/2 rounded-lg border border-line bg-panel-2 p-2.5 text-xs leading-relaxed text-ink shadow-xl shadow-black/40 fade-up"
        >
          <span className="mb-1 block font-semibold text-accent-2">{g.term}</span>
          {g.text}
        </span>
      )}
    </span>
  )
}

const RE = /\[\[([a-z0-9-]+)(?:\|([^\]]+))?\]\]|\*\*([^*]+)\*\*/gi

/** Text s odkazy na slovníček ve tvaru [[klic]] nebo [[klic|text]]. */
export function RichText({ text, className }: { text: string; className?: string }) {
  const parts: ReactNode[] = []
  let last = 0
  let m: RegExpExecArray | null
  RE.lastIndex = 0
  let i = 0
  while ((m = RE.exec(text))) {
    if (m.index > last) parts.push(text.slice(last, m.index))
    if (m[3] !== undefined) parts.push(<strong key={i++} className="font-semibold text-ink">{m[3]}</strong>)
    else
      parts.push(
        <Term key={i++} k={m[1]}>
          {m[2] ?? glossary[m[1]]?.term ?? m[1]}
        </Term>,
      )
    last = m.index + m[0].length
  }
  if (last < text.length) parts.push(text.slice(last))
  return <p className={className}>{parts}</p>
}
