/**
 * DataRetriever Example Usage
 *
 * This file demonstrates how to use the DataRetriever service
 * for HTTP-first data retrieval with automatic WebSocket fallback.
 *
 * Run this file with: npx ts-node examples/DataRetrieverExample.ts
 */

import { DataRetriever } from '../src/services/DataRetriever';

// ============================================================================
// Example 1: Basic Usage with Default Configuration
// ============================================================================
async function example1_BasicUsage() {
  console.log('\n=== Example 1: Basic Usage ===\n');

  // Create a DataRetriever instance with default configuration
  const retriever = new DataRetriever();

  try {
    // Fetch market data (will try HTTP first, then WebSocket if HTTP fails)
    const marketData = await retriever.getMarketData(10);
    console.log('Market Data:', marketData);
  } catch (error) {
    console.error('Failed to fetch market data:', error);
  }
}

// ============================================================================
// Example 2: Custom Configuration
// ============================================================================
async function example2_CustomConfiguration() {
  console.log('\n=== Example 2: Custom Configuration ===\n');

  // Create a DataRetriever with custom configuration
  const retriever = new DataRetriever({
    apiBase: 'https://your-custom-api.hf.space',
    apiToken: 'your-api-token-here',
    connectionTimeout: 5000,  // 5 seconds
    requestTimeout: 15000,    // 15 seconds
  });

  // Check current configuration
  const config = retriever.getConfig();
  console.log('Current Config:', config);

  try {
    const marketData = await retriever.getMarketData(5);
    console.log('Market Data:', marketData);
  } catch (error) {
    console.error('Failed to fetch market data:', error);
  }
}

// ============================================================================
// Example 3: Using Environment Variables
// ============================================================================
async function example3_EnvironmentVariables() {
  console.log('\n=== Example 3: Environment Variables ===\n');

  // The DataRetriever automatically reads from environment variables:
  // - HF_API_URL or VITE_HF_API_URL
  // - HF_API_TOKEN or VITE_HF_API_TOKEN

  // Set environment variables before creating the instance:
  process.env.HF_API_URL = 'https://Really-amin-Datasourceforcryptocurrency-2.hf.space';
  process.env.HF_API_TOKEN = 'your-token-here';

  const retriever = new DataRetriever();
  const config = retriever.getConfig();
  console.log('Config from env vars:', config);
}

// ============================================================================
// Example 4: Fetching Different Types of Data
// ============================================================================
async function example4_DifferentDataTypes() {
  console.log('\n=== Example 4: Different Data Types ===\n');

  const retriever = new DataRetriever();

  try {
    // Fetch market data
    console.log('Fetching top 10 coins...');
    const marketData = await retriever.getMarketData(10);
    console.log(`Fetched ${marketData.length} coins`);

    // Fetch price chart
    console.log('\nFetching BTC price chart...');
    const priceChart = await retriever.getPriceChart('BTC', '1h', 24);
    console.log(`Fetched ${priceChart.length} price points`);

    // Fetch market stats
    console.log('\nFetching market statistics...');
    const stats = await retriever.getMarketStats();
    console.log('Market Stats:', stats);

    // Fetch latest news
    console.log('\nFetching latest news...');
    const news = await retriever.getLatestNews(5);
    console.log(`Fetched ${news.length} news items`);

    // Fetch market sentiment
    console.log('\nFetching market sentiment...');
    const sentiment = await retriever.getMarketSentiment();
    console.log('Sentiment:', sentiment);
  } catch (error) {
    console.error('Error fetching data:', error);
  }
}

// ============================================================================
// Example 5: Making Custom API Calls
// ============================================================================
async function example5_CustomAPICalls() {
  console.log('\n=== Example 5: Custom API Calls ===\n');

  const retriever = new DataRetriever();

  try {
    // Custom GET request
    console.log('Custom GET request...');
    const customData = await retriever.getDataWithFallback(
      '/api/custom-endpoint?param=value',
      'GET'
    );
    console.log('Custom Data:', customData);

    // Custom POST request with payload
    console.log('\nCustom POST request...');
    const postData = await retriever.getDataWithFallback(
      '/api/ai/predict',
      'POST',
      {
        symbol: 'BTC',
        timeframe: '1h',
        model: 'lstm',
      }
    );
    console.log('Prediction:', postData);
  } catch (error) {
    console.error('Error with custom API call:', error);
  }
}

