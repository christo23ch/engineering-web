// Formatting policy — docs/PROJECT_BIBLE.md §30 (Prettier, enforced in CI).
/** @type {import("prettier").Config} */
export default {
  printWidth: 80,
  tabWidth: 2,
  singleQuote: true,
  semi: true,
  trailingComma: 'all',
  bracketSpacing: true,
  plugins: ['prettier-plugin-astro', 'prettier-plugin-tailwindcss'],
  overrides: [
    {
      files: '*.astro',
      options: { parser: 'astro' },
    },
  ],
};
