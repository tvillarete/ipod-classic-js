import {
  GameState,
  LostMenuItem,
  MenuItem,
  Position,
  SelectableTarget,
  WinMenuItem,
} from "./types";
import * as Engine from "./SolitaireEngine";
import { SelectionManager } from "./SelectionManager";
import { Renderer } from "./Renderer";
import { AnimationManager } from "./AnimationManager";

const MENU_ITEMS: MenuItem[] = ["resume", "undo", "redeal", "quit"];
const WIN_ITEMS: WinMenuItem[] = ["newGame", "quit"];
const LOST_ITEMS: LostMenuItem[] = ["redeal", "quit"];
const MAX_UNDO_STACK = 20;

const ANIM_PLACE_MS = 200;
const ANIM_FLIP_MS = 200;
const ANIM_DRAW_MS = 150;
const ANIM_DEAL_CARD_MS = 120;
const ANIM_DEAL_STAGGER_MS = 30;
const SAVE_KEY = "ipodSolitaireSaveState";
const WINS_KEY = "ipodSolitaireWins";

export default class Game {
  private canvas: HTMLCanvasElement | null;
  private ctx: CanvasRenderingContext2D | null;
  private canvasWidth: number;
  private canvasHeight: number;
  private scale: number;

  private gameState!: GameState;
  private selection: SelectionManager;
  private renderer: Renderer | null = null;
  private animations: AnimationManager;
  private undoStack: GameState[] = [];
  private menuIndex: number = 0;
  private winMenuIndex: number = 0;
  private lostMenuIndex: number = 0;

  private onQuit: () => void;
  private animationFrameId: number | null = null;
  private eventListeners: Array<{
    event: string;
    handler: EventListener;
    capture: boolean;
  }> = [];
  private initialized: boolean = false;
  private loadedFromSave: boolean = false;
  private winCount: number = 0;

  constructor(canvasWidth: number, canvasHeight: number, onQuit: () => void) {
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;
    this.scale = canvasWidth / 314;
    this.onQuit = onQuit;

    this.canvas = document.querySelector("#solitaireCanvas");
    this.ctx = this.canvas ? this.canvas.getContext("2d") : null;

    this.selection = new SelectionManager();
    this.animations = new AnimationManager();

    if (!this.loadGame()) {
      this.gameState = Engine.deal();
    }

    this.winCount = this.loadWinCount();
  }

  init(): void {
    if (!this.ctx) {
      console.error("Error getting solitaire canvas context");
      return;
    }

    this.ctx.imageSmoothingEnabled = true;
    this.ctx.imageSmoothingQuality = "high";

    this.renderer = new Renderer(
      this.ctx,
      this.canvasWidth,
      this.canvasHeight,
      this.scale
    );

    if (!this.initialized) {
      this.addListener("forwardscroll", () => this.handleScroll("forward"), true);
      this.addListener("backwardscroll", () => this.handleScroll("backward"), true);
      this.addListener("centerclick", () => this.handleCenterClick());
      this.addListener("centerlongclick", () => this.handleCenterLongClick());
      this.addListener("menuclick", () => this.handleMenuClick());

      this.initialized = true;
    }

    if (this.loadedFromSave) {
      this.selection.buildSelectableTargets(this.gameState);
      this.loadedFromSave = false;
    } else {
      this.animateDeal();
    }
    this.update();
  }

  private addListener(event: string, handler: () => void, capture = false): void {
    const wrappedHandler = handler as EventListener;
    window.addEventListener(event, wrappedHandler, capture);
    this.eventListeners.push({ event, handler: wrappedHandler, capture });
  }

