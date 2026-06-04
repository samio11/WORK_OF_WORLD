import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

// Simple pseudo-random height generator for low-poly look
export function getTerrainHeight(x: number, z: number): number {
  // Lake area (center-left)
  const lakeDist = Math.hypot(x - (-18), z - 8);
  if (lakeDist < 16) {
    // Depress the lake floor
    const factor = Math.max(0, 1 - lakeDist / 16);
    return -2.5 - factor * 3.5;
  }

  // Mount Fuji Conical Peak (North-East, around x: 35, z: -35)
  const fujiDist = Math.hypot(x - 35, z - (-35));
  if (fujiDist < 20) {
    const factor = Math.max(0, 1 - fujiDist / 20);
    const coneHeight = factor * 14.5;
    // Volcanic crater indentation at the top
    const craterFactor = fujiDist < 2.0 ? Math.max(0, 1 - fujiDist / 2.0) * 1.8 : 0;
    return 3.0 + coneHeight - craterFactor + Math.sin(x * 0.2) * Math.cos(z * 0.2) * 0.3;
  }

  // Mountain area (east hills: x > 20, z > 15)
  if (x > 18 && z > 12) {
    const hillFactor = Math.min(1.0, (x - 18) / 10 + (z - 12) / 10);
    const noise = Math.sin(x * 0.4) * Math.cos(z * 0.4) * 2.0;
    return 4.0 + hillFactor * 10.0 + noise;
  }

  // General undulating landscape
  let height = Math.sin(x * 0.15) * Math.cos(z * 0.15) * 1.8;
  height += Math.sin(x * 0.05) * 1.2;

  // Ocean zone (North-West, x < -12 && z < -12)
  if (x < -12 && z < -12) {
    const depthX = -12 - x;
    const depthZ = -12 - z;
    const dist = Math.min(depthX, depthZ);
    const shoreTransition = Math.min(1.0, dist / 8.0);
    const oceanFloor = -9.0;
    return THREE.MathUtils.lerp(height, oceanFloor, shoreTransition);
  }
  
  // Power plant plateau (center-east, around x: 12, z: -10)
  const ppDist = Math.hypot(x - 12, z - (-10));
  if (ppDist < 10) {
    const factor = Math.max(0, 1 - ppDist / 10);
    return THREE.MathUtils.lerp(height, 0.5, factor);
  }

  // Big Market flat region (around x: -6, z: -12)
  const mDist = Math.hypot(x - (-6), z - (-12));
  if (mDist < 7) {
    const factor = Math.max(0, 1 - mDist / 7);
    return THREE.MathUtils.lerp(height, 0.2, factor);
  }

  // Village flat region (around x: 5, z: 8)
  const vDist = Math.hypot(x - 5, z - 8);
  if (vDist < 12) {
    const factor = Math.max(0, 1 - vDist / 12);
    return THREE.MathUtils.lerp(height, 0.0, factor);
  }

  return height;
}

