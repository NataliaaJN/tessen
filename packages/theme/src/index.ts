export { contrast, hexToRgb, luminance, oklchToRgb, rgbToHex, rgbToOklch } from './color.ts';
export type { Oklch, Rgb } from './color.ts';

export { generateScale, isHex, normalizeHex, STEPS } from './scale.ts';
export type { Scale, Step } from './scale.ts';

export {
  BASE_ACCENT,
  DEFAULT_FONTS,
  FONT_FALLBACKS,
  defaultTheme,
  emptyOverrides,
  parseTheme,
  sameTheme,
  slugify,
  ThemeError,
} from './model.ts';
export type { Density, MotionMode, Theme, ThemeMode, ThemeOverrides } from './model.ts';

export { createResolver, cssVariable, CSS_PREFIX, themePrimitives } from './resolve.ts';
export type { Resolver, TokenData, TokenRecord } from './resolve.ts';

export { auditTheme, contrastRatio, describeSeed, suggestForeground } from './audit.ts';
export type { AuditResult, ContrastCheck, ContrastPair } from './audit.ts';

export {
  baseDeclarations,
  modeDeclarations,
  toCss,
  toDtcg,
  toTailwind,
  toThemeJson,
  toTypeScript,
} from './export.ts';
export type { CssOptions, Declaration } from './export.ts';

export { decodeTheme, encodeTheme } from './share.ts';
export { importTheme } from './import.ts';
export { PRESETS } from './presets.ts';
export type { Preset } from './presets.ts';
