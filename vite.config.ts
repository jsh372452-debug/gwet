import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
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
