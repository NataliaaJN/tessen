import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { runChecks } from '../scripts/lib/checks.ts';
import type { CheckName, Issue } from '../scripts/lib/checks.ts';
import { buildColorPrimitives } from '../scripts/lib/scales.ts';
import { readSourceFiles, sourcesFromFiles } from '../scripts/lib/source.ts';
import type { Tree } from '../scripts/lib/source.ts';

const srcDir = fileURLToPath(new URL('../src', import.meta.url));
const real = readSourceFiles(srcDir);

type Files = Record<string, Tree>;

/** Runs the checks on the real sources after applying `edit` to a deep copy. */
async function check(edit?: (files: Files) => void): Promise<Issue[]> {
  const files = structuredClone(real);
  edit?.(files);
  return (await runChecks(sourcesFromFiles(srcDir, files))).issues;
}

/** Walks `path` inside a tree and returns the node. */
function at(tree: Tree, ...path: string[]): Tree {
  return path.reduce<Tree>((node, key) => node[key] as Tree, tree);
}

const messages = (issues: Issue[], check: CheckName): string[] =>
  issues.filter((i) => i.check === check).map((i) => i.message);

describe('the real sources', () => {
  it('pass every check', async () => {
    const result = await runChecks(sourcesFromFiles(srcDir, real), {
      generatedScales: {
        expected: buildColorPrimitives(),
        actual: JSON.parse(readFileSync(`${srcDir}/primitives/color.json`, 'utf8')),
      },
    });
    expect(result.issues).toEqual([]);
    expect(result.stats.tokens).toBeGreaterThan(200);
    expect(result.stats.contrastPairs).toBeGreaterThan(100);
  });
});

describe('structure', () => {
  it('requires a $type', async () => {
    const issues = await check((f) => {
      delete at(f['primitives/space.json']!, 'space').$type;
    });
    expect(messages(issues, 'structure').some((m) => m.includes('no $type'))).toBe(true);
  });

  it('rejects names with dots', async () => {
    const issues = await check((f) => {
      at(f['primitives/space.json']!, 'space')['0.5'] = { $value: { value: 2, unit: 'px' } };
    });
    expect(messages(issues, 'structure').join('\n')).toMatch(/"0\.5" is not a valid name/);
  });

  it('rejects a hex that disagrees with the components', async () => {
    const issues = await check((f) => {
      at(f['primitives/color.json']!, 'color', 'brand', '600', '$value').hex = '#000000';
    });
    expect(messages(issues, 'structure').join('\n')).toMatch(/does not match components/);
  });

  it('rejects dimensions in unsupported units', async () => {
    const issues = await check((f) => {
      at(f['primitives/space.json']!, 'space', '1').$value = { value: 1, unit: 'em' };
    });
    expect(messages(issues, 'structure').join('\n')).toMatch(/unit "em"/);
  });

  it('rejects unknown tessen extensions', async () => {
    const issues = await check((f) => {
      at(f['primitives/radius.json']!, 'radius', 'md').$extensions = {
        tessen: { deriveFrom: 'radius.base', factor: 1, nope: true },
      };
    });
    expect(messages(issues, 'structure').join('\n')).toMatch(/unknown extension/);
  });
});

describe('references', () => {
  it('reports orphan aliases', async () => {
    const issues = await check((f) => {
      at(f['themes/light.json']!, 'color', 'text', 'primary').$value = '{color.neutral.999}';
    });
    expect(messages(issues, 'references').join('\n')).toMatch(
      /color\.neutral\.999.*does not exist/,
    );
  });

  it('reports alias cycles', async () => {
    const issues = await check((f) => {
      const space = at(f['primitives/space.json']!, 'space');
      (space['1'] as Tree).$value = '{space.2}';
      (space['2'] as Tree).$value = '{space.1}';
    });
    expect(messages(issues, 'references').join('\n')).toMatch(
      /alias cycle: space\.1 -> space\.2 -> space\.1/,
    );
  });

  it('keeps primitives from referencing semantic tokens', async () => {
    const issues = await check((f) => {
      at(f['primitives/color.json']!, 'color', 'white').$value = '{color.surface.default}';
    });
    expect(messages(issues, 'references').join('\n')).toMatch(
      /primitive\) must not reference color\.surface\.default \(semantic\)/,
    );
  });

  it('keeps component tokens on the semantic layer', async () => {
    const issues = await check((f) => {
      f['components/button.json'] = {
        button: { $type: 'color', background: { $value: '{color.brand.600}' } },
      };
    });
    expect(messages(issues, 'references').join('\n')).toMatch(
      /button\.background \(component\) must not reference color\.brand\.600 \(primitive\)/,
    );
  });

  it('accepts component tokens that reference semantic tokens', async () => {
    const issues = await check((f) => {
      f['components/button.json'] = {
        button: { $type: 'color', background: { $value: '{color.action.primary.default}' } },
      };
    });
    expect(issues).toEqual([]);
  });

  it('requires aliases to keep the type of their target', async () => {
    const issues = await check((f) => {
      at(f['semantic/focus.json']!, 'focus', 'ring', 'offset').$value = '{color.white}';
    });
    expect(messages(issues, 'references').join('\n')).toMatch(/types must match/);
  });
});

