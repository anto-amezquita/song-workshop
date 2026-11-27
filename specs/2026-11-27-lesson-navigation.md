# Lesson navigation: a top bar and a lessons drawer

> **Status (2026-11-27): built, not yet reviewed.** Steps 1–4 are done. Antonio chose Design option A: a white band, with Lessons first and then the site's name. Issue: AME-97. Blocks AME-95 (the melody lesson).
>
> - **Facts** are what the repo or `@amezquita/design-system` 1.7.0 does today. They're written plainly.
> - **Decisions** have an ID. Antonio made all five on 2026-11-27: `D-A` to `D-C` first, then `N-1` and `N-2` after the test.
> - **Build rules** in `AGENTS.md` apply: design system tokens and components only, gaps are flagged and not invented, and anything custom is listed at the end of the task.

---

## 1. Overview

### Summary

Add a thin bar across the top of every page. It holds the Song Workshop name and a Lessons button. The button opens a drawer from the left that lists every lesson in `lessons/registry.ts`. There's no permanent left column at any screen size.

### Problem

Song Workshop has one lesson, and nothing on the page leads anywhere else. The melody lesson (AME-95) is next, and it can't go live until people can get from one lesson to the other.

### Intended users

- **People using a lesson**, who want to find or switch to another lesson. Who they are exactly is still open (`product-north-star.md` §11). The menu doesn't need the answer.
- **Whoever adds the next lesson.** A registry entry should be all it takes to appear in the menu.

### Desired outcome

From any page, one tap on Lessons shows every lesson, with the current one marked. One more tap goes there. The lesson underneath looks and behaves as it does today.

---

## 2. Goals and non-goals

### Goals

- A top bar on every page, including the 404 page.
- A lessons drawer that works the same on every screen size, by touch, mouse and keyboard.
- The menu built from `lessons/registry.ts`, so a new lesson needs no menu edit.
- No change to the production CSP (`D-A`).

### Non-goals

- The lesson index at `/`. `/` keeps showing Nashville Number Lab until it has its own spec (`architecture.md` §4).
- A permanent left column, or any change to the lesson path (`D-B`).
- Grouping lessons into sections or a course order (`product-north-star.md` §11 has that question open).
- Any change inside `@amezquita/design-system`. Gaps become issues in Linear's Design system project.

### Success criteria

- On every page, the drawer opens from the bar, lists every lesson, marks the current one and goes there.
- Under the production CSP, opening and closing the drawer causes no violations, and the page behind doesn't scroll while it's open.
- Keyboard-only use works, and axe passes with the drawer closed and open, in light and dark.
- Nashville Number Lab looks the same as before, apart from the bar above it.

---

## 3. User experience

### Main flow

1. The person sees the bar at the top of the page: "Lessons" on the left, where the drawer opens, then "Song Workshop".
2. They press Lessons. A drawer slides in from the left, titled "Lessons", with focus on the first lesson.
3. The current lesson is marked. They pick another one and go there; the drawer closes on the new page.
4. Or they close it with the close button, Escape, or a tap outside. Focus goes back to Lessons.

### States and edge cases

| Case | Behaviour |
|---|---|
| One lesson (today) | The drawer lists one lesson, marked as current. That's accepted: the menu is needed before the second lesson goes live. |
| `/` | Shows Nashville Number Lab, so Nashville is marked as current. |
| 404 page | The bar and drawer work; no lesson is marked. The page's own text already links to Nashville Number Lab (`app/not-found.tsx`); the drawer adds a way to every other lesson. |
| Drawer open, window resized | It stays open and usable at any width (`D-B`). |
| Reduced motion | The drawer appears and disappears without sliding (`AGENTS.md` build rule 4). |
| No JavaScript | The bar shows, and the Song Workshop name still links to `/`. The Lessons button does nothing. *Assumption:* fine, since the lessons themselves need JavaScript. |

### UX notes

- **The button has a visible label, "Lessons".** It isn't icon-only, because a lone hamburger icon doesn't say what's behind it (`content.md`, navigation labels match user language). Final wording is checked in the Design step.
- **The bar and the tint.** Each lesson paints its major/minor tint on its own root, which fills the viewport. The bar sits above the lesson, so it doesn't change with tonality. Whether that reads well is checked in the Design step.

