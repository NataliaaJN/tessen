/** `pnpm measure`: bundle size (criterion 4) and adapter size/divergence (criterion 1) for spike S1. */
import { readFileSync, readdirSync } from 'node:fs';
import { gzipSync } from 'node:zlib';
import { fileURLToPath } from 'node:url';
import { build } from 'vite';

const root = fileURLToPath(new URL('..', import.meta.url));
const kb = (bytes: number) => (bytes / 1024).toFixed(2);

async function bundle(entry: string) {
  const result = await build({
    root,
    configFile: false,
    logLevel: 'silent',
    build: {
      write: false,
      minify: true,
      lib: { entry: `${root}${entry}`, formats: ['es'], fileName: 'out' },
      rolldownOptions: { external: [/^vue($|\/)/, /^react($|\/)/, /^react-dom($|\/)/] },
    },
  });
  const outputs = (Array.isArray(result) ? result : [result]).flatMap((r) =>
    'output' in r ? r.output : [],
  );
  const code = outputs.map((o) => ('code' in o ? o.code : '')).join('');
  return { raw: Buffer.byteLength(code), gzip: gzipSync(code).length };
}

console.log('## Bundle (minified, vue/react external, deps inlined)\n');
console.log('| Entry | min | gzip |\n| --- | --- | --- |');
for (const framework of ['vue', 'react']) {
  const ext = framework === 'vue' ? 'ts' : 'tsx';
  for (const component of ['dialog', 'tabs', 'tooltip']) {
    const { raw, gzip } = await bundle(`src/${framework}/${component}.${ext}`);
    console.log(`| ${framework} ${component} | ${kb(raw)} kB | ${kb(gzip)} kB |`);
  }
}

console.log('\n## Adapter size (non-blank, non-comment, non-import lines)\n');
const code = (file: string) =>
  readFileSync(file, 'utf8')
    .split('\n')
    .map((l) => l.trim())
    .filter(
      (l) =>
        l &&
        !l.startsWith('//') &&
        !l.startsWith('*') &&
        !l.startsWith('/*') &&
        !l.startsWith('import '),
    );

/** Lines that are framework-specific *logic* (not markup, not Zag calls): presence glue, event plumbing, ids. */
const divergent =
  /usePresence|useId|emit\(|\bemits\b|onOpenChange|onValueChange|computed\(|setNode|inheritAttrs|defaultValue \?\?/;

console.log(
  '| Framework | adapter lines | divergent-logic lines | share |\n| --- | --- | --- | --- |',
);
const totals: Record<string, [number, number]> = {};
for (const framework of ['vue', 'react']) {
  let lines = 0;
  let logic = 0;
  for (const file of readdirSync(`${root}src/${framework}`).filter((f) => f !== 'index.ts')) {
    const rows = file.startsWith('use-presence')
      ? code(`${root}src/${framework}/${file}`).length
      : 0;
    const body = code(`${root}src/${framework}/${file}`);
    lines += body.length;
    logic += file.startsWith('use-presence') ? rows : body.filter((l) => divergent.test(l)).length;
  }
  totals[framework] = [lines, logic];
  console.log(`| ${framework} | ${lines} | ${logic} | ${((logic / lines) * 100).toFixed(1)} % |`);
}
