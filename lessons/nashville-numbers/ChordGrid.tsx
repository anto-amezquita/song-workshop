"use client";

import type { Ref } from "react";
import { RollText } from "@/components/lesson/RollText";
import type { Chord, Degree } from "@/lib/music/theory";
import { chordCardName } from "./copy";
import { useLit } from "./lights";
import type { Labels } from "./model";
import "./ChordGrid.css";

type Props = {
  chords: readonly Chord[];
  labels: Labels;
  onTap: (degree: Degree) => void;
  /** The first card, so focus can go there when the progression empties (FR-07). */
  firstChordRef?: Ref<HTMLButtonElement>;
};

/**
 * The seven chords of the key, the lesson's instrument. Tapping one plays it.
 * Labels roll in on load and when the key or labels change, 40ms apart.
 */
export function ChordGrid({ chords, labels, onTap, firstChordRef }: Props) {
  return (
    <div className="chord-grid">
      {chords.map((chord, i) => (
        <ChordCard
          key={chord.degree}
          chord={chord}
          index={i}
          labels={labels}
          onTap={onTap}
          cardRef={i === 0 ? firstChordRef : undefined}
        />
      ))}
    </div>
  );
}

type CardProps = {
  chord: Chord;
  index: number;
  labels: Labels;
  onTap: (degree: Degree) => void;
  cardRef?: Ref<HTMLButtonElement>;
};

/** One chord. It reads its own lit state, so lighting it re-renders only this card. */
function ChordCard({ chord, index, labels, onTap, cardRef }: CardProps) {
  const lit = useLit((lights) => lights.chord === chord.degree);
  const [primary, secondary] =
    labels === "numbers" ? [chord.number, chord.name] : [chord.name, chord.number];
  return (
    <button
      ref={cardRef}
      type="button"
      className="chord-grid__chord"
      aria-label={chordCardName(primary, secondary, chord)}
      data-dim={chord.quality === "dim" || undefined}
      data-home={index === 0 || undefined}
      data-lit={lit || undefined}
      onClick={() => onTap(chord.degree)}
    >
      {/* Spaces between the labels, so the visible text reads "6m Am minor"
          and the name contains it (WCAG 2.5.3, C-15). */}
      <span className="chord-grid__primary">
        <RollText text={primary} delay={index * 40} rollOnMount />
      </span>{" "}
      <span className="chord-grid__secondary">
        <RollText text={secondary} delay={index * 40 + 40} rollOnMount />
      </span>{" "}
      <span className="chord-grid__quality">{chord.quality}</span>
    </button>
  );
}
