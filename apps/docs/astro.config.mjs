import react from '@astrojs/react';
import vue from '@astrojs/vue';
import { defineConfig } from 'astro/config';
import { existsSync, readFileSync, statSync } from 'node:fs';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
  '.map': 'application/json; charset=utf-8',
};

// In `astro dev` the two SPAs (built with their own base path) are served from their dist folders,
// so /studio/ and /playground/ work in dev just like in the static build.
function serveApps() {
  const apps = [
    { prefix: '/studio/', dir: fileURLToPath(new URL('../theme-studio/dist/', import.meta.url)) },
    { prefix: '/playground/', dir: fileURLToPath(new URL('../playground/dist/', import.meta.url)) },
  ];
  return {
    name: 'tessen-serve-apps',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const url = (req.url ?? '').split('?')[0];
        const app = apps.find(
          (a) => url.startsWith(a.prefix) || url === a.prefix.slice(0, -1),
        );
        if (!app) return next();
        if (url === app.prefix.slice(0, -1)) {
          res.statusCode = 301;
          res.setHeader('Location', app.prefix);
          return res.end();
        }
        let rel = decodeURIComponent(url.slice(app.prefix.length));
        if (rel === '' || rel.endsWith('/')) rel += 'index.html';
        const file = normalize(join(app.dir, rel));
        if (!file.startsWith(app.dir) || !existsSync(file) || !statSync(file).isFile()) {
          return next();
        }
        res.setHeader('Content-Type', MIME[extname(file)] ?? 'application/octet-stream');
        res.end(readFileSync(file));
      });
    },
  };
}

// Static site, local only (ADR 0014): no `site`, no adapter, nothing to deploy.
export default defineConfig({
  output: 'static',
  trailingSlash: 'always',
  server: { port: 4321 },
  devToolbar: { enabled: false },
  integrations: [react(), vue()],
  vite: { plugins: [serveApps()] },
});
