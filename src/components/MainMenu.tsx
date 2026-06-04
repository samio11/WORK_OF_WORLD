import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '../store/useGameStore';
import { GameAudio } from '../lib/audio';
import { Item } from '../types/game';

export default function MainMenu() {
  const startGameWithClass = useGameStore((state) => state.startGameWithClass);
  const activeTab = useGameStore((state) => state.activeTab);
  
  const [showSettings, setShowSettings] = useState(false);
  const [masterVol, setMasterVol] = useState(0.5);
  const [musicVol, setMusicVol] = useState(0.4);
  const [sfxVol, setSfxVol] = useState(0.8);
  const [selectedClass, setSelectedClass] = useState<'soldier' | 'farmer' | 'angler'>('soldier');

  if (activeTab !== 'menu' && activeTab !== 'gameover') return null;

  const isGameOver = activeTab === 'gameover';

  const handleStart = () => {
    GameAudio.resume();
    GameAudio.playSfx('level_up');
    if (isGameOver) {
      useGameStore.getState().resetGame();
    }
    startGameWithClass(selectedClass);
  };

  const handleVolumeChange = (type: 'master' | 'music' | 'sfx', val: number) => {
    if (type === 'master') {
      setMasterVol(val);
      GameAudio.setMasterVolume(val);
    } else if (type === 'music') {
      setMusicVol(val);
      GameAudio.setMusicVolume(val);
    } else {
      setSfxVol(val);
      GameAudio.setSfxVolume(val);
    }
    GameAudio.playSfx('footstep');
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/50 backdrop-blur-[8px] overflow-y-auto p-4 pointer-events-auto select-none">
      {/* Animated glowing auras */}
      <div className="absolute inset-0 opacity-20 pointer-events-none overflow-hidden">
        <div className="absolute top-10 left-10 w-[500px] h-[500px] bg-emerald-500/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-10 right-10 w-[500px] h-[500px] bg-red-500/20 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '3s' }} />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-4xl bg-slate-900/90 border border-slate-800/80 backdrop-blur-2xl rounded-[32px] overflow-hidden shadow-2xl z-10 flex flex-col md:flex-row"
      >
        {/* LEFT PANE: CLASS SELECTOR & LORE */}
        <div className="flex-1 p-8 border-b md:border-b-0 md:border-r border-slate-800/50 flex flex-col justify-between bg-slate-950/20">
          <div>
            <span className="text-[10px] text-emerald-400 font-extrabold uppercase tracking-widest bg-emerald-950/40 border border-emerald-500/30 px-3 py-1 rounded-full">
              Survivor Role Setup
            </span>
            <h2 className="text-2xl font-black text-white mt-4 mb-2 uppercase tracking-wide">
              Select Starting Class
            </h2>
            <p className="text-slate-400 text-xs mb-6 leading-relaxed">
              Your chosen background determines your starting equipment, initial items in your backpack, and starting level bonuses. Choose wisely to fit your playstyle.
            </p>

            {/* Class Selection Cards */}
            <div className="flex flex-col gap-3">
              {/* Soldier Card */}
              <div
                onClick={() => setSelectedClass('soldier')}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex gap-4 items-center ${
                  selectedClass === 'soldier'
                    ? 'bg-red-500/10 border-red-500/50 shadow-md shadow-red-950/20'
                    : 'bg-slate-900/40 border-slate-800/60 hover:border-slate-700/60'
                }`}
              >
                <div className="text-3xl p-2 bg-red-950/50 border border-red-800/30 rounded-xl">🔫</div>
                <div className="text-left flex-1">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-white text-sm">SOLDIER</span>
                    {selectedClass === 'soldier' && (
                      <span className="text-[8px] font-black text-red-400 uppercase bg-red-950/80 px-2 py-0.5 rounded border border-red-800/30">
                        Selected
                      </span>
                    )}
                  </div>
                  <p className="text-slate-400 text-[11px] mt-1 leading-normal">
                    Armed with an **Abandoned Pistol**, 50x Ammo, and a knife. Level 2 Combat skill.
                  </p>
                </div>
              </div>

              {/* Farmer Card */}
              <div
                onClick={() => setSelectedClass('farmer')}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex gap-4 items-center ${
                  selectedClass === 'farmer'
                    ? 'bg-emerald-500/10 border-emerald-500/50 shadow-md shadow-emerald-950/20'
                    : 'bg-slate-900/40 border-slate-800/60 hover:border-slate-700/60'
                }`}
              >
                <div className="text-3xl p-2 bg-emerald-950/50 border border-emerald-800/30 rounded-xl">🌽</div>
                <div className="text-left flex-1">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-white text-sm">FARMER</span>
                    {selectedClass === 'farmer' && (
                      <span className="text-[8px] font-black text-emerald-400 uppercase bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800/30">
                        Selected
                      </span>
                    )}
                  </div>
                  <p className="text-slate-400 text-[11px] mt-1 leading-normal">
                    Equipped with an **Irrigation Pump**, 30x vegetable seeds. Level 2 Farming skill.
                  </p>
                </div>
              </div>

              {/* Angler Card */}
              <div
                onClick={() => setSelectedClass('angler')}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex gap-4 items-center ${
                  selectedClass === 'angler'
                    ? 'bg-blue-500/10 border-blue-500/50 shadow-md shadow-blue-950/20'
                    : 'bg-slate-900/40 border-slate-800/60 hover:border-slate-700/60'
                }`}
              >
                <div className="text-3xl p-2 bg-blue-950/50 border border-blue-800/30 rounded-xl">🎣</div>
                <div className="text-left flex-1">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-white text-sm">ANGLER</span>
                    {selectedClass === 'angler' && (
                      <span className="text-[8px] font-black text-blue-400 uppercase bg-blue-950/80 px-2 py-0.5 rounded border border-blue-800/30">
                        Selected
                      </span>
                    )}
                  </div>
                  <p className="text-slate-400 text-[11px] mt-1 leading-normal">
                    Starts with 120g Gold, 10x Grilled Fish for food. Level 2 Fishing skill.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800/40 text-left">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Backstory</span>
            <p className="text-slate-400 text-[11px] mt-1 leading-relaxed italic">
              "The outbreak struck weeks ago. Waking up in this quiet valley, surrounded by infected woods, you must rebuild, fish the waters, trade with merchants, and survive the cold night waves..."
            </p>
          </div>
        </div>

        {/* RIGHT PANE: TITLE & START & CONTROLS */}
        <div className="flex-1 p-8 flex flex-col justify-between items-center text-center bg-slate-900/40">
          <div className="w-full">
            <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white mb-2 uppercase">
              {isGameOver ? (
                <span className="text-red-500 bg-clip-text">You Died</span>
              ) : (
                <>
                  <span className="bg-gradient-to-r from-emerald-400 via-amber-300 to-red-400 bg-clip-text text-transparent">
                    Outlast
                  </span>{' '}
                  <span className="text-slate-400">RPG</span>
                </>
              )}
            </h1>
            <p className="text-slate-400 text-xs tracking-wide mb-8">
              {isGameOver
                ? 'Your survival streak ended in the zombie infested woods.'
                : 'Procedural 3D Low-Poly Survival Simulator'}
            </p>

            {/* Quick Controls Card */}
            <div className="w-full bg-slate-950/40 border border-slate-800/50 rounded-2xl p-4 text-left mb-8 flex flex-col gap-2">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1 block">Game Controls</span>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-[10px] text-slate-400 font-semibold">
                <div>🏃 WASD <span className="text-slate-500">to Walk</span></div>
                <div>⚡ SHIFT <span className="text-slate-500">to Sprint</span></div>
                <div>⚔️ LEFT CLICK <span className="text-slate-500">to Attack/Shoot</span></div>
                <div>💫 SPACEBAR <span className="text-slate-500">to Dodge Roll</span></div>
                <div>🎒 TAB / E <span className="text-slate-500">to Inventory</span></div>
                <div>🔨 B KEY <span className="text-slate-500">to Build Mode</span></div>
              </div>
            </div>
          </div>

          <div className="w-full max-w-sm flex flex-col gap-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleStart}
              className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-black rounded-2xl shadow-xl shadow-emerald-950/30 transition-all uppercase tracking-wider text-sm border border-emerald-400/20"
            >
              {isGameOver ? 'Try Again' : 'Enter Survival World'}
            </motion.button>

            {!showSettings ? (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowSettings(true)}
                className="w-full py-3 bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 border border-slate-700/50 font-bold rounded-xl transition-all uppercase tracking-wider text-xs"
              >
                Sound Settings
              </motion.button>
            ) : (
              <div className="w-full bg-slate-950/55 border border-slate-800/40 rounded-2xl p-4 flex flex-col gap-4 text-left">
                <div className="flex justify-between items-center border-b border-slate-800/40 pb-2">
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Audio Controls</span>
                  <button onClick={() => setShowSettings(false)} className="text-[10px] text-emerald-400 font-bold uppercase">Close</button>
                </div>
                {/* Master Volume */}
                <div>
                  <label className="text-[9px] text-slate-500 font-semibold uppercase block mb-1">
                    Master Volume ({Math.round(masterVol * 100)}%)
                  </label>
                  <input
                    type="range" min="0" max="1" step="0.05" value={masterVol}
                    onChange={(e) => handleVolumeChange('master', parseFloat(e.target.value))}
                    className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                  />
                </div>
                {/* Music Volume */}
                <div>
                  <label className="text-[9px] text-slate-500 font-semibold uppercase block mb-1">
                    Music Volume ({Math.round(musicVol * 100)}%)
                  </label>
                  <input
                    type="range" min="0" max="1" step="0.05" value={musicVol}
                    onChange={(e) => handleVolumeChange('music', parseFloat(e.target.value))}
                    className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                  />
                </div>
                {/* SFX Volume */}
                <div>
                  <label className="text-[9px] text-slate-500 font-semibold uppercase block mb-1">
                    SFX Volume ({Math.round(sfxVol * 100)}%)
                  </label>
                  <input
                    type="range" min="0" max="1" step="0.05" value={sfxVol}
                    onChange={(e) => handleVolumeChange('sfx', parseFloat(e.target.value))}
                    className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
