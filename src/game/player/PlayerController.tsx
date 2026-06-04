import React, { useEffect, useRef, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from '../../store/useGameStore';
import PlayerMesh from './PlayerMesh';
import { getTerrainHeight } from '../world/WorldTerrain';

export default function PlayerController() {
  const { camera, pointer, raycaster } = useThree();

  // Load state and actions from store
  const playerPos = useGameStore((state) => state.playerPos);
  const playerRot = useGameStore((state) => state.playerRot);
  const updatePlayerPosition = useGameStore((state) => state.updatePlayerPosition);
  const isAttacking = useGameStore((state) => state.isAttacking);
  const isRolling = useGameStore((state) => state.isRolling);
  const rollPlayer = useGameStore((state) => state.rollPlayer);
  const useEquippedItem = useGameStore((state) => state.useEquippedItem);
  const hotbar = useGameStore((state) => state.hotbar);
  const equippedIndex = useGameStore((state) => state.equippedIndex);
  const activeTab = useGameStore((state) => state.activeTab);
  const playerStats = useGameStore((state) => state.playerStats);
  const animals = useGameStore((state) => state.animals);

  const equippedItem = hotbar[equippedIndex] || undefined;

  // Key tracking
  const keys = useRef({
    w: false,
    a: false,
    s: false,
    d: false,
    shift: false,
  });

  const [isMoving, setIsMoving] = useState(false);

  // Setup keyboard and click listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (activeTab !== 'hud') return; // Ignore keys when overlays are active
      
      const key = e.key.toLowerCase();
      if (key === 'w' || key === 'arrowup') keys.current.w = true;
      if (key === 'a' || key === 'arrowleft') keys.current.a = true;
      if (key === 's' || key === 'arrowdown') keys.current.s = true;
      if (key === 'd' || key === 'arrowright') keys.current.d = true;
      if (e.shiftKey) keys.current.shift = true;

      if (e.key === ' ' || e.code === 'Space') {
        e.preventDefault();
        rollPlayer();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (key === 'w' || key === 'arrowup') keys.current.w = false;
      if (key === 'a' || key === 'arrowleft') keys.current.a = false;
      if (key === 's' || key === 'arrowdown') keys.current.s = false;
      if (key === 'd' || key === 'arrowright') keys.current.d = false;
      if (!e.shiftKey) keys.current.shift = false;
    };

    const handleMouseDown = (e: MouseEvent) => {
      if (activeTab !== 'hud') return;
      if (e.button === 0) {
        // Left click: attack / use item
        useEquippedItem();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('mousedown', handleMouseDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('mousedown', handleMouseDown);
    };
  }, [activeTab, rollPlayer, useEquippedItem]);

  // Main physics & rendering update loop
  useFrame((state, delta) => {
    if (activeTab !== 'hud') {
      setIsMoving(false);
      return;
    }

    const { w, a, s, d, shift } = keys.current;

    // 1. Aiming Direction: Raycast mouse onto XZ ground plane
    const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
    const mouseIntersection = new THREE.Vector3();
    raycaster.setFromCamera(pointer, camera);
    raycaster.ray.intersectPlane(plane, mouseIntersection);

    const targetAngle = Math.atan2(
      mouseIntersection.x - playerPos[0],
      mouseIntersection.z - playerPos[2]
    );

    // 2. Movement direction (Projected into camera space)
    let moveX = 0;
    let moveZ = 0;

    // Screen-space camera directions mapping:
    // W: Moves straight up-screen (diagonally away in 3D XZ)
    // S: Moves straight down-screen (diagonally closer in 3D XZ)
    // A: Moves straight left-screen
    // D: Moves straight right-screen
    if (w) {
      moveX -= 0.707;
      moveZ -= 0.707;
    }
    if (s) {
      moveX += 0.707;
      moveZ += 0.707;
    }
    if (a) {
      moveX -= 0.707;
      moveZ += 0.707;
    }
    if (d) {
      moveX += 0.707;
      moveZ -= 0.707;
    }

    const hasInput = moveX !== 0 || moveZ !== 0;

    // Movement speed values
    let currentSpeed = 5.2; // Default walk speed
    
    if (isRolling) {
      currentSpeed = 12.0; // Fast dash
    } else if (shift && hasInput && playerStats.energy > 5) {
      currentSpeed = 8.6; // Sprint
      // Burn small amount of energy
      useGameStore.setState((prev) => ({
        playerStats: {
          ...prev.playerStats,
          energy: Math.max(0, prev.playerStats.energy - delta * 12),
        },
      }));
    }

    let newX = playerPos[0];
    let newZ = playerPos[2];

    if (hasInput || isRolling) {
      // Normalize input vector
      const length = Math.hypot(moveX, moveZ);
      const dx = length > 0 ? moveX / length : 0;
      const dz = length > 0 ? moveZ / length : 0;

      newX += dx * currentSpeed * delta;
      newZ += dz * currentSpeed * delta;

      setIsMoving(!isRolling);
    } else {
      setIsMoving(false);
    }

    // -- PHYSICS COLLISION ENGINE --
    const playerRadius = 0.38;

    // 1. Lake Boundary Check: lake center [-18, 8], radius 16.0
    const lakeDist = Math.hypot(newX - (-18), newZ - 8);
    
    // Deep Water Block (lDist < 16m)
    if (lakeDist < 16.0) {
      const pushX = (newX - (-18)) / lakeDist;
      const pushZ = (newZ - 8) / lakeDist;
      newX = -18 + pushX * 16.0;
      newZ = 8 + pushZ * 16.0;
    } 
    // Beach / Shore Mud slowdown (lDist 16.0 to 18.2m)
    else if (lakeDist >= 16.0 && lakeDist < 18.2) {
      currentSpeed *= 0.45;
      if (hasInput && Math.random() < 0.08) {
        useGameStore.getState().addSkillXp('survival', 1);
      }
    }

    // 2. Placed Buildings Collision Check
    const buildings = useGameStore.getState().buildings;
    buildings.forEach((b) => {
      let bRad = 0.65;
      if (b.type === 'wall') bRad = 0.48;
      if (b.type === 'door') bRad = 0.48;

      const dist = Math.hypot(b.position[0] - newX, b.position[2] - newZ);
      const limit = playerRadius + bRad;
      if (dist < limit) {
        // Sliding: calculate push vector to slide along colliders
        const pushX = (newX - b.position[0]) / dist;
        const pushZ = (newZ - b.position[2]) / dist;
        newX = b.position[0] + pushX * limit;
        newZ = b.position[2] + pushZ * limit;
      }
    });

    // 2.5 Decorative World Objects Collision Check (Cottages, Canoe)
    const decos = [
      { x: 3.5, z: 5.5, rad: 1.25 },  // Cottage 1
      { x: 8.5, z: 11.5, rad: 1.25 }, // Cottage 2
      { x: 1.8, z: 12.8, rad: 1.25 }, // Cottage 3
      { x: -10.2, z: 9.2, rad: 0.9 }   // Canoe
    ];
    decos.forEach((d) => {
      const dist = Math.hypot(d.x - newX, d.z - newZ);
      const limit = playerRadius + d.rad;
      if (dist < limit) {
        const pushX = (newX - d.x) / dist;
        const pushZ = (newZ - d.z) / dist;
        newX = d.x + pushX * limit;
        newZ = d.z + pushZ * limit;
      }
    });

    // 2.6 Walk-in Market Walls & Counter Collision Check (AABB boxes)
    const checkAABBCollision = (cx: number, cz: number, w: number, d: number) => {
      const halfW = w / 2;
      const halfD = d / 2;
      const minX = cx - halfW;
      const maxX = cx + halfW;
      const minZ = cz - halfD;
      const maxZ = cz + halfD;

      const closestX = Math.max(minX, Math.min(newX, maxX));
      const closestZ = Math.max(minZ, Math.min(newZ, maxZ));

      const dx = newX - closestX;
      const dz = newZ - closestZ;
      const dist = Math.hypot(dx, dz);
      if (dist < playerRadius && dist > 0.001) {
        const overlap = playerRadius - dist;
        newX += (dx / dist) * overlap;
        newZ += (dz / dist) * overlap;
      }
    };

    // Market Left wall
    checkAABBCollision(6.0, 3.2, 0.2, 3.4);
    // Market Right wall
    checkAABBCollision(10.0, 3.2, 0.2, 3.4);
    // Market Back wall
    checkAABBCollision(8.0, 1.5, 4.0, 0.2);
    // Market Front Left segment
    checkAABBCollision(6.7, 4.9, 1.4, 0.2);
    // Market Front Right segment
    checkAABBCollision(9.3, 4.9, 1.4, 0.2);
    // Market counter inside
    checkAABBCollision(8.0, 3.1, 2.2, 0.5);

    // 2.7 Animals Collision Check
    animals.forEach((animal) => {
      const dist = Math.hypot(animal.position[0] - newX, animal.position[2] - newZ);
      const limit = playerRadius + 0.35; // combined radius
      if (dist < limit && dist > 0.01) {
        const pushX = (newX - animal.position[0]) / dist;
        const pushZ = (newZ - animal.position[2]) / dist;
        newX = animal.position[0] + pushX * limit;
        newZ = animal.position[2] + pushZ * limit;
      }
    });

    // 3. Foliage Collision Check (Trees, Rocks, Bushes)
    const foliage = useGameStore.getState().foliage;
    foliage.forEach((f) => {
      // Flowers/Mushrooms are walkover decor
      if (f.type === 'flower' || f.type === 'mushroom') return;

      let fRad = 0.45;
      if (f.type === 'rock') fRad = 0.42 * f.scale;
      if (f.type === 'bush') fRad = 0.32 * f.scale;
      if (f.type === 'tree') fRad = 0.42; // trunk size

      const dist = Math.hypot(f.position[0] - newX, f.position[2] - newZ);
      const limit = playerRadius + fRad;
      if (dist < limit) {
        // Sliding push
        const pushX = (newX - f.position[0]) / dist;
        const pushZ = (newZ - f.position[2]) / dist;
        newX = f.position[0] + pushX * limit;
        newZ = f.position[2] + pushZ * limit;
      }
    });

    // Keep player inside boundary limits
    newX = Math.max(-55, Math.min(55, newX));
    newZ = Math.max(-55, Math.min(55, newZ));

    // Align height to terrain mesh
    const newY = getTerrainHeight(newX, newZ) + 0.35; // Character feet offset

    // Update position in Zustand
    updatePlayerPosition(
      [newX, newY, newZ],
      isRolling ? playerRot : targetAngle
    );

    // 4. Camera Follow: Smoothly position camera relative to player position
    // Isometric offset: camera sits back, up, and right
    const camOffset = new THREE.Vector3(12.5, 15.0, 12.5);
    const targetCamPos = new THREE.Vector3(newX, newY, newZ).add(camOffset);
    
    camera.position.lerp(targetCamPos, delta * 4.5); // Smooth lerp camera
    camera.lookAt(newX, newY, newZ);
  });

  return (
    <group position={playerPos} rotation={[0, playerRot, 0]}>
      <PlayerMesh
        isMoving={isMoving}
        isAttacking={isAttacking}
        isRolling={isRolling}
        equippedItemIcon={equippedItem?.icon}
      />
    </group>
  );
}
