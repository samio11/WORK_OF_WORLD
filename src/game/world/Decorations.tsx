import React, { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { useGameStore } from '../../store/useGameStore';
import { getTerrainHeight } from './WorldTerrain';

// Single Cottage procedural mesh group
function Cottage({ pos, rot }: { pos: [number, number, number]; rot: number }) {
  return (
    <group position={pos} rotation={[0, rot, 0]}>
      {/* Wooden Log Foundation */}
      <mesh position={[0, -0.05, 0]} receiveShadow>
        <boxGeometry args={[2.5, 0.15, 2.1]} />
        <meshStandardMaterial color="#3f2305" roughness={0.9} />
      </mesh>

      {/* Main brick/plank walls */}
      <mesh position={[0, 0.65, 0]} castShadow receiveShadow>
        <boxGeometry args={[2.2, 1.3, 1.8]} />
        <meshStandardMaterial color="#d4a373" flatShading roughness={0.8} /> {/* Tan/cream walls */}
      </mesh>

      {/* Sloped Roof Panels (A-Frame) */}
      {/* Left Pitch */}
      <mesh position={[-0.6, 1.5, 0]} rotation={[0, 0, 0.6]} castShadow>
        <boxGeometry args={[1.5, 0.08, 2.1]} />
        <meshStandardMaterial color="#b91c1c" flatShading roughness={0.65} /> {/* Red roof tile color */}
      </mesh>
      {/* Right Pitch */}
      <mesh position={[0.6, 1.5, 0]} rotation={[0, 0, -0.6]} castShadow>
        <boxGeometry args={[1.5, 0.08, 2.1]} />
        <meshStandardMaterial color="#b91c1c" flatShading roughness={0.65} />
      </mesh>

      {/* Door */}
      <mesh position={[0, 0.3, 0.91]} castShadow>
        <boxGeometry args={[0.55, 0.9, 0.04]} />
        <meshStandardMaterial color="#3f2305" roughness={0.95} />
      </mesh>

      {/* Windows */}
      <mesh position={[0.68, 0.52, 0.91]}>
        <boxGeometry args={[0.4, 0.4, 0.03]} />
        <meshStandardMaterial color="#bae6fd" metalness={0.9} roughness={0.1} /> {/* Glass blue */}
      </mesh>
      <mesh position={[-0.68, 0.52, 0.91]}>
        <boxGeometry args={[0.4, 0.4, 0.03]} />
        <meshStandardMaterial color="#bae6fd" metalness={0.9} roughness={0.1} />
      </mesh>

      {/* Brick Chimney */}
      <mesh position={[0.6, 1.6, -0.45]} castShadow>
        <boxGeometry args={[0.22, 0.65, 0.22]} />
        <meshStandardMaterial color="#7f1d1d" flatShading />
      </mesh>
    </group>
  );
}

// Walk-in Market building structure
function TraderShop() {
  return (
    <group>
      {/* Stone Floor Slab */}
      <mesh position={[8, 0.01, 3.2]} receiveShadow>
        <boxGeometry args={[4.0, 0.08, 3.4]} />
        <meshStandardMaterial color="#57534e" roughness={0.8} flatShading />
      </mesh>

      {/* Left brick wall */}
      <mesh position={[6, 1.0, 3.2]} castShadow receiveShadow>
        <boxGeometry args={[0.2, 2.0, 3.4]} />
        <meshStandardMaterial color="#78716c" roughness={0.9} flatShading />
      </mesh>

      {/* Right brick wall */}
      <mesh position={[10, 1.0, 3.2]} castShadow receiveShadow>
        <boxGeometry args={[0.2, 2.0, 3.4]} />
        <meshStandardMaterial color="#78716c" roughness={0.9} flatShading />
      </mesh>

      {/* Back brick wall */}
      <mesh position={[8, 1.0, 1.5]} castShadow receiveShadow>
        <boxGeometry args={[4.0, 2.0, 0.2]} />
        <meshStandardMaterial color="#78716c" roughness={0.9} flatShading />
      </mesh>

      {/* Front wall segments with center doorway (doorway at X = 8, width = 1.2) */}
      <mesh position={[6.7, 1.0, 4.9]} castShadow receiveShadow>
        <boxGeometry args={[1.4, 2.0, 0.2]} />
        <meshStandardMaterial color="#78716c" roughness={0.9} flatShading />
      </mesh>

      <mesh position={[9.3, 1.0, 4.9]} castShadow receiveShadow>
        <boxGeometry args={[1.4, 2.0, 0.2]} />
        <meshStandardMaterial color="#78716c" roughness={0.9} flatShading />
      </mesh>

      {/* Header over doorway */}
      <mesh position={[8, 1.75, 4.9]} castShadow receiveShadow>
        <boxGeometry args={[1.2, 0.5, 0.2]} />
        <meshStandardMaterial color="#78716c" roughness={0.9} flatShading />
      </mesh>

      {/* Shop Counter Table in front of Greg (Greg is at [8, 0, 2.5]) */}
      <mesh position={[8, 0.45, 3.1]} castShadow receiveShadow>
        <boxGeometry args={[2.2, 0.9, 0.5]} />
        <meshStandardMaterial color="#78350f" roughness={0.8} flatShading />
      </mesh>

      {/* Wooden Roof Slab */}
      <mesh position={[8, 2.05, 3.2]} castShadow>
        <boxGeometry args={[4.4, 0.15, 3.8]} />
        <meshStandardMaterial color="#451a03" roughness={0.85} flatShading />
      </mesh>

      {/* Point Light inside building to light up Greg and shelves */}
      <pointLight position={[8, 1.7, 2.8]} intensity={1.5} distance={6} color="#f59e0b" castShadow />

      {/* Shelves on Back Wall */}
      <mesh position={[8, 0.8, 1.65]} castShadow receiveShadow>
        <boxGeometry args={[3.2, 0.05, 0.25]} />
        <meshStandardMaterial color="#a16207" roughness={0.9} />
      </mesh>
      
      <mesh position={[8, 1.3, 1.65]} castShadow receiveShadow>
        <boxGeometry args={[3.2, 0.05, 0.25]} />
        <meshStandardMaterial color="#a16207" roughness={0.9} />
      </mesh>

      {/* Cosmetic item crates on back shelf */}
      <group position={[7.0, 0.9, 1.65]}>
        <mesh castShadow>
          <boxGeometry args={[0.3, 0.15, 0.2]} />
          <meshStandardMaterial color="#854d0e" />
        </mesh>
      </group>
      <group position={[9.0, 0.9, 1.65]}>
        <mesh castShadow>
          <boxGeometry args={[0.35, 0.15, 0.2]} />
          <meshStandardMaterial color="#854d0e" />
        </mesh>
      </group>
      {/* Cosmetic Lantern */}
      <group position={[7.8, 0.92, 1.65]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.06, 0.06, 0.18, 5]} />
          <meshStandardMaterial color="#292524" metalness={0.8} />
        </mesh>
        <mesh position={[0, 0, 0]}>
          <cylinderGeometry args={[0.04, 0.04, 0.1]} />
          <meshBasicMaterial color="#fbbf24" />
        </mesh>
      </group>
    </group>
  );
}

