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
import { Song, PlayerSummary, PlayerResult } from "./types/game";

export type GamePhase =
  | "idle"
  | "lobby"
  | "playing"
  | "round_result"
  | "game_over";

interface RoundResultData {
  song: Song;
  results: PlayerResult[];
}

interface GameOverData {
  winner?: { id: string; name: string };
  players: PlayerSummary[];
}

interface GameContextState {
  // Actions
  lockAnswer: (gameId: string, answer: number) => void;
  newGame: () => Promise<string>;
  startGame: (gameId?: string) => void;
  joinGame: (gameId: string, guest?: boolean, name?: string) => void;
  playAgain: () => void;
  // State
  phase: GamePhase;
  currentSong?: Song;
  correctAnswers?: Song[];
  players: PlayerSummary[];
  roundResult?: RoundResultData;
  gameOver?: GameOverData;
  playerName: string;
  setPlayerName: (name: string) => void;
}

const GameContext = createContext<GameContextState>({
  lockAnswer: () => {},
  newGame: async () => "",
  startGame: () => {},
  joinGame: () => {},
  playAgain: () => {},
  phase: "idle",
  players: [],
  playerName: "",
  setPlayerName: () => {},
});

export function GameProvider({ children }: { children: ReactNode }) {
  const socket = useSocket();
  const { play, stop } = useAudioContext();

  const [phase, setPhase] = useState<GamePhase>("idle");
  const [correctAnswers, setCorrectAnswers] = useState<Song[]>([]);
  const [currentSong, setCurrentSong] = useState<Song>();
  const [players, setPlayers] = useState<PlayerSummary[]>([]);
  const [roundResult, setRoundResult] = useState<RoundResultData>();
  const [gameOver, setGameOver] = useState<GameOverData>();
  const [playerName, setPlayerNameState] = useState(
    () => localStorage.getItem("saturn_player_name") || "",
  );

  const setPlayerName = useCallback((name: string) => {
    setPlayerNameState(name);
    localStorage.setItem("saturn_player_name", name);
  }, []);

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
    (gameId: string, guest?: boolean, name?: string) => {
      const command = guest ? "JOIN_GUEST" : "JOIN";
      socket?.send(JSON.stringify({ command, gameId, name }));
      setPhase("lobby");
    },
    [socket],
  );

  const playAgain = useCallback(() => {
    setPhase("idle");
    setCurrentSong(undefined);
    setCorrectAnswers([]);
    setPlayers([]);
    setRoundResult(undefined);
    setGameOver(undefined);
  }, []);

  useEffect(() => {
    if (!socket) return;

    socket.onmessage = (msg) => {
      let data;
      try {
        data = JSON.parse(msg.data);
      } catch {
        return;
      }

      // Update player list from any event that includes it
      if (data.players && Array.isArray(data.players)) {
        setPlayers(data.players);
      }

      // Update own correct answers
      if (data.player?.correctAnswers) {
        setCorrectAnswers(data.player.correctAnswers);
      }

      switch (data.command) {
        case "START":
        case "NEW_SONG":
          play(data.song);
          setCurrentSong(data.song);
          setRoundResult(undefined);
          setPhase("playing");
          break;

        case "ROUND_RESULT":
          stop();
          setRoundResult({ song: data.song, results: data.results });
          setPhase("round_result");
          break;

        case "MATCH_FINISHED":
          stop();
          setCurrentSong(undefined);
          setGameOver({
            winner: data.winner,
            players: data.players || [],
          });
          setPhase("game_over");
          break;

        case "PLAYER_JOINED":
        case "PLAYER_LEFT":
          // players already updated above
          break;

        default:
          break;
      }
    };
  }, [socket, play, stop]);

  return (
    <GameContext.Provider
      value={{
        lockAnswer,
        newGame,
        startGame,
        joinGame,
        playAgain,
        phase,
        currentSong,
        correctAnswers,
        players,
        roundResult,
        gameOver,
        playerName,
        setPlayerName,
      }}
    >
      {children}
    </GameContext.Provider>
  );
}

export function useGameContext() {
  return useContext(GameContext);
}
