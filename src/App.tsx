import React, { useEffect, useMemo, useState } from "react";
import "./App.css";

import { AudioProvider, Song, useAudioContext } from "./AudioContext";

function Segment({ onClick, index, lastIndex }: { onClick: (index: number) => void, index: number, lastIndex: number }) {
  return (
    <div className="Segment" onClick={() => onClick(index)}>
      {index === 0 ? "BEFORE" :  index !== lastIndex ?  "<--->" : "AFTER"}
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
          <Segment onClick={onSegmentPress} index={index + 1} lastIndex={years.length}/>
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
      {!gameRunning && (
        <button onClick={() => setAllowPlayback(true)}>start</button>
      )}
      <Timeline />
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
        <Game />
      </AudioProvider>
    </div>
  );
}

export default App;
