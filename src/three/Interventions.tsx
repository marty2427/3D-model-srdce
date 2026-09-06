import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { RoundedBox } from '@react-three/drei'
import { HeartMaterial, colors } from './materials'
import { Pick } from './Pick'
import { Vessel } from './Vessel'
import { useParams } from './params'
import { coronary, curveFrom, ladCurve, LAD_LESION_T, type V3 } from './geometry'
import { heartClock } from '../lib/heartClock'

/** Lokální souřadnice v místě léze RIA: bod, tečna, normála směrem ven ze srdce. */
export function useLesionFrame() {
  return useMemo(() => {
    const p = ladCurve.getPointAt(LAD_LESION_T)
    const t = ladCurve.getTangentAt(LAD_LESION_T).normalize()
    // normála "ven" ≈ směr od středu srdce
    const out = p.clone().sub(new THREE.Vector3(0.1, -0.5, 0)).normalize()
    const n = out.clone().sub(t.clone().multiplyScalar(out.dot(t))).normalize()
    const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), t)
    return { p, t, n, q }
  }, [])
}

/** Aterosklerotický plát a trombus v RIA (viditelné na hlavním modelu). */
export function LadLesion() {
  const params = useParams()
  const { p, n, q } = useLesionFrame()
  const plaque = params.ladPlaque
  const thrombus = params.ladThrombus
  if (plaque <= 0 && thrombus <= 0) return null
  const plaquePos = p.clone().addScaledVector(n, 0.02)
  return (
    <group>
      {plaque > 0 && (
        <Pick id="plat">
          <mesh position={plaquePos} quaternion={q} scale={[0.05 + 0.05 * plaque, 0.09 + 0.1 * plaque, 0.05 + 0.05 * plaque]}>
            <sphereGeometry args={[1, 16, 12]} />
            <HeartMaterial color={colors.plaque} alwaysOpaque clip={false} roughness={0.8} emissive="#5a4a10" emissiveIntensity={0.2} />
          </mesh>
        </Pick>
      )}
      {thrombus > 0 && (
        <Pick id="trombus">
          <mesh position={p} quaternion={q} scale={[0.075 * thrombus, 0.13 * thrombus, 0.075 * thrombus]}>
            <sphereGeometry args={[1, 16, 12]} />
            <HeartMaterial color={colors.thrombus} alwaysOpaque clip={false} roughness={0.9} emissive="#3a0008" emissiveIntensity={0.4} />
          </mesh>
        </Pick>
      )}
      {/* zvýrazňující prstenec kolem léze */}
      <mesh position={p} quaternion={q}>
        <torusGeometry args={[0.11, 0.006, 6, 32]} />
        <meshBasicMaterial color="#ffd166" transparent opacity={0.6} />
      </mesh>
    </group>
  )
}

/* ---------- Stent v RIA ---------- */
export function Stent() {
  const params = useParams()
  const { p, q } = useLesionFrame()
  if (params.stent <= 0.02) return null
  const r = 0.03 + 0.03 * params.stent
  return (
    <Pick id="stent">
      <mesh position={p} quaternion={q} scale={[r, 1, r]}>
        <cylinderGeometry args={[1, 1, 0.3, 10, 5, true]} />
        <meshStandardMaterial color={colors.metal} metalness={0.9} roughness={0.25} wireframe />
      </mesh>
    </Pick>
  )
}

/* ---------- Bypassy ---------- */
export const graftPaths = {
  limaInSitu: [
    [0.9, 2.95, 1.7],
    [0.95, 2.0, 1.75],
    [0.95, 1.0, 1.7],
    [0.9, 0.0, 1.6],
    [0.85, -0.9, 1.5],
  ] as V3[],
  svgHarvested: [
    [1.75, 2.3, 1.3],
    [1.78, 1.9, 1.32],
    [1.8, 1.5, 1.3],
  ] as V3[],
}

function useGraftCurves() {
  return useMemo(() => {
    const end = ladCurve.getPointAt(0.6)
    const lima: V3[] = [
      [0.9, 2.95, 1.7],
      [0.95, 2.0, 1.7],
      [0.85, 1.0, 1.5],
      [0.5, 0.0, 1.15],
      [end.x + 0.02, end.y + 0.05, end.z + 0.06],
      [end.x, end.y, end.z + 0.02],
    ]
    const marg = curveFrom(coronary.marginal).getPointAt(0.45)
    const svg: V3[] = [
      [0.1, 1.3, 0.15],
      [0.55, 1.2, 0.5],
      [1.05, 0.75, 0.45],
      [marg.x + 0.03, marg.y + 0.05, marg.z + 0.05],
      [marg.x, marg.y, marg.z],
    ]
    return { lima, svg }
  }, [])
}

