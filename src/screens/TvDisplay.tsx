import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import QRCode from "react-qr-code";
import { useGameContext } from "../GameContext";
import { useAudioContext } from "../AudioContext";

const getOrigin = () =>
  typeof window !== "undefined" ? window.location.origin : "";

export function TvDisplay() {
  const { gameId } = useParams();
  const gameContext = useGameContext();
  const audioContext = useAudioContext();
  const [joined, setJoined] = useState(false);

  // Auto-join as guest on mount
  useEffect(() => {
    if (gameId && !joined) {
      audioContext.init();
      gameContext.joinGame(gameId, true, "TV Display");
      setJoined(true);
    }
  }, [gameId]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!gameId) return null;

  const joinURL = `${getOrigin()}/game/${gameId}?mode=controller`;
  const activePlayers = gameContext.players.filter((p) => !p.guest);

  // Lobby
  if (gameContext.phase === "lobby" || gameContext.phase === "idle") {
    return (
      <div className="Tv">
        <div className="Tv-lobby">
          <div className="Tv-qr-section">
            <QRCode value={joinURL} size={300} bgColor="transparent" fgColor="white" />
            <p className="Tv-join-label">Scan to join</p>
            <p className="Tv-join-url">{joinURL}</p>
          </div>
          <div className="Tv-player-section">
            <h2 className="Tv-heading">Players</h2>
            {activePlayers.length === 0 ? (
              <p className="Tv-waiting">Waiting for players...</p>
            ) : (
              <div className="Tv-player-list">
                {activePlayers.map((p) => (
                  <div key={p.id} className="Tv-player-card">
                    <span className="Tv-player-avatar">
                      {p.name.charAt(0).toUpperCase()}
                    </span>
                    <span className="Tv-player-name">{p.name}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Round result
  if (gameContext.phase === "round_result" && gameContext.roundResult) {
    const { song, results } = gameContext.roundResult;
    return (
      <div className="Tv">
        <div className="Tv-round-result">
          <img className="Tv-result-cover" src={song.image_url} alt={song.name} />
          <div className="Tv-result-info">
            <h2 className="Tv-result-title">{song.name}</h2>
            <p className="Tv-result-artist">{song.artist_name}</p>
            <p className="Tv-result-year">{song.year}</p>
          </div>
          <div className="Tv-result-players">
            {results.map((r) => (
              <div key={r.playerId} className={`Tv-result-row ${r.correct ? "correct" : "wrong"}`}>
                <span className="Tv-result-icon">{r.correct ? "\u2713" : "\u2717"}</span>
                <span className="Tv-result-name">{r.name}</span>
                <span className="Tv-result-score">{r.score}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Game over
  if (gameContext.phase === "game_over" && gameContext.gameOver) {
    const { winner } = gameContext.gameOver;
    const sorted = [...gameContext.players]
      .filter((p) => !p.guest)
      .sort((a, b) => b.score - a.score);

    return (
      <div className="Tv">
        <div className="Tv-game-over">
          {winner ? (
            <>
              <p className="Tv-game-over-label">Winner</p>
              <h2 className="Tv-game-over-winner">{winner.name}</h2>
            </>
          ) : (
            <h2 className="Tv-game-over-winner">Game Over</h2>
          )}
          <div className="Tv-leaderboard">
            {sorted.map((p, i) => (
              <div key={p.id} className={`Tv-leaderboard-row ${p.id === winner?.id ? "winner" : ""}`}>
                <span className="Tv-leaderboard-rank">#{i + 1}</span>
                <span className="Tv-leaderboard-name">{p.name}</span>
                <span className="Tv-leaderboard-score">{p.score}</span>
              </div>
            ))}
          </div>
          <div className="Tv-qr-small">
            <QRCode value={joinURL} size={150} bgColor="transparent" fgColor="white" />
            <p className="Tv-join-label">Scan for next game</p>
          </div>
        </div>
      </div>
    );
  }

  // Playing
  return (
    <div className="Tv">
      <div className="Tv-gameplay">
        <div
          key={gameContext.currentSong?.song_id}
          className="Tv-cover"
          style={{ backgroundImage: `url(${gameContext.currentSong?.image_url})` }}
        />
        <div className="Tv-scoreboard">
          <h3 className="Tv-scoreboard-title">Scoreboard</h3>
          {activePlayers.map((p) => (
            <div key={p.id} className="Tv-score-row">
              <span className="Tv-score-name">{p.name}</span>
              <span className="Tv-score-value">{p.score}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
