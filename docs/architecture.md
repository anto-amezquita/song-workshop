# architecture.md

## Purpose

This file defines the stable technical rules of the product.

Feature specs may describe implementation details for one piece of work. This document defines the shared architecture that should remain consistent across the whole product.

The goal is to help contributors and AI agents make technical decisions that fit the system rather than solving each task in isolation.

> **Status (2026-11-22):** First version, written before any code exists. It describes how Nashville Number Lab (today a single HTML file at the repo root) moves into the app, and how later lessons fit beside it.
>
> - **Decided**, with records in `/decisions`: Next.js with static export (0001), the `song-workshop` brand (0002), the sliding switch built in this repo (0003), and motion as the brand's own tokens (0004).
> - **Everything else is a proposal** until the project is set up or the spec decides it. Lines marked *Proposal* or *Assumption* haven't been confirmed.
> - **Not released yet:** this doc depends on design-system features that aren't on npm. The brand contract, `amezquita-brand check` and `build`, and the colour-mode script (`colorModeScript()`, `useColorMode` and `data-mode`) came in with design-system PR #207 (AME-6), merged 2026-11-20. The latest release, 1.6.7 from 2026-10-28, has none of them. Releasing the design system is its own ticket, and the port waits for it.

---

## 1. Stack

Only the framework and the static export are decided (decisions/0001). The rest of this section is a proposal, settled when the project is set up.

### Frontend

- framework: Next.js, App Router, with `output: 'export'`, so the whole site is static files. *Decided.* Same framework as the portfolio, but not the same config: the portfolio doesn't use static export and relies on `redirects()`, which a static export doesn't support. *Proposal:* Next 16, as in the portfolio.
- language: TypeScript, strict. *Proposal.*
- styling: plain CSS files next to each component, using design system tokens as CSS custom properties. No Tailwind, no CSS-in-JS. *Proposal.*
- component system: `@amezquita/design-system` (React 19), pinned to an exact version. Needs a release newer than 1.6.7 (see Status).
- animation: CSS transitions and keyframes, timed by the brand's motion tokens (see `brand.md` §16, decisions/0004). *Proposal:* no animation library.
- sound: the Web Audio API. All sound is synthesized in the browser; there are no audio files.
- forms: none
- state management: React state inside each lesson's top component (`useReducer`). No global store. *Proposal.*
- data fetching: none. Lesson content lives in code.
- routing: App Router file routes, one route per lesson. *Proposal:* `/lessons/<slug>` for a lesson and a lesson index at `/` (§4, Routing).

### Backend

None. Every page is prerendered HTML plus the JavaScript its lesson needs. Nothing runs on a server.

### Tooling

All proposals:

- package manager: npm, as in the portfolio
- linting: ESLint with Next's config
- formatting: Prettier
- testing: Vitest and React Testing Library for unit and component tests, Playwright for end-to-end and axe checks
- CI/CD: GitHub Actions running typecheck, lint, tests, the brand check and the build. Third-party actions pinned to a full SHA.
- deployment: any static host. Not chosen yet (§17).

---

## 2. Repository structure

*Proposal.* The names and folders below, including `SegmentSwitch`, `useSlidingIndicator` and the `nashville-numbers` slug, get confirmed when the project is set up.

```txt
app/
  layout.tsx                        colour-mode script, base + brand CSS, fonts
  page.tsx                          lesson index, built from lessons/registry.ts
  lessons/
    nashville-numbers/page.tsx      metadata + <NashvilleLab />
lessons/
  registry.ts                       one entry per lesson: slug, title, eyebrow, summary
  nashville-numbers/
    NashvilleLab.tsx                'use client'. Owns the lesson's state
    presets.ts                      named progressions per tonality
    path.ts                         the five lesson-path steps, as data
    KeyPicker.tsx, ScaleRow.tsx, ChordGrid.tsx,
    ProgressionBuilder.tsx, Transport.tsx  (+ a .css file each)
components/lesson/                  shared by every lesson
  LessonLayout                      header, main column, sticky path aside
  LessonPanel                       panel with the focus glow and scroll-into-view
  LessonPath                        numbered steps, each with an action button
  RollText                          text that rolls in when it changes
  SegmentSwitch                     two-to-five-way switch with a sliding thumb
hooks/
  useSlidingIndicator.ts            measures the chosen item; moves the thumb or indicator
lib/music/
  theory/                           note spelling, scales, modes, chords
  audio/                            audio context, voices, chord voicing, silence
  transport/                        tempo, bars, loop, a callback per step
tokens/brands/song-workshop/        tokens.json, dark.json, contrast-pairs.json
styles/
  brand/                            output of `amezquita-brand build`
  global.css                        page-level rules only
reference/
  nashville-number-lab.html         the original file, kept until the port matches it
docs/ specs/ decisions/ skills/ guide/ templates/   the starter kit
```

