import {
  Card,
  GameState,
  HighlightType,
  LostMenuItem,
  MenuItem,
  Position,
  SelectableTarget,
  SelectionState,
  SUIT_SYMBOLS,
  FOUNDATION_ORDER,
  WinMenuItem,
  getColor,
} from "./types";
import type { InterpolatedAnimation } from "./AnimationManager";

const FELT_COLOR = "#35654d";
const CARD_WHITE = "#FFFFFF";
const CARD_BACK_COLOR = "#C85A2A";
const CARD_BACK_STRIPE = "#E87E4A";
const CARD_BORDER = "#333333";
const CARD_RADIUS = 3;
const HIGHLIGHT_ORANGE = "#FF8C00";
const HIGHLIGHT_BLUE = "#2E6BE6";
const OVERLAY_BG = "rgba(0, 0, 0, 0.7)";
const MENU_HIGHLIGHT = "#4A90D9";
const SCORE_COLOR = "#FFFFFF";

interface LayoutConfig {
  cardWidth: number;
  cardHeight: number;
  topRowY: number;
  tableauStartY: number;
  columnSpacing: number;
  columnStartX: number;
  stockX: number;
  wasteX: number;
  foundationStartX: number;
  foundationSpacing: number;
  baseOverlap: number;
  faceDownOverlap: number;
  maxTableauHeight: number;
}

export class Renderer {
  private ctx: CanvasRenderingContext2D;
  private width: number;
  private height: number;
  private scale: number;
  private layout: LayoutConfig;
  private recycleIcon: HTMLImageElement | null = null;
  private handCursor: HTMLImageElement | null = null;

  constructor(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    scale: number
  ) {
    this.ctx = ctx;
    this.width = width;
    this.height = height;
    this.scale = scale;
    this.layout = this.computeLayout();
    this.loadAssets();
  }

  private loadAssets(): void {
    const recycleImg = new Image();
    recycleImg.src = "/ipod/recycle.svg";
    recycleImg.onload = () => {
      this.recycleIcon = recycleImg;
    };

    const handImg = new Image();
    handImg.src = "/ipod/hand_cursor.svg";
    handImg.onload = () => {
      this.handCursor = handImg;
    };
  }

  private computeLayout(): LayoutConfig {
    const cardWidth = Math.floor(this.width / 8.5);
    const cardHeight = Math.floor(cardWidth * 1.4);
    const topRowY = 4 * this.scale;
    const tableauStartY = topRowY + cardHeight + 8 * this.scale;
    const totalColumnWidth = cardWidth * 7;
    const totalGaps = this.width - totalColumnWidth;
    const columnSpacing = Math.floor(totalGaps / 8);
    const columnStartX = columnSpacing;
    const stockX = columnStartX;
    const wasteX = columnStartX + cardWidth + columnSpacing;
    const foundationStartX =
      this.width - 4 * cardWidth - 3 * columnSpacing - columnSpacing;
    const foundationSpacing = cardWidth + columnSpacing;

    return {
      cardWidth,
      cardHeight,
      topRowY,
      tableauStartY,
      columnSpacing,
      columnStartX,
      stockX,
      wasteX,
      foundationStartX,
      foundationSpacing,
      baseOverlap: 14 * this.scale,
      faceDownOverlap: 8 * this.scale,
      maxTableauHeight: this.height - tableauStartY - 2 * this.scale,
    };
  }

  render(
    gameState: GameState,
    selectionState: SelectionState,
    activeAnimations?: InterpolatedAnimation[]
  ): void {
    this.drawBackground();
    this.drawStock(gameState, selectionState);
    this.drawWaste(gameState.waste, selectionState);
    this.drawFoundations(gameState.foundations, selectionState);
    this.drawTableau(gameState.tableau, selectionState);
    this.drawScore(gameState.score);

    // Draw in-flight animated cards on top of the board
    if (activeAnimations && activeAnimations.length > 0) {
      this.drawAnimations(activeAnimations);
    }

    if (selectionState.phase === "browsing" || selectionState.phase === "holding") {
      const cursorTarget = selectionState.targets[selectionState.cursorIndex];
      if (cursorTarget) {
        const cursorPos = this.getCursorCenter(gameState, selectionState, cursorTarget);
        if (cursorPos) {
          this.drawCursor(cursorPos.x, cursorPos.y);
        }
      }
    }
  }

