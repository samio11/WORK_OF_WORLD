'use client';
import React, { useState } from 'react';
import { useGameStore, ITEM_PRESETS } from '../store/useGameStore';
import { Item } from '../types/game';

// Market buy catalog
const BUY_CATALOG: Array<{ key: string; price: number; category: string }> = [
  // Food
  { key: 'apple', price: 5, category: 'Food' },
  { key: 'bread', price: 8, category: 'Food' },
  { key: 'steak', price: 28, category: 'Food' },
  { key: 'vegetable_soup', price: 32, category: 'Food' },
  { key: 'grilled_fish', price: 18, category: 'Food' },
  { key: 'water_bottle', price: 6, category: 'Food' },
  // Tools & Weapons
  { key: 'fishing_rod', price: 40, category: 'Tools' },
  { key: 'axe', price: 30, category: 'Tools' },
  { key: 'pickaxe', price: 30, category: 'Tools' },
  { key: 'knife', price: 22, category: 'Tools' },
  { key: 'bow', price: 65, category: 'Tools' },
  // Supplies
  { key: 'fuel', price: 50, category: 'Supplies' },
  { key: 'ammo_pistol', price: 2, category: 'Supplies' },
  { key: 'wall_item', price: 12, category: 'Supplies' },
  { key: 'bed_item', price: 25, category: 'Supplies' },
  // Seeds
  { key: 'wheat_seed', price: 3, category: 'Seeds' },
  { key: 'corn_seed', price: 4, category: 'Seeds' },
  { key: 'potato_seed', price: 4, category: 'Seeds' },
  { key: 'tomato_seed', price: 5, category: 'Seeds' },
  { key: 'carrot_seed', price: 4, category: 'Seeds' },
];

// Prices for selling items
const SELL_PRICES: Record<string, number> = {
  'Raw Fish': 8,
  'Common Carp': 8,
  'Golden Bass': 18,
  'Luminant Eel': 32,
  'Kraken Minnow': 60,
  'Deer Meat': 12,
  'Rabbit Meat': 8,
  'Grilled Meat': 15,
  'Cooked Fish': 12,
  'Wood Log': 2,
  'Raw Stone': 2,
  'Iron Ore': 5,
  'Copper Ore': 4,
  'Coal Chunk': 3,
  'Iron Bar': 14,
  'Copper Bar': 12,
  'Wild Apple': 3,
};

const RARITY_COLORS: Record<string, string> = {
  common: 'text-slate-300',
  rare: 'text-blue-400',
  epic: 'text-purple-400',
  legendary: 'text-amber-400',
};

const RARITY_BORDER: Record<string, string> = {
  common: 'border-slate-700',
  rare: 'border-blue-700',
  epic: 'border-purple-700',
  legendary: 'border-amber-600',
};

const CATEGORY_COLORS: Record<string, string> = {
  Food: 'bg-green-900/60 text-green-300 border-green-700',
  Tools: 'bg-blue-900/60 text-blue-300 border-blue-700',
  Supplies: 'bg-slate-800/60 text-slate-300 border-slate-600',
  Seeds: 'bg-emerald-900/60 text-emerald-300 border-emerald-700',
};

const CATEGORIES = ['All', 'Food', 'Tools', 'Supplies', 'Seeds'];

