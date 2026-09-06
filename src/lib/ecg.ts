import type { EcgKind } from './pathology'
import { smoothstep } from './cycle'

const g = (p: number, c: number, w: number, a: number) => a * Math.exp(-(((p - c) / w) ** 2))
const plateau = (p: number, a: number, b: number) => smoothstep(a - 0.02, a + 0.01, p) * (1 - smoothstep(b - 0.02, b + 0.02, p))

/**
 * Hodnota EKG (v „mV“) pro fázi cyklu p ∈ [0,1) a typ rytmu.
 * Vlny jsou synchronizované s kinematikou modelu: P ≈ 0.05, QRS ≈ 0.15, T ≈ 0.44.
 */
export function ecgSample(p: number, kind: EcgKind, time: number): number {
  const P = g(p, 0.05, 0.022, 0.15)
  const Q = g(p, 0.135, 0.006, -0.1)
  const R = g(p, 0.15, 0.009, 1.0)
  const S = g(p, 0.165, 0.007, -0.25)
  const T = g(p, 0.44, 0.045, 0.3)
  switch (kind) {
    case 'normal':
      return P + Q + R + S + T
    case 'ischemia':
      // deprese ST + plošší/negativní T (námahová ischemie)
      return P + Q + R + S - 0.16 * plateau(p, 0.18, 0.4) + g(p, 0.44, 0.045, -0.12)
    case 'stemi':
      // elevace ST splývající s T („náhrobní kámen“)
      return P + Q + R * 0.9 + S * 0.3 + 0.38 * plateau(p, 0.17, 0.42) + g(p, 0.42, 0.06, 0.4)
    case 'evolved-mi':
      // patologické Q, nižší R, přetrvávající elevace ST, negativní T
      return P + g(p, 0.135, 0.012, -0.4) + R * 0.55 + S * 0.4 + 0.2 * plateau(p, 0.17, 0.4) + g(p, 0.44, 0.045, -0.22)
    case 'af':
      // bez vlny P, fibrilační vlnky, nepravidelné QRS (nepravidelnost řeší hodiny)
      return (
        0.03 * Math.sin(time * 62) + 0.025 * Math.sin(time * 97 + 1) + 0.02 * Math.sin(time * 41 + 2) + Q + R + S + T
      )
    case 'vt':
      // široké bizarní QRS, bez P, T opačné polarity
      return g(p, 0.2, 0.07, 0.85) + g(p, 0.33, 0.07, -0.65) + g(p, 0.62, 0.12, -0.3)
    case 'hf':
      // rozšířený QRS (blokáda raménka), nižší voltáž, ploché T
      return P * 0.8 + g(p, 0.15, 0.02, 0.7) + g(p, 0.19, 0.018, -0.3) + g(p, 0.46, 0.05, -0.12)
    case 'lvh':
      // vysoké R, hluboké S, „strain“ – deprese ST a negativní T
      return P + Q + R * 1.5 + S * 2 - 0.1 * plateau(p, 0.18, 0.4) + g(p, 0.44, 0.045, -0.28)
    case 'brady':
      return P + Q + R + S + T
    case 'paced':
      // stimulační hrot před širokým QRS
      return g(p, 0.128, 0.0025, 0.55) + g(p, 0.15, 0.02, 0.8) + g(p, 0.19, 0.018, -0.35) + g(p, 0.46, 0.05, -0.2)
  }
}

export const ecgLabel: Record<EcgKind, string> = {
  normal: 'Sinusový rytmus',
  ischemia: 'Ischemie – deprese ST',
  stemi: 'Akutní infarkt – elevace ST (STEMI)',
  'evolved-mi': 'Vyvinutý infarkt – patologické Q, elevace ST',
  af: 'Fibrilace síní – nepravidelný rytmus bez vln P',
  vt: 'Komorová tachykardie – široké QRS',
  hf: 'Srdeční selhání – rozšířený QRS',
  lvh: 'Hypertrofie levé komory – vysoké voltáže, „strain“',
  brady: 'Sinusová bradykardie',
  paced: 'Stimulovaný rytmus (kardiostimulátor)',
}