  renderMenu(items: MenuItem[], selectedIndex: number): void {
    this.drawOverlay();
    this.drawMenuList(
      items.map(menuItemLabel),
      selectedIndex,
      "Paused"
    );
  }

  renderWinOverlay(score: number, items: WinMenuItem[], selectedIndex: number): void {
    this.drawOverlay();
    this.drawMenuList(
      items.map(winMenuItemLabel),
      selectedIndex,
      `You Win!  ${formatScore(score)}`
    );
  }

  renderLostOverlay(score: number, items: LostMenuItem[], selectedIndex: number): void {
    this.drawOverlay();
    this.drawMenuList(
      items.map(lostMenuItemLabel),
      selectedIndex,
      `No More Moves  ${formatScore(score)}`
    );
  }

  getTargetPosition(
    gameState: GameState,
    target: SelectableTarget
  ): Position | null {
    const l = this.layout;

    switch (target.type) {
      case "stock":
        return { x: l.stockX, y: l.topRowY };
      case "waste":
        return { x: l.wasteX, y: l.topRowY };
      case "foundation":
        return {
          x: l.foundationStartX + target.index * l.foundationSpacing,
          y: l.topRowY,
        };
      case "tableau": {
        const column = gameState.tableau[target.column];
        const y = this.getCardY(column, target.cardIndex);
        return {
          x: l.columnStartX + target.column * (l.cardWidth + l.columnSpacing),
          y,
        };
      }
      case "tableau-empty":
        return {
          x:
            l.columnStartX + target.column * (l.cardWidth + l.columnSpacing),
          y: l.tableauStartY,
        };
    }
  }

  private getCardY(column: Card[], cardIndex: number): number {
    const l = this.layout;
    let y = l.tableauStartY;

    const overlaps = this.computeOverlaps(column);

    for (let i = 0; i < cardIndex; i++) {
      y += overlaps[i] ?? l.baseOverlap;
    }
    return y;
  }

  private computeOverlaps(column: Card[]): number[] {
    const l = this.layout;
    if (column.length <= 1) return [];

    const overlaps: number[] = [];
    let totalNeeded = 0;
    for (let i = 0; i < column.length - 1; i++) {
      overlaps.push(column[i].faceUp ? l.baseOverlap : l.faceDownOverlap);
      totalNeeded += overlaps[i];
    }

    const available = l.maxTableauHeight - l.cardHeight;
    if (totalNeeded > available && available > 0) {
      const ratio = available / totalNeeded;
      for (let i = 0; i < overlaps.length; i++) {
        overlaps[i] = Math.max(4 * this.scale, Math.floor(overlaps[i] * ratio));
      }
    }

    return overlaps;
  }

  private drawBackground(): void {
    this.ctx.fillStyle = FELT_COLOR;
    this.ctx.fillRect(0, 0, this.width, this.height);
  }

  private drawStock(gameState: GameState, selectionState: SelectionState): void {
    const l = this.layout;
    const x = l.stockX;
    const y = l.topRowY;
    const highlight = this.getHighlight({ type: "stock" }, selectionState);

    if (gameState.stock.length > 0) {
      this.drawCardBack(x, y);
      if (highlight !== "none") {
        this.drawStackHighlight(x, y, l.cardWidth, l.cardHeight, highlight);
      }
    } else if (gameState.waste.length > 0) {
      // Stock is empty but waste has cards — show recycle indicator
      this.drawRecycleIndicator(x, y, highlight);
    } else {
      this.drawEmptyPile(x, y);
    }
  }

