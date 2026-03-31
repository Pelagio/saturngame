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

function MobileTimeline() {
  const { gameId } = useParams();
  const timelineRef = useRef<HTMLDivElement | null>(null);
  const {
    lockAnswer,
    correctAnswers: years = [],
    currentSong,
  } = useGameContext();

  if (!currentSong) return null;

  return (
    <div className="Timeline" role="group" aria-label="Song timeline">
      <div className="Timeline-Cursor">
        <h2>AFTER:</h2>
        <div
          style={{ width: "100%", height: "2px", backgroundColor: "white" }}
        />
        <h2>BEFORE:</h2>
      </div>
      <button
        className="Timeline-LockButton"
        aria-label="Lock answer"
        onClick={() => {
          const scrollTop = timelineRef.current?.scrollTop ?? 0;
          lockAnswer(gameId || "", Math.round(scrollTop / 62));
        }}
      >
        LOCK
      </button>
      <div className="Timeline-List" ref={timelineRef}>
        <div className="Timeline-List-Spacer" />
        <div className="Timeline-List-Spacer" />
        {[...years].map((y) => (
          <React.Fragment key={y.song_id}>
            <SongPin song={y} />
          </React.Fragment>
        ))}
        <div className="Timeline-List-Spacer" />
        <div className="Timeline-List-Spacer" />
        <div className="Timeline-List-Spacer" />
      </div>
    </div>
  );
}

export function Timeline() {
  const isMobile = useIsMobile();
  return isMobile ? <MobileTimeline /> : <DesktopTimeline />;
}