export default function WorldTerrain() {
  const size = 120; // Size of map
  const segments = 60; // Segment density for low-poly look

  const terrainData = useMemo(() => {
    const geometry = new THREE.PlaneGeometry(size, size, segments, segments);
    geometry.rotateX(-Math.PI / 2); // Make it horizontal (XZ plane)

    const pos = geometry.attributes.position;
    const colors: number[] = [];

    // Loop through vertices and set height and color
    for (let i = 0; i < pos.count; i++) {
      const vx = pos.getX(i);
      const vz = pos.getZ(i);
      
      const vy = getTerrainHeight(vx, vz);
      pos.setY(i, vy);

      // 1. Village plaza checkerboard stones
      const vDist = Math.hypot(vx - 5, vz - 8);

      // 2. Power plant concrete foundation
      const ppDist = Math.hypot(vx - 12, vz - (-10));

      // 3. Check proximity to winding pathways
      const distToSegment = (px: number, pz: number, ax: number, az: number, bx: number, bz: number) => {
        const l2 = (ax - bx) ** 2 + (az - bz) ** 2;
        if (l2 === 0) return Math.hypot(px - ax, pz - az);
        let t = ((px - ax) * (bx - ax) + (pz - az) * (bz - az)) / l2;
        t = Math.max(0, Math.min(1, t));
        return Math.hypot(px - (ax + t * (bx - ax)), pz - (az + t * (bz - az)));
      };

      const path1 = distToSegment(vx, vz, 0, 0, 5, 8); // Spawn to Village
      const path2 = distToSegment(vx, vz, 5, 8, 12, -10); // Village to Power Plant
      const path3 = distToSegment(vx, vz, 0, 0, -8, 8); // Spawn to lake shore
      const isOnPath = Math.min(path1, path2, path3) < 1.3;

      const color = new THREE.Color();

      if (vDist < 8.2 && vy > -0.5) {
        // Tiled village cobblestones
        const tile = (Math.floor(vx * 1.6) + Math.floor(vz * 1.6)) % 2 === 0;
        color.set(tile ? '#94a3b8' : '#78716c');
      } else if (Math.hypot(vx - (-6), vz - (-12)) < 5.5 && vy > -0.5) {
        // Big Market concrete slab
        const tile = (Math.floor(vx) + Math.floor(vz)) % 2 === 0;
        color.set(tile ? '#475569' : '#334155');
      } else if (ppDist < 7.5 && vy > -0.5) {
        // Dark concrete industrial pad
        const tile = (Math.floor(vx) + Math.floor(vz)) % 2 === 0;
        color.set(tile ? '#27272a' : '#1e1b4b');
      } else if (Math.hypot(vx - 35, vz - (-35)) < 18) {
        // Mount Fuji Custom Coloring
        const fDist = Math.hypot(vx - 35, vz - (-35));
        if (fDist < 4.2) {
          // Snowcap
          color.set('#f8fafc');
          color.lerp(new THREE.Color('#cbd5e1'), Math.random() * 0.12);
        } else if (fDist < 10.0) {
          // Volcano dark stone gray/blue
          color.set('#1e293b');
          color.lerp(new THREE.Color('#334155'), Math.random() * 0.15);
        } else {
          // Transition stone
          color.set('#475569');
          color.lerp(new THREE.Color('#14532d'), (fDist - 10.0) / 8.0); // fade to green
        }
      } else if (vx < -12 && vz < -12) {
        // Ocean bed coloring transitioning from sand to dark blue/black depth
        const depth = Math.min(-12 - vx, -12 - vz);
        const colorVal = Math.min(1.0, depth / 15.0);
        const sandColor = new THREE.Color('#94a3b8');
        const deepColor = new THREE.Color('#020617');
        color.copy(sandColor).lerp(deepColor, colorVal);
      } else if (isOnPath && vy > -0.5) {
        // Sand-gravel pathway
        color.set('#dcd6cd');
        color.lerp(new THREE.Color('#b5a99a'), Math.random() * 0.15);
      } else {
        // Height-based foliage regions
        if (vy < -1.8) {
          // Deep lake floor
          color.setHSL(0.58, 0.45, 0.18 + Math.random() * 0.04);
        } else if (vy < -0.8) {
          // Wet sand beach shore
          color.setHSL(0.12, 0.42, 0.45 + Math.random() * 0.05);
        } else if (vy < 0.2) {
          // Meadow grass
          color.setHSL(0.28, 0.52, 0.38 + Math.random() * 0.05);
        } else if (vy < 5.0) {
          // Thick forest grass
          color.setHSL(0.32, 0.58, 0.29 + Math.random() * 0.04);
        } else if (vy < 10.0) {
          // Mountain rocks
          color.setHSL(0.06, 0.12, 0.35 + Math.random() * 0.05);
        } else {
          // White snowpeaks
          color.setHSL(0.0, 0.0, 0.82 + Math.random() * 0.08);
        }
      }

      colors.push(color.r, color.g, color.b);
    }

    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    geometry.computeVertexNormals();

    return geometry;
  }, []);

  // Water Animation
  const waterRef = useRef<THREE.Mesh>(null);
  const oceanWaterRef = useRef<THREE.Mesh>(null);
  const oceanFoamRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    if (waterRef.current) {
      waterRef.current.position.y = -1.2 + Math.sin(time * 1.2) * 0.08;
    }
    if (oceanWaterRef.current) {
      // Wind-blown rolling waves in the ocean
      oceanWaterRef.current.position.y = -1.2 + Math.sin(time * 0.8) * 0.18 + Math.cos(time * 1.4) * 0.05;
      oceanWaterRef.current.rotation.x = -Math.PI / 2 + Math.sin(time * 0.5) * 0.008;
      oceanWaterRef.current.rotation.y = Math.cos(time * 0.4) * 0.008;
    }
    if (oceanFoamRef.current) {
      // Offset foam phase
      oceanFoamRef.current.position.y = -1.26 + Math.cos(time * 0.8) * 0.18 + Math.sin(time * 1.4) * 0.05;
      oceanFoamRef.current.rotation.x = -Math.PI / 2 + Math.cos(time * 0.5) * 0.006;
    }
  });

  return (
    <group>
      {/* Ground Mesh */}
      <mesh geometry={terrainData} castShadow receiveShadow>
        <meshStandardMaterial
          vertexColors
          roughness={0.85}
          metalness={0.05}
          flatShading={true}
        />
      </mesh>

      {/* Lake Water Plane */}
      <mesh
        ref={waterRef}
        position={[-18, -1.2, 8]}
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
      >
        <circleGeometry args={[16.2, 32]} />
        <meshStandardMaterial
          color="#1d4ed8"
          roughness={0.1}
          metalness={0.8}
          transparent={true}
          opacity={0.65}
          flatShading={true}
        />
      </mesh>

      {/* Shallow Shore Foam Ring Layer */}
      <mesh
        position={[-18, -1.28, 8]}
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
      >
        <circleGeometry args={[17.2, 32]} />
        <meshStandardMaterial
          color="#93c5fd"
          roughness={0.3}
          transparent={true}
          opacity={0.4}
          flatShading={true}
        />
      </mesh>

      {/* Ocean Water Plane (NW Quadrant) */}
      <mesh
        ref={oceanWaterRef}
        position={[-35, -1.2, -35]}
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
      >
        <planeGeometry args={[50, 50]} />
        <meshStandardMaterial
          color="#041d3d" // Deep dark blue ocean color
          roughness={0.05}
          metalness={0.9}
          transparent={true}
          opacity={0.78}
          flatShading={true}
        />
      </mesh>

      {/* Ocean Foam/Wind-Swell Plane Layer */}
      <mesh
        ref={oceanFoamRef}
        position={[-35, -1.26, -35]}
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
      >
        <planeGeometry args={[51, 51]} />
        <meshStandardMaterial
          color="#1e40af" // Swell blue-green foam color
          roughness={0.25}
          transparent={true}
          opacity={0.38}
          flatShading={true}
        />
      </mesh>
    </group>
  );
}
