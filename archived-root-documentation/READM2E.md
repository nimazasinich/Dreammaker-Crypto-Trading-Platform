# 📚 راهنمای کامل TypeScript Client برای Crypto API Monitor

این پوشه شامل مثال‌های کامل TypeScript برای استفاده از تمام endpoint‌های Crypto API Monitor است.

## 📋 فهرست

1. [نصب و راه‌اندازی](#نصب-و-راه-اندازی)
2. [ساختار فایل‌ها](#ساختار-فایلها)
3. [مثال‌های موجود](#مثالهای-موجود)
4. [استفاده سریع](#استفاده-سریع)
5. [API Reference](#api-reference)

---

## 🚀 نصب و راه‌اندازی

### پیش‌نیازها

```bash
# Node.js 16+ و npm
node --version
npm --version
```

### نصب

```bash
# کلون کردن پروژه
git clone <repository-url>
cd typescript-client-examples

# نصب وابستگی‌ها
npm install

# یا با yarn
yarn install
```

### تنظیمات TypeScript

فایل `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  },
  "include": ["**/*.ts"],
  "exclude": ["node_modules", "dist"]
}
```

### package.json

```json
{
  "name": "crypto-api-client-examples",
  "version": "1.0.0",
  "description": "TypeScript examples for Crypto API Monitor",
  "main": "dist/CryptoAPIClient.js",
  "types": "dist/CryptoAPIClient.d.ts",
  "scripts": {
    "build": "tsc",
    "example:ohlcv": "ts-node 01-ohlcv-example.ts",
    "example:market": "ts-node 02-market-data-example.ts",
    "example:news": "ts-node 03-news-example.ts",
    "example:ai": "ts-node 04-sentiment-ai-example.ts",
    "example:complete": "ts-node 05-complete-example.ts",
    "example:all": "npm run example:ohlcv && npm run example:market && npm run example:news && npm run example:ai"
  },
  "dependencies": {
    "node-fetch": "^2.6.7"
  },
  "devDependencies": {
    "@types/node": "^18.0.0",
    "@types/node-fetch": "^2.6.2",
    "ts-node": "^10.9.1",
    "typescript": "^5.0.0"
  }
}
```

---

## 📁 ساختار فایل‌ها

```
typescript-client-examples/
├── CryptoAPIClient.ts          # کتابخانه اصلی کلاینت
├── 01-ohlcv-example.ts         # مثال‌های OHLCV
├── 02-market-data-example.ts   # مثال‌های قیمت بازار
├── 03-news-example.ts          # مثال‌های اخبار
├── 04-sentiment-ai-example.ts  # مثال‌های تحلیل احساسات و AI
├── 05-complete-example.ts      # مثال کامل ترکیبی
├── README.md                   # این فایل
├── package.json                # تنظیمات npm
└── tsconfig.json               # تنظیمات TypeScript
```

---

## 📚 مثال‌های موجود

### 1️⃣ OHLCV (کندل استیک) - `01-ohlcv-example.ts`

**6 مثال کامل:**
- دریافت ساده OHLCV
- دریافت برای چند ارز
- محاسبه اندیکاتورهای تکنیکال (SMA, RSI)
- ذخیره داده در CSV
- استفاده از endpoint‌های مختلف
- مدیریت خطا و retry

**اجرا:**
```bash
npm run example:ohlcv
```

### 2️⃣ Market Data (قیمت‌های بازار) - `02-market-data-example.ts`

**7 مثال کامل:**
- دریافت لیست ارزهای برتر
- مقایسه قیمت‌ها
- فیلتر و جستجو
- ساخت پورتفولیو
- نظارت بر قیمت (Price Alert)
- ترکیب با نرخ معامله
- ساخت جدول HTML

**اجرا:**
```bash
npm run example:market
```

### 3️⃣ News (اخبار) - `03-news-example.ts`

**8 مثال کامل:**
- دریافت ساده اخبار
- فیلتر بر اساس کلمات کلیدی
- دسته‌بندی بر اساس منبع
- تحلیل زمانی
- ترکیب با تحلیل احساسات
- ساخت RSS Feed
- هشدار اخبار مهم
- ساخت Newsletter

**اجرا:**
```bash
npm run example:news
```

### 4️⃣ Sentiment & AI - `04-sentiment-ai-example.ts`

**8 مثال کامل:**
- تحلیل احساسات ساده
- تحلیل برای چند ارز
- تصمیم AI ساده
- تصمیم AI با متن اضافی
- تحلیل کامل (OHLCV + Sentiment + AI)
- سیستم Trading Bot ساده
- تحلیل احساسات اخبار
- سیستم هشدار هوشمند

**اجرا:**
```bash
npm run example:ai
```

### 5️⃣ Complete Example - `05-complete-example.ts`

مثال کامل ترکیبی که همه قابلیت‌ها را با هم استفاده می‌کند.

**اجرا:**
```bash
npm run example:complete
```

---

## ⚡ استفاده سریع

### مثال 1: دریافت OHLCV

```typescript
import { CryptoAPIClient } from './CryptoAPIClient';

const client = new CryptoAPIClient({
  baseURL: 'https://huggingface.co/spaces/Really-amin/Datasourceforcryptocurrency-2'
});

// دریافت 100 کندل 1 ساعته BTC
const ohlcv = await client.getOHLCV('BTC', '1h', 100);
console.log(`دریافت ${ohlcv.count} کندل از ${ohlcv.source}`);
```

### مثال 2: دریافت قیمت‌ها

```typescript
// دریافت 10 ارز برتر
const coins = await client.getTopCoins(10);
coins.data.forEach(coin => {
  console.log(`${coin.name}: $${coin.current_price}`);
});
```

### مثال 3: دریافت اخبار

```typescript
// دریافت 20 خبر آخر
const news = await client.getNews(20);
news.news.forEach(article => {
  console.log(`📰 ${article.title}`);
});
```

### مثال 4: تحلیل احساسات

```typescript
// تحلیل یک متن
const sentiment = await client.analyzeSentiment(
  'Bitcoin is showing strong bullish momentum!',
  'BTC'
);
console.log(`احساسات: ${sentiment.label} (${sentiment.score})`);
```

### مثال 5: تصمیم AI

```typescript
// دریافت تصمیم AI
const decision = await client.getAIDecision('BTC', '1h');
console.log(`تصمیم: ${decision.decision} (${decision.confidence}%)`);
```

---

## 📖 API Reference

### کلاس `CryptoAPIClient`

#### Constructor

```typescript
new CryptoAPIClient(config: ClientConfig)
```

**پارامترها:**
- `baseURL` (string, required): آدرس پایه API
- `timeout` (number, optional): زمان timeout به میلی‌ثانیه (پیش‌فرض: 15000)
- `retries` (number, optional): تعداد تلاش مجدد (پیش‌فرض: 3)
- `retryDelay` (number, optional): تاخیر بین تلاش‌ها (پیش‌فرض: 1000)

#### متدها

##### `getOHLCV(symbol, timeframe?, limit?)`

دریافت داده OHLCV

**پارامترها:**
- `symbol` (string): نماد ارز (BTC, ETH, ...)
- `timeframe` (string, optional): بازه زمانی (پیش‌فرض: '1h')
- `limit` (number, optional): تعداد کندل (پیش‌فرض: 100)

**بازگشت:** `Promise<OHLCVResponse>`

**مثال:**
```typescript
const ohlcv = await client.getOHLCV('BTC', '1h', 100);
```

---

##### `getTopCoins(limit?)`

دریافت لیست ارزهای برتر

**پارامترها:**
- `limit` (number, optional): تعداد ارز (پیش‌فرض: 50)

**بازگشت:** `Promise<CoinsResponse>`

**مثال:**
```typescript
const coins = await client.getTopCoins(10);
```

---

##### `getNews(limit?)`

دریافت آخرین اخبار

**پارامترها:**
- `limit` (number, optional): تعداد خبر (پیش‌فرض: 20)

**بازگشت:** `Promise<NewsResponse>`

**مثال:**
```typescript
const news = await client.getNews(20);
```

---

##### `analyzeSentiment(text, symbol?)`

تحلیل احساسات متن

**پارامترها:**
- `text` (string): متن برای تحلیل
- `symbol` (string, optional): نماد ارز

**بازگشت:** `Promise<SentimentResponse>`

**مثال:**
```typescript
const sentiment = await client.analyzeSentiment('Bitcoin is bullish!', 'BTC');
```

---

##### `getAIDecision(symbol, timeframe?, text?)`

دریافت تصمیم AI

**پارامترها:**
- `symbol` (string): نماد ارز
- `timeframe` (string, optional): بازه زمانی (پیش‌فرض: '1h')
- `text` (string, optional): متن اضافی برای context

**بازگشت:** `Promise<AIDecisionResponse>`

**مثال:**
```typescript
const decision = await client.getAIDecision('BTC', '1h');
```

---

##### `getServiceRate(pair)`

دریافت نرخ معامله

**پارامترها:**
- `pair` (string): جفت ارز (BTC/USDT, ETH/USDT, ...)

**بازگشت:** `Promise<ServiceRateResponse>`

**مثال:**
```typescript
const rate = await client.getServiceRate('BTC/USDT');
```

---

##### `getModelsSummary()`

دریافت خلاصه مدل‌های AI

**بازگشت:** `Promise<ModelsResponse>`

**مثال:**
```typescript
const models = await client.getModelsSummary();
```

---

##### `checkHealth()`

بررسی سلامت سیستم

**بازگشت:** `Promise<{ status: string; service: string }>`

**مثال:**
```typescript
const health = await client.checkHealth();
```

---

## 🔧 تنظیمات پیشرفته

### Timeout سفارشی

```typescript
const client = new CryptoAPIClient({
  baseURL: 'https://...',
  timeout: 30000, // 30 ثانیه
});
```

### Retry سفارشی

```typescript
const client = new CryptoAPIClient({
  baseURL: 'https://...',
  retries: 5,
  retryDelay: 2000, // 2 ثانیه
});
```

### مدیریت خطا

```typescript
try {
  const ohlcv = await client.getOHLCV('BTC', '1h', 100);
  console.log('موفق!', ohlcv);
} catch (error) {
  if (error.message.includes('timeout')) {
    console.error('زمان درخواست تمام شد');
  } else if (error.message.includes('404')) {
    console.error('endpoint یافت نشد');
  } else {
    console.error('خطای ناشناخته:', error);
  }
}
```

---

## 📊 نمونه خروجی‌ها

### OHLCV Response

```json
{
  "success": true,
  "data": [
    {
      "time": 1733328000,
      "open": 42500.50,
      "high": 42800.00,
      "low": 42300.00,
      "close": 42650.25,
      "volume": 1234.56
    }
  ],
  "symbol": "BTC",
  "timeframe": "1h",
  "count": 100,
  "source": "binance (primary)"
}
```

### Coins Response

```json
{
  "data": [
    {
      "id": "bitcoin",
      "name": "Bitcoin",
      "symbol": "BTC",
      "current_price": 42650.25,
      "price_change_percentage_24h": 2.5,
      "market_cap": 835000000000
    }
  ],
  "source": "Multi-source (15+ fallbacks)"
}
```

### Sentiment Response

```json
{
  "label": "bullish",
  "score": 0.875,
  "model": "demo-local-sentiment",
  "symbol": "BTC"
}
```

### AI Decision Response

```json
{
  "decision": "BUY",
  "confidence": 78,
  "reason": "Strong bullish momentum detected",
  "indicators": {
    "rsi": 65,
    "macd": "bullish",
    "volume": "high"
  },
  "timestamp": "2025-12-04T12:00:00Z"
}
```

---

## 🎯 نکات مهم

1. **بدون API Key**: همه endpoint‌ها رایگان و بدون نیاز به API Key هستند

2. **CORS**: از هر domain قابل دسترسی است

3. **Rate Limiting**: نامحدود (به دلیل سیستم fallback)

4. **Timeout**: 10-15 ثانیه توصیه می‌شود

5. **Retry**: سیستم خودکار retry با exponential backoff

6. **Fallback**: هر endpoint از 10-20 منبع پشتیبان استفاده می‌کند

7. **Error Handling**: همیشه `try-catch` استفاده کنید

---

## 🚀 Deploy و Production

### Build برای Production

```bash
npm run build
```

### استفاده در پروژه دیگر

```typescript
import { CryptoAPIClient } from 'crypto-api-client';

const client = new CryptoAPIClient({
  baseURL: process.env.CRYPTO_API_URL || 'https://...'
});
```

---

## 📞 پشتیبانی

برای سوالات و مشکلات:
- GitHub Issues: [لینک]
- Email: [ایمیل]
- Documentation: [لینک]

---

## 📄 لایسنس

MIT License

---

**ساخته شده با ❤️ برای جامعه کریپتو**

