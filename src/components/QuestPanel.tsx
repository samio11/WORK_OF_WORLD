import React, { useState } from 'react';
import { useGameStore } from '../store/useGameStore';
import { Quest } from '../types/game';
import { GameAudio } from '../lib/audio';

export default function QuestPanel() {
  const activeTab = useGameStore((state) => state.activeTab);
  const setTab = useGameStore((state) => state.setTab);
  const quests = useGameStore((state) => state.quests);
  const acceptQuest = useGameStore((state) => state.acceptQuest);
  const claimQuestReward = useGameStore((state) => state.claimQuestReward);

  const [selectedQuestId, setSelectedQuestId] = useState<string>('q_wood');

  if (activeTab !== 'quests') return null;

  const selectedQuest = quests.find((q) => q.id === selectedQuestId) || quests[0];

  const handleAction = (quest: Quest) => {
    if (quest.status === 'available') {
      acceptQuest(quest.id);
      GameAudio.playSfx('footstep');
    } else if (quest.status === 'completed') {
      claimQuestReward(quest.id);
      GameAudio.playSfx('level_up');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-6">
      <div className="w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl flex flex-col md:flex-row gap-6 relative h-[500px]">
        
        {/* Close Button */}
        <button
          onClick={() => setTab('hud')}
          className="absolute top-4 right-4 text-slate-500 hover:text-slate-300 text-xl font-bold bg-slate-800 w-8 h-8 rounded-full flex items-center justify-center transition-all"
        >
          ✕
        </button>

        {/* LEFT COLUMN: QUESTS LIST */}
        <div className="flex-1 overflow-y-auto pr-2">
          <h2 className="text-xl font-black text-white uppercase tracking-wider mb-4 flex items-center gap-2">
            <span>📜</span> Survival Mission Board
          </h2>

          <div className="flex flex-col gap-2">
            {quests.map((q) => {
              const isSelected = selectedQuest.id === q.id;
              
              let statusLabel = 'Available';
              let statusColor = 'text-blue-400 bg-blue-950/20 border-blue-900/50';
              if (q.status === 'active') {
                statusLabel = 'Active';
                statusColor = 'text-yellow-400 bg-yellow-950/20 border-yellow-900/50';
              } else if (q.status === 'completed') {
                statusLabel = 'Completed';
                statusColor = 'text-emerald-400 bg-emerald-950/20 border-emerald-900/50 animate-pulse';
              } else if (q.status === 'claimed') {
                statusLabel = 'Claimed';
                statusColor = 'text-slate-500 bg-slate-950/40 border-slate-900/30';
              }

              return (
                <div
                  key={q.id}
                  onClick={() => setSelectedQuestId(q.id)}
                  className={`p-3.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-emerald-500/20 border-emerald-500/80 shadow'
                      : 'bg-slate-950/40 border-slate-800 hover:border-slate-700/80'
                  }`}
                >
                  <div>
                    <h4 className="text-sm font-bold text-white leading-tight">{q.title}</h4>
                    <span className="text-[10px] text-slate-400 block mt-1">Goal: {q.count} {q.target}</span>
                  </div>

                  <span className={`text-[9px] font-black uppercase tracking-wider border px-2 py-0.5 rounded-full ${statusColor}`}>
                    {statusLabel}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT COLUMN: QUEST DETAILS & REWARDS */}
        <div className="w-full md:w-80 bg-slate-950/50 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between">
          {selectedQuest ? (
            <div className="flex flex-col h-full justify-between">
              <div>
                <h3 className="text-lg font-black text-white leading-tight mb-2">
                  {selectedQuest.title}
                </h3>
                <p className="text-slate-400 text-xs leading-relaxed mb-6">
                  {selectedQuest.description}
                </p>

                {/* Objective Progress Bar */}
                {selectedQuest.status !== 'available' && (
                  <div className="mb-6">
                    <div className="flex justify-between text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1.5">
                      <span>Objective Progress</span>
                      <span>
                        {selectedQuest.currentCount} / {selectedQuest.count}
                      </span>
                    </div>
                    <div className="w-full h-2 bg-slate-900 border border-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-300"
                        style={{ width: `${(selectedQuest.currentCount / selectedQuest.count) * 100}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Rewards Panel */}
                <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-3">
                  Contract Rewards:
                </h4>
                <div className="flex flex-col gap-2 p-3 bg-slate-900 border border-slate-800/80 rounded-xl">
                  <div className="flex justify-between items-center text-xs text-slate-300">
                    <span>XP Granted</span>
                    <span className="font-bold text-amber-500">+{selectedQuest.reward.xp} XP</span>
                  </div>
                  <div className="flex justify-between items-center text-xs text-slate-300">
                    <span>Gold Payment</span>
                    <span className="font-bold text-yellow-500">💰 {selectedQuest.reward.gold}g</span>
                  </div>
                  {selectedQuest.reward.items && selectedQuest.reward.items.map((ri, idx) => (
                    <div key={idx} className="flex justify-between items-center text-xs text-slate-300">
                      <span className="capitalize">{ri.name.replace('_item', '').replace('_', ' ')}</span>
                      <span className="font-bold text-emerald-400">x{ri.count}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Status Action Button */}
              <div>
                {selectedQuest.status === 'available' && (
                  <button
                    onClick={() => handleAction(selectedQuest)}
                    className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-all"
                  >
                    Accept Contract
                  </button>
                )}
                {selectedQuest.status === 'active' && (
                  <button
                    disabled
                    className="w-full py-3 bg-slate-800 text-slate-500 border border-slate-700/20 font-bold rounded-xl text-xs uppercase tracking-wider cursor-not-allowed"
                  >
                    In Progress
                  </button>
                )}
                {selectedQuest.status === 'completed' && (
                  <button
                    onClick={() => handleAction(selectedQuest)}
                    className="w-full py-3 bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-400 hover:to-amber-500 text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-all shadow-md shadow-amber-950/20"
                  >
                    Claim Rewards
                  </button>
                )}
                {selectedQuest.status === 'claimed' && (
                  <button
                    disabled
                    className="w-full py-3 bg-slate-950/40 text-slate-600 border border-slate-900/50 font-bold rounded-xl text-xs uppercase tracking-wider cursor-not-allowed"
                  >
                    Rewards Claimed
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center py-10">
              <span className="text-4xl mb-2 opacity-30">🔍</span>
              <h4 className="text-slate-400 font-bold text-xs uppercase tracking-widest">Select a Mission</h4>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
