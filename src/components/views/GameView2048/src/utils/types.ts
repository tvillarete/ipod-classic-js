export type Vector = {
  r: 0 | 1 | -1;
  c: 0 | 1 | -1;
};

export enum ArrowKey {
  ArrowLeft,
  ArrowUp,
  ArrowRight,
  ArrowDown,
}

export enum Direction {
  Left,
  Right,
  Up,
  Down,
}

export type ArrowKeyType = keyof typeof ArrowKey;
export type DirectionType = keyof typeof Direction;
