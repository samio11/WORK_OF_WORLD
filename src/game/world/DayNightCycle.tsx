import React, { useRef, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from '../../store/useGameStore';

// Pre-allocated static colors for day/night/dawn/dusk transitions to avoid garbage collection pressure
const COLOR_DAY_SKY = new THREE.Color('#38bdf8');
const COLOR_DAY_AMBIENT = new THREE.Color('#e0f2fe');
const COLOR_DAY_SUN = new THREE.Color('#fffbeb');

const COLOR_DAWN_SKY_START = new THREE.Color('#0f172a');
const COLOR_DAWN_SKY_END = new THREE.Color('#fdba74');
const COLOR_DAWN_AMBIENT_START = new THREE.Color('#020617');
const COLOR_DAWN_AMBIENT_END = new THREE.Color('#fed7aa');

const COLOR_SUNSET_SKY_START = new THREE.Color('#38bdf8');
const COLOR_SUNSET_SKY_END = new THREE.Color('#c084fc');
const COLOR_SUNSET_AMBIENT_START = new THREE.Color('#f0f9ff');
const COLOR_SUNSET_AMBIENT_END = new THREE.Color('#f472b6');
const COLOR_SUNSET_SUN = new THREE.Color('#fb923c');

const COLOR_DUSK_SKY_START = new THREE.Color('#c084fc');
const COLOR_DUSK_SKY_END = new THREE.Color('#0f172a');
const COLOR_DUSK_AMBIENT_START = new THREE.Color('#f472b6');
const COLOR_DUSK_AMBIENT_END = new THREE.Color('#090d16');

const COLOR_NIGHT_SKY = new THREE.Color('#020617');
const COLOR_NIGHT_AMBIENT = new THREE.Color('#0b1329');

const COLOR_RAIN_SKY = new THREE.Color('#475569');
const COLOR_RAIN_AMBIENT = new THREE.Color('#334155');

const COLOR_STORM_SKY = new THREE.Color('#1e293b');
const COLOR_STORM_AMBIENT = new THREE.Color('#1e293b');

const COLOR_FOG_SKY = new THREE.Color('#64748b');
const COLOR_FOG_AMBIENT = new THREE.Color('#475569');

const COLOR_WINTER_SKY = new THREE.Color('#dde8f0');
const COLOR_WINTER_AMBIENT = new THREE.Color('#c7d9ef');

export default function DayNightCycle() {
  const { scene } = useThree();
  const worldTime = useGameStore((state) => state.worldTime);
  const weather = useGameStore((state) => state.weather);
  const season = useGameStore((state) => state.season);

  const sunLightRef = useRef<THREE.DirectionalLight>(null);
  const moonLightRef = useRef<THREE.DirectionalLight>(null);
  const ambientLightRef = useRef<THREE.AmbientLight>(null);

  const skyColorRef = useRef(new THREE.Color());
  const ambientColorRef = useRef(new THREE.Color());
  const sunColorRef = useRef(new THREE.Color());

  const starsArray = useMemo(() => {
    const arr = new Float32Array(400 * 3);
    for (let i = 0; i < 400; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 150;
      arr[i * 3 + 1] = 45 + Math.random() * 20;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 150;
    }
    return arr;
  }, []);

  useFrame(() => {
    // Interpolate sky colors based on worldTime (0 to 24)
    const skyColor = skyColorRef.current;
    const ambientColor = ambientColorRef.current;
    const sunColor = sunColorRef.current;

    // Reset to default day colors
    skyColor.copy(COLOR_DAY_SKY);
    ambientColor.copy(COLOR_DAY_AMBIENT);
    sunColor.copy(COLOR_DAY_SUN);

    let sunIntensity = 1.2;
    let ambientIntensity = 0.6;
    let moonIntensity = 0.0;

    const hour = worldTime;

    // Day-Night lighting transitions
    if (hour >= 5.0 && hour < 7.0) {
      // Dawn: transition from night to morning
      const t = (hour - 5.0) / 2.0;
      skyColor.lerpColors(COLOR_DAWN_SKY_START, COLOR_DAWN_SKY_END, t);
      ambientColor.lerpColors(COLOR_DAWN_AMBIENT_START, COLOR_DAWN_AMBIENT_END, t);
      sunColor.copy(COLOR_DAWN_SKY_END);
      sunIntensity = THREE.MathUtils.lerp(0.0, 0.8, t);
      ambientIntensity = THREE.MathUtils.lerp(0.1, 0.4, t);
    } else if (hour >= 7.0 && hour < 17.0) {
      // Daytime
      const t = hour >= 12.0 ? (17.0 - hour) / 5.0 : (hour - 7.0) / 5.0; // peak at noon
      skyColor.copy(COLOR_DAY_SKY);
      ambientColor.copy(COLOR_DAY_AMBIENT);
      sunColor.copy(COLOR_DAY_SUN);
      sunIntensity = 1.0 + t * 0.4;
      ambientIntensity = 0.5 + t * 0.2;
    } else if (hour >= 17.0 && hour < 19.5) {
      // Sunset
      const t = (hour - 17.0) / 2.5;
      skyColor.lerpColors(COLOR_SUNSET_SKY_START, COLOR_SUNSET_SKY_END, t);
      ambientColor.lerpColors(COLOR_SUNSET_AMBIENT_START, COLOR_SUNSET_AMBIENT_END, t);
      sunColor.copy(COLOR_SUNSET_SUN);
      sunIntensity = THREE.MathUtils.lerp(1.0, 0.2, t);
      ambientIntensity = THREE.MathUtils.lerp(0.5, 0.25, t);
    } else if (hour >= 19.5 && hour < 21.0) {
      // Dusk
      const t = (hour - 19.5) / 1.5;
      skyColor.lerpColors(COLOR_DUSK_SKY_START, COLOR_DUSK_SKY_END, t);
      ambientColor.lerpColors(COLOR_DUSK_AMBIENT_START, COLOR_DUSK_AMBIENT_END, t);
      sunIntensity = 0;
      moonIntensity = THREE.MathUtils.lerp(0, 0.3, t);
      ambientIntensity = THREE.MathUtils.lerp(0.25, 0.08, t);
    } else {
      // Nighttime (21.0 to 5.0)
      skyColor.copy(COLOR_NIGHT_SKY);
      ambientColor.copy(COLOR_NIGHT_AMBIENT);
      moonIntensity = 0.35;
      ambientIntensity = 0.08;
    }

    // Weather impact adjustments
    if (weather === 'rain') {
      sunIntensity *= 0.4;
      moonIntensity *= 0.3;
      ambientIntensity *= 0.6;
      skyColor.lerp(COLOR_RAIN_SKY, 0.5);
      ambientColor.lerp(COLOR_RAIN_AMBIENT, 0.5);
    } else if (weather === 'storm') {
      sunIntensity *= 0.2;
      moonIntensity *= 0.1;
      ambientIntensity *= 0.4;
      skyColor.lerp(COLOR_STORM_SKY, 0.75);
      ambientColor.lerp(COLOR_STORM_AMBIENT, 0.7);
    } else if (weather === 'fog') {
      sunIntensity *= 0.5;
      ambientIntensity *= 0.9;
      skyColor.lerp(COLOR_FOG_SKY, 0.6);
      ambientColor.lerp(COLOR_FOG_AMBIENT, 0.5);
    }

    // Update scene background color & Fog color
    // Winter tint: pale grey-white sky, cold ambient
    if (season === 'winter') {
      skyColor.lerp(COLOR_WINTER_SKY, 0.38);
      ambientColor.lerp(COLOR_WINTER_AMBIENT, 0.4);
      ambientIntensity = Math.max(ambientIntensity, 0.12);
    }

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

    // Update Ambient Light
    if (ambientLightRef.current) {
      ambientLightRef.current.color.copy(ambientColor);
      ambientLightRef.current.intensity = ambientIntensity;
    }
  });

  return (
    <group>
      {/* Ambient Light */}
      <ambientLight ref={ambientLightRef} />

      {/* Sun Light */}
      <directionalLight
        ref={sunLightRef}
        castShadow
        shadow-mapSize-width={512}
        shadow-mapSize-height={512}
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
      />

      {/* Subtle night stars visual helper (conditionally visible during night in 3D scene) */}
      {worldTime > 19.5 || worldTime < 5.0 ? (
        <points>
          <bufferGeometry>
            {/* Render stars from memoized positions */}
            <bufferAttribute
              attach="attributes-position"
              args={[starsArray, 3]}
            />
          </bufferGeometry>
          <pointsMaterial color="#ffffff" size={0.3} sizeAttenuation={true} transparent opacity={0.8} />
        </points>
      ) : null}
    </group>
  );
}