  private handleScroll(direction: "forward" | "backward"): void {
    if (this.animations.isAnimating()) return;

    const phase = this.selection.getPhase();

    if (phase === "won") {
      if (direction === "forward") {
        this.winMenuIndex = Math.min(this.winMenuIndex + 1, WIN_ITEMS.length - 1);
      } else {
        this.winMenuIndex = Math.max(this.winMenuIndex - 1, 0);
      }
      return;
    }

    if (phase === "lost") {
      if (direction === "forward") {
        this.lostMenuIndex = Math.min(this.lostMenuIndex + 1, LOST_ITEMS.length - 1);
      } else {
        this.lostMenuIndex = Math.max(this.lostMenuIndex - 1, 0);
      }
      return;
    }

    if (phase === "menu") {
      if (direction === "forward") {
        this.menuIndex = Math.min(this.menuIndex + 1, MENU_ITEMS.length - 1);
      } else {
        this.menuIndex = Math.max(this.menuIndex - 1, 0);
      }
      return;
    }

    if (direction === "forward") {
      this.selection.scrollForward();
    } else {
      this.selection.scrollBackward();
    }
  }

  private handleCenterClick(): void {
    if (this.animations.isAnimating()) return;

    const phase = this.selection.getPhase();

    if (phase === "won") {
      this.handleWinMenuSelect();
      return;
    }

    if (phase === "lost") {
      this.handleLostMenuSelect();
      return;
    }

    if (phase === "menu") {
      this.handleMenuSelect();
      return;
    }

    if (phase === "holding") {
      this.handlePlaceCards();
      return;
    }

    // Browsing
    const target = this.selection.getCurrentTarget();
    if (!target) return;

    if (target.type === "stock") {
      this.handleStockDraw();
      return;
    }

    if (target.type === "tableau-empty") {
      return;
    }

    // Try to pick up card(s)
    if (!Engine.canPickUp(this.gameState, target)) return;

    const heldCards = Engine.getHeldCards(this.gameState, target);
    if (heldCards.length === 0) return;

    const validTargets = Engine.getValidDropTargets(
      this.gameState,
      heldCards,
      target
    );

    // Compute cursor position before entering holding mode
    const fromCursorPos = this.renderer
      ? this.renderer.getCursorCenter(this.gameState, this.selection.getState(), target)
      : null;

    this.selection.enterHoldingMode(heldCards, target, validTargets);

    // Animate cursor to the first drop target
    if (this.renderer && fromCursorPos) {
      const firstDropTarget = this.selection.getCurrentTarget();
      if (firstDropTarget) {
        const toCursorPos = this.renderer.getCursorCenter(
          this.gameState,
          this.selection.getState(),
          firstDropTarget
        );
        if (toCursorPos) {
          this.renderer.animateCursor(fromCursorPos, toCursorPos, 150);
        }
      }
    }
  }

  private handleStockDraw(): void {
    if (!this.renderer) return;

    const oldState = this.gameState;
    this.pushUndo();
    this.gameState = Engine.drawFromStock(this.gameState);
    this.selection.rebuildAndClamp(this.gameState);

    // Animate the drawn card from stock to waste
    if (this.gameState.waste.length > oldState.waste.length) {
      const drawnCard = this.gameState.waste[this.gameState.waste.length - 1];
      const fromPos = this.renderer.getTargetPosition(oldState, { type: "stock" });
      const toPos = this.renderer.getTargetPosition(this.gameState, { type: "waste" });

      if (fromPos && toPos) {
        this.animations.enqueue({
          cards: [drawnCard],
          from: fromPos,
          to: toPos,
          startTime: performance.now(),
          duration: ANIM_DRAW_MS,
          overlap: 0,
        });
      }
    }

    this.saveGame();
    this.scheduleAutoMoves(false);
  }

