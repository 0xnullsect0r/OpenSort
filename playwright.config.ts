import { existsSync } from 'node:fs';
import { defineConfig, devices } from '@playwright/test';

// Allows pointing at a specific pre-installed Chromium build (e.g. a sandboxed
// dev environment that ships a browser revision pinned ahead of this repo's
// @playwright/test version) via PLAYWRIGHT_CHROMIUM_PATH, without requiring
// it — normal setups just run `npx playwright install` and use the default.
const pinnedChromium = process.env.PLAYWRIGHT_CHROMIUM_PATH;
const executablePath = pinnedChromium && existsSync(pinnedChromium) ? pinnedChromium : undefined;

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  reporter: 'list',
  use: {
    baseURL: 'http://127.0.0.1:4173',
  },
  webServer: {
    command: 'npm run dev -- --port 4173 --strictPort',
    port: 4173,
    reuseExistingServer: !process.env.CI,
    timeout: 30_000,
  },
  projects: [
    {
      name: 'mobile-chrome',
      use: {
        ...devices['Pixel 7'],
        ...(executablePath ? { launchOptions: { executablePath } } : {}),
      },
    },
  ],
});
