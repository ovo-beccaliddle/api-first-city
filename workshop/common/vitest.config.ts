import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['**/__tests__/**/*.test.ts'],
    exclude: ['**/node_modules/**', '**/dist/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['**/node_modules/**', '**/dist/**', '**/__tests__/**', '**/*.d.ts'],
    },
    setupFiles: [path.resolve(__dirname, './__tests__/setup.ts')],
  },
  resolve: {
    alias: {
      '@city-services/common': path.resolve(__dirname),
    },
  },
});
