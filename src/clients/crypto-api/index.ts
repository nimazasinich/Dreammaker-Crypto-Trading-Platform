/**
 * Crypto Data API Client
 * 
 * A comprehensive TypeScript/JavaScript client for accessing cryptocurrency data
 * from the HuggingFace Space service.
 * 
 * @packageDocumentation
 */

// Export main client class
export { CryptoDataClient } from './crypto-client';
export { CryptoAPIError } from './crypto-client';
export type { CryptoAPIError as CryptoAPIErrorType } from './crypto-client';

// Export all types
export type {
  // Configuration
  CryptoClientConfig,
  
  // Health & Status
  HealthResponse,
  StatusResponse,
  RouterInfo,
  RoutersResponse,
  
  // Price & Rate
  RateResponse,
  BatchRatesResponse,
  CoinData,
  TopCoinsResponse,
  TrendingCoin,
  TrendingResponse,
  
  // Market Data
  MarketResponse,
  MarketStatusResponse,
  HistoryDataPoint,
  HistoryResponse,
  
  // Sentiment Analysis
  SentimentValue,
  SentimentHistoryPoint,
  SentimentResponse,
  AssetSentimentResponse,
  TextAnalysisResponse,
  
  // News
  NewsArticle,
  NewsResponse,
  
  // AI Models
  ModelInfo,
  ModelsListResponse,
  ModelStatusInfo,
  ModelsStatusResponse,
  ModelHealthInfo,
  ModelsHealthResponse,
  ModelsSummaryResponse,
  ModelTestResponse,
  ReinitializeResponse,
  
  // AI Signals
  SignalType,
  AISignal,
  SignalsResponse,
  TradingHorizon,
  RiskTolerance,
  DecisionType,
  AIDecisionRequest,
  AIDecisionTargets,
  AIDecisionSignal,
  AIDecisionResponse,
  
  // Resources
  ResourceStats,
  ResourcesResponse,
  ResourcesSummaryResponse,
  ResourceCategory,
  ResourceCategoriesResponse,
  ProviderStatus,
  ProviderInfo,
  ProvidersResponse,
  
  // Errors
  APIErrorResponse,
} from './types';

// Export default instance
import { CryptoDataClient } from './crypto-client';
export default CryptoDataClient;

/**
 * Create a new client instance with default configuration
 * 
 * @example
 * ```typescript
 * import { createClient } from './crypto-api';
 * 
 * const client = createClient();
 * const health = await client.health();
 * ```
 */
export function createClient(config?: any) {
  return new CryptoDataClient(config);
}

// ============================================
// Usage Examples
// ============================================

/**
 * Example 1: Basic Health Check
 */
export async function exampleHealthCheck() {
  const client = new CryptoDataClient();
  
  try {
    const health = await client.health();
    console.log('✅ سلامت سرویس:', health.status);
    console.log('📊 نسخه:', health.version);
    return health;
  } catch (error) {
    console.error('❌ خطا در بررسی سلامت:', error);
    throw error;
  }
}

/**
 * Example 2: Get Bitcoin Price
 */
export async function exampleGetBitcoinPrice() {
  const client = new CryptoDataClient();
  
  try {
    const rate = await client.getRate('BTC/USDT');
    console.log('💰 قیمت BTC:', rate.price);
    console.log('📈 تغییر 24 ساعته:', rate.change24h, '%');
    console.log('📊 حجم 24 ساعته:', rate.volume24h);
    return rate;
  } catch (error) {
    console.error('❌ خطا در دریافت قیمت:', error);
    throw error;
  }
}

/**
 * Example 3: Get Multiple Rates
 */
export async function exampleGetMultipleRates() {
  const client = new CryptoDataClient();
  
  try {
    const pairs = ['BTC/USDT', 'ETH/USDT', 'BNB/USDT'];
    const rates = await client.getBatchRates(pairs);
    
    console.log('💹 نرخ‌های دریافت شده:', rates.count);
    rates.rates.forEach(rate => {
      console.log(`${rate.pair}: $${rate.price} (${rate.change24h > 0 ? '📈' : '📉'} ${rate.change24h}%)`);
    });
    
    return rates;
  } catch (error) {
    console.error('❌ خطا در دریافت نرخ‌ها:', error);
    throw error;
  }
}

/**
 * Example 4: Get Market Sentiment
 */
export async function exampleGetMarketSentiment() {
  const client = new CryptoDataClient();
  
  try {
    const sentiment = await client.getGlobalSentiment('1D');
    console.log('😱 شاخص ترس و طمع:', sentiment.fear_greed_index);
    console.log('🎭 احساس بازار:', sentiment.sentiment);
    console.log('🎯 اطمینان:', sentiment.confidence);
    
    // نمایش تاریخچه
    console.log('📊 تاریخچه احساسات:');
    sentiment.history.slice(0, 5).forEach(point => {
      const date = new Date(point.timestamp * 1000);
      console.log(`  ${date.toLocaleDateString()}: ${point.sentiment}`);
    });
    
    return sentiment;
  } catch (error) {
    console.error('❌ خطا در دریافت احساسات:', error);
    throw error;
  }
}

