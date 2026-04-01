import { env } from "../../lib/env";
import { MatchFilter } from "../../types/game";

export const Endpoint = {
  newGame: `${env.apiUrl}/new-game`,
  daily: `${env.apiUrl}/daily`,
  tracks: (gameId: string) => `${env.apiUrl}/${gameId}/tracks`,
};

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
}
