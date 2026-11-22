# Spike F1-T07 - Button parity pipeline

Throwaway (`spikes/`, `private`, never published). One `Button` contract drives Vue and React implementations, a contract runner, snippet codegen and a pixel diff between frameworks. Results and decisions: [`docs/planning/T07-button-parity.md`](../../docs/planning/T07-button-parity.md).

| Command (from this folder) | What it does                                                                                                                                                     |
| -------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `pnpm test`                | P1 API parity, DOM parity, P2 contract suite (VTU + RTL, jsdom), P4 snippet compilation                                                                          |
| `pnpm parity`              | P3: starts the harness, captures Vue and React panels with the system Chrome (`playwright-core`, no download) and diffs them. Writes images to `.out/` (ignored) |
| `pnpm typecheck`           | `tsc --noEmit`                                                                                                                                                   |

Layout: `src/core` (variants, contract, codegen: framework-free), `src/css/button.css`, `src/vue`, `src/react`, `test/runner.ts` (shared runner) with `test/*.adapter.ts(x)`, `harness/` (page rendered by `pnpm parity`).
