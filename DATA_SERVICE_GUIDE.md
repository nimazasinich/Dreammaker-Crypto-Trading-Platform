# راهنمای استفاده از DataService

این راهنما نحوه استفاده صحیح از سرویس مرکزی دریافت داده‌ها را توضیح می‌دهد.

## 📋 فهرست مطالب

1. [معرفی](#معرفی)
2. [پیکربندی](#پیکربندی)
3. [استفاده پایه](#استفاده-پایه)
4. [API Reference](#api-reference)
5. [مثال‌های کاربردی](#مثالهای-کاربردی)
6. [خطایابی](#خطایابی)

---

## معرفی

`DataService` یک سرویس مرکزی برای دریافت تمام داده‌های مورد نیاز از Hugging Face Space است.

### ویژگی‌ها

✅ **HTTP-First Approach**: اولویت با درخواست‌های HTTP  
✅ **WebSocket Fallback**: در صورت خطای HTTP، به WebSocket متصل می‌شود  
✅ **Bearer Token Authentication**: احراز هویت امن با توکن  
✅ **Retry Logic**: تلاش مجدد خودکار با Exponential Backoff  
✅ **Data Validation**: اعتبارسنجی کامل تمام داده‌ها  
✅ **Parallel Fetching**: دریافت موازی چندین endpoint  
✅ **TypeScript Support**: Type-safe با TypeScript کامل  

---

## پیکربندی

### 1. تنظیم Environment Variables

فایل `.env` را ویرایش کنید:

```env
# Hugging Face Space URL
HF_API_URL=https://huggingface.co/spaces/Really-amin/Datasourceforcryptocurrency-2
VITE_HF_API_URL=https://huggingface.co/spaces/Really-amin/Datasourceforcryptocurrency-2

# Hugging Face API Token
HF_API_TOKEN=hf_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx (use environment variable)
VITE_HF_API_TOKEN=hf_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx (use environment variable)
```

### 2. Import کردن سرویس

```typescript
import { dataService } from './services/DataService';
```

---

## استفاده پایه

### دریافت تمام داده‌ها به صورت موازی

```typescript
const result = await dataService.fetchAllRequiredData({
  marketLimit: 100,
  chartSymbol: 'BTC',
  chartTimeframe: '1h',
  chartLimit: 100,
  newsLimit: 5,
  includeAI: true
});

if (result.success) {
  console.log('Market Data:', result.data.market);
  console.log('Price Chart:', result.data.chart);
  console.log('News:', result.data.news);
  console.log('Sentiment:', result.data.sentiment);
  console.log('Stats:', result.data.stats);
  console.log('AI Prediction:', result.data.ai);
}
```

### دریافت داده‌های خاص

```typescript
// داده‌های بازار
const marketData = await dataService.getMarketData(100);

// نمودار قیمت
const priceChart = await dataService.getPriceChart('BTC', '1h', 100);

// اخبار
const news = await dataService.getNews(10);

// احساسات بازار
const sentiment = await dataService.getSentiment();

// آمار بازار
const stats = await dataService.getMarketStats();

// پیش‌بینی AI
const prediction = await dataService.getAIPredictions({
  model: 'predictor',
  symbol: 'BTC'
});
```

---

## API Reference

### `fetchAllRequiredData(options?)`

دریافت تمام داده‌های مورد نیاز به صورت موازی.

**پارامترها:**
```typescript
{
  marketLimit?: number;        // تعداد ارزها (پیش‌فرض: 100)
  chartSymbol?: string;         // نماد ارز (پیش‌فرض: 'BTC')
  chartTimeframe?: string;      // بازه زمانی (پیش‌فرض: '1h')
  chartLimit?: number;          // تعداد کندل‌ها (پیش‌فرض: 100)
  newsLimit?: number;           // تعداد اخبار (پیش‌فرض: 5)
  includeAI?: boolean;          // شامل پیش‌بینی AI (پیش‌فرض: false)
}
```

**خروجی:**
```typescript
{
  success: boolean;
  timestamp: number;
  data: {
    market: ServiceResponse<MarketData[]>;
    chart: ServiceResponse<OHLCVData[]>;
    news: ServiceResponse<NewsData[]>;
    sentiment: ServiceResponse<SentimentData>;
    stats: ServiceResponse<MarketStats>;
    ai?: ServiceResponse<AIPrediction>;
  };
  summary: {
    total: number;
    successful: number;
    failed: number;
  };
}
```

---

### `getMarketData(limit?)`

دریافت لیست ارزهای دیجیتال با قیمت و اطلاعات.

**پارامترها:**
- `limit` (number, optional): تعداد ارزها (پیش‌فرض: 100)

**خروجی:**
```typescript
ServiceResponse<MarketData[]>

interface MarketData {
  symbol: string;
  name: string;
  price: number;
  change_24h: number;
  volume_24h: number;
  market_cap?: number;
  rank?: number;
  last_updated?: string;
}
```

---

### `getPriceChart(symbol, timeframe?, limit?)`

دریافت داده‌های نمودار قیمت (OHLCV).

**پارامترها:**
- `symbol` (string, required): نماد ارز (مثال: 'BTC', 'ETH')
- `timeframe` (string, optional): بازه زمانی ('1m', '5m', '15m', '1h', '4h', '1d', '1w')
- `limit` (number, optional): تعداد کندل‌ها (پیش‌فرض: 100)

**خروجی:**
```typescript
ServiceResponse<OHLCVData[]>

interface OHLCVData {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}
```

---

### `getNews(limit?)`

دریافت آخرین اخبار.

**پارامترها:**
- `limit` (number, optional): تعداد اخبار (پیش‌فرض: 10)

**خروجی:**
```typescript
ServiceResponse<NewsData[]>

interface NewsData {
  id?: string;
  title: string;
  url: string;
  source?: string;
  published_at?: string;
  sentiment?: 'positive' | 'negative' | 'neutral';
  summary?: string;
}
```

---

### `getSentiment()`

دریافت احساسات بازار.

**خروجی:**
```typescript
ServiceResponse<SentimentData>

interface SentimentData {
  fearGreedIndex?: number;
  sentiment?: 'extreme_fear' | 'fear' | 'neutral' | 'greed' | 'extreme_greed';
  score?: number;
  value?: number;
  value_classification?: string;
  timestamp?: string;
}
```

---

### `getMarketStats()`

دریافت آمار کلی بازار.

**خروجی:**
```typescript
ServiceResponse<MarketStats>

interface MarketStats {
  totalMarketCap: number;
  totalVolume24h: number;
  btcDominance: number;
  ethDominance?: number;
  marketCapChange24h?: number;
  activeCryptocurrencies?: number;
}
```

---

### `getAIPredictions(payload)`

دریافت پیش‌بینی AI.

**پارامترها:**
```typescript
{
  model?: string;           // نام مدل (پیش‌فرض: 'predictor')
  symbol: string;           // نماد ارز (الزامی)
  timeframe?: string;       // بازه زمانی
  indicators?: string[];    // اندیکاتورها
}
```

**خروجی:**
```typescript
ServiceResponse<AIPrediction>

interface AIPrediction {
  symbol: string;
  action: 'buy' | 'sell' | 'hold';
  confidence: number;
  prediction?: number;
  timeframe?: string;
  timestamp?: string;
  reasoning?: string;
}
```

---

### `healthCheck()`

بررسی سلامت سرویس.

**خروجی:**
```typescript
ServiceResponse<{ status: string; uptime?: number }>
```

---

### `updateConfig(config)`

به‌روزرسانی تنظیمات در زمان اجرا.

**پارامترها:**
```typescript
{
  baseUrl?: string;
  token?: string;
  timeout?: number;
  maxRetries?: number;
  retryDelay?: number;
}
```

---

### `getConfig()`

دریافت تنظیمات فعلی.

**خروجی:**
```typescript
{
  baseUrl: string;
  wsBase: string;
  hasToken: boolean;
  timeout: number;
  maxRetries: number;
  retryDelay: number;
}
```

---

## مثال‌های کاربردی

### مثال 1: دریافت و نمایش داده‌های بازار

```typescript
async function displayMarketData() {
  const response = await dataService.getMarketData(10);
  
  if (response.success && response.data) {
    const coins = Array.isArray(response.data) 
      ? response.data 
      : response.data.items || response.data.data || [];
    
    console.log('Top 10 Cryptocurrencies:');
    coins.forEach((coin, index) => {
      console.log(`${index + 1}. ${coin.symbol}: $${coin.price} (${coin.change_24h}%)`);
    });
  } else {
    console.error('Failed:', response.error);
  }
}
```

---

### مثال 2: رسم نمودار قیمت

```typescript
async function drawPriceChart(symbol: string) {
  const response = await dataService.getPriceChart(symbol, '1h', 100);
  
  if (response.success && response.data) {
    const candles = response.data;
    
    // استفاده از کتابخانه نمودار (مثلاً Chart.js)
    const chartData = {
      labels: candles.map(c => new Date(c.timestamp).toLocaleString()),
      datasets: [{
        label: `${symbol} Price`,
        data: candles.map(c => c.close)
      }]
    };
    
    // رسم نمودار...
  }
}
```

---

### مثال 3: نمایش اخبار با احساسات

```typescript
async function displayNewsWithSentiment() {
  const response = await dataService.getNews(5);
  
  if (response.success && response.data) {
    const newsItems = Array.isArray(response.data) 
      ? response.data 
      : response.data.news || response.data.items || [];
    
    newsItems.forEach((news, index) => {
      const emoji = news.sentiment === 'positive' ? '📈' : 
                    news.sentiment === 'negative' ? '📉' : '➖';
      
      console.log(`${emoji} ${news.title}`);
      console.log(`   ${news.url}`);
    });
  }
}
```

---

### مثال 4: Dashboard با تمام داده‌ها

```typescript
async function createDashboard() {
  const result = await dataService.fetchAllRequiredData({
    marketLimit: 50,
    chartSymbol: 'BTC',
    chartTimeframe: '1h',
    chartLimit: 100,
    newsLimit: 5,
    includeAI: true
  });
  
  if (result.success) {
    // نمایش داده‌های بازار
    if (result.data.market.success) {
      displayMarketData(result.data.market.data);
    }
    
    // نمایش نمودار
    if (result.data.chart.success) {
      displayChart(result.data.chart.data);
    }
    
    // نمایش اخبار
    if (result.data.news.success) {
      displayNews(result.data.news.data);
    }
    
    // نمایش احساسات
    if (result.data.sentiment.success) {
      displaySentiment(result.data.sentiment.data);
    }
    
    // نمایش آمار
    if (result.data.stats.success) {
      displayStats(result.data.stats.data);
    }
    
    // نمایش پیش‌بینی AI
    if (result.data.ai?.success) {
      displayAIPrediction(result.data.ai.data);
    }
  }
}
```

---

### مثال 5: Retry با تنظیمات سفارشی

```typescript
// تغییر تنظیمات
dataService.updateConfig({
  timeout: 60000,      // 60 ثانیه
  maxRetries: 5,       // 5 تلاش
  retryDelay: 2000     // 2 ثانیه
});

// دریافت داده
const response = await dataService.getMarketData();
```

---

## خطایابی

### بررسی تنظیمات

```typescript
const config = dataService.getConfig();
console.log('Configuration:', config);

// بررسی توکن
if (!config.hasToken) {
  console.error('⚠️ API Token is missing!');
  console.log('Please set HF_API_TOKEN in .env file');
}
```

---

### بررسی سلامت سرویس

```typescript
const health = await dataService.healthCheck();

if (health.success) {
  console.log('✅ Service is healthy');
} else {
  console.error('❌ Service is down:', health.error);
}
```

---

### مدیریت خطاها

```typescript
try {
  const response = await dataService.getMarketData();
  
  if (!response.success) {
    console.error('Request failed:', response.error);
    console.log('Status:', response.status);
    console.log('Method used:', response.method); // 'http' or 'websocket'
  }
} catch (error) {
  console.error('Unexpected error:', error);
}
```

---

### لاگ‌های دیباگ

سرویس از `Logger` استفاده می‌کند. برای فعال کردن لاگ‌های دیباگ:

```typescript
import { Logger } from './core/Logger';

const logger = Logger.getInstance();
logger.setLevel('debug'); // 'error', 'warn', 'info', 'debug'
```

---

## نکات مهم

### ✅ انجام دهید

- همیشه `success` را بررسی کنید قبل از استفاده از `data`
- از `fetchAllRequiredData()` برای دریافت موازی استفاده کنید
- توکن API را در `.env` تنظیم کنید (نه در کد)
- از validation داده‌ها استفاده کنید

### ❌ انجام ندهید

- توکن را در کد hard-code نکنید
- از mock data استفاده نکنید
- timeout را خیلی کوتاه تنظیم نکنید
- خطاها را نادیده نگیرید

---

## پشتیبانی

اگر مشکلی دارید:

1. تنظیمات `.env` را بررسی کنید
2. `healthCheck()` را اجرا کنید
3. لاگ‌های دیباگ را فعال کنید
4. مثال‌های موجود در `examples/DataServiceUsage.ts` را ببینید

---

## مثال کامل

برای مشاهده مثال‌های کامل، فایل زیر را ببینید:

```bash
examples/DataServiceUsage.ts
```

اجرای مثال‌ها:

```bash
npm run example:dataservice
# یا
ts-node examples/DataServiceUsage.ts
```

---

**نکته:** این سرویس به طور خودکار از HTTP استفاده می‌کند و فقط در صورت خطا به WebSocket متصل می‌شود. نیازی به تنظیمات اضافی نیست.
