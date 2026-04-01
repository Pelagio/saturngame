import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGameContext } from "../GameContext";
import { HowToPlay } from "./HowToPlay";

export function Home() {
  const navigate = useNavigate();
  const { newGame } = useGameContext();
  const [showHowTo, setShowHowTo] = useState(false);

  const onNewGamePress = async () => {
    const gameId = await newGame();
    navigate(`/game/${gameId}`);
  };

  return (
    <div className="Home">
      <p className="Home-subtitle">The music timeline game</p>
      <button className="btn btn-primary" onClick={onNewGamePress}>
        New Game
      </button>
      <button className="btn btn-secondary" onClick={() => setShowHowTo(true)}>
        How to Play
      </button>
      {showHowTo && <HowToPlay onClose={() => setShowHowTo(false)} />}
    </div>
  );
}
