import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { bloodPaths, curveFrom, ladCurve, LAD_LESION_T, type V3 } from './geometry'
import { heartClock } from '../lib/heartClock'
import { avValveOpen, semilunarOpen, atrialContraction } from '../lib/cycle'
import { useParams } from './params'

interface FlowProps {
  points: V3[]
  color: string
  count?: number
  /** podíl dráhy, kde částice vstupuje do komory (od síně) */
  ventricleAt: number
  /** podíl dráhy, kde částice opouští komoru do tepny */
  arteryAt: number
  /** základní rychlost (délky dráhy za sekundu) */
  speed?: number
  size?: number
  /** průtok 0–1 (např. za uzávěrem) */
  flow?: number
}

const dummy = new THREE.Object3D()

/**
 * Částice krve na jedné dráze. Rychlost závisí na fázi cyklu:
 * v žilách a síních tečou při plnění (otevřené AV chlopně), v komoře a tepně při ejekci.
 */
function FlowPath({ points, color, count = 90, ventricleAt, arteryAt, speed = 0.09, size = 0.035, flow = 1 }: FlowProps) {
  const ref = useRef<THREE.InstancedMesh>(null)
  const curve = useMemo(() => curveFrom(points), [points])
  const ts = useMemo(() => Float32Array.from({ length: count }, (_, i) => (i / count + Math.random() * 0.01) % 1), [count])
  const offsets = useMemo(
    () => Float32Array.from({ length: count * 2 }, () => (Math.random() - 0.5) * 0.11),
    [count],
  )
  const geo = useMemo(() => new THREE.SphereGeometry(size, 8, 6), [size])
  const tmp = useMemo(() => ({ p: new THREE.Vector3(), t: new THREE.Vector3(), n: new THREE.Vector3(), b: new THREE.Vector3() }), [])

  useFrame(() => {
    const mesh = ref.current
    if (!mesh) return
    const p = heartClock.phase
    const dt = heartClock.dt
    const av = avValveOpen(p)
    const sl = semilunarOpen(p)
    const atr = atrialContraction(p)
    for (let i = 0; i < count; i++) {
      let t = ts[i]
      let f: number
      if (t < ventricleAt) f = 0.25 + 0.9 * av + 0.8 * atr // žíly + síň → komora
      else if (t < arteryAt) f = 0.15 + 1.6 * sl // v komoře → do tepny
      else f = 0.35 + 1.4 * sl // v tepně
      t += dt * speed * f * flow
      if (t >= 1) t -= 1
      ts[i] = t
      curve.getPointAt(t, tmp.p)
      curve.getTangentAt(t, tmp.t)
      // jednoduchý příčný posun, aby částice netvořily jednu čáru
      tmp.n.set(-tmp.t.y, tmp.t.x, 0).normalize()
      tmp.b.crossVectors(tmp.t, tmp.n).normalize()
      tmp.p.addScaledVector(tmp.n, offsets[i * 2]).addScaledVector(tmp.b, offsets[i * 2 + 1])
      dummy.position.copy(tmp.p)
      dummy.updateMatrix()
      mesh.setMatrixAt(i, dummy.matrix)
    }
    mesh.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh ref={ref} args={[geo, undefined, count]} frustumCulled={false}>
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.55} roughness={0.4} />
    </instancedMesh>
  )
}