// ============================================================================
// Example 6: Error Handling and Retries
// ============================================================================
async function example6_ErrorHandling() {
  console.log('\n=== Example 6: Error Handling ===\n');

  const retriever = new DataRetriever({
    requestTimeout: 5000,  // Short timeout to demonstrate fallback
  });

  try {
    // This will first try HTTP, and if it times out or fails,
    // it will automatically fall back to WebSocket
    const data = await retriever.getMarketData(10);
    console.log('Successfully fetched data (HTTP or WebSocket)');
  } catch (error: any) {
    // If both HTTP and WebSocket fail, we'll end up here
    console.error('Both HTTP and WebSocket failed:', error.message);
  }
}

// ============================================================================
// Example 7: Updating Configuration at Runtime
// ============================================================================
async function example7_RuntimeConfiguration() {
  console.log('\n=== Example 7: Runtime Configuration ===\n');

  const retriever = new DataRetriever();

  // Get initial config
  console.log('Initial Config:', retriever.getConfig());

  // Update configuration
  retriever.updateConfig({
    apiBase: 'https://new-api-base.hf.space',
    apiToken: 'new-token',
    requestTimeout: 20000,
  });

  // Get updated config
  console.log('Updated Config:', retriever.getConfig());
}

// ============================================================================
// Example 8: Using Singleton Instance
// ============================================================================
async function example8_SingletonUsage() {
  console.log('\n=== Example 8: Singleton Usage ===\n');

  // Import the singleton instance
  const { dataRetriever } = await import('../src/services/DataRetriever');

  try {
    const marketData = await dataRetriever.getMarketData(5);
    console.log('Market Data from singleton:', marketData);
  } catch (error) {
    console.error('Error:', error);
  }
}

// ============================================================================
// Example 9: Integration with DatasourceClient
// ============================================================================
async function example9_IntegrationWithDatasourceClient() {
  console.log('\n=== Example 9: Integration with DatasourceClient ===\n');

  // The DatasourceClient automatically uses DataRetriever as fallback
  const { default: DatasourceClient } = await import('../src/services/DatasourceClient');

  try {
    // If the primary HTTP request to localhost:8001 fails,
    // it will automatically fall back to DataRetriever
    // which tries HuggingFace HTTP first, then WebSocket
    const marketData = await DatasourceClient.getTopCoins(10);
    console.log('Market Data via DatasourceClient:', marketData);
  } catch (error) {
    console.error('Error:', error);
  }
}

// ============================================================================
// Example 10: Handling Different Response Formats
// ============================================================================
async function example10_ResponseFormats() {
  console.log('\n=== Example 10: Response Formats ===\n');

  const retriever = new DataRetriever();

  try {
    // The DataRetriever handles both direct arrays and wrapped responses
    // Example: [data, data, ...] or { success: true, items: [...] }

    const response = await retriever.getDataWithFallback<{
      success: boolean;
      items: any[];
    }>('/api/market?limit=5');

    console.log('Response format:', response);

    // Access data appropriately based on format
    if (Array.isArray(response)) {
      console.log(`Direct array with ${response.length} items`);
    } else if (response.success && response.items) {
      console.log(`Wrapped response with ${response.items.length} items`);
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

// ============================================================================
// Run All Examples
// ============================================================================
async function runAllExamples() {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║         DataRetriever Example Usage                       ║');
  console.log('║  HTTP-First with Automatic WebSocket Fallback             ║');
  console.log('╚════════════════════════════════════════════════════════════╝');

  // Uncomment the examples you want to run
  // await example1_BasicUsage();
  // await example2_CustomConfiguration();
  // await example3_EnvironmentVariables();
  // await example4_DifferentDataTypes();
  // await example5_CustomAPICalls();
  // await example6_ErrorHandling();
  // await example7_RuntimeConfiguration();
  // await example8_SingletonUsage();
  // await example9_IntegrationWithDatasourceClient();
  // await example10_ResponseFormats();

  console.log('\n✅ Examples completed!\n');
}

// Run if executed directly
if (require.main === module) {
  runAllExamples().catch(console.error);
}

// Export for use in other files
export {
  example1_BasicUsage,
  example2_CustomConfiguration,
  example3_EnvironmentVariables,
  example4_DifferentDataTypes,
  example5_CustomAPICalls,
  example6_ErrorHandling,
  example7_RuntimeConfiguration,
  example8_SingletonUsage,
  example9_IntegrationWithDatasourceClient,
  example10_ResponseFormats,
};
