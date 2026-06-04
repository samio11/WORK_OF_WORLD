import React, { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from '../../store/useGameStore';

export default function DayNightCycle() {
  const { scene } = useThree();
  const worldTime = useGameStore((state) => state.worldTime);
  const weather = useGameStore((state) => state.weather);

  const sunLightRef = useRef<THREE.DirectionalLight>(null);
  const moonLightRef = useRef<THREE.DirectionalLight>(null);

  useFrame(() => {
    // Interpolate sky colors based on worldTime (0 to 24)
    let skyColor = new THREE.Color('#38bdf8'); // Day blue
    let ambientColor = new THREE.Color('#e0f2fe');
    let sunColor = new THREE.Color('#fffbeb');
    let sunIntensity = 1.2;
    let ambientIntensity = 0.6;
    let moonIntensity = 0.0;

    const hour = worldTime;

    // Day-Night lighting transitions
    if (hour >= 5.0 && hour < 7.0) {
      // Dawn: transition from night to morning
      const t = (hour - 5.0) / 2.0;
      skyColor.lerpColors(new THREE.Color('#0f172a'), new THREE.Color('#fdba74'), t); // Dark blue -> Orange dawn
      ambientColor.lerpColors(new THREE.Color('#020617'), new THREE.Color('#fed7aa'), t);
      sunColor.set('#fdba74');
      sunIntensity = THREE.MathUtils.lerp(0.0, 0.8, t);
      ambientIntensity = THREE.MathUtils.lerp(0.1, 0.4, t);
    } else if (hour >= 7.0 && hour < 17.0) {
      // Daytime
      const t = hour >= 12.0 ? (17.0 - hour) / 5.0 : (hour - 7.0) / 5.0; // peak at noon
      skyColor.set('#38bdf8'); // sky blue
      ambientColor.set('#f0f9ff');
      sunColor.set('#fffbeb');
      sunIntensity = 1.0 + t * 0.4;
      ambientIntensity = 0.5 + t * 0.2;
    } else if (hour >= 17.0 && hour < 19.5) {
      // Sunset
      const t = (hour - 17.0) / 2.5;
      skyColor.lerpColors(new THREE.Color('#38bdf8'), new THREE.Color('#c084fc'), t); // Blue -> Purple/Orange
      ambientColor.lerpColors(new THREE.Color('#f0f9ff'), new THREE.Color('#f472b6'), t);
      sunColor.set('#fb923c'); // bright orange sun
      sunIntensity = THREE.MathUtils.lerp(1.0, 0.2, t);
      ambientIntensity = THREE.MathUtils.lerp(0.5, 0.25, t);
    } else if (hour >= 19.5 && hour < 21.0) {
      // Dusk
      const t = (hour - 19.5) / 1.5;
      skyColor.lerpColors(new THREE.Color('#c084fc'), new THREE.Color('#0f172a'), t); // Purple -> Dark
      ambientColor.lerpColors(new THREE.Color('#f472b6'), new THREE.Color('#090d16'), t);
      sunIntensity = 0;
      moonIntensity = THREE.MathUtils.lerp(0, 0.3, t);
      ambientIntensity = THREE.MathUtils.lerp(0.25, 0.08, t);
    } else {
      // Nighttime (21.0 to 5.0)
      skyColor.set('#020617'); // Pitch black-blue
      ambientColor.set('#0b1329');
      moonIntensity = 0.35;
      ambientIntensity = 0.08;
    }

    // Weather impact adjustments
    if (weather === 'rain') {
      sunIntensity *= 0.4;
      moonIntensity *= 0.3;
      ambientIntensity *= 0.6;
      skyColor.lerp(new THREE.Color('#475569'), 0.5); // Greyish sky
      ambientColor.lerp(new THREE.Color('#334155'), 0.5);
    } else if (weather === 'storm') {
      sunIntensity *= 0.2;
      moonIntensity *= 0.1;
      ambientIntensity *= 0.4;
      skyColor.lerp(new THREE.Color('#1e293b'), 0.75); // Dark grey storm sky
      ambientColor.lerp(new THREE.Color('#1e293b'), 0.7);
    } else if (weather === 'fog') {
      sunIntensity *= 0.5;
      ambientIntensity *= 0.9; // fog scatters ambient light
      skyColor.lerp(new THREE.Color('#64748b'), 0.6); // Muted fog grey
      ambientColor.lerp(new THREE.Color('#475569'), 0.5);
    }

    // Update scene background color & Fog color
    scene.background = skyColor;
    if (scene.fog) {
      scene.fog.color.copy(skyColor);
    }

    // Position of Sun: moves in arc
    // angle goes from 0 (east) to Math.PI (west)
    // 6.0 is dawn, 18.0 is sunset
    const sunAngle = ((hour - 6.0) / 12.0) * Math.PI;
    if (sunLightRef.current) {
      sunLightRef.current.position.set(
        Math.cos(sunAngle) * 40,
        Math.sin(sunAngle) * 35,
        Math.sin(sunAngle * 0.5) * 15
      );
      sunLightRef.current.intensity = sunIntensity;
      sunLightRef.current.color.copy(sunColor);
    }

    // Position of Moon: moves in opposite arc
    const moonAngle = ((hour - 18.0) / 12.0) * Math.PI;
    if (moonLightRef.current) {
      moonLightRef.current.position.set(
        Math.cos(moonAngle) * 40,
        Math.sin(moonAngle) * 35,
        Math.sin(moonAngle * 0.5) * 15
      );
      moonLightRef.current.intensity = moonIntensity;
    }
  });

  return (
    <group>
      {/* Sun Light */}
      <directionalLight
        ref={sunLightRef}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-far={120}
        shadow-camera-left={-30}
        shadow-camera-right={30}
        shadow-camera-top={30}
        shadow-camera-bottom={-30}
        shadow-bias={-0.0005}
      />

      {/* Moon Light (soft blue) */}
      <directionalLight
        ref={moonLightRef}
        color="#93c5fd"
        castShadow
        shadow-mapSize-width={512}
        shadow-mapSize-height={512}
        shadow-camera-far={100}
        shadow-camera-left={-25}
        shadow-camera-right={25}
        shadow-camera-top={25}
        shadow-camera-bottom={-25}
      />

      {/* Subtle night stars visual helper (conditionally visible during night in 3D scene) */}
      {worldTime > 19.5 || worldTime < 5.0 ? (
        <points>
          <bufferGeometry>
            {/* Generate random star coordinates */}
            <bufferAttribute
              attach="attributes-position"
              args={[
                new Float32Array(
                  Array.from({ length: 400 }, () => [
                    (Math.random() - 0.5) * 150,
                    45 + Math.random() * 20,
                    (Math.random() - 0.5) * 150,
                  ]).flat()
                ),
                3,
              ]}
            />
          </bufferGeometry>
          <pointsMaterial color="#ffffff" size={0.3} sizeAttenuation={true} transparent opacity={0.8} />
        </points>
      ) : null}
    </group>
  );
}
