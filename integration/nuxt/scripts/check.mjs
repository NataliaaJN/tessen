// @ts-check
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { checkResolution, report } from '../../shared/consumer-checks.mjs';
import { checkServerHtml, startServer, stopServer } from '../../shared/ssr-server.mjs';

const cwd = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const server = await startServer(cwd, 'node', ['.output/server/index.mjs'], 3412);
let problems = [];
try {
  const res = await fetch(server.url);
  const html = await res.text();
  if (res.status !== 200) problems.push(`GET / answered ${res.status}`);
  problems.push(...checkServerHtml(html));
  if (/Opened on load/.test(html))
    problems.push('the Dialog portal content must not be server-rendered');
} finally {
  stopServer(server.child);
}
report('nuxt consumer checks', [...checkResolution(cwd, ['@tessen-ui/vue']), ...problems]);
