export interface Vector3 {
  x: number;
  y: number;
  z: number;
}

export interface BrickData {
  id: string;
  position: Vector3;
  rotation: number; // 0 or 1 (0 = 0deg, 1 = 90deg)
  color: string;
  size: BrickSize;
}

export interface BrickSize {
  width: number; // in "studs"
  depth: number; // in "studs"
  label: string;
}

export type BrickColor = {
  name: string;
  hex: string;
};

export type CameraView = 'iso' | 'top' | 'front' | 'right' | 'back' | 'left';