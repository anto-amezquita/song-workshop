# 0001 — Next.js with static export

## Status

Accepted (2026-11-22). Only the framework and the static export are decided. The tooling around it is still a proposal (see Consequences).

## Context

Song Workshop starts as one self-contained HTML file, Nashville Number Lab. More lessons are planned (blues, rhythm, melody, lyric writing), and each should get its own address. The site uses `@amezquita/design-system`, which ships React 19 components. Nothing in the first lesson needs a server: no accounts, no stored data, all sound made in the browser.

## Decision

Build the site with Next.js, App Router, and `output: 'export'`, so the whole site is static files. Each lesson is its own route and becomes its own HTML file.

"Like the portfolio" means the same framework and the same way of using the design system (React components imported from the package, token CSS loaded in the root layout). It doesn't mean the same config: the portfolio's `next.config.mjs` doesn't use static export and relies on `redirects()`, which a static export doesn't support.

## Alternatives considered

- **Vite with React Router, like Ajar.** Also static, but each lesson would need its own prerender setup to get real HTML per address.
- **Keep one HTML file per lesson.** No build step, but no way to share the design system's components or the lesson code between lessons.

## Consequences

### Positive

- Each lesson is prerendered HTML at its own address, with only its own JavaScript.
- Same framework as the portfolio, so the design-system setup can be copied from there.
- Any static host can serve it.

### Negative

- No redirects, middleware or server code. If a lesson ever needs them, this decision has to be revisited.
- Not decided yet, and written as proposals in `docs/architecture.md` §1: the exact Next version, npm as package manager, Vitest, React Testing Library, Playwright, Prettier, and leaving out Tailwind and animation libraries. Each one gets settled when the project is set up.

## Related files

- `docs/architecture.md` §1 (stack) and §4 (routing)
