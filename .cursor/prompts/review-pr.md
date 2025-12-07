# Review Pull Request Prompt

Use this before creating or reviewing a PR:

---

## Context
I want to review my changes before creating a PR.

## What I Need
Comprehensive review of my changes.

## What You Should Check

### 1. Code Quality
```bash
npm run lint
npm run typecheck
```
- Are there any linting errors?
- Are there type errors?
- Is code clean and readable?

### 2. Tests
```bash
npm test
npm run test:coverage
```
- Do all tests pass?
- Is coverage maintained or improved?
- Are new features tested?

### 3. Builds
```bash
npm run build:client
npm run build:server
```
- Do both builds succeed?
- Any warnings?
- Bundle size reasonable?

### 4. Changed Files Review
- Review each changed file
- Check for:
  - Unnecessary changes
  - Console.logs left behind
  - Hardcoded values
  - Missing error handling
  - Proper TypeScript types

### 5. Documentation
- Is README updated if needed?
- Are comments clear?
- New features documented?

### 6. CI Configuration
```bash
npm run ci:validate
```
- Is CI config valid?
- Will CI pass?

## Checklist

- [ ] Code compiles without errors
- [ ] All tests pass
- [ ] Linting passes
- [ ] TypeScript checks pass
- [ ] No console.logs
- [ ] Proper error handling
- [ ] Types are correct
- [ ] Tests added for new features
- [ ] Documentation updated
- [ ] No hardcoded values
- [ ] CI validation passes

## Please Review

Go through each item and let me know if anything needs fixing.
