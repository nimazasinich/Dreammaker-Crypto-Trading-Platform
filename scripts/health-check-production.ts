#!/usr/bin/env tsx
/**
 * Production-Ready Health Check System
 *
 * Comprehensive testing suite for REST APIs and WebSocket connections
 * with schema validation, parallel execution, and multiple output formats.
 *
 * Features:
 * - REST API endpoint testing with Zod schema validation
 * - WebSocket connection and message testing
 * - Parallel test execution for performance
 * - Multiple output formats (JSON, Markdown, Console)
 * - CLI options for customization
 * - CI/CD integration support
 *
 * Usage:
 *   npm run health:check
 *   npm run health:check -- --format markdown --output ./reports/health.md
 *   npm run health:check -- --fail-on-error --timeout 10000
 *   npm run health:check -- --parallel --env production
 *
 * @author Dreammaker Crypto Team
 * @license Unlicense
 */

import { WebSocket } from 'ws';
import { z } from 'zod';
import * as fs from 'fs';
import * as path from 'path';

// ============================================================================
// Types and Interfaces
// ============================================================================

interface TestConfig {
  baseUrl: string;
  wsUrl: string;
  timeout: number;
  parallel: boolean;
  failOnError: boolean;
  format: 'console' | 'json' | 'markdown';
  outputPath?: string;
  env: 'development' | 'staging' | 'production';
}

interface TestResult {
  name: string;
  category: 'REST' | 'WebSocket';
  passed: boolean;
  duration: number;
  error?: string;
  details?: any;
  timestamp: string;
}

interface TestSummary {
  total: number;
  passed: number;
  failed: number;
  duration: number;
  passRate: number;
  timestamp: string;
  environment: string;
  results: TestResult[];
}

// ============================================================================
// Zod Schemas for API Validation
// ============================================================================

const HealthResponseSchema = z.object({
  status: z.string(),
  timestamp: z.string(),
  database: z.string().optional(),
  use_mock_data: z.boolean().optional(),
  providers_loaded: z.number().optional(),
  data_sources: z.array(z.any()).optional(),
  verification: z.object({}).optional(),
});

const MarketPricesSchema = z.object({
  data: z.object({
    price: z.number(),
    symbol: z.string().optional(),
    change24h: z.number().optional(),
    volume: z.number().optional(),
  }),
  timestamp: z.string().optional(),
});

const SystemStatusSchema = z.object({
  status: z.string(),
  uptime: z.number().optional(),
  memory: z.object({}).optional(),
  cpu: z.object({}).optional(),
});

const ModelsStatusSchema = z.object({
  success: z.boolean(),
  initialized: z.boolean(),
  status: z.string(),
  models_loaded: z.number(),
  total_models: z.number().optional(),
});

const WebSocketMessageSchema = z.object({
  service: z.string(),
  data: z.object({
    price: z.number().optional(),
  }).optional(),
  timestamp: z.string().optional(),
});

// ============================================================================
// Configuration
// ============================================================================

function parseArgs(): TestConfig {
  const args = process.argv.slice(2);

  const getArg = (flag: string, defaultValue: string): string => {
    const index = args.indexOf(flag);
    return index !== -1 && args[index + 1] ? args[index + 1] : defaultValue;
  };

  const hasFlag = (flag: string): boolean => args.includes(flag);

  const env = getArg('--env', 'development') as 'development' | 'staging' | 'production';

  // Environment-specific URLs
  const urls = {
    development: {
      base: process.env.API_BASE || 'http://localhost:8000',
      ws: process.env.WS_URL || 'ws://localhost:8000/ws',
    },
    staging: {
      base: process.env.STAGING_API_BASE || 'https://staging.example.com',
      ws: process.env.STAGING_WS_URL || 'wss://staging.example.com/ws',
    },
    production: {
      base: process.env.PROD_API_BASE || 'https://really-amin-datasourceforcryptocurrency.hf.space',
      ws: process.env.PROD_WS_URL || 'wss://really-amin-datasourceforcryptocurrency.hf.space/ws',
    },
  };

  return {
    baseUrl: getArg('--base-url', urls[env].base),
    wsUrl: getArg('--ws-url', urls[env].ws),
    timeout: parseInt(getArg('--timeout', '5000'), 10),
    parallel: hasFlag('--parallel'),
    failOnError: hasFlag('--fail-on-error'),
    format: getArg('--format', 'console') as 'console' | 'json' | 'markdown',
    outputPath: getArg('--output', ''),
    env,
  };
}

