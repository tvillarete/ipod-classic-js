import { useEffect } from "react";

import { useMenuHideView } from "hooks";
import styled from "styled-components";

import viewConfigMap from "..";
import Game from "./Game";

const RootContainer = styled.div`
  height: 100%;
  background: rgb(2, 0, 36);
  background: linear-gradient(
    90deg,
    rgba(2, 0, 36, 1) 0%,
    rgba(107, 173, 255, 1) 0%,
    rgba(0, 212, 255, 1) 100%
  );
  overflow: clip;
`;

const Canvas = styled.canvas`
  height: 100%;
  width: 100%;
`;

const BrickGame = () => {
  useMenuHideView(viewConfigMap.brickGame.id);
  useEffect(() => {
    const game = new Game();
    game.init();
  }, []);

  return (
    <RootContainer>
      <Canvas width="800" height="500" id="brickBreakerCanvas">
        <p>Your browser does not support this feature</p>
      </Canvas>
    </RootContainer>
  );
};

export default BrickGame;
