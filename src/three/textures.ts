import * as THREE from 'three'

let bump: THREE.CanvasTexture | null = null

/** Procedurální hrbolová mapa: vláknitá svalovina + jemné zrno. */
export function getMuscleBump() {
  if (bump) return bump
  const size = 512
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')!
  ctx.fillStyle = '#808080'
  ctx.fillRect(0, 0, size, size)
  // vlákna – šikmé, mírně zvlněné čáry (spirální průběh svalových vláken)
  let seed = 7
  const rnd = () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296
    return seed / 4294967296
  }
  ctx.lineWidth = 1
  for (let i = 0; i < 900; i++) {
    const x0 = rnd() * size
    const y0 = rnd() * size
    const len = 30 + rnd() * 90
    const ang = -0.6 + (rnd() - 0.5) * 0.35
    const shade = 96 + Math.floor(rnd() * 64)
    ctx.strokeStyle = `rgba(${shade},${shade},${shade},${0.12 + rnd() * 0.2})`
    ctx.beginPath()
    ctx.moveTo(x0, y0)
    const steps = 6
    for (let s = 1; s <= steps; s++) {
      const t = (s / steps) * len
      ctx.lineTo(x0 + Math.cos(ang) * t + Math.sin(t * 0.15) * 2, y0 + Math.sin(ang) * t + Math.cos(t * 0.13) * 2)
    }
    ctx.stroke()
  }
  // zrno
  const img = ctx.getImageData(0, 0, size, size)
  const d = img.data
  for (let i = 0; i < d.length; i += 4) {
    const g = (rnd() - 0.5) * 22
    d[i] = Math.max(0, Math.min(255, d[i] + g))
    d[i + 1] = d[i]
    d[i + 2] = d[i]
  }
  ctx.putImageData(img, 0, 0)
  bump = new THREE.CanvasTexture(canvas)
  bump.wrapS = bump.wrapT = THREE.RepeatWrapping
  bump.repeat.set(3, 2)
  return bump
}

let epi: THREE.CanvasTexture | null = null

/** Procedurální barevná mapa epikardu: mramorování a síť drobných cévek (násobí se s barvou vrcholů). */
export function getEpicardiumMap() {
  if (epi) return epi
  const size = 1024
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')!
  let seed = 31
  const rnd = () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296
    return seed / 4294967296
  }
  ctx.fillStyle = '#f4ecea'
  ctx.fillRect(0, 0, size, size)
  // mramorování – měkké skvrny světlejší a tmavší
  for (let i = 0; i < 700; i++) {
    const x = rnd() * size
    const y = rnd() * size
    const r = 20 + rnd() * 90
    const g = ctx.createRadialGradient(x, y, 0, x, y, r)
    const dark = rnd() < 0.5
    const a = 0.03 + rnd() * 0.09
    g.addColorStop(0, dark ? `rgba(120,40,45,${a})` : `rgba(255,240,235,${a * 0.6})`)
    g.addColorStop(1, 'rgba(0,0,0,0)')
    ctx.fillStyle = g
    ctx.fillRect(x - r, y - r, r * 2, r * 2)
  }
  // drobné cévky – náhodné větvící se procházky
  const walk = (x: number, y: number, ang: number, len: number, w: number, depth: number) => {
    ctx.lineWidth = w
    ctx.strokeStyle = `rgba(110,25,35,${0.28 + rnd() * 0.2})`
    ctx.beginPath()
    ctx.moveTo(x, y)
    for (let s = 0; s < len; s++) {
      ang += (rnd() - 0.5) * 0.7
      x += Math.cos(ang) * 4
      y += Math.sin(ang) * 4
      ctx.lineTo(x, y)
      if (depth > 0 && rnd() < 0.08) walk(x, y, ang + (rnd() < 0.5 ? 0.9 : -0.9), len * 0.5, w * 0.65, depth - 1)
    }
    ctx.stroke()
  }
  for (let i = 0; i < 70; i++) walk(rnd() * size, rnd() * size, rnd() * Math.PI * 2, 25 + rnd() * 45, 1.2 + rnd() * 1.2, 2)
  epi = new THREE.CanvasTexture(canvas)
  epi.wrapS = epi.wrapT = THREE.RepeatWrapping
  epi.repeat.set(2, 1.5)
  epi.colorSpace = THREE.SRGBColorSpace
  epi.anisotropy = 4
  return epi
}

let bg: THREE.CanvasTexture | null = null

/** Pozadí scény – měkký radiální přechod. */
export function getBackgroundMap() {
  if (bg) return bg
  const canvas = document.createElement('canvas')
  canvas.width = 512
  canvas.height = 512
  const ctx = canvas.getContext('2d')!
  const g = ctx.createRadialGradient(256, 210, 20, 256, 256, 360)
  g.addColorStop(0, '#1b2740')
  g.addColorStop(0.55, '#0f1626')
  g.addColorStop(1, '#0a0e16')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, 512, 512)
  bg = new THREE.CanvasTexture(canvas)
  bg.colorSpace = THREE.SRGBColorSpace
  return bg
}
