# 🏥 Health Check System - راهنمای سریع

## استفاده سریع

### 1️⃣ اجرای ساده

```bash
npm run health:check
```

### 2️⃣ تست Production

```bash
npm run health:check:prod
```

### 3️⃣ تولید گزارش

```bash
npm run health:check:report
```

---

## دستورات موجود

| دستور | توضیح | استفاده |
|-------|-------|----------|
| `npm run health:check` | تست محلی (development) | بعد از شروع سرور محلی |
| `npm run health:check:dev` | تست development | همان بالا |
| `npm run health:check:staging` | تست staging (موازی) | قبل از deploy به production |
| `npm run health:check:prod` | تست production (موازی + fail-on-error) | بعد از deploy |
| `npm run health:check:report` | تولید گزارش Markdown | برای مستندسازی |
| `npm run health:check:json` | تولید گزارش JSON | برای CI/CD |
| `npm run health:check:ci` | تست CI/CD کامل | در GitHub Actions |

---

## نتیجه موفق

```bash
🔍 Running Health Checks...

Environment: production
Base URL: https://...
WebSocket URL: wss://...

📡 Running REST API Tests...

✅ Health Check Endpoint (245ms)
✅ Market Prices - BTC/USDT (312ms)
✅ Market Prices - ETH/USDT (298ms)
✅ System Status (189ms)
✅ Models Status (234ms)

🔌 Running WebSocket Tests...

✅ WebSocket Connection (456ms)
✅ WebSocket Market Data (523ms)

============================================================
📊 Health Check Summary
============================================================

Total Tests:  7
Passed:       7 ✅
Failed:       0 ❌
Pass Rate:    100.0%
Duration:     2341ms

✅ All health checks passed!
```

---

## اگر تست‌ها FAIL شدند

### REST API Failure

```
❌ Market Prices - BTC/USDT (156ms)
   Error: Expected status 200, got 404
```

**راه‌حل:**
1. بررسی nginx routing در `Dockerfile.huggingface`
2. اطمینان از اینکه backend در حال اجراست
3. بررسی endpoint paths (frontend vs backend)

### WebSocket Failure

```
❌ WebSocket Connection (8000ms)
   Error: Timeout waiting for message
```

**راه‌حل:**
1. بررسی WebSocket server در لاگ‌های backend
2. تست دستی: `wscat -c wss://your-domain.com/ws`
3. بررسی nginx WebSocket proxy configuration

---

## گزارش‌دهی

### Console (پیش‌فرض)

خروجی زنده در terminal

### JSON

```bash
npm run health:check:json
```

خروجی: `./reports/health-check.json`

### Markdown

```bash
npm run health:check:report
```

خروجی: `./reports/health-check.md`

---

## ادغام CI/CD

### GitHub Actions

فایل: `.github/workflows/health-check.yml`

- اجرا بعد از هر push/PR
- اجرای دوره‌ای هر 6 ساعت
- ایجاد issue در صورت failure
- ارسال Slack notification

### Post-Deploy

```bash
#!/bin/bash
deploy-app.sh && npm run health:check:prod
```

---

## مستندات کامل

- [📚 Health Check System Documentation](../docs/HEALTH_CHECK_SYSTEM.md)
- [✅ Post-Deploy Checklist](../docs/POST_DEPLOY_CHECKLIST.md)
- [🔧 GitHub Actions Workflow](../.github/workflows/health-check.yml)

---

## پشتیبانی

برای سوالات یا مشکلات:
- Issue در GitHub باز کنید
- مستندات را بخوانید
- تیم DevOps تماس بگیرید
