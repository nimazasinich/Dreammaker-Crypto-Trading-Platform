# Quick Start - Get Dashboard Working Now

## 🚀 Start Here (5 Minutes)

### Step 1: Verify Backend Port Availability
```powershell
# Check if port 8001 is in use
netstat -ano | findstr :8001

# If port is in use, kill the process:
taskkill /PID <process_id> /F
```

### Step 2: Start Backend
```powershell
cd c:\path\to\Dreammaker-legal-agent-gitlab-main

# Install dependencies (if not done)
npm install

# Start development server
npm run dev:server
# Should output: "Server running on port 8001"
```

### Step 3: Start Frontend (New Terminal)
```powershell
cd c:\path\to\Dreammaker-legal-agent-gitlab-main

# Start development client
npm run dev:client
# Should output: "Local: http://localhost:5173"
```

### Step 4: Test in Browser
```
Open: http://localhost:5173
Expected: Dashboard loads, shows current market data, sentiment index
```

---

## ✅ Verification Checklist

**Backend Running?**
- [ ] Terminal shows "Server running on port 8001"
- [ ] No "EADDRINUSE" errors
- [ ] Can access http://localhost:8001/health

**Frontend Running?**
- [ ] Terminal shows "Local: http://localhost:5173"
- [ ] No build errors
- [ ] Browser loads dashboard

**Dashboard Working?**
- [ ] Market prices displayed (BTC, ETH, etc.)
- [ ] Sentiment Index visible
- [ ] No red error messages
- [ ] Console shows no "DATASOURCE_TIMEOUT" logs

**API Calls Working?**
- [ ] Open DevTools (F12) → Network tab
- [ ] Refresh dashboard (F5)
- [ ] Check Network tab:
  - [ ] `http://localhost:8001/api/market` → Status 200
  - [ ] `http://localhost:8001/api/sentiment` → Status 200
  - [ ] No failed requests

---

## 🔍 Quick Diagnostic

### If Dashboard Doesn't Load
```powershell
# Test backend is responding
curl http://localhost:8001/health

# Should return: {"status": "healthy", ...}
```

### If Sentiment Shows "Error"
```powershell
# Test sentiment endpoint directly
curl http://localhost:8001/api/sentiment

# Should return: {"fear_greed_index": 28, ...}
```

### If Market Prices Show "No Data"
```powershell
# Test market endpoint
curl "http://localhost:8001/api/market?limit=10"

# Should return: {"cryptocurrencies": [...]}
```

---

## ⚡ Common Issues & Fixes

### Port 8001 Already In Use
```powershell
# Find process using port 8001
Get-Process | Where-Object {$_.Id -eq $(netstat -ano | Select-String :8001 | ForEach-Object {$_ -split '\s+' | Select-Object -Last 1})}

# Kill it
taskkill /PID <process_id> /F

# Try again: npm run dev:server
```

### "DATASOURCE_TIMEOUT" Errors
**This means backend is not responding within 10 seconds**

Solution:
1. Verify backend is running: `netstat -ano | findstr :8001`
2. Check backend logs for errors
3. Restart backend with: `npm run dev:server`

### "This operation was aborted"
**This is an AbortController timeout (10 seconds default)**

Solution:
1. Check HF Space health: 
   ```powershell
   curl https://really-amin-datasourceforcryptocurrency.hf.space/health
   ```
2. If HF Space is slow, increase timeout:
   ```env
   VITE_DATASOURCE_TIMEOUT=15000
   ```
3. Restart frontend

### 400 Error on AI Predictions
**This endpoint requires historical OHLC data**

Normal behavior - don't worry about this. The dashboard will show "Insufficient data" until historical data is available.

---

## 📊 Expected Performance

| Metric | Expected Value | Your System |
|--------|-----------------|-------------|
| Market load time | < 1 second | _____ |
| Sentiment load time | < 1 second | _____ |
| Dashboard total load | < 3 seconds | _____ |
| Error count on startup | 0 | _____ |

---

## 📝 Test Results (From Latest Validation)

**HuggingFace Space 1 Status: ✅ OPERATIONAL**

```
Health Check:          200 OK (1519ms)
Market Data:           200 OK (456ms)
Sentiment Index:       200 OK (365ms)
Sentiment Analysis:    200 OK (1765ms)
Trading Decision:      200 OK (380ms)
Models Status:         200 OK (313ms)
```

**Average response time:** 620ms  
**Reliability:** 100% (7/7 endpoints working)

---

## 🆘 Need Help?

### Check These Files
- Backend logs: `npm run dev:server` output
- Frontend logs: Browser DevTools Console (F12)
- Data source: https://really-amin-datasourceforcryptocurrency.hf.space

### Validation Reports Available
- `HF_SPACES_VALIDATION_REPORT.md` - Detailed test results
- `ACTION_ITEMS_VALIDATION_COMPLETE.md` - Implementation status & next steps
- `test-hf-spaces-v2.ps1` - Run this to re-test endpoints

---

## 🎯 Next Steps (After Verification)

Once dashboard is working:
1. Test different market conditions (bull/bear markets)
2. Verify sentiment updates in real-time
3. Check WebSocket connections (open DevTools → Network → WS)
4. Monitor performance over 24 hours
5. Deploy to production when stable

---

**Status:** Ready to Start ✅  
**Last Updated:** November 29, 2025
