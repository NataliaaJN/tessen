# @tessen-ui/theme

Theme engine behind Theme Studio: OKLCH scales, WCAG contrast, a validated theme model, presets and exports (CSS, DTCG, Tailwind v4, TypeScript). Pure TypeScript, no runtime dependencies, no Vue or React (enforced by `pnpm deps:check`). Internal package (`private`, never published, see [ADR 0015](../../docs/planning/13-architecture-decisions/0015-npm-namespace-provisional-no-publication.md)); decision record: [ADR 0017](../../docs/planning/13-architecture-decisions/0017-theme-engine-and-studio.md).

```ts
import { parseTheme, toCss, auditTheme, encodeTheme, generateScale } from '@tessen-ui/theme';
import tokens from '@tessen-ui/tokens/tokens.json';
import pairs from '@tessen-ui/tokens/contrast-pairs.json';

const theme = parseTheme({ name: 'acme', accent: '#D9822B', radius: 12, density: 'compact' });
toCss(theme); // only what differs from the base tokens, unlayered
auditTheme(theme, tokens, pairs.pairs).failures; // contrast pairs that do not pass
encodeTheme(theme); // "v1.eyJ..." for a share link (#t=...)
generateScale('#D9822B')[800]; // one of 11 steps (50..950)
```

| Area         | Exports                                                                                                 |
| ------------ | ------------------------------------------------------------------------------------------------------- |
| Model        | `Theme`, `defaultTheme`, `parseTheme` (throws `ThemeError` listing every issue), `sameTheme`, `slugify` |
| Color        | `generateScale`, `contrast`, `hexToRgb`, `rgbToHex`, `rgbToOklch`, `oklchToRgb`                         |
| Export       | `toCss`, `toDtcg`, `toTailwind`, `toTypeScript`, `toThemeJson`                                          |
| Import/share | `importTheme` (native JSON, Studio DTCG, generic DTCG), `encodeTheme`, `decodeTheme`                    |
| Audit        | `auditTheme`, `contrastRatio`, `suggestForeground`, `describeSeed`                                      |
| Presets      | `PRESETS` (4 light, 4 dark)                                                                             |

The token table is passed in (`TokenData`), so the package does not depend on a specific `@tessen-ui/tokens` version at runtime.
