// norvor/norvor-mainapp-frontend-react/norvor-mainapp-frontend-react-56e5bdcb54b228ea4654eaa65eeb179ed8b655f6/vite.config.ts
import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3001,
        host: '0.0.0.0',
      },
      plugins: [react()],
      define: {
        // Existing definitions
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        // --- ADDED DEFINITION FOR API URL ---
        'process.env.VITE_API_BASE_URL': JSON.stringify(env.VITE_API_BASE_URL) 
        // ------------------------------------
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, './src'),
        }
      }
    };
});