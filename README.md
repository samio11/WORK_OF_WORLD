# 🌲 Outlast RPG: Open World Survival RPG 🧟

Welcome to **Outlast RPG**, an immersive, low-poly isometric 3D survival role-playing game built for the web. Explore a beautiful but zombie-infested valley, build a fortified shelter, generate electricity, farm crops, fish in lakes, shop at Trader Greg's counter, and fight off hordes of undead.

Outlast RPG combines the visual charm of *Animal Crossing* and *Stardew Valley* with the tense survival loops of *Project Zomboid* and *State of Decay*.

---

## 🎮 Core Gameplay Loop

1. **Choose Your Class**: Wake up as a **Soldier** (combat focused with a pistol), a **Farmer** (agricultural specialist), or an **Angler** (master of the lake).
2. **Scavenge & Harvest**: Fell pine trees for wood, mine mountain rocks for iron and copper, and forage forest apples/mushrooms.
3. **Build a Homestead**: Construct barricades, doors, and storage boxes. Restore electricity using generators to power lights, irrigation pumps, and automated defense turrets.
4. **Grow & Fish**: Plow tilled soil patches to grow crops (wheat, corn, potato, tomato, carrot). Cast your rod to catch fish in the central lake.
5. **Trade & Quest**: Claim rewards from Captain Miller and purchase supplies inside Trader Greg's walk-in Market building.
6. **Survive the Night**: Keep your hunger, thirst, and body temperature in check. Face aggressive zombies that spawn in greater numbers when the sun goes down.

---

## ✨ Features

### ⚔️ Combat & RPG Mechanics
* **Dynamic Classes**: Soldier, Farmer, and Angler starting kits and starting level perks.
* **3D Gunplay**: Shoot the **Abandoned Pistol** using real-time cone raycasting, drawing glowing yellow bullet tracers.
* **RPG Damage Popups**: Floating damage numbers projected onto screen space (Yellow for body hits, Red/CRIT for headshots, Orange for forest animals).
* **Skills Progression**: Level up your *Combat, Farming, Fishing, Crafting, Survival,* and *Engineering* skills through gameplay actions.

### 🏡 Base Building & Grid Placement
* **Grid-Snapping Construction**: Place tilled soil, wooden walls, and doors that zombies will attack.
* **Electrical Power Grid**: Supply fuel canisters to generators to power nearby electric lights, irrigation pumps, and automatic defense turrets.
* **Sleeping Spots**: Place cozy beds to set your spawn point and skip the night (restoring energy).

### 🦌 Living Wildlife & AI Ecosystem
* **Forest Animals**: Deer, Rabbits, and Wolves roam the wild zones (X: -35 to -15, Z: -35 to -15).
  * **Deer & Rabbits**: Wander the trees and flee rapidly in the opposite direction if you approach them.
  * **Wolves**: Aggressive predators that stalk and hunt you if you enter their territory, dealing damage on touch.
* **Swimming Lake Fish**: Animated Koi fish with real-time tail-wiggling geometry swimming in circular patterns in the lake.
* **Fishing Mini-Game**: Cast your fishing line near the beach. Once a fish bites, reel it in by playing a timing mini-game to catch Golden Bass, Carp, or Kraken Minnows.

### 🗺️ World, Weather, & Pathfinding
* **Camera-Relative Controls**: Smooth WASD movement mapped to screen-space directions (W is up-screen, S is down-screen, etc.) with radial sliding collision physics.
* **Walk-in Market Building**: Enter a custom brick-and-mortar storefront to standing face-to-face with Trader Greg. Bounding box physics enforce wall boundaries while leaving the doorway open.
* **Weather Cycles & Ambient Sounds**: Dynamic weather changes (sunny, rain, fog, and storm) affect your body temperature. Day/night transitions fade sky color and shift BGM soundtracks (Day, Night, Storm, and Combat themes).

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
| **`TAB` / `E`** | Open / Close Backpack Inventory |
| **`C`** | Toggle Crafting Panel |
| **`Q`** | Toggle Quest log |
| **`M`** | Toggle Map / Minimap |
| **`B`** | Toggle Grid Building Mode (Wall, Door, Turret, etc.) |

---

## 🛠️ Tech Stack & Architecture

This application is built entirely as a standalone client-side React app inside Next.js with **zero external model/texture assets** for optimal load times:
* **Core**: Next.js 15+ (App Router, Static Export), TypeScript.
* **Rendering**: Three.js, React Three Fiber (R3F) for WebGL canvas mounting.
* **UI/HUD**: Tailwind CSS, Framer Motion (animated overlays), `@react-three/drei` (CSS screen projection).
* **State Management**: Zustand (single-source global store managing player position, entity vectors, time, inventories, and triggers).
* **Audio**: HTML5 Web Audio API procedurally synthesized Sound Effects (synthesizing sine, sawtooth, and noise sweeps) and situational BGMs.

---

## 🚀 Getting Started

### 📋 Prerequisites
* Node.js (v18.0 or higher)
* npm, yarn, or pnpm

### ⚙️ Installation
1. Clone the repository or navigate to the project directory:
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
   Open [http://localhost:3000](http://localhost:3000) in your browser to play!

4. Build for Production:
   ```bash
   npm run build
   ```
