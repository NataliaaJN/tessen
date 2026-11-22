export default defineNuxtConfig({
  ssr: true,
  compatibilityDate: '2026-11-01',
  devtools: { enabled: false },
  telemetry: false,
  build: { transpile: ['@tessen-ui/spike-zag-s2'] },
});
