import { INITIAL_GUESSES, LETTER_MAP } from '../constants';
import { GameState, GuessResponse } from '../types';

export const initialState = {
  activeRow: 0,
  guesses: INITIAL_GUESSES,
  keyboardMap: LETTER_MAP,
  actualWord: '',
  errorMessage: '',
  guess: '',
  gameState: undefined as GameState,
};
export type State = typeof initialState;

export type Action =
  | {
      type: 'onKeyboardChange';
      value: string;
    }
  | {
      type: 'onGameOver';
      data: GuessResponse & { outcome: 'gameOver' };
    }
  | {
      type: 'onError';
      data: GuessResponse & { outcome: 'error' };
    }
  | {
      type: 'onCommitGuess';
      data: GuessResponse & {
        outcome: 'correct' | 'wrong' | 'gameOver';
      };
    }
  | {
      type: 'dismissError';
    };

export const gameStateReducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'onKeyboardChange': {
      const { value } = action;

      return {
        ...state,
        guess: value,
      };
    }
    case 'onGameOver': {
      const { actualWord } = action.data;
      return {
        ...state,
        gameState: 'wrong',
        actualWord,
      };
    }
    case 'onError': {
      const { message } = action.data;
      return {
        ...state,
        errorMessage: message,
      };
    }
    case 'onCommitGuess': {
      const { outcome, guessResult, keyboardMap } = action.data;
      const outcomeToStateMap: Record<string, GameState> = {
        correct: 'correct',
        wrong: undefined,
        gameOver: 'wrong',
      };
      const updatedGameState = outcomeToStateMap[outcome];
      const updatedGuesses = state.guesses.map((existingGuess, idx) =>
        state.activeRow === idx ? guessResult : existingGuess
      );
      const actualWord =
        action.data.outcome === 'gameOver' ? action.data.actualWord : '';
      return {
        ...state,
        actualWord,
        activeRow: state.activeRow + 1,
        gameState: updatedGameState,
        guesses: updatedGuesses,
        keyboardMap,
        guess: '',
      };
    }
    case 'dismissError': {
      return {
        ...state,
        errorMessage: '',
      };
    }
  }
};
