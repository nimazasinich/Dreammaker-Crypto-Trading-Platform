# 📝 IMPLEMENTATION DETAILS - STEP-BY-STEP GUIDE

## 📚 REFERENCE DOCUMENT

All detailed instructions are in: **`ALL_IN_ONE_PROMPT_FA.md`**

This file is your complete implementation guide containing:
- Detailed step-by-step instructions for all 4 phases
- Complete code examples and templates
- Testing procedures
- Success criteria
- Troubleshooting guides

**Location:** Same directory as these instruction files or in your documents folder

---

## 🎯 HOW TO USE THIS FILE

This file serves as your **quick reference** and **execution checklist**. For detailed instructions on each step, refer to `ALL_IN_ONE_PROMPT_FA.md`.

---

## 📋 PHASE 1: UNIFIED TRADING HUB - QUICK REFERENCE

### Templates Location
```
component_templates/unifiedtradinghub/
├── UnifiedTradingHubView.tsx
└── tabs/
    ├── ChartsTab.tsx
    ├── SpotTab.tsx
    ├── FuturesTab.tsx
    ├── PositionsTab.tsx
    └── PortfolioTab.tsx
```

### Target Location
```
src/views/trading-hub/
├── UnifiedTradingHubView.tsx
└── tabs/
    ├── ChartsTab.tsx
    ├── SpotTab.tsx
    ├── FuturesTab.tsx
    ├── PositionsTab.tsx
    └── PortfolioTab.tsx
```

### Execution Steps Summary

**Step 1: Copy Templates**
**Step 2: Implement Main Component**
**Step 3: Implement Each Tab** (FuturesTab, SpotTab, ChartsTab, PositionsTab, PortfolioTab)
**Step 4: Add Route Redirects**
**Step 5: Update Navigation Menu**
**Step 6: Performance Optimization**
**Step 7: Complete Testing**

For detailed instructions on each step, refer to `ALL_IN_ONE_PROMPT_FA.md` → Phase 1 (فاز 1)

### Success Checklist Phase 1
- [ ] All 5 tabs created and functional
- [ ] WebSocket connection shared (single connection)
- [ ] Page load time < 2 seconds
- [ ] 6 route redirects working
- [ ] Navigation menu updated
- [ ] Deep linking works (/trading?tab=futures)
- [ ] Keyboard shortcuts work (Cmd/Ctrl + 1-5)
- [ ] No console errors
- [ ] All tests passing

---

## 📋 PHASE 2: UNIFIED AI LAB - QUICK REFERENCE

### Templates Location
```
component_templates/unifiedailab/
├── UnifiedAILabView.tsx
└── tabs/ (5 tabs)
```

### Target Location
```
src/views/ai-lab/
├── UnifiedAILabView.tsx
└── tabs/ (5 tabs)
```

For detailed instructions, refer to `ALL_IN_ONE_PROMPT_FA.md` → Phase 2 (فاز 2)

---

## 📋 PHASE 3: UNIFIED ADMIN HUB - QUICK REFERENCE

### Templates Location
```
component_templates/unifiedadmin/
├── UnifiedAdminView.tsx
└── tabs/ (3 tabs)
```

### Target Location
```
src/views/admin/
├── UnifiedAdminView.tsx
└── tabs/ (3 tabs)
```

For detailed instructions, refer to `ALL_IN_ONE_PROMPT_FA.md` → Phase 3 (فاز 3)

---

## 📋 PHASE 4: DASHBOARD CLEANUP - QUICK REFERENCE

### Target File
```
src/views/EnhancedDashboardView.tsx (modify existing)
```

For detailed instructions, refer to `ALL_IN_ONE_PROMPT_FA.md` → Phase 4 (فاز 4)

---

## 📖 REMEMBER

For **detailed** instructions on each step, always refer back to:

### **`ALL_IN_ONE_PROMPT_FA.md`**

This reference document (IMPLEMENTATION-DETAILS.md) is just a quick navigation guide.

---

## 🎬 NEXT ACTION

Now that you've read all three files, go back to MASTER-GUIDE.md and report:

**"I have read and understood all instruction files. Ready to begin Phase 1. Awaiting user confirmation."**
