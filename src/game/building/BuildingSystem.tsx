import React, { useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { useGameStore } from '../../store/useGameStore';
import { Building, BuildingType } from '../../types/game';

// Helper to render procedural 3D models for each structure type
function BuildingMesh({ building }: { building: Building }) {
  const { type, powered, active } = building;

  switch (type) {
    case 'wall':
      return (
        <group>
          {/* Main wall plank */}
          <mesh castShadow receiveShadow>
            <boxGeometry args={[0.98, 1.8, 0.15]} />
            <meshStandardMaterial color="#78350f" flatShading roughness={0.8} /> {/* Brown Wood */}
          </mesh>
          {/* Wall framing beams */}
          <mesh position={[0.42, 0, 0]} castShadow>
            <boxGeometry args={[0.08, 1.82, 0.18]} />
            <meshStandardMaterial color="#451a03" flatShading />
          </mesh>
          <mesh position={[-0.42, 0, 0]} castShadow>
            <boxGeometry args={[0.08, 1.82, 0.18]} />
            <meshStandardMaterial color="#451a03" flatShading />
          </mesh>
        </group>
      );
    case 'door':
      return (
        <group>
          {/* Frame */}
          <mesh position={[0.45, 0, 0]} castShadow>
            <boxGeometry args={[0.08, 1.8, 0.2]} />
            <meshStandardMaterial color="#451a03" flatShading />
          </mesh>
          <mesh position={[-0.45, 0, 0]} castShadow>
            <boxGeometry args={[0.08, 1.8, 0.2]} />
            <meshStandardMaterial color="#451a03" flatShading />
          </mesh>
          <mesh position={[0, 0.86, 0]} castShadow>
            <boxGeometry args={[0.9, 0.08, 0.2]} />
            <meshStandardMaterial color="#451a03" flatShading />
          </mesh>
          {/* Door Panel (slightly open or interactable, keep it offset) */}
          <mesh position={[-0.05, 0, -0.05]} rotation={[0, Math.PI / 4, 0]} castShadow>
            <boxGeometry args={[0.78, 1.7, 0.08]} />
            <meshStandardMaterial color="#b45309" flatShading roughness={0.85} />
          </mesh>
        </group>
      );
    case 'storage':
      return (
        <group position={[0, -0.25, 0]}>
          {/* Box Base */}
          <mesh castShadow>
            <boxGeometry args={[0.7, 0.5, 0.5]} />
            <meshStandardMaterial color="#b45309" flatShading roughness={0.9} />
          </mesh>
          {/* Metal Corner Brackets */}
          <mesh position={[0, 0.26, 0]} castShadow>
            <boxGeometry args={[0.72, 0.04, 0.52]} />
            <meshStandardMaterial color="#64748b" metalness={0.7} />
          </mesh>
          <mesh position={[0.3, 0.05, 0]} castShadow>
            <boxGeometry args={[0.1, 0.1, 0.05]} />
            <meshStandardMaterial color="#e2e8f0" metalness={0.8} />
          </mesh>
        </group>
      );
    case 'bed':
      return (
        <group position={[0, -0.35, 0]}>
          {/* Wooden Bedframe */}
          <mesh castShadow>
            <boxGeometry args={[0.65, 0.2, 1.2]} />
            <meshStandardMaterial color="#78350f" flatShading />
          </mesh>
          {/* Headboard */}
          <mesh position={[0, 0.2, -0.55]} castShadow>
            <boxGeometry args={[0.65, 0.4, 0.08]} />
            <meshStandardMaterial color="#78350f" flatShading />
          </mesh>
          {/* Mattress */}
          <mesh position={[0, 0.15, 0.05]} castShadow>
            <boxGeometry args={[0.58, 0.18, 1.0]} />
            <meshStandardMaterial color="#f8fafc" roughness={0.9} />
          </mesh>
          {/* Pillow */}
          <mesh position={[0, 0.26, -0.38]} castShadow>
            <boxGeometry args={[0.48, 0.08, 0.22]} />
            <meshStandardMaterial color="#0284c7" roughness={0.8} />
          </mesh>
        </group>
      );
    case 'workbench':
      return (
        <group position={[0, -0.2, 0]}>
          {/* Tabletop */}
          <mesh castShadow>
            <boxGeometry args={[0.9, 0.1, 0.6]} />
            <meshStandardMaterial color="#7c2d12" flatShading />
          </mesh>
          {/* Legs */}
          <mesh position={[0.38, -0.3, 0.23]} castShadow>
            <boxGeometry args={[0.08, 0.6, 0.08]} />
            <meshStandardMaterial color="#451a03" flatShading />
          </mesh>
          <mesh position={[-0.38, -0.3, 0.23]} castShadow>
            <boxGeometry args={[0.08, 0.6, 0.08]} />
            <meshStandardMaterial color="#451a03" flatShading />
          </mesh>
          <mesh position={[0.38, -0.3, -0.23]} castShadow>
            <boxGeometry args={[0.08, 0.6, 0.08]} />
            <meshStandardMaterial color="#451a03" flatShading />
          </mesh>
          <mesh position={[-0.38, -0.3, -0.23]} castShadow>
            <boxGeometry args={[0.08, 0.6, 0.08]} />
            <meshStandardMaterial color="#451a03" flatShading />
          </mesh>
          {/* Vice Clamp */}
          <mesh position={[0.32, 0.1, 0.15]} castShadow>
            <boxGeometry args={[0.12, 0.12, 0.12]} />
            <meshStandardMaterial color="#475569" metalness={0.8} />
          </mesh>
        </group>
      );
    case 'kitchen':
      return (
        <group position={[0, -0.15, 0]}>
          {/* Stove Box */}
          <mesh castShadow>
            <boxGeometry args={[0.8, 0.7, 0.7]} />
            <meshStandardMaterial color="#334155" flatShading metalness={0.5} roughness={0.3} />
          </mesh>
          {/* Cooktop Burners */}
          <mesh position={[0.2, 0.36, 0.2]} castShadow>
            <cylinderGeometry args={[0.12, 0.12, 0.02, 8]} />
            <meshStandardMaterial color="#0f172a" metalness={0.9} />
          </mesh>
          <mesh position={[-0.2, 0.36, -0.2]} castShadow>
            <cylinderGeometry args={[0.12, 0.12, 0.02, 8]} />
            <meshStandardMaterial color="#0f172a" metalness={0.9} />
          </mesh>
          {/* Stove Handle */}
          <mesh position={[0, 0.2, 0.36]} castShadow>
            <boxGeometry args={[0.4, 0.04, 0.04]} />
            <meshStandardMaterial color="#94a3b8" metalness={0.9} />
          </mesh>
        </group>
      );
    case 'generator':
      return (
        <group position={[0, -0.2, 0]}>
          {/* Generator Engine Block */}
          <mesh castShadow>
            <boxGeometry args={[0.8, 0.6, 0.6]} />
            <meshStandardMaterial color="#047857" flatShading metalness={0.6} /> {/* Green engine block */}
          </mesh>
          {/* Fuel Cap */}
          <mesh position={[0.2, 0.32, 0.1]} castShadow>
            <cylinderGeometry args={[0.06, 0.06, 0.05, 6]} />
            <meshStandardMaterial color="#fbbf24" roughness={0.5} />
          </mesh>
          {/* Rotating Fan Cylinder */}
          <mesh position={[-0.28, 0.1, 0]} rotation={[0, 0, active ? Math.PI / 4 : 0]} castShadow>
            <cylinderGeometry args={[0.24, 0.24, 0.15, 8]} />
            <meshStandardMaterial color="#1e293b" metalness={0.8} />
          </mesh>
        </group>
      );
    case 'light':
      return (
        <group>
          {/* Lightstand post */}
          <mesh position={[0, 0.8, 0]} castShadow>
            <cylinderGeometry args={[0.025, 0.025, 1.8]} />
            <meshStandardMaterial color="#334155" metalness={0.8} />
          </mesh>
          {/* Top cover */}
          <mesh position={[0, 1.7, 0]} castShadow>
            <coneGeometry args={[0.22, 0.15, 8]} />
            <meshStandardMaterial color="#475569" flatShading />
          </mesh>
          {/* Bulb */}
          <mesh position={[0, 1.6, 0]}>
            <sphereGeometry args={[0.08, 8, 8]} />
            <meshBasicMaterial color={powered ? '#fde047' : '#475569'} />
          </mesh>
          {/* Active 3D PointLight */}
          {powered && (
            <pointLight
              color="#fef08a"
              intensity={1.8}
              distance={8}
              castShadow
              shadow-bias={-0.002}
            />
          )}
        </group>
      );
    case 'water_pump':
      return (
        <group position={[0, -0.2, 0]}>
          {/* Base */}
          <mesh castShadow>
            <boxGeometry args={[0.6, 0.1, 0.6]} />
            <meshStandardMaterial color="#475569" metalness={0.7} />
          </mesh>
          {/* Pump Pillar */}
          <mesh position={[0, 0.45, 0]} castShadow>
            <cylinderGeometry args={[0.06, 0.08, 0.8, 6]} />
            <meshStandardMaterial color="#0284c7" metalness={0.75} />
          </mesh>
          {/* Handle */}
          <mesh position={[0, 0.72, -0.15]} rotation={[0.4, 0, 0]} castShadow>
            <boxGeometry args={[0.04, 0.04, 0.42]} />
            <meshStandardMaterial color="#475569" />
          </mesh>
          {/* Water Spout */}
          <mesh position={[0, 0.52, 0.15]} rotation={[Math.PI / 2, 0, 0]} castShadow>
            <cylinderGeometry args={[0.03, 0.03, 0.16]} />
            <meshStandardMaterial color="#cbd5e1" />
          </mesh>
        </group>
      );
    case 'turret':
      return (
        <group position={[0, -0.2, 0]}>
          {/* Tripod Stand */}
          <mesh castShadow>
            <coneGeometry args={[0.3, 0.4, 4]} />
            <meshStandardMaterial color="#1e293b" flatShading />
          </mesh>
          {/* Swiveling turret box head */}
          <group position={[0, 0.42, 0]}>
            <mesh castShadow>
              <boxGeometry args={[0.35, 0.28, 0.45]} />
              <meshStandardMaterial color={powered ? '#1e3a8a' : '#4b5563'} flatShading metalness={0.6} />
            </mesh>
            {/* Double Barrels */}
            <mesh position={[0.08, 0, 0.32]} rotation={[Math.PI / 2, 0, 0]} castShadow>
              <cylinderGeometry args={[0.025, 0.025, 0.4]} />
              <meshStandardMaterial color="#0f172a" metalness={0.9} />
            </mesh>
            <mesh position={[-0.08, 0, 0.32]} rotation={[Math.PI / 2, 0, 0]} castShadow>
              <cylinderGeometry args={[0.025, 0.025, 0.4]} />
              <meshStandardMaterial color="#0f172a" metalness={0.9} />
            </mesh>
          </group>
        </group>
      );
    default:
      return (
        <mesh castShadow>
          <boxGeometry args={[0.5, 0.5, 0.5]} />
          <meshStandardMaterial color="#9333ea" />
        </mesh>
      );
  }
}

export default function BuildingSystem() {
  const buildings = useGameStore((state) => state.buildings);
  const isBuildingMode = useGameStore((state) => state.isBuildingMode);
  const selectedBuildingType = useGameStore((state) => state.selectedBuildingType);
  const playerPos = useGameStore((state) => state.playerPos);

  // Hologram grid snapping math
  // snapps placement to 1.5m intervals based on player look direction
  const hologramGridPos = useMemo(() => {
    if (!isBuildingMode) return null;
    
    // snap helper box ahead of the player position
    // snap to nearest integer coordinates
    const gx = Math.round(playerPos[0] / 1.5) * 1.5;
    const gz = Math.round(playerPos[2] / 1.5) * 1.5;

    // Convert snap value to grid array index for placeBuilding
    const gridX = Math.round(gx);
    const gridZ = Math.round(gz);

    return {
      renderPos: [gx, 0.5, gz] as [number, number, number],
      gridPos: [gridX, gridZ] as [number, number],
    };
  }, [isBuildingMode, playerPos]);

  return (
    <group>
      {/* Existing Built Structures */}
      {buildings.map((b) => (
        <group key={b.id} position={b.position} rotation={[0, b.rotation, 0]}>
          <BuildingMesh building={b} />
        </group>
      ))}

      {/* Hologram Grid Snapping Placement Preview */}
      {isBuildingMode && hologramGridPos && selectedBuildingType && (
        <group position={hologramGridPos.renderPos}>
          {/* Bounding box guide helper */}
          <mesh>
            <boxGeometry args={[1.2, 1.2, 1.2]} />
            <meshBasicMaterial
              color="#22d3ee"
              transparent
              opacity={0.35}
              wireframe
            />
          </mesh>
          <mesh>
            <boxGeometry args={[0.9, 0.9, 0.9]} />
            <meshBasicMaterial
              color="#22d3ee"
              transparent
              opacity={0.25}
            />
          </mesh>
        </group>
      )}
    </group>
  );
}
