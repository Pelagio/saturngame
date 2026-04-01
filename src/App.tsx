import { Route, Routes, useMatch } from "react-router-dom";
import "./styles/tokens.css";
import "./App.css";

import { AudioProvider } from "./AudioContext";
import { GameProvider } from "./GameContext";
import { SocketProvider } from "./utils/ws/ws";
import { Home } from "./screens/Home";
import { Game } from "./screens/Game";
import { TvDisplay } from "./screens/TvDisplay";

function App() {
  const isTvRoute = useMatch("/tv/:gameId");

  return (
    <div className={isTvRoute ? "App Tv-app" : "App"}>
      <SocketProvider>
        <AudioProvider>
          <GameProvider>
            {!isTvRoute && (
              <header className="App-header">
                <h1>SATURN</h1>
              </header>
            )}
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="game/:gameId" element={<Game />} />
              <Route path="tv/:gameId" element={<TvDisplay />} />
            </Routes>
          </GameProvider>
        </AudioProvider>
      </SocketProvider>
    </div>
  );
}

export default App;
