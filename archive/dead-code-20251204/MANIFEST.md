# Dead Code Archive - December 4, 2025

**Archive Date**: December 4, 2025  
**Archive Reason**: Dead code cleanup - imported but never routed/used  
**Created By**: AI Code Optimization Analysis

---

## 📦 Archived Files

### TradingView.tsx (536 lines)

- **Original Path**: `src/views/TradingView.tsx`
- **Lines of Code**: 536
- **Reason**: Imported in App.tsx (line 43) but NEVER used in routing switch statement
- **Evidence**: 
  - Route `'trading'` uses `UnifiedTradingView`, not `TradingView`
  - No other component imports this file
  - Not referenced in any test files
- **Alternative**: `UnifiedTradingView.tsx` (43 lines) which wraps `FuturesTradingView.tsx` (841 lines)

---

## 🔄 Restoration Instructions

If you need to restore this file:

### Option 1: From Archive
```powershell
Copy-Item "archive\dead-code-20251204\TradingView.tsx" "src\views\"
```

### Option 2: From Git History
```bash
git checkout HEAD~1 -- src/views/TradingView.tsx
```

### Option 3: Restore Import in App.tsx
Add this line after line 42 in App.tsx:
```typescript
const TradingView = lazyLoad(() => import('./views/TradingView'), 'TradingView');
```

---

## 📊 Analysis Summary

| Metric | Value |
|--------|-------|
| **File** | TradingView.tsx |
| **Size** | 536 lines |
| **Score** | 30/100 (Dead Code) |
| **Import Location** | App.tsx:43 |
| **Route Used** | None (UnifiedTradingView used instead) |
| **Dependencies** | None found |
| **Test References** | None found |

---

## 📚 Related Documentation

- **Analysis Report**: `DEEP_CODEBASE_OPTIMIZATION_REPORT.md`
- **Previous Cleanup**: `archive/legacy-ui-20251204/ARCHIVE_MANIFEST.md`

---

*This archive preserves code for historical reference and emergency restoration.*

