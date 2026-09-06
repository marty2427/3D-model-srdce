import { useMemo } from 'react'
import * as THREE from 'three'
import { HeartMaterial, colors } from './materials'
import { Pick } from './Pick'
import { useParams } from './params'
import { ladCurve, LAD_LESION_T } from './geometry'

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
