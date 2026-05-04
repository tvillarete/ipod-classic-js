import { useCallback, useEffect, useRef, useState } from "react";

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

  // Observe container size changes
  useEffect(() => {
    if (!containerRef.current) return;

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      const { width, height } = entry.contentRect;
      setDimensions((prev) => {
        if (prev.width === Math.floor(width) && prev.height === Math.floor(height)) {
          return prev;
        }
        return { width: Math.floor(width), height: Math.floor(height) };
      });
    });

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Initialize game once
  useEffect(() => {
    if (
      dimensions.width === 0 ||
      dimensions.height === 0 ||
      !canvasRef.current
    ) {
      return;
    }

    if (gameRef.current) return;

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
  }, [dimensions.width > 0 && dimensions.height > 0, dpr, hideView]);

  // Resize game when dimensions change (without re-creating)
  useEffect(() => {
    if (!gameRef.current || !canvasRef.current) return;
    if (dimensions.width === 0 || dimensions.height === 0) return;

    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) return;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    gameRef.current.resize(dimensions.width, dimensions.height);
  }, [dimensions, dpr]);

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
