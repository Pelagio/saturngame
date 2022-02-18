const REACT_APP_AUTH_URL = process.env.REACT_APP_AUTH_URL;
const REACT_APP_API_URL = process.env.REACT_APP_API_URL || "https://1b1e5ebb4a89.ngrok.io";

export const Endpoint = {
    login: `${REACT_APP_AUTH_URL}/login`,
    newGame: `${REACT_APP_API_URL}/new-game`,
    tracks: (gameId: string) => `${REACT_APP_API_URL}/${gameId}/tracks`,
};

interface ApiResponse<T> {
    data?: T;
    status: number;
}

export class SimpleApi {
    baseUrl?: string;

    token?: string;

    logout?: Function;

    constructor(token?: string, logout?: Function) {
        this.token = token;
        this.logout = logout;
    }

    setToken(token: string): void {
        this.token = token;
    }

    private async call<T>(
        endpoint: string,
        method = 'GET',
        data?: {},
        token?: string
    ): Promise<ApiResponse<T>> {
        try {
            const headers = new Headers({
                'Content-Type': 'application/json',
            });

            const authToken = token || this.token;

            if (authToken) {
                headers.set('Authorization', `Bearer ${authToken}`);
            }
            console.log(`SimpleApi method: ${method}, url:'${endpoint}'`);
            const response = await fetch(endpoint, {
                headers,
                method,
                body: JSON.stringify(data),
            });
            console.log('RESPONSE STATUS: ', response.status);
            if (this.logout && response.status === 401) {
                this.logout();
            }
            try {
                const responseData = await response.json();
                return { data: responseData, status: response.status };
            } catch {
                return { status: response.status };
            }
        } catch (error) {
            throw error;
        }
    }

    async getTracks(gameId: string): Promise<ApiResponse<any>> {
        return this.call(Endpoint.tracks(gameId), 'GET');
    }

    async newGame(): Promise<ApiResponse<{gameId: string}>> {
        return this.call(Endpoint.newGame, 'POST');
    }

}
