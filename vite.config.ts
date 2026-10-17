import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';
import { APP_NAME, PRODUCTION_BASE } from './src/config.ts';

export default defineConfig(({ command, isPreview }) => ({
  base: command === 'build' || isPreview ? PRODUCTION_BASE : '/',
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'prompt',
      includeAssets: ['apple-touch-icon.png', 'icon-maskable-512.png'],
      manifest: {
        id: PRODUCTION_BASE,
        name: APP_NAME,
        short_name: 'Reflex',
        theme_color: '#163c37',
        background_color: '#f5f4ef',
        display: 'standalone',
        start_url: PRODUCTION_BASE,
        scope: PRODUCTION_BASE,
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png' },
          {
            src: 'icon-maskable-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
          {
            src: 'icon.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,webmanifest}'],
        navigateFallback: `${PRODUCTION_BASE}index.html`,
        cleanupOutdatedCaches: true,
        // An installed update waits for the learner's explicit confirmation.
        skipWaiting: false,
        clientsClaim: true,
      },
    }),
  ],
  test: {
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    include: ['tests/**/*.test.{ts,tsx}'],
  },
}));
