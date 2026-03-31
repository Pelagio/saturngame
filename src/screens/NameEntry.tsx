import { useState, FormEvent } from "react";
import { useGameContext } from "../GameContext";

export function NameEntry({ onSubmit }: { onSubmit: (name: string) => void }) {
  const { playerName, setPlayerName } = useGameContext();
  const [name, setName] = useState(playerName);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim() || "Player";
    setPlayerName(trimmed);
    onSubmit(trimmed);
  };

  return (
    <form className="NameEntry" onSubmit={handleSubmit}>
      <label htmlFor="player-name" className="sr-only">
        Your name
      </label>
      <input
        id="player-name"
        className="NameEntry-input"
        type="text"
        placeholder="Enter your name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        maxLength={20}
        autoFocus
      />
      <button className="btn btn-primary" type="submit">
        Join
      </button>
    </form>
  );
}
