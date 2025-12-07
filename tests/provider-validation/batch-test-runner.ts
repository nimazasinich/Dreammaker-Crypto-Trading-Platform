#!/usr/bin/env node
/**
 * Batch Test Runner for REST + WebSocket Services
 *
 * Reads service-definitions.json and performs automated testing of all endpoints.
 * Generates JSON and Markdown reports with pass/fail status.
 *
 * Usage:
 *   npm run test:batch
 *   node batch-test-runner.ts
 */

import fs from 'fs';
import path from 'path';
import WebSocket from 'ws';

// ============================================================================
// Type Definitions
// ============================================================================

interface ServiceDefinition {
  baseUrl: string;
  wsUrl: string;
  timeout: number;
  services: Service[];
}

interface Service {
  name: string;
  type: 'REST' | 'WS';
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  endpoint: string;
  category: string;
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  expectedMinimumResponse: Record<string, any>;
  subscribePayload?: Record<string, any>;
  waitForMessages?: number;
  messageTimeout?: number;
}

interface TestResult {
  serviceName: string;
  type: 'REST' | 'WS';
  category: string;
  priority: string;
  status: 'PASS' | 'FAIL' | 'WARN' | 'SKIP';
  duration: number;
  timestamp: string;
  details: {
    statusCode?: number;
    responseBody?: any;
    errorMessage?: string;
    validationErrors?: string[];
    messagesReceived?: number;
    sampleMessages?: any[];
  };
}

interface TestReport {
  summary: {
    totalTests: number;
    passed: number;
    failed: number;
    warnings: number;
    skipped: number;
    duration: number;
    timestamp: string;
  };
  results: TestResult[];
  criticalFailures: string[];
  recommendations: string[];
}

// ============================================================================
// Test Execution Functions
// ============================================================================

/**
 * Test a REST endpoint
 */
async function testRestEndpoint(
  service: Service,
  baseUrl: string,
  timeout: number
): Promise<TestResult> {
  const startTime = Date.now();
  const url = `${baseUrl}${service.endpoint}`;

  const result: TestResult = {
    serviceName: service.name,
    type: 'REST',
    category: service.category,
    priority: service.priority,
    status: 'FAIL',
    duration: 0,
    timestamp: new Date().toISOString(),
    details: {}
  };

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    const response = await fetch(url, {
      method: service.method || 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'BatchTestRunner/1.0'
      },
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    result.details.statusCode = response.status;

    // Try to parse JSON response
    let responseBody;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      responseBody = await response.json();
    } else {
      responseBody = await response.text();
    }

    result.details.responseBody = responseBody;

    // Validate response
    if (response.ok) {
      const validationErrors = validateResponseSchema(
        responseBody,
        service.expectedMinimumResponse
      );

      if (validationErrors.length === 0) {
        result.status = 'PASS';
      } else {
        result.status = 'WARN';
        result.details.validationErrors = validationErrors;
      }
    } else {
      result.status = 'FAIL';
      result.details.errorMessage = `HTTP ${response.status}: ${response.statusText}`;
    }

  } catch (error: any) {
    result.status = 'FAIL';
    result.details.errorMessage = error.name === 'AbortError'
      ? `Timeout after ${timeout}ms`
      : error.message;
  }

  result.duration = Date.now() - startTime;
  return result;
}

/**
 * Test a WebSocket endpoint
 */
