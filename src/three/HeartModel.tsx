import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { useStore } from '../store'
import { heartClock } from '../lib/heartClock'
import { activation, atrialContraction, avValveOpen, conductionTiming, semilunarOpen, ventricleContraction } from '../lib/cycle'
import { coronary, curveFrom, cardiacVeins, ellipsoids, paths, ladCurve, LAD_LESION_T, type V3 } from './geometry'
import { HeartMaterial } from './materials'
import { colors } from './constants'
import { buildBlob, extractTriangles } from './blob'
import { Valve } from './Valve'
import { Vessel, VesselCap } from './Vessel'
import { Pick } from './Pick'
import { ConductionSystem } from './Conduction'
import { Labels } from './Labels'
import { BloodFlow, CoronaryFlow } from './BloodFlow'
import { Grafts, LadLesion, Pacemaker, Stent } from './Interventions'
import { ParamsContext, useHeartParams, useParams } from './params'

const VENT_PIVOT_Y = 0.35
const ATRIA_PIVOT_Y = 0.4

/** Záře stěny dutiny při šíření vzruchu (jen v režimu převodního systému). */
function wallGlow(t0: number, t1: number, chaos: 'af' | 'vt' | null) {
  return (m: THREE.MeshStandardMaterial, baseEm: string, baseI: number) => {
    let g: number
    if (chaos === 'af') g = 0.3 * Math.abs(Math.sin(heartClock.time * 43 + t0 * 50) * Math.sin(heartClock.time * 29))
    else if (chaos === 'vt') g = 0.5 * Math.abs(Math.sin(heartClock.time * 24))
    else g = activation(heartClock.phase, t0, t1)
    if (g > 0.02) {
      m.emissive.set('#ffd166')
      m.emissiveIntensity = Math.max(baseI, g * 0.9)
    } else {
      m.emissive.set(baseEm)
      m.emissiveIntensity = baseI
    }
  }
}

function useChamberGlow() {
  const params = useParams()
  const mode = useStore((s) => s.mode)
  const glowing = mode === 'prevodni'
  const chaosA = params.atrialFibrillation ? 'af' : null
  const chaosV = params.ventricularTachycardia ? 'vt' : null
  const raGlow = useMemo(() => wallGlow(0.0, 0.06, chaosA), [chaosA])
  const laGlow = useMemo(() => wallGlow(0.03, 0.09, chaosA), [chaosA])
  const vGlow = useMemo(() => wallGlow(...conductionTiming.ventricles, chaosV), [chaosV])
  return { raGlow: glowing ? raGlow : undefined, laGlow: glowing ? laGlow : undefined, vGlow: glowing ? vGlow : undefined }
}

/** Barva vrcholu svaloviny: svalovina + žlutavý epikardiální tuk ve žlábcích kolem věnčitých tepen a v síňokomorovém žlábku. */
const fatSamples: V3[] = [coronary.lad, coronary.lcx, coronary.rca, coronary.pda, coronary.diagonal, coronary.marginal, coronary.acuteMarginal].flatMap((pts) =>
  curveFrom(pts)
    .getPoints(60)
    .map((v) => [v.x, v.y, v.z] as V3),
)
function muscleColor(base: string, fatAmount = 1) {
  const muscle = new THREE.Color(base)
  const fat = new THREE.Color('#e3c58e')
  const dark = new THREE.Color(base).multiplyScalar(0.7)
  return (p: THREE.Vector3, _n: THREE.Vector3, out: THREE.Color) => {
    let f = 0
    for (const s of fatSamples) {
      const d = Math.hypot(p.x - s[0], p.y - s[1], p.z - s[2])
      if (d < 0.16) f = Math.max(f, 1 - d / 0.16)
    }
    // síňokomorový žlábek – pás kolem báze komor
    const groove = Math.max(0, 1 - Math.abs(p.y - 0.32) / 0.14)
    f = Math.max(f, groove * 0.9)
    f = Math.pow(f, 1.4) * fatAmount
    // hrot mírně tmavší
    const apex = Math.max(0, Math.min(1, (-p.y - 1.2) / 0.8))
    out.copy(muscle).lerp(dark, apex * 0.5).lerp(fat, f * 0.6)
  }
}

