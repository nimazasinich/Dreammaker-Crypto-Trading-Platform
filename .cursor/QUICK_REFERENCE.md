# 🚀 Cursor MCP - مرجع سریع

## دستورات سریع

### Prompts
```
/prompt debug-ci          # Debug کردن CI
/prompt fix-tests         # رفع تست‌ها
/prompt review-pr         # بررسی PR
/prompt optimize-code     # بهینه‌سازی
```

### Tools
```
Run: quick_check          # lint + typecheck + test
Run: full_build           # build client + server
Run: ci_check             # validate CI config
Run: fix_all              # lint --fix + typecheck
```

### دستورات منفرد
```
Run: validate_ci          # npm run ci:validate
Run: lint                 # npm run lint
Run: lint_fix             # npm run lint -- --fix
Run: typecheck            # npm run typecheck
Run: test                 # npm test
Run: test_coverage        # npm run test:coverage
Run: build_client         # npm run build:client
Run: build_server         # npm run build:server
```

## فایل‌های کلیدی

### برای AI (همیشه در context)
- `.github/ci-config.json` ⭐ مهم‌ترین
- `.github/CURSOR_AI_GUIDE.json`
- `package.json`
- `tsconfig.json`

### برای شما
- `.cursor/README.md` - راهنمای کامل
- `.cursorrules` - قوانین Cursor
- این فایل - مرجع سریع!

## Workflow‌های رایج

### قبل از Push:
1. `Run: quick_check`
2. رفع خطاها
3. `git commit && git push`

### CI Fail شد:
1. `/prompt debug-ci`
2. جواب دادن به سوالات
3. Download artifact
4. رفع مشکل
5. `Run: quick_check`
6. Push again

### Feature جدید:
1. کد بنویس
2. `Run: lint_fix`
3. `Run: test`
4. `/prompt review-pr`
5. Create PR

## MCP Servers

- **filesystem** - دسترسی به فایل‌ها
- **github** - یکپارچگی GitHub
- **memory** - حافظه بین sessions

## Resources (همیشه load شده)

- `ci_config` - CI configuration
- `cursor_ai_guide` - AI guide
- `package_json` - Dependencies
- `tsconfig` - TypeScript config

## نکات سریع

✅ مشخص باش: "Fix lint error in Dashboard.tsx:42"  
✅ از prompts استفاده کن: `/prompt debug-ci`  
✅ Tools اجرا کن: `Run: quick_check`  
✅ JSON-first: Cursor parse می‌کنه  

❌ مبهم نباش: "Fix this"  
❌ دستی توضیح نده: از prompts استفاده کن  
❌ Terminal نزن: از Tools استفاده کن  

---

**برای جزئیات:** `.cursor/README.md`
