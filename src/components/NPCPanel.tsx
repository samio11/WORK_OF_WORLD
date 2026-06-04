import React, { useState } from 'react';
import { useGameStore, ITEM_PRESETS } from '../store/useGameStore';
import { Item } from '../types/game';
import { GameAudio } from '../lib/audio';

interface ShopItem {
  key: keyof typeof ITEM_PRESETS;
  cost: number;
}

const BUY_LIST: ShopItem[] = [
  { key: 'wheat_seed', cost: 5 },
  { key: 'carrot_seed', cost: 6 },
  { key: 'tomato_seed', cost: 7 },
  { key: 'ammo_pistol', cost: 12 },
  { key: 'fishing_rod', cost: 25 },
  { key: 'fuel', cost: 35 },
  { key: 'steak', cost: 18 },
  { key: 'pistol', cost: 180 },
];

const SELL_LIST: { key: keyof typeof ITEM_PRESETS; price: number }[] = [
  { key: 'wood', price: 2 },
  { key: 'stone', price: 2 },
  { key: 'iron_ore', price: 6 },
  { key: 'copper_ore', price: 5 },
  { key: 'coal', price: 4 },
  { key: 'apple', price: 3 },
  { key: 'grilled_fish', price: 18 },
];

export default function NPCPanel() {
  const activeTab = useGameStore((state) => state.activeTab);
  const setTab = useGameStore((state) => state.setTab);
  const selectedNpcId = useGameStore((state) => state.selectedNpcId);
  const npcs = useGameStore((state) => state.npcs);
  const playerStats = useGameStore((state) => state.playerStats);
  const hotbar = useGameStore((state) => state.hotbar);
  const inventory = useGameStore((state) => state.inventory);
  
  const buyItem = useGameStore((state) => state.buyItem);
  const sellItem = useGameStore((state) => state.sellItem);

  const [dialogueIndex, setDialogueIndex] = useState(0);

  if (activeTab !== 'trader' && selectedNpcId === null) return null;

  const npc = npcs.find((n) => n.id === selectedNpcId);
  if (!npc) return null;

  const handleNextDialogue = () => {
    if (dialogueIndex < npc.dialogue.length - 1) {
      setDialogueIndex(dialogueIndex + 1);
      GameAudio.playSfx('footstep');
    } else {
      // End dialogue, go back or open trader
      if (npc.type === 'trader') {
        setTab('trader');
      } else {
        setTab('hud');
        useGameStore.setState({ selectedNpcId: null });
      }
      setDialogueIndex(0);
    }
  };

  const handleBuy = (shopItem: ShopItem) => {
    const preset = ITEM_PRESETS[shopItem.key];
    const item = {
      id: Math.random().toString(36).substring(2, 9),
      count: shopItem.key === 'ammo_pistol' ? 12 : 1,
      ...preset,
    } as Item;

    buyItem(item, shopItem.cost);
  };

  const handleSell = (isHotbar: boolean, index: number, price: number) => {
    sellItem(isHotbar, index, price);
  };

  // Helper: Count items in inventory/hotbar to display what we can sell
  const getInventoryItemCount = (name: string) => {
    let count = 0;
    inventory.forEach((item) => {
      if (item && item.name === name) count += item.count;
    });
    hotbar.forEach((item) => {
      if (item && item.name === name) count += item.count;
    });
    return count;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-6">
      <div className="w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl flex flex-col gap-6 relative max-h-[550px] overflow-hidden">
        
        {/* Close Button */}
        <button
          onClick={() => {
            setTab('hud');
            useGameStore.setState({ selectedNpcId: null });
          }}
          className="absolute top-4 right-4 text-slate-500 hover:text-slate-300 text-xl font-bold bg-slate-800 w-8 h-8 rounded-full flex items-center justify-center transition-all"
        >
          ✕
        </button>

        {/* NPC Profile Header */}
        <div className="flex items-center gap-4 pb-4 border-b border-slate-800">
          <div className="w-12 h-12 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-2xl">
            {npc.type === 'trader' ? '🛒' : '🎖️'}
          </div>
          <div>
            <h2 className="text-lg font-black text-white leading-tight">{npc.name}</h2>
            <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider block">
              {npc.type === 'trader' ? 'Merchant Survivor' : 'Settlement Leader'}
            </span>
          </div>
          <div className="ml-auto text-yellow-500 font-black text-sm">
            💰 {playerStats.gold}g
          </div>
        </div>

        {/* DIALOGUE BUBBLE MODE */}
        {activeTab !== 'trader' ? (
          <div className="flex-1 flex flex-col justify-between py-6">
            <div className="bg-slate-950/40 border border-slate-800 rounded-2xl p-6 min-h-[140px] flex items-center">
              <p className="text-white text-base font-semibold leading-relaxed italic">
                "{npc.dialogue[dialogueIndex]}"
              </p>
            </div>
            
            <div className="flex justify-end gap-3 mt-6">
              {npc.type === 'trader' && (
                <button
                  onClick={() => setTab('trader')}
                  className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs uppercase tracking-wider transition-all"
                >
                  Open Shop Trade
                </button>
              )}
              <button
                onClick={handleNextDialogue}
                className="px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-all"
              >
                {dialogueIndex < npc.dialogue.length - 1 ? 'Next' : 'Close'}
              </button>
            </div>
          </div>
        ) : (
          /* TRADING BOARD MODE */
          <div className="flex-1 flex flex-col md:flex-row gap-6 overflow-y-auto">
            {/* BUY GRID */}
            <div className="flex-1">
              <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-3">
                Buy Supplies
              </h3>
              <div className="flex flex-col gap-2">
                {BUY_LIST.map((shopItem) => {
                  const preset = ITEM_PRESETS[shopItem.key];
                  const canAfford = playerStats.gold >= shopItem.cost;
                  return (
                    <div
                      key={shopItem.key}
                      className="p-3 bg-slate-950/40 border border-slate-800/80 rounded-xl flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{preset.icon}</span>
                        <div>
                          <h4 className="text-xs font-bold text-white leading-tight">{preset.name}</h4>
                          <span className="text-[9px] text-slate-400 mt-0.5 block">{preset.description}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleBuy(shopItem)}
                        disabled={!canAfford}
                        className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${
                          canAfford
                            ? 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                            : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                        }`}
                      >
                        Buy {shopItem.cost}g
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* SELL LIST */}
            <div className="w-full md:w-80">
              <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-3">
                Sell Gathered Items
              </h3>
              
              {/* Scan player inventory for matching items to sell */}
              <div className="flex flex-col gap-2">
                {SELL_LIST.map((sellItemPreset) => {
                  const preset = ITEM_PRESETS[sellItemPreset.key];
                  const userAmt = getInventoryItemCount(preset.name);

                  // Find slot containing this item in hotbar or inventory to trigger sell action
                  let slotIndex = -1;
                  let isHotbar = false;
                  for (let i = 0; i < hotbar.length; i++) {
                    if (hotbar[i] && hotbar[i]?.name === preset.name) {
                      slotIndex = i;
                      isHotbar = true;
                      break;
                    }
                  }
                  if (slotIndex === -1) {
                    for (let i = 0; i < inventory.length; i++) {
                      if (inventory[i] && inventory[i]?.name === preset.name) {
                        slotIndex = i;
                        isHotbar = false;
                        break;
                      }
                    }
                  }

                  return (
                    <div
                      key={sellItemPreset.key}
                      className="p-3 bg-slate-950/40 border border-slate-800/80 rounded-xl flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="text-xl">{preset.icon}</span>
                        <div>
                          <h4 className="text-xs font-bold text-white leading-tight">{preset.name}</h4>
                          <span className="text-[9px] text-slate-400 mt-0.5 block">Held: {userAmt}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleSell(isHotbar, slotIndex, sellItemPreset.price)}
                        disabled={userAmt <= 0}
                        className={`px-3 py-2 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${
                          userAmt > 0
                            ? 'bg-slate-800 hover:bg-slate-700 text-emerald-400'
                            : 'bg-slate-800/40 text-slate-600 cursor-not-allowed'
                        }`}
                      >
                        Sell {sellItemPreset.price}g
                      </button>
                    </div>
                  );
                })}
              </div>

              <button
                onClick={() => setTab('hud')}
                className="w-full mt-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs uppercase tracking-wider transition-all text-center"
              >
                Back to Wilderness
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
