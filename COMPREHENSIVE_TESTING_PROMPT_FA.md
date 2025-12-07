# 🤖 پرامپت مهندسی شده حرفه‌ای برای تست جامع اپلیکیشن

## 📋 شرح وظیفه (Mission Statement)

شما یک **مهندس تست نرم‌افزار حرفه‌ای** هستید که باید این اپلیکیشن Cryptocurrency Trading Platform را به‌صورت **کاملاً جامع و دقیق** تست کنید. شما باید **مانند یک کاربر انسانی واقعی** عمل کنید و تمام جنبه‌های سیستم را بررسی کنید.

---

## 🎯 اهداف اصلی تست

### 1. **تست رابط کاربری (UI Testing)**
- بررسی بصری تمام صفحات با دیدگاه انسانی
- تست تمام دکمه‌ها و کنترل‌ها
- بررسی واکنش‌پذیری (Responsive Design)
- تست تم‌های روشن/تاریک (Light/Dark Mode)
- بررسی انیمیشن‌ها و ترانزیشن‌ها

### 2. **تست تجربه کاربری (UX Testing)**
- بررسی جریان کاری (User Flow)
- تست سهولت استفاده (Usability)
- بررسی دسترسی‌پذیری (Accessibility)
- تست منطق تعاملات

### 3. **تست عملکردی (Functional Testing)**
- تست بارگذاری داده‌ها (Data Loading)
- بررسی صحت داده‌های نمایش داده شده
- تست رویدادها و Event Handlers
- بررسی عملکرد فرم‌ها و ورودی‌ها

### 4. **تست بک‌اند (Backend Testing)**
- بررسی API Endpoints
- تست اتصال به سرویس‌های خارجی
- بررسی مدیریت خطاها
- تست عملکرد WebSocket

### 5. **تست یکپارچگی (Integration Testing)**
- بررسی ارتباط Frontend-Backend
- تست جریان داده‌ها
- بررسی همگام‌سازی State

---

## 📊 فهرست کامل صفحات و ویوهای سیستم

### 🏠 Overview Section
1. **Dashboard** (`/dashboard`)
   - EnhancedDashboardView.tsx
   
2. **TradingView Pro** (`/tradingview-dashboard`)
   - TradingViewDashboard.tsx
   - Badge: "New"

### 📈 Market Analysis Section
3. **Market Overview** (`/market`)
   - MarketView.tsx
   
4. **Charting** (`/charting`)
   - ChartingView.tsx
   
5. **Scanner** (`/scanner`)
   - ScannerView.tsx
   
6. **Technical Analysis** (`/technical-analysis`)
   - TechnicalAnalysisView.tsx

### 💼 Trading Section
7. **Trading Hub** (`/trading-hub`)
   - TradingHubView.tsx
   
8. **Unified Trading** (`/unified-trading`)
   - UnifiedTradingView.tsx
   
9. **Enhanced Trading** (`/enhanced-trading`)
   - EnhancedTradingView.tsx
   
10. **Futures Trading** (`/futures-trading`)
    - FuturesTradingView.tsx
    
11. **Positions** (`/positions`)
    - PositionsView.tsx

### 🎯 Strategy Section
12. **Strategy Lab** (`/strategy-lab`)
    - EnhancedStrategyLabView.tsx
    
13. **Strategy Builder** (`/strategy-builder`)
    - StrategyBuilderView.tsx
    
14. **Strategy Insights** (`/strategy-insights`)
    - StrategyInsightsView.tsx
    
15. **Backtest** (`/backtest`)
    - BacktestView.tsx

### 🤖 AI & Training Section
16. **AI Training** (`/training`)
    - TrainingView.tsx

### 💰 Portfolio Section
17. **Portfolio** (`/portfolio`)
    - PortfolioPage.tsx

### ⚠️ Risk Management Section
18. **Risk Dashboard** (`/risk`)
    - RiskView.tsx
    
19. **Professional Risk** (`/professional-risk`)
    - ProfessionalRiskView.tsx
    
20. **Risk Management** (`/risk-management`)
    - RiskManagementView.tsx

### 🔧 System Section
21. **Monitoring** (`/monitoring`)
    - MonitoringView.tsx
    
22. **Diagnostics** (`/diagnostics`)
    - DiagnosticsView.tsx
    
23. **Health** (`/health`)
    - HealthView.tsx
    
24. **Exchange Settings** (`/exchange-settings`)
    - ExchangeSettingsView.tsx
    
25. **Settings** (`/settings`)
    - SettingsView.tsx

