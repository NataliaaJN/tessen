import { readdirSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { beforeAll, describe, expect, it } from 'vitest';
import { buildStyles, layerStatement } from '../scripts/lib/build.ts';

const srcDir = fileURLToPath(new URL('../src', import.meta.url));
const tokensCss = readFileSync(
  fileURLToPath(import.meta.resolve('@tessen-ui/tokens/tokens.css')),
  'utf8',
);
const sources = readdirSync(srcDir).filter((f) => f.endsWith('.css') && f !== 'layers.css');

let outputs: Record<string, string>;
beforeAll(() => {
  outputs = buildStyles({ srcDir, tokensCss });
});

/** Top-level `@layer name {` blocks: everything else at depth 0 would be unlayered. */
function topLevelStatements(css: string): string[] {
  const stripped = css.replace(/\/\*[\s\S]*?\*\//g, '');
  const result: string[] = [];
  let depth = 0;
  let current = '';
  for (const char of stripped) {
    if (char === '{') depth++;
    if (depth === 0) current += char;
    if (char === '}') depth--;
    if (depth === 0 && (char === '}' || char === ';')) {
      result.push(current.trim());
      current = '';
    }
    if (depth > 0 && char === '{' && !current.endsWith('{')) current += '{';
  }
  return result.filter(Boolean);
}

describe('layers', () => {
  it('declares the same order as @tessen-ui/tokens', () => {
    expect(layerStatement(readFileSync(`${srcDir}/layers.css`, 'utf8'))).toBe(
      layerStatement(tokensCss),
    );
  });

  it.each(sources)('%s has no unlayered rules', (file) => {
    const statements = topLevelStatements(readFileSync(`${srcDir}/${file}`, 'utf8'));
    expect(statements.length).toBeGreaterThan(0);
    for (const statement of statements) expect(statement).toMatch(/^@layer tessen\.\w+ \{$/);
  });

  it('puts reset in tessen.reset and base in tessen.base', () => {
    expect(readFileSync(`${srcDir}/reset.css`, 'utf8')).toContain('@layer tessen.reset {');
    expect(readFileSync(`${srcDir}/base.css`, 'utf8')).toContain('@layer tessen.base {');
  });
});

describe('token usage', () => {
  const defined = new Set([...tokensCss.matchAll(/(--tessen-[\w-]+)\s*:/g)].map((m) => m[1]));

  it.each(sources)('%s only references tokens that exist', (file) => {
    const css = readFileSync(`${srcDir}/${file}`, 'utf8');
    const used = [...css.matchAll(/var\((--tessen-[\w-]+)/g)].map((m) => m[1]);
    if (file === 'base.css') expect(used.length).toBeGreaterThan(0);
    expect(used.filter((name) => !defined.has(name!))).toEqual([]);
  });
});

describe('build output', () => {
  it('emits the public entry points', () => {
    expect(Object.keys(outputs).sort()).toEqual([
      'base.css',
      'index.css',
      'layers.css',
      'reset.css',
      'tokens.css',
    ]);
  });

  it('declares the layer order exactly once per file', () => {
    for (const [file, css] of Object.entries(outputs)) {
      expect(css.match(/^@layer [\w.]+(?:, [\w.]+)+;$/gm), file).toHaveLength(1);
    }
  });

  it('keeps reset and base out of the default entry', () => {
    expect(outputs['index.css']).toContain('@layer tessen.tokens {');
    expect(outputs['index.css']).not.toContain('@layer tessen.reset {');
    expect(outputs['index.css']).not.toContain('@layer tessen.base {');
  });

  it('is self-contained (no @import)', () => {
    for (const [file, css] of Object.entries(outputs)) expect(css, file).not.toContain('@import');
  });
});
