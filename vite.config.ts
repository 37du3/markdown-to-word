import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// https://vitejs.dev/config/
const isTest = process.env.VITEST === 'true';

export default defineConfig({
  base: '/markdown-to-word/',
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/vitest.setup.ts',
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@utils': path.resolve(__dirname, './src/utils'),
      '@hooks': path.resolve(__dirname, './src/hooks'),
      '@types': path.resolve(__dirname, './src/types'),
    },
  },
  server: {
    port: 3000,
    host: '127.0.0.1',
    hmr: isTest ? false : { host: '127.0.0.1' },
    ws: isTest ? false : undefined,
    open: true,
  },
  build: {
    target: 'ES2020',
    outDir: 'dist',
    sourcemap: true,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          markdown: ['marked', 'marked-gfm-heading-id', 'marked-highlight'],
          docx: ['docx', 'file-saver'],
          ui: ['lucide-react', 'clsx', 'tailwind-merge'],
        },
      },
    },
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'marked', 'docx'],
  },
  css: {
    postcss: './postcss.config.js',
  },
});
