import { defineConfig, devices } from '@playwright/test';

// E2E + accessibility (axe) tests (docs/PROJECT_BIBLE.md §32).
// Builds and serves the static site, then drives it with Chromium.
// CI installs the browser via `npx playwright install --with-deps chromium`.
// Optional: set PW_EXECUTABLE_PATH to a preinstalled Chromium binary (useful in
// sandboxes that ship their own browser). Unset in CI → uses the managed one.
const executablePath = process.env.PW_EXECUTABLE_PATH || undefined;

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL: 'http://localhost:4321',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'], launchOptions: { executablePath } },
    },
  ],
  webServer: {
    command: 'npm run build && npm run preview',
    url: 'http://localhost:4321',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
