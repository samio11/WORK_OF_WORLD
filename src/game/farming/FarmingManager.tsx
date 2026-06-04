import React from 'react';
import * as THREE from 'three';
import { useGameStore } from '../../store/useGameStore';
import { Crop, CropType } from '../../types/game';
import { getTerrainHeight } from '../world/WorldTerrain';

// Helper to render procedural 3D meshes for crop growth stages
function CropMesh({ type, stage }: { type: CropType; stage: number }) {
  // If seed, draw tiny sprout
  if (stage === 0) {
    return (
      <mesh position={[0, 0.05, 0]}>
        <sphereGeometry args={[0.04, 4, 4]} />
        <meshBasicMaterial color="#a3e635" />
      </mesh>
    );
  }

  // Sprout stage
  if (stage === 1) {
    return (
      <mesh position={[0, 0.12, 0]}>
        <cylinderGeometry args={[0.02, 0.02, 0.2, 4]} />
        <meshStandardMaterial color="#84cc16" flatShading />
      </mesh>
    );
  }

  // Growing stage
  if (stage === 2) {
    return (
      <group position={[0, 0.15, 0]}>
        {/* Main stem */}
        <mesh>
          <cylinderGeometry args={[0.035, 0.04, 0.3, 4]} />
          <meshStandardMaterial color="#65a30d" flatShading />
        </mesh>
        {/* Leaf 1 */}
        <mesh position={[0.08, 0.08, 0]} rotation={[0, 0, -0.6]}>
          <boxGeometry args={[0.12, 0.03, 0.08]} />
          <meshStandardMaterial color="#4d7c0f" flatShading />
        </mesh>
        {/* Leaf 2 */}
        <mesh position={[-0.08, 0.08, 0]} rotation={[0, 0, 0.6]}>
          <boxGeometry args={[0.12, 0.03, 0.08]} />
          <meshStandardMaterial color="#4d7c0f" flatShading />
        </mesh>
      </group>
    );
  }

  // Medium stage
  if (stage === 3) {
    return (
      <group position={[0, 0.22, 0]}>
        <mesh>
          <cylinderGeometry args={[0.05, 0.06, 0.45, 5]} />
          <meshStandardMaterial color="#4d7c0f" flatShading />
        </mesh>
        <mesh position={[0, 0.2, 0]}>
          <sphereGeometry args={[0.18, 5, 5]} />
          <meshStandardMaterial color="#3f6212" flatShading />
        </mesh>
      </group>
    );
  }

  // Mature / Harvestable stage (stage === 4)
  // Customized meshes per vegetable type
  switch (type) {
    case 'wheat':
      return (
        <group position={[0, 0.35, 0]}>
          {/* Multiple golden stalks */}
          <mesh position={[0.08, 0, 0]} rotation={[0.15, 0, 0]} castShadow>
            <cylinderGeometry args={[0.02, 0.02, 0.6, 4]} />
            <meshStandardMaterial color="#eab308" flatShading />
          </mesh>
          <mesh position={[-0.08, 0, 0.05]} rotation={[-0.1, 0, -0.1]} castShadow>
            <cylinderGeometry args={[0.02, 0.02, 0.6, 4]} />
            <meshStandardMaterial color="#eab308" flatShading />
          </mesh>
          {/* Golden Ears/Head */}
          <mesh position={[0.08, 0.3, 0]} castShadow>
            <boxGeometry args={[0.06, 0.16, 0.06]} />
            <meshStandardMaterial color="#ca8a04" flatShading />
          </mesh>
          <mesh position={[-0.08, 0.3, 0.05]} castShadow>
            <boxGeometry args={[0.06, 0.16, 0.06]} />
            <meshStandardMaterial color="#ca8a04" flatShading />
          </mesh>
        </group>
      );
    case 'tomato':
      return (
        <group position={[0, 0.3, 0]}>
          {/* Tomato vine bush */}
          <mesh castShadow>
            <sphereGeometry args={[0.26, 6, 6]} />
            <meshStandardMaterial color="#15803d" flatShading roughness={0.8} />
          </mesh>
          {/* Red Tomatoes hanging */}
          <mesh position={[0.18, -0.06, 0.12]} castShadow>
            <sphereGeometry args={[0.09, 4, 4]} />
            <meshStandardMaterial color="#ef4444" roughness={0.1} />
          </mesh>
          <mesh position={[-0.16, 0.08, 0.14]} castShadow>
            <sphereGeometry args={[0.09, 4, 4]} />
            <meshStandardMaterial color="#ef4444" roughness={0.1} />
          </mesh>
          <mesh position={[0.02, -0.1, -0.18]} castShadow>
            <sphereGeometry args={[0.09, 4, 4]} />
            <meshStandardMaterial color="#dc2626" roughness={0.1} />
          </mesh>
        </group>
      );
    case 'corn':
      return (
        <group position={[0, 0.35, 0]}>
          {/* Tall corn stalk */}
          <mesh castShadow>
            <cylinderGeometry args={[0.04, 0.05, 0.75, 5]} />
            <meshStandardMaterial color="#166534" flatShading />
          </mesh>
          {/* Corn Ears */}
          <group position={[0.08, 0.12, 0.05]} rotation={[0, 0, -0.5]}>
            {/* Yellow Kernel */}
            <mesh castShadow>
              <cylinderGeometry args={[0.05, 0.05, 0.22, 5]} />
              <meshStandardMaterial color="#fbbf24" flatShading />
            </mesh>
            {/* Green Husk wrapping */}
            <mesh position={[-0.02, -0.05, 0]} rotation={[0, 0, 0.2]}>
              <boxGeometry args={[0.02, 0.15, 0.08]} />
              <meshStandardMaterial color="#15803d" />
            </mesh>
          </group>
        </group>
      );
    case 'carrot':
      return (
        <group position={[0, 0.2, 0]}>
          {/* Leafy green top */}
          <mesh position={[0, 0.15, 0]} castShadow>
            <sphereGeometry args={[0.15, 5, 5]} />
            <meshStandardMaterial color="#22c55e" flatShading />
          </mesh>
          {/* Orange root sticking out of dirt */}
          <mesh rotation={[Math.PI, 0, 0]} castShadow>
            <coneGeometry args={[0.08, 0.24, 6]} />
            <meshStandardMaterial color="#f97316" flatShading roughness={0.6} />
          </mesh>
        </group>
      );
    case 'potato':
      return (
        <group position={[0, 0.18, 0]}>
          {/* Small leafy plant */}
          <mesh castShadow>
            <dodecahedronGeometry args={[0.2, 1]} />
            <meshStandardMaterial color="#166534" flatShading />
          </mesh>
          {/* Dirt mounds under root */}
          <mesh position={[0.08, -0.15, 0]} castShadow>
            <sphereGeometry args={[0.12, 4, 4]} />
            <meshStandardMaterial color="#7c2d12" roughness={0.9} />
          </mesh>
        </group>
      );
    default:
      return null;
  }
}

