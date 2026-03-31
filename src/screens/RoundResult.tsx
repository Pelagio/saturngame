import { useGameContext } from "../GameContext";

export function RoundResult() {
  const { roundResult } = useGameContext();
  if (!roundResult) return null;

  const { song, results } = roundResult;

  return (
    <div className="RoundResult" aria-live="polite">
      <div className="RoundResult-song">
        <img
          className="RoundResult-cover"
          src={song.image_url}
          alt={`Album cover for ${song.name}`}
        />
        <h2>{song.name}</h2>
        <p className="RoundResult-artist">{song.artist_name}</p>
        <p className="RoundResult-year">{song.year}</p>
      </div>
      <div className="RoundResult-players">
        {results.map((r) => (
          <div
            key={r.playerId}
            className={`RoundResult-player ${r.correct ? "correct" : "wrong"}`}
          >
            <span className="RoundResult-icon" aria-hidden="true">
              {r.correct ? "\u2713" : "\u2717"}
            </span>
            <span>
              {r.name} {r.correct ? "(correct)" : "(wrong)"}
            </span>
            <span className="RoundResult-score">{r.score}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
