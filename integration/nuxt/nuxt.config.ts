// No aliases and no `build.transpile` on purpose: the packed tarballs must work as published.
export default defineNuxtConfig({
  compatibilityDate: '2026-11-01',
  css: ['@tessen-ui/styles/index.css', '@tessen-ui/motion/motion.css'],
  telemetry: false,
  devtools: { enabled: false },
});
