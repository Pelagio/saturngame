import QRCode from "react-qr-code";
import { useGameContext } from "../GameContext";
import { useAudioContext } from "../AudioContext";

const getOrigin = () =>
  typeof window !== "undefined" ? window.location.origin : "";

export function Lobby({ gameId }: { gameId: string }) {
  const { players, startGame } = useGameContext();
  const audioContext = useAudioContext();
  const activePlayers = players.filter((p) => !p.guest);

  return (
    <div className="Lobby">
      <div className="Lobby-qr">
        <QRCode
          value={`${getOrigin()}/game/${gameId}?mode=controller`}
          size={150}
          bgColor="transparent"
          fgColor="white"
        />
        <span className="Lobby-label">Scan to join</span>
      </div>
      <div className="Lobby-players">
        <h2>Players ({activePlayers.length})</h2>
        {activePlayers.length === 0 ? (
          <p className="Lobby-waiting">Waiting for players...</p>
        ) : (
          <ul className="PlayerList">
            {activePlayers.map((p) => (
              <li key={p.id} className="PlayerList-item">
                {p.avatar && <span className="PlayerList-avatar">{p.avatar}</span>}
                {p.name}
              </li>
            ))}
          </ul>
        )}
        <button
          className="btn btn-primary"
          onClick={() => {
            audioContext.init();
            startGame(gameId);
          }}
        >
          Start Game
        </button>
      </div>
    </div>
  );
}
