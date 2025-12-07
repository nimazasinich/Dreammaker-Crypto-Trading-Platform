# Data Flow Architecture

**Last Updated:** 2025-11-16  
**Type:** Reality Check (What Actually Runs, Not Vision)

This document describes the **actual runtime data flow** in the current build, not the idealized architecture.

---

## 🎯 Primary Data Pipeline (90%+ of Data)

```
┌─────────────────┐
│  HF Data Engine │  External service (Hugging Face Data Engine)
│   (External)    │  Provides: Market prices, OHLCV, tickers, health
└────────┬────────┘
         │
         │ HTTP/REST
         ▼
┌─────────────────────┐
│ HFDataEngineClient  │  src/services/hf/HFDataEngineClient.ts
│                     │  Core HTTP client wrapper
└────────┬────────────┘
         │
         │ Adapter Pattern
         ▼
┌──────────────────────┐
│  HFMarketAdapter     │  src/services/hf/HFMarketAdapter.ts
│                      │  Transforms HF format → internal format
└────────┬─────────────┘
         │
         │ Multi-provider abstraction
         ▼
┌─────────────────────────────┐
│ MultiProviderMarketDataService │  src/services/marketData/MultiProviderMarketDataService.ts
│                             │  Orchestrates primary + fallback providers
└────────┬────────────────────┘
         │
         │ Policy enforcement
         ▼
┌─────────────────────┐
│  RealDataManager    │  src/services/RealDataManager.ts
│                     │  Enforces STRICT_REAL_DATA policy
│                     │  Blocks fake/mock data if enabled
└────────┬────────────┘
         │
         │ React Context
         ▼
┌─────────────────────┐
│   DataContext       │  src/contexts/DataContext.tsx
│                     │  Global state for market data
└────────┬────────────┘
         │
         │ Custom hooks
         ▼
┌─────────────────────┐
│  useMarketData()    │  src/hooks/useMarketData.ts
│  usePriceData()     │  src/hooks/usePriceData.ts
│  useTickerData()    │  etc.
└────────┬────────────┘
         │
         ▼
┌─────────────────────┐
│   UI Components     │  Dashboard, Scanner, Trading views
└─────────────────────┘
```

---

## 🔄 Real-Time Data (WebSocket Futures Only)

For **Futures positions, orders, and funding rates**, there's a separate WebSocket channel:

```
┌──────────────────┐
│  KuCoin Futures  │  KuCoin Futures testnet WebSocket
│   WebSocket      │
└────────┬─────────┘
         │
         │ ws://
         ▼
┌──────────────────────┐
│  futuresChannel.ts   │  src/services/websocket/futuresChannel.ts
│                      │  Handles: positions, orders, funding updates
└────────┬─────────────┘
         │
         │ Broadcast to subscribers
         ▼
┌──────────────────────┐
│  TradingContext      │  src/contexts/TradingContext.tsx
│                      │  Updates positions/orders in real-time
└────────┬─────────────┘
         │
         ▼
┌──────────────────────┐
│  FuturesTradingView  │  src/views/FuturesTradingView.tsx
│  PositionsList       │  Real-time UI updates
└──────────────────────┘
```

**Important:** This WebSocket is **Futures-only**. SPOT data (if ever implemented) would need a separate WebSocket channel.

---

## 🔀 Fallback Providers (Rarely Used)

These providers are **architected** but serve as **optional fallbacks** when HF Engine is unavailable or incomplete:

### Binance Provider
- **File:** `src/services/providers/BinanceProvider.ts`
- **Use Case:** Fallback for BTC/USDT price if HF Engine fails
- **Coverage:** Limited to major pairs (BTC, ETH, BNB)

### KuCoin Provider
- **File:** `src/services/providers/KuCoinProvider.ts`
- **Use Case:** Futures trading API (not market data)
- **Coverage:** Futures orders, positions, balance

### CoinMarketCap (CMC)
- **File:** `src/services/providers/CMCProvider.ts`
- **Use Case:** Fallback for market cap data
- **Coverage:** Top 100 coins by market cap

### CryptoCompare
- **File:** `src/services/providers/CryptoCompareProvider.ts`
- **Use Case:** Historical OHLCV fallback
- **Coverage:** Major pairs only

### AlphaVantage
- **File:** `src/services/providers/AlphaVantageProvider.ts`
- **Use Case:** Traditional market data (stocks, forex) if needed
- **Coverage:** Not used in current crypto-focused build

**Reality Check:** In practice, **HF Engine provides 90%+ of data**. These fallbacks rarely trigger unless HF Engine is down or a specific symbol isn't available.

---

## 📊 Signal Generation (Separate Pipeline)

Technical analysis and signal generation do **not** use HF Engine. They use **local analyzers**:

