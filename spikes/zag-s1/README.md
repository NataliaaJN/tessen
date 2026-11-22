# Spike S1 - Zag.js as the shared behavior engine (F1-T06)

Throwaway workspace package (`spikes/`, never published). It builds `Dialog`, `Tabs` and `Tooltip` on Zag.js 1.48.0 in Vue and React and measures the six exit criteria of `docs/planning/06-multiframework-architecture.md` section 6. The result goes to ADR 0004; this code is not the future component code.

## Thresholds, fixed before measuring

| #   | Criterion      | Pass when                                                                                                                                                                     |
| --- | -------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Parity         | One shared behavior suite passes against both frameworks, and framework-specific logic is at most 15 % of the adapter lines (lines that are not Zag calls, anatomy or markup) |
| 2   | a11y           | 0 axe violations in every state of the three components, plus the APG keyboard checklist in the suite                                                                         |
| 3   | SSR            | Server render then hydrate in a DOM without warnings or errors, both frameworks (jsdom stand-in for Nuxt/Next, see limits)                                                    |
| 4   | Bundle         | `Dialog` (machine + adapter + its dependencies, `vue`/`react` external) at most **25 kB gzip**                                                                                |
| 5   | DX             | Public props/slots read as Tessen API; no Zag type or concept leaks into a component's props                                                                                  |
| 6   | Exit animation | Content stays mounted until the exit animation ends, then unmounts, with no component-level timers                                                                            |

Approved when at least 5 of 6 pass.

## Limits of this spike

jsdom has no layout, no real animations and no real focus visibility. Tooltip positioning, focus trapping and animation end are asserted where jsdom can, and flagged as "needs a real browser" otherwise. Nuxt and Next are not installed (zero-cost, small repo); hydration is checked with `vue/server-renderer` + `createSSRApp` and `react-dom/server` + `hydrateRoot`.
