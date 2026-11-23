# Project instructions

## Agent Quick Start

- Purpose: help an AI coding agent become productive quickly in this repo.
- Linear: team Amezquita (AME), project Song Workshop. Open work lives there; `docs/backlog.md` is its snapshot. Start an issue with `/start-task AME-123`, finish it with `/finish-task`.
- Read core docs first: [docs/backlog.md](docs/backlog.md) — check this first, it's the only doc here expected to change turn to turn — then [docs/product-north-star.md](docs/product-north-star.md), [docs/architecture.md](docs/architecture.md), [docs/quality.md](docs/quality.md), and the relevant file in `/specs`.
- Skills: use the manifests under `skills/` for repeatable workflows (see `skills/README.md`).
- Finding build/test commands: look for `package.json`, `Makefile`, or `README.md` in the repo root; if none exist, ask a human before running environment-changing commands.
- Keep changes here minimal and link to repository docs rather than duplicating them.

Before doing meaningful product work, read:

1. `docs/backlog.md` — is there open work already in flight?
2. `docs/product-north-star.md`
3. `docs/brand.md`
4. `docs/design.md`
5. `docs/content.md`
6. `docs/architecture.md`
7. `docs/quality.md`
8. the relevant file in `/specs`, if one exists

For new features or significant changes:

- create or update a spec before implementation
- follow existing architecture and component patterns
- reuse tokens and components before creating new ones
- do not invent product behaviour not supported by the docs or spec
- update `/decisions` when making important architectural choices
- validate the work against `docs/quality.md` before considering it complete

Do not:

- introduce new patterns without a documented reason
- hard-code design values when tokens exist
- change brand, design, architecture, or quality rules casually
- hide assumptions or unresolved decisions inside implementation


## Available skills

Use the relevant skill when the task matches:

- `skills/project-kickoff/SKILL.md` — starting a new digital product from a rough idea
- `skills/brand-direction/SKILL.md` — turning the brand brief into one chosen visual direction and handing it off as tokens
- `skills/product-spec/SKILL.md` — creating or updating a meaningful product or feature spec
- `skills/information-architecture/SKILL.md` — mapping the product's pages, navigation structure, and routing before implementation begins
- `skills/frontend-design/SKILL.md` — designing or implementing frontend work that must follow the product system
- `skills/design-system/SKILL.md` — creating or reviewing shared tokens, components, variants, and patterns
- `skills/accessibility-review/SKILL.md` — reviewing product work for accessibility before it is considered complete
- `skills/quality-gate/SKILL.md` — checking whether meaningful work is actually ready to ship
- `skills/project-setup-linear/SKILL.md` — representing a new product project in Linear so progress and revisits are visible
- `skills/start-task/SKILL.md` — starting a Linear issue: its own worktree on Linear's branch name, phase status, owner
- `skills/finish-task/SKILL.md` — quality gate, PR with `Fixes [ID]`, and a plain-language record on the issue
- `skills/backlog-sync/SKILL.md` — regenerating `docs/backlog.md` from the Linear project
- `skills/project-update/SKILL.md` — drafting a Linear project update for non-coders

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
