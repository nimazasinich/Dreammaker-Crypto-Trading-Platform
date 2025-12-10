# 🚀 کلاینت TypeScript/JavaScript برای API داده‌های کریپتو

<div dir="rtl">

یک کلاینت کامل و قدرتمند TypeScript/JavaScript برای دسترسی به سرویس داده‌های کریپتوکارنسی مستقر در HuggingFace Space.

## 📋 فهرست محتوا

- [ویژگی‌ها](#-ویژگیها)
- [نصب](#-نصب)
- [شروع سریع](#-شروع-سریع)
- [مستندات API](#-مستندات-api)
- [مثال‌های کاربردی](#-مثالهای-کاربردی)
- [پیکربندی](#-پیکربندی)
- [مدیریت خطا](#-مدیریت-خطا)
- [مشارکت](#-مشارکت)

## ✨ ویژگی‌ها

- ✅ **TypeScript Native**: تایپ‌های کامل برای تمام API ها
- ✅ **Async/Await**: تمام توابع به صورت Promise-based
- ✅ **خطاهای سفارشی**: مدیریت حرفه‌ای خطاها
- ✅ **Retry Logic**: تلاش مجدد خودکار در صورت شکست
- ✅ **Timeout**: کنترل زمان انتظار درخواست‌ها
- ✅ **Zero Dependencies**: فقط axios به عنوان وابستگی
- ✅ **Browser & Node.js**: سازگار با هر دو محیط
- ✅ **مستندات کامل**: JSDoc برای تمام متدها

## 📦 نصب

```bash
# با npm
npm install @dreammaker/crypto-api-client

# با yarn
yarn add @dreammaker/crypto-api-client

# با pnpm
pnpm add @dreammaker/crypto-api-client
```

## 🚀 شروع سریع

```typescript
import { CryptoDataClient } from '@dreammaker/crypto-api-client';

// ایجاد نمونه کلاینت
const client = new CryptoDataClient();

// استفاده از API
async function main() {
  // بررسی سلامت سرویس
  const health = await client.health();
  console.log('وضعیت سرویس:', health.status);

  // دریافت قیمت بیت‌کوین
  const btcRate = await client.getRate('BTC/USDT');
  console.log('قیمت BTC:', btcRate.price);

  // دریافت احساسات بازار
  const sentiment = await client.getGlobalSentiment('1D');
  console.log('شاخص ترس و طمع:', sentiment.fear_greed_index);
}

main().catch(console.error);
```

## 📚 مستندات API

### 1️⃣ گروه سلامت و وضعیت

#### `health()`
بررسی سلامت سرویس API

```typescript
const health = await client.health();
// {
//   status: "healthy",
//   timestamp: "2024-01-01T00:00:00Z",
//   service: "crypto-api",
//   version: "1.0.0"
// }
```

#### `status()`
دریافت وضعیت سیستم

```typescript
const status = await client.status();
```

#### `getRouters()`
دریافت لیست روترهای موجود

```typescript
const routers = await client.getRouters();
```

---

### 2️⃣ گروه قیمت و نرخ ارز

#### `getRate(pair: string)`
دریافت نرخ یک جفت ارز

```typescript
const rate = await client.getRate('BTC/USDT');
console.log(`قیمت: $${rate.price}`);
console.log(`تغییر 24h: ${rate.change24h}%`);
```

#### `getBatchRates(pairs: string[])`
دریافت نرخ چندین ارز به صورت یکجا

```typescript
const rates = await client.getBatchRates([
  'BTC/USDT',
  'ETH/USDT',
  'BNB/USDT'
]);

rates.rates.forEach(rate => {
  console.log(`${rate.pair}: $${rate.price}`);
});
```

#### `getTopCoins(limit?: number)`
دریافت برترین ارزهای بازار

```typescript
const topCoins = await client.getTopCoins(10);
topCoins.coins.forEach(coin => {
  console.log(`${coin.rank}. ${coin.name}: $${coin.price}`);
});
```

#### `getTrending()`
دریافت ارزهای ترند

```typescript
const trending = await client.getTrending();
```

---

### 3️⃣ گروه داده‌های بازار

#### `getMarket()`
دریافت نمای کلی بازار

```typescript
const market = await client.getMarket();
console.log('ارزش کل بازار:', market.total_market_cap);
console.log('تسلط بیت‌کوین:', market.btc_dominance, '%');
```

#### `getMarketStatus()`
دریافت وضعیت بازار

```typescript
const status = await client.getMarketStatus();
```

#### `getHistory(symbol: string, interval: string, limit: number)`
دریافت داده‌های تاریخی

```typescript
const history = await client.getHistory('BTC', '1h', 24);
history.data.forEach(point => {
  console.log(`قیمت در ${new Date(point.timestamp)}: $${point.close}`);
});
```

---

### 4️⃣ گروه تحلیل احساسات

#### `getGlobalSentiment(timeframe?: '1D' | '7D' | '30D')`
دریافت احساسات کلی بازار

```typescript
const sentiment = await client.getGlobalSentiment('1D');
console.log('شاخص ترس و طمع:', sentiment.fear_greed_index);
console.log('احساس بازار:', sentiment.sentiment);
// مقادیر ممکن: "extreme_fear", "fear", "neutral", "greed", "extreme_greed"
```

#### `getAssetSentiment(symbol: string)`
دریافت احساسات یک ارز خاص

```typescript
const sentiment = await client.getAssetSentiment('BTC');
console.log('احساس نسبت به BTC:', sentiment.sentiment);
```

#### `analyzeText(text: string, mode?: string)`
تحلیل احساسات یک متن

```typescript
const analysis = await client.analyzeText(
  'Bitcoin is pumping hard today!'
);
console.log('احساس متن:', analysis.sentiment);
console.log('کلمات کلیدی:', analysis.keywords);
```

---

### 5️⃣ گروه اخبار

#### `getNews(limit?: number)`
دریافت اخبار کریپتو

```typescript
const news = await client.getNews(10);
news.articles.forEach(article => {
  console.log(article.title);
  console.log('منبع:', article.source);
});
```

#### `getLatestNews(limit?: number)`
دریافت جدیدترین اخبار

```typescript
const news = await client.getLatestNews(5);
```

---

### 6️⃣ گروه مدل‌های AI

#### `getModels()`
دریافت لیست مدل‌های AI

```typescript
const models = await client.getModels();
models.models.forEach(model => {
  console.log(`${model.name} (${model.task})`);
});
```

#### `getModelsStatus()`
دریافت وضعیت مدل‌ها

```typescript
const status = await client.getModelsStatus();
console.log('مدل‌های بارگذاری شده:', status.loaded);
```

#### `getModelsHealth()`
دریافت سلامت مدل‌ها

```typescript
const health = await client.getModelsHealth();
```

#### `getModelsSummary()`
دریافت خلاصه مدل‌ها

```typescript
const summary = await client.getModelsSummary();
```

#### `testModel(modelKey?: string)`
تست یک مدل AI

```typescript
const result = await client.testModel();
```

#### `reinitializeModels()`
راه‌اندازی مجدد مدل‌ها

```typescript
const result = await client.reinitializeModels();
```

---

### 7️⃣ گروه سیگنال‌های AI

#### `getSignals(symbol?: string)`
دریافت سیگنال‌های معاملاتی AI

```typescript
const signals = await client.getSignals('BTC');
signals.signals.forEach(signal => {
  console.log(`${signal.type}: امتیاز ${signal.score}`);
  console.log(`اطمینان: ${signal.confidence * 100}%`);
});
```

#### `getDecision(options: AIDecisionRequest)`
دریافت تصمیم معاملاتی AI

```typescript
const decision = await client.getDecision({
  symbol: 'BTC',
  horizon: 'swing',      // "scalp" | "swing" | "position"
  risk_tolerance: 'moderate'  // "conservative" | "moderate" | "aggressive"
});

console.log('تصمیم:', decision.decision);  // "BUY" | "SELL" | "HOLD"
console.log('اطمینان:', decision.confidence);
console.log('اهداف قیمتی:', decision.targets);
console.log('ریسک‌ها:', decision.risks);
```

---

### 8️⃣ گروه منابع

#### `getResources()`
دریافت آمار منابع سیستم

```typescript
const resources = await client.getResources();
console.log('CPU:', resources.stats.cpu_percent, '%');
console.log('Memory:', resources.stats.memory_percent, '%');
```

#### `getResourcesSummary()`
دریافت خلاصه منابع

```typescript
const summary = await client.getResourcesSummary();
```

#### `getResourceCategories()`
دریافت دسته‌بندی منابع

```typescript
const categories = await client.getResourceCategories();
```

#### `getProviders()`
دریافت لیست ارائه‌دهندگان داده

```typescript
const providers = await client.getProviders();
providers.providers.forEach(provider => {
  console.log(`${provider.name}: ${provider.status}`);
});
```

---

## 💡 مثال‌های کاربردی

### مثال 1: نمایشگر قیمت زنده

```typescript
import { CryptoDataClient } from '@dreammaker/crypto-api-client';

const client = new CryptoDataClient();

async function livePriceTracker() {
  const pairs = ['BTC/USDT', 'ETH/USDT', 'BNB/USDT'];
  
  setInterval(async () => {
    const rates = await client.getBatchRates(pairs);
    
    console.clear();
    console.log('📊 قیمت‌های لحظه‌ای:');
    console.log('='.repeat(50));
    
    rates.rates.forEach(rate => {
      const arrow = rate.change24h > 0 ? '📈' : '📉';
      console.log(
        `${arrow} ${rate.pair.padEnd(10)} | $${rate.price.toLocaleString().padEnd(12)} | ${rate.change24h.toFixed(2)}%`
      );
    });
  }, 5000); // هر 5 ثانیه
}

livePriceTracker();
```

### مثال 2: ربات تحلیلگر احساسات

```typescript
import { CryptoDataClient } from '@dreammaker/crypto-api-client';

const client = new CryptoDataClient();

async function sentimentAnalyzer() {
  // دریافت احساسات کلی
  const globalSentiment = await client.getGlobalSentiment('1D');
  
  // دریافت احساسات ارزهای خاص
  const symbols = ['BTC', 'ETH', 'BNB'];
  const assetSentiments = await Promise.all(
    symbols.map(symbol => client.getAssetSentiment(symbol))
  );
  
  console.log('🎭 تحلیل احساسات بازار\n');
  
  console.log('🌍 احساسات کلی:');
  console.log(`   شاخص ترس و طمع: ${globalSentiment.fear_greed_index}`);
  console.log(`   احساس: ${globalSentiment.sentiment}`);
  console.log(`   اطمینان: ${globalSentiment.confidence}\n`);
  
  console.log('💰 احساسات ارزها:');
  assetSentiments.forEach((sentiment, i) => {
    console.log(`   ${symbols[i]}: ${sentiment.sentiment} (امتیاز: ${sentiment.score})`);
  });
}

sentimentAnalyzer();
```

### مثال 3: دستیار معاملاتی هوشمند

```typescript
import { CryptoDataClient } from '@dreammaker/crypto-api-client';

const client = new CryptoDataClient();

async function tradingAssistant(symbol: string) {
  console.log(`🤖 دستیار معاملاتی برای ${symbol}\n`);
  
  // دریافت قیمت فعلی
  const rate = await client.getRate(`${symbol}/USDT`);
  console.log(`💰 قیمت فعلی: $${rate.price.toLocaleString()}`);
  console.log(`📊 تغییر 24h: ${rate.change24h}%\n`);
  
  // دریافت احساسات
  const sentiment = await client.getAssetSentiment(symbol);
  console.log(`🎭 احساس بازار: ${sentiment.sentiment}`);
  console.log(`📈 امتیاز احساسات: ${sentiment.score}\n`);
  
  // دریافت سیگنال‌های AI
  const signals = await client.getSignals(symbol);
  console.log(`🚦 سیگنال‌های AI (${signals.count} سیگنال):`);
  signals.signals.slice(0, 3).forEach(signal => {
    const emoji = signal.type === 'buy' ? '🟢' : signal.type === 'sell' ? '🔴' : '🟡';
    console.log(`   ${emoji} ${signal.type.toUpperCase()} - اطمینان: ${(signal.confidence * 100).toFixed(1)}%`);
  });
  
  // دریافت تصمیم AI
  const decision = await client.getDecision({
    symbol: symbol,
    horizon: 'swing',
    risk_tolerance: 'moderate'
  });
  
  console.log(`\n🎯 تصمیم نهایی: ${decision.decision}`);
  console.log(`📊 سطح اطمینان: ${(decision.confidence * 100).toFixed(1)}%`);
  console.log(`📝 خلاصه: ${decision.summary}`);
  console.log(`\n🎯 اهداف قیمتی:`);
  console.log(`   حمایت: $${decision.targets.support.toLocaleString()}`);
  console.log(`   مقاومت: $${decision.targets.resistance.toLocaleString()}`);
  console.log(`   هدف: $${decision.targets.target.toLocaleString()}`);
  
  if (decision.risks.length > 0) {
    console.log(`\n⚠️ ریسک‌ها:`);
    decision.risks.forEach(risk => console.log(`   - ${risk}`));
  }
}

tradingAssistant('BTC');
```

### مثال 4: خبرخوان هوشمند

```typescript
import { CryptoDataClient } from '@dreammaker/crypto-api-client';

const client = new CryptoDataClient();

async function smartNewsReader() {
  const news = await client.getLatestNews(10);
  
  console.log('📰 اخبار کریپتو با تحلیل احساسات\n');
  console.log('='.repeat(60));
  
  for (const article of news.articles) {
    // تحلیل احساسات عنوان
    const analysis = await client.analyzeText(article.title);
    
    const sentimentEmoji = {
      'extreme_fear': '😱',
      'fear': '😨',
      'neutral': '😐',
      'greed': '😊',
      'extreme_greed': '🤑'
    }[analysis.sentiment] || '😐';
    
    console.log(`\n${sentimentEmoji} ${article.title}`);
    console.log(`   منبع: ${article.source} | احساس: ${analysis.sentiment}`);
    console.log(`   تاریخ: ${new Date(article.published_at).toLocaleString('fa-IR')}`);
    console.log(`   تگ‌ها: ${article.tags.join(', ')}`);
  }
}

smartNewsReader();
```

---

## ⚙️ پیکربندی

### پیکربندی پیشرفته

```typescript
import { CryptoDataClient } from '@dreammaker/crypto-api-client';

const client = new CryptoDataClient({
  baseUrl: 'https://really-amin-datasourceforcryptocurrency-2.hf.space',
  timeout: 30000,        // 30 ثانیه
  retries: 3,            // تلاش 3 بار در صورت خطا
  retryDelay: 1000       // تاخیر 1 ثانیه بین تلاش‌ها
});
```

### تغییر پیکربندی در حین اجرا

```typescript
// تغییر timeout
client.updateConfig({ timeout: 60000 });

// دریافت پیکربندی فعلی
const config = client.getConfig();
console.log('Timeout:', config.timeout);
```

---

## 🛡️ مدیریت خطا

### استفاده از Try-Catch

```typescript
import { CryptoDataClient, CryptoAPIError } from '@dreammaker/crypto-api-client';

const client = new CryptoDataClient();

async function safeRequest() {
  try {
    const rate = await client.getRate('BTC/USDT');
    console.log('قیمت:', rate.price);
  } catch (error) {
    if (error instanceof CryptoAPIError) {
      console.error('خطای API:', error.message);
      console.error('کد وضعیت:', error.statusCode);
      console.error('Endpoint:', error.endpoint);
      console.error('جزئیات:', error.details);
    } else {
      console.error('خطای غیرمنتظره:', error);
    }
  }
}
```

### مدیریت خطاهای سفارشی

```typescript
async function handleErrors() {
  try {
    const data = await client.getRate('INVALID/PAIR');
  } catch (error) {
    if (error instanceof CryptoAPIError) {
      if (error.statusCode === 404) {
        console.log('جفت ارز پیدا نشد');
      } else if (error.statusCode === 429) {
        console.log('تعداد درخواست‌ها بیش از حد است، لطفا صبر کنید');
      } else if (error.statusCode >= 500) {
        console.log('خطای سرور، لطفا بعدا تلاش کنید');
      }
    }
  }
}
```

---

## 🎯 TypeScript

### استفاده از Type ها

```typescript
import type {
  RateResponse,
  SentimentResponse,
  AIDecisionRequest,
  AIDecisionResponse,
  CoinData
} from '@dreammaker/crypto-api-client';

// تعریف تابع با type های صریح
async function analyzeAsset(symbol: string): Promise<{
  rate: RateResponse;
  sentiment: SentimentResponse;
  decision: AIDecisionResponse;
}> {
  const client = new CryptoDataClient();
  
  const rate = await client.getRate(`${symbol}/USDT`);
  const sentiment = await client.getGlobalSentiment('1D');
  
  const decisionRequest: AIDecisionRequest = {
    symbol,
    horizon: 'swing',
    risk_tolerance: 'moderate'
  };
  
  const decision = await client.getDecision(decisionRequest);
  
  return { rate, sentiment, decision };
}
```

---

## 🔄 استفاده در React

```typescript
import React, { useState, useEffect } from 'react';
import { CryptoDataClient, type RateResponse } from '@dreammaker/crypto-api-client';

const client = new CryptoDataClient();

function PriceWidget() {
  const [price, setPrice] = useState<RateResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    async function fetchPrice() {
      try {
        const rate = await client.getRate('BTC/USDT');
        setPrice(rate);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'خطای ناشناخته');
      } finally {
        setLoading(false);
      }
    }
    
    fetchPrice();
    const interval = setInterval(fetchPrice, 10000); // هر 10 ثانیه
    
    return () => clearInterval(interval);
  }, []);
  
  if (loading) return <div>در حال بارگذاری...</div>;
  if (error) return <div>خطا: {error}</div>;
  if (!price) return null;
  
  return (
    <div className="price-widget">
      <h2>قیمت بیت‌کوین</h2>
      <p className="price">${price.price.toLocaleString()}</p>
      <p className={price.change24h > 0 ? 'positive' : 'negative'}>
        {price.change24h > 0 ? '📈' : '📉'} {price.change24h}%
      </p>
    </div>
  );
}
```

---

## 🧪 تست

### نمونه تست با Jest

```typescript
import { CryptoDataClient, CryptoAPIError } from '@dreammaker/crypto-api-client';

describe('CryptoDataClient', () => {
  let client: CryptoDataClient;
  
  beforeEach(() => {
    client = new CryptoDataClient();
  });
  
  test('should check health successfully', async () => {
    const health = await client.health();
    expect(health).toHaveProperty('status');
    expect(health).toHaveProperty('version');
  });
  
  test('should get BTC rate', async () => {
    const rate = await client.getRate('BTC/USDT');
    expect(rate).toHaveProperty('price');
    expect(rate).toHaveProperty('change24h');
    expect(typeof rate.price).toBe('number');
  });
  
  test('should handle errors properly', async () => {
    await expect(
      client.getRate('INVALID/PAIR')
    ).rejects.toThrow(CryptoAPIError);
  });
});
```

---

## 📝 لایسنس

MIT © DreamMaker Team

---

## 🤝 مشارکت

مشارکت‌ها، گزارش باگ‌ها و درخواست‌های ویژگی همیشه خوش‌آمدند!

---

## 📞 پشتیبانی

- 📧 ایمیل: support@dreammaker.com
- 🐛 گزارش باگ: [GitHub Issues](https://github.com/yourusername/crypto-api-client/issues)
- 📚 مستندات: [Documentation](https://github.com/yourusername/crypto-api-client#readme)

---

## 🙏 تشکر

این پروژه با ❤️ توسط تیم DreamMaker ساخته شده است.

</div>