// ============================================================================
// HTTP Request Utility
// ============================================================================

async function makeRequest(
  url: string,
  options: { method?: string; body?: any; timeout?: number } = {}
): Promise<{ status: number; data: any; headers: any }> {
  const { method = 'GET', body, timeout = 5000 } = options;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    let data;
    const contentType = response.headers.get('content-type');

    if (contentType?.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    return {
      status: response.status,
      data,
      headers: Object.fromEntries(response.headers.entries()),
    };
  } catch (error: any) {
    clearTimeout(timeoutId);
    throw new Error(`Request failed: ${error.message}`);
  }
}

// ============================================================================
// REST API Tests
// ============================================================================

const restTests = [
  {
    name: 'Health Check Endpoint',
    method: 'GET',
    path: '/api/health',
    expectedStatus: 200,
    schema: HealthResponseSchema,
    validate: (data: any) => {
      if (typeof data.status !== 'string') {
        return 'Missing or invalid status field';
      }
      return true;
    },
  },
  {
    name: 'Market Prices - BTC/USDT',
    method: 'GET',
    path: '/api/service/rate?pair=BTC/USDT',
    expectedStatus: 200,
    schema: MarketPricesSchema,
    validate: (data: any) => {
      if (!data.data || typeof data.data.price !== 'number') {
        return 'Missing or invalid price data';
      }
      if (data.data.price <= 0) {
        return 'Price must be greater than 0';
      }
      return true;
    },
  },
  {
    name: 'Market Prices - ETH/USDT',
    method: 'GET',
    path: '/api/service/rate?pair=ETH/USDT',
    expectedStatus: 200,
    schema: MarketPricesSchema,
    validate: (data: any) => {
      if (!data.data || typeof data.data.price !== 'number') {
        return 'Missing or invalid price data';
      }
      return true;
    },
  },
  {
    name: 'System Status',
    method: 'GET',
    path: '/api/system/health',
    expectedStatus: 200,
    schema: SystemStatusSchema,
    validate: (data: any) => {
      if (!data.status) {
        return 'Missing status field';
      }
      return true;
    },
  },
  {
    name: 'Models Status',
    method: 'GET',
    path: '/api/models/status',
    expectedStatus: 200,
    schema: ModelsStatusSchema,
    validate: (data: any) => {
      if (typeof data.success !== 'boolean') {
        return 'Missing or invalid success field';
      }
      if (typeof data.initialized !== 'boolean') {
        return 'Missing or invalid initialized field';
      }
      return true;
    },
  },
];

async function runRestTest(
  test: typeof restTests[0],
  config: TestConfig
): Promise<TestResult> {
  const startTime = Date.now();

  try {
    const url = `${config.baseUrl}${test.path}`;
    const response = await makeRequest(url, {
      method: test.method,
      timeout: config.timeout,
    });

    // Check status code
    if (response.status !== test.expectedStatus) {
      return {
        name: test.name,
        category: 'REST',
        passed: false,
        duration: Date.now() - startTime,
        timestamp: new Date().toISOString(),
        error: `Expected status ${test.expectedStatus}, got ${response.status}`,
        details: { url, status: response.status, data: response.data },
      };
    }

    // Validate with Zod schema
    try {
      test.schema.parse(response.data);
    } catch (error: any) {
      return {
        name: test.name,
        category: 'REST',
        passed: false,
        duration: Date.now() - startTime,
        timestamp: new Date().toISOString(),
        error: `Schema validation failed: ${error.message}`,
        details: { url, data: response.data },
      };
    }

    // Custom validation
    if (test.validate) {
      const validationResult = test.validate(response.data);
      if (validationResult !== true) {
        return {
          name: test.name,
          category: 'REST',
          passed: false,
          duration: Date.now() - startTime,
          timestamp: new Date().toISOString(),
          error: validationResult,
          details: { url, data: response.data },
        };
      }
    }

    return {
      name: test.name,
      category: 'REST',
      passed: true,
      duration: Date.now() - startTime,
      timestamp: new Date().toISOString(),
      details: { url, status: response.status },
    };
  } catch (error: any) {
    return {
      name: test.name,
      category: 'REST',
      passed: false,
      duration: Date.now() - startTime,
      timestamp: new Date().toISOString(),
      error: error.message,
    };
  }
}

