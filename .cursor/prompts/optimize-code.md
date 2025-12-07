# Optimize Code Prompt

Use this when you want to optimize a component or function:

---

## Context
I want to optimize: [component/function name]

## File
[file path]

## Current Issues (if any)
- [ ] Performance problems
- [ ] Re-renders too much
- [ ] Bundle size
- [ ] Memory leaks
- [ ] Other: [describe]

## What You Should Do

### 1. Analyze Current Code
- Read the file
- Understand the logic
- Identify bottlenecks

### 2. Performance Review
For React components:
- Are deps arrays correct?
- Can we use `useMemo`/`useCallback`?
- Are we causing unnecessary re-renders?
- Can we lazy load?

For functions:
- Is algorithm efficient?
- Can we cache results?
- Are we doing unnecessary work?

### 3. TypeScript Review
- Are types specific enough?
- Any `any` types to fix?
- Can we improve type safety?

### 4. Bundle Size
- Are we importing too much?
- Can we use tree-shaking?
- Dynamic imports possible?

### 5. Suggest Optimizations
- Provide specific code changes
- Explain why each change helps
- Show before/after examples

### 6. Testing
- Ensure tests still pass
- Add performance tests if needed

## Please Analyze

Read the file and suggest optimizations with explanations.
