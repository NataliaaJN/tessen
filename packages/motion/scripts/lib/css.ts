import { presets } from '../../src/presets.ts';
import type { Preset } from '../../src/presets.ts';

const ORDER = /^@layer [\w.]+(?:, [\w.]+)+;$/m;

type Entry = [name: string, preset: Preset];
const entries = Object.entries(presets) as Entry[];

const presetVar = (name: string) => `--tessen-motion-preset-${name}`;
const keyframesName = (name: string) => `tessen-${name}`;
const indent = (text: string, n: number) =>
  text
    .split('\n')
    .map((line) => (line ? ' '.repeat(n) + line : line))
    .join('\n');

const declarations = (values: Readonly<Record<string, string>>) =>
  Object.entries(values)
    .map(([property, value]) => `${property}: ${value};`)
    .join(' ');

function keyframes([name, p]: Entry): string {
  return `@keyframes ${keyframesName(name)} {\n  from { ${declarations(p.from)} }\n  to { ${declarations(p.to)} }\n}`;
}

function animation([name, p]: Entry): string {
  const repeat = p.iterations && p.iterations > 1 ? ` ${p.iterations} alternate` : '';
  return `${keyframesName(name)} var(--tessen-motion-duration-${p.duration}) var(--tessen-motion-easing-${p.easing})${repeat} both`;
}

/** The preset variables, in the form each motion mode needs. */
function presetVariables(mode: 'full' | 'reduced' | 'off'): string {
  return entries
    .map((entry) => {
      const [name, p] = entry;
      if (mode === 'full' || (mode === 'reduced' && p.reduced === 'keep')) {
        return `${presetVar(name)}: ${animation(entry)};`;
      }
      if (mode === 'reduced' && p.reduced === 'fade') {
        return `${presetVar(name)}: var(${presetVar(`fade-${p.phase}`)});`;
      }
      return `${presetVar(name)}: none;`;
    })
    .join('\n');
}

const REDUCED_TOKENS = `--tessen-motion-duration-normal: var(--tessen-motion-duration-fast);
--tessen-motion-duration-slow: var(--tessen-motion-duration-fast);
--tessen-motion-duration-slower: var(--tessen-motion-duration-fast);
--tessen-motion-distance-xs: 0px;
--tessen-motion-distance-sm: 0px;
--tessen-motion-distance-md: 0px;
--tessen-motion-scale-press: 1;`;

const OFF_TOKENS = `--tessen-motion-duration-fast: var(--tessen-motion-duration-instant);
--tessen-motion-duration-normal: var(--tessen-motion-duration-instant);
--tessen-motion-duration-slow: var(--tessen-motion-duration-instant);
--tessen-motion-duration-slower: var(--tessen-motion-duration-instant);
--tessen-motion-distance-xs: 0px;
--tessen-motion-distance-sm: 0px;
--tessen-motion-distance-md: 0px;
--tessen-motion-scale-press: 1;
--tessen-motion-stagger-step: 0ms;`;

const block = (selector: string, body: string) => `${selector} {\n${indent(body, 2)}\n}`;

/**
 * `dist/css/motion.css`: keyframes, one `--tessen-motion-preset-<name>` animation shorthand per
 * preset (use `animation: var(--tessen-motion-preset-slide-up-in)`), and the three motion modes.
 * Modes work by overriding variables, so any component built on motion tokens obeys them.
 */
export function renderMotionCss(tokensCss: string): string {
  const order = ORDER.exec(tokensCss)?.[0];
  if (!order) throw new Error('No @layer order statement found in @tessen-ui/tokens');

  // Presets read the duration variables where they are declared, so every element that
  // changes a mode re-declares them (`:root, [data-tessen-motion]`).
  const scope = ':root,\n[data-tessen-motion]';
  const body = [
    entries.map(keyframes).join('\n\n'),
    block(scope, presetVariables('full')),
    '/* The OS preference applies unless the page opts out with data-tessen-motion-override. */',
    block(
      '@media (prefers-reduced-motion: reduce)',
      block(
        ':where(:root:not([data-tessen-motion-override]))',
        `${REDUCED_TOKENS}\n${presetVariables('reduced')}`,
      ),
    ),
    block("[data-tessen-motion='reduced']", `${REDUCED_TOKENS}\n${presetVariables('reduced')}`),
    block("[data-tessen-motion='off']", `${OFF_TOKENS}\n${presetVariables('off')}`),
  ].join('\n\n');

  return `/*
 * @tessen-ui/motion - generated file, do not edit.
 * Source: packages/motion/src/presets.ts. Regenerate with \`pnpm build\`.
 */

${order}

${block('@layer tessen.base', body)}
`;
}
