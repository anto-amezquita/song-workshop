# 0002 — Song Workshop has its own brand

## Status

Accepted (2026-11-22). The brand's direction is decided. Its token names and values were settled on 2026-11-23 by the port spec (`specs/2026-11-23-nashville-number-lab-port.md`) and are recorded in `docs/brand.md`.

## Context

The site is styled with `@amezquita/design-system`. A product can either use an existing brand (the portfolio's: Schibsted Grotesk and warm neutrals) or define its own brand in its own repo, checked against the design system's brand contract, the way Ajar does it.

Nashville Number Lab already has a clear look: green for major, indigo for minor, a green-grey page, and Bricolage Grotesque with Inter. Colour carries meaning in the lesson. It tells you which tonality you're in.

## Decision

Song Workshop gets its own brand, `song-workshop`, with its tokens in `tokens/brands/song-workshop/`. It keeps:

- green for major and indigo for minor
- Bricolage Grotesque for headings, numbers and note names, and Inter for body text and controls

## Alternatives considered

- **The portfolio brand**, with major and minor as extra tokens. Rejected: it would change the lesson's whole look, and the warm neutrals don't fit a green/indigo accent pair.

## Consequences

### Positive

- The lesson keeps its look and its colour-means-tonality idea.
- Design-system components pick up the brand through the same tokens as every other product.

### Negative

- The brand needed the brand check and brand build, which weren't on npm when this was decided. *Resolved 2026-11-23:* they're in `@amezquita/design-system` 1.7.0 (AME-76).
- The brand contract has no slot for a second accent, so minor needs tokens of the brand's own, including its hover, pressed and focus states, and a switch on the lesson root (`docs/architecture.md` §4, Styling).
- Some values in the file didn't fit the contract. *Resolved 2026-11-23* by the port spec, and recorded in `docs/brand.md` §11–13: a slightly darker light-mode green and full-strength labels on a playing chord and slot (contrast), panels on `color-surface-primary` with a page colour of the brand's own, accent-tinted shadows in component CSS, and fonts loaded by the project, because the generated font link can't request Bricolage's optical-size axis (decisions/0005).

## Related files

- `docs/brand.md` §11 (typography), §12 (colour), §13 (shape)
- `docs/architecture.md` §8 (design system integration)
