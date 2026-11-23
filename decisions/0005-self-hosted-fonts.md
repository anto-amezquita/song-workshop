# 0005 — Fonts are self-hosted

## Status

Accepted (2026-11-23), in the Nashville Number Lab port spec (`specs/2026-11-23-nashville-number-lab-port.md`, Q2). Two things are checked when the project is set up (see Consequences).

## Context

The brand uses Bricolage Grotesque, with its optical-size axis (12–96) and weights 500–800, and Inter at 400, 500 and 600 (`docs/brand.md` §11). Without the optical-size axis, the headings don't match the original lesson.

The original file loads both fonts from Google Fonts. That sends every visitor's IP address to Google, which is a privacy problem for a site with visitors in the EU.

The design system can't load them for us yet. In 1.7.0, the font link `amezquita-brand build` writes has no optical-size axis for Bricolage and no entry at all for Inter.

## Decision

Self-host both fonts from Fontsource packages, imported in the root layout. The brand's `font-family-heading` and `font-family-base` name the families as Fontsource registers them. The `song-workshop-fonts.json` that `amezquita-brand build` writes isn't used.

## Alternatives considered

- **The Google Fonts link, as in the file.** Matches the original exactly with no setup, but sends visitors' IP addresses to Google. It stays as the fallback (see Consequences).
- **`next/font`.** Also self-hosts, but it renames each family to a generated name. The brand tokens are fixed strings written at build time, so they couldn't name it.
- **Wait for the design system to add both fonts.** It would still load them from Google.

## Consequences

### Positive

- No request to Google from any page. Nothing on the site makes a third-party request.
- The fonts ship with the site, so they work wherever it's hosted.

### Negative

- Two more dependencies to keep updated.
- To check at setup: that the Bricolage package includes the optical-size axis, and that `amezquita-brand check` accepts the Fontsource family names. If either fails, the fallback is the file's Google Fonts link, unchanged, and this decision is updated.

## Related files

- `docs/brand.md` §11 (typography)
- `docs/architecture.md` §1 (stack) and §11 (security and privacy)
