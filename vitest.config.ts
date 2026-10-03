import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig(({ mode }) => ({
  resolve: {
    alias: {
      '@model': resolve(import.meta.dirname, 'src/app/model'),
      '@services': resolve(import.meta.dirname, 'src/app/services'),
      '@utils': resolve(import.meta.dirname, 'src/app/utils'),
      '@achievements': resolve(import.meta.dirname, 'src/app/achievements'),
      '@enums': resolve(import.meta.dirname, 'src/app/enums'),
      '@state': resolve(import.meta.dirname, 'src/app/state'),
      '@components': resolve(import.meta.dirname, 'src/app/components'),
      '@pipes': resolve(import.meta.dirname, 'src/app/pipes'),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    server: {
      deps: {
        inline: ['jszip', 'ngx-chessground'],
      },
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'text-summary'],
      exclude: [
        '**/*.html',
        '**/*.d.ts',
        '**/model/**',
        '**/enums/**',
        '**/state/actions/**',
        '**/state/selectors/**',
        '**/index.ts',
        '**/types.ts',
        '**/*.spec.ts',
        '**/*.test.ts',
        '**/test/**',
        '**/__tests__/**',
      ],
    },
  },
}));
