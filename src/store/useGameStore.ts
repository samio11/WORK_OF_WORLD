import { create } from 'zustand';
import { GameState, Item, Zombie, ZombieType, Building, Crop, FoliageNode, FishNode, NPC, Quest, Position, ItemType, Rarity, BuildingType, CropType, Weather, Season, SkillType, Animal, DamagePopup, RideableCar, RideableShip } from '../types/game';
import { GameAudio } from '../lib/audio';
import { getTerrainHeight } from '../game/world/WorldTerrain';

// Helper to generate IDs
const uuid = () => Math.random().toString(36).substring(2, 9);

// Initial items helper
const createItem = (
  name: string,
  type: ItemType,
  description: string,
  rarity: Rarity,
  count = 1,
  maxStack = 99,
  extra: Partial<Item> = {}
): Item => ({
  id: uuid(),
  name,
  type,
  description,
  rarity,
  count,
  maxStack,
  icon: '',
  ...extra,
});

// Define presets for items
export const ITEM_PRESETS: Record<string, Omit<Item, 'id' | 'count'>> = {
  knife: { name: 'Hunting Knife', type: 'weapon', description: 'Quick melee weapon. Good for skinning and combat.', rarity: 'common', maxStack: 1, icon: '🔪', durability: 100, maxDurability: 100, damage: 15, range: 1.8 },
  axe: { name: 'Survival Axe', type: 'tool', description: 'Used to gather wood from trees. Decent self-defense.', rarity: 'common', maxStack: 1, icon: '🪓', durability: 120, maxDurability: 120, damage: 10, range: 2.0 },
  pickaxe: { name: 'Iron Pickaxe', type: 'tool', description: 'Used to mine stone and ores in the mountains.', rarity: 'common', maxStack: 1, icon: '⛏️', durability: 120, maxDurability: 120, damage: 8, range: 2.0 },
  sword: { name: 'Machete', type: 'weapon', description: 'Excellent survival sword. Cleaves through zombies.', rarity: 'rare', maxStack: 1, icon: '⚔️', durability: 200, maxDurability: 200, damage: 26, range: 2.4 },
  bow: { name: 'Survival Bow', type: 'weapon', description: 'Silent ranged combat. Requires arrows.', rarity: 'rare', maxStack: 1, icon: '🏹', durability: 80, maxDurability: 80, damage: 18, range: 12.0 },
  fishing_rod: { name: 'Fishing Rod', type: 'tool', description: 'Used to catch fish in lakes.', rarity: 'common', maxStack: 1, icon: '🎣', durability: 100, maxDurability: 100 },
  pistol: { name: 'Abandoned Pistol', type: 'weapon', description: 'Loud defense weapon. Uses bullets.', rarity: 'epic', maxStack: 1, icon: '🔫', durability: 150, maxDurability: 150, damage: 45, range: 16.0 },
  ammo_pistol: { name: '9mm Ammo', type: 'ammo', description: 'Bullets for the abandoned pistol.', rarity: 'common', maxStack: 50, icon: '⚡' },
  wood: { name: 'Wood Log', type: 'resource', description: 'Freshly cut timber. Main building component.', rarity: 'common', maxStack: 99, icon: '🪵' },
  stone: { name: 'Raw Stone', type: 'resource', description: 'Mined rock. Useful for building and structures.', rarity: 'common', maxStack: 99, icon: '🪨' },
  iron_ore: { name: 'Iron Ore', type: 'resource', description: 'Metal ore, must be smelted at the workbench.', rarity: 'common', maxStack: 99, icon: '🧲' },
  copper_ore: { name: 'Copper Ore', type: 'resource', description: 'Conductive metal. Used for electrical wires.', rarity: 'common', maxStack: 99, icon: '🧱' },
  coal: { name: 'Coal Chunk', type: 'resource', description: 'Smelting fuel and energy generator feed.', rarity: 'common', maxStack: 99, icon: '⬛' },
  iron_bar: { name: 'Iron Bar', type: 'material', description: 'Refined iron. Used in high-grade tools.', rarity: 'rare', maxStack: 99, icon: '⛓️' },
  copper_bar: { name: 'Copper Bar', type: 'material', description: 'Refined copper. Used in electronics.', rarity: 'rare', maxStack: 99, icon: '🪙' },
  fuel: { name: 'Fuel Canister', type: 'resource', description: 'Fills up local generators and power plants.', rarity: 'rare', maxStack: 5, icon: '⛽' },
  water_bottle: { name: 'Bottled Water', type: 'water', description: 'Clean drinking water. Restores 40 thirst.', rarity: 'common', maxStack: 10, icon: '🥤', thirstRestore: 40, energyRestore: 10 },
  apple: { name: 'Wild Apple', type: 'food', description: 'Juicy forest fruit. Restores hunger and thirst.', rarity: 'common', maxStack: 20, icon: '🍎', hungerRestore: 12, thirstRestore: 8, healthRestore: 2 },
  steak: { name: 'Grilled Meat', type: 'food', description: 'Cooked steak. Highly nourishing.', rarity: 'rare', maxStack: 10, icon: '🥩', hungerRestore: 45, energyRestore: 20, healthRestore: 12 },
  bread: { name: 'Baked Bread', type: 'food', description: 'Simple bread. Restores hunger.', rarity: 'common', maxStack: 10, icon: '🍞', hungerRestore: 25 },
  vegetable_soup: { name: 'Veggie Soup', type: 'food', description: 'Hot comforting soup. Heals health and thirst.', rarity: 'rare', maxStack: 5, icon: '🥣', hungerRestore: 35, thirstRestore: 30, healthRestore: 22 },
  grilled_fish: { name: 'Cooked Fish', type: 'food', description: 'Succulent pan-fried fish.', rarity: 'rare', maxStack: 10, icon: '🐟', hungerRestore: 30, energyRestore: 15, healthRestore: 8 },
  wheat_seed: { name: 'Wheat Seed', type: 'seed', description: 'Plant on plowed soil. Harvest wheat.', rarity: 'common', maxStack: 30, icon: '🌾', seedType: 'wheat' },
  corn_seed: { name: 'Corn Seed', type: 'seed', description: 'Plant on plowed soil. Harvest sweetcorn.', rarity: 'common', maxStack: 30, icon: '🌽', seedType: 'corn' },
  potato_seed: { name: 'Potato Seed', type: 'seed', description: 'Plant on plowed soil. Harvest potatoes.', rarity: 'common', maxStack: 30, icon: '🥔', seedType: 'potato' },
  tomato_seed: { name: 'Tomato Seed', type: 'seed', description: 'Plant on plowed soil. Harvest tomatoes.', rarity: 'common', maxStack: 30, icon: '🍅', seedType: 'tomato' },
  carrot_seed: { name: 'Carrot Seed', type: 'seed', description: 'Plant on plowed soil. Harvest carrots.', rarity: 'common', maxStack: 30, icon: '🥕', seedType: 'carrot' },
  wall_item: { name: 'Wooden Wall', type: 'furniture', description: 'Grid-building item. Blocks zombies.', rarity: 'common', maxStack: 10, icon: '🧱', buildingType: 'wall' },
  door_item: { name: 'Wooden Door', type: 'furniture', description: 'Interact to open/close. Solid protection.', rarity: 'common', maxStack: 5, icon: '🚪', buildingType: 'door' },
  storage_item: { name: 'Storage Box', type: 'furniture', description: 'Placeable container. Holds 18 items.', rarity: 'common', maxStack: 5, icon: '📦', buildingType: 'storage' },
  bed_item: { name: 'Cozy Bed', type: 'furniture', description: 'Set spawn point and skip the night (restores energy).', rarity: 'common', maxStack: 2, icon: '🛏️', buildingType: 'bed' },
  workbench_item: { name: 'Workbench', type: 'furniture', description: 'Allows crafting advanced equipment and items.', rarity: 'rare', maxStack: 1, icon: '🛠️', buildingType: 'workbench' },
  kitchen_item: { name: 'Kitchen Stove', type: 'furniture', description: 'Allows cooking delicious survival dishes.', rarity: 'rare', maxStack: 1, icon: '🍳', buildingType: 'kitchen' },
  generator_item: { name: 'Fuel Generator', type: 'furniture', description: 'Consumes fuel. Powers local devices.', rarity: 'rare', maxStack: 1, icon: '⚙️', buildingType: 'generator' },
  light_item: { name: 'Electric Light', type: 'furniture', description: 'Illuminates house. Requires electrical power.', rarity: 'common', maxStack: 10, icon: '💡', buildingType: 'light' },
  water_pump_item: { name: 'Irrigation Pump', type: 'furniture', description: 'Requires power. Waters crops within 5 tiles.', rarity: 'rare', maxStack: 2, icon: '🚰', buildingType: 'water_pump' },
  turret_item: { name: 'Defense Turret', type: 'furniture', description: 'Requires power. Automatically shoots nearby zombies.', rarity: 'legendary', maxStack: 1, icon: '🛡️', buildingType: 'turret' },
  raw_fish: { name: 'Raw Fish', type: 'fish', description: 'Freshly caught fish. Sell at the market or cook it.', rarity: 'common', maxStack: 20, icon: '🐡', sellPrice: 8 },
  deer_meat: { name: 'Deer Meat', type: 'food', description: 'Fresh venison from a hunted deer. Sellable at market.', rarity: 'common', maxStack: 10, icon: '🥩', hungerRestore: 20, sellPrice: 12 },
  rabbit_meat: { name: 'Rabbit Meat', type: 'food', description: 'Small game meat from a rabbit. Sellable at market.', rarity: 'common', maxStack: 15, icon: '🍗', hungerRestore: 10, sellPrice: 8 },
};

