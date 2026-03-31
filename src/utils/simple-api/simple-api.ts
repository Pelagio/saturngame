import { env } from "../../lib/env";

export const Endpoint = {
  newGame: `${env.apiUrl}/new-game`,
  tracks: (gameId: string) => `${env.apiUrl}/${gameId}/tracks`,
};

export class SimpleApi {
  async newGame(): Promise<{ data?: { gameId: string }; status: number }> {
    const response = await fetch(Endpoint.newGame, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });
    const data = await response.json();
    return { data, status: response.status };
  }
}
