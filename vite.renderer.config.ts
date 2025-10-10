import path from 'node:path';
import { TanStackRouterVite } from '@tanstack/router-plugin/vite';
import { defineConfig } from 'vite';

// https://vitejs.dev/config
export default defineConfig(async () => {
  const tailwindcss = await import('@tailwindcss/vite');

  return {
    build: {
      outDir: '.vite/build/renderer',
      rollupOptions: {
        input: 'src/renderer/main.tsx',
      },
    },
    server: {
      watch: {
        ignored: ['**/data/**', '**/node_modules/**'],
      },
    },
    plugins: [
      tailwindcss.default(),
      TanStackRouterVite({
        routesDirectory: './src/routes',
        generatedRouteTree: './src/routeTree.gen.ts',
        routeFileIgnorePrefix: '-',
        quoteStyle: 'single',
      }),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
  };
});
