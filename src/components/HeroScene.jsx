import { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { MeshDistortMaterial, Float, Torus, Sphere, Box, MeshWobbleMaterial } from '@react-three/drei'
import * as THREE from 'three'

function FloatingOrb({ position, color, size, speed }) {
  const mesh = useRef(null)
  useFrame(({ clock }) => {
    if (!mesh.current) return
    mesh.current.rotation.x = clock.getElapsedTime() * speed * 0.4
    mesh.current.rotation.y = clock.getElapsedTime() * speed * 0.6
  })
  return (
    <Float speed={speed} rotationIntensity={0.4} floatIntensity={1.2}>
      <mesh ref={mesh} position={position}>
        <sphereGeometry args={[size, 32, 32]} />
        <MeshDistortMaterial color={color} distort={0.35} speed={2} roughness={0.1} metalness={0.5} />
      </mesh>
    </Float>
  )
}

function FloatingRing({ position, color, speed }) {
  const mesh = useRef(null)
  useFrame(({ clock }) => {
    if (!mesh.current) return
    mesh.current.rotation.x = clock.getElapsedTime() * speed * 0.5 + 1
    mesh.current.rotation.z = clock.getElapsedTime() * speed * 0.3
  })
  return (
    <Float speed={speed * 0.8} floatIntensity={0.8}>
      <mesh ref={mesh} position={position}>
        <torusGeometry args={[0.5, 0.12, 16, 60]} />
        <meshStandardMaterial color={color} roughness={0.05} metalness={0.9} />
      </mesh>
    </Float>
  )
}

function FloatingCube({ position, color, speed }) {
  const mesh = useRef(null)
  useFrame(({ clock }) => {
    if (!mesh.current) return
    mesh.current.rotation.x = clock.getElapsedTime() * speed * 0.5
    mesh.current.rotation.y = clock.getElapsedTime() * speed * 0.7
  })
  return (
    <Float speed={speed} floatIntensity={1.5} rotationIntensity={0.3}>
      <mesh ref={mesh} position={position}>
        <boxGeometry args={[0.4, 0.4, 0.4]} />
        <MeshWobbleMaterial color={color} factor={0.15} speed={1.5} roughness={0.1} metalness={0.7} />
      </mesh>
    </Float>
  )
}

function Particles() {
  const count = 80
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 14
      arr[i * 3 + 1] = (Math.random() - 0.5) * 8
      arr[i * 3 + 2] = (Math.random() - 0.5) * 6
    }
    return arr
  }, [])

  const points = useRef(null)
  useFrame(({ clock }) => {
    if (points.current) {
      points.current.rotation.y = clock.getElapsedTime() * 0.03
      points.current.rotation.x = clock.getElapsedTime() * 0.01
    }
  })

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.04} color="#a5b4fc" transparent opacity={0.7} sizeAttenuation />
    </points>
  )
}

function CentralSphere() {
  const mesh = useRef(null)
  useFrame(({ clock }) => {
    if (!mesh.current) return
    mesh.current.rotation.y = clock.getElapsedTime() * 0.15
    mesh.current.rotation.z = Math.sin(clock.getElapsedTime() * 0.4) * 0.05
  })
  return (
    <mesh ref={mesh} position={[0, 0, 0]}>
      <icosahedronGeometry args={[1.4, 1]} />
      <MeshDistortMaterial
        color="#4338ca"
        distort={0.25}
        speed={1.5}
        roughness={0}
        metalness={0.8}
        transparent
        opacity={0.9}
      />
    </mesh>
  )
}

export function HeroScene() {
  return (
    <Canvas
      camera={{ position: [0, 0, 6], fov: 50 }}
      gl={{ antialias: true, alpha: true }}
      style={{ background: 'transparent' }}
    >
      <ambientLight intensity={0.3} />
      <pointLight position={[4, 4, 4]} intensity={2} color="#818cf8" />
      <pointLight position={[-4, -2, 2]} intensity={1.5} color="#c7d2fe" />
      <pointLight position={[0, -4, 2]} intensity={1} color="#6366f1" />
      <spotLight position={[0, 8, 4]} intensity={1} color="white" angle={0.4} penumbra={0.8} />

      <CentralSphere />
      <Particles />

      <FloatingOrb position={[-3.2, 1.5, -1]} color="#818cf8" size={0.55} speed={1.2} />
      <FloatingOrb position={[3.5, -1.2, -0.5]} color="#6366f1" size={0.4} speed={0.9} />
      <FloatingOrb position={[2.8, 2, -2]} color="#a5b4fc" size={0.3} speed={1.5} />
      <FloatingOrb position={[-2.5, -2, -1]} color="#4f46e5" size={0.45} speed={0.8} />

      <FloatingRing position={[-1.8, 2.2, 0]} color="#c7d2fe" speed={1.1} />
      <FloatingRing position={[2.2, -2.5, -1]} color="#818cf8" speed={0.7} />
      <FloatingRing position={[3.8, 0.5, -2]} color="#6366f1" speed={1.4} />

      <FloatingCube position={[-3.5, -0.8, 0]} color="#4338ca" speed={1} />
      <FloatingCube position={[1.5, 3, -1.5]} color="#a5b4fc" speed={1.3} />
      <FloatingCube position={[-1, -3, -0.5]} color="#818cf8" speed={0.8} />
    </Canvas>
  )
}