// ============================================================================
// WebSocket Tests
// ============================================================================

const wsTests = [
  {
    name: 'WebSocket Connection',
    subscribePayload: { action: 'subscribe', service: 'market_data', symbols: ['BTC', 'ETH'] },
    timeout: 8000,
    validate: (msg: any) => {
      // Just check if we get a valid message
      if (!msg || typeof msg !== 'object') {
        return 'Invalid message format';
      }
      return true;
    },
  },
  {
    name: 'WebSocket Market Data',
    subscribePayload: { action: 'subscribe', service: 'market_data', symbols: ['BTC'] },
    timeout: 8000,
    validate: (msg: any) => {
      try {
        WebSocketMessageSchema.parse(msg);
        if (msg.service === 'market_data' && msg.data && typeof msg.data.price === 'number') {
          return true;
        }
        return 'Message format valid but missing expected fields';
      } catch (error: any) {
        return `Schema validation failed: ${error.message}`;
      }
    },
  },
];

async function runWsTest(
  test: typeof wsTests[0],
  config: TestConfig
): Promise<TestResult> {
  const startTime = Date.now();

  return new Promise((resolve) => {
    let ws: WebSocket;
    let timer: NodeJS.Timeout;

    const cleanup = () => {
      if (timer) clearTimeout(timer);
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    };

    try {
      ws = new WebSocket(config.wsUrl);

      timer = setTimeout(() => {
        cleanup();
        resolve({
          name: test.name,
          category: 'WebSocket',
          passed: false,
          duration: Date.now() - startTime,
          timestamp: new Date().toISOString(),
          error: 'Timeout waiting for message',
        });
      }, test.timeout);

      ws.on('open', () => {
        ws.send(JSON.stringify(test.subscribePayload));
      });

      ws.on('message', (data: any) => {
        cleanup();

        let msg: any;
        try {
          msg = JSON.parse(data.toString());
        } catch (error) {
          resolve({
            name: test.name,
            category: 'WebSocket',
            passed: false,
            duration: Date.now() - startTime,
            timestamp: new Date().toISOString(),
            error: 'Invalid JSON message received',
            details: { raw: data.toString() },
          });
          return;
        }

        const validationResult = test.validate(msg);
        if (validationResult === true) {
          resolve({
            name: test.name,
            category: 'WebSocket',
            passed: true,
            duration: Date.now() - startTime,
            timestamp: new Date().toISOString(),
            details: { message: msg },
          });
        } else {
          resolve({
            name: test.name,
            category: 'WebSocket',
            passed: false,
            duration: Date.now() - startTime,
            timestamp: new Date().toISOString(),
            error: validationResult,
            details: { message: msg },
          });
        }
      });

      ws.on('error', (error: Error) => {
        cleanup();
        resolve({
          name: test.name,
          category: 'WebSocket',
          passed: false,
          duration: Date.now() - startTime,
          timestamp: new Date().toISOString(),
          error: `WebSocket error: ${error.message}`,
        });
      });
    } catch (error: any) {
      cleanup();
      resolve({
        name: test.name,
        category: 'WebSocket',
        passed: false,
        duration: Date.now() - startTime,
        timestamp: new Date().toISOString(),
        error: error.message,
      });
    }
  });
}

// ============================================================================
// Test Runner
// ============================================================================

