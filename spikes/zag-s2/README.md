# Spike S2 - second Zag.js validation

Throwaway (`spikes/`, `private`, never published). Select, Combobox, Menu, Popover, Dialog, Tooltip (all in portals) and a representative DatePicker, written twice (Vue, React) on Zag 1.48.0, plus one framework-agnostic behavior suite. Results, decision and conditions: [`docs/planning/S2-zag-validation.md`](../../docs/planning/S2-zag-validation.md) and ADR 0004. Real SSR fixtures: [`../zag-s2-nuxt`](../zag-s2-nuxt), [`../zag-s2-next`](../zag-s2-next).

| Command (from this folder) | What it does                                                                                                                                                                      |
| -------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `pnpm test`                | Suite in jsdom (ARIA, structure, hydration, controlled/uncontrolled) + public-surface check. Browser-only cases are skipped                                                       |
| `pnpm test:browser`        | The same suite in a real browser (focus, outside click, pointer, stacking). Opens your default browser at a local URL; close old Vitest tabs first, a stale tab makes it time out |
| `pnpm measure`             | Bundle size, alone and marginal (gzip)                                                                                                                                            |
| `pnpm exec vite harness`   | Manual page with every component in Vue and React                                                                                                                                 |

Fixtures (from the repo root): `pnpm --filter @tessen-ui/spike-zag-s2-nuxt ssr:dev` (port 5193) and `... spike-zag-s2-next ssr:dev` (port 5195); `ssr:build` compiles for production.

Layout: `src/vue`, `src/react` (components), `test/contract.ts` (shared suite), `test/*.adapter.ts(x)` (framework adapters), `test/boundary.test.ts` (no Zag type leaks into public exports).
