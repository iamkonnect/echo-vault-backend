import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'terser',
  },
  server: {
    port: 3000,
  },
  define: {
    // Make environment variables available in the app
    __VITE_API_URL__: JSON.stringify(process.env.VITE_API_URL || 'https://api.echovaultz.com'),
  },
});
