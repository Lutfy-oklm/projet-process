import { build } from 'vite';
import react from '@vitejs/plugin-react';

await build({
  root: process.cwd(),
  base: './',
  publicDir: false,
  configFile: false,
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