/** Jednolitá svalová masa komor (hladké sjednocení LK a PK) rozdělená na část LK a PK. */
function useVentricleGeometry(lvDilate: number, rvDilate: number) {
  return useMemo(() => {
    const lv = { ...ellipsoids.lv, scale: ellipsoids.lv.scale.map((v) => v * lvDilate) as V3 }
    const rv = { ...ellipsoids.rv, scale: ellipsoids.rv.scale.map((v) => v * rvDilate) as V3 }
    const blob = buildBlob({ shapes: [lv, rv], origin: [0.05, -0.55, 0.1], k: 0.32, colorFn: muscleColor(colors.myocardium) })
    const lvGeo = extractTriangles(blob.geometry, (i) => blob.side[i] === 0)
    const rvGeo = extractTriangles(blob.geometry, (i) => blob.side[i] === 1)
    // záplata přední stěny LK (povodí RIA): přední část LK bez báze + hrot
    const pos = blob.geometry.attributes.position as THREE.BufferAttribute
    const c = Math.cos(-ellipsoids.lv.rotZ)
    const sn = Math.sin(-ellipsoids.lv.rotZ)
    const patch = extractTriangles(
      blob.geometry,
      (i) => {
        if (blob.side[i] !== 0) return false
        const dx = pos.getX(i) - ellipsoids.lv.center[0]
        const dy = pos.getY(i) - ellipsoids.lv.center[1]
        const lx = dx * c - dy * sn
        const ly = dx * sn + dy * c
        const lz = pos.getZ(i) - ellipsoids.lv.center[2]
        const front = lz > 0.2 && ly < 0.55 && lx > -0.85
        const apex = ly < -1.0
        return front || apex
      },
      0.012,
    )
    return { lvGeo, rvGeo, patch }
  }, [lvDilate, rvDilate])
}

/** Síň s ouškem jako hladký tvar. */
function useAtriumGeometry(e: typeof ellipsoids.ra, auricle: { center: V3; scale: V3; rotZ: number }) {
  return useMemo(
    () =>
      buildBlob({
        shapes: [e, auricle],
        origin: e.center,
        k: 0.22,
        widthSegments: 72,
        heightSegments: 54,
        noiseAmp: 0.008,
        colorFn: muscleColor(colors.atrium, 0.5),
      }).geometry,
    [e, auricle],
  )
}

const raAuricle = { center: [-0.55, 1.22, 0.4] as V3, scale: [0.32, 0.2, 0.22] as V3, rotZ: 0.5 }
const laAuricle = { center: [0.62, 0.95, 0.08] as V3, scale: [0.32, 0.17, 0.2] as V3, rotZ: -0.4 }

function Atria() {
  const layers = useStore((s) => s.layers)
  const transparent = useStore((s) => s.transparent)
  const { raGlow, laGlow } = useChamberGlow()
  const visible = layers.svalovina
  const raGeo = useAtriumGeometry(ellipsoids.ra, raAuricle)
  const laGeo = useAtriumGeometry(ellipsoids.la, laAuricle)
  const cav = useMemo(() => new THREE.SphereGeometry(1, 32, 24), [])
  const cavity = (e: typeof ellipsoids.ra, color: string, f: number) => (
    <group position={e.center} rotation={[0, 0, e.rotZ]}>
      <mesh geometry={cav} scale={[e.scale[0] * f, e.scale[1] * f, e.scale[2] * f]}>
        <HeartMaterial color={color} side={THREE.BackSide} transparentOpacity={0.08} roughness={0.9} clearcoat={0} />
      </mesh>
    </group>
  )
  return (
    <>
      <Pick id="prava-sin">
        <mesh geometry={raGeo} visible={visible} castShadow={!transparent} receiveShadow>
          <HeartMaterial color="#ffffff" vertexColors bump={0.012} animate={raGlow} />
        </mesh>
        {visible && cavity(ellipsoids.ra, colors.cavityDeoxy, 0.8)}
      </Pick>
      <Pick id="leva-sin">
        <mesh geometry={laGeo} visible={visible} castShadow={!transparent} receiveShadow>
          <HeartMaterial color="#ffffff" vertexColors bump={0.012} animate={laGlow} />
        </mesh>
        {visible && cavity(ellipsoids.la, colors.cavityOxy, 0.78)}
      </Pick>
    </>
  )
}

