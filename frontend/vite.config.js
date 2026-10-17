import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  server: {
    port: 5173,
    host: true,
    // In development, requests to /api are forwarded to the backend. The browser sees
    // a single origin, so the refresh-token cookie works without CORS headaches.
    proxy: {
      '/api': 'http://localhost:4000',
    },
  },
});
