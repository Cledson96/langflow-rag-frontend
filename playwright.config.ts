import { defineConfig, devices } from '@playwright/test';

const appUrl = 'http://127.0.0.1:3000';
const mockBackendUrl = 'http://127.0.0.1:3911';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false,
  use: {
    baseURL: appUrl,
    trace: 'on-first-retry',
  },
  webServer: [
    {
      command: 'node tests/e2e/mock-backend.mjs',
      reuseExistingServer: false,
      url: `${mockBackendUrl}/health`,
    },
    {
      command: 'npm run build && npm run start -- --hostname 127.0.0.1',
      env: {
        ...process.env,
        API_BASE_URL: mockBackendUrl,
        NEXT_PUBLIC_APP_URL: appUrl,
        SESSION_COOKIE_NAME: 'langflow_rag_session',
      },
      reuseExistingServer: false,
      url: appUrl,
    },
  ],
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