// 3D low-poly Deer model
export function Deer({ pos, rot, state }: { pos: [number, number, number]; rot: number; state: string }) {
  const groupRef = useRef<THREE.Group>(null);
  useFrame((s) => {
    if (groupRef.current) {
      const time = s.clock.getElapsedTime();
      const speedFactor = state === 'flee' ? 2.5 : 0.8;
      // Oscillate Y slightly (hopping or walking bounce)
      groupRef.current.position.y = pos[1] + Math.abs(Math.sin(time * 6.0 * speedFactor)) * 0.08;
    }
  });

  return (
    <group ref={groupRef} position={[pos[0], pos[1], pos[2]]} rotation={[0, rot, 0]}>
      {/* Body */}
      <mesh castShadow receiveShadow position={[0, 0.35, 0]}>
        <boxGeometry args={[0.35, 0.35, 0.75]} />
        <meshStandardMaterial color="#854d0e" flatShading roughness={0.8} />
      </mesh>
      {/* Neck */}
      <mesh castShadow position={[0, 0.6, 0.28]} rotation={[0.4, 0, 0]}>
        <boxGeometry args={[0.16, 0.35, 0.16]} />
        <meshStandardMaterial color="#854d0e" flatShading roughness={0.8} />
      </mesh>
      {/* Head */}
      <mesh castShadow position={[0, 0.78, 0.38]}>
        <boxGeometry args={[0.18, 0.18, 0.26]} />
        <meshStandardMaterial color="#713f12" flatShading roughness={0.8} />
      </mesh>
      {/* Antlers */}
      <mesh position={[0.08, 0.94, 0.34]} rotation={[0.2, 0.2, 0.1]}>
        <boxGeometry args={[0.03, 0.22, 0.03]} />
        <meshStandardMaterial color="#d6d3d1" flatShading />
      </mesh>
      <mesh position={[-0.08, 0.94, 0.34]} rotation={[0.2, -0.2, -0.1]}>
        <boxGeometry args={[0.03, 0.22, 0.03]} />
        <meshStandardMaterial color="#d6d3d1" flatShading />
      </mesh>
      {/* Antler branches */}
      <mesh position={[0.12, 1.0, 0.36]} rotation={[0.4, 0.4, 0.2]}>
        <boxGeometry args={[0.025, 0.1, 0.025]} />
        <meshStandardMaterial color="#d6d3d1" flatShading />
      </mesh>
      <mesh position={[-0.12, 1.0, 0.36]} rotation={[0.4, -0.4, -0.2]}>
        <boxGeometry args={[0.025, 0.1, 0.025]} />
        <meshStandardMaterial color="#d6d3d1" flatShading />
      </mesh>
      {/* Legs (Front-Left) */}
      <mesh castShadow position={[0.12, 0.1, 0.25]}>
        <boxGeometry args={[0.08, 0.3, 0.08]} />
        <meshStandardMaterial color="#543007" flatShading />
      </mesh>
      {/* Legs (Front-Right) */}
      <mesh castShadow position={[-0.12, 0.1, 0.25]}>
        <boxGeometry args={[0.08, 0.3, 0.08]} />
        <meshStandardMaterial color="#543007" flatShading />
      </mesh>
      {/* Legs (Back-Left) */}
      <mesh castShadow position={[0.12, 0.1, -0.25]}>
        <boxGeometry args={[0.08, 0.3, 0.08]} />
        <meshStandardMaterial color="#543007" flatShading />
      </mesh>
      {/* Legs (Back-Right) */}
      <mesh castShadow position={[-0.12, 0.1, -0.25]}>
        <boxGeometry args={[0.08, 0.3, 0.08]} />
        <meshStandardMaterial color="#543007" flatShading />
      </mesh>
      {/* Tail */}
      <mesh position={[0, 0.45, -0.38]} rotation={[-0.3, 0, 0]}>
        <boxGeometry args={[0.08, 0.16, 0.08]} />
        <meshStandardMaterial color="#f8fafc" flatShading />
      </mesh>
    </group>
  );
}

