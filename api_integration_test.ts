// ==========================================
// HuggingFace API Integration Test Suite
// ==========================================
// این فایل را در: src/tests/apiIntegrationTest.ts قرار دهید
// اجرا: npm run test:api یا node src/tests/apiIntegrationTest.ts

interface TestResult {
  testName: string;
  status: 'PASS' | 'FAIL' | 'WARNING';
  message: string;
  details?: any;
  timestamp: string;
}

interface TestReport {
  totalTests: number;
  passed: number;
  failed: number;
  warnings: number;
  startTime: string;
  endTime: string;
  duration: number;
  results: TestResult[];
  summary: {
    apiHealth: 'HEALTHY' | 'DEGRADED' | 'DOWN';
    criticalIssues: string[];
    recommendations: string[];
  };
}

class HuggingFaceAPITester {
  private baseUrl = 'https://Really-amin-Datasourceforcryptocurrency-2.hf.space';
  private results: TestResult[] = [];
  private startTime: number = 0;

  // ==========================================
  // HELPER METHODS
  // ==========================================

  private addResult(testName: string, status: 'PASS' | 'FAIL' | 'WARNING', message: string, details?: any) {
    this.results.push({
      testName,
      status,
      message,
      details,
      timestamp: new Date().toISOString()
    });
  }

  private async testEndpoint(
    testName: string,
    url: string,
    options?: RequestInit,
    validator?: (data: any) => boolean
  ): Promise<boolean> {
    try {
      const startTime = Date.now();
      const response = await fetch(url, {
        ...options,
        signal: AbortSignal.timeout(30000) // 30 second timeout
      });
      const responseTime = Date.now() - startTime;

      if (!response.ok) {
        this.addResult(testName, 'FAIL', `HTTP ${response.status}: ${response.statusText}`, {
          url,
          status: response.status,
          responseTime
        });
        return false;
      }

      const data = await response.json();

      // Validate response structure
      if (validator && !validator(data)) {
        this.addResult(testName, 'FAIL', 'Response validation failed', {
          url,
          data,
          responseTime
        });
        return false;
      }

      this.addResult(testName, 'PASS', `Success (${responseTime}ms)`, {
        url,
        responseTime,
        dataPreview: JSON.stringify(data).substring(0, 200)
      });
      return true;

    } catch (error: any) {
      this.addResult(testName, 'FAIL', `Error: ${error.message}`, {
        url,
        error: error.message
      });
      return false;
    }
  }

  // ==========================================
  // TEST 1: SYSTEM HEALTH
  // ==========================================

  private async testSystemHealth() {
    console.log('\n📋 Testing System Health...');

    // Test 1.1: Health endpoint
    await this.testEndpoint(
      'System Health Check',
      `${this.baseUrl}/api/health`,
      undefined,
      (data) => data.status === 'healthy' || data.status === 'ok'
    );

    // Test 1.2: Status endpoint
    await this.testEndpoint(
      'System Status',
      `${this.baseUrl}/api/status`
    );

    // Test 1.3: Routers loaded
    await this.testEndpoint(
      'Router Registration',
      `${this.baseUrl}/api/routers`,
      undefined,
      (data) => data.routers && data.routers.unified_service_api
    );
  }

  // ==========================================
  // TEST 2: PRICE & MARKET DATA
  // ==========================================

  private async testPriceEndpoints() {
    console.log('\n💰 Testing Price & Market Endpoints...');

    // Test 2.1: Single rate
    await this.testEndpoint(
      'Get Single Rate (BTC/USDT)',
      `${this.baseUrl}/api/service/rate?pair=BTC/USDT`,
      undefined,
      (data) => data.data && data.data.price && data.data.pair === 'BTC/USDT'
    );

    // Test 2.2: Batch rates
    await this.testEndpoint(
      'Get Batch Rates',
      `${this.baseUrl}/api/service/rate/batch?pairs=BTC/USDT,ETH/USDT,BNB/USDT`,
      undefined,
      (data) => Array.isArray(data.data) && data.data.length === 3
    );

    // Test 2.3: Top coins
    await this.testEndpoint(
      'Get Top Coins',
      `${this.baseUrl}/api/service/top?n=10`,
      undefined,
      (data) => data.data && Array.isArray(data.data)
    );

    // Test 2.4: Market status
    await this.testEndpoint(
      'Get Market Status',
      `${this.baseUrl}/api/service/market-status`
    );

    // Test 2.5: Market tickers
    await this.testEndpoint(
      'Get Market Tickers',
      `${this.baseUrl}/api/market/tickers?limit=10`
    );
  }

