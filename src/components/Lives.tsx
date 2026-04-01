import { useGameContext } from "../GameContext";
import "./Lives.css";

export function Lives() {
  const { lives } = useGameContext();

  return (
    <div className="Lives" aria-label={`${lives} lives remaining`}>
      {[0, 1, 2].map((i) => (
        <span key={i} className={`Lives-heart ${i < lives ? "alive" : "dead"}`}>
          {i < lives ? "\u2764\uFE0F" : "\u{1F5A4}"}
        </span>
      ))}
    </div>
  );
}
