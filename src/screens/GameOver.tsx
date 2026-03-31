import { useNavigate } from "react-router-dom";
import { useGameContext } from "../GameContext";

export function GameOver({ gameId }: { gameId: string }) {
  const navigate = useNavigate();
  const { gameOver, playAgain, newGame } = useGameContext();
  if (!gameOver) return null;

  const { winner, players } = gameOver;
  const sorted = [...players]
    .filter((p) => !p.guest)
    .sort((a, b) => b.score - a.score);

  const handlePlayAgain = async () => {
    playAgain();
    const newGameId = await newGame();
    navigate(`/game/${newGameId}`);
  };

  return (
    <div className="GameOver" aria-live="polite">
      {winner ? (
        <>
          <p className="GameOver-label">Winner</p>
          <h2 className="GameOver-winner">{winner.name}</h2>
        </>
      ) : (
        <h2>Game Over</h2>
      )}
      <div className="GameOver-leaderboard">
        {sorted.map((p, i) => (
          <div
            key={p.id}
            className={`GameOver-row ${p.id === winner?.id ? "winner" : ""}`}
          >
            <span className="GameOver-rank">#{i + 1}</span>
            <span className="GameOver-name">{p.name}</span>
            <span className="GameOver-score">{p.score}</span>
          </div>
        ))}
      </div>
      <button className="btn btn-primary" onClick={handlePlayAgain}>
        Play Again
      </button>
    </div>
  );
}
