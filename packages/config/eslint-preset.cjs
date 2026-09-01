/**
 * Préréglage ESLint partagé pour les apps du monorepo CO-CO-CO.
 * Chaque app l'étend et ajoute ses propres règles (ex. next/core-web-vitals).
 */
module.exports = {
  root: false,
  extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended', 'prettier'],
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  env: {
    es2022: true,
    node: true,
  },
  rules: {
    '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    '@typescript-eslint/consistent-type-imports': 'warn',
  },
};
