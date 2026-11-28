// Panel «Apariencia»: surface, accent, radius and density applied live, kept in this browser.
// Accent, radius and density go through the same engine as Theme Studio (@tessen-ui/theme), so what
// you see here is what you export. Surfaces live in apps/shared/surfaces.css.
import { defaultTheme, encodeTheme, generateScale, parseTheme, toCss } from '@tessen-ui/theme';
import type { Density, Theme } from '@tessen-ui/theme';

const KEY = 'tessen:docs:appearance';
const SURFACE_KEY = 'tessen:surface';
const SURFACES: Record<string, { label: string; mode: 'light' | 'dark' }> = {
  grafito: { label: 'Grafito', mode: 'dark' },
  pizarra: { label: 'Pizarra', mode: 'dark' },
  medianoche: { label: 'Medianoche', mode: 'dark' },
  porcelana: { label: 'Porcelana', mode: 'light' },
  bruma: { label: 'Bruma', mode: 'light' },
};
const SWATCHES: [string, string][] = [
  ['Tessen', defaultTheme().accent],
  ['Lima', '#84B820'],
  ['Menta', '#14B88A'],
  ['Turquesa', '#0FA3B1'],
  ['Ámbar', '#D9822B'],
  ['Coral', '#F2603A'],
  ['Rojo', '#D94B4B'],
  ['Rosa', '#D9468F'],
  ['Índigo', '#5B6BE0'],
  ['Acero', '#6F7787'],
];

function load(): Theme {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return parseTheme((JSON.parse(raw) as { theme?: unknown }).theme);
  } catch {
    // Missing or damaged storage: start from the base theme.
  }
  return defaultTheme();
}

function apply(theme: Theme): void {
  const css = toCss(theme);
  let style = document.getElementById('appearance-style');
  if (!style) {
    style = document.createElement('style');
    style.id = 'appearance-style';
    document.head.append(style);
  }
  style.textContent = css;
  try {
    const isBase = JSON.stringify(theme) === JSON.stringify(defaultTheme());
    if (isBase) localStorage.removeItem(KEY);
    else localStorage.setItem(KEY, JSON.stringify({ theme, css }));
  } catch {
    // Storage blocked: the change still applies to this page view.
  }
}

export function setSurface(id: string): void {
  const surface = SURFACES[id];
  if (!surface) return;
  const root = document.documentElement;
  root.dataset['surface'] = id;
  root.dataset['tessenTheme'] = surface.mode;
  try {
    localStorage.setItem(SURFACE_KEY, id);
    localStorage.setItem(`${SURFACE_KEY}:${surface.mode}`, id);
  } catch {
    // Storage blocked: the change still applies to this page view.
  }
  syncSurface();
}

function syncSurface(): void {
  const id = document.documentElement.dataset['surface'] ?? 'grafito';
  const label = SURFACES[id]?.label ?? 'Grafito';
  document.querySelectorAll('[data-surface-name]').forEach((n) => (n.textContent = label));
  document.querySelectorAll<HTMLElement>('[data-set-surface]').forEach((b) => {
    b.setAttribute('aria-pressed', String(b.dataset['setSurface'] === id));
  });
}

let theme = load();
apply(theme);

const sync = (): void => {
  document.querySelectorAll<HTMLButtonElement>('[data-accent]').forEach((b) => {
    b.setAttribute(
      'aria-pressed',
      String(b.dataset['accent']?.toUpperCase() === theme.accent.toUpperCase()),
    );
  });
  const name = SWATCHES.find(([, hex]) => hex.toUpperCase() === theme.accent.toUpperCase())?.[0];
  document
    .querySelectorAll('[data-appearance-accent-out]')
    .forEach((o) => (o.textContent = name ?? theme.accent));
  document
    .querySelectorAll<HTMLInputElement>('[data-appearance-radius]')
    .forEach((r) => (r.value = String(theme.radius)));
  document
    .querySelectorAll('[data-appearance-radius-out]')
    .forEach((o) => (o.textContent = `${theme.radius} px`));
  document
    .querySelectorAll<HTMLInputElement>('input[name="appearance-density"]')
    .forEach((i) => (i.checked = i.value === theme.density));
  document
    .querySelectorAll<HTMLAnchorElement>('[data-appearance-studio]')
    .forEach((a) => (a.href = `/studio/#t=${encodeTheme(theme)}`));
  syncSurface();
};
const update = (next: Theme): void => {
  theme = next;
  apply(theme);
  sync();
};

// Every swatch row on the page (drawer and home panel) drives the same theme.
document.querySelectorAll('[data-appearance-swatches]').forEach((row) => {
  for (const [label, hex] of SWATCHES) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'swatch';
    b.dataset['accent'] = hex;
    b.title = label;
    b.setAttribute('aria-label', `Acento ${label}`);
    b.style.setProperty('--swatch', generateScale(hex)[hex === defaultTheme().accent ? 600 : 400]);
    b.addEventListener('click', () => update({ ...theme, accent: hex }));
    row.append(b);
  }
});
document.querySelectorAll<HTMLInputElement>('[data-appearance-radius]').forEach((r) => {
  r.addEventListener('input', () => update({ ...theme, radius: Number(r.value) }));
});
document.querySelectorAll<HTMLInputElement>('input[name="appearance-density"]').forEach((i) => {
  i.addEventListener('change', () => update({ ...theme, density: i.value as Density }));
});
document.querySelectorAll<HTMLElement>('[data-set-surface]').forEach((b) => {
  b.addEventListener('click', () => setSurface(b.dataset['setSurface'] ?? ''));
});
document.querySelectorAll('[data-appearance-reset]').forEach((b) => {
  b.addEventListener('click', () => {
    update(defaultTheme());
    setSurface('grafito');
  });
});
document.querySelectorAll<HTMLButtonElement>('[data-appearance-copy]').forEach((b) => {
  b.addEventListener('click', async () => {
    const label = b.textContent;
    try {
      await navigator.clipboard.writeText(toCss(theme));
      b.textContent = 'CSS copiado';
    } catch {
      b.textContent = 'No se pudo copiar';
    }
    setTimeout(() => (b.textContent = label), 1800);
  });
});

// Top bar toggle: jump between the last dark and the last light surface.
document.getElementById('theme')?.addEventListener('click', () => {
  const next = document.documentElement.dataset['tessenTheme'] === 'dark' ? 'light' : 'dark';
  let id = next === 'light' ? 'porcelana' : 'grafito';
  try {
    id = localStorage.getItem(`${SURFACE_KEY}:${next}`) ?? id;
  } catch {
    // Keep the default for that mode.
  }
  setSurface(id);
});

const drawer = document.getElementById('appearance');
if (drawer instanceof HTMLDialogElement) {
  document.getElementById('appearance-open')?.addEventListener('click', () => {
    sync();
    drawer.showModal();
  });
  drawer
    .querySelector('[data-appearance-close]')
    ?.addEventListener('click', () => drawer.close());
  drawer.addEventListener('click', (e) => {
    if (e.target === drawer) drawer.close();
  });
}
sync();
