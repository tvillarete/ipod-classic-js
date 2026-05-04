import {
  Card,
  GameState,
  SelectableTarget,
  Suit,
  SUITS,
  RANKS,
  FOUNDATION_ORDER,
  getColor,
  getRankValue,
} from "./types";

function shuffleArray<T>(arr: T[]): T[] {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function createDeck(): Card[] {
  const cards: Card[] = [];
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      cards.push({ suit, rank, faceUp: false });
    }
  }
  return shuffleArray(cards);
}

export function deal(): GameState {
  const deck = createDeck();
  const tableau: Card[][] = [];
  let cardIndex = 0;

  for (let col = 0; col < 7; col++) {
    const column: Card[] = [];
    for (let row = 0; row <= col; row++) {
      const card = { ...deck[cardIndex] };
      card.faceUp = row === col;
      column.push(card);
      cardIndex++;
    }
    tableau.push(column);
  }

  const stock = deck.slice(cardIndex).map((c) => ({ ...c, faceUp: false }));

  return {
    stock,
    waste: [],
    foundations: [[], [], [], []],
    tableau,
    stockPasses: 0,
  };
}

export function canMoveToFoundation(
  card: Card,
  foundation: Card[],
  foundationIndex: number
): boolean {
  const expectedSuit = FOUNDATION_ORDER[foundationIndex];
  if (card.suit !== expectedSuit) return false;

  if (foundation.length === 0) {
    return card.rank === "A";
  }

  const topCard = foundation[foundation.length - 1];
  return getRankValue(card.rank) === getRankValue(topCard.rank) + 1;
}

export function canMoveToTableau(cards: Card[], targetColumn: Card[]): boolean {
  if (cards.length === 0) return false;

  const leadCard = cards[0];

  if (targetColumn.length === 0) {
    return leadCard.rank === "K";
  }

  const topCard = targetColumn[targetColumn.length - 1];
  if (!topCard.faceUp) return false;

  return (
    getColor(leadCard.suit) !== getColor(topCard.suit) &&
    getRankValue(leadCard.rank) === getRankValue(topCard.rank) - 1
  );
}

export function drawFromStock(state: GameState): GameState {
  if (state.stock.length > 0) {
    const newStock = [...state.stock];
    const card = { ...newStock.pop()!, faceUp: true };
    return {
      ...state,
      stock: newStock,
      waste: [...state.waste, card],
    };
  }

  if (state.waste.length > 0) {
    const newStock = [...state.waste]
      .reverse()
      .map((c) => ({ ...c, faceUp: false }));
    return {
      ...state,
      stock: newStock,
      waste: [],
      stockPasses: state.stockPasses + 1,
    };
  }

  return state;
}

function getCardsFromTarget(
  state: GameState,
  target: SelectableTarget
): Card[] {
  switch (target.type) {
    case "waste":
      return state.waste.length > 0
        ? [state.waste[state.waste.length - 1]]
        : [];
    case "foundation": {
      const foundation = state.foundations[target.index];
      return foundation.length > 0
        ? [foundation[foundation.length - 1]]
        : [];
    }
    case "tableau": {
      const column = state.tableau[target.column];
      return column.slice(target.cardIndex);
    }
    default:
      return [];
  }
}

export function canPickUp(state: GameState, target: SelectableTarget): boolean {
  switch (target.type) {
    case "stock":
    case "tableau-empty":
      return false;

    case "waste":
      return state.waste.length > 0;

    case "foundation":
      return state.foundations[target.index].length > 0;

    case "tableau": {
      const column = state.tableau[target.column];
      if (target.cardIndex < 0 || target.cardIndex >= column.length)
        return false;

      const card = column[target.cardIndex];
      if (!card.faceUp) return false;

      const run = column.slice(target.cardIndex);
      for (let i = 1; i < run.length; i++) {
        const prev = run[i - 1];
        const curr = run[i];
        if (
          !curr.faceUp ||
          getColor(curr.suit) === getColor(prev.suit) ||
          getRankValue(curr.rank) !== getRankValue(prev.rank) - 1
        ) {
          return false;
        }
      }
      return true;
    }
  }
}

