import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import {
  clamp,
  createIndexArray,
  nextTileIndex,
  getId,
  resetTileIndex,
  shuffle,
  create2DArray,
} from '../utils/common';
import { DIRECTION_MAP } from '../utils/constants';
import { Vector } from '../utils/types';
import { GameStatus } from './useGameState';
import useLazyRef from './useLazyRef';

export interface Location {
  r: number;
  c: number;
}

export interface Tile extends Location {
  index: number; // self increment index
  id: string;
  isNew: boolean;
  isMerging: boolean;
  canMerge: boolean;
  value: number;
}

export type Cell = Tile | undefined;

export type GameBoardParams = {
  rows: number;
  cols: number;
  pause: boolean;
  gameStatus: GameStatus;
  setGameStatus: (nextStatus: GameStatus) => void;
  addScore: (score: number) => void;
};

const createNewTile = (r: number, c: number): Tile => {
  const index = nextTileIndex();
  const id = getId(index);
  return {
    index,
    id,
    r,
    c,
    isNew: true,
    canMerge: false,
    isMerging: false,
    value: Math.random() > 0.99 ? 4 : 2,
  };
};

const getEmptyCellsLocation = (grid: Cell[][]) =>
  grid.flatMap((row, r) =>
    row.flatMap<Location>((cell, c) => (cell == null ? { r, c } : [])),
  );

const createNewTilesInEmptyCells = (
  emptyCells: Location[],
  tilesNumber: number,
) => {
  const actualTilesNumber =
    emptyCells.length < tilesNumber ? emptyCells.length : tilesNumber;

  if (!actualTilesNumber) return [];

  return shuffle(emptyCells)
    .slice(0, actualTilesNumber)
    .map(({ r, c }) => createNewTile(r, c));
};

const createTraversalMap = (rows: number, cols: number, dir: Vector) => {
  const rowsMap = createIndexArray(rows);
  const colsMap = createIndexArray(cols);
  return {
    // Always start from the last cell in the moving direction
    rows: dir.r > 0 ? rowsMap.reverse() : rowsMap,
    cols: dir.c > 0 ? colsMap.reverse() : colsMap,
  };
};

const sortTiles = (tiles: Tile[]) =>
  tiles.sort((t1, t2) => t1.index - t2.index);

const isWin = (tiles: Tile[]) => tiles.some(({ value }) => value === 2048);

const canGameContinue = (grid: Cell[][], tiles: Tile[]) => {
  const totalRows = grid.length;
  const totalCols = grid[0].length;
  // We can always continue the game when there're empty cells,
  if (tiles.length < totalRows * totalCols) return true;

  const dirs = [
    DIRECTION_MAP.Left,
    DIRECTION_MAP.Right,
    DIRECTION_MAP.Up,
    DIRECTION_MAP.Down,
  ];

  for (let ind = 0; ind < tiles.length; ind++) {
    const { r, c, value } = tiles[ind];
    for (let d = 0; d < dirs.length; d++) {
      const dir = dirs[d];
      const nextRow = clamp(r + dir.r, 0, totalRows - 1);
      const nextCol = clamp(c + dir.c, 0, totalCols - 1);

      if (nextRow !== r || nextCol !== c) {
        const tile = grid[nextRow][nextCol];
        if (tile == null || tile.value === value) return true;
      }
    }
  }
  return false;
};

const mergeAndCreateNewTiles = (grid: Cell[][]) => {
  const tiles: Tile[] = [];
  let score = 0;
  const rows = grid.length;
  const cols = grid[0].length;

  const newGrid = grid.map((row) =>
    row.map((tile) => {
      if (tile != null) {
        const { canMerge, value, index, ...rest } = tile;
        const newValue = canMerge ? 2 * value : value;
        const mergedTile = {
          ...rest,
          index,
          value: newValue,
          isMerging: canMerge,
          canMerge: false,
          isNew: false,
        };

        tiles.push(mergedTile);

        if (canMerge) {
          score += newValue;
        }

        return mergedTile;
      }

      return tile;
    }),
  );

  const emptyCells = getEmptyCellsLocation(newGrid);
  const newTiles = createNewTilesInEmptyCells(
    emptyCells,
    Math.ceil((rows * cols) / 16),
  );
  newTiles.forEach((tile) => {
    newGrid[tile.r][tile.c] = tile;
    tiles.push(tile);
  });

  return {
    grid: newGrid,
    tiles,
    score,
  };
};

