import React from 'react';
import { useGameStore } from '../../store/useGameStore';
import ZombieMesh from './ZombieMesh';

export default function ZombieAI() {
  const zombies = useGameStore((state) => state.zombies);
  const playerPos = useGameStore((state) => state.playerPos);

  return (
    <group>
      {zombies.map((zombie) => {
        // Calculate aiming angle to face the player
        const dx = playerPos[0] - zombie.position[0];
        const dz = playerPos[2] - zombie.position[2];
        const angle = Math.atan2(dx, dz);

        const showHealthBar = zombie.health < zombie.maxHealth;
        const hpPercent = zombie.health / zombie.maxHealth;
        
        // Scale adjustments based on zombie type
        let heightOffset = 1.3;
        let barWidth = 0.8;
        if (zombie.type === 'tank') {
          heightOffset = 2.1;
          barWidth = 1.4;
        } else if (zombie.type === 'boss') {
          heightOffset = 3.2;
          barWidth = 2.2;
        }

        return (
          <group key={zombie.id} position={zombie.position} rotation={[0, angle, 0]}>
            {/* Zombie Mesh Model */}
            <ZombieMesh type={zombie.type} state={zombie.state} isHit={zombie.isHit} />

            {/* Hovering Health Bar */}
            {showHealthBar && (
              <group position={[0, heightOffset, 0]}>
                {/* Red Background */}
                <mesh>
                  <planeGeometry args={[barWidth, 0.08]} />
                  <meshBasicMaterial color="#ef4444" depthTest={false} />
                </mesh>
                {/* Green Current HP */}
                <mesh position={[-(barWidth * (1 - hpPercent)) / 2, 0, 0.005]}>
                  <planeGeometry args={[barWidth * hpPercent, 0.08]} />
                  <meshBasicMaterial color="#22c55e" depthTest={false} />
                </mesh>
              </group>
            )}
          </group>
        );
      })}
    </group>
  );
}
