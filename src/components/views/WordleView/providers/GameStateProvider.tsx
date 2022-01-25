import React, { useContext, useReducer } from 'react';

import { gameStateReducer, initialState } from '../reducers/gameStateReducer';

import type { State, Action } from '../reducers/gameStateReducer';

const GameStateContext = React.createContext<
  [State, React.Dispatch<Action>] | null
>(null);

type Props = {
  children: React.ReactNode;
};

const GameStateProvider = ({ children }: Props) => {
  const [state, dispatch] = useReducer(gameStateReducer, initialState);
  return (
    <GameStateContext.Provider value={[state, dispatch]}>
      {children}
    </GameStateContext.Provider>
  );
};

export const useGameStateContext = () => {
  const result = useContext(GameStateContext);
  if (result === null) {
    throw new Error(
      'useGameStateContext must be used within a GameStateProvider'
    );
  }
  return result;
};

export default GameStateProvider;
