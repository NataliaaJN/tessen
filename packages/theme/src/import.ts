import { defaultTheme, parseTheme, slugify, ThemeError } from './model.ts';
import type { Density, Theme } from './model.ts';
import { isHex, normalizeHex } from './scale.ts';

const MAX_BYTES = 512 * 1024;

function walk(
  node: unknown,
  path: string[],
  visit: (path: string[], leaf: Record<string, unknown>) => void,
): void {
  if (typeof node !== 'object' || node === null || Array.isArray(node)) return;
  const record = node as Record<string, unknown>;
  if ('$value' in record) {
    visit(path, record);
    return;
  }
  for (const [key, child] of Object.entries(record)) {
    if (!key.startsWith('$')) walk(child, [...path, key], visit);
  }
}

function densityOf(scale: number): Density {
  if (scale < 0.95) return 'compact';
  if (scale > 1.05) return 'comfortable';
  return 'default';
}

/** A generic DTCG file (not made by Studio): picks up what Tessen understands. */
function fromGenericDtcg(doc: Record<string, unknown>, fileName: string): Theme {
  const theme = defaultTheme();
  theme.name = slugify(fileName.replace(/\.[^.]+$/, ''));
  walk(doc, [], (path, leaf) => {
    const key = path.join('.');
    const v = leaf.$value;
    if (path[0] === 'color' && path.length === 3 && typeof v === 'object' && v !== null) {
      const hex = (v as { hex?: unknown }).hex;
      if (typeof hex === 'string' && isHex(hex))
        theme.overrides.primitives[key] = normalizeHex(hex);
    } else if (path[0] === 'color' && path.length === 3 && typeof v === 'string' && isHex(v)) {
      theme.overrides.primitives[key] = normalizeHex(v);
    } else if (key === 'radius.base' && typeof v === 'object' && v !== null) {
      const n = (v as { value?: unknown }).value;
      if (typeof n === 'number') theme.radius = Math.min(24, Math.max(0, n));
    } else if (key === 'density.scale' && typeof v === 'number') {
      theme.density = densityOf(v);
    }
  });
  return parseTheme(theme);
}

/**
 * Reads a theme from file text: the native JSON, a DTCG file exported by Studio (the theme is
 * stored inside `$extensions.tessen.theme`) or a generic DTCG file. Throws `ThemeError`.
 */
export function importTheme(text: string, fileName = 'importado.json'): Theme {
  if (text.length > MAX_BYTES)
    throw new ThemeError(['el archivo es demasiado grande (máx. 512 KB)']);
  let doc: unknown;
  try {
    doc = JSON.parse(text);
  } catch {
    throw new ThemeError(['el archivo no es JSON válido']);
  }
  if (typeof doc !== 'object' || doc === null || Array.isArray(doc)) {
    throw new ThemeError(['el archivo debe contener un objeto JSON']);
  }
  const record = doc as Record<string, unknown>;
  const embedded = (record.$extensions as { tessen?: { theme?: unknown } } | undefined)?.tessen
    ?.theme;
  if (embedded !== undefined) return parseTheme(embedded);
  if ('$schema' in record || 'color' in record) return fromGenericDtcg(record, fileName);
  return parseTheme(record);
}
