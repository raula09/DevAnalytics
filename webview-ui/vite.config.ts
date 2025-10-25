import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  root: '.',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: { input: path.resolve(__dirname, 'index.html') }
  },
  base: './'
});
