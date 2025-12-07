# 🎨 UI/UX Testing System

## نظام تست جامع رابط کاربری

یک سیستم تست خودکار که مانند یک **UI/UX Tester Agent واقعی** تمام صفحات اپلیکیشن را بررسی می‌کند.

---

## 🔍 چه چیزهایی تست می‌شود؟

### 1️⃣ Navigation & Rendering
- بارگذاری کامل صفحه (JS, CSS, Images, Data)
- وجود عناصر اصلی layout (header, sidebar, content, footer)
- عدم وجود صفحه خالی یا loader بی‌نهایت

### 2️⃣ Visual Layout & Styling
- فاصله‌گذاری صحیح بین component‌ها
- عدم وجود overlapping یا clipped elements
- عدم وجود horizontal scrollbar (مگر در طراحی)
- consistency در fonts، colors، font-sizes

### 3️⃣ Interaction Testing
- شناسایی تمام عناصر تعاملی (buttons, links, inputs, toggles)
- تست کلیک، hover، input
- بررسی response به action‌ها
- بررسی modal‌ها، dropdown‌ها، popup‌ها

### 4️⃣ Data Loading & Error States
- بررسی لود شدن داده‌ها
- بررسی loading spinners
- بررسی error states و fallback UI

### 5️⃣ Responsive Behavior
- تست در viewport‌های مختلف:
  - Desktop (1920x1080)
  - Laptop (1366x768)
  - Tablet (768x1024)
  - Mobile (375x667)
- بررسی responsive layout
- بررسی mobile menu/hamburger

### 6️⃣ Console Errors
- گوش دادن به console errors
- فیلتر کردن errorهای غیر مهم
- گزارش critical errors

### 7️⃣ Accessibility Basics
- Keyboard navigation (Tab order)
- Clickable areas
- Text contrast & readability

---

## 🚀 استفاده

### نصب Dependencies

```bash
npm install
```

### اجرای تست‌ها

#### تست کامل (تمام viewها)

```bash
npm run test:uiux
```

#### تست + تولید گزارش HTML

```bash
npm run test:uiux:full
```

#### فقط تولید گزارش (اگر تست قبلا اجرا شده)

```bash
npm run test:uiux:report
```

#### تست در همه browsers (Chromium + Firefox + WebKit)

```bash
npm run test:uiux:all
```

---

## 📊 خروجی‌ها

### 1. Console Output

```
📍 Testing Dashboard...
  1️⃣ Navigation & Rendering...
     ✅ Navigation passed
  2️⃣ Visual Layout...
     ✅ Layout passed
  3️⃣ Styling & Visual Consistency...
     ✅ Styling passed
  4️⃣ Interaction Testing...
     ✅ Interactions passed (15 interactive elements)
  5️⃣ Data Loading...
     ✅ Data loading passed
  6️⃣ Console Errors...
     ✅ No console errors
  ✅ VERDICT: PASS

📍 Testing Market...
  1️⃣ Navigation & Rendering...
     ✅ Navigation passed
  2️⃣ Visual Layout...
     ⚠️  Horizontal overflow detected: body width 1950px > viewport 1920px
  3️⃣ Styling & Visual Consistency...
     ⚠️  Elements with overflow: data-table, price-chart
  4️⃣ Interaction Testing...
     ✅ Interactions passed (23 interactive elements)
  5️⃣ Data Loading...
     ✅ Data loading passed
  6️⃣ Console Errors...
     ⚠️  1 console errors found
  ⚠️  VERDICT: WARNING
```

### 2. JSON Report

📍 **Location:** `./e2e-reports/uiux/uiux-test-report.json`

```json
{
  "summary": {
    "total": 24,
    "passed": 20,
    "warnings": 3,
    "failed": 1,
    "passRate": 83.3,
    "timestamp": "2025-12-03T12:30:45.123Z"
  },
  "results": [
    {
      "view": "Dashboard",
      "viewport": "Desktop (1920x1080)",
      "checks": {
        "navigation": { "passed": true },
        "layout": { "passed": true },
        "styling": { "passed": true },
        "interactions": { "passed": true },
        "dataLoading": { "passed": true },
        "console": { "passed": true, "errors": [] },
        "responsive": { "passed": true }
      },
      "screenshot": "./screenshots/dashboard-desktop.png",
      "verdict": "PASS",
      "timestamp": "2025-12-03T12:30:45.123Z"
    }
    // ... more results
  ]
}
```

### 3. HTML Report

📍 **Location:** `./e2e-reports/uiux/uiux-report.html`

یک گزارش زیبا و تعاملی با:
- خلاصه نتایج (total, passed, warnings, failed)
- لیست تمام viewها با وضعیت (PASS/WARNING/FAIL)
- جزئیات هر check
- Screenshots کامل هر صفحه
- لیست errorها (اگر وجود داشته باشد)

**نمایش:**

```bash
# باز کردن در browser
start e2e-reports/uiux/uiux-report.html  # Windows
open e2e-reports/uiux/uiux-report.html   # macOS
xdg-open e2e-reports/uiux/uiux-report.html  # Linux
```

### 4. Screenshots

📍 **Location:** `./e2e-reports/uiux/screenshots/`

برای هر view:
- `{view-id}-desktop.png` - Screenshot دسکتاپ
- `dashboard-tablet.png` - Screenshot تبلت
- `dashboard-mobile.png` - Screenshot موبایل

---

