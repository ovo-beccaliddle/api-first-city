import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['**/*.test.ts'],
    exclude: ['node_modules', 'dist'],
    root: '.',
    globals: true,
    setupFiles: ['./test/vitest.setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      exclude: ['test/__mocks__/**', 'test/vitest.setup.ts', 'test/jest.setup.ts'],
      thresholds: {
        statements: 80,
        branches: 75,
        functions: 80,
        lines: 80,
      },
    },
    mockReset: true,
  },
  resolve: {
    alias: {
      '@city-services/common': path.resolve(__dirname, './test/__mocks__/@city-services/common.ts'),
    },
  },
});