export default function MarketUI() {
  const setTab = useGameStore((s) => s.setTab);
  const playerStats = useGameStore((s) => s.playerStats);
  const inventory = useGameStore((s) => s.inventory);
  const hotbar = useGameStore((s) => s.hotbar);
  const buyItem = useGameStore((s) => s.buyItem);
  const sellItem = useGameStore((s) => s.sellItem);
  const season = useGameStore((s) => s.season);

  const [activeTab, setActiveTab] = useState<'buy' | 'sell'>('buy');
  const [filterCategory, setFilterCategory] = useState('All');
  const [notification, setNotification] = useState<{ msg: string; ok: boolean } | null>(null);

  const showNotif = (msg: string, ok: boolean) => {
    setNotification({ msg, ok });
    setTimeout(() => setNotification(null), 2000);
  };

  const handleBuy = (key: string, price: number) => {
    if (playerStats.gold < price) {
      showNotif('Not enough gold! 💰', false);
      return;
    }
    const preset = ITEM_PRESETS[key];
    if (!preset) return;
    const item: Item = {
      id: Math.random().toString(36).substring(2, 9),
      count: 1,
      ...preset,
    };
    const success = buyItem(item, price);
    if (success) {
      showNotif(`Bought ${preset.name}! ✅`, true);
    } else {
      showNotif('Inventory full!', false);
    }
  };

  const handleSell = (isHotbar: boolean, slotIndex: number, item: Item) => {
    const price = SELL_PRICES[item.name] ?? item.sellPrice ?? 1;
    sellItem(isHotbar, slotIndex, price);
    showNotif(`Sold ${item.name} for ${price}g! 💰`, true);
  };

  // Build sellable list from inventory + hotbar
  const sellableItems: Array<{ item: Item; isHotbar: boolean; slotIndex: number }> = [];
  [...hotbar, ...inventory].forEach((item, idx) => {
    if (!item) return;
    const price = SELL_PRICES[item.name] ?? item.sellPrice;
    if (price !== undefined) {
      sellableItems.push({
        item,
        isHotbar: idx < 6,
        slotIndex: idx < 6 ? idx : idx - 6,
      });
    }
  });

  const filteredBuyCatalog = BUY_CATALOG.filter(
    (c) => filterCategory === 'All' || c.category === filterCategory
  );

  const SEASON_BANNER: Record<string, { label: string; emoji: string; color: string }> = {
    summer: { label: 'Summer Market', emoji: '☀️', color: 'from-amber-900/60 to-orange-900/40' },
    rainy: { label: 'Rainy Season', emoji: '🌧️', color: 'from-blue-900/60 to-slate-900/40' },
    winter: { label: 'Winter Market', emoji: '❄️', color: 'from-slate-800/60 to-blue-900/40' },
  };
  const banner = SEASON_BANNER[season] || SEASON_BANNER.summer;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-sm">
      <div className="w-[820px] max-h-[88vh] bg-gradient-to-b from-amber-950/95 via-slate-950/98 to-slate-900/95 border border-amber-700/40 rounded-2xl shadow-2xl flex flex-col overflow-hidden select-none">

        {/* Header */}
        <div className={`bg-gradient-to-r ${banner.color} border-b border-amber-700/30 p-4 flex items-center justify-between`}>
          <div className="flex items-center gap-3">
            <span className="text-3xl">{banner.emoji}</span>
            <div>
              <h1 className="text-xl font-black text-amber-300 tracking-wide">🏪 Grand Market</h1>
              <p className="text-xs text-amber-400/70 font-semibold uppercase tracking-widest">{banner.label}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 bg-amber-900/50 border border-amber-600/30 rounded-xl px-4 py-2">
              <span className="text-amber-400 text-lg">💰</span>
              <span className="text-amber-300 font-black text-lg">{playerStats.gold}g</span>
            </div>
            <button
              onClick={() => setTab('hud')}
              className="w-9 h-9 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-400 hover:text-white hover:border-red-500 transition-all flex items-center justify-center text-lg font-black"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Tab switcher */}
        <div className="flex border-b border-amber-800/30 bg-slate-950/50">
          {(['buy', 'sell'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-3 font-black uppercase tracking-wider text-sm transition-all ${
                activeTab === tab
                  ? 'text-amber-300 border-b-2 border-amber-400 bg-amber-900/20'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              {tab === 'buy' ? '🛒 Buy Items' : '💵 Sell Items'}
            </button>
          ))}
        </div>

        {/* Notification banner */}
        {notification && (
          <div className={`mx-4 mt-3 px-4 py-2 rounded-xl text-sm font-bold text-center transition-all ${
            notification.ok ? 'bg-emerald-900/80 border border-emerald-500/40 text-emerald-300' : 'bg-red-900/80 border border-red-500/40 text-red-300'
          }`}>
            {notification.msg}
          </div>
        )}

        {/* BUY TAB */}
        {activeTab === 'buy' && (
          <div className="flex flex-col flex-1 overflow-hidden p-4">
            {/* Category filter */}
            <div className="flex gap-2 mb-4 flex-wrap">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setFilterCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wide border transition-all ${
                    filterCategory === cat
                      ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                      : 'bg-slate-900/60 border-slate-700 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Items grid */}
            <div className="grid grid-cols-4 gap-3 overflow-y-auto flex-1 pr-1">
              {filteredBuyCatalog.map(({ key, price, category }) => {
                const preset = ITEM_PRESETS[key];
                if (!preset) return null;
                const canAfford = playerStats.gold >= price;
                return (
                  <button
                    key={key}
                    onClick={() => handleBuy(key, price)}
                    disabled={!canAfford}
                    className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all group ${
                      canAfford
                        ? 'bg-slate-900/70 border-slate-700 hover:border-amber-500/60 hover:bg-amber-900/20 cursor-pointer'
                        : 'bg-slate-950/50 border-slate-800 opacity-50 cursor-not-allowed'
                    }`}
                  >
                    <span className="text-3xl">{preset.icon}</span>
                    <div className="text-center">
                      <div className={`text-xs font-bold truncate max-w-[90px] ${RARITY_COLORS[preset.rarity]}`}>
                        {preset.name}
                      </div>
                      <div className={`text-[9px] uppercase tracking-wider font-semibold mt-0.5 ${CATEGORY_COLORS[category]?.split(' ')[1] ?? 'text-slate-500'}`}>
                        {category}
                      </div>
                    </div>
                    <div className={`mt-auto px-2.5 py-1 rounded-lg text-xs font-black border ${
                      canAfford
                        ? 'bg-amber-900/50 border-amber-600/40 text-amber-300 group-hover:bg-amber-800/60'
                        : 'bg-slate-900 border-slate-700 text-slate-500'
                    }`}>
                      💰 {price}g
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* SELL TAB */}
        {activeTab === 'sell' && (
          <div className="flex flex-col flex-1 overflow-hidden p-4">
            <p className="text-slate-400 text-xs mb-4 font-semibold">
              Items you can sell — fish, meat, resources, and more. Prices shown per unit.
            </p>
            {sellableItems.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-600 gap-3">
                <span className="text-5xl">🎣</span>
                <p className="text-sm font-semibold">Nothing to sell right now.</p>
                <p className="text-xs text-slate-700">Go fishing or hunt some animals first!</p>
              </div>
            ) : (
              <div className="grid grid-cols-4 gap-3 overflow-y-auto flex-1 pr-1">
                {sellableItems.map(({ item, isHotbar, slotIndex }, idx) => {
                  const price = SELL_PRICES[item.name] ?? item.sellPrice ?? 1;
                  return (
                    <button
                      key={idx}
                      onClick={() => handleSell(isHotbar, slotIndex, item)}
                      className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all bg-slate-900/70 border-slate-700 hover:border-emerald-500/60 hover:bg-emerald-900/10 group cursor-pointer ${RARITY_BORDER[item.rarity]}`}
                    >
                      <span className="text-3xl">{item.icon}</span>
                      <div className="text-center">
                        <div className={`text-xs font-bold truncate max-w-[90px] ${RARITY_COLORS[item.rarity]}`}>
                          {item.name}
                        </div>
                        {item.count > 1 && (
                          <div className="text-[9px] text-slate-500 font-semibold">x{item.count} in stack</div>
                        )}
                      </div>
                      <div className="mt-auto px-2.5 py-1 rounded-lg text-xs font-black border bg-emerald-900/50 border-emerald-600/40 text-emerald-300 group-hover:bg-emerald-800/60">
                        Sell for 💰 {price}g
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="border-t border-amber-800/20 px-5 py-3 flex items-center justify-between bg-slate-950/60">
          <div className="text-xs text-slate-600 font-semibold">
            🐟 Catch fish with <span className="text-slate-400">Fishing Rod</span> · 🦌 Hunt animals · 💵 Sell here!
          </div>
          <button
            onClick={() => setTab('hud')}
            className="px-5 py-2 bg-amber-700/20 hover:bg-amber-600/30 border border-amber-600/30 text-amber-400 text-sm font-bold rounded-xl transition-all"
          >
            Close Market
          </button>
        </div>
      </div>
    </div>
  );
}
