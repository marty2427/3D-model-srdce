import * as THREE from 'three'

export type V3 = [number, number, number]

export interface Ellipsoid {
  center: V3
  scale: V3
  rotZ: number
}

/** Elipsoidy tvořící dutiny srdce (světové souřadnice, hrot vpravo dole) */
export const ellipsoids = {
  lv: { center: [0.4, -0.7, -0.15], scale: [0.95, 1.3, 0.9], rotZ: 0.4 } as Ellipsoid,
  rv: { center: [-0.4, -0.5, 0.35], scale: [0.75, 1.05, 0.6], rotZ: 0.4 } as Ellipsoid,
  ra: { center: [-0.85, 0.95, -0.05], scale: [0.68, 0.6, 0.62], rotZ: 0 } as Ellipsoid,
  la: { center: [0.5, 0.85, -0.6], scale: [0.75, 0.58, 0.6], rotZ: 0 } as Ellipsoid,
}

const tmpV = new THREE.Vector3()

/** Vrátí normalizovanou vzdálenost bodu od středu elipsoidu (1 = na povrchu) a gradient. */
function ellipsoidDistance(e: Ellipsoid, p: THREE.Vector3, outNormal: THREE.Vector3) {
  const c = Math.cos(-e.rotZ)
  const s = Math.sin(-e.rotZ)
  const dx = p.x - e.center[0]
  const dy = p.y - e.center[1]
  const dz = p.z - e.center[2]
  const lx = dx * c - dy * s
  const ly = dx * s + dy * c
  const lz = dz
  const nx = lx / e.scale[0]
  const ny = ly / e.scale[1]
  const nz = lz / e.scale[2]
  const d = Math.sqrt(nx * nx + ny * ny + nz * nz)
  // gradient v lokálních souřadnicích
  const gx = nx / e.scale[0]
  const gy = ny / e.scale[1]
  const gz = nz / e.scale[2]
  const c2 = Math.cos(e.rotZ)
  const s2 = Math.sin(e.rotZ)
  outNormal.set(gx * c2 - gy * s2, gx * s2 + gy * c2, gz).normalize()
  return d
}

/**
 * Posune bod ven z elipsoidů tak, aby ležel těsně nad povrchem (pro věnčité tepny).
 */
export function projectToSurface(p: V3, shapes: Ellipsoid[], pad = 0.05): V3 {
  const v = new THREE.Vector3(...p)
  const n = new THREE.Vector3()
  for (let iter = 0; iter < 4; iter++) {
    for (const e of shapes) {
      const d = ellipsoidDistance(e, v, n)
      const target = 1 + pad / Math.min(...e.scale)
      if (d < target) {
        // iterativně posuň podél normály
        for (let k = 0; k < 8; k++) {
          const dd = ellipsoidDistance(e, v, n)
          if (dd >= target) break
          v.addScaledVector(n, 0.03)
        }
      }
    }
  }
  return [v.x, v.y, v.z]
}

export function curveFrom(points: V3[], closed = false, tension = 0.5) {
  const c = new THREE.CatmullRomCurve3(
    points.map((p) => new THREE.Vector3(...p)),
    closed,
    'catmullrom',
    tension,
  )
  return c
}

export function tubeFrom(points: V3[], radius: number, segments = 48, radial = 12, closed = false) {
  const curve = curveFrom(points, closed)
  return new THREE.TubeGeometry(curve, segments, radius, radial, closed)
}

/** Trubice s proměnlivým poloměrem podél křivky (např. zužující se céva). */
export function taperedTube(points: V3[], radiusFn: (t: number) => number, segments = 64, radial = 12) {
  const curve = curveFrom(points)
  const geo = new THREE.TubeGeometry(curve, segments, 1, radial, false)
  const pos = geo.attributes.position as THREE.BufferAttribute
  const frames = curve.computeFrenetFrames(segments, false)
  for (let i = 0; i <= segments; i++) {
    const t = i / segments
    const r = radiusFn(t)
    const center = curve.getPointAt(t)
    const N = frames.normals[i]
    const B = frames.binormals[i]
    for (let j = 0; j <= radial; j++) {
      const v = (j / radial) * Math.PI * 2
      const sin = Math.sin(v)
      const cos = -Math.cos(v)
      tmpV.set(
        center.x + r * (cos * N.x + sin * B.x),
        center.y + r * (cos * N.y + sin * B.y),
        center.z + r * (cos * N.z + sin * B.z),
      )
      pos.setXYZ(i * (radial + 1) + j, tmpV.x, tmpV.y, tmpV.z)
    }
  }
  pos.needsUpdate = true
  geo.computeVertexNormals()
  return geo
}

