# Spike S1 results (2026-11-22)

Zag.js 1.48.0, Vue 3.5.46, React 19.3.1. Method and thresholds: [README](./README.md). Reproduce: `pnpm --filter @tessen-ui/spike-zag-s1 test`, `... measure`, and the Chromium page in `harness/` (`pnpm --filter @tessen-ui/spike-zag-s1 exec vite harness`).

## Verdict: 5 of 6 pass, one borderline

| #   | Criterion      | Result                  | Evidence                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| --- | -------------- | ----------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Parity         | **Borderline**          | The same 36-case suite (`test/contract.ts`, it never imports Vue or React) is green against both. Adapter logic that differs between frameworks is **11.4 %** of React lines and **15.1 %** of Vue lines by the crude regex in `scripts/measure.ts` (threshold 15 %; the metric depends on line wrapping, so treat it as an order of magnitude). All behavior (keyboard, focus, ARIA ids, dismissal, positioning) comes from the shared Zag machines; what differs is presence glue, ids and event plumbing |
| 2   | a11y           | **Pass** (jsdom limits) | 0 axe violations: dialog closed/open, tabs, tooltip open. Keyboard checklist covered: dialog Escape / focus in / focus return / focus trap, tabs arrows / Home / End / disabled skipped / roving tabindex, tooltip focus / hover / Escape. axe cannot evaluate colour contrast in jsdom                                                                                                                                                                                                                     |
| 3   | SSR            | **Pass** (stand-in)     | `renderToString` then hydrate with 0 warnings/errors, then interaction works, for all three components in both frameworks. Not Nuxt/Next themselves                                                                                                                                                                                                                                                                                                                                                         |
| 4   | Bundle         | **Pass**                | Dialog **21.65 kB gzip** (Vue) / **21.09 kB** (React) vs 25 kB. Tabs 10.8 kB, Tooltip 22.9 / 22.6 kB. Each includes Zag core, presence, focus trap, dismissable layer and positioning inlined; an app using several components shares the core, so the marginal cost is lower                                                                                                                                                                                                                               |
| 5   | DX             | **Pass**                | Public props are Tessen-shaped (`open` / `v-model:open`, `title`, `items`, `content`); no Zag type, `api` object or machine event is exposed. Gaps noted below                                                                                                                                                                                                                                                                                                                                              |
| 6   | Exit animation | **Pass**                | Zag's `presence` machine keeps the node until `animationend`, no timers in our code. Measured in Chromium with a 300 ms exit: unmounted at ~370 ms in Vue and ~380 ms in React. Costs one ~8-line hook per framework                                                                                                                                                                                                                                                                                        |

## Findings that change how components are written

1. **Mount on open, not on presence.** Rendering content only when `presence.present` is true mounts it one render after the machine opens. In React the focus trap and initial focus then never engaged (Tab walked out of the dialog); Vue happened to work. Rendering `api.open || presence.present` fixed both. Component template: always use that expression.
2. **jsdom cannot judge some Zag behavior.** Tabs automatic activation by keyboard and exit animations (`getAnimations()` missing) fail or flake in jsdom but work in Chromium in both frameworks. Those two are asserted in a real browser, not in the unit suite. **Phase 2 needs browser-mode tests** (Playwright/Vitest browser mode) for the contract suite; jsdom is fine for ARIA, structure, controlled state and hydration.
3. **Modal dialogs leave global state** (`pointer-events: none` on `body`, scroll lock). Tests must unmount after each case (done via a handle registry).
4. **Vue and React behave identically through `@zag-js/*`**: same state machine, same attributes, same data-state values. The only API difference is reactivity style (`computed` and `Ref` in Vue, plain values in React).

## Not covered (carry to Phase 2 or later)

- Real Nuxt and Next hydration, streaming and ids across server/client boundaries.
- `Portal`/`Teleport`: the spike renders the dialog inline.
- Colour contrast and forced-colors checks (needs a real browser).
- Tooltip edge cases: touch devices, shared warm-up delay between tooltips, long content placement flipping.
- Unexposed Zag options: `ids`, `translations` (i18n of labels), `positioning`, `closeOnInteractOutside`. Each needs a Tessen-level decision (D-03, D-14).
- Polymorphic trigger (`asChild`, D-10): the spike wraps its own `<button>`.
- Only three machines were tried; ADR 0004 still lists machines that may not exist (Table, NavigationMenu).

## Licenses

All Zag packages MIT. `axe-core` (test only, not shipped) is MPL-2.0; `jsdom`, Testing Library MIT.