export function getHeldCards(
  state: GameState,
  target: SelectableTarget
): Card[] {
  return getCardsFromTarget(state, target);
}

export function moveCards(
  state: GameState,
  from: SelectableTarget,
  to: SelectableTarget
): GameState | null {
  const cards = getCardsFromTarget(state, from);
  if (cards.length === 0) return null;

  let newState = { ...state };

  // Validate and apply the move to the destination
  if (to.type === "foundation") {
    if (cards.length !== 1) return null;
    if (!canMoveToFoundation(cards[0], state.foundations[to.index], to.index))
      return null;

    const newFoundations = state.foundations.map((f) => [...f]);
    newFoundations[to.index] = [...newFoundations[to.index], cards[0]];
    newState = { ...newState, foundations: newFoundations };
  } else if (to.type === "tableau" || to.type === "tableau-empty") {
    const targetCol = to.type === "tableau" ? to.column : to.column;
    if (!canMoveToTableau(cards, state.tableau[targetCol])) return null;

    const newTableau = state.tableau.map((col) => [...col]);
    newTableau[targetCol] = [...newTableau[targetCol], ...cards];
    newState = { ...newState, tableau: newTableau };
  } else {
    return null;
  }

  // Remove cards from source
  if (from.type === "waste") {
    newState = { ...newState, waste: state.waste.slice(0, -1) };
  } else if (from.type === "foundation") {
    const newFoundations = (newState.foundations ?? state.foundations).map(
      (f) => [...f]
    );
    newFoundations[from.index] = state.foundations[from.index].slice(0, -1);
    newState = { ...newState, foundations: newFoundations };
  } else if (from.type === "tableau") {
    const newTableau = (newState.tableau ?? state.tableau).map((col) => [
      ...col,
    ]);
    newTableau[from.column] = state.tableau[from.column].slice(
      0,
      from.cardIndex
    );

    // Flip the newly exposed card
    const col = newTableau[from.column];
    if (col.length > 0 && !col[col.length - 1].faceUp) {
      col[col.length - 1] = { ...col[col.length - 1], faceUp: true };
    }

    newState = { ...newState, tableau: newTableau };
  }

  return newState;
}

export function getValidDropTargets(
  state: GameState,
  heldCards: Card[],
  heldFrom: SelectableTarget
): SelectableTarget[] {
  const targets: SelectableTarget[] = [];

  if (heldCards.length === 0) return targets;

  const leadCard = heldCards[0];

  // Check foundations (only for single cards)
  if (heldCards.length === 1) {
    for (let i = 0; i < 4; i++) {
      const target: SelectableTarget = { type: "foundation", index: i };
      if (
        !isSameTarget(heldFrom, target) &&
        canMoveToFoundation(leadCard, state.foundations[i], i)
      ) {
        targets.push(target);
      }
    }
  }

  // Check tableau columns
  for (let col = 0; col < 7; col++) {
    const column = state.tableau[col];

    if (column.length === 0) {
      if (leadCard.rank === "K") {
        const target: SelectableTarget = { type: "tableau-empty", column: col };
        if (!isSameTarget(heldFrom, target)) {
          targets.push(target);
        }
      }
    } else {
      const topCard = column[column.length - 1];
      if (
        topCard.faceUp &&
        getColor(leadCard.suit) !== getColor(topCard.suit) &&
        getRankValue(leadCard.rank) === getRankValue(topCard.rank) - 1
      ) {
        const target: SelectableTarget = {
          type: "tableau",
          column: col,
          cardIndex: column.length - 1,
        };
        if (!isFromSameColumn(heldFrom, col)) {
          targets.push(target);
        }
      }
    }
  }

  return targets;
}

function isSameTarget(a: SelectableTarget, b: SelectableTarget): boolean {
  if (a.type !== b.type) return false;
  if (a.type === "foundation" && b.type === "foundation")
    return a.index === b.index;
  if (a.type === "tableau-empty" && b.type === "tableau-empty")
    return a.column === b.column;
  return a.type === b.type && a.type !== "tableau" && a.type !== "stock";
}

