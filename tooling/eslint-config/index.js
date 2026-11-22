import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';

/**
 * Base flat config shared by every workspace package.
 * Framework-specific rules (Vue, React) are added by the packages that need them.
 */
export const base = tseslint.config(
  {
    ignores: [
      '**/dist/**',
      '**/.turbo/**',
      '**/node_modules/**',
      // Output of the Next/Nuxt fixtures in spikes/.
      '**/.next/**',
      '**/.nuxt/**',
      // Astro's generated types and the docs data generated from the contracts.
      '**/.astro/**',
      'apps/docs/src/generated/**',
      '**/.output/**',
      '**/next-env.d.ts',
      '.tarballs/**',
      'docs/**',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 2023,
      globals: { ...globals.node },
    },
    rules: {
      '@typescript-eslint/consistent-type-imports': 'error',
      eqeqeq: ['error', 'always'],
    },
  },
);

export default base;
