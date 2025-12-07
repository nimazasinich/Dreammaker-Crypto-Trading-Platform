/**
 * Comprehensive Data Requirements Check Example
 *
 * This example demonstrates how to use the DataRetriever service to
 * systematically check and fetch all required data sources with validation.
 *
 * Run this file with: npx ts-node examples/ComprehensiveDataCheck.ts
 */

import { DataRetriever } from '../src/services/DataRetriever';

// ============================================================================
// Example 1: Health Check All Data Sources
// ============================================================================
async function example1_HealthCheckAllSources() {
  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║  Example 1: Health Check All Data Sources                 ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  const retriever = new DataRetriever();

  try {
    const healthCheck = await retriever.healthCheckAllDataSources();

    console.log('Overall Status:', healthCheck.overall);
    console.log('Timestamp:', new Date(healthCheck.timestamp).toLocaleString());
    console.log('\nDetailed Results:');
    console.log('─'.repeat(80));

    healthCheck.results.forEach((result) => {
      const statusSymbol = result.status === 'healthy' ? '✅' : '❌';
      const methodBadge = result.method === 'http' ? '[HTTP]' :
                          result.method === 'websocket' ? '[WS]' : '[FAILED]';

      console.log(`${statusSymbol} ${result.name.padEnd(25)} ${methodBadge}`);
      console.log(`   Endpoint: ${result.endpoint}`);
      if (result.error) {
        console.log(`   Error: ${result.error}`);
      }
      console.log('');
    });

    console.log('─'.repeat(80));
    console.log(`\nSummary: ${healthCheck.results.filter(r => r.status === 'healthy').length}/${healthCheck.results.length} endpoints healthy`);
  } catch (error) {
    console.error('Health check failed:', error);
  }
}

// ============================================================================
// Example 2: Check and Fetch All Data
// ============================================================================
async function example2_CheckAndFetchAllData() {
  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║  Example 2: Check and Fetch All Required Data             ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  const retriever = new DataRetriever();

  try {
    const result = await retriever.checkAndFetchAllData({
      marketDataLimit: 50,
      chartSymbol: 'BTC',
      chartTimeframe: '1h',
      chartLimit: 24,
      newsLimit: 5,
      includeAIPrediction: false,
    });

    console.log('Overall Success:', result.success ? '✅' : '❌');
    console.log('Timestamp:', new Date(result.timestamp).toLocaleString());
    console.log('\nSummary:');
    console.log('─'.repeat(80));
    console.log(`Total Requests:        ${result.summary.total}`);
    console.log(`Successful:            ${result.summary.successful}`);
    console.log(`Failed:                ${result.summary.failed}`);
    console.log(`Validation Passed:     ${result.summary.validationPassed}`);
    console.log(`Validation Failed:     ${result.summary.validationFailed}`);
    console.log('─'.repeat(80));

    console.log('\nDetailed Data Results:');
    console.log('─'.repeat(80));

    // Market Data
    if (result.data.marketData.valid) {
      const items = Array.isArray(result.data.marketData.data)
        ? result.data.marketData.data
        : result.data.marketData.data.items || [];
      console.log(`✅ Market Data: ${items.length} coins fetched`);
      if (items.length > 0) {
        console.log(`   First coin: ${items[0].symbol} - $${items[0].price}`);
      }
    } else {
      console.log(`❌ Market Data: ${result.data.marketData.error}`);
    }

    // Price Chart
    if (result.data.priceChart.valid) {
      const chart = result.data.priceChart.data;
      console.log(`✅ Price Chart: ${chart.length} data points`);
      if (chart.length > 0) {
        console.log(`   Latest: O:${chart[chart.length - 1].open} H:${chart[chart.length - 1].high} L:${chart[chart.length - 1].low} C:${chart[chart.length - 1].close}`);
      }
    } else {
      console.log(`❌ Price Chart: ${result.data.priceChart.error}`);
    }

    // News
    if (result.data.news.valid) {
      const news = Array.isArray(result.data.news.data)
        ? result.data.news.data
        : result.data.news.data.news || [];
      console.log(`✅ News: ${news.length} articles fetched`);
      if (news.length > 0) {
        console.log(`   Latest: ${news[0].title}`);
      }
    } else {
      console.log(`❌ News: ${result.data.news.error}`);
    }

    // Sentiment
    if (result.data.sentiment.valid) {
      const sentiment = result.data.sentiment.data;
      console.log(`✅ Sentiment: ${sentiment.classification || 'N/A'}`);
      if (sentiment.fearGreedIndex !== undefined) {
        console.log(`   Fear & Greed Index: ${sentiment.fearGreedIndex}`);
      }
    } else {
      console.log(`❌ Sentiment: ${result.data.sentiment.error}`);
    }

    // Market Stats
    if (result.data.marketStats.valid) {
      const stats = result.data.marketStats.data;
      console.log(`✅ Market Stats: Available`);
      if (stats.totalMarketCap) {
        console.log(`   Total Market Cap: $${(stats.totalMarketCap / 1e9).toFixed(2)}B`);
      }
      if (stats.btcDominance) {
        console.log(`   BTC Dominance: ${stats.btcDominance.toFixed(2)}%`);
      }
    } else {
      console.log(`❌ Market Stats: ${result.data.marketStats.error}`);
    }

    console.log('─'.repeat(80));
  } catch (error) {
    console.error('Data fetch failed:', error);
  }
}