### Structure rules

- A lesson is a folder in `lessons/`, one entry in `lessons/registry.ts` and one route in `app/lessons/<slug>/`. Adding a lesson never means editing another lesson.
- `components/lesson/` never imports from `lessons/` or from `lib/music/`. A lesson with no sound, like lyric writing, uses it unchanged.
- `lib/music/theory/` is pure: no DOM, no audio, no React. The same input always gives the same output, and that's what its tests check.
- `lib/music/audio/` is the only code that touches Web Audio. `transport/` keeps time and calls the lesson back on each step; the lesson decides what to play.
- Route files stay thin: metadata and one component.
- A component used by one lesson lives in that lesson's folder. It moves to `components/lesson/` when a second lesson needs it, not before.
- `reference/` is temporary. It's deleted once the port passes the spec's side-by-side check.

---

## 3. Architectural principles

#### Design system first

Use a design system component when its documented use fits and it keeps the lesson looking and behaving like the original. Build a project component only when none does, and say why in the spec. The sliding switch is one (decisions/0003). *Proposal:* the 12-key picker, chord cards, scale row, progression slots and the play/stop button are too.

Still open, for the spec: the preset chips, Play scale, Loop, the lesson-path buttons and the tempo slider. Design system components (`Button`, `ToggleButton`, `Slider`) would change how these look: design system buttons have a 2px border and a pill shape, and `Slider` replaces the file's native range input. Either they stay project components that match the file, or the spec accepts the change and the side-by-side check expects it.

#### Don't change the design system from here

This repo consumes `@amezquita/design-system`; it doesn't patch, fork or restyle its internals. A gap goes into `docs/backlog.md` as a design system item (the first: the sliding thumb in `SegmentedControl`, decisions/0003).

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

Each lesson has its own route. With static export, each route becomes its own HTML file. *Proposal:* the first is `/lessons/nashville-numbers`, and `/` lists the lessons from `lessons/registry.ts`. The index page is new (the file has nothing like it), so it needs a spec and a design before it's built. Until then, `/` could simply be the first lesson.

### Rendering model

Static prerendering. The page shell and the lesson's first state (C major, the first progression) are in the HTML. The interactive part of a lesson is a client component that hydrates on load. Audio and timers only run inside event handlers and effects.

### State management

- **Lesson state:** in the lesson's top component, through `useReducer`. For Nashville Number Lab that's key, tonality, label mode, progression, chosen preset, building mode, playing, current playback step, loop, tempo, and the lesson path's current step. Steps before the current one show as done, as in the file.
- **URL state:** none for now (open question, §17).
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

