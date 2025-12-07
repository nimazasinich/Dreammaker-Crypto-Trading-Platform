# 📊 PHASE SEQUENCE - EXECUTION ORDER

## ⚠️ CRITICAL: READ THIS BEFORE STARTING

This file defines the **strict execution order** for all 4 phases. You MUST follow this sequence.

---

## 🔢 PHASE EXECUTION ORDER

```
Phase 1 (CRITICAL) 
    ↓
    MUST BE 100% COMPLETE
    ↓
Phase 2 (HIGH)
    ↓
    MUST BE 100% COMPLETE
    ↓
Phase 3 (MEDIUM)
    ↓
    MUST BE 100% COMPLETE
    ↓
Phase 4 (MEDIUM)
    ↓
    PROJECT COMPLETE
```

---

## 📋 PHASE 1: UNIFIED TRADING HUB

**Priority:** 🔴 CRITICAL (Start here!)  
**Time Estimate:** 2-3 weeks  
**Impact:** Merge 6 pages → 1 page (83% reduction)

### What Gets Merged:
- TradingViewDashboard.tsx
- EnhancedTradingView.tsx
- FuturesTradingView.tsx
- TradingHubView.tsx
- PositionsView.tsx
- PortfolioPage.tsx

### What You Create:
- `src/views/trading-hub/UnifiedTradingHubView.tsx` (main component)
- `src/views/trading-hub/tabs/ChartsTab.tsx`
- `src/views/trading-hub/tabs/SpotTab.tsx`
- `src/views/trading-hub/tabs/FuturesTab.tsx`
- `src/views/trading-hub/tabs/PositionsTab.tsx`
- `src/views/trading-hub/tabs/PortfolioTab.tsx`

### Success Criteria:
- ✅ All 5 tabs functional
- ✅ WebSocket connection shared (not duplicated)
- ✅ Page load time < 2 seconds
- ✅ Old routes redirect to new unified page
- ✅ Navigation menu updated
- ✅ Deep linking works (/trading?tab=futures)
- ✅ Keyboard shortcuts work (Cmd/Ctrl + 1-5)

### After Completion:
**STOP** and report: "Phase 1 complete. Ready for Phase 2?"  
**WAIT** for user confirmation before proceeding.

---

## 📋 PHASE 2: UNIFIED AI LAB

**Priority:** 🟡 HIGH (Do second)  
**Time Estimate:** 1-2 weeks  
**Impact:** Merge 3 pages → 1 page (67% reduction)

**⚠️ DO NOT START until Phase 1 is confirmed complete by user**

### What Gets Merged:
- TrainingView.tsx
- EnhancedStrategyLabView.tsx
- ScannerView.tsx

### What You Create:
- `src/views/ai-lab/UnifiedAILabView.tsx` (main component)
- `src/views/ai-lab/tabs/ScannerTab.tsx`
- `src/views/ai-lab/tabs/TrainingTab.tsx`
- `src/views/ai-lab/tabs/BacktestTab.tsx`
- `src/views/ai-lab/tabs/BuilderTab.tsx`
- `src/views/ai-lab/tabs/InsightsTab.tsx`

### Success Criteria:
- ✅ All 5 tabs functional
- ✅ AI/ML workflow seamless (Scanner → Training → Backtest)
- ✅ Scanner integration works
- ✅ Old routes redirect correctly
- ✅ Navigation menu updated

### After Completion:
**STOP** and report: "Phase 2 complete. Ready for Phase 3?"  
**WAIT** for user confirmation before proceeding.

---

## 📋 PHASE 3: UNIFIED ADMIN HUB

**Priority:** 🟢 MEDIUM (Do third)  
**Time Estimate:** 1 week  
**Impact:** Merge 2 pages → 1 page (50% reduction)

**⚠️ DO NOT START until Phase 2 is confirmed complete by user**

### What Gets Merged:
- HealthView.tsx
- MonitoringView.tsx

### What You Create:
- `src/views/admin/UnifiedAdminView.tsx` (main component)
- `src/views/admin/tabs/HealthTab.tsx`
- `src/views/admin/tabs/MonitoringTab.tsx`
- `src/views/admin/tabs/DiagnosticsTab.tsx`

### Success Criteria:
- ✅ All 3 tabs functional
- ✅ All admin functionality accessible
- ✅ No features lost
- ✅ Old routes redirect correctly
- ✅ Access control working (admin only)

### After Completion:
**STOP** and report: "Phase 3 complete. Ready for Phase 4?"  
**WAIT** for user confirmation before proceeding.

---

## 📋 PHASE 4: DASHBOARD CLEANUP

**Priority:** 🟢 MEDIUM (Do last)  
**Time Estimate:** 3-5 days  
**Impact:** Remove duplication, focus on portfolio

**⚠️ DO NOT START until Phase 3 is confirmed complete by user**

### What Gets Modified:
- EnhancedDashboardView.tsx (modify, don't create new)

### What You Do:
- Remove market data display from Dashboard
- Remove Modern Symbol Ribbon
- Remove real-time price charts
- Remove BTC/ETH/SOL price displays
- Keep only: Portfolio summary, PnL, Active positions, Top signals, Health status
- Add clear link to Market Analysis Hub

### Success Criteria:
- ✅ Dashboard shows portfolio ONLY
- ✅ No market data on Dashboard
- ✅ Clear links to Market Analysis Hub
- ✅ Quick action buttons work

### After Completion:
**STOP** and report: "Phase 4 complete. All phases finished!"  
Ask user: "Ready for final testing and old file cleanup?"

---

## 🎯 CHECKPOINT PROTOCOL

After EACH phase, you MUST:

1. **Report completion** using this format:
```
✅ PHASE [N] COMPLETED

Created files:
- [list all new files]

Modified files:
- [list all modified files]

Tests passed:
- [list success criteria met]

Next phase: Phase [N+1] - [Name]
```

2. **Ask for permission:**
```
Ready to proceed with Phase [N+1]?
Please confirm before I continue.
```

3. **WAIT** - Do not proceed until user responds "yes" or "proceed" or similar confirmation

---

## ⚠️ ABSOLUTE RULES

### RULE #1: SEQUENTIAL EXECUTION
You CANNOT skip phases. You CANNOT work on multiple phases simultaneously.
The order is: 1 → 2 → 3 → 4. No exceptions.

### RULE #2: CHECKPOINT REQUIREMENT
After EACH phase completion, you MUST stop and ask for confirmation.
Do NOT assume you should continue automatically.

### RULE #3: NO DELETION
Do NOT delete old files during implementation.
Old files stay until user explicitly requests cleanup after ALL phases are done.

### RULE #4: TEST BEFORE MOVING
Each phase must pass its success criteria before moving to the next.
If tests fail, fix issues before proceeding.

---

**NOW GO READ `IMPLEMENTATION-DETAILS.md` →**
