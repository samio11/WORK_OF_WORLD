import React, { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import { useGameStore } from '../../store/useGameStore';
import { getTerrainHeight } from './WorldTerrain';
import { RideableCar, RideableShip } from '../../types/game';

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
function SwimmingFish({ fish, idx, tailRef }: { fish: any; idx: number; tailRef: (el: THREE.Mesh | null) => void }) {
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

// Industrial Power Plant Generator 3D Model
function PowerPlant() {
  const powerPlant = useGameStore((state) => state.powerPlant);
  const baseHeight = getTerrainHeight(12, -10);

  const isCloseRef = useRef(false);
  const [isClose, setIsClose] = React.useState(false);

  useFrame(() => {
    const state = useGameStore.getState();
    const dist = Math.hypot(state.playerPos[0] - 12, state.playerPos[2] - (-10));
    const close = dist < 4.0;
    if (close !== isCloseRef.current) {
      isCloseRef.current = close;
      setIsClose(close);
    }
  });

  return (
    <group position={[12, baseHeight, -10]}>
      {/* Concrete base pad */}
      <mesh position={[0, 0.05, 0]} receiveShadow>
        <boxGeometry args={[6.5, 0.1, 5.5]} />
        <meshStandardMaterial color="#475569" roughness={0.8} />
      </mesh>

      {/* Main Generator Station building */}
      <mesh position={[-1.2, 0.9, 0]} castShadow receiveShadow>
        <boxGeometry args={[2.5, 1.8, 3.2]} />
        <meshStandardMaterial color="#334155" metalness={0.75} roughness={0.3} />
      </mesh>

      {/* Control Room Extension */}
      <mesh position={[1.0, 0.65, 0.8]} castShadow receiveShadow>
        <boxGeometry args={[1.8, 1.3, 1.6]} />
        <meshStandardMaterial color="#64748b" roughness={0.7} />
      </mesh>

      {/* Large Industrial Cooling Tower */}
      <group position={[1.5, 0, -1.2]}>
        <mesh castShadow receiveShadow position={[0, 1.35, 0]}>
          <cylinderGeometry args={[0.7, 1.0, 2.7, 8]} />
          <meshStandardMaterial color="#1e293b" flatShading roughness={0.9} />
        </mesh>
        {/* Steam cap indicator */}
        <mesh position={[0, 2.72, 0]}>
          <cylinderGeometry args={[0.62, 0.62, 0.04, 8]} />
          <meshBasicMaterial color="#e2e8f0" transparent opacity={0.3} />
        </mesh>
      </group>

      {/* Tall Chimney Smoke Stacks */}
      <group position={[-2.0, 0, -1.0]}>
        <mesh position={[0, 1.8, 0]} castShadow>
          <cylinderGeometry args={[0.18, 0.24, 3.6, 6]} />
          <meshStandardMaterial color="#1e293b" flatShading />
        </mesh>
        {/* Red warning light at top */}
        <mesh position={[0, 3.65, 0]}>
          <sphereGeometry args={[0.08, 4, 4]} />
          <meshBasicMaterial color="#ef4444" />
        </mesh>
      </group>

      {/* External Power Transformer Coils */}
      <group position={[-1.2, 0.2, 1.9]}>
        <mesh castShadow position={[0, 0.3, 0]}>
          <boxGeometry args={[1.2, 0.6, 0.8]} />
          <meshStandardMaterial color="#854d0e" metalness={0.6} />
        </mesh>
        {/* Ceramic insulators */}
        <mesh position={[-0.3, 0.7, 0]}>
          <cylinderGeometry args={[0.08, 0.08, 0.3, 5]} />
          <meshStandardMaterial color="#cbd5e1" />
        </mesh>
        <mesh position={[0.3, 0.7, 0]}>
          <cylinderGeometry args={[0.08, 0.08, 0.3, 5]} />
          <meshStandardMaterial color="#cbd5e1" />
        </mesh>
      </group>

      {/* Main Power Indicator Console */}
      <group position={[1.2, 0.65, 1.62]}>
        <mesh castShadow>
          <boxGeometry args={[0.6, 0.7, 0.1]} />
          <meshStandardMaterial color="#1e293b" />
        </mesh>
        {/* Power Status Indicator Light */}
        <mesh position={[0, 0.18, 0.06]}>
          <sphereGeometry args={[0.07, 6, 6]} />
          <meshBasicMaterial color={powerPlant.repaired ? (powerPlant.active ? '#22c55e' : '#eab308') : '#ef4444'} />
        </mesh>
        {/* Active glowing ring or status pointLight */}
        <pointLight
          position={[0, 0.18, 0.2]}
          color={powerPlant.repaired ? (powerPlant.active ? '#22c55e' : '#eab308') : '#ef4444'}
          intensity={1.5}
          distance={4}
        />
      </group>

      {/* Hologram repair prompt floating above power plant if unrepaired */}
      {!powerPlant.repaired && (
        <group position={[0, 3.2, 0]}>
          <mesh>
            <boxGeometry args={[1.5, 0.5, 1.5]} />
            <meshBasicMaterial color="#ef4444" wireframe transparent opacity={0.6} />
          </mesh>
        </group>
      )}

      {/* Interactive Prompt Overlay */}
      {isClose && (
        <group position={[0, 2.5, 0]}>
          <Html center distanceFactor={10} style={{ pointerEvents: 'none' }}>
            <div className="bg-slate-950/90 border border-slate-800 backdrop-blur-md rounded-lg px-3 py-1.5 shadow-xl text-center select-none whitespace-nowrap text-white font-sans">
              {!powerPlant.repaired ? (
                <div>
                  <div className="text-[10px] text-red-400 font-bold uppercase tracking-wider">Major Generator Fault</div>
                  <div className="text-white text-xs font-black mt-0.5">Press <span className="text-emerald-400 bg-emerald-950/80 px-1 py-0.5 rounded border border-emerald-500/30">F</span> to Repair</div>
                </div>
              ) : (
                <div>
                  <div className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">Power Plant Online</div>
                  <div className="text-[11px] text-slate-300 font-semibold mt-0.5">Fuel: {Math.round(powerPlant.fuel)}% ({powerPlant.active ? 'Active ⚡' : 'Inactive'})</div>
                  <div className="text-slate-400 text-[10px] font-black mt-1">Press <span className="text-amber-400 bg-amber-950/80 px-1 py-0.5 rounded border border-amber-500/30">F</span> to Add Fuel Canister ⛽</div>
                </div>
              )}
            </div>
          </Html>
        </group>
      )}
    </group>
  );
}

// Wooden Pier/Dock extending into the NW Ocean
function Pier() {
  const playerPos = useGameStore((state) => state.playerPos);
  const ships = useGameStore((state) => state.ships);
  const mountedShipId = useGameStore((state) => state.mountedShipId);

  const isNearPierEnd = playerPos[0] >= -20.5 && playerPos[0] <= -17.5 && playerPos[2] >= -21.2 && playerPos[2] <= -18.8;
  const ship = ships[0];
  const isShipFar = ship ? Math.hypot(ship.position[0] - (-20.5), ship.position[2] - (-20)) > 7.0 : false;
  const showRecallPrompt = isNearPierEnd && isShipFar && !mountedShipId;

  return (
    <group position={[-15, -1.15, -20]}>
      {/* Wooden support posts */}
      {[-4, 0, 4].map((xOffset) => (
        <group key={xOffset} position={[xOffset, 0, 0]}>
          {/* Left post */}
          <mesh position={[0, -2.5, -0.9]} castShadow>
            <cylinderGeometry args={[0.08, 0.08, 5.0, 6]} />
            <meshStandardMaterial color="#2d1a10" roughness={0.95} />
          </mesh>
          {/* Right post */}
          <mesh position={[0, -2.5, 0.9]} castShadow>
            <cylinderGeometry args={[0.08, 0.08, 5.0, 6]} />
            <meshStandardMaterial color="#2d1a10" roughness={0.95} />
          </mesh>
        </group>
      ))}
      {/* Main wooden platform */}
      <mesh position={[0, 0.05, 0]} castShadow receiveShadow>
        <boxGeometry args={[10.0, 0.12, 2.0]} />
        <meshStandardMaterial color="#451a03" roughness={0.85} flatShading />
      </mesh>
      {/* Platform texture lines (wooden planks) */}
      {Array.from({ length: 12 }).map((_, i) => (
        <mesh key={i} position={[-4.5 + i * 0.82, 0.12, 0]} castShadow>
          <boxGeometry args={[0.08, 0.02, 1.95]} />
          <meshStandardMaterial color="#1c0d02" />
        </mesh>
      ))}
      {/* Lantern post at the end of the pier */}
      <group position={[-4.5, 0.1, 0]}>
        <mesh position={[0, 0.9, 0]} castShadow>
          <cylinderGeometry args={[0.03, 0.03, 1.8, 5]} />
          <meshStandardMaterial color="#334155" metalness={0.7} />
        </mesh>
        <mesh position={[0, 1.8, 0]}>
          <sphereGeometry args={[0.12, 6, 6]} />
          <meshBasicMaterial color="#fbbf24" />
        </mesh>
        <pointLight position={[0, 1.7, 0]} color="#fbbf24" intensity={2.0} distance={8} />

        {showRecallPrompt && (
          <group position={[0, 2.4, 0]}>
            <Html center distanceFactor={11} style={{ pointerEvents: 'none' }}>
              <div className="bg-slate-950/95 border border-cyan-400/50 backdrop-blur-md rounded-xl px-4 py-2 shadow-2xl text-center select-none whitespace-nowrap">
                <div className="text-cyan-300 text-[10px] font-bold uppercase tracking-wider">⛵ Ship is out at sea</div>
                <div className="text-white text-xs font-black mt-0.5">
                  Press <span className="text-cyan-400 bg-cyan-950/80 px-1.5 py-0.5 rounded border border-cyan-500/30">F</span> to Recall Ship
                </div>
              </div>
            </Html>
          </group>
        )}
      </group>
    </group>
  );
}

// Rideable Ship Mesh Model
function RideableShipMesh({ ship }: { ship: RideableShip }) {
  const mountedShipId = useGameStore((state) => state.mountedShipId);
  const isMounted = mountedShipId === ship.id;

  const groupRef = useRef<THREE.Group>(null);
  const mastRef = useRef<THREE.Group>(null);
  const isCloseRef = useRef(false);
  const [isClose, setIsClose] = React.useState(false);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    
    // Wind-blown sail/mast sway
    if (mastRef.current) {
      mastRef.current.rotation.z = Math.sin(time * 0.8) * 0.025;
      mastRef.current.rotation.x = Math.cos(time * 0.6) * 0.015;
    }

    if (isMounted) {
      if (groupRef.current) {
        const gameState = useGameStore.getState();
        // Follow player while sailing, fixed at sea level
        groupRef.current.position.set(gameState.playerPos[0], -1.2, gameState.playerPos[2]);
        groupRef.current.rotation.set(0, gameState.playerRot, 0);
      }
      if (isCloseRef.current) {
        isCloseRef.current = false;
        setIsClose(false);
      }
    } else {
      const gameState = useGameStore.getState();
      const dist = Math.hypot(gameState.playerPos[0] - ship.position[0], gameState.playerPos[2] - ship.position[2]);
      const close = dist < 7.0;
      if (close !== isCloseRef.current) {
        isCloseRef.current = close;
        setIsClose(close);
      }
    }
  });

  return (
    <group
      ref={groupRef}
      position={ship.position}
      rotation={[0, ship.rotation, 0]}
    >
      {/* Ship Hull (Low-Poly Wood Base) */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[1.8, 0.9, 5.2]} />
        <meshStandardMaterial color="#6f3d1b" roughness={0.8} flatShading />
      </mesh>

      {/* pointed Bow front (Cone/Wedge) */}
      <mesh position={[0, 0.15, 2.9]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <coneGeometry args={[0.9, 1.2, 4]} />
        <meshStandardMaterial color="#542e14" flatShading />
      </mesh>

      {/* Stern Back Board */}
      <mesh position={[0, 0.25, -2.7]} castShadow>
        <boxGeometry args={[1.7, 1.4, 0.35]} />
        <meshStandardMaterial color="#542e14" flatShading />
      </mesh>

      {/* Deck wood boards */}
      <mesh position={[0, 0.46, 0]} receiveShadow>
        <boxGeometry args={[1.72, 0.04, 4.8]} />
        <meshStandardMaterial color="#b45309" roughness={0.7} />
      </mesh>

      {/* Captain's cabin */}
      <group position={[0, 0.95, -1.6]}>
        <mesh castShadow>
          <boxGeometry args={[1.4, 1.0, 1.5]} />
          <meshStandardMaterial color="#3f3f46" roughness={0.6} />
        </mesh>
        {/* Cabin Roof */}
        <mesh position={[0, 0.55, 0]} castShadow>
          <boxGeometry args={[1.6, 0.1, 1.7]} />
          <meshStandardMaterial color="#7f1d1d" flatShading />
        </mesh>
        {/* Windows (Glass) */}
        <mesh position={[0, 0.2, 0.76]}>
          <boxGeometry args={[1.0, 0.4, 0.02]} />
          <meshStandardMaterial color="#e0f2fe" transparent opacity={0.6} />
        </mesh>
      </group>

      {/* Tall Mast and blowing Sail */}
      <group ref={mastRef} position={[0, 0.45, 0.8]}>
        {/* Wooden pole */}
        <mesh position={[0, 2.2, 0]} castShadow>
          <cylinderGeometry args={[0.08, 0.12, 4.4, 6]} />
          <meshStandardMaterial color="#542e14" />
        </mesh>
        {/* Crossbars */}
        <mesh position={[0, 3.8, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.04, 0.04, 2.2, 4]} />
          <meshStandardMaterial color="#542e14" />
        </mesh>
        <mesh position={[0, 1.4, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.04, 0.04, 2.6, 4]} />
          <meshStandardMaterial color="#542e14" />
        </mesh>
        {/* White blowing canvas sail */}
        <mesh position={[0, 2.6, 0.18]} rotation={[0.08, 0, 0]} castShadow>
          <boxGeometry args={[2.2, 2.3, 0.05]} />
          <meshStandardMaterial color="#f8fafc" roughness={0.9} flatShading />
        </mesh>
        {/* Decorative Red Flag on top */}
        <mesh position={[0.2, 4.3, 0]} rotation={[0, 0, -0.2]} castShadow>
          <boxGeometry args={[0.4, 0.2, 0.02]} />
          <meshBasicMaterial color="#dc2626" />
        </mesh>
      </group>

      {/* Gold steering wheel */}
      <group position={[0, 0.75, -0.6]} rotation={[0.4, 0, 0]}>
        <mesh position={[0, 0, -0.05]} castShadow>
          <cylinderGeometry args={[0.03, 0.03, 0.6, 4]} />
          <meshStandardMaterial color="#78350f" />
        </mesh>
        <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
          <torusGeometry args={[0.28, 0.03, 6, 12]} />
          <meshStandardMaterial color="#d97706" metalness={0.9} roughness={0.1} />
        </mesh>
      </group>

      {/* Side railings */}
      <mesh position={[0.88, 0.62, 0.2]} castShadow>
        <boxGeometry args={[0.06, 0.32, 3.8]} />
        <meshStandardMaterial color="#542e14" />
      </mesh>
      <mesh position={[-0.88, 0.62, 0.2]} castShadow>
        <boxGeometry args={[0.06, 0.32, 3.8]} />
        <meshStandardMaterial color="#542e14" />
      </mesh>

      {/* Hanging lantern lights */}
      <group position={[0.6, 0.6, 2.3]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.06, 0.06, 0.15, 5]} />
          <meshStandardMaterial color="#fbbf24" emissive="#fbbf24" emissiveIntensity={1.2} />
        </mesh>
        <pointLight color="#fbbf24" intensity={1.5} distance={5} />
      </group>
      <group position={[-0.6, 0.6, 2.3]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.06, 0.06, 0.15, 5]} />
          <meshStandardMaterial color="#fbbf24" emissive="#fbbf24" emissiveIntensity={1.2} />
        </mesh>
        <pointLight color="#fbbf24" intensity={1.5} distance={5} />
      </group>

      {/* Prompts for interaction */}
      {isClose && (
        <group position={[0, 2.4, 0]}>
          <Html center distanceFactor={11} style={{ pointerEvents: 'none' }}>
            <div className="bg-slate-950/90 border border-cyan-400/50 backdrop-blur-md rounded-xl px-4 py-2 shadow-2xl text-center select-none whitespace-nowrap">
              <div className="text-cyan-300 text-[10px] font-bold uppercase tracking-wider">⛵ Exploration Ship</div>
              <div className="text-white text-xs font-black mt-0.5">
                Press <span className="text-cyan-400 bg-cyan-950/80 px-1.5 py-0.5 rounded border border-cyan-500/30">F</span> to Sail
              </div>
            </div>
          </Html>
        </group>
      )}

      {isMounted && (
        <group position={[0, 2.4, 0]}>
          <Html center distanceFactor={11} style={{ pointerEvents: 'none' }}>
            <div className="bg-cyan-950/90 border border-cyan-400 rounded-xl px-4 py-1.5 text-cyan-300 text-[10px] font-bold uppercase tracking-wider whitespace-nowrap select-none">
              ⛵ Sailing — Press F to dismount onto the pier
            </div>
          </Html>
        </group>
      )}
    </group>
  );
}