async function runAllTests(config: TestConfig): Promise<TestSummary> {
  const startTime = Date.now();
  const results: TestResult[] = [];

  console.log('\n🔍 Running Health Checks...\n');
  console.log(`Environment: ${config.env}`);
  console.log(`Base URL: ${config.baseUrl}`);
  console.log(`WebSocket URL: ${config.wsUrl}`);
  console.log(`Parallel: ${config.parallel ? 'Yes' : 'No'}`);
  console.log(`Timeout: ${config.timeout}ms\n`);

  // Run REST tests
  console.log('📡 Running REST API Tests...\n');

  if (config.parallel) {
    const restResults = await Promise.all(
      restTests.map((test) => runRestTest(test, config))
    );
    results.push(...restResults);
  } else {
    for (const test of restTests) {
      const result = await runRestTest(test, config);
      results.push(result);
      printTestResult(result);
    }
  }

  // Run WebSocket tests
  console.log('\n🔌 Running WebSocket Tests...\n');

  if (config.parallel) {
    const wsResults = await Promise.all(
      wsTests.map((test) => runWsTest(test, config))
    );
    results.push(...wsResults);
  } else {
    for (const test of wsTests) {
      const result = await runWsTest(test, config);
      results.push(result);
      printTestResult(result);
    }
  }

  // Calculate summary
  const passed = results.filter((r) => r.passed).length;
  const failed = results.filter((r) => !r.passed).length;
  const duration = Date.now() - startTime;

  return {
    total: results.length,
    passed,
    failed,
    duration,
    passRate: (passed / results.length) * 100,
    timestamp: new Date().toISOString(),
    environment: config.env,
    results,
  };
}

// ============================================================================
// Output Formatters
// ============================================================================

function printTestResult(result: TestResult) {
  const icon = result.passed ? '✅' : '❌';
  const color = result.passed ? '\x1b[32m' : '\x1b[31m';
  const reset = '\x1b[0m';

  console.log(`${color}${icon} ${result.name} (${result.duration}ms)${reset}`);
  if (!result.passed && result.error) {
    console.log(`   ${color}Error: ${result.error}${reset}`);
  }
}

function printSummary(summary: TestSummary) {
  console.log('\n' + '='.repeat(60));
  console.log('📊 Health Check Summary');
  console.log('='.repeat(60) + '\n');

  console.log(`Environment:  ${summary.environment}`);
  console.log(`Total Tests:  ${summary.total}`);
  console.log(`Passed:       \x1b[32m${summary.passed}\x1b[0m`);
  console.log(`Failed:       \x1b[31m${summary.failed}\x1b[0m`);
  console.log(`Pass Rate:    ${summary.passRate.toFixed(1)}%`);
  console.log(`Duration:     ${summary.duration}ms`);
  console.log(`Timestamp:    ${summary.timestamp}\n`);

  if (summary.failed > 0) {
    console.log('\x1b[31m❌ Failed Tests:\x1b[0m\n');
    summary.results
      .filter((r) => !r.passed)
      .forEach((r) => {
        console.log(`  - ${r.name}`);
        console.log(`    Error: ${r.error}\n`);
      });
  }

  console.log('='.repeat(60) + '\n');
}

function generateJsonReport(summary: TestSummary): string {
  return JSON.stringify(summary, null, 2);
}

function generateMarkdownReport(summary: TestSummary): string {
  let md = '# Health Check Report\n\n';

  md += `**Generated:** ${summary.timestamp}  \n`;
  md += `**Environment:** ${summary.environment}  \n`;
  md += `**Duration:** ${summary.duration}ms  \n\n`;

  md += '## Summary\n\n';
  md += `- **Total Tests:** ${summary.total}\n`;
  md += `- **Passed:** ${summary.passed} ✅\n`;
  md += `- **Failed:** ${summary.failed} ❌\n`;
  md += `- **Pass Rate:** ${summary.passRate.toFixed(1)}%\n\n`;

  md += '## Test Results\n\n';

  // REST Tests
  const restResults = summary.results.filter((r) => r.category === 'REST');
  if (restResults.length > 0) {
    md += '### REST API Tests\n\n';
    md += '| Test Name | Status | Duration |\n';
    md += '|-----------|--------|----------|\n';
    restResults.forEach((r) => {
      const status = r.passed ? '✅ Pass' : '❌ Fail';
      md += `| ${r.name} | ${status} | ${r.duration}ms |\n`;
    });
    md += '\n';
  }

  // WebSocket Tests
  const wsResults = summary.results.filter((r) => r.category === 'WebSocket');
  if (wsResults.length > 0) {
    md += '### WebSocket Tests\n\n';
    md += '| Test Name | Status | Duration |\n';
    md += '|-----------|--------|----------|\n';
    wsResults.forEach((r) => {
      const status = r.passed ? '✅ Pass' : '❌ Fail';
      md += `| ${r.name} | ${status} | ${r.duration}ms |\n`;
    });
    md += '\n';
  }

  // Failed Tests Details
  const failedTests = summary.results.filter((r) => !r.passed);
  if (failedTests.length > 0) {
    md += '## Failed Tests Details\n\n';
    failedTests.forEach((r) => {
      md += `### ${r.name}\n\n`;
      md += `- **Category:** ${r.category}\n`;
      md += `- **Duration:** ${r.duration}ms\n`;
      md += `- **Error:** ${r.error}\n\n`;
      if (r.details) {
        md += '```json\n';
        md += JSON.stringify(r.details, null, 2);
        md += '\n```\n\n';
      }
    });
  }

  return md;
}

