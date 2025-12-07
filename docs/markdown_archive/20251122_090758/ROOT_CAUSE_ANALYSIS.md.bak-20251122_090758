# 🔍 ROOT CAUSE ANALYSIS - Realtime Data Sync & WebSocket Issues

**Date**: 2025-11-16  
**System**: Trading Dashboard (Express.js + React + TypeScript)  
**Issue**: Dashboard fails to load real Spot/Futures data consistently, WebSocket streaming unreliable

---

## 📋 COMPREHENSIVE ISSUE TABLE

| # | Layer | Problem | File | Line(s) | Root Cause | Severity | Fix Required |
|---|-------|---------|------|---------|------------|----------|--------------|
| 1 | Backend | Hardcoded localhost in CORS config | `src/server.ts` | 307 | CORS origins hardcoded to `localhost:5173`, `localhost:3000` - breaks HuggingFace deployment | 🔴 Critical | Use relative origins or env-based config |
| 2 | Backend | Hardcoded HF engine URL | `src/config/dataSource.ts` | 41 | Fallback to `http://localhost:8000` when env var missing | 🟡 Medium | Use relative path or proper env detection |
| 3 | Frontend | Multiple WebSocket instances | `src/views/PositionsView.tsx` | 51 | New WebSocket created without cleanup check - causes duplicate connections | 🔴 Critical | Use singleton pattern or context |
| 4 | Frontend | Multiple WebSocket instances | `src/views/ScannerView.tsx` | 223 | New WebSocket created in useEffect without proper cleanup | 🔴 Critical | Use singleton pattern or context |
| 5 | Frontend | Multiple WebSocket instances | `src/services/dataManager.ts` | 97 | New WebSocket created in service - potential duplicate | 🔴 Critical | Consolidate WS management |
| 6 | Frontend | Multiple WebSocket instances | `src/hooks/useSignalWebSocket.ts` | 57 | Another WS instance for signals | 🟡 Medium | Could be valid but needs coordination |
| 7 | Frontend | API_BASE used incorrectly | `src/views/PositionsView.tsx` | 84 | Uses `API_BASE/api/positions` causing double `/api` | 🟡 Medium | Use `apiUrl()` helper |
| 8 | Frontend | Hardcoded API path | `src/views/StrategyInsightsView.tsx` | 919 | Hardcoded `/api/system/status` instead of using `apiUrl()` | 🟡 Medium | Use `apiUrl()` helper |
| 9 | Frontend | Hardcoded API path | `src/components/ui/StatusRibbon.tsx` | 43 | Hardcoded `/api/system/health` instead of using `apiUrl()` | 🟡 Medium | Use `apiUrl()` helper |
| 10 | Backend | No HuggingFace root_path | `src/server.ts` | N/A | Express app not configured for HF Space routing | 🟡 Medium | Add middleware for HF path handling |
| 11 | Backend | WebSocket broadcast inefficiency | `src/server.ts` | 3686-3703 | Price broadcast runs for every connection individually | 🟡 Medium | Use centralized broadcast |
| 12 | Frontend | SystemStatus not handling errors | `src/views/StrategyInsightsView.tsx` | 922 | Error thrown if response not ok, but not caught properly | 🟢 Low | Add response.ok check |
| 13 | Frontend | Missing WebSocket cleanup | `src/views/PositionsView.tsx` | 73-78 | Cleanup only closes WS, doesn't clear intervals properly | 🟡 Medium | Ensure all intervals cleared |
| 14 | Frontend | Race condition in WS connect | `src/hooks/useSignalWebSocket.ts` | 47-50 | Check for existing connection but no mutex | 🟢 Low | Add connection state lock |
| 15 | Backend | Spot trading not implemented | `src/services/exchange/ExchangeClient.ts` | 234-237 | `getSpotBalances()` throws error instead of returning empty/honest response | 🟡 Medium | Return honest "not implemented" response |
| 16 | Frontend | No visual feedback for Spot | UI Components | N/A | UI doesn't clearly show when Spot is not available | 🟡 Medium | Add Spot availability indicator |
| 17 | Backend | Mixed content risk | `src/server.ts` | 304-311 | CORS allows HTTP origins which may cause mixed content on HTTPS | 🟡 Medium | Detect protocol and adjust |
| 18 | Frontend | Polling fallback conflicts | Multiple files | Various | Both WS and polling may run simultaneously causing duplicate requests | 🟡 Medium | Disable polling when WS connected |
| 19 | Frontend | WebSocket URL construction | `src/views/ScannerView.tsx` | 220 | Uses `buildWebSocketUrl('/ws/market')` but backend only has `/ws` | 🔴 Critical | Backend needs `/ws/market` route or frontend should use `/ws` |
| 20 | Backend | WebSocket path routing | `src/server.ts` | 3631-3642 | Routes by URL path but doesn't have all paths frontend expects | 🔴 Critical | Add missing WS routes or document available paths |