// Streetlight glowing at night if Power Plant is active
function Streetlight({ pos }: { pos: [number, number, number] }) {
  const powerPlant = useGameStore((state) => state.powerPlant);
  const worldTime = useGameStore((state) => state.worldTime);

  const isPowerOn = powerPlant.repaired && powerPlant.active;
  const isNight = worldTime > 19.5 || worldTime < 5.0;
  const isLightOn = isPowerOn && isNight;

  return (
    <group position={pos}>
      {/* Vertical pole */}
      <mesh position={[0, 1.5, 0]} castShadow>
        <cylinderGeometry args={[0.03, 0.04, 3.0, 5]} />
        <meshStandardMaterial color="#475569" metalness={0.8} />
      </mesh>
      
      {/* Light head arm */}
      <mesh position={[0.2, 3.0, 0]} rotation={[0, 0, -0.2]} castShadow>
        <boxGeometry args={[0.42, 0.05, 0.08]} />
        <meshStandardMaterial color="#334155" />
      </mesh>

      {/* Light head fixture */}
      <mesh position={[0.38, 2.92, 0]} castShadow>
        <boxGeometry args={[0.15, 0.08, 0.12]} />
        <meshStandardMaterial color="#1e293b" />
      </mesh>

      {/* Light bulb */}
      <mesh position={[0.38, 2.87, 0]}>
        <sphereGeometry args={[0.05, 6, 6]} />
        <meshBasicMaterial color={isLightOn ? '#fef08a' : '#57534e'} />
      </mesh>

      {/* Active Light Glow */}
      {isLightOn && (
        <group>
          <pointLight
            position={[0.38, 2.7, 0]}
            color="#fef08a"
            intensity={2.2}
            distance={9}
            castShadow
            shadow-bias={-0.002}
          />
          {/* Visual light cone */}
          <mesh position={[0.38, 1.4, 0]}>
            <coneGeometry args={[0.7, 2.8, 8, 1, true]} />
            <meshBasicMaterial color="#fef08a" transparent opacity={0.12} depthWrite={false} />
          </mesh>
        </group>
      )}
    </group>
  );
}

