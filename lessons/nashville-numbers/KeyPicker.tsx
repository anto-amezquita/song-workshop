"use client";

import { memo, type KeyboardEvent } from "react";
import { RollText } from "@/components/lesson/RollText";
import { nextRadioIndex } from "@/components/lesson/radioKeys";
import { useSlidingIndicator } from "@/hooks/useSlidingIndicator";
import { KEYS, type Key, type Tonality } from "@/lib/music/theory";
import { pillLabel, pillName } from "./copy";
import "./KeyPicker.css";

type Props = {
  value: Key;
  tonality: Tonality;
  onChange: (key: Key) => void;
};

/**
 * The 12 keys on the circle of fifths, as a radio group with a sliding
 * indicator. In minor, each pill shows its relative minor. Arrow keys move the
 * choice (C-01), and each pill has its full name for screen readers (C-11).
 */
export const KeyPicker = memo(function KeyPicker({ value, tonality, onChange }: Props) {
  const { container, indicator } = useSlidingIndicator<HTMLDivElement, HTMLSpanElement>({
    deps: [value, tonality],
  });

  function onKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    const next = nextRadioIndex(event.key, index, KEYS.length);
    if (next === null) return;
    event.preventDefault();
    onChange(KEYS[next]!);
    container.current?.querySelectorAll<HTMLButtonElement>('[role="radio"]')[next]?.focus();
  }

  return (
    <div ref={container} className="key-picker" role="radiogroup" aria-label="Choose a key">
      <span ref={indicator} className="key-picker__indicator" aria-hidden="true" />
      {KEYS.map((key, i) => {
        const checked = key === value;
        return (
          <button
            key={key}
            type="button"
            role="radio"
            aria-checked={checked}
            aria-label={pillName(key, tonality)}
            tabIndex={checked ? 0 : -1}
            className="key-picker__pill"
            onClick={() => onChange(key)}
            onKeyDown={(event) => onKeyDown(event, i)}
          >
            <RollText text={pillLabel(key, tonality)} delay={i * 18} rollOnMount />
          </button>
        );
      })}
    </div>
  );
});
