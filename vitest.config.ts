// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import { defineConfig } from 'vitest/config'

// Vitest automatically finds and merges the configuration from vite.config.ts.
// We only need to define the test-specific configuration here. The manual merge
// was causing an error because the vite.config.ts exports a function, which
// mergeConfig cannot handle.
export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './vitest.setup.ts',
  },
});
