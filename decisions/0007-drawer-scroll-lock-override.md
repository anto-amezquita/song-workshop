# 0007 — The drawer's scroll lock, without an injected `<style>` (temporary)

## Status

Accepted (2026-11-27), as a temporary override. Issue: AME-97. Design system issue: AME-101. Spec: `specs/2026-11-27-lesson-navigation.md` (D-A, N-2, §9.1).

## Context

The lessons menu opens in the design system's `Drawer`, which is a Radix dialog. Radix locks page scroll with `react-remove-scroll`, and its `RemoveScrollBar` adds a `<style>` element to the page when the drawer opens. Our CSP is `style-src 'self'` (decisions/0006), so the browser blocks that element and reports a violation. Tested on a production build: one `style-src-elem` violation per opening, at 375px and 1280px. Wheel and touch scrolling stayed locked, because the library also blocks them with event handlers. What was lost is `overflow: hidden`.

Neither `Drawer` nor Radix's dialog has a prop to turn the injected style off.

## Decision

Keep the CSP as it is. In `next.config.ts`, `turbopack.resolveAlias` points `react-remove-scroll-bar` at a local stand-in, `lib/overrides/react-remove-scroll-bar.ts`, whose `RemoveScrollBar` renders nothing. Vitest loads packages straight from `node_modules`, so the alias doesn't reach component tests. The e2e tests check it on the built site instead.

`SiteBar` puts the class `site-scroll-locked` on `<html>` while its drawer is open, and `styles/global.css` sets `overflow: hidden` and `scrollbar-gutter: stable` under it. That brings back what the blocked CSS did, and keeping the scrollbar's gutter means the page doesn't shift sideways while the drawer is open.

It's marked temporary in each place.

## Alternatives considered

- **Allow inline styles in `style-src`.** Rejected by Antonio: it weakens the CSP for every page.
- **An npm `overrides` entry** pointing the package at a local folder. It does the same thing through the lockfile, which is harder to see and to undo.
- **Wait for a design system fix.** It would hold up AME-97, and with it the melody lesson (AME-95).

## Consequences

### Positive

- No CSP violations, and the CSP stays as strict as before.
- The e2e tests open the drawer under the production CSP, so a regression fails CI.

### Negative

- Any other Radix overlay from the design system (`Dialog`, `Sheet`) also loses its injected CSS here, and locks scroll only through its event handlers unless it sets the class too. Only the lessons drawer is used today.
- An alias on a transitive dependency is easy to forget. The stand-in's header says when to remove it.

## When to remove it

When the design system's `Drawer` locks scroll without adding a `<style>` element. Antonio asked for that in the design system issue AME-101 (2026-11-27). Once a release with it is installed, delete the stand-in, the alias, the class and its CSS rule, and mark this record superseded.

## Related files

- `lib/overrides/react-remove-scroll-bar.ts`
- `next.config.ts`
- `components/site/SiteBar.tsx`, `styles/global.css`
- `vercel.json` (the CSP, unchanged)
