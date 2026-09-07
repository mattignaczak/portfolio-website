/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'node:path';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    host: '127.0.0.1',
  },
  // Vitest reuses everything above — the `@` alias and the React plugin come for
  // free, so tests resolve modules exactly as the production bundle does. It
  // also runs source through Vite's transform pipeline, which is what makes
  // `import.meta.glob` in lib/posts.ts work in tests without a stub.
  test: {
    // Component tests need a DOM; the pure ones in lib/ don't care.
    environment: 'jsdom',
    setupFiles: ['./src/vitest.setup.ts'],
    // Keep the CDK/infra suite (jest) out of Vitest's sights.
    include: ['src/**/*.test.{ts,tsx}'],
  },
});
