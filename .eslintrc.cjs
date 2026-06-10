/* ESLint (классический конфиг, стабильный на v8).
   Кроме базовых правил — eslint-plugin-boundaries форсит слои:
   app → pages → features → entities → shared (импорт только «вниз»). */
module.exports = {
  root: true,
  env: { browser: true, es2020: true },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react-hooks/recommended',
  ],
  ignorePatterns: ['dist', 'node_modules', 'public/mockServiceWorker.js', '*.config.*'],
  parser: '@typescript-eslint/parser',
  plugins: ['react-refresh', 'boundaries'],
  settings: {
    'boundaries/elements': [
      { type: 'app', pattern: 'src/app/*' },
      { type: 'pages', pattern: 'src/pages/*' },
      { type: 'features', pattern: 'src/features/*' },
      { type: 'entities', pattern: 'src/entities/*' },
      { type: 'shared', pattern: 'src/shared/*' },
    ],
  },
  rules: {
    'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    // импорт только «вниз» по слоям
    'boundaries/element-types': [
      'warn',
      {
        default: 'disallow',
        rules: [
          { from: 'app', allow: ['pages', 'features', 'entities', 'shared'] },
          { from: 'pages', allow: ['features', 'entities', 'shared'] },
          { from: 'features', allow: ['entities', 'shared'] },
          { from: 'entities', allow: ['shared'] },
          { from: 'shared', allow: ['shared'] },
        ],
      },
    ],
  },
};
