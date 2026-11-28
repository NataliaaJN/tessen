import { base } from '@tessen-ui/eslint-config';

export default [
  ...base,
  {
    // Plain browser scripts and a Node script that evaluates code in the page.
    files: ['apps/*/public/*.js', 'apps/shared/*.js', 'tooling/e2e/docs-smoke.mjs'],
    languageOptions: {
      globals: {
        document: 'readonly',
        window: 'readonly',
        location: 'readonly',
        history: 'readonly',
        localStorage: 'readonly',
        fetch: 'readonly',
        URL: 'readonly',
      },
    },
  },
  {
    files: ['**/*.cjs'],
    languageOptions: { sourceType: 'commonjs' },
    rules: { '@typescript-eslint/no-require-imports': 'off' },
  },
];
