# @tessen-ui/tokens

Design tokens for Tessen: one DTCG source, generated CSS custom properties, TypeScript and JSON.
Internal package (`private`, never published, see [ADR 0015](../../docs/planning/13-architecture-decisions/0015-npm-namespace-provisional-no-publication.md)); the documentation and ADRs call it `@tessen/tokens`.

Spec: [`docs/planning/04-design-system-specification.md`](../../docs/planning/04-design-system-specification.md) · decision: [ADR 0005](../../docs/planning/13-architecture-decisions/0005-design-tokens-dtcg-style-dictionary.md).

## Use

```css
@import '@tessen-ui/tokens/tokens.css';
```

```html
<html data-tessen-theme="dark" data-tessen-density="compact"></html>
```

| Attribute             | Values                                           | Without it                            |
| --------------------- | ------------------------------------------------ | ------------------------------------- |
| `data-tessen-theme`   | `light`, `dark` (any element, not only `<html>`) | follows `prefers-color-scheme`, no JS |
| `data-tessen-density` | `compact`, `default`, `comfortable`              | `default`                             |

Everything lives in `@layer tessen.tokens`, so unlayered consumer CSS always wins. Aliases are emitted as `var()`, so overriding a primitive (`--tessen-color-brand-600`) or a semantic token reaches everything built on it, and `--tessen-radius-base` drives the whole radius scale through `calc()`.

```ts
import { tokens, breakpoints, cssVariables } from '@tessen-ui/tokens';

tokens.color.action.primary.default; // "var(--tessen-color-action-primary-default)"
tokens.typography['body-md'].fontSize; // "var(--tessen-typography-body-md-font-size)"
breakpoints.md; // 768 (px; CSS variables do not work inside @media)
cssVariables.dark['--tessen-color-surface-canvas']; // "#060E24" (resolved value per theme)
```

`@tessen-ui/tokens/tokens.json` lists every token (path, type, layer, alias, CSS variables, resolved values per theme or density) for docs and tools.

## Source layout (`src/`)

| Folder / file                    | Layer     | Content                                                                         |
| -------------------------------- | --------- | ------------------------------------------------------------------------------- |
| `primitives/*.json`              | primitive | Raw scales: color, space, radius, typography, shadow, motion, layer, breakpoint |
| `semantic/*.json`                | semantic  | Mode-independent roles: typography styles, focus, elevation                     |
| `components/*.json`              | component | Only when a component needs its own token (none yet)                            |
| `themes/light.json`, `dark.json` | semantic  | Mode-dependent `color.*` roles. Same paths in both files                        |
| `themes/density.json`            | semantic  | One subtree per density mode (`default`, `compact`, `comfortable`)              |
| `contrast-pairs.json`            | -         | Foreground/background pairs `tokens:check` verifies in every theme              |

Rules: primitives only reference primitives; semantic tokens reference primitives or semantic tokens; component tokens reference semantic tokens only. Published names are API: renaming one is a breaking change.

`primitives/color.json` is **generated** from the brand seeds (`scripts/lib/scales.ts`): `pnpm --filter @tessen-ui/tokens tokens:scales`. Never edit it by hand; `tokens:check` fails when it drifts.

## Scripts

| Command (from the repo root)                    | What it does                                                                      |
| ----------------------------------------------- | --------------------------------------------------------------------------------- |
| `pnpm build`                                    | Generates `dist/` (`css/tokens.css`, `js/index.js` + `.d.ts`, `json/tokens.json`) |
| `pnpm tokens:check`                             | Structure, aliases, parity, derived values, CSS names, contrast, scale freshness  |
| `pnpm --filter @tessen-ui/tokens tokens:scales` | Regenerates `primitives/color.json`                                               |
| `pnpm --filter @tessen-ui/tokens test`          | Unit tests (color math, checks, generated output)                                 |

Scripts are TypeScript run directly by Node 26 (type stripping, no build step for tooling).

## Decisions made while implementing F1-T02

- **Scales** are generated in OKLCH and pinned to the brand seeds: `neutral` 50/900/950 = surface-light/text/surface-dark, `brand` 600/900 = secondary/primary, `accent` 400 = cyan seed. Hue, chroma and lightness are interpolated between anchors; out-of-gamut colors lose chroma only.
- **Added an `accent` scale** (cyan) next to the six in the spec: in dark themes the cyan is the action and link color, and it needs its own ramp.
- **Roles are chosen by contrast, not by name.** `color.action.primary` is `brand.800` in light (white text, 9+:1) and `accent.400` in dark (dark text); the secondary seed `#2B7BE0` is used only for focus rings and borders, where 3:1 is enough.
- **Keys cannot contain dots** in DTCG, so `space.0.5` is `space.0-5` (`--tessen-space-0-5`).
- **Letter spacing** is a `number` with `$extensions.tessen.unit: "em"`, because DTCG 2025.10 dimensions only allow `px` and `rem`.
- **Radii** derive from `radius.base` through `$extensions.tessen.deriveFrom/factor` (`"4/3"` ratios keep the CSS exact); the literal `$value` stays for tools that ignore the extension, and `tokens:check` verifies both agree.
- **Typography styles** are composite DTCG tokens; CSS gets one variable per property (`--tessen-typography-body-md-font-size`, ...).
- **Breakpoints** are published as TypeScript and JSON only.
- **Not included yet:** the optional Tailwind v4 bridge (`dist/tailwind/theme.css`), `data-tessen-contrast="high"`, grid tokens and component tokens. They arrive with their consumers.
- Style Dictionary 5 parses, inherits `$type` and resolves aliases; the files are assembled in `scripts/lib/emit.ts` because one stylesheet combines light, dark and density, and a Style Dictionary format only sees one dictionary.