/* ---------- Dráhy velkých cév ---------- */
export const paths = {
  aorta: [
    [0.0, 0.5, -0.05],
    [0.0, 0.95, -0.05],
    [-0.05, 1.45, -0.1],
    [-0.05, 1.9, -0.2],
    [0.1, 2.25, -0.4],
    [0.35, 2.3, -0.72],
    [0.45, 2.05, -1.05],
    [0.35, 1.5, -1.35],
    [0.3, 0.5, -1.4],
    [0.3, -0.8, -1.4],
    [0.3, -1.9, -1.4],
  ] as V3[],
  brachiocephalic: [
    [0.0, 2.2, -0.35],
    [-0.15, 2.55, -0.35],
    [-0.35, 2.9, -0.35],
  ] as V3[],
  leftCarotid: [
    [0.18, 2.28, -0.55],
    [0.2, 2.6, -0.58],
    [0.2, 2.9, -0.6],
  ] as V3[],
  leftSubclavian: [
    [0.35, 2.27, -0.75],
    [0.5, 2.55, -0.8],
    [0.75, 2.85, -0.85],
  ] as V3[],
  rvot: [
    [-0.5, 0.05, 0.55],
    [-0.35, 0.35, 0.62],
    [-0.15, 0.55, 0.6],
    [-0.05, 0.62, 0.55],
  ] as V3[],
  pulmonaryTrunk: [
    [-0.05, 0.62, 0.55],
    [0.08, 1.0, 0.5],
    [0.28, 1.38, 0.3],
    [0.35, 1.62, 0.05],
  ] as V3[],
  rightPA: [
    [0.35, 1.62, 0.05],
    [0.05, 1.68, -0.35],
    [-0.5, 1.72, -0.62],
    [-1.0, 1.68, -0.65],
    [-1.5, 1.62, -0.65],
  ] as V3[],
  leftPA: [
    [0.35, 1.62, 0.05],
    [0.7, 1.66, -0.15],
    [1.1, 1.6, -0.4],
    [1.55, 1.5, -0.55],
  ] as V3[],
  svc: [
    [-0.8, 2.7, -0.1],
    [-0.8, 2.1, -0.1],
    [-0.82, 1.55, -0.05],
    [-0.85, 1.3, -0.05],
  ] as V3[],
  ivc: [
    [-0.8, 0.5, -0.25],
    [-0.8, -0.1, -0.35],
    [-0.78, -0.7, -0.45],
    [-0.72, -1.3, -0.52],
    [-0.65, -1.95, -0.55],
  ] as V3[],
  pvRightUpper: [
    [-1.5, 1.2, -1.0],
    [-0.7, 1.1, -0.92],
    [0.1, 0.98, -0.85],
  ] as V3[],
  pvRightLower: [
    [-1.5, 0.65, -1.05],
    [-0.7, 0.6, -0.98],
    [0.1, 0.6, -0.9],
  ] as V3[],
  pvLeftUpper: [
    [1.7, 1.2, -0.95],
    [1.25, 1.08, -0.88],
    [0.9, 0.98, -0.8],
  ] as V3[],
  pvLeftLower: [
    [1.7, 0.6, -1.0],
    [1.25, 0.58, -0.92],
    [0.9, 0.6, -0.85],
  ] as V3[],
}

/* ---------- Věnčité tepny (body se přitisknou k povrchu komor) ---------- */
const vent = [ellipsoids.lv, ellipsoids.rv]
const all = [ellipsoids.lv, ellipsoids.rv, ellipsoids.ra, ellipsoids.la]
const surf = (pts: V3[], shapes = vent, pad = 0.045) => pts.map((p) => projectToSurface(p, shapes, pad))

