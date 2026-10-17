import { defineConfig, devices } from '@playwright/test';
import { PRODUCTION_BASE } from './src/config';
export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false,
  timeout: 60000,
  workers: process.env.CI ? 2 : 4,
  use: {
    baseURL: `http://127.0.0.1:4186${PRODUCTION_BASE}`,
    trace: 'retain-on-failure',
  },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'] } },
    {
      name: 'mobile',
      use: { ...devices['Pixel 7'], defaultBrowserType: 'chromium' },
    },
    ...[375, 390, 430].map((width) => ({
      name: `iphone-${width}`,
      use: {
        ...devices['iPhone 13'],
        browserName: 'webkit' as const,
        viewport: {
          width,
          height: width === 375 ? 812 : width === 390 ? 844 : 932,
        },
      },
    })),
  ],
  webServer: {
    command:
      'node node_modules/vite/bin/vite.js preview --host 0.0.0.0 --port 4186 --strictPort',
    url: `http://127.0.0.1:4186${PRODUCTION_BASE}`,
    reuseExistingServer: !process.env.CI,
  },
});
