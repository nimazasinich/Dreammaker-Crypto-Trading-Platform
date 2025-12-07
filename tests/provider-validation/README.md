# 🧪 Automated Batch Test Framework

## Overview

Comprehensive automated testing framework for validating **all REST and WebSocket services** in a single batch run.

### Features

- ✅ **REST API Testing** - All HTTP endpoints with method validation
- ✅ **WebSocket Testing** - Connection, subscription, and message validation
- ✅ **Schema Validation** - Validates response structure matches expectations
- ✅ **Performance Metrics** - Measures response time for each service
- ✅ **Priority-Based Testing** - Tests critical services first
- ✅ **Detailed Reporting** - Generates JSON + Markdown reports
- ✅ **CI/CD Ready** - Exits with error code on failures

---

## Quick Start

### 1. Install Dependencies

```bash
cd tests/provider-validation
npm install
```

### 2. Configure Services

Edit `service-definitions.json` to match your deployment:

```json
{
  "baseUrl": "https://your-deployment.hf.space",
  "wsUrl": "wss://your-deployment.hf.space/ws",
  "timeout": 10000,
  "services": [...]
}
```

### 3. Run Tests

```bash
npm test
```

Or from project root:

```bash
npm run test:batch
```

---

## File Structure

```
tests/provider-validation/
├── batch-test-runner.ts          # Main test execution script
├── service-definitions.json      # Service configuration
├── package.json                  # Dependencies
├── README.md                     # This file
├── batch-test-report.json        # Generated: Machine-readable results
└── batch-test-report.md          # Generated: Human-readable results
```

---

## Service Definition Format

### REST Service Example

```json
{
  "name": "Health Check",
  "type": "REST",
  "method": "GET",
  "endpoint": "/api/health",
  "category": "System",
  "priority": "CRITICAL",
  "expectedMinimumResponse": {
    "status": "string",
    "timestamp": "string",
    "database": "string"
  }
}
```

### WebSocket Service Example

```json
{
  "name": "Market Data Subscribe",
  "type": "WS",
  "endpoint": "/ws",
  "category": "WebSocket",
  "priority": "CRITICAL",
  "subscribePayload": {
    "action": "subscribe",
    "service": "market_data",
    "symbols": ["BTCUSDT", "ETHUSDT"]
  },
  "expectedMinimumResponse": {
    "type": "string",
    "service": "string",
    "data": {}
  },
  "waitForMessages": 2,
  "messageTimeout": 10000
}
```

---

## Field Descriptions

### Common Fields

| Field | Required | Description |
|-------|----------|-------------|
| `name` | ✅ | Human-readable service name |
| `type` | ✅ | `"REST"` or `"WS"` |
| `endpoint` | ✅ | API endpoint path |
| `category` | ✅ | Grouping category for reporting |
| `priority` | ✅ | `"CRITICAL"`, `"HIGH"`, `"MEDIUM"`, `"LOW"` |
| `expectedMinimumResponse` | ✅ | Schema for response validation |

### REST-Specific Fields

| Field | Required | Description |
|-------|----------|-------------|
| `method` | ✅ | HTTP method: `"GET"`, `"POST"`, `"PUT"`, `"DELETE"` |

### WebSocket-Specific Fields

| Field | Required | Description |
|-------|----------|-------------|
| `subscribePayload` | ❌ | JSON payload to send after connection |
| `waitForMessages` | ❌ | Number of messages to wait for (default: 1) |
| `messageTimeout` | ❌ | Timeout in ms for receiving messages (default: global timeout) |

---

## Test Result Statuses

| Status | Icon | Meaning |
|--------|------|---------|
| `PASS` | ✅ | Service working correctly, response valid |
| `FAIL` | ❌ | Service not responding or returning errors |
| `WARN` | ⚠️ | Service responding but validation warnings |
| `SKIP` | ⏭️ | Test skipped (not implemented) |

---

## Reports Generated

### 1. JSON Report (`batch-test-report.json`)

Machine-readable format for CI/CD integration:

```json
{
  "summary": {
    "totalTests": 21,
    "passed": 15,
    "failed": 4,
    "warnings": 2,
    "skipped": 0,
    "duration": 12345,
    "timestamp": "2025-12-03T..."
  },
  "results": [...],
  "criticalFailures": [...],
  "recommendations": [...]
}
```

### 2. Markdown Report (`batch-test-report.md`)

Human-readable format with:
- Summary table
- Critical failures section
- Recommendations
- Results grouped by category
- Detailed results for each service

---

## Usage Examples

### Test Production Deployment

```bash
# Edit service-definitions.json:
{
  "baseUrl": "https://Really-amin-Datasourceforcryptocurrency-2.hf.space",
  ...
}

# Run tests
npm test
```

### Test Local Development

```bash
# Edit service-definitions.json:
{
  "baseUrl": "http://localhost:8000",
  "wsUrl": "ws://localhost:8000/ws",
  ...
}

# Run tests
npm test
```