  // ==========================================
  // TEST 3: OHLCV / CHART DATA
  // ==========================================

  private async testChartData() {
    console.log('\n📊 Testing Chart Data Endpoints...');

    // Test 3.1: OHLCV data
    await this.testEndpoint(
      'Get OHLCV Data (BTC 1h)',
      `${this.baseUrl}/api/ohlcv?symbol=BTC&timeframe=1h&limit=100`,
      undefined,
      (data) => data.success && Array.isArray(data.data) && data.data.length > 0
    );

    // Test 3.2: Historical data
    await this.testEndpoint(
      'Get Historical Data (BTC 7 days)',
      `${this.baseUrl}/api/historical?symbol=BTC&days=7`
    );

    // Test 3.3: Price history
    await this.testEndpoint(
      'Get Price History',
      `${this.baseUrl}/api/service/history?symbol=BTC&interval=60`
    );
  }

  // ==========================================
  // TEST 4: NEWS
  // ==========================================

  private async testNewsEndpoints() {
    console.log('\n📰 Testing News Endpoints...');

    // Test 4.1: Latest news
    await this.testEndpoint(
      'Get Latest News',
      `${this.baseUrl}/api/news/latest?limit=5`,
      undefined,
      (data) => data.success && Array.isArray(data.news)
    );

    // Test 4.2: News with symbol filter
    await this.testEndpoint(
      'Get BTC News',
      `${this.baseUrl}/api/news/latest?symbol=BTC&limit=5`
    );

    // Test 4.3: All news endpoint
    await this.testEndpoint(
      'Get All News',
      `${this.baseUrl}/api/news?limit=5`
    );
  }

  // ==========================================
  // TEST 5: SENTIMENT ANALYSIS
  // ==========================================