function isFromSameColumn(from: SelectableTarget, col: number): boolean {
  return (
    (from.type === "tableau" && from.column === col) ||
    (from.type === "tableau-empty" && from.column === col)
  );
}

export function checkWin(state: GameState): boolean {
  return state.foundations.every((f) => f.length === 13);
}

export function hasAvailableMoves(state: GameState): boolean {
  // Can draw from stock or recycle waste
  if (state.stock.length > 0 || state.waste.length > 0) {
    // If stock has cards, there's always the draw action
    if (state.stock.length > 0) return true;

    // Waste can be recycled if stock is empty
    if (state.waste.length > 0 && state.stock.length === 0) return true;
  }

  // Check if waste top can go anywhere
  if (state.waste.length > 0) {
    const wasteTop = state.waste[state.waste.length - 1];

    for (let i = 0; i < 4; i++) {
      if (canMoveToFoundation(wasteTop, state.foundations[i], i)) return true;
    }

    for (let col = 0; col < 7; col++) {
      if (canMoveToTableau([wasteTop], state.tableau[col])) return true;
    }
  }

  // Check tableau moves
  for (let col = 0; col < 7; col++) {
    const column = state.tableau[col];

    for (let cardIdx = 0; cardIdx < column.length; cardIdx++) {
      const card = column[cardIdx];
      if (!card.faceUp) continue;

      const run = column.slice(cardIdx);

      // Verify it's a valid run
      let validRun = true;
      for (let i = 1; i < run.length; i++) {
        if (
          !run[i].faceUp ||
          getColor(run[i].suit) === getColor(run[i - 1].suit) ||
          getRankValue(run[i].rank) !== getRankValue(run[i - 1].rank) - 1
        ) {
          validRun = false;
          break;
        }
      }
      if (!validRun) continue;

      // Check foundation for single card (bottom of run)
      const bottomCard = run[run.length - 1];
      for (let i = 0; i < 4; i++) {
        if (canMoveToFoundation(bottomCard, state.foundations[i], i))
          return true;
      }

      // Check tableau-to-tableau
      for (let targetCol = 0; targetCol < 7; targetCol++) {
        if (targetCol === col) continue;
        if (canMoveToTableau(run, state.tableau[targetCol])) {
          // Avoid pointless moves: moving a King from an otherwise empty column
          if (
            card.rank === "K" &&
            cardIdx === 0 &&
            state.tableau[targetCol].length === 0
          ) {
            continue;
          }
          return true;
        }
      }
    }
  }

  return false;
}

export function getFoundationIndexForSuit(suit: Suit): number {
  return FOUNDATION_ORDER.indexOf(suit);
}

/**
 * Finds a card that can be safely auto-moved to its foundation.
 * "Safe" means moving it can't hurt — no tableau card could need to stack under it.
 * Returns the first such card found, or null.
 */
export function findAutoMoveCard(
  state: GameState,
  options?: { skipWaste?: boolean; skipColumns?: number[] }
): {
  card: Card;
  from: SelectableTarget;
  foundationIndex: number;
} | null {
  const candidates: { card: Card; from: SelectableTarget }[] = [];

  // Waste top card
  if (!options?.skipWaste && state.waste.length > 0) {
    candidates.push({
      card: state.waste[state.waste.length - 1],
      from: { type: "waste" },
    });
  }

  // Bottom card of each tableau column
  const skipCols = options?.skipColumns ?? [];
  for (let col = 0; col < 7; col++) {
    if (skipCols.includes(col)) continue;
    const column = state.tableau[col];
    if (column.length > 0) {
      const bottomCard = column[column.length - 1];
      if (bottomCard.faceUp) {
        candidates.push({
          card: bottomCard,
          from: { type: "tableau", column: col, cardIndex: column.length - 1 },
        });
      }
    }
  }

  for (const { card, from } of candidates) {
    const foundationIndex = getFoundationIndexForSuit(card.suit);
    if (!canMoveToFoundation(card, state.foundations[foundationIndex], foundationIndex)) {
      continue;
    }

    if (isSafeToAutoMove(card, state)) {
      return { card, from, foundationIndex };
    }
  }

  return null;
}

