import React, { useEffect, useRef, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from '../../store/useGameStore';
import PlayerMesh from './PlayerMesh';
import { getTerrainHeight } from '../world/WorldTerrain';

// Pre-allocated static 3D objects and helpers to prevent garbage collection inside frame loop
const PLANE_XZ = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
const CAM_OFFSET = new THREE.Vector3(12.5, 15.0, 12.5);

function lerpAngle(a: number, b: number, t: number) {
  let difference = b - a;
  // Map difference to (-PI, PI]
  difference = Math.atan2(Math.sin(difference), Math.cos(difference));
  return a + difference * t;
}

export default function PlayerController() {
  const { camera, pointer, raycaster } = useThree();

  const mouseIntersectionRef = useRef(new THREE.Vector3());
  const targetCamPosRef = useRef(new THREE.Vector3());

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
  const cars = useGameStore((state) => state.cars);
  const mountedCarId = useGameStore((state) => state.mountedCarId);
  const mountCar = useGameStore((state) => state.mountCar);
  const dismountCar = useGameStore((state) => state.dismountCar);
  const ships = useGameStore((state) => state.ships);
  const mountedShipId = useGameStore((state) => state.mountedShipId);
  const mountShip = useGameStore((state) => state.mountShip);
  const dismountShip = useGameStore((state) => state.dismountShip);
  const setTab = useGameStore((state) => state.setTab);

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

      if (key === 'f') {
        const state = useGameStore.getState();
        const { playerPos, powerPlant, addFuelToPowerPlant, repairPowerPlant, inventory, hotbar, removeItemFromInventory, cars, mountedCarId, mountCar, dismountCar, ships, mountedShipId, mountShip, dismountShip, setTab } = state;

        // Priority 1: Dismount car if currently driving
        if (mountedCarId) {
          dismountCar();
          return;
        }

        // Priority 1.5: Dismount ship if currently sailing
        if (mountedShipId) {
          dismountShip();
          return;
        }

        // Priority 2: Mount a nearby car
        const nearbyCar = cars.find((c) => Math.hypot(playerPos[0] - c.position[0], playerPos[2] - c.position[2]) < 3.5);
        if (nearbyCar && !mountedShipId) {
          mountCar(nearbyCar.id);
          return;
        }

        // Priority 2.5: Mount a nearby ship
        const nearbyShip = ships.find((s) => Math.hypot(playerPos[0] - s.position[0], playerPos[2] - s.position[2]) < 4.5);
        if (nearbyShip && !mountedCarId) {
          mountShip(nearbyShip.id);
          return;
        }

        // Priority 3: Open Market if near the Big Market building
        const marketDist = Math.hypot(playerPos[0] - (-20), playerPos[2] - 5);
        if (marketDist < 6.0) {
          setTab('market');
          return;
        }

        // Priority 4: Power Plant interaction
        const dist = Math.hypot(playerPos[0] - 12, playerPos[2] - (-10));
        if (dist < 4.0) {
          const ppHeight = getTerrainHeight(12, -10);
          if (!powerPlant.repaired) {
            repairPowerPlant();
            useGameStore.getState().addDamagePopup("Power Plant Repaired!", [12, ppHeight + 2.5, -10], "#22c55e");
          } else {
            let fuelItemIndex = -1;
            let isFuelInHotbar = false;
            for (let i = 0; i < hotbar.length; i++) {
              if (hotbar[i]?.name === 'Fuel Canister') { fuelItemIndex = i; isFuelInHotbar = true; break; }
            }
            if (fuelItemIndex === -1) {
              for (let i = 0; i < inventory.length; i++) {
                if (inventory[i]?.name === 'Fuel Canister') { fuelItemIndex = i; isFuelInHotbar = false; break; }
              }
            }
            if (fuelItemIndex !== -1) {
              removeItemFromInventory(isFuelInHotbar, fuelItemIndex, 1);
              addFuelToPowerPlant(25);
              useGameStore.getState().addDamagePopup("+25% Power Plant Fuel", [12, ppHeight + 2.5, -10], "#eab308");
            } else {
              useGameStore.getState().addDamagePopup("Needs Fuel Canister! ⛽", [12, ppHeight + 2.5, -10], "#ef4444");
            }
          }
        }
      }

      if (e.key === ' ' || e.code === 'Space') {
        e.preventDefault();
        if (useGameStore.getState().mountedCarId || useGameStore.getState().mountedShipId) return; // Disable roll when in car/ship
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
      if (useGameStore.getState().mountedCarId || useGameStore.getState().mountedShipId) return; // Disable attack when in car/ship
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
    const mouseIntersection = mouseIntersectionRef.current;
    raycaster.setFromCamera(pointer, camera);
    raycaster.ray.intersectPlane(PLANE_XZ, mouseIntersection);

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
    
    // Car/Ship driving
    if (mountedCarId) {
      const car = cars.find((c) => c.id === mountedCarId);
      currentSpeed = car ? car.speed : 12.0;
    } else if (mountedShipId) {
      const ship = ships.find((s) => s.id === mountedShipId);
      currentSpeed = ship ? ship.speed : 9.0;
    } else if (isRolling) {
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

    // Determine target rotation (smooth steering when in car/ship, aim tracking when walking)
    let nextRot = playerRot;
    if (mountedCarId || mountedShipId) {
      if (hasInput) {
        const targetMoveAngle = Math.atan2(moveX, moveZ);
        nextRot = lerpAngle(playerRot, targetMoveAngle, delta * 8.0);
      }
    } else {
      nextRot = isRolling ? playerRot : targetAngle;
    }

    // -- PHYSICS COLLISION ENGINE --
    // Larger collision radius for cars/ships
    const playerRadius = mountedCarId ? 0.68 : (mountedShipId ? 0.95 : 0.38);

    // 1. Lake Boundary Check: lake center [-18, 8], radius 16.0 (only if not on ship)
    if (!mountedShipId) {
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
    }

    // 1.5. Ocean & Pier Boundaries
    const isInOcean = newX < -12 && newZ < -12;
    const isOnPier = newX >= -20.5 && newX <= -9.5 && newZ >= -21.2 && newZ <= -18.8;

    if (mountedShipId) {
      // Ship must stay in the ocean quadrant (x < -13 || z < -13)
      if (newX >= -13 && newZ >= -13) {
        if (playerPos[0] < -13) newX = -13.1;
        else if (playerPos[2] < -13) newZ = -13.1;
        else {
          newX = -13.1;
          newZ = -13.1;
        }
      }
    } else {
      // If player is on foot, block them from entering the ocean unless they are on the wooden pier
      if (isInOcean && !isOnPier) {
        if (newX < -12) newX = -12;
        if (newZ < -12) newZ = -12;
      }
      
      // If they are on the pier, restrict them within the platform boundaries so they don't fall off
      if (isOnPier) {
        if (newX < -20.0) newX = -20.0;
        if (newZ < -21.0) newZ = -21.0;
        if (newZ > -19.0) newZ = -19.0;
      }
    }

    if (!mountedShipId) {
      // 2. Placed Buildings Collision Check
      const buildings = useGameStore.getState().buildings;
      buildings.forEach((b) => {
        let bRad = 0.65;
        if (b.type === 'wall') bRad = 0.48;
        if (b.type === 'door') bRad = 0.48;

        const dx = newX - b.position[0];
        const dz = newZ - b.position[2];
        const limit = playerRadius + bRad;
        if (dx * dx + dz * dz > limit * limit) return;

        const dist = Math.sqrt(dx * dx + dz * dz);
        if (dist > 0.001) {
          const pushX = dx / dist;
          const pushZ = dz / dist;
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
        const dx = newX - d.x;
        const dz = newZ - d.z;
        const limit = playerRadius + d.rad;
        if (dx * dx + dz * dz > limit * limit) return;

        const dist = Math.sqrt(dx * dx + dz * dz);
        if (dist > 0.001) {
          const pushX = dx / dist;
          const pushZ = dz / dist;
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
        const dist = Math.sqrt(dx * dx + dz * dz);
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
        const dx = newX - animal.position[0];
        const dz = newZ - animal.position[2];
        const limit = playerRadius + 0.35; // combined radius
        if (dx * dx + dz * dz > limit * limit) return;

        const dist = Math.sqrt(dx * dx + dz * dz);
        if (dist > 0.001) {
          const pushX = dx / dist;
          const pushZ = dz / dist;
          newX = animal.position[0] + pushX * limit;
          newZ = animal.position[2] + pushZ * limit;
        }
      });

      // 3. Foliage Collision Check (Trees, Rocks, Bushes)
      const foliage = useGameStore.getState().foliage;
      foliage.forEach((f) => {
        // Flowers/Mushrooms are walkover decor
        if (f.type === 'flower' || f.type === 'mushroom') return;

        const dx = newX - f.position[0];
        const dz = newZ - f.position[2];
        
        // Fast AABB/distance squared cull: skip anything further than 3 units
        if (dx * dx + dz * dz > 9.0) return;

        let fRad = 0.45;
        if (f.type === 'rock') fRad = 0.42 * f.scale;
        if (f.type === 'bush') fRad = 0.32 * f.scale;
        if (f.type === 'tree') fRad = 0.42; // trunk size

        const dist = Math.sqrt(dx * dx + dz * dz);
        const limit = playerRadius + fRad;
        if (dist < limit && dist > 0.001) {
          // Sliding push
          const pushX = dx / dist;
          const pushZ = dz / dist;
          newX = f.position[0] + pushX * limit;
          newZ = f.position[2] + pushZ * limit;
        }
      });
    }

    // Keep player inside boundary limits
    newX = Math.max(-55, Math.min(55, newX));
    newZ = Math.max(-55, Math.min(55, newZ));

    // Align height to terrain mesh or sea level if on ship
    const newY = mountedShipId ? -1.2 + 0.35 : getTerrainHeight(newX, newZ) + 0.35; // Character feet offset

    // Update position in Zustand
    updatePlayerPosition(
      [newX, newY, newZ],
      nextRot
    );

    // 4. Camera Follow: Smoothly position camera relative to player position
    // Isometric offset: camera sits back, up, and right
    const targetCamPos = targetCamPosRef.current.set(newX, newY, newZ).add(CAM_OFFSET);
    
    camera.position.lerp(targetCamPos, delta * 4.5); // Smooth lerp camera
    camera.lookAt(newX, newY, newZ);
  });

  return (
    <group position={playerPos} rotation={[0, playerRot, 0]}>
      {!mountedCarId && !mountedShipId && (
        <PlayerMesh
          isMoving={isMoving}
          isAttacking={isAttacking}
          isRolling={isRolling}
          equippedItemIcon={equippedItem?.icon}
        />
      )}
    </group>
  );
}
