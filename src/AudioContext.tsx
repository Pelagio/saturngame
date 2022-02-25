import {
  createContext,
  ReactNode,
  useContext,
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
}

export interface AudioContextState {
  init: () => void;
  play: (song: Song) => void;
}

export const AudioContext = createContext<AudioContextState>({
  init: () => {},
  play: () => {},
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

  const init = useMemo(
    () => () => {
      audioRef.current?.play();
    },
    []
  );

  audioRef.current.volume = 0.5;


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

  const contextState = {
    ...state,
    init,
    play
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
