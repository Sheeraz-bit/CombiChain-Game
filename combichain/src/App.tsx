import { useRef, useState } from "react";

import GameHeader from "./components/game/GameHeader";
import GameStats from "./components/game/GameStats";
import GameControls from "./components/game/GameControls";
import GameBoard from "./components/game/GameBoard";

import "./App.css";

function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [score] = useState(0);
  const [activatedCount] = useState(0);
  const [phase] = useState("READY");

  const handleNewRound = () => {
    // Board generation will be connected in the next integration batch.
  };

  const handleTrigger = () => {
    // Reaction simulation will be connected in the next integration batch.
  };

  const handleHowToPlay = () => {
    window.alert(
      "Select a particle, drag to aim, and release to trigger a chain reaction."
    );
  };

  const handleSettings = () => {
    window.alert("Game settings will be available soon.");
  };

  return (
    <main className="app-shell">
      <GameHeader
        onHowToPlay={handleHowToPlay}
        onSettings={handleSettings}
      />

      <div className="game-content">
        <section className="welcome-section">
          <div>
            <span className="section-eyebrow">CHAIN REACTION PUZZLE</span>
            <h2>
              How far can your <span>chain</span> go?
            </h2>
            <p>
              One particle starts everything. Plan your direction,
              discover interactions, and create the ultimate chain reaction.
            </p>
          </div>

          <div className="round-badge">
            <span className="round-indicator" />
            ROUND 01
          </div>
        </section>

        <GameStats
          score={score}
          activatedCount={activatedCount}
          totalParticles={24}
        />

        <GameBoard
          canvasRef={canvasRef}
          phase={phase}
        />

        <GameControls
          onNewRound={handleNewRound}
          onTrigger={handleTrigger}
          canTrigger={false}
          isReacting={false}
        />

        <footer className="game-footer">
          <span>COMBICHAIN © 2026</span>
          <span>BUILT FOR THE LOVE OF LOGIC</span>
        </footer>
      </div>
    </main>
  );
}

export default App;