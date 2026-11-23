/**
 * Scenes: ONE neutral description of a component usage (a small tree) from which the Playground
 * renders the real Vue and React components and generates their source. Because both outputs come
 * from the same data, the preview and the copied code cannot drift apart (PLG-02, PLG-03).
 *
 * Pure TypeScript, no DOM and no framework. Component names are the React names (`DialogTrigger`);
 * the Vue name is `T` + that name (ADR 0011). Lower-case names are plain HTML elements.
 */
import type { Framework } from './codegen.ts';

/** A JavaScript expression that reads the same in Vue templates and JSX (`toaster`, `() => x()`). */
export interface Expr {
  $expr: string;
}

export type SceneValue =
  | string
  | number
  | boolean
  | null
  | SceneValue[]
  | { [key: string]: SceneValue | undefined }
  | Expr;

export interface SceneNode {
  /** Component (`Button`, `DialogTrigger`) or HTML tag (`div`). */
  c: string;
  /** Props. `onClick`-style keys become `@click` in Vue. Values equal to `undefined` are ignored. */
  p?: Record<string, SceneValue | undefined>;
  /** Children: text or nodes. */
  k?: SceneChild[];
  /** Named slots: Vue slots (`#header`) and ReactNode props (`header={...}`). */
  s?: Record<string, SceneChild[]>;
}

export type SceneChild = SceneNode | string;

export interface Scene {
  root: SceneNode;
  /**
   * Statements shared by both frameworks (`const toaster = createToaster();`), the library
   * helpers they use and the names they define (the preview needs those to evaluate `$expr`).
   */
  setup?: { uses: string[]; lines: string[]; names: string[] };
}

export const isExpr = (v: unknown): v is Expr =>
  typeof v === 'object' && v !== null && !Array.isArray(v) && '$expr' in v;

const PACKAGE: Record<Framework, string> = { vue: '@tessen-ui/vue', react: '@tessen-ui/react' };

/** The exported name of a component in each framework. */
export function componentName(c: string, framework: Framework): string {
  if (/^[a-z]/.test(c)) return c;
  return framework === 'vue' ? `T${c}` : c;
}

const IDENT = /^[A-Za-z_$][\w$]*$/;

/** A JS literal with single quotes (safe inside a double-quoted Vue attribute). */
export function jsLiteral(value: SceneValue, indent = ''): string {
  if (isExpr(value)) return value.$expr;
  if (value === null) return 'null';
  if (typeof value === 'string') return `'${value.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`;
  if (typeof value !== 'object') return String(value);
  if (Array.isArray(value)) {
    const inline = `[${value.map((v) => jsLiteral(v)).join(', ')}]`;
    if (inline.length <= 72 && !inline.includes('\n')) return inline;
    const inner = `${indent}  `;
    return `[\n${value.map((v) => `${inner}${jsLiteral(v, inner)},`).join('\n')}\n${indent}]`;
  }
  const entries = Object.entries(value)
    .filter((e): e is [string, SceneValue] => e[1] !== undefined)
    .map(([k, v]) => `${IDENT.test(k) ? k : `'${k}'`}: ${jsLiteral(v, indent)}`);
  const inline = `{ ${entries.join(', ')} }`;
  return entries.length === 0 ? '{}' : inline;
}

const kebab = (s: string): string => s.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`);
const isEvent = (name: string): boolean => /^on[A-Z]/.test(name);

function textEscape(text: string, framework: Framework): string {
  const base = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  return framework === 'react' ? base.replace(/[{}]/g, (m) => `{'${m}'}`) : base;
}

/** Multiline arrays and objects of items are lifted into constants, like the docs examples do. */
function hoistable(value: SceneValue): boolean {
  return (
    typeof value === 'object' && value !== null && !isExpr(value) && jsLiteral(value).length > 48
  );
}

interface Hoisted {
  name: string;
  value: SceneValue;
}

interface Ctx {
  framework: Framework;
  hoisted: Hoisted[];
  used: Set<string>;
}

function propsToAttrs(node: SceneNode, ctx: Ctx): string[] {
  const out: string[] = [];
  for (const [name, value] of Object.entries(node.p ?? {})) {
    if (value === undefined) continue;
    const vue = ctx.framework === 'vue';
    if (isEvent(name)) {
      if (!isExpr(value)) continue;
      out.push(
        vue
          ? `@${kebab(name.slice(2)).replace(/^-/, '')}="${value.$expr}"`
          : `${name}={${value.$expr}}`,
      );
      continue;
    }
    const attr = vue ? kebab(name) : name;
    if (name === 'style' && value !== null && typeof value === 'object' && !isExpr(value)) {
      const entries = Object.entries(value as Record<string, SceneValue>);
      if (vue) {
        const css = entries.map(([k, v]) => `${kebab(k)}: ${String(v)}`).join('; ');
        out.push(`style="${css}"`);
      } else {
        out.push(`style={{ ${entries.map(([k, v]) => `${k}: ${jsLiteral(v)}`).join(', ')} }}`);
      }
      continue;
    }
    if (typeof value === 'string') {
      out.push(`${attr}="${value.replace(/&/g, '&amp;').replace(/"/g, '&quot;')}"`);
    } else if (value === true) {
      out.push(attr);
    } else if (hoistable(value)) {
      let hoistedName = name;
      let n = 2;
      while (ctx.used.has(hoistedName)) hoistedName = `${name}${n++}`;
      ctx.used.add(hoistedName);
      ctx.hoisted.push({ name: hoistedName, value });
      out.push(vue ? `:${attr}="${hoistedName}"` : `${attr}={${hoistedName}}`);
    } else {
      const lit = jsLiteral(value);
      out.push(vue ? `:${attr}="${lit}"` : `${attr}={${lit}}`);
    }
  }
  return out;
}