- **Load order** in `app/layout.tsx`: the design system's `base-light.css` and `base-dark.css`, then `styles/brand/song-workshop-light.css` and `song-workshop-dark.css`, then `styles/global.css`. This is the order the brand contract sets; it isn't released yet (see Status).
- **Colour mode:** follows the system setting, with no switch on the page, as in the file. *Proposal:* the design system's `colorModeScript()` in `<head>`, as a plain `<script>`, so dark values apply under `html[data-mode="dark"]` the way the design system expects. It isn't released yet (see Status). A colour-mode picker or a saved preference would be new scope, not part of the port.
- **Tonality:** the lesson root carries `data-tonality="major"` or `"minor"`. It can't be `data-mode`, because the design system uses that for light and dark. Under `minor`, the lesson's CSS points `--color-accent-default`, `--color-accent-foreground`, `--color-accent-text` and the page tint at the brand's own minor tokens. *Proposal:* the lesson root fills the viewport and paints the tint, so nothing outside the lesson needs to know about tonality.
- **Tokens:** colour, type and motion values come from tokens. Spacing uses the design system's space tokens wherever one matches. Measurements that belong to one component's layout (the chord card's minimum height, grid column counts) can stay in that component's CSS. Radius and shadow are open: the file's values don't have tokens yet, and its shadows are tinted with the accent, which the contract's fixed shadow tokens can't do (`brand.md` §13).
- **Responsive:** two breakpoints, carried over from the file. At 900px and below, the lesson path moves under the lesson and stops being sticky. At 620px and below, the chord row goes from seven columns to four. The design system's only breakpoints are 768 and 1024px, so these two stay the lesson's own values, written as literals (custom properties can't be read inside `@media`). The design system's breakpoint lint checks its own component CSS, not this repo.
- **Reduced motion:** see `brand.md` §16.

### Accessibility

- Design system components bring their own semantics and keyboard handling.
- Project components use native buttons. Choices of one-from-many (the key picker, `SegmentSwitch`) are radio groups with arrow-key movement. In the file today the key pills say `role="radio"` but have no arrow keys. *Proposal:* the port adds them. That's a deliberate change in behaviour, so the spec lists it and the side-by-side check expects it.
- How playback is announced to screen readers is decided in the spec.

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
- built with `npx amezquita-brand build tokens/brands/song-workshop --out styles/brand`, which runs before `dev` and `build`. *Assumption: the built CSS isn't committed (§17).*

`amezquita-brand` isn't in the released package yet (see Status). Neither command can run until the design system is released.

Tokens the brand contract doesn't list are the brand's own and start with `song-workshop-`: the minor accent, the tints and soft fills, the motion tokens.

### Components

Imported from the package by path. The package version is pinned exactly, and upgrades are deliberate.

### Variants

Project components carry variants as `data-*` attributes, not class-name combinations.

### Theming

One brand, `song-workshop`, in light and dark. Tonality (major or minor) is a third switch, set on the lesson root (§4, Styling).

### Gaps

`SegmentedControl` changes its fill instead of sliding a thumb, so the two lesson switches use a sliding switch built in this repo (decisions/0003). *Proposal:* it's called `SegmentSwitch`, and the key picker shares its `useSlidingIndicator` hook. Bringing the thumb into the design system is a backlog item for the design-system repo.

---

## 9. Code conventions

### Naming

- files: `PascalCase.tsx` for components, `camelCase.ts` for modules
- components: PascalCase, named for what they are in the lesson (`ChordGrid`, not `Grid7`)
- hooks: `useX`, in `hooks/`
- utilities: plain functions in `lib/`
- types: next to the code that owns them, exported from there

### Type safety

TypeScript `strict`. Music types are unions where the set is closed (`'major' | 'minor'`, `'major' | 'minor' | 'dim'`).

### Error handling

The only real failure is audio: no Web Audio support, or a context that won't resume. The lesson still works without sound. How that's shown is decided in the spec.

### Logging

None in production.

### Comments

Explain why, especially the music theory (why the minor scale is the major scale rotated to its sixth note, for example). Don't narrate what the code already says.

### HTML safety

No `innerHTML` or `dangerouslySetInnerHTML`. The one exception is the design system's `colorModeScript()`, a constant string the design system documents as safe.

---

## 10. Testing strategy

### Unit tests

- `lib/music/theory/`: for all 12 keys in major and minor, the same scale spellings, chord names, qualities and numbers as the original file. The expected values are generated from `reference/nashville-number-lab.html` before it's deleted.
- `lib/music/transport/`: stepping, looping and stopping, with fake timers.

### Integration tests

Component tests with React Testing Library: `SegmentSwitch` and the key picker (choosing, arrow keys), the progression builder (adds up to eight chords, tap to remove, empty state).

### End-to-end tests

Playwright: each of the five lesson-path steps runs, the lesson can be used by keyboard alone, and axe passes on every page in light and dark.

### Visual regression

None automated for now. Transitions and interactions are checked by eye, side by side with `reference/`, against the list in the spec.

### Accessibility testing

axe in Playwright, plus the `accessibility-review` skill before the work counts as done.

### Sound

Tests don't listen. They check that the audio module was asked to play the right notes, with the module mocked.

---

## 11. Security and privacy

- No accounts, no personal data, no cookies of our own, and nothing stored in the browser.
- No user-supplied content reaches the page as HTML.
- Dependencies pinned. A new dependency needs a reason in its PR.
- Google Fonts: loading fonts from Google sends each visitor's IP address to Google (§17).
- Security headers depend on the host (§17).

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

- local (`next dev`)
- production (static host)

### Environment variables

None needed.

### Deployment process

`next build` writes the static site to `out/`, and the host serves that folder.

### Rollback strategy

Redeploy the previous build.

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

- Which static host? Vercel, like the portfolio, or something else?
- Google Fonts link, or self-hosted fonts through `next/font`? Self-hosting keeps visitors' IP addresses away from Google.
- Should a key and progression be shareable by URL (`?key=G&prog=1-5-6m-4`)?
- Commit the built brand CSS, or build it on every install?
- A lesson index at `/`, or `/` as the first lesson until there's a second one? An index page needs a spec and a design.

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
