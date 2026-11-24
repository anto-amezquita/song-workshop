# brand.md

## Purpose

This file defines how the product should express its identity through voice, visual character, and emotional tone.

A brand is not only a logo, palette, or font choice. It is the consistent feeling people get from the product over time — through what it says, how it looks, how it behaves, and what it chooses to emphasise.

This document exists to keep brand expression coherent across product design, content, marketing, and implementation.

> **Status (2026-11-23):** Sections 11 (typography), 12 (colour), 13 (shape) and 16 (motion) are filled in from the Nashville Number Lab file and settled by the approved port spec, `specs/2026-11-23-nashville-number-lab-port.md` (AME-78). The other sections are still the template. The tokens will live in `tokens/brands/song-workshop/`. Once they exist, the token files hold the values and this doc holds the reasons; if the two disagree, the tokens win and this doc gets fixed.
>
> - **Decided:** the brand's own direction, green for major, indigo for minor, Bricolage Grotesque with Inter (decisions/0002), motion as the brand's own tokens (decisions/0004), self-hosted fonts (decisions/0005), and the token names and values below. Values that differ from the file are marked *changed*, and the port spec lists them (C-03 to C-12), so the side-by-side check knows where to look.
> - **Can still move:** two timings and the single display weight, if the side-by-side check finds them off (§11, §16). Values listed as "in the file" are facts.
> - **Released:** the brand contract and `amezquita-brand check` and `build` are in `@amezquita/design-system` 1.7.0 (AME-76).

---

## Relationship to the other core files

- `product-north-star.md` defines **what the product is, who it is for, and why it exists**
- `spec.md` defines **how product work should be specified before it is built**
- `design.md` defines **how the product should be designed as an interface and system**
- `brand.md` defines **how the product should feel, sound, and be recognised**

---

# Brand foundation

## 1. Brand essence

### One-line essence

[Write one compact sentence that captures the product at its deepest level.]

### What we want people to feel

- [Feeling]
- [Feeling]
- [Feeling]

### What we are not

- not [undesired quality]
- not [undesired quality]
- not [undesired quality]

---

## 2. Brand promise

[Describe the dependable value people should expect every time they encounter the product.]

---

## 3. Audience relationship

### We should feel like

- [e.g. a trusted guide]
- [e.g. a sharp collaborator]

### We should not feel like

- [e.g. a distant institution]
- [e.g. an overexcited salesperson]

### User posture

The product should make users feel:

- [e.g. capable, not dependent]
- [e.g. informed, not overwhelmed]
- [e.g. respected, not manipulated]

---

# Personality

## 4. Brand attributes

Choose 3–5 core attributes that define the brand character.

### [Attribute]

**Meaning**  
[What this means.]

**In practice**
- [How it appears]
- [How it appears]

**Not**
- [What it should not become]

---

## 5. Personality sliders

| Dimension | Lean |
|---|---|
| Serious ↔ Playful | [ ] |
| Minimal ↔ Expressive | [ ] |
| Warm ↔ Cool | [ ] |
| Classic ↔ Contemporary | [ ] |
| Quiet ↔ Bold | [ ] |
| Expert ↔ Approachable | [ ] |
| Editorial ↔ Productive | [ ] |
| Refined ↔ Raw | [ ] |

---

# Voice and language

## 6. Voice

### Our voice is

- [Trait]
- [Trait]
- [Trait]

### Our voice is not

- [Trait]
- [Trait]
- [Trait]

---

## 7. Tone by context

### Product UI
- [Trait]
- [Trait]

### Onboarding
- [Trait]
- [Trait]

### Errors
- [Trait]
- [Trait]

### Marketing
- [Trait]
- [Trait]

### Empty states
- [Trait]
- [Trait]

### Sensitive moments
- [Trait]
- [Trait]

---

## 8. Writing rules

- Lead with meaning.
- Prefer plain language over brand theatre.
- Be specific rather than generic.
- Use active voice where possible.
- Avoid filler, buzzwords, and claims the product cannot prove.
- Buttons should describe the action.
- Headlines should carry an idea, not just decorate the page.
- Microcopy should reduce uncertainty.

### Prefer

- [Good example]
- [Good example]

### Avoid

- [Weak example]
- [Weak example]

---

# Visual identity

