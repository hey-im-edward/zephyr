import { defineConfig } from '@playwright/test';

const webBaseUrl = process.env.E2E_WEB_BASE_URL ?? 'http://localhost:3000';
const apiHealthUrl = process.env.E2E_API_HEALTH_URL ?? 'http://127.0.0.1:8080/api/v1/home';
const e2eAdminEmail = process.env.E2E_ADMIN_EMAIL ?? 'playwright-admin@zephyr.vn';
const e2eAdminPassword = process.env.E2E_ADMIN_PASSWORD ?? 'TestAdminPassword123!';
const e2eJwtSecret = process.env.E2E_JWT_SECRET ?? 'playwright-e2e-jwt-secret-with-min-32-chars';
const backendCommand =
  process.platform === 'win32'
    ? `cd ..\\backend && set "APP_ADMIN_USERNAME=${e2eAdminEmail}" && set "APP_ADMIN_PASSWORD=${e2eAdminPassword}" && set "APP_JWT_SECRET=${e2eJwtSecret}" && mvnw.cmd -B -DskipTests spring-boot:run`
    : `cd ../backend && APP_ADMIN_USERNAME="${e2eAdminEmail}" APP_ADMIN_PASSWORD="${e2eAdminPassword}" APP_JWT_SECRET="${e2eJwtSecret}" ./mvnw -B -DskipTests spring-boot:run`;

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false,
  retries: 1,
  use: {
    baseURL: webBaseUrl,
    screenshot: 'only-on-failure',
    trace: 'on-first-retry',
    video: 'retain-on-failure',
  },
  webServer: [
    {
      command: backendCommand,
      url: apiHealthUrl,
      timeout: 180_000,
      reuseExistingServer: true,
      stdout: 'pipe',
      stderr: 'pipe',
    },
    {
      command: 'npm run dev -- --hostname localhost --port 3000',
      url: webBaseUrl,
      timeout: 120_000,
      reuseExistingServer: true,
      stdout: 'pipe',
      stderr: 'pipe',
    },
  ],
  reporter: [['list']],
});