const flat = (lines: string[]): string => lines.map((l) => l.trim()).join('');

/** A slot as a React prop value: a plain string attribute or a JSX expression. */
function slotValue(content: SceneChild[], ctx: Ctx): string {
  const only = content.length === 1 ? content[0] : undefined;
  if (typeof only === 'string') return `"${textEscape(only, 'vue').replace(/"/g, '&quot;')}"`;
  const inner = content.map((c) => flat(renderChild(c, ctx, 0))).join('');
  return content.length === 1 ? `{${inner}}` : `{<>${inner}</>}`;
}

/** A Vue `<template #name>` wrapper, modelled as a pseudo element so it renders like the rest. */
const slotTemplate = (name: string, content: SceneChild[]): SceneNode => ({
  c: 'template',
  p: { [`#${name}`]: true },
  k: content,
});

function renderChild(child: SceneChild, ctx: Ctx, depth: number): string[] {
  const pad = '  '.repeat(depth);
  if (typeof child === 'string') return [`${pad}${textEscape(child, ctx.framework)}`];
  const tag = componentName(child.c, ctx.framework);
  const attrs = propsToAttrs(child, ctx);
  const slots = Object.entries(child.s ?? {});
  let kids: SceneChild[] = child.k ?? [];
  if (ctx.framework === 'react') {
    for (const [name, content] of slots) attrs.push(`${name}=${slotValue(content, ctx)}`);
  } else {
    kids = [...slots.map(([name, content]) => slotTemplate(name, content)), ...kids];
  }
  const open = [tag, ...attrs].join(' ');
  if (kids.length === 0) return [`${pad}<${open} />`];
  const textOnly = kids.length === 1 && typeof kids[0] === 'string';
  if (textOnly) {
    const line = `${pad}<${open}>${textEscape(kids[0] as string, ctx.framework)}</${tag}>`;
    if (line.length <= 100) return [line];
  }
  // Long openings put one attribute per line, like Prettier would.
  const header =
    `${pad}<${open}>`.length <= 100
      ? [`${pad}<${open}>`]
      : [`${pad}<${tag}`, ...attrs.map((a) => `${pad}  ${a}`), `${pad}>`];
  return [...header, ...kids.flatMap((k) => renderChild(k, ctx, depth + 1)), `${pad}</${tag}>`];
}

function collectComponents(node: SceneNode, into: Set<string>): void {
  if (/^[A-Z]/.test(node.c)) into.add(node.c);
  for (const k of node.k ?? []) if (typeof k !== 'string') collectComponents(k, into);
}

/** Every component name (React spelling) used by the scene, sorted. */
export function sceneComponents(scene: Scene): string[] {
  const set = new Set<string>();
  collectComponents(scene.root, set);
  return [...set].sort();
}

const constLines = (h: Hoisted): string => `const ${h.name} = ${jsLiteral(h.value)};`;

/** Source for one framework: a Vue single-file component or a React module. */
export function renderScene(scene: Scene, framework: Framework): string {
  const ctx: Ctx = { framework, hoisted: [], used: new Set() };
  const body = renderChild(scene.root, ctx, framework === 'vue' ? 1 : 2);
  const imports = [
    ...sceneComponents(scene).map((c) => componentName(c, framework)),
    ...(scene.setup?.uses ?? []),
  ].sort((a, b) => a.localeCompare(b));
  const importLine = imports.length
    ? `import { ${imports.join(', ')} } from '${PACKAGE[framework]}';`
    : '';
  const setup = scene.setup?.lines ?? [];
  const consts = ctx.hoisted.map(constLines);

  if (framework === 'vue') {
    const script = [importLine, ...(consts.length || setup.length ? [''] : []), ...consts, ...setup]
      .filter((l, i, a) => !(l === '' && (i === 0 || i === a.length - 1)))
      .join('\n');
    return [
      '<script setup lang="ts">',
      script,
      '</script>',
      '',
      '<template>',
      ...body,
      '</template>',
      '',
    ].join('\n');
  }
  const head = [
    importLine,
    ...(consts.length || setup.length ? [''] : []),
    ...consts,
    ...setup,
  ].join('\n');
  return [
    head,
    '',
    'export default function Example() {',
    '  return (',
    ...body,
    '  );',
    '}',
    '',
  ].join('\n');
}
