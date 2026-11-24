# Nashville Number Lab, ported to the Next.js site

> **Status (2026-11-23): built, in review.** Approved by Antonio with every proposal as written. All six phases are done: the side-by-side check passed, with Antonio checking sound and motion by ear and eye and keeping every timing, and `reference/` and the test-value script are deleted. Issue: AME-78.
>
> - **Facts** are what `Nashville-Number-Lab.html` does today, or what `@amezquita/design-system` 1.7.0 ships. They're written plainly.
> - **Decisions** have an ID: `R1`–`R6` resolve the AME-75 review findings (§9.1), `Q1`–`Q20` answer the open questions in the docs (§9.2), and `C-01`–`C-16` are deliberate changes from the file (§3.4). C-14, C-15 and C-16 were added during the build (phases 4–6) and approved on 2026-11-23.
> - **Docs follow the spec.** The doc and decision changes in §12 are the first commit, before any code. The host is AME-87 (Q1).

---

## 1. Overview

### Summary

Move Nashville Number Lab from one hand-written HTML file into the Song Workshop Next.js site. It becomes the first lesson route, built on `@amezquita/design-system` 1.7.0 and the `song-workshop` brand. It looks, sounds and moves like the file, except for the changes listed in §3.4.

### Problem

The lesson works, but as one 685-line file it can't share anything with the lessons that come after it: no shared components, no design-system tokens, no tests. Every later lesson (blues, rhythm, melody, lyric writing) would start from a copy.

### Intended users

- **People using the lesson.** Who exactly is still open (`product-north-star.md` §11). The port doesn't need the answer, because it keeps the lesson as it is.
- **Whoever builds the next lesson.** The port sets the shape they follow (`architecture.md` §2).

### Desired outcome

Someone who knows the file opens the port side by side with it and finds the same lesson. It has the same panels, sounds and roll-ins, and the thumb slides the same way. The few differences are on the list in §3.4. Under the surface, the lesson is a folder, its music logic is tested, and the next lesson can reuse the layout, path and switch components.

---

## 2. Goals and non-goals

### Goals

- The lesson at `/lessons/nashville-numbers`, prerendered as static HTML.
- The same behaviour, sound and motion as the file, checked side by side (§10.2).
- The `song-workshop` brand built and checked with `amezquita-brand`, in light and dark.
- Music theory in `lib/music/theory/`, tested against values generated from the file for all 12 keys in major and minor.
- Usable by keyboard alone, and axe passes in light and dark.

### Non-goals

- A lesson index page. `/` shows the lesson until there's a second one (Q5).
- Deployment and choosing a host (Q1). Done means `next build` produces a working `out/` folder and CI passes.
- Shareable URLs for a key or progression (Q3).
- Saved progress, accounts, a colour-mode switch, translations.
- Any change to the design system. Gaps go to the Design system project in Linear (R2).
- Scheduling sound on the audio clock. The port keeps the file's `setTimeout` per bar; the rhythm lesson needs better timing later.
- Fixing quirks of the file that aren't on the §3.4 list. They're carried over (§3.5), and can become issues of their own.

### Success criteria

- The side-by-side check in §10.2 passes, with only the §3.4 differences.
- Theory tests pass for 12 keys × 2 tonalities against the file's own output.
- CI passes: typecheck, lint, unit and component tests, Playwright with axe in light and dark, brand check, build.

---

## 3. User experience

### 3.1 The lesson, as the file has it

This is the behaviour to keep. Timings are the file's; §3.4 C-07 says which ones move.

**Page.** Eyebrow "Diatonic harmony, by number", the title "Nashville Number Lab", and the intro "Every major key holds the same seven chords. Learn them as numbers once, and you can play a song in any key." Under that, a main column of four panels, with the "Lesson path" panel beside it. Footer: "A music-teaching experiment by Antonio Amézquita. Sound is synthesized in your browser."

**First load.** C major, "Pop anthem" (1–5–6m–4) in the slots, Numbers shown, Loop on, tempo 100, no lesson step current. The key pills, scale notes and chord cards roll in, staggered; the progression slots pop in. The key name and the line under it don't animate on load.

**Key panel.**
- Label "Key", the key name ("C major"), and a line under it ("Relative minor: A minor"; in minor, "Same notes as C major"). Both roll in when they change, the second 60ms after the first.
- Switch "Major" / "Relative minor". The thumb slides to the chosen option.
- 12 key pills, in circle-of-fifths order: C G D A E B F♯ D♭ A♭ E♭ B♭ F. In minor, each pill shows its relative minor instead (Am, Em, Bm … Dm). A pill's text rolls in, 18ms after the pill before it, only when it changes. The indicator slides to the chosen pill.
- Hint: "Keys follow the circle of fifths. Neighbours share six of their seven notes."

