import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, Float, TorusKnot, MeshTransmissionMaterial } from '@react-three/drei';
import * as THREE from 'three';

function LoaderObject() {
  const mesh = useRef(null);

  useFrame((state, delta) => {
    if (mesh.current) {
      mesh.current.rotation.x += delta * 0.5;
      mesh.current.rotation.y += delta * 0.8;
    }
  });

  return (
    <Float speed={2} rotationIntensity={1} floatIntensity={2}>
      <TorusKnot ref={mesh} args={[1, 0.3, 256, 64]} scale={1.2}>
        <MeshTransmissionMaterial
          backside
          samples={4}
          thickness={0.5}
          chromaticAberration={0.2}
          anisotropy={0.3}
          distortion={0.5}
          distortionScale={0.5}
          temporalDistortion={0.1}
          clearcoat={1}
          clearcoatRoughness={0.1}
          roughness={0.1}
          metalness={0.1}
          color="#95BF47" // Brand accent color
        />
      </TorusKnot>
    </Float>
  );
}

export function HyperRealisticLoader() {
  return (
    <div className="w-48 h-48 relative pointer-events-none mb-6">
      <Canvas
        camera={{ position: [0, 0, 5], fov: 45 }}
        gl={{ antialias: true, alpha: true, toneMapping: THREE.ACESFilmicToneMapping }}
        dpr={[1, 2]}
      >
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={2} color="#ffffff" />
        <pointLight position={[-10, -10, -5]} intensity={1} color="#008060" />
        
        <LoaderObject />
        
        <Environment preset="city" />
      </Canvas>
    </div>
  );
}