## 9. Visual direction

### The product should feel

- [Quality]
- [Quality]
- [Quality]

### The product should avoid feeling

- [Quality]
- [Quality]
- [Quality]

### Visual keywords

- [Keyword]
- [Keyword]
- [Keyword]

---

## 10. Logo

### Role

[How the logo should function in the system.]

### Variants

- primary logo
- compact logo
- symbol / mark
- monochrome version
- reversed version
- app icon / favicon

### Rules

- Preserve approved proportions.
- Use approved colour versions only.
- Do not distort, outline, shadow, animate, or decorate the logo unless explicitly defined.
- Use the simplest valid version for the context.

---

## 11. Typography

### Type roles

- display / headline: **Bricolage Grotesque**, variable (optical size 12–96, weight 500–800)
- body: **Inter**, 400, 500, 600
- interface: **Inter**
- numbers and note names inside a lesson (chord numbers, chord names, key names, scale notes): **Bricolage Grotesque**. The numbers are what the first lesson teaches, so they get the display face.
- mono: not used. The design system's JetBrains Mono stays the default if code ever shows up.

### Typographic character

Bricolage gives the headings and the big chord numbers a chunky, slightly hand-made voice. Inter keeps hints and controls quiet, so the numbers stay the loudest thing on the page.

Tracking in the file:

- tight: −0.02em on the page title, key name and chord numbers; −0.01em on panel headings. Slot numbers have none.
- wide, on uppercase labels: 0.12em on the eyebrow, 0.1em on panel labels and the "home" tag, 0.09em on chord qualities, 0.08em on "Bar n" in the slots.
- 0.04em on the W/H step labels in the scale, which aren't uppercase.

Tokens:

| Tracking | Token | Value |
|---|---|---|
| Page title, key name, chord numbers | `letter-spacing-heading` | −0.02em, as in the file |
| Panel headings | `letter-spacing-subheading` | −0.01em, as in the file |
| Every uppercase label: eyebrow, panel labels, "home", chord quality, "Bar n" | `song-workshop-letter-spacing-caps` | 0.1em. *Changed:* the eyebrow was 0.12em, the quality 0.09em, "Bar n" 0.08em (port spec C-12) |
| W/H step labels | none: a literal in the scale's CSS | 0.04em, as in the file |

### Weights

What the file uses, by face:

| Face | Weight | Used for |
|---|---|---|
| Bricolage | 780 | key name |
| Bricolage | 760 | chord and slot numbers |
| Bricolage | 750 | page title |
| Bricolage | 700 | lesson-path step numbers |
| Bricolage | 650 | panel headings, scale note names |
| Bricolage | 600 | key pills, the chord's and slot's secondary name |
| Inter | 600 | eyebrow, panel labels and the "home" tag (all uppercase), scale degrees and W/H labels, lesson-step titles, the tempo value, lesson-path buttons |
| Inter | 500 | switches and outline buttons |
| Inter | 400 | body text, preset chips, and two uppercase labels: the chord's quality and "Bar n" in the slots |

Tokens:

| Role | Token | Weight | Covers in the file |
|---|---|---|---|
| Page title, key name, chord and slot numbers | `font-weight-display` | 760 | 750, 760, 780 |
| Panel headings, scale note names | `font-weight-heading` | 650 | 650 |
| Lesson-path step numbers | `song-workshop-font-weight-step` | 700 | 700 |
| Labels, secondary names, step titles, key pills, lesson-path buttons, the tempo value, scale degrees, W/H labels | `song-workshop-font-weight-strong` | 600 | 600, in both faces |
| Switches and outline buttons | `font-weight-control` | 500 | 500 |
| Body text, preset chips, chord qualities, "Bar n" | `font-weight-body` | 400 | 400 |

The step numbers get a token of the brand's own, because the design system's `font-weight-title` means card and dialog headers.

The uppercase labels are 600, so they use `song-workshop-font-weight-strong`. They don't use the contract's `font-weight-label` (500): that's the design system's weight for form-field labels, and the lesson has no form fields.

750, 760 and 780 become one display weight, 760 (port spec C-08). On a variable font, a difference of 10–30 is hard to see. If the side-by-side check finds the page title or key name noticeably lighter, it gets a token of its own.

### Rules

