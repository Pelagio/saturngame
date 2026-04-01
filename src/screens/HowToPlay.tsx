import "./HowToPlay.css";

export function HowToPlay({ onClose }: { onClose: () => void }) {
  return (
    <div className="HowToPlay-overlay" onClick={onClose}>
      <div className="HowToPlay" onClick={(e) => e.stopPropagation()}>
        <h2>How to Play</h2>

        <div className="HowToPlay-steps">
          <div className="HowToPlay-step">
            <span className="HowToPlay-number">1</span>
            <div>
              <h3>Listen</h3>
              <p>A song plays and the album cover slowly reveals. Use the music and image as clues.</p>
            </div>
          </div>

          <div className="HowToPlay-step">
            <span className="HowToPlay-number">2</span>
            <div>
              <h3>Place it on the timeline</h3>
              <p>Guess when the song was released by placing it between the years already on your timeline.</p>
            </div>
          </div>

          <div className="HowToPlay-step">
            <span className="HowToPlay-number">3</span>
            <div>
              <h3>Lock your answer</h3>
              <p>Tap a position or scroll and hit LOCK. You can't change it once locked.</p>
            </div>
          </div>

          <div className="HowToPlay-step">
            <span className="HowToPlay-number">4</span>
            <div>
              <h3>First to 10 wins</h3>
              <p>Correct placements add the song to your timeline. First player to place 10 songs correctly wins.</p>
            </div>
          </div>
        </div>

        <div className="HowToPlay-multiplayer">
          <h3>Multiplayer</h3>
          <p>Create a game and share the QR code. Friends join on their phones as controllers while the main screen displays the game.</p>
        </div>

        <button className="btn btn-primary" onClick={onClose}>
          Got it
        </button>
      </div>
    </div>
  );
}
