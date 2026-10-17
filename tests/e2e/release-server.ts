import { createServer } from 'node:http';
import { cp, readFile, writeFile } from 'node:fs/promises';
import { resolve, join, sep, extname } from 'node:path';
import { generateSW } from 'workbox-build';
import { PRODUCTION_BASE } from '../../src/config';

/** Two real Workbox builds at one origin; never modify the shared dist folder. */
export async function releaseServer(output: string) {
  const roots = [join(output, 'build-a'), join(output, 'build-b')];
  for (const [index, root] of roots.entries()) {
    await cp(resolve('dist'), root, { recursive: true });
    const html = await readFile(join(root, 'index.html'), 'utf8');
    await writeFile(
      join(root, 'index.html'),
      html.replace(
        '</head>',
        `<meta name="release-fixture" content="${index + 1}"></head>`,
      ),
    );
    await generateSW({
      globDirectory: root,
      swDest: join(root, 'sw.js'),
      globPatterns: ['**/*.{js,css,html,svg,png,webmanifest}'],
      globIgnores: ['sw.js', 'workbox-*.js'],
      navigateFallback: `${PRODUCTION_BASE}index.html`,
      skipWaiting: false,
      clientsClaim: true,
      cleanupOutdatedCaches: true,
    });
  }
  let build = 0,
    offline = false;
  const server = createServer(async (req, res) => {
    if (offline) {
      res.destroy();
      return;
    }
    const path = new URL(req.url ?? '/', 'http://localhost').pathname;
    if (!path.startsWith(PRODUCTION_BASE)) {
      res.writeHead(404).end();
      return;
    }
    const root = resolve(roots[build]),
      file = resolve(
        root,
        decodeURIComponent(path.slice(PRODUCTION_BASE.length)) || 'index.html',
      );
    if (!file.startsWith(root + sep)) {
      res.writeHead(404).end();
      return;
    }
    const mime: Record<string, string> = {
      '.html': 'text/html',
      '.js': 'application/javascript',
      '.css': 'text/css',
      '.webmanifest': 'application/manifest+json',
      '.png': 'image/png',
      '.svg': 'image/svg+xml',
    };
    try {
      const data = await readFile(file);
      res
        .writeHead(200, {
          'Content-Type': mime[extname(file)] ?? 'application/octet-stream',
          'Cache-Control': 'no-store',
        })
        .end(data);
    } catch {
      res.writeHead(404).end();
    }
  });
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  const address = server.address();
  if (!address || typeof address === 'string')
    throw new Error('Release server did not start.');
  return {
    url: `http://127.0.0.1:${address.port}${PRODUCTION_BASE}`,
    deployNext: () => {
      build = 1;
    },
    disconnect: () => {
      offline = true;
    },
    close: async () => {
      server.closeAllConnections();
      await new Promise<void>((resolve) => server.close(() => resolve()));
    },
  };
}
