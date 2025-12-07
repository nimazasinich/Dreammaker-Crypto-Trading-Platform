# 🚀 Quick Start - HuggingFace Crypto API

## 5-Minute Setup Guide

### 1. Import the API Client

```typescript
import { cryptoAPI } from '@/services/CryptoAPI';
```

That's it! No API keys, no configuration needed.

### 2. Fetch Data

#### Get Price
```typescript
const btc = await cryptoAPI.getPrice('BTC/USDT');
console.log(`BTC: $${btc.data.price}`);
```

#### Get Chart Data
```typescript
const chart = await cryptoAPI.getOHLCV('BTC', '1h', 200);
chart.data.forEach(candle => {
  console.log(`Time: ${candle.t}, Close: ${candle.c}`);
});
```

#### Get News
```typescript
const news = await cryptoAPI.getNews('BTC', 10);
news.news.forEach(article => {
  console.log(article.title);
});
```

### 3. Using Services (Recommended)

```typescript
import { marketDataService } from '@/services/marketDataService';

// Get historical data
const data = await marketDataService.getHistoricalData('BTCUSDT', '1h', 100);

// Subscribe to real-time updates
marketDataService.subscribeToRealTime(['BTCUSDT'], (data) => {
  console.log(`Price: $${data.close}`);
});
```

## That's It! 🎉

**No API keys, no complex setup, just import and use!**

For more details, see:
- `HUGGINGFACE_INTEGRATION.md` - Full documentation
- `MIGRATION_SUMMARY.md` - Migration details
- `src/services/CryptoAPI.ts` - API client source code
