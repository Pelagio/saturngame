export interface Song {
  song_id: string;
  artist_name: string;
  name: string;
  preview_url: string;
  image_url: string;
  year: number;
}

export interface Player {
  id: string;
  name: string;
  correctAnswers: Song[];
  guest?: boolean;
}

export interface PlayerSummary {
  id: string;
  name: string;
  score: number;
  guest?: boolean;
}

export interface PlayerResult {
  playerId: string;
  name: string;
  correct: boolean;
  score: number;
}

// Server → Client events
export type ServerEvent =
  | { command: "START"; song: Song; player: Player; players?: PlayerSummary[] }
  | {
      command: "NEW_SONG";
      song: Song;
      player: Player;
      players?: PlayerSummary[];
    }
  | {
      command: "MATCH_FINISHED";
      winner?: Player;
      player: Player;
      players?: PlayerSummary[];
    }
  | {
      command: "PLAYER_JOINED";
      player: PlayerSummary;
      players: PlayerSummary[];
    }
  | { command: "PLAYER_LEFT"; playerId: string; players: PlayerSummary[] }
  | { command: "ROUND_RESULT"; song: Song; results: PlayerResult[] };

// Client → Server commands
export type ClientCommand =
  | { command: "JOIN"; gameId: string; name?: string }
  | { command: "JOIN_GUEST"; gameId: string; name?: string }
  | { command: "REQUEST_START"; gameId: string }
  | { command: "LOCK_ANSWER"; gameId: string; answer: number };