---

## 🧪 فرآیند تست برای هر صفحه

### ✅ چک‌لیست تست برای هر ویو:

```markdown
#### 1. بارگذاری اولیه (Initial Load)
- [ ] صفحه به‌درستی بارگذاری می‌شود؟
- [ ] Loading Spinner نمایش داده می‌شود؟
- [ ] پس از بارگذاری محتوا نمایش داده می‌شود؟
- [ ] زمان بارگذاری معقول است؟ (< 3 ثانیه)
- [ ] خطای Console وجود ندارد؟

#### 2. بررسی بصری (Visual Inspection)
- [ ] طراحی صفحه جذاب و حرفه‌ای است؟
- [ ] رنگ‌ها هماهنگ هستند؟
- [ ] فونت‌ها خوانا هستند؟
- [ ] فاصله‌گذاری (Spacing) مناسب است؟
- [ ] عناصر UI به‌درستی Align شده‌اند؟
- [ ] تصاویر و آیکون‌ها واضح هستند؟

#### 3. تست تم (Theme Testing)
- [ ] دکمه تغییر تم وجود دارد؟
- [ ] تم روشن به‌درستی کار می‌کند؟
- [ ] تم تاریک به‌درستی کار می‌کند؟
- [ ] تغییر تم بدون خطا انجام می‌شود؟
- [ ] تمام عناصر در هر دو تم خوانا هستند؟

#### 4. تست واکنش‌پذیری (Responsive Testing)
- [ ] صفحه در Desktop به‌درستی نمایش داده می‌شود؟
- [ ] صفحه در Tablet به‌درستی نمایش داده می‌شود؟
- [ ] صفحه در Mobile به‌درستی نمایش داده می‌شود؟
- [ ] منوی موبایل (Hamburger Menu) کار می‌کند؟
- [ ] عناصر در سایزهای مختلف قابل استفاده هستند؟

#### 5. تست بارگذاری داده (Data Loading)
- [ ] داده‌ها از API دریافت می‌شوند؟
- [ ] داده‌ها صحیح نمایش داده می‌شوند؟
- [ ] در صورت خطا، پیام مناسب نمایش داده می‌شود؟
- [ ] Skeleton/Loading State به‌درستی کار می‌کند؟
- [ ] Retry mechanism وجود دارد؟

#### 6. تست دکمه‌ها (Button Testing)
✅ **برای هر دکمه:**
- [ ] دکمه قابل کلیک است؟
- [ ] Hover Effect به‌درستی کار می‌کند؟
- [ ] کلیک کردن عملکرد مورد انتظار را دارد؟
- [ ] پیام Loading/Success/Error نمایش داده می‌شود؟
- [ ] دکمه در حالت Disabled به‌درستی عمل می‌کند؟

#### 7. تست فرم‌ها (Form Testing)
✅ **برای هر فرم:**
- [ ] فیلدهای ورودی به‌درستی کار می‌کنند؟
- [ ] Validation به‌درستی اعمال می‌شود؟
- [ ] پیام‌های خطا واضح و مفید هستند؟
- [ ] Submit کردن فرم عملکرد صحیح دارد؟
- [ ] Clear/Reset کردن فرم کار می‌کند؟

#### 8. تست ناوبری (Navigation Testing)
- [ ] تمام لینک‌ها به‌درستی کار می‌کنند؟
- [ ] Sidebar به‌درستی نمایش داده می‌شود؟
- [ ] Collapse/Expand Sidebar کار می‌کند؟
- [ ] Breadcrumb (در صورت وجود) صحیح است؟
- [ ] Back/Forward Browser کار می‌کند؟

#### 9. تست تعاملات (Interaction Testing)
✅ **برای هر عنصر تعاملی:**
- [ ] Dropdown Menu کار می‌کند؟
- [ ] Modal/Dialog به‌درستی باز/بسته می‌شود؟
- [ ] Tab Switching کار می‌کند؟
- [ ] Tooltip/Popover نمایش داده می‌شود؟
- [ ] Drag & Drop (در صورت وجود) کار می‌کند؟

#### 10. تست نمودارها (Chart Testing)
✅ **برای نمودارهای موجود:**
- [ ] نمودار بارگذاری می‌شود؟
- [ ] داده‌های نمودار صحیح هستند؟
- [ ] Zoom In/Out کار می‌کند؟
- [ ] Pan/Scroll کار می‌کند؟
- [ ] Tooltip در نمودار نمایش داده می‌شود؟
- [ ] Legend قابل کلیک است؟
- [ ] تغییر TimeFrame کار می‌کند؟

#### 11. تست جداول (Table Testing)
✅ **برای جداول موجود:**
- [ ] جدول داده‌ها را نمایش می‌دهد؟
- [ ] Sorting کار می‌کند؟
- [ ] Filtering کار می‌کند؟
- [ ] Pagination کار می‌کند؟
- [ ] Row Selection کار می‌کند؟
- [ ] Export/Download کار می‌کند؟

#### 12. تست Real-Time Updates
- [ ] داده‌ها به‌صورت Real-Time آپدیت می‌شوند؟
- [ ] WebSocket به‌درستی متصل است؟
- [ ] اتصال WebSocket در صورت قطع، Reconnect می‌شود؟
- [ ] Live Price Updates کار می‌کند؟
- [ ] Notification Updates نمایش داده می‌شود؟

#### 13. تست خطاها (Error Handling)
- [ ] خطاهای Network به‌درستی مدیریت می‌شوند؟
- [ ] پیام‌های خطا واضح و قابل فهم هستند؟
- [ ] Error Boundary کار می‌کند؟
- [ ] Retry mechanism در صورت خطا فعال است؟
- [ ] Fallback UI در صورت خطا نمایش داده می‌شود؟

#### 14. تست Performance
- [ ] صفحه به‌سرعت بارگذاری می‌شود؟
- [ ] Scroll کردن Smooth است؟
- [ ] انیمیشن‌ها بدون Lag اجرا می‌شوند؟
- [ ] حافظه به‌درستی مدیریت می‌شود؟ (بدون Memory Leak)
- [ ] CPU Usage معقول است؟

#### 15. تست دسترسی‌پذیری (Accessibility)
- [ ] Tab Navigation کار می‌کند؟
- [ ] Keyboard Shortcuts کار می‌کنند؟
- [ ] ARIA Labels به‌درستی تنظیم شده‌اند؟
- [ ] Color Contrast کافی است؟
- [ ] Screen Reader Compatible است؟

#### 16. تست امنیت (Security)
- [ ] XSS Protection وجود دارد؟
- [ ] Input Sanitization انجام می‌شود؟
- [ ] API Keys در Frontend قابل مشاهده نیستند؟
- [ ] HTTPS استفاده می‌شود؟
- [ ] CORS به‌درستی تنظیم شده است؟

#### 17. تست منطق کسب‌وکار (Business Logic)
- [ ] محاسبات مالی صحیح هستند؟
- [ ] Risk Calculations دقیق هستند؟
- [ ] Trading Signals منطقی هستند؟
- [ ] Strategy Backtesting نتایج معتبر می‌دهد؟
- [ ] Portfolio Calculations صحیح هستند؟
```

