import { useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useGameContext } from "../GameContext";
import { useAudioContext } from "../AudioContext";
import { MuteButton } from "../components/MuteButton";
import { Cover } from "../components/Cover";
import { ScoreBar } from "../components/ScoreBar";
import { Timeline } from "../components/Timeline";
import { NameEntry } from "./NameEntry";
import { Lobby } from "./Lobby";
import { RoundResult } from "./RoundResult";
import { GameOver } from "./GameOver";
import { ControllerGame } from "./ControllerGame";

export function Game() {
  const navigate = useNavigate();
  const { gameId } = useParams();
  const [searchParams] = useSearchParams();
  const isController = searchParams.get("mode") === "controller";

  const gameContext = useGameContext();
  const audioContext = useAudioContext();
  const [joined, setJoined] = useState(false);

  if (!gameId) {
    navigate("/");
    return <></>;
  }

  // Controller mode — lightweight phone UI
  if (isController) {
    return <ControllerGame />;
  }

  // --- Full game mode (desktop / standalone) ---

  // Not joined yet — show name entry
  if (!joined) {
    return (
      <div className="Game" style={{ justifyContent: "center" }}>
        <h2>Join Game</h2>
        <NameEntry
          onSubmit={(name) => {
            audioContext.init();
            gameContext.joinGame(gameId, false, name);
            setJoined(true);
          }}
        />
        <button
          className="btn btn-secondary"
          onClick={() => {
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

  // Lobby
  if (gameContext.phase === "lobby") {
    return (
      <div className="Game">
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
      <MuteButton />
      <Cover />
      <ScoreBar />
      <Timeline />
    </div>
  );
}
