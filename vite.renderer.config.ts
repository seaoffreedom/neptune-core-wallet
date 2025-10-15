import path from 'node:path';
import { TanStackRouterVite } from '@tanstack/router-plugin/vite';
import { defineConfig } from 'vite';

// https://vitejs.dev/config
export default defineConfig(async () => {
  const tailwindcss = await import('@tailwindcss/vite');

  return {
    build: {
      outDir: '.vite/build/renderer/main_window',
      rollupOptions: {
        input: 'index.html',
        output: {
          manualChunks: undefined,
        },
      },
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: false,
          drop_debugger: false,
        },
        mangle: false,
        keep_fnames: true,
      },
      copyPublicDir: true,
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
    optimizeDeps: {
      include: [
        'react',
        'react-dom',
        '@tanstack/react-router',
        'zustand',
        'lucide-react',
        'sonner',
      ],
    },
  };
});
