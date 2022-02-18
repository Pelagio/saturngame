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
}

export interface AudioContextState {
  playNext: (songNumber?: number) => void;
  init: () => void;
  newGame: () => void;
  startGame: (gameId?: string) => void;
  joinGame: (gameId?: string) => void;
}

export const AudioContext = createContext<AudioContextState>({
  playNext: () => {},
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
  });

  const init = useMemo(() => () => {
    audioRef.current?.play();
  },[])

  audioRef.current.volume = 0.05;

  const playNext = useMemo( () => (songNumber?: number) => {
    const i = songNumber || Math.random() * (state.songs?.length || 0);
    const song = state.songs?.[Math.floor(i)];
    if (song) {
      audioRef.current?.pause();
      audioRef.current.src = song.preview_url;
      audioRef.current.currentTime = 0;
      audioRef.current.play();

      const playedSongs = state.currentSong ?[...(state.playedSongs || []), state.currentSong] : state.playedSongs;

      setState({
        playedSongs,
        songs: [...(state.songs || []).slice(0, i), ...(state.songs || []).slice(i + 1)],
        currentSong: song,
      });
    }
  }, [state.songs, state.playedSongs, state.currentSong]);

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
        if (data.command === "START") {
          playNext(data.songNumber);
        }
      };
    }
  }, [socket, playNext])

  const startGame = useMemo(() => (gameId?: string) => {
    socket?.send(JSON.stringify({command: "REQUEST_START", gameId}));
  } , [socket])

  const joinGame = useMemo(() => (gameId?: string) => {
    socket?.send(JSON.stringify({command: "JOIN", gameId}));
  } , [socket])

  const contextState = { ...state, playNext, init, newGame, startGame, joinGame };
  return (
    <AudioContext.Provider value={contextState}>
      {children}
    </AudioContext.Provider>
  );
}

export function useAudioContext(): AudioContextState &
  AudioContextInnerState {
  const state = useContext(AudioContext);
  return {
    ...state,
  };
}
