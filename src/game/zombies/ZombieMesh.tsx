import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { ZombieType, ZombieState } from '../../types/game';

interface ZombieMeshProps {
  type: ZombieType;
  state: ZombieState;
  isHit?: boolean;
}

export default function ZombieMesh({ type, state, isHit }: ZombieMeshProps) {
  const headRef = useRef<THREE.Mesh>(null);
  const leftLegRef = useRef<THREE.Mesh>(null);
  const rightLegRef = useRef<THREE.Mesh>(null);
  const leftArmRef = useRef<THREE.Mesh>(null);
  const rightArmRef = useRef<THREE.Mesh>(null);

  // Set colors and scale based on ZombieType
  let skinColor = '#22c55e'; // Green Walker
  let shirtColor = '#475569';
  let pantsColor = '#1e293b';
  let eyeColor = '#ef4444'; // Red eyes
  let scale: [number, number, number] = [1.0, 1.0, 1.0];

  if (type === 'runner') {
    skinColor = '#16a34a';
    shirtColor = '#b91c1c'; // Red shirt for speed
    pantsColor = '#0f172a';
    scale = [0.85, 0.9, 0.85];
  } else if (type === 'tank') {
    skinColor = '#15803d';
    shirtColor = '#3f3f46'; // Heavy dark grey shirt
    pantsColor = '#18181b';
    scale = [1.6, 1.6, 1.6];
  } else if (type === 'toxic') {
    skinColor = '#84cc16'; // Acid lime green
    shirtColor = '#4d7c0f';
    pantsColor = '#1a2e05';
    eyeColor = '#a3e635'; // Glowing toxic eyes
    scale = [1.05, 1.05, 1.05];
  } else if (type === 'boss') {
    skinColor = '#1e1b4b'; // Dark purple-blue
    shirtColor = '#701a75'; // Magenta boss clothing
    pantsColor = '#2e1065';
    eyeColor = '#f472b6'; // Glowing pink eyes
    scale = [2.4, 2.4, 2.4];
  }

  useFrame((sState) => {
    const time = sState.clock.getElapsedTime();
    const isMoving = state === 'chase';
    const isAttacking = state === 'attack';

    // 1. Classic Zombie Arm posture: raised forward
    if (leftArmRef.current && rightArmRef.current) {
      leftArmRef.current.rotation.x = -Math.PI / 2.2;
      rightArmRef.current.rotation.x = -Math.PI / 2.2;

      // Zombie arm sway bobbing
      const sway = Math.sin(time * 3.0) * 0.08;
      leftArmRef.current.rotation.y = sway;
      rightArmRef.current.rotation.y = -sway;
    }

    // 2. Walking shuffle animation
    if (isMoving) {
      const walkSpeed = type === 'runner' ? 16 : 8;
      const legAngle = Math.sin(time * walkSpeed) * 0.35;

      if (leftLegRef.current && rightLegRef.current) {
        leftLegRef.current.rotation.x = legAngle;
        rightLegRef.current.rotation.x = -legAngle;
      }
    } else {
      if (leftLegRef.current && rightLegRef.current) {
        leftLegRef.current.rotation.x = 0;
        rightLegRef.current.rotation.x = 0;
      }
    }

    // 3. Bite Attack lunging arms
    if (isAttacking && leftArmRef.current && rightArmRef.current) {
      const strike = Math.sin(time * 20) * 0.5;
      leftArmRef.current.rotation.x = -Math.PI / 2.2 - strike;
      rightArmRef.current.rotation.x = -Math.PI / 2.2 - strike;
    }
  });

  return (
    <group scale={scale}>
      {/* Head */}
      <mesh ref={headRef} position={[0, 0.85, 0]} castShadow>
        <boxGeometry args={[0.4, 0.4, 0.4]} />
        <meshStandardMaterial
          color={isHit ? '#ef4444' : skinColor}
          emissive={isHit ? '#ef4444' : '#000000'}
          flatShading={true}
          roughness={0.8}
        />
      </mesh>

      {/* Spooky Glowing Eyes */}
      <mesh position={[0.08, 0.9, 0.21]} castShadow>
        <boxGeometry args={[0.06, 0.06, 0.02]} />
        <meshBasicMaterial color={eyeColor} />
      </mesh>
      <mesh position={[-0.08, 0.9, 0.21]} castShadow>
        <boxGeometry args={[0.06, 0.06, 0.02]} />
        <meshBasicMaterial color={eyeColor} />
      </mesh>

      {/* Body / Shirt */}
      <mesh position={[0, 0.4, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.5, 0.5, 0.35]} />
        <meshStandardMaterial
          color={isHit ? '#ef4444' : shirtColor}
          emissive={isHit ? '#ef4444' : '#000000'}
          flatShading={true}
          roughness={0.8}
        />
      </mesh>

      {/* Left Leg */}
      <mesh ref={leftLegRef} position={[-0.15, 0.08, 0]} castShadow>
        <boxGeometry args={[0.16, 0.3, 0.18]} />
        <meshStandardMaterial
          color={isHit ? '#ef4444' : pantsColor}
          emissive={isHit ? '#ef4444' : '#000000'}
          flatShading={true}
        />
      </mesh>

      {/* Right Leg */}
      <mesh ref={rightLegRef} position={[0.15, 0.08, 0]} castShadow>
        <boxGeometry args={[0.16, 0.3, 0.18]} />
        <meshStandardMaterial
          color={isHit ? '#ef4444' : pantsColor}
          emissive={isHit ? '#ef4444' : '#000000'}
          flatShading={true}
        />
      </mesh>

      {/* Left Arm (raised) */}
      <mesh ref={leftArmRef} position={[-0.32, 0.45, 0.1]} castShadow>
        <boxGeometry args={[0.14, 0.4, 0.14]} />
        <meshStandardMaterial
          color={isHit ? '#ef4444' : skinColor}
          emissive={isHit ? '#ef4444' : '#000000'}
          flatShading={true}
        />
      </mesh>

      {/* Right Arm (raised) */}
      <mesh ref={rightArmRef} position={[0.32, 0.45, 0.1]} castShadow>
        <boxGeometry args={[0.14, 0.4, 0.14]} />
        <meshStandardMaterial
          color={isHit ? '#ef4444' : skinColor}
          emissive={isHit ? '#ef4444' : '#000000'}
          flatShading={true}
        />
      </mesh>

      {/* Toxic spots for toxic type */}
      {type === 'toxic' && (
        <mesh position={[0.15, 0.55, 0.15]} castShadow>
          <sphereGeometry args={[0.08, 4, 4]} />
          <meshBasicMaterial color="#a3e635" />
        </mesh>
      )}

      {/* Boss Horns for Boss type */}
      {type === 'boss' && (
        <group>
          <mesh position={[0.18, 1.15, 0]} castShadow>
            <coneGeometry args={[0.08, 0.3, 4]} />
            <meshStandardMaterial color="#c084fc" flatShading />
          </mesh>
          <mesh position={[-0.18, 1.15, 0]} castShadow>
            <coneGeometry args={[0.08, 0.3, 4]} />
            <meshStandardMaterial color="#c084fc" flatShading />
          </mesh>
        </group>
      )}
    </group>
  );
}
