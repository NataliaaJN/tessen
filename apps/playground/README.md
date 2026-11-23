# Playground

Try every Tessen component in **Vue and React side by side** and copy the code. Vite + Vue 3, Spanish UI, runs locally only (no hosting, [ADR 0014](../../docs/planning/13-architecture-decisions/0014-zero-cost-github-first-infrastructure.md)). Decisions: [ADR 0018](../../docs/planning/13-architecture-decisions/0018-playground-scenes-and-codegen.md); status: [`F6-progress.md`](../../docs/planning/F6-progress.md).

```sh
pnpm --filter @tessen-ui/playground dev      # http://localhost:5175
pnpm --filter @tessen-ui/playground build    # dist/ with base /playground/ (the docs build copies it)
pnpm snippets:check                          # the generated code compiles in Vue and React
pnpm e2e                                     # includes tests/playground.spec.ts (real browser)
```

- **Left:** controls generated from the component contract, forced state (hover, focus, pressed), theme preset and light/dark.
- **Centre:** two isolated `iframe` previews (Vue, React) mounted from one scene, width presets, and the generated code with copy and download.
- **URL:** `#s=v1.…` holds the state; `#c=button&fw=react` opens a component (what the docs link to).
- **Add a component:** write a recipe in `src/features/recipes/recipes.ts` (`defineRecipe`). Controls, code and the compile check follow from it; a test requires one recipe per contract.
