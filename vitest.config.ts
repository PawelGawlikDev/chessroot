import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig(({ mode }) => ({
  resolve: {
    alias: {
      '@model': resolve(__dirname, 'src/app/model'),
      '@services': resolve(__dirname, 'src/app/services'),
      '@utils': resolve(__dirname, 'src/app/utils'),
      '@achievements': resolve(__dirname, 'src/app/achievements'),
      '@enums': resolve(__dirname, 'src/app/enums'),
      '@state': resolve(__dirname, 'src/app/state'),
      '@components': resolve(__dirname, 'src/app/components'),
      '@pipes': resolve(__dirname, 'src/app/pipes'),
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
