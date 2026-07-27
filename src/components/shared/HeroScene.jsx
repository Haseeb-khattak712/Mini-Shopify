import { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Float, RoundedBox, Html, Environment } from '@react-three/drei'
import * as THREE from 'three'

// Main Floating Dashboard
function Dashboard({ position }) {
  const mesh = useRef(null)
  
  useFrame(({ clock }) => {
    if (!mesh.current) return
    // Very slow, subtle rotation
    mesh.current.rotation.y = Math.sin(clock.getElapsedTime() * 0.2) * 0.1 - 0.2
    mesh.current.rotation.x = Math.cos(clock.getElapsedTime() * 0.2) * 0.05 + 0.1
  })

  return (
    <Float speed={1.5} rotationIntensity={0.2} floatIntensity={1.2}>
      <group ref={mesh} position={position}>
        {/* Main Dashboard Base */}
        <RoundedBox args={[5, 3.5, 0.2]} radius={0.15} smoothness={4} castShadow>
          <meshPhysicalMaterial 
            color="#ffffff" 
            metalness={0.1}
            roughness={0.2}
            clearcoat={1}
            clearcoatRoughness={0.1}
          />
        </RoundedBox>
        
        {/* Dashboard Header Bar */}
        <RoundedBox args={[4.6, 0.4, 0.1]} radius={0.05} position={[0, 1.3, 0.15]}>
          <meshStandardMaterial color="#F6F7F8" />
        </RoundedBox>

        {/* Dashboard Content Blocks */}
        <RoundedBox args={[3, 2, 0.1]} radius={0.1} position={[-0.8, -0.2, 0.15]}>
          <meshStandardMaterial color="#E8F5E9" />
        </RoundedBox>
        
        <RoundedBox args={[1.2, 0.9, 0.1]} radius={0.1} position={[1.5, 0.35, 0.15]}>
          <meshStandardMaterial color="#004C3F" />
        </RoundedBox>
        
        <RoundedBox args={[1.2, 0.9, 0.1]} radius={0.1} position={[1.5, -0.75, 0.15]}>
          <meshStandardMaterial color="#95BF47" />
        </RoundedBox>
      </group>
    </Float>
  )
}

// Orbiting Cards
function OrbitingCard({ orbitRadius, orbitSpeed, cardArgs, positionOffset, startAngle = 0, color = '#ffffff' }) {
  const group = useRef(null)
  
  useFrame(({ clock }) => {
    if (!group.current) return
    const t = clock.getElapsedTime() * orbitSpeed + startAngle
    group.current.position.x = Math.cos(t) * orbitRadius + positionOffset[0]
    group.current.position.z = Math.sin(t) * orbitRadius + positionOffset[2]
    // Keep it always facing slightly forward
    group.current.rotation.y = Math.sin(t * 0.5) * 0.2
  })

  return (
    <group ref={group} position={positionOffset}>
      <Float speed={2} rotationIntensity={0.5} floatIntensity={1.5}>
        <RoundedBox args={cardArgs} radius={0.1} smoothness={4}>
          <meshPhysicalMaterial 
            color={color} 
            metalness={0.1}
            roughness={0.2}
            clearcoat={1}
          />
        </RoundedBox>
      </Float>
    </group>
  )
}

function Particles() {
  const count = 50
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 15
      arr[i * 3 + 1] = (Math.random() - 0.5) * 10
      arr[i * 3 + 2] = (Math.random() - 0.5) * 8
    }
    return arr
  }, [])

  const points = useRef(null)
  useFrame(({ clock }) => {
    if (points.current) {
      points.current.rotation.y = clock.getElapsedTime() * 0.02
      points.current.position.y = Math.sin(clock.getElapsedTime() * 0.1) * 0.5
    }
  })

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.06} color="#008060" transparent opacity={0.4} sizeAttenuation />
    </points>
  )
}

export function HeroScene() {
  return (
    <Canvas
      camera={{ position: [0, 0, 7], fov: 45 }}
      gl={{ antialias: true, alpha: true }}
      style={{ background: 'transparent' }}
    >
      <ambientLight intensity={0.6} />
      {/* Soft directional lights matching the brand palette */}
      <directionalLight position={[5, 5, 5]} intensity={1.2} color="#ffffff" />
      <directionalLight position={[-5, 3, -5]} intensity={0.8} color="#008060" />
      <pointLight position={[0, -2, 3]} intensity={0.5} color="#95BF47" />

      <Dashboard position={[1, 0, 0]} />
      
      {/* Small floating analytics cards */}
      <OrbitingCard 
        orbitRadius={4} 
        orbitSpeed={0.2} 
        cardArgs={[1.2, 1.2, 0.15]} 
        positionOffset={[1, 1, -1]} 
        startAngle={0} 
        color="#ffffff"
      />
      <OrbitingCard 
        orbitRadius={3.5} 
        orbitSpeed={-0.15} 
        cardArgs={[1.5, 0.8, 0.15]} 
        positionOffset={[1, -1.5, -0.5]} 
        startAngle={Math.PI} 
        color="#F6F7F8"
      />
      
      <Particles />
      <Environment preset="city" />
    </Canvas>
  )
}
