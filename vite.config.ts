import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath, URL } from 'node:url';
import type { Plugin } from 'vite';
import { defineConfig } from 'vitest/config';
import vue from '@vitejs/plugin-vue';
import { VitePWA } from 'vite-plugin-pwa';

/**
 * e2e only, and only in `vite preview`: every POST /__e2e/release makes
 * the preview server serve a service worker with new bytes, as a deploy
 * would; a counter keeps parallel tests from sharing one release. Browsers fetch the worker script outside Playwright's routing,
 * so the server is the only place to fake a release.
 */
function simulatedRelease(): Plugin {
  let releases = 0;
  return {
    name: 'e2e-simulated-release',
    apply: () => process.env.E2E_SIMULATED_RELEASE === '1',
    configurePreviewServer(server) {
      server.middlewares.use((request, response, next) => {
        if (request.method === 'POST' && request.url === '/__e2e/release') {
          releases += 1;
          response.end();
          return;
        }
        if (releases > 0 && request.url?.startsWith('/service-worker.js')) {
          const worker = join(server.config.build.outDir, 'service-worker.js');
          response.setHeader('Content-Type', 'text/javascript');
          response.end(
            `${readFileSync(worker, 'utf8')}\n// release ${releases}`,
          );
          return;
        }
        next();
      });
    },
  };
}

export default defineConfig({
  plugins: [
    vue(),
    simulatedRelease(),
    VitePWA({
      // Installed copies poll this exact path; renaming it would strand them
      // on the legacy build forever.
      filename: 'service-worker.js',
      registerType: 'prompt',
      manifest: false,
      workbox: {
        // Without it, a page opened before the worker first installed is
        // never controlled, so accepting an update there would not reload.
        clientsClaim: true,
        globPatterns: ['**/*.{js,css,html}', 'manifest.json'],
      },
    }),
  ],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  test: {
    environment: 'jsdom',
    include: ['src/**/*.test.ts'],
    setupFiles: ['src/test-setup.ts'],
  },
});
