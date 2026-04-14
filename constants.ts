import { BrickColor, BrickSize } from './types';

// Visual Dimensions
export const STUD_SIZE = 1; // Base unit for X/Z
export const BRICK_HEIGHT = 1.2; // Standard aspect ratio roughly
export const STUD_HEIGHT = 0.2;
export const STUD_RADIUS = 0.3;

export const BRICK_COLORS: BrickColor[] = [
  { name: 'Red', hex: '#ef4444' },
  { name: 'Blue', hex: '#3b82f6' },
  { name: 'Yellow', hex: '#eab308' },
  { name: 'Green', hex: '#22c55e' },
  { name: 'White', hex: '#f3f4f6' },
  { name: 'Black', hex: '#171717' },
  { name: 'Orange', hex: '#f97316' },
  { name: 'Purple', hex: '#a855f7' },
  { name: 'Gray', hex: '#9ca3af' },
  { name: 'Brown', hex: '#78350f' },
  { name: 'Pink', hex: '#ec4899' },
  { name: 'Cyan', hex: '#06b6d4' },
  { name: 'Lime', hex: '#84cc16' },
  { name: 'Indigo', hex: '#4338ca' },
  { name: 'Teal', hex: '#14b8a6' },
  { name: 'Cream', hex: '#fef3c7' },
  { name: 'Maroon', hex: '#9f1239' },
  { name: 'Forest', hex: '#166534' },
];

export const BRICK_SIZES: BrickSize[] = [
  { width: 1, depth: 1, label: '1x1' },
  { width: 2, depth: 1, label: '1x2' },
  { width: 3, depth: 1, label: '1x3' },
  { width: 4, depth: 1, label: '1x4' },
  { width: 6, depth: 1, label: '1x6' },
  { width: 8, depth: 1, label: '1x8' },
  { width: 2, depth: 2, label: '2x2' },
  { width: 3, depth: 2, label: '2x3' },
  { width: 4, depth: 2, label: '2x4' },
  { width: 6, depth: 2, label: '2x6' },
  { width: 8, depth: 2, label: '2x8' },
];

export const INITIAL_CAMERA_POSITION = [10, 10, 10] as const;