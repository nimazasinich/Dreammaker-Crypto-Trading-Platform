# 🚀 Batch Test Framework - Quick Start Guide

## What is This?

An **automated testing framework** that validates **all REST and WebSocket services** in your deployment with a single command.

### What It Tests

✅ **21 Services Configured:**
- 15 REST API endpoints (health, market data, trading, system info)
- 6 WebSocket subscriptions (market data, prices, OHLC, signals, heartbeat)

✅ **What Gets Validated:**
- HTTP status codes (200 OK vs 404/500 errors)
- Response structure (JSON schema validation)
- WebSocket connections (handshake, subscriptions, messages)
- Response times (performance metrics)
- Critical vs non-critical failures

---

## 🎯 Quick Start (3 Steps)

### 1. Configure Target URL

Edit [tests/provider-validation/service-definitions.json](tests/provider-validation/service-definitions.json):

```json
{
  "baseUrl": "https://Really-amin-Datasourceforcryptocurrency-2.hf.space",
  "wsUrl": "wss://Really-amin-Datasourceforcryptocurrency-2.hf.space/ws",
  "timeout": 10000
}
```

### 2. Run Tests

From project root:

```bash
npm run test:batch
```

Or from test directory:

```bash
cd tests/provider-validation
npm install
npm test
```

### 3. Check Results

Two reports are generated:

- **batch-test-report.json** - Machine-readable (CI/CD)
- **batch-test-report.md** - Human-readable (developers)

---

## 📊 Understanding Test Results

### Status Codes

| Icon | Status | Meaning |
|------|--------|---------|
| ✅ | PASS | Service working perfectly |
| ❌ | FAIL | Service broken (404, 500, timeout) |
| ⚠️ | WARN | Service works but validation warnings |
| ⏭️ | SKIP | Test skipped (not implemented) |

### Example Output

```
🚀 Starting Batch Test Runner...

✅ Loaded 21 service definitions

Testing: Health Check (REST)...
  ✅ PASS (245ms)

Testing: Market Data - Prices (REST)...
  ❌ FAIL (10015ms)
  ⚠️  Timeout after 10000ms

Testing: WebSocket - Market Data Subscribe (WS)...
  ✅ PASS (1823ms)

============================================================
📈 TEST SUMMARY
============================================================
Total Tests:    21
✅ Passed:      15
❌ Failed:      4
⚠️  Warnings:    2
Success Rate:   71.4%
============================================================

🚨 CRITICAL FAILURES:
  ❌ Health Check: HTTP 500: Internal Server Error

💡 RECOMMENDATIONS:
  - 4 test(s) failed - review error details and fix issues
  - CRITICAL: Core services are failing - deployment may be broken
  - 4 REST endpoint(s) failing - check nginx routing
```

---

## 🔍 What's Tested

### REST Endpoints (15 total)

| Endpoint | Category | Priority |
|----------|----------|----------|
| `/api/health` | System | CRITICAL |
| `/api/models/status` | AI/ML | HIGH |
| `/api/system/health` | System | CRITICAL |
| `/api/market-data/prices` | Market Data | CRITICAL |
| `/api/service/rate` | Rate Service | HIGH |
| `/api/market/ohlc` | Market Data | HIGH |
| `/api/trading/portfolio` | Trading | MEDIUM |
| `/api/binance/health` | Exchange | HIGH |
| `/api/hf-engine/health` | Data Engine | CRITICAL |
| `/api/data-pipeline/status` | System | HIGH |
| ... and more |

### WebSocket Endpoints (6 total)

| Subscription | Service | Priority |
|--------------|---------|----------|
| Market Data Subscribe | `market_data` | CRITICAL |
| Price Updates | `price_updates` | HIGH |
| OHLC Stream | `ohlc_stream` | MEDIUM |
| Signal Updates | `signal_updates` | MEDIUM |
| Heartbeat | `ping` | LOW |

---

## 🛠️ Common Use Cases

### Test Production Deployment

```bash
# Edit service-definitions.json to point to production
npm run test:batch
```

### Test Local Development

```bash
# Edit service-definitions.json:
{
  "baseUrl": "http://localhost:8000",
  "wsUrl": "ws://localhost:8000/ws"
}

npm run test:batch:local
```

### Test After Deployment

```bash
# After deploying fixes, verify all services work
npm run test:batch

# Check critical failures
cat tests/provider-validation/batch-test-report.md | grep "CRITICAL"
```

### CI/CD Integration

```yaml
# GitHub Actions example
- name: Validate Deployment
  run: npm run test:batch
  # Will exit with code 1 if tests fail
```

---

## 📁 File Structure

```
tests/provider-validation/
├── batch-test-runner.ts          # Main test script (TypeScript)
├── service-definitions.json      # All endpoints + schemas
├── package.json                  # Test dependencies
├── tsconfig.json                 # TypeScript config
├── README.md                     # Detailed documentation
├── batch-test-report.json        # Generated: JSON report
└── batch-test-report.md          # Generated: Markdown report
```

---

## 🚨 Troubleshooting

### All REST Endpoints Failing (404)

**Likely Cause:** Nginx routing issue

**Check:**
1. Verify `baseUrl` in service-definitions.json
2. Check nginx configuration in Dockerfile.huggingface
3. Look for trailing slash bug: `proxy_pass http://127.0.0.1:8000/;` ❌

**Fix:**
```nginx
# Should be:
proxy_pass http://127.0.0.1:8000;  ✅
```

### WebSocket Tests Failing

**Likely Cause:** WebSocket upgrade headers missing

**Check:**
1. Verify `wsUrl` in service-definitions.json (must be `wss://` for HTTPS)
2. Check nginx WebSocket configuration
3. Test WebSocket manually in browser:

