import { Suspense, useEffect, useRef } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
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
      <ambientLight intensity={0.55} />
      <hemisphereLight args={['#dfe7ff', '#3a2a2a', 0.55]} />
      <directionalLight position={[5, 8, 7]} intensity={1.9} color="#fff4ea" />
      <directionalLight position={[-6, 3, -4]} intensity={0.6} color="#9fb4ff" />
      <directionalLight position={[0, -6, 5]} intensity={0.35} color="#ffd8c8" />
    </>
  )
}

export function Scene() {
  const select = useStore((s) => s.select)
  return (
    <Canvas
      camera={{ position: [0.4, 0.9, 7.2], fov: 38, near: 0.1, far: 100 }}
      dpr={[1, 2]}
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
