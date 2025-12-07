# 🛠️ ابزارها و کانفیگ‌های MCP - کامل شد!

## ✅ فایل‌های ایجاد شده

### 📦 تنظیمات MCP

```
.cursor/
├── mcp-config.json          (7.1 KB) ⭐ پیکربندی اصلی MCP
├── settings.json            (2.1 KB) - تنظیمات Cursor
├── README.md                (6.1 KB) - راهنمای کامل
└── prompts/                 - پرامپت‌های آماده
    ├── debug-ci.md         - Debug کردن CI
    ├── fix-tests.md        - رفع تست‌های خراب
    ├── review-pr.md        - بررسی Pull Request
    └── optimize-code.md    - بهینه‌سازی کد

.cursorrules                 (8.5 KB) - قوانین اصلی Cursor AI
```

---

## 🎯 چه چیزهایی اضافه شد؟

### 1️⃣ MCP Servers (3 سرور)

#### 📂 Filesystem Server
```json
{
  "command": "npx -y @modelcontextprotocol/server-filesystem /workspace",
  "description": "دسترسی به فایل‌های پروژه"
}
```
**استفاده:** خواندن و نوشتن فایل‌ها

#### 🐙 GitHub Server
```json
{
  "command": "npx -y @modelcontextprotocol/server-github",
  "description": "یکپارچگی با GitHub (issues, PRs, workflows)"
}
```
**استفاده:** مدیریت issues، PRها، workflows

#### 🧠 Memory Server
```json
{
  "command": "npx -y @modelcontextprotocol/server-memory",
  "description": "حافظه بین session‌ها"
}
```
**استفاده:** نگهداری context بین جلسات

---

### 2️⃣ Resources (5 منبع کلیدی)

| Resource | Path | Priority | توضیح |
|----------|------|----------|-------|
| `ci_config` | `.github/ci-config.json` | HIGH ⭐ | پیکربندی کامل CI |
| `cursor_ai_guide` | `.github/CURSOR_AI_GUIDE.json` | HIGH ⭐ | راهنمای AI |
| `package_json` | `package.json` | HIGH | Dependencies و scripts |
| `tsconfig` | `tsconfig.json` | MEDIUM | تنظیمات TypeScript |
| `ci_guide` | `.github/CI_GUIDE.md` | MEDIUM | مستندات CI |

**همه با watch: true** - Cursor تغییرات را دنبال می‌کند!

---

### 3️⃣ Tools (9 ابزار)

#### 🔍 CI Tools
```bash
validate_ci         # npm run ci:validate
parse_ci_reports    # npm run ci:parse
```

#### ✨ Quality Tools
```bash
lint                # npm run lint
lint_fix            # npm run lint -- --fix
typecheck           # npm run typecheck
```

#### 🧪 Testing Tools
```bash
test                # npm test
test_coverage       # npm run test:coverage
```

#### 🏗️ Build Tools
```bash
build_client        # npm run build:client
build_server        # npm run build:server
```

---

### 4️⃣ Prompts (4 پرامپت آماده)

#### 1. Debug CI Failure
```
/prompt debug-ci
```
**استفاده:** وقتی CI fail شد

**چی کار می‌کنه:**
- راهنمایی برای شناسایی job خراب
- دانلود artifact درست
- تجزیه JSON report
- ارائه راه‌حل

#### 2. Fix Failing Tests
```
/prompt fix-tests
```
**استفاده:** وقتی تست‌ها fail شدند

**چی کار می‌کنه:**
- اجرای تست‌ها
- شناسایی خطاها
- پیدا کردن root cause
- ارائه راه‌حل

#### 3. Review PR
```
/prompt review-pr
```
**استفاده:** قبل از ساخت PR

**چی کار می‌کنه:**
- بررسی کد quality
- اجرای تست‌ها
- چک کردن build
- checklist کامل

#### 4. Optimize Code
```
/prompt optimize-code
```
**استفاده:** برای بهینه‌سازی component/function

**چی کار می‌کنه:**
- تحلیل کد
- شناسایی bottleneck
- پیشنهاد optimizations
- بررسی performance

---

### 5️⃣ Context (اطلاعات پروژه)

```json
{
  "project_type": "cryptocurrency_trading_platform",
  "stack": {
    "frontend": "React + Vite + TypeScript",
    "backend": "Node.js + Express + TypeScript",
    "testing": "Vitest + Playwright",
    "ci": "GitHub Actions"
  }
}
```

