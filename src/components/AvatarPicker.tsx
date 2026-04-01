import "./AvatarPicker.css";

const AVATARS = [
  "\u{1F3B5}", // musical note
  "\u{1F3B8}", // guitar
  "\u{1F3B9}", // keyboard
  "\u{1F3A4}", // microphone
  "\u{1F3B6}", // notes
  "\u{1F525}", // fire
  "\u{2B50}", // star
  "\u{1F680}", // rocket
  "\u{1F308}", // rainbow
  "\u{26A1}", // lightning
  "\u{1F48E}", // gem
  "\u{1F3AF}", // target
  "\u{1F431}", // cat
  "\u{1F436}", // dog
  "\u{1F984}", // unicorn
  "\u{1F47E}", // alien
  "\u{1F916}", // robot
  "\u{1F47B}", // ghost
  "\u{1F60E}", // sunglasses
  "\u{1F929}", // star-eyes
];

export { AVATARS };

export function AvatarPicker({
  selected,
  onSelect,
}: {
  selected: string;
  onSelect: (avatar: string) => void;
}) {
  return (
    <div className="AvatarPicker">
      {AVATARS.map((emoji) => (
        <button
          key={emoji}
          className={`AvatarPicker-item ${selected === emoji ? "selected" : ""}`}
          onClick={() => onSelect(emoji)}
          aria-label={`Select avatar ${emoji}`}
          aria-pressed={selected === emoji}
        >
          {emoji}
        </button>
      ))}
    </div>
  );
}

export function AvatarDisplay({
  avatar,
  size = 32,
}: {
  avatar?: string;
  size?: number;
}) {
  if (!avatar) return null;
  return (
    <span className="AvatarDisplay" style={{ fontSize: size }}>
      {avatar}
    </span>
  );
}
