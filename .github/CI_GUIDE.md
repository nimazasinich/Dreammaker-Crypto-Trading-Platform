# 🚀 CI/CD Pipeline Guide

## راهنمای جامع سیستم یکپارچه‌سازی مداوم (Comprehensive CI/CD Pipeline Guide)

این راهنما برای استفاده آسان توسط توسعه‌دهندگان و دستیاران هوش مصنوعی (مثل Cursor) طراحی شده است.

---

## 📋 فهرست مطالب (Table of Contents)

1. [نمای کلی](#overview)
2. [ساختار Pipeline](#pipeline-structure)
3. [فایل‌های کلیدی](#key-files)
4. [مراحل اجرا](#execution-flow)
5. [گزارش‌ها و خروجی‌ها](#reports-and-outputs)
6. [رفع مشکلات](#troubleshooting)
7. [یکپارچگی با Cursor AI](#cursor-ai-integration)

---

## 🎯 Overview (نمای کلی)

### Purpose (هدف)

این سیستم CI/CD برای اطمینان از کیفیت کد، تست‌های جامع، و استقرار مطمئن طراحی شده است. تمام فرآیندها خودکار هستند و گزارش‌های دقیق به صورت JSON تولید می‌کنند.

### Key Features (ویژگی‌های کلیدی)

✅ **Automated Testing** - تست‌های خودکار در سه سطح (Unit, Integration, E2E)  
✅ **Code Quality Checks** - بررسی کیفیت کد با ESLint و TypeScript  
✅ **Build Verification** - ساخت و تأیید Client و Server  
✅ **Docker Support** - ساخت و تست تصاویر Docker  
✅ **Security Scanning** - اسکن امنیتی و شناسایی آسیب‌پذیری‌ها  
✅ **Performance Monitoring** - اندازه‌گیری عملکرد و اندازه بسته‌ها  
✅ **JSON Reports** - گزارش‌های جامع به فرمت JSON برای دسترسی آسان AI  

### Workflow Triggers (محرک‌های اجرا)

Pipeline در موارد زیر اجرا می‌شود:

- **Push** به برنچ‌های: `main`, `master`, `develop`, `cursor/**`, `feature/**`
- **Pull Request** به برنچ‌های: `main`, `master`, `develop`
- **Manual Dispatch** از طریق GitHub Actions UI

---

## 🏗️ Pipeline Structure (ساختار Pipeline)

Pipeline شامل 10 مرحله (Job) است که به ترتیب یا به صورت موازی اجرا می‌شوند:

```
┌─────────────────────────┐
│  1. Setup & Validation  │
└───────────┬─────────────┘
            │
      ┌─────┴─────────────────────────┐
      ▼                                 ▼
┌──────────────┐            ┌────────────────────┐
│ 2. Code      │            │ 3. Unit Tests      │
│    Quality   │            │ 4. Integration     │
└──────┬───────┘            │ 5. Security Scan   │
       │                    └─────────┬──────────┘
       │                              │
       └────────┬────────────────────┘
                ▼
       ┌────────────────┐
       │ 6. E2E Tests   │ (conditional)
       │ 7. Build       │
       │ 8. Docker      │
       │ 9. Performance │
       └────────┬───────┘
                ▼
      ┌──────────────────┐
      │ 10. Final Report │
      └──────────────────┘
```

### Job Details

#### 1️⃣ Setup & Validation

**Purpose:** تشخیص تغییرات و تعیین اینکه چه تست‌هایی باید اجرا شوند

**Outputs:**
- `changes.json` - لیست فایل‌های تغییر یافته و مناطق تأثیرگذار
- `should-run-e2e` - آیا تست‌های E2E باید اجرا شوند؟

**Location:** `ci-reports/metadata/changes.json`

#### 2️⃣ Code Quality

**Purpose:** بررسی کیفیت کد با ESLint، TypeScript، و تحلیل پیچیدگی

**Reports:**
- `eslint-report.json` - خطاهای لینتینگ
- `typecheck-report.json` - خطاهای type checking
- `complexity-report.json` - متریک‌های پیچیدگی کد

**Location:** `ci-reports/quality/`

#### 3️⃣ Unit Tests

**Purpose:** اجرای تست‌های واحد با Vitest و گزارش coverage

**Reports:**
- `vitest-results.json` - نتایج تست‌ها
- `summary.json` - خلاصه نتایج
- `coverage/` - گزارش پوشش کد

**Location:** `ci-reports/tests/`

#### 4️⃣ Integration Tests

**Purpose:** تست API endpoints و health checks

**Reports:**
- `summary.json` - خلاصه تست‌های یکپارچگی

**Location:** `ci-reports/integration/`

#### 5️⃣ E2E Tests

**Purpose:** تست end-to-end با Playwright (اجرا شرطی)

**Reports:**
- `results-shard-N.json` - نتایج هر shard
- `playwright-report/` - گزارش HTML Playwright

**Location:** `ci-reports/e2e/`

#### 6️⃣ Build Verification

**Purpose:** ساخت client و server به صورت جداگانه

**Reports:**
- `client-report.json` - متریک‌های build frontend
- `server-report.json` - متریک‌های build backend

**Metrics:**
- Build time (seconds)
- Bundle size (bytes/MB)
- File count

**Location:** `ci-reports/build/`

#### 7️⃣ Docker Build

**Purpose:** ساخت و تست Docker images

**Reports:**
- `backend-report.json` - اطلاعات image backend
- `frontend-report.json` - اطلاعات image frontend
- `*-startup.log` - لاگ‌های startup

**Location:** `ci-reports/docker/`

#### 8️⃣ Security Scan

**Purpose:** اسکن امنیتی و شناسایی آسیب‌پذیری‌ها

**Reports:**
- `npm-audit.json` - آسیب‌پذیری‌های npm
- `secrets-scan.json` - نتایج اسکن secret

**Location:** `ci-reports/security/`

#### 9️⃣ Performance Benchmarks

**Purpose:** اندازه‌گیری عملکرد build و اندازه bundle

**Reports:**
- `benchmarks.json` - متریک‌های عملکرد

**Metrics:**
- Build times
- Bundle sizes (total, JS, CSS)

**Location:** `ci-reports/performance/`

#### 🔟 Generate Final Report

**Purpose:** ترکیب تمام گزارش‌ها در یک خلاصه جامع

**Reports:**
- `ci-report.json` - گزارش کامل JSON
- `SUMMARY.md` - خلاصه قابل خواندن

**Location:** `final-report/`

---

## 📁 Key Files (فایل‌های کلیدی)

### Configuration Files

| File | Purpose | Format |
|------|---------|--------|
| `.github/workflows/comprehensive-ci.yml` | GitHub Actions workflow definition | YAML |
| `.github/ci-config.json` | Complete CI configuration & documentation | JSON |
| `.github/ci-config-schema.json` | JSON schema for validation | JSON Schema |
| `.github/CI_GUIDE.md` | This guide (human-readable) | Markdown |
| `scripts/ci/*.ts` | CI helper scripts | TypeScript |

### Project Configuration

| File | Purpose |
|------|---------|
| `package.json` | Dependencies and npm scripts |
| `tsconfig.json` | TypeScript configuration |
| `vitest.config.ts` | Unit test configuration |
| `playwright.config.ts` | E2E test configuration |
| `eslint.config.js` | Linting rules |
| `Dockerfile.backend` | Backend Docker image |
| `Dockerfile.frontend` | Frontend Docker image |

---

## 🔄 Execution Flow (مراحل اجرا)

### Normal Push to Feature Branch

```
1. Setup & Validation ✓
2. Code Quality ✓
3. Unit Tests ✓
4. Integration Tests ✓
5. E2E Tests (skipped - not main branch)
6. Build Verification ✓
7. Docker Build ✓
8. Security Scan ✓
9. Performance Benchmarks ✓
10. Final Report ✓
```

### Pull Request to Main

```
1. Setup & Validation ✓
2. Code Quality ✓
3. Unit Tests ✓
4. Integration Tests ✓
5. E2E Tests ✓ (runs on PR to main)
6. Build Verification ✓
7. Docker Build ✓
8. Security Scan ✓
9. Performance Benchmarks ✓
10. Final Report ✓ → Posts comment to PR
```

### Manual Dispatch with E2E

```
User selects: run_e2e = true

All jobs run including E2E tests
```

---

## 📊 Reports and Outputs (گزارش‌ها و خروجی‌ها)

### Report Structure

```
ci-reports/
├── metadata/
│   └── changes.json           # Change detection results
├── quality/
│   ├── eslint-report.json     # Linting errors
│   ├── typecheck-report.json  # Type errors
│   ├── typecheck-output.txt   # Raw typecheck output
│   └── complexity-report.json # Code metrics
├── tests/
│   ├── vitest-results.json    # Test results
│   └── summary.json           # Test summary
├── integration/
│   └── summary.json           # Integration test results
├── e2e/
│   └── results-shard-N.json   # E2E results
├── build/
│   ├── client-report.json     # Frontend build metrics
│   └── server-report.json     # Backend build metrics
├── docker/
│   ├── backend-report.json    # Backend image info
│   ├── frontend-report.json   # Frontend image info
│   ├── backend-startup.log    # Backend startup logs
│   └── frontend-startup.log   # Frontend startup logs
├── security/
│   ├── npm-audit.json         # NPM vulnerabilities
│   └── secrets-scan.json      # Secret detection results
└── performance/
    └── benchmarks.json        # Performance metrics

final-report/
├── ci-report.json             # Complete pipeline report
└── SUMMARY.md                 # Human-readable summary
```

### JSON Report Format

All JSON reports follow this standard structure:

```json
{
  "timestamp": "2025-12-07T10:30:00Z",
  "status": "success|failed|warning",
  "type": "unit|integration|e2e|build|...",
  // ... specific fields per report type
}
```

### Error Format

Errors are reported in this format for easy parsing:

```json
{
  "file": "src/components/Dashboard.tsx",
  "line": 42,
  "column": 12,
  "message": "Type 'string' is not assignable to type 'number'",
  "rule": "typescript/type-error",
  "severity": "error"
}
```

---

## 🔧 Troubleshooting (رفع مشکلات)

### Pipeline Failed - What to Do?

#### Step 1: Download Final Report

Go to GitHub Actions → Your workflow run → Artifacts → Download `ci-final-report`

#### Step 2: Check ci-report.json

```bash
cat ci-report.json | jq '.jobs'
```

This shows which jobs failed:

```json
{
  "code_quality": "failure",
  "unit_tests": "success",
  "build_verification": "success"
}
```

#### Step 3: Download Specific Job Artifacts

Based on which job failed, download its artifact:

- Code Quality Failed → Download `quality-reports`
- Unit Tests Failed → Download `unit-test-results`
- Build Failed → Download `build-reports-client` or `build-reports-server`
- Docker Failed → Download `docker-reports-backend` or `docker-reports-frontend`

#### Step 4: Analyze Detailed Reports

Each artifact contains JSON files with detailed information:

**For Linting Errors:**
```bash
cat quality-reports/eslint-report.json | jq '.[] | select(.errorCount > 0)'
```

**For Test Failures:**
```bash
cat unit-test-results/vitest-results.json | jq '.testResults[] | select(.status == "failed")'
```

**For Build Errors:**
```bash
cat build-reports/client-report.json
less build-reports/client-build.log
```

### Common Issues

#### ❌ Linting Failures

**Artifact:** `quality-reports/eslint-report.json`

**How to fix:**
1. Download the artifact
2. Check `eslint-report.json` for specific errors
3. Run locally: `npm run lint`
4. Fix errors or add exceptions
5. Commit and push

**Example error:**
```json
{
  "filePath": "src/views/Dashboard.tsx",
  "messages": [{
    "line": 42,
    "column": 12,
    "message": "Missing return type on function",
    "ruleId": "@typescript-eslint/explicit-function-return-type"
  }]
}
```

#### ❌ Test Failures

**Artifact:** `unit-test-results/vitest-results.json`

**How to fix:**
1. Download the artifact
2. Check `vitest-results.json` for failed tests
3. Run locally: `npm test`
4. Fix the failing tests
5. Verify coverage meets thresholds

**Example error:**
```json
{
  "name": "Dashboard rendering",
  "status": "failed",
  "duration": 245,
  "failureMessage": "Expected element to be in document"
}
```

#### ❌ Build Failures

**Artifacts:** `build-reports-client/`, `build-reports-server/`

**How to fix:**
1. Download the artifact
2. Check `*-report.json` for status
3. Read `*-build.log` for detailed errors
4. Run locally: `npm run build:client` or `npm run build:server`
5. Fix the build errors

**Example report:**
```json
{
  "build_type": "client",
  "status": "failed",
  "duration_seconds": 45,
  "log_file": "client-build.log"
}
```

#### ❌ Docker Build Failures

**Artifacts:** `docker-reports-backend/`, `docker-reports-frontend/`

**How to fix:**
1. Download the artifact
2. Check `*-report.json` for image info
3. Read `*-startup.log` for container errors
4. Run locally: `docker build -f Dockerfile.backend .`
5. Test container: `docker run -p 8001:8001 <image>`

#### ❌ E2E Test Failures

**Artifacts:** `e2e-results-shard-1/`, `e2e-results-shard-2/`

**How to fix:**
1. Download the artifacts
2. Check `results-shard-N.json` for failed tests
3. View `playwright-report/` for visual reports
4. Run locally: `npm run e2e:smoke`
5. Check screenshots and videos in `test-results/`

---

## 🤖 Cursor AI Integration (یکپارچگی با Cursor AI)

### For AI Assistants (راهنمای دستیار هوش مصنوعی)

#### Quick Start for Cursor

When a user asks about CI/CD issues, follow this workflow:

1. **Read Configuration**
   ```
   Read: .github/ci-config.json
   ```
   This file contains the complete pipeline structure and debugging guide.

2. **Identify the Problem**
   Ask user which job failed, or check the latest workflow run.

3. **Locate the Report**
   Based on the failed job, identify the artifact from `ci-config.json`:
   
   ```json
   {
     "jobs": {
       "code-quality": {
         "artifacts": {
           "quality-reports": {
             "path": "ci-reports/quality/",
             "files": ["eslint-report.json", "typecheck-report.json"]
           }
         }
       }
     }
   }
   ```

4. **Download and Analyze**
   Guide user to download the artifact and analyze the JSON report.

5. **Provide Fix**
   Based on the error details in JSON, provide specific code fixes.

### JSON-First Approach

All reports are in JSON format for easy parsing by AI:

```javascript
// Example: Reading ESLint report
const report = JSON.parse(fs.readFileSync('eslint-report.json', 'utf8'));
const errors = report.filter(file => file.errorCount > 0);

errors.forEach(file => {
  console.log(`File: ${file.filePath}`);
  file.messages.forEach(msg => {
    console.log(`  Line ${msg.line}: ${msg.message} (${msg.ruleId})`);
  });
});
```

### Key Questions AI Should Ask

1. **Which workflow run failed?**
   → Get run ID to download specific artifacts

2. **Which job(s) failed?**
   → Check `ci-report.json` in `ci-final-report` artifact

3. **What type of error?**
   → Lint / Test / Build / Docker / Security

4. **Have you downloaded the artifacts?**
   → Guide user to download correct artifact

5. **What does the JSON report show?**
   → Parse the JSON for specific error details

### AI Response Template

```markdown
I see that the [JOB_NAME] job failed in your CI pipeline.

**Step 1:** Download the artifact
Go to: GitHub Actions → Run #[RUN_NUMBER] → Artifacts → Download `[ARTIFACT_NAME]`

**Step 2:** Check the report
The main report file is: `[REPORT_FILE_PATH]`

**Step 3:** Common causes for this error:
- [CAUSE_1]
- [CAUSE_2]

**Step 4:** How to fix:
[SPECIFIC_FIX_BASED_ON_ERROR]

**Step 5:** Verify locally:
```bash
[LOCAL_COMMAND_TO_TEST]
```

Let me know if you need help interpreting the JSON report!
```

### Debugging Workflow for AI

```
User: "My CI failed"
  ↓
AI: "Which job failed? Check ci-report.json"
  ↓
User: "code-quality failed"
  ↓
AI: Read .github/ci-config.json → jobs.code-quality.artifacts
  ↓
AI: "Download quality-reports artifact"
  ↓
AI: "Check eslint-report.json for errors"
  ↓
AI: Parse JSON → Identify specific errors
  ↓
AI: Provide fixes for each error
```

---

## 📚 Additional Resources

### Scripts

All CI helper scripts are in `scripts/ci/`:

- `validate-ci-config.ts` - Validates CI configuration
- `parse-ci-reports.ts` - Parses and aggregates reports
- `generate-summary.ts` - Generates HTML/Markdown summaries

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `NODE_VERSION` | `20.x` | Node.js version |
| `REPORTS_DIR` | `ci-reports` | Reports directory |
| `ARTIFACTS_RETENTION_DAYS` | `30` | Artifact retention |
| `CI` | `true` | CI environment flag |

### Useful Commands

```bash
# Validate CI configuration
npm run ci:validate

# Run full CI pipeline locally
npm run ci:local

# Generate CI report
npm run ci:report

# Parse CI artifacts
npm run ci:parse

# Check pipeline status
gh run list --workflow=comprehensive-ci.yml
```

---

## 🎯 Best Practices

### For Developers

1. **Run tests locally before pushing**
   ```bash
   npm run lint
   npm test
   npm run build
   ```

2. **Check CI status before merging**
   - All jobs must pass
   - Review the final report
   - Check coverage didn't decrease

3. **Fix issues immediately**
   - Don't ignore CI failures
   - Use JSON reports for debugging
   - Add tests for new features

### For AI Assistants

1. **Always read ci-config.json first**
   - Contains complete structure
   - Has debugging guides
   - Lists all artifacts

2. **Use JSON reports for analysis**
   - Parse programmatically
   - Extract specific errors
   - Provide targeted fixes

3. **Guide users step-by-step**
   - Download correct artifact
   - Point to specific file
   - Explain the error
   - Provide the fix

---

## 📞 Support

### Getting Help

1. **Read this guide** - Most answers are here
2. **Check ci-config.json** - Complete technical reference
3. **Download artifacts** - Detailed error information
4. **Review workflow logs** - Execution details
5. **Ask the team** - For complex issues

### Updating the CI System

When adding new checks or modifying the pipeline:

1. Update `.github/workflows/comprehensive-ci.yml`
2. Update `.github/ci-config.json`
3. Update this guide (`CI_GUIDE.md`)
4. Test with a PR
5. Document any new reports

---

## 📝 Changelog

### Version 1.0.0 (2025-12-07)

- ✅ Initial comprehensive CI pipeline
- ✅ 10 parallel/sequential jobs
- ✅ Complete JSON reporting system
- ✅ AI-friendly configuration
- ✅ Detailed documentation

---

**Last Updated:** 2025-12-07  
**Maintainer:** CI Team  
**Version:** 1.0.0
