"use client";

import { RollText } from "@/components/lesson/RollText";
import { stepPattern, type Scale } from "@/lib/music/theory";
import "./ScaleRow.css";

type Props = {
  scale: Scale;
  /** Lit notes, 0–7 (7 is the octave). */
  lit: readonly number[];
};

const NOTES = [0, 1, 2, 3, 4, 5, 6, 7] as const;

/**
 * The scale as eight numbered notes, the octave dashed, with the whole (W) and
 * half (H) steps between them. Note names roll in on load and when the key
 * changes, 35ms apart.
 */
export function ScaleRow({ scale, lit }: Props) {
  const steps = stepPattern(scale);
  return (
    <div className="scale-row">
      {NOTES.map((i) => (
        <div
          key={i}
          className="scale-row__note"
          data-octave={i === 7 || undefined}
          data-home={i === 0 || undefined}
          data-lit={lit.includes(i) || undefined}
        >
          <div className="scale-row__dot">
            <RollText text={scale[i % 7]!.name} delay={i * 35} rollOnMount />
          </div>
          <span className="scale-row__degree">{i === 7 ? 1 : i + 1}</span>
          {i < 7 ? (
            <span className="scale-row__step" data-half={steps[i] === "H" || undefined}>
              {steps[i]}
            </span>
          ) : null}
        </div>
      ))}
    </div>
  );
}