// 3D low-poly Rabbit model
export function Rabbit({ pos, rot, state }: { pos: [number, number, number]; rot: number; state: string }) {
  const groupRef = useRef<THREE.Group>(null);
  useFrame((s) => {
    if (groupRef.current) {
      const time = s.clock.getElapsedTime();
      const speedFactor = state === 'flee' ? 3.0 : 1.2;
      // High frequency hop
      const hop = Math.abs(Math.sin(time * 8.0 * speedFactor)) * 0.18;
      groupRef.current.position.y = pos[1] + hop;
    }
  });

  return (
    <group ref={groupRef} position={[pos[0], pos[1], pos[2]]} rotation={[0, rot, 0]}>
      {/* Body */}
      <mesh castShadow position={[0, 0.1, 0]}>
        <boxGeometry args={[0.18, 0.16, 0.26]} />
        <meshStandardMaterial color="#f1f5f9" flatShading roughness={0.9} />
      </mesh>
      {/* Head */}
      <mesh position={[0, 0.18, 0.1]}>
        <boxGeometry args={[0.13, 0.13, 0.13]} />
        <meshStandardMaterial color="#f8fafc" flatShading />
      </mesh>
      {/* Ears */}
      <mesh position={[0.04, 0.28, 0.08]} rotation={[-0.2, 0, 0.05]}>
        <boxGeometry args={[0.03, 0.14, 0.02]} />
        <meshStandardMaterial color="#f1f5f9" flatShading />
      </mesh>
      <mesh position={[-0.04, 0.28, 0.08]} rotation={[-0.2, 0, -0.05]}>
        <boxGeometry args={[0.03, 0.14, 0.02]} />
        <meshStandardMaterial color="#f1f5f9" flatShading />
      </mesh>
      {/* Pink inner ears */}
      <mesh position={[0.04, 0.28, 0.09]}>
        <boxGeometry args={[0.015, 0.1, 0.005]} />
        <meshStandardMaterial color="#fda4af" />
      </mesh>
      <mesh position={[-0.04, 0.28, 0.09]}>
        <boxGeometry args={[0.015, 0.1, 0.005]} />
        <meshStandardMaterial color="#fda4af" />
      </mesh>
      {/* Nose */}
      <mesh position={[0, 0.16, 0.17]}>
        <boxGeometry args={[0.03, 0.03, 0.02]} />
        <meshStandardMaterial color="#fda4af" />
      </mesh>
      {/* Tail */}
      <mesh position={[0, 0.12, -0.14]}>
        <sphereGeometry args={[0.04, 4, 4]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
    </group>
  );
}

// 3D low-poly Wolf model
export function Wolf({ pos, rot, state }: { pos: [number, number, number]; rot: number; state: string }) {
  const groupRef = useRef<THREE.Group>(null);
  useFrame((s) => {
    if (groupRef.current) {
      const time = s.clock.getElapsedTime();
      const speedFactor = state === 'chase' ? 2.0 : 0.8;
      // Stalking movement or running bounce
      groupRef.current.position.y = pos[1] + Math.abs(Math.sin(time * 5.0 * speedFactor)) * 0.05;
    }
  });

  return (
    <group ref={groupRef} position={[pos[0], pos[1], pos[2]]} rotation={[0, rot, 0]}>
      {/* Body */}
      <mesh castShadow receiveShadow position={[0, 0.3, 0]}>
        <boxGeometry args={[0.3, 0.32, 0.65]} />
        <meshStandardMaterial color="#374151" flatShading roughness={0.7} />
      </mesh>
      {/* Head */}
      <mesh castShadow position={[0, 0.44, 0.28]}>
        <boxGeometry args={[0.22, 0.22, 0.22]} />
        <meshStandardMaterial color="#1f2937" flatShading roughness={0.7} />
      </mesh>
      {/* Snout */}
      <mesh position={[0, 0.39, 0.42]}>
        <boxGeometry args={[0.12, 0.1, 0.16]} />
        <meshStandardMaterial color="#111827" flatShading />
      </mesh>
      {/* Ears */}
      <mesh position={[0.07, 0.58, 0.24]} rotation={[0.2, 0, 0.1]}>
        <boxGeometry args={[0.05, 0.1, 0.04]} />
        <meshStandardMaterial color="#1f2937" />
      </mesh>
      <mesh position={[-0.07, 0.58, 0.24]} rotation={[0.2, 0, -0.1]}>
        <boxGeometry args={[0.05, 0.1, 0.04]} />
        <meshStandardMaterial color="#1f2937" />
      </mesh>
      {/* Glowing red eyes */}
      <mesh position={[0.06, 0.46, 0.37]}>
        <boxGeometry args={[0.03, 0.03, 0.02]} />
        <meshBasicMaterial color="#ef4444" />
      </mesh>
      <mesh position={[-0.06, 0.46, 0.37]}>
        <boxGeometry args={[0.03, 0.03, 0.02]} />
        <meshBasicMaterial color="#ef4444" />
      </mesh>
      {/* Legs (Front-Left) */}
      <mesh castShadow position={[0.1, 0.1, 0.2]}>
        <boxGeometry args={[0.07, 0.22, 0.07]} />
        <meshStandardMaterial color="#111827" flatShading />
      </mesh>
      {/* Legs (Front-Right) */}
      <mesh castShadow position={[-0.1, 0.1, 0.2]}>
        <boxGeometry args={[0.07, 0.22, 0.07]} />
        <meshStandardMaterial color="#111827" flatShading />
      </mesh>
      {/* Legs (Back-Left) */}
      <mesh castShadow position={[0.1, 0.1, -0.2]}>
        <boxGeometry args={[0.07, 0.22, 0.07]} />
        <meshStandardMaterial color="#111827" flatShading />
      </mesh>
      {/* Legs (Back-Right) */}
      <mesh castShadow position={[-0.1, 0.1, -0.2]}>
        <boxGeometry args={[0.07, 0.22, 0.07]} />
        <meshStandardMaterial color="#111827" flatShading />
      </mesh>
      {/* Tail */}
      <mesh position={[0, 0.34, -0.38]} rotation={[-0.4, 0, 0]}>
        <boxGeometry args={[0.06, 0.24, 0.06]} />
        <meshStandardMaterial color="#374151" flatShading />
      </mesh>
    </group>
  );
}

// Low-poly canoe boat near the water edge
function ShoreBoat() {
  return (
    <group position={[-10.2, -0.92, 9.2]} rotation={[0.08, -0.85, 0.08]}>
      {/* Boat bottom base */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[1.8, 0.08, 0.6]} />
        <meshStandardMaterial color="#78350f" flatShading roughness={0.9} />
      </mesh>
      {/* Left Hull side */}
      <mesh position={[0, 0.18, 0.28]} rotation={[0.2, 0, 0]} castShadow>
        <boxGeometry args={[1.8, 0.35, 0.06]} />
        <meshStandardMaterial color="#854d0e" flatShading />
      </mesh>
      {/* Right Hull side */}
      <mesh position={[0, 0.18, -0.28]} rotation={[-0.2, 0, 0]} castShadow>
        <boxGeometry args={[1.8, 0.35, 0.06]} />
        <meshStandardMaterial color="#854d0e" flatShading />
      </mesh>
      {/* pointed bow cap */}
      <mesh position={[0.9, 0.18, 0]} rotation={[0, 0, -0.3]} castShadow>
        <boxGeometry args={[0.12, 0.35, 0.58]} />
        <meshStandardMaterial color="#451a03" flatShading />
      </mesh>
      {/* pointed stern cap */}
      <mesh position={[-0.9, 0.18, 0]} rotation={[0, 0, 0.3]} castShadow>
        <boxGeometry args={[0.12, 0.35, 0.58]} />
        <meshStandardMaterial color="#451a03" flatShading />
      </mesh>
      {/* Row Seat bench */}
      <mesh position={[0, 0.12, 0]} castShadow>
        <boxGeometry args={[0.25, 0.04, 0.52]} />
        <meshStandardMaterial color="#b45309" />
      </mesh>
    </group>
  );
}

// Swimming fish model with wiggling tail
function SwimmingFish({ fish, idx }: { fish: any; idx: number }) {
  const tailRef = useRef<THREE.Mesh>(null);

  // Wag tail back and forth based on frame clocks
  useFrame((state) => {
    if (tailRef.current) {
      const time = state.clock.getElapsedTime();
      // Fast wiggles
      tailRef.current.rotation.y = Math.sin(time * 16.0 + idx * 0.7) * 0.42;
    }
  });

  return (
    <group position={fish.position} rotation={[0, fish.targetAngle, 0]}>
      {/* Fish Body */}
      <mesh castShadow>
        <boxGeometry args={[0.08, 0.06, 0.22]} />
        <meshStandardMaterial color={fish.color} roughness={0.3} flatShading />
      </mesh>
      {/* Eyes */}
      <mesh position={[0.05, 0.01, 0.08]}>
        <sphereGeometry args={[0.015, 3, 3]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
      <mesh position={[-0.05, 0.01, 0.08]}>
        <sphereGeometry args={[0.015, 3, 3]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
      
      {/* Wiggling Tail Fin */}
      <mesh ref={tailRef} position={[0, 0, -0.15]}>
        {/* Tail base pivot cylinder */}
        <cylinderGeometry args={[0.01, 0.01, 0.06, 4]} />
        <meshStandardMaterial color={fish.color} />
        {/* actual tail wedge */}
        <mesh position={[0, 0, -0.06]} rotation={[0, 0, Math.PI / 2]}>
          <coneGeometry args={[0.05, 0.12, 3]} />
          <meshStandardMaterial color={fish.color} roughness={0.3} flatShading />
        </mesh>
      </mesh>
    </group>
  );
}

export default function Decorations() {
  const lakeFish = useGameStore((state) => state.lakeFish);

  // Houses heights matching ground heights
  const cottages = useMemo(() => {
    const coords: Array<{ p: [number, number, number]; r: number }> = [
      { p: [3.5, getTerrainHeight(3.5, 5.5) + 0.1, 5.5], r: 0 }, // Near Trader Greg
      { p: [8.5, getTerrainHeight(8.5, 11.5) + 0.1, 11.5], r: Math.PI / 6 },
      { p: [1.8, getTerrainHeight(1.8, 12.8) + 0.1, 12.8], r: -Math.PI / 4 },
    ];
    return coords;
  }, []);

  return (
    <group>
      {/* Cottages in Village */}
      {cottages.map((c, idx) => (
        <Cottage key={idx} pos={c.p} rot={c.r} />
      ))}

      {/* Trader Greg Kiosk */}
      <TraderShop />

      {/* Canoes */}
      <ShoreBoat />

      {/* Swimming Lake Fish */}
      {lakeFish.map((fish, idx) => (
        <SwimmingFish key={fish.id} fish={fish} idx={idx} />
      ))}
    </group>
  );
}
