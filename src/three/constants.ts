import { createContext } from 'react'
import * as THREE from 'three'

export const colors = {
  myocardium: '#a93a3b',
  myocardiumLight: '#c9605a',
  atrium: '#bd5d5a',
  cavityOxy: '#7a1a1a',
  cavityDeoxy: '#3a2f6e',
  artery: '#d9403a',
  vein: '#4b6fd6',
  pulmonaryArtery: '#5b76d8',
  pulmonaryVein: '#d6524c',
  coronary: '#ff6a5b',
  valve: '#f1d9c7',
  conduction: '#ffd166',
  ischemia: '#6b1f2a',
  necrosis: '#5d5a5e',
  plaque: '#f3e2a6',
  thrombus: '#4a0f16',
  graft: '#ff9f6b',
  metal: '#c8d0dc',
}

/** Rovina řezu – odstraní přední (z > 0.12) polovinu srdce. */
export const cutPlane = new THREE.Plane(new THREE.Vector3(0, 0, -1), 0.12)

export interface PickState {
  hovered: boolean
  selected: boolean
}
export const PickContext = createContext<PickState>({ hovered: false, selected: false })
