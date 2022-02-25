import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useAudioContext } from "./AudioContext";
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

interface GameContextInnerState {
  correctAnswers?: Song[];
}

export interface GameContextState {
  lockAnswer: (gameId: string, answer: number) => void;
  newGame: () => void;
  startGame: (gameId?: string) => void;
  joinGame: (gameId: string, guest?: boolean) => void;
  currentSong?: Song;
}

export const GameContext = createContext<GameContextState>({
  lockAnswer: () => {},
  newGame: () => {},
  startGame: () => {},
  joinGame: () => {},
});

export function GameProvider({
  children,
}: {
  children: ReactNode;
}): React.ReactElement {
  let socket = useSocket();

  const { play, currentSong } = useAudioContext();
  const [state, setState] = useState<GameContextInnerState>({
    correctAnswers: [],
  });

  const nextSong = useMemo(
    () => (song: Song) => {
      play(song);
    },
    [play]
  );

  const lockAnswer = useMemo(
    () => (gameId: string, answer: number) => {
      socket?.send(JSON.stringify({ command: "LOCK_ANSWER", answer, gameId }));
    },
    [socket]
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
            nextSong(data.song);
            break;
          case "NEW_SONG":
            nextSong(data.song);
            break;
          case "MATCH_FINISHED":
            alert(data.winner ? "You won!" : "You lost!");
            break;
          default:
            return;
        }
      };
    }
  }, [socket, lockAnswer, nextSong]);

  const startGame = useMemo(
    () => (gameId?: string) => {
      socket?.send(JSON.stringify({ command: "REQUEST_START", gameId }));
    },
    [socket]
  );

  const joinGame = useMemo(
    () => (gameId: string, guest?: boolean) => {
      socket?.send(
        JSON.stringify({ command: guest ? "JOIN_GUEST" : "JOIN", gameId })
      );
    },
    [socket]
  );

  const contextState = {
    ...state,
    currentSong,
    lockAnswer,
    newGame,
    startGame,
    joinGame,
  };
  return (
    <GameContext.Provider value={contextState}>{children}</GameContext.Provider>
  );
}

export function useGameContext(): GameContextState & GameContextInnerState {
  const state = useContext(GameContext);
  return {
    ...state,
  };
}
