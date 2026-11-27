# architecture.md

## Purpose

This file defines the stable technical rules of the product.

Feature specs may describe implementation details for one piece of work. This document defines the shared architecture that should remain consistent across the whole product.

The goal is to help contributors and AI agents make technical decisions that fit the system rather than solving each task in isolation.

> **Status (2026-11-23):** Updated from the approved port spec, `specs/2026-11-23-nashville-number-lab-port.md` (AME-78). It describes how Nashville Number Lab moves into the app, and how later lessons fit beside it.
>
> - **Decided**, with records in `/decisions`: Next.js with static export (0001), the `song-workshop` brand (0002), the sliding switch built in this repo (0003), motion as the brand's own tokens (0004), self-hosted fonts (0005), Vercel and the security headers (0006), and the drawer's scroll lock without an injected `<style>`, a temporary override (0007).
> - **Decided in the port spec:** the stack and tooling (§1), the folder names (§2), which parts are project components (§3), and the answers in §17. The spec's IDs (R1–R6, Q1–Q20, C-01–C-13) are given where they help.
> - **Released:** the brand contract, `amezquita-brand check` and `build`, and the colour-mode script (`colorModeScript()`, `useColorMode` and `data-mode`) are in `@amezquita/design-system` 1.7.0, on npm since 2026-11-23 (AME-76).
> - Lines still marked *Assumption* haven't been confirmed.

---

## 1. Stack

The framework and the static export are decided in decisions/0001, the rest in the port spec (Q19). Exact versions are pinned when the project is set up.

### Frontend

- framework: Next.js 16, App Router, with `output: 'export'`, so the whole site is static files. Same framework as the portfolio, but not the same config: the portfolio doesn't use static export and relies on `redirects()`, which a static export doesn't support.
- language: TypeScript, strict.
- styling: plain CSS files next to each component, using design system tokens as CSS custom properties. No Tailwind, no CSS-in-JS.
- component system: `@amezquita/design-system` (React 19), pinned to exactly 1.7.0.
- fonts: self-hosted from Fontsource packages (decisions/0005).
- animation: CSS transitions and keyframes, timed by the brand's motion tokens (see `brand.md` §16, decisions/0004). No animation library.
- sound: the Web Audio API. All sound is synthesized in the browser; there are no audio files.
- forms: none
- state management: one store per lesson, owned by its top component: a pure reducer behind `getState`/`dispatch`/`subscribe`, read with `useSyncExternalStore` (§4). No global store.
- data fetching: none. Lesson content lives in code.
- routing: App Router file routes, one route per lesson, at `/lessons/<slug>`. `/` shows the first lesson until there's a second (§4, Routing).

### Backend

None. Every page is prerendered HTML plus the JavaScript its lesson needs. Nothing runs on a server.

### Tooling

- package manager: npm, as in the portfolio
- linting: ESLint with Next's config
- formatting: Prettier
- testing: Vitest and React Testing Library for unit and component tests, Playwright with axe for end-to-end and accessibility checks
- brand build: `style-dictionary`, the current 5.x, pinned exactly. `amezquita-brand build` needs it. Versions from 5.7.1 write durations in seconds (`0.5s`, not `500ms`); nothing here reads them as numbers, so that's accepted (port spec Q17, AME-84).
- CI/CD: GitHub Actions running typecheck, lint, tests, the brand check and the build. Least-privilege `permissions`; third-party actions pinned to a full SHA, with the version in a comment.
- deployment: Vercel, serving the static `out/` folder (§14, decisions/0006).

---

## 2. Repository structure

Confirmed by the port spec. Later lessons follow the same shape.

