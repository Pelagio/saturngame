import React, { useEffect, useMemo, useState } from "react";
import "./App.css";

import { AudioProvider, useAudioContext } from "./AudioContext";

function Timeline() {
  const { currentSong, playNext, playedSongs } = useAudioContext();
  const years = [2000, ...(playedSongs || []).map((ps) => ps.year)].sort();

  const onSegmentPress = (segmentIndex: number) => {
    const after = years[segmentIndex - 1] || Math.max();
    const before = years[segmentIndex] || Math.min();
    console.log({ segmentIndex, after, before });
    if (
      currentSong?.year &&
      currentSong.year >= after &&
      currentSong.year <= before
    ) {
      playNext();
    }
  };

  return (
    <div>
      {/* <h1>{currentSong?.year}</h1> */}
      <button onClick={() => onSegmentPress(0)}>-----</button>
      {years.map((y, index) => (
        <React.Fragment key={`${y}`}>
          <span>{y}</span>
          <button onClick={() => onSegmentPress(index + 1)}>-----</button>
        </React.Fragment>
      ))}
    </div>
  );
}

function Cover() {
  const { currentSong } = useAudioContext();
  console.log({currentSong})
  return (
    <div key={currentSong?.cover} className="Game-cover"
      style={{ backgroundImage: `url(${currentSong?.cover})`}}
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
    <>
      <Cover />
      <button onClick={() => setAllowPlayback(true)}>start</button>
      <Timeline />
    </>
  );
}

function App() {
  return (
    <div className="App">
      <AudioProvider>
        <header className="App-header">
          SATURN
        </header>
        <Game />
      </AudioProvider>
    </div>
  );
}

export default App;
