import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { useStore } from '../store'
import { heartClock } from '../lib/heartClock'
import { atrialContraction, avValveOpen, semilunarOpen, ventricleContraction } from '../lib/cycle'
import { coronary, ellipsoids, paths, curveFrom, type V3 } from './geometry'
import { colors, HeartMaterial } from './materials'
import { Chamber } from './Chamber'
import { Valve } from './Valve'
import { Vessel, VesselCap } from './Vessel'
import { Pick } from './Pick'
import { ConductionSystem, activation, conductionTiming } from './Conduction'
import { Labels } from './Labels'
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

function Atria() {
  const layers = useStore((s) => s.layers)
  const { raGlow, laGlow } = useChamberGlow()
  const visible = layers.svalovina
  return (
    <>
      <Pick id="prava-sin">
        <Chamber e={ellipsoids.ra} color={colors.atrium} cavityColor={colors.cavityDeoxy} cavity={0.8} animate={raGlow} visible={visible} />
        {/* ouško pravé síně */}
        <mesh position={[-0.55, 1.2, 0.35]} rotation={[0, 0, 0.5]} scale={[0.3, 0.2, 0.2]} visible={visible}>
          <sphereGeometry args={[1, 20, 14]} />
          <HeartMaterial color={colors.atrium} />
        </mesh>
      </Pick>
      <Pick id="leva-sin">
        <Chamber e={ellipsoids.la} color={colors.atrium} cavityColor={colors.cavityOxy} cavity={0.78} animate={laGlow} visible={visible} />
        {/* ouško levé síně */}
        <mesh position={[0.62, 0.95, 0.05]} rotation={[0, 0, -0.4]} scale={[0.3, 0.16, 0.18]} visible={visible}>
          <sphereGeometry args={[1, 20, 14]} />
          <HeartMaterial color={colors.atrium} />
        </mesh>
      </Pick>
    </>
  )
}

function Ventricles() {
  const params = useParams()
  const layers = useStore((s) => s.layers)
  const { vGlow } = useChamberGlow()
  const visible = layers.svalovina
  return (
    <>
      <Pick id="prava-komora">
        <Chamber
          e={ellipsoids.rv}
          color={colors.myocardium}
          cavityColor={colors.cavityDeoxy}
          cavity={0.82}
          scale={params.rvDilate}
          animate={vGlow}
          visible={visible}
        />
        {/* výtokový trakt pravé komory (infundibulum) */}
        <Vessel points={paths.rvot} radius={0.24} color={colors.myocardium} taper={(t) => 1.1 - 0.35 * t} visible={visible} />
      </Pick>
      <Pick id="leva-komora">
        <Chamber
          e={ellipsoids.lv}
          color={colors.myocardium}
          cavityColor={colors.cavityOxy}
          cavity={params.lvCavity}
          scale={params.lvDilate}
          animate={vGlow}
          visible={visible}
        />
      </Pick>
      <InfarctPatch visible={visible} />
    </>
  )
}

/** Postižená oblast přední stěny (povodí RIA): ischemie → nekróza. */
function InfarctPatch({ visible }: { visible: boolean }) {
  const params = useParams()
  const target = useMemo(() => {
    const c = new THREE.Color(colors.myocardium)
    if (params.infarct > 0.75) c.set(colors.necrosis)
    else if (params.infarct > 0.05) c.set(colors.ischemia).lerp(new THREE.Color(colors.myocardium), 1 - Math.min(1, params.infarct * 2))
    return c
  }, [params.infarct])
  const opacityTarget = params.infarct > 0.05 ? 1 : 0
  const e = ellipsoids.lv
  const s = params.lvDilate * 1.012
  return (
    <group position={e.center} rotation={[0, 0, e.rotZ]} visible={visible}>
      <mesh scale={[e.scale[0] * s, e.scale[1] * s, e.scale[2] * s]}>
        <sphereGeometry args={[1, 48, 32, 0.55, 1.75, 0.75, 1.75]} />
        <HeartMaterial
          color={colors.myocardium}
          opacity={0.999}
          roughness={0.7}
          animate={(m) => {
            m.color.lerp(target, 0.05)
            m.opacity += (opacityTarget - m.opacity) * 0.06
            m.visible = m.opacity > 0.02
          }}
        />
      </mesh>
    </group>
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

/** Poloha léze v RIA (proximální třetina). */
export const LAD_LESION_T = 0.3
export const ladCurve = curveFrom(coronary.lad)

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
        <Labels cutaway={cutaway} />
      </group>
    </ParamsContext.Provider>
  )
}