## 📋 Checklist تست شده

برای **هر view**:

- [ ] ✅ صفحه بارگذاری می‌شود
- [ ] ✅ Layout صحیح render شده (header, sidebar, content)
- [ ] ✅ هیچ صفحه خالی یا loader بی‌نهایت وجود ندارد
- [ ] ✅ فاصله‌گذاری component‌ها صحیح است
- [ ] ✅ overlapping یا clipping وجود ندارد
- [ ] ✅ horizontal scrollbar وجود ندارد (desktop)
- [ ] ✅ fonts و colors consistent هستند
- [ ] ✅ عناصر تعاملی کار می‌کنند (buttons, links, inputs)
- [ ] ✅ داده‌ها لود می‌شوند
- [ ] ✅ loading states صحیح هستند
- [ ] ✅ error states مناسب هستند
- [ ] ✅ responsive behavior صحیح است
- [ ] ✅ console errors وجود ندارند

---

## 🎯 Verdicts (نتیجه‌گیری)

### ✅ PASS
تمام checkها موفق بودند. صفحه کاملا functional و visually correct است.

### ⚠️ WARNING
برخی checkها مشکل دارند اما صفحه قابل استفاده است:
- Layout issues (overflow, clipping)
- Minor styling issues
- 1-3 console errors
- Missing interactions

### ❌ FAIL
Critical issues وجود دارد:
- صفحه لود نمی‌شود
- صفحه کاملا خالی است
- +3 console errors
- Navigation broken

---

## 🔧 تنظیمات

### تغییر Viewport Sizes

در فایل `e2e/comprehensive-uiux-test.spec.ts`:

```typescript
const VIEWPORTS = [
  { name: 'Desktop', width: 1920, height: 1080 },
  { name: 'Laptop', width: 1366, height: 768 },
  { name: 'Tablet', width: 768, height: 1024 },
  { name: 'Mobile', width: 375, height: 667 },
  // اضافه کردن viewport جدید
  { name: '4K', width: 3840, height: 2160 },
];
```

### اضافه کردن View جدید

```typescript
const ALL_VIEWS = [
  // ... existing views
  { id: 'new-view', name: 'New View', route: '/#new-view' },
];
```

### تنظیم Timeout

```typescript
// در playwright.config.ts
export default defineConfig({
  timeout: 60000, // 60 seconds
  use: {
    navigationTimeout: 30000, // 30 seconds
    actionTimeout: 10000, // 10 seconds
  },
});
```

---

## 🐛 عیب‌یابی

### مشکل: تست همیشه fail می‌شود

**علت:** سرور در حال اجرا نیست

**راه‌حل:**

```bash
# راه‌اندازی سرور در terminal جداگانه
npm run dev

# در terminal دیگر
npm run test:uiux
```

### مشکل: Timeout errors

**علت:** صفحات خیلی کند لود می‌شوند

**راه‌حل:**

```typescript
// افزایش timeout در test
await page.goto(url, { timeout: 60000 });

// یا در playwright.config.ts
timeout: 120000,
```

### مشکل: Screenshots خالی هستند

**علت:** صفحه قبل از screenshot render نشده

**راه‌حل:**

```typescript
// اضافه کردن wait بیشتر
await waitForPageStable(page, 10000);
await page.waitForTimeout(2000);
await page.screenshot({ path: '...' });
```

### مشکل: Console errors زیاد است

**علت:** Warning‌ها هم به عنوان error حساب می‌شوند

**راه‌حل:**

```typescript
// فیلتر کردن warnings
page.on('console', (msg) => {
  if (msg.type() === 'error' && !msg.text().includes('warning')) {
    consoleErrors.push(msg.text());
  }
});
```

---

## 📊 گزارش مثال

```
================================================================================
📊 UI/UX TEST REPORT
================================================================================

Total Views Tested: 24
Passed: 20 ✅
Warnings: 3 ⚠️
Failed: 1 ❌
Pass Rate: 83.3%

📄 Full report saved: ./e2e-reports/uiux/uiux-test-report.json

================================================================================
```

---

## 🎯 Best Practices

### 1. اجرا قبل از commit

```bash
# اضافه کردن به pre-commit hook
npm run test:uiux:full
```

### 2. اجرای دوره‌ای در CI/CD

```yaml
# در .github/workflows/ui-test.yml
- name: Run UI/UX Tests
  run: npm run test:uiux
```

### 3. بررسی گزارش بعد از هر تغییر UI

```bash
# بعد از تغییرات CSS/Layout
npm run test:uiux:full

# باز کردن گزارش
start e2e-reports/uiux/uiux-report.html
```

### 4. Screenshot comparison (Manual)

- قبل از تغییرات: `npm run test:uiux`
- بعد از تغییرات: `npm run test:uiux`
- مقایسه screenshots در `./e2e-reports/uiux/screenshots/`

---

## 📚 منابع

- [Playwright Documentation](https://playwright.dev/)
- [UI Testing Best Practices](https://playwright.dev/docs/best-practices)
- [Accessibility Testing](https://playwright.dev/docs/accessibility-testing)

---

## 🤝 مشارکت

برای بهبود این سیستم:

1. اضافه کردن check‌های جدید
2. بهبود accuracy
3. اضافه کردن viewport‌های بیشتر
4. بهبود گزارش HTML

---

**ساخته شده توسط UI/UX Tester Agent**
**آخرین بروزرسانی:** 2025-12-03
