"use client";

import type { Ref } from "react";
import { RollText } from "@/components/lesson/RollText";
import type { Chord, Degree } from "@/lib/music/theory";
import { chordCardName } from "./copy";
import type { Labels } from "./model";
import "./ChordGrid.css";

type Props = {
  chords: readonly Chord[];
  labels: Labels;
  /** The chord card that's lit. */
  lit: Degree | null;
  onTap: (degree: Degree) => void;
  /** The first card, so focus can go there when the progression empties (FR-07). */
  firstChordRef?: Ref<HTMLButtonElement>;
};

/**
 * The seven chords of the key, the lesson's instrument. Tapping one plays it.
 * Labels roll in on load and when the key or labels change, 40ms apart.
 */
export function ChordGrid({ chords, labels, lit, onTap, firstChordRef }: Props) {
  return (
    <div className="chord-grid">
      {chords.map((chord, i) => {
        const [primary, secondary] =
          labels === "numbers" ? [chord.number, chord.name] : [chord.name, chord.number];
        return (
          <button
            key={chord.degree}
            ref={i === 0 ? firstChordRef : undefined}
            type="button"
            className="chord-grid__chord"
            aria-label={chordCardName(primary, secondary, chord)}
            data-dim={chord.quality === "dim" || undefined}
            data-home={i === 0 || undefined}
            data-lit={lit === chord.degree || undefined}
            onClick={() => onTap(chord.degree)}
          >
            {/* Spaces between the labels, so the visible text reads "6m Am minor"
                and the name contains it (WCAG 2.5.3, C-15). */}
            <span className="chord-grid__primary">
              <RollText text={primary} delay={i * 40} rollOnMount />
            </span>{" "}
            <span className="chord-grid__secondary">
              <RollText text={secondary} delay={i * 40 + 40} rollOnMount />
            </span>{" "}
            <span className="chord-grid__quality">{chord.quality}</span>
          </button>
        );
      })}
    </div>
  );
}