- Use type to create hierarchy before adding decoration.
- Keep the number of styles deliberate and limited.
- Let typography carry some of the brand character.
- Preserve readability in product contexts.
- Numbers that change while you watch (tempo, step counts) use tabular figures, so they don't shift sideways.
- The fonts must load as the file loads them: Bricolage with its optical-size axis (12–96) and weights 500–800, Inter at 400, 500 and 600. Without the optical-size axis, the headings won't match the original.

The font link `amezquita-brand build` would generate doesn't do this today. The design system's `brand/fonts.mjs` can already request extra axes (Archivo's width, Fraunces' SOFT and WONK), so the gap is two entries in its list of fonts: Bricolage's entry has a weight range (200–800) but no optical-size range, and there's no entry for Inter, so the build would report Inter as unknown. So the project loads both fonts itself, self-hosted from Fontsource packages (decisions/0005). The brand's `font-family-heading` and `font-family-base` name the families as Fontsource registers them, and the `song-workshop-fonts.json` that `amezquita-brand build` writes isn't used.

---

## 12. Colour

### Colour personality

Colour tells you which tonality you're in. Green is major, indigo is minor, and the whole lesson leans toward the current one: the accent, the soft fills behind chosen things, and a faint tint in the page background. Everything else is a quiet green-grey, so the change on switching reads clearly.

### Colour roles

Light and dark are both listed. The values are the file's, except those marked *changed*: two change for contrast (see below), and the hover, pressed and focus states are new, because the file has none.

| Role in the file | Contract token | Light | Dark |
|---|---|---|---|
| Panels, cards | `color-surface-primary` | `#FFFFFF` | `#161F1B` |
| Switch tracks, filled progression slots, W/H step labels | `color-surface-tertiary` | `#EDF1EF` | `#0E1412` |
| Text | `color-text-primary` | `#13201A` | `#E5EEEA` |
| Hints, labels, secondary text | `color-text-secondary` | `#5B6B63` | `#93A39B` |
| Panel edges, dividers, chord-card and key-pill borders | `color-border-default` | `#D6DEDA` | `#26322D` |
| Accent fill, major | `color-accent-default` | `#168660` *(changed; file: `#178A63`)* | `#3FBF95` |
| Accent fill on hover, major | `color-accent-hover` | `#137654` *(new)* | `#56C7A2` *(new)* |
| Accent fill while pressed, major | `color-accent-pressed` | `#116649` *(new)* | `#6DCEAE` *(new)* |
| Accent as text, major | `color-accent-text` | `#137453` *(changed; file: `#178A63`)* | `#3FBF95` |
| Accent text on hover, major | `color-accent-text-hover` | `#116649` *(new)* | `#56C7A2` *(new)* |
| Focus ring, major | `color-border-focus` | `#168660` | `#3FBF95` |
| Text on an accent fill | `color-accent-foreground` | `#FFFFFF` | `#0B1210` |

Hover and pressed are one and two steps away from the fill: 12% and 24% towards black in light mode, and towards white in dark, the way the design system's base goes lighter in dark. The foreground reads at 5.60:1 or better on all of them. The lesson's own components don't use them, because hover in the lesson moves things instead of darkening them. They're there for any design system component in a lesson: without them, a primary `Button` would hover to the base's near-black.

The focus ring is the accent fill and follows tonality: green in major, indigo in minor, as in the file. It's at least 3:1 on every surface it sits on: 3.77:1 at the lowest, light major on the tint.

#### Surface roles

The file has two surfaces: a green-grey page, and white panels on it. Switch tracks, filled progression slots and the W/H step labels use the page colour. The empty slot doesn't: it's transparent, with a dashed border. The design system's roles don't line up one to one:

- `color-surface-primary` is the page background *and* the containers that sit flat on it: cards, dialogs, menus, form fields.
- `color-surface-secondary` is hover and selected fills (tabs, nav items).
- `color-surface-tertiary` is switch tracks, among others.

Decided (port spec Q12): panels go on `color-surface-primary`, so any design-system card or field dropped into a panel matches it. Switch tracks, filled slots and the W/H step labels go on `color-surface-tertiary`. That leaves `color-surface-secondary` free for hover fills.