// 3D Big Market Building — open-fronted with stalls inside
function BigMarket() {
  const setTab = useGameStore((state) => state.setTab);

  const marketPos: [number, number, number] = [-6, getTerrainHeight(-6, -12), -12];
  const isCloseRef = useRef(false);
  const [isClose, setIsClose] = React.useState(false);

  useFrame(() => {
    const state = useGameStore.getState();
    const dist = Math.hypot(state.playerPos[0] - marketPos[0], state.playerPos[2] - marketPos[2]);
    const close = dist < 6.0;
    if (close !== isCloseRef.current) {
      isCloseRef.current = close;
      setIsClose(close);
    }
  });

  return (
    <group position={marketPos}>
      {/* Stone base */}
      <mesh position={[0, 0.08, 0]} receiveShadow>
        <boxGeometry args={[9.0, 0.16, 6.0]} />
        <meshStandardMaterial color="#64748b" roughness={0.8} flatShading />
      </mesh>

      {/* Back wall */}
      <mesh position={[0, 1.5, -2.9]} castShadow receiveShadow>
        <boxGeometry args={[9.0, 3.0, 0.22]} />
        <meshStandardMaterial color="#d4a373" roughness={0.85} flatShading />
      </mesh>

      {/* Left side wall */}
      <mesh position={[-4.4, 1.5, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.22, 3.0, 6.0]} />
        <meshStandardMaterial color="#d4a373" roughness={0.85} flatShading />
      </mesh>

      {/* Right side wall */}
      <mesh position={[4.4, 1.5, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.22, 3.0, 6.0]} />
        <meshStandardMaterial color="#d4a373" roughness={0.85} flatShading />
      </mesh>

      {/* Roof */}
      <mesh position={[0, 3.12, 0]} castShadow>
        <boxGeometry args={[9.4, 0.18, 6.4]} />
        <meshStandardMaterial color="#7f1d1d" flatShading roughness={0.7} />
      </mesh>

      {/* Colorful awning over entrance */}
      <mesh position={[0, 2.6, 2.5]} rotation={[0.35, 0, 0]} castShadow>
        <boxGeometry args={[9.0, 0.1, 2.2]} />
        <meshStandardMaterial color="#f59e0b" flatShading roughness={0.7} />
      </mesh>

      {/* MARKET sign */}
      <mesh position={[0, 3.5, -2.85]}>
        <boxGeometry args={[4.5, 0.65, 0.12]} />
        <meshStandardMaterial color="#f59e0b" emissive="#f59e0b" emissiveIntensity={1.2} roughness={0.4} />
      </mesh>

      {/* Stall counters inside */}
      {[[-2.8, 0.45, -1.5], [0, 0.45, -1.5], [2.8, 0.45, -1.5]].map(([x, y, z], idx) => (
        <group key={idx} position={[x, y, z]}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[2.0, 0.9, 0.55]} />
            <meshStandardMaterial
              color={idx === 0 ? '#78350f' : idx === 1 ? '#065f46' : '#1e3a8a'}
              flatShading roughness={0.85}
            />
          </mesh>
          {/* Goods on counter */}
          <mesh position={[0, 0.5, 0]}>
            <boxGeometry args={[1.6, 0.12, 0.4]} />
            <meshStandardMaterial color="#fde68a" roughness={0.9} />
          </mesh>
          <pointLight position={[0, 1.2, 0]} color="#fef3c7" intensity={1.0} distance={3.5} />
        </group>
      ))}

      {/* Inside lanterns */}
      <pointLight position={[0, 2.5, -1.0]} color="#fbbf24" intensity={2.5} distance={9} castShadow />
      <pointLight position={[-3.0, 2.5, 0]} color="#fde68a" intensity={1.5} distance={6} />
      <pointLight position={[3.0, 2.5, 0]} color="#fde68a" intensity={1.5} distance={6} />

      {/* Hanging lantern decorations */}
      {[-2.5, 0, 2.5].map((x, idx) => (
        <group key={idx} position={[x, 2.8, 2.2]}>
          <mesh>
            <cylinderGeometry args={[0.12, 0.1, 0.25, 6]} />
            <meshStandardMaterial color="#dc2626" emissive="#dc2626" emissiveIntensity={1.5} />
          </mesh>
        </group>
      ))}

      {/* Proximity prompt */}
      {isClose && (
        <group position={[0, 4.2, 0]}>
          <Html center distanceFactor={12} style={{ pointerEvents: 'none' }}>
            <div className="bg-amber-950/95 border border-amber-600 backdrop-blur-md rounded-xl px-4 py-2 shadow-2xl text-center select-none whitespace-nowrap">
              <div className="text-amber-300 text-[10px] font-bold uppercase tracking-wider">🏪 Market</div>
              <div className="text-white text-xs font-black mt-0.5">
                Press <span className="text-amber-400 bg-amber-950 px-1 py-0.5 rounded border border-amber-600">F</span> to Open Shop
              </div>
            </div>
          </Html>
        </group>
      )}
    </group>
  );
}

