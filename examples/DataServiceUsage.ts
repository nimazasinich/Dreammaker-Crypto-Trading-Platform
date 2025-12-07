/**
 * DataService Usage Examples
 * 
 * این فایل نمونه‌های استفاده از DataService را نشان می‌دهد
 */

import { dataService } from '../src/services/DataService';

// ============================================================================
// مثال 1: دریافت تمام داده‌ها به صورت موازی
// ============================================================================

async function example1_FetchAllData() {
  console.log('=== Example 1: Fetch All Required Data ===\n');

  try {
    const result = await dataService.fetchAllRequiredData({
      marketLimit: 100,
      chartSymbol: 'BTC',
      chartTimeframe: '1h',
      chartLimit: 100,
      newsLimit: 5,
      includeAI: true
    });

    console.log('Success:', result.success);
    console.log('Summary:', result.summary);
    console.log('\nMarket Data:', result.data.market.success ? 'OK' : 'FAILED');
    console.log('Price Chart:', result.data.chart.success ? 'OK' : 'FAILED');
    console.log('News:', result.data.news.success ? 'OK' : 'FAILED');
    console.log('Sentiment:', result.data.sentiment.success ? 'OK' : 'FAILED');
    console.log('Stats:', result.data.stats.success ? 'OK' : 'FAILED');
    
    if (result.data.ai) {
      console.log('AI Prediction:', result.data.ai.success ? 'OK' : 'FAILED');
    }

    // نمایش داده‌های بازار
    if (result.data.market.success && result.data.market.data) {
      const marketData = Array.isArray(result.data.market.data) 
        ? result.data.market.data 
        : (result.data.market.data as any).items || (result.data.market.data as any).data || [];
      
      console.log('\nTop 5 Coins:');
      marketData.slice(0, 5).forEach((coin: any) => {
        console.log(`  ${coin.symbol}: $${coin.price} (${coin.change_24h > 0 ? '+' : ''}${coin.change_24h.toFixed(2)}%)`);
      });
    }

  } catch (error) {
    console.error('Error:', error);
  }
}

// ============================================================================
// مثال 2: دریافت داده‌های بازار
// ============================================================================

async function example2_GetMarketData() {
  console.log('\n=== Example 2: Get Market Data ===\n');

  try {
    const response = await dataService.getMarketData(100);

    if (response.success && response.data) {
      const marketData = Array.isArray(response.data) 
        ? response.data 
        : (response.data as any).items || (response.data as any).data || [];

      console.log(`Fetched ${marketData.length} coins`);
      console.log('Method:', response.method); // 'http' or 'websocket'
      console.log('\nTop 10 Coins:');
      
      marketData.slice(0, 10).forEach((coin: any, index: number) => {
        console.log(`${index + 1}. ${coin.symbol.padEnd(8)} $${coin.price.toFixed(2).padStart(12)} ${coin.change_24h > 0 ? '+' : ''}${coin.change_24h.toFixed(2)}%`);
      });
    } else {
      console.error('Failed to fetch market data:', response.error);
    }

  } catch (error) {
    console.error('Error:', error);
  }
}

// ============================================================================
// مثال 3: دریافت نمودار قیمت
// ============================================================================

async function example3_GetPriceChart() {
  console.log('\n=== Example 3: Get Price Chart ===\n');

  try {
    const response = await dataService.getPriceChart('BTC', '1h', 100);

    if (response.success && response.data) {
      const chartData = response.data;
      console.log(`Fetched ${chartData.length} candles for BTC (1h)`);
      console.log('Method:', response.method);
      
      if (chartData.length > 0) {
        const latest = chartData[chartData.length - 1];
        console.log('\nLatest Candle:');
        console.log(`  Open:   $${latest.open}`);
        console.log(`  High:   $${latest.high}`);
        console.log(`  Low:    $${latest.low}`);
        console.log(`  Close:  $${latest.close}`);
        console.log(`  Volume: ${latest.volume}`);
      }
    } else {
      console.error('Failed to fetch price chart:', response.error);
    }

  } catch (error) {
    console.error('Error:', error);
  }
}

// ============================================================================
// مثال 4: دریافت اخبار
// ============================================================================

async function example4_GetNews() {
  console.log('\n=== Example 4: Get Latest News ===\n');

  try {
    const response = await dataService.getNews(5);

    if (response.success && response.data) {
      const newsData = Array.isArray(response.data) 
        ? response.data 
        : (response.data as any).news || (response.data as any).items || (response.data as any).data || [];

      console.log(`Fetched ${newsData.length} news items`);
      console.log('Method:', response.method);
      console.log('\nLatest News:');
      
      newsData.forEach((news: any, index: number) => {
        console.log(`\n${index + 1}. ${news.title}`);
        console.log(`   Source: ${news.source || 'Unknown'}`);
        console.log(`   URL: ${news.url}`);
        if (news.sentiment) {
          console.log(`   Sentiment: ${news.sentiment}`);
        }
      });
    } else {
      console.error('Failed to fetch news:', response.error);
    }

  } catch (error) {
    console.error('Error:', error);
  }
}

// ============================================================================
// مثال 5: دریافت احساسات بازار
// ============================================================================

