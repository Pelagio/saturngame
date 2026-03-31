import { useAudioContext } from "../AudioContext";
import { SoundOffIcon, SoundOnIcon } from "./Icons";

export function MuteButton() {
  const { setVolume, volume } = useAudioContext();
  return (
    <button
      onClick={() => setVolume(volume === 0 ? 0.5 : 0)}
      className="MuteButton"
      aria-label={volume === 0 ? "Unmute audio" : "Mute audio"}
    >
      {volume === 0 ? <SoundOffIcon /> : <SoundOnIcon />}
    </button>
  );
}
