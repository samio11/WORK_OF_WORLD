import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface PlayerMeshProps {
  isMoving: boolean;
  isAttacking: boolean;
  isRolling: boolean;
  equippedItemIcon?: string;
}

export default function PlayerMesh({ isMoving, isAttacking, isRolling, equippedItemIcon }: PlayerMeshProps) {
  const groupRef = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Mesh>(null);
  const leftLegRef = useRef<THREE.Mesh>(null);
  const rightLegRef = useRef<THREE.Mesh>(null);
  const leftArmRef = useRef<THREE.Mesh>(null);
  const rightArmRef = useRef<THREE.Mesh>(null);
  const weaponRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    
    // Reset rotations
    if (leftLegRef.current && rightLegRef.current && leftArmRef.current && rightArmRef.current && headRef.current) {
      leftLegRef.current.rotation.x = 0;
      rightLegRef.current.rotation.x = 0;
      leftArmRef.current.rotation.x = 0;
      rightArmRef.current.rotation.x = 0;
      headRef.current.rotation.y = 0;
      headRef.current.position.y = 0.85; // Head default offset
    }

    if (groupRef.current) {
      groupRef.current.rotation.z = 0;
      groupRef.current.position.y = 0;
    }

    // 1. Walking animation: Swing limbs back and forth
    if (isMoving && !isRolling) {
      const swingSpeed = 14;
      const angle = Math.sin(time * swingSpeed) * 0.45;

      if (leftLegRef.current && rightLegRef.current) {
        leftLegRef.current.rotation.x = angle;
        rightLegRef.current.rotation.x = -angle;
      }
      if (leftArmRef.current && rightArmRef.current && !isAttacking) {
        leftArmRef.current.rotation.x = -angle * 0.8;
        rightArmRef.current.rotation.x = angle * 0.8;
      }
      if (headRef.current) {
        // Bob head
        headRef.current.position.y = 0.85 + Math.abs(Math.sin(time * swingSpeed)) * 0.04;
      }
    }

    // 2. Attack swing animation
    if (isAttacking && rightArmRef.current) {
      // Fast forward strike swing
      const strikeProgress = Math.sin(time * 25) * 0.8 + 0.8;
      rightArmRef.current.rotation.x = -Math.PI / 3 - strikeProgress;
      if (weaponRef.current) {
        weaponRef.current.rotation.x = -strikeProgress * 0.5;
      }
    }

    // 3. Dodge Roll: Spin player mesh in 360-degree roll
    if (isRolling && groupRef.current) {
      const rollProgress = (time * 10) % (Math.PI * 2);
      groupRef.current.rotation.y = rollProgress * 2.0;
      groupRef.current.position.y = Math.sin(rollProgress) * 0.4;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Head */}
      <mesh ref={headRef} position={[0, 0.85, 0]} castShadow>
        <boxGeometry args={[0.4, 0.4, 0.4]} />
        <meshStandardMaterial color="#fed7aa" flatShading={true} roughness={0.8} /> {/* Skin */}
      </mesh>

      {/* Eyes */}
      <mesh position={[0.08, 0.9, 0.21]} castShadow>
        <boxGeometry args={[0.06, 0.06, 0.02]} />
        <meshStandardMaterial color="#020617" flatShading={true} />
      </mesh>
      <mesh position={[-0.08, 0.9, 0.21]} castShadow>
        <boxGeometry args={[0.06, 0.06, 0.02]} />
        <meshStandardMaterial color="#020617" flatShading={true} />
      </mesh>

      {/* Hair / Cap */}
      <mesh position={[0, 1.05, -0.02]} castShadow>
        <boxGeometry args={[0.42, 0.1, 0.42]} />
        <meshStandardMaterial color="#b45309" flatShading={true} /> {/* Brown */}
      </mesh>

      {/* Body / Shirt */}
      <mesh position={[0, 0.4, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.5, 0.5, 0.35]} />
        <meshStandardMaterial color="#0284c7" flatShading={true} roughness={0.7} /> {/* Sky blue shirt */}
      </mesh>

      {/* Survival Backpack Model */}
      <group position={[0, 0.42, -0.2]}>
        {/* Main Pack */}
        <mesh castShadow>
          <boxGeometry args={[0.34, 0.4, 0.16]} />
          <meshStandardMaterial color="#854d0e" flatShading roughness={0.9} /> {/* Brown Leather */}
        </mesh>
        {/* Pouch */}
        <mesh position={[0, -0.08, -0.09]} castShadow>
          <boxGeometry args={[0.24, 0.18, 0.06]} />
          <meshStandardMaterial color="#a16207" flatShading />
        </mesh>
        {/* Sleeping Bag Roll on Top */}
        <mesh position={[0, 0.23, -0.02]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.08, 0.08, 0.38, 6]} />
          <meshStandardMaterial color="#0369a1" flatShading /> {/* Cyan/Blue sleeping roll */}
        </mesh>
      </group>

      {/* Left Leg */}
      <mesh ref={leftLegRef} position={[-0.15, 0.08, 0]} castShadow>
        <boxGeometry args={[0.16, 0.3, 0.18]} />
        <meshStandardMaterial color="#1e293b" flatShading={true} /> {/* Dark pants */}
      </mesh>

      {/* Right Leg */}
      <mesh ref={rightLegRef} position={[0.15, 0.08, 0]} castShadow>
        <boxGeometry args={[0.16, 0.3, 0.18]} />
        <meshStandardMaterial color="#1e293b" flatShading={true} />
      </mesh>

      {/* Left Arm */}
      <mesh ref={leftArmRef} position={[-0.32, 0.45, 0]} castShadow>
        <boxGeometry args={[0.14, 0.4, 0.14]} />
        <meshStandardMaterial color="#38bdf8" flatShading={true} /> {/* Shirt sleeve color */}
      </mesh>

      {/* Right Arm */}
      <mesh ref={rightArmRef} position={[0.32, 0.45, 0]} castShadow>
        <group position={[0, -0.15, 0]}>
          <mesh castShadow>
            <boxGeometry args={[0.14, 0.4, 0.14]} />
            <meshStandardMaterial color="#38bdf8" flatShading={true} />
          </mesh>
          
          {/* Equipped Weapon / Tool Holder */}
          {equippedItemIcon && (
            <group ref={weaponRef} position={[0, -0.22, 0.15]} rotation={[Math.PI / 2, 0, 0]}>
              {/* Render a procedural tool/weapon based on icon */}
              {equippedItemIcon === '🔪' && (
                <group>
                  {/* Knife Blade */}
                  <mesh castShadow>
                    <boxGeometry args={[0.04, 0.35, 0.08]} />
                    <meshStandardMaterial color="#94a3b8" metalness={0.85} roughness={0.1} />
                  </mesh>
                  {/* Knife Handle */}
                  <mesh position={[0, -0.2, 0]} castShadow>
                    <boxGeometry args={[0.06, 0.12, 0.08]} />
                    <meshStandardMaterial color="#78350f" roughness={0.9} />
                  </mesh>
                </group>
              )}

              {equippedItemIcon === '🪓' && (
                <group>
                  {/* Axe Handle */}
                  <mesh castShadow>
                    <cylinderGeometry args={[0.03, 0.03, 0.6, 6]} />
                    <meshStandardMaterial color="#78350f" roughness={0.9} />
                  </mesh>
                  {/* Axe Head */}
                  <mesh position={[0.08, 0.22, 0]} castShadow>
                    <boxGeometry args={[0.2, 0.12, 0.06]} />
                    <meshStandardMaterial color="#64748b" metalness={0.8} />
                  </mesh>
                </group>
              )}

              {equippedItemIcon === '⛏️' && (
                <group>
                  {/* Pickaxe Handle */}
                  <mesh castShadow>
                    <cylinderGeometry args={[0.03, 0.03, 0.6, 6]} />
                    <meshStandardMaterial color="#78350f" roughness={0.9} />
                  </mesh>
                  {/* Pickaxe Curved Head */}
                  <mesh position={[0, 0.22, 0]} castShadow>
                    <boxGeometry args={[0.42, 0.06, 0.05]} />
                    <meshStandardMaterial color="#475569" metalness={0.8} />
                  </mesh>
                </group>
              )}

              {equippedItemIcon === '⚔️' && (
                <group>
                  {/* Sword Blade */}
                  <mesh position={[0, 0.2, 0]} castShadow>
                    <boxGeometry args={[0.05, 0.65, 0.08]} />
                    <meshStandardMaterial color="#cbd5e1" metalness={0.95} roughness={0.05} />
                  </mesh>
                  {/* Sword Crossguard */}
                  <mesh position={[0, -0.15, 0]} castShadow>
                    <boxGeometry args={[0.22, 0.05, 0.08]} />
                    <meshStandardMaterial color="#fbbf24" metalness={0.8} />
                  </mesh>
                  {/* Sword Handle */}
                  <mesh position={[0, -0.28, 0]} castShadow>
                    <cylinderGeometry args={[0.035, 0.035, 0.2, 6]} />
                    <meshStandardMaterial color="#78350f" roughness={0.95} />
                  </mesh>
                </group>
              )}

              {equippedItemIcon === '🏹' && (
                <group>
                  {/* Bow Arch */}
                  <mesh castShadow>
                    <torusGeometry args={[0.25, 0.02, 6, 24, Math.PI]} />
                    <meshStandardMaterial color="#b45309" roughness={0.8} />
                  </mesh>
                  {/* Bowstring */}
                  <mesh position={[-0.25, 0, 0]} castShadow>
                    <cylinderGeometry args={[0.005, 0.005, 0.5]} />
                    <meshStandardMaterial color="#ffffff" />
                  </mesh>
                </group>
              )}

              {/* Default blocky tool if generic */}
              {!['🔪', '🪓', '⛏️', '⚔️', '🏹'].includes(equippedItemIcon) && (
                <mesh castShadow>
                  <boxGeometry args={[0.08, 0.25, 0.08]} />
                  <meshStandardMaterial color="#f43f5e" />
                </mesh>
              )}
            </group>
          )}
        </group>
      </mesh>
    </group>
  );
}
