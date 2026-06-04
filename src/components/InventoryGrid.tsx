import React, { useState } from 'react';
import { useGameStore } from '../store/useGameStore';
import { Item } from '../types/game';
import { GameAudio } from '../lib/audio';

export default function InventoryGrid() {
  const activeTab = useGameStore((state) => state.activeTab);
  const setTab = useGameStore((state) => state.setTab);
  const inventory = useGameStore((state) => state.inventory);
  const hotbar = useGameStore((state) => state.hotbar);
  const swapInventorySlots = useGameStore((state) => state.swapInventorySlots);
  const removeItemFromInventory = useGameStore((state) => state.removeItemFromInventory);
  
  // Selection state for click-to-swap mechanism
  const [selectedSlot, setSelectedSlot] = useState<{ isHotbar: boolean; index: number } | null>(null);
  
  // Hovered item for inspector card
  const [inspectedItem, setInspectedItem] = useState<{ item: Item; isHotbar: boolean; index: number } | null>(null);

  if (activeTab !== 'inventory') return null;

  const handleSlotClick = (isHotbar: boolean, index: number) => {
    const item = isHotbar ? hotbar[index] : inventory[index];

    if (selectedSlot === null) {
      if (item) {
        setSelectedSlot({ isHotbar, index });
        GameAudio.playSfx('footstep');
      }
    } else {
      // Swapping slots
      swapInventorySlots(selectedSlot.isHotbar, selectedSlot.index, isHotbar, index);
      setSelectedSlot(null);
      GameAudio.playSfx('craft'); // click swap sound
    }
  };

  const handleUseItem = () => {
    if (!inspectedItem) return;
    const { item, isHotbar, index } = inspectedItem;

    if (item.type === 'food' || item.type === 'water') {
      // Consume item directly from inventory
      removeItemFromInventory(isHotbar, index, 1);
      if (item.hungerRestore) useGameStore.getState().restoreHunger(item.hungerRestore);
      if (item.thirstRestore) useGameStore.getState().restoreThirst(item.thirstRestore);
      if (item.healthRestore) useGameStore.getState().healPlayer(item.healthRestore);
      if (item.energyRestore) useGameStore.getState().restoreEnergy(item.energyRestore);
      
      GameAudio.playSfx('coin'); // sweet dining chime
      useGameStore.getState().addSkillXp('survival', 5);
      
      // Update inspection details or close
      const updated = isHotbar ? hotbar[index] : inventory[index];
      if (updated) {
        setInspectedItem({ item: updated, isHotbar, index });
      } else {
        setInspectedItem(null);
      }
    } else if (item.type === 'weapon' || item.type === 'tool') {
      // Equip to slot 0 of hotbar automatically
      swapInventorySlots(isHotbar, index, true, 0);
      setSelectedSlot(null);
      GameAudio.playSfx('craft');
    }
  };

  const handleDropItem = () => {
    if (!inspectedItem) return;
    const { item, isHotbar, index } = inspectedItem;

    // Drop logic
    const playerPos = useGameStore.getState().playerPos;
    useGameStore.getState().spawnLootDrop(item, playerPos);
    removeItemFromInventory(isHotbar, index, item.count);

    GameAudio.playSfx('water'); // splash drop sound
    setInspectedItem(null);
  };

  const getRarityColor = (rarity: Item['rarity']) => {
    switch (rarity) {
      case 'common': return 'border-slate-800 text-slate-400';
      case 'rare': return 'border-blue-500/50 text-blue-400 bg-blue-950/10';
      case 'epic': return 'border-purple-500/50 text-purple-400 bg-purple-950/10';
      case 'legendary': return 'border-amber-500/50 text-amber-400 bg-amber-950/10';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-6">
      <div className="w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl flex flex-col md:flex-row gap-6 relative">
        
        {/* Close Button */}
        <button
          onClick={() => setTab('hud')}
          className="absolute top-4 right-4 text-slate-500 hover:text-slate-300 text-xl font-bold bg-slate-800 w-8 h-8 rounded-full flex items-center justify-center transition-all"
        >
          ✕
        </button>

        {/* LEFT COLUMN: BACKPACK GRID */}
        <div className="flex-1">
          <h2 className="text-xl font-black text-white uppercase tracking-wider mb-4 flex items-center gap-2">
            <span>🎒</span> Backpack Inventory
          </h2>

          {/* Main Grid: 24 slots (4 rows of 6) */}
          <div className="grid grid-cols-6 gap-2.5 mb-6">
            {inventory.map((item, idx) => {
              const isSelected = selectedSlot?.isHotbar === false && selectedSlot?.index === idx;
              return (
                <div
                  key={idx}
                  onClick={() => handleSlotClick(false, idx)}
                  onMouseEnter={() => item && setInspectedItem({ item, isHotbar: false, index: idx })}
                  className={`w-14 h-14 rounded-xl border flex flex-col items-center justify-center cursor-pointer transition-all relative ${
                    isSelected
                      ? 'border-yellow-500 bg-yellow-500/10 scale-105 shadow shadow-yellow-500/20'
                      : item
                      ? `${getRarityColor(item.rarity)} hover:scale-102 hover:bg-slate-800/50`
                      : 'border-slate-800/80 bg-slate-950/40 hover:border-slate-800'
                  }`}
                >
                  {item ? (
                    <>
                      <span className="text-2xl">{item.icon}</span>
                      <span className="absolute bottom-1 right-1.5 text-[10px] font-black text-slate-300 leading-none">
                        {item.count > 1 ? item.count : ''}
                      </span>
                    </>
                  ) : (
                    <span className="text-slate-800 font-bold text-xs">.</span>
                  )}
                </div>
              );
            })}
          </div>

          <hr className="border-slate-800/80 mb-4" />

          {/* Bottom hotbar sync row */}
          <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-3">
            ⚡ Quick Access Hotbar
          </h3>
          <div className="flex gap-2">
            {hotbar.map((item, idx) => {
              const isSelected = selectedSlot?.isHotbar === true && selectedSlot?.index === idx;
              return (
                <div
                  key={idx}
                  onClick={() => handleSlotClick(true, idx)}
                  onMouseEnter={() => item && setInspectedItem({ item, isHotbar: true, index: idx })}
                  className={`w-14 h-14 rounded-xl border flex flex-col items-center justify-center cursor-pointer transition-all relative ${
                    isSelected
                      ? 'border-yellow-500 bg-yellow-500/10 scale-105 shadow shadow-yellow-500/20'
                      : item
                      ? `${getRarityColor(item.rarity)} hover:scale-102 hover:bg-slate-800/50`
                      : 'border-slate-800 bg-slate-950/40 hover:border-slate-800'
                  }`}
                >
                  <div className="absolute top-1 left-1 text-[8px] font-black text-slate-500">
                    {idx + 1}
                  </div>
                  {item ? (
                    <>
                      <span className="text-2xl">{item.icon}</span>
                      <span className="absolute bottom-1 right-1.5 text-[10px] font-black text-slate-300 leading-none">
                        {item.count > 1 ? item.count : ''}
                      </span>
                    </>
                  ) : (
                    <span className="text-slate-800 font-bold text-xs">.</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT COLUMN: INSPECTOR CARD */}
        <div className="w-full md:w-72 bg-slate-950/50 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between">
          {inspectedItem ? (
            <div className="flex flex-col h-full justify-between">
              <div>
                <div className="flex justify-between items-start mb-2">
                  <span className="text-4xl">{inspectedItem.item.icon}</span>
                  <span className={`text-[9px] font-black uppercase border px-2 py-0.5 rounded-full ${
                    inspectedItem.item.rarity === 'common' ? 'border-slate-800 text-slate-400' :
                    inspectedItem.item.rarity === 'rare' ? 'border-blue-500/30 text-blue-400' :
                    inspectedItem.item.rarity === 'epic' ? 'border-purple-500/30 text-purple-400' :
                    'border-amber-500/30 text-amber-400'
                  }`}>
                    {inspectedItem.item.rarity}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white leading-tight mb-1">{inspectedItem.item.name}</h3>
                <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider block mb-3">
                  {inspectedItem.item.type}
                </span>
                <p className="text-slate-400 text-xs leading-relaxed mb-4">{inspectedItem.item.description}</p>
                
                {/* Dynamic details */}
                <div className="flex flex-col gap-1.5 border-t border-slate-800/80 pt-3">
                  {inspectedItem.item.durability !== undefined && (
                    <div className="flex justify-between text-xs text-slate-400">
                      <span>Durability</span>
                      <span className="font-bold text-slate-200">
                        {inspectedItem.item.durability} / {inspectedItem.item.maxDurability}
                      </span>
                    </div>
                  )}
                  {inspectedItem.item.damage !== undefined && (
                    <div className="flex justify-between text-xs text-slate-400">
                      <span>Base Damage</span>
                      <span className="font-bold text-red-400">{inspectedItem.item.damage} HP</span>
                    </div>
                  )}
                  {inspectedItem.item.hungerRestore && (
                    <div className="flex justify-between text-xs text-slate-400">
                      <span>Restores Hunger</span>
                      <span className="font-bold text-amber-500">+{inspectedItem.item.hungerRestore}%</span>
                    </div>
                  )}
                  {inspectedItem.item.thirstRestore && (
                    <div className="flex justify-between text-xs text-slate-400">
                      <span>Restores Thirst</span>
                      <span className="font-bold text-blue-400">+{inspectedItem.item.thirstRestore}%</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-2 mt-6">
                {(inspectedItem.item.type === 'food' || inspectedItem.item.type === 'water') ? (
                  <button
                    onClick={handleUseItem}
                    className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-all"
                  >
                    Consume Item
                  </button>
                ) : (inspectedItem.item.type === 'weapon' || inspectedItem.item.type === 'tool') ? (
                  <button
                    onClick={handleUseItem}
                    className="w-full py-2.5 bg-blue-500 hover:bg-blue-400 text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-all"
                  >
                    Equip to Slot 1
                  </button>
                ) : null}
                
                <button
                  onClick={handleDropItem}
                  className="w-full py-2 bg-slate-800 hover:bg-red-950/40 hover:text-red-400 text-slate-400 font-bold rounded-xl text-xs uppercase tracking-wider transition-all"
                >
                  Drop on Ground
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center py-10">
              <span className="text-4xl mb-2 opacity-30">🔍</span>
              <h4 className="text-slate-400 font-bold text-xs uppercase tracking-widest">Item Inspector</h4>
              <p className="text-[10px] text-slate-500 max-w-[180px] mt-1 leading-normal">
                Hover over or click any item to inspect its stats, usage, and rarity attributes.
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