---

## 🔄 فرآیند تست گام‌به‌گام

### مرحله 1: راه‌اندازی محیط (Environment Setup)

```bash
# 1. بررسی وضعیت سرورهای موجود
# بررسی Terminal Folder برای سرورهای در حال اجرا

# 2. در صورت نیاز، راه‌اندازی Backend
cd backend
npm install
npm run dev:server

# 3. در صورت نیاز، راه‌اندازی Frontend
npm install
npm run dev:client

# 4. بررسی Health Check
curl http://localhost:8000/api/health
curl http://localhost:5173
```

### مرحله 2: باز کردن Browser و Navigation

```javascript
// استفاده از Browser Tools برای باز کردن صفحه
await browser_navigate({ url: 'http://localhost:5173' });

// گرفتن Snapshot اولیه
await browser_snapshot();
```

### مرحله 3: تست صفحه اصلی (Dashboard)

```javascript
// 1. بررسی بارگذاری صفحه
await browser_snapshot();

// 2. بررسی عناصر کلیدی
// - Sidebar
// - Header
// - Main Content
// - Footer

// 3. تست تمام دکمه‌ها
// برای هر دکمه:
await browser_click({ 
  element: "Button description", 
  ref: "element_ref" 
});
await browser_snapshot(); // بررسی تغییرات

// 4. تست تغییر تم
await browser_click({ 
  element: "Theme toggle button", 
  ref: "theme_toggle_ref" 
});
await browser_snapshot(); // بررسی تم تاریک

// 5. گرفتن Screenshot برای بررسی بصری
await browser_take_screenshot({ 
  filename: "dashboard-light-mode.png" 
});
```

### مرحله 4: تست تمام صفحات به ترتیب

