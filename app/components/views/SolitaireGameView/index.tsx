import { useEffect, useRef, useState } from "react";

import { useViewContext } from "@/hooks";
import styled from "styled-components";

import Game from "./Game";

const RootContainer = styled.div`
  width: 100%;
  height: 100%;
  background: #35654d;
  overflow: clip;
`;

const Canvas = styled.canvas`
  display: block;
  image-rendering: crisp-edges;
  object-fit: fill;
`;

const SolitaireGame = () => {
  const { hideView } = useViewContext();
  const gameRef = useRef<Game | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  const dpr =
    typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1;

  useEffect(() => {
    if (!containerRef.current) return;

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;
    setDimensions({ width, height });
  }, []);

  useEffect(() => {
    if (
      dimensions.width === 0 ||
      dimensions.height === 0 ||
      !canvasRef.current
    ) {
      return;
    }

    const context = canvasRef.current.getContext("2d");
    if (!context) return;

    context.scale(dpr, dpr);

    const game = new Game(dimensions.width, dimensions.height, hideView);
    game.init();
    gameRef.current = game;

    return () => {
      game.cleanup();
      gameRef.current = null;
    };
  }, [dimensions, dpr, hideView]);

  return (
    <RootContainer ref={containerRef}>
      <Canvas
        ref={canvasRef}
        id="solitaireCanvas"
        width={dimensions.width * dpr}
        height={dimensions.height * dpr}
        style={{
          width: `${dimensions.width}px`,
          height: `${dimensions.height}px`,
        }}
      >
        <p>Your browser does not support this feature</p>
      </Canvas>
    </RootContainer>
  );
};

export default SolitaireGame;
