import { useCallback, useMemo, type ReactNode } from 'react'
import type { ThreeEvent } from '@react-three/fiber'
import { useStore } from '../store'
import type { StructureId } from '../data/structures'
import { PickContext } from './materials'

interface PickProps {
  id: StructureId
  children: ReactNode
  disabled?: boolean
}

/** Skupina, na kterou lze kliknout – označí strukturu a otevře panel s popisem. */
export function Pick({ id, children, disabled }: PickProps) {
  const hovered = useStore((s) => s.hovered === id)
  const selected = useStore((s) => s.selected === id)
  const select = useStore((s) => s.select)
  const setHovered = useStore((s) => s.setHovered)

  const onClick = useCallback(
    (e: ThreeEvent<MouseEvent>) => {
      if (disabled) return
      e.stopPropagation()
      select(id)
    },
    [id, select, disabled],
  )
  const onOver = useCallback(
    (e: ThreeEvent<PointerEvent>) => {
      if (disabled) return
      e.stopPropagation()
      setHovered(id)
      document.body.style.cursor = 'pointer'
    },
    [id, setHovered, disabled],
  )
  const onOut = useCallback(() => {
    if (disabled) return
    setHovered(null)
    document.body.style.cursor = ''
  }, [setHovered, disabled])

  const value = useMemo(() => ({ hovered, selected }), [hovered, selected])

  return (
    <PickContext.Provider value={value}>
      <group onClick={onClick} onPointerOver={onOver} onPointerOut={onOut}>
        {children}
      </group>
    </PickContext.Provider>
  )
}
