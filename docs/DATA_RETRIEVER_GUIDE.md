# DataRetriever Service Guide

## HTTP-First Data Retrieval with Automatic WebSocket Fallback

This guide explains how to use the **DataRetriever** service, which implements an HTTP-first approach to data retrieval with automatic WebSocket fallback when HTTP requests fail.

---

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Installation & Setup](#installation--setup)
4. [Configuration](#configuration)
5. [Usage](#usage)
6. [API Reference](#api-reference)
7. [Integration with DatasourceClient](#integration-with-datasourceclient)
8. [Error Handling](#error-handling)
9. [Best Practices](#best-practices)
10. [Troubleshooting](#troubleshooting)

---

## Overview

The **DataRetriever** service provides a robust data fetching mechanism that:

- ✅ **Prefers HTTP requests** for reliability and performance
- ✅ **Automatically falls back to WebSocket** when HTTP fails
- ✅ Supports **Bearer token authentication**
- ✅ Configurable **timeouts and retry logic**
- ✅ Works in both **browser and Node.js** environments
- ✅ **Integrated with DatasourceClient** for seamless fallback

### Key Features

- **HTTP-First Approach**: Always attempts HTTP requests first for better reliability
- **WebSocket Fallback**: Automatically switches to WebSocket if HTTP fails
- **Authentication**: Built-in Bearer token authentication support
- **Timeout Management**: Configurable connection and request timeouts
- **Promise-Based API**: Modern async/await interface
- **Singleton Pattern**: Optional singleton instance for consistent configuration

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Data Request Flow                        │
└─────────────────────────────────────────────────────────────┘

    Application Code
         │
         ▼
    DataRetriever.getDataWithFallback()
         │
         ├──► Try HTTP Request (fetch)
         │    │
         │    ├──► ✅ Success → Return Data
         │    │
         │    └──► ❌ Failure (timeout/error)
         │             │
         │             ▼
         └──► Fallback to WebSocket
              │
              ├──► Connect to WebSocket
              │    │
              │    ├──► Subscribe to Service
              │    │    │
              │    │    ├──► ✅ Receive Data → Return Data
              │    │    │
              │    │    └──► ❌ Failure → Throw Error
              │    │
              │    └──► Close Connection
              │
              └──► Return Result
```

---

## Installation & Setup

### 1. Environment Variables

Add the following environment variables to your `.env` file:

```bash
# HuggingFace API URL (for HTTP-first data retrieval)
HF_API_URL=https://Really-amin-Datasourceforcryptocurrency-2.hf.space
VITE_HF_API_URL=https://Really-amin-Datasourceforcryptocurrency-2.hf.space

# HuggingFace API Token (for authenticated requests)
# Get yours at: https://huggingface.co/settings/tokens
HF_API_TOKEN=your_token_here
VITE_HF_API_TOKEN=your_token_here

# Optional: Disable fallback mechanism
# VITE_DISABLE_FALLBACK=false
# DISABLE_FALLBACK=false
```

### 2. Import the Service

```typescript
// Import the class
import { DataRetriever } from '@/services/DataRetriever';

// Or import the singleton instance
import { dataRetriever } from '@/services/DataRetriever';
```

---

## Configuration

### Default Configuration

```typescript
const retriever = new DataRetriever();
// Uses environment variables or defaults
```

### Custom Configuration

```typescript
const retriever = new DataRetriever({
  apiBase: 'https://your-api.hf.space',
  apiToken: 'your-bearer-token',
  connectionTimeout: 10000,  // 10 seconds
  requestTimeout: 30000,     // 30 seconds
});
```

### Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `apiBase` | `string` | From env or default URL | Base URL for HTTP requests |
| `apiToken` | `string` | From env or empty | Bearer token for authentication |
| `connectionTimeout` | `number` | `10000` (10s) | WebSocket connection timeout (ms) |
| `requestTimeout` | `number` | `30000` (30s) | HTTP request timeout (ms) |

### Runtime Configuration Update

```typescript
const retriever = new DataRetriever();

// Update configuration at runtime
retriever.updateConfig({
  apiBase: 'https://new-api.hf.space',
  apiToken: 'new-token',
  requestTimeout: 20000,
});

// Get current configuration
const config = retriever.getConfig();
console.log(config);
// Output:
// {
//   apiBase: 'https://new-api.hf.space',
//   wsBase: 'wss://new-api.hf.space',
//   hasToken: true,
//   connectionTimeout: 10000,
//   requestTimeout: 20000
// }
```

---

## Usage

### Basic Usage

```typescript
import { DataRetriever } from '@/services/DataRetriever';

const retriever = new DataRetriever();

// Fetch market data
const marketData = await retriever.getMarketData(10);
console.log(marketData);
```

### Using Built-in Methods

```typescript
// Get market data (top N coins)
const coins = await retriever.getMarketData(100);

// Get price chart data
const chart = await retriever.getPriceChart('BTC', '1h', 100);

// Get market statistics
const stats = await retriever.getMarketStats();

// Get latest news
const news = await retriever.getLatestNews(10);

// Get market sentiment
const sentiment = await retriever.getMarketSentiment();

// Get AI prediction (POST request)
const prediction = await retriever.getAIPrediction({
  symbol: 'BTC',
  timeframe: '1h',
});
```

### Custom API Calls

```typescript
// Custom GET request
const data = await retriever.getDataWithFallback(
  '/api/custom-endpoint?param=value',
  'GET'
);

// Custom POST request
const result = await retriever.getDataWithFallback(
  '/api/endpoint',
  'POST',
  { key: 'value' }
);

// Custom PUT request
const updated = await retriever.getDataWithFallback(
  '/api/endpoint/123',
  'PUT',
  { field: 'new-value' }
);

// Custom DELETE request
const deleted = await retriever.getDataWithFallback(
  '/api/endpoint/123',
  'DELETE'
);
```

### TypeScript Type Safety

```typescript
interface MarketPrice {
  symbol: string;
  price: number;
  change24h: number;
}

// Type-safe API call
const coins = await retriever.getDataWithFallback<MarketPrice[]>(
  '/api/market?limit=10'
);

// Now coins is typed as MarketPrice[]
coins.forEach(coin => {
  console.log(`${coin.symbol}: $${coin.price}`);
});
```

---

## API Reference

### Class: `DataRetriever`

#### Constructor

```typescript
constructor(config?: {
  apiBase?: string;
  apiToken?: string;
  connectionTimeout?: number;
  requestTimeout?: number;
})
```

Creates a new DataRetriever instance with optional configuration.

#### Methods

##### `getDataWithFallback<T>(endpoint, method?, payload?): Promise<T>`

Main method that tries HTTP first, then falls back to WebSocket.

**Parameters:**
- `endpoint` (string): API endpoint path (e.g., `/api/market?limit=100`)
- `method` (string, optional): HTTP method - `'GET'`, `'POST'`, `'PUT'`, `'DELETE'` (default: `'GET'`)
- `payload` (any, optional): Request payload for POST/PUT requests

**Returns:** Promise resolving to typed response data

**Example:**
```typescript
const data = await retriever.getDataWithFallback<MarketData[]>(
  '/api/market?limit=10',
  'GET'
);
```

##### `getMarketData(limit?): Promise<any>`

Fetch top cryptocurrency market data.

**Parameters:**
- `limit` (number, optional): Number of coins to fetch (default: 100)

**Returns:** Promise resolving to market data array

##### `getPriceChart(symbol, timeframe?, limit?): Promise<any>`

Fetch price chart (OHLCV) data for a symbol.

**Parameters:**
- `symbol` (string): Cryptocurrency symbol (e.g., `'BTC'`, `'ETH'`)
- `timeframe` (string, optional): Timeframe - `'1m'`, `'5m'`, `'1h'`, `'4h'`, `'1d'` (default: `'1h'`)
- `limit` (number, optional): Number of data points (default: 100)

**Returns:** Promise resolving to chart data array

##### `getMarketStats(): Promise<any>`

Fetch overall market statistics.

**Returns:** Promise resolving to market stats object

##### `getLatestNews(limit?): Promise<any>`

Fetch latest cryptocurrency news.

**Parameters:**
- `limit` (number, optional): Number of news items (default: 10)

**Returns:** Promise resolving to news array

##### `getMarketSentiment(): Promise<any>`

Fetch market sentiment data.

**Returns:** Promise resolving to sentiment object

##### `getAIPrediction(payload): Promise<any>`

Get AI prediction for a cryptocurrency.

**Parameters:**
- `payload` (object): Prediction request payload

**Returns:** Promise resolving to prediction data

##### `updateConfig(config): void`

Update configuration at runtime.

**Parameters:**
- `config` (object): Partial configuration to update

##### `getConfig(): object`

Get current configuration.

**Returns:** Current configuration object

---

## Integration with DatasourceClient

The **DatasourceClient** automatically uses **DataRetriever** as a fallback mechanism.

### How It Works

```typescript
import DatasourceClient from '@/services/DatasourceClient';

// When you call DatasourceClient methods:
const coins = await DatasourceClient.getTopCoins(10);

// The flow is:
// 1. Try primary HTTP request to localhost:8001
// 2. If that fails, automatically try DataRetriever
// 3. DataRetriever tries HuggingFace HTTP
// 4. If that fails, DataRetriever falls back to WebSocket
```

### Three-Layer Fallback System

```
Layer 1: DatasourceClient (localhost:8001)
    ↓ [fails]
Layer 2: DataRetriever HTTP (HuggingFace)
    ↓ [fails]
Layer 3: DataRetriever WebSocket (HuggingFace)
```

### Disabling Fallback

To disable the DataRetriever fallback in DatasourceClient:

```bash
# In .env file
VITE_DISABLE_FALLBACK=true
DISABLE_FALLBACK=true
```

---

## Error Handling

### Try-Catch Pattern

```typescript
try {
  const data = await retriever.getMarketData(10);
  console.log('Success:', data);
} catch (error) {
  console.error('Both HTTP and WebSocket failed:', error);
  // Handle error appropriately
}
```

### Common Errors

| Error | Cause | Solution |
|-------|-------|----------|
| `Request timeout after Xms` | HTTP request timed out | Increase `requestTimeout` |
| `WebSocket connection timeout` | WebSocket couldn't connect | Check network/firewall |
| `HTTP error! status: 401` | Invalid or missing API token | Set `HF_API_TOKEN` |
| `HTTP error! status: 404` | Endpoint doesn't exist | Check endpoint path |
| `WebSocket closed before receiving data` | WebSocket disconnected early | Check server status |

### Graceful Degradation

```typescript
async function fetchDataWithGracefulDegradation() {
  try {
    // Try DataRetriever (HTTP + WebSocket fallback)
    return await retriever.getMarketData(10);
  } catch (error) {
    console.warn('DataRetriever failed, using mock data');
    // Return mock/cached data as last resort
    return getMockMarketData();
  }
}
```

---

## Best Practices

### 1. Use Singleton for Consistent Configuration

```typescript
// services/dataRetrieverInstance.ts
import { DataRetriever } from './DataRetriever';

export const appDataRetriever = new DataRetriever({
  requestTimeout: 20000,
  connectionTimeout: 8000,
});

// Use throughout your app
import { appDataRetriever } from '@/services/dataRetrieverInstance';
const data = await appDataRetriever.getMarketData(10);
```

### 2. Set Appropriate Timeouts

```typescript
// For real-time data (short timeout)
const realTimeRetriever = new DataRetriever({
  requestTimeout: 5000,
  connectionTimeout: 3000,
});

// For batch operations (longer timeout)
const batchRetriever = new DataRetriever({
  requestTimeout: 60000,
  connectionTimeout: 10000,
});
```

### 3. Handle Loading States

```typescript
const [loading, setLoading] = useState(false);
const [data, setData] = useState(null);
const [error, setError] = useState(null);

async function fetchData() {
  setLoading(true);
  setError(null);

  try {
    const result = await retriever.getMarketData(10);
    setData(result);
  } catch (err) {
    setError(err);
  } finally {
    setLoading(false);
  }
}
```

### 4. Implement Retry Logic

```typescript
async function fetchWithRetry(maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await retriever.getMarketData(10);
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
}
```

### 5. Cache Results

```typescript
const cache = new Map();

async function fetchWithCache(endpoint: string, ttl = 60000) {
  const cached = cache.get(endpoint);

  if (cached && Date.now() - cached.timestamp < ttl) {
    return cached.data;
  }

  const data = await retriever.getDataWithFallback(endpoint);
  cache.set(endpoint, { data, timestamp: Date.now() });

  return data;
}
```

---

## Troubleshooting

### Issue: "Failed to fetch" errors

**Cause:** Network connectivity issues or CORS problems

**Solution:**
1. Check your internet connection
2. Verify the API URL is correct
3. Check browser console for CORS errors
4. Try accessing the API URL directly in browser

### Issue: "WebSocket connection failed"

**Cause:** WebSocket connection blocked or server down

**Solution:**
1. Check if WebSocket endpoint exists at `/ws`
2. Verify firewall isn't blocking WebSocket connections
3. Check if server supports WebSocket protocol
4. Try using `wss://` instead of `ws://` for secure connection

### Issue: "Request timeout after 30000ms"

**Cause:** Slow network or server response

**Solution:**
1. Increase timeout: `retriever.updateConfig({ requestTimeout: 60000 })`
2. Check server status and load
3. Verify endpoint isn't doing heavy computation

### Issue: "HTTP error! status: 401"

**Cause:** Invalid or missing authentication token

**Solution:**
1. Set `HF_API_TOKEN` in `.env` file
2. Get a valid token from [HuggingFace](https://huggingface.co/settings/tokens)
3. Verify token hasn't expired

### Issue: "Empty response"

**Cause:** Server returned null or undefined

**Solution:**
1. Check if endpoint exists and is working
2. Verify request parameters are correct
3. Check server logs for errors

---

## Examples

See [DataRetrieverExample.ts](../examples/DataRetrieverExample.ts) for comprehensive usage examples including:

- Basic usage with default configuration
- Custom configuration
- Environment variables
- Different data types
- Custom API calls
- Error handling
- Runtime configuration
- Singleton usage
- Integration with DatasourceClient
- Response format handling

---

---

## Comprehensive Data Validation & Health Checks

The DataRetriever service includes advanced features for ensuring all data requirements are met and validated.

### Health Check All Data Sources

Check the health and availability of all critical data endpoints:

```typescript
const retriever = new DataRetriever();

const healthCheck = await retriever.healthCheckAllDataSources();

console.log('Overall Status:', healthCheck.overall); // 'healthy' | 'degraded' | 'unhealthy'
console.log('Results:', healthCheck.results);

// Example output:
// {
//   overall: 'healthy',
//   timestamp: 1701705600000,
//   results: [
//     { endpoint: '/api/market?limit=10', name: 'Market Data', status: 'healthy', method: 'http' },
//     { endpoint: '/api/market/history?symbol=BTC&timeframe=1h&limit=10', name: 'Price Charts (OHLCV)', status: 'healthy', method: 'http' },
//     { endpoint: '/api/news/latest?limit=5', name: 'News', status: 'healthy', method: 'http' },
//     { endpoint: '/api/sentiment', name: 'Sentiment', status: 'healthy', method: 'http' },
//     { endpoint: '/api/stats', name: 'Market Stats', status: 'healthy', method: 'http' }
//   ]
// }
```

### Check and Fetch All Required Data

Systematically fetch all critical data with automatic validation:

```typescript
const result = await retriever.checkAndFetchAllData({
  marketDataLimit: 100,
  chartSymbol: 'BTC',
  chartTimeframe: '1h',
  chartLimit: 100,
  newsLimit: 10,
  includeAIPrediction: true,
  aiPredictionSymbol: 'BTC',
});

console.log('Success:', result.success);
console.log('Summary:', result.summary);
// {
//   total: 6,
//   successful: 6,
//   failed: 0,
//   validationPassed: 6,
//   validationFailed: 0
// }

// Access individual data results
if (result.data.marketData.valid) {
  console.log('Market data:', result.data.marketData.data);
}

if (result.data.priceChart.valid) {
  console.log('Chart data:', result.data.priceChart.data);
}
```

### Data Validation

The DataRetriever automatically validates all fetched data:

- **Market Data**: Validates array structure and required fields (symbol, price)
- **Chart Data**: Validates OHLCV fields (open, high, low, close, volume)
- **News Data**: Validates article structure (title, url)
- **Sentiment Data**: Validates sentiment fields (fearGreedIndex, sentiment, score)
- **Market Stats**: Validates stats fields (totalMarketCap, totalVolume24h, btcDominance)
- **AI Predictions**: Validates prediction fields (action, confidence, prediction)

### Quick Availability Check

Check if the data source is available before making requests:

```typescript
const isAvailable = await retriever.isAvailable();

if (isAvailable) {
  // Proceed with data fetching
  const data = await retriever.getMarketData(100);
} else {
  // Use cached data or show offline mode
  console.log('Data source unavailable, using fallback');
}
```

### Application Startup Checks

Use comprehensive data checks during application startup:

```typescript
async function startupCheck() {
  const retriever = new DataRetriever();

  // 1. Check configuration
  const config = retriever.getConfig();
  console.log('Configuration:', config);

  // 2. Run health check
  const health = await retriever.healthCheckAllDataSources();
  if (health.overall === 'unhealthy') {
    throw new Error('Data sources unhealthy, cannot start application');
  }

  // 3. Fetch initial data
  const data = await retriever.checkAndFetchAllData({
    marketDataLimit: 100,
    newsLimit: 10,
  });

  if (!data.success) {
    throw new Error('Failed to fetch initial data');
  }

  console.log('Application ready!');
  return data;
}
```

### Periodic Health Monitoring

Monitor data source health over time:

```typescript
setInterval(async () => {
  const health = await retriever.healthCheckAllDataSources();

  if (health.overall === 'unhealthy') {
    console.error('⚠️  Data sources are unhealthy!');
    // Send alerts or notifications
  }

  console.log(`Health: ${health.overall} (${health.results.filter(r => r.status === 'healthy').length}/${health.results.length} healthy)`);
}, 60000); // Check every minute
```

---

## Summary

The **DataRetriever** service provides a robust, HTTP-first data fetching mechanism with automatic WebSocket fallback. It's designed to be:

- **Reliable**: Always tries the most reliable method first (HTTP)
- **Resilient**: Automatically falls back to WebSocket when needed
- **Flexible**: Supports custom endpoints and methods
- **Secure**: Built-in authentication support
- **Easy to use**: Simple Promise-based API
- **Comprehensive**: Built-in validation and health checks for all data types
- **Production-ready**: Includes monitoring and quality assurance features

### Key Features Summary

✅ **HTTP-First with WebSocket Fallback**
✅ **Automatic Data Validation**
✅ **Health Check All Endpoints**
✅ **Comprehensive Data Fetching**
✅ **Quality Assurance**
✅ **Configuration Management**
✅ **Error Handling & Resilience**

For more information or support, please check the [examples](../examples/DataRetrieverExample.ts) and [ComprehensiveDataCheck.ts](../examples/ComprehensiveDataCheck.ts) or open an issue on GitHub.

---

**Last Updated:** 2025-12-04
**Version:** 2.0.0