async function example5_GetSentiment() {
  console.log('\n=== Example 5: Get Market Sentiment ===\n');

  try {
    const response = await dataService.getSentiment();

    if (response.success && response.data) {
      const sentiment = response.data;
      console.log('Method:', response.method);
      console.log('\nMarket Sentiment:');
      
      if (sentiment.fearGreedIndex !== undefined) {
        console.log(`  Fear & Greed Index: ${sentiment.fearGreedIndex}`);
      }
      if (sentiment.sentiment) {
        console.log(`  Sentiment: ${sentiment.sentiment}`);
      }
      if (sentiment.score !== undefined) {
        console.log(`  Score: ${sentiment.score}`);
      }
      if (sentiment.value !== undefined) {
        console.log(`  Value: ${sentiment.value}`);
      }
      if (sentiment.value_classification) {
        console.log(`  Classification: ${sentiment.value_classification}`);
      }
    } else {
      console.error('Failed to fetch sentiment:', response.error);
    }

  } catch (error) {
    console.error('Error:', error);
  }
}

// ============================================================================
// مثال 6: دریافت آمار بازار
// ============================================================================

async function example6_GetMarketStats() {
  console.log('\n=== Example 6: Get Market Statistics ===\n');

  try {
    const response = await dataService.getMarketStats();

    if (response.success && response.data) {
      const stats = response.data;
      console.log('Method:', response.method);
      console.log('\nMarket Statistics:');
      console.log(`  Total Market Cap: $${(stats.totalMarketCap / 1e9).toFixed(2)}B`);
      console.log(`  Total Volume 24h: $${(stats.totalVolume24h / 1e9).toFixed(2)}B`);
      console.log(`  BTC Dominance: ${stats.btcDominance.toFixed(2)}%`);
      
      if (stats.ethDominance !== undefined) {
        console.log(`  ETH Dominance: ${stats.ethDominance.toFixed(2)}%`);
      }
      if (stats.marketCapChange24h !== undefined) {
        console.log(`  Market Cap Change 24h: ${stats.marketCapChange24h > 0 ? '+' : ''}${stats.marketCapChange24h.toFixed(2)}%`);
      }
      if (stats.activeCryptocurrencies !== undefined) {
        console.log(`  Active Cryptocurrencies: ${stats.activeCryptocurrencies}`);
      }
    } else {
      console.error('Failed to fetch market stats:', response.error);
    }

  } catch (error) {
    console.error('Error:', error);
  }
}

// ============================================================================
// مثال 7: دریافت پیش‌بینی AI
// ============================================================================

async function example7_GetAIPrediction() {
  console.log('\n=== Example 7: Get AI Prediction ===\n');

  try {
    const response = await dataService.getAIPredictions({
      model: 'predictor',
      symbol: 'BTC',
      timeframe: '1h',
      indicators: ['RSI', 'MACD', 'EMA']
    });

    if (response.success && response.data) {
      const prediction = response.data;
      console.log('Method:', response.method);
      console.log('\nAI Prediction:');
      console.log(`  Symbol: ${prediction.symbol}`);
      console.log(`  Action: ${prediction.action.toUpperCase()}`);
      console.log(`  Confidence: ${(prediction.confidence * 100).toFixed(2)}%`);
      
      if (prediction.prediction !== undefined) {
        console.log(`  Predicted Price: $${prediction.prediction}`);
      }
      if (prediction.timeframe) {
        console.log(`  Timeframe: ${prediction.timeframe}`);
      }
      if (prediction.reasoning) {
        console.log(`  Reasoning: ${prediction.reasoning}`);
      }
    } else {
      console.error('Failed to fetch AI prediction:', response.error);
    }

  } catch (error) {
    console.error('Error:', error);
  }
}

// ============================================================================
// مثال 8: بررسی سلامت سرویس
// ============================================================================

async function example8_HealthCheck() {
  console.log('\n=== Example 8: Health Check ===\n');

  try {
    const response = await dataService.healthCheck();

    if (response.success && response.data) {
      console.log('Service Status:', response.data.status);
      console.log('Method:', response.method);
      
      if (response.data.uptime !== undefined) {
        console.log(`Uptime: ${response.data.uptime}s`);
      }
    } else {
      console.error('Health check failed:', response.error);
    }

  } catch (error) {
    console.error('Error:', error);
  }
}

// ============================================================================
// مثال 9: نمایش تنظیمات فعلی
// ============================================================================

function example9_ShowConfig() {
  console.log('\n=== Example 9: Current Configuration ===\n');

  const config = dataService.getConfig();
  
  console.log('Configuration:');
  console.log(`  Base URL: ${config.baseUrl}`);
  console.log(`  WebSocket URL: ${config.wsBase}`);
  console.log(`  Has Token: ${config.hasToken}`);
  console.log(`  Timeout: ${config.timeout}ms`);
  console.log(`  Max Retries: ${config.maxRetries}`);
  console.log(`  Retry Delay: ${config.retryDelay}ms`);
}

// ============================================================================
// اجرای تمام مثال‌ها
// ============================================================================

async function runAllExamples() {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║         DataService Usage Examples                        ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  // نمایش تنظیمات
  example9_ShowConfig();

  // اجرای مثال‌ها
  await example1_FetchAllData();
  await example2_GetMarketData();
  await example3_GetPriceChart();
  await example4_GetNews();
  await example5_GetSentiment();
  await example6_GetMarketStats();
  await example7_GetAIPrediction();
  await example8_HealthCheck();

  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║         All Examples Completed                            ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');
}

// اجرا
if (require.main === module) {
  runAllExamples().catch(console.error);
}

export {
  example1_FetchAllData,
  example2_GetMarketData,
  example3_GetPriceChart,
  example4_GetNews,
  example5_GetSentiment,
  example6_GetMarketStats,
  example7_GetAIPrediction,
  example8_HealthCheck,
  example9_ShowConfig,
  runAllExamples
};
