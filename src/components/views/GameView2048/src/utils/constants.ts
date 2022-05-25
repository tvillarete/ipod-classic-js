import { ArrowKeyType, DirectionType, Vector } from './types';

export const DIRECTION_MAP: Record<ArrowKeyType | DirectionType, Vector> = {
  ArrowLeft: { r: 0, c: -1 },
  ArrowRight: { r: 0, c: 1 },
  ArrowUp: { r: -1, c: 0 },
  ArrowDown: { r: 1, c: 0 },
  Left: { r: 0, c: -1 },
  Right: { r: 0, c: 1 },
  Up: { r: -1, c: 0 },
  Down: { r: 1, c: 0 },
};

export const GRID_SIZE = 200;
export const MIN_SCALE = 1;
export const MAX_SCALE = 8;
export const SPACING = 8;