The page itself is `song-workshop-page`, a token of the brand's own (below). `global.css` paints `html` and `body` with it, and a lesson paints its tonality tint on top. The page colour has the same value as `color-surface-tertiary` but means something else, so it gets its own token. The design system's `reset.css` isn't loaded, because it would paint `body` with `color-surface-primary`, the white panel colour (port spec R5).

#### Tokens of the brand's own

For the page, minor and the tints.

| Role | Token | Light | Dark |
|---|---|---|---|
| Untinted page | `song-workshop-page` | `#EDF1EF` | `#0E1412` |
| Accent fill, minor | `song-workshop-minor` | `#4A58D0` | `#8D98FF` |
| Accent fill on hover, minor | `song-workshop-minor-hover` | `#414DB7` *(new)* | `#9BA4FF` *(new)* |
| Accent fill while pressed, minor | `song-workshop-minor-pressed` | `#38439E` *(new)* | `#A8B1FF` *(new)* |
| Accent as text, minor | `song-workshop-minor-text` | `#4A58D0` | `#8D98FF` |
| Accent text on hover, minor | `song-workshop-minor-text-hover` | `#414DB7` *(new)* | `#9BA4FF` *(new)* |
| Page tint, major (5% accent in the page) | `song-workshop-tint-major` | `#E2ECE8` | `#101D19` |
| Page tint, minor | `song-workshop-tint-minor` | `#E5E9ED` | `#141B1E` |
| Soft fill, major (13% accent in a panel) | `song-workshop-soft-major` | `#E1EFEA` *(changed; file: `#E1F0EB`)* | `#1B342B` |
| Soft fill, minor | `song-workshop-soft-minor` | `#E7E9F9` | `#252F39` |

In minor, the lesson root points the contract's accent tokens and `color-border-focus` at these (`architecture.md` §4, Tonality).

The file mixes the tint and soft fill at runtime with `color-mix()`. Here they're worked out ahead of time as hex, because the brand check can only measure hex. The fade between major and minor still works, as a transition between two colours. The major tint and soft fill are worked out from the new green, `#168660`. The tint comes out the same as the file's, and the soft fill moves by one step in two channels.

Still to set when the tokens are built: the neutral ramp (`color-neutral-50…900`) as green-greys around the values above, and `color-border-strong`, which needs 3:1 on both panels and page for design system form fields. The brand check enforces it.

### Contrast, measured 2026-11-22

- **Playing chord and playing slot, light mode.** A playing chord and a playing progression slot are filled with the accent, and their small labels need 4.5:1: on the chord, the secondary name and the quality; on the slot, the secondary name and "Bar n". The file misses that twice over. Its green, `#178A63`, gives 4.33:1 with white. And it shows those labels at 85% opacity, which brings them down to 3.58:1. Darkening the green alone isn't enough: at 85% opacity, even `#168660` gives only 3.75:1.

  Decided (port spec C-03, C-04): two changes from the file, which together give 4.55:1. The fill becomes `#168660`, which looks almost the same. And on a playing chord and a playing slot, those labels show in full `color-accent-foreground`, with no opacity.
- **Everywhere else white sits on the green, light mode.** White on the file's green fails at 4.33:1 in more places than the playing chord and slot. The new fill reaches all of them (port spec R4), so the side-by-side check looks at each:
  - lit scale notes (the note name)
  - the chosen key pill
  - the chosen option of both switches (the thumb)
  - the numbers of current and done lesson-path steps
  - the playing chord (number, name, quality, "home" tag) and the playing slot (number, name, "Bar n")
  - the play/stop button's icon
  - the focus ring and the panel highlight's border (not text, so 3:1 is enough: 3.77:1 or better)
