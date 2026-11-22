// @ts-check
/**
 * `pnpm pack:all` - packs every package in `packages/` into `.tarballs/` (ADR 0016).
 *
 * Each run stamps a unique prerelease version (`0.0.0-local.<sha>.<time>`) so the
 * pnpm store can never serve a stale tarball with the same version. The version is
 * written to each `package.json` only while packing and always restored afterwards.
 * `pnpm pack` rewrites `workspace:*` to that concrete version.
 *
 * Output: `.tarballs/*.tgz` and `.tarballs/manifest.json` (name -> version, file),
 * which the integration scripts read to generate the `overrides`.
 * Nothing is published: this only creates local files.
 */
import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '..', '..');
const tarballs = join(root, '.tarballs');

/**
 * @param {string} cmd
 * @param {string[]} args
 * @param {string} cwd
 */
function run(cmd, args, cwd) {
  const result = spawnSync(cmd, args, {
    cwd,
    encoding: 'utf8',
    shell: process.platform === 'win32',
  });
  if (result.status !== 0) {
    throw new Error(
      `${cmd} ${args.join(' ')} (in ${cwd}) failed:\n${result.stdout}${result.stderr}`,
    );
  }
  return result.stdout.trim();
}

/** @returns {string} */
function shortSha() {
  try {
    return run('git', ['rev-parse', '--short', 'HEAD'], root);
  } catch {
    return 'nogit';
  }
}

/**
 * @typedef {{ name: string; version: string; file: string; dir: string }} PackedPackage
 */

/** @returns {PackedPackage[]} */
export function packAll() {
  const packagesDir = join(root, 'packages');
  const dirs = readdirSync(packagesDir).filter((d) =>
    existsSync(join(packagesDir, d, 'package.json')),
  );
  // `--base 0.1.0-alpha` stamps the alpha line (0.1.0-alpha.local.<sha>.<time>); packages stay at 0.0.0.
  const baseFlag = process.argv.indexOf('--base');
  const base = baseFlag >= 0 ? (process.argv[baseFlag + 1] ?? '0.0.0') : '0.0.0';
  const joiner = base.includes('-') ? '.' : '-';
  const version = `${base}${joiner}local.${shortSha()}.${Math.floor(Date.now() / 1000)}`;

  rmSync(tarballs, { recursive: true, force: true });
  mkdirSync(tarballs, { recursive: true });

  /** @type {Map<string, string>} manifest path -> original text */
  const originals = new Map();
  /** @type {PackedPackage[]} */
  const packed = [];
  try {
    for (const d of dirs) {
      const manifestPath = join(packagesDir, d, 'package.json');
      const text = readFileSync(manifestPath, 'utf8');
      if (!existsSync(join(packagesDir, d, 'dist'))) {
        throw new Error(`packages/${d} has no dist/: run "pnpm build" before "pnpm pack:all"`);
      }
      originals.set(manifestPath, text);
      writeFileSync(manifestPath, JSON.stringify({ ...JSON.parse(text), version }, null, 2) + '\n');
    }
    for (const d of dirs) {
      const dir = join(packagesDir, d);
      const name = JSON.parse(readFileSync(join(dir, 'package.json'), 'utf8')).name;
      run('pnpm', ['pack', '--pack-destination', tarballs], dir);
      const file = `${name.replace('@', '').replace('/', '-')}-${version}.tgz`;
      if (!existsSync(join(tarballs, file)))
        throw new Error(`expected tarball ${file} was not created`);
      packed.push({ name, version, file, dir: `packages/${d}` });
    }
  } finally {
    for (const [path, text] of originals) writeFileSync(path, text);
  }

  writeFileSync(join(tarballs, 'manifest.json'), JSON.stringify(packed, null, 2) + '\n');
  return packed;
}

/** @returns {PackedPackage[]} */
export function readPacked() {
  const file = join(tarballs, 'manifest.json');
  if (!existsSync(file))
    throw new Error('.tarballs/manifest.json not found: run "pnpm pack:all" first');
  return JSON.parse(readFileSync(file, 'utf8'));
}

export { root, tarballs };

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const packed = packAll();
    for (const p of packed) console.log(`packed ${p.name}@${p.version} -> .tarballs/${p.file}`);
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  }
}
