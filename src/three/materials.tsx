import { useContext, useRef } from 'react'
import { cutPlane, PickContext } from './constants'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useStore } from '../store'


interface HeartMaterialProps {
  color: string
  /** krytí v průhledném režimu */
  transparentOpacity?: number
  /** zda se struktura řeže rovinou řezu */
  clip?: boolean
  /** struktura je vždy neprůhledná (chlopně, převodní systém…) */
  alwaysOpaque?: boolean
  side?: THREE.Side
  emissive?: string
  emissiveIntensity?: number
  roughness?: number
  metalness?: number
  opacity?: number
  flat?: boolean
  /** volá se každý snímek – umožňuje animovat barvu/záři (dostane základní emisi a intenzitu) */
  animate?: (m: THREE.MeshStandardMaterial, baseEmissive: string, baseIntensity: number, delta: number) => void
}

/** Standardní materiál srdečních struktur: reaguje na řez, průhlednost a výběr. */
export function HeartMaterial({
  color,
  transparentOpacity = 0.22,
  clip = true,
  alwaysOpaque = false,
  side,
  emissive,
  emissiveIntensity,
  roughness = 0.6,
  metalness = 0.05,
  opacity,
  flat,
  animate,
}: HeartMaterialProps) {
  const ref = useRef<THREE.MeshStandardMaterial>(null)
  const cutaway = useStore((s) => s.cutaway)
  const transparent = useStore((s) => s.transparent)
  const pick = useContext(PickContext)
  const hl = pick.selected ? 2 : pick.hovered ? 1 : 0
  const em = hl === 2 ? '#ffd166' : hl === 1 ? '#ffffff' : (emissive ?? '#000000')
  const emI = hl === 2 ? 0.45 : hl === 1 ? 0.22 : (emissiveIntensity ?? 0)
  const isT = (transparent && !alwaysOpaque) || (opacity !== undefined && opacity < 1)
  const op = isT ? (opacity !== undefined && opacity < 1 ? opacity : transparentOpacity) : 1
  useFrame((_, delta) => {
    if (animate && ref.current) animate(ref.current, em, emI, Math.min(delta, 0.1))
  })
  return (
    <meshStandardMaterial
      ref={ref}
      color={color}
      roughness={roughness}
      metalness={metalness}
      emissive={em}
      emissiveIntensity={emI}
      transparent={isT}
      opacity={op}
      depthWrite={!isT}
      side={side ?? (cutaway ? THREE.DoubleSide : THREE.FrontSide)}
      clippingPlanes={cutaway && clip ? [cutPlane] : null}
      flatShading={flat ?? false}
    />
  )
}
