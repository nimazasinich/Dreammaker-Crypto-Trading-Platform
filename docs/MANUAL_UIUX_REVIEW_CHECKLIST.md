# 🎨 Manual UI/UX Review Checklist

## راهنمای کامل بررسی دستی رابط کاربری

این چک‌لیست برای **manual review** توسط یک UI/UX Tester واقعی طراحی شده است.

---

## 📋 General Information

**Reviewer:** ___________________
**Date:** ___________________
**Build/Version:** ___________________
**Browser(s) Tested:** ☐ Chrome ☐ Firefox ☐ Safari ☐ Edge
**Environment:** ☐ Development ☐ Staging ☐ Production

---

## 🔍 Views/Pages to Review

### ☐ Dashboard
### ☐ Charting
### ☐ Market
### ☐ Scanner
### ☐ Training
### ☐ Risk
### ☐ Professional Risk
### ☐ Backtest
### ☐ Strategy Builder
### ☐ Health
### ☐ Settings
### ☐ Futures Trading
### ☐ Unified Trading
### ☐ Trading Hub
### ☐ Portfolio
### ☐ Technical Analysis
### ☐ Risk Management
### ☐ Enhanced Trading
### ☐ Positions
### ☐ Strategy Lab
### ☐ Strategy Insights
### ☐ Exchange Settings
### ☐ Monitoring
### ☐ Diagnostics

---

## 📄 Per-Page Review Checklist

استفاده: برای **هر صفحه**، این چک‌لیست را کامل کنید.

### Page: ___________________

---

### 1️⃣ Full Load & Navigation

**URL/Route:** ___________________

- [ ] صفحه به طور کامل لود می‌شود (CSS, JS, Images, Fonts)
- [ ] هیچ loading spinner یا placeholder بی‌نهایت نیست
- [ ] صفحه خالی (blank white) نیست
- [ ] Navigation bar/sidebar نمایش داده می‌شود
- [ ] Main content area موجود و visible است
- [ ] Footer (اگر وجود دارد) نمایش داده می‌شود

**Status:** ☐ Pass ☐ Warning ☐ Fail
**Issues Found:**
```
[شرح مشکل اگر وجود دارد]
```

**Screenshot:** ___________________

---

### 2️⃣ Visual UI & Layout Inspection

#### Spacing & Padding
- [ ] Padding بین component‌ها صحیح است (نه خیلی زیاد، نه خیلی کم)
- [ ] Margin بین sections مناسب است
- [ ] فاصله بین cards/panels یکسان و consistent است
- [ ] Whitespace به طور مناسب استفاده شده

**Issues:**
```
[مثال: Padding سمت راست کارت‌ها خیلی کم است]
```

#### Alignment
- [ ] عناصر به طور افقی align شده‌اند
- [ ] عناصر به طور عمودی align شده‌اند
- [ ] Text alignment صحیح است (left/right/center)
- [ ] Icons با text align هستند

**Issues:**
```
[مثال: Title کارت market data با button align نیست]
```

#### Overflow & Scrollbars
- [ ] هیچ horizontal scrollbar ناخواسته وجود ندارد
- [ ] Text از container بیرون نزده (clipped/truncated نیست)
- [ ] Images در container جا می‌شوند
- [ ] Buttons/Controls کامل visible هستند (hidden نیستند)

**Issues:**
```
[مثال: جدول قیمت‌ها horizontal overflow دارد]
```

#### Styling Consistency
- [ ] Font family در تمام صفحه consistent است
- [ ] Font sizes منطقی و readable هستند
- [ ] Colors با design system مطابقت دارند
- [ ] Shadows/borders consistent هستند
- [ ] Button styles یکسان هستند

**Issues:**
```
[مثال: برخی buttons با shadow هستند، برخی بدون shadow]
```

**Status:** ☐ Pass ☐ Warning ☐ Fail
**Screenshot (if issues):** ___________________

---

### 3️⃣ Responsiveness & Breakpoints

Test در viewport‌های مختلف:

#### Desktop (1920x1080)
- [ ] Layout صحیح render می‌شود
- [ ] تمام content visible است
- [ ] Sidebar/Menu نمایش داده می‌شود
- [ ] هیچ overflow نیست

**Issues:**
```
```

#### Laptop (1366x768)
- [ ] Layout adjust می‌شود
- [ ] Content قابل مشاهده است
- [ ] Scrolling عمودی (اگر لازم) کار می‌کند
- [ ] هیچ horizontal scroll نیست

