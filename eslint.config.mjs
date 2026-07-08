import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import astro from 'eslint-plugin-astro';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import globals from 'globals';

// Lint policy — docs/PROJECT_BIBLE.md §30 (TypeScript strict + linters as
// blocking CI) and §20 (accessibility, jsx-a11y). Flat config (ESLint 9).
export default tseslint.config(
  {
    ignores: [
      'dist/',
      '.astro/',
      'node_modules/',
      'coverage/',
      'playwright-report/',
      'test-results/',
      '.lighthouseci/',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  // Astro components (.astro) — includes its own jsx-a11y recommended rules.
  ...astro.configs.recommended,
  ...astro.configs['jsx-a11y-recommended'],
  // React islands (.tsx/.jsx) — accessibility rules for interactive components.
  {
    files: ['**/*.{jsx,tsx}'],
    ...jsxA11y.flatConfigs.recommended,
  },
  // Project-wide rule tuning.
  {
    languageOptions: {
      globals: { ...globals.browser, ...globals.node },
    },
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/consistent-type-imports': 'error',
      'no-console': ['warn', { allow: ['warn', 'error'] }],
    },
  },
  // Config files and tests may use devDependencies / node globals freely.
  {
    files: ['**/*.config.{js,mjs,ts}', 'tests/**/*.{ts,tsx}'],
    languageOptions: { globals: { ...globals.node } },
    rules: { 'no-console': 'off' },
  },
  // Ambient type declarations use Astro's triple-slash reference convention.
  {
    files: ['**/*.d.ts'],
    rules: { '@typescript-eslint/triple-slash-reference': 'off' },
  },
);
