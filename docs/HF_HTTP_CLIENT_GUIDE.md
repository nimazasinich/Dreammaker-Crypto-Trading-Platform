# راهنمای استفاده از HuggingFace HTTP-Only Client

## 📋 فهرست مطالب

- [معرفی](#معرفی)
- [نصب و پیکربندی](#نصب-و-پیکربندی)
- [استفاده سریع](#استفاده-سریع)
- [API Reference](#api-reference)
- [مثال‌های کاربردی](#مثالهای-کاربردی)
- [مدیریت خطا](#مدیریت-خطا)
- [بهترین روش‌ها](#بهترین-روشها)

---

## معرفی

`HFHttpOnlyClient` یک کلاینت HTTP استاندارد برای دریافت داده از سرویس HuggingFace است که:

✅ **فقط از HTTP استفاده می‌کند** (بدون WebSocket)  
✅ **احراز هویت با Bearer Token**  
✅ **Retry Logic با Exponential Backoff**  
✅ **Validation کامل برای تمام داده‌ها**  
✅ **Type-safe با TypeScript**  
✅ **Error Handling حرفه‌ای**

---

## نصب و پیکربندی

### 1. تنظیم متغیرهای محیطی

فایل `.env` خود را ویرایش کنید:

```bash
# آدرس پایه API
HF_API_URL=https://Really-amin-Datasourceforcryptocurrency-2.hf.space
VITE_HF_API_URL=https://Really-amin-Datasourceforcryptocurrency-2.hf.space

# توکن احراز هویت (اختیاری اما توصیه می‌شود)
HF_API_TOKEN=hf_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
VITE_HF_API_TOKEN=hf_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### 2. Import کردن کلاینت

```typescript
// استفاده از Singleton Instance (توصیه می‌شود)
import { hfHttpClient } from './src/services/HFHttpOnlyClient';

// یا ایجاد Instance جدید
import { HFHttpOnlyClient } from './src/services/HFHttpOnlyClient';
const client = new HFHttpOnlyClient({
  baseUrl: 'https://your-hf-space.hf.space',
  token: 'your-token-here'
});
```

---

## استفاده سریع

### مثال ساده

```typescript
import { hfHttpClient } from './src/services/HFHttpOnlyClient';

// دریافت داده‌های بازار
const marketData = await hfHttpClient.getMarketData({ limit: 100 });

if (marketData.success) {
  console.log('✅ داده‌ها دریافت شد:', marketData.data);
} else {
  console.error('❌ خطا:', marketData.error);
}
```

### دریافت تمام داده‌ها به صورت موازی

```typescript
const allData = await hfHttpClient.fetchAllData({
  marketLimit: 100,
  chartSymbol: 'BTC',
  chartTimeframe: '1h',
  newsLimit: 10,
  includeAI: true
});

console.log('Market:', allData.data.market);
console.log('Chart:', allData.data.chart);
console.log('News:', allData.data.news);
console.log('Sentiment:', allData.data.sentiment);
console.log('Stats:', allData.data.stats);
console.log('AI:', allData.data.ai);
```

---

## API Reference

### Constructor

```typescript
new HFHttpOnlyClient(config?: HFHttpClientConfig)
```

**پارامترها:**

```typescript
interface HFHttpClientConfig {
  baseUrl?: string;        // آدرس پایه API
  token?: string;          // توکن احراز هویت
  timeout?: number;        // تایم‌اوت (میلی‌ثانیه) - پیش‌فرض: 30000
  maxRetries?: number;     // تعداد تلاش مجدد - پیش‌فرض: 3
  retryDelay?: number;     // فاصله بین تلاش‌ها (میلی‌ثانیه) - پیش‌فرض: 1000
}
```

---

### متدهای اصلی

#### 1. `getMarketData()`

دریافت لیست ارزهای دیجیتال با قیمت و اطلاعات بازار

```typescript
async getMarketData(params?: {
  limit?: number;           // تعداد ارزها - پیش‌فرض: 100
  sort?: 'market_cap' | 'volume' | 'price';  // مرتب‌سازی - پیش‌فرض: 'market_cap'
  order?: 'asc' | 'desc';   // ترتیب - پیش‌فرض: 'desc'
}): Promise<ApiResponse<MarketData[]>>
```

**مثال:**

```typescript
const result = await hfHttpClient.getMarketData({
  limit: 50,
  sort: 'volume',
  order: 'desc'
});

if (result.success) {
  result.data.forEach(coin => {
    console.log(`${coin.symbol}: $${coin.price} (${coin.change_24h}%)`);
  });
}
```

---

#### 2. `getPriceChart()`

دریافت داده‌های نمودار قیمت (OHLCV)

```typescript
async getPriceChart(params: {
  symbol: string;           // نماد ارز (مثال: 'BTC')
  timeframe?: '1m' | '5m' | '15m' | '1h' | '4h' | '1d' | '1w';  // پیش‌فرض: '1h'
  limit?: number;           // تعداد کندل‌ها - پیش‌فرض: 100
}): Promise<ApiResponse<OHLCVData[]>>
```

**مثال:**

```typescript
const chart = await hfHttpClient.getPriceChart({
  symbol: 'BTC',
  timeframe: '1h',
  limit: 24  // 24 ساعت گذشته
});

if (chart.success) {
  chart.data.forEach(candle => {
    console.log(`Open: ${candle.open}, Close: ${candle.close}, Volume: ${candle.volume}`);
  });
}
```

---

#### 3. `getNews()`

دریافت آخرین اخبار

```typescript
async getNews(params?: {
  limit?: number;           // تعداد اخبار - پیش‌فرض: 10
  category?: string;        // دسته‌بندی (اختیاری)
  sentiment?: 'positive' | 'negative' | 'neutral';  // فیلتر احساسات (اختیاری)
}): Promise<ApiResponse<NewsData[]>>
```

**مثال:**

```typescript
const news = await hfHttpClient.getNews({
  limit: 5,
  sentiment: 'positive'
});

if (news.success) {
  news.data.forEach(item => {
    console.log(`${item.title} - ${item.url}`);
  });
}
```

---

#### 4. `getSentiment()`

دریافت احساسات بازار (Fear & Greed Index)

```typescript
async getSentiment(): Promise<ApiResponse<SentimentData>>
```

**مثال:**

```typescript
const sentiment = await hfHttpClient.getSentiment();

if (sentiment.success) {
  console.log(`Fear & Greed Index: ${sentiment.data.fearGreedIndex}`);
  console.log(`Sentiment: ${sentiment.data.sentiment}`);
}
```

---

#### 5. `getMarketStats()`

دریافت آمار کلی بازار

```typescript
async getMarketStats(): Promise<ApiResponse<MarketStats>>
```

**مثال:**

```typescript
const stats = await hfHttpClient.getMarketStats();

if (stats.success) {
  console.log(`Total Market Cap: $${stats.data.totalMarketCap}`);
  console.log(`24h Volume: $${stats.data.totalVolume24h}`);
  console.log(`BTC Dominance: ${stats.data.btcDominance}%`);
}
```

---

#### 6. `getAIPrediction()`

دریافت پیش‌بینی AI

```typescript
async getAIPrediction(params: {
  symbol: string;           // نماد ارز
  timeframe?: string;       // بازه زمانی (اختیاری)
  indicators?: string[];    // اندیکاتورها (اختیاری)
}): Promise<ApiResponse<AIPrediction>>
```

**مثال:**

```typescript
const prediction = await hfHttpClient.getAIPrediction({
  symbol: 'BTC',
  timeframe: '1h',
  indicators: ['RSI', 'MACD', 'EMA']
});

if (prediction.success) {
  console.log(`Action: ${prediction.data.action}`);
  console.log(`Confidence: ${prediction.data.confidence * 100}%`);
}
```

---

#### 7. `fetchAllData()`

دریافت تمام داده‌ها به صورت موازی (Batch Operation)

```typescript
async fetchAllData(options?: {
  marketLimit?: number;
  chartSymbol?: string;
  chartTimeframe?: '1m' | '5m' | '15m' | '1h' | '4h' | '1d' | '1w';
  chartLimit?: number;
  newsLimit?: number;
  includeAI?: boolean;
}): Promise<BatchResponse>
```

**مثال:**

```typescript
const allData = await hfHttpClient.fetchAllData({
  marketLimit: 100,
  chartSymbol: 'BTC',
  chartTimeframe: '1h',
  chartLimit: 100,
  newsLimit: 10,
  includeAI: true
});

console.log(`Successful: ${allData.summary.successful}/${allData.summary.total}`);
```

---

#### 8. `healthCheck()`

بررسی سلامت سرویس

```typescript
async healthCheck(): Promise<ApiResponse<{ status: string; uptime?: number }>>
```

**مثال:**

```typescript
const health = await hfHttpClient.healthCheck();

if (health.success) {
  console.log(`Service Status: ${health.data.status}`);
}
```

---

### متدهای کمکی

#### `updateConfig()`

به‌روزرسانی تنظیمات در زمان اجرا

```typescript
hfHttpClient.updateConfig({
  timeout: 20000,
  maxRetries: 5,
  token: 'new-token'
});
```

#### `getConfig()`

دریافت تنظیمات فعلی

```typescript
const config = hfHttpClient.getConfig();
console.log(config);
// {
//   baseUrl: 'https://...',
//   hasToken: true,
//   timeout: 30000,
//   maxRetries: 3,
//   retryDelay: 1000
// }
```

---

## مثال‌های کاربردی

### مثال 1: نمایش Top 10 ارز

```typescript
async function showTop10Coins() {
  const result = await hfHttpClient.getMarketData({ limit: 10 });
  
  if (!result.success) {
    console.error('خطا در دریافت داده:', result.error);
    return;
  }

  console.log('Top 10 Cryptocurrencies:');
  result.data.forEach((coin, index) => {
    console.log(`${index + 1}. ${coin.symbol} - $${coin.price.toFixed(2)} (${coin.change_24h > 0 ? '+' : ''}${coin.change_24h.toFixed(2)}%)`);
  });
}
```

### مثال 2: تحلیل نمودار BTC

```typescript
async function analyzeBTCChart() {
  const chart = await hfHttpClient.getPriceChart({
    symbol: 'BTC',
    timeframe: '1h',
    limit: 24
  });

  if (!chart.success) {
    console.error('خطا:', chart.error);
    return;
  }

  const prices = chart.data.map(c => c.close);
  const highest = Math.max(...prices);
  const lowest = Math.min(...prices);
  const average = prices.reduce((a, b) => a + b, 0) / prices.length;

  console.log(`BTC Analysis (Last 24h):`);
  console.log(`  Highest: $${highest.toFixed(2)}`);
  console.log(`  Lowest: $${lowest.toFixed(2)}`);
  console.log(`  Average: $${average.toFixed(2)}`);
}
```

### مثال 3: Dashboard کامل

```typescript
async function createDashboard() {
  console.log('Loading dashboard...\n');

  const allData = await hfHttpClient.fetchAllData({
    marketLimit: 10,
    chartSymbol: 'BTC',
    newsLimit: 5,
    includeAI: true
  });

  if (!allData.success) {
    console.error('Failed to load dashboard');
    return;
  }

  // نمایش بازار
  if (allData.data.market.success) {
    console.log('📊 Market Overview:');
    allData.data.market.data.slice(0, 5).forEach(coin => {
      console.log(`  ${coin.symbol}: $${coin.price}`);
    });
  }

  // نمایش احساسات
  if (allData.data.sentiment.success) {
    console.log('\n😊 Market Sentiment:');
    console.log(`  Fear & Greed: ${allData.data.sentiment.data.fearGreedIndex}`);
  }

  // نمایش اخبار
  if (allData.data.news.success) {
    console.log('\n📰 Latest News:');
    allData.data.news.data.slice(0, 3).forEach(news => {
      console.log(`  - ${news.title}`);
    });
  }

  // نمایش پیش‌بینی AI
  if (allData.data.ai?.success) {
    console.log('\n🤖 AI Prediction:');
    console.log(`  Action: ${allData.data.ai.data.action.toUpperCase()}`);
    console.log(`  Confidence: ${(allData.data.ai.data.confidence * 100).toFixed(1)}%`);
  }
}
```

---

## مدیریت خطا

### ساختار پاسخ

تمام متدها یک شیء `ApiResponse` برمی‌گردانند:

```typescript
interface ApiResponse<T> {
  success: boolean;    // آیا درخواست موفق بود؟
  data?: T;           // داده‌های دریافت شده (در صورت موفقیت)
  error?: string;     // پیام خطا (در صورت شکست)
  status: number;     // کد وضعیت HTTP
  timestamp: number;  // زمان پاسخ
}
```

### مثال مدیریت خطا

```typescript
const result = await hfHttpClient.getMarketData({ limit: 100 });

if (result.success) {
  // موفقیت
  console.log('Data:', result.data);
} else {
  // خطا
  console.error(`Error ${result.status}: ${result.error}`);
  
  // مدیریت خطاهای خاص
  switch (result.status) {
    case 401:
      console.error('توکن نامعتبر است');
      break;
    case 403:
      console.error('دسترسی رد شد');
      break;
    case 408:
      console.error('درخواست تایم‌اوت شد');
      break;
    case 429:
      console.error('تعداد درخواست‌ها بیش از حد مجاز');
      break;
    case 500:
    case 503:
      console.error('سرور در دسترس نیست');
      break;
    default:
      console.error('خطای ناشناخته');
  }
}
```

### Retry Logic

کلاینت به صورت خودکار درخواست‌های ناموفق را تکرار می‌کند:

- خطاهای 5xx (Server Errors)
- تایم‌اوت‌ها
- خطاهای شبکه

با استفاده از **Exponential Backoff**:
- تلاش 1: فوری
- تلاش 2: بعد از 1 ثانیه
- تلاش 3: بعد از 2 ثانیه
- تلاش 4: بعد از 4 ثانیه

---

## بهترین روش‌ها

### 1. استفاده از Singleton Instance

```typescript
// ✅ خوب - استفاده از singleton
import { hfHttpClient } from './src/services/HFHttpOnlyClient';
const data = await hfHttpClient.getMarketData();

// ❌ بد - ایجاد instance جدید در هر بار
const client = new HFHttpOnlyClient();
const data = await client.getMarketData();
```

### 2. استفاده از Batch Operations

```typescript
// ✅ خوب - دریافت موازی
const allData = await hfHttpClient.fetchAllData();

// ❌ بد - دریافت سریالی
const market = await hfHttpClient.getMarketData();
const chart = await hfHttpClient.getPriceChart({ symbol: 'BTC' });
const news = await hfHttpClient.getNews();
```

### 3. مدیریت صحیح خطا

```typescript
// ✅ خوب
const result = await hfHttpClient.getMarketData();
if (result.success) {
  // استفاده از داده
} else {
  // مدیریت خطا
  console.error(result.error);
}

// ❌ بد - فرض موفقیت بدون بررسی
const result = await hfHttpClient.getMarketData();
console.log(result.data.length); // ممکن است undefined باشد
```

### 4. تنظیم توکن در Environment Variables

```typescript
// ✅ خوب - استفاده از env
HF_API_TOKEN=hf_your_token_here

// ❌ بد - هاردکد کردن توکن
const client = new HFHttpOnlyClient({
  token: process.env.HF_API_TOKEN || 'hf_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'
});
```

### 5. استفاده از TypeScript Types

```typescript
// ✅ خوب - استفاده از types
import { MarketData, ApiResponse } from './src/services/HFHttpOnlyClient';

const result: ApiResponse<MarketData[]> = await hfHttpClient.getMarketData();

// ❌ بد - بدون type
const result = await hfHttpClient.getMarketData();
```

---

## اجرای مثال‌ها

برای اجرای فایل مثال:

```bash
# نصب dependencies
npm install

# اجرای مثال‌ها
npx tsx examples/hf-http-client-usage.ts
```

---

## پشتیبانی

در صورت بروز مشکل:

1. بررسی کنید که `HF_API_URL` و `HF_API_TOKEN` به درستی تنظیم شده‌اند
2. از `healthCheck()` برای بررسی دسترسی به سرویس استفاده کنید
3. لاگ‌های خطا را بررسی کنید
4. در صورت نیاز، `timeout` و `maxRetries` را افزایش دهید

---

## لایسنس

MIT License - استفاده آزاد برای پروژه‌های شخصی و تجاری