**Issues:**
```
```

#### Tablet (768x1024)
- [ ] Layout responsive است
- [ ] Sidebar collapse می‌شود (اگر طراحی شده)
- [ ] Touch-friendly buttons/controls
- [ ] Text readable است

**Issues:**
```
```

#### Mobile (375x667)
- [ ] Layout mobile-friendly است
- [ ] Hamburger menu کار می‌کند
- [ ] Text readable است (نه خیلی کوچک)
- [ ] Buttons tappable هستند (حداقل 44x44px)
- [ ] هیچ horizontal overflow نیست
- [ ] Zoom نیاز نیست

**Issues:**
```
```

**Status:** ☐ Pass ☐ Warning ☐ Fail
**Screenshots:**
- Desktop: ___________________
- Tablet: ___________________
- Mobile: ___________________

---

### 4️⃣ Interactive Testing & Event Handling

تعداد کل interactive elements: _______

#### Buttons
تعداد buttons: _______

Test sample buttons (حداقل 5 تا یا همه):

| Button Label | Click Works | Visual Feedback | Expected Action | Actual Result | Status |
|--------------|-------------|-----------------|-----------------|---------------|--------|
| Example: "Buy" | ☐ Yes ☐ No | ☐ Yes ☐ No | Open modal | [Actual] | ☐ Pass ☐ Fail |
| | ☐ Yes ☐ No | ☐ Yes ☐ No | | | ☐ Pass ☐ Fail |
| | ☐ Yes ☐ No | ☐ Yes ☐ No | | | ☐ Pass ☐ Fail |
| | ☐ Yes ☐ No | ☐ Yes ☐ No | | | ☐ Pass ☐ Fail |
| | ☐ Yes ☐ No | ☐ Yes ☐ No | | | ☐ Pass ☐ Fail |

#### Links
تعداد links: _______

- [ ] تمام links کار می‌کنند
- [ ] Hover state نمایش داده می‌شود
- [ ] Link destination صحیح است

**Issues:**
```
```

#### Forms & Inputs
تعداد inputs: _______

- [ ] Input fields focus می‌گیرند
- [ ] Typing کار می‌کند
- [ ] Validation (اگر وجود دارد) کار می‌کند
- [ ] Error messages نمایش داده می‌شوند
- [ ] Submit button کار می‌کند

**Test Example:**
```
Field: [name]
Input: [test value]
Validation: ☐ Pass ☐ Fail
Error Message (if any): [...]
```

#### Dropdowns/Selects
- [ ] Dropdown باز می‌شود
- [ ] Options visible هستند
- [ ] Selection کار می‌کند
- [ ] Selected value نمایش داده می‌شود

#### Toggles/Switches
- [ ] Toggle state change می‌کند
- [ ] Visual feedback (animation) کار می‌کند
- [ ] State persist می‌شود (اگر طراحی شده)

#### Modals/Popups
- [ ] Modal باز می‌شود
- [ ] Content کامل visible است
- [ ] Overlay/backdrop کار می‌کند
- [ ] Close button کار می‌کند
- [ ] ESC key برای بستن کار می‌کند
- [ ] Background scroll disabled است (اگر طراحی شده)

#### Tabs
- [ ] Tab switching کار می‌کند
- [ ] Active tab highlight می‌شود
- [ ] Content به درستی نمایش داده می‌شود

**Status:** ☐ Pass ☐ Warning ☐ Fail
**Issues:**
```
```

---

### 5️⃣ Data Loading / Empty & Error States

#### Data Loading
- [ ] Loading spinner/skeleton نمایش داده می‌شود
- [ ] Data بعد از load صحیح render می‌شود
- [ ] هیچ blank screen یا infinite loading نیست

**Loading time:** _______ seconds

#### Empty State
- [ ] "No data" message نمایش داده می‌شود
- [ ] Placeholder/illustration موجود است
- [ ] CTA (Call to Action) button/link وجود دارد

**Screenshot:** ___________________

#### Error State
- [ ] Error message واضح و readable است
- [ ] Retry button/link موجود است
- [ ] Error details (اگر مناسب) نمایش داده می‌شوند

**Screenshot:** ___________________

**Status:** ☐ Pass ☐ Warning ☐ Fail

---

### 6️⃣ Cross-View / Flow Testing

#### Navigation Flow
Test این flow:
1. صفحه فعلی: [___]
2. Navigate to: [___] → ☐ Success ☐ Fail
3. Navigate back: [___] → ☐ Success ☐ Fail
4. Navigate to: [___] → ☐ Success ☐ Fail