function Ventricles() {
  const params = useParams()
  const layers = useStore((s) => s.layers)
  const transparent = useStore((s) => s.transparent)
  const { vGlow } = useChamberGlow()
  const visible = layers.svalovina
  const { lvGeo, rvGeo, patch } = useVentricleGeometry(params.lvDilate, params.rvDilate)
  const cav = useMemo(() => new THREE.SphereGeometry(1, 32, 24), [])
  const cavity = (e: typeof ellipsoids.lv, color: string, f: number, dil: number) => (
    <group position={e.center} rotation={[0, 0, e.rotZ]}>
      <mesh geometry={cav} scale={[e.scale[0] * f * dil, e.scale[1] * f * dil, e.scale[2] * f * dil]}>
        <HeartMaterial color={color} side={THREE.BackSide} transparentOpacity={0.08} roughness={0.9} clearcoat={0} />
      </mesh>
    </group>
  )
  return (
    <>
      <Pick id="prava-komora">
        <mesh geometry={rvGeo} visible={visible} castShadow={!transparent} receiveShadow>
          <HeartMaterial color="#ffffff" vertexColors bump={0.018} animate={vGlow} />
        </mesh>
        {visible && cavity(ellipsoids.rv, colors.cavityDeoxy, 0.82, params.rvDilate)}
        {/* výtokový trakt pravé komory (infundibulum) */}
        <Vessel points={paths.rvot} radius={0.24} color={colors.myocardium} taper={(t) => 1.1 - 0.35 * t} visible={visible} />
      </Pick>
      <Pick id="leva-komora">
        <mesh geometry={lvGeo} visible={visible} castShadow={!transparent} receiveShadow>
          <HeartMaterial color="#ffffff" vertexColors bump={0.018} animate={vGlow} />
        </mesh>
        {visible && cavity(ellipsoids.lv, colors.cavityOxy, params.lvCavity, params.lvDilate)}
      </Pick>
      <InfarctPatch visible={visible} geometry={patch} />
    </>
  )
}

/** Postižená oblast přední stěny (povodí RIA): ischemie → nekróza. */
function InfarctPatch({ visible, geometry }: { visible: boolean; geometry: THREE.BufferGeometry }) {
  const params = useParams()
  const target = useMemo(() => {
    const c = new THREE.Color(colors.myocardium)
    if (params.infarct > 0.75) c.set(colors.necrosis)
    else if (params.infarct > 0.05) c.set(colors.ischemia).lerp(new THREE.Color(colors.myocardium), 1 - Math.min(1, params.infarct * 2))
    return c
  }, [params.infarct])
  const opacityTarget = params.infarct > 0.05 ? 1 : 0
  return (
    <mesh geometry={geometry} visible={visible}>
      <HeartMaterial
        color={colors.myocardium}
        opacity={0.999}
        roughness={0.7}
        bump={0.018}
        animate={(m, _e, _i, dt) => {
          const k = 1 - Math.exp(-dt * 3.5)
          m.color.lerp(target, k)
          m.opacity += (opacityTarget - m.opacity) * k
          m.visible = m.opacity > 0.02
        }}
      />
    </mesh>
  )
}

