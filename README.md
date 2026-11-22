<p align="center">
  <img src="docs/brand/logo/tessen-mark.svg" alt="Tessen" width="96" height="96">
</p>

# Tessen

> One structure. Endless possibilities.

Design system and component library for **Vue** and **React**, plus a web platform (docs, Theme Studio, Playground).

**Status:** Phase 1 (foundations) in progress. The monorepo skeleton and [`@tessen-ui/tokens`](packages/tokens/README.md) are in place; no component packages exist yet. Start with [`docs/`](docs/README.md). Brand assets: [`docs/brand/`](docs/brand/README.md).

## Development

Requires Node 26 (see `.nvmrc`) and pnpm 12 (`npm install -g pnpm@12.21.0`). Nothing is published: packages live in the `@tessen-ui/*` internal scope and share code through `workspace:*` ([ADR 0015](docs/planning/13-architecture-decisions/0015-npm-namespace-provisional-no-publication.md)).

```sh
pnpm install
pnpm verify   # lint, format, types, tokens check, dependency rules, scope check, tests, build
```

Branching: `main` is production, `develop` is pre-production; work happens in short-lived English-named branches merged into `develop` through auto-merging pull requests ([workflow](docs/architecture/development-workflow.md)).
