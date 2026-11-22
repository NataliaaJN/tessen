import react from '@astrojs/react';
import vue from '@astrojs/vue';
import { defineConfig } from 'astro/config';

// Static site, local only (ADR 0014): no `site`, no adapter, nothing to deploy.
export default defineConfig({
  output: 'static',
  trailingSlash: 'always',
  server: { port: 4321 },
  devToolbar: { enabled: false },
  integrations: [react(), vue()],
});
