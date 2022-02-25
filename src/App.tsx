import React, { useEffect, useMemo, useState } from "react";
import QRCode from "react-qr-code";
import { Route, Routes, useNavigate, useParams } from "react-router-dom";
import "./App.css";

import { AudioProvider, Song, useAudioContext } from "./AudioContext";
import { GameProvider, useGameContext } from "./GameContext";

export const getOrigin = () => {
  if (typeof window !== "undefined") {
    return window?.location?.origin || document?.location?.origin;
  } else {
    return "";
  }
};

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
  const { year } = song;
  return (
    <div className="SongPin">
      <span>{year}</span>
      <div className="SongPin-inner" />
    </div>
  );
}

function Timeline() {
  let { gameId } = useParams();
  const {
    currentSong,
    lockAnswer,
    correctAnswers: years = [],
  } = useGameContext();

  const [selectedSegment, setSelectedSegment] = useState<number>();

  const onSegmentPress = (segmentIndex: number) => {
    lockAnswer(gameId || "", segmentIndex);
    setSelectedSegment(segmentIndex);
  };

  useEffect(() => {
    setSelectedSegment(undefined);
  }, [currentSong]);

  if (!currentSong) {
    return null;
  }

  return (
    <div className="Timeline">
      {/* <h1>{currentSong?.year}</h1> */}
      <Segment
        onClick={onSegmentPress}
        index={0}
        lastIndex={years.length}
        selected={selectedSegment === 0}
      />
      {years.map((y, index) => (
        <React.Fragment key={`${y.song_id}`}>
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

function Cover() {
  const { currentSong } = useAudioContext();
  return (
    <div
      key={currentSong?.song_id}
      className="Cover"
      style={{ backgroundImage: `url(${currentSong?.image_url})` }}
    ></div>
  );
}

function Game() {
  let { gameId } = useParams();
  const gameContext = useGameContext();
  const audioContext = useAudioContext();

  const [allowPlayback, setAllowPlayback] = useState(false);
  const [gameRunning, setGameRunning] = useState(false);

  const startGame = useMemo(
    () => () => {
      gameContext.startGame(gameId);
    },
    [gameContext, gameId]
  );

  useEffect(() => {
    if (allowPlayback && !gameRunning) {
      setGameRunning(true);
      startGame();
    }
  }, [allowPlayback, startGame, setGameRunning, gameRunning]);

  const onReadyPress = () => {
    audioContext.init();
    gameContext.joinGame(gameId);
  };

  return (
    <div className="Game">
      <Cover />
      {!gameRunning && (
        <QRCode value={`${getOrigin()}/game/${gameId}`} size={150} />
      )}
      {!gameRunning && (
        <button
          onClick={() => {
            audioContext.init();
            setAllowPlayback(true);
          }}
        >
          start
        </button>
      )}
      {!gameRunning && <button onClick={onReadyPress}>ready</button>}
      <Timeline />
    </div>
  );
}

function New() {
  let navigate = useNavigate();
  const { newGame } = useGameContext();
  const onNewGamePress = async () => {
    const gameId = await newGame();
    navigate(`/game/${gameId}`);
  };
  return (
    <div>
      <button onClick={onNewGamePress}>New game</button>
    </div>
  );
}

function App() {
  return (
    <div className="App">
      <AudioProvider>
        <GameProvider>
          <header className="App-header">
            <h1>SATURNUS</h1>
          </header>
          <Routes>
            <Route path="/" element={<New />} />
            <Route path="game/:gameId" element={<Game />} />
          </Routes>
        </GameProvider>
      </AudioProvider>
    </div>
  );
}

export default App;