// ============================================================================
// Example 3: Check Data Availability Before Main Operation
// ============================================================================
async function example3_PreflightDataCheck() {
  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║  Example 3: Preflight Data Availability Check             ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  const retriever = new DataRetriever();

  console.log('Checking if data source is available...');

  const isAvailable = await retriever.isAvailable();

  if (isAvailable) {
    console.log('✅ Data source is AVAILABLE');
    console.log('\nProceeding with main application logic...');

    // Your main application code here
    const marketData = await retriever.getMarketData(10);
    console.log(`Fetched ${marketData.length || 0} market data items`);
  } else {
    console.log('❌ Data source is UNAVAILABLE');
    console.log('\nFalling back to cached data or displaying error to user...');

    // Your fallback logic here
    console.log('Using cached data or showing offline mode');
  }
}

// ============================================================================
// Example 4: Periodic Health Monitoring
// ============================================================================
async function example4_PeriodicHealthMonitoring() {
  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║  Example 4: Periodic Health Monitoring                    ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  const retriever = new DataRetriever();
  let checkCount = 0;
  const maxChecks = 3;
  const intervalMs = 10000; // 10 seconds

  console.log(`Starting health monitoring (${maxChecks} checks, every ${intervalMs / 1000}s)...\n`);

  const intervalId = setInterval(async () => {
    checkCount++;
    console.log(`\n[Check ${checkCount}/${maxChecks}] Running health check...`);

    try {
      const health = await retriever.healthCheckAllDataSources();
      const healthyCount = health.results.filter(r => r.status === 'healthy').length;

      console.log(`Status: ${health.overall.toUpperCase()} (${healthyCount}/${health.results.length} healthy)`);

      if (health.overall === 'unhealthy') {
        console.log('⚠️  WARNING: System is unhealthy!');
        // Trigger alerts or notifications
      }

      if (checkCount >= maxChecks) {
        clearInterval(intervalId);
        console.log('\n✅ Monitoring complete');
      }
    } catch (error) {
      console.error('Health check error:', error);
    }
  }, intervalMs);

  // Keep the script running
  await new Promise(resolve => setTimeout(resolve, intervalMs * maxChecks + 5000));
}

// ============================================================================
// Example 5: Comprehensive Application Startup Check
// ============================================================================
async function example5_ApplicationStartupCheck() {
  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║  Example 5: Application Startup Check                     ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  console.log('Starting application...\n');

  const retriever = new DataRetriever();

  // Step 1: Check configuration
  console.log('[1/3] Checking configuration...');
  const config = retriever.getConfig();
  console.log(`  API Base: ${config.apiBase}`);
  console.log(`  WS Base: ${config.wsBase}`);
  console.log(`  Has Token: ${config.hasToken ? '✅' : '❌'}`);
  console.log(`  Request Timeout: ${config.requestTimeout}ms`);
  console.log(`  Connection Timeout: ${config.connectionTimeout}ms\n`);

  // Step 2: Run health check
  console.log('[2/3] Running health check...');
  const health = await retriever.healthCheckAllDataSources();
  console.log(`  Overall Status: ${health.overall.toUpperCase()}`);

  if (health.overall === 'unhealthy') {
    console.error('  ❌ CRITICAL: Data sources are unhealthy!');
    console.error('  Application startup FAILED\n');
    return false;
  }

  console.log(`  ✅ ${health.results.filter(r => r.status === 'healthy').length}/${health.results.length} endpoints healthy\n`);

  // Step 3: Fetch initial data
  console.log('[3/3] Fetching initial data...');
  const data = await retriever.checkAndFetchAllData({
    marketDataLimit: 100,
    newsLimit: 10,
    includeAIPrediction: false,
  });

  console.log(`  Successful: ${data.summary.successful}/${data.summary.total}`);
  console.log(`  Validated: ${data.summary.validationPassed}/${data.summary.total}\n`);

  if (data.success) {
    console.log('✅ Application startup SUCCESSFUL\n');
    console.log('Ready to serve requests!\n');
    return true;
  } else {
    console.error('❌ Application startup FAILED (insufficient data)\n');
    return false;
  }
}

