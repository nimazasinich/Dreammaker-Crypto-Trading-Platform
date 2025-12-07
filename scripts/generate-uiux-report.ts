#!/usr/bin/env tsx
/**
 * UI/UX Test Report Generator
 *
 * Generates a beautiful HTML report from the UI/UX test results
 *
 * Usage:
 *   tsx scripts/generate-uiux-report.ts
 */

import * as fs from 'fs';
import * as path from 'path';

const REPORT_PATH = './e2e-reports/uiux/uiux-test-report.json';
const OUTPUT_PATH = './e2e-reports/uiux/uiux-report.html';

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

interface Report {
  summary: {
    total: number;
    passed: number;
    warnings: number;
    failed: number;
    passRate: number;
    timestamp: string;
  };
  results: TestResult[];
}

function generateHTML(report: Report): string {
  const { summary, results } = report;

  // Group results by verdict
  const passedResults = results.filter((r) => r.verdict === 'PASS');
  const warningResults = results.filter((r) => r.verdict === 'WARNING');
  const failedResults = results.filter((r) => r.verdict === 'FAIL');

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>UI/UX Test Report - ${new Date(summary.timestamp).toLocaleDateString()}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: #333;
      padding: 20px;
      line-height: 1.6;
    }

    .container {
      max-width: 1400px;
      margin: 0 auto;
      background: white;
      border-radius: 12px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
      overflow: hidden;
    }

    header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 40px;
      text-align: center;
    }

    header h1 {
      font-size: 2.5em;
      margin-bottom: 10px;
    }

    header p {
      font-size: 1.1em;
      opacity: 0.9;
    }

    .summary {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
      padding: 40px;
      background: #f8f9fa;
    }

    .summary-card {
      background: white;
      border-radius: 8px;
      padding: 20px;
      text-align: center;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .summary-card .number {
      font-size: 2.5em;
      font-weight: bold;
      margin-bottom: 5px;
    }

    .summary-card .label {
      font-size: 0.9em;
      color: #666;
      text-transform: uppercase;
      letter-spacing: 1px;
    }

    .summary-card.total .number { color: #667eea; }
    .summary-card.passed .number { color: #10b981; }
    .summary-card.warning .number { color: #f59e0b; }
    .summary-card.failed .number { color: #ef4444; }

    .results {
      padding: 40px;
    }

    .results h2 {
      font-size: 1.8em;
      margin-bottom: 20px;
      color: #333;
    }

    .result-group {
      margin-bottom: 40px;
    }

    .result-group h3 {
      font-size: 1.3em;
      margin-bottom: 15px;
      padding-bottom: 10px;
      border-bottom: 2px solid #e5e7eb;
    }

    .result-card {
      background: #f8f9fa;
      border-radius: 8px;
      padding: 20px;
      margin-bottom: 15px;
      border-left: 4px solid #ddd;
    }

    .result-card.pass { border-left-color: #10b981; }
    .result-card.warning { border-left-color: #f59e0b; }
    .result-card.fail { border-left-color: #ef4444; }

    .result-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 15px;
    }

    .result-title {
      font-size: 1.2em;
      font-weight: 600;
    }

    .result-verdict {
      padding: 5px 15px;
      border-radius: 20px;
      font-size: 0.9em;
      font-weight: 600;
    }

    .result-verdict.pass {
      background: #d1fae5;
      color: #065f46;
    }

    .result-verdict.warning {
      background: #fef3c7;
      color: #92400e;
    }

    .result-verdict.fail {
      background: #fee2e2;
      color: #991b1b;
    }

    .checks-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 10px;
      margin-top: 15px;
    }

    .check-item {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 0.9em;
    }

    .check-icon {
      font-size: 1.2em;
    }

    .error-details {
      margin-top: 15px;
      padding: 15px;
      background: #fee2e2;
      border-radius: 6px;
      border-left: 3px solid #ef4444;
    }

    .error-details h4 {
      font-size: 1em;
      margin-bottom: 10px;
      color: #991b1b;
    }

    .error-list {
      list-style: none;
      padding-left: 0;
    }

    .error-list li {
      padding: 5px 0;
      color: #7f1d1d;
      font-size: 0.9em;
    }

    .screenshot {
      margin-top: 15px;
      text-align: center;
    }

    .screenshot img {
      max-width: 100%;
      height: auto;
      border-radius: 8px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      cursor: pointer;
      transition: transform 0.2s;
    }

    .screenshot img:hover {
      transform: scale(1.02);
    }

    footer {
      background: #f8f9fa;
      padding: 20px;
      text-align: center;
      color: #666;
      font-size: 0.9em;
    }

    .badge {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 0.85em;
      font-weight: 600;
      margin-left: 8px;
    }

    .badge.success {
      background: #d1fae5;
      color: #065f46;
    }

    .badge.info {
      background: #dbeafe;
      color: #1e40af;
    }

    @media (max-width: 768px) {
      .summary {
        grid-template-columns: 1fr;
      }

      .result-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 10px;
      }

      .checks-grid {
        grid-template-columns: 1fr;
      }
    }

    .collapsible {
      cursor: pointer;
      user-select: none;
    }

    .collapsible:hover {
      opacity: 0.8;
    }

    .collapsible-content {
      max-height: 0;
      overflow: hidden;
      transition: max-height 0.3s ease;
    }

    .collapsible-content.active {
      max-height: 2000px;
    }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <h1>🎨 UI/UX Test Report</h1>
      <p>Comprehensive User Interface Testing Results</p>
      <p style="font-size: 0.9em; margin-top: 10px;">
        Generated: ${new Date(summary.timestamp).toLocaleString()}
      </p>
    </header>

    <div class="summary">
      <div class="summary-card total">
        <div class="number">${summary.total}</div>
        <div class="label">Total Views</div>
      </div>
      <div class="summary-card passed">
        <div class="number">${summary.passed}</div>
        <div class="label">Passed ✅</div>
      </div>
      <div class="summary-card warning">
        <div class="number">${summary.warnings}</div>
        <div class="label">Warnings ⚠️</div>
      </div>
      <div class="summary-card failed">
        <div class="number">${summary.failed}</div>
        <div class="label">Failed ❌</div>
      </div>
      <div class="summary-card total">
        <div class="number">${summary.passRate.toFixed(1)}%</div>
        <div class="label">Pass Rate</div>
      </div>
    </div>

    <div class="results">
      <h2>📊 Detailed Results</h2>

      ${
        passedResults.length > 0
          ? `
      <div class="result-group">
        <h3>✅ Passed Views (${passedResults.length})</h3>
        ${passedResults.map((result) => generateResultCard(result)).join('')}
      </div>
      `
          : ''
      }

      ${
        warningResults.length > 0
          ? `
      <div class="result-group">
        <h3>⚠️ Views with Warnings (${warningResults.length})</h3>
        ${warningResults.map((result) => generateResultCard(result)).join('')}
      </div>
      `
          : ''
      }

      ${
        failedResults.length > 0
          ? `
      <div class="result-group">
        <h3>❌ Failed Views (${failedResults.length})</h3>
        ${failedResults.map((result) => generateResultCard(result)).join('')}
      </div>
      `
          : ''
      }
    </div>

    <footer>
      <p>
        Generated by UI/UX Tester Agent &bull;
        Powered by Playwright &bull;
        Dreammaker Crypto Trading Platform
      </p>
    </footer>
  </div>

  <script>
    // Make screenshots expandable
    document.querySelectorAll('.screenshot img').forEach(img => {
      img.addEventListener('click', () => {
        window.open(img.src, '_blank');
      });
    });

    // Collapsible sections
    document.querySelectorAll('.collapsible').forEach(el => {
      el.addEventListener('click', () => {
        el.classList.toggle('active');
        const content = el.nextElementSibling;
        content.classList.toggle('active');
      });
    });
  </script>
</body>
</html>
`;
}

function generateResultCard(result: TestResult): string {
  const verdictClass = result.verdict.toLowerCase();

  const checksHTML = Object.entries(result.checks)
    .map(([key, value]) => {
      const icon = value.passed ? '✅' : '❌';
      const label = key.charAt(0).toUpperCase() + key.slice(1);
      return `
        <div class="check-item">
          <span class="check-icon">${icon}</span>
          <span>${label}</span>
        </div>
      `;
    })
    .join('');

  // Collect errors
  const errors: string[] = [];

  Object.entries(result.checks).forEach(([key, value]) => {
    if ('error' in value && value.error) {
      errors.push(`${key}: ${value.error}`);
    }
  });

  if (result.checks.console.errors.length > 0) {
    result.checks.console.errors.forEach((err) => {
      errors.push(`Console: ${err.substring(0, 200)}`);
    });
  }

  const errorsHTML =
    errors.length > 0
      ? `
    <div class="error-details">
      <h4>Issues Found:</h4>
      <ul class="error-list">
        ${errors.map((err) => `<li>• ${err}</li>`).join('')}
      </ul>
    </div>
  `
      : '';

  const screenshotHTML = result.screenshot
    ? `
    <div class="screenshot">
      <img src="${path.relative(
        path.dirname(OUTPUT_PATH),
        result.screenshot
      )}" alt="${result.view} screenshot" loading="lazy">
    </div>
  `
    : '';

  return `
    <div class="result-card ${verdictClass}">
      <div class="result-header">
        <div class="result-title">${result.view}</div>
        <div class="result-verdict ${verdictClass}">${result.verdict}</div>
      </div>
      <div class="checks-grid">
        ${checksHTML}
      </div>
      ${errorsHTML}
      ${screenshotHTML}
    </div>
  `;
}

async function main() {
  console.log('📊 Generating UI/UX Test Report...\n');

  // Check if report exists
  if (!fs.existsSync(REPORT_PATH)) {
    console.error(`❌ Report file not found: ${REPORT_PATH}`);
    console.error('   Please run the UI/UX tests first:\n');
    console.error('   npm run test:uiux\n');
    process.exit(1);
  }

  // Read report
  const reportData = JSON.parse(fs.readFileSync(REPORT_PATH, 'utf-8')) as Report;

  // Generate HTML
  const html = generateHTML(reportData);

  // Ensure output directory exists
  const outputDir = path.dirname(OUTPUT_PATH);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Write HTML file
  fs.writeFileSync(OUTPUT_PATH, html, 'utf-8');

  console.log(`✅ HTML report generated: ${OUTPUT_PATH}\n`);
  console.log('📊 Summary:');
  console.log(`   Total: ${reportData.summary.total}`);
  console.log(`   Passed: ${reportData.summary.passed} ✅`);
  console.log(`   Warnings: ${reportData.summary.warnings} ⚠️`);
  console.log(`   Failed: ${reportData.summary.failed} ❌`);
  console.log(`   Pass Rate: ${reportData.summary.passRate.toFixed(1)}%\n`);

  console.log(`🌐 Open in browser: file://${path.resolve(OUTPUT_PATH)}\n`);
}

main();
