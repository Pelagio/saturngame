import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useGameContext, RoundOutcome } from "../GameContext";
import { Lives } from "../components/Lives";
import { Leaderboard } from "../components/Leaderboard";
import { SimpleApi } from "../utils/simple-api/simple-api";

function buildShareText(
  roundHistory: RoundOutcome[],
  lives: number,
  correctCount: number,
  totalRounds: number,
  points: number,
  reason?: string,
  isDaily?: boolean,
): string {
  const grid = roundHistory
    .map((r) => (r === "correct" ? "\u{1F7E9}" : "\u{1F7E5}"))
    .join("");

  const livesStars = Array.from({ length: 3 }, (_, i) =>
    i < lives ? "\u{2B50}" : "\u{2716}\u{FE0F}",
  ).join("");

  const header = isDaily
    ? `SATURN DAILY \u2014 ${correctCount}/${totalRounds} ${livesStars}`
    : `SATURN \u2014 ${correctCount}/${totalRounds} ${livesStars}`;

  const lines = [
    header,
    grid,
    `${points} pts`,
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
  const {
    gameOver,
    playAgain,
    newGame,
    roundHistory,
    lives,
    playerName,
    playerAvatar,
    isDaily,
  } = useGameContext();
  const [copied, setCopied] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const correctCount = roundHistory.filter((r) => r === "correct").length;
  const totalRounds = roundHistory.length;

  // Find own points from the players list
  const myPlayer = gameOver?.players.find((p) => p.name === playerName);
  const points = myPlayer?.points ?? 0;
  const longestStreak = 0; // TODO: track in context

  // Auto-submit daily score
  useEffect(() => {
    if (!isDaily || submitted || !gameOver) return;

    const date = new Date().toISOString().slice(0, 10);
    const alreadySubmitted = localStorage.getItem(`saturn_daily_${date}`);
    if (alreadySubmitted) return;

    const api = new SimpleApi();
    api
      .submitDailyScore({
        date,
        playerName,
        avatar: playerAvatar,
        score: correctCount,
        points,
        correctCount,
        totalRounds,
        longestStreak,
      })
      .then(() => {
        localStorage.setItem(`saturn_daily_${date}`, "true");
        setSubmitted(true);
      })
      .catch(() => {});
  }, [
    isDaily,
    submitted,
    gameOver,
    playerName,
    playerAvatar,
    correctCount,
    totalRounds,
    points,
    longestStreak,
  ]);

  if (!gameOver) return null;

  const { winner, players, reason } = gameOver;
  const sorted = [...players]
    .filter((p) => !p.guest)
    .sort((a, b) => (b.points ?? b.score) - (a.points ?? a.score));

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
      points,
      reason,
      isDaily,
    );
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
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

      {/* Points display */}
      {points > 0 && (
        <p className="GameOver-points">{points} pts</p>
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

      {/* Multiplayer leaderboard */}
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
              <span className="GameOver-score">{p.points ?? p.score}</span>
            </div>
          ))}
        </div>
      )}

      {/* Daily leaderboard */}
      {isDaily && (
        <Leaderboard
          date={new Date().toISOString().slice(0, 10)}
          playerName={playerName}
        />
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
