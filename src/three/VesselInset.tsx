import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { Canvas, useFrame } from '@react-three/fiber'
import type { HeartParams } from '../lib/pathology'
import { heartClock } from '../lib/heartClock'

const R = 0.8
const L = 4.6
const dummy = new THREE.Object3D()

/** Cílové hodnoty vizualizace odvozené z parametrů modelu. */
interface Targets {
  plaque: number
  rupture: number
  thrombus: number
  flow: number
  wire: number
  balloon: number
  stent: number
  ldl: number
  drug: number
}

function targetsFrom(p: HeartParams): Targets {
  return {
    plaque: p.ladPlaque,
    rupture: p.ladRupture ? 1 : 0,
    thrombus: p.ladThrombus,
    flow: p.ladFlow,
    wire: p.wire,
    balloon: p.balloon,
    stent: p.stent,
    ldl: p.ldl,
    drug: p.lysis > 0 && p.lysis < 1 ? 1 : 0,
  }
}

/** Střed plátu na zadní spodní stěně (v rovině yz) */
const PLAQUE_DIR = new THREE.Vector2(-0.72, -0.7).normalize()
const plaqueCenter = () => new THREE.Vector3(0, PLAQUE_DIR.x * R * 0.98, PLAQUE_DIR.y * R * 0.98)

