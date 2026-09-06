import { useStore } from '../store'
import { Btn } from './ui'

/** Tlačítka nad 3D scénou: řez, průhlednost, reset pohledu. */
export function ViewControls() {
  const cutaway = useStore((s) => s.cutaway)
  const transparent = useStore((s) => s.transparent)
  const toggleCutaway = useStore((s) => s.toggleCutaway)
  const toggleTransparent = useStore((s) => s.toggleTransparent)
  const requestReset = useStore((s) => s.requestReset)
  return (
    <div className="pointer-events-auto flex flex-wrap gap-1.5">
      <Btn active={cutaway} onClick={toggleCutaway} title="Zobrazit vnitřek srdce" aria-label="Řez srdcem">
        <span aria-hidden>◐</span> <span className="hidden sm:inline">Řez srdcem</span>
      </Btn>
      <Btn active={transparent} onClick={toggleTransparent} title="Průhledná svalovina" aria-label="Průhlednost">
        <span aria-hidden>◌</span> <span className="hidden sm:inline">Průhlednost</span>
      </Btn>
      <Btn onClick={requestReset} title="Vrátit kameru do výchozí polohy" aria-label="Reset pohledu">
        <span aria-hidden>⟲</span> <span className="hidden sm:inline">Reset pohledu</span>
      </Btn>
    </div>
  )
}