---

## 4. Functional requirements

- **F1.** Every page renders the bar: the Song Workshop name, linking to `/`, and a Lessons button.
- **F2.** The Lessons button opens a modal drawer from the left at every viewport width.
- **F3.** The drawer lists one link per entry in `lessons/registry.ts`, in registry order, labelled with the lesson's title and linking to `/lessons/<slug>`.
- **F4.** The link to the current lesson has `aria-current="page"`. On `/`, that's Nashville Number Lab.
- **F5.** On open, focus moves to the first link. On close, focus goes back to the Lessons button.
- **F6.** Escape, the close button and a tap outside close the drawer. So does any change of page, whether from choosing a lesson or the Back button. Choosing the current lesson closes it too. A link opened in a new tab or window, with a modifier key held, leaves it open.
- **F7.** While the drawer is open, the page behind doesn't scroll, and no `<style>` element is added to the page (`D-A`).

---

## 5. Non-functional requirements

- **Accessibility:** the bar is the page's `header` landmark, and the drawer's list is a `nav` named "Lessons". The drawer is a labelled modal dialog. Touch targets meet the design system's `size-touch-target`. Focus is visible on every control.
- **CSP:** no change to `vercel.json`. The e2e CSP test opens the drawer and expects no violations.
- **Tokens:** the bar's and drawer list's CSS use tokens only, with no literal sizes (build rule 1). Motion uses the `song-workshop-` tokens where Song Workshop sets it (build rule 4).
- **Performance:** the drawer's contents mount only when it opens. The bar adds no work to a playback step.

---

## 6. Information architecture and data

- **Routes:** unchanged. `/`, `/lessons/<slug>` per lesson, and the 404 page.
- **Data:** each menu item comes from a `Lesson` in `lessons/registry.ts`: `slug` gives the id and the link, `title` gives the label. Nothing new is stored.
- **Navigation levels:** one flat list. The bar is primary navigation on every page; the lesson path stays the in-page guide.

---

## 7. Technical approach

### Proposed architecture

- **The bar goes in `app/layout.tsx`**, above `children`, so every page gets it, the 404 page included.
- **The current lesson comes from the URL** (`usePathname`), because the root layout doesn't know which route it wraps. `/` maps to the first lesson until there's an index.
- **The drawer is the design system's `Drawer`** (`side="left"`), opened from the bar. Which list goes inside it is `N-1`.
- **Scroll lock (`D-A`).** The design system's `Drawer` is built on a Radix dialog, which locks scrolling with `react-remove-scroll`. When it opens, that library adds a `<style>` element to the page, and our CSP (`style-src 'self'`) blocks it. Song Workshop replaces that with its own lock based on a class or attribute, marked in code as a temporary override, so no `<style>` element is added. How it's switched off is `N-2`.
- **Folder:** the bar and the drawer list live in `components/site/`, because they belong to the site, not to any one lesson. `components/lesson/` stays free of the registry (`architecture.md` §2). It's a new folder, so `architecture.md` §2 and §4 now describe it.

### Reused systems

`Drawer` and `Button` from the design system, `next/link`, the registry, the `song-workshop` brand tokens.

### New technical work

The bar, the drawer list (`N-1`), the scroll-lock override (`N-2`), and a helper that turns the registry into menu items.

---

## 8. Interface and component breakdown

| Part | Source | Custom? |
|---|---|---|
| Top bar | Song Workshop, tokens only | Yes, approved (`D-C`). Listed in the rule 3 report, with the question of whether it belongs in the design system. |
| Lessons button | Design system `Button` | Its inline padding only: `space-2` instead of `button-padding-x`, so its text lines up with the lesson's (§9, design system review). Approved as temporary until AME-104 ships. Listed in the rule 3 report. |
| Drawer | Design system `Drawer` | No |
| Lesson list inside the drawer | Song Workshop, tokens only, until AME-100 ships | Yes (`N-1`). Listed in the rule 3 report. |
| Scroll lock | Song Workshop override | Yes, approved as temporary (`D-A`). Listed in the rule 3 report. |

