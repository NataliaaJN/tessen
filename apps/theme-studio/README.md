# Theme Studio

Create, preview and export Tessen themes. Vite + Vue 3, Spanish UI, runs locally only (no hosting, [ADR 0014](../../docs/planning/13-architecture-decisions/0014-zero-cost-github-first-infrastructure.md)). Engine: [`@tessen-ui/theme`](../../packages/theme/README.md); decisions: [ADR 0017](../../docs/planning/13-architecture-decisions/0017-theme-engine-and-studio.md); status: [`F5-progress.md`](../../docs/planning/F5-progress.md).

```sh
pnpm --filter @tessen-ui/theme-studio dev    # http://localhost:5174
pnpm --filter @tessen-ui/theme-studio build  # dist/ with base /studio/ (the docs build copies it)
pnpm e2e                                     # includes tests/studio.spec.ts (real browser)
```

- **Left:** presets, saved themes (`localStorage`), history.
- **Centre:** the real components in an isolated `iframe` (`preview.html`), five scenes, three widths, light/dark, compare with the base theme, live WCAG contrast audit.
- **Right:** quick mode (accent, radius, density, motion, fonts) and advanced mode (token tree with aliases, primitives, diff against the base).
- **Share:** `#t=v1.…` in the URL. **Export:** CSS, DTCG JSON, Tailwind v4, TypeScript, native JSON. **Import:** native JSON or DTCG.
