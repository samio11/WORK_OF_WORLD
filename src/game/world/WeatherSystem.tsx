import React, { useRef, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from '../../store/useGameStore';
import { GameAudio } from '../../lib/audio';

// Wind streaks blowing horizontally
function WindStreaks({ playerPos }: { playerPos: [number, number, number] }) {
  const count = 12;
  const lineRef = useRef<THREE.Group>(null);
  
  const windStreaksData = useMemo(() => {
    const list: Array<{ pos: [number, number, number]; length: number; speed: number }> = [];
    for (let i = 0; i < count; i++) {
      list.push({
        pos: [
          (Math.random() - 0.5) * 60,
          2.0 + Math.random() * 4.0, // height above terrain
          (Math.random() - 0.5) * 60,
        ],
        length: 3.0 + Math.random() * 5.0,
        speed: 18.0 + Math.random() * 12.0,
      });
    }
    return list;
  }, []);

  useFrame((state, delta) => {
    if (lineRef.current) {
      lineRef.current.position.set(playerPos[0], 0, playerPos[2]);
      
      lineRef.current.children.forEach((child, idx) => {
        const data = windStreaksData[idx];
        child.position.x -= data.speed * delta; // blow West
        // Recycle line if it goes too far
        if (child.position.x < -30) {
          child.position.x = 30;
          child.position.z = (Math.random() - 0.5) * 60;
          child.position.y = 2.0 + Math.random() * 4.0;
        }
      });
    }
  });

  return (
    <group ref={lineRef}>
      {windStreaksData.map((w, i) => (
        <group key={i} position={w.pos}>
          {/* Flat horizontal line using cylinder */}
          <mesh rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.012, 0.012, w.length, 4]} />
            <meshBasicMaterial color="#ffffff" transparent opacity={0.16} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

export default function WeatherSystem() {
  const { scene } = useThree();
  const weather = useGameStore((state) => state.weather);
  const season = useGameStore((state) => state.season);
  const worldTime = useGameStore((state) => state.worldTime);
  const playerPos = useGameStore((state) => state.playerPos);

  const rainRef = useRef<THREE.Points>(null);
  const snowRef = useRef<THREE.Points>(null);
  const firefliesRef = useRef<THREE.Points>(null);
  const flashLightRef = useRef<THREE.PointLight>(null);

  // 1. Rain particle data
  const rainCount = 450;
  const rainData = useMemo(() => {
    const positions = new Float32Array(rainCount * 3);
    const velocities = new Float32Array(rainCount);
    for (let i = 0; i < rainCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 45;
      positions[i * 3 + 1] = Math.random() * 20;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 45;
      velocities[i] = 10 + Math.random() * 12;
    }
    return { positions, velocities };
  }, []);

  // 2. Snow particle data (winter)
  const snowCount = 280;
  const snowData = useMemo(() => {
    const positions = new Float32Array(snowCount * 3);
    const drifts = new Float32Array(snowCount);
    const speeds = new Float32Array(snowCount);
    for (let i = 0; i < snowCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 55;
      positions[i * 3 + 1] = Math.random() * 22;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 55;
      drifts[i] = Math.random() * Math.PI * 2; // drift phase
      speeds[i] = 1.5 + Math.random() * 2.5; // fall speed
    }
    return { positions, drifts, speeds };
  }, []);

  // 3. Night fireflies
  const fireflyCount = 40;
  const firefliesData = useMemo(() => {
    const positions = new Float32Array(fireflyCount * 3);
    const phases = new Float32Array(fireflyCount);
    for (let i = 0; i < fireflyCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 35;
      positions[i * 3 + 1] = 0.5 + Math.random() * 3.5;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 35;
      phases[i] = Math.random() * Math.PI * 2;
    }
    return { positions, phases };
  }, []);

  // 4. Lightning state
  const lightningState = useRef({
    nextFlashTime: 0,
    flashDuration: 0,
    intensity: 0,
  });

  const isWinter = season === 'winter';
  const isSnowing = isWinter && (weather === 'rain' || weather === 'fog');

  useFrame((state, delta) => {
    const time = state.clock.getElapsedTime();

    // -- FOG DENSITY --
    let targetFogDensity = isWinter ? 0.008 : 0.005;
    if (weather === 'rain') targetFogDensity = isWinter ? 0.022 : 0.020;
    if (weather === 'storm') targetFogDensity = 0.035;
    if (weather === 'fog') targetFogDensity = isWinter ? 0.065 : 0.085;

    if (scene.fog && 'density' in scene.fog) {
      const fogExp = scene.fog as THREE.FogExp2;
      fogExp.density = THREE.MathUtils.lerp(fogExp.density, targetFogDensity, delta * 2.0);
    }

    // -- RAIN ANIMATION --
    if (rainRef.current && (weather === 'rain' || weather === 'storm') && !isSnowing) {
      const posAttr = rainRef.current.geometry.attributes.position;
      const positions = posAttr.array as Float32Array;
      const speedMultiplier = weather === 'storm' ? 1.5 : 1.0;

      rainRef.current.position.set(playerPos[0], 0, playerPos[2]);

      for (let i = 0; i < rainCount; i++) {
        positions[i * 3 + 1] -= rainData.velocities[i] * delta * speedMultiplier;
        if (positions[i * 3 + 1] < 0) {
          positions[i * 3] = (Math.random() - 0.5) * 45;
          positions[i * 3 + 1] = 16 + Math.random() * 8;
          positions[i * 3 + 2] = (Math.random() - 0.5) * 45;
        }
      }
      posAttr.needsUpdate = true;
    }

    // -- SNOWFALL ANIMATION --
    if (snowRef.current && isSnowing) {
      const posAttr = snowRef.current.geometry.attributes.position;
      const positions = posAttr.array as Float32Array;

      snowRef.current.position.set(playerPos[0], 0, playerPos[2]);

      for (let i = 0; i < snowCount; i++) {
        // Gentle downward drift
        positions[i * 3 + 1] -= snowData.speeds[i] * delta;
        // Horizontal sway
        positions[i * 3] += Math.sin(time * 0.8 + snowData.drifts[i]) * 0.015;
        positions[i * 3 + 2] += Math.cos(time * 0.6 + snowData.drifts[i]) * 0.012;

        if (positions[i * 3 + 1] < 0) {
          positions[i * 3] = (Math.random() - 0.5) * 55;
          positions[i * 3 + 1] = 18 + Math.random() * 8;
          positions[i * 3 + 2] = (Math.random() - 0.5) * 55;
        }
      }
      posAttr.needsUpdate = true;
    }

    // -- FIREFLIES (Night only, summer/rainy) --
    const isNight = worldTime > 19.5 || worldTime < 5.0;
    if (firefliesRef.current && isNight && weather !== 'storm' && !isWinter) {
      const posAttr = firefliesRef.current.geometry.attributes.position;
      const positions = posAttr.array as Float32Array;

      firefliesRef.current.position.set(playerPos[0], 0, playerPos[2]);

      for (let i = 0; i < fireflyCount; i++) {
        const index = i * 3;
        const phase = firefliesData.phases[i] + time * 1.5;
        positions[index + 1] += Math.sin(phase) * 0.005;
        positions[index] += Math.cos(phase * 0.8) * 0.006;
        positions[index + 2] += Math.sin(phase * 1.2) * 0.006;

        const rx = positions[index];
        const rz = positions[index + 2];
        if (Math.hypot(rx, rz) > 22.0) {
          positions[index] = (Math.random() - 0.5) * 20;
          positions[index + 2] = (Math.random() - 0.5) * 20;
          positions[index + 1] = 0.5 + Math.random() * 3;
        }
      }
      posAttr.needsUpdate = true;
    }

    // -- LIGHTNING --
    if (weather === 'storm') {
      const lightning = lightningState.current;
      const now = Date.now();
      if (now > lightning.nextFlashTime) {
        lightning.flashDuration = now + 100 + Math.random() * 150;
        lightning.nextFlashTime = now + 6000 + Math.random() * 14000;
        lightning.intensity = 1.0;
        GameAudio.playSfx('zombie_growl');
      }
      if (now < lightning.flashDuration) {
        lightning.intensity = Math.random() > 0.4 ? 10.0 : 0.0;
      } else {
        lightning.intensity = 0.0;
      }
      if (flashLightRef.current) {
        flashLightRef.current.intensity = lightning.intensity;
      }
    } else {
      if (flashLightRef.current) flashLightRef.current.intensity = 0;
    }
  });

  const showRain = (weather === 'rain' || weather === 'storm') && !isSnowing;
  const isNightTime = worldTime > 19.5 || worldTime < 5.0;

  return (
    <group>
      {/* Three.js Fog setup */}
      <fogExp2 attach="fog" args={['#38bdf8', 0.005]} />

      {/* Wind Streaks */}
      <WindStreaks playerPos={playerPos} />

      {/* Rain Rendering */}
      {showRain && (
        <points ref={rainRef}>
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" args={[rainData.positions, 3]} />
          </bufferGeometry>
          <pointsMaterial
            color="#93c5fd"
            size={0.14}
            transparent
            opacity={0.65}
            sizeAttenuation
          />
        </points>
      )}

      {/* Snow Rendering (winter) */}
      {isSnowing && (
        <points ref={snowRef}>
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" args={[snowData.positions, 3]} />
          </bufferGeometry>
          <pointsMaterial
            color="#f8fafc"
            size={0.22}
            transparent
            opacity={0.88}
            sizeAttenuation
          />
        </points>
      )}

      {/* Fireflies (Night, non-winter) */}
      {isNightTime && weather !== 'storm' && !isWinter && (
        <points ref={firefliesRef}>
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" args={[firefliesData.positions, 3]} />
          </bufferGeometry>
          <pointsMaterial
            color="#bef264"
            size={0.25}
            transparent
            opacity={0.8}
            sizeAttenuation
          />
        </points>
      )}

      {/* Lightning PointLight */}
      <pointLight
        ref={flashLightRef}
        color="#ffffff"
        position={[playerPos[0] + 5, 20, playerPos[2] + 5]}
        distance={100}
        intensity={0}
      />
    </group>
  );
}
