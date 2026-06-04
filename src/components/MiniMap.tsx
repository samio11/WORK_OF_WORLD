import React, { useEffect, useRef } from 'react';
import { useGameStore } from '../store/useGameStore';

export default function MiniMap() {
  const activeTab = useGameStore((state) => state.activeTab);
  const setTab = useGameStore((state) => state.setTab);
  
  const playerPos = useGameStore((state) => state.playerPos);
  const zombies = useGameStore((state) => state.zombies);
  const buildings = useGameStore((state) => state.buildings);
  const npcs = useGameStore((state) => state.npcs);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (activeTab !== 'map' || !canvasRef.current) return;

    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    const width = canvasRef.current.width;
    const height = canvasRef.current.height;

    // Clear Canvas with nice forest green background
    ctx.fillStyle = '#166534'; // Dark forest green
    ctx.fillRect(0, 0, width, height);

    // World bounds are -60 to +60 in coordinates
    // Convert 3D world coord (x, z) to canvas pixel coord (px, py)
    const worldToCanvas = (wx: number, wz: number) => {
      const px = ((wx + 60) / 120) * width;
      const py = ((wz + 60) / 120) * height;
      return { px, py };
    };

    // 1. Draw Lake (Blue circle)
    // Lake center: x = -18, z = 8, radius = 16
    const lake = worldToCanvas(-18, 8);
    const lakeRad = (16 / 120) * width;
    ctx.beginPath();
    ctx.arc(lake.px, lake.py, lakeRad, 0, Math.PI * 2);
    ctx.fillStyle = '#1d4ed8'; // Lake blue
    ctx.fill();
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = '#3b82f6';
    ctx.stroke();

    // 1.5 Draw Ocean (Deep blue rectangle in NW: x < -12, z < -12)
    const oceanTopLeft = worldToCanvas(-60, -60);
    const oceanBotRight = worldToCanvas(-12, -12);
    ctx.fillStyle = '#0a192f'; // Deep blue ocean
    ctx.fillRect(oceanTopLeft.px, oceanTopLeft.py, oceanBotRight.px - oceanTopLeft.px, oceanBotRight.py - oceanTopLeft.py);
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = '#0284c7';
    ctx.strokeRect(oceanTopLeft.px, oceanTopLeft.py, oceanBotRight.px - oceanTopLeft.px, oceanBotRight.py - oceanTopLeft.py);

    // 2. Draw Mountains (Gray region)
    // Mountains: x > 18, z > 12
    const mTopLeft = worldToCanvas(18, 12);
    const mBotRight = worldToCanvas(60, 60);
    ctx.fillStyle = '#475569'; // slate gray
    ctx.fillRect(mTopLeft.px, mTopLeft.py, mBotRight.px - mTopLeft.px, mBotRight.py - mTopLeft.py);
    ctx.lineWidth = 1;
    ctx.strokeStyle = '#64748b';
    ctx.strokeRect(mTopLeft.px, mTopLeft.py, mBotRight.px - mTopLeft.px, mBotRight.py - mTopLeft.py);

    // 3. Draw Village boundary (dashed box)
    // Village: around x: 5, z: 8, radius = 12
    const village = worldToCanvas(5, 8);
    const villageRad = (12 / 120) * width;
    ctx.beginPath();
    ctx.arc(village.px, village.py, villageRad, 0, Math.PI * 2);
    ctx.strokeStyle = '#f59e0b';
    ctx.setLineDash([4, 4]);
    ctx.lineWidth = 1.2;
    ctx.stroke();
    ctx.setLineDash([]); // Reset line dash

    // 4. Draw Power Landmark (Center-East flat zone)
    // Power Plant: x: 12, z: -10, radius = 10
    const pp = worldToCanvas(12, -10);
    const ppRad = (10 / 120) * width;
    ctx.beginPath();
    ctx.arc(pp.px, pp.py, ppRad, 0, Math.PI * 2);
    ctx.fillStyle = '#334155'; // Dark metallic block
    ctx.fill();
    ctx.lineWidth = 1.2;
    ctx.strokeStyle = '#e2e8f0';
    ctx.stroke();

    // Add labels
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.font = '10px sans-serif';
    ctx.fillText('LAKE AREA', lake.px - 28, lake.py);
    ctx.fillText('MOUNTAINS', mTopLeft.px + 10, mTopLeft.py + 20);
    ctx.fillText('VILLAGE FLAT', village.px - 34, village.py);
    ctx.fillText('POWER PLANT', pp.px - 34, pp.py);
    ctx.fillText('NW OCEAN', oceanTopLeft.px + 10, oceanTopLeft.py + 25);

    // 5. Draw Placed Buildings (Yellow boxes)
    ctx.fillStyle = '#eab308';
    buildings.forEach((b) => {
      const coords = worldToCanvas(b.position[0], b.position[2]);
      ctx.fillRect(coords.px - 2.5, coords.py - 2.5, 5, 5);
    });

    // 6. Draw Friendly NPCs (Green dots)
    npcs.forEach((npc) => {
      const coords = worldToCanvas(npc.position[0], npc.position[2]);
      ctx.beginPath();
      ctx.arc(coords.px, coords.py, 4, 0, Math.PI * 2);
      ctx.fillStyle = '#22c55e'; // neon green NPC
      ctx.fill();
    });

    // 7. Draw Zombies (Red dots)
    zombies.forEach((z) => {
      const coords = worldToCanvas(z.position[0], z.position[2]);
      ctx.beginPath();
      ctx.arc(coords.px, coords.py, 3, 0, Math.PI * 2);
      ctx.fillStyle = '#ef4444'; // Red
      ctx.fill();
    });

    // 8. Draw Player (White ring + arrow)
    const player = worldToCanvas(playerPos[0], playerPos[2]);
    ctx.beginPath();
    ctx.arc(player.px, player.py, 5.5, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff'; // White player beacon
    ctx.fill();
    ctx.strokeStyle = '#020617';
    ctx.lineWidth = 2;
    ctx.stroke();

  }, [activeTab, playerPos, zombies, buildings, npcs]);

  if (activeTab !== 'map') return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-6">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl flex flex-col items-center relative">
        
        {/* Close Button */}
        <button
          onClick={() => setTab('hud')}
          className="absolute top-4 right-4 text-slate-500 hover:text-slate-300 text-xl font-bold bg-slate-800 w-8 h-8 rounded-full flex items-center justify-center transition-all"
        >
          ✕
        </button>

        <h2 className="text-xl font-black text-white uppercase tracking-wider mb-4 flex items-center gap-2">
          <span>🗺️</span> Terrain Topographic Map
        </h2>

        {/* Map Canvas */}
        <div className="bg-slate-950 rounded-2xl border-2 border-slate-800 overflow-hidden shadow-inner p-1">
          <canvas
            ref={canvasRef}
            width={380}
            height={380}
            className="rounded-xl w-[320px] h-[320px] md:w-[380px] md:h-[380px] object-cover"
          />
        </div>

        {/* Legend */}
        <div className="flex gap-4 mt-6 text-xs text-slate-400 font-bold border-t border-slate-800 pt-4 w-full justify-center">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-white border border-slate-900 block" />
            <span>You</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 block" />
            <span>Zombies</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-green-500 block" />
            <span>NPCs</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded bg-yellow-500 block" />
            <span>Buildings</span>
          </div>
        </div>

      </div>
    </div>
  );
}