  private handlePlaceCards(): void {
    if (!this.renderer) return;

    const selState = this.selection.getState();
    const dropTarget = this.selection.getCurrentTarget();
    if (!dropTarget || !selState.heldFrom) return;

    const result = Engine.moveCards(
      this.gameState,
      selState.heldFrom,
      dropTarget
    );

    if (result === null) {
      return;
    }

    // Compute the "from" position using old state
    const fromPos = this.renderer.getTargetPosition(this.gameState, selState.heldFrom);
    const oldState = this.gameState;

    this.pushUndo();
    this.gameState = result;
    this.selection.exitHoldingMode(this.gameState);

    // Compute the "to" position using new state — find where the first placed card landed
    let toPos: Position | null = null;
    if (dropTarget.type === "foundation") {
      toPos = this.renderer.getTargetPosition(this.gameState, dropTarget);
    } else if (dropTarget.type === "tableau" || dropTarget.type === "tableau-empty") {
      const col = dropTarget.column;
      const column = this.gameState.tableau[col];
      // The placed cards are at the end of the column; first placed card index
      const firstPlacedIndex = column.length - selState.heldCards.length;
      toPos = this.renderer.getTargetPosition(this.gameState, {
        type: "tableau",
        column: col,
        cardIndex: firstPlacedIndex,
      });
    }

    // Enqueue the animation — hide the card at its destination while flying
    if (fromPos && toPos) {
      const baseOverlap = 14 * this.scale;
      // Build hide target for the placed cards' final position
      let hideTarget: SelectableTarget | undefined;
      if (dropTarget.type === "foundation") {
        hideTarget = dropTarget;
      } else if (dropTarget.type === "tableau" || dropTarget.type === "tableau-empty") {
        const col = dropTarget.column;
        const column = this.gameState.tableau[col];
        hideTarget = { type: "tableau", column: col, cardIndex: column.length - selState.heldCards.length };
      }

      this.animations.enqueue({
        cards: selState.heldCards,
        from: fromPos,
        to: toPos,
        startTime: performance.now(),
        duration: ANIM_PLACE_MS,
        overlap: Math.min(baseOverlap, 12 * this.scale),
        hideTarget,
      });
    }

    this.saveGame();

    // Queue a flip animation if a card was revealed in the source column
    const revealedFlip = this.findRevealedCard(oldState, this.gameState);

    if (Engine.checkWin(this.gameState)) {
      this.winCount++;
      this.saveWinCount();
      this.selection.setPhase("won");
      this.winMenuIndex = 0;
      return;
    }

    // Don't auto-move from the column the player just placed cards into
    const skipColumns: number[] = [];
    if (dropTarget.type === "tableau" || dropTarget.type === "tableau-empty") {
      skipColumns.push(dropTarget.column);
    }

    if (revealedFlip) {
      // Enqueue flip immediately so the card is hidden during the move animation.
      // The flip's startTime is already delayed to begin after the move finishes.
      this.animations.enqueueFlip(revealedFlip);
      this.animations.onAllComplete(() => {
        this.performAutoMoves(false, skipColumns);
      });
    } else {
      this.scheduleAutoMoves(false, skipColumns);
    }
  }

  private scheduleAutoMoves(skipWaste = false, skipColumns: number[] = []): void {
    if (this.animations.isAnimating()) {
      this.animations.onAllComplete(() => this.performAutoMoves(skipWaste, skipColumns));
    } else {
      this.performAutoMoves(skipWaste, skipColumns);
    }
  }

  private performAutoMoves(skipWaste = false, skipColumns: number[] = []): void {
    if (!this.renderer) return;

    const autoMove = Engine.findAutoMoveCard(this.gameState, { skipWaste, skipColumns });
    if (!autoMove) {
      this.selection.rebuildAndClamp(this.gameState);
      this.checkForLoss();
      return;
    }

    const { card, from, foundationIndex } = autoMove;
    const foundationTarget = { type: "foundation" as const, index: foundationIndex };

    const fromPos = this.renderer.getTargetPosition(this.gameState, from);

    const result = Engine.moveCards(this.gameState, from, foundationTarget);
    if (!result) {
      this.checkForLoss();
      return;
    }

    // Compute destination using the new state, but don't apply it yet
    const toPos = this.renderer.getTargetPosition(result, foundationTarget);

    if (fromPos && toPos) {
      this.animations.enqueue({
        cards: [card],
        from: fromPos,
        to: toPos,
        startTime: performance.now(),
        duration: ANIM_DRAW_MS,
        overlap: 0,
      });
    }

    // Apply state only after animation completes
    this.animations.onAllComplete(() => {
      this.pushUndo();
      this.gameState = result;
      this.selection.rebuildAndClamp(this.gameState);
      this.saveGame();

      if (Engine.checkWin(this.gameState)) {
        this.winCount++;
        this.saveWinCount();
        this.selection.setPhase("won");
        this.winMenuIndex = 0;
        return;
      }

      this.performAutoMoves(skipWaste, skipColumns);
    });
  }

