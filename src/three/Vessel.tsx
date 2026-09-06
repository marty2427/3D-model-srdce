import { useMemo } from 'react'
import * as THREE from 'three'
import { tubeFrom, taperedTube, type V3 } from './geometry'
import { HeartMaterial } from './materials'

interface VesselProps {
  points: V3[]
  radius: number
  color: string
  taper?: (t: number) => number
  segments?: number
  radial?: number
  clip?: boolean
  alwaysOpaque?: boolean
  transparentOpacity?: number
  emissive?: string
  emissiveIntensity?: number
  opacity?: number
  roughness?: number
  metalness?: number
  visible?: boolean
  animate?: (m: THREE.MeshStandardMaterial, baseEmissive: string, baseIntensity: number) => void
}

/** Trubice po Catmull-Rom křivce – cévy, převodní svazky, štěpy. */
export function Vessel({
  points,
  radius,
  color,
  taper,
  segments = 48,
  radial = 12,
  clip = true,
  alwaysOpaque,
  transparentOpacity,
  emissive,
  emissiveIntensity,
  opacity,
  roughness,
  metalness,
  visible = true,
  animate,
}: VesselProps) {
  const geo = useMemo(
    () => (taper ? taperedTube(points, (t) => radius * taper(t), segments, radial) : tubeFrom(points, radius, segments, radial)),
    [points, radius, taper, segments, radial],
  )
  return (
    <mesh geometry={geo} visible={visible}>
      <HeartMaterial
        color={color}
        clip={clip}
        alwaysOpaque={alwaysOpaque}
        transparentOpacity={transparentOpacity}
        emissive={emissive}
        emissiveIntensity={emissiveIntensity}
        opacity={opacity}
        roughness={roughness}
        metalness={metalness}
        animate={animate}
      />
    </mesh>
  )
}

/** Kulový uzávěr konce cévy (aby trubice nebyla „dutá“) */
export function VesselCap({ at, radius, color }: { at: V3; radius: number; color: string }) {
  const geo = useMemo(() => new THREE.SphereGeometry(radius, 12, 8), [radius])
  return (
    <mesh geometry={geo} position={at}>
      <HeartMaterial color={color} />
    </mesh>
  )
}
