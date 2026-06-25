import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    proxy: {
      '/health': 'http://localhost:3001',
      '/sort-ticket': 'http://localhost:3001',
      '/api': 'http://localhost:3001',
    },
  },
});