  private handleCenterLongClick(): void {
    if (this.animations.isAnimating()) return;

    const phase = this.selection.getPhase();
    if (phase === "won" || phase === "lost") return;

    if (this.undoStack.length === 0) return;

    const previousState = this.undoStack.pop()!;
    const currentState = this.gameState;

    // If in holding or menu, snap out first
    if (phase === "holding") {
      this.selection.cancelHolding(this.gameState);
    } else if (phase === "menu") {
      this.selection.setPhase("browsing");
    }

    // Try to animate the undo
    if (this.renderer) {
      const diff = Engine.findStateDiff(previousState, currentState);

      if (diff) {
        // Animate from current position back to previous position
        const fromPos = this.renderer.getTargetPosition(currentState, diff.to);
        const toPos = this.renderer.getTargetPosition(previousState, diff.from);

        if (fromPos && toPos) {
          const baseOverlap = 14 * this.scale;
          this.animations.enqueue({
            cards: diff.cards,
            from: fromPos,
            to: toPos,
            startTime: performance.now(),
            duration: ANIM_PLACE_MS,
            overlap: diff.cards.length > 1 ? Math.min(baseOverlap, 12 * this.scale) : 0,
          });

          this.animations.onAllComplete(() => {
            this.gameState = previousState;
            this.selection.rebuildAndClamp(this.gameState);
            this.saveGame();
          });
          return;
        }
      }
    }

    // Fallback: snap without animation
    this.gameState = previousState;
    this.selection.rebuildAndClamp(this.gameState);
    this.saveGame();
  }

  private handleMenuClick(): void {
    if (this.animations.isAnimating()) return;

    const phase = this.selection.getPhase();

    if (phase === "holding") {
      // Animate cursor back to the source card
      if (this.renderer) {
        const selState = this.selection.getState();
        const currentTarget = this.selection.getCurrentTarget();
        if (currentTarget && selState.heldFrom) {
          const fromPos = this.renderer.getCursorCenter(
            this.gameState,
            selState,
            currentTarget
          );
          this.selection.cancelHolding(this.gameState);
          const newTarget = this.selection.getCurrentTarget();
          if (fromPos && newTarget) {
            const toPos = this.renderer.getCursorCenter(
              this.gameState,
              this.selection.getState(),
              newTarget
            );
            if (toPos) {
              this.renderer.animateCursor(fromPos, toPos, 150);
            }
          }
          return;
        }
      }
      this.selection.cancelHolding(this.gameState);
      return;
    }

    if (phase === "menu") {
      this.selection.setPhase("browsing");
      return;
    }

    if (phase === "browsing") {
      this.selection.setPhase("menu");
      this.menuIndex = 0;
      return;
    }
  }

  private handleMenuSelect(): void {
    const item = MENU_ITEMS[this.menuIndex];
    switch (item) {
      case "resume":
        this.selection.setPhase("browsing");
        break;
      case "undo":
        this.selection.setPhase("browsing");
        this.handleCenterLongClick();
        break;
      case "redeal":
        this.redeal();
        break;
      case "quit":
        this.onQuit();
        break;
    }
  }

