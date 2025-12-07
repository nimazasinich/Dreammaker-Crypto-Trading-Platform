# ⚡ پرامپت سریع: حل همه خطاهای TypeScript (Copy & Paste)

**این پرامپت رو کپی کن و مستقیماً به Cursor بده:**

---

```
Fix all 41 TypeScript errors in this DreamMaker project systematically.

STEP 1: Run typecheck and analyze errors
```bash
npm run typecheck 2>&1 | tee ts-errors.log
```

STEP 2: Fix errors by category

Category 1 - Missing Interface Properties (19 errors):

Find and update these interfaces in src/types/ and src/core/:

1. ExchangeFlow interface - add:
   netFlow: number;

2. OnChainMetrics interface - add:
   hodlerBehavior?: {
     accumulation: number;
     distribution: number;
     holding: number;
   };

3. LatencyStats (in src/core/providerLatencyTracker.ts) - add:
   minLatency?: number;
   maxLatency?: number;
   lastLatency?: number;

4. RecoveryStats (in src/core/providerRecoveryTracker.ts) - add:
   uptime?: number;
   successRate?: number;
   failureRate?: number;
   isHealthy?: boolean;
   consecutiveFailures?: number;
   lastStatus?: string;
   lastSuccessTime?: number;
   lastFailureTime?: number;
   totalAttempts?: number;

5. ErrorStats (in src/core/providerErrorLog.ts) - add:
   lastError?: {
     provider: string;
     message: string;
     timestamp: number;
     code?: string;
   };

Category 2 - Property Name Fix (2 errors):

In src/detectors/news.ts:
- Replace all `.published` with `.publishedAt`

Category 3 - Missing Methods (3 errors):

1. In src/core/providerLatencyTracker.ts, add:
```typescript
getStats(provider?: string): any {
  if (provider) {
    return {
      providers: [provider],
      avgLatency: this.calculateAvgLatency(provider),
      totalSamples: this.getSampleCount(provider),
      minLatency: this.getMinLatency(provider),
      maxLatency: this.getMaxLatency(provider),
      lastLatency: this.getLastLatency(provider)
    };
  }
  return this.getAllStats();
}

clearStats(provider?: string): void {
  if (provider) {
    this.clearProviderStats(provider);
  } else {
    this.clearAllStats();
  }
}
```

2. In src/core/providerErrorLog.ts, add:
```typescript
clearAllErrors(): void {
  this.errors.clear();
  this.errorCounts.clear();
}
```

Category 4 - Type Mismatches (7 errors):

1. ElliottWaveAnalysis interface - add:
   waveStructure?: {
     impulse: boolean;
     corrective: boolean;
     degree: string;
   };

2. HarmonicPattern interface - add:
   fibonacciLevels: Array<{
     name: string;
     value: number;
     price: number;
   }>;
   completionProbability: number;
   
   And in prz object, add:
   confluence?: number;

3. In src/controllers/MarketDataController.ts line 280:
   Change: cryptoAPI.getNews(50)
   To: cryptoAPI.getNews(symbol, 50)

Category 5 - React Component Types (6 errors):

1. In src/components/portfolio/Portfolio.tsx and RiskCenterPro.tsx:
   - Change icon assignments from `<Icon />` to `Icon` (without JSX)
   - Update ActionButton interface to include:
     icon?: LucideIcon;
     variant?: 'primary' | 'secondary';

2. In SpectacularLoader.tsx and DrawingToolsPanel.tsx:
   - Remove `style` prop from Icon components
   - Use `className` instead for styling

Category 6 - Other (4 errors):

1. src/components/LiveDataContext.tsx:
   Change: dataManager as DataManagerWithWS
   To: dataManager as unknown as DataManagerWithWS

2. src/components/market/LightweightPriceChart.tsx:
   Update to use correct lightweight-charts v4 API:
   ```typescript
   const candlestickSeries = chart.addSeries({
     type: 'Candlestick',
     // ... options
   });
   ```

3. src/hooks/useSignalAgent.ts:
   Add symbol property to marketData object:
   ```typescript
   const marketData = { 
     symbol: currentSymbol,
     timestamp, 
     open, 
     high, 
     low, 
     close, 
     volume 
   };
   ```

4. src/monitoring/errorLabelMonitoring.ts and src/core/Logger.ts:
   In Logger.ts, add:
   ```typescript
   export const LogLevels = ['DEBUG', 'INFO', 'WARN', 'ERROR', 'CRITICAL'] as const;
   ```
   
   In errorLabelMonitoring.ts, replace:
   Object.values(LogLevel)
   with:
   LogLevels

STEP 3: Verify all fixes
```bash
npm run typecheck  # Should show 0 errors
npm run build:client  # Should succeed
```

Fix all errors systematically, one category at a time. After each category, run typecheck to verify progress.

Goal: 0 TypeScript errors ✅
```

---

# 🎯 یا این پرامپت خیلی کوتاه:

```
You are a TypeScript expert. I have 41 TypeScript errors in DreamMaker project.

Run: npm run typecheck

Then fix ALL errors in these categories:
1. Missing properties in interfaces (19 errors) - Add: netFlow, hodlerBehavior, minLatency, maxLatency, uptime, successRate, lastError, etc.
2. Property name mismatches (2 errors) - Change .published to .publishedAt in news.ts
3. Missing methods (3 errors) - Add getStats(provider), clearStats(provider), clearAllErrors() to tracker classes
4. Type mismatches (7 errors) - Add waveStructure, fibonacciLevels, completionProbability to pattern interfaces. Fix getNews(symbol, limit) call.
5. React component types (6 errors) - Fix icon props (use Icon not <Icon />), add icon/variant to ActionButton interface, remove style props
6. Other (4 errors) - Fix type assertions, lightweight-charts API, add symbol to marketData, export LogLevels array

Goal: 0 TypeScript errors. Run typecheck after each fix to verify.
```

---

**استفاده:** کپی کن → Paste در Cursor → Enter ✅