function saveReport(content: string, outputPath: string) {
  const dir = path.dirname(outputPath);

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  fs.writeFileSync(outputPath, content, 'utf-8');
  console.log(`\n📄 Report saved to: ${outputPath}\n`);
}

// ============================================================================
// Main Execution
// ============================================================================

async function main() {
  try {
    const config = parseArgs();

    // Run all tests
    const summary = await runAllTests(config);

    // Print results
    if (config.parallel) {
      summary.results.forEach(printTestResult);
    }

    printSummary(summary);

    // Generate and save report
    if (config.outputPath) {
      let content: string;

      if (config.format === 'json') {
        content = generateJsonReport(summary);
      } else if (config.format === 'markdown') {
        content = generateMarkdownReport(summary);
      } else {
        console.log('⚠️  Console format does not support file output');
      }

      if (content!) {
        saveReport(content, config.outputPath);
      }
    }

    // Exit code
    if (config.failOnError && summary.failed > 0) {
      console.log('\x1b[31m❌ Health check failed. Exiting with error.\x1b[0m\n');
      process.exit(1);
    } else if (summary.failed > 0) {
      console.log('\x1b[33m⚠️  Some tests failed, but continuing (--fail-on-error not set).\x1b[0m\n');
      process.exit(0);
    } else {
      console.log('\x1b[32m✅ All health checks passed!\x1b[0m\n');
      process.exit(0);
    }
  } catch (error: any) {
    console.error('\x1b[31m❌ Fatal error:\x1b[0m', error.message);
    console.error(error);
    process.exit(1);
  }
}

// Help text
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  console.log(`
Production Health Check System

Usage:
  tsx scripts/health-check-production.ts [options]

Options:
  --env <env>           Environment: development, staging, production (default: development)
  --base-url <url>      Base URL for REST API (overrides env default)
  --ws-url <url>        WebSocket URL (overrides env default)
  --timeout <ms>        Timeout for each test in milliseconds (default: 5000)
  --parallel            Run tests in parallel for faster execution
  --fail-on-error       Exit with error code if any test fails
  --format <format>     Output format: console, json, markdown (default: console)
  --output <path>       Save report to file (requires --format json or markdown)
  -h, --help            Show this help message

Examples:
  # Run locally with default settings
  tsx scripts/health-check-production.ts

  # Run in production environment with markdown report
  tsx scripts/health-check-production.ts --env production --format markdown --output ./reports/health.md

  # Run in parallel with fail-on-error for CI/CD
  tsx scripts/health-check-production.ts --parallel --fail-on-error --env staging

  # Generate JSON report
  tsx scripts/health-check-production.ts --format json --output ./reports/health.json

Environment Variables:
  API_BASE              Development API base URL
  WS_URL                Development WebSocket URL
  STAGING_API_BASE      Staging API base URL
  STAGING_WS_URL        Staging WebSocket URL
  PROD_API_BASE         Production API base URL
  PROD_WS_URL           Production WebSocket URL
`);
  process.exit(0);
}

main();
