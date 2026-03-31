import { useState } from "react";
import { useParams } from "react-router-dom";
import { useGameContext } from "../GameContext";
import { useAudioContext } from "../AudioContext";
import { ScoreBar } from "../components/ScoreBar";
import { Timeline } from "../components/Timeline";
import { NameEntry } from "./NameEntry";

export function ControllerGame() {
  const { gameId } = useParams();
  const gameContext = useGameContext();
  const audioContext = useAudioContext();
  const [joined, setJoined] = useState(false);

  if (!gameId) return null;

  // Name entry
  if (!joined) {
    return (
      <div className="Controller">
        <h2 className="Controller-title">Join Game</h2>
        <NameEntry
          onSubmit={(name) => {
            audioContext.init();
            gameContext.joinGame(gameId, false, name);
            setJoined(true);
          }}
        />
      </div>
    );
  }

  // Waiting in lobby
  if (gameContext.phase === "lobby") {
    return (
      <div className="Controller">
        <div className="Controller-waiting">
          <h2>{gameContext.playerName}</h2>
          <p className="Controller-status">Waiting for game to start...</p>
          <div className="Controller-players">
            {gameContext.players
              .filter((p) => !p.guest)
              .map((p) => (
                <span key={p.id} className="Controller-player-badge">
                  {p.name}
                </span>
              ))}
          </div>
        </div>
      </div>
    );
  }

  // Round result — show brief feedback
  if (gameContext.phase === "round_result" && gameContext.roundResult) {
    const { song, results } = gameContext.roundResult;
    const myResult = results.find((r) => r.name === gameContext.playerName);

    return (
      <div className="Controller">
        <div
          className={`Controller-result ${myResult?.correct ? "correct" : "wrong"}`}
        >
          <span className="Controller-result-icon">
            {myResult?.correct ? "\u2713" : "\u2717"}
          </span>
          <p className="Controller-result-song">{song.name}</p>
          <p className="Controller-result-artist">
            {song.artist_name} ({song.year})
          </p>
        </div>
        <ScoreBar />
      </div>
    );
  }

  // Game over
  if (gameContext.phase === "game_over" && gameContext.gameOver) {
    const { winner } = gameContext.gameOver;
    const isWinner = winner?.name === gameContext.playerName;

    return (
      <div className="Controller">
        <div className="Controller-gameover">
          <h2>{isWinner ? "You won!" : "Game Over"}</h2>
          {winner && !isWinner && (
            <p className="Controller-status">{winner.name} wins</p>
          )}
          <ScoreBar />
        </div>
      </div>
    );
  }

  // Playing — show timeline + score
  return (
    <div className="Controller">
      <div className="Controller-header">
        <span className="Controller-name">{gameContext.playerName}</span>
        <ScoreBar />
      </div>
      <Timeline />
    </div>
  );
}