```txt
app/
  layout.tsx                        colour-mode script, base + brand CSS, fonts, the site bar
  page.tsx                          the first lesson until there's a second; then the lesson index (§4)
  not-found.tsx                     our own 404: Next's paints body white
  lessons/
    nashville-numbers/page.tsx      metadata + <NashvilleLab />
lessons/
  registry.ts                       one entry per lesson: slug, title, eyebrow, summary
  nashville-numbers/
    NashvilleLab.tsx                'use client'. The lesson root: tonality, panels, live region
    panels.tsx                      the four panels, memoised, each given only what it shows
    useNashvilleLab.ts              creates the store, engine and controller once
    model.ts                        state, the pure reducer, and the store around it
    lights.ts                       useLit: a card, note or slot reads its own lit state
    controller.ts                   what people do: dispatches, plays, keeps time. No React
    copy.ts                         the lesson's words, built from lib/music where they depend on the key
    presets.ts                      named progressions per tonality
    path.ts                         the five lesson-path steps, as data
    KeyPicker.tsx, ScaleRow.tsx, ChordGrid.tsx,
    ProgressionBuilder.tsx, Transport.tsx  (+ a .css file each)
components/lesson/                  shared by every lesson
  LessonLayout                      lesson intro, main column, sticky path aside
  LessonPanel                       panel with the focus glow and scroll-into-view
  LessonPath                        numbered steps, each with an action button
  RollText                          text that rolls in when it changes
  SegmentSwitch                     two-to-five-way switch with a sliding thumb
components/site/                    on every page, outside any lesson (AME-97)
  SiteBar                           the top bar: Lessons button, site name, the lessons drawer
  LessonList                        the lessons inside the drawer, until SideNav can do it (AME-100)
  navigation.ts                     which menu link is the current page
hooks/
  useSlidingIndicator.ts            measures the chosen item; moves the thumb or indicator
  usePanelHighlight.ts              one highlighted panel at a time, scrolled into view if needed
lib/music/
  theory/                           note spelling, scales, modes, chords
  audio/                            audio context, voices, chord voicing, silence
  transport/                        tempo, bars, loop, a callback per step; one-off sequences
  __fixtures__/reference.json       the original file's own output, for the tests (generated)
lib/overrides/
  react-remove-scroll-bar.ts        TEMPORARY: the drawer's scroll lock without a <style> (decisions/0007)
tokens/brands/song-workshop/        tokens.json, dark.json, contrast-pairs.json
styles/
  brand/                            output of `amezquita-brand build`
  global.css                        small reset, page colour, page-level rules
scripts/
  serve-out.ts                      serves out/ for Playwright; not for production
e2e/                                Playwright tests, run against the built out/
docs/ specs/ decisions/ skills/ guide/ templates/   the starter kit
```

### Structure rules

- A lesson is a folder in `lessons/`, one entry in `lessons/registry.ts` and one route in `app/lessons/<slug>/`. Adding a lesson never means editing another lesson.
- `components/lesson/` never imports from `lessons/` or from `lib/music/`. A lesson with no sound, like lyric writing, uses it unchanged.
- `components/site/` doesn't import from `lessons/` either. `app/layout.tsx` builds the menu's links from the registry and passes them in.
- `lib/music/theory/` is pure: no DOM, no audio, no React. The same input always gives the same output, and that's what its tests check.
- `lib/music/audio/` is the only code that touches Web Audio. `transport/` keeps time and calls the lesson back on each step; the lesson decides what to play.
- Route files stay thin: metadata and one component.
- A component used by one lesson lives in that lesson's folder. It moves to `components/lesson/` when a second lesson needs it, not before.
- The original single-file lesson, `Nashville-Number-Lab.html`, was deleted once the port passed its side-by-side check (AME-78, 2026-11-23). It's in git history. Its theory output lives on as the test fixture `lib/music/__fixtures__/reference.json`.

---

## 3. Architectural principles

#### Design system first

Use a design system component when its documented use fits and it keeps the lesson looking and behaving like the original. Build a project component only when none does, and say why in the spec. The sliding switch is one (decisions/0003).

In the first lesson, the key picker, scale row, chord cards, preset chips, progression slots, transport (play/stop, Loop, tempo), "Play scale" and the lesson-path buttons are project components too (port spec Q6). Each design system component would change how the lesson looks: `Button` and `ToggleButton` have a 2px border, the pill shape and the design system's motion; `Slider` replaces the native range input, which stays; `Heading` and `Text` bring the design system's sizes. The lesson still uses the design system's tokens, colour-mode script, brand pipeline and `VisuallyHidden`.

#### Don't change the design system from here

This repo consumes `@amezquita/design-system`; it doesn't patch, fork or restyle its internals. A gap becomes an issue in Linear's Design system project, linked from the Song Workshop issue that needs it ("related", or "blocked by" if it blocks). backlog-sync reads only the Song Workshop project, so these issues don't show in `docs/backlog.md`; the link on the Song Workshop issue is how they're found. The first is AME-79, the sliding thumb in `SegmentedControl` (decisions/0003).

#### Keep music logic out of components

