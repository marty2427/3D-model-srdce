import { useMemo } from 'react'
import * as THREE from 'three'
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
