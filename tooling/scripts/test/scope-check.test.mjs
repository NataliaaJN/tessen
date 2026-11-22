// @ts-check
import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { after, describe, it } from 'node:test';
import { checkIntegrationLockfile, checkScope } from '../scope-check.mjs';

const config = {
  scope: '@tessen-ui',
  forbiddenScopes: ['@tessen'],
  forbiddenUnscopedNames: ['tessen'],
  workspaceRoots: ['packages'],
};

/** @type {string[]} */
const dirs = [];

/**
 * @param {Record<string, unknown>} rootPkg
 * @param {Record<string, Record<string, unknown>>} packages
 * @param {string} [lock]
 */
function fixture(rootPkg, packages, lock) {
  const root = mkdtempSync(join(tmpdir(), 'tessen-scope-'));
  dirs.push(root);
  writeFileSync(join(root, 'package.json'), JSON.stringify(rootPkg));
  for (const [dir, pkg] of Object.entries(packages)) {
    mkdirSync(join(root, 'packages', dir), { recursive: true });
    writeFileSync(join(root, 'packages', dir, 'package.json'), JSON.stringify(pkg));
  }
  if (lock) writeFileSync(join(root, 'pnpm-lock.yaml'), lock);
  return root;
}

const rootPkg = { name: 'tessen', private: true };
const core = { name: '@tessen-ui/core', private: true, version: '0.0.0' };

describe('checkScope', () => {
  after(() => dirs.forEach((d) => rmSync(d, { recursive: true, force: true })));

  it('accepts a well formed workspace', () => {
    const root = fixture(rootPkg, {
      core,
      vue: { ...core, name: '@tessen-ui/vue', dependencies: { '@tessen-ui/core': 'workspace:*' } },
    });
    assert.deepEqual(checkScope(root, config), []);
  });

  it('rejects foreign scopes, public packages and wrong versions', () => {
    const root = fixture(rootPkg, { core: { name: '@tessen/core', version: '1.0.0' } });
    const errors = checkScope(root, config).join('\n');
    assert.match(errors, /must start with "@tessen-ui\/"/);
    assert.match(errors, /"private" must be true/);
    assert.match(errors, /"version" must be "0.0.0"/);
  });

  it('requires workspace:* for internal dependencies', () => {
    const root = fixture(rootPkg, {
      vue: { ...core, name: '@tessen-ui/vue', dependencies: { '@tessen-ui/core': '^0.0.0' } },
    });
    assert.match(checkScope(root, config).join('\n'), /must be "workspace:\*"/);
  });

  it('forbids the third-party scope and the unscoped package as dependencies', () => {
    const root = fixture(rootPkg, {
      core: { ...core, dependencies: { '@tessen/type-gen': '1.0.0', tessen: '0.0.5' } },
    });
    const errors = checkScope(root, config).join('\n');
    assert.match(errors, /forbidden scope/);
    assert.match(errors, /forbidden unscoped package/);
  });

  it('flags internal packages resolved from the registry in the lockfile', () => {
    const lock = [
      'importers:',
      '  .:',
      '    dependencies:',
      "      '@tessen-ui/core':",
      '        version: link:packages/core',
      '',
      'packages:',
      '',
      "  '@tessen-ui/core@1.0.0':",
      '    resolution: {integrity: sha512-x}',
      '',
    ].join('\n');
    const root = fixture(rootPkg, { core }, lock);
    assert.match(checkScope(root, config).join('\n'), /resolved from the registry/);
  });

  it('accepts a lockfile that only links workspace packages', () => {
    const lock = [
      'importers:',
      '  .:',
      '    dependencies:',
      "      '@tessen-ui/core':",
      '        version: link:packages/core',
      '',
      'packages:',
      '',
      "  'left-pad@1.3.0':",
      '    resolution: {integrity: sha512-x}',
      '',
    ].join('\n');
    const root = fixture(rootPkg, { core }, lock);
    assert.deepEqual(checkScope(root, config), []);
  });
});

describe('checkIntegrationLockfile', () => {
  /** @param {string[]} keys package keys to put under `packages:` */
  function lockWith(keys) {
    const root = fixture(rootPkg, { core });
    const lines = ['packages:', ''];
    for (const k of keys) lines.push(`  '${k}':`, '    resolution: {integrity: sha512-x}', '');
    writeFileSync(join(root, 'pnpm-lock.yaml'), lines.join('\n'));
    return join(root, 'pnpm-lock.yaml');
  }

  it('accepts internal packages resolved from local tarballs', () => {
    const lock = lockWith([
      '@tessen-ui/core@file:../../.tarballs/tessen-ui-core-0.0.0-local.x.1.tgz',
      'left-pad@1.3.0',
    ]);
    assert.deepEqual(checkIntegrationLockfile(lock, config), []);
  });

  it('flags an internal package resolved from the registry', () => {
    const lock = lockWith(['@tessen-ui/core@1.0.0']);
    assert.match(
      checkIntegrationLockfile(lock, config).join('\n'),
      /not resolved from a local tarball/,
    );
  });

  it('flags a lockfile without any internal package (overrides not applied)', () => {
    const lock = lockWith(['left-pad@1.3.0']);
    assert.match(checkIntegrationLockfile(lock, config).join('\n'), /no internal package found/);
  });
});
