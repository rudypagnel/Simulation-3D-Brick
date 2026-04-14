import React, { useState, useRef, useEffect, useImperativeHandle, forwardRef } from 'react';
import { Canvas, ThreeEvent, useThree } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';
import { BrickGeometry } from './BrickGeometry';
import { BrickData, BrickSize, Vector3, CameraView } from '../types';
import { STUD_SIZE, BRICK_HEIGHT } from '../constants';

interface SceneProps {
  bricks: BrickData[];
  currentBrickSize: BrickSize;
  currentBrickColor: string;
  currentRotation: number; // 0 or 1
  isDarkMode: boolean;
  showGrid: boolean;
  onAddBrick: (brick: BrickData) => void;
  onRemoveBrick: (id: string) => void;
}

export interface SceneRef {
  takeScreenshot: () => void;
  setCameraView: (view: CameraView) => void;
}

// Helper to snap position to grid
const snapToGrid = (val: number) => {
  return Math.round(val / STUD_SIZE) * STUD_SIZE;
};

// Internal component to handle imperative scene actions (screenshot, camera move)
const SceneManager = forwardRef<SceneRef, {}>((_, ref) => {
  const { gl, scene, camera, controls } = useThree();

  useImperativeHandle(ref, () => ({
    takeScreenshot: () => {
      // Render scene explicitly to ensure buffer is populated
      gl.render(scene, camera);
      const dataUrl = gl.domElement.toDataURL('image/png');
      
      // Create download link
      const link = document.createElement('a');
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
      link.setAttribute('download', `brick-master-${timestamp}.png`);
      link.setAttribute('href', dataUrl);
      link.click();
    },
    setCameraView: (view: CameraView) => {
      const offset = 30;
      const height = 15;
      const topHeight = 40;
      let pos = new THREE.Vector3();
      
      switch(view) {
        case 'iso': 
          pos.set(20, 20, 20); 
          break;
        case 'top': 
          pos.set(0, topHeight, 0.1); // Slight Z offset to avoid gimbal lock with OrbitControls
          break;
        case 'front': 
          pos.set(0, height, offset); 
          break;
        case 'back': 
          pos.set(0, height, -offset); 
          break;
        case 'right': 
          pos.set(offset, height, 0); 
          break;
        case 'left': 
          pos.set(-offset, height, 0); 
          break;
        default:
          pos.set(20, 20, 20);
      }

      camera.position.copy(pos);
      camera.lookAt(0, 0, 0);
      
      // Update OrbitControls to match new camera position and reset target
      if (controls) {
        const orbit = controls as any;
        orbit.target.set(0, 0, 0);
        orbit.update();
      }
    }
  }));

  return null;
});

