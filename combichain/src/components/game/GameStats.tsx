import { Trophy, Target, Activity } from "lucide-react";

interface GameStatsProps {
  score: number;
  activatedCount: number;
  totalParticles: number;
}

export default function GameStats({
  score,
  activatedCount,
  totalParticles,
}: GameStatsProps) {
  const progress =
    totalParticles > 0 ? (activatedCount / totalParticles) * 100 : 0;

  return (
    <section className="game-stats">
      <div className="stat-card">
        <div className="stat-icon score-icon">
          <Trophy size={18} />
        </div>

        <div>
          <span className="stat-label">SCORE</span>
          <strong>{score.toLocaleString()}</strong>
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-icon activation-icon">
          <Target size={18} />
        </div>

        <div>
          <span className="stat-label">ACTIVATED</span>
          <strong>
            {activatedCount}
            <small> / {totalParticles}</small>
          </strong>
        </div>
      </div>

      <div className="stat-card progress-card">
        <div className="stat-icon progress-icon">
          <Activity size={18} />
        </div>

        <div className="progress-content">
          <span className="stat-label">CHAIN PROGRESS</span>
          <strong>{Math.round(progress)}%</strong>

          <div className="progress-track">
            <div
              className="progress-fill"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}