function isSafeToAutoMove(card: Card, state: GameState): boolean {
  const rankVal = getRankValue(card.rank);

  // Aces, 2s, and 3s are always safe
  if (rankVal <= 3) return true;

  // A card is safe when both opposite-color foundations have at least rank-2.
  // This is slightly more aggressive than the strict rank-1 rule but avoids
  // the frustrating case where obvious moves are blocked.
  const cardColor = getColor(card.suit);
  const neededRank = rankVal - 2;

  for (let i = 0; i < 4; i++) {
    const foundationSuit = FOUNDATION_ORDER[i];
    if (getColor(foundationSuit) === cardColor) continue;

    const foundation = state.foundations[i];
    const topRank = foundation.length > 0
      ? getRankValue(foundation[foundation.length - 1].rank)
      : 0;

    if (topRank < neededRank) return false;
  }

  return true;
}

/**
 * Compares two game states and returns the cards that moved
 * and their source/destination targets. Used for undo animation.
 */
export function findStateDiff(
  oldState: GameState,
  newState: GameState
): { cards: Card[]; from: SelectableTarget; to: SelectableTarget } | null {
  // Check if a foundation gained cards
  for (let i = 0; i < 4; i++) {
    const oldLen = oldState.foundations[i].length;
    const newLen = newState.foundations[i].length;
    if (newLen > oldLen) {
      const cards = newState.foundations[i].slice(oldLen);
      const from = findCardSource(oldState, newState, cards[0]);
      return {
        cards,
        from: from ?? { type: "foundation", index: i },
        to: { type: "foundation", index: i },
      };
    }
  }

  // Check if a tableau column gained cards
  for (let col = 0; col < 7; col++) {
    const oldLen = oldState.tableau[col].length;
    const newLen = newState.tableau[col].length;
    if (newLen > oldLen) {
      const newCards = newState.tableau[col].slice(oldLen);
      if (newCards.length > 0) {
        const from = findCardSource(oldState, newState, newCards[0]);
        return {
          cards: newCards,
          from: from ?? { type: "tableau", column: col, cardIndex: oldLen },
          to: { type: "tableau", column: col, cardIndex: oldLen },
        };
      }
    }
  }

  // Check if waste gained a card (stock draw)
  if (
    newState.waste.length > oldState.waste.length &&
    newState.stock.length < oldState.stock.length
  ) {
    const card = newState.waste[newState.waste.length - 1];
    return {
      cards: [card],
      from: { type: "stock" },
      to: { type: "waste" },
    };
  }

  return null;
}

function findCardSource(
  oldState: GameState,
  newState: GameState,
  card: Card
): SelectableTarget | null {
  if (oldState.waste.length > newState.waste.length) {
    const oldTop = oldState.waste[oldState.waste.length - 1];
    if (oldTop.suit === card.suit && oldTop.rank === card.rank) {
      return { type: "waste" };
    }
  }

  for (let i = 0; i < 4; i++) {
    if (oldState.foundations[i].length > newState.foundations[i].length) {
      const oldTop =
        oldState.foundations[i][oldState.foundations[i].length - 1];
      if (oldTop.suit === card.suit && oldTop.rank === card.rank) {
        return { type: "foundation", index: i };
      }
    }
  }

  for (let col = 0; col < 7; col++) {
    if (oldState.tableau[col].length > newState.tableau[col].length) {
      const oldCol = oldState.tableau[col];
      for (let i = 0; i < oldCol.length; i++) {
        if (
          oldCol[i].faceUp &&
          oldCol[i].suit === card.suit &&
          oldCol[i].rank === card.rank
        ) {
          return { type: "tableau", column: col, cardIndex: i };
        }
      }
    }
  }

  return null;
}
