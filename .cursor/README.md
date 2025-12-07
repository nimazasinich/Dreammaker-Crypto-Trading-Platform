# 🎯 Cursor Configuration for DreamMaker Project

این پوشه شامل تمام تنظیمات و ابزارهای MCP برای بهینه‌سازی کار با Cursor است.

## 📁 فایل‌ها

### 1. `mcp-config.json`
پیکربندی اصلی MCP شامل:
- **Servers:** filesystem, github, memory
- **Resources:** کلیدی‌ترین فایل‌های پروژه
- **Tools:** دستورات npm مفید
- **Prompts:** قالب‌های از پیش تعریف شده
- **Context:** اطلاعات پروژه
- **AI Hints:** راهنمای workflow برای AI

### 2. `settings.json`
تنظیمات Cursor:
- فعال‌سازی MCP
- مدل‌های AI
- Context و excludes
- Format on save
- کدهای اکشن خودکار

### 3. `.cursorrules`
قوانین اصلی برای Cursor AI:
- رویکرد JSON-first
- استانداردهای کد
- سناریوهای رایج
- الگوی response
- اولویت‌های debugging

### 4. `prompts/`
پرامپت‌های آماده:
- `debug-ci.md` - برای debug کردن CI
- `fix-tests.md` - برای رفع تست‌های خراب
- `review-pr.md` - برای بررسی PR
- `optimize-code.md` - برای بهینه‌سازی کد

## 🚀 نحوه استفاده

### راه‌اندازی اولیه

1. **کپی کردن تنظیمات:**
   ```bash
   # تنظیمات از پوشه .cursor به Cursor کپی می‌شوند
   # معمولاً خودکار است
   ```

2. **تنظیم GitHub Token (اختیاری):**
   ```bash
   export GITHUB_TOKEN="your_token_here"
   ```

3. **نصب MCP Servers:**
   ```bash
   npx -y @modelcontextprotocol/server-filesystem
   npx -y @modelcontextprotocol/server-github
   npx -y @modelcontextprotocol/server-memory
   ```

### استفاده از Prompts

در Cursor، تایپ کن:
```
/prompt debug-ci
/prompt fix-tests
/prompt review-pr
/prompt optimize-code
```

یا از قسمت Prompts در Cursor UI انتخاب کن.

### دسترسی به Resources

Cursor به طور خودکار به این فایل‌ها دسترسی دارد:
- `.github/ci-config.json` ⭐
- `.github/CURSOR_AI_GUIDE.json`
- `package.json`
- `tsconfig.json`

### استفاده از Tools

در chat از دستورات استفاده کن:
```
Run: validate_ci
Run: lint_fix
Run: test_coverage
```

## 🎯 Workflow‌های توصیه شده

### قبل از هر Push:

```
1. بپرس: "Run quick_check"
2. بررسی نتایج
3. رفع مشکلات
4. Push
```

### وقتی CI Fail شد:

```
1. استفاده از prompt: /prompt debug-ci
2. دادن اطلاعات workflow run
3. دنبال کردن دستورات Cursor
4. Download artifact مربوطه
5. رفع مشکل
6. تست local
7. Push دوباره
```

### برای Feature جدید:

```
1. نوشتن کد
2. استفاده از: /prompt review-pr
3. اضافه کردن تست‌ها
4. Run quick_check
5. Create PR
```

## 🤖 چگونه Cursor کار می‌کند

### با MCP Config:
1. Cursor فایل `mcp-config.json` را می‌خواند
2. دسترسی به resources مشخص شده پیدا می‌کند
3. می‌تواند tools را اجرا کند
4. از prompts آماده استفاده می‌کند

### با Rules:
1. قوانین `.cursorrules` را دنبال می‌کند
2. همیشه JSON files را اول می‌خواند
3. از workflows مشخص شده استفاده می‌کند
4. response format استاندارد

### با Context:
1. فایل‌های مهم را در context نگه می‌دارد
2. از excludes برای سرعت بیشتر استفاده می‌کند
3. TypeScript و testing را درک می‌کند

## 📚 منابع کلیدی برای Cursor

همیشه این ترتیب را دنبال کن:

1. **`.github/ci-config.json`** ⭐ اصلی
   - کامل‌ترین config
   - همه چیز اینجاست

2. **`.github/CURSOR_AI_GUIDE.json`**
   - راهنمای workflows
   - مثال‌های کد
   - Templates

3. **`package.json`**
   - Dependencies
   - Scripts

4. **`.cursorrules`**
   - قوانین کلی
   - استانداردها

## 🎨 ویژگی‌های خاص

### JSON-First Approach
- همه چیز JSON
- ساختار واضح
- قابل parse توسط AI

### Context Management
- فقط فایل‌های مهم در context
- Excludes برای performance
- Watch برای تغییرات

### Ready-Made Prompts
- سناریوهای رایج
- قالب‌های استاندارد
- کاهش سردرگمی

### Tool Integration
- دستورات npm از داخل Cursor
- بدون switch به terminal
- نتایج مستقیم

## 💡 نکات مهم

### برای بهترین نتیجه:

1. **همیشه مشخص باش:**
   ❌ "CI failed"
   ✅ "CI failed, code-quality job, run #123"

2. **از prompts استفاده کن:**
   ❌ چند بار توضیح دادن
   ✅ `/prompt debug-ci` و fill کردن

3. **Context بده:**
   ❌ "Fix this"
   ✅ "Fix this lint error in Dashboard.tsx line 42"

4. **Local test کن:**
   - قبل از push
   - بعد از fix
   - قبل از PR

## 🔧 تنظیمات پیشرفته

### فعال کردن Memory Server:
```json
{
  "mcpServers": {
    "memory": {
      "enabled": true
    }
  }
}
```
این باعث می‌شه Cursor context بین session‌ها را نگه دارد.

### اضافه کردن Custom Tools:
```json
{
  "tools": {
    "my_tool": {
      "command": "npm run my-script",
      "description": "My custom tool",
      "category": "custom"
    }
  }
}
```

### اضافه کردن Custom Prompts:
فایل جدید در `prompts/` بساز:
```markdown
# My Prompt

Context: ...
What I Need: ...
```

## 📊 آمار

- **MCP Servers:** 3
- **Resources:** 5
- **Tools:** 9
- **Prompts:** 4
- **Context Items:** Multiple
- **Rules:** Comprehensive

## 🎉 نتیجه

با این تنظیمات، Cursor:
- ✅ همه چیز را می‌داند
- ✅ JSON-first کار می‌کند
- ✅ Workflows را دنبال می‌کند
- ✅ به سرعت کمک می‌کند
- ✅ سردرگمی ندارد

**Enjoy coding with Cursor! 🚀**

---

**آخرین به‌روزرسانی:** 2025-12-07  
**نسخه:** 1.0.0