Scales, chords and voicings are worked out in `lib/music/`. Components render the result and send back what the person did.

#### Sound starts with a gesture

The audio context is created on the first click or key press, never when a module loads. Browsers block sound before a gesture anyway; this keeps it predictable.

#### Prefer composition over duplication

Shared behaviour is pulled out when a second lesson needs it, not in advance.

#### Optimize for clarity before cleverness

Prefer code that is easy to reason about and maintain over code that is merely compact or novel.

---

## 4. Frontend architecture

### Routing

Each lesson has its own route. With static export, each route becomes its own HTML file. The first is `/lessons/nashville-numbers`.

Until there's a second lesson, `/` renders the same lesson, with a canonical link to `/lessons/nashville-numbers`, because a static export can't redirect (port spec Q5). When the second lesson arrives, `/` becomes a lesson index built from `lessons/registry.ts`. The index is new (the file has nothing like it), so it needs a spec and a design first.

### Navigation

Every page has the site bar (`components/site/SiteBar`), rendered by `app/layout.tsx` above the page: a Lessons button, then the site's name, linking to `/`. The button opens the design system's `Drawer` from the left at every width, listing every lesson in registry order, with the current one marked `aria-current="page"`. The current lesson comes from `usePathname`, and `/` counts as the lesson it shows. There's no permanent sidebar. Spec: `specs/2026-11-27-lesson-navigation.md`.

- **The bar is the page's one `header` (banner).** A lesson's intro in `LessonLayout` is a `div`, so there aren't two.
- **The list inside the drawer is ours for now.** `SideNav` would draw it, but in 1.7.0 it can only be a drawer below 1024px. AME-100 asks for that in the design system; when it ships, `LessonList` gives way to `SideNav`.
- **Scroll lock:** see §11 and decisions/0007.
- **The bar sits outside the lesson's tint**, on the white panel colour, so it looks the same in major and minor.

### Rendering model

Static prerendering. The page shell and the lesson's first state (C major, the first progression) are in the HTML. The interactive part of a lesson is a client component that hydrates on load. Audio and timers only run inside event handlers and effects.

### State management

- **Lesson state:** a pure reducer, kept in a small store the lesson's top component creates (`lessons/<slug>/model.ts`). Not plain `useReducer`: the transport calls back on its own timer, between renders, and has to read the latest state, which `useReducer` only hands to the next render. React reads the store through `useSyncExternalStore`, in two parts, so a playback step doesn't re-render the lesson (§12): the lesson root reads the view, which is the state without what's lit and stays the same object while only the lights change, and each chord card, scale note and slot reads whether it's lit itself (`useLit`). A controller (`controller.ts`, no React) runs what people do: it dispatches, and drives the audio engine and the transport. For Nashville Number Lab that's key, tonality, label mode, progression, chosen preset, building mode, playing, current playback step, loop, tempo, and the lesson path's current step. Steps before the current one show as done, as in the file.
- **URL state:** none. A shareable key and progression would be new behaviour (port spec Q3).
- **Persisted state:** none. Lessons remember nothing between visits, and colour mode follows the system setting, as in the file. *Assumption: nothing asks for saved progress yet.*

### Data fetching

Not applicable.

### Forms and validation

Not applicable. The one free value, tempo, comes from a range input with a fixed range.

### Components

- Design system components are imported by path, for example `@amezquita/design-system/components/primitives/Heading`.
- Shared lesson components live in `components/lesson/`, lesson-only ones in the lesson's folder.
- One component per file, PascalCase, with its CSS file beside it.
- State shows in `aria-*` and `data-*` attributes (`aria-checked`, `data-state`, `data-tonality`), as in the design system, and CSS styles those attributes.

### Styling

