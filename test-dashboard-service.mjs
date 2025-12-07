import fetch from 'node-fetch';
global.fetch = fetch;

const HF_API_URL = 'https://really-amin-datasourceforcryptocurrency-2.hf.space';
const HF_API_TOKEN = process.env.HF_API_TOKEN || 'hf_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'; // Use environment variable

class SimpleDataService {
  constructor() {
    this.baseUrl = HF_API_URL;
    this.token = HF_API_TOKEN;
    this.timeout = 30000;
  }

  async fetchFromService(endpoint, method = 'GET', body = null) {
    const url = `${this.baseUrl}${endpoint}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      };

      if (this.token) {
        headers['Authorization'] = `Bearer ${this.token}`;
      }

      const response = await fetch(url, {
        method,
        headers,
        body: body ? JSON.stringify(body) : null,
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return { success: true, data, status: response.status, method: 'http' };

    } catch (error) {
      clearTimeout(timeoutId);
      console.error(`Request failed for ${endpoint}:`, error.message);
      return { success: false, error: error.message, status: 500 };
    }
  }

  async getMarketData(limit = 100) {
    return this.fetchFromService(`/api/market?limit=${limit}`);
  }

  async getPriceChart(symbol, timeframe = '1h', limit = 100) {
    return this.fetchFromService(`/api/ohlcv?symbol=${symbol}&timeframe=${timeframe}&limit=${limit}`);
  }

  async getNews(limit = 10) {
    return this.fetchFromService(`/api/news/latest?limit=${limit}`);
  }

  async getSentiment() {
    return this.fetchFromService('/api/sentiment/global');
  }

  async getMarketStats() {
    return this.fetchFromService('/api/stats');
  }

  async fetchAllRequiredData(options = {}) {
    const {
      marketLimit = 100,
      chartSymbol = 'BTC',
      chartTimeframe = '1h',
      chartLimit = 100,
      newsLimit = 10
    } = options;

    console.log('Fetching all data in parallel...');

    const requests = [
      this.getMarketData(marketLimit),
      this.getPriceChart(chartSymbol, chartTimeframe, chartLimit),
      this.getNews(newsLimit),
      this.getSentiment(),
      this.getMarketStats()
    ];

    const results = await Promise.allSettled(requests);

    const [market, chart, news, sentiment, stats] = results.map(result =>
      result.status === 'fulfilled' ? result.value : {
        success: false,
        error: result.reason?.message || 'Unknown error',
        status: 500
      }
    );

    const successful = results.filter(r => r.status === 'fulfilled' && r.value.success).length;
    const failed = results.length - successful;

    return {
      success: successful > 0,
      timestamp: Date.now(),
      data: { market, chart, news, sentiment, stats },
      summary: { total: results.length, successful, failed }
    };
  }
}

async function testDashboardService() {
  console.log('=== Dashboard Service Test ===\n');
  
  const service = new SimpleDataService();
  
  try {
    const result = await service.fetchAllRequiredData({
      marketLimit: 20,
      chartSymbol: 'BTC',
      chartTimeframe: '1h',
      chartLimit: 50,
      newsLimit: 5
    });

    console.log('\n=== Results ===');
    console.log(`Success: ${result.success}`);
    console.log(`Total Requests: ${result.summary.total}`);
    console.log(`Successful: ${result.summary.successful} ✅`);
    console.log(`Failed: ${result.summary.failed} ❌\n`);

    console.log('Market Data:', result.data.market.success ? '✅' : '❌');
    if (result.data.market.success && result.data.market.data) {
      const items = result.data.market.data.items || [];
      console.log(`  - Coins fetched: ${items.length}`);
      if (items.length > 0) {
        console.log(`  - First coin: ${items[0].symbol} = $${items[0].price}`);
      }
    }

    console.log('\nPrice Chart:', result.data.chart.success ? '✅' : '❌');
    if (result.data.chart.success && result.data.chart.data) {
      const candles = result.data.chart.data.data || [];
      console.log(`  - Candles fetched: ${candles.length}`);
      if (candles.length > 0) {
        console.log(`  - Latest close: $${candles[candles.length - 1].c}`);
      }
    }

    console.log('\nNews:', result.data.news.success ? '✅' : '❌');
    if (result.data.news.success && result.data.news.data) {
      const newsItems = result.data.news.data.news || [];
      console.log(`  - News items: ${newsItems.length}`);
      if (newsItems.length > 0) {
        console.log(`  - Latest: ${newsItems[0].title.substring(0, 50)}...`);
      }
    }

    console.log('\nSentiment:', result.data.sentiment.success ? '✅' : '❌');
    if (result.data.sentiment.success && result.data.sentiment.data) {
      const sent = result.data.sentiment.data;
      console.log(`  - Fear & Greed Index: ${sent.fear_greed_index}`);
      console.log(`  - Sentiment: ${sent.sentiment}`);
    }

    console.log('\nMarket Stats:', result.data.stats.success ? '✅' : '❌');
    if (result.data.stats.success && result.data.stats.data) {
      const stats = result.data.stats.data;
      console.log(`  - Total Providers: ${stats.total_providers}`);
    }

    console.log('\n=== Test Complete ===');
    console.log(result.success ? '✅ All systems operational!' : '❌ Some systems failed');

  } catch (error) {
    console.error('Test failed:', error);
  }
}

testDashboardService();
