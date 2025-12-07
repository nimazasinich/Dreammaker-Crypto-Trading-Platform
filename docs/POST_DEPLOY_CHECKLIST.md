# ✅ Post-Deploy Checklist

## چک‌لیست کامل تست سلامت بعد از هر Deploy

این checklist را بعد از هر تغییر major یا deploy به production اجرا کنید تا اطمینان حاصل کنید که سیستم به‌درستی کار می‌کند.

---

## 📋 قبل از شروع

### پیش‌نیازها

- [ ] Backend در حال اجرا است
- [ ] Frontend build شده و deploy شده است
- [ ] دسترسی به URL production دارید
- [ ] Environment variables تنظیم شده‌اند

### ابزارهای مورد نیاز

```bash
# نصب dependencies
npm install

# بررسی نصب ابزارها
node --version  # >= 18.0.0
npm --version   # >= 9.0.0
curl --version  # برای تست دستی
```

---

## 🚀 مرحله 1: تست سریع دستی (Manual Smoke Test)

### 1.1 بررسی Backend

```bash
# تست health endpoint
curl -s https://your-domain.com/api/health | jq

# انتظار: status code 200 و response معتبر
```

**خروجی مورد انتظار:**

```json
{
  "status": "healthy",
  "timestamp": "2025-12-03T...",
  "database": "...",
  "providers_loaded": 95
}
```

- [ ] ✅ Status code = 200
- [ ] ✅ Response JSON معتبر است
- [ ] ✅ فیلد `status` برابر "healthy" است
- [ ] ✅ `providers_loaded` بزرگ‌تر از 0 است

### 1.2 بررسی Frontend

1. باز کردن URL در browser:

```
https://your-domain.com
```

- [ ] ✅ صفحه لود می‌شود (بدون 404)
- [ ] ✅ هیچ error در console نیست
- [ ] ✅ صفحه loading بی‌نهایت ندارد
- [ ] ✅ UI/UX به‌درستی render می‌شود

2. باز کردن Dashboard:

```
https://your-domain.com/static/pages/dashboard/index.html
```

- [ ] ✅ Dashboard لود می‌شود
- [ ] ✅ داده‌های market به‌درستی نمایش داده می‌شوند
- [ ] ✅ نمودارها کار می‌کنند
- [ ] ✅ هیچ بخش "Loading..." بی‌نهایت ندارد

### 1.3 بررسی WebSocket (در Browser Console)

```javascript
const ws = new WebSocket('wss://your-domain.com/ws');

ws.onopen = () => {
  console.log('✅ WebSocket connected');
  ws.send(JSON.stringify({
    action: 'subscribe',
    service: 'market_data',
    symbols: ['BTC', 'ETH']
  }));
};

ws.onmessage = (event) => {
  console.log('📨 Received:', JSON.parse(event.data));
};

ws.onerror = (error) => {
  console.error('❌ WebSocket error:', error);
};
```

- [ ] ✅ اتصال برقرار می‌شود (`onopen` فراخوانی می‌شود)
- [ ] ✅ پیام‌ها دریافت می‌شوند (`onmessage` فراخوانی می‌شود)
- [ ] ✅ داده‌های market به‌روز می‌شوند
- [ ] ✅ هیچ error در console نیست

---

## 🏥 مرحله 2: اجرای Health Check خودکار

### 2.1 تست محیط Development (اختیاری)

```bash
npm run health:check:dev
```

- [ ] ✅ تمام تست‌ها PASS شدند
- [ ] ✅ زمان response مناسب است (< 1000ms)
- [ ] ✅ هیچ timeout error نیست

### 2.2 تست محیط Staging (اگر دارید)

```bash
npm run health:check:staging
```

- [ ] ✅ تمام REST tests PASS شدند
- [ ] ✅ تمام WebSocket tests PASS شدند
- [ ] ✅ Schema validation موفق است

### 2.3 تست محیط Production (اصلی)

```bash
npm run health:check:prod
```

**انتظار:** همه تست‌ها PASS شوند.

```
🏥 Health Check Summary
============================================================

Total Tests:  7
Passed:       7 ✅
Failed:       0 ❌
Pass Rate:    100.0%
Duration:     2341ms
```

- [ ] ✅ **Total Tests ≥ 7**
- [ ] ✅ **Passed = Total Tests**
- [ ] ✅ **Failed = 0**
- [ ] ✅ **Pass Rate = 100%**
- [ ] ✅ **Duration < 10000ms**

### 2.4 تولید گزارش (برای مستندسازی)

```bash
npm run health:check:report
```

- [ ] ✅ فایل `./reports/health-check.md` ایجاد شد
- [ ] ✅ گزارش حاوی همه تست‌هاست
- [ ] ✅ تاریخ و زمان درست است

---

## ❌ مرحله 3: عیب‌یابی (اگر تست‌ها FAIL شدند)

