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
import { Song, PlayerSummary, PlayerResult, MatchFilter } from "./types/game";

export type GamePhase =
  | "idle"
  | "lobby"
  | "playing"
  | "round_result"
  | "game_over";

export type RoundOutcome = "correct" | "wrong" | "timeout";

interface RoundResultData {
  song: Song;
  results: PlayerResult[];
}

interface GameOverData {
  winner?: { id: string; name: string };
  players: PlayerSummary[];
  reason?: "lives" | "finished";
}

const MAX_LIVES = 3;

interface GameContextState {
  // Actions
  lockAnswer: (gameId: string, answer: number) => void;
  newGame: (opts?: { filter?: MatchFilter; daily?: boolean }) => Promise<string>;
  startGame: (gameId?: string) => void;
  joinGame: (
    gameId: string,
    guest?: boolean,
    name?: string,
    avatar?: string,
  ) => void;
  playAgain: () => void;
  updatePlayer: (gameId: string, name?: string, avatar?: string) => void;
  onTimeout: (gameId: string) => void;
  // State
  phase: GamePhase;
  currentSong?: Song;
  correctAnswers?: Song[];
  players: PlayerSummary[];
  roundResult?: RoundResultData;
  gameOver?: GameOverData;
  playerName: string;
  setPlayerName: (name: string) => void;
  playerAvatar: string;
  setPlayerAvatar: (avatar: string) => void;
  // Single player
  lives: number;
  roundHistory: RoundOutcome[];
  roundNumber: number;
}

const GameContext = createContext<GameContextState>({
  lockAnswer: () => {},
  newGame: async () => "",
  startGame: () => {},
  joinGame: () => {},
  playAgain: () => {},
  updatePlayer: () => {},
  onTimeout: () => {},
  phase: "idle",
  players: [],
  playerName: "",
  setPlayerName: () => {},
  playerAvatar: "",
  setPlayerAvatar: () => {},
  lives: MAX_LIVES,
  roundHistory: [],
  roundNumber: 0,
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
  const [playerAvatar, setPlayerAvatarState] = useState(
    () => localStorage.getItem("saturn_player_avatar") || "",
  );

  // Single player state
  const [lives, setLives] = useState(MAX_LIVES);
  const [roundHistory, setRoundHistory] = useState<RoundOutcome[]>([]);
  const [roundNumber, setRoundNumber] = useState(0);

  const setPlayerName = useCallback((name: string) => {
    setPlayerNameState(name);
    localStorage.setItem("saturn_player_name", name);
  }, []);

  const setPlayerAvatar = useCallback((avatar: string) => {
    setPlayerAvatarState(avatar);
    localStorage.setItem("saturn_player_avatar", avatar);
  }, []);

  const lockAnswer = useCallback(
    (gameId: string, answer: number) => {
      socket?.send(JSON.stringify({ command: "LOCK_ANSWER", answer, gameId }));
    },
    [socket],
  );

  const newGame = useCallback(
    async (opts?: { filter?: MatchFilter; daily?: boolean }) => {
      const api = new SimpleApi();
      const { data = { gameId: "single" } } = await api.newGame(opts);
      return data.gameId;
    },
    [],
  );

  const startGame = useCallback(
    (gameId?: string) => {
      socket?.send(JSON.stringify({ command: "REQUEST_START", gameId }));
    },
    [socket],
  );

  const joinGame = useCallback(
    (gameId: string, guest?: boolean, name?: string, avatar?: string) => {
      const command = guest ? "JOIN_GUEST" : "JOIN";
      socket?.send(JSON.stringify({ command, gameId, name, avatar }));
      setPhase("lobby");
    },
    [socket],
  );

  const updatePlayer = useCallback(
    (gameId: string, name?: string, avatar?: string) => {
      socket?.send(
        JSON.stringify({ command: "UPDATE_PLAYER", gameId, name, avatar }),
      );
    },
    [socket],
  );

  const onTimeout = useCallback(
    (gameId: string) => {
      // Timer ran out — lock a deliberately wrong answer (segment -1 doesn't exist)
      socket?.send(
        JSON.stringify({ command: "LOCK_ANSWER", answer: -1, gameId }),
      );
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
    setLives(MAX_LIVES);
    setRoundHistory([]);
    setRoundNumber(0);
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

      if (data.players && Array.isArray(data.players)) {
        setPlayers(data.players);
      }

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
          setRoundNumber((n) => n + 1);
          break;

        case "ROUND_RESULT": {
          stop();
          setRoundResult({ song: data.song, results: data.results });
          setPhase("round_result");

          // Track lives and round history
          const myResult = (data.results as PlayerResult[]).find(
            (r) => r.name === playerName,
          );
          if (myResult) {
            const outcome: RoundOutcome = myResult.correct
              ? "correct"
              : "wrong";
            setRoundHistory((h) => [...h, outcome]);
            if (!myResult.correct) {
              setLives((l) => {
                const newLives = l - 1;
                if (newLives <= 0) {
                  // Will be dead — trigger game over on next render cycle
                  setTimeout(() => {
                    stop();
                    setGameOver({
                      winner: undefined,
                      players: data.players || [],
                      reason: "lives",
                    });
                    setPhase("game_over");
                  }, 3000); // Show the round result briefly first
                }
                return newLives;
              });
            }
          }
          break;
        }

        case "MATCH_FINISHED":
          stop();
          setCurrentSong(undefined);
          setGameOver({
            winner: data.winner,
            players: data.players || [],
            reason: "finished",
          });
          setPhase("game_over");
          break;

        case "PLAYER_JOINED":
        case "PLAYER_LEFT":
          break;

        default:
          break;
      }
    };
  }, [socket, play, stop, playerName]);

  return (
    <GameContext.Provider
      value={{
        lockAnswer,
        newGame,
        startGame,
        joinGame,
        playAgain,
        updatePlayer,
        onTimeout,
        phase,
        currentSong,
        correctAnswers,
        players,
        roundResult,
        gameOver,
        playerName,
        setPlayerName,
        playerAvatar,
        setPlayerAvatar,
        lives,
        roundHistory,
        roundNumber,
      }}
    >
      {children}
    </GameContext.Provider>
  );
}

export function useGameContext() {
  return useContext(GameContext);
}