**Scale panel.** "The scale, numbered", with a "Play scale" button.
- Eight notes: 1–7 and the octave, whose circle is dashed. The home note has an accent border. Degree numbers sit under each note.
- A W or H label sits between neighbours. H labels are accent text on the soft fill.
- Changing key or tonality rolls the note names in, 35ms apart.
- "Play scale" stops the progression, then plays the eight notes 340ms apart, lighting each one in turn.
- The hint changes with tonality (major: "W is a whole step, H is a half step. W W H W W W H builds every major scale."; minor: "Counted from the 6 of the major scale, the steps become W H W W H W W: the natural minor.").

**Chords panel.** "The seven chords", with a "Numbers" / "Chord names" switch.
- Seven chord cards: a big primary label, a secondary label and the quality. The switch decides whether the number or the name is primary. The diminished chord's card is dashed, and chord 1 carries a "home" tag.
- The labels roll in on change, 40ms apart, with the secondary label 40ms after its primary.
- A card lifts 3px on hover and shrinks to 97% while pressed.
- Tapping a card plays the chord for 1.4s, lights the card and its three notes in the scale, and unlights them after 900ms unless a progression is playing. A lit card is filled with the accent, lifted 6px, with an accent-tinted shadow.
- In building mode, tapping a card also adds it to the progression, up to eight.
- The hint changes with tonality.

**Progressions panel.**
- Preset chips: five in major (Pop anthem, Rock & folk, Moody pop, 50s doo-wop, Jazz turnaround), four in minor (Minor pop, Descending, Minor 1–4–5, Cinematic). Each chip shows its number pattern. A dashed "Build your own" chip comes last.
- Choosing a preset loads it and starts playing. If something is already playing, the next bar starts the new progression from bar 1.
- "Build your own" stops playback, empties the slots, and highlights the chords panel (see "Panel highlight" below).
- Slots: one per bar, each with "Bar n", a primary label and a secondary label. Slots pop in, 50ms apart, whenever the row is rebuilt: on a new preset, on a tonality change, and on every add or remove. When only the key or label mode changes, the labels roll instead, 45ms apart.
- Empty (building, nothing added yet): one dashed slot reads "Tap chords above to add them, up to eight."
- In building mode, tapping a slot removes it.
- Transport:
  - Play/stop button: round, filled with the accent. Its icon turns from play to stop. Its name is "Play progression" or "Stop progression". Play with an empty progression highlights the chords panel instead.
  - Tempo slider, 60–150 BPM, showing the value. A change applies from the next bar.
  - "Loop" toggle, on by default. With Loop off, playback stops after the last bar.
- Hint: "Change the key while it plays. The numbers stay put and only the chord names move."

**Playback.** One chord per bar, four beats at the tempo. Each bar lights its chord card, the chord's notes in the scale and its slot. (The file's CSS also scales a lit slot to 104%, but the slot's pop-in animation holds `transform: none` after it ends, so it never shows. Measured in Chromium: neither the file nor the port grows it. See §3.5.) Changing key, tonality or labels while it plays carries on with the new chords. Stop fades every sounding voice out and unlights everything.

**Lesson path.** Five numbered steps, each with a title, a description and an action button with an arrow that slides out on hover. Pressing a step's button makes that step current (soft fill, filled number) and every earlier step done (filled number), then runs its action:

| Step | Action |
|---|---|
| 1 Number the scale | Switch to major if needed, highlight the scale panel, play the scale |
| 2 A chord on every note | Switch to major if needed, highlight the chords panel, play all seven chords 760ms apart |
| 3 Hear a pattern | Switch to major if needed, stop, load Pop anthem (which starts it), highlight the progressions panel |
| 4 Move it to another key | If nothing is playing: switch to major if needed and load Pop anthem. Then move one key clockwise round the circle of fifths and highlight the key panel |
| 5 Same notes, new home | Stop, switch to minor, load Minor pop (which starts it), highlight the key panel |

**Panel highlight.** The panel's border turns accent with a 5px soft-fill ring for 2.6s. If the panel isn't fully on screen, it scrolls to the centre, smoothly unless reduced motion is on.

**Tonality.** Switching to minor turns the accent indigo: fills over 600ms, the page tint over 700ms. Unless building, it loads the first preset of the new tonality. It doesn't stop playback.

**Sound.** Everything is synthesized. A chord is a sine bass plus a triad of triangle-and-detuned-sine voices, strummed 22ms apart. Chords longer than 1.2s strike again at half the bar. Master gain → low-pass at 2800Hz → compressor. The tonic sits in octave 3, or octave 2 for keys from F♯ up. The port copies every value; nothing is re-tuned.

### 3.2 Layout

- Main column and a 300px lesson path side by side, 20px apart, max width 1140px. The path is sticky, 16px from the top.
- At 900px and below, the path moves under the lesson and stops being sticky.
- At 620px and below, the chord row goes from seven columns to four.
- Safe-area insets on all sides, as the file has them (`viewport-fit=cover`).

### 3.3 States and edge cases

