import { useMemo } from 'react'
import * as THREE from 'three'
import { conduction } from './geometry'
import { colors, HeartMaterial } from './materials'
import { Vessel } from './Vessel'
import { Pick } from './Pick'
import { heartClock } from '../lib/heartClock'
import { smoothstep } from '../lib/cycle'
import { useParams } from './params'

/** Aktivace úseku převodního systému ve fázi cyklu (0–1). */
export function activation(p: number, t0: number, t1: number) {
  return smoothstep(t0 - 0.008, t0 + 0.004, p) * (1 - smoothstep(t1, t1 + 0.09, p))
}

export const conductionTiming = {
  sa: [0.0, 0.03],
  atria: [0.0, 0.08],
  av: [0.07, 0.125],
  his: [0.12, 0.135],
  bundles: [0.13, 0.15],
  purkinje: [0.14, 0.165],
  ventricles: [0.15, 0.21],
} as const

function useGlow(t0: number, t1: number, chaotic: 'af' | 'vt' | null) {
  return (m: THREE.MeshStandardMaterial, baseEm: string, baseI: number) => {
    let g: number
    if (chaotic === 'af') g = 0.35 + 0.35 * Math.abs(Math.sin(heartClock.time * 47 + t0 * 100) * Math.sin(heartClock.time * 31))
    else if (chaotic === 'vt') g = 0.4 + 0.5 * Math.abs(Math.sin(heartClock.time * 26 + t0 * 40))
    else g = activation(heartClock.phase, t0, t1)
    if (g > 0.02) {
      m.emissive.set('#ffe08a')
      m.emissiveIntensity = 0.25 + g * 2.2
    } else {
      m.emissive.set(baseEm)
      m.emissiveIntensity = baseI
    }
  }
}

/** Převodní systém: SA uzel, AV uzel, Hisův svazek, Tawarova raménka, Purkyňova vlákna. */
export function ConductionSystem({ animated }: { animated: boolean }) {
  const params = useParams()
  const chaosAtria = params.atrialFibrillation ? 'af' : null
  const chaosVent = params.ventricularTachycardia ? 'vt' : null
  const nodeGeo = useMemo(() => new THREE.SphereGeometry(1, 16, 12), [])

  const saGlow = useGlow(...conductionTiming.sa, chaosAtria)
  const avGlow = useGlow(...conductionTiming.av, null)
  const hisGlow = useGlow(...conductionTiming.his, chaosVent)
  const bundleGlow = useGlow(...conductionTiming.bundles, chaosVent)
  const purkGlow = useGlow(...conductionTiming.purkinje, chaosVent)

  const base = {
    color: colors.conduction,
    emissive: colors.conduction,
    emissiveIntensity: 0.25,
    alwaysOpaque: true,
    clip: false,
  }
  const anim = (fn: typeof saGlow) => (animated ? fn : undefined)

  return (
    <group>
      <Pick id="sa-uzel">
        <mesh geometry={nodeGeo} position={conduction.saNode} scale={[0.14, 0.09, 0.09]} rotation={[0, 0, -0.6]}>
          <HeartMaterial {...base} animate={anim(saGlow)} />
        </mesh>
      </Pick>
      <Pick id="av-uzel">
        <mesh geometry={nodeGeo} position={conduction.avNode} scale={[0.1, 0.08, 0.08]}>
          <HeartMaterial {...base} animate={anim(avGlow)} />
        </mesh>
      </Pick>
      <Pick id="hisuv-svazek">
        <Vessel points={conduction.his} radius={0.035} {...base} animate={anim(hisGlow)} />
      </Pick>
      <Pick id="tawarova-ramenka">
        <Vessel points={conduction.rightBundle} radius={0.03} {...base} animate={anim(bundleGlow)} />
        <Vessel points={conduction.leftBundle} radius={0.03} {...base} animate={anim(bundleGlow)} />
      </Pick>
      <Pick id="purkynova-vlakna">
        {conduction.purkinjeRight.map((pts, i) => (
          <Vessel key={`r${i}`} points={pts} radius={0.018} segments={16} radial={6} {...base} animate={anim(purkGlow)} />
        ))}
        {conduction.purkinjeLeft.map((pts, i) => (
          <Vessel key={`l${i}`} points={pts} radius={0.018} segments={16} radial={6} {...base} animate={anim(purkGlow)} />
        ))}
      </Pick>
    </group>
  )
}
