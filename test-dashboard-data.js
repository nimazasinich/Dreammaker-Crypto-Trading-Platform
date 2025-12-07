const HF_API_URL = 'https://really-amin-datasourceforcryptocurrency-2.hf.space';
const HF_API_TOKEN = process.env.HF_API_TOKEN || 'hf_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'; // Use environment variable

console.log('=== Dashboard Data Test ===\n');
console.log('API URL:', HF_API_URL);
console.log('Token:', HF_API_TOKEN.substring(0, 10) + '...\n');

async function testEndpoint(endpoint, name) {
  const url = `${HF_API_URL}${endpoint}`;
  console.log(`Testing ${name}...`);
  
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
      console.log(`✅ ${name}: OK (${response.status})`);
      console.log(`   Data sample:`, JSON.stringify(data).substring(0, 100) + '...\n');
      return { success: true, data };
    } else {
      console.log(`❌ ${name}: FAILED (${response.status})`);
      const text = await response.text();
      console.log(`   Error:`, text.substring(0, 100) + '...\n');
      return { success: false, status: response.status };
    }
  } catch (error) {
    console.log(`❌ ${name}: ERROR`);
    console.log(`   ${error.message}\n`);
    return { success: false, error: error.message };
  }
}

async function runTests() {
  const tests = [
    { endpoint: '/health', name: 'Health Check' },
    { endpoint: '/api/market?limit=10', name: 'Market Data' },
    { endpoint: '/api/ohlcv?symbol=BTC&timeframe=1h&limit=10', name: 'Price Chart (OHLCV)' },
    { endpoint: '/api/news/latest?limit=5', name: 'Latest News' },
    { endpoint: '/api/sentiment/global', name: 'Market Sentiment' },
    { endpoint: '/api/stats', name: 'Market Stats' }
  ];
  
  const results = [];
  
  for (const test of tests) {
    const result = await testEndpoint(test.endpoint, test.name);
    results.push({ ...test, ...result });
  }
  
  console.log('=== Test Summary ===');
  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  
  console.log(`Total: ${results.length}`);
  console.log(`Successful: ${successful} ✅`);
  console.log(`Failed: ${failed} ❌\n`);
  
  results.forEach(r => {
    const status = r.success ? '✅' : '❌';
    console.log(`${status} ${r.name}`);
  });
}

runTests().catch(console.error);
