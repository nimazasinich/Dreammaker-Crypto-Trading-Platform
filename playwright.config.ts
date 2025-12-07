import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright configuration for e2e smoke tests
 *
 * This config automatically starts the dev server (backend + frontend)
 * before running tests, and stops it when tests are complete.
 */
export default defineConfig({
    testDir: './e2e',

    // Run tests in files in parallel
    fullyParallel: false, // غیرفعال کردن اجرای موازی برای جلوگیری از تداخل

    // Fail the build on CI if you accidentally left test.only in the source code
    forbidOnly: !!process.env.CI,

    // Retry on CI only
    retries: process.env.CI ? 2 : 1, // یک بار retry در محیط local

    // Opt out of parallel tests on CI
    workers: 1, // استفاده از یک worker برای جلوگیری از مشکلات شبکه

    // Reporter to use
    reporter: 'html',

    // Global timeout برای هر تست
    timeout: 60000,

    // Shared settings for all the projects below
    use: {
        // Base URL to use in actions like `await page.goto('/')`
        // استفاده از 127.0.0.1 برای جلوگیری از مشکلات IPv6
        baseURL: 'http://127.0.0.1:5173',

        // Collect trace when retrying the failed test
        trace: 'on-first-retry',

        // افزایش timeout برای عملیات‌های شبکه
        navigationTimeout: 30000,
        actionTimeout: 10000,

        // تنظیمات بیشتر برای پایداری
        screenshot: 'only-on-failure',
        video: 'retain-on-failure',

        // غیرفعال کردن IPv6 برای جلوگیری از EACCES errors
        ignoreHTTPSErrors: true,
        
        // Force IPv4 for all connections
        locale: 'en-US',
    },

    // Configure projects for major browsers
    projects: [
        {
            name: 'chromium',
            use: {
                ...devices['Desktop Chrome'],
                // تنظیمات اضافی برای Chrome
                launchOptions: {
                    args: [
                        '--disable-web-security',
                        '--disable-features=IsolateOrigins,site-per-process',
                        '--disable-ipv6', // غیرفعال کردن IPv6 برای جلوگیری از EACCES
                        '--host-rules=MAP * 127.0.0.1', // Force IPv4
                        '--disable-background-networking',
                        '--disable-background-timer-throttling',
                        '--disable-renderer-backgrounding',
                        '--disable-backgrounding-occluded-windows',
                    ],
                    // Force IPv4 for browser connections
                    env: {
                        ...process.env,
                        // Disable IPv6 at system level for Playwright
                        NODE_OPTIONS: '--dns-result-order=ipv4first',
                        // Prevent IPv6 binding
                        UV_THREADPOOL_SIZE: '4',
                    },
                },
            },
        },
    ],

    // Run your local dev server before starting the tests
    webServer: {
        command: 'npm run dev',
        // استفاده از 127.0.0.1 برای جلوگیری از مشکلات IPv6 و EACCES
        url: 'http://127.0.0.1:5173',
        reuseExistingServer: !process.env.CI, // در CI همیشه سرور جدید
        timeout: 180000, // افزایش timeout به 3 دقیقه برای راه‌اندازی کامل
        stdout: 'ignore',
        stderr: 'pipe',
        // اضافه کردن env variables در صورت نیاز
        env: {
            NODE_ENV: 'development',
            // Force IPv4 for Node.js DNS resolution - prevents IPv6 EACCES errors
            NODE_OPTIONS: '--dns-result-order=ipv4first',
            // Additional IPv6 prevention
            UV_THREADPOOL_SIZE: '4',
        },
    },
});
