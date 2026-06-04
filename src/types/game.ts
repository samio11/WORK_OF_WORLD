export type Position = [number, number, number];

export type ItemType =
  | 'tool'
  | 'weapon'
  | 'food'
  | 'resource'
  | 'material'
  | 'furniture'
  | 'seed'
  | 'ammo'
  | 'water';

export type Rarity = 'common' | 'rare' | 'epic' | 'legendary';

export interface Item {
  id: string;
  name: string;
  type: ItemType;
  description: string;
  rarity: Rarity;
  count: number;
  maxStack: number;
  icon: string;
  durability?: number;
  maxDurability?: number;
  damage?: number;
  range?: number;
  hungerRestore?: number;
  thirstRestore?: number;
  energyRestore?: number;
  healthRestore?: number;
  seedType?: CropType;
  buildingType?: BuildingType;
}

export type ZombieType = 'walker' | 'runner' | 'tank' | 'toxic' | 'boss';
export type ZombieState = 'idle' | 'chase' | 'attack';

export interface Zombie {
  id: string;
  type: ZombieType;
  position: Position;
  health: number;
  maxHealth: number;
  speed: number;
  state: ZombieState;
  damage: number;
  targetPos?: Position;
  lastAttackTime?: number;
  spitCooldown?: number;
  isHit?: boolean;
  hitTime?: number;
}

export type BuildingType =
  | 'wall'
  | 'door'
  | 'storage'
  | 'bed'
  | 'kitchen'
  | 'workbench'
  | 'generator'
  | 'light'
  | 'water_pump'
  | 'turret';

export interface Building {
  id: string;
  type: BuildingType;
  gridPos: [number, number]; // [x, z] in grid space
  position: Position; // [x, y, z] in 3D space
  rotation: number; // angle in radians
  health: number;
  maxHealth: number;
  active: boolean;
  fuel?: number;
  maxFuel?: number;
  powered?: boolean;
}

export type CropType = 'wheat' | 'corn' | 'potato' | 'tomato' | 'carrot';

export interface Crop {
  id: string;
  gridPos: [number, number]; // [x, z] in grid space
  type: CropType;
  growthStage: number; // 0 (seed) to 4 (harvestable)
  maxGrowthStage: number;
  watered: boolean;
  plantedTime: number;
  lastGrowTime: number;
}

export interface FoliageNode {
  id: string;
  type: 'tree' | 'rock' | 'bush' | 'mushroom' | 'flower';
  position: Position;
  scale: number;
  rotation: number;
}

export interface Animal {
  id: string;
  type: 'deer' | 'rabbit' | 'wolf';
  position: Position;
  health: number;
  maxHealth: number;
  speed: number;
  rotation: number;
  state: 'idle' | 'wander' | 'flee' | 'chase';
  targetPos?: Position;
  lastAttackTime?: number;
}

export interface DamagePopup {
  id: string;
  text: string;
  position: Position;
  color: string;
}

export interface FishNode {
  id: string;
  position: Position;
  targetAngle: number;
  speed: number;
  color: string;
}

export type NPCType = 'trader' | 'quest_giver' | 'survivor';

export interface NPC {
  id: string;
  type: NPCType;
  name: string;
  position: Position;
  rotation: number;
  dialogue: string[];
  quests: string[];
  relationship: number; // 0 to 100
}

export type QuestType = 'gather' | 'kill' | 'repair' | 'fish' | 'build';

export interface QuestReward {
  xp: number;
  gold: number;
  items?: { name: string; count: number }[];
}

export interface Quest {
  id: string;
  title: string;
  description: string;
  type: QuestType;
  target: string; // e.g., 'zombie_walker', 'wood', 'generator_repair', 'fish_rare', 'wall'
  count: number;
  currentCount: number;
  reward: QuestReward;
  status: 'available' | 'active' | 'completed' | 'claimed';
}

export type Weather = 'sunny' | 'rain' | 'storm' | 'fog';

export type SkillType = 'farming' | 'fishing' | 'combat' | 'crafting' | 'survival' | 'engineering';

export interface SkillProgress {
  level: number;
  xp: number;
  nextLevelXp: number;
}

export type Skills = Record<SkillType, SkillProgress>;

export interface PlayerStats {
  health: number;
  maxHealth: number;
  hunger: number;
  maxHunger: number;
  thirst: number;
  maxThirst: number;
  energy: number;
  maxEnergy: number;
  temp: number; // 15C to 42C, target is 37C
  level: number;
  xp: number;
  nextLevelXp: number;
  gold: number;
  skills: Skills;
}