| State | Behaviour |
|---|---|
| Default | C major, Pop anthem, Numbers, Loop on, 100 BPM |
| Building, empty | Empty slot with its message. Play highlights the chords panel |
| Building, full (8) | Tapping a chord still plays and lights it, but adds nothing. A screen reader hears "The progression is full: eight bars." (C-09) |
| Playing | Play button shows stop. Changes to key, tonality or labels apply from the next bar |
| Loop off | Stops after the last bar and unlights everything |
| No sound available | The lesson works silently, lights and all, with a line under the transport (Q8) |
| Before JavaScript loads | The prerendered first state shows, with its roll-ins and pop-ins. Buttons do nothing until hydration |
| Reduced motion | Every transition and animation ends at once; the panel highlight jumps instead of scrolling smoothly (`brand.md` §16) |
| Dark | Follows the system setting, as in the file |
| Loading, error, permissions | Not applicable: no data, no accounts |

### 3.4 Deliberate changes from the file

The side-by-side check expects these, and only these.

| ID | Change | Why |
|---|---|---|
| C-01 | Arrow keys move the choice in the key pills and both switches. Only the chosen option is in the tab order | They say `role="radio"` but have no arrow keys (`architecture.md` §4) |
| C-02 | In building mode, progression slots are buttons, so a chord can be removed by keyboard | R3 |
| C-03 | Light-mode major green `#178A63` → `#168660`, everywhere the accent is a fill | Contrast (R4) |
| C-04 | On a playing chord and a playing slot, the small labels show at full strength, not 85% | Contrast (`brand.md` §12) |
| C-05 | Light-mode major green as text → `#137453`: eyebrow, "home" tag, lesson-path buttons, H labels, chosen chip's numbers | Contrast (`brand.md` §12) |
| C-06 | Focus ring offset 4px (the design system's `focus-ring-offset`), not 3px. Still 2px in the accent | One focus ring for the lesson and any design-system component in it |
| C-07 | Motion timings grouped into seven tokens: most move by up to 50ms, two by 100ms, and seven fades take the lesson's easing | `brand.md` §16, decisions/0004 |
| C-08 | Page title and key name at weight 760, not 750 and 780 | `brand.md` §11 |
| C-09 | A hidden live region announces building changes ("Added 5 as bar 3.", "Removed bar 2.", "The progression is full: eight bars.") and the no-sound message | Screen reader users get no other sign that a slot changed |
| C-10 | Overscroll, and pages without a lesson, show the untinted page colour instead of the tint | R5 |
| C-11 | Key pills get full names for screen readers ("D♭ major", "B♭ minor"); what they show doesn't change | "F♯m" reads as "F sharp m" |
| C-12 | Uppercase labels share one tracking, 0.1em: eyebrow 0.12 → 0.1, chord quality 0.09 → 0.1, "Bar n" 0.08 → 0.1 | R6 |
| C-13 | The lesson is also served at `/` | Q5 |
| C-14 | On load, the switch thumbs and the key indicator appear in place. In the file they grow out of the panel's top-left corner, because the first placement animates from zero size. Before JavaScript runs, the chosen option paints itself instead | Found in phase 4: prerendered HTML has no measurements, and a grow-in after hydration would flicker |
| C-15 | Chord cards and building-mode slots have accessible names that contain their visible text, in the order shown (WCAG 2.5.3, Label in Name). Numbers first, the cards keep the file's names ("Chord 6m, Am minor"); names first, they read "Chord Am, 6m minor". Slot buttons read "Remove bar 2: 6m, Am (A minor)". The visible labels get real spaces between them, which changes nothing on screen | Found in phase 5: axe fails the file's names, which don't contain what the card shows |
| C-16 | Three fixes for screen readers, none visible. The "Key" label is an `h2`, styled as before, so jumping by headings reaches the key panel. The tempo slider is named "Tempo" and announces "100 BPM"; the `<output>` beside it is hidden from screen readers, because as a status region it announced every change a second time. Chord 1's name ends in ", home", since its "home" tag is CSS | Found in the phase 6 accessibility review; all three are in the file too |

### 3.5 Quirks carried over on purpose

These behave as in the file. Each could become its own issue later, but changing them would break the side-by-side check.

- Adding or removing one chord pops every slot in again, not just the changed one.
- Changing tonality doesn't stop playback; the bar counter carries on into the new progression.
- Tapping a chord during playback plays it over the progression.
- Step 4 moves the key even while something else is playing, and keeps whatever is playing.
- A playing slot doesn't grow, although the CSS asks it to: the pop-in animation's end state wins. Kept identical, so it looks the same.

---

## 4. Functional requirements

- `FR-01` The lesson renders at `/lessons/nashville-numbers` and at `/` as static HTML, in its first state.
- `FR-02` Choosing one of the 12 keys updates the key name, pills, scale, chords, chips and slots, with the rolls and staggers in §3.1.
- `FR-03` The tonality switch moves between a major key and its relative minor, recolours the lesson, and loads the new tonality's first preset unless building.
- `FR-04` The label switch swaps primary and secondary labels on chord cards and slots.
- `FR-05` Tapping a chord card plays it, lights it and its scale notes for 900ms, and in building mode adds it as the next bar, up to eight.
- `FR-06` Choosing a preset loads it and starts playback; "Build your own" stops, empties and highlights the chords panel.
- `FR-07` In building mode, activating a slot removes it, by pointer, touch or keyboard. Focus then goes to the slot now in that place. If there isn't one, it goes to the slot before. If the progression is empty, it goes to the first chord card.
- `FR-08` Play/stop starts and stops the progression; tempo applies from the next bar; Loop decides whether it repeats.
- `FR-09` "Play scale" plays the eight notes 340ms apart, lighting each in turn.
- `FR-10` Each lesson-path step marks itself current and earlier steps done, then runs its action from §3.1.
- `FR-11` The panel highlight lasts 2.6s and scrolls the panel to the centre only when it isn't fully visible.
- `FR-12` Key pills and both switches are radio groups. Arrow keys move and select, wrap at the ends, and only the chosen option is tabbable.
- `FR-13` The audio context is created on the first gesture. If Web Audio is missing, or the context can't start, the lesson keeps working and shows the no-sound line. Only missing Web Audio is final: after a failed resume, the next sound tries again, as the file did, and the line goes once one works.
- `FR-14` Colour mode follows the system setting before first paint, with no flash of the wrong mode.

---

## 5. Non-functional requirements

- **Accessibility.** WCAG 2.2 AA. Usable by keyboard alone. Every text pair in `brand.md` §12 passes, in both tonalities and both modes. The focus ring is at least 3:1 on every surface it sits on: measured 3.77:1 in the worst case (light major on the tint). Panels keep their `aria-label`s; the chord cards keep their names with numbers first ("Chord 6m, Am minor") and follow the visible order with names first (C-15). Playback isn't announced bar by bar (Q7).
- **Reduced motion.** As `brand.md` §16.
- **Responsive.** §3.2. Nothing scrolls sideways at 320px.
- **Performance.** A tap sounds with no noticeable delay on a mid-range phone. A playback step re-renders only the lit card, notes and slot, not the whole lesson (`architecture.md` §12).
- **Browsers.** Current Safari, Chrome, Firefox and Edge, desktop and mobile. `color-mix()` isn't needed any more, because tints are worked out ahead of time.
- **Privacy.** No cookies, nothing written to browser storage, no third-party requests at runtime (fonts self-hosted, Q2). The colour-mode script reads one storage key and writes nothing unless a picker calls it, and there's no picker.
- **Security.** No `innerHTML` or `dangerouslySetInnerHTML`, except the design system's `colorModeScript()` constant.

---

## 6. Data

All in code, no persistence.

- **Key:** one of `'C' | 'G' | 'D' | 'A' | 'E' | 'B' | 'F#' | 'Db' | 'Ab' | 'Eb' | 'Bb' | 'F'`, in circle-of-fifths order.
- **Tonality:** `'major' | 'minor'`. Minor is the major scale rotated to its sixth note.
- **Scale note:** spelled name (with ♯/♭), pitch class, semitones from the tonic.
- **Chord:** degree 0–6, quality `'major' | 'minor' | 'dim'`, number (`'6m'`), name (`'Am'`), chord tones as scale degrees.
- **Preset:** id, name, degrees. Five major, four minor, values as in the file.
- **Path step:** title, description, action label, action id. The lesson maps action ids to what they do.
- **Lesson state** (a pure reducer in a small store, read with `useSyncExternalStore`; see `architecture.md` §4): key, tonality, label mode, progression (≤ 8 degrees), preset id or none, building, playing, current bar, loop, tempo, current path step or none. What's lit (chord, notes, slot) is read separately by the parts that light up, so a playback step doesn't re-render the lesson (§5). Rebuilding the slots unlights the playing slot until the next bar, as the file's rebuild does.

---

## 7. Technical approach

Follows `architecture.md` §1–4 and §8. The proposals there are confirmed by Q19.

### 7.1 Project setup

- Next.js 16, App Router, `output: 'export'`, TypeScript strict, npm, ESLint, Prettier, Vitest with React Testing Library, Playwright with `@axe-core/playwright`. Exact versions pinned. Each dependency's reason goes in the PR.
- `@amezquita/design-system` pinned to exactly `1.7.0`. Until 2026-11-30, install with `--min-release-age=0`, because `~/.npmrc` sets 7 days.
- `style-dictionary` pinned to the current 5.x (Q17).
- Scripts: `brand:check`, `brand:build` (`dev` and `build` call it first), `test`, `test:e2e`, `typecheck`, `lint`. Not `predev`/`prebuild`: with `ignore-scripts=true` in `~/.npmrc`, npm skips pre- and post-scripts even for `npm run`.
- CI: GitHub Actions with least-privilege `permissions`, third-party actions pinned to a full SHA with the version in a comment.
- `Nashville-Number-Lab.html` moves to `reference/nashville-number-lab.html`.

### 7.2 Structure

As `architecture.md` §2, with these names confirmed: route `app/lessons/nashville-numbers/`, `lessons/registry.ts`, `components/lesson/` (`LessonLayout`, `LessonPanel`, `LessonPath`, `RollText`, `SegmentSwitch`), `hooks/useSlidingIndicator.ts`, `lib/music/{theory,audio,transport}/`. `app/page.tsx` renders the same lesson as the route (Q5).

### 7.3 Styling and tokens

- **Load order** in `app/layout.tsx`: the design system's `base-light.css` and `base-dark.css`, then `styles/brand/song-workshop-light.css` and `-dark.css`, then `styles/global.css`.
- **No design-system `reset.css`.** Its own header says it exists only for Storybook and that apps bring their own. `global.css` carries the small reset the file has: `box-sizing`, `button { font: inherit; color: inherit }`, no default margins. It paints `html` and `body` with `--song-workshop-page` (R5). `color-scheme` comes from the brand CSS, which sets it under `[data-mode="dark"]`, so the native range input and scrollbars match.
- **Tonality** on the lesson root, `data-tonality="major" | "minor"`. The minor rule sets eight properties (R1).
- **Type.** Families, weights and tracking from tokens (`brand.md` §11, R6). Font sizes stay as the file's `rem` values in each component's CSS, except where a value equals a design-system token exactly (`0.75rem` → `font-size-xs`, `1rem` → `font-size-base`) (Q16).
- **Radius** (Q11): `border-radius-component` 18px (panels), `border-radius-interactive` 12px (key pills), `border-radius-lg` 16px (chord cards), `border-radius-pill` (switches, chips, buttons, notes, step numbers), `song-workshop-radius-tile` 14px (slots, path steps). The W/H labels' 6px stays a literal in the scale's CSS.
- **Shadows** (Q10): the file's accent-tinted shadows, written in the component's CSS with `var(--color-accent-default)` as the colour, so they follow tonality. No shadow tokens.
- **Spacing:** design-system space tokens wherever a value matches (4, 8, 12, 16, 20, 24, 32px); component-only measurements stay literal (`architecture.md` §4).
- **Breakpoints:** 900px and 620px, as literals.

### 7.4 Fonts

Self-hosted (Q2). Bricolage Grotesque with its optical-size axis (12–96) and weights 500–800, and Inter at 400, 500 and 600, from Fontsource packages imported in the root layout. The brand's `font-family-heading` and `font-family-base` name the families as Fontsource registers them. The `<brand>-fonts.json` that `amezquita-brand build` writes isn't used.

### 7.5 Colour mode

`colorModeScript()` as an inline `<script>` in `<head>`, so `html[data-mode]` is set before paint. No picker.

### 7.6 Sound and time

- `lib/music/audio/`: one lazy `AudioContext`, the file's chain and voices, a voice set so Stop can fade them all, disconnect on end. Exposes `playChord`, `playNote`, `silence`, and an `available` flag for Q8. `close` shuts the context when the lesson unmounts; the next sound would make a new one.
- `lib/music/transport/`: a bar loop on `setTimeout`, calling the lesson back with each bar index. It also runs the two one-off sequences ("Play scale", "Play all seven") so they cancel each other, as in the file.
- The lesson's reducer never touches audio. Effects and event handlers do.

### 7.7 Motion

`RollText` re-runs the roll animation when its text changes, with a delay prop for staggers. On first render it rolls only where the file does (pills, scale, chords), and that animation is in the prerendered HTML, so it plays before hydration. Slots pop by remounting, which reproduces the file's rebuild (§3.5). The sliding thumb and key indicator use `useSlidingIndicator`. It measures on choice change, on resize and once fonts have loaded, never per frame.

---

## 8. Components

| Component | Where | From | Notes |
|---|---|---|---|
| `LessonLayout` | `components/lesson/` | Project | Header, main column, sticky aside, footer. Lesson-agnostic |
| `LessonPanel` | `components/lesson/` | Project | `section` or `aside` with `aria-label`; the highlight comes from `usePanelHighlight` (`hooks/`) |
| `LessonPath` | `components/lesson/` | Project | Numbered steps from data; current/done state, with `aria-current="step"` on the current one; calls back with the step's index |
| `RollText` | `components/lesson/` | Project | §7.7 |
| `SegmentSwitch` | `components/lesson/` | Project | Two-to-five-way radio group with a sliding thumb (decisions/0003). Sizes `default` and `small` |
| `useSlidingIndicator` | `hooks/` | Project | Shared by `SegmentSwitch` and `KeyPicker` |
| `KeyPicker` | lesson folder | Project | 12 pills, sliding indicator, arrow keys, full names (C-11) |
| `ScaleRow` | lesson folder | Project | Eight notes, W/H labels, lit state |
| `ChordGrid` | lesson folder | Project | Seven buttons, lift, lit state, home tag |
| `ProgressionBuilder` | lesson folder | Project | Chips, slots as an `ol`; slot buttons in building mode (R3) |
| `Transport` | lesson folder | Project | Play/stop, native range input with `accent-color`, Loop toggle (`aria-pressed`), no-sound line |
| `VisuallyHidden` | design system | Design system | Holds the live region (C-09) |

Why so few design-system components (Q6): `Button` and `ToggleButton` have a 2px border, the pill shape and the design system's motion. `Slider` replaces the native range input. `SegmentedControl` doesn't slide. `Heading` and `Text` bring the design system's sizes: 18px body, and nothing between 12px and 14px, where most of the lesson's labels sit. Each would change how the lesson looks. The lesson still gets the design system's tokens, colour-mode script and brand pipeline.

---

## 9. Risks, assumptions and decisions

### 9.1 AME-75 review findings

**R1. Minor tonality: hover, pressed and focus** (should fix)

The minor rule on the lesson root has to set every accent token, not just four. A custom property that refers to another one, like a focus colour pointing at the accent, is worked out where it's declared (`:root`). So overriding `--color-accent-default` on the lesson root doesn't carry through to the others. Under `[data-tonality="minor"]`, the lesson sets:

| Property | Minor value from |
|---|---|
| `--color-accent-default` | `song-workshop-minor` |
| `--color-accent-hover` | `song-workshop-minor-hover` (new) |
| `--color-accent-pressed` | `song-workshop-minor-pressed` (new) |
| `--color-accent-text` | `song-workshop-minor-text` |
| `--color-accent-text-hover` | `song-workshop-minor-text-hover` (new) |
| `--color-border-focus` | `song-workshop-minor` |
| page tint | `song-workshop-tint-minor` |
| soft fill | `song-workshop-soft-minor` |

`--color-accent-foreground` stays the same in both. `color-border-focus` follows tonality: in major it's the accent fill, so the focus ring is green in major and indigo in minor, as in the file.

Hover and pressed are one and two steps away from the fill: 12% and 24% towards black in light mode, and towards white in dark mode, the way the design system's base goes lighter in dark. Proposed values, with the foreground's contrast on each:

| Token | Light | Dark |
|---|---|---|
| `color-accent-hover` | `#137654` (5.60:1) | `#56C7A2` (9.10:1) |
| `color-accent-pressed` | `#116649` (6.95:1) | `#6DCEAE` (10.01:1) |
| `color-accent-text-hover` | `#116649` | `#56C7A2` |
| `color-border-focus` | `#168660` | `#3FBF95` |
| `song-workshop-minor-hover` | `#414DB7` (7.07:1) | `#9BA4FF` (8.25:1) |
| `song-workshop-minor-pressed` | `#38439E` (8.52:1) | `#A8B1FF` (9.38:1) |
| `song-workshop-minor-text-hover` | `#414DB7` | `#9BA4FF` |

The lesson's own components don't use hover or pressed fills; the file moves things on hover instead, and so does the port. These tokens matter for any design-system component in the lesson. Without them, a primary `Button` would hover to the base's near-black.

**R2. Design-system items and the backlog** (should fix)

`architecture.md` §3 changes from "A gap goes into `docs/backlog.md` as a design system item" to:

> A gap becomes an issue in Linear's Design system project, linked from the Song Workshop issue that needs it ("related", or "blocked by" if it blocks). backlog-sync reads only the Song Workshop project, so these issues don't show in `docs/backlog.md`; the link on the Song Workshop issue is how they're found. The first is AME-79, the sliding thumb in `SegmentedControl`.

The "not released yet" notes in `architecture.md`, `brand.md` and decisions/0002 are out of date too: 1.7.0 is on npm. They're updated in the same commit. AME-78's description mentions a `blocked` label that it doesn't actually have; that line is corrected too.

**R3. Removing a chord by keyboard** (should fix)

Slots are an `ol` labelled "Progression", one `li` per bar. Outside building mode, a slot is plain content. In building mode, each slot's content is a `<button>`. It's named by what it shows, then the chord said out loud: "Remove bar 2: 6m, Am (A minor)" (C-15). It keeps the file's "Tap to remove" tooltip. Focus after removing follows FR-07, and the live region says "Removed bar 2." (C-09). It looks the same as the file, apart from the focus ring. Listed as C-02.

**R4. Where the green fails** (nice to have)

White on `#178A63` is 4.33:1. White on `#168660` is 4.55:1. The fill change (C-03) reaches every place light-mode major puts text or an icon on an accent fill:

- lit scale notes (the note name)
- the chosen key pill
- the chosen option of both switches (the thumb)
- the numbers of current and done lesson-path steps
- the playing chord (number, name, quality, "home" tag)
- the playing slot (number, name, "Bar n")
- the play/stop button's icon
- the focus ring and panel highlight border (not text; 3:1 needed, 3.77:1 or better)

The major tint and soft fill are recomputed from `#168660`, a change of under one step per channel (soft fill `#E1EFEA`). Dark mode and minor don't change.

**R5. The page outside the lesson** (nice to have)

The port doesn't load the design system's `reset.css`, so nothing paints `body` with the white panel colour. `global.css` paints `html` and `body` with a new brand token:

| Token | Light | Dark |
|---|---|---|
| `song-workshop-page` | `#EDF1EF` | `#0E1412` |

That's the file's untinted page. The lesson root fills at least the viewport and paints the tonality tint over it. Index and 404 pages, when they exist, get the page colour, not white. Overscroll shows the untinted page, 5% away from the tint (C-10). It has the same value as `color-surface-tertiary`, but it's a separate token because it means something else.

**R6. Contract tokens that already match** (nice to have)

- Tracking: −0.02em (page title, key name, chord numbers) → `letter-spacing-heading`; −0.01em (panel headings) → `letter-spacing-subheading`.
- Uppercase labels (eyebrow, panel labels, "home", chord quality, "Bar n") → a new `song-workshop-letter-spacing-caps` at 0.1em (C-12). The W/H labels' 0.04em stays a literal.
- `font-weight-label` (500) is the design system's weight for form-field labels. The lesson's uppercase labels are 600, so they use `song-workshop-font-weight-strong`, not `font-weight-label`. `brand.md` §11 says so explicitly.

### 9.2 Open questions in the docs

| ID | Question (where) | Proposal |
|---|---|---|
| Q1 | Which static host? (arch §17) | Not part of this issue. A follow-up issue picks the host and sets security headers |
| Q2 | Google Fonts or self-hosted? (arch §17, brand §11) | Self-hosted from Fontsource packages (§7.4), so no visitor IP goes to Google. Verified 2026-11-23: `@fontsource-variable/bricolage-grotesque`'s `opsz.css` carries opsz 12–96 and wght 200–800 (read from the font's fvar table), and the brand check passes with the Fontsource family names. Recorded as decisions/0005 |
| Q3 | Shareable key and progression in the URL? (arch §4, §17) | No. New behaviour, not part of a port |
| Q4 | Commit the built brand CSS? (arch §8, §17) | No. `styles/brand/` is gitignored, and `npm run dev` and `npm run build` build it first themselves (not as `predev`/`prebuild`, §7.1); CI runs the check and the build |
| Q5 | Index at `/`, or `/` as the first lesson? (arch §4, §17) | `/` renders the lesson too, with a canonical link to `/lessons/nashville-numbers`. A static export can't redirect. The index gets its own spec when the second lesson does |
| Q6 | Design-system or project components for chips, Play scale, Loop, path buttons, tempo? (arch §3) | Project components matching the file (§8). The tempo slider stays a native range input |
| Q7 | How is playback announced? (arch §4) | Not bar by bar: at 100 BPM that's a new announcement every 2.4s. The play button's name says whether it's playing. The live region carries building changes only (C-09) |
| Q8 | How is "no sound" shown? (arch §9) | One line under the transport, only when sound can't start: "Sound isn't available in this browser. Everything else still works." Also sent to the live region once |
| Q9 | Do chord-card and key-pill borders need 3:1? (brand §12) | No. Their text identifies them, so WCAG 1.4.11 doesn't require the border. They keep `color-border-default` `#D6DEDA`, as in the file. `color-border-strong` is set at token build to a green-grey that passes 3:1, for design-system fields |
| Q10 | Accent-tinted shadows, or fixed ones? (brand §13) | Accent-tinted, as in the file (§7.3) |
| Q11 | Radius tokens? (brand §13) | §7.3 |
| Q12 | Surface roles (brand §12) | As `brand.md` proposes: panels on `color-surface-primary` (`#FFFFFF` / `#161F1B`); switch tracks, filled slots and W/H labels on `color-surface-tertiary` (`#EDF1EF` / `#0E1412`); `color-surface-secondary` left for hover fills. Plus `song-workshop-page` (R5) |
| Q13 | Motion grouping (brand §16) | Approve the seven-token grouping (C-07). If the side-by-side check finds the play button's lift or the path arrow slower, they take `duration-state`. Delays between items stay in their component |
| Q14 | One display weight, 760? (brand §11) | Yes (C-08); split if the title or key name loses weight in the side-by-side check |
| Q15 | The contrast changes (brand §12) | Approve C-03, C-04 and C-05 |
| Q16 | Font sizes (not in the docs) | The design system's body is 18px/28px, and it has no step between 12px and 14px. The lesson keeps the file's sizes in component CSS and uses a token only where it's an exact match (§7.3) |
| Q17 | style-dictionary ms or seconds? (AME-84) | Install the current 5.x and accept durations written in seconds: nothing reads them as numbers. A note goes on AME-84, which still decides for the design system |
| Q18 | Design-system version | Exactly `1.7.0` |
| Q19 | The stack proposals (arch §1, decisions/0001) | Confirmed as listed in §7.1 |
| Q20 | Product questions (north star §11) | Only two touch the port: English only, and the footer stays word for word. The rest (audience, course order, saved progress, sound in every lesson) stay open; the port doesn't depend on them |