// Initial Quests Preset
const INITIAL_QUESTS: Quest[] = [
  {
    id: 'q_wood',
    title: 'Gatherer Beginnings',
    description: 'Equip your axe and fell some trees to gather 10 Wood Logs.',
    type: 'gather',
    target: 'Wood Log',
    count: 10,
    currentCount: 0,
    reward: { xp: 30, gold: 20, items: [{ name: 'wheat_seed', count: 5 }] },
    status: 'available',
  },
  {
    id: 'q_zombies',
    title: 'Clearing the Perimeter',
    description: 'Use your hunting knife to clear out 3 walkers threatening the area.',
    type: 'kill',
    target: 'walker',
    count: 3,
    currentCount: 0,
    reward: { xp: 50, gold: 30, items: [{ name: 'steak', count: 2 }] },
    status: 'available',
  },
  {
    id: 'q_farm',
    title: 'Grow Your Own',
    description: 'Build a safe zone and harvest 3 crops (plant seeds, water, wait).',
    type: 'fish', // mapped to harvest in code
    target: 'harvest',
    count: 3,
    currentCount: 0,
    reward: { xp: 40, gold: 25, items: [{ name: 'iron_ore', count: 5 }] },
    status: 'available',
  },
  {
    id: 'q_generator',
    title: 'Power Grid restoration',
    description: 'Repair the major Power Plant generator in the center-east ruins.',
    type: 'repair',
    target: 'power_plant',
    count: 1,
    currentCount: 0,
    reward: { xp: 120, gold: 100, items: [{ name: 'turret_item', count: 1 }] },
    status: 'available',
  },
];

// Generate foliage coordinates once at startup
const generateInitialFoliage = (): FoliageNode[] => {
  const nodes: FoliageNode[] = [];
  let seed = 42;
  const random = () => {
    const x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
  };

  // Generate trees
  for (let i = 0; i < 160; i++) {
    const rx = -44 + random() * 62;
    const rz = -44 + random() * 62;
    const lakeDist = Math.hypot(rx - (-18), rz - 8);
    if (lakeDist < 16.5) continue;
    if (Math.hypot(rx, rz) < 6) continue;
    if (Math.hypot(rx - 12, rz - (-10)) < 9) continue;
    if (Math.hypot(rx - 5, rz - 8) < 11) continue;
    if (rx < -7.5 && rz < -10.5) continue;

    const ry = getTerrainHeight(rx, rz);
    if (ry > -1.0) {
      nodes.push({
        id: `t_${i}`,
        type: 'tree',
        position: [rx, ry, rz],
        scale: 0.85 + random() * 0.45,
        rotation: random() * Math.PI * 2,
      });
    }
  }

  // Generate sakura trees (cherry blossoms)
  for (let i = 0; i < 35; i++) {
    // some around Mount Fuji, some around village
    const aroundFuji = random() > 0.5;
    let rx = 0;
    let rz = 0;
    if (aroundFuji) {
      // North-East Fuji area
      rx = 22 + random() * 20;
      rz = -40 + random() * 20;
    } else {
      // Near village
      const angle = random() * Math.PI * 2;
      const dist = 11.5 + random() * 8.0;
      rx = 5 + Math.cos(angle) * dist;
      rz = 8 + Math.sin(angle) * dist;
    }

    // Skip lake
    const lakeDist = Math.hypot(rx - (-18), rz - 8);
    if (lakeDist < 16.5) continue;
    // Skip player spawn, power plant
    if (Math.hypot(rx, rz) < 6) continue;
    if (Math.hypot(rx - 12, rz - (-10)) < 9) continue;

    const ry = getTerrainHeight(rx, rz);
    if (ry > -1.0) {
      nodes.push({
        id: `s_t_${i}`,
        type: 'sakura_tree',
        position: [rx, ry, rz],
        scale: 0.85 + random() * 0.45,
        rotation: random() * Math.PI * 2,
      });
    }
  }

  // Generate rocks
  for (let i = 0; i < 45; i++) {
    const rx = 18 + random() * 26;
    const rz = 12 + random() * 26;
    const ry = getTerrainHeight(rx, rz);
    if (ry > 1.0) {
      nodes.push({
        id: `r_${i}`,
        type: 'rock',
        position: [rx, ry, rz],
        scale: 0.65 + random() * 0.8,
        rotation: random() * Math.PI * 2,
      });
    }
  }

  // Generate bushes
  for (let i = 0; i < 40; i++) {
    const rx = -35 + random() * 45;
    const rz = -35 + random() * 45;
    const lakeDist = Math.hypot(rx - (-18), rz - 8);
    if (lakeDist < 16.5) continue;
    if (Math.hypot(rx, rz) < 6) continue;
    if (rx < -7.5 && rz < -10.5) continue;
    const ry = getTerrainHeight(rx, rz);
    if (ry > -0.8 && ry < 4.0) {
      nodes.push({
        id: `b_${i}`,
        type: 'bush',
        position: [rx, ry, rz],
        scale: 0.75 + random() * 0.5,
        rotation: random() * Math.PI * 2,
      });
    }
  }

  // Generate mushrooms
  for (let i = 0; i < 35; i++) {
    const rx = -35 + random() * 50;
    const rz = -35 + random() * 50;
    const lakeDist = Math.hypot(rx - (-18), rz - 8);
    if (lakeDist < 16.5) continue;
    if (Math.hypot(rx, rz) < 6) continue;
    if (rx < -7.5 && rz < -10.5) continue;
    const ry = getTerrainHeight(rx, rz);
    if (ry > -0.8 && ry < 3.0) {
      nodes.push({
        id: `m_${i}`,
        type: 'mushroom',
        position: [rx, ry, rz],
        scale: 0.5 + random() * 0.4,
        rotation: random() * Math.PI * 2,
      });
    }
  }

  // Generate flowers
  for (let i = 0; i < 45; i++) {
    const rx = -35 + random() * 55;
    const rz = -35 + random() * 55;
    const lakeDist = Math.hypot(rx - (-18), rz - 8);
    if (lakeDist < 16.5) continue;
    if (Math.hypot(rx, rz) < 6) continue;
    if (rx < -7.5 && rz < -10.5) continue;
    const ry = getTerrainHeight(rx, rz);
    if (ry > -0.8 && ry < 3.0) {
      nodes.push({
        id: `f_${i}`,
        type: 'flower',
        position: [rx, ry, rz],
        scale: 0.6 + random() * 0.5,
        rotation: random() * Math.PI * 2,
      });
    }
  }

  return nodes;
};

// Spawn swimming fish inside the lake (center: -18, 8, radius 16m)
const generateInitialFish = (): FishNode[] => {
  const list: FishNode[] = [];
  const fishColors = ['#f97316', '#38bdf8', '#facc15', '#f8fafc']; // Orange, Blue, Yellow, Silver
  for (let i = 0; i < 9; i++) {
    const angle = (i / 9) * Math.PI * 2 + Math.random() * 0.4;
    const radius = 5.0 + Math.random() * 8.5;
    const fx = -18 + Math.cos(angle) * radius;
    const fz = 8 + Math.sin(angle) * radius;
    list.push({
      id: `fish_${i}`,
      position: [fx, -1.3, fz],
      targetAngle: angle + Math.PI / 2, // Swim perpendicular
      speed: 0.6 + Math.random() * 0.8,
      color: fishColors[i % fishColors.length],
    });
  }
  return list;
};

// Spawn swimming fish in the ocean (NW quadrant)
const generateInitialOceanFish = (): FishNode[] => {
  const list: FishNode[] = [];
  const fishColors = ['#0ea5e9', '#38bdf8', '#fb7185', '#22d3ee', '#fbbf24']; // Tropical colors
  for (let i = 0; i < 15; i++) {
    const fx = -20 - Math.random() * 25;
    const fz = -20 - Math.random() * 25;
    list.push({
      id: `ocean_fish_${i}`,
      position: [fx, -1.8, fz],
      targetAngle: Math.random() * Math.PI * 2,
      speed: 0.8 + Math.random() * 1.2,
      color: fishColors[i % fishColors.length],
    });
  }
  return list;
};