- **Load order** in `app/layout.tsx`: the design system's `base-light.css` and `base-dark.css`, then `styles/brand/song-workshop-light.css` and `song-workshop-dark.css`, then `styles/global.css`. This is the order the brand contract sets.
- **No design system `reset.css`:** its own header says it exists for Storybook and that apps bring their own. Loading it would paint `body` with `color-surface-primary`, the white panel colour here. `global.css` carries a small reset instead (box-sizing, buttons inherit font and colour, no default margins), and paints `html` and `body` with `song-workshop-page`. `color-scheme` comes from the brand CSS. Pages without a lesson, and the overscroll area, show the untinted page colour (port spec R5).
- **Colour mode:** follows the system setting, with no switch on the page, as in the file. The design system's `colorModeScript()` goes in `<head>` as a plain `<script>`, so dark values apply under `html[data-mode="dark"]` before first paint. A colour-mode picker or a saved preference would be new scope.
- **Tonality:** the lesson root carries `data-tonality="major"` or `"minor"`. It can't be `data-mode`, because the design system uses that for light and dark. Under `minor`, the lesson's CSS sets eight properties to the brand's own minor tokens (port spec R1):

  | Property | Minor value |
  |---|---|
  | `--color-accent-default` | `song-workshop-minor` |
  | `--color-accent-hover` | `song-workshop-minor-hover` |
  | `--color-accent-pressed` | `song-workshop-minor-pressed` |
  | `--color-accent-text` | `song-workshop-minor-text` |
  | `--color-accent-text-hover` | `song-workshop-minor-text-hover` |
  | `--color-border-focus` | `song-workshop-minor` |
  | page tint | `song-workshop-tint-minor` |
  | soft fill | `song-workshop-soft-minor` |

  All eight are set one by one. A custom property that refers to another is worked out where it's declared (`:root`), so changing the accent on the lesson root doesn't carry through to the others. `color-border-focus` follows tonality: the focus ring is green in major and indigo in minor, as in the file. `--color-accent-foreground` stays the same in both tonalities. The lesson root fills at least the viewport and paints the tint, so nothing outside the lesson needs to know about tonality.
