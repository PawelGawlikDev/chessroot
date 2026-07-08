import tseslint from 'typescript-eslint';
import unusedImports from 'eslint-plugin-unused-imports';
import prettier from 'eslint-plugin-prettier';
import skipFormatting from 'eslint-config-prettier';

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
      'prettier/prettier': 'error',
    },
  },
);