// Initial State Setup
const createInitialState = () => {
  const inventory: (Item | null)[] = Array(24).fill(null);
  const hotbar: (Item | null)[] = Array(6).fill(null);

  // Load starter pack
  hotbar[0] = { id: uuid(), count: 1, ...ITEM_PRESETS.knife } as Item;
  hotbar[1] = { id: uuid(), count: 1, ...ITEM_PRESETS.axe } as Item;
  hotbar[2] = { id: uuid(), count: 1, ...ITEM_PRESETS.pickaxe } as Item;
  
  inventory[0] = { id: uuid(), count: 5, ...ITEM_PRESETS.apple } as Item;
  inventory[1] = { id: uuid(), count: 5, ...ITEM_PRESETS.water_bottle } as Item;
  inventory[2] = { id: uuid(), count: 10, ...ITEM_PRESETS.wheat_seed } as Item;
  inventory[3] = { id: uuid(), count: 4, ...ITEM_PRESETS.wall_item } as Item;

  const defaultSkills: Record<SkillType, { level: number; xp: number; nextLevelXp: number }> = {
    farming: { level: 1, xp: 0, nextLevelXp: 100 },
    fishing: { level: 1, xp: 0, nextLevelXp: 100 },
    combat: { level: 1, xp: 0, nextLevelXp: 100 },
    crafting: { level: 1, xp: 0, nextLevelXp: 100 },
    survival: { level: 1, xp: 0, nextLevelXp: 100 },
    engineering: { level: 1, xp: 0, nextLevelXp: 100 },
  };

  const initialNPCs: NPC[] = [
    {
      id: 'npc_greg',
      type: 'trader',
      name: 'Trader Greg',
      position: [8, 0, 2.5],
      rotation: 0,
      dialogue: [
        'Welcome survivor! Need ammo? Seeds? I got them all.',
        'Zombies are tougher at night. Be careful.',
        'Have you checked the Power Plant? Repairing it activates nearby lights!',
      ],
      quests: [],
      relationship: 50,
    },
    {
      id: 'npc_miller',
      type: 'quest_giver',
      name: 'Captain Miller',
      position: [-5, 0, 10],
      rotation: Math.PI,
      dialogue: [
        'We need to defend this valley. Grab a weapon and help out!',
        'A horde of toxic runners was spotted near the north hills.',
        'Repairing generators gives us a strategic advantage.',
      ],
      quests: ['q_wood', 'q_zombies', 'q_farm', 'q_generator'],
      relationship: 50,
    },
    {
      id: 'npc_bobby',
      type: 'survivor',
      name: 'Farmer Bobby',
      position: [4.5, 0, 11],
      rotation: -Math.PI / 3,
      dialogue: [
        'Make sure to water your crops! I\'m keeping an eye on the wheat patches here.',
        'The soil is rich near the village, perfect for farming.',
        'Zombies hate carrots. Just kidding, they hate everything.',
      ],
      quests: [],
      relationship: 50,
    },
    {
      id: 'npc_joe',
      type: 'survivor',
      name: 'Fisherman Joe',
      position: [-10.2, -0.85, 9.8],
      rotation: Math.PI / 4,
      dialogue: [
        'The Koi fish are biting today! Grab a rod and cast it in the lake.',
        'I caught a rare Golden Bass earlier right off this boat.',
        'Fishing requires patience, but grilled fish is worth it.',
      ],
      quests: [],
      relationship: 50,
    },
  ];

  return {
    isGameStarted: false,
    isGameOver: false,
    activeTab: 'menu' as const,
    selectedNpcId: null,

    playerPos: [5.0, 0.5, 8.0] as Position,
    playerRot: 0,
    playerStats: {
      health: 100,
      maxHealth: 100,
      hunger: 100,
      maxHunger: 100,
      thirst: 100,
      maxThirst: 100,
      energy: 100,
      maxEnergy: 100,
      temp: 37.0,
      level: 1,
      xp: 0,
      nextLevelXp: 100,
      gold: 50,
      skills: defaultSkills,
    },
    inventory,
    hotbar,
    equippedIndex: 0,
    isAttacking: false,
    isRolling: false,
    rollCooldown: 0,
    attackCooldown: 0,

    worldTime: 8.0,
    weather: 'sunny' as Weather,
    weatherTimer: 2000,
    season: 'summer' as Season,
    seasonTimer: 9000,

    cars: [
      { id: 'car_1', position: [2.0, 0.35, 1.5], rotation: 0, color: '#b91c1c', speed: 12 },
      { id: 'car_2', position: [12.0, 0.35, 2.0], rotation: Math.PI / 2, color: '#1d4ed8', speed: 14 },
      { id: 'car_3', position: [15.0, 0.35, -6.0], rotation: Math.PI, color: '#15803d', speed: 11 },
      { id: 'car_4', position: [-5.0, 0.35, 6.0], rotation: -Math.PI / 2, color: '#eab308', speed: 13 },
    ] as RideableCar[],
    mountedCarId: null,

    ships: [
      { id: 'ship_1', position: [-23.0, -1.2, -20.0], rotation: Math.PI / 2, speed: 9.0 }
    ] as RideableShip[],
    mountedShipId: null as string | null,

    isBuildingMode: false,
    selectedBuildingType: null,

    zombies: [] as Zombie[],
    buildings: [] as Building[],
    crops: [] as Crop[],
    foliage: generateInitialFoliage(),
    lakeFish: generateInitialFish(),
    oceanFish: generateInitialOceanFish(),
    bulletTrails: [] as Array<{ id: string; start: Position; end: Position }>,
    animals: [] as Animal[],
    damagePopups: [] as DamagePopup[],
    npcs: initialNPCs,
    quests: INITIAL_QUESTS,
    powerPlant: {
      repaired: false,
      fuel: 0,
      maxFuel: 100,
      active: false,
      outputPower: 0,
    },

    fishing: {
      status: 'idle' as const,
      biteTimer: null,
      nibbleTime: null,
      fishProgress: 0,
      fishPosition: 50,
      barPosition: 40,
      fishSpeed: 1.0,
    },

    lootDrops: [] as Array<{ id: string; item: Item; position: Position }>,
  };
};

