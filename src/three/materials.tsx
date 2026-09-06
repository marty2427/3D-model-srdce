import { createContext, useContext, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useStore } from '../store'

export const colors = {
  myocardium: '#b3423c',
  myocardiumLight: '#c9605a',
  atrium: '#c96a63',
  cavityOxy: '#7a1a1a',
  cavityDeoxy: '#3a2f6e',
  artery: '#d9403a',
  vein: '#4b6fd6',
  pulmonaryArtery: '#5b76d8',
  pulmonaryVein: '#d6524c',
  coronary: '#ff6a5b',
  valve: '#f1d9c7',
  conduction: '#ffd166',
  ischemia: '#6b1f2a',
  necrosis: '#5d5a5e',
  plaque: '#f3e2a6',
  thrombus: '#4a0f16',
  graft: '#ff9f6b',
  metal: '#c8d0dc',
}

/** Rovina řezu – odstraní přední (z > 0.12) polovinu srdce. */
export const cutPlane = new THREE.Plane(new THREE.Vector3(0, 0, -1), 0.12)

export interface PickState {
  hovered: boolean
  selected: boolean
}
export const PickContext = createContext<PickState>({ hovered: false, selected: false })

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
  animate?: (m: THREE.MeshStandardMaterial, baseEmissive: string, baseIntensity: number) => void
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
  useFrame(() => {
    if (animate && ref.current) animate(ref.current, em, emI)
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