  private handleWinMenuSelect(): void {
    const item = WIN_ITEMS[this.winMenuIndex];
    switch (item) {
      case "newGame":
        this.redeal();
        break;
      case "quit":
        this.clearSave();
        this.onQuit();
        break;
    }
  }

  private handleLostMenuSelect(): void {
    const item = LOST_ITEMS[this.lostMenuIndex];
    switch (item) {
      case "redeal":
        this.redeal();
        break;
      case "quit":
        this.clearSave();
        this.onQuit();
        break;
    }
  }

  private redeal(): void {
    this.animations.clear();
    this.gameState = Engine.deal();
    this.undoStack = [];
    this.menuIndex = 0;
    this.winMenuIndex = 0;
    this.lostMenuIndex = 0;
    this.selection.resetToStock(this.gameState);
    this.saveGame();
    this.animateDeal();
  }

  private animateDeal(): void {
    if (!this.renderer) return;

    const now = performance.now();
    const stockPos = this.renderer.getTargetPosition(this.gameState, { type: "stock" });
    if (!stockPos) return;

    let cardCount = 0;
    for (let col = 0; col < 7; col++) {
      const column = this.gameState.tableau[col];
      for (let row = 0; row <= col; row++) {
        const card = column[row];
        const targetPos = this.getTableauCardPosition(col, row, column);
        if (!targetPos) continue;

        this.animations.enqueue({
          cards: [card],
          from: { ...stockPos },
          to: targetPos,
          startTime: now + cardCount * ANIM_DEAL_STAGGER_MS,
          duration: ANIM_DEAL_CARD_MS,
          overlap: 0,
          faceDown: !card.faceUp,
        });
        cardCount++;
      }
    }

    // Build selectable targets after deal animation completes
    this.animations.onAllComplete(() => {
      this.selection.buildSelectableTargets(this.gameState);
    });
  }

  private getTableauCardPosition(
    col: number,
    cardIndex: number,
    column: { faceUp: boolean }[]
  ): Position | null {
    if (!this.renderer) return null;

    // For deal animation, compute target position based on column layout
    return this.renderer.getTargetPosition(this.gameState, {
      type: "tableau",
      column: col,
      cardIndex,
    });
  }

  private saveGame(): void {
    try {
      const data = JSON.stringify({
        gameState: this.gameState,
        undoStack: this.undoStack,
      });
      localStorage.setItem(SAVE_KEY, data);
    } catch {
      // Storage full or unavailable — silently ignore
    }
  }