  private async testSentimentEndpoints() {
    console.log('\n😊 Testing Sentiment Endpoints...');

    // Test 5.1: Global sentiment
    await this.testEndpoint(
      'Get Global Sentiment',
      `${this.baseUrl}/api/sentiment/global`
    );

    // Test 5.2: Symbol sentiment
    await this.testEndpoint(
      'Get BTC Sentiment',
      `${this.baseUrl}/api/service/sentiment?symbol=BTC`
    );

    // Test 5.3: Analyze text sentiment
    await this.testEndpoint(
      'Analyze Text Sentiment',
      `${this.baseUrl}/api/sentiment/analyze`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: 'Bitcoin is going to the moon!' })
      },
      (data) => data.label && data.score !== undefined
    );
  }

  // ==========================================
  // TEST 6: WHALE TRACKING
  // ==========================================

  private async testWhaleEndpoints() {
    console.log('\n🐋 Testing Whale Tracking Endpoints...');

    // Test 6.1: Get whales
    await this.testEndpoint(
      'Get Whale Transactions',
      `${this.baseUrl}/api/service/whales?chain=ethereum&min_amount_usd=1000000&limit=10`,
      undefined,
      (data) => data.data && Array.isArray(data.data)
    );

    // Test 6.2: Whale stats
    await this.testEndpoint(
      'Get Whale Stats',
      `${this.baseUrl}/api/whales/stats?hours=24`
    );
  }

  // ==========================================
  // TEST 7: BLOCKCHAIN DATA
  // ==========================================

  private async testBlockchainEndpoints() {
    console.log('\n⛓️ Testing Blockchain Endpoints...');

    // Test 7.1: Gas prices
    await this.testEndpoint(
      'Get Gas Prices (Ethereum)',
      `${this.baseUrl}/api/blockchain/gas?chain=ethereum`,
      undefined,
      (data) => data.slow !== undefined || data.standard !== undefined
    );

    // Test 7.2: On-chain data (with a known address)
    await this.testEndpoint(
      'Get On-Chain Data',
      `${this.baseUrl}/api/service/onchain?address=0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb&chain=ethereum&limit=10`
    );
  }

  // ==========================================
  // TEST 8: TECHNICAL ANALYSIS
  // ==========================================

  private async testTechnicalAnalysis() {
    console.log('\n📈 Testing Technical Analysis Endpoints...');

    // First, get OHLCV data to use in analysis
    const ohlcvResponse = await fetch(`${this.baseUrl}/api/ohlcv?symbol=BTC&timeframe=4h&limit=100`);
    const ohlcvData = await ohlcvResponse.json();

    if (!ohlcvData.success || !ohlcvData.data || ohlcvData.data.length === 0) {
      this.addResult('Technical Analysis - Data Preparation', 'WARNING', 'Could not fetch OHLCV data for TA tests');
      return;
    }

    // Test 8.1: Quick TA
    await this.testEndpoint(
      'Quick Technical Analysis',
      `${this.baseUrl}/api/technical/ta-quick`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          symbol: 'BTC',
          timeframe: '4h',
          ohlcv: ohlcvData.data.slice(0, 50)
        })
      },
      (data) => data.success && data.trend
    );

    // Test 8.2: Risk assessment
    const prices = ohlcvData.data.map((d: any) => d.c).slice(0, 30);
    await this.testEndpoint(
      'Risk Assessment',
      `${this.baseUrl}/api/technical/risk-assessment`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          symbol: 'BTC',
          historical_daily_prices: prices,
          max_drawdown_percentage: 25
        })
      }
    );
  }

  // ==========================================
  // TEST 9: MODELS & RESOURCES
  // ==========================================

  private async testSystemResources() {
    console.log('\n🔧 Testing System Resources...');

    // Test 9.1: Models status
    await this.testEndpoint(
      'Get Models Status',
      `${this.baseUrl}/api/models/status`
    );

    // Test 9.2: Models list
    await this.testEndpoint(
      'Get Models List',
      `${this.baseUrl}/api/models/list`
    );

    // Test 9.3: Resources stats
    await this.testEndpoint(
      'Get Resources Stats',
      `${this.baseUrl}/api/resources/stats`,
      undefined,
      (data) => data.success && data.data
    );

    // Test 9.4: Combined resources stats
    await this.testEndpoint(
      'Get Combined Resources Stats',
      `${this.baseUrl}/api/resources/stats/combined`
    );
  }

  // ==========================================
  // TEST 10: CODE SCAN
  // ==========================================

  private async testCodeIntegration() {
    console.log('\n🔍 Scanning Codebase for External API Calls...');

    const externalAPIs = [
      { pattern: 'api.coingecko.com', name: 'CoinGecko' },
      { pattern: 'api.binance.com', name: 'Binance' },
      { pattern: 'stream.binance.com', name: 'Binance WebSocket' },
      { pattern: 'newsapi.org', name: 'NewsAPI' },
      { pattern: 'api.cryptocompare.com', name: 'CryptoCompare' },
      { pattern: 'api.coinbase.com', name: 'Coinbase' },
    ];

    const foundAPIs: string[] = [];

    // Note: This is a mock check - in real implementation, you would scan actual files
    // For now, we'll just add a placeholder result
    this.addResult(
      'Code Integration Check',
      'WARNING',
      'Manual code scan required. Check for external API calls in your codebase.',
      {
        instruction: 'Run: grep -r "coingecko\\|binance\\|newsapi" src/ -i',
        expectedResult: 'No matches should be found (all should use HuggingFace API)'
      }
    );
  }

  // ==========================================
  // GENERATE REPORT
  // ==========================================

  private generateReport(): TestReport {
    const endTime = Date.now();
    const duration = endTime - this.startTime;

    const passed = this.results.filter(r => r.status === 'PASS').length;
    const failed = this.results.filter(r => r.status === 'FAIL').length;
    const warnings = this.results.filter(r => r.status === 'WARNING').length;

    // Determine API health
    let apiHealth: 'HEALTHY' | 'DEGRADED' | 'DOWN' = 'HEALTHY';
    if (failed > 5) apiHealth = 'DOWN';
    else if (failed > 0 || warnings > 3) apiHealth = 'DEGRADED';

    // Collect critical issues
    const criticalIssues = this.results
      .filter(r => r.status === 'FAIL')
      .map(r => `${r.testName}: ${r.message}`);

    // Generate recommendations
    const recommendations: string[] = [];
    
    if (failed > 0) {
      recommendations.push('Fix failing endpoints before deploying to production');
    }
    if (warnings > 0) {
      recommendations.push('Review warnings and resolve any code integration issues');
    }
    if (apiHealth === 'DOWN') {
      recommendations.push('CRITICAL: API is down or severely degraded. Do not deploy.');
    } else if (apiHealth === 'DEGRADED') {
      recommendations.push('API is degraded. Some features may not work properly.');
    } else {
      recommendations.push('All tests passed! API is healthy and ready for production.');
    }

    return {
      totalTests: this.results.length,
      passed,
      failed,
      warnings,
      startTime: new Date(this.startTime).toISOString(),
      endTime: new Date(endTime).toISOString(),
      duration,
      results: this.results,
      summary: {
        apiHealth,
        criticalIssues,
        recommendations
      }
    };
  }

  // ==========================================
  // RUN ALL TESTS
  // ==========================================

  async runAllTests(): Promise<TestReport> {
    console.log('🚀 Starting HuggingFace API Integration Tests...\n');
    console.log(`Testing API: ${this.baseUrl}\n`);
    console.log('=' .repeat(60));

    this.startTime = Date.now();

    try {
      await this.testSystemHealth();
      await this.testPriceEndpoints();
      await this.testChartData();
      await this.testNewsEndpoints();
      await this.testSentimentEndpoints();
      await this.testWhaleEndpoints();
      await this.testBlockchainEndpoints();
      await this.testTechnicalAnalysis();
      await this.testSystemResources();
      await this.testCodeIntegration();
    } catch (error: any) {
      console.error('❌ Test suite error:', error.message);
    }

    console.log('\n' + '='.repeat(60));
    console.log('\n✅ Test Suite Complete!\n');

    const report = this.generateReport();

    // Print summary
    console.log(`📊 SUMMARY:`);
    console.log(`   Total Tests: ${report.totalTests}`);
    console.log(`   ✅ Passed: ${report.passed}`);
    console.log(`   ❌ Failed: ${report.failed}`);
    console.log(`   ⚠️  Warnings: ${report.warnings}`);
    console.log(`   🏥 API Health: ${report.summary.apiHealth}`);
    console.log(`   ⏱️  Duration: ${report.duration}ms\n`);

    if (report.summary.criticalIssues.length > 0) {
      console.log(`🚨 CRITICAL ISSUES:`);
      report.summary.criticalIssues.forEach(issue => {
        console.log(`   - ${issue}`);
      });
      console.log('');
    }

    console.log(`💡 RECOMMENDATIONS:`);
    report.summary.recommendations.forEach(rec => {
      console.log(`   - ${rec}`);
    });
    console.log('');

    return report;
  }
}

// ==========================================
// MAIN EXECUTION
// ==========================================

async function main() {
  const tester = new HuggingFaceAPITester();
  const report = await tester.runAllTests();

  // Save report to JSON file
  const fs = require('fs');
  const path = require('path');
  
  const reportPath = path.join(process.cwd(), 'api-test-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  
  console.log(`📄 Full report saved to: ${reportPath}\n`);

  // Exit with appropriate code
  process.exit(report.failed > 0 ? 1 : 0);
}

// Run if executed directly
if (require.main === module) {
  main().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

export { HuggingFaceAPITester, TestReport, TestResult };