const SceneContent: React.FC<SceneProps> = ({
  bricks,
  currentBrickSize,
  currentBrickColor,
  currentRotation,
  isDarkMode,
  showGrid,
  onAddBrick,
  onRemoveBrick
}) => {
  const [hoverPos, setHoverPos] = useState<Vector3 | null>(null);
  const { camera, raycaster, pointer, scene } = useThree();

  // Effective size based on rotation
  const effWidth = currentRotation === 0 ? currentBrickSize.width : currentBrickSize.depth;
  const effDepth = currentRotation === 0 ? currentBrickSize.depth : currentBrickSize.width;

  const handlePointerMove = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();

    if (e.object.name === 'ghost') return;

    const intersectPoint = e.point;
    const normal = e.face?.normal;

    if (!intersectPoint || !normal) return;

    const targetPoint = intersectPoint.clone().add(normal.clone().multiplyScalar(0.01));

    const snappedX = snapToGrid(targetPoint.x);
    const snappedZ = snapToGrid(targetPoint.z);
    
    let snappedY = 0;
    
    if (Math.abs(normal.y) > 0.5) {
       snappedY = Math.floor(targetPoint.y / BRICK_HEIGHT) * BRICK_HEIGHT;
    } else {
       snappedY = Math.floor(targetPoint.y / BRICK_HEIGHT) * BRICK_HEIGHT;
    }
    
    let finalX = snappedX;
    let finalZ = snappedZ;

    // Center offset for even-width bricks
    if (effWidth % 2 === 0) {
      const offsetX = ((effWidth - 1) / 2) * STUD_SIZE;
      const anchorX = Math.round(targetPoint.x - offsetX);
      finalX = anchorX + offsetX;
    } else {
      finalX = Math.round(targetPoint.x);
    }
    
    if (effDepth % 2 === 0) {
        const offsetZ = ((effDepth - 1) / 2) * STUD_SIZE;
        const anchorZ = Math.round(targetPoint.z - offsetZ);
        finalZ = anchorZ + offsetZ;
    } else {
        finalZ = Math.round(targetPoint.z);
    }

    
    if (targetPoint.y < 0.1) {
        snappedY = 0;
    } else {
         snappedY = Math.round(targetPoint.y / BRICK_HEIGHT) * BRICK_HEIGHT;
         if (snappedY < 0) snappedY = 0;
    }

    setHoverPos({ x: finalX, y: snappedY, z: finalZ });
  };

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    if (e.delta > 10) return;
    e.stopPropagation();
    
    if (e.altKey && e.object.userData.id) {
      onRemoveBrick(e.object.userData.id);
      return;
    }

    if (hoverPos) {
      const newBrick: BrickData = {
        id: crypto.randomUUID(),
        position: hoverPos,
        color: currentBrickColor,
        size: currentBrickSize,
        rotation: currentRotation,
      };
      onAddBrick(newBrick);
    }
  };

  // Dynamic Colors
  // Darker floor in light mode helps contrast with white/bright bricks
  const gridColor1 = isDarkMode ? 0x374151 : 0x9ca3af;
  const gridColor2 = isDarkMode ? 0x1f2937 : 0xd1d5db; 
  const floorColor = isDarkMode ? '#111827' : '#e5e7eb'; 
  
  return (
    <>
      {/* Lighting - Tuned to prevent washout in light mode */}
      <ambientLight intensity={isDarkMode ? 0.4 : 0.5} />
      <directionalLight 
        position={[10, 20, 10]} 
        intensity={isDarkMode ? 0.8 : 0.8} 
        castShadow 
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0001} 
      >
        <orthographicCamera attach="shadow-camera" args={[-30, 30, 30, -30]} />
      </directionalLight>

      {/* Fill light for soft shadows in light mode */}
      {!isDarkMode && <hemisphereLight intensity={0.3} groundColor="#e5e7eb" color="#ffffff" />}
      
      {/* Controls - makeDefault allows usage via useThree().controls */}
      <OrbitControls makeDefault maxPolarAngle={Math.PI / 2 - 0.1} minDistance={5} maxDistance={100} />

      {/* Render Placed Bricks */}
      {bricks.map((b) => {
         const w = b.rotation === 0 ? b.size.width : b.size.depth;
         const d = b.rotation === 0 ? b.size.depth : b.size.width;
         
         return (
          <group key={b.id} position={[b.position.x, b.position.y, b.position.z]}>
            <mesh 
                userData={{ id: b.id }} 
                onClick={handleClick} 
                onPointerMove={handlePointerMove}
                position={[0, BRICK_HEIGHT/2, 0]}
            >
                {/* Full Size Hitbox - Ensure no gaps between bricks */}
                <boxGeometry args={[w * STUD_SIZE, BRICK_HEIGHT, d * STUD_SIZE]} />
                {/* Transparent material ensures it catches rays but is invisible */}
                <meshBasicMaterial transparent opacity={0} />
            </mesh>
            <BrickGeometry width={w} depth={d} color={b.color} />
          </group>
        );
      })}

      {/* Ghost Brick */}
      {hoverPos && (
        <group position={[hoverPos.x, hoverPos.y, hoverPos.z]}>
          <BrickGeometry 
            width={effWidth} 
            depth={effDepth} 
            color={currentBrickColor} 
            opacity={0.6} 
            isGhost 
          />
        </group>
      )}

      {/* Environment Floor */}
      <group>
          {/* Grid Line Helper */}
          {showGrid && <gridHelper args={[60, 60, gridColor1, gridColor2]} position={[0, 0.005, 0]} />}
          
          {/* Solid Visual Floor */}
          <mesh 
            rotation={[-Math.PI / 2, 0, 0]} 
            position={[0, -0.02, 0]} 
            receiveShadow
          >
            <circleGeometry args={[100, 64]} />
            <meshStandardMaterial color={floorColor} roughness={1} />
          </mesh>

          {/* Invisible Raycast Plane */}
          <mesh 
            rotation={[-Math.PI / 2, 0, 0]} 
            position={[0, 0, 0]} 
            onPointerMove={handlePointerMove}
            onClick={handleClick}
          >
             <planeGeometry args={[100, 100]} />
             <meshBasicMaterial transparent opacity={0} />
          </mesh>
      </group>
      
      {/* Soft Contact Shadows for Grounding */}
      <ContactShadows 
        opacity={isDarkMode ? 0.5 : 0.55} 
        scale={60} 
        blur={2.5} 
        far={4} 
        resolution={512} 
        color="#000000" 
        position={[0, 0.01, 0]}
      />
      
      {/* Environment Reflection - Lower intensity in light mode to reduce glare */}
      <Environment 
        preset={isDarkMode ? "city" : "lobby"} 
        blur={0.5} 
        environmentIntensity={isDarkMode ? 1 : 0.5} 
      />
    </>
  );
};

export const Scene = forwardRef<SceneRef, SceneProps>((props, ref) => {
  return (
    <Canvas 
      shadows 
      camera={{ position: [20, 20, 20], fov: 45 }} 
      dpr={[1, 2]}
      gl={{ preserveDrawingBuffer: true }} // Important for taking screenshots
    >
      <color attach="background" args={[props.isDarkMode ? '#111827' : '#f3f4f6']} />
      <SceneManager ref={ref} />
      <SceneContent {...props} />
    </Canvas>
  );
});