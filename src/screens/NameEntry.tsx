import { useState, FormEvent } from "react";
import { useGameContext } from "../GameContext";
import { AvatarPicker } from "../components/AvatarPicker";

export function NameEntry({
  onSubmit,
}: {
  onSubmit: (name: string, avatar: string) => void;
}) {
  const { playerName, setPlayerName, playerAvatar, setPlayerAvatar } =
    useGameContext();
  const [name, setName] = useState(playerName);
  const [avatar, setAvatar] = useState(playerAvatar || "\u{1F3B5}");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim() || "Player";
    setPlayerName(trimmed);
    setPlayerAvatar(avatar);
    onSubmit(trimmed, avatar);
  };

  return (
    <form className="NameEntry-form" onSubmit={handleSubmit}>
      <AvatarPicker selected={avatar} onSelect={setAvatar} />
      <div className="NameEntry">
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
      </div>
    </form>
  );
}
