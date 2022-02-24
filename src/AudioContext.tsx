import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { TRACKS, BASE_SOUND } from "./data/tracks";
import { SimpleApi } from "./utils/simple-api/simple-api";
import { useSocket } from "./utils/ws/ws";

export interface Song {
  song_id: string;
  artist_name: string;
  name: string;
  preview_url: string;
  image_url: string;
  year: number;
}

interface AudioContextInnerState {
  songs?: Song[];
  currentSong?: Song;
  playedSongs?: Song[];
  correctAnswers?: Song[];
}

export interface AudioContextState {
  lockAnswer: (gameId: string, answer: number) => void;
  init: () => void;
  newGame: () => void;
  startGame: (gameId?: string) => void;
  joinGame: (gameId?: string) => void;
}

export const AudioContext = createContext<AudioContextState>({
  lockAnswer: () => {},
  init: () => {},
  newGame: () => {},
  startGame: () => {},
  joinGame: () => {},
});

export function AudioProvider({
  children,
}: {
  children: ReactNode;
}): React.ReactElement {
  const audioRef = useRef<HTMLAudioElement>(new Audio(BASE_SOUND));
  let socket = useSocket();
  const [state, setState] = useState<AudioContextInnerState>({
    songs: [...TRACKS],
    playedSongs: [],
    correctAnswers: [],
  });

  const init = useMemo(
    () => () => {
      audioRef.current?.play();
    },
    []
  );

  audioRef.current.volume = 0.5;

  const lockAnswer = useMemo(
    () => (gameId: string, answer: number) => {
      socket?.send(JSON.stringify({ command: "LOCK_ANSWER", answer, gameId }));
    },
    [socket]
  );

  const play = useMemo(
    () => (song?: Song) => {
      if (song) {
        const i = TRACKS.findIndex((t) => song.song_id === t.song_id);
        audioRef.current?.pause();
        audioRef.current.src = song.preview_url;
        audioRef.current.currentTime = 0;
        audioRef.current.play();

        const playedSongs = state.currentSong
          ? [...(state.playedSongs || []), state.currentSong]
          : state.playedSongs;

        setState(currentState => ({
          ...currentState,
          playedSongs,
          songs: [
            ...(state.songs || []).slice(0, i),
            ...(state.songs || []).slice(i + 1),
          ],
          currentSong: song,
        }));
      }
    },
    [state.songs, state.playedSongs, state.currentSong]
  );

  const newGame = async () => {
    const api = new SimpleApi();
    const { data = { gameId: "single" } } = await api.newGame();
    const { gameId } = data;
    return gameId;
  };

  useEffect(() => {
    if (socket) {
      socket.onmessage = (msg) => {
        const data = JSON.parse(msg.data);
        const { player } = data;
        if (player) {
          const { correctAnswers: ca } = player;
          setState((currentState) => ({ ...currentState, correctAnswers: ca }));
        }
        switch (data.command) {
          case "START":
            play(data.song);
            break;
          case "NEW_SONG":
            play(data.song);
            break;
          case "MATCH_FINISHED":
            alert(data.winner ? "You won!" : "You lost!");
            break;
          default:
            return;
        }
      };
    }
  }, [socket, lockAnswer, play]);

  const startGame = useMemo(
    () => (gameId?: string) => {
      socket?.send(JSON.stringify({ command: "REQUEST_START", gameId }));
    },
    [socket]
  );

  const joinGame = useMemo(
    () => (gameId?: string) => {
      socket?.send(JSON.stringify({ command: "JOIN", gameId }));
    },
    [socket]
  );

  const contextState = {
    ...state,
    lockAnswer,
    init,
    newGame,
    startGame,
    joinGame,
  };
  return (
    <AudioContext.Provider value={contextState}>
      {children}
    </AudioContext.Provider>
  );
}

export function useAudioContext(): AudioContextState & AudioContextInnerState {
  const state = useContext(AudioContext);
  return {
    ...state,
  };
}
