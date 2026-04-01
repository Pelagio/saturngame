import { env } from "../../lib/env";
import { MatchFilter } from "../../types/game";

export const Endpoint = {
  newGame: `${env.apiUrl}/new-game`,
  daily: `${env.apiUrl}/daily`,
  tracks: (gameId: string) => `${env.apiUrl}/${gameId}/tracks`,
};

export interface LeaderboardEntry {
  player_name: string;
  avatar: string | null;
  score: number;
  points: number;
  correct_count: number;
  total_rounds: number;
  longest_streak: number;
}

export class SimpleApi {
  async newGame(opts?: {
    filter?: MatchFilter;
    daily?: boolean;
  }): Promise<{ data?: { gameId: string }; status: number }> {
    const response = await fetch(Endpoint.newGame, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: opts ? JSON.stringify(opts) : undefined,
    });
    const data = await response.json();
    return { data, status: response.status };
  }

  async submitDailyScore(submission: {
    date: string;
    playerName: string;
    avatar?: string;
    score: number;
    points: number;
    correctCount: number;
    totalRounds: number;
    longestStreak: number;
  }): Promise<{
    success?: boolean;
    entries?: LeaderboardEntry[];
    error?: string;
  }> {
    const response = await fetch(`${Endpoint.daily}/score`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(submission),
    });
    return response.json();
  }

  async getDailyLeaderboard(
    date?: string,
  ): Promise<{ date: string; entries: LeaderboardEntry[] }> {
    const url = date
      ? `${Endpoint.daily}/leaderboard?date=${date}`
      : `${Endpoint.daily}/leaderboard`;
    const response = await fetch(url);
    return response.json();
  }
}
