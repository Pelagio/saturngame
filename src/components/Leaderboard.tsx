import { useEffect, useState } from "react";
import {
  SimpleApi,
  LeaderboardEntry,
} from "../utils/simple-api/simple-api";
import "./Leaderboard.css";

export function Leaderboard({
  date,
  playerName,
}: {
  date?: string;
  playerName?: string;
}) {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const api = new SimpleApi();
    api
      .getDailyLeaderboard(date)
      .then((data) => {
        setEntries(data.entries || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [date]);

  if (loading) {
    return <div className="Leaderboard-loading">Loading leaderboard...</div>;
  }

  if (entries.length === 0) {
    return (
      <div className="Leaderboard-empty">
        No scores yet today. Be the first!
      </div>
    );
  }

  return (
    <div className="Leaderboard">
      <h3 className="Leaderboard-title">Today's Top Scores</h3>
      <div className="Leaderboard-list">
        {entries.map((entry, i) => (
          <div
            key={`${entry.player_name}-${i}`}
            className={`Leaderboard-row ${entry.player_name === playerName ? "you" : ""}`}
          >
            <span className="Leaderboard-rank">#{i + 1}</span>
            <span className="Leaderboard-avatar">
              {entry.avatar || "\u{1F3B5}"}
            </span>
            <span className="Leaderboard-name">{entry.player_name}</span>
            <span className="Leaderboard-details">
              {entry.correct_count}/{entry.total_rounds}
            </span>
            <span className="Leaderboard-points">{entry.points}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
