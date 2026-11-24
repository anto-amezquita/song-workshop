# 0006 — Vercel hosts the site, with security headers in vercel.json

## Status

Accepted (2026-11-24), in AME-87. It answers the port spec's Q1 (`specs/2026-11-23-nashville-number-lab-port.md`).

## Context

The site builds to a static `out/` folder (decisions/0001), but nothing said where it goes live. A static export can't set response headers from Next.js, so whichever host serves `out/` also has to send the security headers.

The lesson page needs no server. It loads only its own scripts, stylesheets and self-hosted fonts (decisions/0005). There are no fetches, workers, images or third-party requests, and no user content ever reaches the page as HTML (`docs/architecture.md` §11).

The build puts seven inline scripts into every page: the colour-mode script, two small Next/Turbopack bootstrap scripts, and four `self.__next_f.push(...)` scripts carrying the page's React data. Measured on 2026-11-24, that's 15 different script hashes across four pages. The four data scripts differ on every page and change whenever content, code or dependencies change, because they name the built JavaScript chunks.

## Decision

Vercel hosts the site, like the portfolio. `main` deploys to production at `https://song-workshop.amezquita.dk` (a CNAME `song-workshop` at Simply.com), and every pushed branch gets a preview deployment.

`vercel.json` sets the security headers on every path (listed in `docs/architecture.md` §11). The Content-Security-Policy allows only the site's own origin, with two exceptions:

- `script-src 'self' 'unsafe-inline'`, for the inline scripts Next writes into every page.
- `style-src-attr 'unsafe-inline'`, for the inline `style="animation-delay:…"` that `RollText` renders. `<style>` blocks and stylesheets from elsewhere stay blocked.

## Alternatives considered

- **Script hashes written into `vercel.json`.** The strictest policy, but 12 of the 15 hashes change on almost any commit. A stale list breaks the site silently: the page renders, React never starts, and the lessons stop working.
- **Script hashes generated on every build**, injected into each page as a `<meta http-equiv="Content-Security-Policy">`, with `vercel.json` keeping the directives a meta tag can't carry (`frame-ancestors`). It stays strict and holds up across deploys, but it adds a post-build step that edits Next's output, and that step needs maintaining. It's the way to tighten the policy later.
- **Nonces.** They need a server to make a new one for each request, and the site is a static export.
- **No CSP.** It leaves out the protections that cost nothing here: no framing, no plugins, and no loading from anywhere else.
- **Another static host.** Nothing about the site needs anything Vercel doesn't have, and the portfolio is already there.

## Consequences

### Positive

- One place for every header, checked into the repo and reviewed like code.
- The policy holds across deploys without a build step of its own.
- Everything apart from inline scripts and style attributes has to come from the site itself, so a stray third-party request is blocked, not quietly allowed.

### Negative

- `'unsafe-inline'` means the CSP would not stop an injected inline script. The protection there comes from never putting user content into the page as HTML (§11).
- Anything new the page loads (a `data:` image, a worker, a third-party script) needs the CSP changed in the same PR.
- Vercel's preview toolbar loads from vercel.live, so the CSP blocks it on preview deployments. Production doesn't show the toolbar.
- Checked on 2026-11-24 by serving `out/` with these headers and loading `/`, `/lessons/nashville-numbers` and a 404 in Chromium: no CSP violations, Play lights a chord, and the roll animation keeps its delays. With both `'unsafe-inline'` allowances removed, the inline scripts are blocked and Play does nothing.

## Related files

- `vercel.json`
- `docs/architecture.md` §1 (stack), §11 (security and privacy), §14 (deployment) and §17
- `lib/site.ts` (the public address, used for the canonical link)
- `components/lesson/RollText.tsx` (the inline style attribute)
