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
              <p>
                A song plays and the album cover slowly reveals over 30 seconds.
                Use the music and image as clues.
              </p>
            </div>
          </div>

          <div className="HowToPlay-step">
            <span className="HowToPlay-number">2</span>
            <div>
              <h3>Place it on the timeline</h3>
              <p>
                Guess when the song was released by placing it between the years
                already on your timeline. Tap a position to select it.
              </p>
            </div>
          </div>

          <div className="HowToPlay-step">
            <span className="HowToPlay-number">3</span>
            <div>
              <h3>Lock your answer</h3>
              <p>
                Tap LOCK to confirm. You have 30 seconds per round — if time
                runs out, you lose a life.
              </p>
            </div>
          </div>

          <div className="HowToPlay-step">
            <span className="HowToPlay-number">4</span>
            <div>
              <h3>Score points</h3>
              <p>
                Correct answers earn points. Answer faster for a speed bonus.
                Build streaks for a multiplier (1.5x at 3, 2x at 5+).
              </p>
            </div>
          </div>
        </div>

        <div className="HowToPlay-section">
          <h3>Lives</h3>
          <p>
            You start with 3 lives. Wrong answers and timeouts cost a life.
            Lose all 3 and the game is over. First to 10 correct wins.
          </p>
        </div>

        <div className="HowToPlay-section">
          <h3>Game Modes</h3>
          <p>
            <strong>Quick Play</strong> — random songs from all eras.
            <br />
            <strong>Daily Challenge</strong> — same 10 songs for everyone today.
            Compare scores on the leaderboard. One attempt per day.
            <br />
            <strong>Decade Mode</strong> — play songs from a specific era (70s,
            80s, 90s...).
            <br />
            <strong>Hard Mode</strong> — only obscure tracks.
          </p>
        </div>

        <div className="HowToPlay-section">
          <h3>Party Mode</h3>
          <p>
            Start a party from the home screen. A TV display opens in a new tab
            — put it on the big screen (laptop, TV, projector). Friends scan the
            QR code with their phones to join as controllers. Everyone plays on
            their phone while the TV shows the game.
          </p>
        </div>

        <button className="btn btn-primary" onClick={onClose}>
          Got it
        </button>
      </div>
    </div>
  );
}