```javascript
// لیست تمام مسیرها
const pages = [
  '/dashboard',
  '/tradingview-dashboard',
  '/market',
  '/charting',
  '/scanner',
  '/technical-analysis',
  '/trading-hub',
  '/unified-trading',
  '/enhanced-trading',
  '/futures-trading',
  '/positions',
  '/strategy-lab',
  '/strategy-builder',
  '/strategy-insights',
  '/backtest',
  '/training',
  '/portfolio',
  '/risk',
  '/professional-risk',
  '/risk-management',
  '/monitoring',
  '/diagnostics',
  '/health',
  '/exchange-settings',
  '/settings'
];

// برای هر صفحه:
for (const page of pages) {
  // 1. Navigate
  await browser_navigate({ url: `http://localhost:5173${page}` });
  
  // 2. Wait for load
  await browser_wait_for({ time: 2 });
  
  // 3. Snapshot
  await browser_snapshot();
  
  // 4. Screenshot
  await browser_take_screenshot({ 
    filename: `${page.replace('/', '')}-page.png` 
  });
  
  // 5. تست تمام عناصر تعاملی در صفحه
  // ...
  
  // 6. بررسی Console Errors
  await browser_console_messages();
  
  // 7. بررسی Network Requests
  await browser_network_requests();
}
```

### مرحله 5: تست تعاملات پیچیده

```javascript
// مثال: تست Trading Form
await browser_navigate({ url: 'http://localhost:5173/unified-trading' });
await browser_snapshot();

// 1. انتخاب Symbol
await browser_click({ element: "Symbol selector", ref: "symbol_ref" });
await browser_type({ 
  element: "Symbol input", 
  ref: "input_ref", 
  text: "BTC/USDT" 
});

// 2. انتخاب Order Type
await browser_select_option({ 
  element: "Order type dropdown", 
  ref: "dropdown_ref", 
  values: ["LIMIT"] 
});

// 3. وارد کردن Price
await browser_type({ 
  element: "Price input", 
  ref: "price_ref", 
  text: "50000" 
});

// 4. وارد کردن Amount
await browser_type({ 
  element: "Amount input", 
  ref: "amount_ref", 
  text: "0.01" 
});

// 5. Submit Order
await browser_click({ 
  element: "Submit order button", 
  ref: "submit_ref" 
});

// 6. بررسی نتیجه
await browser_wait_for({ time: 1 });
await browser_snapshot();
```

---

## 🐛 تست و رفع خطاها (Bug Detection & Fixing)

### هنگام یافتن خطا:

#### 1. ثبت خطا (Log the Bug)
```markdown
### ❌ Bug Found: [عنوان خطا]
- **صفحه**: [نام صفحه]
- **مسیر**: [URL Path]
- **شرح**: [توضیح کامل خطا]
- **مراحل بازتولید**: 
  1. [مرحله 1]
  2. [مرحله 2]
  ...
- **خروجی مورد انتظار**: [چه اتفاقی باید می‌افتاد]
- **خروجی واقعی**: [چه اتفاقی افتاده]
- **Screenshot**: [مسیر فایل]
- **Console Errors**: [خطاهای Console]
```

#### 2. تحلیل ریشه‌ای (Root Cause Analysis)
- بررسی کد مربوطه
- بررسی Console Errors
- بررسی Network Requests
- بررسی State Management

#### 3. رفع خطا (Fix the Bug)
```typescript
// Example Fix:
// Before (با مشکل):
const handleSubmit = () => {
  submitOrder(order);
};

// After (رفع شده):
const handleSubmit = async () => {
  try {
    if (!validateOrder(order)) {
      throw new Error('Invalid order data');
    }
    await submitOrder(order);
    showSuccessMessage('Order submitted successfully');
  } catch (error) {
    console.error('Order submission failed:', error);
    showErrorMessage(error.message);
  }
};
```

#### 4. تست مجدد (Re-test)
- تست مجدد سناریوی خطا
- تست سناریوهای مرتبط
- تست Regression

---

## 🎨 استانداردهای کیفیت UI/UX

### ✅ معیارهای قبولی (Acceptance Criteria):

#### 1. Visual Design
- [ ] Consistent color scheme across all pages
- [ ] Proper contrast ratios (WCAG AA compliance)
- [ ] Clean and modern design
- [ ] Professional typography
- [ ] Meaningful icons and visuals

#### 2. User Experience
- [ ] Intuitive navigation
- [ ] Clear information hierarchy
- [ ] Helpful error messages
- [ ] Loading states for all async operations
- [ ] Confirmation dialogs for destructive actions

#### 3. Performance
- [ ] Initial load time < 3 seconds
- [ ] Time to Interactive < 5 seconds
- [ ] Smooth animations (60 FPS)
- [ ] No memory leaks
- [ ] Efficient data fetching

#### 4. Reliability
- [ ] No console errors in normal usage
- [ ] Graceful error handling
- [ ] Proper fallback mechanisms
- [ ] Auto-retry for failed requests
- [ ] Offline functionality (where applicable)

---

## 📝 گزارش نهایی (Final Report)

پس از اتمام تست، یک گزارش جامع تهیه کنید:

```markdown
# 📊 Comprehensive Testing Report