  private loadGame(): boolean {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (!raw) return false;

      const data = JSON.parse(raw) as {
        gameState?: GameState;
        undoStack?: GameState[];
      };

      if (!data.gameState || !isValidGameState(data.gameState)) {
        this.clearSave();
        return false;
      }

      // Don't restore a completed board — clear the stale save and deal fresh
      if (Engine.checkWin(data.gameState)) {
        this.clearSave();
        return false;
      }

      this.gameState = data.gameState;
      this.undoStack = data.undoStack ?? [];
      this.loadedFromSave = true;
      return true;
    } catch {
      return false;
    }
  }

  private clearSave(): void {
    try {
      localStorage.removeItem(SAVE_KEY);
    } catch {
      // Silently ignore
    }
  }

  private loadWinCount(): number {
    try {
      const raw = localStorage.getItem(WINS_KEY);
      if (!raw) return 0;
      const n = parseInt(raw, 10);
      return isNaN(n) ? 0 : n;
    } catch {
      return 0;
    }
  }

  private saveWinCount(): void {
    try {
      localStorage.setItem(WINS_KEY, String(this.winCount));
    } catch {
      // Silently ignore
    }
  }

  private findRevealedCard(
    oldState: GameState,
    newState: GameState
  ): import("./AnimationManager").FlipAnimation | null {
    if (!this.renderer) return null;

    for (let col = 0; col < 7; col++) {
      const oldCol = oldState.tableau[col];
      const newCol = newState.tableau[col];

      // A card was revealed if the column shrank and the new top card is face-up
      // while the same card was face-down in the old state
      if (newCol.length > 0 && newCol.length < oldCol.length) {
        const newTop = newCol[newCol.length - 1];
        const oldCard = oldCol[newCol.length - 1];

        if (newTop.faceUp && oldCard && !oldCard.faceUp) {
          const target: SelectableTarget = {
            type: "tableau",
            column: col,
            cardIndex: newCol.length - 1,
          };
          const pos = this.renderer.getTargetPosition(newState, target);
          if (pos) {
            return {
              card: newTop,
              position: pos,
              startTime: performance.now() + ANIM_PLACE_MS,
              duration: ANIM_FLIP_MS,
              hideTarget: target,
            };
          }
        }
      }
    }

    return null;
  }

  private pushUndo(): void {
    this.undoStack.push(this.gameState);
    if (this.undoStack.length > MAX_UNDO_STACK) {
      this.undoStack.shift();
    }
  }

  private checkForLoss(): void {
    if (!Engine.hasAvailableMoves(this.gameState)) {
      this.selection.setPhase("lost");
      this.lostMenuIndex = 0;
    }
  }

  private update = (): void => {
    if (!this.renderer) return;

    const now = performance.now();
    this.animations.tick(now);

    const selState = this.selection.getState();
    const activeAnims = this.animations.getActiveAnimations(now);
    const activeFlips = this.animations.getActiveFlips(now);
    const hiddenTargets = this.animations.getHiddenTargets();

    this.renderer.render(this.gameState, selState, activeAnims, hiddenTargets, activeFlips);

    if (selState.phase === "menu") {
      this.renderer.renderMenu(MENU_ITEMS, this.menuIndex, this.winCount);
    } else if (selState.phase === "won") {
      this.renderer.renderWinOverlay(
        WIN_ITEMS,
        this.winMenuIndex,
        this.winCount
      );
    } else if (selState.phase === "lost") {
      this.renderer.renderLostOverlay(
        LOST_ITEMS,
        this.lostMenuIndex
      );
    }

    this.animationFrameId = requestAnimationFrame(this.update);
  };

  resize(width: number, height: number): void {
    this.canvasWidth = width;
    this.canvasHeight = height;
    this.scale = width / 314;

    if (this.ctx) {
      this.renderer = new Renderer(
        this.ctx,
        this.canvasWidth,
        this.canvasHeight,
        this.scale
      );
    }
  }

  cleanup(): void {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }

    this.animations.clear();

    for (const { event, handler, capture } of this.eventListeners) {
      window.removeEventListener(event, handler, capture);
    }
    this.eventListeners = [];
    this.initialized = false;
  }
}

function isValidGameState(state: unknown): state is import("./types").GameState {
  if (!state || typeof state !== "object") return false;
  const s = state as Record<string, unknown>;

  if (!Array.isArray(s.stock)) return false;
  if (!Array.isArray(s.waste)) return false;
  if (!Array.isArray(s.foundations) || s.foundations.length !== 4) return false;
  if (!Array.isArray(s.tableau) || s.tableau.length !== 7) return false;
  if (typeof s.stockPasses !== "number") return false;

  const isCardArray = (arr: unknown): boolean =>
    Array.isArray(arr) &&
    (arr as unknown[]).every(
      (c) =>
        c !== null &&
        typeof c === "object" &&
        typeof (c as Record<string, unknown>).suit === "string" &&
        typeof (c as Record<string, unknown>).rank === "string" &&
        typeof (c as Record<string, unknown>).faceUp === "boolean"
    );

  if (!isCardArray(s.stock)) return false;
  if (!isCardArray(s.waste)) return false;
  if (!(s.foundations as unknown[]).every(isCardArray)) return false;
  if (!(s.tableau as unknown[]).every(isCardArray)) return false;

  return true;
}
