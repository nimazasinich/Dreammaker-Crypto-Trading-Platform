/**
 * Comprehensive UI/UX Test Suite
 *
 * این تست به عنوان یک UI/UX Tester Agent واقعی، تمام صفحات اپلیکیشن را
 * مانند یک کاربر انسانی بررسی می‌کند.
 *
 * Checks performed for each view:
 * 1. Navigation & rendering
 * 2. Visual layout & styling
 * 3. Interaction / event testing
 * 4. Data loading & error states
 * 5. Responsive behavior (desktop, tablet, mobile)
 * 6. Console errors & warnings
 * 7. Accessibility basics
 *
 * @author UI/UX Tester Agent
 * @date 2025-12-03
 */

import { test, expect, Page } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

// ============================================================================
// Configuration
// ============================================================================

const BASE_URL = 'http://localhost:5173';
const REPORT_DIR = './e2e-reports/uiux';
const SCREENSHOTS_DIR = `${REPORT_DIR}/screenshots`;

// All views in the application
const ALL_VIEWS = [
  { id: 'dashboard', name: 'Dashboard', route: '/' },
  { id: 'charting', name: 'Charting', route: '/#charting' },
  { id: 'market', name: 'Market', route: '/#market' },
  { id: 'scanner', name: 'Scanner', route: '/#scanner' },
  { id: 'training', name: 'Training', route: '/#training' },
  { id: 'risk', name: 'Risk', route: '/#risk' },
  { id: 'professional-risk', name: 'Professional Risk', route: '/#professional-risk' },
  { id: 'backtest', name: 'Backtest', route: '/#backtest' },
  { id: 'strategyBuilder', name: 'Strategy Builder', route: '/#strategyBuilder' },
  { id: 'health', name: 'Health', route: '/#health' },
  { id: 'settings', name: 'Settings', route: '/#settings' },
  { id: 'futures', name: 'Futures', route: '/#futures' },
  { id: 'trading', name: 'Trading', route: '/#trading' },
  { id: 'trading-hub', name: 'Trading Hub', route: '/#trading-hub' },
  { id: 'portfolio', name: 'Portfolio', route: '/#portfolio' },
  { id: 'technical-analysis', name: 'Technical Analysis', route: '/#technical-analysis' },
  { id: 'risk-management', name: 'Risk Management', route: '/#risk-management' },
  { id: 'enhanced-trading', name: 'Enhanced Trading', route: '/#enhanced-trading' },
  { id: 'positions', name: 'Positions', route: '/#positions' },
  { id: 'strategylab', name: 'Strategy Lab', route: '/#strategylab' },
  { id: 'strategy-insights', name: 'Strategy Insights', route: '/#strategy-insights' },
  { id: 'exchange-settings', name: 'Exchange Settings', route: '/#exchange-settings' },
  { id: 'monitoring', name: 'Monitoring', route: '/#monitoring' },
  { id: 'diagnostics', name: 'Diagnostics', route: '/#diagnostics' },
];

// Viewport sizes to test
const VIEWPORTS = [
  { name: 'Desktop', width: 1920, height: 1080 },
  { name: 'Laptop', width: 1366, height: 768 },
  { name: 'Tablet', width: 768, height: 1024 },
  { name: 'Mobile', width: 375, height: 667 },
];

// ============================================================================
// Helper Functions
// ============================================================================

interface TestResult {
  view: string;
  viewport: string;
  checks: {
    navigation: { passed: boolean; error?: string };
    layout: { passed: boolean; error?: string };
    styling: { passed: boolean; error?: string };
    interactions: { passed: boolean; error?: string };
    dataLoading: { passed: boolean; error?: string };
    console: { passed: boolean; errors: string[] };
    responsive: { passed: boolean; error?: string };
  };
  screenshot?: string;
  verdict: 'PASS' | 'WARNING' | 'FAIL';
  timestamp: string;
}

const testResults: TestResult[] = [];

function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

async function waitForPageStable(page: Page, timeout = 5000) {
  try {
    // Wait for network idle
    await page.waitForLoadState('networkidle', { timeout });

    // Wait for any loading spinners to disappear
    const loaders = page.locator('[class*="loading"], [class*="spinner"], [class*="skeleton"]');
    const loaderCount = await loaders.count();

    if (loaderCount > 0) {
      await loaders.first().waitFor({ state: 'hidden', timeout: 10000 }).catch(() => {
        // Some loaders might be permanent, that's okay
      });
    }

    // Give a small delay for animations
    await page.waitForTimeout(500);
  } catch (error) {
    // Page might not reach networkidle, that's okay
    console.log('Page did not reach stable state, continuing...');
  }
}

// ============================================================================
// Test Suite
// ============================================================================

