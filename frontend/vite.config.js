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
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            react: ['react', 'react-dom', 'react-router-dom'],
            recharts: ['recharts'],
            mediapipe: ['@mediapipe/pose', '@mediapipe/camera_utils', '@mediapipe/drawing_utils'],
          },
        },
      },
    },
  };
});