function Wall() {
  const layers = [
    { r: R * 1.0, color: '#d99aa0', name: 'adventicie' },
    { r: R * 0.92, color: '#b95a60', name: 'media' },
    { r: R * 0.85, color: '#f2cfc6', name: 'intima' },
  ]
  return (
    <group>
      {layers.map((l) => (
        <mesh key={l.name} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[l.r, l.r, L, 40, 1, true, Math.PI / 2, Math.PI]} />
          <meshStandardMaterial color={l.color} side={THREE.DoubleSide} roughness={0.7} />
        </mesh>
      ))}
      {/* řezné plochy stěny na obou koncích */}
      {[-L / 2, L / 2].map((x) => (
        <group key={x} position={[x, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
          <mesh>
            <ringGeometry args={[R * 0.92, R * 1.0, 40, 1, -Math.PI / 2, Math.PI]} />
            <meshStandardMaterial color="#e2a8ad" side={THREE.DoubleSide} />
          </mesh>
          <mesh>
            <ringGeometry args={[R * 0.85, R * 0.92, 40, 1, -Math.PI / 2, Math.PI]} />
            <meshStandardMaterial color="#c4666c" side={THREE.DoubleSide} />
          </mesh>
          <mesh>
            <ringGeometry args={[R * 0.8, R * 0.85, 40, 1, -Math.PI / 2, Math.PI]} />
            <meshStandardMaterial color="#f6d9d1" side={THREE.DoubleSide} />
          </mesh>
        </group>
      ))}
    </group>
  )
}

interface SceneProps {
  targets: Targets
  onState?: (s: Targets) => void
}

function InsetScene({ targets }: SceneProps) {
  const cur = useRef<Targets>({ ...targets })
  const tRef = useRef(targets)
  useEffect(() => {
    tRef.current = targets
  }, [targets])

  const plaqueRef = useRef<THREE.Group>(null)
  const coreRef = useRef<THREE.Mesh>(null)
  const capRef = useRef<THREE.Mesh>(null)
  const exposedRef = useRef<THREE.Mesh>(null)
  const thrombusRef = useRef<THREE.Group>(null)
  const bloodRef = useRef<THREE.InstancedMesh>(null)
  const ldlRef = useRef<THREE.InstancedMesh>(null)
  const wireRef = useRef<THREE.Mesh>(null)
  const balloonRef = useRef<THREE.Mesh>(null)
  const stentRef = useRef<THREE.Mesh>(null)

  const N = 140
  const blood = useMemo(
    () => ({
      x: Float32Array.from({ length: N }, () => -L / 2 + Math.random() * L),
      a: Float32Array.from({ length: N }, () => Math.PI / 2 + Math.random() * Math.PI),
      r: Float32Array.from({ length: N }, () => Math.sqrt(Math.random()) * R * 0.72),
      v: Float32Array.from({ length: N }, () => 0.8 + Math.random() * 0.5),
    }),
    [],
  )
  const NL = 40
  const ldl = useMemo(
    () => ({
      x: Float32Array.from({ length: NL }, () => -L / 2 + Math.random() * L),
      t: Float32Array.from({ length: NL }, () => Math.random()),
    }),
    [],
  )
  const drugRef = useRef<THREE.InstancedMesh>(null)
  const drug = useMemo(
    () => ({
      x: Float32Array.from({ length: NL }, () => -L / 2 + Math.random() * L),
      t: Float32Array.from({ length: NL }, () => Math.random()),
    }),
    [],
  )
  const thrombusBalls = useMemo(
    () =>
      Array.from({ length: 16 }, (_, i) => ({
        pos: new THREE.Vector3((Math.random() - 0.5) * 0.9, (Math.random() - 0.5) * 0.9, (Math.random() - 0.5) * 0.9),
        s: 0.16 + Math.random() * 0.16,
        i,
      })),
    [],
  )
  const pc = useMemo(() => plaqueCenter(), [])
  const tmp = useMemo(() => new THREE.Vector2(), [])

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.1)
    const k = 1 - Math.exp(-dt * 2.2)
    const c = cur.current
    const t = tRef.current
    for (const key of Object.keys(c) as (keyof Targets)[]) c[key] += (t[key] - c[key]) * k

    // plát: poloosy
    const a = 0.06 + c.plaque * R * 0.95 // výška (do lumen)
    const len = 0.45 + c.plaque * 0.9
    if (plaqueRef.current) {
      plaqueRef.current.position.copy(pc)
      plaqueRef.current.visible = c.plaque > 0.02
    }
    const squash = 1 - 0.55 * Math.max(c.balloon, c.stent) // balonek/stent plát stlačí
    if (coreRef.current) coreRef.current.scale.set(len, a * squash, a * 0.9 * squash)
    if (capRef.current) {
      capRef.current.scale.set(len * 1.06, a * squash * 1.08, a * 0.9 * squash * 1.08)
      const m = capRef.current.material as THREE.MeshStandardMaterial
      m.opacity = 0.9 - 0.55 * c.rupture
      m.color.set('#f6e7c0').lerp(new THREE.Color('#e9c4a8'), c.rupture)
    }
    if (exposedRef.current) {
      exposedRef.current.visible = c.rupture > 0.05
      const s = c.rupture * 0.22
      exposedRef.current.scale.set(s * 1.4, s, s)
      exposedRef.current.position.set(0.1, -PLAQUE_DIR.x * a * 0.75 * squash, -PLAQUE_DIR.y * a * 0.75 * squash)
    }
    // trombus – shluk koulí rostoucí od plátu do středu lumen
    if (thrombusRef.current) {
      const g = thrombusRef.current
      g.visible = c.thrombus > 0.02
      const grow = c.thrombus
      const center = new THREE.Vector3(0.15, pc.y * 0.85, pc.z * 0.85).lerp(new THREE.Vector3(0.15, -0.05, -0.38), grow)
      g.position.copy(center)
      g.children.forEach((ch, i) => {
        const b = thrombusBalls[i]
        const sc = b.s * (0.25 + grow * 1.0)
        ch.scale.setScalar(sc)
        ch.position.copy(b.pos).multiplyScalar(0.2 + grow * 0.65)
      })
    }
    // krev
    const mesh = bloodRef.current
    if (mesh) {
      const speed = 1.6 * heartClock.speed * (0.3 + 0.7 * (0.5 + 0.5 * Math.sin(heartClock.phase * Math.PI * 2 - 1)))
      for (let i = 0; i < N; i++) {
        let x = blood.x[i]
        // průtok: před lézí částice zpomalí, když je tepna uzavřená
        const beforeLesion = x < -len * 0.6
        const localFlow = c.flow < 0.05 ? (beforeLesion ? 0.08 * Math.max(0, -len * 0.6 - x) : x > len * 0.8 ? 0.3 : 0) : 0.15 + 0.85 * c.flow
        x += dt * speed * blood.v[i] * localFlow
        if (x > L / 2) x = -L / 2
        if (c.flow < 0.05 && x > -len * 0.6 && x < len * 0.8) x = -L / 2 + Math.random() * 0.5
        blood.x[i] = x
        // poloha v průřezu, vytlačená plátem/trombem
        let y = Math.cos(blood.a[i]) * blood.r[i]
        let z = Math.sin(blood.a[i]) * blood.r[i]
        // obal plátu v rovině yz (zjednodušeně kruh o poloměru a kolem středu plátu), utlumený vzdáleností v x
        const fx = Math.max(0, 1 - Math.abs(x) / (len * 1.05))
        if (fx > 0) {
          tmp.set(y - pc.y, z - pc.z)
          const rad = a * squash * (0.5 + 0.5 * fx) + 0.05 + c.thrombus * R * 0.8 * fx
          const d = tmp.length()
          if (d < rad) {
            tmp.normalize().multiplyScalar(rad)
            y = pc.y + tmp.x
            z = pc.z + tmp.y
            const rr = Math.hypot(y, z)
            if (rr > R * 0.78) {
              y *= (R * 0.78) / rr
              z *= (R * 0.78) / rr
            }
          }
        }
        dummy.position.set(x, y, z)
        dummy.scale.setScalar(1)
        dummy.updateMatrix()
        mesh.setMatrixAt(i, dummy.matrix)
      }
      mesh.instanceMatrix.needsUpdate = true
    }
    // LDL částice: plují krví a zanořují se do stěny v místě plátu
    const lm = ldlRef.current
    if (lm) {
      lm.visible = c.ldl > 0.02
      for (let i = 0; i < NL; i++) {
        let x = ldl.x[i] + dt * 0.9
        if (x > 0.6) x = -L / 2
        ldl.x[i] = x
        const tt = (ldl.t[i] + heartClock.time * 0.15 + i * 0.37) % 1
        const dive = x > -1.2 ? Math.min(1, (x + 1.2) / 1.6) : 0
        const y = THREE.MathUtils.lerp(Math.cos(tt * 6.28) * R * 0.5, pc.y * 0.95, dive)
        const z = THREE.MathUtils.lerp(-R * 0.4 + Math.sin(tt * 6.28) * R * 0.3, pc.z * 0.95, dive)
        dummy.position.set(x, y, z)
        dummy.scale.setScalar(c.ldl)
        dummy.updateMatrix()
        lm.setMatrixAt(i, dummy.matrix)
      }
      lm.instanceMatrix.needsUpdate = true
    }
    // lék (trombolytikum) – tyrkysové částice přitékající k trombu
    const dm = drugRef.current
    if (dm) {
      dm.visible = c.drug > 0.02
      for (let i = 0; i < NL; i++) {
        let x = drug.x[i] + dt * 1.4
        if (x > 0.3) x = -L / 2
        drug.x[i] = x
        const tt = (drug.t[i] + heartClock.time * 0.2 + i * 0.29) % 1
        dummy.position.set(x, Math.cos(tt * 6.28) * R * 0.45, -R * 0.4 + Math.sin(tt * 6.28) * R * 0.3)
        dummy.scale.setScalar(c.drug)
        dummy.updateMatrix()
        dm.setMatrixAt(i, dummy.matrix)
      }
      dm.instanceMatrix.needsUpdate = true
    }
    // vodič, balonek, stent
    if (wireRef.current) {
      wireRef.current.visible = c.wire > 0.02
      const tip = -L / 2 + c.wire * (L / 2 + 1.3)
      wireRef.current.scale.set(tip + L / 2, 1, 1)
      wireRef.current.position.set((-L / 2 + tip) / 2, 0.1, -0.15)
    }
    if (balloonRef.current) {
      balloonRef.current.visible = c.balloon > 0.02
      balloonRef.current.scale.set(1, 0.05 + c.balloon * R * 0.8, 0.05 + c.balloon * R * 0.8)
    }
    if (stentRef.current) {
      stentRef.current.visible = c.stent > 0.02
      const r = 0.12 + c.stent * R * 0.72
      stentRef.current.scale.set(r, 1, r)
    }
  })

  const bloodGeo = useMemo(() => new THREE.SphereGeometry(0.05, 8, 6), [])
  const ldlGeo = useMemo(() => new THREE.SphereGeometry(0.035, 8, 6), [])

  return (
    <group>
      <Wall />
      {/* plát */}
      <group ref={plaqueRef}>
        <mesh ref={coreRef}>
          <sphereGeometry args={[1, 24, 16]} />
          <meshStandardMaterial color="#e6cf7a" roughness={0.85} />
        </mesh>
        <mesh ref={capRef}>
          <sphereGeometry args={[1, 24, 16]} />
          <meshStandardMaterial color="#f6e7c0" roughness={0.5} transparent opacity={0.9} />
        </mesh>
        <mesh ref={exposedRef}>
          <sphereGeometry args={[1, 12, 8]} />
          <meshStandardMaterial color="#d9a441" emissive="#7a4a00" emissiveIntensity={0.5} roughness={0.9} />
        </mesh>
      </group>
      {/* trombus */}
      <group ref={thrombusRef}>
        {thrombusBalls.map((b) => (
          <mesh key={b.i}>
            <sphereGeometry args={[1, 10, 8]} />
            <meshStandardMaterial color="#4a0f16" roughness={0.9} emissive="#2a0008" emissiveIntensity={0.4} />
          </mesh>
        ))}
      </group>
      {/* krev */}
      <instancedMesh ref={bloodRef} args={[bloodGeo, undefined, N]} frustumCulled={false}>
        <meshStandardMaterial color="#ff4d45" emissive="#ff2a20" emissiveIntensity={0.45} roughness={0.4} />
      </instancedMesh>
      <instancedMesh ref={ldlRef} args={[ldlGeo, undefined, NL]} frustumCulled={false}>
        <meshStandardMaterial color="#ffe36b" emissive="#ffcc00" emissiveIntensity={0.7} />
      </instancedMesh>
      <instancedMesh ref={drugRef} args={[ldlGeo, undefined, NL]} frustumCulled={false}>
        <meshStandardMaterial color="#7ff5e6" emissive="#2bd4c0" emissiveIntensity={0.9} />
      </instancedMesh>
      {/* vodič */}
      <mesh ref={wireRef} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.02, 0.02, 1, 8]} />
        <meshStandardMaterial color="#e6edf5" metalness={0.8} roughness={0.3} />
      </mesh>
      {/* balonek */}
      <mesh ref={balloonRef} position={[0.15, -0.05, -0.2]} rotation={[0, 0, Math.PI / 2]}>
        <capsuleGeometry args={[1, 1.3, 6, 16]} />
        <meshStandardMaterial color="#8fd3ff" transparent opacity={0.6} roughness={0.2} />
      </mesh>
      {/* stent */}
      <mesh ref={stentRef} position={[0.15, -0.05, -0.2]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[1, 1, 1.9, 14, 8, true]} />
        <meshStandardMaterial color="#d8e0ea" metalness={0.9} roughness={0.25} wireframe />
      </mesh>
    </group>
  )
}

/** Vložený 3D řez věnčitou tepnou (podélný). */
export function VesselInset({ params, caption }: { params: HeartParams; caption?: string }) {
  const targets = useMemo(() => targetsFrom(params), [params])
  return (
    <div className="pointer-events-auto relative w-[210px] overflow-hidden rounded-xl border border-line bg-panel/85 shadow-xl shadow-black/40 backdrop-blur sm:w-[340px]">
      <div className="flex items-center justify-between gap-2 px-2.5 py-1 text-[11px]">
        <span className="truncate font-semibold text-accent-2">
          Řez RIA <span className="hidden font-normal text-muted sm:inline">· tok →</span>
        </span>
        {caption && <span className="truncate text-muted">{caption}</span>}
      </div>
      <div className="h-[105px] w-full sm:h-[170px]">
        <Canvas camera={{ position: [0, 3.1, 3.5], fov: 30 }} dpr={[1, 1.5]} gl={{ antialias: true }}>
          <ambientLight intensity={0.6} />
          <directionalLight position={[2, 5, 4]} intensity={1.6} />
          <directionalLight position={[-3, 2, -2]} intensity={0.5} color="#9fb4ff" />
          <InsetScene targets={targets} />
        </Canvas>
      </div>
    </div>
  )
}
