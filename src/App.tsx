import { Route, Routes } from "react-router-dom";
import "./styles/tokens.css";
import "./App.css";

import { AudioProvider } from "./AudioContext";
import { GameProvider } from "./GameContext";
import { SocketProvider } from "./utils/ws/ws";
import { Home } from "./screens/Home";
import { Game } from "./screens/Game";

function App() {
  return (
    <div className="App">
      <SocketProvider>
        <AudioProvider>
          <GameProvider>
            <header className="App-header">
              <h1>SATURN</h1>
            </header>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="game/:gameId" element={<Game />} />
            </Routes>
          </GameProvider>
        </AudioProvider>
      </SocketProvider>
    </div>
  );
}

export default App;