// Rideable Car Mesh (driven by player when mounted)
function RideableCarMesh({ car }: { car: RideableCar }) {
  const mountedCarId = useGameStore((state) => state.mountedCarId);
  const isMounted = mountedCarId === car.id;

  const groupRef = useRef<THREE.Group>(null);
  const isCloseRef = useRef(false);
  const [isClose, setIsClose] = React.useState(false);

  // Single unified useFrame: position sync when mounted + proximity check when parked
  useFrame(() => {
    if (isMounted) {
      // Follow player while driving
      if (groupRef.current) {
        const state = useGameStore.getState();
        groupRef.current.position.set(state.playerPos[0], state.playerPos[1] - 0.3, state.playerPos[2]);
        groupRef.current.rotation.set(0, state.playerRot, 0);
      }
      // Clear the proximity prompt
      if (isCloseRef.current) {
        isCloseRef.current = false;
        setIsClose(false);
      }
    } else {
      // Proximity check — only triggers a React re-render when crossing the threshold
      const state = useGameStore.getState();
      const dist = Math.hypot(state.playerPos[0] - car.position[0], state.playerPos[2] - car.position[2]);
      const close = dist < 3.5;
      if (close !== isCloseRef.current) {
        isCloseRef.current = close;
        setIsClose(close);
      }
    }
  });

  return (
    <group
      ref={groupRef}
      position={car.position}
      rotation={[0, car.rotation, 0]}
    >
      {/* Car body */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[0.9, 0.38, 1.9]} />
        <meshStandardMaterial color={car.color} flatShading roughness={0.5} metalness={0.35} />
      </mesh>
      {/* Cabin top */}
      <mesh position={[0, 0.32, -0.1]} castShadow>
        <boxGeometry args={[0.82, 0.32, 1.1]} />
        <meshStandardMaterial color={car.color} flatShading roughness={0.45} metalness={0.3} />
      </mesh>
      {/* Windshield front */}
      <mesh position={[0, 0.3, 0.52]}>
        <boxGeometry args={[0.78, 0.28, 0.03]} />
        <meshStandardMaterial color="#bae6fd" transparent opacity={0.72} metalness={0.85} roughness={0.08} />
      </mesh>
      {/* Rear window */}
      <mesh position={[0, 0.3, -0.69]}>
        <boxGeometry args={[0.78, 0.26, 0.03]} />
        <meshStandardMaterial color="#bae6fd" transparent opacity={0.62} metalness={0.85} roughness={0.08} />
      </mesh>
      {/* Side windows */}
      <mesh position={[0.46, 0.32, -0.1]} rotation={[0, Math.PI / 2, 0]}>
        <boxGeometry args={[0.9, 0.24, 0.02]} />
        <meshStandardMaterial color="#bae6fd" transparent opacity={0.55} metalness={0.8} roughness={0.1} />
      </mesh>
      <mesh position={[-0.46, 0.32, -0.1]} rotation={[0, Math.PI / 2, 0]}>
        <boxGeometry args={[0.9, 0.24, 0.02]} />
        <meshStandardMaterial color="#bae6fd" transparent opacity={0.55} metalness={0.8} roughness={0.1} />
      </mesh>
      {/* Wheels — 4 corners */}
      {([
        [-0.52, -0.14, 0.7],
        [0.52, -0.14, 0.7],
        [-0.52, -0.14, -0.7],
        [0.52, -0.14, -0.7],
      ] as [number, number, number][]).map(([wx, wy, wz], wi) => (
        <group key={wi} position={[wx, wy, wz]}>
          <mesh rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.18, 0.18, 0.14, 10]} />
            <meshStandardMaterial color="#1c1917" flatShading />
          </mesh>
          {/* Rim */}
          <mesh rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.09, 0.09, 0.15, 6]} />
            <meshStandardMaterial color="#64748b" metalness={0.8} roughness={0.3} />
          </mesh>
        </group>
      ))}
      {/* Front bumper */}
      <mesh position={[0, -0.1, 0.98]}>
        <boxGeometry args={[0.88, 0.12, 0.05]} />
        <meshStandardMaterial color="#0f172a" roughness={0.7} />
      </mesh>
      {/* Rear bumper */}
      <mesh position={[0, -0.1, -0.98]}>
        <boxGeometry args={[0.88, 0.12, 0.05]} />
        <meshStandardMaterial color="#0f172a" roughness={0.7} />
      </mesh>
      {/* Headlights */}
      <mesh position={[0.3, -0.02, 0.97]}>
        <boxGeometry args={[0.2, 0.1, 0.04]} />
        <meshStandardMaterial color="#fef9c3" emissive="#fef9c3" emissiveIntensity={2.0} />
      </mesh>
      <mesh position={[-0.3, -0.02, 0.97]}>
        <boxGeometry args={[0.2, 0.1, 0.04]} />
        <meshStandardMaterial color="#fef9c3" emissive="#fef9c3" emissiveIntensity={2.0} />
      </mesh>
      {/* Taillights */}
      <mesh position={[0.3, -0.02, -0.97]}>
        <boxGeometry args={[0.18, 0.09, 0.04]} />
        <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={1.5} />
      </mesh>
      <mesh position={[-0.3, -0.02, -0.97]}>
        <boxGeometry args={[0.18, 0.09, 0.04]} />
        <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={1.5} />
      </mesh>

      {/* Interaction prompt */}
      {isClose && (
        <group position={[0, 1.1, 0]}>
          <Html center distanceFactor={10} style={{ pointerEvents: 'none' }}>
            <div className="bg-slate-950/90 border border-cyan-500/40 backdrop-blur-md rounded-lg px-3 py-1.5 shadow-xl text-center select-none whitespace-nowrap">
              <div className="text-cyan-400 text-[10px] font-bold uppercase tracking-wider">🚗 Vehicle</div>
              <div className="text-white text-xs font-black mt-0.5">
                Press <span className="text-cyan-400 bg-cyan-950 px-1 rounded border border-cyan-600">F</span> to Drive
              </div>
            </div>
          </Html>
        </group>
      )}
      {/* Mounted indicator */}
      {isMounted && (
        <group position={[0, 1.0, 0]}>
          <Html center distanceFactor={10} style={{ pointerEvents: 'none' }}>
            <div className="bg-cyan-950/90 border border-cyan-400 rounded-lg px-3 py-1 text-cyan-300 text-[10px] font-bold uppercase tracking-wider whitespace-nowrap select-none">
              🚗 Driving — Press F to exit
            </div>
          </Html>
        </group>
      )}
    </group>
  );
}

