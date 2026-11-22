/** `pnpm measure`: individual and marginal bundle size (gzip) for the S2 components. */
import { mkdirSync, writeFileSync } from 'node:fs';
import { sep } from 'node:path';
import { gzipSync } from 'node:zlib';
import { fileURLToPath } from 'node:url';
import { build } from 'vite';

const root = fileURLToPath(new URL('..', import.meta.url));
const posixRoot = root.split(sep).join('/');
const kb = (bytes: number) => (bytes / 1024).toFixed(2);
const components = [
  'dialog',
  'tooltip',
  'popover',
  'menu',
  'select',
  'combobox',
  'date-picker',
] as const;

async function gzipOf(framework: 'vue' | 'react', names: readonly string[]) {
  const ext = framework === 'vue' ? 'ts' : 'tsx';
  const source = names
    .map((n, i) => `export * as c${i} from '${posixRoot}src/${framework}/${n}.${ext}';`)
    .join('\n');
  // The entry is a real file (under node_modules/.cache, ignored by git) so Vite can resolve it.
  mkdirSync(`${root}node_modules/.cache`, { recursive: true });
  const entry = `${root}node_modules/.cache/measure-entry.ts`;
  writeFileSync(entry, source);
  const result = await build({
    root,
    configFile: false,
    logLevel: 'silent',
    build: {
      write: false,
      minify: true,
      lib: { entry, formats: ['es'], fileName: 'out' },
      rolldownOptions: { external: [/^vue($|\/)/, /^react($|\/)/, /^react-dom($|\/)/] },
    },
  });
  const outputs = (Array.isArray(result) ? result : [result]).flatMap((r) =>
    'output' in r ? r.output : [],
  );
  const code = outputs.map((o) => ('code' in o ? o.code : '')).join('');
  return { raw: Buffer.byteLength(code), gzip: gzipSync(code).length };
}

for (const framework of ['vue', 'react'] as const) {
  console.log(`\n## ${framework} (minified, vue/react external, deps inlined)\n`);
  console.log('| Component | alone | marginal after Dialog |\n| --- | --- | --- |');
  const dialog = await gzipOf(framework, ['dialog']);
  for (const name of components) {
    const alone = await gzipOf(framework, [name]);
    const withDialog = name === 'dialog' ? dialog : await gzipOf(framework, ['dialog', name]);
    console.log(
      `| ${name} | ${kb(alone.gzip)} kB | ${name === 'dialog' ? '-' : `+${kb(withDialog.gzip - dialog.gzip)} kB`} |`,
    );
  }
  const all = await gzipOf(framework, components);
  let sum = 0;
  for (const name of components) sum += (await gzipOf(framework, [name])).gzip;
  console.log(`\nAll 7 together: ${kb(all.gzip)} kB gzip (sum of the 7 alone: ${kb(sum)} kB).`);
}
