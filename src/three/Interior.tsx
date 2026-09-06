import { useMemo } from 'react'
import * as THREE from 'three'
import { ellipsoids, type Ellipsoid, type V3 } from './geometry'
import { HeartMaterial } from './materials'
import { Vessel } from './Vessel'

/** Převod z lokálních souřadnic elipsoidu (jednotková koule) do světa. */
function toWorld(e: Ellipsoid, f: number, l: V3): V3 {
  const x = l[0] * e.scale[0] * f
  const y = l[1] * e.scale[1] * f
  const c = Math.cos(e.rotZ)
  const s = Math.sin(e.rotZ)
  return [e.center[0] + x * c - y * s, e.center[1] + x * s + y * c, e.center[2] + l[2] * e.scale[2] * f]
}

/**
 * Vnitřní stěna komory s trabekulami (trabeculae carneae): koule s vroubkovaným povrchem
 * vykreslená zevnitř; u báze (výtokový trakt) je stěna hladká.
 */
function useTrabeculatedCavity(seed: number) {
  return useMemo(() => {
    const g = new THREE.SphereGeometry(1, 96, 72)
    const pos = g.attributes.position as THREE.BufferAttribute
    const v = new THREE.Vector3()
    for (let i = 0; i < pos.count; i++) {
      v.set(pos.getX(i), pos.getY(i), pos.getZ(i))
      const theta = Math.atan2(v.z, v.x)
      // podélné svalové trámce (rovnoběžné s dlouhou osou) + příčné spojky
      const ridges = Math.pow(Math.abs(Math.sin(theta * 9 + v.y * 2.5 + seed)), 1.8)
      const cross = 0.5 * Math.pow(Math.abs(Math.sin(v.y * 16 + theta * 2 + seed * 3)), 3)
      const rough = 0.35 * Math.sin(v.x * 17 + seed) * Math.sin(v.y * 13) * Math.sin(v.z * 15 + seed)
      // u báze (y > 0.35) hladké, k hrotu výrazné
      const w = 1 - THREE.MathUtils.smoothstep(v.y, 0.15, 0.7)
      const amp = 0.085 * w
      const r = 1 - amp * (ridges + cross + rough)
      v.multiplyScalar(r)
      pos.setXYZ(i, v.x, v.y, v.z)
    }
    pos.needsUpdate = true
    g.computeVertexNormals()
    return g
  }, [seed])
}

interface CavityProps {
  e: Ellipsoid
  color: string
  f: number
  dil?: number
  seed: number
}

/** Dutina komory s trabekulami. */
export function VentricleCavity({ e, color, f, dil = 1, seed }: CavityProps) {
  const geo = useTrabeculatedCavity(seed)
  return (
    <group position={e.center} rotation={[0, 0, e.rotZ]}>
      <mesh geometry={geo} scale={[e.scale[0] * f * dil, e.scale[1] * f * dil, e.scale[2] * f * dil]}>
        <HeartMaterial color={color} side={THREE.BackSide} transparentOpacity={0.08} roughness={0.85} clearcoat={0.1} bump={0.01} />
      </mesh>
    </group>
  )
}

/** Papilární sval – kužel vyrůstající ze stěny směrem k chlopni, se šlašinkami k cípům. */
function Papillary({ base, tip, radius, chordaeTo, color }: { base: V3; tip: V3; radius: number; chordaeTo: V3[]; color: string }) {
  const { pos, quat, len } = useMemo(() => {
    const b = new THREE.Vector3(...base)
    const t = new THREE.Vector3(...tip)
    const dir = t.clone().sub(b)
    const len = dir.length()
    const quat = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.normalize())
    return { pos: b.clone().lerp(t, 0.5), quat, len }
  }, [base, tip])
  return (
    <group>
      <mesh position={pos} quaternion={quat}>
        <cylinderGeometry args={[radius * 0.45, radius, len, 12, 1]} />
        <HeartMaterial color={color} roughness={0.8} clearcoat={0.1} />
      </mesh>
      {chordaeTo.map((c, i) => (
        <Vessel key={i} points={[tip, [(tip[0] + c[0]) / 2, (tip[1] + c[1]) / 2 + 0.02, (tip[2] + c[2]) / 2], c]} radius={0.008} color="#f3e3d3" segments={8} radial={5} alwaysOpaque />
      ))}
    </group>
  )
}

/** Vnitřek levé komory: dva papilární svaly se šlašinkami k mitrální chlopni. */
export function LeftVentricleInterior({ f, dil }: { f: number; dil: number }) {
  const e = ellipsoids.lv
  const W = (l: V3) => toWorld(e, f * dil, l)
  const mitral: V3 = [0.45, 0.3, -0.42]
  const anterolateral = { base: W([0.55, -0.45, 0.55]), tip: W([0.32, 0.1, 0.25]) }
  const posteromedial = { base: W([-0.2, -0.5, -0.7]), tip: W([-0.05, 0.05, -0.4]) }
  const chordae = (tip: V3): V3[] => [
    [mitral[0] - 0.12, mitral[1] - 0.12, mitral[2] + 0.1],
    [mitral[0] + 0.1, mitral[1] - 0.12, mitral[2] - 0.05],
    [mitral[0] - 0.02, mitral[1] - 0.14, mitral[2] - 0.16],
  ].map((c) => [c[0] * 0.7 + tip[0] * 0.3, c[1], c[2] * 0.7 + tip[2] * 0.3] as V3)
  return (
    <group>
      <Papillary base={anterolateral.base} tip={anterolateral.tip} radius={0.11} chordaeTo={chordae(anterolateral.tip)} color="#8f3036" />
      <Papillary base={posteromedial.base} tip={posteromedial.tip} radius={0.1} chordaeTo={chordae(posteromedial.tip)} color="#8f3036" />
    </group>
  )
}

/** Vnitřek pravé komory: papilární svaly, šlašinky k trikuspidální chlopni a moderátorový pruh. */
export function RightVentricleInterior({ f, dil }: { f: number; dil: number }) {
  const e = ellipsoids.rv
  const W = (l: V3) => toWorld(e, f * dil, l)
  const tric: V3 = [-0.78, 0.4, 0.15]
  const anterior = { base: W([-0.55, -0.4, 0.5]), tip: W([-0.35, 0.05, 0.25]) }
  const posterior = { base: W([0.1, -0.55, -0.6]), tip: W([-0.05, -0.05, -0.3]) }
  const chordae = (tip: V3): V3[] =>
    [
      [tric[0] + 0.15, tric[1] - 0.14, tric[2] + 0.12],
      [tric[0] + 0.05, tric[1] - 0.15, tric[2] - 0.12],
    ].map((c) => [c[0] * 0.7 + tip[0] * 0.3, c[1], c[2] * 0.7 + tip[2] * 0.3] as V3)
  // moderátorový pruh: od přepážky k přední stěně
  const band: V3[] = [W([0.55, -0.35, 0.05]), W([0.1, -0.5, 0.35]), W([-0.5, -0.45, 0.55])]
  return (
    <group>
      <Papillary base={anterior.base} tip={anterior.tip} radius={0.085} chordaeTo={chordae(anterior.tip)} color="#8f3036" />
      <Papillary base={posterior.base} tip={posterior.tip} radius={0.07} chordaeTo={chordae(posterior.tip)} color="#8f3036" />
      <Vessel points={band} radius={0.045} color="#8f3036" segments={16} radial={8} roughness={0.8} />
    </group>
  )
}