---

## 9. Decisions, risks and open questions

### Decided (2026-11-27)

- **D-A. CSP stays as it is.** No `'unsafe-inline'` for styles. The drawer's scroll lock is replaced inside Song Workshop by a lock based on a class, marked as a temporary override, so no `<style>` element is added. At the end, it's in the rule 3 report with the question of whether it moves into the design system.
- **D-B. No permanent left column.** The lessons menu is a drawer at every screen size. The lesson path keeps its current behaviour. The page keeps its layout; its maximum width moved from 1140px to the `size-container-wide` token later (§9, design system review).
- **D-C. A thin top bar on every page**, with the Song Workshop name and the Lessons button. It's custom, built with design system tokens only, and in the rule 3 report with the question of whether it belongs in the design system.

- **N-1 → option 3.** A short list of links inside the design system's `Drawer` now, and the design system issue AME-100 for a `SideNav` that's a drawer at every width. When AME-100 ships, the list is swapped for `SideNav`.
- **N-2 → option 1.** A bundler alias, with a decision record marked temporary.

### Design system review (2026-11-27)

- **Scroll lock → design system issue AME-101**, for a `Drawer` that locks scroll without adding a `<style>` element. Song Workshop drops its override once that ships (decisions/0007, "When to remove it").
- **Top bar → stays in Song Workshop** for now. No design system issue yet.
- **Lesson list → swapped for `SideNav` when AME-100 ships**, as decided in `N-1`.
- **See-through backdrop → design system issue AME-102**, for a backdrop token (a colour plus its opacity) that `Drawer` and `Dialog` both use. The design system has none today: `Drawer` paints its backdrop with the solid `color-surface-tertiary`, the only overlay opacity token (`opacity-overlay`) is deprecated and goes in 2.0, and `Drawer` has no prop for its backdrop. The drawer keeps its solid backdrop until AME-102 ships; Song Workshop then gets the new one by upgrading.
- **Content width → the design system's `size-container-wide` (80rem, 1280px)** for both the lesson column and the bar's contents (decided 2026-11-27, after the visual check). The lesson column was a hard-coded 1140px, so it's 140px wider on large screens now. The first version used `space-layout-max-width` (1200px). The code review found it's deprecated and due to be removed (design system decisions/0014), so Antonio chose `size-container-wide` from the scale that replaces it. An e2e test checks the cap at 1600px. The bar's band still runs the full width; its contents sit in that width with the lesson's side padding, so the word "Lessons" starts where the lesson's text does at every screen size.
- **Drawer padding → AME-100.** The drawer's heading and links start 48px in from its edge. That's `Drawer`'s own `space-container-padding-lg`, not the list's, so Song Workshop doesn't override it. The list itself is already as dense as `SideNav`'s (44px rows, 4px apart). `SideNav`'s drawer uses the same `Drawer`, so the ask for a tighter inset is on AME-100.
- **Lessons button padding → a local override, with a design system ask (AME-104).** The ghost `Button`'s 24px inline padding is wider than the page's 16px side padding, so lining up its text by pulling it left would push its box and focus ring off the screen. `Button` has no compact size. This one button sets its `button-padding-x` to `space-2` (8px) and is pulled left by that plus its border. It stays 44px tall. Antonio approved the override as temporary (2026-11-27). It's removed when AME-104 ships a compact ghost `Button`.

### The choices behind N-1 and N-2

- **N-1. `SideNav` can't be a drawer at every width.** In 1.7.0, `SideNavProvider` closes the drawer as soon as the viewport is 1024px or wider, and `SideNavTrigger` hides itself from 1024px. Its `drawer-only` layout is for sites whose desktop navigation is a header menu, so the drawer still exists only below 1024px. Neither can be changed from here without patching the design system. Options:
  1. Put a short list of links (`nav` › `ul` › `next/link`) inside the design system's `Drawer`, styled with tokens. That's custom: a third item for the rule 3 report.
  2. Flag a design system issue for a `SideNav` drawer at every width, and wait for that release before AME-97 ships. That also holds up AME-95.
  3. Option 1 now, plus the design system issue, and swap to `SideNav` once it's released.
