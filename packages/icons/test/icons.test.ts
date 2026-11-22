import { mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { createElement } from 'react';
import type { FunctionComponent } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createSSRApp, h } from 'vue';
import { renderToString } from 'vue/server-renderer';
import { beforeAll, describe, expect, it } from 'vitest';
import { buildAll, componentName, parseIcon } from '../scripts/lib/icons.ts';

interface ReactIconProps {
  title?: string;
  size?: number;
  strokeWidth?: number;
  className?: string;
  'aria-label'?: string;
}

const root = fileURLToPath(new URL('..', import.meta.url));
const svgDir = `${root}src/svg`;
const sources = Object.fromEntries(
  readdirSync(svgDir)
    .filter((file) => file.endsWith('.svg'))
    .map((file) => [file.slice(0, -4), readFileSync(`${svgDir}/${file}`, 'utf8')]),
);
const names = Object.keys(sources);

let outputs: Record<string, string>;
// Generated into node_modules/.cache so `vue` and `react` resolve from this package.
let vue: Record<string, unknown>;
let react: Record<string, FunctionComponent<ReactIconProps>>;

beforeAll(async () => {
  outputs = buildAll(sources);
  const dir = `${root}node_modules/.cache/icons-test`;
  for (const target of ['vue', 'react']) {
    mkdirSync(`${dir}/${target}`, { recursive: true });
    writeFileSync(`${dir}/${target}/index.js`, outputs[`${target}/index.js`]!);
  }
  vue = await import(pathToFileURL(`${dir}/vue/index.js`).href);
  react = await import(pathToFileURL(`${dir}/react/index.js`).href);
});

function reactIcon(name: string): FunctionComponent<ReactIconProps> {
  const component = react[name];
  if (!component) throw new Error(`Missing React icon ${name}`);
  return component;
}

const renderVue = (component: unknown, props: Record<string, unknown> = {}) =>
  renderToString(createSSRApp({ render: () => h(component as never, props) }));

describe('source set', () => {
  it('has a curated, non-empty set with attribution', () => {
    expect(names.length).toBeGreaterThanOrEqual(30);
    expect(readFileSync(`${root}LICENSE-lucide.txt`, 'utf8')).toContain('ISC License');
  });

  it.each(names)('%s parses into shapes only', (name) => {
    const icon = parseIcon(name, sources[name]!);
    expect(icon.nodes.length).toBeGreaterThan(0);
    expect(icon.component).toBe(componentName(name));
  });

  it('rejects markup it cannot represent', () => {
    const wrap = (inner: string) =>
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">${inner}</svg>`;
    expect(() => parseIcon('a', wrap('<g><path d="M0 0"/></g>'))).toThrow();
    expect(() => parseIcon('a', wrap('<text>x</text>'))).toThrow();
    expect(() => parseIcon('A', wrap('<path d="M0 0h1"/>'))).toThrow(/kebab/);
    expect(() => parseIcon('a', '<svg viewBox="0 0 16 16"><path d="M0 0h1"/></svg>')).toThrow(
      /viewBox/,
    );
  });
});

describe('plain outputs', () => {
  it('writes one normalized svg per icon', () => {
    for (const name of names) {
      const svg = outputs[`svg/${name}.svg`]!;
      expect(svg).toContain('stroke="currentColor"');
      expect(svg).toContain('stroke-width="1.5"');
      expect(svg).toContain('width="24"');
      expect(svg).not.toContain('class=');
    }
  });

  it('puts every icon in the sprite exactly once', () => {
    const sprite = outputs['sprite.svg']!;
    for (const name of names) {
      expect(sprite.split(`id="tessen-icon-${name}"`)).toHaveLength(2);
    }
  });

  it('lists every icon in the manifest', () => {
    const manifest = JSON.parse(outputs['manifest.json']!) as { name: string; component: string }[];
    expect(manifest.map((m) => m.name)).toEqual([...names].sort());
    expect(manifest.find((m) => m.name === 'chevron-down')?.component).toBe('ChevronDownIcon');
  });

  it('declares every component in both type files', () => {
    for (const target of ['vue', 'react']) {
      for (const name of names) {
        expect(outputs[`${target}/index.d.ts`]).toContain(
          `export declare const ${componentName(name)}: Icon;`,
        );
      }
    }
  });
});

describe('Vue components', () => {
  it('are decorative by default', async () => {
    const html = await renderVue(vue.CheckIcon);
    expect(html).toContain('aria-hidden="true"');
    expect(html).toContain('stroke-width="1.5"');
    expect(html).toContain('viewBox="0 0 24 24"');
    expect(html).not.toContain('role=');
  });

  it('announce themselves with a title', async () => {
    const html = await renderVue(vue.CheckIcon, { title: 'Done' });
    expect(html).toContain('role="img"');
    expect(html).toContain('<title>Done</title>');
    expect(html).not.toContain('aria-hidden');
  });

  it('honor aria-label, size, stroke width and extra attributes', async () => {
    const html = await renderVue(vue.SearchIcon, {
      'aria-label': 'Search',
      size: 16,
      strokeWidth: 2,
      class: 'x',
    });
    expect(html).toContain('role="img"');
    expect(html).toContain('width="16"');
    expect(html).toContain('stroke-width="2"');
    expect(html).toContain('class="x"');
    expect(html).not.toContain('aria-hidden');
  });
});

describe('React components', () => {
  it('are decorative by default', () => {
    const html = renderToStaticMarkup(createElement(reactIcon('CheckIcon')));
    expect(html).toContain('aria-hidden="true"');
    expect(html).toContain('stroke-width="1.5"');
    expect(html).toContain('viewBox="0 0 24 24"');
    expect(html).not.toContain('role=');
  });

  it('announce themselves with a title', () => {
    const html = renderToStaticMarkup(createElement(reactIcon('CheckIcon'), { title: 'Done' }));
    expect(html).toContain('role="img"');
    expect(html).toContain('<title>Done</title>');
    expect(html).not.toContain('aria-hidden');
  });

  it('honor aria-label, size, stroke width and extra props', () => {
    const html = renderToStaticMarkup(
      createElement(reactIcon('SearchIcon'), {
        'aria-label': 'Search',
        size: 16,
        strokeWidth: 2,
        className: 'x',
      }),
    );
    expect(html).toContain('role="img"');
    expect(html).toContain('width="16"');
    expect(html).toContain('stroke-width="2"');
    expect(html).toContain('class="x"');
    expect(html).not.toContain('aria-hidden');
  });

  it('render the same shapes as Vue', async () => {
    const shapes = (html: string) =>
      html.match(/<(path|circle|rect|line|polyline|polygon|ellipse)[^>]*>/g);
    const fromReact = shapes(renderToStaticMarkup(createElement(reactIcon('CircleCheckIcon'))));
    const fromVue = shapes(await renderVue(vue.CircleCheckIcon));
    expect(fromReact).toEqual(fromVue);
  });
});