async function testWebSocketEndpoint(
  service: Service,
  wsUrl: string,
  timeout: number
): Promise<TestResult> {
  const startTime = Date.now();
  const url = `${wsUrl}${service.endpoint}`;

  const result: TestResult = {
    serviceName: service.name,
    type: 'WS',
    category: service.category,
    priority: service.priority,
    status: 'FAIL',
    duration: 0,
    timestamp: new Date().toISOString(),
    details: {
      messagesReceived: 0,
      sampleMessages: []
    }
  };

  return new Promise((resolve) => {
    let ws: WebSocket;
    let messagesReceived = 0;
    const sampleMessages: any[] = [];
    const expectedMessages = service.waitForMessages || 1;
    const messageTimeout = service.messageTimeout || timeout;

    const cleanup = () => {
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
      result.duration = Date.now() - startTime;
      result.details.messagesReceived = messagesReceived;
      result.details.sampleMessages = sampleMessages;
      resolve(result);
    };

    const timeoutId = setTimeout(() => {
      result.details.errorMessage = `Timeout: Expected ${expectedMessages} messages, received ${messagesReceived}`;
      result.status = messagesReceived > 0 ? 'WARN' : 'FAIL';
      cleanup();
    }, messageTimeout);

    try {
      ws = new WebSocket(url);

      ws.on('open', () => {
        if (service.subscribePayload) {
          ws.send(JSON.stringify(service.subscribePayload));
        }
      });

      ws.on('message', (data: WebSocket.Data) => {
        try {
          const message = JSON.parse(data.toString());
          messagesReceived++;

          if (sampleMessages.length < 3) {
            sampleMessages.push(message);
          }

          // Validate message schema
          const validationErrors = validateResponseSchema(
            message,
            service.expectedMinimumResponse
          );

          if (validationErrors.length > 0) {
            result.details.validationErrors = validationErrors;
          }

          if (messagesReceived >= expectedMessages) {
            clearTimeout(timeoutId);
            result.status = validationErrors.length === 0 ? 'PASS' : 'WARN';
            cleanup();
          }
        } catch (error: any) {
          result.details.errorMessage = `Failed to parse message: ${error.message}`;
        }
      });

      ws.on('error', (error: Error) => {
        clearTimeout(timeoutId);
        result.status = 'FAIL';
        result.details.errorMessage = `WebSocket error: ${error.message}`;
        cleanup();
      });

      ws.on('close', () => {
        clearTimeout(timeoutId);
        if (result.status === 'FAIL' && !result.details.errorMessage) {
          result.details.errorMessage = 'Connection closed unexpectedly';
        }
        cleanup();
      });

    } catch (error: any) {
      clearTimeout(timeoutId);
      result.status = 'FAIL';
      result.details.errorMessage = error.message;
      cleanup();
    }
  });
}

/**
 * Validate response against expected schema
 */
function validateResponseSchema(
  response: any,
  expectedSchema: Record<string, any>
): string[] {
  const errors: string[] = [];

  if (!expectedSchema || Object.keys(expectedSchema).length === 0) {
    return errors; // No validation required
  }

  for (const [key, expectedType] of Object.entries(expectedSchema)) {
    if (typeof expectedType === 'string') {
      // Simple type check
      const actualType = Array.isArray(response?.[key]) ? 'array' : typeof response?.[key];

      if (response?.[key] === undefined) {
        errors.push(`Missing field: ${key}`);
      } else if (actualType !== expectedType) {
        errors.push(`Field '${key}': expected ${expectedType}, got ${actualType}`);
      }
    } else if (typeof expectedType === 'object' && !Array.isArray(expectedType)) {
      // Nested object validation
      if (!response?.[key] || typeof response[key] !== 'object') {
        errors.push(`Field '${key}': expected object, got ${typeof response?.[key]}`);
      } else {
        const nestedErrors = validateResponseSchema(response[key], expectedType);
        errors.push(...nestedErrors.map(e => `${key}.${e}`));
      }
    }
  }

  return errors;
}

// ============================================================================
// Report Generation
// ============================================================================

/**
 * Generate test report
 */
function generateReport(results: TestResult[], startTime: number): TestReport {
  const passed = results.filter(r => r.status === 'PASS').length;
  const failed = results.filter(r => r.status === 'FAIL').length;
  const warnings = results.filter(r => r.status === 'WARN').length;
  const skipped = results.filter(r => r.status === 'SKIP').length;

  const criticalFailures = results
    .filter(r => r.status === 'FAIL' && r.priority === 'CRITICAL')
    .map(r => `${r.serviceName}: ${r.details.errorMessage || 'Unknown error'}`);

  const recommendations: string[] = [];

  if (failed > 0) {
    recommendations.push(`${failed} test(s) failed - review error details and fix issues`);
  }

  if (warnings > 0) {
    recommendations.push(`${warnings} test(s) have validation warnings - verify response schemas`);
  }

  if (criticalFailures.length > 0) {
    recommendations.push('CRITICAL: Core services are failing - deployment may be broken');
  }

  const restFailures = results.filter(r => r.type === 'REST' && r.status === 'FAIL').length;
  if (restFailures > 0) {
    recommendations.push(`${restFailures} REST endpoint(s) failing - check nginx routing and backend routes`);
  }

  const wsFailures = results.filter(r => r.type === 'WS' && r.status === 'FAIL').length;
  if (wsFailures > 0) {
    recommendations.push(`${wsFailures} WebSocket endpoint(s) failing - check WS configuration and upgrade headers`);
  }

  return {
    summary: {
      totalTests: results.length,
      passed,
      failed,
      warnings,
      skipped,
      duration: Date.now() - startTime,
      timestamp: new Date().toISOString()
    },
    results,
    criticalFailures,
    recommendations
  };
}

