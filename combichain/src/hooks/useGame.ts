
import { useCallback, useEffect, useRef, useState } from "react";

import { GameEngine } from "../game/engine/GameEngine";
import { InputManager } from "../game/input/InputManager";
import type { GamePhase } from "../game/types/game.types";

interface GameViewState {
  phase: GamePhase;
  score: number;
  activatedCount: number;
  selectedParticleId: string | null;
}

const INITIAL_STATE: GameViewState = {
  phase: "LOADING",
  score: 0,
  activatedCount: 0,
  selectedParticleId: null,
};

export function useGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<GameEngine | null>(null);
  const inputRef = useRef<InputManager | null>(null);

  const [gameState, setGameState] =
    useState<GameViewState>(INITIAL_STATE);

  const [round, setRound] = useState(1);

  const publishState = useCallback((engine: GameEngine) => {
    setGameState({
      phase: engine.getPhase(),
      score: engine.getScore(),
      activatedCount: engine.getActivatedCount(),
      selectedParticleId: engine.getSelectedParticleId(),
    });
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const engine = new GameEngine();
    const input = new InputManager();

    engineRef.current = engine;
    inputRef.current = input;

    engine.setCanvas(canvas);
    engine.initialize();
    input.attach(canvas, engine);

    publishState(engine);

    let animationFrameId = 0;
    let previousTime = 0;
    let stateUpdateAccumulator = 0;

    const animate = (timestamp: number) => {
      if (!previousTime) previousTime = timestamp;

      const deltaTime = Math.min(
        (timestamp - previousTime) / 1000,
        0.05
      );

      previousTime = timestamp;

      engine.update(deltaTime);
      engine.render();

      stateUpdateAccumulator += deltaTime;

      // React does not need to re-render on every animation frame.
      if (stateUpdateAccumulator >= 0.05) {
        publishState(engine);
        stateUpdateAccumulator = 0;
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationFrameId);
      input.detach();

      engineRef.current = null;
      inputRef.current = null;
    };
  }, [publishState]);

  const newRound = useCallback(() => {
    const engine = engineRef.current;
    if (!engine) return;

    engine.initialize();
    setRound((currentRound) => currentRound + 1);
    publishState(engine);
  }, [publishState]);

  const trigger = useCallback(() => {
    const engine = engineRef.current;
    if (!engine) return;

    engine.trigger();
    publishState(engine);
  }, [publishState]);

  return {
    canvasRef,
    phase: gameState.phase,
    score: gameState.score,
    activatedCount: gameState.activatedCount,
    selectedParticleId: gameState.selectedParticleId,
    round,
    canTrigger: gameState.phase === "AIMING",
    isReacting: gameState.phase === "REACTION",
    isFinished: gameState.phase === "RESULTS",
    newRound,
    trigger,
  };
}
