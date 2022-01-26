import { Guess } from 'components/views/WordleView/types';
import styled, { css } from 'styled-components';

const CellCover = styled.div<{ isActive?: boolean; hasText?: boolean }>`
  background-color: #121213;
  text-transform: uppercase;
  border: ${({ isActive }) => `2px solid ${isActive ? '#707074' : '#3a3a3c'}`};
  transition: border 150ms ease-in;
  transition-delay: 2s;
  animation: ${({ hasText = false }) => hasText && 'PopIn 0.1s ease-in'};

  p {
    margin: 0;
  }

  @keyframes PopIn {
    from {
      transform: scale(0.8);
      opacity: 0;
    }

    40% {
      transform: scale(1.1);
      opacity: 1;
    }
  }
`;

const CellText = styled.p<{ state: Guess['state'] }>`
  margin: 0;
  line-height: 1.4;
  text-transform: uppercase;
  transform: rotateX(180deg);

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
        background = `transparent`;
        break;
    }

    return css`
      background: ${background};
    `;
  }}
`;

const CellContainer = styled.div`
  flex: 1;
  max-width: 40px;
  margin: 1px;
  perspective: 1000px;

  ${CellText}, ${CellCover} {
    position: absolute;
    width: 100%;
    height: 100%;
    -webkit-backface-visibility: hidden;
    backface-visibility: hidden;
  }
`;

const CellContent = styled.div<{ isFlipped?: boolean; index: number }>`
  position: relative;
  font-weight: bold;
  text-align: center;
  width: 100%;
  height: 100%;
  transition: transform 0.6s;
  transform-style: preserve-3d;
  transition-delay: ${({ index }) => `${0.35 * index}s`};

  ${CellText}, ${CellCover} {
    position: absolute;
    width: 100%;
    height: 100%;
    -webkit-backface-visibility: hidden;
    backface-visibility: hidden;
  }

  ${({ isFlipped }) => {
    if (isFlipped) {
      return css`
        transform: rotateX(180deg);

        ${CellContainer} {
          transform: rotateX(180deg);
        }
      `;
    }
  }};
`;

interface Props {
  index: number;
  guess: Guess;
  isActive: boolean;
  initialValue?: string;
}

const GameBoardCell = ({ index, guess, isActive, initialValue }: Props) => {
  const hasGuess = !!guess.letter;
  const coverText = isActive && !hasGuess ? initialValue : guess.letter;

  return (
    <CellContainer>
      <CellContent index={index} isFlipped={hasGuess}>
        <CellCover hasText={!!coverText} isActive={isActive}>
          {coverText}
        </CellCover>
        <CellText state={guess.state}>{guess.letter}</CellText>
      </CellContent>
    </CellContainer>
  );
};

export default GameBoardCell;
