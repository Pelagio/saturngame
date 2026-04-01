import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useGameContext } from "../GameContext";
import "./RoundTimer.css";

const ROUND_DURATION = 30;

export function RoundTimer() {
  const { gameId } = useParams();
  const { currentSong, onTimeout, phase } = useGameContext();
  const [seconds, setSeconds] = useState(ROUND_DURATION);

  // Reset timer when a new song starts
  useEffect(() => {
    setSeconds(ROUND_DURATION);
  }, [currentSong]);

  // Countdown
  useEffect(() => {
    if (phase !== "playing") return;

    const interval = setInterval(() => {
      setSeconds((s) => {
        if (s <= 1) {
          clearInterval(interval);
          if (gameId) onTimeout(gameId);
          return 0;
        }
        return s - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [phase, currentSong, gameId, onTimeout]);

  if (phase !== "playing") return null;

  const urgent = seconds <= 10;
  const critical = seconds <= 5;
  const progress = seconds / ROUND_DURATION;

  return (
    <div
      className={`RoundTimer ${urgent ? "urgent" : ""} ${critical ? "critical" : ""}`}
    >
      <svg className="RoundTimer-ring" viewBox="0 0 40 40">
        <circle
          className="RoundTimer-track"
          cx="20"
          cy="20"
          r="17"
          fill="none"
          strokeWidth="3"
        />
        <circle
          className="RoundTimer-progress"
          cx="20"
          cy="20"
          r="17"
          fill="none"
          strokeWidth="3"
          strokeDasharray={`${progress * 106.8} 106.8`}
          strokeLinecap="round"
          transform="rotate(-90 20 20)"
        />
      </svg>
      <span className="RoundTimer-text">{seconds}</span>
    </div>
  );
}
