import { useState, FormEvent } from "react";
import { useGameContext } from "../GameContext";
import { AvatarPicker } from "../components/AvatarPicker";

export function EditProfile({
  gameId,
  onClose,
}: {
  gameId: string;
  onClose: () => void;
}) {
  const {
    playerName,
    setPlayerName,
    playerAvatar,
    setPlayerAvatar,
    updatePlayer,
  } = useGameContext();
  const [name, setName] = useState(playerName);
  const [avatar, setAvatar] = useState(playerAvatar);

  const handleSave = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim() || "Player";
    setPlayerName(trimmed);
    setPlayerAvatar(avatar);
    updatePlayer(gameId, trimmed, avatar);
    onClose();
  };

  return (
    <form className="EditProfile" onSubmit={handleSave}>
      <h2>Edit Profile</h2>
      <AvatarPicker selected={avatar} onSelect={setAvatar} />
      <div className="NameEntry">
        <label htmlFor="edit-name" className="sr-only">
          Your name
        </label>
        <input
          id="edit-name"
          className="NameEntry-input"
          type="text"
          placeholder="Your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={20}
          autoFocus
        />
      </div>
      <div className="EditProfile-actions">
        <button className="btn btn-primary" type="submit">
          Save
        </button>
        <button className="btn btn-secondary" type="button" onClick={onClose}>
          Cancel
        </button>
      </div>
    </form>
  );
}
