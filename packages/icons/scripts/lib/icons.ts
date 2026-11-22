import { optimize } from 'svgo';

export interface IconNode {
  tag: string;
  attrs: Record<string, string>;
}

export interface Icon {
  /** File name without extension, e.g. `chevron-down`. */
  name: string;
  /** Component name, e.g. `ChevronDownIcon`. */
  component: string;
  /** Sprite symbol id, e.g. `tessen-icon-chevron-down`. */
  symbol: string;
  nodes: IconNode[];
}

/** Grid and stroke shared by every icon (spec 04 §3.8: 24 px grid, 1.5 px stroke, round, currentColor). */
export const GRID = 24;
export const STROKE_WIDTH = 1.5;
export const ROOT_ATTRS = {
  viewBox: `0 0 ${GRID} ${GRID}`,
  fill: 'none',
  stroke: 'currentColor',
  'stroke-linecap': 'round',
  'stroke-linejoin': 'round',
} as const;

const SHAPES = new Set(['path', 'circle', 'ellipse', 'rect', 'line', 'polyline', 'polygon']);
const NAME = /^[a-z][a-z0-9]*(-[a-z0-9]+)*$/;

export const componentName = (name: string) =>
  name
    .split('-')
    .map((part) => part[0]!.toUpperCase() + part.slice(1))
    .join('') + 'Icon';

/** Optimizes one source SVG with SVGO and extracts its shapes. Fails on anything it cannot represent. */
export function parseIcon(name: string, source: string): Icon {
  if (!NAME.test(name)) throw new Error(`Invalid icon name "${name}" (use kebab-case)`);
  const { data } = optimize(source, {
    path: `${name}.svg`,
    multipass: true,
    plugins: [
      {
        name: 'preset-default',
        params: { overrides: { convertShapeToPath: false } },
      },
    ],
  });

  const match = /^<svg[^>]*>([\s\S]*)<\/svg>$/.exec(data.trim());
  if (!match) throw new Error(`${name}: not a plain <svg> document`);
  const rootViewBox = /^<svg[^>]*\sviewBox="([^"]+)"/.exec(data.trim())?.[1];
  if (rootViewBox !== ROOT_ATTRS.viewBox) {
    throw new Error(`${name}: expected viewBox "${ROOT_ATTRS.viewBox}", got "${rootViewBox}"`);
  }

  const inner = match[1]!;
  const element = /<([a-zA-Z]+)((?:\s+[\w:-]+="[^"]*")*)\s*\/>/g;
  const nodes: IconNode[] = [];
  for (const [, tag, rawAttrs] of inner.matchAll(element)) {
    if (!SHAPES.has(tag!)) throw new Error(`${name}: unsupported element <${tag}>`);
    const attrs: Record<string, string> = {};
    for (const [, key, value] of rawAttrs!.matchAll(/([\w:-]+)="([^"]*)"/g)) attrs[key!] = value!;
    nodes.push({ tag: tag!, attrs });
  }
  if (nodes.length === 0 || inner.replace(element, '').trim() !== '') {
    throw new Error(`${name}: contains markup other than self-closing shapes`);
  }
  return { name, component: componentName(name), symbol: `tessen-icon-${name}`, nodes };
}

const attributeText = (attrs: Record<string, string | number>) =>
  Object.entries(attrs)
    .map(([key, value]) => ` ${key}="${value}"`)
    .join('');

const shapes = (icon: Icon) =>
  icon.nodes.map(({ tag, attrs }) => `<${tag}${attributeText(attrs)}/>`).join('');

/** Standalone `<svg>` file (24 px, currentColor, 1.5 stroke). */
export function renderSvg(icon: Icon): string {
  const root = attributeText({
    xmlns: 'http://www.w3.org/2000/svg',
    width: GRID,
    height: GRID,
    ...ROOT_ATTRS,
    'stroke-width': STROKE_WIDTH,
  });
  return `<svg${root}>${shapes(icon)}</svg>\n`;
}

/** One sprite with a `<symbol>` per icon; use with `<use href="sprite.svg#tessen-icon-check"/>`. */
export function renderSprite(icons: Icon[]): string {
  const root = attributeText({ ...ROOT_ATTRS, 'stroke-width': STROKE_WIDTH });
  const symbols = icons
    .map((icon) => `<symbol id="${icon.symbol}"${root}>${shapes(icon)}</symbol>`)
    .join('\n');
  return `<svg xmlns="http://www.w3.org/2000/svg" style="display:none" aria-hidden="true">\n${symbols}\n</svg>\n`;
}

const camel = (key: string) => key.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase());
const literal = (value: unknown) => JSON.stringify(value);

const BANNER = `/*
 * @tessen-ui/icons - generated file, do not edit.
 * Source: packages/icons/src/svg (Lucide, ISC; see LICENSE-lucide.txt). Regenerate with \`pnpm build\`.
 */
`;

