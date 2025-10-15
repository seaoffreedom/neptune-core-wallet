import { resolve } from 'node:path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Test environment
    environment: 'jsdom',

    // Global test setup
    setupFiles: ['./src/test/setup.ts'],

    // Global test configuration
    globals: true,

    // Test file patterns
    include: [
      'src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
      'tests/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
    ],

    // Exclude patterns
    exclude: [
      'node_modules',
      'dist',
      'out',
      'build',
      '**/*.d.ts',
      'src/test/**/*',
      'tests/e2e/**/*',
    ],

    // Coverage configuration
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      reportsDirectory: './coverage',
      include: ['src/**/*.{js,ts,jsx,tsx}'],
      exclude: [
        'src/**/*.d.ts',
        'src/**/*.test.{js,ts,jsx,tsx}',
        'src/**/*.spec.{js,ts,jsx,tsx}',
        'src/test/**/*',
        'src/main.ts',
        'src/renderer/main.tsx',
        'src/preload/index.ts',
        'src/routeTree.gen.ts',
        'src/**/*.config.{js,ts}',
        'src/**/index.{js,ts}',
      ],
      thresholds: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80,
        },
      },
    },

    // Test timeout
    testTimeout: 10000,

    // Mock configuration
    mockReset: true,
    restoreMocks: true,

    // Reporter configuration
    reporters: ['verbose', 'json'],
    outputFile: {
      json: './test-results/results.json',
    },

    // Watch mode configuration
    watch: false,

    // Thread configuration
    // maxThreads: 4,
    // minThreads: 1,
  },

  // Resolve configuration
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@test': resolve(__dirname, './src/test'),
    },
  },

  // Define globals
  define: {
    __TEST__: true,
  },
});
