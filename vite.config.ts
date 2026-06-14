import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      // Permite usar @/ en lugar de rutas relativas largas
      '@': resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    host: true, // Expone en red local para probar en celular
  },
});
