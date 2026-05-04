export type Suit = "hearts" | "diamonds" | "clubs" | "spades";

export type Rank =
  | "A"
  | "2"
  | "3"
  | "4"
  | "5"
  | "6"
  | "7"
  | "8"
  | "9"
  | "10"
  | "J"
  | "Q"
  | "K";

export type Color = "red" | "black";

export interface Card {
  suit: Suit;
  rank: Rank;
  faceUp: boolean;
}

export interface GameState {
  stock: Card[];
  waste: Card[];
  foundations: Card[][]; // fixed order: hearts, diamonds, clubs, spades
  tableau: Card[][]; // 7 columns
  stockPasses: number;
}

export type SelectableTarget =
  | { type: "stock" }
  | { type: "waste" }
  | { type: "foundation"; index: number }
  | { type: "tableau"; column: number; cardIndex: number }
  | { type: "tableau-empty"; column: number };

export type GamePhase = "browsing" | "holding" | "menu" | "won" | "lost";

export type MenuItem = "resume" | "undo" | "redeal" | "quit";
export type WinMenuItem = "newGame" | "quit";
export type LostMenuItem = "redeal" | "quit";

export type HighlightType = "none" | "orange" | "blue";

export interface Position {
  x: number;
  y: number;
}

export interface SelectionState {
  phase: GamePhase;
  cursorIndex: number;
  targets: SelectableTarget[];
  heldCards: Card[];
  heldFrom: SelectableTarget | null;
}

export const SUITS: Suit[] = ["hearts", "diamonds", "clubs", "spades"];

export const RANKS: Rank[] = [
  "A",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "10",
  "J",
  "Q",
  "K",
];

export const SUIT_SYMBOLS: Record<Suit, string> = {
  hearts: "\u2665",
  diamonds: "\u2666",
  clubs: "\u2663",
  spades: "\u2660",
};

export const FOUNDATION_ORDER: Suit[] = [
  "hearts",
  "diamonds",
  "clubs",
  "spades",
];

export function getColor(suit: Suit): Color {
  return suit === "hearts" || suit === "diamonds" ? "red" : "black";
}

export function getRankValue(rank: Rank): number {
  const index = RANKS.indexOf(rank);
  return index + 1;
}

export function targetsEqual(
  a: SelectableTarget,
  b: SelectableTarget
): boolean {
  if (a.type !== b.type) return false;
  if (a.type === "stock" && b.type === "stock") return true;
  if (a.type === "waste" && b.type === "waste") return true;
  if (a.type === "foundation" && b.type === "foundation")
    return a.index === b.index;
  if (a.type === "tableau" && b.type === "tableau")
    return a.column === b.column && a.cardIndex === b.cardIndex;
  if (a.type === "tableau-empty" && b.type === "tableau-empty")
    return a.column === b.column;
  return false;
}