/** Zpětný tok při nedomykavosti mitrální chlopně (LK → LS během systoly). */
function Regurgitation() {
  const pts: V3[] = [
    [0.5, -0.5, -0.25],
    [0.45, 0.0, -0.35],
    [0.45, 0.35, -0.42],
    [0.5, 0.75, -0.55],
    [0.45, 1.05, -0.6],
  ]
  const ref = useRef<THREE.InstancedMesh>(null)
  const count = 30
  const curve = useMemo(() => curveFrom(pts), [])
  const ts = useMemo(() => Float32Array.from({ length: count }, () => Math.random()), [])
  const geo = useMemo(() => new THREE.SphereGeometry(0.03, 8, 6), [])
  const v = useMemo(() => new THREE.Vector3(), [])
  useFrame(() => {
    const mesh = ref.current
    if (!mesh) return
    const sl = semilunarOpen(heartClock.phase)
    for (let i = 0; i < count; i++) {
      let t = ts[i] + heartClock.dt * (0.05 + 1.5 * sl) * 0.5
      if (t >= 1) t -= 1
      ts[i] = t
      curve.getPointAt(t, v)
      v.x += Math.sin(i * 12.9) * 0.08
      v.z += Math.cos(i * 7.3) * 0.08
      dummy.position.copy(v)
      dummy.scale.setScalar(0.4 + sl)
      dummy.updateMatrix()
      mesh.setMatrixAt(i, dummy.matrix)
    }
    mesh.instanceMatrix.needsUpdate = true
  })
  return (
    <instancedMesh ref={ref} args={[geo, undefined, count]} frustumCulled={false}>
      <meshStandardMaterial color="#ff8a80" emissive="#ff8a80" emissiveIntensity={0.8} />
    </instancedMesh>
  )
}

/** Animovaný tok krve – červená okysličená, modrá odkysličená. */
export function BloodFlow() {
  const params = useParams()
  return (
    <group>
      <FlowPath points={bloodPaths.deoxySvc} color="#5b8cff" ventricleAt={0.3} arteryAt={0.6} />
      <FlowPath points={bloodPaths.deoxyIvc} color="#5b8cff" ventricleAt={0.32} arteryAt={0.62} />
      <FlowPath points={bloodPaths.oxyRight} color="#ff4d45" ventricleAt={0.24} arteryAt={0.52} count={110} />
      <FlowPath points={bloodPaths.oxyLeft} color="#ff4d45" ventricleAt={0.28} arteryAt={0.6} />
      {params.mitralRegurgitation && <Regurgitation />}
    </group>
  )
}

/** Částice krve v RIA – před lézí tečou vždy, za lézí podle průtoku. */
export function CoronaryFlow() {
  const params = useParams()
  const ref = useRef<THREE.InstancedMesh>(null)
  const count = 40
  const curve = ladCurve
  const ts = useMemo(() => Float32Array.from({ length: count }, () => Math.random()), [])
  const geo = useMemo(() => new THREE.SphereGeometry(0.022, 6, 5), [])
  const v = useMemo(() => new THREE.Vector3(), [])
  useFrame(() => {
    const mesh = ref.current
    if (!mesh) return
    const pulse = 0.4 + 0.6 * (1 - semilunarOpen(heartClock.phase)) // věnčité tepny se plní v diastole
    const blocked = params.ladFlow < 0.05 || params.ladThrombus > 0.5
    const bypass = blocked && params.graftFlow > 0
    const ANAST = 0.6
    for (let i = 0; i < count; i++) {
      let t = ts[i]
      const past = t > LAD_LESION_T
      const f = past ? params.ladFlow : 1
      t += heartClock.dt * 0.12 * pulse * (0.15 + 0.85 * f)
      if (blocked && t > LAD_LESION_T - 0.02 && t < LAD_LESION_T + 0.05) t = bypass ? ANAST + Math.random() * 0.02 : Math.random() * 0.02
      if (t >= 1) t -= 1
      ts[i] = t
      curve.getPointAt(t, v)
      v.x += Math.sin(i * 3.1) * 0.02
      v.z += Math.cos(i * 5.7) * 0.02
      dummy.position.copy(v)
      const hidden = past && (bypass ? t < ANAST : blocked)
      dummy.scale.setScalar(hidden ? 0 : 1)
      dummy.updateMatrix()
      mesh.setMatrixAt(i, dummy.matrix)
    }
    mesh.instanceMatrix.needsUpdate = true
  })
  return (
    <instancedMesh ref={ref} args={[geo, undefined, count]} frustumCulled={false}>
      <meshStandardMaterial color="#ffb3ad" emissive="#ff6a5b" emissiveIntensity={0.9} />
    </instancedMesh>
  )
}
