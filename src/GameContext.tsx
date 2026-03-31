import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { useAudioContext } from "./AudioContext";
import { SimpleApi } from "./utils/simple-api/simple-api";
import { useSocket } from "./utils/ws/ws";
import { Song } from "./types/game";

interface GameContextState {
  lockAnswer: (gameId: string, answer: number) => void;
  newGame: () => Promise<string>;
  startGame: (gameId?: string) => void;
  joinGame: (gameId: string, guest?: boolean) => void;
  currentSong?: Song;
  correctAnswers?: Song[];
}

const GameContext = createContext<GameContextState>({
  lockAnswer: () => {},
  newGame: async () => "",
  startGame: () => {},
  joinGame: () => {},
});

export function GameProvider({ children }: { children: ReactNode }) {
  const socket = useSocket();
  const { play } = useAudioContext();
  const [correctAnswers, setCorrectAnswers] = useState<Song[]>([]);
  const [currentSong, setCurrentSong] = useState<Song>();

  const lockAnswer = useCallback(
    (gameId: string, answer: number) => {
      socket?.send(JSON.stringify({ command: "LOCK_ANSWER", answer, gameId }));
    },
    [socket],
  );

  const newGame = useCallback(async () => {
    const api = new SimpleApi();
    const { data = { gameId: "single" } } = await api.newGame();
    return data.gameId;
  }, []);

  const startGame = useCallback(
    (gameId?: string) => {
      socket?.send(JSON.stringify({ command: "REQUEST_START", gameId }));
    },
    [socket],
  );

  const joinGame = useCallback(
    (gameId: string, guest?: boolean) => {
      socket?.send(
        JSON.stringify({ command: guest ? "JOIN_GUEST" : "JOIN", gameId }),
      );
    },
    [socket],
  );

  useEffect(() => {
    if (!socket) return;

    socket.onmessage = (msg) => {
      let data;
      try {
        data = JSON.parse(msg.data);
      } catch {
        return;
      }

      if (data.player?.correctAnswers) {
        setCorrectAnswers(data.player.correctAnswers);
      }

      switch (data.command) {
        case "START":
        case "NEW_SONG":
          play(data.song);
          setCurrentSong(data.song);
          break;
        case "MATCH_FINISHED":
          setCurrentSong(undefined);
          alert(data.winner ? "You won!" : "You lost!");
          break;
        default:
          break;
      }
    };
  }, [socket, play]);

  return (
    <GameContext.Provider
      value={{
        lockAnswer,
        newGame,
        startGame,
        joinGame,
        currentSong,
        correctAnswers,
      }}
    >
      {children}
    </GameContext.Provider>
  );
}

export function useGameContext() {
  return useContext(GameContext);
}