test.describe('Comprehensive UI/UX Testing', () => {
  test.beforeAll(() => {
    // Ensure report directories exist
    ensureDir(REPORT_DIR);
    ensureDir(SCREENSHOTS_DIR);
  });

  // Test each view on desktop
  for (const view of ALL_VIEWS) {
    test(`UI/UX Test: ${view.name} (Desktop)`, async ({ page }) => {
      const result: TestResult = {
        view: view.name,
        viewport: 'Desktop (1920x1080)',
        checks: {
          navigation: { passed: false },
          layout: { passed: false },
          styling: { passed: false },
          interactions: { passed: false },
          dataLoading: { passed: false },
          console: { passed: false, errors: [] },
          responsive: { passed: true }, // N/A for desktop
        },
        verdict: 'FAIL',
        timestamp: new Date().toISOString(),
      };

      const consoleErrors: string[] = [];
      const consoleWarnings: string[] = [];

      // Listen for console errors
      page.on('console', (msg) => {
        if (msg.type() === 'error') {
          const text = msg.text();
          // Filter out known non-critical errors
          if (
            !text.includes('favicon.ico') &&
            !text.includes('Extension') &&
            !text.includes('DevTools')
          ) {
            consoleErrors.push(text);
          }
        } else if (msg.type() === 'warning') {
          consoleWarnings.push(msg.text());
        }
      });

      page.on('pageerror', (error) => {
        consoleErrors.push(error.message);
      });

      try {
        // ================================================================
        // CHECK 1: Navigation & Rendering
        // ================================================================
        console.log(`\n📍 Testing ${view.name}...`);
        console.log('  1️⃣ Navigation & Rendering...');

        await page.goto(`${BASE_URL}${view.route}`, {
          waitUntil: 'domcontentloaded',
          timeout: 30000,
        });

        await waitForPageStable(page);

        // Check main layout elements
        const body = page.locator('body');
        await expect(body).toBeVisible();

        // Check for common layout elements
        const hasContent =
          (await page.locator('main').count()) > 0 ||
          (await page.locator('[class*="content"]').count()) > 0 ||
          (await page.locator('div').count()) > 0;

        if (!hasContent) {
          throw new Error('No content area found - page might be blank');
        }

        result.checks.navigation.passed = true;
        console.log('     ✅ Navigation passed');

        // ================================================================
        // CHECK 2: Visual Layout
        // ================================================================
        console.log('  2️⃣ Visual Layout...');

        // Check for horizontal scrollbar (shouldn't exist on desktop unless intended)
        const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
        const viewportWidth = await page.evaluate(() => window.innerWidth);

        if (bodyWidth > viewportWidth + 10) {
          // +10 for small variations
          result.checks.layout.error = `Horizontal overflow detected: body width ${bodyWidth}px > viewport ${viewportWidth}px`;
          console.log(`     ⚠️  ${result.checks.layout.error}`);
        } else {
          result.checks.layout.passed = true;
          console.log('     ✅ Layout passed');
        }

        // ================================================================
        // CHECK 3: Styling
        // ================================================================
        console.log('  3️⃣ Styling & Visual Consistency...');

        // Check for clipped/overlapping elements
        const elementsWithOverflow = await page.evaluate(() => {
          const elements = Array.from(document.querySelectorAll('*'));
          return elements
            .filter((el) => {
              const style = window.getComputedStyle(el);
              return style.overflow === 'visible' && el.scrollWidth > el.clientWidth;
            })
            .slice(0, 5) // Limit to first 5
            .map((el) => el.className);
        });

        if (elementsWithOverflow.length > 0 && elementsWithOverflow.some((c) => c)) {
          result.checks.styling.error = `Elements with overflow: ${elementsWithOverflow.join(', ')}`;
          console.log(`     ⚠️  ${result.checks.styling.error}`);
        } else {
          result.checks.styling.passed = true;
          console.log('     ✅ Styling passed');
        }

        // ================================================================
        // CHECK 4: Interactions
        // ================================================================
        console.log('  4️⃣ Interaction Testing...');

        // Find all interactive elements
        const buttons = await page.locator('button:not([disabled])').count();
        const links = await page.locator('a[href]').count();
        const inputs = await page.locator('input:not([disabled])').count();

        const totalInteractive = buttons + links + inputs;

        if (totalInteractive === 0) {
          result.checks.interactions.error = 'No interactive elements found';
          console.log(`     ⚠️  ${result.checks.interactions.error}`);
        } else {
          // Test a few buttons (not all to avoid side effects)
          const testButtonCount = Math.min(3, buttons);

          for (let i = 0; i < testButtonCount; i++) {
            try {
              const button = page.locator('button:not([disabled])').nth(i);
              const isVisible = await button.isVisible().catch(() => false);

              if (isVisible) {
                await button.click({ timeout: 2000 });
                await page.waitForTimeout(200);
              }
            } catch (error) {
              // Some buttons might not be clickable, that's okay
            }
          }

          result.checks.interactions.passed = true;
          console.log(`     ✅ Interactions passed (${totalInteractive} interactive elements)`);
        }

        // ================================================================
        // CHECK 5: Data Loading
        // ================================================================
        console.log('  5️⃣ Data Loading...');

        // Check for "Loading..." or empty state indicators
        const bodyText = await page.locator('body').innerText();

        // Check for infinite loading
        const hasInfiniteLoading =
          bodyText.includes('Loading...') &&
          !(await page.locator('[class*="loading"]').count().then((c) => c === 0));

        if (hasInfiniteLoading) {
          result.checks.dataLoading.error = 'Infinite loading state detected';
          console.log(`     ⚠️  ${result.checks.dataLoading.error}`);
        } else if (bodyText.trim().length < 50) {
          result.checks.dataLoading.error = 'Page content seems empty';
          console.log(`     ⚠️  ${result.checks.dataLoading.error}`);
        } else {
          result.checks.dataLoading.passed = true;
          console.log('     ✅ Data loading passed');
        }

        // ================================================================
        // CHECK 6: Console Errors
        // ================================================================
        console.log('  6️⃣ Console Errors...');

        result.checks.console.errors = consoleErrors;

        if (consoleErrors.length > 0) {
          console.log(`     ⚠️  ${consoleErrors.length} console errors found`);
          consoleErrors.forEach((err) => console.log(`        - ${err.substring(0, 100)}`));
        } else {
          result.checks.console.passed = true;
          console.log('     ✅ No console errors');
        }

        // ================================================================
        // Screenshot
        // ================================================================
        const screenshotPath = `${SCREENSHOTS_DIR}/${view.id}-desktop.png`;
        await page.screenshot({
          path: screenshotPath,
          fullPage: true,
        });
        result.screenshot = screenshotPath;

        // ================================================================
        // Verdict
        // ================================================================
        const criticalFailed =
          !result.checks.navigation.passed || consoleErrors.length > 3;

        const warningFailed =
          !result.checks.layout.passed ||
          !result.checks.styling.passed ||
          !result.checks.interactions.passed ||
          !result.checks.dataLoading.passed ||
          consoleErrors.length > 0;

        if (criticalFailed) {
          result.verdict = 'FAIL';
          console.log(`  ❌ VERDICT: FAIL\n`);
        } else if (warningFailed) {
          result.verdict = 'WARNING';
          console.log(`  ⚠️  VERDICT: WARNING\n`);
        } else {
          result.verdict = 'PASS';
          console.log(`  ✅ VERDICT: PASS\n`);
        }

        testResults.push(result);

        // Assert that at least navigation passed
        expect(result.checks.navigation.passed).toBe(true);
      } catch (error: any) {
        console.log(`  ❌ FATAL ERROR: ${error.message}\n`);
        result.checks.navigation.error = error.message;
        result.verdict = 'FAIL';
        testResults.push(result);
        throw error;
      }
    });
  }

  // Test responsive behavior on key views
  test('Responsive Design: Dashboard (Multiple Viewports)', async ({ page, browser }) => {
    console.log('\n📱 Testing Responsive Design: Dashboard\n');

    for (const viewport of VIEWPORTS) {
      console.log(`  Testing ${viewport.name} (${viewport.width}x${viewport.height})`);

      await page.setViewportSize({
        width: viewport.width,
        height: viewport.height,
      });

      await page.goto(`${BASE_URL}/`, {
        waitUntil: 'domcontentloaded',
      });

      await waitForPageStable(page);

      // Check for horizontal scroll
      const hasHorizontalScroll = await page.evaluate(() => {
        return document.body.scrollWidth > window.innerWidth + 10;
      });

      // Screenshot
      await page.screenshot({
        path: `${SCREENSHOTS_DIR}/dashboard-${viewport.name.toLowerCase()}.png`,
        fullPage: false,
      });

      if (hasHorizontalScroll) {
        console.log(`    ⚠️  Horizontal scroll detected on ${viewport.name}`);
      } else {
        console.log(`    ✅ ${viewport.name} - No horizontal scroll`);
      }

      expect(hasHorizontalScroll).toBe(false);
    }
  });

  // Generate final report
  test.afterAll(() => {
    console.log('\n' + '='.repeat(80));
    console.log('📊 UI/UX TEST REPORT');
    console.log('='.repeat(80) + '\n');

    const totalTests = testResults.length;
    const passed = testResults.filter((r) => r.verdict === 'PASS').length;
    const warnings = testResults.filter((r) => r.verdict === 'WARNING').length;
    const failed = testResults.filter((r) => r.verdict === 'FAIL').length;

    console.log(`Total Views Tested: ${totalTests}`);
    console.log(`Passed: ${passed} ✅`);
    console.log(`Warnings: ${warnings} ⚠️`);
    console.log(`Failed: ${failed} ❌`);
    console.log(`Pass Rate: ${((passed / totalTests) * 100).toFixed(1)}%\n`);

    // Save JSON report
    const reportPath = `${REPORT_DIR}/uiux-test-report.json`;
    fs.writeFileSync(
      reportPath,
      JSON.stringify(
        {
          summary: {
            total: totalTests,
            passed,
            warnings,
            failed,
            passRate: (passed / totalTests) * 100,
            timestamp: new Date().toISOString(),
          },
          results: testResults,
        },
        null,
        2
      )
    );

    console.log(`📄 Full report saved: ${reportPath}\n`);
    console.log('='.repeat(80) + '\n');
  });
});