### 3.1 اگر REST Tests FAIL شد

**علائم:**

```
❌ Market Prices - BTC/USDT (156ms)
   Error: Expected status 200, got 404
```

**بررسی‌های لازم:**

1. **nginx/proxy routing:**

```bash
# بررسی configuration nginx
cat Dockerfile.huggingface | grep -A 5 "location /api/"
```

- [ ] ❌ `proxy_pass http://127.0.0.1:8000/;` (اشتباه - trailing slash)
- [ ] ✅ `proxy_pass http://127.0.0.1:8000;` (درست - بدون trailing slash)

**راه‌حل:**

```dockerfile
# در Dockerfile.huggingface خط 33
# از:
proxy_pass http://127.0.0.1:8000/;

# به:
proxy_pass http://127.0.0.1:8000;
```

2. **Backend در حال اجرا است؟**

```bash
curl http://localhost:8000/api/health
```

- [ ] ✅ Backend پاسخ می‌دهد
- [ ] ❌ Backend down است → راه‌اندازی مجدد

3. **Endpoint path مطابقت دارد؟**

```bash
# بررسی routes در backend
grep -r "app.get('/api" src/server.ts
```

- [ ] ✅ Frontend و Backend routes یکسان هستند
- [ ] ❌ Mismatch → همسان‌سازی paths

### 3.2 اگر WebSocket Tests FAIL شد

**علائم:**

```
❌ WebSocket Connection (8000ms)
   Error: Timeout waiting for message
```

**بررسی‌های لازم:**

1. **WebSocket server روشن است؟**

در backend logs بررسی کنید:

```
WebSocket server listening on port 8000
```

- [ ] ✅ WebSocket server running
- [ ] ❌ WebSocket server not started

2. **nginx WebSocket proxy درست است؟**

```bash
cat Dockerfile.huggingface | grep -A 10 "location /ws"
```

```nginx
location /ws {
    proxy_pass http://127.0.0.1:8000/ws;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "Upgrade";
}
```

- [ ] ✅ Configuration درست است
- [ ] ❌ Headers کامل نیست → اصلاح

3. **CORS/SSL:**