- **Major green as text, light mode.** The eyebrow sits on the tinted page, where the file's green gives 3.59:1. Decided (C-05): `color-accent-text` becomes `#137453`: 4.77:1 on the tint, 5.75:1 on white.
- **Accent text on white panels, light mode.** The file puts the green as text on a white panel in two places: the "home" tag on a chord card, and the button of each lesson step that isn't the current one. Both give 4.33:1, which fails. With `color-accent-text` at `#137453` they give 5.75:1. Minor passes unchanged at 5.84:1.
- **Accent text on the soft fills.** The file puts accent-coloured text on the soft fill in three places: the numbers on a chosen preset chip, the H labels in the scale, and the button of the current lesson step. In light major that's 3.68:1, which fails. With `color-accent-text` at `#137453` it's 4.89:1 (4.86:1 on the soft fill of the darker green). Minor passes unchanged at 4.84:1.
- **Indigo** passes unchanged: 5.84:1 with white, 4.78:1 as text on its tint.
- **Dark mode** passes everywhere measured: 6.48–8.21:1 for accent fills, for accent text on the tints, and for accent text on panels (the "home" tag and the buttons of steps that aren't current: 7.30:1 in major, 6.48:1 in minor), 5.2–5.8:1 for accent text on the soft fills, and 5.06–5.15:1 for secondary text on the soft fills (the current lesson step's description).
- **Secondary text, light mode,** passes but only just: 4.94:1 on the page, 4.62–4.67:1 on the tints, 4.67–4.79:1 on the soft fills. Don't make it lighter.
- **Panel border** `#D6DEDA` is 1.37:1 on white. That's fine for a panel edge. Chord cards and key pills keep it too (port spec Q9): their text tells you what they are, so WCAG 1.4.11 doesn't ask their border for 3:1.
- **Hover, pressed and focus** (measured 2026-11-23): the foreground on every hover and pressed fill is 5.60:1 or better in both tonalities and modes. Hover text on white panels: 6.95:1 in major and 7.07:1 in minor in light, 8.10:1 and 7.34:1 in dark. The focus ring: 3.77:1 or better on every surface.

Every pair above goes into `contrast-pairs.json`, so the brand check measures it, except the panel border, which doesn't need 3:1.

### Rules

- Use colour with intent.
- Let neutrals carry most of the interface if the brand benefits from restraint.
- Reserve accent colour for action, emphasis, or memorable moments.
- Maintain accessibility and semantic consistency.
- The accent follows the tonality. Nothing uses green or indigo just for decoration.
- Colour is never the only sign of major or minor. The text says it too: the switch, the key name, the quality under each chord.

---

## 13. Shape and material

### Shape

Rounded, soft corners. In the file:

- 18px: panels
- 16px: chord cards
- 14px: progression slots, lesson-path steps
- 12px: key pills and their indicator
- 6px: the W/H step labels in the scale
- fully round: switches, chips, outline buttons, the play button, scale notes, step numbers

Tokens (port spec Q11), with every value as in the file:

