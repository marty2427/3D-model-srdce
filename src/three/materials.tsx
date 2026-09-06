import { useContext, useRef } from 'react'
import { cutPlane, deformUniforms, PickContext } from './constants'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useStore } from '../store'
import { getMuscleBump } from './textures'

interface HeartMaterialProps {
  color: string
  /** krytí v průhledném režimu */
  transparentOpacity?: number
  /** zda se struktura řeže rovinou řezu */
  clip?: boolean
  /** struktura je vždy neprůhledná (chlopně, převodní systém…) */
  alwaysOpaque?: boolean
  side?: THREE.Side
  emissive?: string
  emissiveIntensity?: number
  roughness?: number
  metalness?: number
  opacity?: number
  flat?: boolean
  /** barvy vrcholů (tuk ve žlábcích apod.) */
  vertexColors?: boolean
  /** hrbolová mapa svaloviny */
  bump?: number
  /** lesk vlhkého povrchu */
  clearcoat?: number
  /** barevná mapa (násobí se s barvou) */
  map?: THREE.Texture | null
  /** krytí podle atributu aWeight (měkké okraje) */
  vertexAlpha?: boolean
  /** deformace stahu ve vertex shaderu (stěna srdce mimo škálované skupiny) */
  deform?: boolean
  /** volá se každý snímek – umožňuje animovat barvu/záři (dostane základní emisi a intenzitu) */
  animate?: (m: THREE.MeshStandardMaterial, baseEmissive: string, baseIntensity: number, delta: number) => void
}

function makeInjector(vertexAlpha: boolean, deform: boolean) {
  return (shader: THREE.WebGLProgramParametersWithUniforms) => {
    let vh = '#include <common>'
    let vb = '#include <begin_vertex>'
    let fh = '#include <common>'
    let fa = '#include <alphamap_fragment>'
    if (vertexAlpha) {
      vh += '\nattribute float aWeight;\nvarying float vWeight;'
      vb += '\nvWeight = aWeight;'
      fh += '\nvarying float vWeight;'
      fa += '\ndiffuseColor.a *= vWeight;'
    }
    if (deform) {
      shader.uniforms.uScaleV = deformUniforms.uScaleV
      shader.uniforms.uScaleA = deformUniforms.uScaleA
      shader.uniforms.uPivotV = deformUniforms.uPivotV
      shader.uniforms.uPivotA = deformUniforms.uPivotA
      vh += '\nuniform vec3 uScaleV;\nuniform vec3 uScaleA;\nuniform float uPivotV;\nuniform float uPivotA;'
      vb +=
        '\n{ float wv = 1.0 - smoothstep(0.12, 0.55, position.y);' +
        ' vec3 pv = vec3(0.0, uPivotV, 0.0) + (position - vec3(0.0, uPivotV, 0.0)) * uScaleV;' +
        ' vec3 pa = vec3(0.0, uPivotA, 0.0) + (position - vec3(0.0, uPivotA, 0.0)) * uScaleA;' +
        ' transformed = mix(pa, pv, wv); }'
    }
    shader.vertexShader = shader.vertexShader.replace('#include <common>', vh).replace('#include <begin_vertex>', vb)
    shader.fragmentShader = shader.fragmentShader.replace('#include <common>', fh).replace('#include <alphamap_fragment>', fa)
  }
}
const injectors = {
  none: undefined,
  alpha: makeInjector(true, false),
  deform: makeInjector(false, true),
  both: makeInjector(true, true),
}

/** Materiál srdečních struktur: reaguje na řez, průhlednost a výběr; fyzikální model s lesklým povrchem. */
export function HeartMaterial({
  color,
  transparentOpacity = 0.22,
  clip = true,
  alwaysOpaque = false,
  side,
  emissive,
  emissiveIntensity,
  roughness = 0.5,
  metalness = 0.0,
  opacity,
  flat,
  vertexColors = false,
  bump = 0,
  clearcoat = 0.18,
  map = null,
  vertexAlpha = false,
  deform = false,
  animate,
}: HeartMaterialProps) {
  const ref = useRef<THREE.MeshPhysicalMaterial>(null)
  const cutaway = useStore((s) => s.cutaway)
  const transparent = useStore((s) => s.transparent)
  const pick = useContext(PickContext)
  const hl = pick.selected ? 2 : pick.hovered ? 1 : 0
  const em = hl === 2 ? '#ffd166' : hl === 1 ? '#ffffff' : (emissive ?? '#000000')
  const emI = hl === 2 ? 0.45 : hl === 1 ? 0.22 : (emissiveIntensity ?? 0)
  const isT = (transparent && !alwaysOpaque) || (opacity !== undefined && opacity < 1)
  const op = isT ? (opacity !== undefined && opacity < 1 ? opacity : transparentOpacity) : 1
  useFrame((_, delta) => {
    if (animate && ref.current) animate(ref.current, em, emI, Math.min(delta, 0.1))
  })
  return (
    <meshPhysicalMaterial
      ref={ref}
      color={color}
      roughness={roughness}
      metalness={metalness}
      emissive={em}
      emissiveIntensity={emI}
      transparent={isT}
      opacity={op}
      depthWrite={!isT}
      side={side ?? (cutaway ? THREE.DoubleSide : THREE.FrontSide)}
      clippingPlanes={cutaway && clip ? [cutPlane] : null}
      clipShadows
      flatShading={flat ?? false}
      vertexColors={vertexColors}
      map={map}
      onBeforeCompile={injectors[vertexAlpha ? (deform ? 'both' : 'alpha') : deform ? 'deform' : 'none']}
      customProgramCacheKey={() => `heart-${vertexAlpha ? 1 : 0}-${deform ? 1 : 0}`}
      bumpMap={bump > 0 ? getMuscleBump() : null}
      bumpScale={bump}
      clearcoat={isT ? 0 : clearcoat}
      clearcoatRoughness={0.45}
      envMapIntensity={0.7}
    />
  )
}
