import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // Relative base so a built copy works from a file:// path or any subdirectory,
  // not just the root of a domain.
  base: './',
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
});
