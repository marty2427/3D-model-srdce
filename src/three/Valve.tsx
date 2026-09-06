import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { HeartMaterial } from './materials'
import type { V3 } from './geometry'

interface ValveProps {
  position: V3
  /** směr toku krve chlopní (jednotkový vektor není nutný) */
  direction: V3
  radius: number
  leaflets: number
  kind: 'av' | 'semilunar'
  /** funkce vracející otevření 0–1 podle času (volá se každý snímek) */
  openFn: () => number
  color?: string
  /** zesílené, kalcifikované cípy (stenóza) */
  thick?: boolean
  /** maximální otevření (stenóza < 1) */
  maxOpen?: number
  /** minimální otevření (insuficience > 0) */
  minOpen?: number
}

const up = new THREE.Vector3(0, -1, 0)

/**
 * Chlopeň: prstenec (anulus) + cípy zavěšené na obvodu.
 * AV chlopně se otevírají „dolů“ do komory, poloměsíčité „nahoru“ do tepny.
 */
export function Valve({
  position,
  direction,
  radius,
  leaflets,
  kind,
  openFn,
  color = '#f1d9c7',
  thick,
  maxOpen = 1,
  minOpen = 0,
}: ValveProps) {
  const quat = useMemo(() => {
    const d = new THREE.Vector3(...direction).normalize()
    return new THREE.Quaternion().setFromUnitVectors(up, d)
  }, [direction])

  const ring = useMemo(() => new THREE.TorusGeometry(radius, thick ? 0.05 : 0.035, 8, 32), [radius, thick])
  const leaflet = useMemo(() => {
    const L = radius * (kind === 'av' ? 1.12 : 0.95)
    const w = ((2 * Math.PI * radius) / leaflets) * (kind === 'av' ? 0.62 : 0.6)
    const shape = new THREE.Shape()
    shape.moveTo(0, w / 2)
    shape.quadraticCurveTo(-L * 0.55, w * 0.62, -L, 0)
    shape.quadraticCurveTo(-L * 0.55, -w * 0.62, 0, -w / 2)
    shape.lineTo(0, w / 2)
    const g = new THREE.ExtrudeGeometry(shape, { depth: thick ? 0.045 : 0.018, bevelEnabled: false })
    g.rotateX(-Math.PI / 2)
    return g
  }, [radius, leaflets, kind, thick])

  const pivots = useRef<THREE.Group[]>([])

  useFrame(() => {
    const o = Math.min(maxOpen, Math.max(minOpen, openFn()))
    // AV: zavřeno ≈ 0°, otevřeno ≈ +75° (dolů). Poloměsíčitá: zavřeno ≈ −20°, otevřeno ≈ −85° (nahoru).
    const angle = kind === 'av' ? (o * 75 * Math.PI) / 180 : (-(20 + o * 65) * Math.PI) / 180
    for (const p of pivots.current) if (p) p.rotation.z = angle
  })

  const n = leaflets
  return (
    <group position={position} quaternion={quat}>
      <mesh geometry={ring} rotation={[Math.PI / 2, 0, 0]}>
        <HeartMaterial color={thick ? '#e7d3a9' : '#e8c3b0'} alwaysOpaque roughness={0.5} clip={false} />
      </mesh>
      {Array.from({ length: n }).map((_, i) => (
        <group key={i} rotation={[0, (i / n) * Math.PI * 2 + (kind === 'av' ? 0.4 : 0), 0]}>
          <group position={[radius * 0.97, 0, 0]} ref={(el) => { if (el) pivots.current[i] = el }}>
            <mesh geometry={leaflet}>
              <HeartMaterial
                color={color}
                alwaysOpaque
                clip={false}
                side={THREE.DoubleSide}
                roughness={0.45}
                emissive={thick ? '#8a7a40' : '#000000'}
                emissiveIntensity={thick ? 0.25 : 0}
              />
            </mesh>
          </group>
        </group>
      ))}
    </group>
  )
}
