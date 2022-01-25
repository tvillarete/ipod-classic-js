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
import styled, { css } from 'styled-components';

import { getKeyboardStyles, submitGuess } from '../../actions/guess';
import { WORDLE_OMITTED_KEYS } from '../../constants';
import { useGameStateContext } from '../../providers/GameStateProvider';
import { Guess, GuessResponse } from '../../types';

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

const CellContainer = styled.div<{ state: Guess['state']; isActive?: boolean }>`
  display: flex;
  justify-content: center;
  flex: 1;
  max-width: 40px;
  margin: 1px;
  border: 2px solid
    ${({ isActive = false }) => (isActive ? '#707074' : '#3a3a3c')};
  font-weight: bold;
  text-align: center;

  ${({ state }) => {
    let background = 'transparent';
    switch (state) {
      case 'correct':
        background = `#538d4e;`;
        break;
      case 'wrong':
        background = `#3a3a3c;`;
        break;
      case 'partial':
        background = ` #b59f3b;`;
        break;
      default:
        background = `transparent;`;
        break;
    }

    return css`
      background: ${background};
    `;
  }}
`;

const KeyboardButton = styled.div<{ isActive?: boolean }>`
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

const CellText = styled.p`
  margin: 0;
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

  const handleResult = useCallback(
    (result: GuessResponse) => {
      if (result.outcome === 'error') {
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

        dispatch({ type: 'onError', data: result });
        return;
      }

      dispatch({
        type: 'onCommitGuess',
        data: { ...result },
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
      console.log('Submitting');
      const result: GuessResponse = submitGuess({
        guess,
        keyboardMap,
        numGuesses: activeRow,
      });

      const keyboardStyles = getKeyboardStyles(keyboardMap);

      handleResult(result);

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
          {row.map((cell, cellIndex) => {
            const isActive = rowIndex === activeRow;
            const text = isActive ? guess[cellIndex] : cell.letter;

            return (
              <CellContainer
                isActive={isActive}
                state={cell.state}
                key={`cell-${cellIndex}`}
              >
                <CellText>{text?.toUpperCase()}</CellText>
              </CellContainer>
            );
          })}
        </RowContainer>
      ))}
      <KeyboardButton isActive={scrollIndex === 0}>
        <img alt="Show keyboard" src="keyboard_icon.svg" />
      </KeyboardButton>
    </RootContainer>
  );
};

export default GameBoard;
