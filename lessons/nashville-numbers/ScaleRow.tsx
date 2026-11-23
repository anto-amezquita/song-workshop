"use client";

import { RollText } from "@/components/lesson/RollText";
import { stepPattern, type Scale } from "@/lib/music/theory";
import { useLit } from "./lights";
import "./ScaleRow.css";

type Props = {
  scale: Scale;
};

const NOTES = [0, 1, 2, 3, 4, 5, 6, 7] as const;

/**
 * The scale as eight numbered notes, the octave dashed, with the whole (W) and
 * half (H) steps between them. Note names roll in on load and when the key
 * changes, 35ms apart.
 */
export function ScaleRow({ scale }: Props) {
  const steps = stepPattern(scale);
  return (
    <div className="scale-row">
      {NOTES.map((i) => (
        <ScaleNote
          key={i}
          index={i}
          name={scale[i % 7]!.name}
          step={i < 7 ? steps[i] : undefined}
        />
      ))}
    </div>
  );
}

type NoteProps = {
  /** 0–7; 7 is the octave. */
  index: number;
  name: string;
  /** "W" or "H" to the next note; none after the octave. */
  step?: string;
};

/** One note. It reads its own lit state, so lighting it re-renders only this note. */
function ScaleNote({ index, name, step }: NoteProps) {
  const lit = useLit((lights) => lights.notes.includes(index));
  return (
    <div
      className="scale-row__note"
      data-octave={index === 7 || undefined}
      data-home={index === 0 || undefined}
      data-lit={lit || undefined}
    >
      <div className="scale-row__dot">
        <RollText text={name} delay={index * 35} rollOnMount />
      </div>
      <span className="scale-row__degree">{index === 7 ? 1 : index + 1}</span>
      {step ? (
        <span className="scale-row__step" data-half={step === "H" || undefined}>
          {step}
        </span>
      ) : null}
    </div>
  );
}