  private drawRecycleIndicator(
    x: number,
    y: number,
    highlight: HighlightType
  ): void {
    const l = this.layout;
    const ctx = this.ctx;

    // Draw empty pile outline
    ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 3]);
    this.roundRect(x, y, l.cardWidth, l.cardHeight, CARD_RADIUS);
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw recycle icon from loaded SVG
    if (this.recycleIcon) {
      const iconSize = Math.min(l.cardWidth, l.cardHeight) * 0.45;
      const ix = x + (l.cardWidth - iconSize) / 2;
      const iy = y + (l.cardHeight - iconSize) / 2;
      ctx.globalAlpha = 0.5;
      ctx.drawImage(this.recycleIcon, ix, iy, iconSize, iconSize);
      ctx.globalAlpha = 1;
    }

    // Apply highlight if cursor is on stock
    if (highlight !== "none") {
      this.drawStackHighlight(x, y, l.cardWidth, l.cardHeight, highlight);
    }
  }

  private drawWaste(waste: Card[], selectionState: SelectionState): void {
    const l = this.layout;
    if (waste.length === 0) return;

    const topCard = waste[waste.length - 1];

    // If the waste card is being held, show it with blue highlight at its source
    const isHeld =
      selectionState.phase === "holding" &&
      selectionState.heldFrom?.type === "waste";

    const highlight = isHeld
      ? "blue" as HighlightType
      : this.getHighlight({ type: "waste" }, selectionState);

    this.drawCard(topCard, l.wasteX, l.topRowY, highlight);
  }

  private drawFoundations(
    foundations: Card[][],
    selectionState: SelectionState
  ): void {
    const l = this.layout;
    for (let i = 0; i < 4; i++) {
      const x = l.foundationStartX + i * l.foundationSpacing;
      const foundation = foundations[i];

      const isHeld =
        selectionState.phase === "holding" &&
        selectionState.heldFrom?.type === "foundation" &&
        (selectionState.heldFrom as { index: number }).index === i;

      // Check if this foundation is the current drop target
      const highlight = this.getHighlight(
        { type: "foundation", index: i },
        selectionState
      );

      if (foundation.length === 0) {
        this.drawEmptyPile(x, l.topRowY, FOUNDATION_ORDER[i], highlight !== "none" ? highlight : undefined);
      } else {
        const topCard = foundation[foundation.length - 1];
        const cardHighlight = isHeld ? "blue" as HighlightType : highlight;
        this.drawCard(topCard, x, l.topRowY, cardHighlight);
      }
    }
  }

  private drawTableau(
    tableau: Card[][],
    selectionState: SelectionState
  ): void {
    const l = this.layout;

    for (let col = 0; col < 7; col++) {
      const column = tableau[col];
      const x = l.columnStartX + col * (l.cardWidth + l.columnSpacing);

      if (column.length === 0) {
        const highlight = this.getHighlight(
          { type: "tableau-empty", column: col },
          selectionState
        );
        if (highlight !== "none") {
          this.drawEmptyPile(x, l.tableauStartY, undefined, highlight);
        } else {
          this.drawEmptyPile(x, l.tableauStartY);
        }
        continue;
      }

      const overlaps = this.computeOverlaps(column);

      const cursorTarget = selectionState.targets[selectionState.cursorIndex];

      // In browsing mode: which card in this column is being hovered?
      const browseInThisCol =
        selectionState.phase === "browsing" &&
        cursorTarget?.type === "tableau" &&
        cursorTarget.column === col
          ? cursorTarget.cardIndex
          : -1;

      // In holding mode: is this column the source of held cards?
      const heldFromThisCol =
        selectionState.phase === "holding" &&
        selectionState.heldFrom?.type === "tableau" &&
        (selectionState.heldFrom as { column: number }).column === col
          ? (selectionState.heldFrom as { cardIndex: number }).cardIndex
          : -1;

      // In holding mode: is this column the current drop target?
      const isDropTarget =
        selectionState.phase === "holding" &&
        cursorTarget?.type === "tableau" &&
        cursorTarget.column === col;

      // Draw all cards first (no individual highlights)
      let y = l.tableauStartY;
      const cardYPositions: number[] = [];
      for (let i = 0; i < column.length; i++) {
        cardYPositions.push(y);
        const card = column[i];

        if (card.faceUp) {
          this.drawCard(card, x, y, "none");
        } else {
          this.drawCardBack(x, y);
        }

        if (i < column.length - 1) {
          y += overlaps[i] ?? l.baseOverlap;
        }
      }

      // Blue highlight on held source stack
      if (heldFromThisCol >= 0) {
        const topY = cardYPositions[heldFromThisCol];
        const bottomY = cardYPositions[column.length - 1] + l.cardHeight;
        this.drawStackHighlight(x, topY, l.cardWidth, bottomY - topY, "blue");
      }

      // Orange highlight on browsing hover (full run)
      if (browseInThisCol >= 0) {
        const topY = cardYPositions[browseInThisCol];
        const bottomY = cardYPositions[column.length - 1] + l.cardHeight;
        this.drawStackHighlight(x, topY, l.cardWidth, bottomY - topY, "orange");
      }

      // Orange highlight showing where held cards will land (below the last card)
      if (isDropTarget && column.length > 0) {
        const lastCardY = cardYPositions[column.length - 1];
        const dropY = lastCardY + l.baseOverlap;
        this.drawStackHighlight(x, dropY, l.cardWidth, l.cardHeight, "orange");
      }
    }
  }

  private drawCard(
    card: Card,
    x: number,
    y: number,
    highlight: HighlightType = "none"
  ): void {
    const l = this.layout;
    const ctx = this.ctx;

    // Card body
    ctx.fillStyle = CARD_WHITE;
    this.roundRect(x, y, l.cardWidth, l.cardHeight, CARD_RADIUS);
    ctx.fill();

    // Card border
    ctx.strokeStyle = CARD_BORDER;
    ctx.lineWidth = 1;
    this.roundRect(x, y, l.cardWidth, l.cardHeight, CARD_RADIUS);
    ctx.stroke();

    // Card content
    const color = getColor(card.suit);
    ctx.fillStyle = color === "red" ? "#CC0000" : "#000000";
    const suitSymbol = SUIT_SYMBOLS[card.suit];
    const fontSize = Math.floor(10 * this.scale);

    // Top-left rank + suit
    ctx.font = `bold ${fontSize}px sans-serif`;
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    ctx.fillText(card.rank, x + 3 * this.scale, y + 2 * this.scale);
    ctx.font = `${fontSize}px sans-serif`;
    ctx.fillText(suitSymbol, x + 3 * this.scale, y + 2 * this.scale + fontSize);

    // Center suit (larger)
    const centerFontSize = Math.floor(16 * this.scale);
    ctx.font = `${centerFontSize}px sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(
      suitSymbol,
      x + l.cardWidth / 2,
      y + l.cardHeight / 2
    );

    // Draw highlight overlay on top of the card
    if (highlight !== "none") {
      this.drawStackHighlight(x, y, l.cardWidth, l.cardHeight, highlight);
    }
  }

  private drawCardBack(x: number, y: number): void {
    const l = this.layout;
    const ctx = this.ctx;

    ctx.fillStyle = CARD_BACK_COLOR;
    this.roundRect(x, y, l.cardWidth, l.cardHeight, CARD_RADIUS);
    ctx.fill();

    ctx.strokeStyle = CARD_BORDER;
    ctx.lineWidth = 1;
    this.roundRect(x, y, l.cardWidth, l.cardHeight, CARD_RADIUS);
    ctx.stroke();

    // Horizontal stripes
    const stripeHeight = 2 * this.scale;
    const stripeGap = 3 * this.scale;
    const inset = 3 * this.scale;
    ctx.fillStyle = CARD_BACK_STRIPE;

    for (
      let sy = y + inset;
      sy < y + l.cardHeight - inset;
      sy += stripeHeight + stripeGap
    ) {
      const stripeW = l.cardWidth - inset * 2;
      const stripeH = Math.min(stripeHeight, y + l.cardHeight - inset - sy);
      if (stripeH > 0) {
        ctx.fillRect(x + inset, sy, stripeW, stripeH);
      }
    }
  }

  private drawEmptyPile(
    x: number,
    y: number,
    suit?: string,
    highlight?: HighlightType
  ): void {
    const l = this.layout;
    const ctx = this.ctx;

    ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 3]);
    this.roundRect(x, y, l.cardWidth, l.cardHeight, CARD_RADIUS);
    ctx.stroke();
    ctx.setLineDash([]);

    if (suit) {
      const suitSymbol =
        SUIT_SYMBOLS[suit as keyof typeof SUIT_SYMBOLS] ?? "";
      const fontSize = Math.floor(20 * this.scale);
      ctx.font = `${fontSize}px sans-serif`;
      ctx.fillStyle = "rgba(255, 255, 255, 0.2)";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(
        suitSymbol,
        x + l.cardWidth / 2,
        y + l.cardHeight / 2
      );
    }

    if (highlight && highlight !== "none") {
      this.drawStackHighlight(x, y, l.cardWidth, l.cardHeight, highlight);
    }
  }

  private getCursorCenter(
    gameState: GameState,
    selectionState: SelectionState,
    target: SelectableTarget
  ): Position | null {
    const l = this.layout;
    const pos = this.getTargetPosition(gameState, target);
    if (!pos) return null;

    if (selectionState.phase === "browsing" && target.type === "tableau") {
      // Center on the full run from this card to the bottom of the column
      const column = gameState.tableau[target.column];
      const topY = pos.y;
      const bottomCardY = this.getCardY(column, column.length - 1);
      const bottomY = bottomCardY + l.cardHeight;
      return {
        x: pos.x + l.cardWidth / 2,
        y: topY + (bottomY - topY) / 2,
      };
    }

    if (selectionState.phase === "holding" && (target.type === "tableau") ) {
      // Center on the drop zone below the last card
      const column = gameState.tableau[target.column];
      if (column.length > 0) {
        const lastCardY = this.getCardY(column, column.length - 1);
        const dropY = lastCardY + l.baseOverlap;
        return {
          x: pos.x + l.cardWidth / 2,
          y: dropY + l.cardHeight / 2,
        };
      }
    }

    // For all other targets (stock, waste, foundation, empty tableau), center on the card
    return {
      x: pos.x + l.cardWidth / 2,
      y: pos.y + l.cardHeight / 2,
    };
  }

  private drawCursor(x: number, y: number): void {
    const size = 26 * this.scale;

    if (this.handCursor) {
      const aspectRatio = 435 / 512;
      const drawW = size * aspectRatio;
      const drawH = size;
      const drawX = x - drawW * 0.4;
      const drawY = y - drawH * 0.55 + 20 * this.scale;
      this.ctx.drawImage(this.handCursor, drawX, drawY, drawW, drawH);
    } else {
      // Fallback: simple arrow while image loads
      const ctx = this.ctx;
      const s = 12 * this.scale;
      const cx = x - s * 0.35;
      const cy = y - s * 0.5;
      ctx.fillStyle = "#FFFFFF";
      ctx.strokeStyle = "#000000";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx, cy + s);
      ctx.lineTo(cx + s * 0.4, cy + s * 0.7);
      ctx.lineTo(cx + s * 0.7, cy + s * 1.1);
      ctx.lineTo(cx + s * 0.9, cy + s);
      ctx.lineTo(cx + s * 0.55, cy + s * 0.6);
      ctx.lineTo(cx + s, cy + s * 0.55);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }
  }

  private drawStackHighlight(
    x: number,
    y: number,
    w: number,
    h: number,
    type: HighlightType
  ): void {
    if (type === "none") return;

    const ctx = this.ctx;
    const pad = 2 * this.scale;
    const color = type === "orange" ? HIGHLIGHT_ORANGE : HIGHLIGHT_BLUE;

    // Semi-transparent fill
    ctx.fillStyle =
      type === "orange" ? "rgba(255, 140, 0, 0.15)" : "rgba(46, 107, 230, 0.15)";
    this.roundRect(x - pad, y - pad, w + pad * 2, h + pad * 2, CARD_RADIUS + 1);
    ctx.fill();

    // Solid outline
    ctx.strokeStyle = color;
    ctx.lineWidth = 2 * this.scale;
    this.roundRect(x - pad, y - pad, w + pad * 2, h + pad * 2, CARD_RADIUS + 1);
    ctx.stroke();
  }

  private drawScore(score: number): void {
    const ctx = this.ctx;
    const fontSize = Math.floor(10 * this.scale);
    ctx.font = `bold ${fontSize}px sans-serif`;
    ctx.fillStyle = SCORE_COLOR;
    ctx.textAlign = "right";
    ctx.textBaseline = "bottom";
    ctx.fillText(
      formatScore(score),
      this.width - 4 * this.scale,
      this.height - 3 * this.scale
    );
  }

  private drawAnimations(animations: InterpolatedAnimation[]): void {
    const l = this.layout;

    for (const anim of animations) {
      this.ctx.save();
      this.ctx.shadowColor = "rgba(0, 0, 0, 0.3)";
      this.ctx.shadowBlur = 4 * this.scale;
      this.ctx.shadowOffsetX = 1 * this.scale;
      this.ctx.shadowOffsetY = 2 * this.scale;

      for (let i = 0; i < anim.cards.length; i++) {
        const y = anim.position.y + i * anim.overlap;
        if (anim.faceDown) {
          this.drawCardBack(anim.position.x, y);
        } else {
          this.drawCard(anim.cards[i], anim.position.x, y, "none");
        }
      }

      this.ctx.restore();
    }
  }

  private drawOverlay(): void {
    this.ctx.fillStyle = OVERLAY_BG;
    this.ctx.fillRect(0, 0, this.width, this.height);
  }

  private drawMenuList(
    labels: string[],
    selectedIndex: number,
    title: string
  ): void {
    const ctx = this.ctx;
    const itemHeight = 24 * this.scale;
    const titleHeight = 28 * this.scale;
    const totalHeight = titleHeight + labels.length * itemHeight + 16 * this.scale;
    const menuWidth = 160 * this.scale;
    const startX = (this.width - menuWidth) / 2;
    const startY = (this.height - totalHeight) / 2;

    // Menu background
    ctx.fillStyle = "rgba(40, 40, 40, 0.95)";
    this.roundRect(startX, startY, menuWidth, totalHeight, 6);
    ctx.fill();

    // Title
    const titleFontSize = Math.floor(12 * this.scale);
    ctx.font = `bold ${titleFontSize}px sans-serif`;
    ctx.fillStyle = SCORE_COLOR;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(
      title,
      this.width / 2,
      startY + titleHeight / 2
    );

    // Items
    const itemFontSize = Math.floor(11 * this.scale);
    const itemStartY = startY + titleHeight;

    for (let i = 0; i < labels.length; i++) {
      const itemY = itemStartY + i * itemHeight;

      if (i === selectedIndex) {
        ctx.fillStyle = MENU_HIGHLIGHT;
        this.roundRect(
          startX + 6 * this.scale,
          itemY + 2 * this.scale,
          menuWidth - 12 * this.scale,
          itemHeight - 4 * this.scale,
          4
        );
        ctx.fill();
      }

      ctx.font = `${itemFontSize}px sans-serif`;
      ctx.fillStyle = SCORE_COLOR;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(labels[i], this.width / 2, itemY + itemHeight / 2);
    }
  }

  private getHighlight(
    target: SelectableTarget,
    selectionState: SelectionState
  ): HighlightType {
    if (
      selectionState.phase !== "browsing" &&
      selectionState.phase !== "holding"
    ) {
      return "none";
    }

    const currentTarget =
      selectionState.targets[selectionState.cursorIndex];
    if (!currentTarget) return "none";

    if (matchesTarget(target, currentTarget)) {
      // In both browsing and holding, the cursor target is orange (hover)
      return "orange";
    }

    return "none";
  }

  private roundRect(
    x: number,
    y: number,
    w: number,
    h: number,
    r: number
  ): void {
    const ctx = this.ctx;
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }
}

function matchesTarget(a: SelectableTarget, b: SelectableTarget): boolean {
  if (a.type !== b.type) return false;
  switch (a.type) {
    case "stock":
      return true;
    case "waste":
      return true;
    case "foundation":
      return (b as { index: number }).index === a.index;
    case "tableau":
      return (
        (b as { column: number; cardIndex: number }).column === a.column &&
        (b as { column: number; cardIndex: number }).cardIndex === a.cardIndex
      );
    case "tableau-empty":
      return (b as { column: number }).column === a.column;
  }
}

function formatScore(score: number): string {
  if (score >= 0) return `$${score}`;
  return `-$${Math.abs(score)}`;
}

function menuItemLabel(item: MenuItem): string {
  switch (item) {
    case "resume":
      return "Resume";
    case "redeal":
      return "Redeal";
    case "quit":
      return "Quit";
  }
}

function winMenuItemLabel(item: WinMenuItem): string {
  switch (item) {
    case "newGame":
      return "New Game";
    case "quit":
      return "Quit";
  }
}

function lostMenuItemLabel(item: LostMenuItem): string {
  switch (item) {
    case "redeal":
      return "Redeal";
    case "quit":
      return "Quit";
  }
}
