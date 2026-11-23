"use client";

import { useState } from "react";
import "./RollText.css";

type Props = {
  text: string;
  /** Wait this long before rolling, for staggers across a row (ms). */
  delay?: number;
  /**
   * Roll on the first render too. The file rolls in the key pills, scale notes
   * and chord cards on load, but not the key name. The class is in the
   * prerendered HTML, so the roll plays before JavaScript runs.
   */
  rollOnMount?: boolean;
};

/**
 * Text that rolls in from below when it changes, so you see what changed
 * (brand.md §16). Rendering the same text again does nothing.
 */
export function RollText({ text, delay = 0, rollOnMount = false }: Props) {
  // A new generation on every change remounts the span, which restarts the animation.
  const [shown, setShown] = useState({ text, generation: 0, rolling: rollOnMount });
  if (shown.text !== text) {
    setShown({ text, generation: shown.generation + 1, rolling: true });
  }
  return (
    <span
      key={shown.generation}
      className="roll-text"
      data-rolling={shown.rolling || undefined}
      style={shown.rolling && delay ? { animationDelay: `${delay}ms` } : undefined}
    >
      {text}
    </span>
  );
}
