import React, { MutableRefObject, useEffect, useMemo, useState } from "react";
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

function MobileTimeline() {
  let { gameId } = useParams();

  const timeline: MutableRefObject<any> = React.useRef(null);
  const {
    currentSong,
    lockAnswer,
    correctAnswers: years = [],
  } = useGameContext();

  const onSegmentPress = (segmentIndex: number) => {
    lockAnswer(gameId || "", segmentIndex);
  };

  useEffect(() => {
    // timeline.current?.scrollTo({top: years.length * 31} )
  }, [years.length]);

  if (!currentSong) {
    return null;
  }

  return (
    <div className="Timeline">
      <div className="Timeline-Cursor">
        <h2>AFTER:</h2>
        <div style={{width: "100%", height: "2px", backgroundColor: "white"}}></div>
        <h2>BEFORE:</h2>
      </div>
      <div className="Timeline-LockButton" onClick={() => {
        const { scrollTop } = timeline.current;
        const selectedIndex = Math.round(scrollTop / 62);
          onSegmentPress(selectedIndex)
        }}>LOCK</div>
      <div className="Timeline-List" ref={timeline}>
      <div className="Timeline-List-Spacer" />
      <div className="Timeline-List-Spacer" />
      {[...years].map((y, index) => (
        <React.Fragment key={`${y.song_id}`}>
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

function SoundOffIcon() {
  return (
    <svg
      width="30px"
      height="30px"
      viewBox="0 0 384 384"
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g id="Page" stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
        <g
          id="Android"
          transform="translate(-2196.000000, -9584.000000)"
          fill="#fff"
        >
          <g
            id="android-volume-off"
            transform="translate(2196.000000, 9584.000000)"
          >
            <g id="Group">
              <path
                d="M341.5,192 C341.5,214.717 336.617,236.362 327.897,255.855 L359.777,287.735 C375.283,259.33 384,226.653 384,192 C384,98.744 320,19.746 235,0 L235,44.978 C297,63.632 341.5,122.882 341.5,192 L341.5,192 Z"
                id="Shape"
              ></path>
              <polygon
                id="Shape"
                points="192 16.458 140.979 68.938 192 119.957"
              ></polygon>
              <path
                d="M356.842,332.885 L27.116,3.157 L3.116,27.157 L93.615,117.57 L85.335,128 L0,128 L0,256 L85.334,256 L192,367.543 L192,216 L286.915,310.686 C271.795,323.443 254,333.213 235,339.022 L235,384 C266,376.828 293.996,361.837 317.315,341.191 L356.925,380.884 L380.925,356.841 L356.923,332.802 L356.842,332.885 L356.842,332.885 Z"
                id="Shape"
              ></path>
              <path
                d="M288.188,192 C288.188,153.601 267,119.593 235,103.137 L235,162.957 L285.801,213.758 C287.355,206.739 288.188,199.454 288.188,192 L288.188,192 Z"
                id="Shape"
              ></path>
            </g>
          </g>
        </g>
      </g>
    </svg>
  );
}

function SoundOnIcon() {
  return (
    <svg width="30px" height="30px" viewBox="0 0 384 384" version="1.1">
      <g id="Page" stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
        <g
          id="Android"
          transform="translate(-3096.000000, -9584.000000)"
          fill="#fff"
        >
          <g
            id="android-volume-up"
            transform="translate(3096.000000, 9584.000000)"
          >
            <path
              d="M0,128 L0,256 L85.334,256 L192,367.543 L192,16.458 L85.334,128 L0,128 L0,128 Z M288,192 C288,153.601 266.667,119.593 234.667,103.137 L234.667,279.773 C266.667,264.408 288,230.4 288,192 L288,192 Z M234.667,0 L234.667,44.978 C296.531,63.632 341.334,122.882 341.334,192 C341.334,261.119 296.531,320.369 234.667,339.022 L234.667,384 C320,364.254 384,285.257 384,192 C384,98.744 320,19.746 234.667,0 L234.667,0 Z"
              id="Shape"
            ></path>
          </g>
        </g>
      </g>
    </svg>
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

function MuteButton() {
  const { setVolume, volume } = useAudioContext();
  const onPress = () => {
    setVolume(volume === 0 ? 0.5 : 0);
  };

  return (
    <div onClick={onPress} className="MuteButton">
      {volume === 0 ? <SoundOffIcon /> : <SoundOnIcon />}
    </div>
  );
}

function Game() {
  let navigate = useNavigate();
  let { gameId } = useParams();

  const gameContext = useGameContext();
  const audioContext = useAudioContext();

  const [allowPlayback, setAllowPlayback] = useState(false);
  const [gameRunning, setGameRunning] = useState(false);

  const [playerReady, setPlayerReady] = useState(false);

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

  useEffect(() => {
    setPlayerReady(false);
  }, [gameId]);

  if (!gameId) {
    navigate("/");
    return <></>;
  }

  const onReadyPress = () => {
    audioContext.init();
    setPlayerReady(true);
    gameContext.joinGame(gameId!);
  };

  const onWatchPress = () => {
    audioContext.init();
    setPlayerReady(true);
    gameContext.joinGame(gameId!, true);
  };

  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  return (
    <div className="Game" style={!gameContext.currentSong ? {justifyContent: "flex-start"}: {}}>
      <MuteButton />
      <Cover />
      {!gameContext.currentSong && (
        <QRCode value={`${getOrigin()}/game/${gameId}`} size={150} />
      )}
      {!gameContext.currentSong && playerReady && (
        <button
          onClick={() => {
            audioContext.init();
            setAllowPlayback(true);
          }}
        >
          start
        </button>
      )}
      {!gameContext.currentSong && !playerReady && (
        <button onClick={onReadyPress}>play</button>
      )}
      {!gameContext.currentSong && !playerReady && (
        <button onClick={onWatchPress}>watch</button>
      )}
      {isMobile ? <MobileTimeline /> : <Timeline />}
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
