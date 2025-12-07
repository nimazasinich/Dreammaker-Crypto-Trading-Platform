/**
 * مثال‌های استفاده از HFHttpOnlyClient
 * 
 * این فایل نمونه‌های مختلف استفاده از کلاینت HTTP-Only را نشان می‌دهد.
 */

import { HFHttpOnlyClient, hfHttpClient } from '../src/services/HFHttpOnlyClient.js';

// ============================================================================
// مثال 1: استفاده از Singleton Instance
// ============================================================================

async function example1_UsingSingleton() {
  console.log('=== Example 1: Using Singleton Instance ===\n');

  // دریافت داده‌های بازار
  const marketData = await hfHttpClient.getMarketData({ limit: 10 });
  
  if (marketData.success) {
    console.log('✅ Market data fetched successfully');
    console.log(`   Found ${marketData.data?.length} coins`);
    console.log(`   First coin: ${marketData.data?.[0]?.symbol} - $${marketData.data?.[0]?.price}`);
  } else {
    console.error('❌ Failed to fetch market data:', marketData.error);
  }

  console.log('\n');
}

// ============================================================================
// مثال 2: ایجاد Instance جدید با تنظیمات سفارشی
// ============================================================================

async function example2_CustomInstance() {
  console.log('=== Example 2: Custom Instance with Configuration ===\n');

  const customClient = new HFHttpOnlyClient({
    baseUrl: process.env.HF_API_URL || 'https://Really-amin-Datasourceforcryptocurrency-2.hf.space',
    token: process.env.HF_API_TOKEN || 'hf_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx', // Use environment variable
    timeout: 15000, // 15 ثانیه
    maxRetries: 5,
    retryDelay: 2000 // 2 ثانیه
  });

  // بررسی سلامت سرویس
  const health = await customClient.healthCheck();
  
  if (health.success) {
    console.log('✅ Service is healthy');
    console.log(`   Status: ${health.data?.status}`);
  } else {
    console.error('❌ Service health check failed:', health.error);
  }

  console.log('\n');
}

// ============================================================================
// مثال 3: دریافت داده‌های نمودار قیمت
// ============================================================================

async function example3_PriceChart() {
  console.log('=== Example 3: Fetching Price Chart (OHLCV) ===\n');

  const chartData = await hfHttpClient.getPriceChart({
    symbol: 'BTC',
    timeframe: '1h',
    limit: 24 // 24 ساعت گذشته
  });

  if (chartData.success && chartData.data) {
    console.log('✅ Chart data fetched successfully');
    console.log(`   Data points: ${chartData.data.length}`);
    
    const latest = chartData.data[chartData.data.length - 1];
    console.log(`   Latest candle:`);
    console.log(`     Open: $${latest.open}`);
    console.log(`     High: $${latest.high}`);
    console.log(`     Low: $${latest.low}`);
    console.log(`     Close: $${latest.close}`);
    console.log(`     Volume: ${latest.volume}`);
  } else {
    console.error('❌ Failed to fetch chart data:', chartData.error);
  }

  console.log('\n');
}

// ============================================================================
// مثال 4: دریافت اخبار و احساسات
// ============================================================================

async function example4_NewsAndSentiment() {
  console.log('=== Example 4: Fetching News and Sentiment ===\n');

  // دریافت اخبار
  const news = await hfHttpClient.getNews({ limit: 5 });
  
  if (news.success && news.data) {
    console.log('✅ News fetched successfully');
    console.log(`   Total news: ${news.data.length}`);
    news.data.slice(0, 3).forEach((item, index) => {
      console.log(`   ${index + 1}. ${item.title}`);
      console.log(`      URL: ${item.url}`);
    });
  } else {
    console.error('❌ Failed to fetch news:', news.error);
  }

  console.log('');

  // دریافت احساسات بازار
  const sentiment = await hfHttpClient.getSentiment();
  
  if (sentiment.success && sentiment.data) {
    console.log('✅ Sentiment data fetched successfully');
    console.log(`   Fear & Greed Index: ${sentiment.data.fearGreedIndex || 'N/A'}`);
    console.log(`   Sentiment: ${sentiment.data.sentiment || 'N/A'}`);
    console.log(`   Score: ${sentiment.data.score || 'N/A'}`);
  } else {
    console.error('❌ Failed to fetch sentiment:', sentiment.error);
  }

  console.log('\n');
}

// ============================================================================
// مثال 5: دریافت پیش‌بینی AI
// ============================================================================

async function example5_AIPrediction() {
  console.log('=== Example 5: AI Prediction ===\n');

  const prediction = await hfHttpClient.getAIPrediction({
    symbol: 'BTC',
    timeframe: '1h',
    indicators: ['RSI', 'MACD', 'EMA']
  });

  if (prediction.success && prediction.data) {
    console.log('✅ AI prediction received');
    console.log(`   Symbol: ${prediction.data.symbol}`);
    console.log(`   Action: ${prediction.data.action.toUpperCase()}`);
    console.log(`   Confidence: ${(prediction.data.confidence * 100).toFixed(2)}%`);
    if (prediction.data.reasoning) {
      console.log(`   Reasoning: ${prediction.data.reasoning}`);
    }
  } else {
    console.error('❌ Failed to get AI prediction:', prediction.error);
  }

  console.log('\n');
}

