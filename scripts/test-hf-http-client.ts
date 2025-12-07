#!/usr/bin/env tsx
/**
 * اسکریپت تست HFHttpOnlyClient
 * 
 * این اسکریپت تمام endpoint‌های کلاینت را تست می‌کند
 * و گزارش کاملی از وضعیت هر endpoint ارائه می‌دهد.
 * 
 * استفاده:
 *   npx tsx scripts/test-hf-http-client.ts
 */

import { hfHttpClient } from '../src/services/HFHttpOnlyClient.js';

// رنگ‌ها برای خروجی ترمینال
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m'
};

function log(message: string, color: keyof typeof colors = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function printHeader(title: string) {
  console.log('\n');
  log('═'.repeat(70), 'cyan');
  log(`  ${title}`, 'cyan');
  log('═'.repeat(70), 'cyan');
  console.log('');
}

function printResult(name: string, success: boolean, details?: string) {
  const icon = success ? '✅' : '❌';
  const color = success ? 'green' : 'red';
  log(`${icon} ${name}`, color);
  if (details) {
    log(`   ${details}`, 'gray');
  }
}

async function testHealthCheck() {
  printHeader('1. Health Check');
  
  try {
    const result = await hfHttpClient.healthCheck();
    
    if (result.success) {
      printResult('Health Check', true, `Status: ${result.data?.status || 'OK'}`);
      return true;
    } else {
      printResult('Health Check', false, `Error: ${result.error}`);
      return false;
    }
  } catch (error: any) {
    printResult('Health Check', false, `Exception: ${error.message}`);
    return false;
  }
}

async function testMarketData() {
  printHeader('2. Market Data');
  
  try {
    const result = await hfHttpClient.getMarketData({ limit: 10 });
    
    if (result.success && result.data) {
      const count = result.data.length;
      const firstCoin = result.data[0];
      printResult(
        'Market Data',
        true,
        `Fetched ${count} coins | First: ${firstCoin.symbol} - $${firstCoin.price}`
      );
      return true;
    } else {
      printResult('Market Data', false, `Error: ${result.error}`);
      return false;
    }
  } catch (error: any) {
    printResult('Market Data', false, `Exception: ${error.message}`);
    return false;
  }
}

async function testPriceChart() {
  printHeader('3. Price Chart (OHLCV)');
  
  try {
    const result = await hfHttpClient.getPriceChart({
      symbol: 'BTC',
      timeframe: '1h',
      limit: 24
    });
    
    if (result.success && result.data) {
      const count = result.data.length;
      const latest = result.data[result.data.length - 1];
      printResult(
        'Price Chart',
        true,
        `Fetched ${count} candles | Latest close: $${latest.close}`
      );
      return true;
    } else {
      printResult('Price Chart', false, `Error: ${result.error}`);
      return false;
    }
  } catch (error: any) {
    printResult('Price Chart', false, `Exception: ${error.message}`);
    return false;
  }
}

async function testNews() {
  printHeader('4. News');
  
  try {
    const result = await hfHttpClient.getNews({ limit: 5 });
    
    if (result.success && result.data) {
      const count = result.data.length;
      const firstNews = result.data[0];
      printResult(
        'News',
        true,
        `Fetched ${count} news items | First: ${firstNews.title.substring(0, 50)}...`
      );
      return true;
    } else {
      printResult('News', false, `Error: ${result.error}`);
      return false;
    }
  } catch (error: any) {
    printResult('News', false, `Exception: ${error.message}`);
    return false;
  }
}

async function testSentiment() {
  printHeader('5. Market Sentiment');
  
  try {
    const result = await hfHttpClient.getSentiment();
    
    if (result.success && result.data) {
      const fgi = result.data.fearGreedIndex || result.data.score || 'N/A';
      const sentiment = result.data.sentiment || 'N/A';
      printResult(
        'Sentiment',
        true,
        `Fear & Greed: ${fgi} | Sentiment: ${sentiment}`
      );
      return true;
    } else {
      printResult('Sentiment', false, `Error: ${result.error}`);
      return false;
    }
  } catch (error: any) {
    printResult('Sentiment', false, `Exception: ${error.message}`);
    return false;
  }
}

async function testMarketStats() {
  printHeader('6. Market Stats');
  
  try {
    const result = await hfHttpClient.getMarketStats();
    
    if (result.success && result.data) {
      const marketCap = result.data.totalMarketCap;
      const volume = result.data.totalVolume24h;
      printResult(
        'Market Stats',
        true,
        `Market Cap: $${marketCap?.toLocaleString() || 'N/A'} | Volume: $${volume?.toLocaleString() || 'N/A'}`
      );
      return true;
    } else {
      printResult('Market Stats', false, `Error: ${result.error}`);
      return false;
    }
  } catch (error: any) {
    printResult('Market Stats', false, `Exception: ${error.message}`);
    return false;
  }
}

async function testAIPrediction() {
  printHeader('7. AI Prediction');
  
  try {
    const result = await hfHttpClient.getAIPrediction({
      symbol: 'BTC',
      timeframe: '1h'
    });
    
    if (result.success && result.data) {
      const action = result.data.action;
      const confidence = (result.data.confidence * 100).toFixed(1);
      printResult(
        'AI Prediction',
        true,
        `Action: ${action.toUpperCase()} | Confidence: ${confidence}%`
      );
      return true;
    } else {
      printResult('AI Prediction', false, `Error: ${result.error}`);
      return false;
    }
  } catch (error: any) {
    printResult('AI Prediction', false, `Exception: ${error.message}`);
    return false;
  }
}

async function testBatchFetch() {
  printHeader('8. Batch Fetch (All Data)');
  
  try {
    const startTime = Date.now();
    
    const result = await hfHttpClient.fetchAllData({
      marketLimit: 10,
      chartSymbol: 'BTC',
      chartLimit: 24,
      newsLimit: 5,
      includeAI: true
    });
    
    const duration = Date.now() - startTime;
    
    if (result.success) {
      const { successful, failed, total } = result.summary;
      printResult(
        'Batch Fetch',
        true,
        `Completed in ${duration}ms | Success: ${successful}/${total} | Failed: ${failed}`
      );
      
      // نمایش جزئیات
      log('\n   Endpoint Details:', 'gray');
      log(`     Market: ${result.data.market.success ? '✅' : '❌'}`, 'gray');
      log(`     Chart: ${result.data.chart.success ? '✅' : '❌'}`, 'gray');
      log(`     News: ${result.data.news.success ? '✅' : '❌'}`, 'gray');
      log(`     Sentiment: ${result.data.sentiment.success ? '✅' : '❌'}`, 'gray');
      log(`     Stats: ${result.data.stats.success ? '✅' : '❌'}`, 'gray');
      if (result.data.ai) {
        log(`     AI: ${result.data.ai.success ? '✅' : '❌'}`, 'gray');
      }
      
      return successful > 0;
    } else {
      printResult('Batch Fetch', false, 'All requests failed');
      return false;
    }
  } catch (error: any) {
    printResult('Batch Fetch', false, `Exception: ${error.message}`);
    return false;
  }
}

async function testConfiguration() {
  printHeader('9. Configuration');
  
  try {
    const config = hfHttpClient.getConfig();
    
    log('Current Configuration:', 'blue');
    log(`  Base URL: ${config.baseUrl}`, 'gray');
    log(`  Has Token: ${config.hasToken ? 'Yes ✅' : 'No ❌'}`, 'gray');
    log(`  Timeout: ${config.timeout}ms`, 'gray');
    log(`  Max Retries: ${config.maxRetries}`, 'gray');
    log(`  Retry Delay: ${config.retryDelay}ms`, 'gray');
    
    printResult('Configuration', true, 'Configuration loaded successfully');
    return true;
  } catch (error: any) {
    printResult('Configuration', false, `Exception: ${error.message}`);
    return false;
  }
}

async function runAllTests() {
  console.log('\n');
  log('╔════════════════════════════════════════════════════════════════════╗', 'cyan');
  log('║                                                                    ║', 'cyan');
  log('║         HuggingFace HTTP-Only Client - Test Suite                 ║', 'cyan');
  log('║                                                                    ║', 'cyan');
  log('╚════════════════════════════════════════════════════════════════════╝', 'cyan');
  
  const startTime = Date.now();
  
  const results = {
    healthCheck: await testHealthCheck(),
    marketData: await testMarketData(),
    priceChart: await testPriceChart(),
    news: await testNews(),
    sentiment: await testSentiment(),
    marketStats: await testMarketStats(),
    aiPrediction: await testAIPrediction(),
    batchFetch: await testBatchFetch(),
    configuration: await testConfiguration()
  };
  
  const duration = Date.now() - startTime;
  
  // خلاصه نتایج
  printHeader('Test Summary');
  
  const total = Object.keys(results).length;
  const passed = Object.values(results).filter(r => r).length;
  const failed = total - passed;
  const passRate = ((passed / total) * 100).toFixed(1);
  
  log(`Total Tests: ${total}`, 'blue');
  log(`Passed: ${passed} ✅`, 'green');
  log(`Failed: ${failed} ❌`, failed > 0 ? 'red' : 'gray');
  log(`Pass Rate: ${passRate}%`, passed === total ? 'green' : 'yellow');
  log(`Duration: ${duration}ms`, 'gray');
  
  console.log('\n');
  
  if (passed === total) {
    log('╔════════════════════════════════════════════════════════════════════╗', 'green');
    log('║                                                                    ║', 'green');
    log('║                   🎉 All Tests Passed! 🎉                          ║', 'green');
    log('║                                                                    ║', 'green');
    log('╚════════════════════════════════════════════════════════════════════╝', 'green');
  } else {
    log('╔════════════════════════════════════════════════════════════════════╗', 'yellow');
    log('║                                                                    ║', 'yellow');
    log('║                   ⚠️  Some Tests Failed  ⚠️                        ║', 'yellow');
    log('║                                                                    ║', 'yellow');
    log('╚════════════════════════════════════════════════════════════════════╝', 'yellow');
  }
  
  console.log('\n');
  
  // خروج با کد مناسب
  process.exit(failed > 0 ? 1 : 0);
}

// اجرای تست‌ها
runAllTests().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