function Valves() {
  const params = useParams()
  const layers = useStore((s) => s.layers)
  if (!layers.chlopne) return null
  const av = () => avValveOpen(heartClock.phase)
  const sl = () => semilunarOpen(heartClock.phase)
  return (
    <>
      <Pick id="trikuspidalni">
        <Valve position={[-0.78, 0.4, 0.15]} direction={[0.35, -1, 0.35]} radius={0.3} leaflets={3} kind="av" openFn={av} />
      </Pick>
      <Pick id="mitralni">
        <Valve
          position={[0.45, 0.3, -0.42]}
          direction={[-0.1, -1, 0.35]}
          radius={0.27}
          leaflets={2}
          kind="av"
          openFn={av}
          minOpen={params.mitralRegurgitation ? 0.28 : 0}
        />
      </Pick>
      <Pick id="pulmonalni">
        <Valve position={[-0.05, 0.62, 0.55]} direction={[0.3, 1, -0.1]} radius={0.18} leaflets={3} kind="semilunar" openFn={sl} />
      </Pick>
      <Pick id="aortalni">
        <Valve
          position={[0.0, 0.5, -0.05]}
          direction={[-0.05, 1, 0]}
          radius={0.2}
          leaflets={3}
          kind="semilunar"
          openFn={sl}
          thick={params.aorticStenosis}
          maxOpen={params.aorticStenosis ? 0.3 : 1}
        />
      </Pick>
    </>
  )
}

function GreatVessels() {
  const layers = useStore((s) => s.layers)
  if (!layers.cevy) return null
  return (
    <>
      <Pick id="aorta">
        <Vessel points={paths.aorta} radius={0.22} color={colors.artery} segments={96} radial={16} taper={(t) => (t < 0.1 ? 1.15 - t : 1 - t * 0.25)} />
        <Vessel points={paths.brachiocephalic} radius={0.085} color={colors.artery} segments={16} />
        <Vessel points={paths.leftCarotid} radius={0.07} color={colors.artery} segments={16} />
        <Vessel points={paths.leftSubclavian} radius={0.07} color={colors.artery} segments={16} />
      </Pick>
      <Pick id="plicnice">
        <Vessel points={paths.pulmonaryTrunk} radius={0.2} color={colors.pulmonaryArtery} segments={32} />
        <VesselCap at={paths.pulmonaryTrunk[3]} radius={0.19} color={colors.pulmonaryArtery} />
        <Vessel points={paths.rightPA} radius={0.15} color={colors.pulmonaryArtery} segments={40} />
        <Vessel points={paths.leftPA} radius={0.15} color={colors.pulmonaryArtery} segments={32} />
      </Pick>
      <Pick id="horni-duta-zila">
        <Vessel points={paths.svc} radius={0.2} color={colors.vein} segments={24} />
      </Pick>
      <Pick id="dolni-duta-zila">
        <Vessel points={paths.ivc} radius={0.22} color={colors.vein} segments={32} />
      </Pick>
      <Pick id="plicni-zily">
        <Vessel points={paths.pvRightUpper} radius={0.11} color={colors.pulmonaryVein} segments={20} />
        <Vessel points={paths.pvRightLower} radius={0.11} color={colors.pulmonaryVein} segments={20} />
        <Vessel points={paths.pvLeftUpper} radius={0.11} color={colors.pulmonaryVein} segments={20} />
        <Vessel points={paths.pvLeftLower} radius={0.11} color={colors.pulmonaryVein} segments={20} />
      </Pick>
    </>
  )
}


