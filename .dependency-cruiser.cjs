/**
 * Architectural boundaries of the monorepo.
 * Source of truth for the rules: docs/architecture/dependency-rules.md
 * (ADR 0013). Rules for directories that do not exist yet (apps/, packages/*)
 * are already active; they simply have nothing to check until code appears.
 *
 * @type {import('dependency-cruiser').IConfiguration}
 */
module.exports = {
  forbidden: [
    { name: 'no-circular', severity: 'error', from: {}, to: { circular: true } },

    // Rules 5 and 6: nothing in packages/ depends on apps/.
    {
      name: 'packages-not-import-apps',
      severity: 'error',
      from: { path: '^packages/' },
      to: { path: '^apps/' },
    },
    {
      name: 'nothing-imports-tooling-or-integration',
      severity: 'error',
      from: { pathNot: '^(tooling|integration)/' },
      to: { path: '^(tooling|integration)/' },
    },

    // Vue and React implementations never import each other.
    {
      name: 'vue-not-import-react',
      severity: 'error',
      from: { path: '^packages/vue/' },
      to: { path: '^packages/react/' },
    },
    {
      name: 'react-not-import-vue',
      severity: 'error',
      from: { path: '^packages/react/' },
      to: { path: '^packages/vue/' },
    },

    // Foundations are free of UI frameworks and of the behavior engine.
    {
      name: 'foundations-framework-free',
      severity: 'error',
      from: { path: '^packages/(tokens|theme|styles|core|motion)/src' },
      to: { path: 'node_modules/(vue|@vue|react|react-dom|@zag-js)/' },
    },

    // Sibling components are reached through their index only.
    {
      name: 'components-sibling-index-only',
      severity: 'error',
      from: { path: '^packages/(vue|react)/src/components/([^/]+)/' },
      to: {
        path: '^packages/$1/src/components/[^/]+/.+',
        pathNot: [
          '^packages/$1/src/components/$2/',
          '^packages/$1/src/components/[^/]+/index\\.ts$',
        ],
      },
    },
    {
      name: 'internal-not-exported',
      severity: 'error',
      from: { path: '^packages/(vue|react)/src/index\\.ts$' },
      to: { path: '^packages/$1/src/internal/' },
    },

    // Apps: pages / features / shared (feature-first).
    {
      name: 'features-not-import-pages-or-app',
      severity: 'error',
      from: { path: '^apps/([^/]+)/src/features/' },
      to: { path: '^apps/$1/src/(pages|app)/' },
    },
    {
      name: 'shared-is-a-leaf',
      severity: 'error',
      from: { path: '^apps/([^/]+)/src/shared/' },
      to: { path: '^apps/$1/src/(features|pages|app)/' },
    },
    {
      name: 'feature-public-api-only',
      severity: 'error',
      from: { path: '^apps/([^/]+)/src/(pages|app)/' },
      to: {
        path: '^apps/$1/src/features/[^/]+/.+',
        pathNot: '^apps/$1/src/features/[^/]+/index\\.(ts|tsx|vue)$',
      },
    },
    {
      name: 'no-cross-feature',
      severity: 'error',
      from: { path: '^apps/([^/]+)/src/features/([^/]+)/' },
      to: { path: '^apps/$1/src/features/', pathNot: '^apps/$1/src/features/$2/' },
    },

    // Apps and integration projects consume packages through their public entry only.
    {
      name: 'apps-use-public-entry-only',
      severity: 'error',
      from: { path: '^(apps|integration)/' },
      to: { path: '^packages/[^/]+/src/' },
    },
  ],
  options: {
    doNotFollow: { path: 'node_modules' },
    tsPreCompilationDeps: true,
    tsConfig: { fileName: 'tsconfig.json' },
    enhancedResolveOptions: { exportsFields: ['exports'], conditionNames: ['import', 'types'] },
    exclude: { path: '(\\.test\\.|\\.stories\\.|/dist/)' },
  },
};