/**
 * Generate Markdown report
 */
function generateMarkdownReport(report: TestReport): string {
  const { summary, results, criticalFailures, recommendations } = report;

  let md = '# 📊 Batch Test Report\n\n';
  md += `**Generated:** ${summary.timestamp}\n`;
  md += `**Duration:** ${(summary.duration / 1000).toFixed(2)}s\n\n`;

  md += '## 📈 Summary\n\n';
  md += `| Metric | Value |\n`;
  md += `|--------|-------|\n`;
  md += `| Total Tests | ${summary.totalTests} |\n`;
  md += `| ✅ Passed | ${summary.passed} |\n`;
  md += `| ❌ Failed | ${summary.failed} |\n`;
  md += `| ⚠️ Warnings | ${summary.warnings} |\n`;
  md += `| ⏭️ Skipped | ${summary.skipped} |\n`;
  md += `| **Success Rate** | **${((summary.passed / summary.totalTests) * 100).toFixed(1)}%** |\n\n`;

  if (criticalFailures.length > 0) {
    md += '## 🚨 CRITICAL FAILURES\n\n';
    criticalFailures.forEach(failure => {
      md += `- ❌ ${failure}\n`;
    });
    md += '\n';
  }

  if (recommendations.length > 0) {
    md += '## 💡 Recommendations\n\n';
    recommendations.forEach(rec => {
      md += `- ${rec}\n`;
    });
    md += '\n';
  }

  md += '## 📋 Test Results by Category\n\n';

  const categories = [...new Set(results.map(r => r.category))];

  for (const category of categories) {
    const categoryResults = results.filter(r => r.category === category);
    md += `### ${category}\n\n`;

    md += `| Service | Type | Priority | Status | Duration |\n`;
    md += `|---------|------|----------|--------|----------|\n`;

    categoryResults.forEach(result => {
      const statusIcon =
        result.status === 'PASS' ? '✅' :
        result.status === 'FAIL' ? '❌' :
        result.status === 'WARN' ? '⚠️' : '⏭️';

      md += `| ${result.serviceName} | ${result.type} | ${result.priority} | ${statusIcon} ${result.status} | ${result.duration}ms |\n`;
    });

    md += '\n';
  }

  md += '## 🔍 Detailed Results\n\n';

  results.forEach(result => {
    const statusIcon =
      result.status === 'PASS' ? '✅' :
      result.status === 'FAIL' ? '❌' :
      result.status === 'WARN' ? '⚠️' : '⏭️';

    md += `### ${statusIcon} ${result.serviceName}\n\n`;
    md += `- **Type:** ${result.type}\n`;
    md += `- **Category:** ${result.category}\n`;
    md += `- **Priority:** ${result.priority}\n`;
    md += `- **Status:** ${result.status}\n`;
    md += `- **Duration:** ${result.duration}ms\n`;

    if (result.type === 'REST') {
      md += `- **Status Code:** ${result.details.statusCode}\n`;
    } else {
      md += `- **Messages Received:** ${result.details.messagesReceived}\n`;
    }

    if (result.details.errorMessage) {
      md += `- **Error:** ${result.details.errorMessage}\n`;
    }

    if (result.details.validationErrors && result.details.validationErrors.length > 0) {
      md += `- **Validation Errors:**\n`;
      result.details.validationErrors.forEach(error => {
        md += `  - ${error}\n`;
      });
    }

    if (result.details.sampleMessages && result.details.sampleMessages.length > 0) {
      md += `- **Sample Messages:**\n`;
      md += '```json\n';
      md += JSON.stringify(result.details.sampleMessages, null, 2);
      md += '\n```\n';
    }

    md += '\n';
  });

  return md;
}

