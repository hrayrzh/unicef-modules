import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Relative base: the built html/css/js works from file://, from a subdirectory
// on GitHub Pages, and inside an iframe on any host. (D2)
export default defineConfig({
  plugins: [react()],
  base: './',
  server: { port: 8080, strictPort: true, host: true },
  preview: { port: 8080, strictPort: true, host: true },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    // Single css + single js chunk — keeps the built output a flat, portable
    // set of files rather than a graph of dynamic imports.
    rollupOptions: {
      output: {
        manualChunks: undefined,
        entryFileNames: 'assets/[name].[hash].js',
        chunkFileNames: 'assets/[name].[hash].js',
        assetFileNames: 'assets/[name].[hash].[ext]',
      },
    },
  },
});
