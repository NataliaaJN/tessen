# @tessen-ui/core

Framework-free core: variant resolution, component **contracts as data** and snippet codegen. Used by the Vue and React packages, the docs and the Playground. Internal package (`private`, never published, see [ADR 0015](../../docs/planning/13-architecture-decisions/0015-npm-namespace-provisional-no-publication.md)); docs call it `@tessen/core`. No imports of Vue, React or Zag (enforced by `pnpm deps:check`).

Promoted from the F1-T07 spike ([results](../../docs/planning/T07-button-parity.md)).

| Entry                              | What                                                                                           |
| ---------------------------------- | ---------------------------------------------------------------------------------------------- |
| `@tessen-ui/core/variants`         | `defineVariants`: props → `{ class, attrs }`. Enumerated → `data-<x>`, boolean only if `true`  |
| `@tessen-ui/core/contracts`        | `defineContract` and types (`Contract`, `ContractCase`, `Step`, `Expectation`, `NeutralProps`) |
| `@tessen-ui/core/contracts/button` | `buttonContract`, `buttonVariants`                                                             |
| `@tessen-ui/core/codegen`          | `generateSnippet(contract, 'vue' \| 'react', props)`                                           |

`@tessen-ui/core` re-exports all of it.

## Decisions

- **Contract format (D-17): TypeScript with `defineContract`.** A contract is plain, JSON-serializable data (a test checks the round trip), so docs, the Playground and agents can consume it without importing code.
- Invalid variant values throw `RangeError`: the contract is the source of truth, not a silent fallback.
- Not here: SFC/TSX, test adapters (VTU/RTL) and the contract runner. They stay per framework and only share these types.

## Known gaps (from T07)

- `NeutralProps` is Button-shaped (`label`, `leading`, `trailing`); generalizing it waits for `Field`/`Tabs`.
- The contract format for composed components (parts, events) is undecided.
- No cases yet for `class`/`style`/native attribute passthrough, `ref` or `IconButton`.
