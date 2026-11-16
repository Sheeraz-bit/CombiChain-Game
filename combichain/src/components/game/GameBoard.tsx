
import { Crosshair } from "lucide-react";
import type { RefObject } from "react";

import type { GamePhase } from "../../game/types/game.types";

interface GameBoardProps {
  canvasRef: RefObject<HTMLCanvasElement | null>;
  phase: GamePhase;
}

export default function GameBoard({
  canvasRef,
  phase,
}: GameBoardProps) {
  return (
    <section className="board-section">
      <div className="board-heading">
        <div>
          <span className="section-eyebrow">PLAYGROUND</span>
          <h2>Reaction Arena</h2>
        </div>

        <div className="phase-indicator">
          <span className="phase-dot" />
          {phase}
        </div>
      </div>

      <div className="board-container">
        <canvas
          ref={canvasRef}
          className="game-canvas"
          aria-label="COMBICHAIN game arena"
        />

        {phase === "LOADING" && (
          <div className="board-overlay">
            <Crosshair size={20} />
            <p>Preparing reaction arena...</p>
            <span>Your particles will appear here.</span>
          </div>
        )}
      </div>

      <div className="board-footer">
        <span>24 PARTICLES</span>
        <span>6 PARTICLE TYPES</span>
        <span>ONE INITIAL TRIGGER</span>
      </div>
    </section>
  );
}