export interface FishingState {
  status: 'idle' | 'cast' | 'nibble' | 'reeling' | 'success' | 'fail';
  biteTimer: number | null;
  nibbleTime: number | null;
  fishProgress: number; // 0 to 100
  fishPosition: number; // 0 to 100 (where the fish is in the reeling gauge)
  barPosition: number; // 0 to 100 (where the player's reel bar is)
  fishSpeed: number;
  targetFish?: string;
  fishRarity?: Rarity;
}

export interface PowerPlantState {
  repaired: boolean;
  fuel: number;
  maxFuel: number;
  active: boolean;
  outputPower: number; // kW
}

export interface GameState {
  // Game Management
  isGameStarted: boolean;
  isGameOver: boolean;
  activeTab: 'hud' | 'inventory' | 'crafting' | 'quests' | 'map' | 'menu' | 'trader' | 'gameover';
  selectedNpcId: string | null;

  // Player Stats and Position
  playerPos: Position;
  playerRot: number;
  playerStats: PlayerStats;
  inventory: (Item | null)[]; // 24 slots (4 rows of 6)
  hotbar: (Item | null)[]; // 6 slots
  equippedIndex: number; // index of hotbar item, -1 if none
  isAttacking: boolean;
  isRolling: boolean;
  rollCooldown: number;
  attackCooldown: number;

  // World Stats
  worldTime: number; // 0.0 to 24.0 (hours)
  weather: Weather;
  weatherTimer: number; // duration of current weather in game ticks

  // Grid / Farming / Building Mode
  isBuildingMode: boolean;
  selectedBuildingType: BuildingType | null;

  // Game Entities & Objects
  zombies: Zombie[];
  buildings: Building[];
  crops: Crop[];
  foliage: FoliageNode[];
  lakeFish: FishNode[];
  bulletTrails: Array<{ id: string; start: Position; end: Position }>;
  animals: Animal[];
  damagePopups: DamagePopup[];
  npcs: NPC[];
  quests: Quest[];
  powerPlant: PowerPlantState;

  // Fishing System
  fishing: FishingState;

  // Loot items dropped in world
  lootDrops: Array<{
    id: string;
    item: Item;
    position: Position;
  }>;

  // Actions
  startGame: () => void;
  startGameWithClass: (className: 'soldier' | 'farmer' | 'angler') => void;
  resetGame: () => void;
  setTab: (tab: GameState['activeTab']) => void;
  updatePlayerPosition: (pos: Position, rot: number) => void;
  damagePlayer: (amount: number) => void;
  healPlayer: (amount: number) => void;
  restoreHunger: (amount: number) => void;
  restoreThirst: (amount: number) => void;
  restoreEnergy: (amount: number) => void;
  addGold: (amount: number) => void;
  addXp: (amount: number) => void;
  addSkillXp: (skill: SkillType, amount: number) => void;
  addItemToInventory: (item: Item) => boolean;
  removeItemFromInventory: (isHotbar: boolean, index: number, amount: number) => void;
  swapInventorySlots: (fromHotbar: boolean, fromIdx: number, toHotbar: boolean, toIdx: number) => void;
  equipItem: (index: number) => void;
  useEquippedItem: () => void;
  damageZombie: (id: string, amount: number, isHeadshot?: boolean) => void;
  damageAnimal: (id: string, amount: number) => void;
  addDamagePopup: (text: string, position: Position, color?: string) => void;
  addZombie: (zombie: Zombie) => void;
  spawnZombieWave: (count: number) => void;
  placeBuilding: (type: BuildingType, gridPos: [number, number]) => boolean;
  damageBuilding: (id: string, amount: number) => void;
  addFuelToGenerator: (id: string, fuelAmount: number) => void;
  plantCrop: (type: CropType, gridPos: [number, number]) => boolean;
  waterCrop: (gridPos: [number, number]) => void;
  harvestCrop: (gridPos: [number, number]) => void;
  acceptQuest: (id: string) => void;
  claimQuestReward: (id: string) => void;
  progressQuest: (type: QuestType, target: string, amount: number) => void;
  interactNPC: (npcId: string) => void;
  buyItem: (item: Item, cost: number) => boolean;
  sellItem: (fromHotbar: boolean, slotIndex: number, price: number) => void;
  addFuelToPowerPlant: (amount: number) => void;
  repairPowerPlant: () => void;
  startFishing: () => void;
  tickFishing: (delta: number) => void;
  reelFishing: () => void;
  cancelFishing: () => void;
  spawnLootDrop: (item: Item, position: Position) => void;
  collectLootDrop: (id: string) => void;
  rollPlayer: () => void;
  tickGame: (delta: number) => void;
}
