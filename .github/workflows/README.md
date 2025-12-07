# GitHub Actions Workflows Guide

## 📁 فایل‌های Workflow موجود

### 1️⃣ `health-check-simple.yml` (پیشنهادی ✅)

**مناسب برای:** تیم‌های کوچک تا متوسط، پروژه‌های production

**ویژگی‌ها:**
- ✅ تست staging و production به‌صورت موازی
- ✅ تولید گزارش JSON و Markdown
- ✅ نظر در Pull Request
- ✅ ایجاد Issue در صورت failure
- ✅ ارسال Slack notification (اختیاری)
- ✅ خلاصه نتایج در GitHub Summary
- ✅ Matrix strategy برای تست چند محیط

**استفاده:**
```yaml
# استفاده از این workflow به‌صورت پیش‌فرض
```

### 2️⃣ `health-check.yml` (کامل و پیشرفته)

**مناسب برای:** تیم‌های بزرگ، enterprise projects

**ویژگی‌ها:**
- ✅ همه ویژگی‌های نسخه simple
- ✅ قابلیت اجرای دستی (workflow_dispatch)
- ✅ Job جداگانه برای summary
- ✅ Upload artifacts با retention
- ✅ Error handling پیشرفته
- ✅ لاگ‌های دقیق‌تر

**استفاده:**
```bash
# اگر نیاز به کنترل بیشتری دارید، این workflow را فعال کنید
```

---

## 🚀 راه‌اندازی

### مرحله 1: انتخاب Workflow

**گزینه A: استفاده از Simple (پیشنهادی)**

```bash
# نام فایل را تغییر ندهید - به‌صورت پیش‌فرض فعال است
git add .github/workflows/health-check-simple.yml
git commit -m "Add health check workflow"
git push
```

**گزینه B: استفاده از Complete**

```bash
# فعال کردن workflow کامل
mv .github/workflows/health-check.yml .github/workflows/health-check-active.yml
mv .github/workflows/health-check-simple.yml .github/workflows/health-check-simple.bak

git add .github/workflows/
git commit -m "Use complete health check workflow"
git push
```

### مرحله 2: تنظیم GitHub Secrets

در صفحه repository → Settings → Secrets and variables → Actions:

#### الزامی (Required):
- `PROD_API_BASE` - URL API production
  ```
  https://really-amin-datasourceforcryptocurrency.hf.space
  ```

- `PROD_WS_URL` - URL WebSocket production
  ```
  wss://really-amin-datasourceforcryptocurrency.hf.space/ws
  ```

#### اختیاری (Optional):
- `STAGING_API_BASE` - URL API staging
- `STAGING_WS_URL` - URL WebSocket staging
- `SLACK_WEBHOOK_URL` - Webhook برای Slack notifications

### مرحله 3: تست اولیه

#### تست دستی:

```bash
# در GitHub UI:
# Actions → Health Check → Run workflow
```

یا با `gh` CLI:

```bash
gh workflow run health-check-simple.yml
```

#### مشاهده نتایج:

```bash
# لیست تمام اجراها
gh run list --workflow=health-check-simple.yml

# مشاهده آخرین اجرا
gh run view

# دانلود artifacts
gh run download <run-id>
```

---

## 📊 مقایسه Workflows

| ویژگی | Simple | Complete |
|-------|--------|----------|
| **اجرای خودکار** | ✅ | ✅ |
| **اجرای دستی** | ✅ | ✅ |
| **تست چند محیط** | ✅ (matrix) | ✅ (matrix) |
| **گزارش JSON** | ✅ | ✅ |
| **گزارش Markdown** | ✅ | ✅ |
| **نظر در PR** | ✅ | ✅ |
| **ایجاد Issue** | ✅ | ✅ |
| **Slack notification** | ✅ | ✅ |
| **GitHub Summary** | ✅ | ✅ |
| **Error handling** | پایه | پیشرفته |
| **Customization** | متوسط | بالا |
| **پیچیدگی** | ⭐⭐ | ⭐⭐⭐⭐ |

---

## 🎯 Use Cases

### 1. تیم کوچک - Startup

**پیشنهاد:** `health-check-simple.yml`

```yaml
# فقط production را تست کنید
strategy:
  matrix:
    environment: [production]
```

### 2. تیم متوسط - Scale-up

**پیشنهاد:** `health-check-simple.yml` با staging

```yaml
# تست staging و production
strategy:
  matrix:
    environment: [staging, production]
```

### 3. تیم بزرگ - Enterprise

**پیشنهاد:** `health-check.yml` (کامل)

- اضافه کردن محیط‌های بیشتر
- تنظیم notifications پیشرفته
- ادغام با monitoring systems

---

## 🔧 سفارشی‌سازی

### تغییر زمان‌بندی

```yaml
schedule:
  # هر 3 ساعت
  - cron: '0 */3 * * *'

  # هر روز ساعت 9 صبح
  - cron: '0 9 * * *'

  # فقط روزهای کاری
  - cron: '0 9 * * 1-5'
```

### فقط برای برنچ‌های خاص

```yaml
on:
  push:
    branches:
      - main
      - release/*
  pull_request:
    branches:
      - main
      - develop
```

### اضافه کردن محیط جدید

```yaml
strategy:
  matrix:
    environment: [development, staging, production, demo]
```

### تغییر retention artifacts

```yaml
- name: Upload report artifacts
  uses: actions/upload-artifact@v4
  with:
    retention-days: 90  # 90 روز به جای 30
```

---

## 🐛 عیب‌یابی

### مشکل: Workflow اجرا نمی‌شود

**راه‌حل:**
1. بررسی کنید branch درست است
2. بررسی کنید event trigger صحیح است
3. لاگ‌های Actions را بررسی کنید

### مشکل: Secrets در دسترس نیستند

**راه‌حل:**
```bash
# بررسی secrets
gh secret list

# اضافه کردن secret
gh secret set PROD_API_BASE --body "https://..."
```

### مشکل: Health check همیشه fail می‌شود

**راه‌حل:**
1. تست محلی:
   ```bash
   npm run health:check:prod
   ```
2. بررسی URLs و credentials
3. بررسی network/firewall از GitHub

### مشکل: Artifacts upload نمی‌شوند

**راه‌حل:**
1. بررسی مسیر فایل‌ها
2. اطمینان از اینکه گزارش‌ها تولید شده‌اند:
   ```yaml
   - name: List files
     run: ls -la ./reports/
   ```

---

## 📚 منابع بیشتر

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Health Check System](../../docs/HEALTH_CHECK_SYSTEM.md)
- [Post-Deploy Checklist](../../docs/POST_DEPLOY_CHECKLIST.md)

---

## ✅ Checklist راه‌اندازی

- [ ] انتخاب workflow (simple یا complete)
- [ ] اضافه کردن GitHub Secrets:
  - [ ] `PROD_API_BASE`
  - [ ] `PROD_WS_URL`
  - [ ] `STAGING_API_BASE` (اختیاری)
  - [ ] `STAGING_WS_URL` (اختیاری)
  - [ ] `SLACK_WEBHOOK_URL` (اختیاری)
- [ ] Push کردن workflow
- [ ] تست دستی اولیه
- [ ] بررسی نتایج
- [ ] تنظیم notifications
- [ ] مستندسازی برای تیم

---

**نکته مهم:** برای اکثر پروژه‌ها، `health-check-simple.yml` کافی است. workflow کامل را فقط در صورت نیاز به قابلیت‌های پیشرفته استفاده کنید.

**آخرین بروزرسانی:** 2025-12-03
