import React, { useState } from 'react';
import { useGameStore, ITEM_PRESETS } from '../store/useGameStore';
import { Item } from '../types/game';
import { GameAudio } from '../lib/audio';

interface Recipe {
  name: string;
  presetKey: keyof typeof ITEM_PRESETS;
  description: string;
  ingredients: { name: string; icon: string; count: number }[];
}

const RECIPES: Recipe[] = [
  {
    name: 'Machete Sword',
    presetKey: 'sword',
    description: 'Refined iron sword. Cleaves through groups of zombies.',
    ingredients: [
      { name: 'Raw Stone', icon: '🪓', count: 5 }, // represent tools or logs
      { name: 'Iron Ore', icon: '𧢲', count: 4 },
    ],
  },
  {
    name: 'Wooden Wall',
    presetKey: 'wall_item',
    description: 'Solid wooden plank wall. Snaps to building grid to block paths.',
    ingredients: [{ name: 'Wood Log', icon: '🪵', count: 4 }],
  },
  {
    name: 'Wooden Door',
    presetKey: 'door_item',
    description: 'Interactive door. Snaps to building grid, openable by player.',
    ingredients: [{ name: 'Wood Log', icon: '🪵', count: 6 }],
  },
  {
    name: 'Storage Box',
    presetKey: 'storage_item',
    description: 'Grid chest to store items. Holds up to 18 stacks.',
    ingredients: [{ name: 'Wood Log', icon: '🪵', count: 8 }],
  },
  {
    name: 'Cozy Bed',
    presetKey: 'bed_item',
    description: 'Sets home respawn point. Speeds up night energy regeneration.',
    ingredients: [
      { name: 'Wood Log', icon: '🪵', count: 10 },
      { name: 'Wild Apple', icon: '🍎', count: 5 },
    ],
  },
  {
    name: 'Workbench',
    presetKey: 'workbench_item',
    description: 'Increases crafting speeds and unlocks advanced blueprints.',
    ingredients: [
      { name: 'Wood Log', icon: '🪵', count: 12 },
      { name: 'Raw Stone', icon: '🪨', count: 6 },
    ],
  },
  {
    name: 'Kitchen Stove',
    presetKey: 'kitchen_item',
    description: 'Allows cooking hot, nourishing foods like grilled steaks and soups.',
    ingredients: [
      { name: 'Raw Stone', icon: '🪨', count: 8 },
      { name: 'Iron Ore', icon: '𧢲', count: 4 },
    ],
  },
  {
    name: 'Fuel Generator',
    presetKey: 'generator_item',
    description: 'Generates electricity. Burns fuel canisters to power home appliances.',
    ingredients: [
      { name: 'Iron Ore', icon: '𧢲', count: 10 },
      { name: 'Copper Ore', icon: '🧱', count: 5 },
    ],
  },
  {
    name: 'Electric Light',
    presetKey: 'light_item',
    description: 'Illuminates dark rooms. Automatically connects to nearby generator.',
    ingredients: [
      { name: 'Wood Log', icon: '🪵', count: 2 },
      { name: 'Copper Ore', icon: '🧱', count: 2 },
    ],
  },
  {
    name: 'Irrigation Pump',
    presetKey: 'water_pump_item',
    description: 'Requires power. Periodically waters tilled crops within 5 tiles.',
    ingredients: [
      { name: 'Iron Ore', icon: '𧢲', count: 6 },
      { name: 'Copper Ore', icon: '🧱', count: 4 },
    ],
  },
  {
    name: 'Defense Turret',
    presetKey: 'turret_item',
    description: 'Requires power. Scans area and shoots zombies approaching base.',
    ingredients: [
      { name: 'Iron Ore', icon: '𧢲', count: 15 },
      { name: 'Copper Ore', icon: '🧱', count: 8 },
      { name: 'Coal Chunk', icon: '⬛', count: 5 },
    ],
  },
];

