import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { Song } from "./types/game";

// Short silent MP3 data URI to unlock audio playback on mobile
const SILENT_AUDIO =
  "data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4Ljc2LjEwMAAAAAAAAAAAAAAA//tQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWGluZwAAAA8AAAACAAABhgC7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7//////////////////////////////////////////////////////////////////8AAAAATGF2YzU4LjEzAAAAAAAAAAAAAAAAJAAAAAAAAAAAAYYoRBqSAAAAAAAAAAAAAAAAAAAA//tQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWGluZwAAAA8AAAACAAABhgC7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7//////////////////////////////////////////////////////////////////8AAAAATGF2YzU4LjEzAAAAAAAAAAAAAAAAJAAAAAAAAAAAAYYoRBqSAAAAAAAAAAAAAAAAAAAA";

interface AudioContextState {
  init: () => void;
  play: (song: Song) => void;
  stop: () => void;
  setVolume: (volume: number) => void;
  currentSong?: Song;
  volume: number;
}

const AudioCtx = createContext<AudioContextState>({
  init: () => {},
  play: () => {},
  stop: () => {},
  setVolume: () => {},
  volume: 0.5,
});

export function AudioProvider({ children }: { children: ReactNode }) {
  const audioRef = useRef<HTMLAudioElement>(new Audio(SILENT_AUDIO));
  const [currentSong, setCurrentSong] = useState<Song>();
  const [volume, setVolumeState] = useState(0.5);

  const init = useCallback(() => {
    audioRef.current?.play().catch(() => {});
  }, []);

  const setVolume = useCallback((v: number) => {
    setVolumeState(v);
  }, []);

  const play = useCallback((song: Song) => {
    audioRef.current.pause();
    audioRef.current.src = song.preview_url;
    audioRef.current.currentTime = 0;
    audioRef.current.play().catch(() => {});
    setCurrentSong(song);
  }, []);

  const stop = useCallback(() => {
    audioRef.current.pause();
  }, []);

  useEffect(() => {
    audioRef.current.volume = volume;
  }, [volume]);

  return (
    <AudioCtx.Provider
      value={{ init, play, stop, setVolume, currentSong, volume }}
    >
      {children}
    </AudioCtx.Provider>
  );
}

export function useAudioContext() {
  return useContext(AudioCtx);
}
