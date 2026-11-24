"use client";

import { useLayoutEffect, useRef } from "react";
import { RollText } from "@/components/lesson/RollText";
import {
  progressionPattern,
  type Chord,
  type Degree,
  type Scale,
  type Tonality,
} from "@/lib/music/theory";
import { EMPTY_PROGRESSION, removeBarName } from "./copy";
import { useLit } from "./lights";
import type { Labels } from "./model";
import { PRESETS, type PresetId } from "./presets";
import "./ProgressionBuilder.css";

type Props = {
  tonality: Tonality;
  scale: Scale;
  chords: readonly Chord[];
  labels: Labels;
  progression: readonly Degree[];
  preset: PresetId | null;
  building: boolean;
  /** Changes whenever the row is rebuilt, so every slot pops in again (§3.5). */
  generation: number;
  onPreset: (id: PresetId) => void;
  onBuild: () => void;
  onRemove: (index: number) => void;
  /** Focus goes here when the last chord is removed (FR-07). */
  focusFirstChord: () => void;
};

/** Preset chips, "Build your own", and one slot per bar. */
export function ProgressionBuilder({
  tonality,
  scale,
  chords,
  labels,
  progression,
  preset,
  building,
  generation,
  onPreset,
  onBuild,
  onRemove,
  focusFirstChord,
}: Props) {
  const slots = useRef<HTMLOListElement>(null);
  const removed = useRef<number | null>(null);

  // After a removal: focus the slot now in that place, else the one before,
  // else the first chord card (FR-07).
  useLayoutEffect(() => {
    const index = removed.current;
    if (index === null) return;
    removed.current = null;
    if (progression.length === 0) {
      focusFirstChord();
      return;
    }
    const buttons = slots.current?.querySelectorAll<HTMLButtonElement>("button");
    buttons?.[Math.min(index, progression.length - 1)]?.focus();
  }, [progression, focusFirstChord]);

  function remove(index: number) {
    removed.current = index;
    onRemove(index);
  }

  return (
    <>
      <div className="progression__chips">
        {PRESETS[tonality].map((p) => (
          <button
            key={p.id}
            type="button"
            className="progression__chip"
            aria-pressed={preset === p.id && !building}
            onClick={() => onPreset(p.id)}
          >
            {p.name} <small>{progressionPattern(chords, p.degrees)}</small>
          </button>
        ))}
        <button
          type="button"
          className="progression__chip"
          data-build
          aria-pressed={building}
          onClick={onBuild}
        >
          Build your own
        </button>
      </div>

      {progression.length === 0 ? (
        <div className="progression__slots">
          <p className="progression__empty">{EMPTY_PROGRESSION}</p>
        </div>
      ) : (
        <ol
          ref={slots}
          className="progression__slots"
          aria-label="Progression"
          data-building={building || undefined}
        >
          {progression.map((degree, i) => (
            <Slot
              key={`${generation}-${i}`}
              index={i}
              chord={chords[degree]!}
              scale={scale}
              labels={labels}
              onRemove={building ? remove : undefined}
            />
          ))}
        </ol>
      )}
    </>
  );
}

type SlotProps = {
  index: number;
  chord: Chord;
  scale: Scale;
  labels: Labels;
  /** Set in building mode, where the slot is a button that removes its bar (R3). */
  onRemove?: (index: number) => void;
};

/** One bar. It reads its own lit state, so playing it re-renders only this slot. */
function Slot({ index, chord, scale, labels, onRemove }: SlotProps) {
  const lit = useLit((lights) => lights.slot === index);
  const [primary, secondary] =
    labels === "numbers" ? [chord.number, chord.name] : [chord.name, chord.number];
  const content = (
    <>
      <span className="progression__bar">Bar {index + 1}</span>{" "}
      <span className="progression__primary">
        <RollText text={primary} delay={index * 45} />
      </span>{" "}
      <span className="progression__secondary">
        <RollText text={secondary} delay={index * 45 + 40} />
      </span>
    </>
  );
  const slotProps = {
    className: "progression__slot",
    "data-lit": lit || undefined,
    style: { animationDelay: `${index * 50}ms` },
  };
  return (
    <li>
      {onRemove ? (
        <button
          type="button"
          {...slotProps}
          title="Tap to remove"
          aria-label={removeBarName(index, primary, secondary, chord, scale)}
          onClick={() => onRemove(index)}
        >
          {content}
        </button>
      ) : (
        <div {...slotProps}>{content}</div>
      )}
    </li>
  );
}
