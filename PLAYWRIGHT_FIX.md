# PLAYWRIGHT CONNECTION FIX

## Issue
```
connect EACCES ::1:60287
```

## Root Cause
Vite server was configured with `host: true` which binds to `0.0.0.0` and attempts both IPv4 and IPv6. On Windows, this can cause EACCES errors when IPv6 connections fail or are blocked by firewall.

The random port `60287` was being used by HMR (Hot Module Replacement) attempting IPv6 connection.

## Solution Applied

### Changed in `vite.config.ts`:

1. **Server Host**
   - Before: `host: true` (binds to 0.0.0.0)
   - After: `host: '127.0.0.1'` (IPv4 only)

2. **HMR Configuration**
   - Before: `host: 'localhost'` (can resolve to IPv6)
   - After: `host: '127.0.0.1'` (IPv4 only)

3. **Strict Port**
   - Before: `strictPort: false` (tries other ports)
   - After: `strictPort: true` (fails if port busy)

4. **Preview Mode**
   - Before: `host: true`
   - After: `host: '127.0.0.1'`

## Result
✅ All connections now forced to IPv4 (127.0.0.1)
✅ No more EACCES errors on Windows
✅ Consistent port usage (5173)
✅ Playwright tests can connect reliably

## To Test
```bash
# Kill any running dev server
npm run dev

# In another terminal
npx playwright test
```

Should now connect successfully without EACCES errors.
