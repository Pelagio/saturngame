import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGameContext } from "../GameContext";
import { HowToPlay } from "./HowToPlay";
import { Leaderboard } from "../components/Leaderboard";
import { MatchFilter } from "../types/game";

const DECADES = [
  { label: "All Eras", value: undefined },
  { label: "50s-60s", value: 1950 },
  { label: "70s", value: 1970 },
  { label: "80s", value: 1980 },
  { label: "90s", value: 1990 },
  { label: "00s", value: 2000 },
  { label: "10s", value: 2010 },
];

export function Home() {
  const navigate = useNavigate();
  const { newGame, playerName } = useGameContext();
  const [showHowTo, setShowHowTo] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [selectedDecade, setSelectedDecade] = useState<number | undefined>();
  const [showModes, setShowModes] = useState(false);

  const dailyPlayed = localStorage.getItem(
    `saturn_daily_${new Date().toISOString().slice(0, 10)}`,
  );

  const startGame = async (filter?: MatchFilter, daily?: boolean) => {
    const gameId = await newGame({ filter, daily });
    navigate(`/game/${gameId}`);
  };

  return (
    <div className="Home">
      <p className="Home-subtitle">The music timeline game</p>

      {/* Main actions */}
      <button className="btn btn-primary" onClick={() => startGame()}>
        New Game
      </button>

      <button
        className="btn btn-primary Home-daily"
        onClick={() => {
          if (dailyPlayed) return;
          startGame(undefined, true);
        }}
        disabled={!!dailyPlayed}
      >
        {dailyPlayed ? "Daily Done" : "Daily Challenge"}
      </button>

      {/* Mode picker toggle */}
      <button
        className="btn btn-secondary"
        onClick={() => setShowModes(!showModes)}
      >
        {showModes ? "Hide Modes" : "Game Modes"}
      </button>

      {showModes && (
        <div className="Home-modes">
          {/* Decade filter */}
          <div className="Home-decades">
            {DECADES.map((d) => (
              <button
                key={d.label}
                className={`Home-decade-btn ${selectedDecade === d.value ? "selected" : ""}`}
                onClick={() => setSelectedDecade(d.value)}
              >
                {d.label}
              </button>
            ))}
          </div>

          <button
            className="btn btn-primary"
            onClick={() =>
              startGame(selectedDecade ? { decade: selectedDecade } : undefined)
            }
          >
            Start {selectedDecade ? `${selectedDecade}s` : "Classic"}
          </button>

          <button
            className="btn btn-secondary"
            onClick={() => startGame({ hardMode: true })}
          >
            Hard Mode
          </button>
        </div>
      )}

      <button
        className="btn btn-secondary"
        onClick={() => setShowLeaderboard(!showLeaderboard)}
      >
        {showLeaderboard ? "Hide Leaderboard" : "Leaderboard"}
      </button>

      {showLeaderboard && (
        <Leaderboard
          date={new Date().toISOString().slice(0, 10)}
          playerName={playerName}
        />
      )}

      <button className="btn btn-secondary" onClick={() => setShowHowTo(true)}>
        How to Play
      </button>

      {showHowTo && <HowToPlay onClose={() => setShowHowTo(false)} />}
    </div>
  );
}