// 3D low-poly Birds orbiting the sky and flapping wings
function SingleBird({ speed, height, radius, angleOffset, color }: { speed: number; height: number; radius: number; angleOffset: number; color: string }) {
  const birdRef = useRef<THREE.Group>(null);
  const leftWingRef = useRef<THREE.Mesh>(null);
  const rightWingRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    if (birdRef.current) {
      const angle = time * speed + angleOffset;
      const bx = Math.cos(angle) * radius;
      const bz = Math.sin(angle) * radius;
      const by = height + Math.sin(time * 1.5 + angleOffset) * 0.5;

      birdRef.current.position.set(bx, by, bz);
      birdRef.current.rotation.y = -angle + Math.PI;
    }

    const flap = Math.sin(time * 14.0) * 0.6;
    if (leftWingRef.current) leftWingRef.current.rotation.z = flap;
    if (rightWingRef.current) rightWingRef.current.rotation.z = -flap;
  });

  return (
    <group ref={birdRef}>
      <group scale={[0.3, 0.3, 0.3]}>
        <mesh castShadow>
          <boxGeometry args={[0.3, 0.2, 0.6]} />
          <meshStandardMaterial color={color} flatShading />
        </mesh>
        <mesh position={[0, 0.1, 0.38]}>
          <boxGeometry args={[0.2, 0.18, 0.2]} />
          <meshStandardMaterial color={color} />
        </mesh>
        <mesh position={[0, 0.08, 0.52]} rotation={[Math.PI / 2, 0, 0]}>
          <coneGeometry args={[0.06, 0.15, 4]} />
          <meshBasicMaterial color="#fbbf24" />
        </mesh>
        <group ref={leftWingRef} position={[-0.15, 0.05, 0]}>
          <mesh position={[-0.32, 0, 0]}>
            <boxGeometry args={[0.6, 0.03, 0.4]} />
            <meshStandardMaterial color={color} flatShading />
          </mesh>
        </group>
        <group ref={rightWingRef} position={[0.15, 0.05, 0]}>
          <mesh position={[0.32, 0, 0]}>
            <boxGeometry args={[0.6, 0.03, 0.4]} />
            <meshStandardMaterial color={color} flatShading />
          </mesh>
        </group>
      </group>
    </group>
  );
}

