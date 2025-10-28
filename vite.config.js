import { defineConfig } from 'vite';

export default defineConfig({
  root: '.',                 // index.html en raíz
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    target: 'esnext',
    minify: 'terser',
    cssCodeSplit: true,
    reportCompressedSize: true,
  },
  server: { port: 5173, open: true },
});