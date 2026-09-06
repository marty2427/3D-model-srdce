import * as THREE from 'three'
import type { Ellipsoid, V3 } from './geometry'

/**
 * Stavba organického tvaru jako hladkého sjednocení elipsoidů (SDF + smooth-min).
 * Z koule se každý vrchol posune po paprsku ze středu na izoplochu; normály se počítají z gradientu.
 */

function ellipsoidSdf(e: Ellipsoid, x: number, y: number, z: number) {
  const c = Math.cos(-e.rotZ)
  const s = Math.sin(-e.rotZ)
  const dx = x - e.center[0]
  const dy = y - e.center[1]
  const dz = z - e.center[2]
  const lx = dx * c - dy * s
  const ly = dx * s + dy * c
  const nx = lx / e.scale[0]
  const ny = ly / e.scale[1]
  const nz = dz / e.scale[2]
  const d = Math.sqrt(nx * nx + ny * ny + nz * nz)
  return (d - 1) * Math.min(e.scale[0], e.scale[1], e.scale[2])
}

function smin(a: number, b: number, k: number) {
  const h = Math.min(1, Math.max(0, 0.5 + (0.5 * (b - a)) / k))
  return b + (a - b) * h - k * h * (1 - h)
}

/** jemný organický šum povrchu */
function noise(x: number, y: number, z: number) {
  return (
    Math.sin(x * 7.1 + 1.3) * Math.sin(y * 5.3 + 0.7) * Math.sin(z * 6.2 + 2.1) * 0.5 +
    Math.sin(x * 13.7 + y * 3.1) * Math.sin(z * 11.3 - y * 4.7) * 0.3 +
    Math.sin((x + z) * 21.0) * Math.sin(y * 17.0 + x * 9.0) * 0.2
  )
}

export interface BlobOptions {
  shapes: Ellipsoid[]
  /** střed, ze kterého se vysílají paprsky (musí ležet uvnitř) */
  origin: V3
  /** hladkost spojení */
  k?: number
  widthSegments?: number
  heightSegments?: number
  noiseAmp?: number
  /** vrátí barvu vrcholu (volitelné) */
  colorFn?: (p: THREE.Vector3, n: THREE.Vector3, out: THREE.Color) => void
}

export interface BlobResult {
  geometry: THREE.BufferGeometry
  sdf: (x: number, y: number, z: number) => number
  /** index nejbližšího elipsoidu pro každý vrchol */
  side: Uint8Array
}

export function buildBlob(o: BlobOptions): BlobResult {
  const k = o.k ?? 0.35
  const sdf = (x: number, y: number, z: number) => {
    let d = ellipsoidSdf(o.shapes[0], x, y, z)
    for (let i = 1; i < o.shapes.length; i++) d = smin(d, ellipsoidSdf(o.shapes[i], x, y, z), k)
    return d
  }
  const base = new THREE.SphereGeometry(1, o.widthSegments ?? 128, o.heightSegments ?? 96)
  const pos = base.attributes.position as THREE.BufferAttribute
  const n = pos.count
  const normals = new Float32Array(n * 3)
  const colors = new Float32Array(n * 3)
  const side = new Uint8Array(n)
  const dir = new THREE.Vector3()
  const p = new THREE.Vector3()
  const nn = new THREE.Vector3()
  const col = new THREE.Color()
  const [ox, oy, oz] = o.origin
  const amp = o.noiseAmp ?? 0.012
  const eps = 0.004
  for (let i = 0; i < n; i++) {
    dir.set(pos.getX(i), pos.getY(i), pos.getZ(i)).normalize()
    // pochod po paprsku k první změně znaménka, pak bisekce
    let r0 = 0
    let r1 = 0.05
    while (r1 < 4 && sdf(ox + dir.x * r1, oy + dir.y * r1, oz + dir.z * r1) < 0) {
      r0 = r1
      r1 += 0.05
    }
    for (let it = 0; it < 18; it++) {
      const rm = (r0 + r1) / 2
      if (sdf(ox + dir.x * rm, oy + dir.y * rm, oz + dir.z * rm) < 0) r0 = rm
      else r1 = rm
    }
    let r = (r0 + r1) / 2
    p.set(ox + dir.x * r, oy + dir.y * r, oz + dir.z * r)
    r += amp * noise(p.x, p.y, p.z)
    p.set(ox + dir.x * r, oy + dir.y * r, oz + dir.z * r)
    pos.setXYZ(i, p.x, p.y, p.z)
    nn.set(
      sdf(p.x + eps, p.y, p.z) - sdf(p.x - eps, p.y, p.z),
      sdf(p.x, p.y + eps, p.z) - sdf(p.x, p.y - eps, p.z),
      sdf(p.x, p.y, p.z + eps) - sdf(p.x, p.y, p.z - eps),
    ).normalize()
    normals[i * 3] = nn.x
    normals[i * 3 + 1] = nn.y
    normals[i * 3 + 2] = nn.z
    let best = 0
    let bd = Infinity
    for (let s = 0; s < o.shapes.length; s++) {
      const d = ellipsoidSdf(o.shapes[s], p.x, p.y, p.z)
      if (d < bd) {
        bd = d
        best = s
      }
    }
    side[i] = best
    if (o.colorFn) o.colorFn(p, nn, col)
    else col.set('#ffffff')
    colors[i * 3] = col.r
    colors[i * 3 + 1] = col.g
    colors[i * 3 + 2] = col.b
  }
  base.setAttribute('normal', new THREE.BufferAttribute(normals, 3))
  base.setAttribute('color', new THREE.BufferAttribute(colors, 3))
  pos.needsUpdate = true
  base.computeBoundingSphere()
  return { geometry: base, sdf, side }
}

/**
 * Vybere trojúhelníky, jejichž vrcholy splňují predikát (většinově), a vrátí novou (neindexovanou) geometrii.
 * `offset` posune vrcholy podél normály (např. záplata těsně nad povrchem).
 */
export function extractTriangles(geo: THREE.BufferGeometry, keep: (index: number) => boolean, offset = 0) {
  const index = geo.index!
  const pos = geo.attributes.position as THREE.BufferAttribute
  const nor = geo.attributes.normal as THREE.BufferAttribute
  const uv = geo.attributes.uv as THREE.BufferAttribute
  const col = geo.attributes.color as THREE.BufferAttribute | undefined
  const P: number[] = []
  const N: number[] = []
  const U: number[] = []
  const C: number[] = []
  for (let t = 0; t < index.count; t += 3) {
    const a = index.getX(t)
    const b = index.getX(t + 1)
    const c = index.getX(t + 2)
    const votes = (keep(a) ? 1 : 0) + (keep(b) ? 1 : 0) + (keep(c) ? 1 : 0)
    if (votes < 2) continue
    for (const v of [a, b, c]) {
      const nx = nor.getX(v)
      const ny = nor.getY(v)
      const nz = nor.getZ(v)
      P.push(pos.getX(v) + nx * offset, pos.getY(v) + ny * offset, pos.getZ(v) + nz * offset)
      N.push(nx, ny, nz)
      U.push(uv.getX(v), uv.getY(v))
      if (col) C.push(col.getX(v), col.getY(v), col.getZ(v))
    }
  }
  const g = new THREE.BufferGeometry()
  g.setAttribute('position', new THREE.Float32BufferAttribute(P, 3))
  g.setAttribute('normal', new THREE.Float32BufferAttribute(N, 3))
  g.setAttribute('uv', new THREE.Float32BufferAttribute(U, 2))
  if (col) g.setAttribute('color', new THREE.Float32BufferAttribute(C, 3))
  g.computeBoundingSphere()
  return g
}