export function Grafts() {
  const params = useParams()
  const { lima, svg } = useGraftCurves()
  if (params.graftLima <= 0.02) return null
  const grafted = params.graftLima >= 0.75
  return (
    <group>
      <Pick id="bypass-lima">
        <Vessel points={grafted ? lima : graftPaths.limaInSitu} radius={0.045} color={colors.graft} segments={40} radial={8} clip={false} alwaysOpaque emissive="#5a2a10" emissiveIntensity={0.15} />
      </Pick>
      <Pick id="bypass-svg">
        <Vessel points={grafted ? svg : graftPaths.svgHarvested} radius={0.05} color="#6f8ed9" segments={32} radial={8} clip={false} alwaysOpaque />
      </Pick>
      {grafted && params.graftFlow > 0 && <GraftFlow points={lima} color="#ffb3ad" />}
      {grafted && params.graftFlow > 0 && <GraftFlow points={svg} color="#ffb3ad" />}
    </group>
  )
}

const dummy = new THREE.Object3D()

function GraftFlow({ points, color }: { points: V3[]; color: string }) {
  const ref = useRef<THREE.InstancedMesh>(null)
  const count = 24
  const curve = useMemo(() => curveFrom(points), [points])
  const ts = useMemo(() => Float32Array.from({ length: count }, () => Math.random()), [])
  const geo = useMemo(() => new THREE.SphereGeometry(0.022, 6, 5), [])
  const v = useMemo(() => new THREE.Vector3(), [])
  useFrame(() => {
    const mesh = ref.current
    if (!mesh) return
    for (let i = 0; i < count; i++) {
      let t = ts[i] + heartClock.dt * 0.14
      if (t >= 1) t -= 1
      ts[i] = t
      curve.getPointAt(t, v)
      dummy.position.copy(v)
      dummy.updateMatrix()
      mesh.setMatrixAt(i, dummy.matrix)
    }
    mesh.instanceMatrix.needsUpdate = true
  })
  return (
    <instancedMesh ref={ref} args={[geo, undefined, count]} frustumCulled={false}>
      <meshStandardMaterial color={color} emissive="#ff6a5b" emissiveIntensity={0.9} />
    </instancedMesh>
  )
}

/* ---------- Kardiostimulátor ---------- */
const leadPath: V3[] = [
  [1.4, 1.95, 0.95],
  [0.9, 2.55, 0.5],
  [-0.2, 2.9, 0.0],
  [-0.8, 2.62, -0.05],
  [-0.82, 1.6, -0.05],
  [-0.85, 0.9, 0.05],
  [-0.6, 0.2, 0.35],
  [-0.3, -0.6, 0.45],
  [-0.1, -1.25, 0.32],
]

export function Pacemaker() {
  const params = useParams()
  const tipRef = useRef<THREE.MeshStandardMaterial>(null)
  useFrame(() => {
    if (!tipRef.current) return
    const p = heartClock.phase
    const flash = params.ecg === 'paced' ? Math.max(0, 1 - Math.abs(p - 0.13) / 0.05) : 0
    tipRef.current.emissiveIntensity = 0.3 + flash * 4
  })
  if (params.pacemaker <= 0.02) return null
  return (
    <Pick id="kardiostimulator">
      <group position={[1.55, 1.85, 0.95]} rotation={[0, 0, -0.2]}>
        <RoundedBox args={[0.55, 0.45, 0.14]} radius={0.07} smoothness={4}>
          <meshStandardMaterial color="#cfd6e0" metalness={0.7} roughness={0.3} />
        </RoundedBox>
        <mesh position={[0.05, 0.28, 0]}>
          <boxGeometry args={[0.32, 0.12, 0.1]} />
          <meshStandardMaterial color="#7fa3d8" transparent opacity={0.8} />
        </mesh>
      </group>
      <Vessel points={leadPath} radius={0.025} color="#e3e9f0" segments={64} radial={6} clip={false} alwaysOpaque metalness={0.5} roughness={0.35} />
      <mesh position={leadPath[leadPath.length - 1]}>
        <sphereGeometry args={[0.05, 12, 8]} />
        <meshStandardMaterial ref={tipRef} color="#ffd166" emissive="#ffd166" emissiveIntensity={0.3} />
      </mesh>
    </Pick>
  )
}
