import { useReducer } from 'react';

export type GameStatus = 'win' | 'lost' | 'continue' | 'restart' | 'running';

export type GameState = {
  status: GameStatus;
  pause: boolean;
};

const gameStateReducer = (
  state: GameState,
  nextStatus: GameStatus,
): GameState => {
  switch (nextStatus) {
    case 'win':
    case 'lost':
      return { status: nextStatus, pause: true };
    case 'continue':
    case 'restart':
    case 'running':
      return { status: nextStatus, pause: false };
    default:
      return state;
  }
};

const useGameState = (
  initState: GameState,
): [GameState, (nextStatus: GameStatus) => void] =>
  useReducer(gameStateReducer, initState);

export default useGameState;