/**
 * Example 5: Analyze Text Sentiment
 */
export async function exampleAnalyzeText() {
  const client = new CryptoDataClient();
  
  try {
    const texts = [
      'Bitcoin is pumping hard today!',
      'Market is crashing, sell everything!',
      'Steady growth in the crypto market'
    ];
    
    console.log('🤖 تحلیل احساسات متن:');
    for (const text of texts) {
      const analysis = await client.analyzeText(text);
      console.log(`\n📝 متن: "${text}"`);
      console.log(`   احساس: ${analysis.sentiment} (امتیاز: ${analysis.score})`);
      console.log(`   کلمات کلیدی: ${analysis.keywords.join(', ')}`);
    }
  } catch (error) {
    console.error('❌ خطا در تحلیل متن:', error);
    throw error;
  }
}

/**
 * Example 6: Get Top Coins
 */
export async function exampleGetTopCoins() {
  const client = new CryptoDataClient();
  
  try {
    const topCoins = await client.getTopCoins(10);
    console.log('🏆 10 ارز برتر بازار:');
    
    topCoins.coins.forEach(coin => {
      console.log(`\n${coin.rank}. ${coin.name} (${coin.symbol})`);
      console.log(`   قیمت: $${coin.price.toLocaleString()}`);
      console.log(`   ارزش بازار: $${(coin.market_cap / 1e9).toFixed(2)}B`);
      console.log(`   تغییر 24h: ${coin.change_24h > 0 ? '📈' : '📉'} ${coin.change_24h.toFixed(2)}%`);
    });
    
    return topCoins;
  } catch (error) {
    console.error('❌ خطا در دریافت ارزهای برتر:', error);
    throw error;
  }
}

/**
 * Example 7: Get AI Trading Signals
 */
export async function exampleGetAISignals() {
  const client = new CryptoDataClient();
  
  try {
    const signals = await client.getSignals('BTC');
    console.log('🤖 سیگنال‌های معاملاتی AI برای BTC:');
    
    signals.signals.forEach(signal => {
      const emoji = signal.type === 'buy' ? '🟢' : signal.type === 'sell' ? '🔴' : '🟡';
      console.log(`\n${emoji} ${signal.type.toUpperCase()}`);
      console.log(`   امتیاز: ${signal.score}`);
      console.log(`   اطمینان: ${(signal.confidence * 100).toFixed(1)}%`);
      console.log(`   مدل: ${signal.model}`);
    });
    
    return signals;
  } catch (error) {
    console.error('❌ خطا در دریافت سیگنال‌ها:', error);
    throw error;
  }
}

/**
 * Example 8: Get AI Trading Decision
 */
export async function exampleGetAIDecision() {
  const client = new CryptoDataClient();
  
  try {
    const decision = await client.getDecision({
      symbol: 'BTC',
      horizon: 'swing',
      risk_tolerance: 'moderate'
    });
    
    console.log('🎯 تصمیم AI برای معامله BTC:');
    console.log(`\n🎲 تصمیم: ${decision.decision}`);
    console.log(`📊 اطمینان: ${(decision.confidence * 100).toFixed(1)}%`);
    console.log(`📝 خلاصه: ${decision.summary}`);
    
    console.log('\n🎯 اهداف قیمتی:');
    console.log(`   حمایت: $${decision.targets.support.toLocaleString()}`);
    console.log(`   مقاومت: $${decision.targets.resistance.toLocaleString()}`);
    console.log(`   هدف: $${decision.targets.target.toLocaleString()}`);
    
    console.log('\n⚠️ ریسک‌ها:');
    decision.risks.forEach(risk => console.log(`   - ${risk}`));
    
    return decision;
  } catch (error) {
    console.error('❌ خطا در دریافت تصمیم AI:', error);
    throw error;
  }
}

/**
 * Example 9: Get Latest News
 */
export async function exampleGetNews() {
  const client = new CryptoDataClient();
  
  try {
    const news = await client.getLatestNews(5);
    console.log('📰 آخرین اخبار کریپتو:');
    
    news.articles.forEach((article, index) => {
      console.log(`\n${index + 1}. ${article.title}`);
      console.log(`   منبع: ${article.source}`);
      console.log(`   احساس: ${article.sentiment}`);
      console.log(`   تاریخ: ${new Date(article.published_at).toLocaleString('fa-IR')}`);
      console.log(`   تگ‌ها: ${article.tags.join(', ')}`);
    });
    
    return news;
  } catch (error) {
    console.error('❌ خطا در دریافت اخبار:', error);
    throw error;
  }
}

/**
 * Example 10: Get Market Overview
 */
