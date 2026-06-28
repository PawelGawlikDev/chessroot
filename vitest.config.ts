import { defineConfig } from 'vite';
import angular from '@analogjs/vite-plugin-angular';
import { resolve } from 'path';

export default defineConfig(({ mode }) => ({
  plugins: [angular()],
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
    setupFiles: ['src/test-setup.ts'],
    environment: 'jsdom',
    include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    reporters: ['default'],
    coverage: {
      provider: 'v8',
      include: [
        'src/app/components/**/*.ts',
        'src/app/utils/**/*.ts',
        'src/app/achievements/**/*.ts',
      ],
      exclude: [
        'src/app/components/**/index.ts',
        'src/app/utils/**/index.ts',
        'src/app/achievements/**/index.ts',
        'src/app/achievements/**/types.ts',
        'src/app/components/**/*.spec.ts',
        'src/app/components/**/*.test.ts',
        'src/app/**/*.model.ts',
        'src/app/components/**/*.stories.ts',
        'src/app/components/**/__tests__/**',
        'src/app/components/**/__stories__/**',
        'src/app/components/**/*.d.ts',
        'src/app/utils/**/*.d.ts',
        'src/app/components/chess-board/chess-board.component.ts',
        'src/app/components/+opening-explorer/opening-explorer.component.ts',
        'src/app/components/+tools/tools.component.ts',
        'src/app/components/+tools/models/**',
        'src/app/components/bar-chart/bar-chart.component.ts',
      ],
      reporter: ['text', 'html', 'json', 'lcov'],
      reportsDirectory: 'coverage',
    },
  },
}));