function Coronaries() {
  const params = useParams()
  const layers = useStore((s) => s.layers)
  const split = useMemo(() => {
    const pts = ladCurve.getPoints(48).map((p) => [p.x, p.y, p.z] as V3)
    const i = Math.round(LAD_LESION_T * 48)
    return { prox: pts.slice(0, i + 2), dist: pts.slice(i) }
  }, [])
  if (!layers.koronarni) return null
  const distColor = new THREE.Color(colors.coronary).lerp(new THREE.Color('#6e4a4a'), 1 - params.ladFlow)
  const r = 0.045
  return (
    <>
      <Pick id="ria">
        <Vessel points={coronary.leftMain} radius={0.055} color={colors.coronary} segments={12} radial={8} />
        <Vessel points={split.prox} radius={r} color={colors.coronary} segments={24} radial={8} />
        <Vessel points={split.dist} radius={r} color={`#${distColor.getHexString()}`} segments={40} radial={8} taper={(t) => 1 - 0.4 * t} />
        <Vessel points={coronary.diagonal} radius={0.032} color={`#${distColor.getHexString()}`} segments={20} radial={8} taper={(t) => 1 - 0.4 * t} />
      </Pick>
      <Pick id="rcx">
        <Vessel points={coronary.lcx} radius={0.042} color={colors.coronary} segments={40} radial={8} taper={(t) => 1 - 0.35 * t} />
        <Vessel points={coronary.marginal} radius={0.032} color={colors.coronary} segments={20} radial={8} taper={(t) => 1 - 0.4 * t} />
      </Pick>
      {/* srdeční žíly – velká srdeční žíla podél RIA a koronární sinus vzadu */}
      {cardiacVeins.map((pts, i) => (
        <Vessel key={i} points={pts} radius={0.03} color={colors.vein} segments={32} radial={7} taper={(t) => 0.6 + 0.6 * t} />
      ))}
      <Pick id="rca">
        <Vessel points={coronary.rca} radius={0.045} color={colors.coronary} segments={48} radial={8} taper={(t) => 1 - 0.3 * t} />
        <Vessel points={coronary.pda} radius={0.032} color={colors.coronary} segments={24} radial={8} taper={(t) => 1 - 0.4 * t} />
        <Vessel points={coronary.acuteMarginal} radius={0.03} color={colors.coronary} segments={20} radial={8} taper={(t) => 1 - 0.4 * t} />
      </Pick>
    </>
  )
}

/** Celý model srdce včetně tepu. */
export function HeartModel() {
  const params = useHeartParams()
  const mode = useStore((s) => s.mode)
  const layers = useStore((s) => s.layers)
  const cutaway = useStore((s) => s.cutaway)
  const ventRef = useRef<THREE.Group>(null)
  const atriaRef = useRef<THREE.Group>(null)

  useFrame(() => {
    const p = heartClock.phase
    const c = ventricleContraction(p) * params.contractility
    const a = atrialContraction(p) * params.atrialKick
    if (ventRef.current) {
      let jitter = 0
      if (params.ventricularTachycardia) jitter = 0.015 * Math.sin(heartClock.time * 40)
      ventRef.current.scale.set(1 - 0.11 * c + jitter, 1 - 0.07 * c + jitter, 1 - 0.11 * c + jitter)
    }
    if (atriaRef.current) {
      let jitter = 0
      if (params.atrialFibrillation) jitter = 0.02 * Math.sin(heartClock.time * 55) * Math.sin(heartClock.time * 37)
      atriaRef.current.scale.set(1 - 0.1 * a + jitter, 1 - 0.1 * a + jitter, 1 - 0.1 * a + jitter)
    }
  })

  const showConduction = layers.prevodni || mode === 'prevodni'

  return (
    <ParamsContext.Provider value={params}>
      <group>
        {/* komory – škálují se kolem roviny chlopní */}
        <group position={[0, VENT_PIVOT_Y, 0]}>
          <group ref={ventRef}>
            <group position={[0, -VENT_PIVOT_Y, 0]}>
              <Ventricles />
              <Coronaries />
              {layers.koronarni && <LadLesion />}
              {layers.koronarni && <Stent />}
              {layers.koronarni && <Grafts />}
              {layers.koronarni && (mode === 'infarkt' || mode === 'lecba' || mode === 'nemoci') && <CoronaryFlow />}
              {showConduction && <ConductionSystem animated={mode === 'prevodni' || mode === 'nemoci' || mode === 'lecba'} />}
            </group>
          </group>
        </group>
        {/* síně */}
        <group position={[0, ATRIA_PIVOT_Y, 0]}>
          <group ref={atriaRef}>
            <group position={[0, -ATRIA_PIVOT_Y, 0]}>
              <Atria />
            </group>
          </group>
        </group>
        <Valves />
        <GreatVessels />
        <Pacemaker />
        {(mode === 'funkce' || mode === 'nemoci') && <BloodFlow />}
        <Labels cutaway={cutaway} />
      </group>
    </ParamsContext.Provider>
  )
}
