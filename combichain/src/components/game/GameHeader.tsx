import { Zap, CircleHelp, Settings } from "lucide-react";

interface GameHeaderProps {
  onHowToPlay: () => void;
  onSettings: () => void;
}

export default function GameHeader({
  onHowToPlay,
  onSettings,
}: GameHeaderProps) {
  return (
    <header className="game-header">
      <div className="brand">
        <div className="brand-icon">
          <Zap size={22} fill="currentColor" />
        </div>

        <div className="brand-text">
          <h1>COMBI<span>CHAIN</span></h1>
          <p>ONE TRIGGER. INFINITE POSSIBILITIES.</p>
        </div>
      </div>

      <nav className="header-actions">
        <button
          className="icon-button"
          onClick={onHowToPlay}
          aria-label="How to play"
          title="How to play"
        >
          <CircleHelp size={19} />
        </button>

        <button
          className="icon-button"
          onClick={onSettings}
          aria-label="Settings"
          title="Settings"
        >
          <Settings size={19} />
        </button>
      </nav>
    </header>
  );
}