export const coronary = {
  leftMain: [
    [0.14, 0.52, 0.08],
    [0.24, 0.47, 0.22],
    [0.3, 0.42, 0.32],
  ] as V3[],
  lad: surf([
    [0.3, 0.42, 0.32],
    [0.18, 0.2, 0.6],
    [0.08, -0.15, 0.8],
    [0.05, -0.55, 0.88],
    [0.12, -0.95, 0.8],
    [0.3, -1.35, 0.62],
    [0.55, -1.7, 0.4],
    [0.85, -1.9, 0.15],
  ]),
  diagonal: surf([
    [0.08, -0.25, 0.82],
    [0.4, -0.5, 0.78],
    [0.7, -0.85, 0.6],
    [0.95, -1.2, 0.35],
  ]),
  lcx: surf(
    [
      [0.3, 0.42, 0.32],
      [0.7, 0.36, 0.32],
      [1.08, 0.28, 0.08],
      [1.25, 0.15, -0.35],
      [1.1, 0.05, -0.78],
      [0.75, -0.05, -1.0],
      [0.45, -0.15, -1.05],
    ],
    all,
  ),
  marginal: surf([
    [1.2, 0.18, -0.2],
    [1.3, -0.4, -0.2],
    [1.2, -0.95, -0.12],
    [1.0, -1.5, -0.02],
  ]),
  rca: surf(
    [
      [-0.16, 0.5, 0.12],
      [-0.42, 0.42, 0.48],
      [-0.85, 0.32, 0.55],
      [-1.25, 0.18, 0.3],
      [-1.42, 0.02, -0.12],
      [-1.25, -0.15, -0.55],
      [-0.8, -0.32, -0.82],
      [-0.4, -0.55, -0.92],
    ],
    all,
  ),
  pda: surf([
    [-0.4, -0.55, -0.92],
    [-0.12, -0.95, -0.9],
    [0.15, -1.4, -0.7],
    [0.5, -1.75, -0.45],
  ]),
  acuteMarginal: surf([
    [-1.25, 0.12, 0.3],
    [-1.25, -0.45, 0.4],
    [-0.95, -0.95, 0.45],
    [-0.5, -1.35, 0.4],
  ]),
}

/** Poloha léze v RIA (proximální třetina) a křivka RIA. */
export const LAD_LESION_T = 0.3
export const ladCurve = curveFrom(coronary.lad)

/* ---------- Převodní systém ---------- */
export const conduction = {
  saNode: [-1.0, 1.42, 0.12] as V3,
  avNode: [-0.45, 0.42, -0.08] as V3,
  his: [
    [-0.45, 0.42, -0.08],
    [-0.36, 0.3, -0.05],
    [-0.27, 0.15, 0.0],
  ] as V3[],
  rightBundle: [
    [-0.27, 0.15, 0.0],
    [-0.32, -0.3, 0.22],
    [-0.28, -0.75, 0.33],
    [-0.1, -1.2, 0.3],
  ] as V3[],
  leftBundle: [
    [-0.27, 0.15, 0.0],
    [-0.02, -0.2, -0.12],
    [0.2, -0.7, -0.2],
    [0.5, -1.25, -0.2],
  ] as V3[],
  purkinjeRight: [
    [[-0.1, -1.2, 0.3], [-0.45, -1.15, 0.45], [-0.75, -0.85, 0.5]],
    [[-0.1, -1.2, 0.3], [-0.5, -0.8, 0.15], [-0.9, -0.45, 0.2]],
    [[-0.1, -1.2, 0.3], [-0.2, -1.35, 0.0], [-0.55, -1.2, -0.1]],
    [[-0.28, -0.75, 0.33], [-0.6, -0.5, 0.55], [-0.85, -0.1, 0.45]],
    [[-0.32, -0.3, 0.22], [-0.65, -0.15, 0.05], [-0.95, 0.1, 0.0]],
  ] as V3[][],
  purkinjeLeft: [
    [[0.5, -1.25, -0.2], [0.75, -1.55, -0.05], [0.9, -1.75, 0.1]],
    [[0.5, -1.25, -0.2], [0.75, -1.05, -0.5], [0.85, -0.7, -0.6]],
    [[0.5, -1.25, -0.2], [0.5, -1.15, 0.2], [0.55, -0.85, 0.45]],
    [[0.2, -0.7, -0.2], [0.55, -0.55, -0.55], [0.85, -0.3, -0.6]],
    [[0.2, -0.7, -0.2], [0.45, -0.45, 0.25], [0.85, -0.25, 0.4]],
    [[-0.02, -0.2, -0.12], [0.2, -0.05, -0.5], [0.5, 0.05, -0.65]],
    [[0.2, -0.7, -0.2], [0.1, -1.2, -0.45], [0.25, -1.6, -0.3]],
  ] as V3[][],
}

