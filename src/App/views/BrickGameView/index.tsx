import React, { useEffect } from 'react';

import styled from 'styled-components';

import Game from './Game';

const Canvas = styled.canvas`
  background: rgb(2, 0, 36);
  background: linear-gradient(
    90deg,
    rgba(2, 0, 36, 1) 0%,
    rgba(107, 173, 255, 1) 0%,
    rgba(0, 212, 255, 1) 100%
  );
`;

const BrickGame = () => {
  useEffect(() => {
    Game.init();
  }, []);

  return (
    <Canvas width="800" height="500" id="brickBreakerCanvas">
      <p>Your browser does not support this feature</p>
    </Canvas>
  );
};

export default BrickGame;
