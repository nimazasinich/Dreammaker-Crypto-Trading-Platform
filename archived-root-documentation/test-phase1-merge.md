# Phase 1 Testing Guide

## Quick Test Commands

### 1. Start the Application
```bash
npm run dev
```

### 2. Test URLs in Browser

#### Direct Tab Access
```
http://localhost:5173/trading-hub?tab=positions
http://localhost:5173/trading-hub?tab=portfolio
http://localhost:5173/trading-hub?tab=futures
http://localhost:5173/trading-hub?tab=technical
http://localhost:5173/trading-hub?tab=risk
```

#### Legacy Route Redirects
```
http://localhost:5173/positions  → Should redirect to trading-hub?tab=positions
http://localhost:5173/portfolio  → Should redirect to trading-hub?tab=portfolio
```

### 3. Manual Testing Checklist

#### Navigation Tests
- [ ] Click "Trading Hub" in sidebar
- [ ] Click each tab (Futures, Technical, Risk, Positions, Portfolio)
- [ ] Verify URL updates when switching tabs
- [ ] Press browser back button - should switch to previous tab
- [ ] Press browser forward button - should switch to next tab
- [ ] Bookmark a tab URL and reopen - should open correct tab

#### Keyboard Shortcuts
- [ ] Press Cmd/Ctrl + 1 → Futures tab
- [ ] Press Cmd/Ctrl + 2 → Technical Analysis tab
- [ ] Press Cmd/Ctrl + 3 → Risk Management tab
- [ ] Press Cmd/Ctrl + 4 → Positions tab
- [ ] Press Cmd/Ctrl + 5 → Portfolio tab

#### Data Integrity - Positions Tab
- [ ] Open positions display correctly
- [ ] Real-time price updates work
- [ ] PnL calculations are accurate
- [ ] "Close" button works
- [ ] "Reduce" button works
- [ ] "Reverse" button works
- [ ] Orders tab shows pending orders
- [ ] "Cancel Order" button works

#### Data Integrity - Portfolio Tab
- [ ] Holdings summary displays
- [ ] Open positions table shows data
- [ ] Risk Center displays metrics
- [ ] Real-time updates work
- [ ] "Close Position" button works

#### WebSocket Behavior
1. Open browser DevTools → Network tab → WS filter
2. Navigate to Positions tab
3. Verify WebSocket connection established
4. Switch to Portfolio tab
5. Verify old connection cleaned up (if separate)
6. Switch back to Positions
7. Verify no duplicate connections
8. Repeat 5-10 times
9. Check memory usage (should be stable)

#### Performance Tests
- [ ] Tab switching is smooth (< 100ms)
- [ ] No layout shifts when switching
- [ ] No console errors
- [ ] No memory leaks (check DevTools Memory tab)
- [ ] Real-time updates don't lag

### 4. Browser Compatibility
Test in:
- [ ] Chrome/Edge
- [ ] Firefox
- [ ] Safari
- [ ] Mobile Chrome
- [ ] Mobile Safari

### 5. Expected Results

#### ✅ Success Criteria
- All tabs load without errors
- URL updates correctly on tab switch
- Browser back/forward works
- Legacy routes redirect properly
- Real-time data updates in each tab
- No duplicate WebSocket connections
- No memory leaks after 10+ tab switches
- All actions (close, reduce, reverse) work
- Keyboard shortcuts work

#### ❌ Failure Indicators
- Console errors
- Broken redirects
- Missing data
- Duplicate WebSocket connections
- Memory leaks
- Slow tab switching (> 500ms)
- Layout shifts
- Non-functional buttons

### 6. Debug Commands

#### Check for errors
```bash
# In browser console
console.log('Active tab:', new URLSearchParams(window.location.search).get('tab'));
```

#### Monitor WebSocket connections
```javascript
// In browser console
const wsConnections = performance.getEntriesByType('resource')
  .filter(r => r.name.includes('ws://') || r.name.includes('wss://'));
console.log('WebSocket connections:', wsConnections.length);
```

#### Check memory usage
```javascript
// In browser console (Chrome)
performance.memory.usedJSHeapSize / 1048576 + ' MB'
```

### 7. Automated Test (Optional)

Create `tests/phase1-merge.spec.ts`:
```typescript
import { test, expect } from '@playwright/test';

test.describe('Phase 1: Trading Hub Merge', () => {
  test('should redirect /positions to trading-hub', async ({ page }) => {
    await page.goto('/positions');
    await expect(page).toHaveURL(/trading-hub\?tab=positions/);
  });

  test('should redirect /portfolio to trading-hub', async ({ page }) => {
    await page.goto('/portfolio');
    await expect(page).toHaveURL(/trading-hub\?tab=portfolio/);
  });

  test('should switch tabs via URL', async ({ page }) => {
    await page.goto('/trading-hub?tab=positions');
    await expect(page.locator('[aria-selected="true"]')).toContainText('Positions');
    
    await page.goto('/trading-hub?tab=portfolio');
    await expect(page.locator('[aria-selected="true"]')).toContainText('Portfolio');
  });

  test('should update URL on tab click', async ({ page }) => {
    await page.goto('/trading-hub');
    await page.click('text=Positions');
    await expect(page).toHaveURL(/tab=positions/);
  });
});
```

Run with:
```bash
npx playwright test tests/phase1-merge.spec.ts
```

---

## Quick Smoke Test (30 seconds)

1. Open app
2. Click "Trading Hub" in sidebar
3. Click "Positions" tab → Should show positions
4. Click "Portfolio" tab → Should show portfolio
5. Press browser back → Should go to Positions
6. Type `/positions` in URL → Should redirect to Trading Hub
7. ✅ If all work, Phase 1 is successful!

---

**Status:** Ready for testing
**Estimated Time:** 10-15 minutes for full test
**Priority:** High - Core navigation feature
