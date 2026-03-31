import React, { MutableRefObject, useEffect, useState } from "react";
import QRCode from "react-qr-code";
import { Route, Routes, useNavigate, useParams } from "react-router-dom";
import "./App.css";

import { AudioProvider, useAudioContext } from "./AudioContext";
import { GameProvider, useGameContext } from "./GameContext";
import { SocketProvider } from "./utils/ws/ws";
import { Song } from "./types/game";

const getOrigin = () =>
  typeof window !== "undefined"
    ? window.location.origin || document.location.origin
    : "";

// --- Shared components ---

function Segment({
  onClick,
  index,
  lastIndex,
  selected,
}: {
  onClick: (index: number) => void;
  index: number;
  lastIndex: number;
  selected: boolean;
}) {
  return (
    <div
      className="Segment"
      onClick={() => onClick(index)}
      style={selected ? { backgroundColor: "goldenrod" } : {}}
    >
      {index === 0 ? "BEFORE" : index !== lastIndex ? "<--->" : "AFTER"}
    </div>
  );
}

function SongPin({ song }: { song: Partial<Song> }) {
  return (
    <div className="SongPin">
      <span>{song.year}</span>
      <div className="SongPin-inner" />
    </div>
  );
}

function SoundOffIcon() {
  return (
    <svg width="30px" height="30px" viewBox="0 0 384 384" xmlns="http://www.w3.org/2000/svg">
      <g stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
        <g transform="translate(-2196.000000, -9584.000000)" fill="#fff">
          <g transform="translate(2196.000000, 9584.000000)">
            <g>
              <path d="M341.5,192 C341.5,214.717 336.617,236.362 327.897,255.855 L359.777,287.735 C375.283,259.33 384,226.653 384,192 C384,98.744 320,19.746 235,0 L235,44.978 C297,63.632 341.5,122.882 341.5,192 L341.5,192 Z" />
              <polygon points="192 16.458 140.979 68.938 192 119.957" />
              <path d="M356.842,332.885 L27.116,3.157 L3.116,27.157 L93.615,117.57 L85.335,128 L0,128 L0,256 L85.334,256 L192,367.543 L192,216 L286.915,310.686 C271.795,323.443 254,333.213 235,339.022 L235,384 C266,376.828 293.996,361.837 317.315,341.191 L356.925,380.884 L380.925,356.841 L356.923,332.802 L356.842,332.885 L356.842,332.885 Z" />
              <path d="M288.188,192 C288.188,153.601 267,119.593 235,103.137 L235,162.957 L285.801,213.758 C287.355,206.739 288.188,199.454 288.188,192 L288.188,192 Z" />
            </g>
          </g>
        </g>
      </g>
    </svg>
  );
}

function SoundOnIcon() {
  return (
    <svg width="30px" height="30px" viewBox="0 0 384 384">
      <g stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
        <g transform="translate(-3096.000000, -9584.000000)" fill="#fff">
          <g transform="translate(3096.000000, 9584.000000)">
            <path d="M0,128 L0,256 L85.334,256 L192,367.543 L192,16.458 L85.334,128 L0,128 L0,128 Z M288,192 C288,153.601 266.667,119.593 234.667,103.137 L234.667,279.773 C266.667,264.408 288,230.4 288,192 L288,192 Z M234.667,0 L234.667,44.978 C296.531,63.632 341.334,122.882 341.334,192 C341.334,261.119 296.531,320.369 234.667,339.022 L234.667,384 C320,364.254 384,285.257 384,192 C384,98.744 320,19.746 234.667,0 L234.667,0 Z" />
          </g>
        </g>
      </g>
    </svg>
  );
}

function MuteButton() {
  const { setVolume, volume } = useAudioContext();
  return (
    <div onClick={() => setVolume(volume === 0 ? 0.5 : 0)} className="MuteButton">
      {volume === 0 ? <SoundOffIcon /> : <SoundOnIcon />}
    </div>
  );
}

