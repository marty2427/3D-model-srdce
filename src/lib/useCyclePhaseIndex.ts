import { useEffect, useState } from 'react'
import { phaseIndex } from './cycle'
import { heartClock } from './heartClock'

/** Index aktuální fáze cyklu (aktualizuje se jen při změně). */
export function useCyclePhaseIndex() {
  const [idx, setIdx] = useState(() => phaseIndex(heartClock.phase))
  useEffect(() => {
    let raf = 0
    const loop = () => {
      const i = phaseIndex(heartClock.phase)
      setIdx((prev) => (prev === i ? prev : i))
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [])
  return idx
}
