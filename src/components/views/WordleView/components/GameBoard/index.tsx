import { useCallback, useMemo } from 'react';

import { SelectableListOption, WINDOW_TYPE } from 'components';
import ViewOptions from 'components/views';
import {
  useEffectOnce,
  useKeyboardInput,
  useMenuHideWindow,
  useScrollHandler,
  useWindowContext,
} from 'hooks';
import styled from 'styled-components';

import { getKeyboardStyles, submitGuess } from '../../actions/guess';
import { WORDLE_OMITTED_KEYS } from '../../constants';
import { useGameStateContext } from '../../providers/GameStateProvider';
import { GuessResponse } from '../../types';
import GameBoardCell from './components/GameBoardCell';

const RootContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  color: white;
  padding: 16px 16px 2px;
`;

const RowContainer = styled.div`
  flex: 1;
  display: flex;
  justify-content: center;
`;

const ShowKeyboardButton = styled.div<{ isActive?: boolean }>`
  border-radius: 4px;
  text-align: center;
  padding: 8px;

  img {
    height: 32px;
    border: ${({ isActive = false }) => isActive && `2px solid dodgerblue`};
    padding: 2px;
    border-radius: 2px;
  }
`;

const GameBoard = () => {
  useMenuHideWindow(ViewOptions.wordle.id);
  const { showWindow, isWindowActive } = useWindowContext();
  const [{ activeRow, guesses, keyboardMap, guess }, dispatch] =
    useGameStateContext();

  const handleKeyboardChange = useCallback(
    (value: string) => {
      dispatch({ type: 'onKeyboardChange', value });
    },
    [dispatch]
  );

  const handleGuessResponse = useCallback(
    (response: GuessResponse) => {
      if (response.outcome === 'error') {
        showWindow({
          id: ViewOptions.wordleNotInListPopup.id,
          type: WINDOW_TYPE.POPUP,
          title: ViewOptions.wordleNotInListPopup.title,
          listOptions: [
            {
              type: 'Action',
              label: 'Ok',
              onSelect: () => {},
            },
          ],
        });

        dispatch({ type: 'onError', data: response });
        return;
      }

      dispatch({
        type: 'onCommitGuess',
        data: { ...response },
      });
    },
    [dispatch, showWindow]
  );

  const { showKeyboard, hideKeyboard, updateKeyboard } = useKeyboardInput({
    readOnly: false,
    hideOnEnter: false,
    headerTitle: 'Enter a word',
    clearOnEnter: true,
    omittedKeys: WORDLE_OMITTED_KEYS,
    onChange: handleKeyboardChange,
    onEnterPress: () => {
      const response: GuessResponse = submitGuess({
        guess,
        keyboardMap,
        numGuesses: activeRow,
      });

      const keyboardStyles = getKeyboardStyles(keyboardMap);

      handleGuessResponse(response);

      updateKeyboard({
        styledKeys: keyboardStyles,
      });
    },
  });

  const handleCenterClick = useCallback(() => {
    if (isWindowActive(ViewOptions.wordle.id)) {
      showKeyboard();
    }
  }, [isWindowActive, showKeyboard]);

  const options: SelectableListOption[] = useMemo(
    () => [
      {
        type: 'Action',
        label: 'Show keyboard',
        onSelect: handleCenterClick,
      },
    ],
    [handleCenterClick]
  );

  const [scrollIndex] = useScrollHandler(ViewOptions.wordle.id, options);

  useEffectOnce(() => {
    showKeyboard();

    return () => {
      hideKeyboard();
    };
  });

  return (
    <RootContainer>
      {guesses.map((row, rowIndex) => (
        <RowContainer key={`row-${rowIndex}`}>
          {row.map((cellGuess, cellIndex) => (
            <GameBoardCell
              key={`cell-${rowIndex}-${cellIndex}`}
              index={cellIndex}
              isActive={rowIndex === activeRow}
              initialValue={guess[cellIndex]}
              guess={cellGuess}
            />
          ))}
        </RowContainer>
      ))}
      <ShowKeyboardButton isActive={scrollIndex === 0}>
        <img alt="Show keyboard" src="keyboard_icon.svg" />
      </ShowKeyboardButton>
    </RootContainer>
  );
};

export default GameBoard;