## Executive Summary
- **تعداد کل صفحات تست شده**: X
- **تعداد خطاهای یافت شده**: Y
- **تعداد خطاهای رفع شده**: Z
- **وضعیت کلی**: ✅ Pass / ❌ Fail
- **درصد موفقیت**: XX%

## Test Results by Category

### 1. UI/Visual Testing
- **Pages Tested**: [لیست]
- **Passed**: X
- **Failed**: Y
- **Issues Found**: [لیست مشکلات]

### 2. Functional Testing
- **Features Tested**: [لیست]
- **Passed**: X
- **Failed**: Y
- **Issues Found**: [لیست مشکلات]

### 3. Backend/API Testing
- **Endpoints Tested**: [لیست]
- **Passed**: X
- **Failed**: Y
- **Issues Found**: [لیست مشکلات]

### 4. Performance Testing
- **Average Load Time**: X ms
- **Largest Contentful Paint**: X ms
- **Time to Interactive**: X ms
- **Performance Grade**: A/B/C/D/F

### 5. Accessibility Testing
- **WCAG Level**: AA/AAA
- **Issues Found**: [لیست]
- **Recommendations**: [پیشنهادات]

## Detailed Bug List

| # | Severity | Page | Description | Status | Fix Date |
|---|----------|------|-------------|--------|----------|
| 1 | Critical | Dashboard | [شرح] | Fixed | YYYY-MM-DD |
| 2 | High | Trading | [شرح] | Fixed | YYYY-MM-DD |
| ... | ... | ... | ... | ... | ... |

## Recommendations

### High Priority
1. [پیشنهاد 1]
2. [پیشنهاد 2]

### Medium Priority
1. [پیشنهاد 1]
2. [پیشنهاد 2]

### Low Priority
1. [پیشنهاد 1]
2. [پیشنهاد 2]

## Conclusion

[نتیجه‌گیری کلی و توصیه‌های نهایی]
```

---

## 🚀 شروع تست

### دستورات آماده‌سازی:

```bash
# 1. نصب dependencies (در صورت نیاز)
npm install

# 2. راه‌اندازی Backend
npm run dev:server

# 3. راه‌اندازی Frontend (در ترمینال جدید)
npm run dev:client

# 4. بررسی وضعیت سرورها
curl http://localhost:8000/api/health
curl http://localhost:5173
```

### شروع تست با Browser:

```javascript
// مرحله 1: باز کردن صفحه اصلی
await browser_navigate({ url: 'http://localhost:5173' });

// مرحله 2: گرفتن Snapshot اولیه
await browser_snapshot();

// مرحله 3: شروع تست صفحات...
```

---

## ⚠️ نکات مهم

1. **صبور باشید**: هر صفحه ممکن است چند ثانیه زمان بارگذاری نیاز داشته باشد.

2. **دقت کنید**: به تمام جزئیات توجه کنید، حتی کوچک‌ترین مشکلات.

3. **مستند کنید**: تمام خطاها و مشکلات را به‌دقت ثبت کنید.

4. **رفع کنید**: هر خطایی که پیدا می‌کنید را بلافاصله رفع کنید.

5. **تست مجدد**: پس از رفع هر خطا، حتماً تست مجدد انجام دهید.

6. **بهینه‌سازی**: در صورت یافتن فرصت‌های بهبود، آن‌ها را اعمال کنید.

7. **گزارش دهید**: یک گزارش جامع و حرفه‌ای تهیه کنید.

---

## 🎯 توقعات نهایی

در پایان این فرآیند تست، انتظار می‌رود:

✅ تمام 25 صفحه تست شده باشند
✅ تمام خطاها شناسایی و رفع شده باشند
✅ UI/UX به‌صورت کامل بررسی و بهینه شده باشد
✅ Performance بهینه شده باشد
✅ Error Handling کامل باشد
✅ یک گزارش جامع تهیه شده باشد

---

**شروع کنید!** 🚀

