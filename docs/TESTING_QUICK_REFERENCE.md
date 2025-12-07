# Testing Quick Reference Guide
## Crypto Trading Dashboard - Quick Testing Checklist

**Purpose:** Fast reference for manual testing execution

---

## Pre-Testing Setup

```bash
# 1. Install dependencies
npm install

# 2. Start backend (Terminal 1)
npm run dev:server

# 3. Start frontend (Terminal 2)
npm run dev:client

# 4. Open browser
http://localhost:5173
```

---

## Critical Path Tests (Must Pass)

### ✅ Installation & Startup
- [ ] Backend starts on port 8001
- [ ] Frontend starts on port 5173
- [ ] No console errors on initial load
- [ ] Dashboard loads within 5 seconds

### ✅ Core Navigation
- [ ] All 24 sidebar items visible
- [ ] Clicking each item navigates correctly
- [ ] Active state highlights correctly
- [ ] Browser back/forward buttons work

### ✅ Data Loading
- [ ] Dashboard shows market data
- [ ] Charts load with price data
- [ ] WebSocket connects successfully
- [ ] Real-time updates work

### ✅ Error Handling
- [ ] Error boundaries catch component errors
- [ ] API errors display user-friendly messages
- [ ] Network failures handled gracefully
- [ ] "Try again" buttons work

---

## Quick Test Scenarios

### Scenario 1: View All Pages (5 minutes)
**Goal:** Verify all pages load without crashing

1. Click through each sidebar item
2. Wait 3 seconds per page
3. Check for:
   - ✅ Page loads
   - ✅ No white screen
   - ✅ No console errors
   - ✅ Basic content visible

**Expected:** All 24 pages load successfully

---

### Scenario 2: Data Flow (10 minutes)
**Goal:** Verify data flows correctly between pages

1. **Dashboard** → Note a symbol (e.g., BTC/USDT)
2. **Market** → Search for that symbol
3. **Charting** → Select that symbol
4. **Trading Hub** → Use that symbol
5. **Back to Dashboard** → Verify data consistency

**Expected:** Symbol persists, data consistent

---

### Scenario 3: Forms & Inputs (10 minutes)
**Goal:** Verify all forms work

1. **Settings** → Change auto-refresh interval
2. **Backtest** → Fill in all inputs
3. **Strategy Builder** → Create a strategy
4. **Trading Hub** → Configure an order

**Expected:** All inputs accept values, forms submit

---

### Scenario 4: Real-Time Features (5 minutes)
**Goal:** Verify WebSocket and live updates

1. Open Dashboard
2. Open browser DevTools → Network tab
3. Filter by "WS" (WebSocket)
4. Verify WebSocket connection established
5. Watch for real-time price updates
6. Navigate to Charting view
7. Verify chart updates in real-time

**Expected:** WebSocket connected, updates received

---

## Common Issues Quick Fix

| Issue | Quick Check | Solution |
|-------|-------------|----------|
| Backend won't start | Port 8001 in use? | `lsof -ti:8001 \| xargs kill -9` |
| Frontend won't compile | TypeScript errors? | `npm run typecheck` |
| No data loading | Backend running? | Check `http://localhost:8001/api/health` |
| WebSocket not connecting | Check .env | Verify `VITE_WS_BASE=ws://localhost:8001` |
| White screen | Console errors? | Check browser console for errors |

---

## Performance Benchmarks

### Acceptable Load Times
- **Dashboard:** < 3 seconds
- **Charting:** < 2 seconds
- **Settings:** < 1 second
- **Other pages:** < 2 seconds

### API Response Times
- **Health check:** < 100ms
- **Market data:** < 500ms
- **Signals:** < 1000ms

### WebSocket
- **Connection:** < 1 second
- **Message latency:** < 100ms

---

## Test Data

### Test Symbols
- `BTC/USDT` - Bitcoin (most liquid)
- `ETH/USDT` - Ethereum
- `SOL/USDT` - Solana
- `BNB/USDT` - Binance Coin

### Test Timeframes
- `1h` - 1 hour (default)
- `4h` - 4 hours
- `1d` - 1 day

---

## Browser DevTools Commands

### Check WebSocket
```javascript
// In browser console
const ws = new WebSocket('ws://localhost:8001/ws');
ws.onopen = () => console.log('✅ Connected');
ws.onmessage = (e) => console.log('📨 Message:', e.data);
ws.onerror = (e) => console.error('❌ Error:', e);
```

### Check API
```javascript
// In browser console
fetch('http://localhost:8001/api/health')
  .then(r => r.json())
  .then(d => console.log('✅ Health:', d))
  .catch(e => console.error('❌ Error:', e));
```

---

## Testing Checklist Summary

### Phase 1: Installation ✅
- [x] Dependencies installed
- [x] .env configured
- [ ] Backend starts
- [ ] Frontend starts

### Phase 2: Navigation ✅
- [x] All pages mapped
- [ ] All pages accessible
- [ ] Navigation works

### Phase 3: Pages ✅
- [x] Test cases documented
- [ ] All pages tested
- [ ] Issues documented

### Phase 4-7: Advanced
- [ ] Cross-page flows
- [ ] Strategy testing
- [ ] Settings testing
- [ ] Final report

---

**Last Updated:** 2025-01-27  
**For detailed testing:** See `MANUAL_TESTING_PROTOCOL_REPORT.md`