// ============================================================================
// Example 6: Data Quality Report
// ============================================================================
async function example6_DataQualityReport() {
  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║  Example 6: Data Quality Report                           ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  const retriever = new DataRetriever();

  const result = await retriever.checkAndFetchAllData({
    includeAIPrediction: true,
  });

  console.log('DATA QUALITY REPORT');
  console.log('═'.repeat(80));
  console.log(`Generated: ${new Date(result.timestamp).toLocaleString()}`);
  console.log('═'.repeat(80));

  // Calculate quality score
  const qualityScore = (result.summary.validationPassed / result.summary.total) * 100;

  console.log('\nOVERALL QUALITY SCORE');
  console.log(`  ${qualityScore.toFixed(1)}% (${result.summary.validationPassed}/${result.summary.total} passed validation)`);

  console.log('\nDATA SOURCE STATUS');
  console.log('─'.repeat(80));

  Object.entries(result.data).forEach(([name, info]: [string, any]) => {
    const statusIcon = info.valid ? '✅' : '❌';
    const dataSize = info.data ? (
      Array.isArray(info.data) ? `${info.data.length} items` :
      Array.isArray(info.data.items) ? `${info.data.items.length} items` :
      'object'
    ) : 'N/A';

    console.log(`${statusIcon} ${name.padEnd(20)} ${dataSize}`);
    if (info.error) {
      console.log(`   └─ Error: ${info.error}`);
    }
  });

  console.log('─'.repeat(80));

  // Recommendations
  console.log('\nRECOMMENDATIONS');
  if (qualityScore === 100) {
    console.log('  ✅ All data sources are healthy and passing validation');
  } else if (qualityScore >= 80) {
    console.log('  ⚠️  Most data sources are healthy, but some issues detected');
  } else if (qualityScore >= 50) {
    console.log('  ⚠️  WARNING: Significant data quality issues detected');
  } else {
    console.log('  🚨 CRITICAL: Majority of data sources are failing');
  }

  console.log('\n' + '═'.repeat(80));
}

// ============================================================================
// Example 7: Custom Validation and Error Handling
// ============================================================================
async function example7_CustomValidationAndErrorHandling() {
  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║  Example 7: Custom Validation & Error Handling            ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  const retriever = new DataRetriever();

  try {
    console.log('Fetching market data with validation...');
    const marketData = await retriever.getMarketData(10);

    // Custom validation logic
    const items = Array.isArray(marketData) ? marketData : marketData.items || [];

    if (items.length === 0) {
      throw new Error('No market data received');
    }

    // Check if all items have valid prices
    const invalidItems = items.filter((item: any) =>
      !item.symbol || typeof item.price !== 'number' || item.price <= 0
    );

    if (invalidItems.length > 0) {
      console.warn(`⚠️  Found ${invalidItems.length} items with invalid data`);
      console.warn('Invalid items:', invalidItems);
    }

    // Calculate data quality metrics
    const validItems = items.filter((item: any) =>
      item.symbol && typeof item.price === 'number' && item.price > 0
    );

    const dataQuality = (validItems.length / items.length) * 100;

    console.log(`\n✅ Data Quality: ${dataQuality.toFixed(1)}%`);
    console.log(`   Valid items: ${validItems.length}/${items.length}`);

    if (dataQuality >= 95) {
      console.log('   Status: EXCELLENT');
    } else if (dataQuality >= 80) {
      console.log('   Status: GOOD');
    } else if (dataQuality >= 50) {
      console.log('   Status: POOR');
    } else {
      console.log('   Status: CRITICAL');
    }
  } catch (error: any) {
    console.error('❌ Error:', error.message);
    console.log('\nFallback strategy: Using cached data or retrying...');
  }
}

// ============================================================================
// Run All Examples (or select specific ones)
// ============================================================================
async function runAllExamples() {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║     DataRetriever Comprehensive Data Check Examples        ║');
  console.log('║  HTTP-First with Validation & Health Monitoring            ║');
  console.log('╚════════════════════════════════════════════════════════════╝');

  // Run examples sequentially
  // Uncomment the examples you want to run:

  await example1_HealthCheckAllSources();
  // await example2_CheckAndFetchAllData();
  // await example3_PreflightDataCheck();
  // await example4_PeriodicHealthMonitoring();
  // await example5_ApplicationStartupCheck();
  // await example6_DataQualityReport();
  // await example7_CustomValidationAndErrorHandling();

  console.log('\n✅ Examples completed!\n');
}

// Run if executed directly
if (require.main === module) {
  runAllExamples().catch(console.error);
}

// Export for use in other files
export {
  example1_HealthCheckAllSources,
  example2_CheckAndFetchAllData,
  example3_PreflightDataCheck,
  example4_PeriodicHealthMonitoring,
  example5_ApplicationStartupCheck,
  example6_DataQualityReport,
  example7_CustomValidationAndErrorHandling,
};
