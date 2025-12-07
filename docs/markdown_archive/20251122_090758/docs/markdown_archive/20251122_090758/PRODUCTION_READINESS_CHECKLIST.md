# Production Readiness Checklist v1.0
**DreammakerCryptoSignalAndTrader**  
Generated: 2025-11-16

This checklist transforms architectural findings into concrete, actionable tasks for moving toward production readiness.

---

## 🔴 CRITICAL PATH (Core Integrity / Clarity)

These items must be resolved before any production deployment.

### ✅ 1. SPOT Trading Decision — **COMPLETED**
**Status:** ✅ Resolved as Futures-Only Release  
**Impact:** Eliminates the biggest conceptual leak in the system

- [x] Config already set to `"market": "FUTURES"` in `config/system.config.json`
- [x] UI cleaned up to remove SPOT tab ambiguity (Futures-only interface)
- [x] Documentation updated to clearly state "Futures-only; SPOT is planned"
- [x] `SpotNotAvailable.tsx` kept for future "Coming Soon" messaging

**Decision:** Futures-only release (fastest, safest path to production)

---

### ✅ 2. Route Surface Stabilization — **COMPLETED**
**Status:** ✅ Documented  
**Impact:** Eliminates confusion about which routes are actually implemented

- [x] Documented 19 commented route imports in `server.ts`
- [x] Created `docs/routes.md` listing:
  - ✅ Active routes (functional in current build)
  - 🚫 Planned routes (not implemented, removed from active code)
- [x] Clear separation prevents accidental attempts to use non-existent endpoints

**Result:** Route inventory is now transparent and trustworthy.

---

### ✅ 3. Data Policy Lock for Real Trading — **COMPLETED**
**Status:** ✅ Documented  
**Impact:** Ensures no fake data in production environments

- [x] Documented required production environment variables:
  ```bash
  VITE_APP_MODE=online
  VITE_STRICT_REAL_DATA=true
  VITE_USE_MOCK_DATA=false
  VITE_ALLOW_FAKE_DATA=false
  ```
- [x] Created `docs/production-env-config.md` with complete reference
- [x] Matches existing design philosophy (no fake fills, no synthetic bars)

**Result:** Production data integrity is now enforceable via environment configuration.

---

## 🟡 HIGH-VALUE IMPROVEMENTS (1–2 Focused Sessions)

These enhance clarity and operational reliability without breaking changes.

### ✅ 4. Data Flow Documentation — **COMPLETED**
**Status:** ✅ Documented  
**Impact:** Clarifies actual runtime data pipeline vs architectural vision

- [x] Created `docs/data-flow.md` with realistic flow diagram:
  - HF Engine → HFMarketAdapter → MultiProviderMarketDataService → RealDataManager → DataContext
- [x] Documented Binance/KuCoin/CMC/CryptoCompare as **optional fallbacks**, not core
- [x] Clear separation between "what's used" vs "what's architected"

**Result:** No more confusion about which providers are actually driving the system.

---

### 🟡 5. HF Adapter Scope Clarification — **IN PROGRESS**
**Status:** 🔄 Needs Code Review  
**Impact:** Prevents future attempts to "fix" intentional non-implementations

- [x] Documented in `docs/hf-engine-scope.md`:
  - ✅ What HF Engine **does**: prices, OHLCV, market overview, health, providers
  - 🚫 What HF Engine **does not** do: SMC, Elliott, signal storage (kept local)
- [ ] **TODO:** Add inline comments in `hf/*Adapter.ts` files referencing this doc
- [ ] **TODO:** Verify authoritative implementations (`SMCAnalyzer`, `ElliottWaveAnalyzer`, `SignalEngine`)

**Action Required:** Review `src/services/hf/` adapters and add doc references.

---

### 🟡 6. Auto-Refresh with User Control
**Status:** 🔄 Not Started  
**Impact:** Balances real-time data needs with performance/load concerns

