"use client";

import type { KeyboardEvent } from "react";
import { useSlidingIndicator } from "@/hooks/useSlidingIndicator";
import { nextRadioIndex } from "./radioKeys";
import "./SegmentSwitch.css";

export type SegmentOption<V extends string> = { value: V; label: string };

type Props<V extends string> = {
  /** The group's name for screen readers ("Mode", "Show"). */
  label: string;
  options: readonly SegmentOption<V>[];
  value: V;
  onChange: (value: V) => void;
  size?: "default" | "small";
};

/**
 * A two-to-five-way switch whose thumb slides to the chosen option
 * (decisions/0003). A radio group: only the chosen option is in the tab
 * order, and the arrow keys move the choice, wrapping at the ends (port spec C-01).
 */
export function SegmentSwitch<V extends string>({
  label,
  options,
  value,
  onChange,
  size = "default",
}: Props<V>) {
  const { container, indicator: thumb } = useSlidingIndicator<HTMLDivElement, HTMLSpanElement>({
    deps: [value, options],
  });

  function onKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    const next = nextRadioIndex(event.key, index, options.length);
    if (next === null) return;
    event.preventDefault();
    onChange(options[next]!.value);
    container.current?.querySelectorAll<HTMLButtonElement>('[role="radio"]')[next]?.focus();
  }

  return (
    <div
      ref={container}
      className="segment-switch"
      data-size={size}
      role="radiogroup"
      aria-label={label}
    >
      <span ref={thumb} className="segment-switch__thumb" aria-hidden="true" />
      {options.map((option, i) => {
        const checked = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={checked}
            tabIndex={checked ? 0 : -1}
            className="segment-switch__option"
            onClick={() => onChange(option.value)}
            onKeyDown={(event) => onKeyDown(event, i)}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
