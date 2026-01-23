import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';
import { copyFileSync, mkdirSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// https://vitejs.dev/config/
const isTest = process.env.VITEST === 'true';
const isExtension = process.env.BUILD_TARGET === 'extension';

// Plugin to copy extension files after build
const copyExtensionFiles = () => {
  return {
    name: 'copy-extension-files',
    closeBundle() {
      if (isExtension) {
        const distDir = path.resolve(__dirname, 'dist-extension');

        // Copy manifest.json
        copyFileSync(
          path.resolve(__dirname, 'src/extension/manifest.json'),
          path.resolve(distDir, 'manifest.json')
        );

        // Copy icons
        const iconsDir = path.resolve(distDir, 'icons');
        mkdirSync(iconsDir, { recursive: true });

        ['16', '32', '48', '128'].forEach(size => {
          copyFileSync(
            path.resolve(__dirname, `public/icons/icon${size}.png`),
            path.resolve(iconsDir, `icon${size}.png`)
          );
        });

        console.log('✓ Extension files copied successfully');
      }
    }
  };
};

export default defineConfig({
  base: isExtension ? '/' : '/markdown-to-word/',
  plugins: [react(), copyExtensionFiles()],
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
    outDir: isExtension ? 'dist-extension' : 'dist',
    sourcemap: true,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
    rollupOptions: isExtension
      ? {
        input: {
          popup: path.resolve(__dirname, 'src/extension/popup.html'),
          background: path.resolve(__dirname, 'src/extension/background.ts'),
          content: path.resolve(__dirname, 'src/extension/content.ts'),
        },
        output: {
          entryFileNames: '[name].js',
          chunkFileNames: '[name].js',
          assetFileNames: '[name].[ext]',
        },
      }
      : {
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
