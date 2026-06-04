import React, { useMemo, useRef, useEffect } from 'react';
import * as THREE from 'three';
import { useGameStore } from '../../store/useGameStore';
import { useFrame } from '@react-three/fiber';
import { getTerrainHeight } from './WorldTerrain';

export default function Foliage() {
  const foliage = useGameStore((state) => state.foliage);

  // Instanced refs
  const treeTrunkRef = useRef<THREE.InstancedMesh>(null);
  const treeLeaves1Ref = useRef<THREE.InstancedMesh>(null);
  const treeLeaves2Ref = useRef<THREE.InstancedMesh>(null);
  const treeLeaves3Ref = useRef<THREE.InstancedMesh>(null);
  
  const rockRef = useRef<THREE.InstancedMesh>(null);
  const rockMossRef = useRef<THREE.InstancedMesh>(null); // moss caps
  
  const bushRef = useRef<THREE.InstancedMesh>(null);
  const mushroomRef = useRef<THREE.InstancedMesh>(null);
  const flowerRef = useRef<THREE.InstancedMesh>(null);
  const grassRef = useRef<THREE.InstancedMesh>(null);
  
  const sakuraTrunkRef = useRef<THREE.InstancedMesh>(null);
  const sakuraLeavesRef = useRef<THREE.InstancedMesh>(null);
  const dummyRef = useRef(new THREE.Object3D());
  const grassShaderRef = useRef<any>(null);

  // 1. Separate foliage nodes from global store
  const { trees, rocks, bushes, mushrooms, flowers, sakuraTrees } = useMemo(() => {
    return {
      trees: foliage.filter((f) => f.type === 'tree'),
      rocks: foliage.filter((f) => f.type === 'rock'),
      bushes: foliage.filter((f) => f.type === 'bush'),
      mushrooms: foliage.filter((f) => f.type === 'mushroom'),
      flowers: foliage.filter((f) => f.type === 'flower'),
      sakuraTrees: foliage.filter((f) => f.type === 'sakura_tree'),
    };
  }, [foliage]);

  // 2. Generate local cosmetic grass clumps
  const grassClumps = useMemo(() => {
    const temp = [];
    let seed = 999;
    const random = () => {
      const x = Math.sin(seed++) * 10000;
      return x - Math.floor(x);
    };

    for (let i = 0; i < 220; i++) {
      const rx = -50 + random() * 100;
      const rz = -50 + random() * 100;

      // Skip deep water
      const lakeDist = Math.hypot(rx - (-18), rz - 8);
      if (lakeDist < 16.2) continue;

      const ry = getTerrainHeight(rx, rz);
      if (ry > -0.8 && ry < 4.0) {
        temp.push({
          x: rx,
          y: ry,
          z: rz,
          scale: 0.35 + random() * 0.4,
          rotation: random() * Math.PI,
        });
      }
    }
    return temp;
  }, []);

  // 3. Falling leaves particles (cosmetic)
  const leafCount = 90;
  const leavesData = useMemo(() => {
    const positions = new Float32Array(leafCount * 3);
    const speeds = new Float32Array(leafCount);
    const sways = new Float32Array(leafCount);
    for (let i = 0; i < leafCount; i++) {
      positions[i * 3] = -40 + Math.random() * 55;
      positions[i * 3 + 1] = 4 + Math.random() * 7; // height
      positions[i * 3 + 2] = -40 + Math.random() * 55;
      speeds[i] = 0.8 + Math.random() * 1.2;
      sways[i] = Math.random() * Math.PI * 2;
    }
    return { positions, speeds, sways };
  }, []);

  const leavesRef = useRef<THREE.Points>(null);

  // Update instanced static meshes on coordinate updates
  useEffect(() => {
    const dummy = new THREE.Object3D();

    // A. 3-Tier Trees
    if (
      treeTrunkRef.current &&
      treeLeaves1Ref.current &&
      treeLeaves2Ref.current &&
      treeLeaves3Ref.current
    ) {
      trees.forEach((tree, idx) => {
        const tx = tree.position[0];
        const ty = tree.position[1];
        const tz = tree.position[2];

        dummy.position.set(tx, ty + tree.scale * 0.6, tz);
        dummy.rotation.y = tree.rotation;
        dummy.scale.set(tree.scale * 0.22, tree.scale * 1.2, tree.scale * 0.22);
        dummy.updateMatrix();
        treeTrunkRef.current!.setMatrixAt(idx, dummy.matrix);

        dummy.position.set(tx, ty + tree.scale * 1.1, tz);
        dummy.rotation.y = tree.rotation;
        dummy.scale.set(tree.scale * 0.98, tree.scale * 0.9, tree.scale * 0.98);
        dummy.updateMatrix();
        treeLeaves1Ref.current!.setMatrixAt(idx, dummy.matrix);

        dummy.position.set(tx, ty + tree.scale * 1.7, tz);
        dummy.rotation.y = tree.rotation + 0.5;
        dummy.scale.set(tree.scale * 0.74, tree.scale * 0.8, tree.scale * 0.74);
        dummy.updateMatrix();
        treeLeaves2Ref.current!.setMatrixAt(idx, dummy.matrix);

        dummy.position.set(tx, ty + tree.scale * 2.2, tz);
        dummy.rotation.y = tree.rotation + 1.0;
        dummy.scale.set(tree.scale * 0.5, tree.scale * 0.7, tree.scale * 0.5);
        dummy.updateMatrix();
        treeLeaves3Ref.current!.setMatrixAt(idx, dummy.matrix);
      });
      treeTrunkRef.current.instanceMatrix.needsUpdate = true;
      treeLeaves1Ref.current.instanceMatrix.needsUpdate = true;
      treeLeaves2Ref.current.instanceMatrix.needsUpdate = true;
      treeLeaves3Ref.current.instanceMatrix.needsUpdate = true;
    }

    // B. Rocks & Moss caps
    if (rockRef.current && rockMossRef.current) {
      rocks.forEach((rock, idx) => {
        const rx = rock.position[0];
        const ry = rock.position[1];
        const rz = rock.position[2];

        // Base stone
        dummy.position.set(rx, ry + rock.scale * 0.2, rz);
        dummy.rotation.set(rock.rotation * 0.2, rock.rotation, rock.rotation * 0.3);
        dummy.scale.set(rock.scale * 1.15, rock.scale * 0.75, rock.scale * 1.15);
        dummy.updateMatrix();
        rockRef.current!.setMatrixAt(idx, dummy.matrix);

        // Moss Cap on top
        dummy.position.set(rx, ry + rock.scale * 0.65, rz);
        dummy.rotation.set(0, rock.rotation, 0);
        dummy.scale.set(rock.scale * 0.65, rock.scale * 0.18, rock.scale * 0.65);
        dummy.updateMatrix();
        rockMossRef.current!.setMatrixAt(idx, dummy.matrix);
      });
      rockRef.current.instanceMatrix.needsUpdate = true;
      rockMossRef.current.instanceMatrix.needsUpdate = true;
    }

    // C. Berry Bushes
    if (bushRef.current) {
      bushes.forEach((bush, idx) => {
        dummy.position.set(bush.position[0], bush.position[1] + bush.scale * 0.3, bush.position[2]);
        dummy.rotation.y = bush.rotation;
        dummy.scale.set(bush.scale * 0.85, bush.scale * 0.65, bush.scale * 0.85);
        dummy.updateMatrix();
        bushRef.current!.setMatrixAt(idx, dummy.matrix);
      });
      bushRef.current.instanceMatrix.needsUpdate = true;
    }

    // D. Mushrooms
    if (mushroomRef.current) {
      mushrooms.forEach((m, idx) => {
        dummy.position.set(m.position[0], m.position[1] + 0.12, m.position[2]);
        dummy.rotation.set(0.1, m.rotation, 0);
        dummy.scale.set(m.scale * 0.8, m.scale * 0.8, m.scale * 0.8);
        dummy.updateMatrix();
        mushroomRef.current!.setMatrixAt(idx, dummy.matrix);
      });
      mushroomRef.current.instanceMatrix.needsUpdate = true;
    }

    // E. Flowers
    if (flowerRef.current) {
      flowers.forEach((f, idx) => {
        dummy.position.set(f.position[0], f.position[1] + 0.15, f.position[2]);
        dummy.rotation.set(0, f.rotation, 0);
        dummy.scale.set(f.scale * 0.9, f.scale * 0.9, f.scale * 0.9);
        dummy.updateMatrix();
        flowerRef.current!.setMatrixAt(idx, dummy.matrix);
      });
      flowerRef.current.instanceMatrix.needsUpdate = true;
    }

    // F. Sakura Trees (Low-Poly style, fluffy pink crown)
    if (sakuraTrunkRef.current && sakuraLeavesRef.current) {
      sakuraTrees.forEach((tree, idx) => {
        const tx = tree.position[0];
        const ty = tree.position[1];
        const tz = tree.position[2];

        dummy.position.set(tx, ty + tree.scale * 0.5, tz);
        dummy.rotation.y = tree.rotation;
        dummy.scale.set(tree.scale * 0.2, tree.scale * 1.0, tree.scale * 0.2);
        dummy.updateMatrix();
        sakuraTrunkRef.current!.setMatrixAt(idx, dummy.matrix);

        dummy.position.set(tx, ty + tree.scale * 1.15, tz);
        dummy.rotation.y = tree.rotation;
        dummy.scale.set(tree.scale * 0.95, tree.scale * 0.85, tree.scale * 0.95);
        dummy.updateMatrix();
        sakuraLeavesRef.current!.setMatrixAt(idx, dummy.matrix);
      });
      sakuraTrunkRef.current.instanceMatrix.needsUpdate = true;
      sakuraLeavesRef.current.instanceMatrix.needsUpdate = true;
    }

    // G. Grass Clumps
    if (grassRef.current) {
      grassClumps.forEach((g, idx) => {
        dummy.position.set(g.x, g.y + 0.1, g.z);
        dummy.rotation.set(0, g.rotation, 0);
        dummy.scale.set(g.scale * 0.55, g.scale * 1.35, g.scale * 0.55);
        dummy.updateMatrix();
        grassRef.current!.setMatrixAt(idx, dummy.matrix);
      });
      grassRef.current.instanceMatrix.needsUpdate = true;
    }
  }, [trees, rocks, bushes, mushrooms, flowers, sakuraTrees, grassClumps]);

  // Frame animations: Waving grass tufts & Falling leaves
  useFrame((state, delta) => {
    const time = state.clock.getElapsedTime();

    // 1. Update GPU grass shader uniform
    if (grassShaderRef.current) {
      grassShaderRef.current.uniforms.uTime.value = time;
    }

    // 2. Falling leaves drift
    if (leavesRef.current) {
      const posAttr = leavesRef.current.geometry.attributes.position;
      const positions = posAttr.array as Float32Array;

      for (let i = 0; i < leafCount; i++) {
        const idx = i * 3;
        // Fall down
        positions[idx + 1] -= leavesData.speeds[i] * delta;
        // Sway drift
        positions[idx] += Math.sin(time * 1.5 + leavesData.sways[i]) * 0.012;

        // Reset to top if hitting ground
        if (positions[idx + 1] < 0) {
          positions[idx] = -40 + Math.random() * 55;
          positions[idx + 1] = 6 + Math.random() * 6;
          positions[idx + 2] = -40 + Math.random() * 55;
        }
      }
      posAttr.needsUpdate = true;
    }
  });

  return (
    <group>
      {/* Pine Tree Trunks */}
      <instancedMesh
        ref={treeTrunkRef}
        args={[undefined, undefined, trees.length]}
        castShadow
        receiveShadow
      >
        <cylinderGeometry args={[0.3, 0.45, 1.4, 5]} />
        <meshStandardMaterial color="#5c3f15" flatShading roughness={0.92} />
      </instancedMesh>

      {/* Pine Tree Cones - Layer 1 (Bottom) */}
      <instancedMesh
        ref={treeLeaves1Ref}
        args={[undefined, undefined, trees.length]}
        castShadow
        receiveShadow
      >
        <coneGeometry args={[1.15, 1.2, 5]} />
        <meshStandardMaterial color="#0f4c28" flatShading roughness={0.8} />
      </instancedMesh>

      {/* Pine Tree Cones - Layer 2 (Middle) */}
      <instancedMesh
        ref={treeLeaves2Ref}
        args={[undefined, undefined, trees.length]}
        castShadow
        receiveShadow
      >
        <coneGeometry args={[0.88, 1.0, 5]} />
        <meshStandardMaterial color="#14532d" flatShading roughness={0.78} />
      </instancedMesh>

      {/* Pine Tree Cones - Layer 3 (Top) */}
      <instancedMesh
        ref={treeLeaves3Ref}
        args={[undefined, undefined, trees.length]}
        castShadow
        receiveShadow
      >
        <coneGeometry args={[0.6, 0.8, 5]} />
        <meshStandardMaterial color="#166534" flatShading roughness={0.75} />
      </instancedMesh>

      {/* Sakura Tree Trunks */}
      <instancedMesh
        ref={sakuraTrunkRef}
        args={[undefined, undefined, sakuraTrees.length]}
        castShadow
        receiveShadow
      >
        <cylinderGeometry args={[0.25, 0.38, 1.2, 5]} />
        <meshStandardMaterial color="#4a2c11" flatShading roughness={0.92} />
      </instancedMesh>

      {/* Sakura Tree Leaves (Cherry Blossoms) */}
      <instancedMesh
        ref={sakuraLeavesRef}
        args={[undefined, undefined, sakuraTrees.length]}
        castShadow
        receiveShadow
      >
        <sphereGeometry args={[0.9, 6, 5]} />
        <meshStandardMaterial color="#f472b6" flatShading roughness={0.7} />
      </instancedMesh>

      {/* Base Mining Rocks */}
      <instancedMesh
        ref={rockRef}
        args={[undefined, undefined, rocks.length]}
        castShadow
        receiveShadow
      >
        <dodecahedronGeometry args={[1.0, 1]} />
        <meshStandardMaterial color="#57534e" flatShading roughness={0.8} />
      </instancedMesh>

      {/* Mossy Caps on Rocks */}
      <instancedMesh
        ref={rockMossRef}
        args={[undefined, undefined, rocks.length]}
        receiveShadow
      >
        <sphereGeometry args={[0.9, 4, 3]} />
        <meshStandardMaterial color="#4d7c0f" flatShading roughness={0.95} /> {/* Mossy green */}
      </instancedMesh>

      {/* Berry Bushes */}
      <instancedMesh
        ref={bushRef}
        args={[undefined, undefined, bushes.length]}
        castShadow
        receiveShadow
      >
        <sphereGeometry args={[0.8, 5, 5]} />
        <meshStandardMaterial color="#14532d" flatShading roughness={0.85} />
      </instancedMesh>

      {/* Colorful Mushrooms */}
      <instancedMesh
        ref={mushroomRef}
        args={[undefined, undefined, mushrooms.length]}
        castShadow
      >
        <coneGeometry args={[0.18, 0.28, 5]} />
        <meshStandardMaterial color="#e11d48" flatShading roughness={0.6} />
      </instancedMesh>

      {/* Wild Flowers */}
      <instancedMesh
        ref={flowerRef}
        args={[undefined, undefined, flowers.length]}
      >
        <sphereGeometry args={[0.12, 4, 4]} />
        <meshStandardMaterial color="#fb7185" flatShading roughness={0.8} />
      </instancedMesh>

      {/* Wind Waving Grass Tufts */}
      <instancedMesh
        ref={grassRef}
        args={[undefined, undefined, grassClumps.length]}
      >
        <coneGeometry args={[0.06, 0.35, 3]} />
        <meshStandardMaterial
          color="#22c55e"
          flatShading
          roughness={0.92}
          onBeforeCompile={(shader) => {
            shader.uniforms.uTime = { value: 0 };
            shader.vertexShader = `
              uniform float uTime;
            ` + shader.vertexShader;
            shader.vertexShader = shader.vertexShader.replace(
              '#include <begin_vertex>',
              `
                #include <begin_vertex>
                #ifdef USE_INSTANCING
                  float sway = sin(uTime * 2.5 + instanceMatrix[3][0] * 0.4 + instanceMatrix[3][2] * 0.4) * 0.09;
                  transformed.x += sway * (position.y + 0.175);
                  transformed.z += sway * 0.5 * (position.y + 0.175);
                #endif
              `
            );
            grassShaderRef.current = shader;
          }}
        />
      </instancedMesh>

      {/* Atmospheric Leaves falling down */}
      <points ref={leavesRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[leavesData.positions, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          color="#34d399" // green leaves
          size={0.16}
          transparent
          opacity={0.65}
          sizeAttenuation
        />
      </points>
    </group>
  );
}
