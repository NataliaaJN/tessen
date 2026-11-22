# @tessen-ui/icons

Curated SVG source turned into Vue components, React components, plain SVG files and one sprite. Internal package (`private`, never published, see [ADR 0015](../../docs/planning/13-architecture-decisions/0015-npm-namespace-provisional-no-publication.md)); docs call it `@tessen/icons`. Spec: [`04` §3.8](../../docs/planning/04-design-system-specification.md).

## Use

```ts
import { CheckIcon, SearchIcon } from '@tessen-ui/icons/vue'; // or '@tessen-ui/icons/react'
```

```vue
<CheckIcon />
<!-- decorative: aria-hidden -->
<SearchIcon title="Search" :size="16" class="t-input__icon" />
<!-- announced: role="img" + <title> -->
```

| Prop          | Default | Notes                                                                                                                 |
| ------------- | ------- | --------------------------------------------------------------------------------------------------------------------- |
| `size`        | `24`    | Grid is 24 px; 16 and 20 are the supported smaller sizes                                                              |
| `strokeWidth` | `1.5`   |                                                                                                                       |
| `title`       | -       | Makes the icon meaningful. `aria-label`/`aria-labelledby` do the same. Without any of them the icon is hidden from AT |
| anything else | -       | Passed to the `<svg>` (`class`, `style`, events...). Colour comes from `currentColor`                                 |

Other entry points: `@tessen-ui/icons/svg/<name>.svg`, `@tessen-ui/icons/sprite.svg` (`<use href="sprite.svg#tessen-icon-check"/>`) and `@tessen-ui/icons/manifest.json` (name, component, symbol; for the docs explorer). `vue` and `react` are optional peers; importing one subpath never loads the other. Components are plain named exports with `/*#__PURE__*/`, so unused icons tree-shake.

## Adding an icon

1. Copy the SVG to `src/svg/<kebab-name>.svg` (24 px grid, shapes only: `path`, `circle`, `ellipse`, `rect`, `line`, `polyline`, `polygon`).
2. `pnpm build`. SVGO optimizes it and the pipeline rejects anything it cannot represent (groups, text, other viewBox, non-kebab names).

The component is named `<PascalName>Icon` (`chevron-down` becomes `ChevronDownIcon`). Naming is provisional until D-03/ADR 0011 is decided.

## Decisions made while implementing F1-T04

- **D-07 resolved provisionally with its recommendation:** Lucide (ISC) as the open set. 35 icons copied from `lucide-static@1.77.0`, enough for the T1 components (check, chevrons, alerts, search, eye, spinner, menu...). `LICENSE-lucide.txt` is the upstream license file (ISC plus MIT for the Feather-derived icons) and ships with the package. Replace or extend the set by changing `src/svg`; nothing else depends on Lucide.
- Stroke is normalized to 1.5 px (Lucide uses 2) and every output is generated from the same parsed shapes, so Vue, React, SVG and sprite cannot diverge. A test compares the shapes rendered by both frameworks.
- Sprite symbols carry the stroke attributes on the `<symbol>`, so `<use>` needs no extra styling.
- Not included: brand icons (logo, favicons), `IconButton` (F2), a `<Icon name>` dynamic component.
