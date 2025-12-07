# 🚀 Batch Test Framework - Quick Reference Card

## One-Line Summary
**Automated validation of all 21 REST + WebSocket services in a single command.**

---

## ⚡ Quick Commands

```bash
# Run all tests (production)
npm run test:batch

# Run all tests (local dev)
npm run test:batch:local

# View results
cat tests/provider-validation/batch-test-report.md

# View JSON results
cat tests/provider-validation/batch-test-report.json | jq
```

---

## 📁 Important Files

| File | Purpose |
|------|---------|
| `service-definitions.json` | Configure all endpoints + schemas |
| `batch-test-runner.ts` | Test execution engine (670+ lines) |
| `batch-test-report.md` | Human-readable results |
| `batch-test-report.json` | Machine-readable results |
| `README.md` | Full documentation |

---

## 🎯 What Gets Tested

### ✅ 15 REST Endpoints
- Health checks (system, models, binance, HF engine)
- Market data (prices, OHLC, rate service)
- Trading (portfolio, positions, markets)
- System info (status, config, pipeline)

### ✅ 6 WebSocket Subscriptions
- Market data stream
- Price updates
- OHLC candles
- Trading signals
- Heartbeat/ping

---

## 📊 Test Status Codes

| Icon | Status | Meaning |
|------|--------|---------|
| ✅ | PASS | Working perfectly |
| ❌ | FAIL | Broken (404, 500, timeout) |
| ⚠️ | WARN | Works but validation warnings |
| ⏭️ | SKIP | Not implemented |

---

## 🔧 Configuration

Edit `service-definitions.json`:

```json
{
  "baseUrl": "https://your-deployment.hf.space",
  "wsUrl": "wss://your-deployment.hf.space/ws",
  "timeout": 10000
}
```

---

## 📋 Service Priority Levels

| Priority | Examples | Impact if Failing |
|----------|----------|-------------------|
| CRITICAL | Health, Market Data | App unusable |
| HIGH | Models, Exchange Status | Major features broken |
| MEDIUM | Trading, Signals | Secondary features broken |
| LOW | Config, Admin | Minor impact |

---

## 🚨 Troubleshooting

### All REST tests failing (404)
→ Check nginx routing in Dockerfile.huggingface
→ Look for trailing slash bug: `proxy_pass http://127.0.0.1:8000/;` ❌

### WebSocket tests failing
→ Verify wsUrl uses `wss://` (not `ws://`)
→ Check nginx WebSocket upgrade headers

### Timeout errors
→ Increase timeout in service-definitions.json

### Module not found
→ Run: `cd tests/provider-validation && npm install`

---

## 📖 Full Documentation

- **Quick Start:** [../../BATCH_TEST_GUIDE.md](../../BATCH_TEST_GUIDE.md)
- **Complete Docs:** [README.md](README.md)
- **Summary:** [../../BATCH_TEST_FRAMEWORK_COMPLETE.md](../../BATCH_TEST_FRAMEWORK_COMPLETE.md)

---

## 🎯 Success Criteria

After deployment, tests should show:
- ✅ 100% CRITICAL services passing
- ✅ >90% HIGH services passing
- ✅ No 404 errors
- ✅ All responses < 10 seconds
- ✅ No schema validation errors

---

## 🔄 Typical Workflow

```
1. Make code changes
2. Run: npm run test:batch:local
3. Fix issues if any
4. Deploy to production
5. Run: npm run test:batch
6. Verify all services pass ✅
```

---

## 💡 Pro Tips

1. Run tests after every deployment
2. Fix CRITICAL failures first
3. Monitor test duration (slow = performance issue)
4. Update service-definitions.json when API changes
5. Use in CI/CD pipelines for automated validation

---

**Need Help?** Read [README.md](README.md) for complete documentation.
