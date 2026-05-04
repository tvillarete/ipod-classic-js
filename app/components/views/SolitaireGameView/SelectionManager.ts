import {
  Card,
  GamePhase,
  GameState,
  SelectableTarget,
  SelectionState,
  getColor,
  getRankValue,
} from "./types";

export class SelectionManager {
  private state: SelectionState;
  private previousBrowseIndex: number = 0;

  constructor() {
    this.state = {
      phase: "browsing",
      cursorIndex: 0,
      targets: [],
      heldCards: [],
      heldFrom: null,
    };
  }

  getState(): SelectionState {
    return this.state;
  }

  getPhase(): GamePhase {
    return this.state.phase;
  }

  setPhase(phase: GamePhase): void {
    this.state = { ...this.state, phase };
  }

  getCurrentTarget(): SelectableTarget | null {
    if (this.state.targets.length === 0) return null;
    return this.state.targets[this.state.cursorIndex] ?? null;
  }

  scrollForward(): void {
    if (this.state.targets.length === 0) return;
    this.state = {
      ...this.state,
      cursorIndex: (this.state.cursorIndex + 1) % this.state.targets.length,
    };
  }

  scrollBackward(): void {
    if (this.state.targets.length === 0) return;
    this.state = {
      ...this.state,
      cursorIndex:
        (this.state.cursorIndex - 1 + this.state.targets.length) %
        this.state.targets.length,
    };
  }

  buildSelectableTargets(gameState: GameState): void {
    const targets: SelectableTarget[] = [];

    // Stock is always a target
    targets.push({ type: "stock" });

    // Waste top card
    if (gameState.waste.length > 0) {
      targets.push({ type: "waste" });
    }

    // Foundations (always present for pickup)
    for (let i = 0; i < 4; i++) {
      if (gameState.foundations[i].length > 0) {
        targets.push({ type: "foundation", index: i });
      }
    }

    // Tableau columns
    for (let col = 0; col < 7; col++) {
      const column = gameState.tableau[col];

      if (column.length === 0) {
        targets.push({ type: "tableau-empty", column: col });
        continue;
      }

      // Find the first face-up card (start of potential runs)
      let firstFaceUp = -1;
      for (let i = 0; i < column.length; i++) {
        if (column[i].faceUp) {
          firstFaceUp = i;
          break;
        }
      }

      if (firstFaceUp === -1) {
        // All face down — shouldn't happen in a valid game, but treat as empty-like
        continue;
      }

      // Add each face-up card as a selectable target, deepest first.
      // Deepest = picks up the whole run, shallowest = just the bottom card.
      for (let i = firstFaceUp; i < column.length; i++) {
        // Only include if the cards from i to end form a valid descending run
        if (isValidRun(column, i)) {
          targets.push({ type: "tableau", column: col, cardIndex: i });
        }
      }
    }

    this.state = {
      ...this.state,
      targets,
      cursorIndex: Math.min(this.state.cursorIndex, Math.max(0, targets.length - 1)),
    };
  }

  enterHoldingMode(
    heldCards: Card[],
    heldFrom: SelectableTarget,
    validTargets: SelectableTarget[]
  ): boolean {
    if (validTargets.length === 0) return false;

    this.previousBrowseIndex = this.state.cursorIndex;

    this.state = {
      ...this.state,
      phase: "holding",
      cursorIndex: 0,
      targets: validTargets,
      heldCards,
      heldFrom,
    };
    return true;
  }

  exitHoldingMode(gameState: GameState): void {
    this.state = {
      ...this.state,
      phase: "browsing",
      heldCards: [],
      heldFrom: null,
    };

    this.buildSelectableTargets(gameState);

    // Try to restore cursor near previous position
    this.state = {
      ...this.state,
      cursorIndex: Math.min(
        this.previousBrowseIndex,
        Math.max(0, this.state.targets.length - 1)
      ),
    };
  }

  resetToStock(gameState: GameState): void {
    this.state = {
      ...this.state,
      phase: "browsing",
      cursorIndex: 0,
      heldCards: [],
      heldFrom: null,
    };
    this.buildSelectableTargets(gameState);
  }

  rebuildAndClamp(gameState: GameState): void {
    const prevIndex = this.state.cursorIndex;
    this.buildSelectableTargets(gameState);
    this.state = {
      ...this.state,
      cursorIndex: Math.min(prevIndex, Math.max(0, this.state.targets.length - 1)),
    };
  }

  cancelHolding(gameState: GameState): void {
    this.exitHoldingMode(gameState);
  }
}

function isValidRun(column: Card[], fromIndex: number): boolean {
  for (let i = fromIndex; i < column.length; i++) {
    if (!column[i].faceUp) return false;
    if (i > fromIndex) {
      const prev = column[i - 1];
      const curr = column[i];
      if (
        getColor(curr.suit) === getColor(prev.suit) ||
        getRankValue(curr.rank) !== getRankValue(prev.rank) - 1
      ) {
        return false;
      }
    }
  }
  return true;
}
