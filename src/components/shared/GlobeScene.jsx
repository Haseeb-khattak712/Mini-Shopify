import React, { useRef, useEffect, useState, useMemo } from 'react';
import Globe from 'react-globe.gl';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { Canvas, useFrame } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';

const CITIES = [
  { name: 'New York', lat: 40.7128, lng: -74.0060, active: true, event: 'New Order' },
  { name: 'London', lat: 51.5074, lng: -0.1278, active: true, event: 'Store Created' },
  { name: 'Tokyo', lat: 35.6762, lng: 139.6503, active: true, event: 'Revenue Increased' },
  { name: 'Singapore', lat: 1.3521, lng: 103.8198, active: false },
  { name: 'Dubai', lat: 25.2048, lng: 55.2708, active: true, event: 'Customer Joined' },
  { name: 'Sydney', lat: -33.8688, lng: 151.2093, active: false },
  { name: 'São Paulo', lat: -23.5505, lng: -46.6333, active: true, event: 'International Shipment' },
  { name: 'San Francisco', lat: 37.7749, lng: -122.4194, active: false },
  { name: 'Paris', lat: 48.8566, lng: 2.3522, active: false },
  { name: 'Frankfurt', lat: 50.1109, lng: 8.6821, active: false },
  { name: 'Hong Kong', lat: 22.3193, lng: 114.1694, active: false },
  { name: 'Mumbai', lat: 19.0760, lng: 72.8777, active: false },
  { name: 'Toronto', lat: 43.6510, lng: -79.3470, active: false },
  { name: 'Seoul', lat: 37.5665, lng: 126.9780, active: false },
  { name: 'Amsterdam', lat: 52.3676, lng: 4.9041, active: false },
  { name: 'Shanghai', lat: 31.2304, lng: 121.4737, active: false },
  { name: 'Los Angeles', lat: 34.0522, lng: -118.2437, active: false },
  { name: 'Karachi', lat: 24.8607, lng: 67.0011, active: false },
];

function Starfield() {
  const count = 3500; // Reduced for performance

  // Generate a hyper-realistic star texture: extremely sharp core, tiny subtle glow
  const starTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext('2d');

    // Core of the star: sharp and pinpoint to look like realistic stars in deep space
    let gradient = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
    gradient.addColorStop(0, 'rgba(255,255,255,1)');
    gradient.addColorStop(0.05, 'rgba(255,255,255,0.8)'); // Sharp core
    gradient.addColorStop(0.15, 'rgba(255,255,255,0.05)'); // Very faint, tight halo
    gradient.addColorStop(1, 'rgba(0,0,0,0)');

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 32, 32);

    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    return texture;
  }, []);

  const { positions, colors, sizes } = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const cols = new Float32Array(count * 3);
    const sz = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      // Fill the entire space evenly, gently denser in the center
      const r = Math.pow(Math.random(), 1.2) * 120; // Slightly tighter radius for higher density
      const theta = Math.random() * 2 * Math.PI;
      const phi = Math.acos(2 * Math.random() - 1);

      const x = r * Math.sin(phi) * Math.cos(theta);
      const y = r * Math.sin(phi) * Math.sin(theta);
      const z = r * Math.cos(phi) - 5;

      pos[i * 3] = x;
      pos[i * 3 + 1] = y;
      pos[i * 3 + 2] = z;

      // Photorealistic deep-space star colors
      const colorType = Math.random();
      const color = new THREE.Color();
      if (colorType > 0.99) color.setHex(0x95BF47);
      else if (colorType > 0.8) color.setHex(0xa3c2ff);
      else if (colorType > 0.6) color.setHex(0xffd2a1);
      else if (colorType > 0.4) color.setHex(0xfff4e8);
      else color.setHex(0xffffff);

      cols[i * 3] = color.r;
      cols[i * 3 + 1] = color.g;
      cols[i * 3 + 2] = color.b;

      // Size variation: biased towards small but still very visible
      sz[i] = Math.pow(Math.random(), 2) * 2.5 + 0.4;
    }
    return { positions: pos, colors: cols, sizes: sz };
  }, []);

  const pointsRef = useRef(null);

  useEffect(() => {
    return () => {
      if (starTexture) starTexture.dispose();
    }
  }, [starTexture]);

  useFrame((state) => {
    if (!pointsRef.current) return;
    pointsRef.current.rotation.y = state.clock.getElapsedTime() * 0.003;
    pointsRef.current.rotation.x = Math.sin(state.clock.getElapsedTime() * 0.002) * 0.02;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
        <bufferAttribute attach="attributes-color" count={count} array={colors} itemSize={3} />
        <bufferAttribute attach="attributes-size" count={count} array={sizes} itemSize={1} />
      </bufferGeometry>
      <pointsMaterial
        size={0.07}
        vertexColors
        transparent
        depthWrite={false}
        opacity={1}
        blending={THREE.AdditiveBlending}
        sizeAttenuation={true}
        map={starTexture}
      />
    </points>
  );
}