- [ ] ✅ HTTPS برای production (wss://)
- [ ] ✅ WebSocket upgrade headers فعال است

**راه‌حل:**

```bash
# تست دستی WebSocket
wscat -c wss://your-domain.com/ws

# ارسال subscribe
> {"action":"subscribe","service":"market_data","symbols":["BTC"]}

# انتظار: دریافت پیام‌های market data
```

### 3.3 اگر Schema Validation FAIL شد

**علائم:**

```
❌ Health Check Endpoint (245ms)
   Error: Schema validation failed: Expected object, received array
```

**راه‌حل:**

1. بررسی response واقعی:

```bash
curl -s https://your-domain.com/api/health | jq
```

2. مقایسه با schema در `scripts/health-check-production.ts`:

```typescript
const HealthResponseSchema = z.object({
  status: z.string(),
  timestamp: z.string(),
  // ...
});
```

3. اصلاح schema یا backend response

---

## 📊 مرحله 4: تولید و ذخیره گزارش‌ها

### 4.1 گزارش JSON (برای CI/CD)

```bash
npm run health:check:json
```

- [ ] ✅ فایل `./reports/health-check.json` ایجاد شد
- [ ] ✅ فرمت JSON معتبر است

### 4.2 گزارش Markdown (برای Documentation)

```bash
npm run health:check:report
```

- [ ] ✅ فایل `./reports/health-check.md` ایجاد شد
- [ ] ✅ گزارش قابل خواندن است
- [ ] ✅ همه تست‌ها لیست شده‌اند

### 4.3 ذخیره تاریخچه (اختیاری)

```bash
# ذخیره گزارش با timestamp
cp reports/health-check.json reports/health-$(date +%Y%m%d-%H%M%S).json
```

- [ ] ✅ گزارش‌ها برای مقایسه روند ذخیره شدند

---

## 🔄 مرحله 5: ادغام CI/CD

### 5.1 GitHub Actions

```bash
# بررسی workflow file وجود دارد
ls -la .github/workflows/health-check.yml
```

- [ ] ✅ فایل workflow موجود است
- [ ] ✅ Secrets تنظیم شده‌اند:
  - [ ] `PROD_API_BASE`
  - [ ] `PROD_WS_URL`
  - [ ] `STAGING_API_BASE` (اختیاری)
  - [ ] `STAGING_WS_URL` (اختیاری)
  - [ ] `SLACK_WEBHOOK_URL` (اختیاری)

### 5.2 تست workflow

```bash
# اجرای دستی workflow
gh workflow run health-check.yml
```

- [ ] ✅ Workflow اجرا می‌شود
- [ ] ✅ تمام steps موفق هستند
- [ ] ✅ Artifacts upload می‌شوند
- [ ] ✅ Notifications ارسال می‌شوند (در صورت failure)

### 5.3 Post-Deploy Hook

ایجاد اسکریپت post-deploy:

```bash
# scripts/post-deploy.sh
#!/bin/bash
echo "🚀 Running post-deployment health checks..."

npm run health:check:prod

if [ $? -eq 0 ]; then
  echo "✅ Deployment verified successfully"
else
  echo "❌ Health check failed - consider rollback"
  exit 1
fi
```

- [ ] ✅ اسکریپت ایجاد شد
- [ ] ✅ اجازه اجرا داده شد: `chmod +x scripts/post-deploy.sh`
- [ ] ✅ در deployment pipeline فراخوانی می‌شود

---

## 📈 مرحله 6: Monitoring & Alerting

### 6.1 تنظیم Cron Job (اجرای دوره‌ای)

```bash
# اجرا هر 6 ساعت یک‌بار
0 */6 * * * cd /path/to/project && npm run health:check:ci >> /var/log/health-check.log 2>&1
```

- [ ] ✅ Cron job تنظیم شد
- [ ] ✅ لاگ‌ها ذخیره می‌شوند

### 6.2 تنظیم Alerting

**Slack Notification:**

```bash
# اگر FAIL شد، پیام به Slack
npm run health:check:ci || curl -X POST -H 'Content-type: application/json' \
  --data '{"text":"🚨 Health check failed in production!"}' \
  $SLACK_WEBHOOK_URL
```

- [ ] ✅ Slack webhook تنظیم شد
- [ ] ✅ نوتیفیکیشن تست شد

### 6.3 Dashboard/Grafana (اختیاری)

- [ ] 🔲 Metrics به Prometheus export می‌شوند
- [ ] 🔲 Dashboard Grafana برای health checks ایجاد شد
- [ ] 🔲 Alerts تنظیم شدند

---

## ✅ مرحله 7: تایید نهایی

### چک‌لیست نهایی

- [ ] ✅ همه REST endpoints کار می‌کنند (Pass Rate = 100%)
- [ ] ✅ WebSocket connection برقرار و پایدار است
- [ ] ✅ Schema validation برای همه responses موفق است
- [ ] ✅ Response times مناسب هستند (< 5000ms)
- [ ] ✅ Frontend به‌درستی داده‌ها را نمایش می‌دهد
- [ ] ✅ هیچ error در browser console نیست
- [ ] ✅ هیچ 404/500 error در production نیست
- [ ] ✅ گزارش‌ها تولید و ذخیره شدند
- [ ] ✅ CI/CD workflow تنظیم و تست شد
- [ ] ✅ Monitoring/Alerting راه‌اندازی شد

---

## 📝 ثبت نتایج

### فرم گزارش Deploy

```markdown
## Deployment Report - [تاریخ]

**Environment:** Production
**Deployed by:** [نام شما]
**Commit:** [commit hash]
**Time:** [زمان deploy]

### Pre-Deploy Checks
- [x] Code reviewed
- [x] Tests passed locally
- [x] Staging verified

### Post-Deploy Health Check
- [x] REST API: ✅ All tests passed (7/7)
- [x] WebSocket: ✅ Connected and receiving data
- [x] Schema Validation: ✅ All responses valid
- [x] Performance: ✅ Avg response time: 312ms

### Issues (if any)
- None

### Actions Taken
- Deployed to production
- Health check verified
- Documentation updated

**Status:** ✅ SUCCESS
```

- [ ] ✅ گزارش deploy ثبت شد
- [ ] ✅ Documentation به‌روز شد
- [ ] ✅ Team مطلع شدند

---

## 🎯 Best Practices

1. **همیشه قبل از deploy، staging را تست کنید:**

```bash
npm run health:check:staging && deploy-to-production.sh
```

2. **بعد از deploy، بلافاصله health check اجرا کنید:**

```bash
# در deployment script
deploy-app.sh && npm run health:check:prod
```

3. **گزارش‌ها را ذخیره کنید:**

```bash
# تاریخچه برای مقایسه
npm run health:check:json
mv reports/health-check.json reports/archive/health-$(date +%Y%m%d).json
```

4. **Rollback plan داشته باشید:**

```bash
# اگر health check FAIL شد
if ! npm run health:check:prod; then
  echo "❌ Rolling back..."
  rollback-deployment.sh
fi
```

---

## 📚 منابع

- [Health Check System Documentation](./HEALTH_CHECK_SYSTEM.md)
- [Deployment Audit Report](../DEPLOYMENT_AUDIT_REPORT.json)
- [GitHub Actions Workflow](../.github/workflows/health-check.yml)

---

**تهیه شده توسط Dreammaker Team**
**آخرین بروزرسانی:** 2025-12-03
