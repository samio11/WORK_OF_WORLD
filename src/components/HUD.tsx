import React, { useEffect } from 'react';
import { useGameStore } from '../store/useGameStore';
import { GameAudio } from '../lib/audio';

export default function HUD() {
  const activeTab = useGameStore((state) => state.activeTab);
  const setTab = useGameStore((state) => state.setTab);
  const playerStats = useGameStore((state) => state.playerStats);
  const hotbar = useGameStore((state) => state.hotbar);
  const equippedIndex = useGameStore((state) => state.equippedIndex);
  const equipItem = useGameStore((state) => state.equipItem);
  const worldTime = useGameStore((state) => state.worldTime);
  const weather = useGameStore((state) => state.weather);
  const season = useGameStore((state) => state.season);
  
  const isBuildingMode = useGameStore((state) => state.isBuildingMode);
  const selectedBuildingType = useGameStore((state) => state.selectedBuildingType);

  // Key listeners for hotbar (1-6) and menus
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (activeTab === 'menu' || activeTab === 'gameover') return;

      const key = e.key;

      // 1-6 keys for hotbar
      if (['1', '2', '3', '4', '5', '6'].includes(key)) {
        const idx = parseInt(key) - 1;
        equipItem(idx);
        GameAudio.playSfx('footstep');
      }

      // Tab / E: Toggle Inventory
      if (key === 'Tab' || key.toLowerCase() === 'e') {
        e.preventDefault();
        setTab(activeTab === 'inventory' ? 'hud' : 'inventory');
      }

      // C: Toggle Crafting
      if (key.toLowerCase() === 'c') {
        setTab(activeTab === 'crafting' ? 'hud' : 'crafting');
      }

      // Q: Toggle Quests
      if (key.toLowerCase() === 'q') {
        setTab(activeTab === 'quests' ? 'hud' : 'quests');
      }

      // M: Toggle Map
      if (key.toLowerCase() === 'm') {
        setTab(activeTab === 'map' ? 'hud' : 'map');
      }

      // B: Toggle Build Mode
      if (key.toLowerCase() === 'b') {
        if (activeTab === 'hud') {
          const isBuild = useGameStore.getState().isBuildingMode;
          useGameStore.setState({
            isBuildingMode: !isBuild,
            selectedBuildingType: !isBuild ? 'wall' : null,
          });
          GameAudio.playSfx('footstep');
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeTab, equipItem, setTab]);

  if (activeTab === 'menu' || activeTab === 'gameover') return null;

  // Format Time: 0.0 to 24.0
  const totalMinutes = Math.floor(worldTime * 60);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = Math.floor(totalMinutes % 60);
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 === 0 ? 12 : hours % 12;
  const displayMinutes = minutes < 10 ? `0${minutes}` : minutes;
  
  const weatherIcons: Record<typeof weather, string> = {
    sunny: '☀️',
    rain: '🌧️',
    storm: '⛈️',
    fog: '🌫️',
  };

  const activeWeapon = hotbar[equippedIndex];

  return (
    <div className="fixed inset-0 pointer-events-none z-50 flex flex-col justify-between p-6">
      {/* TOP HUD SECTION */}
      <div className="w-full flex justify-between items-start">
        {/* PLAYER STATS (Health, Hunger, Thirst, Energy, Temp) */}
        <div className="pointer-events-auto bg-slate-950/70 border border-slate-800 backdrop-blur-md rounded-2xl p-4 flex flex-col gap-3 shadow-xl max-w-[280px]">
          {/* Level Badge */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center font-bold text-white text-sm shadow">
              {playerStats.level}
            </div>
            <div className="flex-1">
              <div className="flex justify-between text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                <span>XP</span>
                <span>{playerStats.xp} / {playerStats.nextLevelXp}</span>
              </div>
              <div className="w-full h-1.5 bg-slate-800 rounded-full mt-0.5 overflow-hidden">
                <div
                  className="h-full bg-amber-500 rounded-full transition-all duration-300"
                  style={{ width: `${(playerStats.xp / playerStats.nextLevelXp) * 100}%` }}
                />
              </div>
            </div>
          </div>

          <hr className="border-slate-800" />

          {/* Survival Bars */}
          <div className="flex flex-col gap-2">
            {/* Health */}
            <div>
              <div className="flex justify-between text-[10px] text-red-400 font-bold uppercase tracking-wider">
                <span>❤️ Health</span>
                <span>{Math.round(playerStats.health)}%</span>
              </div>
              <div className="w-full h-2.5 bg-slate-900 border border-slate-800 rounded-full mt-0.5 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-red-600 to-rose-500 rounded-full transition-all duration-300"
                  style={{ width: `${playerStats.health}%` }}
                />
              </div>
            </div>

            {/* Hunger */}
            <div>
              <div className="flex justify-between text-[10px] text-amber-500 font-bold uppercase tracking-wider">
                <span>🍎 Hunger</span>
                <span>{Math.round(playerStats.hunger)}%</span>
              </div>
              <div className="w-full h-2.5 bg-slate-900 border border-slate-800 rounded-full mt-0.5 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-600 to-yellow-500 rounded-full transition-all duration-300"
                  style={{ width: `${playerStats.hunger}%` }}
                />
              </div>
            </div>

            {/* Thirst */}
            <div>
              <div className="flex justify-between text-[10px] text-blue-400 font-bold uppercase tracking-wider">
                <span>💧 Thirst</span>
                <span>{Math.round(playerStats.thirst)}%</span>
              </div>
              <div className="w-full h-2.5 bg-slate-900 border border-slate-800 rounded-full mt-0.5 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-600 to-sky-500 rounded-full transition-all duration-300"
                  style={{ width: `${playerStats.thirst}%` }}
                />
              </div>
            </div>

            {/* Energy */}
            <div>
              <div className="flex justify-between text-[10px] text-emerald-400 font-bold uppercase tracking-wider">
                <span>⚡ Energy</span>
                <span>{Math.round(playerStats.energy)}%</span>
              </div>
              <div className="w-full h-2.5 bg-slate-900 border border-slate-800 rounded-full mt-0.5 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-600 to-teal-500 rounded-full transition-all duration-300"
                  style={{ width: `${playerStats.energy}%` }}
                />
              </div>
            </div>

            {/* Temperature */}
            <div className="flex justify-between items-center text-[10px] text-slate-300 font-semibold mt-1">
              <span>🌡️ Temperature</span>
              <span className={`font-bold ${playerStats.temp < 35 ? 'text-blue-400' : playerStats.temp > 39 ? 'text-red-500' : 'text-slate-300'}`}>
                {playerStats.temp.toFixed(1)}°C
              </span>
            </div>
          </div>
        </div>

        {/* TIME / WEATHER WIDGET & QUIT GAME */}
        <div className="flex flex-col gap-3 items-end">
          <div className="pointer-events-auto bg-slate-950/70 border border-slate-800 backdrop-blur-md rounded-2xl p-4 shadow-xl flex flex-col gap-3 min-w-[200px]">
            <div className="flex gap-4 items-center justify-between">
              <div className="text-3xl animate-pulse">
                {hours >= 6 && hours < 18 ? '☀️' : '🌙'}
              </div>
              <div className="text-right">
                <div className="text-lg font-black text-white leading-none">
                  {displayHours}:{displayMinutes} <span className="text-xs font-bold text-slate-400">{ampm}</span>
                </div>
                <div className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mt-1 flex gap-2 items-center justify-end">
                  <span>Day 1</span>
                  <span>•</span>
                  <span className={`flex items-center gap-0.5 ${
                    season === 'summer' ? 'text-amber-400' : season === 'rainy' ? 'text-blue-400' : 'text-slate-300'
                  }`}>
                    <span>{season === 'summer' ? '☀️' : season === 'rainy' ? '🌧️' : '❄️'}</span>
                    <span className="capitalize">{season}</span>
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-0.5">
                    <span>{weatherIcons[weather]}</span>
                    <span className="capitalize">{weather}</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Sun Time Progression Slider */}
            <div className="w-full pt-2.5 border-t border-slate-800/80 flex flex-col gap-1">
              <div className="relative w-full h-1 bg-slate-950 rounded-full border border-slate-800/50">
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-0.5 h-2 bg-slate-800" />
                <div
                  className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 transition-all duration-100 ease-linear"
                  style={{ left: `${(worldTime / 24.0) * 100}%` }}
                >
                  <span className="block text-[11px] select-none filter drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]">
                    {hours >= 6 && hours < 18 ? '☀️' : '🌙'}
                  </span>
                </div>
              </div>
              <div className="flex justify-between text-[7px] text-slate-500 font-black uppercase tracking-wider">
                <span>00:00</span>
                <span>12:00</span>
                <span>24:00</span>
              </div>
            </div>
          </div>

          {/* Quit Game Button */}
          <button
            onClick={() => {
              if (window.confirm("Are you sure you want to quit to the main menu? Your current session progress will be reset.")) {
                useGameStore.getState().resetGame();
              }
            }}
            className="pointer-events-auto bg-slate-950/70 border border-slate-800 hover:bg-red-950/40 hover:border-red-500/50 backdrop-blur-md text-slate-400 hover:text-red-400 font-black text-[9px] uppercase tracking-widest px-4 py-2.5 rounded-xl shadow-lg transition-all flex items-center gap-2 cursor-pointer"
          >
            🚪 Quit Game
          </button>
        </div>
      </div>

      {/* BOTTOM HUD SECTION */}
      <div className="w-full flex flex-col items-center gap-4">
        {/* BUILD SYSTEM NOTIFICATION DISPLAY */}
        {isBuildingMode && selectedBuildingType && (
          <div className="bg-cyan-950/90 border border-cyan-500/50 backdrop-blur-md rounded-xl px-4 py-2 text-cyan-400 text-xs font-black uppercase tracking-widest shadow-lg animate-pulse">
            🔨 BUILD MODE: Placing {selectedBuildingType.toUpperCase()} (Click Ground to Snap Place, Press B to Exit)
          </div>
        )}

        {/* HUD BINDINGS MENU BUTTONS */}
        <div className="pointer-events-auto flex gap-2 bg-slate-950/70 border border-slate-800 backdrop-blur-md rounded-2xl p-2 shadow-xl">
          <button
            onClick={() => setTab(activeTab === 'inventory' ? 'hud' : 'inventory')}
            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
              activeTab === 'inventory' ? 'bg-emerald-500 text-white shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            🎒 Inventory [TAB]
          </button>
          <button
            onClick={() => setTab(activeTab === 'crafting' ? 'hud' : 'crafting')}
            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
              activeTab === 'crafting' ? 'bg-emerald-500 text-white shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            🛠️ Crafting [C]
          </button>
          <button
            onClick={() => setTab(activeTab === 'quests' ? 'hud' : 'quests')}
            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
              activeTab === 'quests' ? 'bg-emerald-500 text-white shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            📜 Quests [Q]
          </button>
          <button
            onClick={() => setTab(activeTab === 'map' ? 'hud' : 'map')}
            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
              activeTab === 'map' ? 'bg-emerald-500 text-white shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            🗺️ Map [M]
          </button>
          <button
            onClick={() => {
              const isBuild = !isBuildingMode;
              useGameStore.setState({
                isBuildingMode: isBuild,
                selectedBuildingType: isBuild ? 'wall' : null,
              });
              setTab('hud');
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
              isBuildingMode ? 'bg-cyan-500 text-white shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            🔨 Build [B]
          </button>
        </div>

        {/* 6-SLOT HOTBAR DISPLAY */}
        <div className="pointer-events-auto bg-slate-950/70 border border-slate-800 backdrop-blur-md rounded-2xl p-3 flex gap-2 shadow-2xl items-center">
          {hotbar.map((item, idx) => {
            const isEquipped = idx === equippedIndex;
            return (
              <div
                key={idx}
                onClick={() => {
                  equipItem(idx);
                  GameAudio.playSfx('footstep');
                }}
                className={`relative w-14 h-14 rounded-xl border flex items-center justify-center cursor-pointer transition-all ${
                  isEquipped
                    ? 'bg-emerald-500/20 border-emerald-500 shadow-md shadow-emerald-500/10 scale-105'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                {/* Number Hotkey badge */}
                <div className="absolute top-1 left-1 text-[8px] font-black text-slate-500">
                  {idx + 1}
                </div>

                {item ? (
                  <div className="flex flex-col items-center">
                    <span className="text-2xl">{item.icon}</span>
                    <span className="absolute bottom-1 right-1.5 text-[10px] font-black text-slate-200">
                      {item.count > 1 ? item.count : ''}
                    </span>
                  </div>
                ) : (
                  <span className="text-slate-800 text-sm font-semibold">.</span>
                )}
              </div>
            );
          })}

          <div className="ml-2 pl-3 border-l border-slate-800 flex flex-col text-left">
            <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Equipped</span>
            <span className="text-white text-xs font-black truncate max-w-[100px]">
              {activeWeapon ? activeWeapon.name : 'Unarmed'}
            </span>
            <span className="text-[10px] text-yellow-500 font-bold">
              💰 {playerStats.gold}g
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
