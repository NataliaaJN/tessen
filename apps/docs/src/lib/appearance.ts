// Mini-panel «Apariencia»: accent, radius and density applied live to the docs, kept in this browser.
// It uses the same engine as Theme Studio (@tessen-ui/theme), so what you see here is what you export.
import { defaultTheme, encodeTheme, generateScale, parseTheme, toCss } from '@tessen-ui/theme';
import type { Density, Theme } from '@tessen-ui/theme';

const KEY = 'tessen:docs:appearance';
const SWATCHES = [
  ['Cobalto', '#2B7BE0'],
  ['Violeta', '#8B6CF0'],
  ['Verde', '#1F8A5B'],
  ['Ámbar', '#D9822B'],
  ['Magenta', '#C2409B'],
] as const;

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

const root = document.getElementById('appearance');
const openButton = document.getElementById('appearance-open');
if (root instanceof HTMLDialogElement && openButton) {
  let theme = load();
  apply(theme);

  const swatches = root.querySelector('[data-appearance-swatches]');
  const radius = root.querySelector<HTMLInputElement>('[data-appearance-radius]');
  const radiusOut = root.querySelector('[data-appearance-radius-out]');
  const studio = root.querySelector<HTMLAnchorElement>('[data-appearance-studio]');
  const densityInputs = root.querySelectorAll<HTMLInputElement>('input[name="appearance-density"]');

  const sync = (): void => {
    swatches?.querySelectorAll<HTMLButtonElement>('button').forEach((b) => {
      b.setAttribute('aria-pressed', String(b.dataset['hex']?.toUpperCase() === theme.accent.toUpperCase()));
    });
    if (radius) radius.value = String(theme.radius);
    if (radiusOut) radiusOut.textContent = `${theme.radius} px`;
    densityInputs.forEach((i) => (i.checked = i.value === theme.density));
    if (studio) studio.href = `/studio/#t=${encodeTheme(theme)}`;
  };
  const update = (next: Theme): void => {
    theme = next;
    apply(theme);
    sync();
  };

  for (const [label, hex] of SWATCHES) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'swatch';
    b.dataset['hex'] = hex;
    b.title = label;
    b.setAttribute('aria-label', label);
    b.style.background = generateScale(hex)[600];
    b.addEventListener('click', () => update({ ...theme, accent: hex }));
    swatches?.append(b);
  }
  radius?.addEventListener('input', () => update({ ...theme, radius: Number(radius.value) }));
  densityInputs.forEach((i) => i.addEventListener('change', () => update({ ...theme, density: i.value as Density })));
  root.querySelector('[data-appearance-reset]')?.addEventListener('click', () => update(defaultTheme()));
  root.querySelector('[data-appearance-close]')?.addEventListener('click', () => root.close());
  root.addEventListener('click', (e) => {
    if (e.target === root) root.close();
  });
  openButton.addEventListener('click', () => {
    sync();
    root.showModal();
  });
  sync();
}
