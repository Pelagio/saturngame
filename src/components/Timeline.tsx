import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { useGameContext } from "../GameContext";
import { useIsMobile } from "../hooks/useMediaQuery";
import { Song } from "../types/game";

function Segment({
  onClick,
  index,
  lastIndex,
  selected,
}: {
  onClick: (index: number) => void;
  index: number;
  lastIndex: number;
  selected: boolean;
}) {
  return (
    <div
      className="Segment"
      role="button"
      tabIndex={0}
      aria-label={
        index === 0
          ? "Place before all songs"
          : index === lastIndex
            ? "Place after all songs"
            : `Place in position ${index}`
      }
      onClick={() => onClick(index)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick(index);
        }
      }}
      style={selected ? { backgroundColor: "var(--color-gold)" } : {}}
    >
      {index === 0 ? "BEFORE" : index !== lastIndex ? "<--->" : "AFTER"}
    </div>
  );
}

function SongPin({ song }: { song: Partial<Song> }) {
  return (
    <div className="SongPin">
      <span>{song.year}</span>
      <div className="SongPin-inner" />
    </div>
  );
}

function DesktopTimeline() {
  const { gameId } = useParams();
  const {
    lockAnswer,
    correctAnswers: years = [],
    currentSong,
  } = useGameContext();
  const [selectedSegment, setSelectedSegment] = useState<number>();

  const onSegmentPress = (segmentIndex: number) => {
    lockAnswer(gameId || "", segmentIndex);
    setSelectedSegment(segmentIndex);
  };

  useEffect(() => {
    setSelectedSegment(undefined);
  }, [currentSong]);

  if (!currentSong) return null;

  return (
    <div className="Timeline" role="group" aria-label="Song timeline">
      <Segment
        onClick={onSegmentPress}
        index={0}
        lastIndex={years.length}
        selected={selectedSegment === 0}
      />
      {years.map((y, index) => (
        <React.Fragment key={y.song_id}>
          <SongPin song={y} />
          <Segment
            onClick={onSegmentPress}
            index={index + 1}
            lastIndex={years.length}
            selected={!!(selectedSegment && index === selectedSegment - 1)}
          />
        </React.Fragment>
      ))}
    </div>
  );
}

// --- Mobile: tap-to-select timeline ---

function MobileSegment({
  index,
  label,
  selected,
  locked,
  onSelect,
}: {
  index: number;
  label: string;
  selected: boolean;
  locked: boolean;
  onSelect: (index: number) => void;
}) {
  return (
    <button
      className={`MobileSegment ${selected ? "selected" : ""} ${locked ? "locked" : ""}`}
      onClick={() => onSelect(index)}
      aria-label={`Place here: ${label}`}
      aria-pressed={selected}
    >
      <span className="MobileSegment-label">{label}</span>
      {selected && !locked && (
        <span className="MobileSegment-hint">Tap LOCK to confirm</span>
      )}
      {locked && <span className="MobileSegment-locked">LOCKED</span>}
    </button>
  );
}

function MobileYearPin({ year }: { year: number }) {
  return (
    <div className="MobileYearPin">
      <div className="MobileYearPin-dot" />
      <span className="MobileYearPin-year">{year}</span>
      <div className="MobileYearPin-line" />
    </div>
  );
}

function MobileTimeline() {
  const { gameId } = useParams();
  const {
    lockAnswer,
    correctAnswers: years = [],
    currentSong,
  } = useGameContext();
  const [selected, setSelected] = useState<number | null>(null);
  const [locked, setLocked] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSelected(null);
    setLocked(false);
  }, [currentSong]);

  if (!currentSong) return null;

  const handleSelect = (index: number) => {
    if (locked) return;
    setSelected(index);
  };

  const handleLock = () => {
    if (selected === null || locked) return;
    setLocked(true);
    lockAnswer(gameId || "", selected);
  };

  // Build the list: segment, year, segment, year, ..., segment
  const items: React.ReactNode[] = [];

  // First segment: "Before [first year]"
  const firstYear = years[0]?.year;
  items.push(
    <MobileSegment
      key="seg-0"
      index={0}
      label={firstYear ? `Before ${firstYear}` : "Before"}
      selected={selected === 0}
      locked={locked && selected === 0}
      onSelect={handleSelect}
    />,
  );

  years.forEach((song, i) => {
    items.push(<MobileYearPin key={`pin-${song.song_id}`} year={song.year} />);

    const nextYear = years[i + 1]?.year;
    const segLabel = nextYear
      ? `${song.year} — ${nextYear}`
      : `After ${song.year}`;

    items.push(
      <MobileSegment
        key={`seg-${i + 1}`}
        index={i + 1}
        label={segLabel}
        selected={selected === i + 1}
        locked={locked && selected === i + 1}
        onSelect={handleSelect}
      />,
    );
  });

  return (
    <div className="MobileTimeline" role="group" aria-label="Song timeline">
      <div className="MobileTimeline-list" ref={listRef}>
        {items}
      </div>
      <button
        className={`MobileTimeline-lock ${selected !== null && !locked ? "ready" : ""}`}
        onClick={handleLock}
        disabled={selected === null || locked}
        aria-label="Lock answer"
      >
        {locked ? "LOCKED" : "LOCK"}
      </button>
    </div>
  );
}

export function Timeline() {
  const isMobile = useIsMobile();
  return isMobile ? <MobileTimeline /> : <DesktopTimeline />;
}
