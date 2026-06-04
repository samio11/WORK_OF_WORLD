import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Html } from '@react-three/drei';
import { useGameStore } from '../store/useGameStore';
import WorldTerrain from '../game/world/WorldTerrain';
import Foliage from '../game/world/Foliage';
import DayNightCycle from '../game/world/DayNightCycle';
import WeatherSystem from '../game/world/WeatherSystem';
import PlayerController from '../game/player/PlayerController';
import ZombieAI from '../game/zombies/ZombieAI';
import BuildingSystem from '../game/building/BuildingSystem';
import FarmingManager from '../game/farming/FarmingManager';
import { getTerrainHeight } from '../game/world/WorldTerrain';
import { FishingBobber3D } from '../game/fishing/FishingMiniGame';
import Decorations, { Deer, Rabbit, Wolf } from '../game/world/Decorations';

// Interactive NPC Mesh Model Clickable
function NPCMesh({ npc }: { npc: any }) {
  const interactNPC = useGameStore((state) => state.interactNPC);
  const playerPos = useGameStore((state) => state.playerPos);

  const distToPlayer = Math.hypot(
    npc.position[0] - playerPos[0],
    npc.position[2] - playerPos[2]
  );
  const isClose = distToPlayer < 4.0; // Can interact if within 4 meters

  const handleClick = (e: any) => {
    e.stopPropagation();
    if (isClose) {
      interactNPC(npc.id);
    }
  };

  return (
    <group
      position={npc.position}
      rotation={[0, npc.rotation, 0]}
      onClick={handleClick}
    >
      {/* Head */}
      <mesh position={[0, 0.85, 0]} castShadow>
        <boxGeometry args={[0.4, 0.4, 0.4]} />
        <meshStandardMaterial color="#ffedd5" flatShading roughness={0.7} />
      </mesh>
      {/* Eyes */}
      <mesh position={[0.08, 0.9, 0.21]}>
        <boxGeometry args={[0.05, 0.05, 0.02]} />
        <meshBasicMaterial color="#000000" />
      </mesh>
      <mesh position={[-0.08, 0.9, 0.21]}>
        <boxGeometry args={[0.05, 0.05, 0.02]} />
        <meshBasicMaterial color="#000000" />
      </mesh>

      {/* NPC Hat / Outfit */}
      {npc.id === 'npc_greg' ? (
        // Trader Shopkeeper Cap
        <mesh position={[0, 1.06, 0.02]} castShadow>
          <boxGeometry args={[0.42, 0.08, 0.44]} />
          <meshStandardMaterial color="#eab308" flatShading />
        </mesh>
      ) : npc.id === 'npc_bobby' ? (
        // Farmer Straw Hat
        <group position={[0, 1.08, 0]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.35, 0.45, 0.04, 6]} />
            <meshStandardMaterial color="#fef08a" flatShading />
          </mesh>
          <mesh position={[0, 0.08, 0]} castShadow>
            <cylinderGeometry args={[0.2, 0.22, 0.12, 6]} />
            <meshStandardMaterial color="#fef08a" flatShading />
          </mesh>
        </group>
      ) : npc.id === 'npc_joe' ? (
        // Fisherman Cap & Fishing Rod
        <group>
          <mesh position={[0, 1.06, 0]} castShadow>
            <cylinderGeometry args={[0.24, 0.26, 0.16, 6]} />
            <meshStandardMaterial color="#1e293b" flatShading />
          </mesh>
          <group position={[0.25, 0.4, 0.22]} rotation={[0.45, 0, 0.1]}>
            <mesh castShadow>
              <cylinderGeometry args={[0.012, 0.012, 1.3]} />
              <meshStandardMaterial color="#78350f" />
            </mesh>
            <mesh position={[0, -0.65, 0]}>
              <cylinderGeometry args={[0.002, 0.002, 0.55]} />
              <meshBasicMaterial color="#ffffff" transparent opacity={0.5} />
            </mesh>
          </group>
        </group>
      ) : (
        // Captain Helmet / Uniform hat
        <mesh position={[0, 1.08, 0.05]} castShadow>
          <boxGeometry args={[0.44, 0.12, 0.42]} />
          <meshStandardMaterial color="#1e3a8a" flatShading />
        </mesh>
      )}

      {/* Body / Clothing */}
      <mesh position={[0, 0.4, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.5, 0.5, 0.35]} />
        <meshStandardMaterial
          color={
            npc.id === 'npc_greg' ? '#b45309' :
            npc.id === 'npc_bobby' ? '#16a34a' :
            npc.id === 'npc_joe' ? '#0f766e' : '#1e3a8a'
          }
          flatShading
          roughness={0.8}
        />
      </mesh>

      {/* Legs */}
      <mesh position={[-0.15, 0.08, 0]} castShadow>
        <boxGeometry args={[0.16, 0.3, 0.18]} />
        <meshStandardMaterial color="#1e293b" flatShading />
      </mesh>
      <mesh position={[0.15, 0.08, 0]} castShadow>
        <boxGeometry args={[0.16, 0.3, 0.18]} />
        <meshStandardMaterial color="#1e293b" flatShading />
      </mesh>

      {/* Interactive Helper Ring */}
      {isClose && (
        <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.65, 0.72, 8]} />
          <meshBasicMaterial color="#eab308" transparent opacity={0.8} />
        </mesh>
      )}
    </group>
  );
}