export const useGameStore = create<GameState>((set, get) => ({
  ...createInitialState(),

  startGame: () => {
    get().startGameWithClass('soldier');
  },

  startGameWithClass: (className: 'soldier' | 'farmer' | 'angler') => {
    const state = createInitialState();
    state.bulletTrails = [];

    const knifeItem = { id: uuid(), count: 1, ...ITEM_PRESETS.knife } as Item;
    const axeItem = { id: uuid(), count: 1, ...ITEM_PRESETS.axe } as Item;
    const pickaxeItem = { id: uuid(), count: 1, ...ITEM_PRESETS.pickaxe } as Item;
    
    state.hotbar = Array(6).fill(null);
    state.inventory = Array(24).fill(null);

    if (className === 'soldier') {
      state.hotbar[0] = knifeItem;
      state.hotbar[1] = { id: uuid(), count: 1, ...ITEM_PRESETS.pistol } as Item;
      state.hotbar[2] = axeItem;
      state.hotbar[3] = pickaxeItem;
      state.inventory[0] = { id: uuid(), count: 50, ...ITEM_PRESETS.ammo_pistol } as Item;
      state.inventory[1] = { id: uuid(), count: 5, ...ITEM_PRESETS.apple } as Item;
      state.inventory[2] = { id: uuid(), count: 5, ...ITEM_PRESETS.water_bottle } as Item;
      state.playerStats.skills.combat.level = 2;
    } else if (className === 'farmer') {
      state.hotbar[0] = knifeItem;
      state.hotbar[1] = axeItem;
      state.hotbar[2] = pickaxeItem;
      state.hotbar[3] = { id: uuid(), count: 1, ...ITEM_PRESETS.water_pump_item } as Item;
      state.inventory[0] = { id: uuid(), count: 15, ...ITEM_PRESETS.wheat_seed } as Item;
      state.inventory[1] = { id: uuid(), count: 15, ...ITEM_PRESETS.potato_seed } as Item;
      state.inventory[2] = { id: uuid(), count: 5, ...ITEM_PRESETS.apple } as Item;
      state.inventory[3] = { id: uuid(), count: 5, ...ITEM_PRESETS.water_bottle } as Item;
      state.playerStats.skills.farming.level = 2;
    } else if (className === 'angler') {
      state.hotbar[0] = knifeItem;
      state.hotbar[1] = { id: uuid(), count: 1, ...ITEM_PRESETS.fishing_rod } as Item;
      state.hotbar[2] = axeItem;
      state.hotbar[3] = pickaxeItem;
      state.inventory[0] = { id: uuid(), count: 10, ...ITEM_PRESETS.grilled_fish } as Item;
      state.inventory[1] = { id: uuid(), count: 5, ...ITEM_PRESETS.water_bottle } as Item;
      state.playerStats.gold = 120;
      state.playerStats.skills.fishing.level = 2;
    }

    // Spawn 4 initial zombies
    const initialZombies: Zombie[] = [];
    const types: ZombieType[] = ['runner', 'walker'];
    for (let i = 0; i < 4; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = 22 + Math.random() * 14;
      let x = Math.sin(angle) * radius;
      let z = Math.cos(angle) * radius;
      if (x < -12 && z < -12) {
        x = Math.max(-12, x);
        z = Math.max(-12, z);
      }
      initialZombies.push({
        id: uuid(),
        type: types[i % 2],
        position: [x, 0.5, z],
        health: 30,
        maxHealth: 30,
        speed: types[i % 2] === 'runner' ? 2.2 : 1.0,
        state: 'idle',
        damage: 8,
      });
    }
    state.zombies = initialZombies;

    // Spawn initial forest animals (Deer, Rabbit, Wolf) in mountains
    const initialAnimals: Animal[] = [];
    // Spawn 3 deers
    for (let i = 0; i < 3; i++) {
      const ax = 20 + Math.random() * 25;
      const az = 15 + Math.random() * 25;
      const ay = getTerrainHeight(ax, az) + 0.4;
      initialAnimals.push({
        id: `deer_${uuid()}`,
        type: 'deer',
        position: [ax, ay, az],
        health: 50,
        maxHealth: 50,
        speed: 3.5,
        rotation: Math.random() * Math.PI * 2,
        state: 'wander',
      });
    }

    // Spawn 3 rabbits
    for (let i = 0; i < 3; i++) {
      const ax = 20 + Math.random() * 25;
      const az = 15 + Math.random() * 25;
      const ay = getTerrainHeight(ax, az) + 0.15;
      initialAnimals.push({
        id: `rabbit_${uuid()}`,
        type: 'rabbit',
        position: [ax, ay, az],
        health: 15,
        maxHealth: 15,
        speed: 4.5,
        rotation: Math.random() * Math.PI * 2,
        state: 'wander',
      });
    }

    // Spawn 2 wolves
    for (let i = 0; i < 2; i++) {
      const ax = 20 + Math.random() * 25;
      const az = 15 + Math.random() * 25;
      const ay = getTerrainHeight(ax, az) + 0.42;
      initialAnimals.push({
        id: `wolf_${uuid()}`,
        type: 'wolf',
        position: [ax, ay, az],
        health: 40,
        maxHealth: 40,
        speed: 2.8,
        rotation: Math.random() * Math.PI * 2,
        state: 'wander',
      });
    }
    state.animals = initialAnimals;

    set({
      ...state,
      isGameStarted: true,
      activeTab: 'hud',
    });

    GameAudio.resume();
    GameAudio.startMusic();
    GameAudio.setMood('day');
  },

  resetGame: () => {
    set(createInitialState());
  },

  setTab: (tab) => {
    set({ activeTab: tab });
    if (tab === 'menu') {
      GameAudio.setMood('day');
    }
  },

  updatePlayerPosition: (pos, rot) => {
    set({ playerPos: pos, playerRot: rot });
  },

  damagePlayer: (amount) => {
    const stats = get().playerStats;
    const newHealth = Math.max(0, stats.health - amount);
    set({
      playerStats: {
        ...stats,
        health: newHealth,
      },
    });

    GameAudio.playSfx('hit');

    if (newHealth <= 0) {
      set({ isGameOver: true, activeTab: 'gameover' });
      GameAudio.stopMusic();
    }
  },

  healPlayer: (amount) => {
    const stats = get().playerStats;
    set({
      playerStats: {
        ...stats,
        health: Math.min(stats.maxHealth, stats.health + amount),
      },
    });
  },

  restoreHunger: (amount) => {
    const stats = get().playerStats;
    set({
      playerStats: {
        ...stats,
        hunger: Math.min(stats.maxHunger, stats.hunger + amount),
      },
    });
  },

  restoreThirst: (amount) => {
    const stats = get().playerStats;
    set({
      playerStats: {
        ...stats,
        thirst: Math.min(stats.maxThirst, stats.thirst + amount),
      },
    });
  },

  restoreEnergy: (amount) => {
    const stats = get().playerStats;
    set({
      playerStats: {
        ...stats,
        energy: Math.min(stats.maxEnergy, stats.energy + amount),
      },
    });
  },

  addGold: (amount) => {
    const stats = get().playerStats;
    set({
      playerStats: {
        ...stats,
        gold: stats.gold + amount,
      },
    });
    GameAudio.playSfx('coin');
  },

  addXp: (amount) => {
    const stats = get().playerStats;
    let newXp = stats.xp + amount;
    let newLevel = stats.level;
    let nextXp = stats.nextLevelXp;

    while (newXp >= nextXp) {
      newXp -= nextXp;
      newLevel += 1;
      nextXp = Math.floor(nextXp * 1.5);
      GameAudio.playSfx('level_up');
    }

    set({
      playerStats: {
        ...stats,
        level: newLevel,
        xp: newXp,
        nextLevelXp: nextXp,
      },
    });
  },

  addSkillXp: (skill, amount) => {
    const stats = get().playerStats;
    const skillProgress = { ...stats.skills[skill] };
    skillProgress.xp += amount;

    if (skillProgress.xp >= skillProgress.nextLevelXp) {
      skillProgress.xp -= skillProgress.nextLevelXp;
      skillProgress.level += 1;
      skillProgress.nextLevelXp = Math.floor(skillProgress.nextLevelXp * 1.5);
      GameAudio.playSfx('level_up');
    }

    set({
      playerStats: {
        ...stats,
        skills: {
          ...stats.skills,
          [skill]: skillProgress,
        },
      },
    });
  },

  addItemToInventory: (itemToAdd) => {
    const { inventory, hotbar } = get();
    
    // 1. Try to stack in hotbar
    for (let i = 0; i < hotbar.length; i++) {
      const item = hotbar[i];
      if (item && item.name === itemToAdd.name && item.count < item.maxStack) {
        const canTake = Math.min(itemToAdd.count, item.maxStack - item.count);
        const updated = [...hotbar];
        updated[i] = { ...item, count: item.count + canTake };
        set({ hotbar: updated });
        
        itemToAdd.count -= canTake;
        if (itemToAdd.count <= 0) return true;
      }
    }

    // 2. Try to stack in main inventory
    for (let i = 0; i < inventory.length; i++) {
      const item = inventory[i];
      if (item && item.name === itemToAdd.name && item.count < item.maxStack) {
        const canTake = Math.min(itemToAdd.count, item.maxStack - item.count);
        const updated = [...inventory];
        updated[i] = { ...item, count: item.count + canTake };
        set({ inventory: updated });

        itemToAdd.count -= canTake;
        if (itemToAdd.count <= 0) return true;
      }
    }

    // 3. Try to place in empty hotbar slots
    for (let i = 0; i < hotbar.length; i++) {
      if (hotbar[i] === null) {
        const updated = [...hotbar];
        updated[i] = { ...itemToAdd };
        set({ hotbar: updated });
        return true;
      }
    }

    // 4. Try to place in empty inventory slots
    for (let i = 0; i < inventory.length; i++) {
      if (inventory[i] === null) {
        const updated = [...inventory];
        updated[i] = { ...itemToAdd };
        set({ inventory: updated });
        return true;
      }
    }

    return false; // Inventory full
  },

  removeItemFromInventory: (isHotbar, index, amount) => {
    if (isHotbar) {
      const updated = [...get().hotbar];
      const item = updated[index];
      if (!item) return;

      if (item.count <= amount) {
        updated[index] = null;
      } else {
        updated[index] = { ...item, count: item.count - amount };
      }
      set({ hotbar: updated });
    } else {
      const updated = [...get().inventory];
      const item = updated[index];
      if (!item) return;

      if (item.count <= amount) {
        updated[index] = null;
      } else {
        updated[index] = { ...item, count: item.count - amount };
      }
      set({ inventory: updated });
    }
  },

  swapInventorySlots: (fromHotbar, fromIdx, toHotbar, toIdx) => {
    const hotbar = [...get().hotbar];
    const inventory = [...get().inventory];

    let temp: Item | null = null;
    
    // Get item from origin
    if (fromHotbar) {
      temp = hotbar[fromIdx];
    } else {
      temp = inventory[fromIdx];
    }

    // Move destination item to origin
    if (fromHotbar && toHotbar) {
      hotbar[fromIdx] = hotbar[toIdx];
      hotbar[toIdx] = temp;
    } else if (!fromHotbar && !toHotbar) {
      inventory[fromIdx] = inventory[toIdx];
      inventory[toIdx] = temp;
    } else if (fromHotbar && !toHotbar) {
      hotbar[fromIdx] = inventory[toIdx];
      inventory[toIdx] = temp;
    } else {
      inventory[fromIdx] = hotbar[toIdx];
      hotbar[toIdx] = temp;
    }

    set({ hotbar, inventory });
  },

  equipItem: (index) => {
    set({ equippedIndex: index });
  },

  useEquippedItem: () => {
    const { hotbar, equippedIndex, playerPos, playerRot, isBuildingMode, selectedBuildingType } = get();
    const item = hotbar[equippedIndex];
    if (!item) return;

    if (item.type === 'food' || item.type === 'water') {
      // Consume item
      get().removeItemFromInventory(true, equippedIndex, 1);
      if (item.hungerRestore) get().restoreHunger(item.hungerRestore);
      if (item.thirstRestore) get().restoreThirst(item.thirstRestore);
      if (item.healthRestore) get().healPlayer(item.healthRestore);
      if (item.energyRestore) get().restoreEnergy(item.energyRestore);
      GameAudio.playSfx('coin'); // sweet dining chime
      get().addSkillXp('survival', 5);
      return;
    }

    if (item.name === 'Abandoned Pistol') {
      if (get().attackCooldown > 0) return;

      const { hotbar, inventory, playerPos, playerRot } = get();
      const zombies = get().zombies as Zombie[];

      // Look for 9mm Ammo
      let ammoFound = false;
      let isAmmoInHotbar = false;
      let ammoIndex = -1;

      for (let i = 0; i < hotbar.length; i++) {
        if (hotbar[i]?.name === '9mm Ammo' && (hotbar[i]?.count || 0) > 0) {
          ammoFound = true;
          isAmmoInHotbar = true;
          ammoIndex = i;
          break;
        }
      }

      if (!ammoFound) {
        for (let i = 0; i < inventory.length; i++) {
          if (inventory[i]?.name === '9mm Ammo' && (inventory[i]?.count || 0) > 0) {
            ammoFound = true;
            isAmmoInHotbar = false;
            ammoIndex = i;
            break;
          }
        }
      }

      if (!ammoFound) {
        // Dry fire click
        GameAudio.playSfx('swing');
        return;
      }

      // Consume 1 ammo
      get().removeItemFromInventory(isAmmoInHotbar, ammoIndex, 1);

      // Set attack state & cooldown
      set({ isAttacking: true, attackCooldown: 0.38 });
      GameAudio.playSfx('shoot');

      setTimeout(() => {
        set({ isAttacking: false });
      }, 180);

      const dirX = Math.sin(playerRot);
      const dirZ = Math.cos(playerRot);

      const startPos: Position = [playerPos[0], playerPos[1] + 0.15, playerPos[2]];
      let endPos: Position = [
        playerPos[0] + dirX * 16.0,
        playerPos[1] + 0.15,
        playerPos[2] + dirZ * 16.0,
      ];

      let closestTarget: any = null;
      let targetType: 'zombie' | 'animal' | null = null;
      let minZDist = 16.0;

      for (let i = 0; i < zombies.length; i++) {
        const zombie = zombies[i] as any;
        const dx = zombie.position[0] - playerPos[0];
        const dz = zombie.position[2] - playerPos[2];
        const dist = Math.hypot(dx, dz);

        if (dist > 0.1 && dist <= 16.0) {
          const dot = (dx / dist) * dirX + (dz / dist) * dirZ;
          if (dot > 0.94) {
            if (dist < minZDist) {
              minZDist = dist;
              closestTarget = zombie;
              targetType = 'zombie';
            }
          }
        }
      }

      const animals = get().animals;
      for (let i = 0; i < animals.length; i++) {
        const animal = animals[i] as any;
        const dx = animal.position[0] - playerPos[0];
        const dz = animal.position[2] - playerPos[2];
        const dist = Math.hypot(dx, dz);

        if (dist > 0.1 && dist <= 16.0) {
          const dot = (dx / dist) * dirX + (dz / dist) * dirZ;
          if (dot > 0.94) {
            if (dist < minZDist) {
              minZDist = dist;
              closestTarget = animal;
              targetType = 'animal';
            }
          }
        }
      }

      if (closestTarget) {
        endPos = [closestTarget.position[0], closestTarget.position[1], closestTarget.position[2]];
        const dmg = item.damage || 45;
        if (targetType === 'zombie') {
          const isHeadshot = Math.random() > 0.85;
          get().damageZombie(closestTarget.id, isHeadshot ? dmg * 2.2 : dmg, isHeadshot);
        } else {
          get().damageAnimal(closestTarget.id, dmg);
        }
      }

      // Create bullet trail
      const trailId = Math.random().toString(36).substring(2, 9);
      set({
        bulletTrails: [
          ...get().bulletTrails,
          { id: trailId, start: startPos, end: endPos },
        ],
      });

      setTimeout(() => {
        set({
          bulletTrails: get().bulletTrails.filter((t) => t.id !== trailId),
        });
      }, 100);

      // Consume energy
      const stats = get().playerStats;
      set({ playerStats: { ...stats, energy: Math.max(0, stats.energy - 2) } });
      return;
    }

    if (item.type === 'weapon' || item.type === 'tool') {
      // Melee Swing
      if (get().attackCooldown > 0) return;
      
      set({ isAttacking: true, attackCooldown: 0.35 });
      GameAudio.playSfx('swing');

      // Consume energy
      const stats = get().playerStats;
      set({ playerStats: { ...stats, energy: Math.max(0, stats.energy - 4) } });

      // Hit Check on Zombies & Animals
      setTimeout(() => {
        set({ isAttacking: false });
        const { zombies, playerPos, playerRot } = get();
        const animals = get().animals;
        const weaponDamage = item.damage || 10;
        const weaponRange = item.range || 2.0;

        // Angle in radians of player heading
        // playerRot is the Y-rotation angle
        const attackDirX = Math.sin(playerRot);
        const attackDirZ = Math.cos(playerRot);

        // Hit Zombies
        zombies.forEach((zombie) => {
          const dx = zombie.position[0] - playerPos[0];
          const dz = zombie.position[2] - playerPos[2];
          const dist = Math.sqrt(dx * dx + dz * dz);

          if (dist <= weaponRange) {
            // Check if zombie is in front cone (approximate dot product)
            const dot = (dx / dist) * attackDirX + (dz / dist) * attackDirZ;
            if (dot > 0.4) {
              const isHeadshot = Math.random() > 0.8;
              const dmg = isHeadshot ? weaponDamage * 2 : weaponDamage;
              get().damageZombie(zombie.id, dmg, isHeadshot);
            }
          }
        });

        // Hit Animals
        animals.forEach((animal) => {
          const dx = animal.position[0] - playerPos[0];
          const dz = animal.position[2] - playerPos[2];
          const dist = Math.sqrt(dx * dx + dz * dz);

          if (dist <= weaponRange) {
            const dot = (dx / dist) * attackDirX + (dz / dist) * attackDirZ;
            if (dot > 0.4) {
              get().damageAnimal(animal.id, weaponDamage);
            }
          }
        });

        // Harvest check (trees/rocks)
        // Check if hitting near resource zones
        // Trees are placed in forest, rocks in mountains. We can do simple distance based gathering.
        // We will increment wood if hitting near forest, stone if near mountain.
        const px = playerPos[0];
        const pz = playerPos[2];

        // Forest gather (trees are around x: -20 to 10, z: -20 to 10)
        // If near forest and carrying axe:
        if (item.name === 'Survival Axe') {
          // Let's do wood gathering check based on proximity to trees
          // Let's check distance to foliage. Since we render them, we can simulate tree hits.
          // Let's say if the player is in Forest Area (x: -50..20, z: -50..10, excluding lakes)
          if (px > -40 && px < 15 && pz > -40 && pz < 15) {
            // Success gather log
            GameAudio.playSfx('hit');
            const woodItem = { ...ITEM_PRESETS.wood, count: Math.floor(Math.random() * 2) + 1 } as Item;
            get().addItemToInventory(woodItem);
            get().addSkillXp('gathering' as any, 10);
            get().addSkillXp('survival', 2);
            get().progressQuest('gather', 'Wood Log', woodItem.count);
          }
        }

        if (item.name === 'Iron Pickaxe') {
          // Mine stones/ores if in Mountain area (x: 20..50, z: 20..50)
          if (px > 15 && px < 45 && pz > 15 && pz < 45) {
            GameAudio.playSfx('hit');
            const rand = Math.random();
            let ore: Item;
            if (rand < 0.5) {
              ore = { ...ITEM_PRESETS.stone, count: Math.floor(Math.random() * 2) + 1 } as Item;
            } else if (rand < 0.75) {
              ore = { ...ITEM_PRESETS.iron_ore, count: 1 } as Item;
            } else if (rand < 0.9) {
              ore = { ...ITEM_PRESETS.copper_ore, count: 1 } as Item;
            } else {
              ore = { ...ITEM_PRESETS.coal, count: Math.floor(Math.random() * 2) + 1 } as Item;
            }
            get().addItemToInventory(ore);
            get().addSkillXp('engineering', 5);
          }
        }
      }, 150);
    }
  },

  damageZombie: (id, amount, isHeadshot = false) => {
    const zombies = get().zombies.map((z) => {
      if (z.id === id) {
        const newHealth = Math.max(0, z.health - amount);
        return {
          ...z,
          health: newHealth,
          isHit: true,
          hitTime: Date.now(),
        };
      }
      return z;
    });

    GameAudio.playSfx('zombie_hit');
    
    // Find zombie in list
    const targetZombie = get().zombies.find((z) => z.id === id);
    if (!targetZombie) return;

    // Spawn floating damage popup
    const popupPos: Position = [targetZombie.position[0], targetZombie.position[1] + 0.8, targetZombie.position[2]];
    get().addDamagePopup(amount.toString() + (isHeadshot ? " CRIT!" : ""), popupPos, isHeadshot ? '#ef4444' : '#fbbf24');

    // Check if dead
    if (targetZombie.health - amount <= 0) {
      // Remove zombie and grant rewards
      set({ zombies: zombies.filter((z) => z.id !== id) });
      
      const xpReward = targetZombie.type === 'boss' ? 200 : (targetZombie.type === 'tank' ? 40 : 15);
      const goldReward = targetZombie.type === 'boss' ? 100 : (targetZombie.type === 'tank' ? 25 : 8);
      
      get().addXp(xpReward);
      get().addGold(goldReward);
      get().addSkillXp('combat', xpReward);
      
      get().progressQuest('kill', targetZombie.type, 1);

      // Chance to drop fuel or bullet or canned water
      const dropChance = Math.random();
      let loot: Item | null = null;
      if (dropChance < 0.25) {
        loot = { ...ITEM_PRESETS.fuel, count: 1 } as Item;
      } else if (dropChance < 0.5) {
        loot = { ...ITEM_PRESETS.ammo_pistol, count: Math.floor(Math.random() * 8) + 4 } as Item;
      } else if (dropChance < 0.75) {
        loot = { ...ITEM_PRESETS.apple, count: 2 } as Item;
      }

      if (loot) {
        get().spawnLootDrop(loot, targetZombie.position);
      }
    } else {
      set({ zombies });
      // Reset hit effect after 200ms
      setTimeout(() => {
        set({
          zombies: get().zombies.map((z) => (z.id === id ? { ...z, isHit: false } : z)),
        });
      }, 200);
    }
  },

  damageAnimal: (id, amount) => {
    const animals = get().animals.map((a) => {
      if (a.id === id) {
        const newHealth = Math.max(0, a.health - amount);
        return {
          ...a,
          health: newHealth,
        };
      }
      return a;
    });

    GameAudio.playSfx('zombie_hit');

    const targetAnimal = get().animals.find((a) => a.id === id);
    if (!targetAnimal) return;

    // Add popup above animal
    const popupPos: Position = [targetAnimal.position[0], targetAnimal.position[1] + 0.8, targetAnimal.position[2]];
    get().addDamagePopup(amount.toString(), popupPos, '#fb923c');

    if (targetAnimal.health - amount <= 0) {
      set({ animals: animals.filter((a) => a.id !== id) });
      // Drop type-specific meat
      let dropPreset = ITEM_PRESETS.steak;
      let dropCount = 1;
      if (targetAnimal.type === 'deer') {
        dropPreset = ITEM_PRESETS.deer_meat;
        dropCount = 2;
      } else if (targetAnimal.type === 'rabbit') {
        dropPreset = ITEM_PRESETS.rabbit_meat;
        dropCount = 1;
      } else {
        dropPreset = ITEM_PRESETS.steak; // wolf drops generic meat
        dropCount = 1;
      }
      const meat = { id: uuid(), ...dropPreset, count: dropCount } as Item;
      get().spawnLootDrop(meat, targetAnimal.position);

      get().addXp(targetAnimal.type === 'wolf' ? 30 : 15);
      get().addGold(targetAnimal.type === 'deer' ? 12 : 5);
      get().addSkillXp('survival', 15);
      get().addDamagePopup('💀 Killed!', targetAnimal.position, '#f87171');
    } else {
      const updatedAnimals = animals.map((a) => {
        if (a.id === id) {
          const newHealth = Math.max(0, a.health - amount);
          return { ...a, health: newHealth, state: a.type === 'wolf' ? 'chase' as const : 'flee' as const };
        }
        return a;
      });
      set({ animals: updatedAnimals });
    }
  },

  addDamagePopup: (text, position, color = '#fbbf24') => {
    const popupId = Math.random().toString(36).substring(2, 9);
    set({
      damagePopups: [
        ...get().damagePopups,
        { id: popupId, text, position, color },
      ],
    });
    setTimeout(() => {
      set({
        damagePopups: get().damagePopups.filter((p) => p.id !== popupId),
      });
    }, 800);
  },

  addZombie: (zombie) => {
    set({ zombies: [...get().zombies, zombie] });
  },

  spawnZombieWave: (count) => {
    const { playerPos } = get();
    const newZombies: Zombie[] = [];
    
    const types: ZombieType[] = ['walker', 'runner', 'tank', 'toxic'];
    
    for (let i = 0; i < count; i++) {
      // Spawn in circle outside player camera view (radius 20 to 30)
      const angle = Math.random() * Math.PI * 2;
      const radius = 22 + Math.random() * 8;
      let x = playerPos[0] + Math.sin(angle) * radius;
      let z = playerPos[2] + Math.cos(angle) * radius;
      if (x < -12 && z < -12) {
        x = Math.max(-12, x);
        z = Math.max(-12, z);
      }

      // Select type
      const rand = Math.random();
      let type: ZombieType = 'walker';
      let hp = 30;
      let speed = 1.0;
      let dmg = 8;
      
      if (rand > 0.9) {
        type = 'tank';
        hp = 100;
        speed = 0.5;
        dmg = 18;
      } else if (rand > 0.7) {
        type = 'runner';
        hp = 25;
        speed = 2.2;
        dmg = 12;
      } else if (rand > 0.5) {
        type = 'toxic';
        hp = 35;
        speed = 0.9;
        dmg = 10;
      }

      newZombies.push({
        id: uuid(),
        type,
        position: [x, 0.5, z],
        health: hp,
        maxHealth: hp,
        speed,
        state: 'chase',
        damage: dmg,
      });
    }

    set({ zombies: [...get().zombies, ...newZombies] });
  },

  placeBuilding: (type, gridPos) => {
    const { buildings, hotbar, equippedIndex } = get();
    
    // Check if slot already taken
    const exists = buildings.some((b) => b.gridPos[0] === gridPos[0] && b.gridPos[1] === gridPos[1]);
    if (exists) return false;

    // Remove 1 building item from hotbar
    const item = hotbar[equippedIndex];
    if (!item) return false;

    get().removeItemFromInventory(true, equippedIndex, 1);

    const position: Position = [gridPos[0], 0.5, gridPos[1]];
    let maxHp = 100;
    if (type === 'wall') maxHp = 200;
    if (type === 'door') maxHp = 120;
    if (type === 'turret') maxHp = 150;

    const newBuilding: Building = {
      id: uuid(),
      type,
      gridPos,
      position,
      rotation: get().playerRot,
      health: maxHp,
      maxHealth: maxHp,
      active: true,
      fuel: type === 'generator' ? 0 : undefined,
      maxFuel: type === 'generator' ? 100 : undefined,
    };

    set({
      buildings: [...buildings, newBuilding],
    });

    GameAudio.playSfx('build');
    get().addSkillXp('crafting', 15);
    get().progressQuest('build', type, 1);

    return true;
  },

  damageBuilding: (id, amount) => {
    const buildings = get().buildings.map((b) => {
      if (b.id === id) {
        return { ...b, health: Math.max(0, b.health - amount) };
      }
      return b;
    });

    // Check for destroyed buildings
    set({
      buildings: buildings.filter((b) => b.health > 0),
    });
  },

  addFuelToGenerator: (id, fuelAmount) => {
    set({
      buildings: get().buildings.map((b) => {
        if (b.id === id && b.type === 'generator') {
          return {
            ...b,
            fuel: Math.min(b.maxFuel || 100, (b.fuel || 0) + fuelAmount),
          };
        }
        return b;
      }),
    });
    GameAudio.playSfx('power_on');
  },

  plantCrop: (type, gridPos) => {
    const { crops, hotbar, equippedIndex } = get();
    
    // Check if slot taken
    const exists = crops.some((c) => c.gridPos[0] === gridPos[0] && c.gridPos[1] === gridPos[1]);
    if (exists) return false;

    // Remove seed
    const item = hotbar[equippedIndex];
    if (!item) return false;
    get().removeItemFromInventory(true, equippedIndex, 1);

    const newCrop: Crop = {
      id: uuid(),
      gridPos,
      type,
      growthStage: 0,
      maxGrowthStage: 4,
      watered: false,
      plantedTime: get().worldTime,
      lastGrowTime: get().worldTime,
    };

    set({ crops: [...crops, newCrop] });
    GameAudio.playSfx('water');
    get().addSkillXp('farming', 10);
    return true;
  },

  waterCrop: (gridPos) => {
    set({
      crops: get().crops.map((c) => {
        if (c.gridPos[0] === gridPos[0] && c.gridPos[1] === gridPos[1]) {
          return { ...c, watered: true };
        }
        return c;
      }),
    });
    GameAudio.playSfx('water');
  },

  harvestCrop: (gridPos) => {
    const crop = get().crops.find((c) => c.gridPos[0] === gridPos[0] && c.gridPos[1] === gridPos[1]);
    if (!crop || crop.growthStage < crop.maxGrowthStage) return;

    // Remove crop from grid
    set({
      crops: get().crops.filter((c) => !(c.gridPos[0] === gridPos[0] && c.gridPos[1] === gridPos[1])),
    });

    // Award vegetable
    let foodItemName = 'apple';
    if (crop.type === 'wheat') foodItemName = 'bread';
    if (crop.type === 'corn') foodItemName = 'apple'; // placeholder crop yield
    if (crop.type === 'potato') foodItemName = 'apple';
    if (crop.type === 'tomato') foodItemName = 'apple';
    if (crop.type === 'carrot') foodItemName = 'apple';

    // Let's drop actual crop vegetables
    const veggiePresets: Record<CropType, keyof typeof ITEM_PRESETS> = {
      wheat: 'bread', // Smelt/bake
      corn: 'apple', // sweetcorn
      potato: 'apple',
      tomato: 'apple',
      carrot: 'apple',
    };
    
    // We can grant wheat or food directly
    const yieldItem = { ...ITEM_PRESETS.apple, name: crop.type.toUpperCase() + ' Harvest', icon: '🌽', count: Math.floor(Math.random() * 2) + 2 } as Item;
    get().addItemToInventory(yieldItem);

    GameAudio.playSfx('coin');
    get().addSkillXp('farming', 25);
    get().progressQuest('fish', 'harvest', 1); // trigger Harvest Quest (using fish type mapper)
  },

  acceptQuest: (id) => {
    set({
      quests: get().quests.map((q) => (q.id === id ? { ...q, status: 'active' } : q)),
    });
  },

  claimQuestReward: (id) => {
    const quests = get().quests;
    const quest = quests.find((q) => q.id === id);
    if (!quest || quest.status !== 'completed') return;

    // Grant rewards
    get().addXp(quest.reward.xp);
    get().addGold(quest.reward.gold);
    
    if (quest.reward.items) {
      quest.reward.items.forEach((ri) => {
        const pItem = ITEM_PRESETS[ri.name];
        if (pItem) {
          get().addItemToInventory({ ...pItem, count: ri.count } as Item);
        }
      });
    }

    set({
      quests: quests.map((q) => (q.id === id ? { ...q, status: 'claimed' } : q)),
    });
    GameAudio.playSfx('level_up');
  },

  progressQuest: (type, target, amount) => {
    set({
      quests: get().quests.map((q) => {
        if (q.status === 'active' && q.type === type && (q.target === target || q.target === 'Any')) {
          const newCount = Math.min(q.count, q.currentCount + amount);
          const completed = newCount >= q.count;
          return {
            ...q,
            currentCount: newCount,
            status: completed ? 'completed' : 'active',
          };
        }
        return q;
      }),
    });
  },

  interactNPC: (npcId) => {
    const npc = get().npcs.find((n) => n.id === npcId);
    if (npc) {
      set({ selectedNpcId: npcId, activeTab: npc.type === 'trader' ? 'trader' : 'quests' });
    }
  },

  buyItem: (item, cost) => {
    const stats = get().playerStats;
    if (stats.gold < cost) return false;

    // Try to add to inventory
    const added = get().addItemToInventory({ ...item, id: uuid() });
    if (!added) return false;

    set({
      playerStats: {
        ...stats,
        gold: stats.gold - cost,
      },
    });

    GameAudio.playSfx('coin');
    return true;
  },

  sellItem: (isHotbar, index, price) => {
    const items = isHotbar ? get().hotbar : get().inventory;
    const item = items[index];
    if (!item) return;

    // Decrease item count by 1
    get().removeItemFromInventory(isHotbar, index, 1);
    get().addGold(price);
    GameAudio.playSfx('coin');
  },

  addFuelToPowerPlant: (amount) => {
    const pp = get().powerPlant;
    const newFuel = Math.min(pp.maxFuel, pp.fuel + amount);
    set({
      powerPlant: {
        ...pp,
        fuel: newFuel,
        active: newFuel > 0,
      },
    });
    GameAudio.playSfx('power_on');
  },

  repairPowerPlant: () => {
    const pp = get().powerPlant;
    set({
      powerPlant: {
        ...pp,
        repaired: true,
      },
    });
    GameAudio.playSfx('level_up');
    get().progressQuest('repair', 'power_plant', 1);
  },

  startFishing: () => {
    const { playerPos } = get();
    // Verify player is near water (Lakes are in center-left, x: -35..-10, z: -10..20)
    const px = playerPos[0];
    const pz = playerPos[2];
    const isNearWater = px > -30 && px < -5 && pz > -10 && pz < 25;
    
    if (!isNearWater) {
      return; // Cannot fish here
    }

    set({
      fishing: {
        status: 'cast',
        biteTimer: Date.now() + 2000 + Math.random() * 4000,
        nibbleTime: null,
        fishProgress: 0,
        fishPosition: 50,
        barPosition: 40,
        fishSpeed: 1.2,
      },
    });
    GameAudio.playSfx('water');
  },

  tickFishing: (delta) => {
    const { fishing } = get();
    if (fishing.status === 'idle') return;

    if (fishing.status === 'cast') {
      if (fishing.biteTimer && Date.now() > fishing.biteTimer) {
        GameAudio.playSfx('fish_bite');
        set({
          fishing: {
            ...fishing,
            status: 'nibble',
            nibbleTime: Date.now() + 2000, // 2s to hook
          },
        });
      }
    } else if (fishing.status === 'nibble') {
      if (fishing.nibbleTime && Date.now() > fishing.nibbleTime) {
        // Nibble missed!
        set({ fishing: { ...fishing, status: 'fail' } });
        setTimeout(() => set({ fishing: { ...fishing, status: 'idle' } }), 1000);
      }
    } else if (fishing.status === 'reeling') {
      // Reeling mini-game logic
      // Bouncing target fish
      let newFishPos = fishing.fishPosition + (Math.random() - 0.5) * fishing.fishSpeed * 8;
      newFishPos = Math.max(5, Math.min(95, newFishPos));

      // Bar position falls due to gravity, moves up when player presses reels
      const newBarPos = Math.max(0, Math.min(80, fishing.barPosition - 0.8)); // Gravity

      // Check if fish is in the bar range (bar size is ~20 units)
      const isInside = newFishPos >= newBarPos && newFishPos <= newBarPos + 20;
      const progressDelta = isInside ? delta * 25 : -delta * 20;
      const newProgress = Math.max(0, Math.min(100, fishing.fishProgress + progressDelta));

      if (newProgress >= 100) {
        // Caught a fish! Give raw_fish item (can be sold or eaten)
        const fishRarities: Array<{ name: string; rarity: Rarity; goldBonus: number }> = [
          { name: 'Common Carp', rarity: 'common', goldBonus: 0 },
          { name: 'Golden Bass', rarity: 'rare', goldBonus: 10 },
          { name: 'Luminant Eel', rarity: 'epic', goldBonus: 25 },
          { name: 'Kraken Minnow', rarity: 'legendary', goldBonus: 50 },
        ];
        const picked = fishRarities[Math.floor(Math.random() * fishRarities.length)];
        const fishItem: Item = {
          id: uuid(),
          ...ITEM_PRESETS.raw_fish,
          name: picked.name,
          rarity: picked.rarity,
          count: 1,
        };

        get().addItemToInventory(fishItem);
        get().addSkillXp('fishing', 35);
        get().addGold(8 + picked.goldBonus);
        get().addDamagePopup(`🐟 Caught ${picked.name}!`, get().playerPos, '#34d399');

        set({ fishing: { ...fishing, status: 'success', targetFish: picked.name, fishRarity: picked.rarity } });
        setTimeout(() => set({ fishing: { ...fishing, status: 'idle' } }), 2000);
      } else if (newProgress <= 0 && fishing.fishProgress > 0) {
        // Lost!
        set({ fishing: { ...fishing, status: 'fail' } });
        setTimeout(() => set({ fishing: { ...fishing, status: 'idle' } }), 1000);
      } else {
        set({
          fishing: {
            ...fishing,
            fishPosition: newFishPos,
            barPosition: newBarPos,
            fishProgress: newProgress,
          },
        });
      }
    }
  },

  reelFishing: () => {
    const { fishing } = get();
    if (fishing.status === 'nibble') {
      // Reeling start!
      set({
        fishing: {
          ...fishing,
          status: 'reeling',
          fishProgress: 40,
          fishPosition: 50,
          barPosition: 40,
        },
      });
      GameAudio.playSfx('swing');
    } else if (fishing.status === 'reeling') {
      // Pull bar upwards
      set({
        fishing: {
          ...fishing,
          barPosition: Math.min(80, fishing.barPosition + 12),
        },
      });
      GameAudio.playSfx('footstep');
    }
  },

  cancelFishing: () => {
    set({
      fishing: {
        status: 'idle',
        biteTimer: null,
        nibbleTime: null,
        fishProgress: 0,
        fishPosition: 50,
        barPosition: 40,
        fishSpeed: 1.0,
      },
    });
  },

  spawnLootDrop: (item, position) => {
    set({
      lootDrops: [
        ...get().lootDrops,
        {
          id: uuid(),
          item,
          position: [position[0], 0.2, position[2]],
        },
      ],
    });
  },

  collectLootDrop: (id) => {
    const drop = get().lootDrops.find((ld) => ld.id === id);
    if (!drop) return;

    const added = get().addItemToInventory(drop.item);
    if (added) {
      set({
        lootDrops: get().lootDrops.filter((ld) => ld.id !== id),
      });
      GameAudio.playSfx('coin');
    }
  },

  rollPlayer: () => {
    if (get().rollCooldown > 0) return;
    const stats = get().playerStats;
    if (stats.energy < 20) return; // Requires energy

    set({
      isRolling: true,
      rollCooldown: 1.2,
      playerStats: {
        ...stats,
        energy: stats.energy - 20,
      },
    });

    GameAudio.playSfx('swing');

    setTimeout(() => {
      set({ isRolling: false });
    }, 400);
  },

  tickGame: (delta) => {
    const state = get();
    if (state.isGameOver) return;

    // 1. Time Progression
    const timeSpeed = 0.035;
    let newTime = state.worldTime + delta * timeSpeed;
    if (newTime >= 24.0) {
      newTime = 0.0;
      // Trigger new zombie wave at midnight if game is active!
      if (state.isGameStarted) {
        get().spawnZombieWave(5);
      }
    }

    // 1.5 Night Spawning: spawn zombies periodically when it is dark
    const isNight = newTime > 19.5 || newTime < 5.5;
    if (state.isGameStarted && isNight && state.zombies.length < 10) {
      if (Math.random() < 0.08 * delta) {
        get().spawnZombieWave(1);
      }
    }

    // Set BGM Mood based on time and combat
    const combatState = state.isGameStarted && state.zombies.some((z) => {
      const dx = z.position[0] - state.playerPos[0];
      const dz = z.position[2] - state.playerPos[2];
      return dx * dx + dz * dz < 60;
    });

    if (combatState) {
      GameAudio.setMood('combat');
    } else if (state.weather === 'storm') {
      GameAudio.setMood('storm');
    } else if (isNight) {
      GameAudio.setMood('night');
    } else {
      GameAudio.setMood('day');
    }

    // 2. Season Cycle Updates
    let newSeason = state.season;
    let newSeasonTimer = state.seasonTimer - 1;
    if (newSeasonTimer <= 0) {
      newSeasonTimer = 8000 + Math.floor(Math.random() * 4000);
      if (newSeason === 'summer') newSeason = 'rainy';
      else if (newSeason === 'rainy') newSeason = 'winter';
      else newSeason = 'summer';
    }

    // 2.5 Weather Cycle Updates (season-aware probabilities)
    let newWeather = state.weather;
    let newWeatherTimer = state.weatherTimer - 1;
    if (newWeatherTimer <= 0) {
      newWeatherTimer = 3000 + Math.floor(Math.random() * 5000);
      const rand = Math.random();
      if (newSeason === 'summer') {
        // Summer: mostly sunny, occasional fog/light rain
        if (rand < 0.70) newWeather = 'sunny';
        else if (rand < 0.85) newWeather = 'fog';
        else newWeather = 'rain';
      } else if (newSeason === 'rainy') {
        // Rainy season: heavy rain, storms, fog
        if (rand < 0.50) newWeather = 'rain';
        else if (rand < 0.80) newWeather = 'storm';
        else newWeather = 'fog';
      } else {
        // Winter: clear cold, snowy rain, fog
        if (rand < 0.40) newWeather = 'sunny';
        else if (rand < 0.75) newWeather = 'rain'; // shows as snow in WeatherSystem
        else newWeather = 'fog';
      }
    }

    // 3. Survival Depletion Rates (Only run if active)
    const stats = { ...state.playerStats };
    if (state.isGameStarted) {
      const hungerDepletion = state.isRolling ? 0.06 : 0.018;
      const thirstDepletion = state.weather === 'storm' ? 0.024 : 0.022;

      stats.hunger = Math.max(0, stats.hunger - delta * hungerDepletion);
      stats.thirst = Math.max(0, stats.thirst - delta * thirstDepletion);

      if (!state.isRolling && state.attackCooldown <= 0) {
        stats.energy = Math.min(stats.maxEnergy, stats.energy + delta * 8.0);
      }

      let targetTemp = 37.0;
      if (isNight) targetTemp -= 4.0;
      if (state.weather === 'rain') targetTemp -= 3.0;
      if (state.weather === 'storm') targetTemp -= 5.0;
      
      const nearPowerSource = state.buildings.some(
        (b) => b.type === 'generator' && b.active && Math.hypot(b.position[0] - state.playerPos[0], b.position[2] - state.playerPos[2]) < 6
      );
      if (nearPowerSource) targetTemp += 6.0;

      stats.temp += (targetTemp - stats.temp) * delta * 0.1;

      let damageTaken = 0;
      if (stats.hunger <= 0) damageTaken += delta * 1.5;
      if (stats.thirst <= 0) damageTaken += delta * 2.0;
      if (stats.temp < 32.0 || stats.temp > 41.0) damageTaken += delta * 1.0;

      if (damageTaken > 0) {
        stats.health = Math.max(0, stats.health - damageTaken);
        if (stats.health <= 0) {
          set({ isGameOver: true, activeTab: 'gameover' });
          GameAudio.stopMusic();
        }
      }
    }

    // Cooldown ticks
    const rollCooldown = Math.max(0, state.rollCooldown - delta);
    const attackCooldown = Math.max(0, state.attackCooldown - delta);

    // 4. Zombie AI updates (Only pathfind/bite if game started)
    const updatedZombies = state.isGameStarted
      ? state.zombies.map((zombie) => {
          const dx = state.playerPos[0] - zombie.position[0];
          const dz = state.playerPos[2] - zombie.position[2];
          const dist = Math.hypot(dx, dz);

          let newPos = [...zombie.position] as Position;
          let newState = zombie.state;
          let lastAtk = zombie.lastAttackTime || 0;

          const aggroDist = isNight ? 18 : 12;

          if (dist < aggroDist) {
            newState = 'chase';
            const angle = Math.atan2(dx, dz);
            if (dist > 1.2) {
              const moveSpeed = zombie.speed * (isNight ? 1.35 : 1.0);
              newPos[0] += Math.sin(angle) * moveSpeed * delta;
              newPos[2] += Math.cos(angle) * moveSpeed * delta;
            } else {
              newState = 'attack';
              if (Date.now() - lastAtk > 1500) {
                lastAtk = Date.now();
                get().damagePlayer(zombie.damage);
              }
            }
          } else {
            newState = 'idle';
            if (Math.random() < 0.02) {
              newPos[0] += (Math.random() - 0.5) * zombie.speed * 2.0;
              newPos[2] += (Math.random() - 0.5) * zombie.speed * 2.0;
            }
          }

          state.buildings.forEach((b) => {
            if (b.type === 'wall' || b.type === 'door') {
              const bDx = b.position[0] - newPos[0];
              const bDz = b.position[2] - newPos[2];
              const bDist = Math.hypot(bDx, bDz);
              if (bDist < 1.0) {
                newPos[0] -= Math.sin(Math.atan2(bDx, bDz)) * 0.1;
                newPos[2] -= Math.cos(Math.atan2(bDx, bDz)) * 0.1;
                
                if (Math.random() < 0.08) {
                  get().damageBuilding(b.id, zombie.damage * 0.2);
                }
              }
            }
          });

          return {
            ...zombie,
            position: newPos,
            state: newState,
            lastAttackTime: lastAtk,
          };
        })
      : state.zombies;

    // 4.5 Forest Animal AI updates (wander/flee/predator-chase)
    const updatedAnimals = state.isGameStarted
      ? state.animals.map((animal) => {
          const dx = state.playerPos[0] - animal.position[0];
          const dz = state.playerPos[2] - animal.position[2];
          const dist = Math.hypot(dx, dz);

          let newPos = [...animal.position] as Position;
          let newState = animal.state;
          let newRot = animal.rotation;
          let newTarget = animal.targetPos;
          let lastAtk = animal.lastAttackTime || 0;

          // Forest/Mountains boundaries on land
          const minX = 15;
          const maxX = 45;
          const minZ = 12;
          const maxZ = 45;

          if (animal.type === 'wolf') {
            // Predator behavior
            if (dist < 10.0) {
              newState = 'chase';
            } else if (newState === 'chase' && dist > 16.0) {
              newState = 'wander';
              newTarget = undefined;
            }

            if (newState === 'chase') {
              // Move toward player
              const angle = Math.atan2(dx, dz);
              newRot = angle;
              const moveSpeed = animal.speed * 1.2;
              
              if (dist > 1.1) {
                newPos[0] += Math.sin(angle) * moveSpeed * delta;
                newPos[2] += Math.cos(angle) * moveSpeed * delta;
              } else {
                // Attack player
                if (Date.now() - lastAtk > 1500) {
                  lastAtk = Date.now();
                  get().damagePlayer(6); // Wolf deals 6 damage
                }
              }
            } else {
              // Wander
              if (!newTarget || Math.random() < 0.015) {
                // Pick new target within forest limits
                newTarget = [
                  minX + 5 + Math.random() * (maxX - minX - 10),
                  0,
                  minZ + 5 + Math.random() * (maxZ - minZ - 10),
                ] as Position;
              }

              const tax = newTarget[0] - newPos[0];
              const taz = newTarget[2] - newPos[2];
              const tdist = Math.hypot(tax, taz);

              if (tdist > 0.5) {
                const angle = Math.atan2(tax, taz);
                newRot = angle;
                const moveSpeed = animal.speed * 0.4;
                newPos[0] += Math.sin(angle) * moveSpeed * delta;
                newPos[2] += Math.cos(angle) * moveSpeed * delta;
              } else {
                newTarget = undefined;
              }
            }
          } else {
            // Deer / Rabbit behavior
            if (dist < 6.5) {
              newState = 'flee';
            } else if (newState === 'flee' && dist > 12.0) {
              newState = 'wander';
              newTarget = undefined;
            }

            if (newState === 'flee') {
              // Run away from player
              const fdx = animal.position[0] - state.playerPos[0];
              const fdz = animal.position[2] - state.playerPos[2];
              const fangle = Math.atan2(fdx, fdz);
              newRot = fangle;
              const moveSpeed = animal.speed * 1.3;

              newPos[0] += Math.sin(fangle) * moveSpeed * delta;
              newPos[2] += Math.cos(fangle) * moveSpeed * delta;
            } else {
              // Wander
              if (!newTarget || Math.random() < 0.015) {
                newTarget = [
                  minX + 5 + Math.random() * (maxX - minX - 10),
                  0,
                  minZ + 5 + Math.random() * (maxZ - minZ - 10),
                ] as Position;
              }

              const tax = newTarget[0] - newPos[0];
              const taz = newTarget[2] - newPos[2];
              const tdist = Math.hypot(tax, taz);

              if (tdist > 0.5) {
                const angle = Math.atan2(tax, taz);
                newRot = angle;
                const moveSpeed = animal.speed * 0.35;
                newPos[0] += Math.sin(angle) * moveSpeed * delta;
                newPos[2] += Math.cos(angle) * moveSpeed * delta;
              } else {
                newTarget = undefined;
              }
            }
          }

          // Clamp new position to forest boundaries
          newPos[0] = Math.max(minX, Math.min(maxX, newPos[0]));
          newPos[2] = Math.max(minZ, Math.min(maxZ, newPos[2]));

          // Adjust terrain height
          const heightOffset = animal.type === 'rabbit' ? 0.15 : (animal.type === 'wolf' ? 0.42 : 0.4);
          newPos[1] = getTerrainHeight(newPos[0], newPos[2]) + heightOffset;

          return {
            ...animal,
            position: newPos,
            state: newState,
            rotation: newRot,
            targetPos: newTarget,
            lastAttackTime: lastAtk,
          };
        })
      : state.animals;

    // 5. Farming crop updates
    const updatedCrops = state.crops.map((crop) => {
      // Growth rate is faster if watered, and grows every few game hours
      let newStage = crop.growthStage;
      let newWatered = crop.watered;

      if (newWatered && Math.random() < 0.05 * delta) {
        newStage = Math.min(crop.maxGrowthStage, crop.growthStage + 1);
        newWatered = false; // soil dries up after growing
      }
      return {
        ...crop,
        growthStage: newStage,
        watered: newWatered,
      };
    });

    // 6. Building grid and device operations (Generators, Turrets, Lights, Irrigation)
    const updatedBuildings = state.buildings.map((b) => {
      let isPowered = false;
      let active = b.active;
      let fuel = b.fuel;

      // Local generator burns fuel
      if (b.type === 'generator') {
        if (b.active && fuel && fuel > 0) {
          fuel = Math.max(0, fuel - delta * 0.3); // burns fuel
          if (fuel <= 0) {
            active = false;
          }
        }
      }

      // Re-evaluate power lines
      // Devices are powered if power plant is active/repaired OR generator is active within 12 meters
      const powerPlantActive = state.powerPlant.repaired && state.powerPlant.active;
      const generatorNear = state.buildings.some(
        (gen) => gen.type === 'generator' && gen.fuel && gen.fuel > 0 && gen.active && Math.hypot(gen.position[0] - b.position[0], gen.position[2] - b.position[2]) < 12
      );

      isPowered = powerPlantActive || generatorNear;

      // Defense Turret shoot zombies
      if (b.type === 'turret' && isPowered) {
        // Locate closest zombie
        let closestZombie: Zombie | null = null;
        let minDist = 15; // Range of turret
        
        state.zombies.forEach((z) => {
          const zD = Math.hypot(z.position[0] - b.position[0], z.position[2] - b.position[2]);
          if (zD < minDist) {
            minDist = zD;
            closestZombie = z;
          }
        });

        if (closestZombie && Math.random() < 0.25 * delta) {
          // Shoot zombie!
          get().damageZombie((closestZombie as Zombie).id, 10);
          GameAudio.playSfx('hit');
        }
      }

      // Irrigation pumps automatically water crops within 5 tiles
      if (b.type === 'water_pump' && isPowered) {
        state.crops.forEach((crop) => {
          const cDist = Math.hypot(crop.gridPos[0] - b.gridPos[0], crop.gridPos[1] - b.gridPos[1]);
          if (cDist <= 5.0 && !crop.watered) {
            get().waterCrop(crop.gridPos);
          }
        });
      }

      return {
        ...b,
        active,
        fuel,
        powered: isPowered,
      };
    });

    // 7. Power plant fuel decay
    let ppFuel = state.powerPlant.fuel;
    let ppActive = state.powerPlant.active;
    if (ppActive && ppFuel > 0) {
      ppFuel = Math.max(0, ppFuel - delta * 0.1);
      if (ppFuel <= 0) ppActive = false;
    }

    // Swimming fish coordinate ticks
    const updatedFish = state.lakeFish.map((fish) => {
      const dx = fish.position[0] - (-18);
      const dz = fish.position[2] - 8;
      const radius = Math.hypot(dx, dz);
      let angle = Math.atan2(dz, dx);

      const isClockwise = fish.id.charCodeAt(5) % 2 === 0;
      angle += fish.speed * delta * 0.16 * (isClockwise ? 1 : -1);

      // Oscillate radius slightly
      const oscRadius = Math.max(4.0, Math.min(14.0, radius + Math.sin(angle * 3.0) * 0.05 * delta));
      const newX = -18 + Math.cos(angle) * oscRadius;
      const newZ = 8 + Math.sin(angle) * oscRadius;
      const newRot = angle + (isClockwise ? Math.PI / 2 : -Math.PI / 2);

      return {
        ...fish,
        position: [newX, -1.3, newZ] as Position,
        targetAngle: newRot,
      };
    });

    // Swimming ocean fish coordinate ticks
    const updatedOceanFish = state.oceanFish.map((fish) => {
      let [fx, fy, fz] = fish.position;
      let angle = fish.targetAngle;

      fx += Math.sin(angle) * fish.speed * delta;
      fz += Math.cos(angle) * fish.speed * delta;

      if (fx > -14 || fx < -52 || fz > -14 || fz < -52) {
        angle = angle + Math.PI + (Math.random() - 0.5) * 1.0;
        fx = Math.max(-51, Math.min(-15, fx));
        fz = Math.max(-51, Math.min(-15, fz));
      } else if (Math.random() < 0.02) {
        angle += (Math.random() - 0.5) * 1.2;
      }

      fy = -1.8 + Math.sin(state.worldTime * 5.0 + fish.id.charCodeAt(11)) * 0.15;

      return {
        ...fish,
        position: [fx, fy, fz] as Position,
        targetAngle: angle,
      };
    });

    set({
      worldTime: newTime,
      weather: newWeather,
      weatherTimer: newWeatherTimer,
      season: newSeason,
      seasonTimer: newSeasonTimer,
      playerStats: stats,
      rollCooldown,
      attackCooldown,
      zombies: updatedZombies,
      animals: updatedAnimals,
      crops: updatedCrops,
      buildings: updatedBuildings,
      lakeFish: updatedFish,
      oceanFish: updatedOceanFish,
      powerPlant: {
        ...state.powerPlant,
        fuel: ppFuel,
        active: ppActive,
      },
    });

    // Run fishing ticks if reeling
    if (state.fishing.status === 'reeling' || state.fishing.status === 'cast' || state.fishing.status === 'nibble') {
      get().tickFishing(delta);
    }
  },

  mountCar: (carId) => {
    set({ mountedCarId: carId });
  },

  dismountCar: () => {
    const state = get();
    if (state.mountedCarId) {
      const carId = state.mountedCarId;
      const playerPos = state.playerPos;
      const playerRot = state.playerRot;

      // Dismount to the side of the car (perpendicular to car rotation)
      const angle = playerRot + Math.PI / 2;
      const disX = Math.max(-55, Math.min(55, playerPos[0] + Math.cos(angle) * 1.35));
      const disZ = Math.max(-55, Math.min(55, playerPos[2] - Math.sin(angle) * 1.35));
      const disY = getTerrainHeight(disX, disZ) + 0.35;

      set({
        mountedCarId: null,
        playerPos: [disX, disY, disZ] as Position,
        cars: state.cars.map((car) =>
          car.id === carId
            ? {
                ...car,
                position: [playerPos[0], playerPos[1] - 0.3, playerPos[2]] as Position,
                rotation: playerRot,
              }
            : car
        ),
      });
    } else {
      set({ mountedCarId: null });
    }
  },

  mountShip: (shipId) => {
    set({ mountedShipId: shipId });
  },

  dismountShip: () => {
    const state = get();
    if (state.mountedShipId) {
      const shipId = state.mountedShipId;
      const playerPos = state.playerPos;
      const playerRot = state.playerRot;

      // Dismount safely to the pier end
      const disX = -19.0;
      const disZ = -20.0;
      const disY = getTerrainHeight(disX, disZ) + 0.35;

      set({
        mountedShipId: null,
        playerPos: [disX, disY, disZ] as Position,
        ships: state.ships.map((ship) =>
          ship.id === shipId
            ? {
                ...ship,
                position: [playerPos[0], -1.2, playerPos[2]] as Position,
                rotation: playerRot,
              }
            : ship
        ),
      });
    } else {
      set({ mountedShipId: null });
    }
  },

}));
