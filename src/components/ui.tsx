import type { ButtonHTMLAttributes, ReactNode } from 'react'

export function Btn({
  active,
  className = '',
  children,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { active?: boolean }) {
  return (
    <button
      type="button"
      className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-2 disabled:opacity-40 ${
        active
          ? 'border-accent/70 bg-accent/20 text-white'
          : 'border-line bg-panel-2 text-ink hover:border-muted/60 hover:bg-line/60'
      } ${className}`}
      {...rest}
    >
      {children}
    </button>
  )
}

export function Toggle({ on, onChange, label }: { on: boolean; onChange: () => void; label: ReactNode }) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-3 py-1 text-sm">
      <span>{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={on}
        onClick={onChange}
        className={`relative h-5 w-9 shrink-0 rounded-full transition-colors ${on ? 'bg-accent' : 'bg-line'}`}
      >
        <span
          className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform ${on ? 'left-0.5 translate-x-4' : 'left-0.5'}`}
        />
      </button>
    </label>
  )
}

export function SectionTitle({ children }: { children: ReactNode }) {
  return <h3 className="mb-1.5 mt-4 text-[11px] font-semibold uppercase tracking-wider text-muted first:mt-0">{children}</h3>
}

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-xl border border-line bg-panel p-3 ${className}`}>{children}</div>
}
