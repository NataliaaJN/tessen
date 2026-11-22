import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const LAYER_STATEMENT = /^@layer [\w.]+(?:, [\w.]+)+;$/m;

export interface BuildInput {
  /** `packages/styles/src` */
  srcDir: string;
  /** Contents of `@tessen-ui/tokens/tokens.css`. */
  tokensCss: string;
}

/** Returns the `@layer a, b, c;` order statement of a stylesheet. */
export function layerStatement(css: string): string {
  const match = LAYER_STATEMENT.exec(css);
  if (!match) throw new Error('No @layer order statement found');
  return match[0];
}

const banner = (name: string) =>
  `/*\n * @tessen-ui/styles - generated file, do not edit.\n * Source: packages/styles/src (${name}). Regenerate with \`pnpm build\`.\n */\n`;

const read = (srcDir: string, file: string) => readFileSync(join(srcDir, file), 'utf8').trim();

/**
 * Assembles `dist/`. `tokens.css` is inlined (not `@import`ed) so each file works
 * on its own and the layer order is declared exactly once per entry point.
 */
export function buildStyles({ srcDir, tokensCss }: BuildInput): Record<string, string> {
  const layers = read(srcDir, 'layers.css');
  const order = layerStatement(layers);
  if (layerStatement(tokensCss) !== order) {
    throw new Error('Layer order in styles/src/layers.css differs from @tessen-ui/tokens');
  }
  const tokens = tokensCss
    .replace(LAYER_STATEMENT, '')
    .replace(/^\/\*[\s\S]*?\*\/\s*/, '')
    .trim();

  // `components/` appears with the first component (F2); until then there is none.
  const componentsDir = join(srcDir, 'components');
  const components = existsSync(componentsDir)
    ? readdirSync(componentsDir, { withFileTypes: true })
        .filter((entry) => entry.isFile() && entry.name.endsWith('.css'))
        .map((entry) => entry.name)
        .sort()
    : [];

  const outputs: Record<string, string> = {
    'layers.css': `${banner('layers.css')}\n${order}\n`,
    'tokens.css': `${banner('tokens.css')}\n${order}\n\n${tokens}\n`,
    'reset.css': `${banner('reset.css')}\n${order}\n\n${read(srcDir, 'reset.css')}\n`,
    'base.css': `${banner('base.css')}\n${order}\n\n${read(srcDir, 'base.css')}\n`,
  };
  const componentCss = components.map((name) => read(componentsDir, name));
  outputs['index.css'] =
    `${banner('index.css')}\n${order}\n\n${[tokens, ...componentCss].join('\n\n')}\n`;
  for (const name of components) {
    outputs[`components/${name}`] =
      `${banner(`components/${name}`)}\n${order}\n\n${read(componentsDir, name)}\n`;
  }
  return outputs;
}