**Common Workflows:**
- `before_push` - چک‌های قبل از push
- `ci_failed` - مراحل وقتی CI fail شد
- `new_feature` - workflow feature جدید

---

### 6️⃣ Shortcuts

```json
{
  "quick_check": "npm run lint && npm run typecheck && npm test",
  "full_build": "npm run build:client && npm run build:server",
  "ci_check": "npm run ci:validate",
  "fix_all": "npm run lint -- --fix && npm run typecheck"
}
```

**استفاده در Cursor:**
```
Run: quick_check
Run: full_build
```

---

### 7️⃣ AI Hints (راهنمای Cursor)

```json
{
  "when_ci_fails": {
    "step_1": "Read .github/ci-config.json",
    "step_2": "Identify failed job",
    "step_3": "Locate artifact",
    "step_4": "Guide user to download",
    "step_5": "Parse JSON report",
    "step_6": "Provide specific fixes",
    "step_7": "Show verification commands"
  }
}
```

Cursor دقیقاً می‌داند چه workflow دنبال کند!

---

### 8️⃣ Cursor Rules (.cursorrules)

**قوانین کلیدی:**

✅ **JSON-First Approach**
- همیشه JSON config‌ها را اول بخوان
- از logs استفاده نکن، JSON parse کن

✅ **Code Quality Standards**
- TypeScript strict mode
- Explicit return types
- No `any` types
- Proper error handling

✅ **Testing Requirements**
- تست برای feature‌های جدید
- Coverage >60%
- Descriptive test names

✅ **Response Format**
```markdown
## Problem Summary
## Root Cause
## Fix Steps
## Verification
## Prevention
```

---

## 🚀 نحوه استفاده

### راه‌اندازی اولیه

1. **تنظیمات خودکار:**
   - Cursor فایل‌های `.cursor/` را می‌خواند
   - MCP به طور خودکار فعال می‌شود
   - Resources load می‌شوند

2. **نصب MCP Servers (اختیاری):**
   ```bash
   npx -y @modelcontextprotocol/server-filesystem
   npx -y @modelcontextprotocol/server-github
   npx -y @modelcontextprotocol/server-memory
   ```

3. **تنظیم GitHub Token (برای GitHub Server):**
   ```bash
   export GITHUB_TOKEN="your_token_here"
   ```

---

### سناریوهای رایج

#### ❌ وقتی CI Fail شد:

**در Cursor بنویس:**
```
/prompt debug-ci

Workflow Run: #123
Failed Job: code-quality
Branch: feature/new-feature
```

**Cursor کار می‌کند:**
1. ✅ `.github/ci-config.json` را می‌خواند
2. ✅ artifact location پیدا می‌کند
3. ✅ گام‌به‌گام راهنمایی می‌کند
4. ✅ JSON report را parse می‌کند
5. ✅ راه‌حل‌های خاص می‌دهد

#### ✅ قبل از Push:

**در Cursor بنویس:**
```
Run: quick_check
```

**Cursor اجرا می‌کند:**
```bash
npm run lint && npm run typecheck && npm test
```

#### 🔧 رفع تست‌های خراب:

**در Cursor بنویس:**
```
/prompt fix-tests

Failed Tests: Dashboard.test.tsx
```

**Cursor کمک می‌کند:**
- تست‌ها را اجرا می‌کند
- خطاها را شناسایی می‌کند
- راه‌حل می‌دهد

#### 📝 بررسی PR:

**در Cursor بنویس:**
```
/prompt review-pr
```

**Cursor چک می‌کند:**
- [ ] Linting
- [ ] Type checking
- [ ] Tests
- [ ] Builds
- [ ] Documentation

---

## 🎯 Workflow‌های پیشنهادی

### 1. قبل از شروع کار روزانه:
```
1. Pull latest changes
2. npm install (اگر package.json تغییر کرده)
3. Run: quick_check
```

### 2. هنگام توسعه feature:
```
1. نوشتن کد
2. Run: lint_fix
3. Run: test
4. مشاهده نتایج در Cursor
5. رفع مشکلات
```

### 3. قبل از commit:
```
1. Run: quick_check
2. اگر همه سبز شد → commit
3. اگر خطا داشت → رفع → دوباره check
```

### 4. قبل از push:
```
1. Run: full_build
2. Run: ci_check
3. اگر OK → push
```