function Cover() {
  const { currentSong } = useAudioContext();
  return (
    <div
      key={currentSong?.song_id}
      className="Cover"
      style={{ backgroundImage: `url(${currentSong?.image_url})` }}
    />
  );
}

// --- Timeline components ---

function Timeline() {
  const { gameId } = useParams();
  const { lockAnswer, correctAnswers: years = [] } = useGameContext();
  const [selectedSegment, setSelectedSegment] = useState<number>();
  const { currentSong } = useGameContext();

  const onSegmentPress = (segmentIndex: number) => {
    lockAnswer(gameId || "", segmentIndex);
    setSelectedSegment(segmentIndex);
  };

  useEffect(() => {
    setSelectedSegment(undefined);
  }, [currentSong]);

  if (!currentSong) return null;

  return (
    <div className="Timeline">
      <Segment onClick={onSegmentPress} index={0} lastIndex={years.length} selected={selectedSegment === 0} />
      {years.map((y, index) => (
        <React.Fragment key={y.song_id}>
          <SongPin song={y} />
          <Segment
            onClick={onSegmentPress}
            index={index + 1}
            lastIndex={years.length}
            selected={!!(selectedSegment && index === selectedSegment - 1)}
          />
        </React.Fragment>
      ))}
    </div>
  );
}

function MobileTimeline() {
  const { gameId } = useParams();
  const timeline: MutableRefObject<HTMLDivElement | null> = React.useRef(null);
  const { lockAnswer, correctAnswers: years = [], currentSong } = useGameContext();

  if (!currentSong) return null;

  return (
    <div className="Timeline">
      <div className="Timeline-Cursor">
        <h2>AFTER:</h2>
        <div style={{ width: "100%", height: "2px", backgroundColor: "white" }} />
        <h2>BEFORE:</h2>
      </div>
      <div
        className="Timeline-LockButton"
        onClick={() => {
          const scrollTop = timeline.current?.scrollTop ?? 0;
          lockAnswer(gameId || "", Math.round(scrollTop / 62));
        }}
      >
        LOCK
      </div>
      <div className="Timeline-List" ref={timeline}>
        <div className="Timeline-List-Spacer" />
        <div className="Timeline-List-Spacer" />
        {[...years].map((y) => (
          <React.Fragment key={y.song_id}>
            <SongPin song={y} />
          </React.Fragment>
        ))}
        <div className="Timeline-List-Spacer" />
        <div className="Timeline-List-Spacer" />
        <div className="Timeline-List-Spacer" />
      </div>
    </div>
  );
}

// --- Screens ---

function NameEntry({ onSubmit }: { onSubmit: (name: string) => void }) {
  const { playerName, setPlayerName } = useGameContext();
  const [name, setName] = useState(playerName);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim() || "Player";
    setPlayerName(trimmed);
    onSubmit(trimmed);
  };

  return (
    <form className="NameEntry" onSubmit={handleSubmit}>
      <input
        className="NameEntry-input"
        type="text"
        placeholder="Enter your name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        maxLength={20}
        autoFocus
      />
      <button className="btn btn-primary" type="submit">
        Join
      </button>
    </form>
  );
}

function Lobby({ gameId }: { gameId: string }) {
  const { players, startGame } = useGameContext();
  const audioContext = useAudioContext();
  const activePlayers = players.filter((p) => !p.guest);

  return (
    <div className="Lobby">
      <div className="Lobby-qr">
        <QRCode value={`${getOrigin()}/game/${gameId}`} size={150} bgColor="transparent" fgColor="white" />
        <span className="Lobby-label">Scan to join</span>
      </div>
      <div className="Lobby-players">
        <h2>Players ({activePlayers.length})</h2>
        {activePlayers.length === 0 ? (
          <p className="Lobby-waiting">Waiting for players...</p>
        ) : (
          <ul className="PlayerList">
            {activePlayers.map((p) => (
              <li key={p.id} className="PlayerList-item">
                {p.name}
              </li>
            ))}
          </ul>
        )}
        <button
          className="btn btn-primary"
          onClick={() => {
            audioContext.init();
            startGame(gameId);
          }}
        >
          Start Game
        </button>
      </div>
    </div>
  );
}

