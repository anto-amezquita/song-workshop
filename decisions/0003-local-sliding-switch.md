# 0003 — The sliding thumb is built in this repo

## Status

Accepted (2026-11-22). Where it's built is decided. How it's built (component names, a shared hook) is a proposal.

## Context

The lesson has two switches: major/minor and numbers/names. In both, a thumb slides to the chosen option. The design system's `SegmentedControl` fills the chosen option instead and doesn't slide. Keeping the lesson's transitions and interactions means keeping the sliding thumb.

## Decision

Build the sliding switch in this repo. Don't change the design system from here. A separate backlog item brings the sliding thumb to `SegmentedControl` later, in the design-system repo.

## Alternatives considered

- **Add the sliding thumb to `SegmentedControl` now, as a minor design-system release.** Every project would get it, but it ties this port to a design-system change.
- **Use `SegmentedControl` as it is.** Rejected: it changes how the switches behave, and the lesson should behave like the original file.

## Consequences

### Positive

- The port doesn't wait on a design-system release for this.
- The local switch can be tried in a real lesson before the design system takes it on.

### Negative

- One more component to keep in this repo until the design system has it.
- The local switch has to match the design system's semantics and keyboard handling by hand.

Proposed, not decided: a `SegmentSwitch` component in `components/lesson/`, and a `useSlidingIndicator` hook that the key picker shares for its own sliding indicator (`docs/architecture.md` §2).

## Related files

- `docs/architecture.md` §3 and §8 (Gaps)
- `docs/backlog.md`: "Bring the sliding thumb to the design system's SegmentedControl"
