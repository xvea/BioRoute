import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';

// Konfigurasi Vitest (alat unit testing).
export default defineConfig({
  resolve: {
    // Samakan dengan jsconfig.json: '@/...' artinya folder 'src/...'
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    // Hanya file berakhiran .test.js di dalam src yang dianggap file test
    include: ['src/**/*.test.js'],
  },
});
