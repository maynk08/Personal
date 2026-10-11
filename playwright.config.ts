import { defineConfig, devices } from '@playwright/test';

import { e2eConfig, fixtureBaseUrl } from './e2e/e2e-config';

const siteUrl = `http://localhost:${e2eConfig.portfolioPort}`;
const backendUrl = `http://localhost:${e2eConfig.backendPort}`;

// End-to-end tests run against their own backend (fresh e2e database with seeded content) and a production build.
export default defineConfig({
  testDir: './e2e/tests',
  // The tests share one database, so they run one at a time, in file order.
  fullyParallel: false,
  workers: 1,
  forbidOnly: true,
  retries: 0,
  reporter: [['list']],
  use: { baseURL: siteUrl, trace: 'retain-on-failure' },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: [
    {
      name: 'fixtures',
      command: 'npx tsx e2e/fixture-server.ts',
      url: `${fixtureBaseUrl}/health`,
      reuseExistingServer: false,
      timeout: 30_000,
    },
    {
      name: 'backend',
      command: 'npx tsx e2e/start-backend.ts',
      // Answers 404 until the start script has seeded the content, so the tests never start against an empty site.
      url: `${backendUrl}/api/public/projects/portfolio-cms`,
      reuseExistingServer: false,
      timeout: 90_000,
    },
    {
      name: 'portfolio',
      command: `npx next build && npx next start --port ${e2eConfig.portfolioPort}`,
      url: siteUrl,
      // The test images come from the local fixture server, which only this build is allowed to use.
      env: { BACKEND_URL: backendUrl, SITE_URL: siteUrl, MEDIA_PUBLIC_BASE_URL: fixtureBaseUrl, MEDIA_ALLOW_LOCAL_IMAGES: 'true' },
      reuseExistingServer: false,
      timeout: 240_000,
    },
  ],
});