// ============================================================================
// مثال 6: دریافت تمام داده‌ها به صورت موازی (Batch)
// ============================================================================

async function example6_BatchFetch() {
  console.log('=== Example 6: Batch Fetch All Data ===\n');

  const startTime = Date.now();

  const allData = await hfHttpClient.fetchAllData({
    marketLimit: 50,
    chartSymbol: 'BTC',
    chartTimeframe: '1h',
    chartLimit: 100,
    newsLimit: 10,
    includeAI: true
  });

  const duration = Date.now() - startTime;

  console.log(`✅ Batch fetch completed in ${duration}ms`);
  console.log(`   Total requests: ${allData.summary.total}`);
  console.log(`   Successful: ${allData.summary.successful}`);
  console.log(`   Failed: ${allData.summary.failed}`);
  console.log('');

  // نمایش وضعیت هر endpoint
  console.log('Endpoint Status:');
  console.log(`   Market Data: ${allData.data.market.success ? '✅' : '❌'}`);
  console.log(`   Price Chart: ${allData.data.chart.success ? '✅' : '❌'}`);
  console.log(`   News: ${allData.data.news.success ? '✅' : '❌'}`);
  console.log(`   Sentiment: ${allData.data.sentiment.success ? '✅' : '❌'}`);
  console.log(`   Market Stats: ${allData.data.stats.success ? '✅' : '❌'}`);
  if (allData.data.ai) {
    console.log(`   AI Prediction: ${allData.data.ai.success ? '✅' : '❌'}`);
  }

  console.log('\n');
}

// ============================================================================
// مثال 7: مدیریت خطا و Retry
// ============================================================================

async function example7_ErrorHandling() {
  console.log('=== Example 7: Error Handling and Retry ===\n');

  // تلاش برای دریافت داده با endpoint نامعتبر
  const invalidClient = new HFHttpOnlyClient({
    baseUrl: 'https://invalid-url-that-does-not-exist.com',
    timeout: 5000,
    maxRetries: 2,
    retryDelay: 1000
  });

  console.log('Attempting to fetch from invalid URL...');
  const result = await invalidClient.getMarketData({ limit: 10 });

  if (!result.success) {
    console.log('❌ Request failed as expected');
    console.log(`   Error: ${result.error}`);
    console.log(`   Status: ${result.status}`);
  }

  console.log('\n');
}

// ============================================================================
// مثال 8: به‌روزرسانی تنظیمات در زمان اجرا
// ============================================================================

async function example8_RuntimeConfig() {
  console.log('=== Example 8: Runtime Configuration Update ===\n');

  // نمایش تنظیمات فعلی
  const currentConfig = hfHttpClient.getConfig();
  console.log('Current configuration:');
  console.log(`   Base URL: ${currentConfig.baseUrl}`);
  console.log(`   Has Token: ${currentConfig.hasToken}`);
  console.log(`   Timeout: ${currentConfig.timeout}ms`);
  console.log(`   Max Retries: ${currentConfig.maxRetries}`);
  console.log('');

  // به‌روزرسانی تنظیمات
  hfHttpClient.updateConfig({
    timeout: 20000,
    maxRetries: 5
  });

  const updatedConfig = hfHttpClient.getConfig();
  console.log('Updated configuration:');
  console.log(`   Timeout: ${updatedConfig.timeout}ms`);
  console.log(`   Max Retries: ${updatedConfig.maxRetries}`);

  console.log('\n');
}

// ============================================================================
// اجرای تمام مثال‌ها
// ============================================================================

async function runAllExamples() {
  console.log('\n');
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║  HuggingFace HTTP-Only Client - Usage Examples            ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  console.log('\n');

  try {
    await example1_UsingSingleton();
    await example2_CustomInstance();
    await example3_PriceChart();
    await example4_NewsAndSentiment();
    await example5_AIPrediction();
    await example6_BatchFetch();
    await example7_ErrorHandling();
    await example8_RuntimeConfig();

    console.log('╔════════════════════════════════════════════════════════════╗');
    console.log('║  All examples completed successfully!                     ║');
    console.log('╚════════════════════════════════════════════════════════════╝');
    console.log('\n');
  } catch (error) {
    console.error('Error running examples:', error);
  }
}

// اجرا در صورت فراخوانی مستقیم
if (import.meta.url === `file://${process.argv[1]}`) {
  runAllExamples();
}

export {
  example1_UsingSingleton,
  example2_CustomInstance,
  example3_PriceChart,
  example4_NewsAndSentiment,
  example5_AIPrediction,
  example6_BatchFetch,
  example7_ErrorHandling,
  example8_RuntimeConfig,
  runAllExamples
};
