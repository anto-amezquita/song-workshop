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
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  const [{ panels, register }] = useState(() => {
    const panels = new Map<Id, HTMLElement>();
    const refs = new Map<Id, (element: HTMLElement | null) => void>();
    /**
     * A ref callback for the panel with this id: the same function on every
     * render, so React doesn't detach and re-attach it, and a memoised panel
     * that receives it doesn't re-render.
     */
    const register = (id: Id) => {
      let ref = refs.get(id);
      if (!ref) {
        ref = (element) => {
          if (element) panels.set(id, element);
          else panels.delete(id);
        };
        refs.set(id, ref);
      }
      return ref;
    };
    return { panels, register };
  });

  const highlight = useCallback(
    (id: Id) => {
      setHighlighted(id);
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setHighlighted(null), HIGHLIGHT_MS);

      const panel = panels.get(id);
      if (!panel) return;
      const rect = panel.getBoundingClientRect();
      if (rect.top < 0 || rect.bottom > window.innerHeight) {
        const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
        panel.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "center" });
      }
    },
    [panels],
  );

  return { highlighted, highlight, register };
}