| Radius | Token |
|---|---|
| 18px, panels | `border-radius-component` (contract, set by the brand) |
| 16px, chord cards | `border-radius-lg` (the design system's own, already 16px) |
| 14px, progression slots and lesson-path steps | `song-workshop-radius-tile` |
| 12px, key pills and their indicator | `border-radius-interactive` (contract, set by the brand) |
| fully round | `border-radius-pill` |
| 6px, W/H step labels | none: a literal in the scale's CSS |

### Material feeling

Flat white panels on a tinted page, with depth only where something is happening. In the file, the shadows and the focus glow are tinted with the accent, so they turn indigo in minor:

- the playing chord: `0 14px 30px -14px` in the accent
- the play button: `0 10px 24px -12px` in the accent
- the panel focus glow: a 5px ring in the soft fill

The contract's shadow tokens are fixed colours, so they can't follow the tonality. Decided (port spec Q10): the shadows stay accent-tinted, as in the file. Each is written in its component's CSS with `var(--color-accent-default)` as its colour, so it turns indigo in minor. There are no shadow tokens.

### Rules

- Radius, border, depth, and surface treatment should reinforce the brand personality.
- Similar components should share a similar physical language.
- Decorative form should not undermine usability.

---

## 14. Imagery

### Direction

- [Quality]
- [Quality]
- [Quality]

### Rules

- Use imagery only when it adds meaning, emotion, or recognition.
- Choose a consistent treatment across the product and communications.
- Avoid generic stock imagery.
- Keep crops, lighting, colour treatment, and composition aligned with the brand character.

---

## 15. Iconography

### Direction

[Describe whether icons should feel geometric, rounded, outlined, filled, technical, friendly, etc.]

### Rules

- Use one coherent icon style.
- Match stroke weight and visual density across the set.
- Prefer common symbols when clarity matters.
- Icons should support meaning, not carry ambiguous interactions alone.

---

## 16. Motion identity

### Motion should feel

- **settled**: things start quickly and land softly
- **continuous**: a change happens in place. Text rolls in where the old text was, and the thumb slides to the new choice, so you can see what changed.
- **layered**: the page tint fades more slowly than the controls, so switching to minor feels like the room changing, not one button

### Tokens

All motion tokens are the brand's own (decisions/0004). The brand contract doesn't let a brand set the design system's motion tokens.

The file's timings, grouped into tokens (approved in the port spec, C-07):

| Token | Value | Used for | In the file now |
|---|---|---|---|
| `song-workshop-easing-settle` | `cubic-bezier(0.2, 0.8, 0.2, 1)` | every transition and animation | the same, except the fades listed below |
| `song-workshop-duration-state` | 300ms | colour, border and fill changes on hover and selection, a scale note's colour change when it lights up, and the play icon fading | 250–350ms |
| `song-workshop-duration-move` | 400ms | movement: chord lift, panel focus glow, a scale note's scale-up when it lights up, slot pop-in, play button lift, play icon turning, the lesson-path button's arrow sliding out | 300–450ms |
| `song-workshop-duration-slide` | 500ms | sliding thumb, key indicator | 450–500ms |
| `song-workshop-duration-roll` | 550ms | text rolling in | 550ms |
| `song-workshop-duration-tonality` | 600ms | accent colour changing between major and minor | 600ms |
| `song-workshop-duration-page` | 700ms | page tint changing between major and minor | 700ms |

What this grouping changes, so the side-by-side check knows where to look:

- **Timings.** Most move by up to 50ms. Two move by 100ms, from `.3s` in the file to `duration-move` at 400ms: the play button's lift, and the lesson-path button's arrow sliding out on hover (its `gap`). If either feels slower, give it `duration-state` instead.
- **Easing.** Seven fades in the file use the browser's default easing, not `settle`: the W/H step labels in the scale, the chord's secondary name, the chord's quality, the chip's small text, the play icon's opacity, the outline buttons, and the lesson-path button's colour. Moving them to `settle` changes how they fade.

If the grouping changes the feel, the fallback is one token per timing in the file, and the file's default easing kept where it's used.

Delays between items (key pills 18ms apart, scale notes 35ms, chords 40ms, progression slots 45–50ms) are choreography, not brand. They live with the component that uses them and are listed in the spec.

### Reduced motion

With reduced motion on, every transition and animation finishes at once, and scrolling to a panel jumps instead of gliding. Nothing that carries meaning is lost: the lit notes, the playing chord and the chosen option still change, just without movement.

### Rules

- Motion should support the product before expressing the brand.
- Use consistent easing, duration, and scale.
- Let key transitions carry personality.
- Avoid ornamental motion that slows people down.
- Respect reduced-motion preferences.
- Motion never delays sound. A chord plays the moment it's tapped, and its animation follows.

---

# Brand in use

## 17. Brand expression by context

### Product interface

The brand should appear through:

- typography
- spacing
- colour restraint
- motion behaviour
- copy
- component details

### Marketing site

The brand may become more expressive through:

- larger typography
- richer imagery
- bolder composition
- narrative copy
- more atmospheric motion

### Social content

The brand should remain recognisable through:

- consistent voice
- repeatable layouts
- colour and type signatures
- a clear point of view

### Documentation

Documentation should feel:

- practical
- clear
- structured
- aligned with the product voice

---

## 18. Brand decision checklist

Before introducing a new visual or verbal direction, ask:

- Does this support the product’s purpose?
- Does it feel like the same brand?
- Does it improve clarity or recognition?
- Is it accessible?
- Is it durable, or just fashionable?
- Can it scale across product and communication?
- Does it add something meaningful, or only more?

---

# Final review checklist

- Is the brand essence clear?
- Are the core attributes specific enough to guide decisions?
- Is the audience relationship defined?
- Is the voice distinct and usable?
- Are visual choices connected to personality, not arbitrary taste?
- Are typography, colour, imagery, shape, and motion aligned?
- Are there clear boundaries around what the brand is not?
- Can the brand appear consistently across product, marketing, and content?
- Does the brand strengthen the product rather than sit on top of it?
- Could another designer or writer extend the brand without guessing its core character?
