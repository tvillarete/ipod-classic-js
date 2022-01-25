import styled from 'styled-components';

import GameBoard from './components/GameBoard';
import GameStateProvider from './providers/GameStateProvider';

const RootContainer = styled.div`
  height: 100%;
  background-color: #121213;
`;

const WordleView = () => {
  return (
    <GameStateProvider>
      <RootContainer>
        <GameBoard />
      </RootContainer>
    </GameStateProvider>
  );
};

export default WordleView;
