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
    ctx.strokeStyle = `rgba(${shade},${shade},${shade},${0.25 + rnd() * 0.35})`
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
