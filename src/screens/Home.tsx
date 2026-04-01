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

type Tab = "solo" | "party";

export function Home() {
  const navigate = useNavigate();
  const { newGame, playerName } = useGameContext();
  const [showHowTo, setShowHowTo] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [selectedDecade, setSelectedDecade] = useState<number | undefined>();
  const [showModes, setShowModes] = useState(false);
  const [tab, setTab] = useState<Tab>("solo");
  const [showJoin, setShowJoin] = useState(false);
  const [joinCode, setJoinCode] = useState("");

  const dailyPlayed = localStorage.getItem(
    `saturn_daily_${new Date().toISOString().slice(0, 10)}`,
  );

  const startGame = async (filter?: MatchFilter, daily?: boolean) => {
    const gameId = await newGame({ filter, daily });
    navigate(`/game/${gameId}`);
  };

  const startParty = async () => {
    const gameId = await newGame();
    window.open(`${window.location.origin}/tv/${gameId}`, "_blank");
    navigate(`/game/${gameId}`);
  };

  return (
    <div className="Home">
      <img src="/favicon.svg" alt="Saturn" className="Home-logo" />

      {/* Tab switcher */}
      <div className="Home-tabs">
        <button
          className={`Home-tab ${tab === "solo" ? "active" : ""}`}
          onClick={() => setTab("solo")}
        >
          Solo
        </button>
        <button
          className={`Home-tab ${tab === "party" ? "active" : ""}`}
          onClick={() => setTab("party")}
        >
          Party
        </button>
      </div>

      {tab === "solo" && (
        <div className="Home-section">
          <button className="btn btn-primary" onClick={() => startGame()}>
            Quick Play
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

          <button
            className="Home-link"
            onClick={() => setShowModes(!showModes)}
          >
            {showModes ? "Hide modes" : "Game modes"}
          </button>

          {showModes && (
            <div className="Home-modes">
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
                  startGame(
                    selectedDecade ? { decade: selectedDecade } : undefined,
                  )
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
        </div>
      )}

      {tab === "party" && (
        <div className="Home-section">
          <div className="Home-party-info">
            <h3>Host a game</h3>
            <ol>
              <li>Click "Start Party" below</li>
              <li>
                A TV display opens in a new tab — put it on the big screen
              </li>
              <li>Friends scan the QR code with their phones to join</li>
            </ol>
          </div>
          <button className="btn btn-primary" onClick={startParty}>
            Start Party
          </button>

          <div className="Home-divider">or</div>

          <button className="Home-link" onClick={() => setShowJoin(!showJoin)}>
            {showJoin ? "Cancel" : "Join a game"}
          </button>

          {showJoin && (
            <form
              className="Home-join"
              onSubmit={(e) => {
                e.preventDefault();
                const code = joinCode.trim();
                if (code) {
                  const gameId = code.includes("/game/")
                    ? code.split("/game/")[1]?.split("?")[0]
                    : code;
                  if (gameId) {
                    navigate(`/game/${gameId}?mode=controller`);
                  }
                }
              }}
            >
              <input
                className="NameEntry-input"
                type="text"
                placeholder="Paste game link or code"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value)}
                autoFocus
              />
              <button className="btn btn-primary" type="submit">
                Join
              </button>
            </form>
          )}
        </div>
      )}

      {/* Footer links */}
      <div className="Home-footer">
        <button
          className="Home-link"
          onClick={() => setShowLeaderboard(!showLeaderboard)}
        >
          {showLeaderboard ? "Hide leaderboard" : "Leaderboard"}
        </button>
        <span className="Home-footer-dot">&middot;</span>
        <button className="Home-link" onClick={() => setShowHowTo(true)}>
          How to play
        </button>
      </div>

      {showLeaderboard && (
        <Leaderboard
          date={new Date().toISOString().slice(0, 10)}
          playerName={playerName}
        />
      )}

      {showHowTo && <HowToPlay onClose={() => setShowHowTo(false)} />}
    </div>
  );
}
