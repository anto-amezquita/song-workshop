"use client";

import { useCallback, useEffect, useLayoutEffect, useRef } from "react";

type Options = {
  /** Finds the chosen option inside the container. */
  selector?: string;
  /**
   * Anything that can change where the chosen option is or how big it is:
   * the choice itself, and the labels (a pill reading "F♯m" is wider than "F").
   * Keep each value stable between renders, or it measures on every render.
   */
  deps: readonly unknown[];
};

/**
 * Moves the indicator onto the chosen option. Plain DOM: it writes the
 * indicator's position and size straight to its style, so moving it never
 * re-renders anything.
 *
 * The first placement is instant: on load the indicator appears in place,
 * instead of growing out of the top-left corner as in the file (port spec C-14).
 * Until then, the container has no `data-measured`, and its CSS fills the
 * chosen option itself, so it reads correctly before JavaScript runs.
 */
function placeIndicator(box: HTMLElement | null, thumb: HTMLElement | null, selector: string) {
  const chosen = box?.querySelector<HTMLElement>(selector);
  if (!box || !thumb || !chosen) return;

  const first = !box.hasAttribute("data-measured");
  if (first) thumb.style.transition = "none";
  thumb.style.transform = `translate(${chosen.offsetLeft}px, ${chosen.offsetTop}px)`;
  thumb.style.width = `${chosen.offsetWidth}px`;
  thumb.style.height = `${chosen.offsetHeight}px`;
  if (first) {
    box.setAttribute("data-measured", "");
    void thumb.offsetWidth; // apply the position before transitions come back
    thumb.style.transition = "";
  }
}

/**
 * Slides an indicator to the chosen option (decisions/0003). Put `container`
 * on the element the options sit in and `indicator` on the thumb. It measures
 * when `deps` change, on resize, and once fonts have loaded, never per frame
 * (architecture.md §12).
 */
export function useSlidingIndicator<
  C extends HTMLElement = HTMLElement,
  I extends HTMLElement = HTMLElement,
>({ selector = '[aria-checked="true"]', deps }: Options) {
  const container = useRef<C>(null);
  const indicator = useRef<I>(null);

  const place = useCallback(
    () => placeIndicator(container.current, indicator.current, selector),
    [selector],
  );

  // After the DOM has the new choice and labels, before paint.
  useLayoutEffect(place, [place, ...deps]);

  useEffect(() => {
    window.addEventListener("resize", place);
    let live = true;
    document.fonts?.ready.then(() => {
      if (live) place();
    });
    return () => {
      live = false;
      window.removeEventListener("resize", place);
    };
  }, [place]);

  return { container, indicator };
}