- [ ] Re-enable refresh in `DataContext` and `TradingContext` with long intervals (30-60s)
- [ ] Add user toggle in `SettingsView`:
  - "Auto refresh data: On/Off"
  - "Interval: [30s, 60s, 120s]"
- [ ] Keep Futures WebSocket as primary real-time source
- [ ] Use polling as safety net, not primary mechanism

**Action Required:** Implement settings UI and context refresh logic.

---

## 🟢 MEDIUM-TERM IMPROVEMENTS (Refinement / DX)

These improve developer experience and user experience without changing core architecture.

### 🟢 7. URL-Based Navigation (Keep Custom Provider)
**Status:** 🔄 Not Started  
**Impact:** Enables deep links and browser history without full React Router migration

- [ ] Keep existing `NavigationProvider` (it works well)
- [ ] Add URL hash sync: `/#/dashboard`, `/#/scanner`, `/#/trading`, etc.
- [ ] Implement bidirectional sync: `NavigationProvider` ↔ `window.location.hash`
- [ ] Benefits:
  - Deep links for sharing
  - Browser back/forward support
  - No breaking changes to existing navigation

**Action Required:** Add hash routing layer to `NavigationProvider`.

---

### 🟢 8. Minimum Test Skeleton
**Status:** 🔄 Not Started  
**Impact:** Locks critical behavior and prevents accidental regressions

Implement these two minimal tests to establish quality baseline:

#### Test 1: `RiskGuard.checkTradeRisk()`
- [ ] Create test file: `src/services/__tests__/RiskGuard.test.ts`
- [ ] Test passing case: Valid trade within risk limits
- [ ] Test failing case: Trade exceeds position size limit

#### Test 2: `TradeEngine.executeSignal()`
- [ ] Create test file: `src/services/__tests__/TradeEngine.test.ts`
- [ ] Test blocking behavior: Verify no execution when `mode: OFF`
- [ ] Test testnet behavior: Verify `ExchangeClient` is called only in `TESTNET` mode

**Action Required:** Set up test infrastructure and implement these two tests.

---

### 🟢 9. Exchange Selector Cleanup (Optional)
**Status:** 🔄 Not Started  
**Impact:** Removes confusion if only KuCoin Futures is truly operational

- [ ] Verify which exchanges are actually functional:
  - KuCoin Futures: ✅ Full implementation
  - Binance: ❓ Data only? Trading?
  - Others: ❓
- [ ] If only KuCoin Futures works:
  - Remove/disable selector in production mode
  - Or clearly mark others as "Data Only (No Trading)"

**Action Required:** Audit exchange implementations and update UI accordingly.

---

## 📊 Completion Summary

| Priority | Total | Completed | In Progress | Not Started |
|----------|-------|-----------|-------------|-------------|
| 🔴 Critical | 3 | 3 | 0 | 0 |
| 🟡 High | 3 | 1 | 2 | 0 |
| 🟢 Medium | 3 | 0 | 0 | 3 |
| **TOTAL** | **9** | **4** | **2** | **3** |

---

## 🚀 Next Actions (Recommended Sequence)

1. **Immediate (this session):**
   - ✅ Complete SPOT trading cleanup
   - ✅ Document routes and data flow
   - ✅ Document production env vars

2. **Next session:**
   - Review and update HF adapter inline docs
   - Implement auto-refresh settings UI
   - Add minimum test skeleton

3. **Future enhancement:**
   - Add URL hash routing
   - Audit exchange selector state
   - Expand test coverage

---

## 📝 Notes

- **Philosophy:** Prioritize honesty over completeness. Better to clearly mark something as "not implemented" than to provide fake/mock behavior.
- **Trading Safety:** All real trading goes through testnet first. Production mode requires explicit configuration.
- **Data Integrity:** HF Engine is primary source; other providers are fallbacks. No synthetic data in production.

---

**Maintenance:** Update this checklist as items are completed. Archive to `docs/archive/` when all items are resolved.