```
┌─────────────────────┐
│   Market Data       │  From DataContext (HF Engine → RealDataManager)
│   (OHLCV, Prices)   │
└────────┬────────────┘
         │
         │ Passed to local analyzers
         ▼
┌──────────────────────────────────────────────────┐
│             Local Analysis Engines               │
│                                                  │
│  • SMCAnalyzer.ts          (Smart Money)        │
│  • ElliottWaveAnalyzer.ts  (Wave patterns)      │
│  • HarmonicsAnalyzer.ts    (Harmonic patterns)  │
│  • FibonacciAnalyzer.ts    (Fib levels)         │
│  • SARAnalyzer.ts          (Parabolic SAR)      │
│  • WilliamsRAnalyzer.ts    (Williams %R)        │
│  • SentimentAnalyzer.ts    (Social sentiment)   │
│  • NewsAnalyzer.ts         (News impact)        │
│  • WhaleAnalyzer.ts        (Large orders)       │
│  • MLPredictor.ts          (ML predictions)     │
└────────┬─────────────────────────────────────────┘
         │
         │ Aggregated by Signal Engine
         ▼
┌─────────────────────┐
│   SignalEngine      │  src/services/signals/SignalEngine.ts
│                     │  Combines all detectors
│                     │  Applies scoring from scoring.config.json
└────────┬────────────┘
         │
         │ Strategy pipeline
         ▼
┌─────────────────────┐
│  Strategy 1 → 2 → 3 │  src/services/strategy/
│                     │  3-tier strategy scoring system
└────────┬────────────┘
         │
         ▼
┌─────────────────────┐
│  Trading Signals    │  High-conviction buy/sell signals
│                     │  Displayed in Scanner, Dashboard
└─────────────────────┘
```

**Why Local?**
- **Latency:** Real-time signal generation without external API calls
- **Control:** Full control over indicator parameters and weights
- **Reliability:** No dependency on external signal services

---

## 🚫 What HF Engine Does NOT Provide

The following are **intentionally** kept local and do **not** come from HF Engine:

1. **SMC (Smart Money Concepts) Analysis**
   - Order blocks, fair value gaps, liquidity zones
   - Source: `SMCAnalyzer.ts`

2. **Elliott Wave Patterns**
   - Wave counting, impulse/corrective waves
   - Source: `ElliottWaveAnalyzer.ts`

3. **Signal Storage**
   - Historical signals, signal performance tracking
   - Source: Local SQLite/JSON (if implemented) or in-memory

4. **Strategy Execution Logic**
   - Trade entry/exit decisions
   - Source: `TradeEngine.ts`, `RiskGuard.ts`

5. **Backtest Results**
   - Historical strategy performance
   - Source: `BacktestEngine.ts` (frontend-based)

**Why?**
- These are **proprietary algorithms** and **competitive advantages**.
- Keeping them local maintains control and intellectual property.

---

## ⚙️ Data Policy Enforcement

The `RealDataManager` enforces data integrity based on environment variables:

```typescript
// In src/services/RealDataManager.ts

if (process.env.VITE_STRICT_REAL_DATA === 'true') {
  // Block synthetic data
  // Block mock data
  // Only allow real API responses
}

if (process.env.VITE_ALLOW_FAKE_DATA === 'false') {
  // Reject any fill/order that doesn't come from exchange
}
```

**Production Configuration:**
```bash
VITE_APP_MODE=online
VITE_STRICT_REAL_DATA=true
VITE_USE_MOCK_DATA=false
VITE_ALLOW_FAKE_DATA=false
```

See [Production Environment Config](./production-env-config.md) for full reference.

---

## 🔄 Auto-Refresh Strategy

**Current State:** Auto-refresh is **disabled** to reduce API load during development.

**Planned Strategy:**
- **WebSocket (primary):** Real-time updates for Futures data (positions, orders)
- **Polling (fallback):** Long intervals (30-60s) for market data
- **User Control:** Settings toggle for auto-refresh on/off and interval selection

**Implementation Location:**
- `DataContext.tsx` - Market data refresh
- `TradingContext.tsx` - Trading data refresh
- `SettingsView.tsx` - User controls (to be implemented)

---

## 📈 Data Flow Summary (By Use Case)

| Use Case | Primary Source | Fallback | Update Mechanism |
|----------|---------------|----------|------------------|
| Market Prices | HF Engine | Binance | Polling (disabled) |
| OHLCV Data | HF Engine | CryptoCompare | Polling (disabled) |
| Market Cap | HF Engine | CoinMarketCap | Polling (disabled) |
| Futures Positions | KuCoin WS | KuCoin REST | WebSocket (active) |
| Futures Orders | KuCoin WS | KuCoin REST | WebSocket (active) |
| Trading Signals | Local Analyzers | N/A | On-demand |
| Strategy Scores | Local Engine | N/A | On-demand |

---

## 🔍 Debugging Data Flow

### Check if HF Engine is responding:
```bash
curl http://[HF_ENGINE_URL]/health
```

### Check if data is reaching frontend:
1. Open browser DevTools → Console
2. Type: `window.__DATA_CONTEXT__` (if exposed)
3. Or check Redux DevTools / React DevTools

### Check if WebSocket is connected:
1. Open browser DevTools → Network → WS tab
2. Look for KuCoin Futures WebSocket connection
3. Should show active connection with periodic messages

### Check Multi-Provider Fallback:
```typescript
// In MultiProviderMarketDataService.ts
console.log('Primary provider:', this.primaryProvider);
console.log('Fallback providers:', this.fallbackProviders);
```

---

## 📚 Related Documentation

- [Routes Inventory](./routes.md) - Active vs planned API routes
- [HF Engine Scope](./hf-engine-scope.md) - What HF Engine provides
- [Production Environment Config](./production-env-config.md) - Required env vars

---

**Key Takeaway:** HF Engine is the primary data source. All analysis happens locally. Futures WebSocket provides real-time updates. Fallback providers rarely trigger in practice.
