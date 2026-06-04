import React, { useEffect, useRef } from 'react';
import { useGameStore } from '../../store/useGameStore';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// 1. 3D Floating Bobber Mesh (Rendered inside Canvas)
export function FishingBobber3D() {
  const fishing = useGameStore((state) => state.fishing);
  const playerPos = useGameStore((state) => state.playerPos);
  const bobberRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (bobberRef.current && fishing.status !== 'idle') {
      const time = state.clock.getElapsedTime();
      // Wave bobbing height
      bobberRef.current.position.y = -1.2 + Math.sin(time * 2.2) * 0.05;

      // If nibble, make it jerk down rapidly
      if (fishing.status === 'nibble') {
        bobberRef.current.position.y = -1.55 + Math.abs(Math.sin(time * 18)) * 0.15;
      }
    }
  });

  if (fishing.status === 'idle') return null;

  // Float Bobber in the lake (lake center: x=-18, z=8)
  const bobberPos: [number, number, number] = [-18, -1.2, 8];

  return (
    <group ref={bobberRef} position={bobberPos}>
      {/* Floating Bobber Sphere */}
      {/* Top Half Red */}
      <mesh position={[0, 0.1, 0]}>
        <sphereGeometry args={[0.15, 8, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshBasicMaterial color="#ef4444" />
      </mesh>
      {/* Bottom Half White */}
      <mesh position={[0, 0.1, 0]} rotation={[Math.PI, 0, 0]}>
        <sphereGeometry args={[0.15, 8, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
      {/* Antenna post */}
      <mesh position={[0, 0.25, 0]}>
        <cylinderGeometry args={[0.015, 0.015, 0.2]} />
        <meshBasicMaterial color="#eab308" />
      </mesh>

      {/* Line connecting player to bobber */}
      {/* We can draw a simple line from playerPos to bobberPos */}
      <line>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[
              new Float32Array([
                playerPos[0] + 0.3, playerPos[1] + 0.2, playerPos[2] + 0.3, // player hands approx
                bobberPos[0], bobberPos[1] + 0.1, bobberPos[2],
              ]),
              3,
            ]}
          />
        </bufferGeometry>
        <lineBasicMaterial color="#ffffff" transparent opacity={0.3} />
      </line>
    </group>
  );
}

// 2. 2D HUD overlay (Rendered on top of HUD)
export default function FishingMiniGame() {
  const fishing = useGameStore((state) => state.fishing);
  const reelFishing = useGameStore((state) => state.reelFishing);
  const cancelFishing = useGameStore((state) => state.cancelFishing);
  const startFishing = useGameStore((state) => state.startFishing);
  const hotbar = useGameStore((state) => state.hotbar);
  const equippedIndex = useGameStore((state) => state.equippedIndex);

  const equippedItem = hotbar[equippedIndex];
  const isHoldingRod = equippedItem?.name === 'Fishing Rod';

  // Listen to keyboard clicks for reeling
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (fishing.status === 'idle') return;

      if (e.key === ' ' || e.code === 'Space') {
        e.preventDefault();
        reelFishing();
      }
      if (e.key === 'Escape') {
        cancelFishing();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [fishing.status, reelFishing, cancelFishing]);

  // Click triggers cast or reel
  const handlePanelClick = () => {
    if (fishing.status === 'nibble' || fishing.status === 'reeling') {
      reelFishing();
    } else if (fishing.status === 'idle' && isHoldingRod) {
      startFishing();
    }
  };

  if (fishing.status === 'idle') {
    // If holding rod near water, show "Cast rod" button overlay
    const playerPos = useGameStore.getState().playerPos;
    const isNearWater = playerPos[0] > -30 && playerPos[0] < -5 && playerPos[2] > -10 && playerPos[2] < 25;

    if (!isNearWater || !isHoldingRod) return null;

    return (
      <div className="fixed bottom-28 left-1/2 transform -translate-x-1/2 z-40 pointer-events-auto">
        <button
          onClick={startFishing}
          className="bg-blue-600/90 border border-blue-400/50 hover:bg-blue-500 text-white font-black text-xs uppercase tracking-widest px-6 py-3 rounded-2xl shadow-xl transition-all"
        >
          🎣 Cast Rod in Lake
        </button>
      </div>
    );
  }

  return (
    <div
      onClick={handlePanelClick}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-950/40 select-none pointer-events-auto cursor-pointer"
    >
      <div
        onClick={(e) => e.stopPropagation()} // Stop propagation inside menu card
        className="w-full max-w-sm bg-slate-900/90 border border-slate-800 backdrop-blur-md rounded-3xl p-6 shadow-2xl text-center flex flex-col items-center gap-4"
      >
        <div className="flex justify-between items-center w-full">
          <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">Reel Fishing</h3>
          <button
            onClick={cancelFishing}
            className="text-slate-500 hover:text-slate-300 text-xs font-bold bg-slate-800 px-2.5 py-1 rounded-lg"
          >
            Cancel
          </button>
        </div>

        {/* CAST STATE */}
        {fishing.status === 'cast' && (
          <div className="py-8 flex flex-col items-center gap-3">
            <span className="text-4xl animate-bounce">🎣</span>
            <h4 className="text-white font-bold text-sm">Bobber is floating...</h4>
            <p className="text-slate-400 text-[10px] uppercase tracking-wider max-w-[200px] leading-normal">
              Wait for a bite, then click or press SPACEBAR immediately!
            </p>
          </div>
        )}

        {/* NIBBLE STATE */}
        {fishing.status === 'nibble' && (
          <div className="py-6 flex flex-col items-center gap-4 animate-pulse">
            <span className="text-5xl">❗</span>
            <h4 className="text-yellow-400 font-black text-lg uppercase tracking-wider">
              A Fish Bit!
            </h4>
            <button
              onClick={reelFishing}
              className="bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-400 hover:to-rose-500 text-white font-black text-sm uppercase tracking-widest px-8 py-4 rounded-2xl shadow-lg"
            >
              Strike Rod! [SPACE]
            </button>
          </div>
        )}

        {/* REELING MINI GAME GAUGE */}
        {fishing.status === 'reeling' && (
          <div className="w-full flex items-center justify-center gap-8 py-2">
            {/* Vertical Bar container */}
            <div className="relative w-10 h-64 bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden flex flex-col justify-end">
              {/* Green catcher bar (barPosition) */}
              <div
                className="absolute w-full bg-emerald-500/40 border-y border-emerald-400 rounded-lg transition-all duration-75"
                style={{
                  height: '24%', // Bar is ~24% size
                  bottom: `${fishing.barPosition}%`,
                }}
              />
              {/* Fish Icon (fishPosition) */}
              <div
                className="absolute w-full text-center text-xl transition-all duration-75"
                style={{
                  bottom: `${fishing.fishPosition}%`,
                  transform: 'translateY(50%)',
                }}
              >
                🐟
              </div>
            </div>

            {/* Reeling status progress */}
            <div className="flex-1 text-left flex flex-col gap-4">
              <div>
                <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest">Reeling Status</h4>
                <p className="text-[10px] text-slate-400 mt-1 leading-normal">
                  Press [SPACE] or CLICK to raise the green bar. Keep it on the fish!
                </p>
              </div>
              <div>
                <div className="flex justify-between text-[9px] text-slate-400 font-bold uppercase mb-1">
                  <span>Catch Progress</span>
                  <span>{Math.round(fishing.fishProgress)}%</span>
                </div>
                <div className="w-full h-2 bg-slate-950 border border-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full transition-all duration-100"
                    style={{ width: `${fishing.fishProgress}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SUCCESS STATE */}
        {fishing.status === 'success' && (
          <div className="py-6 flex flex-col items-center gap-3">
            <span className="text-5xl">🏆</span>
            <h4 className="text-emerald-400 font-black text-lg uppercase tracking-wider">
              Fish Caught!
            </h4>
            <p className="text-white font-bold text-sm">
              You caught a <span className="text-yellow-400">{fishing.targetFish}</span>!
            </p>
            <span className="text-[9px] border border-slate-800 px-3 py-1 rounded-full uppercase text-slate-400 font-bold">
              Rarity: {fishing.fishRarity}
            </span>
          </div>
        )}

        {/* FAIL STATE */}
        {fishing.status === 'fail' && (
          <div className="py-8 flex flex-col items-center gap-3">
            <span className="text-5xl">💨</span>
            <h4 className="text-red-500 font-black text-lg uppercase tracking-wider">
              Fish Got Away!
            </h4>
            <p className="text-slate-400 text-xs">
              The fish broke the line. Try again.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