export default function CraftingPanel() {
  const activeTab = useGameStore((state) => state.activeTab);
  const setTab = useGameStore((state) => state.setTab);
  const inventory = useGameStore((state) => state.inventory);
  const hotbar = useGameStore((state) => state.hotbar);
  const addItemToInventory = useGameStore((state) => state.addItemToInventory);
  
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe>(RECIPES[0]);

  if (activeTab !== 'crafting') return null;

  // Helper: Count resources in inventory & hotbar
  const getResourceCount = (resourceName: string) => {
    let count = 0;
    inventory.forEach((item) => {
      if (item && item.name === resourceName) count += item.count;
    });
    hotbar.forEach((item) => {
      if (item && item.name === resourceName) count += item.count;
    });
    return count;
  };

  // Helper: check if recipe can be crafted
  const canCraft = selectedRecipe.ingredients.every((ing) => {
    return getResourceCount(ing.name) >= ing.count;
  });

  const handleCraft = () => {
    if (!canCraft) return;

    // Deduct items from inventory/hotbar
    selectedRecipe.ingredients.forEach((ing) => {
      let needed = ing.count;

      // Deduct from hotbar first
      const updatedHotbar = [...useGameStore.getState().hotbar];
      for (let i = 0; i < updatedHotbar.length; i++) {
        const item = updatedHotbar[i];
        if (item && item.name === ing.name) {
          const deduct = Math.min(needed, item.count);
          needed -= deduct;
          if (item.count <= deduct) updatedHotbar[i] = null;
          else updatedHotbar[i] = { ...item, count: item.count - deduct };
          if (needed <= 0) break;
        }
      }
      useGameStore.setState({ hotbar: updatedHotbar });

      if (needed <= 0) return;

      // Deduct from main inventory
      const updatedInv = [...useGameStore.getState().inventory];
      for (let i = 0; i < updatedInv.length; i++) {
        const item = updatedInv[i];
        if (item && item.name === ing.name) {
          const deduct = Math.min(needed, item.count);
          needed -= deduct;
          if (item.count <= deduct) updatedInv[i] = null;
          else updatedInv[i] = { ...item, count: item.count - deduct };
          if (needed <= 0) break;
        }
      }
      useGameStore.setState({ inventory: updatedInv });
    });

    // Add crafted item
    const preset = ITEM_PRESETS[selectedRecipe.presetKey];
    const craftedItem = {
      id: Math.random().toString(36).substring(2, 9),
      count: 1,
      ...preset,
    } as Item;

    const added = addItemToInventory(craftedItem);
    if (added) {
      GameAudio.playSfx('coin'); // sweet success chime
      useGameStore.getState().addSkillXp('crafting', 25);
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

        {/* LEFT COLUMN: RECIPE SELECTION */}
        <div className="flex-1 overflow-y-auto pr-2">
          <h2 className="text-xl font-black text-white uppercase tracking-wider mb-4 flex items-center gap-2">
            <span>🛠️</span> Crafting Blueprint Board
          </h2>

          <div className="flex flex-col gap-2">
            {RECIPES.map((recipe) => {
              const preset = ITEM_PRESETS[recipe.presetKey];
              const isSelected = selectedRecipe.presetKey === recipe.presetKey;
              return (
                <div
                  key={recipe.presetKey}
                  onClick={() => setSelectedRecipe(recipe)}
                  className={`p-3 rounded-xl border flex items-center gap-3 cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-emerald-500/20 border-emerald-500/80'
                      : 'bg-slate-950/40 border-slate-800 hover:border-slate-700/80'
                  }`}
                >
                  <span className="text-3xl">{preset.icon}</span>
                  <div>
                    <h4 className="text-sm font-bold text-white leading-tight">{recipe.name}</h4>
                    <span className="text-[10px] text-slate-400 capitalize block mt-0.5">{preset.type}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT COLUMN: RESOURCE REQUIREMENTS */}
        <div className="w-full md:w-80 bg-slate-950/50 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <span className="text-5xl">{ITEM_PRESETS[selectedRecipe.presetKey].icon}</span>
              <div>
                <h3 className="text-lg font-bold text-white leading-tight">{selectedRecipe.name}</h3>
                <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">
                  Unlocks {ITEM_PRESETS[selectedRecipe.presetKey].type} item
                </span>
              </div>
            </div>

            <p className="text-slate-400 text-xs leading-relaxed mb-6">
              {selectedRecipe.description}
            </p>

            <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-3">
              Required Resources:
            </h4>

            <div className="flex flex-col gap-2.5">
              {selectedRecipe.ingredients.map((ing) => {
                const playerAmt = getResourceCount(ing.name);
                const hasEnough = playerAmt >= ing.count;

                return (
                  <div key={ing.name} className="flex justify-between items-center text-xs p-2 rounded-lg bg-slate-900 border border-slate-800/80">
                    <span className="text-slate-300 font-medium">{ing.name}</span>
                    <span className={`font-black ${hasEnough ? 'text-emerald-400' : 'text-red-400'}`}>
                      {playerAmt} / {ing.count}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <button
            onClick={handleCraft}
            disabled={!canCraft}
            className={`w-full py-3 rounded-xl font-bold uppercase tracking-wider text-xs transition-all mt-6 shadow-md ${
              canCraft
                ? 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white shadow-emerald-950/20'
                : 'bg-slate-800 text-slate-500 border border-slate-700/30 cursor-not-allowed'
            }`}
          >
            Craft Item
          </button>
        </div>

      </div>
    </div>
  );
}
