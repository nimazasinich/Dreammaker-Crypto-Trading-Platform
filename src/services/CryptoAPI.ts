/**
 * CryptoAPI - Unified HuggingFace Crypto API Client
 * 
 * This is the ONLY data source for the entire application.
 * All crypto data flows through HuggingFace API at:
 * https://Really-amin-Datasourceforcryptocurrency-2.hf.space
 * 
 * NO direct calls to CoinGecko, Binance, NewsAPI, or any external API.
 * HuggingFace manages 55 functional data providers internally.
 */

class CryptoAPI {
  private baseUrl = 'https://Really-amin-Datasourceforcryptocurrency-2.hf.space';

  // ============================================
  // PRICES & EXCHANGE RATES
  // ============================================
  
  /**
   * Get single price for a trading pair
   * @param pair - Trading pair (e.g., "BTC/USDT")
   * @returns Price data with metadata
   */
  async getPrice(pair: string): Promise<any> {
    const response = await fetch(`${this.baseUrl}/api/service/rate?pair=${pair}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch price for ${pair}: ${response.statusText}`);
    }
    return await response.json();
    // Returns: { data: { pair: "BTC/USDT", price: 50234.12, quote: "USDT", ts: "..." }, meta: {...} }
  }

  /**
   * Get multiple prices at once (batch request)
   * @param pairs - Array of trading pairs (e.g., ["BTC/USDT", "ETH/USDT"])
   * @returns Batch price data
   */
  async getPrices(pairs: string[]): Promise<any> {
    const pairsStr = pairs.join(',');
    const response = await fetch(`${this.baseUrl}/api/service/rate/batch?pairs=${pairsStr}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch prices: ${response.statusText}`);
    }
    return await response.json();
    // Returns: { data: [{ pair: "BTC/USDT", price: 50234.12 }, ...], meta: {...} }
  }

  /**
   * Get top coins by market cap
   * @param limit - Number of coins to return (default: 100)
   * @returns Top coins with market data
   */
  async getTopCoins(limit: number = 100): Promise<any> {
    const response = await fetch(`${this.baseUrl}/api/service/top?n=${limit}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch top coins: ${response.statusText}`);
    }
    return await response.json();
    // Returns: { data: [{symbol, name, price, change_24h, market_cap, ...}], meta: {...} }
  }

  /**
   * Get market status overview
   * @returns Market status data
   */
  async getMarketStatus(): Promise<any> {
    const response = await fetch(`${this.baseUrl}/api/service/market-status`);
    if (!response.ok) {
      throw new Error(`Failed to fetch market status: ${response.statusText}`);
    }
    return await response.json();
  }

  /**
   * Get all market tickers
   * @param limit - Number of tickers to return (default: 100)
   * @returns Market ticker data
   */
  async getMarketTickers(limit: number = 100): Promise<any> {
    const response = await fetch(`${this.baseUrl}/api/market/tickers?limit=${limit}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch market tickers: ${response.statusText}`);
    }
    return await response.json();
  }

  // ============================================
  // CHART DATA (OHLCV)
  // ============================================
  
  /**
   * Get candlestick data for charts (OHLCV)
   * @param symbol - Cryptocurrency symbol (e.g., "BTC")
   * @param timeframe - Timeframe (e.g., "1h", "4h", "1d")
   * @param limit - Number of candles (default: 200)
   * @returns OHLCV candlestick data
   */
  async getOHLCV(symbol: string, timeframe: string = '1h', limit: number = 200): Promise<any> {
    const response = await fetch(
      `${this.baseUrl}/api/ohlcv?symbol=${symbol}&timeframe=${timeframe}&limit=${limit}`
    );
    if (!response.ok) {
      throw new Error(`Failed to fetch OHLCV data for ${symbol}: ${response.statusText}`);
    }
    return await response.json();
    // Returns: { success: true, data: [{ t: timestamp, o: open, h: high, l: low, c: close, v: volume }, ...] }
  }

  /**
   * Get historical price data
   * @param symbol - Cryptocurrency symbol
   * @param days - Number of days of history (default: 30)
   * @returns Historical price data
   */
  async getHistory(symbol: string, days: number = 30): Promise<any> {
    const response = await fetch(
      `${this.baseUrl}/api/historical?symbol=${symbol}&days=${days}`
    );
    if (!response.ok) {
      throw new Error(`Failed to fetch history for ${symbol}: ${response.statusText}`);
    }
    return await response.json();
  }

  /**
   * Get price history with specific interval
   * @param symbol - Cryptocurrency symbol
   * @param interval - Interval in minutes (default: 60)
   * @returns Price history data
   */
  async getPriceHistory(symbol: string, interval: number = 60): Promise<any> {
    const response = await fetch(
      `${this.baseUrl}/api/service/history?symbol=${symbol}&interval=${interval}`
    );
    if (!response.ok) {
      throw new Error(`Failed to fetch price history for ${symbol}: ${response.statusText}`);
    }
    return await response.json();
  }

  // ============================================
  // NEWS
  // ============================================
  
  /**
   * Get latest crypto news
   * @param symbol - Optional symbol to filter news (e.g., "BTC")
   * @param limit - Number of news articles (default: 20)
   * @returns News articles
   */
  async getNews(symbol?: string, limit: number = 20): Promise<any> {
    const params = new URLSearchParams();
    if (symbol) params.append('symbol', symbol);
    params.append('limit', limit.toString());
    
    const response = await fetch(`${this.baseUrl}/api/news/latest?${params}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch news: ${response.statusText}`);
    }
    return await response.json();
    // Returns: { success: true, news: [{ title, content, source, url, published_at, ...}] }
  }

  // ============================================
  // SENTIMENT ANALYSIS
  // ============================================
  
  /**
   * Get global market sentiment
   * @returns Global sentiment data
   */
  async getGlobalSentiment(): Promise<any> {
    const response = await fetch(`${this.baseUrl}/api/sentiment/global`);
    if (!response.ok) {
      throw new Error(`Failed to fetch global sentiment: ${response.statusText}`);
    }
    return await response.json();
  }

  /**
   * Get sentiment for specific symbol
   * @param symbol - Cryptocurrency symbol
   * @returns Symbol-specific sentiment data
   */
  async getSentiment(symbol: string): Promise<any> {
    const response = await fetch(`${this.baseUrl}/api/service/sentiment?symbol=${symbol}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch sentiment for ${symbol}: ${response.statusText}`);
    }
    return await response.json();
  }

  /**
   * Analyze text sentiment using AI
   * @param text - Text to analyze
   * @returns Sentiment analysis result
   */
  async analyzeSentiment(text: string): Promise<any> {
    const response = await fetch(`${this.baseUrl}/api/sentiment/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text })
    });
    if (!response.ok) {
      throw new Error(`Failed to analyze sentiment: ${response.statusText}`);
    }
    return await response.json();
    // Returns: { label: "positive", score: 0.85, confidence: 0.92 }
  }

  // ============================================
  // WHALE TRACKING
  // ============================================
  
  /**
   * Get large transactions (whale movements)
   * @param chain - Blockchain network (default: "ethereum")
   * @param minAmountUSD - Minimum transaction amount in USD (default: 1000000)
   * @param limit - Number of transactions (default: 50)
   * @returns Whale transaction data
   */
  async getWhales(chain: string = 'ethereum', minAmountUSD: number = 1000000, limit: number = 50): Promise<any> {
    const response = await fetch(
      `${this.baseUrl}/api/service/whales?chain=${chain}&min_amount_usd=${minAmountUSD}&limit=${limit}`
    );
    if (!response.ok) {
      throw new Error(`Failed to fetch whale data: ${response.statusText}`);
    }
    return await response.json();
    // Returns: { data: [{ from, to, amount, amount_usd, chain, ts }], meta: {...} }
  }

  /**
   * Get whale statistics
   * @param hours - Number of hours to analyze (default: 24)
   * @returns Whale statistics
   */
  async getWhaleStats(hours: number = 24): Promise<any> {
    const response = await fetch(`${this.baseUrl}/api/whales/stats?hours=${hours}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch whale stats: ${response.statusText}`);
    }
    return await response.json();
  }

  // ============================================
  // BLOCKCHAIN DATA
  // ============================================
  
  /**
   * Get on-chain data for an address
   * @param address - Blockchain address
   * @param chain - Blockchain network (default: "ethereum")
   * @param limit - Number of transactions (default: 50)
   * @returns On-chain transaction data
   */
  async getOnChainData(address: string, chain: string = 'ethereum', limit: number = 50): Promise<any> {
    const response = await fetch(
      `${this.baseUrl}/api/service/onchain?address=${address}&chain=${chain}&limit=${limit}`
    );
    if (!response.ok) {
      throw new Error(`Failed to fetch on-chain data: ${response.statusText}`);
    }
    return await response.json();
  }

  /**
   * Get current gas prices
   * @param chain - Blockchain network (default: "ethereum")
   * @returns Gas price data
   */
  async getGasPrices(chain: string = 'ethereum'): Promise<any> {
    const response = await fetch(`${this.baseUrl}/api/blockchain/gas?chain=${chain}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch gas prices: ${response.statusText}`);
    }
    return await response.json();
    // Returns: { slow: 20, standard: 25, fast: 30, unit: "gwei" }
  }

  // ============================================
  // TECHNICAL ANALYSIS
  // ============================================
  
  /**
   * Quick technical analysis
   * @param symbol - Cryptocurrency symbol
   * @param timeframe - Timeframe for analysis
   * @param ohlcv - OHLCV data array
   * @returns Technical analysis result
   */
  async quickTA(symbol: string, timeframe: string, ohlcv: any[]): Promise<any> {
    const response = await fetch(`${this.baseUrl}/api/technical/ta-quick`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ symbol, timeframe, ohlcv })
    });
    if (!response.ok) {
      throw new Error(`Failed to perform quick TA: ${response.statusText}`);
    }
    return await response.json();
  }

  /**
   * Comprehensive analysis
   * @param data - Analysis data including symbol, timeframe, OHLCV, and optional fundamental/on-chain data
   * @returns Comprehensive analysis result
   */
  async comprehensiveAnalysis(data: {
    symbol: string;
    timeframe: string;
    ohlcv: any[];
    fundamental_data?: any;
    onchain_data?: any;
  }): Promise<any> {
    const response = await fetch(`${this.baseUrl}/api/technical/comprehensive`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) {
      throw new Error(`Failed to perform comprehensive analysis: ${response.statusText}`);
    }
    return await response.json();
  }

  /**
   * Risk assessment
   * @param symbol - Cryptocurrency symbol
   * @param historicalPrices - Array of historical daily prices
   * @param maxDrawdown - Maximum drawdown percentage
   * @returns Risk assessment result
   */
  async riskAssessment(symbol: string, historicalPrices: number[], maxDrawdown: number): Promise<any> {
    const response = await fetch(`${this.baseUrl}/api/technical/risk-assessment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        symbol,
        historical_daily_prices: historicalPrices,
        max_drawdown_percentage: maxDrawdown
      })
    });
    if (!response.ok) {
      throw new Error(`Failed to perform risk assessment: ${response.statusText}`);
    }
    return await response.json();
  }

  // ============================================
  // SYSTEM STATUS
  // ============================================
  
  /**
   * Get API health status
   * @returns Health check result
   */
  async getHealth(): Promise<any> {
    const response = await fetch(`${this.baseUrl}/api/health`);
    if (!response.ok) {
      throw new Error(`Health check failed: ${response.statusText}`);
    }
    return await response.json();
  }

  /**
   * Get API status
   * @returns API status information
   */
  async getStatus(): Promise<any> {
    const response = await fetch(`${this.baseUrl}/api/status`);
    if (!response.ok) {
      throw new Error(`Status check failed: ${response.statusText}`);
    }
    return await response.json();
  }

  // ============================================
  // UTILITY METHODS
  // ============================================

  /**
   * Get the base URL of the API
   * @returns Base URL string
   */
  getBaseUrl(): string {
    return this.baseUrl;
  }

  /**
   * Update the base URL (for testing purposes only)
   * @param url - New base URL
   */
  setBaseUrl(url: string): void {
    this.baseUrl = url;
  }
}

// Export singleton instance
export const cryptoAPI = new CryptoAPI();

// Export class for testing
export default CryptoAPI;

// Export type definitions for better TypeScript support
export interface PriceData {
  pair: string;
  price: number;
  quote: string;
  ts: string;
}

export interface OHLCVCandle {
  t: number;  // timestamp
  o: number;  // open
  h: number;  // high
  l: number;  // low
  c: number;  // close
  v: number;  // volume
}

export interface NewsArticle {
  title: string;
  content: string;
  summary?: string;
  source: string;
  url: string;
  published_at: string;
}

export interface SentimentResult {
  label: string;
  score: number;
  confidence: number;
}

export interface WhaleTransaction {
  from: string;
  to: string;
  amount: number;
  amount_usd: number;
  chain: string;
  ts: string | number;
  hash?: string;
  timestamp?: number;
  symbol?: string;
}