- [ ] Sidebar active item highlight می‌شود
- [ ] URL routing صحیح است
- [ ] Browser back/forward کار می‌کند
- [ ] Deep linking کار می‌کند (reload page)

**Issues:**
```
```

#### State Persistence
- [ ] Form data persist می‌شود (اگر طراحی شده)
- [ ] Settings persist می‌شوند
- [ ] Authentication state صحیح است

**Status:** ☐ Pass ☐ Warning ☐ Fail

---

### 7️⃣ Accessibility & Usability

#### Keyboard Navigation
- [ ] Tab order منطقی است
- [ ] تمام interactive elements قابل دسترسی با keyboard هستند
- [ ] Focus indicator visible است
- [ ] Enter/Space برای activate کار می‌کند
- [ ] ESC برای close modals کار می‌کند

#### Visual Accessibility
- [ ] Text contrast کافی است (WCAG AA: 4.5:1)
- [ ] Font size readable است (حداقل 14px برای body text)
- [ ] Color نتنها راه برای convey information نیست
- [ ] Focus states clearly visible هستند

#### Touch/Click Targets
- [ ] Buttons حداقل 44x44px هستند (mobile)
- [ ] فاصله کافی بین clickable elements
- [ ] Clickable area واضح است

**Status:** ☐ Pass ☐ Warning ☐ Fail
**Issues:**
```
```

---

### 8️⃣ Browser Console

بررسی Browser DevTools Console:

#### Errors
تعداد errors: _______

- [ ] هیچ JavaScript error نیست
- [ ] هیچ Network error نیست (404, 500, etc.)
- [ ] هیچ CORS error نیست

**Error Details:**
```
[Copy/paste errors here]
```

#### Warnings
تعداد warnings: _______

- [ ] Warnings critical نیستند

**Warning Details:**
```
[Copy/paste warnings here]
```

**Status:** ☐ Pass ☐ Warning ☐ Fail

---

## 📊 Page Summary

**Page Name:** ___________________

**Overall Status:** ☐ PASS ☐ WARNING ☐ FAIL

**Severity Ratings:**

| Category | Status | Severity | Priority |
|----------|--------|----------|----------|
| Load & Navigation | ☐ Pass ☐ Warn ☐ Fail | ☐ Critical ☐ Major ☐ Minor | ☐ High ☐ Medium ☐ Low |
| Visual Layout | ☐ Pass ☐ Warn ☐ Fail | ☐ Critical ☐ Major ☐ Minor | ☐ High ☐ Medium ☐ Low |
| Responsiveness | ☐ Pass ☐ Warn ☐ Fail | ☐ Critical ☐ Major ☐ Minor | ☐ High ☐ Medium ☐ Low |
| Interactions | ☐ Pass ☐ Warn ☐ Fail | ☐ Critical ☐ Major ☐ Minor | ☐ High ☐ Medium ☐ Low |
| Data Loading | ☐ Pass ☐ Warn ☐ Fail | ☐ Critical ☐ Major ☐ Minor | ☐ High ☐ Medium ☐ Low |
| Navigation Flow | ☐ Pass ☐ Warn ☐ Fail | ☐ Critical ☐ Major ☐ Minor | ☐ High ☐ Medium ☐ Low |
| Accessibility | ☐ Pass ☐ Warn ☐ Fail | ☐ Critical ☐ Major ☐ Minor | ☐ High ☐ Medium ☐ Low |
| Console | ☐ Pass ☐ Warn ☐ Fail | ☐ Critical ☐ Major ☐ Minor | ☐ High ☐ Medium ☐ Low |

**Critical Issues (must fix before release):**
```
1.
2.
3.
```

**Major Issues (should fix before release):**
```
1.
2.
3.
```

**Minor Issues (can fix later):**
```
1.
2.
3.
```

**Recommendations:**
```
[بهبودهای پیشنهادی]
```

**Screenshots/Evidence:**
- Screenshot 1: [path]
- Screenshot 2: [path]
- Video recording: [path]

---

## 🎯 Final Verdict

**Can this page be released to production?**

☐ **YES** - No blocking issues
☐ **YES, with caveats** - Minor issues only
☐ **NO** - Critical/Major issues must be fixed first

**Reviewer Signature:** ___________________

**Date:** ___________________

---

## 📌 Notes

```
[Additional notes, observations, or feedback]
```