---

## 🎯 CRITICAL ISSUES (Must Fix First)

### 1. **Multiple WebSocket Connections** (Issues #3, #4, #5)
- **Impact**: 3-5+ simultaneous WS connections per user
- **Symptom**: High server load, duplicate messages, connection instability
- **Fix**: Create single WebSocket context/service

### 2. **CORS Configuration** (Issue #1)
- **Impact**: HuggingFace deployment fails completely
- **Symptom**: 404 errors, CORS blocks, no API access
- **Fix**: Use dynamic origin detection or `*` for HF

### 3. **WebSocket Path Mismatch** (Issues #19, #20)
- **Impact**: Some WS connections fail with 404
- **Symptom**: Frontend tries `/ws/market`, backend only serves `/ws`
- **Fix**: Align frontend and backend WS paths

---

## 🔄 DATA FLOW ANALYSIS

### Current (Broken) Flow:

```
Frontend → Multiple WS connections → Backend /ws
   ├─ PositionsView creates WS
   ├─ ScannerView creates WS  
   ├─ dataManager creates WS
   └─ useSignalWebSocket creates WS
         ↓
    3-5 simultaneous connections
         ↓
    Backend broadcasts to all → Duplicate data
```

### Desired (Fixed) Flow:

```
Frontend → Single WS Manager → Backend /ws
   ├─ All components subscribe to manager
   ├─ Manager maintains ONE connection
   ├─ Manager dispatches messages to subscribers
         ↓
    Single connection, multiplexed data
         ↓
    Backend broadcasts once → Clean data flow
```

---

## 🏗️ ARCHITECTURE ISSUES

### Issue: No Centralized WebSocket Management
- Each component creates its own WebSocket
- No coordination between connections
- No shared state

### Issue: API URL Inconsistency
- Some components use `apiUrl()` helper ✅
- Others hardcode paths ❌
- Some use `API_BASE + /api/...` causing duplication ❌

### Issue: HuggingFace Compatibility Not Tested
- Hardcoded localhost URLs throughout
- No relative path support in some places
- CORS config assumes local development only

---

## 📊 DIAGNOSTIC SUMMARY

### ✅ Working Correctly:
1. `src/config/env.ts` - Proper API/WS base detection
2. `src/lib/api.ts` - Good `apiUrl()` helper function
3. `src/lib/ws.ts` - Good `wsUrl()` helper function
4. Backend routes properly registered at `/api/*`
5. SystemStatusController returns real data (no mocking)

### ❌ Broken or Problematic:
1. Multiple WebSocket instantiations across codebase
2. CORS configuration not production-ready
3. Hardcoded API paths in several components
4. WebSocket path mismatches between frontend/backend
5. No unified WebSocket management strategy
6. Spot trading UI doesn't handle "not implemented" gracefully

---

## 🎬 RECOMMENDED FIX ORDER

1. **Fix CORS** → Enables HuggingFace deployment
2. **Fix hardcoded URLs** → Ensures proper path resolution
3. **Create unified WebSocket manager** → Prevents duplicate connections
4. **Fix WebSocket paths** → Ensures all WS routes work
5. **Add Spot UI feedback** → Better UX for unimplemented features
6. **Optimize broadcasts** → Better performance
7. **Add error boundaries** → Graceful degradation

---

## 🔬 TESTING REQUIREMENTS

After fixes, must verify:

1. ✅ Local dev: `npm run dev` - all features work
2. ✅ Local dev: Network tab shows single WS connection
3. ✅ Local dev: `/api/system/status` returns 200
4. ✅ Local dev: `/api/market/prices` returns 200
5. ✅ HuggingFace: No CORS errors
6. ✅ HuggingFace: WebSocket uses WSS protocol
7. ✅ HuggingFace: No mixed content warnings
8. ✅ Mobile view: UI doesn't break
9. ✅ Spot trading: Shows clear "not implemented" message
10. ✅ Futures trading: Real data displays correctly

---

**Next Step**: Proceed with systematic fixes in priority order.
