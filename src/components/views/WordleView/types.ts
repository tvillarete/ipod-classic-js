type GuessState = 'correct' | 'partial' | 'wrong' | 'todo';
export type Guess = { letter: string; state: GuessState };
export type GuessResult = Guess[];

export type GuessResponse =
  | {
      outcome: 'correct';
      guessResult: Guess[];
      keyboardMap: Record<string, GuessState>;
    }
  | {
      outcome: 'wrong';
      guessResult: Guess[];
      keyboardMap: Record<string, GuessState>;
    }
  | {
      outcome: 'error';
      message: string;
    }
  | {
      outcome: 'gameOver';
      actualWord: string;
      guessResult: Guess[];
      keyboardMap: Record<string, GuessState>;
    };

export type GameState = 'correct' | 'wrong' | undefined;