describe('parity', () => {
  it('requires dark to define every light token', async () => {
    const issues = await check((f) => {
      delete at(f['themes/dark.json']!, 'color', 'text').primary;
    });
    expect(messages(issues, 'parity')).toContain(
      'color.text.primary is defined in light but missing in dark',
    );
  });

  it('requires every density mode to define the same tokens', async () => {
    const issues = await check((f) => {
      f['themes/density.json']!.compact = {};
    });
    expect(messages(issues, 'parity')).toContain('density.scale is missing in density "compact"');
  });

  it('forbids defining a token in a base layer and in a theme', async () => {
    const issues = await check((f) => {
      f['semantic/focus.json'] = {
        ...f['semantic/focus.json']!,
        color: { $type: 'color', text: { primary: { $value: '{color.white}' } } },
      };
    });
    expect(messages(issues, 'parity').join('\n')).toMatch(
      /color\.text\.primary is defined in both/,
    );
  });
});

describe('derive', () => {
  it('detects a literal value that disagrees with its factor', async () => {
    const issues = await check((f) => {
      at(f['primitives/radius.json']!, 'radius', 'lg').$value = { value: 10, unit: 'px' };
    });
    expect(messages(issues, 'derive').join('\n')).toMatch(
      /radius\.lg: radius\.base \(9px\) x 4\/3 gives 12px, but the literal value is 10px/,
    );
  });

  it('detects a missing deriveFrom target', async () => {
    const issues = await check((f) => {
      at(f['primitives/radius.json']!, 'radius', 'lg').$extensions = {
        tessen: { deriveFrom: 'radius.nope', factor: 1 },
      };
    });
    expect(messages(issues, 'derive').join('\n')).toMatch(
      /deriveFrom "radius\.nope" does not exist/,
    );
  });
});

describe('names', () => {
  it('detects CSS variable collisions after flattening', async () => {
    const issues = await check((f) => {
      f['primitives/space.json'] = {
        ...f['primitives/space.json']!,
        a: { $type: 'number', 'b-c': { $value: 1 }, b: { c: { $value: 2 } } },
      };
    });
    expect(messages(issues, 'names').join('\n')).toMatch(
      /--tessen-a-b-c is produced by both a\.b-c and a\.b\.c/,
    );
  });
});

describe('contrast', () => {
  it('fails when a declared pair drops below its minimum, naming the theme', async () => {
    const issues = await check((f) => {
      // neutral.300 text on the light canvas is far below 4.5:1.
      at(f['themes/light.json']!, 'color', 'text', 'primary').$value = '{color.neutral.300}';
    });
    const found = messages(issues, 'contrast');
    expect(
      found.some((m) => m.startsWith('light: color.text.primary on color.surface.canvas is')),
    ).toBe(true);
    expect(found.every((m) => !m.startsWith('dark:'))).toBe(true);
  });

  it('applies the 3:1 threshold to ui pairs', async () => {
    const issues = await check((f) => {
      at(f['themes/dark.json']!, 'color', 'border', 'focus').$value = '{color.neutral.800}';
    });
    expect(messages(issues, 'contrast').join('\n')).toMatch(
      /dark: color\.border\.focus on color\.surface\.canvas is [\d.]+:1, needs 3:1/,
    );
  });

  it('flags pairs that point at tokens that do not exist', async () => {
    const issues = await check((f) => {
      (
        f['contrast-pairs.json'] as unknown as { pairs: { foreground: string }[] }
      ).pairs[0]!.foreground = 'color.text.nope';
    });
    expect(messages(issues, 'contrast').join('\n')).toMatch(
      /foreground "color\.text\.nope" is not a color token/,
    );
  });
});

describe('scales', () => {
  it('fails when color.json drifts from the generator', async () => {
    const files = structuredClone(real);
    at(files['primitives/color.json']!, 'color', 'brand', '500', '$value').hex = '#123456';
    const result = await runChecks(sourcesFromFiles(srcDir, files), {
      generatedScales: { expected: buildColorPrimitives(), actual: files['primitives/color.json'] },
    });
    expect(messages(result.issues, 'scales')[0]).toMatch(/out of date/);
  });
});