- **Tokens:** colour, type and motion values come from tokens. Spacing uses the design system's space tokens wherever one matches. Measurements that belong to one component's layout (the chord card's minimum height, grid column counts) can stay in that component's CSS. Radius uses the contract's tokens and one of the brand's own (`brand.md` §13).
- **Shadows:** accent-tinted, as in the file. Each is written in its component's CSS with `var(--color-accent-default)` as the colour, so it follows tonality. There are no shadow tokens, because the contract's are fixed colours (port spec Q10).
- **Font sizes:** the file's `rem` values, in each component's CSS. A size uses a design system token only where it's an exact match (`0.75rem` → `font-size-xs`, `1rem` → `font-size-base`). The design system's body is 18px, with no step between 12px and 14px, where most of the lesson's labels sit (port spec Q16).
- **Responsive:** two breakpoints, carried over from the file. At 900px and below, the lesson path moves under the lesson and stops being sticky. At 620px and below, the chord row goes from seven columns to four. The design system's only breakpoints are 768 and 1024px, so these two stay the lesson's own values, written as literals (custom properties can't be read inside `@media`). The design system's breakpoint lint checks its own component CSS, not this repo.
- **Reduced motion:** see `brand.md` §16.

### Accessibility

- Design system components bring their own semantics and keyboard handling.
- Project components use native buttons. Choices of one-from-many (the key picker, `SegmentSwitch`) are radio groups with arrow-key movement. In the file today the key pills and both switches (major/minor, numbers/names) say `role="radio"` but have no arrow keys. The port adds them to all three, with only the chosen option in the tab order (port spec C-01).
- In building mode, progression slots are buttons, so a chord can be removed by keyboard. Focus then goes to the slot now in that place, or the one before, or the first chord card if the progression is empty (C-02).
- Playback isn't announced bar by bar; the play button's name says whether it's playing. A hidden live region announces building changes and the no-sound message (Q7, C-09). The tempo slider announces its own value ("100 BPM"), and the number shown beside it is hidden from screen readers so it isn't announced twice (C-16).

### Sound

- One `AudioContext` for the page, created lazily: master gain → low-pass filter → compressor → speakers, as in the file.
- Every voice is tracked, so Stop fades them all out, and each voice disconnects when it ends.
- `transport/` keeps the file's timing for the port: one `setTimeout` per bar. That drifts slightly, which is fine for chords. The rhythm lesson needs scheduling on the audio clock instead (backlog).

---

## 5. Backend architecture

Not applicable: static site, no server.

---

## 6. Data architecture

No database. The main types, all in code:

- **Lesson:** slug, title, eyebrow, summary (`lessons/registry.ts`)
- **Path step:** title, description, action label, and the action it runs (`lessons/<slug>/path.ts`)
- **Music:** key, tonality, scale note (spelling, pitch class, semitones from home), chord (degree, quality, number, name, chord tones), progression preset (`lib/music/theory/`)

---

## 7. API conventions

Not applicable.

---

## 8. Design system integration

### Tokens

The design system's tokens come in through its CSS. The brand lives in `tokens/brands/song-workshop/`:

- `tokens.json` (light), `dark.json`, and `contrast-pairs.json` for the brand's own colour pairs
- checked with `npx amezquita-brand check tokens/brands/song-workshop --pairs tokens/brands/song-workshop/contrast-pairs.json`
- built with `npx amezquita-brand build tokens/brands/song-workshop --out styles/brand`, which `npm run dev` and `npm run build` call first. Not as `predev`/`prebuild`: with `ignore-scripts=true`, npm skips pre- and post-scripts. The built CSS isn't committed: `styles/brand/` is gitignored, and CI runs the check and the build (port spec Q4).

Tokens the brand contract doesn't list are the brand's own and start with `song-workshop-`: the minor accent and its hover and pressed states, the tints and soft fills, the page colour, the motion tokens, a radius, a weight and a tracking.

### Components

Imported from the package by path. The package version is pinned exactly, and upgrades are deliberate.

### Variants

Project components carry variants as `data-*` attributes, not class-name combinations.

### Theming

One brand, `song-workshop`, in light and dark. Tonality (major or minor) is a third switch, set on the lesson root (§4, Styling).

### Gaps

`SegmentedControl` changes its fill instead of sliding a thumb, so the two lesson switches use a sliding switch built in this repo (decisions/0003). It's called `SegmentSwitch`, and the key picker shares its `useSlidingIndicator` hook. Bringing the thumb into the design system is AME-79, for the design-system repo.

---

## 9. Code conventions

### Naming

- files: `PascalCase.tsx` for components, `camelCase.ts` for modules
- components: PascalCase, named for what they are in the lesson (`ChordGrid`, not `Grid7`)
- hooks: `useX`, in `hooks/`
- utilities: plain functions in `lib/`
- types: next to the code that owns them, exported from there

### Type safety

TypeScript `strict`, as in §1. Music types are unions where the set is closed (`'major' | 'minor'`, `'major' | 'minor' | 'dim'`).

### Error handling

The only real failure is audio: no Web Audio support, or a context that won't resume. The lesson still works without sound. One line under the transport says so, only when sound can't start (port spec Q8). Only missing Web Audio is final; after a failed resume, the next tap tries again, and the line goes once sound comes back.

### Logging

None in production.

### Comments

Explain why, especially the music theory (why the minor scale is the major scale rotated to its sixth note, for example). Don't narrate what the code already says.

### HTML safety

No `innerHTML` or `dangerouslySetInnerHTML`. The one exception is the design system's `colorModeScript()`, a constant string the design system documents as safe.

---

## 10. Testing strategy

### Unit tests

- `lib/music/theory/`: for all 12 keys in major and minor, the same scale spellings, chord names, qualities and numbers as the original file. The expected values were generated by running the original file's own code, and are kept in `lib/music/__fixtures__/reference.json`.
- `lib/music/transport/`: stepping, looping and stopping, with fake timers.

### Integration tests

Component tests with React Testing Library: `SegmentSwitch` and the key picker (choosing, arrow keys), the progression builder (adds up to eight chords, tap to remove, empty state).

### End-to-end tests

Playwright: each of the five lesson-path steps runs, the lesson can be used by keyboard alone, and axe passes on every page in light and dark.

### Visual regression

None automated for now. The port of Nashville Number Lab was checked by eye and ear, side by side with the original file, against the list in its spec (AME-78). A new lesson is checked against its own spec.

### Accessibility testing

axe in Playwright, plus the `accessibility-review` skill before the work counts as done.

### Sound

Tests don't listen. They check that the audio module was asked to play the right notes, with the module mocked.

---

## 11. Security and privacy

- No accounts, no personal data, no cookies of our own, and nothing stored in the browser. The colour-mode script reads one storage key and writes nothing, since there's no picker.
- No user-supplied content reaches the page as HTML.
- Dependencies pinned. A new dependency needs a reason in its PR.
- Fonts are self-hosted, so no visitor's IP address goes to Google (decisions/0005). Nothing on the page makes a third-party request.
- Security headers are set by Vercel from `vercel.json`, on every path, because a static export can't set them from Next.js (decisions/0006):
  - `Content-Security-Policy`: everything from the site's own origin only. Two exceptions: inline scripts (`script-src 'unsafe-inline'`), which Next writes into every page, and inline `style` attributes (`style-src-attr 'unsafe-inline'`), which `RollText` uses for its animation delay. No plugins (`object-src 'none'`), no framing (`frame-ancestors 'none'`), `base-uri` and `form-action` limited to the site, and `upgrade-insecure-requests`.
  - `Strict-Transport-Security: max-age=63072000; includeSubDomains`
  - `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin`, `Cross-Origin-Opener-Policy: same-origin`
  - `Permissions-Policy` turning off camera, microphone, geolocation, payment and USB. Web Audio needs none of them.
- Anything new the page loads (a third-party script, a `data:` image, a worker) needs the CSP changed in the same PR, or the browser blocks it. The e2e server sends the same headers, and the e2e tests fail on any CSP violation, so CI catches it.
- The design system's `Drawer` would add a `<style>` element to lock page scroll, which the CSP blocks. A temporary override points `react-remove-scroll-bar` at a stand-in that adds none, and the site bar locks scroll with a class instead (decisions/0007). The e2e tests open the drawer under the CSP.

---

## 12. Performance

### Targets

- The lesson page responds to a tap with no noticeable delay on a mid-range phone.
- JavaScript only for the lesson being viewed. Any page without a lesson stays almost static.

### Preferred practices

- Measure for the sliding indicators only when the choice changes, on resize and once fonts have loaded. Never inside an animation loop.
- Disconnect audio nodes when their voice ends, as the file does.

### Avoid

- Re-rendering the whole lesson on every playback step when only the lit chord and slot change.
- Creating audio nodes ahead of time "just in case".

---

## 13. Observability

### Analytics

None for now.

### Logging

None.

### Monitoring

None beyond the host's own.

### Error reporting

None for now.

---

## 14. Deployment and environments

### Environments

- local (`next dev`, or `npm run serve` to look at a build in `out/` with the headers in `vercel.json`)
- preview (Vercel, a deployment for each pushed branch)
- production (Vercel, from `main`): `https://song-workshop.amezquita.dk`, a CNAME `song-workshop` at Simply.com, which hosts the `amezquita.dk` DNS. Vercel's default address is `song-workshop.vercel.app`.

### Environment variables

None needed. The public address is a constant, `SITE_URL` in `lib/site.ts`. The root layout's `metadataBase` uses it to make the canonical link a full URL.

### Deployment process

Vercel installs with `npm ci --ignore-scripts`, as CI does (`vercel.json`), on Node 26: `engines` in `package.json` pins Vercel to the major CI uses (`node-version: 26` in `.github/workflows/ci.yml`). Change both together. It builds each push with `npm run build`, which builds the brand CSS and then runs `next build`. `next build` writes the static site to `out/`, and Vercel serves that folder with the headers in `vercel.json` (§11). A push to `main` goes to production.

### Rollback strategy

Promote the previous production deployment in Vercel (Instant Rollback), or revert the commit on `main`.

---

## 15. Preferred patterns

- A lesson as a folder, plus a registry entry and a thin route
- The lesson path as data: steps with an action, run by the lesson that owns the state
- Pure theory functions, tested against fixed expected values
- State in `aria-*` and `data-*` attributes, styled from CSS

---

## 16. Patterns to avoid

- Changing, forking or restyling the design system's internals from this repo
- A global store for state that belongs to one lesson
- Creating the audio context at import time
- Timing anything rhythm-critical with `setTimeout`
- Raw colour, type or motion values where a token exists

---

## 17. Open architectural questions

None right now.

Answered in AME-87 (2026-11-24):

- The static host: Vercel, like the portfolio, with the security headers in `vercel.json` (§11, §14, decisions/0006).

Answered by the port spec (2026-11-23):

- Fonts: self-hosted from Fontsource packages (decisions/0005).
- A shareable key and progression in the URL: no, not for now (§4).
- The built brand CSS: not committed; built before `dev` and `build` (§8).
- `/`: the first lesson until there's a second one, then a lesson index with its own spec (§4).

---

## Final review checklist

- Is the stack explicit?
- Is the folder structure clear?
- Are frontend and backend responsibilities separated?
- Are data and API conventions defined?
- Are design tokens and components integrated into the architecture?
- Are testing expectations visible?
- Are security, privacy, and performance considered?
- Are preferred patterns and anti-patterns named?
- Could an AI coding agent make consistent technical choices from this file?
