import React, { useRef, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from '../../store/useGameStore';
import { GameAudio } from '../../lib/audio';

export default function WeatherSystem() {
  const { scene } = useThree();
  const weather = useGameStore((state) => state.weather);
  const worldTime = useGameStore((state) => state.worldTime);
  const playerPos = useGameStore((state) => state.playerPos);

  const rainRef = useRef<THREE.Points>(null);
  const firefliesRef = useRef<THREE.Points>(null);
  const flashLightRef = useRef<THREE.PointLight>(null);

  // 1. Generate rain particle vertices
  const rainCount = 400;
  const rainData = useMemo(() => {
    const positions = new Float32Array(rainCount * 3);
    const velocities = new Float32Array(rainCount);
    for (let i = 0; i < rainCount; i++) {
      // Spawn in a box centered around the player
      positions[i * 3] = (Math.random() - 0.5) * 45; // X
      positions[i * 3 + 1] = Math.random() * 20; // Y (height)
      positions[i * 3 + 2] = (Math.random() - 0.5) * 45; // Z
      velocities[i] = 10 + Math.random() * 12; // falling speed
    }
    return { positions, velocities };
  }, []);

  // 2. Generate night firefly particles
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

  // 3. Lightning states
  const lightningState = useRef({
    nextFlashTime: 0,
    flashDuration: 0,
    intensity: 0,
  });

  // Ticks
  useFrame((state, delta) => {
    const time = state.clock.getElapsedTime();

    // -- FOG DENSITY SETTING --
    // We update scene fog density based on weather
    let targetFogDensity = 0.005; // clear
    if (weather === 'rain') targetFogDensity = 0.02;
    if (weather === 'storm') targetFogDensity = 0.035;
    if (weather === 'fog') targetFogDensity = 0.085; // thick fog

    if (scene.fog && 'density' in scene.fog) {
      const fogExp = scene.fog as THREE.FogExp2;
      fogExp.density = THREE.MathUtils.lerp(fogExp.density, targetFogDensity, delta * 2.0);
    }

    // -- RAIN ANIMATION --
    if (rainRef.current && (weather === 'rain' || weather === 'storm')) {
      const posAttr = rainRef.current.geometry.attributes.position;
      const positions = posAttr.array as Float32Array;
      const speedMultiplier = weather === 'storm' ? 1.5 : 1.0;

      // Keep rain centered around the player position
      rainRef.current.position.set(playerPos[0], 0, playerPos[2]);

      for (let i = 0; i < rainCount; i++) {
        // Fall down
        positions[i * 3 + 1] -= rainData.velocities[i] * delta * speedMultiplier;

        // If rain hits the ground floor (approx 0), reset to top
        if (positions[i * 3 + 1] < 0) {
          positions[i * 3] = (Math.random() - 0.5) * 45;
          positions[i * 3 + 1] = 16 + Math.random() * 8; // Reset back high
          positions[i * 3 + 2] = (Math.random() - 0.5) * 45;
        }
      }
      posAttr.needsUpdate = true;
    }

    // -- FIREFLIES ANIMATION --
    const isNight = worldTime > 19.5 || worldTime < 5.0;
    if (firefliesRef.current && isNight && weather !== 'storm') {
      const posAttr = firefliesRef.current.geometry.attributes.position;
      const positions = posAttr.array as Float32Array;

      // Keep fireflies around player
      firefliesRef.current.position.set(playerPos[0], 0, playerPos[2]);

      for (let i = 0; i < fireflyCount; i++) {
        const index = i * 3;
        const phase = firefliesData.phases[i] + time * 1.5;

        // Bob up and down, float around
        positions[index + 1] += Math.sin(phase) * 0.005; // Y drift
        positions[index] += Math.cos(phase * 0.8) * 0.006; // X drift
        positions[index + 2] += Math.sin(phase * 1.2) * 0.006; // Z drift

        // Wrap around player radius
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

    // -- LIGHTNING FLASH LOGIC --
    if (weather === 'storm') {
      const lightning = lightningState.current;
      const now = Date.now();

      if (now > lightning.nextFlashTime) {
        // Start a lightning flash!
        lightning.flashDuration = now + 100 + Math.random() * 150;
        lightning.nextFlashTime = now + 6000 + Math.random() * 14000; // Next flash in 6-20 seconds
        lightning.intensity = 1.0;
        
        // Play thunder audio
        GameAudio.playSfx('zombie_growl'); // Deep rumble synthesized
      }

      if (now < lightning.flashDuration) {
        // Flickering lighting effect
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

  return (
    <group>
      {/* Three.js Fog setup */}
      <fogExp2 attach="fog" args={['#38bdf8', 0.005]} />

      {/* Rain Rendering */}
      {(weather === 'rain' || weather === 'storm') && (
        <points ref={rainRef}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              args={[rainData.positions, 3]}
            />
          </bufferGeometry>
          <pointsMaterial
            color="#93c5fd"
            size={0.15}
            transparent={true}
            opacity={0.6}
            sizeAttenuation={true}
          />
        </points>
      )}

      {/* Fireflies Rendering (Night only) */}
      {(worldTime > 19.5 || worldTime < 5.0) && weather !== 'storm' && (
        <points ref={firefliesRef}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              args={[firefliesData.positions, 3]}
            />
          </bufferGeometry>
          <pointsMaterial
            color="#bef264" // Lime green glow
            size={0.25}
            transparent={true}
            opacity={0.8}
            sizeAttenuation={true}
          />
        </points>
      )}

      {/* Lightning PointLight source */}
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
