import { useMemo } from 'react'
import * as THREE from 'three'
import type { Ellipsoid } from './geometry'
import { HeartMaterial } from './materials'

interface ChamberProps {
  e: Ellipsoid
  color: string
  cavityColor: string
  /** relativní velikost dutiny (menší = silnější stěna) */
  cavity?: number
  /** dodatečné měřítko (dilatace) */
  scale?: number
  emissive?: string
  emissiveIntensity?: number
  animate?: (m: THREE.MeshStandardMaterial, baseEmissive: string, baseIntensity: number) => void
  visible?: boolean
}

/**
 * Srdeční dutina: vnější stěna (elipsoid) + vnitřní dutina renderovaná zevnitř,
 * takže po řezu je vidět tloušťka stěny a barva krve uvnitř.
 */
export function Chamber({ e, color, cavityColor, cavity = 0.72, scale = 1, emissive, emissiveIntensity, animate, visible = true }: ChamberProps) {
  const geo = useMemo(() => new THREE.SphereGeometry(1, 48, 32), [])
  const cav = useMemo(() => new THREE.SphereGeometry(1, 32, 24), [])
  const s: [number, number, number] = [e.scale[0] * scale, e.scale[1] * scale, e.scale[2] * scale]
  return (
    <group position={e.center} rotation={[0, 0, e.rotZ]} visible={visible}>
      <mesh geometry={geo} scale={s}>
        <HeartMaterial color={color} emissive={emissive} emissiveIntensity={emissiveIntensity} roughness={0.62} animate={animate} />
      </mesh>
      <mesh geometry={cav} scale={[s[0] * cavity, s[1] * cavity, s[2] * cavity]}>
        <HeartMaterial color={cavityColor} side={THREE.BackSide} transparentOpacity={0.08} roughness={0.9} />
      </mesh>
    </group>
  )
}