const nodesLiteral = (icon: Icon, convertKey: (key: string) => string) =>
  literal(
    icon.nodes.map(({ tag, attrs }) => [
      tag,
      Object.fromEntries(Object.entries(attrs).map(([k, v]) => [convertKey(k), v])),
    ]),
  );

const PROPS_DOC = `/** \`size\` defaults to 24, \`strokeWidth\` to 1.5. With \`title\` (or aria-label) the icon is announced, otherwise it is hidden from assistive technology. */`;

export function renderVue(icons: Icon[]): { js: string; dts: string } {
  const js = `${BANNER}import { h } from 'vue';

const ROOT = ${literal(ROOT_ATTRS)};

/*#__PURE__*/
function createIcon(displayName, nodes) {
  const Icon = (props, { attrs }) => {
    const labelled = props.title || attrs['aria-label'] || attrs['aria-labelledby'];
    const size = props.size ?? ${GRID};
    return h(
      'svg',
      {
        xmlns: 'http://www.w3.org/2000/svg',
        width: size,
        height: size,
        ...ROOT,
        'stroke-width': props.strokeWidth ?? ${STROKE_WIDTH},
        ...(labelled ? { role: 'img' } : { 'aria-hidden': 'true', focusable: 'false' }),
        ...attrs,
      },
      [
        props.title ? h('title', props.title) : null,
        ...nodes.map(([tag, nodeAttrs]) => h(tag, nodeAttrs)),
      ],
    );
  };
  Icon.displayName = displayName;
  Icon.props = ['size', 'strokeWidth', 'title'];
  Icon.inheritAttrs = false;
  return Icon;
}

${icons.map((icon) => `export const ${icon.component} = /*#__PURE__*/ createIcon(${literal(icon.component)}, ${nodesLiteral(icon, (k) => k)});`).join('\n')}
`;
  const dts = `${BANNER}import type { FunctionalComponent } from 'vue';

export interface IconProps {
  size?: number | string;
  strokeWidth?: number | string;
  title?: string;
}

${PROPS_DOC}
export type Icon = FunctionalComponent<IconProps>;

${icons.map((icon) => `export declare const ${icon.component}: Icon;`).join('\n')}
`;
  return { js, dts };
}

export function renderReact(icons: Icon[]): { js: string; dts: string } {
  const js = `${BANNER}import { createElement } from 'react';

const ROOT = ${literal(Object.fromEntries(Object.entries(ROOT_ATTRS).map(([k, v]) => [camel(k), v])))};

/*#__PURE__*/
function createIcon(displayName, nodes) {
  const Icon = ({ size = ${GRID}, strokeWidth = ${STROKE_WIDTH}, title, ...rest }) => {
    const labelled = title || rest['aria-label'] || rest['aria-labelledby'];
    return createElement(
      'svg',
      {
        xmlns: 'http://www.w3.org/2000/svg',
        width: size,
        height: size,
        ...ROOT,
        strokeWidth,
        ...(labelled ? { role: 'img' } : { 'aria-hidden': true, focusable: 'false' }),
        ...rest,
      },
      title ? createElement('title', null, title) : null,
      ...nodes.map(([tag, attrs], index) => createElement(tag, { key: index, ...attrs })),
    );
  };
  Icon.displayName = displayName;
  return Icon;
}

${icons.map((icon) => `export const ${icon.component} = /*#__PURE__*/ createIcon(${literal(icon.component)}, ${nodesLiteral(icon, camel)});`).join('\n')}
`;
  const dts = `${BANNER}import type { ReactElement, SVGProps } from 'react';

export interface IconProps extends Omit<SVGProps<SVGSVGElement>, 'ref' | 'title'> {
  size?: number | string;
  strokeWidth?: number | string;
  title?: string;
}

${PROPS_DOC}
export type Icon = (props: IconProps) => ReactElement;

${icons.map((icon) => `export declare const ${icon.component}: Icon;`).join('\n')}
`;
  return { js, dts };
}

export function renderManifest(icons: Icon[]): string {
  return (
    JSON.stringify(
      icons.map(({ name, component, symbol }) => ({ name, component, symbol })),
      null,
      2,
    ) + '\n'
  );
}

export function buildAll(sources: Record<string, string>): Record<string, string> {
  const icons = Object.entries(sources)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([name, source]) => parseIcon(name, source));
  const vue = renderVue(icons);
  const react = renderReact(icons);
  const outputs: Record<string, string> = {
    'sprite.svg': renderSprite(icons),
    'manifest.json': renderManifest(icons),
    'vue/index.js': vue.js,
    'vue/index.d.ts': vue.dts,
    'react/index.js': react.js,
    'react/index.d.ts': react.dts,
  };
  for (const icon of icons) outputs[`svg/${icon.name}.svg`] = renderSvg(icon);
  return outputs;
}
