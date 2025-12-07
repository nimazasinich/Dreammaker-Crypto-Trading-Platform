/**
 * Simple Test Script for DataService
 * 
 * اسکریپت ساده برای تست سریع DataService
 * 
 * اجرا:
 * node test-dataservice.js
 */

// تنظیمات
const HF_API_URL = process.env.HF_API_URL || 'https://huggingface.co/spaces/Really-amin/Datasourceforcryptocurrency-2';
const HF_API_TOKEN = process.env.HF_API_TOKEN || ''; // Must be set via environment variable

console.log('╔════════════════════════════════════════════════════════════╗');
console.log('║         DataService Quick Test                            ║');
console.log('╚════════════════════════════════════════════════════════════╝\n');

console.log('Configuration:');
console.log(`  API URL: ${HF_API_URL}`);
console.log(`  Has Token: ${!!HF_API_TOKEN}`);
console.log(`  Token: ${HF_API_TOKEN.substring(0, 10)}...`);
console.log('');

// تابع کمکی برای درخواست HTTP
async function testEndpoint(endpoint, name) {
  const url = `${HF_API_URL}${endpoint}`;
  console.log(`Testing ${name}...`);
  console.log(`  URL: ${url}`);
  
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${HF_API_TOKEN}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      console.log(`  ✅ Success (${response.status})`);
      console.log(`  Data received: ${JSON.stringify(data).substring(0, 100)}...`);
      return { success: true, data };
    } else {
      console.log(`  ❌ Failed (${response.status})`);
      return { success: false, status: response.status };
    }
  } catch (error) {
    console.log(`  ❌ Error: ${error.message}`);
    return { success: false, error: error.message };
  }
  console.log('');
}

// اجرای تست‌ها
async function runTests() {
  console.log('Starting tests...\n');
  
  const tests = [
    { endpoint: '/health', name: 'Health Check' },
    { endpoint: '/api/market?limit=10', name: 'Market Data' },
    { endpoint: '/api/ohlcv?symbol=BTC&timeframe=1h&limit=10', name: 'Price Chart' },
    { endpoint: '/api/news/latest?limit=5', name: 'News' },
    { endpoint: '/api/sentiment/global', name: 'Sentiment' },
    { endpoint: '/api/stats', name: 'Market Stats' }
  ];
  
  const results = [];
  
  for (const test of tests) {
    const result = await testEndpoint(test.endpoint, test.name);
    results.push({ ...test, ...result });
    console.log('');
  }
  
  // خلاصه نتایج
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║         Test Results Summary                              ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');
  
  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  
  console.log(`Total Tests: ${results.length}`);
  console.log(`Successful: ${successful} ✅`);
  console.log(`Failed: ${failed} ❌`);
  console.log('');
  
  results.forEach(r => {
    const status = r.success ? '✅' : '❌';
    console.log(`${status} ${r.name}`);
  });
  
  console.log('');
  console.log('Test completed!');
}

// اجرا
runTests().catch(console.error);
