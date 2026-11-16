
import GameHeader from "./components/game/GameHeader";
import GameStats from "./components/game/GameStats";
import GameControls from "./components/game/GameControls";
import GameBoard from "./components/game/GameBoard";

import { useGame } from "./hooks/useGame";

import "./App.css";

function App() {
  const {
    canvasRef,
    phase,
    score,
    activatedCount,
    round,
    canTrigger,
    isReacting,
    newRound,
    trigger,
  } = useGame();

  const handleHowToPlay = () => {
    window.alert(
      "1. Select a particle.\n" +
      "2. Drag in the direction you want to aim.\n" +
      "3. Release to trigger the chain reaction.\n" +
      "4. Try to activate as many particles as possible!"
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
            <span className="section-eyebrow">
              CHAIN REACTION PUZZLE
            </span>

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
            ROUND {String(round).padStart(2, "0")}
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
          onNewRound={newRound}
          onTrigger={trigger}
          canTrigger={canTrigger}
          isReacting={isReacting}
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
