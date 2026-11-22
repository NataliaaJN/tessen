// @ts-check
/**
 * `pnpm tarball:check` - static checks on the packed `.tgz` files (ADR 0016,
 * `npm-publication-strategy` section 4.2): contents against an allow-list, packed
 * manifest sanity, every `exports` target present, `publint` and `attw`.
 * Runs on what `pnpm pack:all` produced; it never touches the registry.
 */
import { spawnSync } from 'node:child_process';
import { basename, dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { readPacked, tarballs } from './pack-all.mjs';

const here = dirname(fileURLToPath(import.meta.url));
/** Runs a tool of this package through node (no shell, same on Windows and Linux). */
const PUBLINT = join(here, 'node_modules', 'publint', 'src', 'cli.js');
const ATTW = join(here, 'node_modules', '@arethetypeswrong', 'cli', 'dist', 'index.js');

/** Files every package may ship besides its `dist/`. */
const COMMON = [/^package\.json$/, /^README\.md$/, /^LICENSE[\w.-]*$/];

/** Extra allowed paths (relative to the package root) per package. */
const ALLOW = {
  '@tessen-ui/tokens': [/^dist\//, /^src\/.+\.json$/],
  '@tessen-ui/styles': [/^dist\/.+\.css$/],
  '@tessen-ui/core': [/^dist\/.+\.(js|d\.ts)$/],
  '@tessen-ui/icons': [/^dist\//],
  '@tessen-ui/motion': [/^dist\/.+\.(js|d\.ts|css)$/],
};

/** Never allowed, whatever the allow-list says. */
const FORBIDDEN = [
  /\.(test|spec)\.[cm]?[jt]sx?$/,
  /(^|\/)tsconfig[^/]*\.json$/,
  /\.map$/,
  /(^|\/)(scripts|test|tests|stories)\//,
];

/**
 * @param {string} cmd
 * @param {string[]} args
 */
function run(cmd, args, cwd = tarballs) {
  return spawnSync(cmd, args, { encoding: 'utf8', cwd });
}

/** @param {string} file @returns {string[]} entries relative to the package root */
function listTarball(file) {
  const result = run('tar', ['-tzf', basename(file)]);
  if (result.status !== 0) throw new Error(`tar failed on ${file}: ${result.stderr}`);
  return result.stdout
    .split(/\r?\n/)
    .filter((l) => l && !l.endsWith('/'))
    .map((l) => l.replace(/^package\//, ''));
}

/** @param {string} file @param {string} entry */
function readEntry(file, entry) {
  const result = run('tar', ['-xzOf', basename(file), `package/${entry}`]);
  if (result.status !== 0) throw new Error(`cannot read ${entry} from ${file}`);
  return result.stdout;
}

/**
 * @param {unknown} value `exports` field (or a subtree of it)
 * @returns {string[]} every file target (patterns kept as written)
 */
function exportTargets(value) {
  if (typeof value === 'string') return [value];
  if (value && typeof value === 'object') return Object.values(value).flatMap(exportTargets);
  return [];
}

/** @param {string} pattern a target like `./dist/components/*.css` */
function targetMatcher(pattern) {
  const body = pattern
    .replace(/^\.\//, '')
    .replace(/[.+?^${}()|[\]\\]/g, '\\$&')
    .replace(/\*/g, '.+');
  return new RegExp(`^${body}$`);
}

/** @returns {string[]} errors */
export function checkTarballs() {
  /** @type {string[]} */
  const errors = [];
  const packed = readPacked();
  const names = new Set(packed.map((p) => p.name));

  for (const p of packed) {
    const file = join(tarballs, p.file);
    /** @param {string} msg */
    const fail = (msg) => errors.push(`${p.name}: ${msg}`);

    const entries = listTarball(file);
    const allow = [
      ...COMMON,
      ...(ALLOW[/** @type {keyof typeof ALLOW} */ (p.name)] ?? [/^dist\//]),
    ];
    for (const entry of entries) {
      if (FORBIDDEN.some((re) => re.test(entry))) fail(`forbidden file in tarball: ${entry}`);
      else if (!allow.some((re) => re.test(entry))) fail(`file not in the allow-list: ${entry}`);
    }

    const manifest = JSON.parse(readEntry(file, 'package.json'));
    if (manifest.version !== p.version) fail(`packed version ${manifest.version} != ${p.version}`);
    if (JSON.stringify(manifest).includes('workspace:'))
      fail('packed package.json still contains "workspace:"');
    for (const field of ['dependencies', 'peerDependencies', 'optionalDependencies']) {
      for (const dep of Object.keys(manifest[field] ?? {})) {
        if (dep.startsWith('@tessen-ui/') && !names.has(dep))
          fail(`${field}.${dep} is not a packed package`);
      }
    }
    if (manifest.type !== 'module')
      fail('"type" must be "module" (ESM only, no CJS decision recorded)');
    if (!manifest.exports) fail('missing "exports"');
    for (const target of exportTargets(manifest.exports)) {
      const re = targetMatcher(target);
      if (!entries.some((e) => re.test(e)))
        fail(`exports target "${target}" is not in the tarball`);
    }

    const publint = run(process.execPath, [
      PUBLINT,
      'run',
      '--pack',
      'false',
      '--level',
      'suggestion',
      '--strict',
      basename(file),
    ]);
    if (publint.status !== 0) fail(`publint:\n${publint.stdout}${publint.stderr}`);

    // attw only understands JS/TS entrypoints: CSS, JSON and SVG subpaths are checked by publint
    // and by the consumer projects, so they are left out of its entrypoint list.
    const typed = Object.entries(manifest.exports ?? {})
      .filter(([, v]) => JSON.stringify(v).includes('"types"'))
      .map(([k]) => k);
    const hasTypes = typed.length > 0;
    if (hasTypes) {
      const attw = run(process.execPath, [
        ATTW,
        basename(file),
        '--entrypoints',
        ...typed,
        '--profile',
        'esm-only',
        '--no-emoji',
        '--no-color',
        '--format',
        'ascii',
      ]);
      if (attw.status !== 0) fail(`attw:\n${attw.stdout}${attw.stderr}`);
    }
    console.log(`checked ${p.name}: ${entries.length} files${hasTypes ? ', types' : ''}`);
  }
  return errors;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const errors = checkTarballs();
    if (errors.length > 0) {
      console.error(`tarball:check failed (${errors.length}):`);
      for (const e of errors) console.error(`  - ${e}`);
      process.exit(1);
    }
    console.log('tarball:check passed');
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  }
}
