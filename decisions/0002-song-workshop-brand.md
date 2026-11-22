# 0002 — Song Workshop has its own brand

## Status

Accepted (2026-11-22). The brand's direction is decided. Its token values are still proposals in `docs/brand.md`.

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

- The brand check and brand build aren't released yet (`amezquita-brand check/build` and the brand contract came in with design-system PR #207 and aren't in 1.6.7 on npm). The brand can't be built until the design system is released.
- The brand contract has no slot for a second accent, so minor needs tokens of the brand's own and a switch on the lesson root (`docs/architecture.md` §4, Styling).
- Some values in the file don't fit the contract as it is and need deciding. They're listed in `docs/brand.md` §11–13 as proposals: the light-mode green and the label opacity on a playing chord and a playing slot (contrast), how the page and panel surfaces map to the contract's surface roles, accent-tinted shadows, and whether the generated font link can request Bricolage's optical-size axis.

## Related files

- `docs/brand.md` §11 (typography), §12 (colour), §13 (shape)
- `docs/architecture.md` §8 (design system integration)
