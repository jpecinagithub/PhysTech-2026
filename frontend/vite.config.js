import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [react()],
    base: env.VITE_BASE_PATH || '/',
    server: {
      port: 5173,
      proxy: {
        '/api': 'http://localhost:5000',
      },
    },
    optimizeDeps: {
      include: ['recharts'],
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules')) {
              if (id.includes('@mediapipe')) return 'mediapipe';
              if (
                id.includes('recharts') ||
                id.includes('d3-') ||
                id.includes('d3/') ||
                id.includes('victory-vendor') ||
                id.includes('internmap') ||
                id.includes('robust-predicates') ||
                id.includes('delaunator')
              ) return 'recharts';
              if (
                id.includes('react-dom') ||
                id.includes('react-router') ||
                id.includes('/react/')
              ) return 'react';
              return 'vendor';
            }
          },
        },
      },
    },
  };
});
