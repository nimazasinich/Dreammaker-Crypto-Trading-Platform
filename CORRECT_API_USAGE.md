# ✅ استفاده صحیح از HF Space API

## 🎯 اصول کلی (از فایل Help):

### 1️⃣ HTTP-First Approach (توصیه شده):
```
✅ Primary Method: HTTP REST API endpoints
✅ All features work perfectly via HTTP
✅ WebSocket is completely OPTIONAL
✅ Automatic fallback to HTTP polling (30s intervals)
```

### 2️⃣ WebSocket (اختیاری):
```
⚠️ WebSocket is NOT required
⚠️ HuggingFace Spaces may limit WebSocket
⚠️ If WebSocket fails → Automatic HTTP fallback
⚠️ All functionality works identically with HTTP
```

## 📊 Endpoint های صحیح:

### Market Data (قیمت‌ها):
```javascript
// ✅ صحیح - از /api/market/tickers استفاده کنید
GET https://really-amin-datasourceforcryptocurrency-2.hf.space/api/market/tickers?limit=100

// Response:
{
  "success": true,
  "items": [
    { "symbol": "BTC", "price": 93246, "change_24h": 0.27 },
    { "symbol": "ETH", "price": 3194, "change_24h": 4.40 }
  ]
}
```

### OHLCV Data (Candlestick):
```javascript
// ✅ صحیح - اما داده‌های mock برمی‌گرداند (مشکل backend است)
GET https://really-amin-datasourceforcryptocurrency-2.hf.space/api/ohlcv?symbol=BTC/USDT&timeframe=1h&limit=500

// یا از Binance public API استفاده کنید (نیاز به CORS proxy):
GET https://api.binance.com/api/v3/klines?symbol=BTCUSDT&interval=1h&limit=500
```

### News:
```javascript
// ✅ صحیح
GET https://really-amin-datasourceforcryptocurrency-2.hf.space/api/news/latest?symbol=BTC&limit=10
// یا
GET https://really-amin-datasourceforcryptocurrency-2.hf.space/api/news?limit=20
```

### Sentiment:
```javascript
// ✅ صحیح
GET https://really-amin-datasourceforcryptocurrency-2.hf.space/api/sentiment/global

// Analyze text:
POST https://really-amin-datasourceforcryptocurrency-2.hf.space/api/sentiment/analyze
{
  "text": "Bitcoin is going to the moon!",
  "mode": "crypto"
}
```

### AI Signals:
```javascript
// ✅ صحیح
GET https://really-amin-datasourceforcryptocurrency-2.hf.space/api/ai/signals?limit=10
```

### Health Check:
```javascript
// ✅ صحیح
GET https://really-amin-datasourceforcryptocurrency-2.hf.space/api/health
GET https://really-amin-datasourceforcryptocurrency-2.hf.space/health
```

## 🔌 WebSocket (اختیاری):

### WebSocket Endpoints (اگر موجود باشد):
```javascript
// Master endpoint (همه سرویس‌ها)
wss://really-amin-datasourceforcryptocurrency-2.hf.space/ws/master

// Live data (قیمت‌های real-time)
wss://really-amin-datasourceforcryptocurrency-2.hf.space/ws/live

// AI data (وضعیت مدل‌ها)
wss://really-amin-datasourceforcryptocurrency-2.hf.space/ws/ai/data

// Data collection (market, news, sentiment)
wss://really-amin-datasourceforcryptocurrency-2.hf.space/ws/data

// Monitoring (health checks)
wss://really-amin-datasourceforcryptocurrency-2.hf.space/ws/monitoring
```

### استفاده از WebSocket (با fallback به HTTP):
```javascript
const ws = new WebSocket('wss://really-amin-datasourceforcryptocurrency-2.hf.space/ws/master');

ws.onopen = () => {
  console.log('✅ WebSocket connected (optional)');
  ws.send(JSON.stringify({
    action: 'subscribe',
    service: 'market_data'
  }));
};

ws.onerror = (error) => {
  console.warn('⚠️ WebSocket error (non-critical):', error);
  // Fallback to HTTP polling
  setupHttpPolling();
};

ws.onclose = () => {
  console.log('🔌 WebSocket closed, using HTTP polling');
  setupHttpPolling();
};

function setupHttpPolling() {
  setInterval(async () => {
    const response = await fetch('https://really-amin-datasourceforcryptocurrency-2.hf.space/api/market/tickers?limit=100');
    const data = await response.json();
    console.log('Market data:', data);
  }, 30000); // Poll every 30 seconds
}
```

## 🎯 توصیه نهایی:

### برای این پروژه:
1. ✅ **استفاده از HTTP endpoints** (primary method)
2. ✅ **Polling interval: 30 seconds** (برای داده‌های real-time)
3. ⚠️ **WebSocket را optional نگه دارید** (اگر موجود باشد، استفاده کنید؛ اگر نه، HTTP polling)
4. ❌ **انتظار WebSocket را نداشته باشید** (ممکن است در HF Space محدود شده باشد)

### Error Handling:
```javascript
async function fetchWithFallback(endpoint) {
  try {
    // Try HTTP first
    const response = await fetch(`https://really-amin-datasourceforcryptocurrency-2.hf.space${endpoint}`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error(`❌ Failed to fetch ${endpoint}:`, error);
    // Return empty data instead of throwing
    return { success: false, data: [], error: error.message };
  }
}
```

## 📝 مشکلات فعلی:

### 1️⃣ OHLCV Endpoint:
```
❌ Problem: /api/ohlcv returns MOCK data (BTC=$2,220 instead of $93,000)
✅ Solution: Contact HF Space owner or use Binance public API
```

### 2️⃣ AI Predict Endpoint:
```
❌ Problem: /api/ai/predict → 404 (doesn't exist)
✅ Solution: Use /api/ai/signals instead
```

### 3️⃣ WebSocket Connection:
```
⚠️ Problem: WebSocket may be limited on HF Spaces
✅ Solution: This is NORMAL and NON-CRITICAL - use HTTP polling
```

## 🎉 خلاصه:

**همه چیز درست کار می‌کند، به جز:**
1. OHLCV data (mock data - مشکل backend)
2. WebSocket (optional - ممکن است محدود باشد)

**راه‌حل:**
- از HTTP endpoints استفاده کنید (recommended)
- Polling interval: 30 seconds
- WebSocket را optional نگه دارید
- اگر WebSocket fail شد، automatic fallback به HTTP

