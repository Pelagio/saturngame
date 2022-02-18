import {
  createContext,
  ReactNode,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";
import { TRACKS, BASE_SOUND } from "./data/tracks";
import { SimpleApi } from "./utils/simple-api/simple-api";

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
  playNext: () => void;
  init: () => void;
  newGame: () => void;
}

export const AudioContext = createContext<AudioContextState>({
  playNext: () => {},
  init: () => {},
  newGame: () => {},
});

export function AudioProvider({
  children,
}: {
  children: ReactNode;
}): React.ReactElement {
  const audioRef = useRef<HTMLAudioElement>(new Audio(BASE_SOUND));
  const [state, setState] = useState<AudioContextInnerState>({
    songs: [...TRACKS],
    playedSongs: [],
  });

  const init = useMemo(() => () => {
    audioRef.current?.play();
  },[])

  audioRef.current.volume = 0.05;

  const playNext = useMemo( () => () => {
    const i = Math.random() * (state.songs?.length || 0);
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

  const contextState = { ...state, playNext, init, newGame };
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
