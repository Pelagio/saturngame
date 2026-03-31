import { useGameContext } from "../GameContext";

export function ScoreBar() {
  const { correctAnswers = [] } = useGameContext();
  const score = Math.max(correctAnswers.length - 1, 0);
  return (
    <div className="ScoreBar" aria-live="polite">
      Score: {score}
    </div>
  );
}
