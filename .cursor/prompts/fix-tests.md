# Fix Failing Tests Prompt

Use this when tests are failing:

---

## Context
My tests are failing (locally or in CI).

## What I Need
Help me identify and fix the failing tests.

## Information
- **Test Framework:** Vitest
- **Failed Tests:** [list if known, or "multiple/unknown"]
- **Where:** [local or CI]

## What You Should Do

1. **Run Tests Locally:**
   ```bash
   npm test
   ```
   - Capture the output
   - Identify which tests failed

2. **Analyze Failures:**
   - Read test files
   - Understand what's being tested
   - Identify the assertion that failed

3. **Find Root Cause:**
   - Is it a logic error?
   - Missing mocks/setup?
   - Type issue?
   - Async timing?

4. **Provide Fixes:**
   - For each failing test:
     - Explain the issue
     - Show the fix
     - Explain why it fixes it

5. **Verify:**
   ```bash
   npm test -- [specific-test-file]
   npm run test:coverage
   ```

## Common Test Issues

- **Component not rendering:** Check mocks/providers
- **Element not found:** Check test selectors/timing
- **Assertion failed:** Check expected vs actual values
- **Async issues:** Use `waitFor`, `findBy` queries

## Please Start

Run the tests and help me fix them systematically.