### CI/CD Integration

```yaml
# .github/workflows/test.yml
- name: Run API Tests
  run: |
    cd tests/provider-validation
    npm install
    npm test
  # Will exit with code 1 if any tests fail
```

---

## Response Schema Validation

The framework validates responses match expected structure:

### Simple Type Validation

```json
{
  "expectedMinimumResponse": {
    "status": "string",
    "count": "number",
    "items": "array",
    "enabled": "boolean"
  }
}
```

### Nested Object Validation

```json
{
  "expectedMinimumResponse": {
    "data": {
      "price": "number",
      "pair": "string"
    }
  }
}
```

### Validation Errors

If response doesn't match schema, test status is `WARN` with details:

```
Validation Errors:
  - Missing field: timestamp
  - Field 'count': expected number, got string
  - data.price: expected number, got undefined
```

---

## Troubleshooting

### "Cannot find module 'ws'"

```bash
cd tests/provider-validation
npm install
```

### "Connection refused" errors

- Check `baseUrl` and `wsUrl` in `service-definitions.json`
- Verify deployment is running
- Check network/firewall settings

### All WebSocket tests failing

- Check nginx WebSocket configuration
- Verify upgrade headers are set correctly
- Test WebSocket manually in browser console:

```javascript
const ws = new WebSocket('wss://your-url.hf.space/ws');
ws.onopen = () => console.log('Connected');
ws.onmessage = (e) => console.log('Message:', e.data);
```

### Timeout errors

Increase timeout in `service-definitions.json`:

```json
{
  "timeout": 30000,  // 30 seconds
  ...
}
```

---

## Advanced Usage

### Run Specific Categories

Edit `batch-test-runner.ts` to filter by category:

```typescript
const filteredServices = serviceDefinition.services
  .filter(s => s.category === 'System');
```

### Add Custom Validation

Extend `validateResponseSchema` function:

```typescript
function validateResponseSchema(response: any, expectedSchema: any): string[] {
  const errors: string[] = [];

  // Add custom validation logic
  if (response.status === 'unhealthy') {
    errors.push('Service reports unhealthy status');
  }

  return errors;
}
```

### Test with Authentication

Add headers to REST requests:

```typescript
const response = await fetch(url, {
  method: service.method || 'GET',
  headers: {
    'Authorization': `Bearer ${process.env.API_TOKEN}`,
    'Accept': 'application/json'
  }
});
```

---

## Best Practices

1. **Test Critical Services First**
   - Use `"priority": "CRITICAL"` for essential endpoints
   - Framework reports critical failures separately

2. **Keep Timeouts Reasonable**
   - Default: 10 seconds
   - Increase for slow endpoints
   - Decrease for fast health checks

3. **Validate Minimum Required Fields**
   - Don't validate every field (too brittle)
   - Focus on critical fields that must exist

4. **Run Tests After Every Deployment**
   - Catches regressions immediately
   - Validates configuration changes

5. **Monitor Test Duration**
   - Slow tests indicate performance issues
   - Set baseline and alert on degradation

---

## Integration with Main Project

Add to root `package.json`:

```json
{
  "scripts": {
    "test:batch": "cd tests/provider-validation && npm install && npm test",
    "test:api": "npm run test:batch"
  }
}
```

Then run from project root:

```bash
npm run test:batch
```

---

## Example Output

```
🚀 Starting Batch Test Runner...

✅ Loaded 21 service definitions

Testing: Health Check (REST)...
  ✅ PASS (245ms)

Testing: Models Status (REST)...
  ⚠️ WARN (312ms)
  ⚠️  Validation warning: Field 'models_loaded' is 0

Testing: Market Data - Prices (REST)...
  ❌ FAIL (10015ms)
  ⚠️  Timeout after 10000ms

...

============================================================
📈 TEST SUMMARY
============================================================
Total Tests:    21
✅ Passed:      15
❌ Failed:      4
⚠️  Warnings:    2
⏭️  Skipped:     0
Duration:       32.45s
Success Rate:   71.4%
============================================================

🚨 CRITICAL FAILURES:
  ❌ Health Check: HTTP 500: Internal Server Error

💡 RECOMMENDATIONS:
  - 4 test(s) failed - review error details and fix issues
  - 2 test(s) have validation warnings - verify response schemas
  - CRITICAL: Core services are failing - deployment may be broken

✨ Testing complete!
```

---

## Contributing

To add new tests:

1. Add service definition to `service-definitions.json`
2. Run tests: `npm test`
3. Check reports for validation errors
4. Adjust `expectedMinimumResponse` as needed

---

## License

Unlicense - Public Domain

---

## Support

For issues or questions:
1. Check `batch-test-report.md` for detailed error messages
2. Review service configuration in `service-definitions.json`
3. Verify deployment is accessible
4. Check browser console for additional clues
