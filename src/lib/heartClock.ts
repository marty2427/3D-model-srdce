/**
 * Sdílené hodiny srdce – mutovaný objekt mimo React, čte se v useFrame i v EKG.
 * Fáze cyklu je 0–1; rytmus (frekvenci, nepravidelnost) určuje volající podle stavu aplikace.
 */
export interface Rhythm {
  bpm: number
  /** 0 = pravidelný, 1 = zcela nepravidelný (fibrilace síní) */
  irregularity: number
}

export const heartClock = {
  /** celkový čas animace v sekundách (respektuje zpomalení) */
  time: 0,
  /** fáze srdečního cyklu 0–1 */
  phase: 0,
  /** pořadové číslo stahu */
  beat: 0,
  /** délka aktuálního stahu (s) */
  beatLength: 60 / 70,
  bpm: 70,
  /** reálné zpomalení animace (1 = reálný čas) */
  speed: 1,
  /** poslední delta času (s) */
  dt: 0,
}

let lastFrame = 0

/** Posune hodiny o reálný čas. Volá se jednou za snímek. */
export function tickHeartClock(now: number, playing: boolean, speed: number, rhythm: Rhythm, rng: () => number) {
  if (!lastFrame) lastFrame = now
  const realDt = Math.min(0.1, (now - lastFrame) / 1000)
  lastFrame = now
  heartClock.speed = speed
  heartClock.bpm = rhythm.bpm
  if (!playing) {
    heartClock.dt = 0
    return
  }
  const dt = realDt * speed
  heartClock.dt = dt
  heartClock.time += dt
  const step = dt / heartClock.beatLength
  let phase = heartClock.phase + step
  if (phase >= 1) {
    phase -= 1
    heartClock.beat += 1
    const base = 60 / rhythm.bpm
    const jitter = rhythm.irregularity > 0 ? 1 + (rng() - 0.5) * 1.2 * rhythm.irregularity : 1
    heartClock.beatLength = Math.max(0.25, base * jitter)
  }
  heartClock.phase = phase
}

export function setHeartPhase(p: number) {
  heartClock.phase = ((p % 1) + 1) % 1
}
