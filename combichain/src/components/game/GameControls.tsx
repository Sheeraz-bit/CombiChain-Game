import { RotateCcw, Play, MousePointer2 } from "lucide-react";

interface GameControlsProps {
  onNewRound: () => void;
  onTrigger: () => void;
  canTrigger: boolean;
  isReacting: boolean;
}

export default function GameControls({
  onNewRound,
  onTrigger,
  canTrigger,
  isReacting,
}: GameControlsProps) {
  return (
    <section className="game-controls">
      <div className="control-hint">
        <MousePointer2 size={16} />
        <span>
          Select a particle and drag to aim your initial pulse.
        </span>
      </div>

      <div className="control-actions">
        <button className="secondary-button" onClick={onNewRound}>
          <RotateCcw size={16} />
          New Round
        </button>

        <button
          className="primary-button"
          onClick={onTrigger}
          disabled={!canTrigger || isReacting}
        >
          <Play size={16} fill="currentColor" />
          {isReacting ? "Reacting..." : "Trigger Chain"}
        </button>
      </div>
    </section>
  );
}