function ScoreBar() {
  const { correctAnswers = [] } = useGameContext();
  const score = Math.max(correctAnswers.length - 1, 0); // -1 for anchor song
  return <div className="ScoreBar">Score: {score}</div>;
}

function RoundResultScreen() {
  const { roundResult } = useGameContext();
  if (!roundResult) return null;

  const { song, results } = roundResult;

  return (
    <div className="RoundResult">
      <div className="RoundResult-song">
        <img className="RoundResult-cover" src={song.image_url} alt={song.name} />
        <h2>{song.name}</h2>
        <p className="RoundResult-artist">{song.artist_name}</p>
        <p className="RoundResult-year">{song.year}</p>
      </div>
      <div className="RoundResult-players">
        {results.map((r) => (
          <div key={r.playerId} className={`RoundResult-player ${r.correct ? "correct" : "wrong"}`}>
            <span className="RoundResult-icon">{r.correct ? "\u2713" : "\u2717"}</span>
            <span>{r.name}</span>
            <span className="RoundResult-score">{r.score}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function GameOverScreen({ gameId }: { gameId: string }) {
  const navigate = useNavigate();
  const { gameOver, playAgain, newGame } = useGameContext();
  if (!gameOver) return null;

  const { winner, players } = gameOver;
  const sorted = [...players].filter((p) => !p.guest).sort((a, b) => b.score - a.score);

  const handlePlayAgain = async () => {
    playAgain();
    const newGameId = await newGame();
    navigate(`/game/${newGameId}`);
  };

  return (
    <div className="GameOver">
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
          <div key={p.id} className={`GameOver-row ${p.id === winner?.id ? "winner" : ""}`}>
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

// --- Main Game screen (phase router) ---

function Game() {
  const navigate = useNavigate();
  const { gameId } = useParams();
  const gameContext = useGameContext();
  const audioContext = useAudioContext();
  const [joined, setJoined] = useState(false);

  if (!gameId) {
    navigate("/");
    return <></>;
  }

  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

  // Phase: not joined yet — show name entry
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

  // Phase: lobby
  if (gameContext.phase === "lobby") {
    return (
      <div className="Game">
        <Lobby gameId={gameId} />
      </div>
    );
  }

  // Phase: round result
  if (gameContext.phase === "round_result") {
    return (
      <div className="Game" style={{ justifyContent: "center" }}>
        <RoundResultScreen />
      </div>
    );
  }

  // Phase: game over
  if (gameContext.phase === "game_over") {
    return (
      <div className="Game" style={{ justifyContent: "center" }}>
        <GameOverScreen gameId={gameId} />
      </div>
    );
  }

  // Phase: playing
  return (
    <div className="Game">
      <MuteButton />
      <Cover />
      <ScoreBar />
      {isMobile ? <MobileTimeline /> : <Timeline />}
    </div>
  );
}

// --- Home screen ---

function New() {
  const navigate = useNavigate();
  const { newGame } = useGameContext();
  const onNewGamePress = async () => {
    const gameId = await newGame();
    navigate(`/game/${gameId}`);
  };
  return (
    <div className="Home">
      <p className="Home-subtitle">The music timeline game</p>
      <button className="btn btn-primary" onClick={onNewGamePress}>
        New Game
      </button>
    </div>
  );
}

// --- App root ---

function App() {
  return (
    <div className="App">
      <SocketProvider>
        <AudioProvider>
          <GameProvider>
            <header className="App-header">
              <h1>SATURN</h1>
            </header>
            <Routes>
              <Route path="/" element={<New />} />
              <Route path="game/:gameId" element={<Game />} />
            </Routes>
          </GameProvider>
        </AudioProvider>
      </SocketProvider>
    </div>
  );
}

export default App;