### 5. وقتی CI fail شد:
```
1. /prompt debug-ci
2. دنبال کردن دستورات Cursor
3. Download artifact
4. رفع مشکل
5. Test locally
6. Push again
```

---

## 💡 نکات مهم

### برای بهترین استفاده:

1. **مشخص باش با Cursor:**
   ❌ "Fix this"
   ✅ "Fix lint error in Dashboard.tsx line 42"

2. **از Prompts استفاده کن:**
   ❌ دستی توضیح دادن
   ✅ `/prompt debug-ci` و پر کردن

3. **بذار Cursor Tools اجرا کنه:**
   ❌ Switch به terminal
   ✅ `Run: quick_check` در Cursor

4. **به JSON‌ها اعتماد کن:**
   ❌ خواندن لاگ‌های طولانی
   ✅ Cursor JSON‌ها را parse می‌کند

---

## 📚 منابع کلیدی

### برای Cursor همیشه در دسترس:

1. **`.github/ci-config.json`** ⭐ **مهم‌ترین**
   - کامل‌ترین config
   - تمام jobs و artifacts
   - Debugging guides

2. **`.github/CURSOR_AI_GUIDE.json`**
   - Workflows برای AI
   - مثال‌های کد
   - Response templates

3. **`.cursorrules`**
   - قوانین کلی
   - استانداردها
   - Do's and Don'ts

4. **`.cursor/mcp-config.json`**
   - تنظیمات MCP
   - Servers, Resources, Tools

---

## 🎨 ویژگی‌های خاص

### 🔍 Smart Context Management
- فقط فایل‌های مهم در context
- Auto-exclude node_modules, dist, etc.
- Watch برای تغییرات realtime

### 🚀 Quick Actions
- Tools مستقیم از Cursor
- بدون switch به terminal
- نتایج inline

### 📝 Ready-Made Prompts
- 4 سناریوی رایج
- قالب‌های استاندارد
- کاهش typing

### 🤖 AI-Optimized
- JSON-first approach
- Clear workflows
- Specific guidance

---

## 📊 آمار کامل

### فایل‌های ایجاد شده:
- ✅ 8 فایل جدید
- ✅ 1 دایرکتوری جدید (`prompts/`)
- ✅ همه documented

### محتوا:
- **MCP Servers:** 3
- **Resources:** 5
- **Tools:** 9
- **Prompts:** 4
- **Rules:** جامع
- **Workflows:** متعدد

### خطوط کد:
- `mcp-config.json`: ~200 خط
- `settings.json`: ~80 خط
- `.cursorrules`: ~300 خط
- `README.md`: ~250 خط
- Prompts: ~400 خط
- **جمع:** ~1,230 خط

---

## 🎊 نتیجه‌گیری

### چیزی که الان داری:

✅ **MCP کامل** - با 3 server قدرتمند  
✅ **Resources هوشمند** - فقط چیزهای مهم  
✅ **Tools مفید** - دستورات npm در دسترس  
✅ **Prompts آماده** - 4 سناریوی رایج  
✅ **Rules واضح** - JSON-first و استانداردها  
✅ **Context بهینه** - سریع و دقیق  

### چیزی که Cursor الان می‌تونه:

✅ همه فایل‌های مهم رو بخونه  
✅ Tools رو اجرا کنه  
✅ از Prompts آماده استفاده کنه  
✅ Workflows رو دنبال کنه  
✅ JSON-first کار کنه  
✅ بدون سردرگمی کمک کنه  

### از این به بعد:

🚀 **کار با Cursor خیلی راحت‌تره**  
🚀 **Debug کردن خیلی سریع‌تره**  
🚀 **سردرگمی خیلی کمتره**  
🚀 **بهره‌وری خیلی بیشتره**  

---

## 🎯 مراحل بعدی

### Immediate:
1. ✅ Restart Cursor
2. ✅ بررسی MCP در settings
3. ✅ تست یک prompt: `/prompt debug-ci`
4. ✅ اجرای یک tool: `Run: quick_check`

### پیشنهادی:
1. Custom prompts اضافه کن در `prompts/`
2. Tools جدید به MCP اضافه کن
3. Resources بیشتر اضافه کن
4. Rules رو customize کن

---

**موفق باشید با Cursor! 🚀**

**آخرین به‌روزرسانی:** 2025-12-07  
**نسخه:** 1.0.0  
**وضعیت:** ✅ Complete and Ready