/* ---------- Dráhy krevních částic ---------- */
export const bloodPaths = {
  /** odkysličená: horní dutá žíla → pravá síň → pravá komora → plicnice → pravá plicní tepna */
  deoxySvc: [
    [-0.8, 2.7, -0.1],
    [-0.82, 1.9, -0.08],
    [-0.85, 1.25, -0.05],
    [-0.85, 0.85, 0.0],
    [-0.8, 0.45, 0.15],
    [-0.6, -0.1, 0.4],
    [-0.4, -0.7, 0.45],
    [-0.15, -1.1, 0.4],
    [-0.35, -0.5, 0.55],
    [-0.4, 0.05, 0.58],
    [-0.25, 0.42, 0.62],
    [-0.05, 0.62, 0.55],
    [0.08, 1.0, 0.5],
    [0.28, 1.38, 0.3],
    [0.35, 1.62, 0.05],
    [0.05, 1.68, -0.35],
    [-0.5, 1.72, -0.62],
    [-1.0, 1.68, -0.65],
    [-1.5, 1.62, -0.65],
  ] as V3[],
  /** odkysličená: dolní dutá žíla → pravá síň → pravá komora → plicnice → levá plicní tepna */
  deoxyIvc: [
    [-0.65, -1.95, -0.55],
    [-0.75, -1.0, -0.48],
    [-0.8, -0.2, -0.35],
    [-0.85, 0.5, -0.2],
    [-0.9, 0.95, -0.05],
    [-0.75, 0.5, 0.1],
    [-0.55, -0.15, 0.35],
    [-0.35, -0.75, 0.45],
    [-0.1, -1.15, 0.35],
    [-0.4, -0.55, 0.5],
    [-0.45, 0.0, 0.55],
    [-0.28, 0.4, 0.62],
    [-0.05, 0.62, 0.55],
    [0.08, 1.0, 0.5],
    [0.28, 1.38, 0.3],
    [0.35, 1.62, 0.05],
    [0.7, 1.66, -0.15],
    [1.1, 1.6, -0.4],
    [1.55, 1.5, -0.55],
  ] as V3[],
  /** okysličená: pravé plicní žíly → levá síň → levá komora → aorta → sestupná aorta */
  oxyRight: [
    [-1.5, 1.2, -1.0],
    [-0.7, 1.1, -0.92],
    [0.1, 0.98, -0.8],
    [0.5, 0.85, -0.6],
    [0.45, 0.45, -0.45],
    [0.45, -0.1, -0.3],
    [0.6, -0.7, -0.15],
    [0.8, -1.3, -0.05],
    [0.55, -0.8, -0.1],
    [0.3, -0.2, -0.1],
    [0.05, 0.3, -0.05],
    [0.0, 0.5, -0.05],
    [0.0, 0.95, -0.05],
    [-0.05, 1.45, -0.1],
    [-0.05, 1.9, -0.2],
    [0.1, 2.25, -0.4],
    [0.35, 2.3, -0.72],
    [0.45, 2.05, -1.05],
    [0.35, 1.5, -1.35],
    [0.3, 0.5, -1.4],
    [0.3, -0.8, -1.4],
    [0.3, -1.9, -1.4],
  ] as V3[],
  /** okysličená: levé plicní žíly → levá síň → levá komora → aorta → oblouk → hlava */
  oxyLeft: [
    [1.7, 1.2, -0.95],
    [1.25, 1.08, -0.88],
    [0.85, 0.95, -0.72],
    [0.55, 0.8, -0.55],
    [0.42, 0.4, -0.42],
    [0.4, -0.2, -0.25],
    [0.55, -0.8, -0.1],
    [0.75, -1.35, 0.0],
    [0.5, -0.9, -0.05],
    [0.25, -0.3, -0.05],
    [0.05, 0.25, -0.05],
    [0.0, 0.5, -0.05],
    [0.0, 0.95, -0.05],
    [-0.05, 1.45, -0.1],
    [-0.05, 1.9, -0.2],
    [0.0, 2.2, -0.35],
    [-0.15, 2.55, -0.35],
    [-0.35, 2.9, -0.35],
  ] as V3[],
}

/* ---------- Štěpy bypassu ---------- */
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
