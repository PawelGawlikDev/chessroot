import tseslint from 'typescript-eslint';
import unusedImports from 'eslint-plugin-unused-imports';
import importX from 'eslint-plugin-import-x';
import prettier from 'eslint-plugin-prettier';
import skipFormatting from 'eslint-config-prettier';

const internalAliases = [
  'model',
  'services',
  'utils',
  'achievements',
  'enums',
  'state',
  'components',
  'pipes',
];
const internalPathGroups = internalAliases.flatMap((name) => [
  { pattern: `@${name}`, group: 'internal' },
  { pattern: `@${name}/*`, group: 'internal' },
]);

export default tseslint.config(
  skipFormatting,
  {
    ignores: [
      '.yarn/**',
      'dist/**',
      'node_modules/**',
      '**/stockfish/**',
      '.angular/**',
      '.pnp.cjs',
      '.pnp.loader.mjs',
      'coverage',
      'worker.ts',
      'worker-configuration.d.ts',
      '.agents/**',
      '.opencode/**',
    ],
  },
  {
    files: ['src/**/*.ts'],
    languageOptions: {
      parser: tseslint.parser,
    },
    plugins: {
      '@typescript-eslint': tseslint.plugin,
      'unused-imports': unusedImports,
      'import-x': importX,
      prettier,
    },
    rules: {
      '@typescript-eslint/explicit-member-accessibility': [
        'error',
        { overrides: { constructors: 'off' } },
      ],
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': 'off',
      'unused-imports/no-unused-imports': 'error',
      'unused-imports/no-unused-vars': [
        'error',
        { vars: 'all', args: 'after-used', ignoreRestSiblings: true },
      ],
      'import-x/order': [
        'error',
        {
          groups: [['builtin', 'external'], 'internal', ['parent', 'sibling', 'index']],
          pathGroups: internalPathGroups,
          pathGroupsExcludedImportTypes: ['builtin', 'object'],
          alphabetize: { order: 'asc', caseInsensitive: true },
          'newlines-between': 'always',
        },
      ],
      'prettier/prettier': 'error',
    },
  },
);
