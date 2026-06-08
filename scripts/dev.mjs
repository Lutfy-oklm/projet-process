import { createServer } from 'vite';
import react from '@vitejs/plugin-react';

const server = await createServer({
  root: process.cwd(),
  configFile: false,
  plugins: [react()],
  optimizeDeps: {
    disabled: true,
    exclude: ['lucide-react'],
  },
  server: {
    host: '127.0.0.1',
    port: 5173,
  },
});

await server.listen();
server.printUrls();
