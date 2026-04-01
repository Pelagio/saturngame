import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGameContext, RoundOutcome } from "../GameContext";
import { Lives } from "../components/Lives";

function buildShareText(
  roundHistory: RoundOutcome[],
  lives: number,
  correctCount: number,
  totalRounds: number,
  reason?: string,
): string {
  const grid = roundHistory
    .map((r) => (r === "correct" ? "\u{1F7E9}" : "\u{1F7E5}"))
    .join("");

  const livesStars = Array.from({ length: 3 }, (_, i) =>
    i < lives ? "\u{2B50}" : "\u{2716}\u{FE0F}",
  ).join("");

  const lines = [
    `SATURN \u2014 ${correctCount}/${totalRounds} ${livesStars}`,
    grid,
    "",
    reason === "lives"
      ? "Ran out of lives! Can you do better?"
      : "Can you beat my score?",
    "saturngame.se",
  ];

  return lines.join("\n");
}

export function GameOver({ gameId }: { gameId: string }) {
  const navigate = useNavigate();
  const { gameOver, playAgain, newGame, roundHistory, lives } =
    useGameContext();
  const [copied, setCopied] = useState(false);

  if (!gameOver) return null;

  const { winner, players, reason } = gameOver;
  const sorted = [...players]
    .filter((p) => !p.guest)
    .sort((a, b) => b.score - a.score);

  const correctCount = roundHistory.filter((r) => r === "correct").length;
  const totalRounds = roundHistory.length;

  const handlePlayAgain = async () => {
    playAgain();
    const newGameId = await newGame();
    navigate(`/game/${newGameId}`);
  };

  const handleShare = async () => {
    const text = buildShareText(
      roundHistory,
      lives,
      correctCount,
      totalRounds,
      reason,
    );
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for browsers that don't support clipboard
    }
  };

  return (
    <div className="GameOver" aria-live="polite">
      {reason === "lives" ? (
        <>
          <p className="GameOver-label">Out of lives</p>
          <h2 className="GameOver-stats">
            {correctCount}/{totalRounds}
          </h2>
        </>
      ) : winner ? (
        <>
          <p className="GameOver-label">Winner</p>
          <h2 className="GameOver-winner">{winner.name}</h2>
        </>
      ) : (
        <h2 className="GameOver-stats">
          {correctCount}/{totalRounds}
        </h2>
      )}

      {/* Round history grid */}
      <div className="ShareCard">
        <div className="ShareCard-grid">
          {roundHistory.map((r, i) => (
            <span
              key={i}
              className={`ShareCard-dot ${r === "correct" ? "correct" : "wrong"}`}
            />
          ))}
        </div>
        <div className="ShareCard-stats">
          <Lives />
          <span className="ShareCard-accuracy">
            {totalRounds > 0
              ? Math.round((correctCount / totalRounds) * 100)
              : 0}
            % accuracy
          </span>
        </div>
      </div>

      {/* Leaderboard (multiplayer) */}
      {sorted.length > 1 && (
        <div className="GameOver-leaderboard">
          {sorted.map((p, i) => (
            <div
              key={p.id}
              className={`GameOver-row ${p.id === winner?.id ? "winner" : ""}`}
            >
              <span className="GameOver-rank">#{i + 1}</span>
              <span className="GameOver-name">
                {p.avatar && <span>{p.avatar} </span>}
                {p.name}
              </span>
              <span className="GameOver-score">{p.score}</span>
            </div>
          ))}
        </div>
      )}

      <div className="GameOver-actions">
        <button className="btn btn-primary" onClick={handlePlayAgain}>
          Play Again
        </button>
        <button className="btn btn-secondary" onClick={handleShare}>
          {copied ? "Copied!" : "Share"}
        </button>
      </div>
    </div>
  );
}
