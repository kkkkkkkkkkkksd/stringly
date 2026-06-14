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
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    // Длина ФАЙЛА: подталкиваем дробить большие компоненты/модули (KISS). Ширина строки —
    // отдельно у Prettier (printWidth: 100). Реестры/данные исключены в overrides ниже.
    'max-lines': ['warn', { max: 300, skipBlankLines: true, skipComments: true }],
    // импорт только «вниз» по слоям
    'boundaries/element-types': [
      'error',
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
  overrides: [
    {
      // Реестры/данные/тесты — естественно длинные (это не логика): моки, i18n-строки,
      // иконки-ассеты, тестовые файлы. Лимит длины файла к ним не применяем.
      files: [
        'src/mocks/**',
        'src/shared/resources/i18n/**',
        'src/shared/resources/assets/**',
        '**/*.test.{ts,tsx}',
      ],
      rules: { 'max-lines': 'off' },
    },
  ],
};
