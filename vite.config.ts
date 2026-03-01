import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

import { cloudflare } from "@cloudflare/vite-plugin";

export default defineConfig({
  plugins: [react(), cloudflare()],
  build: {
    outDir: 'dist',
    minify: 'terser',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          animations: ['framer-motion'],
          state: ['zustand'],
          db: ['idb'],
        }
      }
    },
    terserOptions: {
      compress: { drop_console: true, drop_debugger: true }
    }
  },
  server: {
    port: 5173
  }
});