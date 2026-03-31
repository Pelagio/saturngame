import { useNavigate } from "react-router-dom";
import { useGameContext } from "../GameContext";

export function Home() {
  const navigate = useNavigate();
  const { newGame } = useGameContext();

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
    </div>
  );
}
