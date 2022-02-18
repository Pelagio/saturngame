import React, { useEffect, useMemo, useState } from "react";
import QRCode from "react-qr-code";
import { Route, Routes, useNavigate, useParams } from "react-router-dom";
import "./App.css";

import { AudioProvider, Song, useAudioContext } from "./AudioContext";

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
}: {
  onClick: (index: number) => void;
  index: number;
  lastIndex: number;
}) {
  return (
    <div className="Segment" onClick={() => onClick(index)}>
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
  const { currentSong, playNext } = useAudioContext();

  const [years, setYears] = useState<Song[]>([
    {
      year: 2000,
      song_id: "-1",
      image_url: "",
      preview_url: "",
      artist_name: "",
      name: "",
    },
  ]);

  const onSegmentPress = (segmentIndex: number) => {
    const songBeforeSegment = years[segmentIndex - 1];
    const after = songBeforeSegment ? songBeforeSegment.year : Math.max();
    const songafterSegment = years[segmentIndex];
    const before = songafterSegment ? songafterSegment.year : Math.min();
    if (
      currentSong?.year &&
      currentSong.year >= after &&
      currentSong.year <= before
    ) {
      setYears([...years, currentSong].sort((a, b) => a.year - b.year));
    }
    playNext();
  };

  if (!currentSong) {
    return null;
  }

  return (
    <div className="Timeline">
      {/* <h1>{currentSong?.year}</h1> */}
      <Segment onClick={onSegmentPress} index={0} lastIndex={years.length} />
      {years.map((y, index) => (
        <React.Fragment key={`${y.song_id}`}>
          <SongPin song={y} />
          <Segment
            onClick={onSegmentPress}
            index={index + 1}
            lastIndex={years.length}
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
  const audioContext = useAudioContext();

  const [allowPlayback, setAllowPlayback] = useState(false);
  const [gameRunning, setGameRunning] = useState(false);

  const startGame = useMemo(
    () => () => {
      audioContext.playNext();
    },
    [audioContext]
  );

  useEffect(() => {
    if (allowPlayback && !gameRunning) {
      setGameRunning(true);
      startGame();
    }
  }, [allowPlayback, startGame, setGameRunning, gameRunning]);

  return (
    <div className="Game">
      <Cover />
      {!gameRunning && (<QRCode value={`${getOrigin()}/game/${gameId}`} size={150} />)}
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
      <Timeline />
    </div>
  );
}

function New() {
  let navigate = useNavigate();
  const { newGame } = useAudioContext();
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
        <header className="App-header">
          <h1>SATURNUS</h1>
        </header>
        <Routes>
          <Route path="/" element={<New />} />
          <Route path="game/:gameId" element={<Game />} />
        </Routes>
      </AudioProvider>
    </div>
  );
}

export default App;
