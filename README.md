# 🌍 Work Of World (WOW): 3D Open World Survival Simulator ⛵

Welcome to **Work Of World (WOW)**, an immersive, low-poly isometric 3D survival role-playing game built for the web. Explore a beautiful procedurally-detailed valley, sail across a deep blue ocean, build a fortified home base, automate a power grid, farm crops, fish in lakes, trade at the Big Market, and survive the infected waves.

Work Of World combines the styling and visual charm of *Animal Crossing* and *Stardew Valley* with the tense survival loops of *Project Zomboid* and *State of Decay*, rendering a full 3D interactive world directly in your browser.

---

## 🎮 Core Gameplay Loop

1. **Choose Your Class**: Wake up as a **Soldier** (combat focused with a pistol), a **Farmer** (agricultural specialist), or an **Angler** (master of the lake).
2. **Scavenge & Harvest**: Fell pine trees for wood, mine mountain rocks for iron/copper, and forage wild forest apples and mushrooms.
3. **Build a Homestead**: Construct tilled soil, wooden walls, doors, and storage boxes. Sleep in beds to set your spawn point and skip the night.
4. **Automate & Power**: Supply fuel to generators to power electric lights, crop irrigation pumps, and automated defense turrets.
5. **Grow & Fish**: Grow wheat, corn, potatoes, tomatoes, and carrots. Cast your rod to catch fish in the central lake.
6. **Explore the NW Ocean**: Walk down the wooden pier, board the massive **Exploration Ship**, and sail across deep blue waters.
7. **Quest & Trade**: Purchase goods and ammo from Trader Greg at the counter inside the dry-land **Big Market**, and accept military assignments from Captain Miller.
8. **Survive the Undead**: Keep hunger, thirst, and body temperature in check. Barricade your doors to hold off aggressive zombie waves at night.

---

## ✨ Features & Game Systems

### ⛵ Ocean Exploration & Pier
* **Explore the NW Ocean**: Sail the deep blue ocean quadrant, featuring blowing wind effects and swimming tropical fish.
* **Massive Sailing Ship**: Board the exploration ship featuring a wooden hull, crossbar masts, blowing canvas sails, side railings, lanterns, and a gold steering wheel.
* **Interactive Dock & Recall**: Teleport safely back onto the wooden pier when dismounting. If your ship is parked out at sea, stand at the lantern post and press `F` to recall it instantly to the dock.

### ⚔️ Combat & RPG Systems
* **Class Kits**: Soldier (Pistol + 50x ammo + Knife), Farmer (Water Pump + seeds), and Angler (120g Gold + grilled fish).
* **3D Gunplay**: Fire the Abandoned Pistol with real-time cone raycasting and glowing yellow bullet tracers.
* **RPG Damage Popups**: Dynamic floating numbers projected into screen space (Yellow for body hits, Red/CRIT for headshots, Orange for forest animals).
* **Skill Trees**: Level up *Combat, Farming, Fishing, Crafting, Survival,* and *Engineering* skills through gameplay actions.

### 🏡 Base Building & Power Grid
* **Grid-Snapping Building**: Position barricades, doors, storage chests, and cozy beds.
* **Active Power Grid**: Fuel generators to generate electricity, lighting up streetlights and powering turrets/irrigation pumps.
* **Turret Defense**: Build automated turrets that target and eliminate nearby zombies using electrical power.

### 🦌 Living Wildlife & AI Ecosystem
* **Forest Animals**: Deer, Rabbits, and Wolves roam the wild mountain zones.
  * **Deer & Rabbits**: Wander the hills and flee rapidly if you approach them.
  * **Wolves**: Aggressive predators that chase and attack you if you enter their territory.
* **Fishing Mini-Game**: Cast your line in the central lake, wait for a bite, and play the bar-matching mini-game to catch Golden Bass, Carp, or Kraken Minnows.

### 🗺️ World, Weather, & UI
* **Weather & Temperature**: Sunny, rain, fog, and storm cycles that directly impact player body temperature.
* **Day/Night Cycle**: Fades sky colors dynamically and shifts BGM soundtracks based on time (Day, Night, Storm, and Combat themes).
* **Flat Market Plateau**: Visit the Big Market structure relocated to dry land at `[-6.0, -12.0]`, sitting on a stone concrete foundation with complete wall bounding box collision physics.
* **Visual Minimap**: Toggle a topographic map showing the `NW OCEAN`, lake, mountains, village, and current player position.

---

## ⚙️ Performance Optimizations (60 FPS)

* **GPU-Accelerated Grass Waving**: 220 grass clumps are animated 100% on the GPU using a custom vertex shader modifier inside `onBeforeCompile`, replacing slow per-frame CPU matrix translations.
* **Unified Fish-Tail Render Loop**: Consolidated 24 individual `useFrame` subscriptions inside fish components into a single parent frame loop, reducing React Three Fiber engine overhead by 95%.
* **Garbage-Collection Free Physics**: Pre-allocated static 3D vectors and mathematical planes inside frame loops to eliminate memory allocation stutters.

---

## ⌨️ Controls Guide

| Key | Action |
|---|---|
| **`W`, `A`, `S`, `D`** | Move Player (Screen-relative) |
| **`Mouse Move`** | Aim Weapon / Direct Face |
| **`Left Click`** | Melee Attack / Shoot Pistol / Interact |
| **`Spacebar`** | Combat Dodge Roll |
| **`Shift` (Hold)** | Sprint (Consumes Energy) |
| **`1` - `6`** | Equip Hotbar Item |
| **`F`** | Interact (Mount/Dismount Ship/Car, Talk, Shop, Recall Ship) |
| **`TAB` / `E`** | Open / Close Backpack Inventory |
| **`C`** | Toggle Crafting Panel |
| **`Q`** | Toggle Quest Log |
| **`M`** | Toggle Map / Minimap |
| **`B`** | Toggle Grid Building Mode (Wall, Door, Turret, etc.) |

---

## 🛠️ Technology Stack

* **Rendering Engine**: Three.js & React Three Fiber (R3F) for WebGL canvas mounting.
* **Frontend Framework**: Next.js (App Router, Static Export), TypeScript.
* **Animations & Styling**: Tailwind CSS, Framer Motion (HUD panels), `@react-three/drei` (HTML elements projection).
* **State Management**: Zustand (single-source global store managing player position, entity vectors, inventories, time, and triggers).
* **Audio Engine**: HTML5 Web Audio API procedurally synthesizing sound effects (sine/saw/noise oscillators) and situational background scores.

---

## 🚀 Getting Started

### 📋 Prerequisites
* Node.js (v18.0 or higher)
* npm, yarn, or pnpm

### ⚙️ Installation

1. Navigate to the project directory:
   ```bash
   cd "Work Of World"
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Launch the development server:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser to start playing!

4. Build for Production:
   ```bash
   npm run build
   ```
