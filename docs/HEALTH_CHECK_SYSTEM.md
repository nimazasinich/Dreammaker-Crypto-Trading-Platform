# 🏥 Production Health Check System

## نظام سلامت‌سنجی حرفه‌ای برای deployment

سیستم جامع تست سلامت برای بررسی REST API و WebSocket با قابلیت‌های:

✅ **تست REST API** با schema validation دقیق (Zod)
✅ **تست WebSocket** برای اتصالات real-time
✅ **اجرای موازی** برای performance بالا
✅ **گزارش‌دهی چندگانه** (Console, JSON, Markdown)
✅ **ادغام CI/CD** برای automation
✅ **TypeScript** برای type safety کامل

---

## 📋 فهرست مطالب

1. [نصب و راه‌اندازی](#نصب-و-راه‌اندازی)
2. [استفاده سریع](#استفاده-سریع)
3. [گزینه‌های CLI](#گزینه‌های-cli)
4. [محیط‌های مختلف](#محیط‌های-مختلف)
5. [تست‌های موجود](#تست‌های-موجود)
6. [گزارش‌دهی](#گزارش‌دهی)
7. [ادغام CI/CD](#ادغام-cicd)
8. [عیب‌یابی](#عیب‌یابی)

---

## 🚀 نصب و راه‌اندازی

### پیش‌نیازها

```bash
node >= 18.0.0
npm >= 9.0.0
```

### نصب Dependencies

همه dependencies لازم از قبل در `package.json` موجود است:

```bash
npm install
```

### تنظیمات محیطی

فایل `.env` را برای هر محیط تنظیم کنید:

```env
# Development
API_BASE=http://localhost:8000
WS_URL=ws://localhost:8000/ws

# Staging
STAGING_API_BASE=https://staging.example.com
STAGING_WS_URL=wss://staging.example.com/ws

# Production
PROD_API_BASE=https://really-amin-datasourceforcryptocurrency.hf.space
PROD_WS_URL=wss://really-amin-datasourceforcryptocurrency.hf.space/ws
```

---

## ⚡ استفاده سریع

### اجرای ساده (محیط development)

```bash
npm run health:check
```

### اجرای در محیط production

```bash
npm run health:check:prod
```

### تولید گزارش Markdown

```bash
npm run health:check:report
```

### اجرا برای CI/CD

```bash
npm run health:check:ci
```

---

## 🎛️ گزینه‌های CLI

### دستور اصلی

```bash
tsx scripts/health-check-production.ts [options]
```

### گزینه‌های موجود

| گزینه | توضیح | پیش‌فرض |
|--------|-------|---------|
| `--env <env>` | محیط اجرا: `development`, `staging`, `production` | `development` |
| `--base-url <url>` | URL پایه REST API | از env گرفته می‌شود |
| `--ws-url <url>` | URL WebSocket | از env گرفته می‌شود |
| `--timeout <ms>` | timeout هر تست (میلی‌ثانیه) | `5000` |
| `--parallel` | اجرای موازی تست‌ها | `false` |
| `--fail-on-error` | خروج با error code در صورت fail | `false` |
| `--format <format>` | فرمت خروجی: `console`, `json`, `markdown` | `console` |
| `--output <path>` | مسیر ذخیره گزارش | - |
| `-h, --help` | نمایش راهنما | - |

### مثال‌های کاربردی

#### 1️⃣ تست محلی با تنظیمات پیش‌فرض

```bash
npm run health:check
```

#### 2️⃣ تست production با گزارش markdown

```bash
npm run health:check -- --env production --format markdown --output ./reports/health.md
```

یا:

```bash
npm run health:check:report
```

#### 3️⃣ اجرای موازی با fail-on-error برای CI

```bash
npm run health:check -- --parallel --fail-on-error --env staging
```

یا:

```bash
npm run health:check:ci
```

#### 4️⃣ تولید گزارش JSON

```bash
npm run health:check -- --format json --output ./reports/health.json
```

یا:

```bash
npm run health:check:json
```

#### 5️⃣ تست با timeout سفارشی

```bash
npm run health:check -- --timeout 10000
```

#### 6️⃣ تست با URL سفارشی

```bash
npm run health:check -- --base-url https://custom-url.com --ws-url wss://custom-url.com/ws
```

---

## 🌍 محیط‌های مختلف

### Development (محلی)

```bash
npm run health:check:dev
```

- URL پایه: `http://localhost:8000`
- WebSocket: `ws://localhost:8000/ws`
- Timeout: 5000ms
- Parallel: خیر

### Staging (تست)

```bash
npm run health:check:staging
```

- URL پایه: از `STAGING_API_BASE`
- WebSocket: از `STAGING_WS_URL`
- Timeout: 5000ms
- Parallel: بله

### Production

```bash
npm run health:check:prod
```

- URL پایه: از `PROD_API_BASE`
- WebSocket: از `PROD_WS_URL`
- Timeout: 5000ms
- Parallel: بله
- Fail on error: بله

---

## 🧪 تست‌های موجود

### REST API Tests

| نام تست | Endpoint | Schema | Validation |
|---------|----------|--------|------------|
| Health Check | `/api/health` | `HealthResponseSchema` | بررسی فیلد `status` |
| Market Prices (BTC) | `/api/service/rate?pair=BTC/USDT` | `MarketPricesSchema` | بررسی `price > 0` |
| Market Prices (ETH) | `/api/service/rate?pair=ETH/USDT` | `MarketPricesSchema` | بررسی فیلد `price` |
| System Status | `/api/system/health` | `SystemStatusSchema` | بررسی فیلد `status` |
| Models Status | `/api/models/status` | `ModelsStatusSchema` | بررسی `success` و `initialized` |

### WebSocket Tests

| نام تست | Subscribe Payload | Validation |
|---------|-------------------|------------|
| WebSocket Connection | `{ action: "subscribe", service: "market_data", symbols: ["BTC", "ETH"] }` | بررسی دریافت message معتبر |
| WebSocket Market Data | `{ action: "subscribe", service: "market_data", symbols: ["BTC"] }` | بررسی `service === "market_data"` و `data.price` |

### Schema Validation

تمام تست‌ها از **Zod** برای schema validation استفاده می‌کنند:

```typescript
const HealthResponseSchema = z.object({
  status: z.string(),
  timestamp: z.string(),
  database: z.string().optional(),
  use_mock_data: z.boolean().optional(),
  providers_loaded: z.number().optional(),
  data_sources: z.array(z.any()).optional(),
  verification: z.object({}).optional(),
});
```

---

## 📊 گزارش‌دهی

### Console Output (پیش‌فرض)

خروجی زنده در terminal با رنگ‌بندی:

```
🔍 Running Health Checks...

Environment: production
Base URL: https://really-amin-datasourceforcryptocurrency.hf.space
WebSocket URL: wss://really-amin-datasourceforcryptocurrency.hf.space/ws

📡 Running REST API Tests...

✅ Health Check Endpoint (245ms)
✅ Market Prices - BTC/USDT (312ms)
✅ Market Prices - ETH/USDT (298ms)
❌ System Status (156ms)
   Error: Expected status 200, got 404

============================================================
📊 Health Check Summary
============================================================

Total Tests:  7
Passed:       6
Failed:       1
Pass Rate:    85.7%
Duration:     2341ms
```

### JSON Report

گزارش ساختاریافته برای پردازش خودکار:

```json
{
  "total": 7,
  "passed": 6,
  "failed": 1,
  "duration": 2341,
  "passRate": 85.71,
  "timestamp": "2025-12-03T10:30:45.123Z",
  "environment": "production",
  "results": [
    {
      "name": "Health Check Endpoint",
      "category": "REST",
      "passed": true,
      "duration": 245,
      "timestamp": "2025-12-03T10:30:43.001Z",
      "details": {
        "url": "https://.../api/health",
        "status": 200
      }
    }
    ...
  ]
}
```

### Markdown Report

گزارش قابل خواندن برای documentation:

```markdown
# Health Check Report

**Generated:** 2025-12-03T10:30:45.123Z
**Environment:** production
**Duration:** 2341ms

## Summary

- **Total Tests:** 7
- **Passed:** 6 ✅
- **Failed:** 1 ❌
- **Pass Rate:** 85.7%

## Test Results

### REST API Tests

| Test Name | Status | Duration |
|-----------|--------|----------|
| Health Check Endpoint | ✅ Pass | 245ms |
| Market Prices - BTC/USDT | ✅ Pass | 312ms |
...
```

---

## 🔄 ادغام CI/CD

### GitHub Actions

فایل `.github/workflows/health-check.yml`:

```yaml
name: Health Check

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]
  schedule:
    - cron: '0 */6 * * *'  # هر 6 ساعت یک‌بار

jobs:
  health-check:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run health check
        env:
          PROD_API_BASE: ${{ secrets.PROD_API_BASE }}
          PROD_WS_URL: ${{ secrets.PROD_WS_URL }}
        run: npm run health:check:ci

      - name: Upload report
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: health-check-report
          path: reports/health-check-ci.json

      - name: Create issue on failure
        if: failure()
        uses: actions/github-script@v6
        with:
          script: |
            github.rest.issues.create({
              owner: context.repo.owner,
              repo: context.repo.repo,
              title: '🚨 Health Check Failed',
              body: 'The health check workflow has failed. Please check the logs.',
              labels: ['health-check', 'bug']
            })
```

### GitLab CI

فایل `.gitlab-ci.yml`:

```yaml
stages:
  - test
  - deploy
  - verify

health-check:
  stage: verify
  image: node:20
  script:
    - npm ci
    - npm run health:check:ci
  artifacts:
    paths:
      - reports/health-check-ci.json
    expire_in: 1 week
  rules:
    - if: '$CI_COMMIT_BRANCH == "main"'
    - if: '$CI_PIPELINE_SOURCE == "schedule"'
  allow_failure: false
```

### Post-Deploy Hook

برای اجرا بعد از هر deploy:

```bash
#!/bin/bash
# scripts/post-deploy.sh

echo "🚀 Running post-deployment health checks..."

npm run health:check:prod

if [ $? -eq 0 ]; then
  echo "✅ Deployment verified successfully"
  # Send success notification
else
  echo "❌ Health check failed - rolling back deployment"
  # Trigger rollback
  exit 1
fi
```

---

## 📝 Checklist استفاده بعد از Deploy

### مرحله 1: اجرای اولیه

```bash
npm run health:check:prod
```

✅ تمام REST endpoints کار می‌کنند
✅ WebSocket connection برقرار می‌شود
✅ Schema validation موفق است
✅ Response times مناسب است

### مرحله 2: بررسی نتایج

اگر **همه تست‌ها PASS شدند:**

→ سرویس سالم است ✅
→ Deploy موفق بوده است ✅
→ می‌توانید به production بروید ✅

اگر **REST tests FAIL شد:**

→ بررسی کنید endpoint وجود دارد
→ بررسی کنید nginx/proxy routing درست است
→ بررسی کنید backend در حال اجراست
→ لاگ‌های backend را بررسی کنید

اگر **WebSocket tests FAIL شد:**

→ بررسی کنید WebSocket server روشن است
→ بررسی کنید CORS/SSL configuration
→ بررسی کنید load balancer settings
→ تست دستی با browser console

### مرحله 3: تولید گزارش

```bash
npm run health:check:report
```

✅ گزارش markdown در `./reports/health-check.md` ذخیره شد
✅ گزارش را در documentation قرار دهید
✅ گزارش را برای team share کنید

### مرحله 4: ادغام در CI/CD

✅ فایل GitHub Actions/GitLab CI ایجاد شد
✅ Secrets تنظیم شدند
✅ Post-deploy hook اضافه شد
✅ Monitoring/alerting راه‌اندازی شد

---

## 🐛 عیب‌یابی

### مشکل: Timeout errors

**علت:** تست‌ها خیلی طول می‌کشند

**راه‌حل:**

```bash
npm run health:check -- --timeout 10000
```

### مشکل: Connection refused

**علت:** سرویس در حال اجرا نیست

**راه‌حل:**

1. بررسی کنید backend روشن است:

```bash
curl http://localhost:8000/api/health
```

2. پورت را بررسی کنید:

```bash
netstat -an | grep 8000
```

### مشکل: Schema validation failed

**علت:** Response format تغییر کرده

**راه‌حل:**

1. Schema را بررسی کنید در `scripts/health-check-production.ts`
2. Response واقعی را لاگ کنید
3. Schema را update کنید

### مشکل: WebSocket connection failed

**علت:** WebSocket server یا configuration مشکل دارد

**راه‌حل:**

1. تست دستی WebSocket:

```javascript
const ws = new WebSocket('ws://localhost:8000/ws');
ws.onopen = () => console.log('Connected');
ws.onerror = (err) => console.error(err);
```

2. بررسی nginx/proxy configuration
3. بررسی CORS headers

---

## 🎯 Best Practices

### 1. اجرای دوره‌ای

```bash
# هر 6 ساعت یک‌بار در production
0 */6 * * * cd /path/to/project && npm run health:check:ci
```

### 2. Alerting on failure

```bash
npm run health:check:ci || send-alert.sh "Health check failed"
```

### 3. Monitoring trends

ذخیره گزارش‌های JSON برای تحلیل روند:

```bash
npm run health:check:json
mv reports/health-check.json reports/health-$(date +%Y%m%d-%H%M%S).json
```

### 4. Pre-deployment verification

قبل از deploy، تست کنید:

```bash
npm run health:check:staging && deploy-to-production.sh
```

---

## 📚 منابع بیشتر

- [Deployment Audit Report](../DEPLOYMENT_AUDIT_REPORT.json)
- [API Testing Best Practices](https://www.code-intelligence.com/rest-api-testing)
- [OWASP API Testing Guide](https://owasp.org/www-project-web-security-testing-guide/latest/4-Web_Application_Security_Testing/12-API_Testing/)
- [Frugal Testing Guide](https://www.frugaltesting.com/blog/api-testing-checklist-and-best-practices-a-complete-guide)

---

## 🤝 مشارکت

برای بهبود این سیستم:

1. Fork کنید
2. Branch جدید بسازید: `git checkout -b feature/new-test`
3. تغییرات را commit کنید: `git commit -m 'Add new test'`
4. Push کنید: `git push origin feature/new-test`
5. Pull Request ایجاد کنید

---

## 📄 مجوز

این پروژه تحت [Unlicense](../LICENSE) منتشر شده است.

---

**ساخته شده با ❤️ توسط Dreammaker Team**
