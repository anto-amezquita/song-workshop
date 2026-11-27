/**
 * TEMPORARY OVERRIDE (decisions/0007, AME-97). Stands in for `react-remove-scroll-bar`.
 *
 * The design system's Drawer is a Radix dialog, which locks page scroll with
 * `react-remove-scroll`. That library's `RemoveScrollBar` adds a `<style>` element
 * to the page, and our CSP (`style-src 'self'`) blocks it, so every open drawer
 * reported a violation. `next.config.ts` points the package here instead, and
 * this `RemoveScrollBar` renders nothing. The site bar locks the
 * page with a class while the drawer is open (`SiteBar`, `styles/global.css`).
 *
 * `react-remove-scroll` still stops wheel and touch scrolling behind the drawer
 * with its own event handlers; only the injected CSS is gone.
 *
 * Remove this file, the alias and the class lock once the design system's
 * Drawer locks scroll without adding a `<style>` element.
 */

// The class names are the real ones, so anything that marks fixed elements with them keeps working.
export {
  zeroRightClassName,
  fullWidthClassName,
  noScrollbarsClassName,
  removedBarSizeVariable,
} from "react-remove-scroll-bar/constants";

type GapOffset = { left: number; top: number; right: number; gap: number };

/** Nothing here measures the scrollbar any more; the class lock keeps its gutter instead. */
export const getGapWidth = (): GapOffset => ({ left: 0, top: 0, right: 0, gap: 0 });

export const RemoveScrollBar = (): null => null;
