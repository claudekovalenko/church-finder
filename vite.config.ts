import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

/**
 * Two build targets:
 *
 * - The normal build (including GitHub Pages) is a PWA: installable, and it
 *   keeps working with no network because all of its state is local anyway.
 * - `ARTIFACT=1` builds for embedding as a single inlined page, where there is
 *   no origin to own a service worker. The PWA plugin is disabled there, but
 *   still supplies a no-op `virtual:pwa-register`, so the app code does not
 *   need to branch.
 *
 * BASE_PATH is set by CI to the repository subpath Pages serves from. Locally
 * it stays relative, so `dist/` opens correctly from any directory.
 */
const isArtifact = process.env.ARTIFACT === '1';

/**
 * Normalise whatever CI hands us into exactly one leading and trailing slash.
 * `actions/configure-pages` reports `/church-finder` for a project site and
 * an empty path for a user site, and appending a slash to the latter would
 * produce `//`, which resolves to a different origin.
 */
function normaliseBase(raw: string | undefined): string {
  if (!raw || raw === './') return './';
  const trimmed = raw.replace(/^\/+|\/+$/g, '');
  return trimmed === '' ? '/' : `/${trimmed}/`;
}

const base = normaliseBase(process.env.BASE_PATH);

export default defineConfig({
  base,
  plugins: [
    react(),
    VitePWA({
      disable: isArtifact,
      // Prompt rather than auto-update: a silent reload mid-sentence would
      // throw away whatever note was being typed.
      registerType: 'prompt',
      includeAssets: ['favicon.svg', 'apple-touch-icon.png'],
      manifest: {
        name: 'Church Finder',
        short_name: 'Church Finder',
        description:
          'A theological compatibility tool for discerning which local church to sit under.',
        // Relative so the same manifest works from a domain root and from a
        // repository subpath on GitHub Pages.
        start_url: '.',
        scope: '.',
        display: 'standalone',
        orientation: 'any',
        background_color: '#12110f',
        theme_color: '#12110f',
        categories: ['lifestyle', 'productivity'],
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          {
            src: 'icon-maskable-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico,woff2}'],
        // Take control on the very first visit, so the app is usable offline
        // straight away rather than only after a second load. Updates still
        // wait to be accepted, because skipWaiting stays off under `prompt`.
        clientsClaim: true,
        // The app is a single page with client-side tabs, so any navigation
        // inside the scope resolves to the shell.
        navigateFallback: 'index.html',
        runtimeCaching: [
          {
            // Map imagery, cached as you look at it, so an area you have
            // already viewed still draws with no signal. Kept to a few hundred
            // tiles — this is a personal cache, not a bulk download.
            urlPattern: ({ url }) => url.hostname.endsWith('tile.openstreetmap.org'),
            handler: 'CacheFirst',
            options: {
              cacheName: 'osm-tiles',
              expiration: { maxEntries: 400, maxAgeSeconds: 60 * 60 * 24 * 30 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
    }),
  ],
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
});
