// @ts-check
/**
 * `pnpm integration:test` - runs `pnpm test` (typecheck + build + consumer checks) in every
 * `integration/*` project already installed from the tarballs (ADR 0016).
 */
import { spawnSync } from 'node:child_process';
import { relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import { integrationProjects } from './integration-install.mjs';
import { root } from './pack-all.mjs';

function main() {
  const failed = [];
  for (const dir of integrationProjects()) {
    const name = relative(root, dir).replaceAll('\\', '/');
    console.log(`\n== ${name}`);
    const result = spawnSync('pnpm', ['test'], {
      cwd: dir,
      stdio: 'inherit',
      shell: process.platform === 'win32',
    });
    if (result.status !== 0) failed.push(name);
  }
  if (failed.length > 0) {
    console.error(`\nintegration:test failed: ${failed.join(', ')}`);
    process.exit(1);
  }
  console.log('\nintegration:test passed');
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
