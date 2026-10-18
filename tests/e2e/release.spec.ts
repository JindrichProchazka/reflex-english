import { expect, test, type Page } from '@playwright/test';
import { PRODUCTION_BASE } from '../../src/config';
import { drillById } from '../../src/content/drills';
const concepts = drillById('in-on-at')!.concepts;
import { releaseServer } from './release-server';
async function waitForOffline(page: Page) {
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
  });
  await expect
    .poll(() => page.evaluate(() => !!navigator.serviceWorker.controller))
    .toBe(true);
}
async function addWord(page: Page) {
  const personal = page.getByRole('region', {
    name: 'Personal words',
    exact: true,
  });
  await personal
    .getByLabel('English word or phrase', { exact: true })
    .fill('release safety check');
  await personal
    .getByLabel('Czech meaning', { exact: true })
    .fill('kontrola bezpečnosti vydání');
  await personal
    .getByRole('button', { name: 'Save word', exact: true })
    .click();
  await expect(personal.getByRole('status')).toContainText('Saved');
}
test('production subpath, hash routes, manifest, Apple metadata and icons are valid', async ({
  page,
  request,
}) => {
  const failures: string[] = [];
  page.on('pageerror', (error) => failures.push(error.message));
  await page.goto('./#/vocabulary/lessons/automation?mode=context');
  await expect(
    page.getByRole('heading', {
      name: 'Mechatronics & Automation',
      exact: true,
    }),
  ).toBeVisible();
  await page.reload();
  await expect(
    page.getByRole('button', { name: 'Start context practice' }),
  ).toBeVisible();
  expect(new URL(page.url()).pathname).toBe(PRODUCTION_BASE);
  await expect(page.locator('meta[name=viewport]')).toHaveAttribute(
    'content',
    /viewport-fit=cover/,
  );
  await expect(
    page.locator('meta[name=apple-mobile-web-app-capable]'),
  ).toHaveAttribute('content', 'yes');
  const manifestUrl = await page
    .locator('link[rel=manifest]')
    .getAttribute('href');
  expect(manifestUrl).toBe(`${PRODUCTION_BASE}manifest.webmanifest`);
  const response = await request.get(new URL(manifestUrl!, page.url()).href);
  expect(response.ok()).toBe(true);
  const manifest = await response.json();
  expect(manifest).toMatchObject({
    name: 'Reflex English',
    short_name: 'Reflex',
    id: PRODUCTION_BASE,
    start_url: PRODUCTION_BASE,
    scope: PRODUCTION_BASE,
    display: 'standalone',
    theme_color: '#163c37',
    background_color: '#f5f4ef',
  });
  for (const icon of manifest.icons) {
    const iconUrl = new URL(icon.src, response.url());
    expect(iconUrl.pathname.startsWith(PRODUCTION_BASE)).toBe(true);
    const image = await request.get(iconUrl.href);
    expect(image.ok()).toBe(true);
    if (icon.type === 'image/png') {
      const bytes = await image.body();
      const size = Number(icon.sizes.split('x')[0]);
      expect(bytes.readUInt32BE(16)).toBe(size);
      expect(bytes.readUInt32BE(20)).toBe(size);
    }
  }
  expect(
    manifest.icons.some(
      (icon: { purpose?: string }) => icon.purpose === 'maskable',
    ),
  ).toBe(true);
  const apple = await page
    .locator('link[rel=apple-touch-icon]')
    .getAttribute('href');
  const appleBytes = await (
    await request.get(new URL(apple!, page.url()).href)
  ).body();
  expect(appleBytes.readUInt32BE(16)).toBe(180);
  const scripts = await page
    .locator('script[src]')
    .evaluateAll((elements) =>
      elements.map((e) => (e as HTMLScriptElement).src),
    );
  expect(
    scripts.every((src) => new URL(src).pathname.startsWith(PRODUCTION_BASE)),
  ).toBe(true);
  await waitForOffline(page);
  const worker = await page.evaluate(async () => ({
    scope: (await navigator.serviceWorker.ready).scope,
    script: navigator.serviceWorker.controller!.scriptURL,
  }));
  expect(new URL(worker.scope).pathname).toBe(PRODUCTION_BASE);
  expect(new URL(worker.script).pathname).toBe(`${PRODUCTION_BASE}sw.js`);
  expect(failures).toEqual([]);
});
test('key mobile routes fit the viewport and keep controls usable when the visible height shrinks', async ({
  page,
}) => {
  for (const [route, heading] of [
    ['./', 'Make room for'],
    ['./#/vocabulary', 'Vocabulary lessons'],
    [
      './#/vocabulary/lessons/academic-professional',
      'Academic & Professional English',
    ],
    [
      './#/vocabulary/lessons/measurement?mode=recall',
      'Measurement, Testing & Uncertainty',
    ],
    [
      './#/vocabulary/lessons/automation?mode=context',
      'Mechatronics & Automation',
    ],
    ['./#/mistakes', 'Mistakes / Weak Areas'],
    ['./#/printable?lesson=measurement', 'Printable practice'],
    ['./#/data', 'Data / Backup'],
  ]) {
    await page.goto(route);
    await expect(
      page.getByRole('heading', { name: new RegExp(heading, 'i') }).first(),
    ).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
  }
  await expect(page.getByText('Reflex English · Version 1.0.0')).toBeVisible();
  await page.goto('./#/vocabulary');
  const personal = page.getByRole('region', {
    name: 'Personal words',
    exact: true,
  });
  const longWord = 'electromechanicalcharacterization'.repeat(5);
  await personal
    .getByLabel('English word or phrase', { exact: true })
    .fill(longWord);
  await personal
    .getByLabel('Czech meaning', { exact: true })
    .fill('dlouhý testovací výraz');
  await personal
    .getByRole('button', { name: 'Save word', exact: true })
    .click();
  await expect(personal.getByRole('status')).toContainText('Saved');
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  await page.goto('./#/vocabulary/lessons/academic-professional?mode=context');
  await page.getByRole('button', { name: 'Start context practice' }).click();
  const input = page.getByLabel('Your answer', { exact: true });
  await input.focus();
  await expect(input).toHaveCSS('font-size', '16px');
  const width = page.viewportSize()!.width;
  await page.setViewportSize({ width, height: 390 });
  await expect
    .poll(async () => {
      const box = await input.boundingBox();
      return !!box && box.y >= 0 && box.y + box.height <= 390;
    })
    .toBe(true);
  await expect(input).toBeFocused();
  await page.screenshot({
    path: `test-results/release-input-${test.info().project.name}.png`,
  });
});
test('cached production app reopens offline, retains progress and accepts new attempts', async ({
  page,
  context,
}) => {
  await page.goto('./#/vocabulary');
  await addWord(page);
  await waitForOffline(page);
  const url = page.url();
  await page.close();
  await context.setOffline(true);
  const reopened = await context.newPage();
  await reopened.goto(url);
  const personal = reopened.getByRole('region', {
    name: 'Personal words',
    exact: true,
  });
  await expect(personal).toContainText('release safety check');
  await reopened.getByLabel('Test direction').selectOption('cs-en');
  await personal.getByRole('button', { name: 'Practise', exact: true }).click();
  await expect(reopened.getByTestId('prompt')).toContainText(
    'kontrola bezpečnosti vydání',
  );
  await reopened
    .getByLabel('Your answer', { exact: true })
    .fill('release safety check');
  await reopened
    .getByRole('button', { name: 'Check answer', exact: true })
    .click();
  await expect(reopened.getByTestId('prompt')).not.toContainText(
    'kontrola bezpečnosti vydání',
  );
  await reopened.reload();
  await reopened
    .getByRole('link', { name: 'Data / Backup', exact: true })
    .click();
  await expect(
    reopened.getByRole('region', { name: 'Current local data' }),
  ).toContainText('Attempts: 1');
  await reopened.goto(new URL('./#/vocabulary/lessons/measurement', url).href);
  await expect(
    reopened.getByText('We estimated the measurement uncertainty.', {
      exact: true,
    }),
  ).toBeVisible();
  await context.setOffline(false);
});
test('a real waiting service worker updates only after confirmation and preserves IndexedDB', async ({
  page,
}) => {
  test.setTimeout(90000);
  const server = await releaseServer(test.info().outputPath('releases'));
  try {
    await page.goto(`${server.url}#/vocabulary`);
    await addWord(page);
    await waitForOffline(page);
    await expect(page.locator('meta[name=release-fixture]')).toHaveAttribute(
      'content',
      '1',
    );
    await page.goto(`${server.url}#/`);
    await page.getByRole('link', { name: /Open Quick Reflex Drills/ }).click();
    await page
      .getByRole('region', { name: 'IN / ON / AT', exact: true })
      .getByRole('button', { name: 'Start Normal' })
      .click();
    const prompt = await page.getByTestId('prompt').innerText();
    const exercise = concepts
      .flatMap((c) => c.exercises)
      .find((e) => e.prompt === prompt)!;
    await page
      .getByLabel('Missing preposition', { exact: true })
      .fill(exercise.answer);
    await page
      .getByRole('button', { name: 'Check answer', exact: true })
      .click();
    await expect(page.getByTestId('prompt')).not.toHaveText(prompt);
    const nextPrompt = await page.getByTestId('prompt').innerText();
    await page
      .getByRole('link', { name: 'Data / Backup', exact: true })
      .click();
    await expect(
      page.getByRole('region', { name: 'Current local data' }),
    ).toContainText('Attempts: 1');
    server.deployNext();
    await page
      .getByRole('button', { name: 'Check for updates', exact: true })
      .click();
    const banner = page.getByRole('complementary', {
      name: 'Application update',
      exact: true,
    });
    await expect(banner).toBeVisible({ timeout: 20000 });
    await expect(page.locator('meta[name=release-fixture]')).toHaveAttribute(
      'content',
      '1',
    );
    await banner.getByRole('button', { name: 'Later', exact: true }).click();
    await expect(banner).toHaveCount(0);
    await page
      .getByRole('region', { name: 'Offline and updates' })
      .getByRole('button', { name: 'Update available', exact: true })
      .click();
    const confirm = page.getByRole('alertdialog', {
      name: 'Confirm application update',
      exact: true,
    });
    await expect(confirm).toContainText('not submitted will be lost');
    await confirm
      .getByRole('button', { name: 'Update now', exact: true })
      .click();
    await expect(page.locator('meta[name=release-fixture]')).toHaveAttribute(
      'content',
      '2',
      { timeout: 20000 },
    );
    await expect(
      page.getByRole('region', { name: 'Current local data' }),
    ).toContainText('Attempts: 1');
    await page.goto(`${server.url}#/`);
    await page.getByRole('link', { name: /Open Quick Reflex Drills/ }).click();
    await page
      .getByRole('region', { name: 'IN / ON / AT', exact: true })
      .getByRole('button', { name: 'Continue Normal' })
      .click();
    await expect(page.getByTestId('prompt')).toHaveText(nextPrompt);
    await page.goto(`${server.url}#/vocabulary`);
    await expect(
      page.getByRole('region', { name: 'Personal words', exact: true }),
    ).toContainText('release safety check');
    server.disconnect();
    await page.reload();
    await expect(
      page.getByRole('region', { name: 'Personal words', exact: true }),
    ).toContainText('release safety check');
  } finally {
    await server.close();
  }
});