// 3D Loot Crate dropped on ground
function LootDropMesh({ drop }: { drop: any }) {
  const meshRef = useRef<THREE.Group>(null);
  const collectLootDrop = useGameStore((state) => state.collectLootDrop);
  const playerPos = useGameStore((state) => state.playerPos);

  // Bob up and down and rotate
  useFrame((state) => {
    if (meshRef.current) {
      const time = state.clock.getElapsedTime();
      meshRef.current.rotation.y = time * 1.5;
      meshRef.current.position.y = drop.position[1] + Math.sin(time * 3.0) * 0.06;

      // Auto collect when player is extremely close (within 1.2m)
      const dx = playerPos[0] - drop.position[0];
      const dz = playerPos[2] - drop.position[2];
      if (Math.hypot(dx, dz) < 1.2) {
        collectLootDrop(drop.id);
      }
    }
  });

  return (
    <group ref={meshRef} position={drop.position}>
      {/* Tiny Box */}
      <mesh castShadow>
        <boxGeometry args={[0.3, 0.3, 0.3]} />
        <meshStandardMaterial color="#d97706" roughness={0.85} flatShading />
      </mesh>
      {/* Metal banding */}
      <mesh>
        <boxGeometry args={[0.32, 0.06, 0.32]} />
        <meshStandardMaterial color="#64748b" metalness={0.7} />
      </mesh>
      {/* Small floating helper light */}
      <pointLight color="#fbbf24" intensity={0.4} distance={2.5} />
    </group>
  );
}

// Scene updates wrapper inside Canvas
function GameScene() {
  const npcs = useGameStore((state) => state.npcs);
  const lootDrops = useGameStore((state) => state.lootDrops);
  const isGameStarted = useGameStore((state) => state.isGameStarted);
  const bulletTrails = useGameStore((state) => state.bulletTrails);
  const animals = useGameStore((state) => state.animals);
  const damagePopups = useGameStore((state) => state.damagePopups);

  return (
    <group>
      {/* Sky lighting cycle */}
      <DayNightCycle />

      {/* Dynamic weather changes */}
      <WeatherSystem />

      {/* Procedural ground terrain */}
      <WorldTerrain />

      {/* Instanced trees, stones, bushes */}
      <Foliage />

      {/* Snap grid built walls, doors, lights */}
      <BuildingSystem />

      {/* Tilled soils and vegetable models */}
      <FarmingManager />

      {/* Village houses, shop counter, canoes, and wiggling fish */}
      <Decorations />

      {/* Animals */}
      {animals.map((animal) => {
        if (animal.type === 'deer') {
          return <Deer key={animal.id} pos={animal.position} rot={animal.rotation} state={animal.state} />;
        } else if (animal.type === 'rabbit') {
          return <Rabbit key={animal.id} pos={animal.position} rot={animal.rotation} state={animal.state} />;
        } else if (animal.type === 'wolf') {
          return <Wolf key={animal.id} pos={animal.position} rot={animal.rotation} state={animal.state} />;
        }
        return null;
      })}

      {/* Floating RPG Damage Popups */}
      {damagePopups.map((popup) => (
        <group key={popup.id} position={popup.position}>
          <Html center pointerEvents="none">
            <div
              style={{ color: popup.color }}
              className="text-xs font-black animate-bounce font-mono drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] select-none whitespace-nowrap"
            >
              {popup.text}
            </div>
          </Html>
        </group>
      ))}

      {/* Zombies array meshes and HP meters */}
      <ZombieAI />

      {/* Clickable NPC survivors */}
      {npcs.map((npc) => (
        <NPCMesh key={npc.id} npc={npc} />
      ))}

      {/* Ground loot drops */}
      {lootDrops.map((drop) => (
        <LootDropMesh key={drop.id} drop={drop} />
      ))}

      {/* 3D floating fishing bobber */}
      <FishingBobber3D />

      {/* Bullet trails */}
      {bulletTrails.map((trail) => (
        <line key={trail.id}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              args={[
                new Float32Array([
                  trail.start[0], trail.start[1], trail.start[2],
                  trail.end[0], trail.end[1], trail.end[2]
                ]),
                3
              ]}
            />
          </bufferGeometry>
          <lineBasicMaterial color="#facc15" transparent opacity={0.85} />
        </line>
      ))}

      {/* Keyboard movement controller and camera-follow */}
      {isGameStarted && <PlayerController />}
    </group>
  );
}

export default function GameCanvas() {
  return (
    <div className="w-full h-full bg-slate-950 absolute inset-0 select-none">
      <Canvas
        shadows
        camera={{
          fov: 38,
          near: 0.1,
          far: 220,
          position: [12.5, 15.0, 12.5],
        }}
      >
        <GameScene />
      </Canvas>
    </div>
  );
}