### 9.3 Risks

- **Rolling and popping in React.** The file restarts CSS animations by hand. React needs remounts or keyed restarts to do the same. Getting the staggers exactly right is the part most likely to drift; the side-by-side check looks at it first.
- **Fontsource and the brand check** (Q2). If the check rejects the family names, the fallback is ready, but it brings back Google Fonts.
- **`setTimeout` timing.** Carried over on purpose. Background tabs throttle it, just as in the file.

### 9.4 Assumptions

- ~~The design system's base CSS doesn't set `color-scheme`.~~ Checked 2026-11-23: the base and brand dark CSS set `color-scheme: dark` under `[data-mode="dark"]`, so `global.css` doesn't.
- `amezquita-brand build` accepts brand tokens of the brand's own for radius (`song-workshop-radius-tile`) and tracking, as it does for colour.

---

## 10. Acceptance criteria

### 10.1 Automated

- Theory: for all 12 keys × major and minor, scale spellings, chord numbers, names, qualities and chord tones match fixtures generated from `reference/nashville-number-lab.html`.
- Audio voicing: for each degree in each key, `chordMidis` gives the file's bass and triad.
- Transport, with fake timers: steps, loops, stops at the end with Loop off, picks up a tempo change from the next bar, and Stop cancels.
- Components: `SegmentSwitch` and `KeyPicker` choose by click and by arrow keys, wrap, and have one tab stop. `ProgressionBuilder` adds up to eight, removes by click and by keyboard with focus as FR-07, and shows the empty state.
- Playwright: each of the five path steps runs; the whole lesson can be used by keyboard alone; axe passes on `/` and `/lessons/nashville-numbers` in light and dark, in major and minor.
- Brand: `amezquita-brand check` passes with `contrast-pairs.json`, including every pair in `brand.md` §12 and R1.

