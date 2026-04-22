import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  // Base path for the application
  base: '/',
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'https://api.cms.reearth.io',
        changeOrigin: true,
        secure: true,
        // Don't strip /api - the CMS API expects it
        rewrite: (path) => path,
      },
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'cms-vendor': ['@reearth/cms-api'],
          'csv-vendor': ['papaparse'],
        },
      },
    },
  },
  worker: {
    format: 'es',
  },
});
