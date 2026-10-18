import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { fileURLToPath, URL } from 'node:url';
import { siteDefaults } from './src/content/site.js';

// index.html can't import JavaScript (it has to show before any loads), so the brand name is
// written into it at build time: every %SITE_NAME% becomes the brand name from src/content/site.js.
// (Build time only: a name changed in the CMS appears once the app has loaded, not in the loader.)
const siteText = {
  name: 'site-text',
  transformIndexHtml: (html) => html.replaceAll('%SITE_NAME%', siteDefaults.brand.name),
};

export default defineConfig({
  plugins: [react(), tailwindcss(), siteText],
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
      '/cms': 'http://localhost:4100', // the CMS (cms/): store text
    },
  },
});