```javascript
const ws = new WebSocket('wss://your-url.hf.space/ws');
ws.onopen = () => console.log('Connected ✅');
ws.onerror = (e) => console.error('Error ❌', e);
```

### Timeout Errors

**Increase timeout in service-definitions.json:**

```json
{
  "timeout": 30000  // 30 seconds instead of 10
}
```

### "Cannot find module" Errors

```bash
cd tests/provider-validation
npm install
```

---

## 💡 Best Practices

1. **Run After Every Deployment**
   - Catches regressions immediately
   - Validates configuration changes

2. **Check Critical Failures First**
   - Framework highlights critical services
   - Fix CRITICAL priority failures before others

3. **Monitor Test Duration**
   - Slow tests indicate performance issues
   - Set baseline: first run after deployment
   - Alert if future runs are >50% slower

4. **Keep Service Definitions Updated**
   - Add new endpoints as they're created
   - Update schemas when API changes
   - Mark deprecated endpoints as SKIP

5. **Review Validation Warnings**
   - WARN status means service works but schema mismatch
   - May indicate API changes or documentation drift
   - Update expectedMinimumResponse if intentional

---

## 📖 Full Documentation

For detailed information, see:

- [tests/provider-validation/README.md](tests/provider-validation/README.md) - Complete framework documentation
- [service-definitions.json](tests/provider-validation/service-definitions.json) - All service configurations
- [batch-test-runner.ts](tests/provider-validation/batch-test-runner.ts) - Implementation code

---

## 🔗 Related Documentation

- [START_HERE.md](START_HERE.md) - Deployment fix guide
- [DEPLOYMENT_AUDIT_SUMMARY.md](DEPLOYMENT_AUDIT_SUMMARY.md) - Audit executive summary
- [DEPLOYMENT_FIX_GUIDE.md](DEPLOYMENT_FIX_GUIDE.md) - Step-by-step deployment fixes
- [QA_TEST_REPORT.md](QA_TEST_REPORT.md) - Full QA audit report

---

## ✨ Example: Testing After Nginx Fix

```bash
# 1. Apply nginx fix (remove trailing slash)
git add Dockerfile.huggingface
git commit -m "fix: nginx API routing"
git push origin main

# 2. Wait for rebuild (5-10 minutes)
# Watch: https://huggingface.co/spaces/Really-amin/Datasourceforcryptocurrency-2/logs

# 3. Run batch tests
npm run test:batch

# 4. Check results
cat tests/provider-validation/batch-test-report.md

# Expected: All CRITICAL endpoints should now PASS ✅
```

---

## 🎓 Advanced Usage

### Add New Test

Edit `service-definitions.json`:

```json
{
  "name": "New Endpoint",
  "type": "REST",
  "method": "GET",
  "endpoint": "/api/new/endpoint",
  "category": "New Category",
  "priority": "HIGH",
  "expectedMinimumResponse": {
    "success": "boolean",
    "data": "array"
  }
}
```

Then run: `npm run test:batch`

### Filter Tests by Category

Edit `batch-test-runner.ts`:

```typescript
const filteredServices = serviceDefinition.services
  .filter(s => s.category === 'System' || s.priority === 'CRITICAL');
```

### Add Authentication

Edit `batch-test-runner.ts`:

```typescript
const response = await fetch(url, {
  headers: {
    'Authorization': `Bearer ${process.env.API_TOKEN}`
  }
});
```

---

## 📊 Report Format

### JSON Report Structure

```json
{
  "summary": {
    "totalTests": 21,
    "passed": 15,
    "failed": 4,
    "warnings": 2,
    "duration": 32450,
    "timestamp": "2025-12-03T..."
  },
  "results": [
    {
      "serviceName": "Health Check",
      "type": "REST",
      "status": "PASS",
      "duration": 245,
      "details": {
        "statusCode": 200,
        "responseBody": {...}
      }
    }
  ],
  "criticalFailures": [
    "Health Check: HTTP 500: Internal Server Error"
  ],
  "recommendations": [
    "4 test(s) failed - review error details"
  ]
}
```

---

## 🆘 Need Help?

1. **Check the detailed README:**
   ```bash
   cat tests/provider-validation/README.md
   ```

2. **Review test output:**
   ```bash
   cat tests/provider-validation/batch-test-report.md
   ```

3. **Verify configuration:**
   ```bash
   cat tests/provider-validation/service-definitions.json
   ```

4. **Test manually:**
   ```bash
   curl https://Really-amin-Datasourceforcryptocurrency-2.hf.space/api/health
   ```

---

## ✅ Success Criteria

After deploying fixes, batch tests should show:

- ✅ 100% of CRITICAL priority tests passing
- ✅ >90% of HIGH priority tests passing
- ✅ All REST endpoints returning 200 OK (not 404)
- ✅ All WebSocket connections successful
- ✅ No timeouts (all responses < 10 seconds)
- ✅ No validation errors (schemas match responses)

---

## 🚀 Quick Commands Reference

```bash
# Run batch tests (production)
npm run test:batch

# Run batch tests (local)
npm run test:batch:local

# View JSON report
cat tests/provider-validation/batch-test-report.json | jq

# View Markdown report
cat tests/provider-validation/batch-test-report.md

# Check only critical failures
grep -A 5 "CRITICAL FAILURES" tests/provider-validation/batch-test-report.md

# Watch test results in real-time
npm run test:batch | tee test-output.log
```

---

**Last Updated:** 2025-12-03
**Framework Version:** 1.0.0
**Status:** ✅ Production Ready

---

🎯 **TL;DR:** Run `npm run test:batch` to validate all 21 REST + WebSocket services in one command. Check `batch-test-report.md` for results.