const moveInDirection = (grid: Cell[][], dir: Vector) => {
  const newGrid = grid.slice(0);
  const totalRows = newGrid.length;
  const totalCols = newGrid[0].length;
  const tiles: Tile[] = [];
  const moveStack: number[] = [];

  const traversal = createTraversalMap(totalRows, totalCols, dir);
  traversal.rows.forEach((row) => {
    traversal.cols.forEach((col) => {
      const tile = newGrid[row][col];
      if (tile != null) {
        const pos = {
          currRow: row,
          currCol: col,
          // clamp to ensure next row and col are still in the grid
          nextRow: clamp(row + dir.r, 0, totalRows - 1),
          nextCol: clamp(col + dir.c, 0, totalCols - 1),
        };

        while (pos.nextRow !== pos.currRow || pos.nextCol !== pos.currCol) {
          const { nextRow, nextCol } = pos;
          const nextTile = newGrid[nextRow][nextCol];
          if (nextTile != null) {
            // Move to the next cell if the tile inside has the same value and not been merged
            if (nextTile.value === tile.value && !nextTile.canMerge) {
              pos.currRow = nextRow;
              pos.currCol = nextCol;
            }
            break;
          }
          // We keep moving to the next cell until the cell contains a tile
          pos.currRow = nextRow;
          pos.currCol = nextCol;
          pos.nextRow = clamp(nextRow + dir.r, 0, totalRows - 1);
          pos.nextCol = clamp(nextCol + dir.c, 0, totalCols - 1);
        }

        const { currRow, currCol } = pos;
        const currentTile = newGrid[currRow][currCol];
        // If the tile has been moved
        if (currRow !== row || currCol !== col) {
          const updatedTile = {
            ...tile,
            r: currRow,
            c: currCol,
            canMerge: tile.value === currentTile?.value,
            isNew: false,
            isMerging: false,
          };
          newGrid[currRow][currCol] = updatedTile;
          newGrid[row][col] = undefined;
          tiles.push(updatedTile);
          moveStack.push(updatedTile.index);
        } else if (currentTile != null) {
          tiles.push({ ...currentTile, isNew: false, isMerging: false });
        }
      }
    });
  });

  return {
    tiles,
    grid: newGrid,
    moveStack,
  };
};

const resetGameBoard = (rows: number, cols: number) => {
  // Index restarts from 0 on reset
  resetTileIndex();
  const grid = create2DArray<Cell>(rows, cols);
  const emptyCells = getEmptyCellsLocation(grid);
  const newTiles = createNewTilesInEmptyCells(
    emptyCells,
    Math.ceil((rows * cols) / 8),
  );

  newTiles.forEach((tile) => {
    grid[tile.r][tile.c] = tile;
  });

  return {
    grid,
    tiles: newTiles,
  };
};

const useGameBoard = ({
  rows,
  cols,
  pause,
  gameStatus,
  setGameStatus,
  addScore,
}: GameBoardParams) => {
  const gridRef = useLazyRef(() => create2DArray<Cell>(rows, cols));
  const [tiles, setTiles] = useState<Tile[]>([]);
  const pendingStackRef = useRef<number[]>([]);
  const [moving, setMoving] = useState(false);
  const pauseRef = useRef(pause);

  const onMove = useCallback(
    (dir: Vector) => {
      if (pendingStackRef.current.length === 0 && !pauseRef.current) {
        const {
          tiles: newTiles,
          moveStack,
          grid,
        } = moveInDirection(gridRef.current, dir);
        gridRef.current = grid;
        pendingStackRef.current = moveStack;

        // Don't trigger upates if no movments
        if (moveStack.length > 0) {
          setMoving(true);
          // Sort by index to persist iteration order of tiles array
          // so that transform animation won't be interrupted by rerending
          // when id is not changed.
          setTiles(sortTiles(newTiles));
        }
      }
    },
    [gridRef],
  );

  const onMovePending = useCallback(() => {
    pendingStackRef.current.pop();
    if (pendingStackRef.current.length === 0) setMoving(false);
  }, []);

  useLayoutEffect(() => {
    if (!moving) {
      const {
        tiles: newTiles,
        score,
        grid,
      } = mergeAndCreateNewTiles(gridRef.current);
      gridRef.current = grid;

      addScore(score);
      setTiles(sortTiles(newTiles));
    }
  }, [moving, addScore, gridRef]);

  useLayoutEffect(() => {
    pauseRef.current = pause;
  }, [pause]);

  useEffect(() => {
    const { grid, tiles: newTiles } = resetGameBoard(rows, cols);
    gridRef.current = grid;
    setTiles(newTiles);
    setGameStatus('running');
  }, [rows, cols, setGameStatus, gridRef]);

  useEffect(() => {
    if (gameStatus === 'restart') {
      const r = gridRef.current.length;
      const c = gridRef.current[0].length;
      const { grid, tiles: newTiles } = resetGameBoard(r, c);

      gridRef.current = grid;
      setTiles(newTiles);
      setGameStatus('running');
    } else if (gameStatus === 'running' && isWin(tiles)) {
      setGameStatus('win');
    } else if (
      gameStatus !== 'lost' &&
      !canGameContinue(gridRef.current, tiles)
    ) {
      setGameStatus('lost');
    }
  }, [tiles, gameStatus, setGameStatus, gridRef]);

  return { tiles, onMove, onMovePending };
};

export default useGameBoard;