### 10.2 Side by side, by eye

The original from `reference/` next to the port, in the same browser, light and dark, at 1280px, 800px and 375px. Everything matches except §3.4:

- First load: pill, scale and chord roll-ins, slot pop-ins, staggers
- Changing key while playing: only the names roll, the numbers stay
- Major ↔ minor: thumb slide, accent fade (600ms), tint fade (700ms), slots popping in
- Numbers ↔ names: labels roll on cards and slots
- Key indicator sliding between rows of pills
- Chord tap: lift, lit notes, shadow, unlight after 900ms
- Playing: lit card, notes and slot, play/stop icon turn
- Building: empty state, adding, removing, the full state
- Each path step, with the panel highlight and scroll
- Reduced motion on
- The sound of a chord, the scale and a progression (by ear)
- Everything in R4's list, at the new green

---

## 11. Implementation plan

Each phase is one or more commits on `vikincas/ame-78-port-nashville-number-lab-into-the-nextjs`.

1. **Docs.** The changes in §12.
2. **Project and brand.** Next.js setup, CI, the brand tokens with `contrast-pairs.json`, fonts, colour mode, `global.css`. Move the file to `reference/`. An empty lesson page that builds and passes axe.
3. **`lib/music`.** Fixture script against the reference file, theory with tests, audio, transport with tests.
4. **Shared lesson components.** `LessonLayout`, `LessonPanel`, `LessonPath`, `RollText`, `SegmentSwitch`, `useSlidingIndicator`, with component tests.
5. **The port.** The lesson folder, registry, both routes, Playwright.
6. **Check.** The side-by-side check (§10.2), `accessibility-review` and `quality-gate`. Delete `reference/` once it passes, per `architecture.md` §2.

---

## 12. Doc changes on approval

- `architecture.md`: Status (1.7.0 released); §1 stack confirmed (Q19); §3 design-system gaps (R2) and the component choices (Q6); §4 Tonality's eight properties (R1), Styling without `reset.css` (R5), Routing (Q5), Accessibility (C-01, C-02, Q7); §8 brand CSS not committed (Q4); §17 answered.
- `brand.md`: Status; §11 tracking and `font-weight-label` (R6), fonts (Q2); §12 hover/pressed/focus values (R1), where the green reaches (R4), surface roles and `song-workshop-page` (Q12, R5), borders (Q9); §13 radius and shadows (Q10, Q11).
- decisions/0002: the "not released" consequence is resolved.
- decisions/0005 (new): fonts are self-hosted (Q2).
- AME-78's description: the `blocked` label line (R2).
- AME-84: a comment on Song Workshop's choice (Q17).
- A new issue for the host (Q1).
