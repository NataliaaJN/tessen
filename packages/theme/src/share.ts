import { defaultTheme, parseTheme, ThemeError } from './model.ts';
import type { Theme } from './model.ts';
import { normalizeHex } from './scale.ts';

const PREFIX = 'v1.';
const MAX_ENCODED = 16_000;

function toBase64Url(text: string): string {
  const bytes = new TextEncoder().encode(text);
  let bin = '';
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function fromBase64Url(encoded: string): string {
  const padded = encoded
    .replace(/-/g, '+')
    .replace(/_/g, '/')
    .padEnd(Math.ceil(encoded.length / 4) * 4, '=');
  const bin = atob(padded);
  return new TextDecoder('utf-8', { fatal: true }).decode(
    Uint8Array.from(bin, (c) => c.charCodeAt(0)),
  );
}

/** Only the fields that differ from the default theme, so share links stay short. */
function diffFromDefault(theme: Theme): Record<string, unknown> {
  const base = defaultTheme();
  const out: Record<string, unknown> = {};
  if (theme.name !== base.name) out.n = theme.name;
  if (theme.accent !== base.accent) out.a = theme.accent;
  if (theme.radius !== base.radius) out.r = theme.radius;
  if (theme.density !== base.density) out.d = theme.density;
  if (theme.motion !== base.motion) out.m = theme.motion;
  if (theme.previewMode !== base.previewMode) out.p = theme.previewMode;
  const fonts: Record<string, string> = {};
  for (const k of ['sans', 'display', 'mono'] as const) {
    if (theme.fonts[k] !== base.fonts[k]) fonts[k] = theme.fonts[k];
  }
  if (Object.keys(fonts).length > 0) out.f = fonts;
  const o = theme.overrides;
  if (
    Object.keys(o.primitives).length + Object.keys(o.light).length + Object.keys(o.dark).length >
    0
  ) {
    out.o = o;
  }
  return out;
}

/** `v1.<base64url>`: safe to put in a URL fragment. */
export function encodeTheme(theme: Theme): string {
  return PREFIX + toBase64Url(JSON.stringify(diffFromDefault(theme)));
}

/** Reverses `encodeTheme`. Throws `ThemeError` on anything that is not a valid share code. */
export function decodeTheme(code: string): Theme {
  const trimmed = code.trim();
  if (!trimmed.startsWith(PREFIX) || trimmed.length > MAX_ENCODED) {
    throw new ThemeError(['el código de tema no es válido o es demasiado largo']);
  }
  let raw: unknown;
  try {
    raw = JSON.parse(fromBase64Url(trimmed.slice(PREFIX.length)));
  } catch {
    throw new ThemeError(['el código de tema está dañado']);
  }
  if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) {
    throw new ThemeError(['el código de tema está dañado']);
  }
  const d = raw as Record<string, unknown>;
  return parseTheme({
    version: 1,
    name: d.n,
    accent: typeof d.a === 'string' ? d.a : undefined,
    radius: d.r,
    density: d.d,
    motion: d.m,
    previewMode: d.p,
    fonts: d.f,
    overrides: d.o,
  });
}

export { normalizeHex };
