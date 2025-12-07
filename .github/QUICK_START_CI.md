# 🚀 Quick Start - CI System

## برای توسعه‌دهندگان (For Developers)

### قبل از Push:
```bash
npm run lint
npm run typecheck
npm test
npm run build:client
npm run build:server
```

### اگر CI Fail شد:

1. **برو به GitHub Actions**
2. **پیدا کن کدام job fail شده** (قرمز)
3. **دانلود کن artifact مربوطه:**

| Job Failed | Download Artifact | Check File |
|------------|-------------------|------------|
| Code Quality | `quality-reports` | `eslint-report.json` |
| Unit Tests | `unit-test-results` | `vitest-results.json` |
| Build | `build-reports-client` | `client-report.json` |
| Docker | `docker-reports-backend` | `backend-report.json` |

4. **باز کن فایل JSON** و خطاها را پیدا کن
5. **رفع کن** بر اساس نوع خطا
6. **تست کن** locally
7. **Push کن** دوباره

---

## برای Cursor AI

### گام 1: بخوان
```typescript
const config = JSON.parse(
  fs.readFileSync('.github/ci-config.json', 'utf8')
);
```

### گام 2: پیدا کن
```typescript
const jobInfo = config.jobs['code-quality'];
const artifact = jobInfo.artifacts['quality-reports'];
```

### گام 3: راهنمایی کن
```
Tell user: "Download artifact: quality-reports"
Tell user: "Check file: eslint-report.json"
```

### گام 4: تجزیه کن
```typescript
const report = JSON.parse(
  fs.readFileSync('eslint-report.json', 'utf8')
);
const errors = report.filter(f => f.errorCount > 0);
```

### گام 5: رفع کن
```
Provide specific fixes for each error
Show: npm run lint -- --fix
```

---

## فایل‌های کلیدی

📄 `.github/ci-config.json` - کامل‌ترین فایل، همه چیز اینجاست  
📄 `.github/CI_GUIDE.md` - راهنمای کامل انسانی  
📄 `.github/CURSOR_AI_GUIDE.json` - راهنمای کامل AI  
📄 `.github/README_CI_SYSTEM.md` - خلاصه و سناریوها  

---

## دستورات مفید

```bash
# اعتبارسنجی CI
npm run ci:validate

# تجزیه گزارش‌ها
npm run ci:parse

# مشاهده راهنما
npm run ci:help
```

---

**نکته:** همیشه از `.github/ci-config.json` شروع کن!
