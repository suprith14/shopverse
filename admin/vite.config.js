import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';
import { fileURLToPath, URL } from 'node:url';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    // "@/lib/format" instead of "../../../lib/format" (same as the store frontend)
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  server: {
    port: 5174, // the store frontend uses 5173
    strictPort: true, // fail loudly instead of silently moving to another port
    // Same trick as the store: /api requests are forwarded to the backend, so the browser
    // sees one origin and the refresh-token cookie works without CORS setup.
    proxy: {
      '/api': 'http://localhost:4000',
    },
  },
});