// ============================================================================
// Main Test Runner
// ============================================================================

async function runBatchTests() {
  console.log('🚀 Starting Batch Test Runner...\n');

  const startTime = Date.now();
  const configPath = path.join(__dirname, 'service-definitions.json');

  // Load service definitions
  let serviceDefinition: ServiceDefinition;
  try {
    const configContent = fs.readFileSync(configPath, 'utf-8');
    serviceDefinition = JSON.parse(configContent);
    console.log(`✅ Loaded ${serviceDefinition.services.length} service definitions\n`);
  } catch (error: any) {
    console.error(`❌ Failed to load service definitions: ${error.message}`);
    process.exit(1);
  }

  // Run tests
  const results: TestResult[] = [];

  for (const service of serviceDefinition.services) {
    console.log(`Testing: ${service.name} (${service.type})...`);

    let result: TestResult;

    if (service.type === 'REST') {
      result = await testRestEndpoint(
        service,
        serviceDefinition.baseUrl,
        serviceDefinition.timeout
      );
    } else {
      result = await testWebSocketEndpoint(
        service,
        serviceDefinition.wsUrl,
        serviceDefinition.timeout
      );
    }

    results.push(result);

    const statusIcon =
      result.status === 'PASS' ? '✅' :
      result.status === 'FAIL' ? '❌' :
      result.status === 'WARN' ? '⚠️' : '⏭️';

    console.log(`  ${statusIcon} ${result.status} (${result.duration}ms)`);

    if (result.details.errorMessage) {
      console.log(`  ⚠️  ${result.details.errorMessage}`);
    }

    console.log('');
  }

  // Generate reports
  console.log('📊 Generating reports...\n');

  const report = generateReport(results, startTime);

  // Save JSON report
  const jsonReportPath = path.join(__dirname, 'batch-test-report.json');
  fs.writeFileSync(jsonReportPath, JSON.stringify(report, null, 2));
  console.log(`✅ JSON report saved: ${jsonReportPath}`);

  // Save Markdown report
  const mdReport = generateMarkdownReport(report);
  const mdReportPath = path.join(__dirname, 'batch-test-report.md');
  fs.writeFileSync(mdReportPath, mdReport);
  console.log(`✅ Markdown report saved: ${mdReportPath}`);

  // Print summary
  console.log('\n' + '='.repeat(60));
  console.log('📈 TEST SUMMARY');
  console.log('='.repeat(60));
  console.log(`Total Tests:    ${report.summary.totalTests}`);
  console.log(`✅ Passed:      ${report.summary.passed}`);
  console.log(`❌ Failed:      ${report.summary.failed}`);
  console.log(`⚠️  Warnings:    ${report.summary.warnings}`);
  console.log(`⏭️  Skipped:     ${report.summary.skipped}`);
  console.log(`Duration:       ${(report.summary.duration / 1000).toFixed(2)}s`);
  console.log(`Success Rate:   ${((report.summary.passed / report.summary.totalTests) * 100).toFixed(1)}%`);
  console.log('='.repeat(60));

  if (report.criticalFailures.length > 0) {
    console.log('\n🚨 CRITICAL FAILURES:');
    report.criticalFailures.forEach(failure => {
      console.log(`  ❌ ${failure}`);
    });
  }

  if (report.recommendations.length > 0) {
    console.log('\n💡 RECOMMENDATIONS:');
    report.recommendations.forEach(rec => {
      console.log(`  - ${rec}`);
    });
  }

  console.log('\n✨ Testing complete!\n');

  // Exit with error code if tests failed
  process.exit(report.summary.failed > 0 ? 1 : 0);
}

// Run tests if executed directly
if (require.main === module) {
  runBatchTests().catch(error => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  });
}

export { runBatchTests, testRestEndpoint, testWebSocketEndpoint };
