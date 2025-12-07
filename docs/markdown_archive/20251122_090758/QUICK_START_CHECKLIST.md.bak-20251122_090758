# Quick Start - Production Checklist

## 🎯 What You Have Now

### 1. Machine-Readable Checklist
📄 **`docs/production_checklist.v1.json`** (7.3 KB)
- Complete task breakdown with IDs, status, priorities
- Summary statistics
- Ready for automation

### 2. GitHub Issue Templates (5 templates)
📁 **`.github/ISSUE_TEMPLATE/`**
- Pre-formatted issues for each task
- Auto-labeled by priority
- Copy-paste ready checklists

### 3. Documentation
📖 **`docs/CHECKLIST_USAGE.md`** (6.6 KB) - Full usage guide  
📋 **`CHECKLIST_EXPORT_SUMMARY.md`** (11 KB) - Complete overview

---

## ⚡ Quick Actions

### Create All GitHub Issues (Recommended First Step)

```bash
# Option 1: Via GitHub CLI (batch create)
cd /workspace
for template in .github/ISSUE_TEMPLATE/[0-9]*.md; do
  gh issue create --template "$(basename "$template")"
done
```

```bash
# Option 2: Via GitHub Web UI
# Go to: https://github.com/YOUR_USERNAME/YOUR_REPO/issues/new/choose
# Select each template and create issue
```

### Check Current Status

```bash
# Quick visual status (recommended)
bash scripts/checklist-status.sh

# Or view raw JSON summary
jq '.summary' docs/production_checklist.v1.json

# Output:
# {
#   "critical": { "total": 3, "completed": 3, ... },
#   "high": { "total": 3, "completed": 1, ... },
#   "medium": { "total": 3, "completed": 0, ... }
# }
```

### Find Next Task

```bash
# Get next high-priority task
jq -r '.sections[] 
  | select(.priority == "high" and .status != "completed") 
  | .items[] 
  | select(.status == "todo") 
  | .text' \
  docs/production_checklist.v1.json | head -1
```

### Mark Task Complete

```javascript
// Example: scripts/mark-done.js
const fs = require('fs');
const checklist = require('./docs/production_checklist.v1.json');

// Find and update task
const section = checklist.sections.find(s => s.id === 'hf-adapter-scope');
const task = section.items.find(i => i.id === 'hf-inline-doc-links');
task.status = 'done';

// Save
fs.writeFileSync('docs/production_checklist.v1.json', 
  JSON.stringify(checklist, null, 2));
```

---

## 📊 Current Status Overview

| Priority | Completed | In Progress | Not Started | Total |
|----------|-----------|-------------|-------------|-------|
| 🔴 Critical | 3 | 0 | 0 | 3 |
| 🟠 High | 1 | 2 | 0 | 3 |
| 🟡 Medium | 0 | 0 | 3 | 3 |

### ✅ Completed (4 sections)
1. ✅ SPOT Trading Decision (CRITICAL)
2. ✅ Route Surface Stabilization (CRITICAL)
3. ✅ Data Policy Lock for Real Trading (CRITICAL)
4. ✅ Data Flow Documentation (HIGH)

### 🔄 In Progress (2 sections)
5. 🔄 **HF Adapter Scope Clarification** (HIGH) - 2/3 tasks done
   - [ ] Add inline references in adapter files
   - [ ] Verify local implementations documented

6. 🔄 **Auto-Refresh with User Control** (HIGH) - 0/3 tasks
   - [ ] Re-enable refresh in contexts
   - [ ] Add settings UI
   - [ ] Ensure WS-first behavior

### ⏳ Not Started (3 sections)
7. ⏳ URL-Based Navigation (MEDIUM)
8. ⏳ Minimum Test Skeleton (MEDIUM)
9. ⏳ Exchange Selector Cleanup (MEDIUM)

---

## 🎫 GitHub Issue Templates

| # | Template | Priority | Status |
|---|----------|----------|--------|
| 1 | `01-hf-adapter-scope.md` | HIGH | 🔄 In Progress |
| 2 | `02-auto-refresh-user-control.md` | HIGH | ⏳ Todo |
| 3 | `03-hash-based-navigation.md` | MEDIUM | ⏳ Todo |
| 4 | `04-minimal-tests.md` | MEDIUM | ⏳ Todo |
| 5 | `05-exchange-selector-cleanup.md` | MEDIUM | ⏳ Todo |

---

## 🔧 Common Tasks

### Validate Critical Tasks (CI/CD Gate)
```bash
#!/bin/bash
INCOMPLETE=$(jq -r '.sections[] 
  | select(.priority == "critical" and .status != "completed") 
  | .id' docs/production_checklist.v1.json)

if [ ! -z "$INCOMPLETE" ]; then
  echo "❌ Critical tasks incomplete: $INCOMPLETE"
  exit 1
fi
echo "✅ All critical tasks complete"
```

### Generate Progress Report
```bash
#!/bin/bash
echo "Production Readiness Report"
echo "=========================="
echo ""
jq -r '.sections[] | 
  "\(.priority | ascii_upcase) - \(.title): \(.status)"' \
  docs/production_checklist.v1.json
```

### Filter by Priority
```bash
# Get all high-priority tasks
jq '.sections[] | select(.priority == "high")' \
  docs/production_checklist.v1.json

# Get all incomplete medium-priority tasks
jq '.sections[] | 
  select(.priority == "medium" and .status != "completed")' \
  docs/production_checklist.v1.json
```

---

## 📚 File Locations

```
/workspace/
├── 📋 CHECKLIST_EXPORT_SUMMARY.md      ← Complete overview (this file)
├── 🚀 QUICK_START_CHECKLIST.md         ← Quick reference (you are here)
│
├── docs/
│   ├── ⭐ production_checklist.v1.json ← Machine-readable source
│   └── 📖 CHECKLIST_USAGE.md           ← Full usage guide
│
└── .github/ISSUE_TEMPLATE/
    ├── 01-hf-adapter-scope.md
    ├── 02-auto-refresh-user-control.md
    ├── 03-hash-based-navigation.md
    ├── 04-minimal-tests.md
    ├── 05-exchange-selector-cleanup.md
    ├── config.yml
    └── README.md
```

---

## 🎯 Recommended Next Steps

1. **Create GitHub issues** from templates
   ```bash
   gh issue create --template 01-hf-adapter-scope.md
   gh issue create --template 02-auto-refresh-user-control.md
   # ... etc
   ```

2. **Assign high-priority tasks** to team members

3. **Set up CI validation** for critical tasks
   ```yaml
   # .github/workflows/checklist-gate.yml
   - run: bash scripts/validate-critical.sh
   ```

4. **Start with HIGH priority** incomplete tasks:
   - HF Adapter Scope Clarification (2/3 done)
   - Auto-Refresh with User Control (0/3 done)

5. **Update JSON as work progresses**
   - Mark tasks as `done`
   - Update section `status`
   - Sync with GitHub issues

---

## 💡 Tips

- **JSON is source of truth** - Update it as you complete tasks
- **GitHub issues track work** - Use for team collaboration
- **Scripts automate checks** - Add to CI/CD pipeline
- **Cursor agents can read/write** - Enable AI-assisted tracking

---

## 🆘 Need Help?

- **Full guide:** `docs/CHECKLIST_USAGE.md`
- **Overview:** `CHECKLIST_EXPORT_SUMMARY.md`
- **Templates guide:** `.github/ISSUE_TEMPLATE/README.md`

---

**Ready to go!** 🚀

Start by creating the GitHub issues, then tackle the high-priority tasks.
