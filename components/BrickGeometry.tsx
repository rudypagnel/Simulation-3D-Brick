import React, { useMemo } from 'react';
import * as THREE from 'three';
import { STUD_SIZE, BRICK_HEIGHT, STUD_HEIGHT, STUD_RADIUS } from '../constants';

interface BrickGeometryProps {
  width: number; // in studs
  depth: number; // in studs
  color: string;
  opacity?: number;
  transparent?: boolean;
  isGhost?: boolean;
}

export const BrickGeometry: React.FC<BrickGeometryProps> = ({
  width,
  depth,
  color,
  opacity = 1,
  transparent = false,
  isGhost = false
}) => {
  
  // Memoize geometry to avoid recreating it on every render if props don't change
  const studs = useMemo(() => {
    const studArray = [];
    for (let i = 0; i < width; i++) {
      for (let j = 0; j < depth; j++) {
        studArray.push({
          x: (i - (width - 1) / 2) * STUD_SIZE,
          z: (j - (depth - 1) / 2) * STUD_SIZE,
        });
      }
    }
    return studArray;
  }, [width, depth]);

  const materialProps = {
    color: color,
    opacity: opacity,
    transparent: transparent || opacity < 1,
    roughness: 0.6, // Matte plastic finish
    metalness: 0.0, // Not metallic
  };

  // Explicitly disable raycast for ghost bricks so they don't block the cursor
  const meshProps = isGhost ? { raycast: () => null } : {};

  return (
    <group>
      {/* Main Brick Body */}
      <mesh position={[0, BRICK_HEIGHT / 2, 0]} castShadow receiveShadow={!isGhost} {...meshProps}>
        <boxGeometry args={[width * STUD_SIZE - 0.05, BRICK_HEIGHT, depth * STUD_SIZE - 0.05]} />
        <meshStandardMaterial {...materialProps} />
      </mesh>

      {/* Studs */}
      {studs.map((pos, idx) => (
        <mesh
          key={idx}
          position={[pos.x, BRICK_HEIGHT + STUD_HEIGHT / 2, pos.z]}
          castShadow
          receiveShadow={!isGhost}
          {...meshProps}
        >
          <cylinderGeometry args={[STUD_RADIUS, STUD_RADIUS, STUD_HEIGHT, 16]} />
          <meshStandardMaterial {...materialProps} />
        </mesh>
      ))}
    </group>
  );
};