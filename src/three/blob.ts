import * as THREE from 'three'
import { mergeVertices } from 'three/examples/jsm/utils/BufferGeometryUtils.js'
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
  /** hustota ikosaedrické sítě (počet trojúhelníků ≈ 20·detail²) */
  detail?: number
  noiseAmp?: number
  /** vrátí barvu vrcholu (volitelné) */
  colorFn?: (p: THREE.Vector3, n: THREE.Vector3, out: THREE.Color) => void
}

export interface BlobResult {
  geometry: THREE.BufferGeometry
  sdf: (x: number, y: number, z: number) => number
  /** index nejbližšího elipsoidu pro každý vrchol */
  side: Uint8Array
  /** vzdálenost (SDF) každého vrcholu ke každému elipsoidu: dists[i * shapes.length + s] */
  dists: Float32Array
  shapeCount: number
}

export function buildBlob(o: BlobOptions): BlobResult {
  const k = o.k ?? 0.35
  const sdf = (x: number, y: number, z: number) => {
    let d = ellipsoidSdf(o.shapes[0], x, y, z)
    for (let i = 1; i < o.shapes.length; i++) d = smin(d, ellipsoidSdf(o.shapes[i], x, y, z), k)
    return d
  }
  // rovnoměrná síť bez pólů: ikosaedr sloučený na indexovanou geometrii
  const ico = new THREE.IcosahedronGeometry(1, o.detail ?? 40)
  ico.deleteAttribute('uv')
  ico.deleteAttribute('normal')
  const base = mergeVertices(ico)
  const pos = base.attributes.position as THREE.BufferAttribute
  const n = pos.count
  const normals = new Float32Array(n * 3)
  const colors = new Float32Array(n * 3)
  const uvs = new Float32Array(n * 2)
  const side = new Uint8Array(n)
  const dists = new Float32Array(n * o.shapes.length)
  const dir = new THREE.Vector3()
  const p = new THREE.Vector3()
  const nn = new THREE.Vector3()
  const col = new THREE.Color()
  const [ox, oy, oz] = o.origin
  const amp = o.noiseAmp ?? 0.012
  const eps = 0.004
  for (let i = 0; i < n; i++) {
    dir.set(pos.getX(i), pos.getY(i), pos.getZ(i)).normalize()
    // sphere tracing zevnitř ven od středu dutiny: konzervativní krok podle |sdf|, první průchod povrchem,
    // pak bisekce. Každá dutina se trasuje z vlastního středu, vůči kterému je hvězdicovitá.
    let t = 0
    let dPrev = sdf(ox, oy, oz)
    let r0 = 0
    let r1 = 0
    for (let it = 0; it < 400 && t < 4; it++) {
      const step = Math.min(0.03, Math.max(0.002, -dPrev * 0.5))
      const tn = t + step
      const d = sdf(ox + dir.x * tn, oy + dir.y * tn, oz + dir.z * tn)
      if (d >= 0) {
        r0 = t
        r1 = tn
        break
      }
      t = tn
      dPrev = d
      r0 = t
      r1 = t
    }
    for (let it = 0; it < 14; it++) {
      const rm = (r0 + r1) / 2
      if (sdf(ox + dir.x * rm, oy + dir.y * rm, oz + dir.z * rm) < 0) r0 = rm
      else r1 = rm
    }
    const r = (r0 + r1) / 2
    p.set(ox + dir.x * r, oy + dir.y * r, oz + dir.z * r)
    // normála z gradientu SDF na izoploše, šum se posouvá podél normály (stejné pole pro všechny části)
    nn.set(
      sdf(p.x + eps, p.y, p.z) - sdf(p.x - eps, p.y, p.z),
      sdf(p.x, p.y + eps, p.z) - sdf(p.x, p.y - eps, p.z),
      sdf(p.x, p.y, p.z + eps) - sdf(p.x, p.y, p.z - eps),
    ).normalize()
    p.addScaledVector(nn, amp * noise(p.x, p.y, p.z))
    pos.setXYZ(i, p.x, p.y, p.z)
    normals[i * 3] = nn.x
    normals[i * 3 + 1] = nn.y
    normals[i * 3 + 2] = nn.z
    let best = 0
    let bd = Infinity
    for (let s = 0; s < o.shapes.length; s++) {
      const d = ellipsoidSdf(o.shapes[s], p.x, p.y, p.z)
      dists[i * o.shapes.length + s] = d
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
  base.setAttribute('uv', new THREE.BufferAttribute(uvs, 2))
  pos.needsUpdate = true
  base.computeBoundingSphere()
  return { geometry: base, sdf, side, dists, shapeCount: o.shapes.length }
}

/**
 * Vybere trojúhelníky, jejichž vrcholy splňují predikát (většinově), a vrátí novou (neindexovanou) geometrii.
 * `offset` posune vrcholy podél normály (např. záplata těsně nad povrchem).
 */
export function extractTriangles(
  geo: THREE.BufferGeometry,
  keep: (index: number) => boolean,
  offset = 0,
  /** volitelná váha vrcholu 0–1 (atribut aWeight, např. měkký okraj záplaty) */
  weight?: (index: number) => number,
  /** kolik vrcholů trojúhelníku musí splnit predikát (1 = s přesahem přes hranici, 2 = většina) */
  minVotes = 2,
  /** trojúhelníky s delší hranou se zahodí (přeskoky mezi nesousedícími plochami při trasování z jednoho středu) */
  maxEdge = Infinity,
  /** vlastní rozhodnutí o trojúhelníku podle indexů vrcholů (má přednost před minVotes) */
  triKeep?: (a: number, b: number, c: number) => boolean,
) {
  const index = geo.index!
  const pos = geo.attributes.position as THREE.BufferAttribute
  const nor = geo.attributes.normal as THREE.BufferAttribute
  const col = geo.attributes.color as THREE.BufferAttribute | undefined
  const P: number[] = []
  const N: number[] = []
  const U: number[] = []
  const C: number[] = []
  const W: number[] = []
  for (let t = 0; t < index.count; t += 3) {
    const a = index.getX(t)
    const b = index.getX(t + 1)
    const c = index.getX(t + 2)
    if (triKeep) {
      if (!triKeep(a, b, c)) continue
    } else {
      const votes = (keep(a) ? 1 : 0) + (keep(b) ? 1 : 0) + (keep(c) ? 1 : 0)
      if (votes < minVotes) continue
    }
    if (maxEdge < Infinity) {
      const e2 = (u: number, v: number) => (pos.getX(u) - pos.getX(v)) ** 2 + (pos.getY(u) - pos.getY(v)) ** 2 + (pos.getZ(u) - pos.getZ(v)) ** 2
      if (e2(a, b) > maxEdge * maxEdge || e2(b, c) > maxEdge * maxEdge || e2(c, a) > maxEdge * maxEdge) continue
    }
    // krychlová projekce UV zvolená po trojúhelnících podle normály plošky – bez roztažení na hranicích os
    const fnx = nor.getX(a) + nor.getX(b) + nor.getX(c)
    const fny = nor.getY(a) + nor.getY(b) + nor.getY(c)
    const fnz = nor.getZ(a) + nor.getZ(b) + nor.getZ(c)
    const ax = Math.abs(fnx)
    const ay = Math.abs(fny)
    const az = Math.abs(fnz)
    const axis = ax >= ay && ax >= az ? 0 : ay >= az ? 1 : 2
    const uvScale = 0.55
    for (const v of [a, b, c]) {
      const nx = nor.getX(v)
      const ny = nor.getY(v)
      const nz = nor.getZ(v)
      const px = pos.getX(v)
      const py = pos.getY(v)
      const pz = pos.getZ(v)
      P.push(px + nx * offset, py + ny * offset, pz + nz * offset)
      N.push(nx, ny, nz)
      if (axis === 0) U.push(pz * uvScale, py * uvScale)
      else if (axis === 1) U.push(px * uvScale, pz * uvScale)
      else U.push(px * uvScale, py * uvScale)
      if (col) C.push(col.getX(v), col.getY(v), col.getZ(v))
      if (weight) W.push(weight(v))
    }
  }
  const g = new THREE.BufferGeometry()
  g.setAttribute('position', new THREE.Float32BufferAttribute(P, 3))
  g.setAttribute('normal', new THREE.Float32BufferAttribute(N, 3))
  g.setAttribute('uv', new THREE.Float32BufferAttribute(U, 2))
  if (col) g.setAttribute('color', new THREE.Float32BufferAttribute(C, 3))
  if (weight) g.setAttribute('aWeight', new THREE.Float32BufferAttribute(W, 1))
  g.computeBoundingSphere()
  return g
}