export async function exampleGetMarketOverview() {
  const client = new CryptoDataClient();
  
  try {
    const market = await client.getMarket();
    console.log('🌍 نمای کلی بازار کریپتو:');
    console.log(`\n💰 ارزش کل بازار: $${(market.total_market_cap / 1e12).toFixed(2)}T`);
    console.log(`📊 حجم کل 24h: $${(market.total_volume / 1e9).toFixed(2)}B`);
    console.log(`₿ تسلط بیت‌کوین: ${market.btc_dominance.toFixed(2)}%`);
    console.log(`Ξ تسلط اتریوم: ${market.eth_dominance.toFixed(2)}%`);
    console.log(`🪙 تعداد ارزهای فعال: ${market.active_coins.toLocaleString()}`);
    
    return market;
  } catch (error) {
    console.error('❌ خطا در دریافت نمای کلی بازار:', error);
    throw error;
  }
}

/**
 * Example 11: Complete Workflow
 * این مثال یک گردش کار کامل را نمایش می‌دهد
 */
export async function exampleCompleteWorkflow() {
  const client = new CryptoDataClient();
  
  console.log('🚀 شروع گردش کار کامل...\n');
  
  try {
    // 1. بررسی سلامت سرویس
    console.log('1️⃣ بررسی سلامت سرویس...');
    const health = await client.health();
    console.log(`   ✅ وضعیت: ${health.status}\n`);
    
    // 2. دریافت نمای کلی بازار
    console.log('2️⃣ دریافت نمای کلی بازار...');
    const market = await client.getMarket();
    console.log(`   💰 ارزش کل: $${(market.total_market_cap / 1e12).toFixed(2)}T\n`);
    
    // 3. دریافت احساسات بازار
    console.log('3️⃣ تحلیل احساسات بازار...');
    const sentiment = await client.getGlobalSentiment('1D');
    console.log(`   😱 شاخص ترس و طمع: ${sentiment.fear_greed_index}`);
    console.log(`   🎭 احساس: ${sentiment.sentiment}\n`);
    
    // 4. دریافت قیمت بیت‌کوین
    console.log('4️⃣ دریافت قیمت بیت‌کوین...');
    const btcRate = await client.getRate('BTC/USDT');
    console.log(`   💰 قیمت: $${btcRate.price.toLocaleString()}`);
    console.log(`   📈 تغییر 24h: ${btcRate.change24h.toFixed(2)}%\n`);
    
    // 5. دریافت سیگنال‌های AI
    console.log('5️⃣ دریافت سیگنال‌های AI...');
    const signals = await client.getSignals('BTC');
    console.log(`   🤖 تعداد سیگنال‌ها: ${signals.count}\n`);
    
    // 6. دریافت تصمیم AI
    console.log('6️⃣ دریافت تصمیم معاملاتی AI...');
    const decision = await client.getDecision({
      symbol: 'BTC',
      horizon: 'swing',
      risk_tolerance: 'moderate'
    });
    console.log(`   🎲 تصمیم: ${decision.decision}`);
    console.log(`   📊 اطمینان: ${(decision.confidence * 100).toFixed(1)}%\n`);
    
    // 7. دریافت آخرین اخبار
    console.log('7️⃣ دریافت آخرین اخبار...');
    const news = await client.getLatestNews(3);
    console.log(`   📰 تعداد اخبار: ${news.count}\n`);
    
    console.log('✅ گردش کار با موفقیت تکمیل شد!');
    
    return {
      health,
      market,
      sentiment,
      btcRate,
      signals,
      decision,
      news
    };
  } catch (error) {
    console.error('❌ خطا در گردش کار:', error);
    throw error;
  }
}

/**
 * Main function to run all examples
 * برای اجرای تمام مثال‌ها از این تابع استفاده کنید
 */
export async function runAllExamples() {
  console.log('🎯 اجرای تمام مثال‌های کلاینت API\n');
  console.log('='.repeat(60));
  
  const examples = [
    { name: 'بررسی سلامت', fn: exampleHealthCheck },
    { name: 'قیمت بیت‌کوین', fn: exampleGetBitcoinPrice },
    { name: 'نرخ چند ارز', fn: exampleGetMultipleRates },
    { name: 'احساسات بازار', fn: exampleGetMarketSentiment },
    { name: 'تحلیل متن', fn: exampleAnalyzeText },
    { name: 'ارزهای برتر', fn: exampleGetTopCoins },
    { name: 'سیگنال‌های AI', fn: exampleGetAISignals },
    { name: 'تصمیم AI', fn: exampleGetAIDecision },
    { name: 'اخبار', fn: exampleGetNews },
    { name: 'نمای کلی بازار', fn: exampleGetMarketOverview },
  ];
  
  for (const example of examples) {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`📍 مثال: ${example.name}`);
    console.log('='.repeat(60));
    
    try {
      await example.fn();
      console.log(`\n✅ ${example.name} با موفقیت اجرا شد`);
    } catch (error) {
      console.error(`\n❌ خطا در ${example.name}:`, error);
    }
    
    // Small delay between examples
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('🎉 تمام مثال‌ها اجرا شدند!');
  console.log('='.repeat(60));
}

// For direct execution
if (require.main === module) {
  runAllExamples().catch(console.error);
}