function Birds() {
  const birds = useMemo(() => {
    return [
      { speed: 0.15, height: 9.0, radius: 18.0, angleOffset: 0, color: '#1e293b' },
      { speed: 0.18, height: 11.0, radius: 24.0, angleOffset: Math.PI * 0.6, color: '#475569' },
      { speed: 0.12, height: 10.0, radius: 20.0, angleOffset: Math.PI * 1.3, color: '#0284c7' },
    ];
  }, []);

  return (
    <group>
      {birds.map((b, idx) => (
        <SingleBird
          key={idx}
          speed={b.speed}
          height={b.height}
          radius={b.radius}
          angleOffset={b.angleOffset}
          color={b.color}
        />
      ))}
    </group>
  );
}

export default function Decorations() {
  const lakeFish = useGameStore((state) => state.lakeFish);
  const oceanFish = useGameStore((state) => state.oceanFish);
  const cars = useGameStore((state) => state.cars);
  const ships = useGameStore((state) => state.ships);

  const tailRefs = useRef<Array<THREE.Mesh | null>>([]);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    for (let i = 0; i < tailRefs.current.length; i++) {
      const tail = tailRefs.current[i];
      if (tail) {
        tail.rotation.y = Math.sin(time * 16.0 + i * 0.7) * 0.42;
      }
    }
  });

  const cottages = useMemo(() => {
    const coords: Array<{ p: [number, number, number]; r: number }> = [
      { p: [3.5, getTerrainHeight(3.5, 5.5) + 0.1, 5.5], r: 0 },
      { p: [8.5, getTerrainHeight(8.5, 11.5) + 0.1, 11.5], r: Math.PI / 6 },
      { p: [1.8, getTerrainHeight(1.8, 12.8) + 0.1, 12.8], r: -Math.PI / 4 },
    ];
    return coords;
  }, []);

  const streetlightPositions = useMemo(() => {
    const coords: [number, number][] = [
      [2.0, 3.0],
      [4.5, 7.0],
      [7.5, 3.5],
      [9.5, -3.0],
      [-10.0, -10.0],
      [-14.0, -6.0],
      [-5.0, -5.0],
    ];
    return coords.map(([x, z]) => [x, getTerrainHeight(x, z), z] as [number, number, number]);
  }, []);

  return (
    <group>
      {cottages.map((c, idx) => (
        <Cottage key={idx} pos={c.p} rot={c.r} />
      ))}
      <TraderShop />
      <ShoreBoat />
      {lakeFish.map((fish, idx) => (
        <SwimmingFish
          key={fish.id}
          fish={fish}
          idx={idx}
          tailRef={(el) => {
            tailRefs.current[idx] = el;
          }}
        />
      ))}
      {oceanFish.map((fish, idx) => (
        <SwimmingFish
          key={fish.id}
          fish={fish}
          idx={idx + 30}
          tailRef={(el) => {
            tailRefs.current[idx + 30] = el;
          }}
        />
      ))}
      <PowerPlant />
      <Pier />
      {streetlightPositions.map((pos, idx) => (
        <Streetlight key={idx} pos={pos} />
      ))}
      {/* Big Market */}
      <BigMarket />
      {/* Rideable Cars from store */}
      {cars.map((car) => (
        <RideableCarMesh key={car.id} car={car} />
      ))}
      {/* Rideable Ships from store */}
      {ships.map((ship) => (
        <RideableShipMesh key={ship.id} ship={ship} />
      ))}
      <Birds />
    </group>
  );
}
