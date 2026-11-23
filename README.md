<p align="center">
  <img src="docs/brand/logo/tessen-mark.svg" alt="Tessen" width="96" height="96">
</p>

# Tessen

> One structure. Endless possibilities.

Design system and component library for **Vue** and **React**, plus a web platform (docs, Theme Studio, Playground).

**Status:** Phases 1–6 done locally: 41 components for Vue and React, the documentation site (in Spanish, `apps/docs`) and Theme Studio (`apps/theme-studio`, served at `/studio/` from the docs build). Playground (`apps/playground`, Vue + React previews and generated code, served at `/playground/`) is done; production readiness (F8) is next. Per-phase notes: [`docs/planning`](docs/planning) (`F3`–`F6-progress.md`). Start with [`docs/`](docs/README.md). Brand assets: [`docs/brand/`](docs/brand/README.md).

## Development

Requires Node 26 (see `.nvmrc`) and pnpm 12 (`npm install -g pnpm@12.21.0`). Nothing is published: packages live in the `@tessen-ui/*` internal scope and share code through `workspace:*` ([ADR 0015](docs/planning/13-architecture-decisions/0015-npm-namespace-provisional-no-publication.md)).

```sh
pnpm install
pnpm verify   # lint, format, types, tokens check, dependency rules, scope check, tests, build
```

Local apps (nothing is deployed, [ADR 0014](docs/planning/13-architecture-decisions/0014-zero-cost-github-first-infrastructure.md)):

```sh
pnpm --filter @tessen-ui/docs dev           # documentation, http://localhost:4321
pnpm --filter @tessen-ui/theme-studio dev   # Theme Studio, http://localhost:5174
pnpm --filter @tessen-ui/docs build         # docs + Studio under /studio/ (then: astro preview)
```

Branching: `main` is production, `develop` is pre-production; work happens in short-lived English-named branches merged into `develop` through auto-merging pull requests ([workflow](docs/architecture/development-workflow.md)).
