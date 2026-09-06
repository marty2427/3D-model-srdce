import { useEffect, useRef } from 'react'
import { heartClock } from '../lib/heartClock'
import { ecgSample, ecgLabel } from '../lib/ecg'
import { useHeartParams } from '../three/params'

const WINDOW = 3 // sekund animačního času
const RATE = 240 // vzorků za sekundu animačního času

/** EKG křivka pod modelem – běží synchronně s hodinami srdce (včetně zpomalení). */
export function EcgStrip() {
  const params = useHeartParams()
  const canvas = useRef<HTMLCanvasElement>(null)
  const kindRef = useRef(params.ecg)
  useEffect(() => {
    kindRef.current = params.ecg
  }, [params.ecg])
  const bpmRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const el = canvas.current
    if (!el) return
    const ctx = el.getContext('2d')
    if (!ctx) return
    const buf: { t: number; v: number }[] = []
    let lastT = heartClock.time - WINDOW
    let raf = 0

    const draw = () => {
      const dpr = Math.min(2, window.devicePixelRatio || 1)
      const w = el.clientWidth
      const h = el.clientHeight
      if (el.width !== Math.round(w * dpr) || el.height !== Math.round(h * dpr)) {
        el.width = Math.round(w * dpr)
        el.height = Math.round(h * dpr)
      }
      // vzorkování
      const now = heartClock.time
      if (now < lastT) lastT = now
      const step = 1 / RATE
      while (lastT + step <= now) {
        lastT += step
        const back = now - lastT
        let ph = heartClock.phase - back / heartClock.beatLength
        ph = ((ph % 1) + 1) % 1
        buf.push({ t: lastT, v: ecgSample(ph, kindRef.current, lastT) })
      }
      while (buf.length && buf[0].t < now - WINDOW) buf.shift()

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, w, h)
      // mřížka EKG papíru
      ctx.strokeStyle = 'rgba(255, 90, 74, 0.10)'
      ctx.lineWidth = 1
      const small = w / (WINDOW * 25)
      ctx.beginPath()
      for (let x = 0; x < w; x += small) {
        ctx.moveTo(x, 0)
        ctx.lineTo(x, h)
      }
      for (let y = 0; y < h; y += small) {
        ctx.moveTo(0, y)
        ctx.lineTo(w, y)
      }
      ctx.stroke()
      ctx.strokeStyle = 'rgba(255, 90, 74, 0.22)'
      ctx.beginPath()
      for (let x = 0; x < w; x += small * 5) {
        ctx.moveTo(x, 0)
        ctx.lineTo(x, h)
      }
      for (let y = 0; y < h; y += small * 5) {
        ctx.moveTo(0, y)
        ctx.lineTo(w, y)
      }
      ctx.stroke()

      // křivka
      const base = h * 0.62
      const amp = h * 0.32
      ctx.strokeStyle = '#7ef29a'
      ctx.lineWidth = 1.8
      ctx.lineJoin = 'round'
      ctx.shadowColor = 'rgba(126, 242, 154, 0.5)'
      ctx.shadowBlur = 4
      ctx.beginPath()
      for (let i = 0; i < buf.length; i++) {
        const x = w - ((now - buf[i].t) / WINDOW) * w
        const y = base - buf[i].v * amp
        if (i === 0) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
      }
      ctx.stroke()
      ctx.shadowBlur = 0
      // aktuální bod
      if (buf.length) {
        const last = buf[buf.length - 1]
        ctx.fillStyle = '#ffd166'
        ctx.beginPath()
        ctx.arc(w - 1, base - last.v * amp, 3, 0, Math.PI * 2)
        ctx.fill()
      }
      if (bpmRef.current) bpmRef.current.textContent = `${Math.round(60 / heartClock.beatLength)} /min`
      raf = requestAnimationFrame(draw)
    }
    raf = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(raf)
  }, [])

  return (
    <div className="relative h-[96px] w-full border-t border-line bg-[#0a1210]">
      <canvas ref={canvas} className="h-full w-full" aria-label="EKG křivka" />
      <div className="pointer-events-none absolute left-2 top-1 flex items-center gap-2 text-[11px]">
        <span className="rounded bg-black/40 px-1.5 py-0.5 font-semibold text-[#7ef29a]">EKG</span>
        <span className="rounded bg-black/40 px-1.5 py-0.5 text-ink/90">{ecgLabel[params.ecg]}</span>
      </div>
      <div className="pointer-events-none absolute right-2 top-1 rounded bg-black/40 px-1.5 py-0.5 text-[11px] font-semibold text-accent-2">
        <span ref={bpmRef} />
      </div>
      <div className="pointer-events-none absolute bottom-1 left-2 text-[10px] text-muted">
        P = síně · QRS = komory · T = repolarizace komor · ST = úsek mezi nimi
      </div>
    </div>
  )
}
