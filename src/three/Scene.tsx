import { Suspense, useEffect, useRef } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import { Environment, Lightformer, OrbitControls } from '@react-three/drei'
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib'
import { useStore } from '../store'
import { HeartModel } from './HeartModel'

const BASE_DISTANCE = 7.2

function Controls() {
  const ref = useRef<OrbitControlsImpl>(null)
  const resetSignal = useStore((s) => s.resetSignal)
  const { camera, size } = useThree()

  // přizpůsobení vzdálenosti kamery poměru stran (na výšku je třeba oddálit)
  useEffect(() => {
    const aspect = size.width / Math.max(1, size.height)
    const dist = aspect >= 1 ? BASE_DISTANCE : BASE_DISTANCE / Math.pow(aspect, 0.85)
    const c = ref.current
    if (!c) return
    const dir = camera.position.clone().sub(c.target).normalize()
    camera.position.copy(c.target).addScaledVector(dir, dist)
    camera.updateProjectionMatrix()
    c.saveState()
    c.update()
  }, [size.width, size.height, camera])

  useEffect(() => {
    if (resetSignal > 0) ref.current?.reset()
  }, [resetSignal])
  return (
    <OrbitControls
      ref={ref}
      makeDefault
      target={[0, 0.35, 0]}
      enableDamping
      dampingFactor={0.08}
      minDistance={2.5}
      maxDistance={14}
      enablePan
      panSpeed={0.8}
    />
  )
}

function Lights() {
  return (
    <>
      <ambientLight intensity={0.25} />
      <hemisphereLight args={['#dfe7ff', '#3a2020', 0.4]} />
      <directionalLight
        position={[4, 7, 6]}
        intensity={2.2}
        color="#fff1e4"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0004}
        shadow-normalBias={0.02}
        shadow-camera-near={1}
        shadow-camera-far={25}
        shadow-camera-left={-4}
        shadow-camera-right={4}
        shadow-camera-top={4.5}
        shadow-camera-bottom={-4}
      />
      <directionalLight position={[-6, 3, -4]} intensity={0.5} color="#9fb4ff" />
      <directionalLight position={[0, -6, 5]} intensity={0.3} color="#ffd8c8" />
      {/* prostředí pro odlesky – bez externích souborů, jen světelné plochy */}
      <Environment resolution={256} frames={1}>
        <Lightformer intensity={3} form="rect" position={[0, 6, -8]} scale={[12, 6, 1]} color="#fff4ea" />
        <Lightformer intensity={1.5} form="rect" position={[-8, 3, 4]} rotation-y={Math.PI / 3} scale={[6, 8, 1]} color="#dbe6ff" />
        <Lightformer intensity={1.2} form="ring" position={[7, -1, 5]} scale={5} color="#ffd9c9" />
        <Lightformer intensity={0.6} form="rect" position={[0, -8, 0]} rotation-x={Math.PI / 2} scale={[12, 12, 1]} color="#5a3a3a" />
      </Environment>
    </>
  )
}

export function Scene() {
  const select = useStore((s) => s.select)
  return (
    <Canvas
      camera={{ position: [0.4, 0.9, 7.2], fov: 38, near: 0.1, far: 100 }}
      dpr={[1, 2]}
      shadows
      gl={{ antialias: true, localClippingEnabled: true, powerPreference: 'high-performance' }}
      onPointerMissed={() => select(null)}
      style={{ background: 'radial-gradient(ellipse at 50% 40%, #182238 0%, #0b0f17 70%)' }}
    >
      <Lights />
      <Suspense fallback={null}>
        <HeartModel />
      </Suspense>
      <Controls />
    </Canvas>
  )
}
