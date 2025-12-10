# 🚀 راهنمای شروع سریع

<div dir="rtl">

## نصب و راه‌اندازی

### 1. نصب وابستگی‌ها

```bash
npm install
```

### 2. Build کردن پروژه

```bash
npm run build
```

### 3. اجرای مثال‌ها

```bash
# مثال پایه
npm run dev

# یا مستقیماً با ts-node
npx ts-node examples/01-basic-usage.ts
npx ts-node examples/02-market-data.ts
npx ts-node examples/03-sentiment-analysis.ts
npx ts-node examples/04-ai-trading.ts
npx ts-node examples/05-complete-dashboard.ts
```

## استفاده در پروژه خود

### نصب از npm (پس از انتشار)

```bash
npm install @dreammaker/crypto-api-client
```

### استفاده در TypeScript

```typescript
import { CryptoDataClient } from '@dreammaker/crypto-api-client';

const client = new CryptoDataClient();

async function example() {
  // بررسی سلامت
  const health = await client.health();
  console.log('Status:', health.status);
  
  // دریافت قیمت
  const rate = await client.getRate('BTC/USDT');
  console.log('BTC Price:', rate.price);
}

example();
```

### استفاده در JavaScript (CommonJS)

```javascript
const { CryptoDataClient } = require('@dreammaker/crypto-api-client');

const client = new CryptoDataClient();

async function example() {
  const health = await client.health();
  console.log('Status:', health.status);
}

example();
```

## مثال‌های سریع

### دریافت قیمت بیت‌کوین

```typescript
const rate = await client.getRate('BTC/USDT');
console.log(`قیمت BTC: $${rate.price}`);
```

### دریافت احساسات بازار

```typescript
const sentiment = await client.getGlobalSentiment('1D');
console.log(`شاخص ترس و طمع: ${sentiment.fear_greed_index}`);
```

### دریافت سیگنال‌های AI

```typescript
const signals = await client.getSignals('BTC');
signals.signals.forEach(signal => {
  console.log(`${signal.type}: ${signal.score}`);
});
```

### دریافت تصمیم معاملاتی

```typescript
const decision = await client.getDecision({
  symbol: 'BTC',
  horizon: 'swing',
  risk_tolerance: 'moderate'
});
console.log(`تصمیم: ${decision.decision}`);
```

## مثال کامل

```typescript
import { CryptoDataClient } from '@dreammaker/crypto-api-client';

async function tradingBot() {
  const client = new CryptoDataClient();
  
  // 1. بررسی سلامت
  const health = await client.health();
  if (health.status !== 'healthy') {
    console.error('سرویس فعال نیست');
    return;
  }
  
  // 2. دریافت قیمت
  const rate = await client.getRate('BTC/USDT');
  console.log(`💰 قیمت BTC: $${rate.price}`);
  
  // 3. دریافت احساسات
  const sentiment = await client.getGlobalSentiment('1D');
  console.log(`🎭 احساس: ${sentiment.sentiment}`);
  
  // 4. دریافت تصمیم AI
  const decision = await client.getDecision({
    symbol: 'BTC',
    horizon: 'swing',
    risk_tolerance: 'moderate'
  });
  
  console.log(`🤖 تصمیم AI: ${decision.decision}`);
  console.log(`📊 اطمینان: ${decision.confidence * 100}%`);
  console.log(`🎯 هدف: $${decision.targets.target}`);
  
  // 5. تصمیم‌گیری
  if (decision.decision === 'BUY' && decision.confidence > 0.7) {
    console.log('✅ سیگنال خرید قوی!');
  } else if (decision.decision === 'SELL' && decision.confidence > 0.7) {
    console.log('⚠️ سیگنال فروش قوی!');
  } else {
    console.log('🟡 منتظر بمانید');
  }
}

tradingBot().catch(console.error);
```

## مدیریت خطا

```typescript
import { CryptoAPIError } from '@dreammaker/crypto-api-client';

try {
  const rate = await client.getRate('BTC/USDT');
  console.log('قیمت:', rate.price);
} catch (error) {
  if (error instanceof CryptoAPIError) {
    console.error('خطای API:', error.message);
    console.error('کد:', error.statusCode);
  } else {
    console.error('خطای ناشناخته:', error);
  }
}
```

## پیکربندی

```typescript
const client = new CryptoDataClient({
  baseUrl: 'https://really-amin-datasourceforcryptocurrency-2.hf.space',
  timeout: 30000,  // 30 ثانیه
  retries: 3,      // 3 تلاش
  retryDelay: 1000 // 1 ثانیه تاخیر
});
```

## لینک‌های مفید

- 📖 [مستندات کامل](./README.md)
- 💡 [مثال‌ها](./examples/)
- 🐛 [گزارش مشکلات](https://github.com/yourusername/crypto-api-client/issues)

</div>
