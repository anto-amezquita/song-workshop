# 0004 — Motion keeps the lesson's feel, as the brand's own tokens

## Status

Accepted (2026-11-22). The approach is decided. How the file's timings are grouped into tokens is a proposal.

## Context

The lesson's motion uses one easing, `cubic-bezier(.2,.8,.2,1)`, and timings from 0.25s to 0.7s. The design system has `easing-default` and durations of 100, 200, 400 and 650ms, and the brand contract doesn't let a brand set them. Moving to the design system's values would make the lesson feel slightly stiffer.

## Decision

Keep the lesson's current feel. Its easing and durations become motion tokens of the brand's own, starting with `song-workshop-`.

## Alternatives considered

- **Use the design system's durations and easing.** Rejected: it changes how the lesson feels, and the port should feel like the original.

## Consequences

### Positive

- The port can match the original's motion side by side.
- Every motion value has a name, so later lessons can reuse it.

### Negative

- Design-system components inside a lesson keep the design system's own motion, so they can move slightly differently from the lesson's own components.
- Any grouping of the file's timings into fewer tokens changes some timings. `docs/brand.md` §16 lists the proposed grouping and every timing it would change, so the side-by-side check knows what to expect. Grouping nothing, one token per timing in the file, is the fallback.

## Related files

- `docs/brand.md` §16 (motion identity)
