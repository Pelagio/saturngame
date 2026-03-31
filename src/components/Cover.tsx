import { useAudioContext } from "../AudioContext";

export function Cover() {
  const { currentSong } = useAudioContext();
  return (
    <div
      key={currentSong?.song_id}
      className="Cover"
      role="img"
      aria-label={
        currentSong ? `Album cover for ${currentSong.name}` : "No song playing"
      }
      style={{ backgroundImage: `url(${currentSong?.image_url})` }}
    />
  );
}
