import React, { useEffect } from "react";
import Game from "./Game";

const BrickGame = () => {
  useEffect(() => {
    Game.init();
  }, []);

  return (
    <canvas width="800" height="500" id="brickBreakerCanvas">
      <p>Your browser does not support this feature</p>
    </canvas>
  );
};

export default BrickGame;
