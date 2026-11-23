import { recipeBySlug } from '../recipes/index.ts';
import type { ControlState } from '../recipes/index.ts';
import { FORCED_STATES, WIDTHS, initialState, sanitizeValues } from './model.ts';
import type { ForcedState, FrameworkView, PlaygroundState, Width } from './model.ts';

/**
 * State in the URL hash (PLG-06). Two spellings are read:
 * - `#c=button&fw=react`: written by hand or by the docs ("Abrir en Playground").
 * - `#s=v1.<base64url>`: written by the Playground; only what differs from the defaults.
 */
const PREFIX = 'v1.';

const toBase64Url = (text: string): string => {
  const bytes = new TextEncoder().encode(text);
  let binary = '';
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
};

const fromBase64Url = (code: string): string => {
  const padded = code
    .replace(/-/g, '+')
    .replace(/_/g, '/')
    .padEnd(Math.ceil(code.length / 4) * 4, '=');
  const binary = atob(padded);
  return new TextDecoder().decode(Uint8Array.from(binary, (c) => c.charCodeAt(0)));
};

interface Compact {
  c: string;
  v?: Record<string, string | number | boolean>;
  w?: FrameworkView;
  k?: 'vue' | 'react';
  f?: ForcedState;
  m?: 'dark';
  t?: string;
  x?: Width;
}

export function encodeState(state: PlaygroundState): string {
  const base = initialState(state.slug);
  const recipe = recipeBySlug(state.slug);
  const compact: Compact = { c: state.slug };
  const diff: ControlState = {};
  for (const [name, value] of Object.entries(state.values)) {
    if (recipe?.initial[name] !== value) diff[name] = value;
  }
  if (Object.keys(diff).length > 0) compact.v = diff;
  if (state.view !== base.view) compact.w = state.view;
  if (state.code !== base.code) compact.k = state.code;
  if (state.force !== base.force) compact.f = state.force;
  if (state.mode === 'dark') compact.m = 'dark';
  if (state.theme !== base.theme) compact.t = state.theme;
  if (state.width !== base.width) compact.x = state.width;
  return `s=${PREFIX}${toBase64Url(JSON.stringify(compact))}`;
}

const isView = (v: unknown): v is FrameworkView => v === 'vue' || v === 'react' || v === 'both';

function fromCompact(raw: unknown): PlaygroundState {
  const data = (typeof raw === 'object' && raw !== null ? raw : {}) as Partial<Compact>;
  const recipe = recipeBySlug(String(data.c));
  const base = initialState(recipe?.slug);
  const target = recipeBySlug(base.slug);
  return {
    ...base,
    values: target ? sanitizeValues(target, { ...target.initial, ...data.v }) : base.values,
    view: isView(data.w) ? data.w : base.view,
    code: data.k === 'react' ? 'react' : base.code,
    force: FORCED_STATES.includes(data.f as ForcedState) ? (data.f as ForcedState) : base.force,
    mode: data.m === 'dark' ? 'dark' : 'light',
    theme: typeof data.t === 'string' ? data.t : base.theme,
    width: WIDTHS.includes(data.x as Width) ? (data.x as Width) : base.width,
  };
}

/** Reads the state from a hash (with or without `#`). Never throws: bad input gives the defaults. */
export function decodeState(hash: string): PlaygroundState {
  const params = new URLSearchParams(hash.replace(/^#/, ''));
  const code = params.get('s');
  if (code?.startsWith(PREFIX)) {
    try {
      return fromCompact(JSON.parse(fromBase64Url(code.slice(PREFIX.length))));
    } catch {
      return initialState();
    }
  }
  const view = params.get('fw');
  const state = initialState(params.get('c') ?? undefined);
  // The docs link with the reader's framework: it picks the code tab, both previews stay.
  if (view === 'vue' || view === 'react') state.code = view;
  return state;
}
