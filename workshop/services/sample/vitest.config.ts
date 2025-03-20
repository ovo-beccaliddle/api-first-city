import { defineConfig } from 'vitest/config';
import path from 'path';
import swc from 'unplugin-swc';

export default defineConfig({
  plugins: [
    swc.vite({
      jsc: {
        target: 'es2020',
        parser: {
          syntax: 'typescript',
          decorators: true,
        },
        transform: {
          legacyDecorator: true,
          decoratorMetadata: true,
        },
      },
    }),
  ],
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['reflect-metadata', 'src/__tests__/setup.ts'],
    
    include: ['src/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
    },
    testTimeout: 60000,     // Increase timeout for slow database operations
    hookTimeout: 60000,     // Increase timeout for hooks
    teardownTimeout: 30000, // Allow time for db cleanup
    
    // Configure sequence for tests
    sequence: {
      hooks: 'stack'        // Run hooks in a stack (parent first)
    },
    
    onConsoleLog(log, type) {
      if (log.includes('database not available') || log.includes('skipping tests')) {
        return false;
      }
      return true;
    },
    
    // Force truly sequential test execution - no parallelism at all
    poolOptions: {
      threads: {
        singleThread: true
      }
    },
    
    // Disable test file isolation to prevent multiple db connections
    isolate: false,
    
    // Run test files one at a time
    fileParallelism: false
  },
  resolve: {
    alias: {
      '@city-services/service-registry': path.resolve(__dirname, '../../infrastructure/service-registry/src')
    }
  }
}); 