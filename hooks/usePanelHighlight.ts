"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/** How long a panel stays highlighted, as in the file. */
export const HIGHLIGHT_MS = 2600;

/**
 * One highlighted panel at a time: its border turns accent with a soft ring,
 * for 2.6 seconds. If the panel isn't fully on screen, it scrolls to the
 * middle, smoothly unless reduced motion is on (port spec FR-11).
 */
export function usePanelHighlight<Id extends string>() {
  const [highlighted, setHighlighted] = useState<Id | null>(null);
  const panels = useRef(new Map<Id, HTMLElement>());
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  /** A ref callback for the panel with this id. */
  const register = useCallback(
    (id: Id) => (element: HTMLElement | null) => {
      if (element) panels.current.set(id, element);
      else panels.current.delete(id);
    },
    [],
  );

  const highlight = useCallback((id: Id) => {
    setHighlighted(id);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setHighlighted(null), HIGHLIGHT_MS);

    const panel = panels.current.get(id);
    if (!panel) return;
    const rect = panel.getBoundingClientRect();
    if (rect.top < 0 || rect.bottom > window.innerHeight) {
      const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
      panel.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "center" });
    }
  }, []);

  return { highlighted, highlight, register };
}