- **N-2. How the injected `<style>` is switched off.** The design system's `Drawer` has no prop for it, and neither does Radix's dialog. What the test found is in §9.1. Options:
  1. **A bundler alias.** In `next.config.ts`, `turbopack.resolveAlias` points `react-remove-scroll-bar` at a small local stand-in whose `RemoveScrollBar` renders nothing. The bar then sets its own class on `<html>` while the drawer is open, and `global.css` locks scrolling under that class. Tested in §9.1: no violation. It's a new pattern, so it gets a decision record, marked temporary. *Recommended.*
  2. **An npm `overrides` entry** pointing the package at a local folder. It does the same thing through the lockfile, which is harder to see and to undo.
  3. **A design system fix first** (a `Drawer` scroll lock that adds no `<style>`), with AME-97 waiting for that release.
- **Motion and rule 1 (from the plan, D and E):** these wait. `Drawer` keeps the design system's own slide timing; decisions/0004 already accepts that.

### 9.1 Drawer CSP test (step 1)

Run on 2026-11-27 against a production build served with the `vercel.json` headers, the same way the e2e tests run. A throwaway page opened the design system's `Drawer` (`side="left"`, `size="sm"`) at 375px and 1280px. The page and the test were deleted afterwards.

| | Drawer as shipped | With the alias (N-2, option 1) |
|---|---|---|
| CSP violations on open | 1 (`style-src-elem`), at both widths | 0 |
| `<style>` left in `<head>` after closing | 0 | 0 |
| Page scrolls on mouse wheel while open | No | No |
| `body` overflow while open | `visible`: the lock's CSS was blocked | `visible`: no lock CSS yet, which the class lock adds |
| Drawer opens and closes at 1280px | Yes | Yes |

What it means:

- **The violation is real**, and the existing e2e CSP test would fail as soon as it opens the drawer.
- **The wheel lock still works without the blocked CSS**, because `react-remove-scroll` stops wheel and touch scrolling with event handlers. What's lost is `overflow: hidden`, so the page behind can probably still be scrolled by dragging the scrollbar or with the keyboard. The test didn't check those two. The class lock puts `overflow: hidden` back, and the build's e2e test checks it.
- **The design system's `Drawer` works at every width.** Only `SideNav` limits itself to below 1024px (N-1).

### Risks

- **The override can outlive its reason.** A temporary scroll-lock override is easy to forget. It's marked in code, listed in the rule 3 report, and linked to the design system issue AME-101.
- **The bar adds height above a lesson that fills the viewport** (`min-height: 100svh`), so every lesson page scrolls by the bar's height. Checked in the Design step.

### Assumptions

- Lessons stay a flat list for now.
- English labels only (`product-north-star.md` §11).

---

## 10. Acceptance criteria

- F1–F7 pass in Playwright on `/`, `/lessons/nashville-numbers` and the 404 page.
- The CSP test opens the drawer on a lesson page and reports no violations.
- Keyboard-only: Tab reaches Lessons, Enter opens, focus is on the first lesson, Escape closes, focus is back on Lessons.
- axe passes with the drawer closed and open, in light and dark.
- Nashville Number Lab's existing e2e and component tests pass. The only change is that the keyboard test in `e2e/lesson.spec.ts` now tabs past the bar's two controls, Lessons and Song Workshop, before the lesson's first stop.
- The rule 3 report lists the bar, the scroll-lock override, the drawer list and the Lessons button's padding.

---

## 11. Implementation plan

1. **Spec and drawer CSP test** (this step).
2. **Design:** the bar and the open drawer at about 1280, 1024 and 375px, in major and minor, light and dark. Antonio chooses.
3. **Build:** the registry helper, the bar, the drawer and its list, the scroll-lock override, and the bar in `app/layout.tsx`.
4. **Tests:** unit (the helper), component (the current lesson marked, focus on open and close), e2e (F1–F7, keyboard, axe, CSP with the drawer open).
5. **Docs and review:** `architecture.md` §2 (the `components/site/` folder) and §4 (navigation), the quality gate, the accessibility review, `/ticket-review`, then the rule 3 report.