export function GlobeScene() {
  const globeRef = useRef();
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const containerRef = useRef(null);
  const [earthModel, setEarthModel] = useState(null);

  useEffect(() => {
    const loader = new GLTFLoader();
    loader.load('/earth_planet.glb', (gltf) => {
      const box = new THREE.Box3().setFromObject(gltf.scene);
      const size = box.getSize(new THREE.Vector3());
      const maxDim = Math.max(size.x, size.y, size.z);

      const scale = 200 / maxDim;
      gltf.scene.scale.set(scale, scale, scale);

      const center = box.getCenter(new THREE.Vector3());
      gltf.scene.position.x = -center.x * scale;
      gltf.scene.position.y = -center.y * scale;
      // Premium Photorealistic Material Enhancements (4K Optimizations)
      gltf.scene.traverse((child) => {
        if (child.isMesh && child.material) {
          // Upgrade to PBR properties if not already, or just tweak existing ones
          child.material.metalness = Math.max(0.4, child.material.metalness || 0);
          child.material.roughness = Math.min(0.6, child.material.roughness || 1);
          child.material.envMapIntensity = 2.0; // Boost reflections

          if (child.material.map) {
            child.material.map.anisotropy = 16; // 4K Texture filtering
          }

          // Apply a subtle deep emerald-blue tone (#021a24) to enhance the oceans/dark areas
          const tint = new THREE.Color('#021a24');
          child.material.color.lerp(tint, 0.2); // 20% blend

          // Enable better shadow/lighting interaction
          child.receiveShadow = true;
          child.castShadow = true;
        }
      });

      setEarthModel(gltf.scene);
    });
  }, []);

  useEffect(() => {
    if (globeRef.current && earthModel) {
      const scene = globeRef.current.scene();

      const ambientGlow = new THREE.AmbientLight('#042F26', 0.8);
      scene.add(ambientGlow);

      const rimLight = new THREE.DirectionalLight('#95BF47', 1.5);
      rimLight.position.set(-100, 100, -100);
      scene.add(rimLight);

      // Add subtle orbital rings with hyperrealistic high-poly resolution
      const ring1Geo = new THREE.TorusGeometry(125, 0.1, 64, 256);
      const ring1Mat = new THREE.MeshBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0.15 });
      const ring1 = new THREE.Mesh(ring1Geo, ring1Mat);
      ring1.rotation.x = Math.PI / 2;

      const ring2Geo = new THREE.TorusGeometry(140, 0.05, 64, 256);
      const ring2Mat = new THREE.MeshBasicMaterial({ color: '#95BF47', transparent: true, opacity: 0.2 });
      const ring2 = new THREE.Mesh(ring2Geo, ring2Mat);
      ring2.rotation.x = Math.PI / 3;
      ring2.rotation.y = Math.PI / 4;

      scene.add(ring1);
      scene.add(ring2);
      scene.add(earthModel);

      return () => {
        scene.remove(earthModel);
        scene.remove(ambientGlow);
        scene.remove(rimLight);
        scene.remove(ring1);
        scene.remove(ring2);
      };
    }
  }, [earthModel, dimensions.width]);

  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight
        });
      }
    };
    setTimeout(updateSize, 100);
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  useEffect(() => {
    if (globeRef.current) {
      // Force hyperrealistic 4K rendering if supported by the display
      try {
        const renderer = globeRef.current.renderer();
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.antialias = true;
      } catch (e) {
        // Ignore if renderer not exposed directly
      }

      const controls = globeRef.current.controls();
      controls.autoRotate = true;
      controls.autoRotateSpeed = 0.5; // Slow, luxurious rotation
      controls.enableZoom = false;
      globeRef.current.pointOfView({ altitude: 2 }, 0);
    }
  }, [dimensions.width]);

  // Generate elegant thin routes between commerce hubs
  const arcsData = useMemo(() => {
    const data = [];
    const colors = ['#95BF47', '#008060', '#ffffff', '#042F26'];
    for (let i = 0; i < 40; i++) {
      const from = CITIES[Math.floor(Math.random() * CITIES.length)];
      let to = CITIES[Math.floor(Math.random() * CITIES.length)];
      while (from === to) {
        to = CITIES[Math.floor(Math.random() * CITIES.length)];
      }
      data.push({
        startLat: from.lat,
        startLng: from.lng,
        endLat: to.lat,
        endLng: to.lng,
        color: colors[Math.floor(Math.random() * colors.length)],
        animateTime: 3000 + Math.random() * 3000
      });
    }
    return data;
  }, []);

  const htmlElementsData = useMemo(() => CITIES.filter(c => c.active), []);

  return (
    <div ref={containerRef} className="relative w-full h-full">

      {/* Deep space void with realistic tiny stars */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200vw] h-[200vh] z-0 pointer-events-none">
        <Canvas dpr={[1, 2]} camera={{ position: [0, 0, 10], fov: 45 }} gl={{ alpha: true, antialias: true }}>
          <Starfield />
        </Canvas>
      </div>

      <div className="relative z-10 w-full h-full cursor-grab active:cursor-grabbing flex items-center justify-center">
        {dimensions.width > 0 && (
          <Globe
            ref={globeRef}
            width={dimensions.width}
            height={dimensions.height}
            backgroundColor="rgba(0,0,0,0)"
            globeImageUrl={earthModel ? null : "//unpkg.com/three-globe/example/img/earth-night.jpg"}
            showGlobe={!earthModel}
            showAtmosphere={true}
            atmosphereColor="#042F26"
            atmosphereAltitude={0.25}

            // Hubs
            pointsData={CITIES}
            pointColor={() => '#95BF47'}
            pointAltitude={0.01}
            pointRadius={0.4}

            // Ripples
            ringsData={CITIES}
            ringColor={() => t => `rgba(149, 191, 71, ${Math.max(0, 1 - t)})`}
            ringMaxRadius={2.5}
            ringPropagationSpeed={0.8}
            ringRepeatPeriod={1500}

            // Logical routes (Hyperrealistic 4k smooth curves)
            arcsData={arcsData}
            arcColor="color"
            arcDashLength={0.15}
            arcDashGap={0.85}
            arcDashAnimateTime={d => d.animateTime}
            arcStroke={0.15} // Thin, elegant lines
            arcCircularResolution={64} // 4K geometry subdivision for perfectly smooth arcs

            // Holographic UI elements
            htmlElementsData={htmlElementsData}
            htmlElement={d => {
              const el = document.createElement('div');
              el.innerHTML = `
                <div class="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 backdrop-blur-md border border-white/10 shadow-xl shadow-black/20 pointer-events-none whitespace-nowrap transform -translate-x-1/2 -translate-y-full mb-2">
                  <div class="w-1.5 h-1.5 rounded-full bg-shop-accent animate-pulse"></div>
                  <span class="text-white text-[10px] font-semibold uppercase tracking-wider">${d.event}</span>
                  <span class="text-white/40 text-xs mx-1">•</span>
                  <span class="text-white/80 text-xs font-medium">${d.name}</span>
                </div>
              `;
              return el;
            }}
          />
        )}
      </div>
    </div>
  );
}
