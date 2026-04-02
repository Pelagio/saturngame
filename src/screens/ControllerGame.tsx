import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useGameContext } from "../GameContext";
import { useAudioContext } from "../AudioContext";
import { useSocketStatus } from "../utils/ws/ws";
import { ScoreBar } from "../components/ScoreBar";
import { Timeline } from "../components/Timeline";
import { RoundTimer } from "../components/RoundTimer";
import { Lives } from "../components/Lives";
import { NameEntry } from "./NameEntry";
import { EditProfile } from "./EditProfile";

function LeaveButton() {
  const navigate = useNavigate();
  const { playAgain } = useGameContext();
  const [confirming, setConfirming] = useState(false);

  if (confirming) {
    return (
      <div className="LeaveConfirm">
        <p>Leave this game?</p>
        <div className="LeaveConfirm-actions">
          <button
            className="btn btn-primary"
            onClick={() => {
              playAgain();
              navigate("/");
            }}
          >
            Leave
          </button>
          <button
            className="btn btn-secondary"
            onClick={() => setConfirming(false)}
          >
            Stay
          </button>
        </div>
      </div>
    );
  }

  return (
    <button
      className="LeaveButton"
      onClick={() => setConfirming(true)}
      aria-label="Leave game"
    >
      &larr;
    </button>
  );
}

export function ControllerGame() {
  const { gameId } = useParams();
  const navigate = useNavigate();
  const gameContext = useGameContext();
  const audioContext = useAudioContext();
  const socketStatus = useSocketStatus();
  const [joined, setJoined] = useState(false);
  const [editing, setEditing] = useState(false);
  const hasAutoJoined = useRef(false);

  // Mark as controller — no audio playback
  useEffect(() => {
    gameContext.setIsController(true);
    return () => gameContext.setIsController(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-rejoin on reload if player has a stored name
  useEffect(() => {
    if (
      !hasAutoJoined.current &&
      socketStatus === "open" &&
      gameId &&
      gameContext.playerName
    ) {
      hasAutoJoined.current = true;
      audioContext.init();
      gameContext.joinGame(
        gameId,
        false,
        gameContext.playerName,
        gameContext.playerAvatar,
      );
      setJoined(true);
    }
  }, [socketStatus, gameId, gameContext, audioContext]);

  if (!gameId) return null;

  // Name entry — only if not auto-joined
  if (!joined) {
    return (
      <div className="Controller" style={{ justifyContent: "center" }}>
        <h2 className="Controller-title">Join Game</h2>
        <NameEntry
          onSubmit={(name, avatar) => {
            hasAutoJoined.current = true;
            audioContext.init();
            gameContext.joinGame(gameId, false, name, avatar);
            setJoined(true);
          }}
        />
      </div>
    );
  }

  // Edit profile overlay
  if (editing) {
    return (
      <div className="Controller" style={{ justifyContent: "center" }}>
        <EditProfile gameId={gameId} onClose={() => setEditing(false)} />
      </div>
    );
  }

  // Tappable profile header
  const profileHeader = (
    <button className="Controller-profile" onClick={() => setEditing(true)}>
      {gameContext.playerAvatar && (
        <span className="Controller-avatar">{gameContext.playerAvatar}</span>
      )}
      <span className="Controller-name">{gameContext.playerName}</span>
      <span className="Controller-edit-hint">edit</span>
    </button>
  );

  // Waiting in lobby
  if (gameContext.phase === "lobby") {
    return (
      <div className="Controller">
        <div className="Controller-header">
          <LeaveButton />
          {profileHeader}
        </div>
        <div className="Controller-waiting">
          <p className="Controller-status">Waiting for game to start...</p>
          <div className="Controller-players">
            {gameContext.players
              .filter((p) => !p.guest)
              .map((p) => (
                <span key={p.id} className="Controller-player-badge">
                  {p.avatar && <span>{p.avatar}</span>} {p.name}
                </span>
              ))}
          </div>
        </div>
      </div>
    );
  }

  // Round result
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
          <button
            className="btn btn-primary"
            onClick={() => {
              gameContext.playAgain();
              navigate("/");
            }}
          >
            Home
          </button>
        </div>
      </div>
    );
  }

  // Playing
  return (
    <div className="Controller">
      <div className="Controller-hud">
        <LeaveButton />
        <Lives />
        <RoundTimer />
      </div>
      <Timeline />
    </div>
  );
}
