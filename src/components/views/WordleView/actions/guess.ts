import seedrandom from 'seedrandom';
import { CSSObject } from 'styled-components';

import * as constants from '../constants';
import { Guess, GuessResponse, GuessResult } from '../types';

export const getRandomWord = () => {
  const todaysDate = new Date();
  todaysDate.setUTCHours(0, 0, 0, 0);
  const randomNumber = seedrandom(todaysDate.toUTCString());
  const randomWordIndex = Math.floor(randomNumber() * constants.WORDS.length);
  return constants.WORDS[randomWordIndex];
};

export const buildWordMap = (word: string) => {
  const result: Record<string, number[]> = {};
  for (let i = 0; i < word.split('').length; i++) {
    const letter = word[i];
    const existingValue = result[letter];
    result[letter] = existingValue ? [...existingValue, i] : [i];
  }
  return result;
};

export const processGuess = (
  guess: string,
  actualWord: string,
  keyboardMap: Record<string, Guess['state']>
) => {
  // Create a map of the letters in the word, and where they appear
  const actualWordMap = buildWordMap(actualWord);

  // Create a map of the letters in the guess, and where they appear
  const guessWordMap = buildWordMap(guess);

  const letters = guess.split('');
  const guessResult: GuessResult = [];
  for (let i = 0; i < letters.length; i++) {
    const guessLetter = letters[i];
    const actualLetter = actualWord[i];

    if (guessLetter === actualLetter) {
      guessResult.push({ letter: guessLetter, state: 'correct' });
      keyboardMap[guessLetter] = 'correct';
      continue;
    }

    // Get the positions of the current letter in both the guess and actual words
    const guessPositions = guessWordMap[guessLetter];
    const actualPositions = actualWordMap[guessLetter] ?? [];

    // Get the diffs of the positions for this letter to remove any exact matches between the words.
    // This will leave only positions that could be partial matches.
    const guessPositionsWithNoMatch = guessPositions.filter(
      (idx) => !actualPositions.includes(idx)
    );
    const actualPositionsWithNoMatch = actualPositions.filter(
      (idx) => !guessPositions.includes(idx)
    );

    // To check if a guess is a partial match, we need to make sure that there is an the actual position
    // that can serve as a partial match. To avoid the possibility of over-counting partial matches, we'll
    // only count the first N occurrences of a partial match. N is the length of the list of positions, without
    // an exact match, within the actual word
    if (
      guessPositionsWithNoMatch.indexOf(i) < actualPositionsWithNoMatch.length
    ) {
      guessResult.push({ letter: guessLetter, state: 'partial' });
      if (keyboardMap[guessLetter] !== 'correct') {
        keyboardMap[guessLetter] = 'partial';
      }
      continue;
    }

    // If there is no exact or partial match, we can mark this guess as being wrong
    guessResult.push({ letter: guessLetter, state: 'wrong' });
    if (keyboardMap[guessLetter] === 'todo') {
      keyboardMap[guessLetter] = 'wrong';
    }
  }

  return { guessResult, updatedKeyboardMap: keyboardMap };
};

interface GuessSubmission {
  guess: string;
  keyboardMap: Record<string, Guess['state']>;
  numGuesses: number;
}

export const submitGuess = ({
  guess,
  keyboardMap,
  numGuesses,
}: GuessSubmission): GuessResponse => {
  if (guess.length < constants.WORD_LENGTH) {
    return {
      outcome: 'error',
      message: 'Not enough letters',
    };
  }

  // Check if the guess is a known word
  if (!constants.ALL_WORDS.includes(guess)) {
    return {
      outcome: 'error',
      message: 'Not in word list',
    };
  }

  const actualWord = getRandomWord();
  const { guessResult, updatedKeyboardMap } = processGuess(
    guess,
    actualWord,
    keyboardMap
  );

  if (guess === actualWord) {
    return {
      outcome: 'correct',
      guessResult,
      keyboardMap: updatedKeyboardMap,
    };
  }

  if (Number(numGuesses) === constants.MAX_GUESSES - 1) {
    return {
      outcome: 'gameOver',
      actualWord,
      guessResult,
      keyboardMap: updatedKeyboardMap,
    };
  }

  return {
    outcome: 'wrong',
    guessResult,
    keyboardMap: updatedKeyboardMap,
  };
};

export const getKeyboardStyles = (
  keyboardMap: GuessSubmission['keyboardMap']
) => {
  const keyboardStyles: Record<string, CSSObject> = {};

  Object.keys(keyboardMap).forEach((letter) => {
    const state = keyboardMap[letter];

    switch (state) {
      case 'correct':
        keyboardStyles[letter] = { color: '#538d4e' };
        break;
      case 'wrong':
        keyboardStyles[letter] = { color: '#3a3a3c' };
        break;
      case 'partial':
        keyboardStyles[letter] = { color: '#b59f3b' };
        break;
    }
  });

  return keyboardStyles;
};
