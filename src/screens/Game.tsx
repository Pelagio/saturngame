import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useGameContext } from "../GameContext";
import { useAudioContext } from "../AudioContext";
import { useSocketStatus } from "../utils/ws/ws";
import { MuteButton } from "../components/MuteButton";
import { Cover } from "../components/Cover";
import { ScoreBar } from "../components/ScoreBar";
import { Timeline } from "../components/Timeline";
import { RoundTimer } from "../components/RoundTimer";
import { Lives } from "../components/Lives";
import { NameEntry } from "./NameEntry";
import { EditProfile } from "./EditProfile";
import { Lobby } from "./Lobby";
import { RoundResult } from "./RoundResult";
import { GameOver } from "./GameOver";
import { ControllerGame } from "./ControllerGame";

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

export function Game() {
  const navigate = useNavigate();
  const { gameId } = useParams();
  const [searchParams] = useSearchParams();
  const isController = searchParams.get("mode") === "controller";

  const gameContext = useGameContext();
  const audioContext = useAudioContext();
  const socketStatus = useSocketStatus();
  const [joined, setJoined] = useState(false);
  const [editing, setEditing] = useState(false);
  const hasAutoJoined = useRef(false);

  // Auto-rejoin on page reload — only for full game mode, not controller
  useEffect(() => {
    if (
      !isController &&
      !hasAutoJoined.current &&
      socketStatus === "open" &&
      gameId &&
      gameContext.playerName
    ) {
      // Don't rejoin a game that already finished
      const finishedGames = JSON.parse(
        sessionStorage.getItem("saturn_finished_games") || "[]",
      );
      if (finishedGames.includes(gameId)) {
        navigate("/");
        return;
      }
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
  }, [isController, socketStatus, gameId, gameContext, audioContext, navigate]);

  if (!gameId) {
    navigate("/");
    return <></>;
  }

  // Controller mode — fully handled by ControllerGame
  if (isController) {
    return <ControllerGame />;
  }

  // --- Full game mode ---

  // Not joined yet
  if (!joined) {
    return (
      <div className="Game" style={{ justifyContent: "center" }}>
        <h2>Join Game</h2>
        <NameEntry
          onSubmit={(name, avatar) => {
            hasAutoJoined.current = true;
            audioContext.init();
            gameContext.joinGame(gameId, false, name, avatar);
            setJoined(true);
          }}
        />
        <button
          className="btn btn-secondary"
          onClick={() => {
            hasAutoJoined.current = true;
            audioContext.init();
            gameContext.joinGame(gameId, true, "Guest");
            setJoined(true);
          }}
        >
          Watch
        </button>
      </div>
    );
  }

  // Edit profile
  if (editing && gameId) {
    return (
      <div className="Game" style={{ justifyContent: "center" }}>
        <EditProfile gameId={gameId} onClose={() => setEditing(false)} />
      </div>
    );
  }

  // Lobby
  if (gameContext.phase === "lobby") {
    return (
      <div className="Game">
        <LeaveButton />
        <button className="ProfileButton" onClick={() => setEditing(true)}>
          {gameContext.playerAvatar && <span>{gameContext.playerAvatar}</span>}
          <span>{gameContext.playerName}</span>
          <span className="ProfileButton-hint">edit</span>
        </button>
        <Lobby gameId={gameId} />
      </div>
    );
  }

  // Round result
  if (gameContext.phase === "round_result") {
    return (
      <div className="Game" style={{ justifyContent: "center" }}>
        <RoundResult />
      </div>
    );
  }

  // Game over
  if (gameContext.phase === "game_over") {
    return (
      <div className="Game" style={{ justifyContent: "center" }}>
        <GameOver gameId={gameId} />
      </div>
    );
  }

  // Playing
  return (
    <div className="Game">
      <LeaveButton />
      <MuteButton />
      <div className="Game-hud">
        <Lives />
        <RoundTimer />
        <ScoreBar />
      </div>
      <Cover />
      <Timeline />
    </div>
  );
}
