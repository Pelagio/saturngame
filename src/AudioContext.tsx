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
  volume?: number;
}

export interface AudioContextState {
  init: () => void;
  play: (song: Song) => void;
  setVolume: (volume: number) => void;
}

export const AudioContext = createContext<AudioContextState>({
  init: () => {},
  play: () => {},
  setVolume: () => {},
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
    volume: 0.5,
  });

  const init = useMemo(
    () => () => {
      audioRef.current?.play();
    },
    []
  );

  const setVolume = useMemo(
    () => (volume: number) => {
      setState((curr) => ({ ...curr, volume }));
    },
    []
  );

  const play = useMemo(
    () => (song?: Song) => {
      if (song) {
        audioRef.current?.pause();
        audioRef.current.src = song.preview_url;
        audioRef.current.currentTime = 0;
        audioRef.current.play();

        const i = TRACKS.findIndex((t) => song.song_id === t.song_id);
        const playedSongs = state.currentSong
          ? [...(state.playedSongs || []), state.currentSong]
          : state.playedSongs;

        setState((currentState) => ({
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

  useEffect(() => {
    audioRef.current.volume = (state.volume || state.volume === 0) ? state.volume : .5;
  }, [state.volume]);

  const contextState = {
    ...state,
    setVolume,
    init,
    play,
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