export default function FarmingManager() {
  const crops = useGameStore((state) => state.crops);

  return (
    <group>
      {crops.map((crop) => {
        // Soil coordinate heights
        const cx = crop.gridPos[0];
        const cz = crop.gridPos[1];
        const cy = getTerrainHeight(cx, cz) + 0.02; // Soil lies flat on ground

        return (
          <group key={crop.id} position={[cx, cy, cz]}>
            {/* Plowed soil square tile */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
              <planeGeometry args={[1.2, 1.2]} />
              <meshStandardMaterial
                color={crop.watered ? '#451a03' : '#78350f'} // dark soil if watered
                roughness={0.95}
                flatShading
              />
            </mesh>

            {/* Growing plant mesh */}
            <CropMesh type={crop.type} stage={crop.growthStage} />

            {/* Water Indicator ring (shows blue ring if dry to remind player) */}
            {!crop.watered && crop.growthStage < crop.maxGrowthStage && (
              <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <ringGeometry args={[0.55, 0.6, 8]} />
                <meshBasicMaterial color="#ef4444" transparent opacity={0.4} />
              </mesh>
            )}

            {/* Watered Indicator ring (blue glow ring if watered) */}
            {crop.watered && crop.growthStage < crop.maxGrowthStage && (
              <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <ringGeometry args={[0.55, 0.6, 8]} />
                <meshBasicMaterial color="#60a5fa" transparent opacity={0.6} />
              </mesh>
            )}
          </group>
        );
      })}
    </group>
  );
}
