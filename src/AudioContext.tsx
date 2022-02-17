import {
  createContext,
  ReactNode,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";
import { TRACKS } from "./data/tracks";

export interface Song {
  preview_url: string;
  cover: string;
  year: number;
}

interface AudioContextInnerState {
  songs?: Song[];
  currentSong?: Song;
  playedSongs?: Song[];
}

export interface AudioContextState {
  playNext: () => void;

}

export const AudioContext = createContext<AudioContextState>({
  playNext: () => {},
});

export function AudioProvider({
  children,
}: {
  children: ReactNode;
}): React.ReactElement {
  const audioRef = useRef<HTMLAudioElement>(new Audio());
  const [state, setState] = useState<AudioContextInnerState>({
    songs: [...TRACKS],
    playedSongs: [],
  });

  audioRef.current.volume = 0.15;

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

  const contextState = { ...state, playNext };
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
