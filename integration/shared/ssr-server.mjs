// @ts-check
/**
 * Helpers for the SSR consumer projects (`integration/next`, `integration/nuxt`): start the
 * production server, fetch the server-rendered HTML, stop it. Node built-ins only.
 */
import { spawn, spawnSync } from 'node:child_process';

/**
 * @param {string} cwd project dir
 * @param {string} command
 * @param {string[]} args
 * @param {number} port
 * @param {Record<string, string>} [env]
 */
export async function startServer(cwd, command, args, port, env = {}) {
  const url = `http://127.0.0.1:${port}`;
  const busy = await fetch(url).then(
    () => true,
    () => false,
  );
  if (busy) throw new Error(`port ${port} is already in use: a stale server would answer instead`);
  const child = spawn(command, args, {
    cwd,
    env: {
      ...process.env,
      PORT: String(port),
      HOST: '127.0.0.1',
      NITRO_PORT: String(port),
      ...env,
    },
    stdio: ['ignore', 'pipe', 'pipe'],
    shell: process.platform === 'win32',
  });
  let output = '';
  child.stdout?.on('data', (d) => (output += d));
  child.stderr?.on('data', (d) => (output += d));
  const deadline = Date.now() + 60_000;
  for (;;) {
    if (child.exitCode !== null) throw new Error(`server exited early:\n${output}`);
    try {
      const res = await fetch(url);
      if (res.status < 500) break;
    } catch {
      /* not up yet */
    }
    if (Date.now() > deadline) {
      stopServer(child);
      throw new Error(`server did not start in 60 s:\n${output}`);
    }
    await new Promise((r) => setTimeout(r, 300));
  }
  return { url, child, logs: () => output };
}

/** @param {import('node:child_process').ChildProcess} child */
export function stopServer(child) {
  if (child.exitCode !== null || !child.pid) return;
  if (process.platform === 'win32') {
    // Synchronous: callers often `process.exit` right after, and the shell wrapper has children.
    spawnSync('taskkill', ['/pid', String(child.pid), '/T', '/F'], { stdio: 'ignore' });
  } else {
    child.kill('SIGTERM');
  }
}

/**
 * Assertions on the server-rendered HTML. Returns the list of problems (empty = fine).
 * @param {string} html
 */
export function checkServerHtml(html) {
  /** @type {string[]} */
  const problems = [];
  /** @type {[string, RegExp][]} */
  const must = [
    ['a Button rendered on the server', /class="[^"]*\bt-button\b/],
    ['the tablist', /role="tablist"/],
    ['the selected tab panel (defaultValue)', /Panel B/],
    ['the Select trigger with its default label', /Banana/],
    ['the Accordion item open on the server', /Open on the server/],
    ['the Progress bar', /role="progressbar"/],
    ['a stylesheet link', /<link[^>]+rel="stylesheet"/],
  ];
  for (const [what, re] of must) if (!re.test(html)) problems.push(`missing ${what}`);
  return problems;
}
