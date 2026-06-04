'use client';

import React, { useEffect } from 'react';
import { useGameStore } from '../store/useGameStore';
import GameCanvas from '../components/GameCanvas';
import HUD from '../components/HUD';
import FishingMiniGame from '../game/fishing/FishingMiniGame';
import InventoryGrid from '../components/InventoryGrid';
import CraftingPanel from '../components/CraftingPanel';
import QuestPanel from '../components/QuestPanel';
import NPCPanel from '../components/NPCPanel';
import MiniMap from '../components/MiniMap';
import MainMenu from '../components/MainMenu';
import QuestManager from '../game/quests/QuestManager';

// Independent requestAnimationFrame loop runner for core simulation ticks
function GameLoopRunner() {
  const isGameOver = useGameStore((state) => state.isGameOver);
  const tickGame = useGameStore((state) => state.tickGame);

  useEffect(() => {
    if (isGameOver) return;

    let lastTime = performance.now();
    let frameId: number;

    const loop = (time: number) => {
      const delta = Math.min(0.1, (time - lastTime) / 1000);
      lastTime = time;

      tickGame(delta);

      frameId = requestAnimationFrame(loop);
    };

    frameId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frameId);
  }, [isGameOver, tickGame]);

  return null;
}

export default function Home() {
  const isGameStarted = useGameStore((state) => state.isGameStarted);

  return (
    <main className="relative w-screen h-screen overflow-hidden bg-slate-950 font-sans select-none">
      {/* 3D R3F Canvas layer */}
      <GameCanvas />

      {/* Ticking loop manager */}
      <GameLoopRunner />

      {/* HTML Interface Overlays */}
      <HUD />
      <FishingMiniGame />
      <InventoryGrid />
      <CraftingPanel />
      <QuestPanel />
      <NPCPanel />
      <MiniMap />
      <MainMenu />
      <QuestManager />

      {/* Controls Cheat Sheet visual helper (visible in HUD mode) */}
      {isGameStarted && (
        <div className="fixed bottom-6 left-6 z-40 bg-slate-950/60 border border-slate-800 backdrop-blur-md px-3.5 py-2.5 rounded-xl pointer-events-none text-[10px] text-slate-400 font-bold uppercase tracking-wider flex flex-col gap-1 max-w-[200px] shadow-lg">
          <div className="text-white border-b border-slate-800 pb-1 mb-1 font-black flex justify-between items-center">
            <span>Controls Guide</span>
            <span className="text-[8px] px-1 py-0.5 bg-slate-800 rounded">v1.0</span>
          </div>
          <div className="flex justify-between">
            <span>Move</span>
            <span className="text-slate-200">W A S D</span>
          </div>
          <div className="flex justify-between">
            <span>Aim/Attack</span>
            <span className="text-slate-200">Mouse Left Click</span>
          </div>
          <div className="flex justify-between">
            <span>Dodge Roll</span>
            <span className="text-slate-200">Spacebar</span>
          </div>
          <div className="flex justify-between">
            <span>Sprint</span>
            <span className="text-slate-200">Shift</span>
          </div>
          <div className="flex justify-between">
            <span>Build mode</span>
            <span className="text-slate-200">B</span>
          </div>
          <div className="flex justify-between">
            <span>Fishing</span>
            <span className="text-slate-200">Equip Axe near water</span>
          </div>
          <div className="flex justify-between">
            <span>Talk survivors</span>
            <span className="text-slate-200">Click them up close</span>
          </div>
        </div>
      )}
    </main>
  );
}
