// @ts-check
/**
 * Guards the internal package namespace (ADR 0015).
 *
 *  1. Every workspace package is named inside the declared scope, is `private`
 *     and has version `0.0.0` (nothing can be published by accident).
 *  2. Internal dependencies always use `workspace:*`.
 *  3. The unscoped `tessen` package and the third-party `@tessen` scope are
 *     never depended upon (dependency confusion).
 *  4. `pnpm-lock.yaml` never resolves an internal package from the registry.
 *
 * To rename the scope, change `scope.json` and run `pnpm scope:check` until
 * it is green again; this file is the only place that knows the rules.
 */
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));

/**
 * @typedef {object} ScopeConfig
 * @property {string} scope
 * @property {string[]} forbiddenScopes
 * @property {string[]} forbiddenUnscopedNames
 * @property {string[]} workspaceRoots
 */

/** @param {string} file */
function readJson(file) {
  return JSON.parse(readFileSync(file, 'utf8'));
}

/**
 * @param {string} rootDir
 * @param {string[]} workspaceRoots
 * @returns {string[]} absolute paths of every workspace `package.json`
 */
function findManifests(rootDir, workspaceRoots) {
  /** @type {string[]} */
  const manifests = [];
  for (const base of workspaceRoots) {
    const baseDir = join(rootDir, base);
    if (!existsSync(baseDir)) continue;
    for (const entry of readdirSync(baseDir)) {
      const dir = join(baseDir, entry);
      if (statSync(dir).isDirectory() && existsSync(join(dir, 'package.json'))) {
        manifests.push(join(dir, 'package.json'));
      }
    }
  }
  return manifests;
}

/** @param {string} value */
function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

const DEP_FIELDS = ['dependencies', 'devDependencies', 'peerDependencies', 'optionalDependencies'];

/**
 * @param {string} rootDir repository root
 * @param {ScopeConfig} [config]
 * @returns {string[]} human readable violations (empty when everything is fine)
 */
export function checkScope(rootDir, config) {
  const cfg = config ?? /** @type {ScopeConfig} */ (readJson(join(here, 'scope.json')));
  /** @type {string[]} */
  const errors = [];

  const rootManifest = join(rootDir, 'package.json');
  const manifests = [rootManifest, ...findManifests(rootDir, cfg.workspaceRoots)];

  for (const manifestPath of manifests) {
    const rel = relative(rootDir, manifestPath).replaceAll('\\', '/');
    const isRoot = manifestPath === rootManifest;
    const pkg = readJson(manifestPath);

    if (pkg.private !== true) errors.push(`${rel}: "private" must be true`);
    if (!isRoot) {
      if (typeof pkg.name !== 'string' || !pkg.name.startsWith(`${cfg.scope}/`)) {
        errors.push(`${rel}: name "${pkg.name}" must start with "${cfg.scope}/"`);
      }
      if (pkg.version !== '0.0.0') errors.push(`${rel}: "version" must be "0.0.0"`);
    }

    for (const field of DEP_FIELDS) {
      /** @type {Record<string, string>} */
      const deps = pkg[field] ?? {};
      for (const [name, range] of Object.entries(deps)) {
        if (name.startsWith(`${cfg.scope}/`) && range !== 'workspace:*') {
          errors.push(`${rel}: ${field}.${name} must be "workspace:*" (found "${range}")`);
        }
        if (cfg.forbiddenScopes.some((s) => name.startsWith(`${s}/`))) {
          errors.push(`${rel}: ${field}.${name} uses a forbidden scope`);
        }
        if (cfg.forbiddenUnscopedNames.includes(name)) {
          errors.push(`${rel}: ${field}.${name} is a forbidden unscoped package`);
        }
      }
    }
  }

  const lockPath = join(rootDir, 'pnpm-lock.yaml');
  if (existsSync(lockPath)) {
    const scopes = [cfg.scope, ...cfg.forbiddenScopes].map(escapeRegExp).join('|');
    const names = cfg.forbiddenUnscopedNames.map(escapeRegExp).join('|');
    // A registry entry is a key of `packages:` / `snapshots:` (2-space indent).
    const registryKey = new RegExp(`^ {2}'?(?:(?:${scopes})/|(?:${names})@)`);
    let section = '';
    for (const line of readFileSync(lockPath, 'utf8').split(/\r?\n/)) {
      if (/^\S/.test(line)) section = line.replace(/:.*$/, '');
      if ((section === 'packages' || section === 'snapshots') && registryKey.test(line)) {
        errors.push(`pnpm-lock.yaml: "${line.trim()}" is resolved from the registry`);
      }
    }
  }

  return errors;
}

/**
 * Lockfile of an `integration/*` project (ADR 0016): every internal package must be
 * resolved from a local tarball (`@scope/name@file:...`), never from the registry.
 *
 * @param {string} lockPath absolute path of the project's `pnpm-lock.yaml`
 * @param {ScopeConfig} [config]
 * @returns {string[]} violations (empty when fine)
 */
export function checkIntegrationLockfile(lockPath, config) {
  const cfg = config ?? /** @type {ScopeConfig} */ (readJson(join(here, 'scope.json')));
  if (!existsSync(lockPath)) return [`${lockPath}: lockfile not found`];
  const scopes = [cfg.scope, ...cfg.forbiddenScopes].map(escapeRegExp).join('|');
  const names = cfg.forbiddenUnscopedNames.map(escapeRegExp).join('|');
  const internalKey = new RegExp(`^ {2}'?(?:(?:${scopes})/|(?:${names})@)`);
  /** @type {string[]} */
  const errors = [];
  let section = '';
  let internalEntries = 0;
  for (const line of readFileSync(lockPath, 'utf8').split(/\r?\n/)) {
    if (/^\S/.test(line)) section = line.replace(/:.*$/, '');
    if ((section === 'packages' || section === 'snapshots') && internalKey.test(line)) {
      if (section === 'packages') internalEntries++;
      if (!/@file:/.test(line)) {
        errors.push(`pnpm-lock.yaml: "${line.trim()}" is not resolved from a local tarball`);
      }
    }
  }
  if (internalEntries === 0)
    errors.push('pnpm-lock.yaml: no internal package found (overrides not applied?)');
  return errors;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const repoRoot = resolve(here, '..', '..');
  const errors = checkScope(repoRoot);
  const integrationDir = join(repoRoot, 'integration');
  if (existsSync(integrationDir)) {
    for (const entry of readdirSync(integrationDir)) {
      const lock = join(integrationDir, entry, 'pnpm-lock.yaml');
      if (existsSync(lock)) {
        for (const e of checkIntegrationLockfile(lock)) errors.push(`integration/${entry}: ${e}`);
      }
    }
  }
  if (errors.length > 0) {
    console.error(`scope:check failed (${errors.length}):`);
    for (const e of errors) console.error(`  - ${e}`);
    process.exit(1);
  }
  console.log('scope:check passed');
}
