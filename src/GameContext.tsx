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
import { useSocketSend, useSetOnMessage } from "./utils/ws/ws";
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
  newGame: (opts?: {
    filter?: MatchFilter;
    daily?: boolean;
  }) => Promise<string>;
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
  playerId: string;
  // Single player
  lives: number;
  roundHistory: RoundOutcome[];
  roundNumber: number;
  isDaily: boolean;
  isController: boolean;
  setIsController: (v: boolean) => void;
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
  playerId: "",
  lives: MAX_LIVES,
  roundHistory: [],
  roundNumber: 0,
  isDaily: false,
  isController: false,
  setIsController: () => {},
});

export function GameProvider({ children }: { children: ReactNode }) {
  const sendWhenReady = useSocketSend();
  const setOnMessage = useSetOnMessage();
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
  const [playerId, setPlayerId] = useState(
    () => sessionStorage.getItem("saturn_player_id") || "",
  );

  // Single player state
  const [lives, setLives] = useState(MAX_LIVES);
  const [roundHistory, setRoundHistory] = useState<RoundOutcome[]>([]);
  const [roundNumber, setRoundNumber] = useState(0);
  const [isDaily, setIsDaily] = useState(false);
  const [isController, setIsController] = useState(false);
  const [currentGameId, setCurrentGameId] = useState<string>();

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
      sendWhenReady(JSON.stringify({ command: "LOCK_ANSWER", answer, gameId }));
    },
    [sendWhenReady],
  );

  const newGame = useCallback(
    async (opts?: { filter?: MatchFilter; daily?: boolean }) => {
      const api = new SimpleApi();
      const { data = { gameId: "single" } } = await api.newGame(opts);
      if (opts?.daily) setIsDaily(true);
      return data.gameId;
    },
    [],
  );

  const startGame = useCallback(
    (gameId?: string) => {
      sendWhenReady(JSON.stringify({ command: "REQUEST_START", gameId }));
    },
    [sendWhenReady],
  );

  const joinGame = useCallback(
    (gameId: string, guest?: boolean, name?: string, avatar?: string) => {
      const command = guest ? "JOIN_GUEST" : "JOIN";
      // Read freshest playerId from sessionStorage for reconnect
      const storedPlayerId =
        sessionStorage.getItem("saturn_player_id") || undefined;
      const payload = {
        command,
        gameId,
        name,
        avatar,
        playerId: storedPlayerId,
      };
      sendWhenReady(JSON.stringify(payload));
      setCurrentGameId(gameId);
      setPhase("lobby");
    },
    [sendWhenReady],
  );

  const updatePlayer = useCallback(
    (gameId: string, name?: string, avatar?: string) => {
      sendWhenReady(
        JSON.stringify({ command: "UPDATE_PLAYER", gameId, name, avatar }),
      );
    },
    [sendWhenReady],
  );

  const onTimeout = useCallback(
    (gameId: string) => {
      // Timer ran out — lock a deliberately wrong answer (segment -1 doesn't exist)
      sendWhenReady(
        JSON.stringify({ command: "LOCK_ANSWER", answer: -1, gameId }),
      );
    },
    [sendWhenReady],
  );

  const playAgain = useCallback(() => {
    stop();
    setPhase("idle");
    setCurrentSong(undefined);
    setCorrectAnswers([]);
    setPlayers([]);
    setRoundResult(undefined);
    setGameOver(undefined);
    setLives(MAX_LIVES);
    setRoundHistory([]);
    setRoundNumber(0);
    setIsDaily(false);
    setPlayerId("");
    sessionStorage.removeItem("saturn_player_id");
  }, [stop]);

  // Register message handler
  useEffect(() => {
    setOnMessage((msg) => {
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
        case "JOIN_ACK":
          setPlayerId(data.playerId);
          sessionStorage.setItem("saturn_player_id", data.playerId);
          break;

        case "START":
        case "NEW_SONG":
          if (!isController) play(data.song);
          setCurrentSong(data.song);
          setRoundResult(undefined);
          setPhase("playing");
          setRoundNumber((n) => n + 1);
          break;

        case "ROUND_RESULT": {
          if (!isController) stop();
          setRoundResult({ song: data.song, results: data.results });
          setPhase("round_result");

          // Track lives and round history — use freshest playerId from sessionStorage
          const currentPlayerId =
            sessionStorage.getItem("saturn_player_id") || "";
          const myResult = (data.results as PlayerResult[]).find(
            (r) => r.playerId === currentPlayerId,
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
                  // Build players from round results (has latest points)
                  const resultsAsPlayers: PlayerSummary[] = (
                    data.results as PlayerResult[]
                  ).map((r) => ({
                    id: r.playerId,
                    name: r.name,
                    avatar: r.avatar,
                    score: r.score,
                    points: r.points,
                    streak: r.streak,
                  }));
                  // Tell server this player is out
                  if (currentGameId) {
                    sendWhenReady(
                      JSON.stringify({
                        command: "FORFEIT",
                        gameId: currentGameId,
                      }),
                    );
                  }
                  setTimeout(() => {
                    if (!isController) stop();
                    setGameOver({
                      winner: undefined,
                      players: resultsAsPlayers,
                      reason: "lives",
                    });
                    setPhase("game_over");
                  }, 3000);
                }
                return newLives;
              });
            }
          }
          break;
        }

        case "MATCH_FINISHED":
          if (!isController) stop();
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
    });
  }, [setOnMessage, play, stop, isController, currentGameId, sendWhenReady]);

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
        playerId,
        lives,
        roundHistory,
        roundNumber,
        isDaily,
        isController,
        setIsController,
      }}
    >
      {children}
    </GameContext.Provider>
  );
}

export function useGameContext() {
  return useContext(GameContext);
}
