import { defineConfig } from 'vitest/config';
import { resolve } from 'node:path';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/unit/**/*.test.ts', 'tests/integration/**/*.test.ts'],
    // E2E lives in tests/e2e and is driven by Playwright, not Vitest.
    exclude: ['tests/e2e/**', 'node_modules/**'],
    restoreMocks: true,
  },
  resolve: {
    alias: { '@': resolve(__dirname, '.') },
  },
});
