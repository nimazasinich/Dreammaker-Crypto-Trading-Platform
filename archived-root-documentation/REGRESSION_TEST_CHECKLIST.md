# ✅ Regression Test Checklist
## Dreammaker Crypto Signal & Trader Platform

Use this checklist for manual testing before each release.

---

## 🔧 Setup & Build

- [ ] Clean install: `npm ci`
- [ ] Backend starts without errors: `npm run dev:server`
- [ ] Frontend starts without errors: `npm run dev:client`
- [ ] No critical console errors or warnings
- [ ] Environment variables loaded correctly

---

## 🌐 Frontend Tests

### Page Load & Navigation
- [ ] Main page loads at `http://localhost:5173/`
- [ ] All static assets load (no 404 errors in Network tab)
- [ ] No JavaScript errors in browser console
- [ ] Navigate to Dashboard view
- [ ] Navigate to Charting view
- [ ] Navigate to Market view
- [ ] Navigate to Scanner view
- [ ] Navigate to Training view
- [ ] Navigate to Risk view
- [ ] Navigate to Settings view
- [ ] All routes load without errors

### UI Components
- [ ] Sidebar navigation works
- [ ] Theme toggle (dark/light mode) works
- [ ] All buttons are clickable and responsive
- [ ] All forms accept input
- [ ] Dropdowns open and close properly
- [ ] Modals/popups open and close
- [ ] Loading spinners appear during data fetch
- [ ] Error messages display properly
- [ ] Toast notifications work

### Forms & Input Validation
- [ ] Test form with valid data - submits successfully
- [ ] Test form with invalid data - shows validation error
- [ ] Test form with empty required fields - blocks submission
- [ ] Test API key input fields (Exchange Settings)
- [ ] Test numeric inputs (Risk Settings)
- [ ] Test text inputs (Symbol selection)

### Responsive Design
- [ ] Test on desktop (1920x1080)
- [ ] Test on laptop (1366x768)
- [ ] Test on tablet (768x1024)
- [ ] Test on mobile (375x667)
- [ ] No horizontal scroll on small screens
- [ ] Text remains readable at all sizes
- [ ] Buttons remain clickable at all sizes

---

## 🔌 Backend API Tests

### Health & Status
- [ ] GET `/api/health` returns 200 OK (or documented status)
- [ ] GET `/api/system/status` returns 200 OK with system info
- [ ] Response is valid JSON (not HTML)

### Market Data
- [ ] GET `/api/market-data/BTCUSDT` returns 200 OK
- [ ] Response contains valid market data
- [ ] GET `/api/market-data/ETHUSD` returns 200 OK
- [ ] Invalid symbol returns appropriate error (not 200)

### Signals & Analysis
- [ ] GET `/api/signals` returns 200 OK
- [ ] Signals array is valid (check structure)
- [ ] GET `/api/signals?symbol=BTCUSDT` filters correctly

### Error Handling
- [ ] GET `/api/nonexistent-endpoint` returns 404 + JSON error
- [ ] POST to GET-only endpoint returns 405 + JSON error
- [ ] Malformed JSON request returns 400 + JSON error
- [ ] Request with missing required params returns 400 + JSON error
- [ ] Large payload (>10MB) returns 413 or handles gracefully

### Security Headers
- [ ] Check response headers include:
  - `X-Content-Type-Options: nosniff`
  - `X-Frame-Options: SAMEORIGIN`
  - `Content-Security-Policy` (if enabled)
- [ ] CORS headers present for allowed origins
- [ ] No sensitive info in error responses

---

## 🔒 Security Tests

### Authentication & Authorization
- [ ] Unauthenticated requests blocked (if auth implemented)
- [ ] Invalid tokens rejected
- [ ] Session timeout works correctly
- [ ] Password fields masked in UI
- [ ] API keys not logged in console

### Data Protection
- [ ] No API keys visible in browser DevTools
- [ ] No secrets in localStorage (check Application tab)
- [ ] No sensitive data in URL query params
- [ ] HTTPS enforced in production

### Input Validation
- [ ] SQL injection attempt fails (e.g., `symbol='; DROP TABLE--`)
- [ ] XSS attempt fails (e.g., `<script>alert('XSS')</script>`)
- [ ] Command injection blocked
- [ ] File upload validation (if applicable)

---

## 🧪 Edge Cases

### Data Scenarios
- [ ] Empty data response displays properly
- [ ] Very large dataset (1000+ items) renders without crashing
- [ ] Special characters in input handled correctly
- [ ] Unicode characters handled correctly
- [ ] Null/undefined values don't crash UI

### Network Scenarios
- [ ] Slow network (throttle to 3G) - app remains responsive
- [ ] Network failure - error message displayed
- [ ] API timeout - timeout error shown
- [ ] Concurrent requests don't cause race conditions

### Browser Scenarios
- [ ] Works in Chrome (latest)
- [ ] Works in Firefox (latest)
- [ ] Works in Safari (latest)
- [ ] Works in Edge (latest)
- [ ] Works with JavaScript disabled (graceful degradation)
- [ ] Works with cookies disabled (if not required)

---

## ⚡ Performance Tests

### Load Time
- [ ] Initial page load < 3 seconds
- [ ] Time to Interactive (TTI) < 5 seconds
- [ ] First Contentful Paint (FCP) < 1.5 seconds
- [ ] No blocking resources > 100ms

### Runtime Performance
- [ ] Smooth scrolling (60 FPS)
- [ ] Chart rendering < 1 second
- [ ] No memory leaks (check DevTools Memory tab)
- [ ] CPU usage remains reasonable during heavy operations

---

## 🔄 WebSocket Tests

- [ ] WebSocket connects successfully
- [ ] Real-time data updates appear in UI
- [ ] Reconnects after connection drop
- [ ] Heartbeat keeps connection alive
- [ ] Multiple tabs don't conflict
- [ ] Close connection cleanly on page unload

---

## 📊 Data Integrity

- [ ] Market prices match external sources
- [ ] Calculations are correct (e.g., percentage changes)
- [ ] Historical data consistent
- [ ] Time zones handled correctly
- [ ] Date formatting consistent

---

## 🐛 Regression Bugs (Track Fixed Issues)

### Known Fixed Issues
- [ ] Issue #1: [Description] - **Status:** FIXED / REOPENED
- [ ] Issue #2: [Description] - **Status:** FIXED / REOPENED
- [ ] Issue #3: [Description] - **Status:** FIXED / REOPENED

### New Issues Found
- [ ] New Issue #1: [Description]
- [ ] New Issue #2: [Description]

---

## 📝 Test Execution Log

| Date | Tester | Version | Pass/Fail | Critical Issues | Notes |
|------|--------|---------|-----------|-----------------|-------|
| 2025-12-03 | Claude | 1.0.0 | FAIL | 8 | See QA_TEST_REPORT.md |
|  |  |  |  |  |  |

---

## ✅ Sign-off

- [ ] All tests passed
- [ ] All critical issues resolved
- [ ] All security issues resolved
- [ ] Performance acceptable
- [ ] Ready for production deployment

**Tester Name:** ___________________
**Date:** ___________________
**Signature:** ___________________

---

**End of Checklist**
