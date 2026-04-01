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
  avatar?: string;
  correctAnswers: Song[];
  guest?: boolean;
}

export interface PlayerSummary {
  id: string;
  name: string;
  avatar?: string;
  score: number;
  points: number;
  streak: number;
  guest?: boolean;
}

export interface PlayerResult {
  playerId: string;
  name: string;
  avatar?: string;
  correct: boolean;
  score: number;
  points: number;
  pointsEarned: number;
  streak: number;
  speedBonus: number;
  streakMultiplier: number;
}

export interface MatchFilter {
  decade?: number;
  hardMode?: boolean;
}

// Client → Server commands
export type ClientCommand =
  | {
      command: "JOIN";
      gameId: string;
      name?: string;
      avatar?: string;
    }
  | { command: "JOIN_GUEST"; gameId: string; name?: string }
  | { command: "REQUEST_START"; gameId: string }
  | { command: "LOCK_ANSWER"; gameId: string; answer: number }
  | {
      command: "UPDATE_PLAYER";
      gameId: string;
      name?: string;
      avatar?: string;
    };
