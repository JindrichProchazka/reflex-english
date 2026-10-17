// Rasterize the repository's own vector mark. No external image service/assets.
import { chromium } from 'playwright';
import { readFile, writeFile } from 'node:fs/promises';
const svg = await readFile(
  new URL('../public/icon.svg', import.meta.url),
  'utf8',
);
const browser = await chromium.launch();
try {
  const page = await browser.newPage();
  for (const [size, name] of [
    [180, 'apple-touch-icon.png'],
    [192, 'icon-192.png'],
    [512, 'icon-512.png'],
    [512, 'icon-maskable-512.png'],
  ]) {
    const data = await page.evaluate(
      async ({ svg, size }) => {
        const image = new Image();
        image.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
        await image.decode();
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        canvas.getContext('2d').drawImage(image, 0, 0, size, size);
        return canvas.toDataURL('image/png').split(',')[1];
      },
      { svg, size },
    );
    await writeFile(
      new URL(`../public/${name}`, import.meta.url),
      Buffer.from(data, 'base64'),
    );
  }
} finally {
  await browser.close();
}
