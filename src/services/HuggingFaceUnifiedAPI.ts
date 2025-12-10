/**
 * HuggingFace Unified API Client
 * 
 * This is the SINGLE SOURCE OF TRUTH for all API interactions with the HuggingFace Space.
 * All data in the application should flow through this client.
 * 
 * Base URL: https://really-amin-datasourceforcryptocurrency-2.hf.space
 * 
 * @author DreamMaker Team
 * @version 3.0.0
 */

import { Logger } from '../core/Logger';

// ============================================================================
// Configuration
// ============================================================================

const HF_BASE_URL = 'https://really-amin-datasourceforcryptocurrency-2.hf.space';

// Get base URL from environment or use default
const getBaseUrl = (): string => {
  try {
    if (typeof import.meta !== 'undefined' && import.meta.env?.VITE_HF_API_URL) {
      return import.meta.env.VITE_HF_API_URL;
    }
    if (typeof process !== 'undefined' && process.env?.HF_API_URL) {
      return process.env.HF_API_URL;
    }
  } catch {
    // Ignore environment access errors
  }
  return HF_BASE_URL;
};

// ============================================================================
// Types & Interfaces
// ============================================================================

// Core Market Types
export interface MarketCoin {
  symbol: string;
  name?: string;
  price: number;
  change_24h: number;
  volume_24h: number;
  market_cap?: number;
  rank?: number;
  last_updated?: string;
  image?: string;
}

export interface TrendingCoin {
  symbol: string;
  name: string;
  price: number;
  change_24h: number;
  volume_24h: number;
  trending_score?: number;
}

export interface OHLCVCandle {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

// AI & Sentiment Types
export interface GlobalSentiment {
  value: number;
  value_classification: string;
  timestamp: string;
  fear_greed_index?: number;
  market_sentiment?: 'extreme_fear' | 'fear' | 'neutral' | 'greed' | 'extreme_greed';
}

export interface AssetSentiment {
  symbol: string;
  sentiment_score: number;
  sentiment_label: string;
  social_volume?: number;
  news_sentiment?: number;
}

export interface SentimentAnalysisResult {
  text: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  confidence: number;
  score: number;
}

export interface AISignal {
  id?: string;
  symbol: string;
  type: 'buy' | 'sell' | 'hold';
  confidence: number;
  score: number;
  timeframe?: string;
  entry_price?: number;
  stop_loss?: number;
  take_profit?: number;
  reasoning?: string;
  model?: string;
  timestamp: string;
}

export interface AIDecision {
  symbol: string;
  decision: 'BUY' | 'SELL' | 'HOLD';
  confidence: number;
  analysis: {
    technical_score: number;
    sentiment_score: number;
    risk_score: number;
  };
  reasoning: string[];
  timestamp: string;
}

export interface ModelInfo {
  id: string;
  name: string;
  status: 'ready' | 'loading' | 'error';
  type: string;
  accuracy?: number;
}

// News Types
export interface NewsArticle {
  id: string;
  title: string;
  description?: string;
  content?: string;
  url: string;
  source: string;
  source_name?: string;
  published_at: string;
  sentiment?: 'positive' | 'negative' | 'neutral';
  sentiment_score?: number;
  image_url?: string;
  categories?: string[];
}

// Technical Analysis Types
export interface QuickTAResult {
  symbol: string;
  timeframe: string;
  trend: 'bullish' | 'bearish' | 'neutral';
  strength: number;
  support_levels: number[];
  resistance_levels: number[];
  indicators: {
    rsi: number;
    macd: { value: number; signal: number; histogram: number };
    moving_averages: { sma_20: number; sma_50: number; ema_20: number };
  };
}

export interface ComprehensiveTAResult extends QuickTAResult {
  patterns: string[];
  elliott_wave?: {
    current_wave: string;
    direction: string;
    confidence: number;
  };
  fibonacci_levels: number[];
  volume_analysis: {
    average_volume: number;
    volume_trend: string;
    volume_change: number;
  };
  momentum: {
    score: number;
    direction: string;
  };
}

export interface RiskAssessment {
  symbol: string;
  risk_level: 'low' | 'medium' | 'high' | 'extreme';
  risk_score: number;
  volatility: number;
  max_drawdown: number;
  sharpe_ratio?: number;
  var_95?: number;
  factors: {
    market_risk: number;
    liquidity_risk: number;
    volatility_risk: number;
  };
}

// Trading Types
export interface BacktestResult {
  symbol: string;
  strategy: string;
  timeframe: string;
  start_date: string;
  end_date: string;
  total_trades: number;
  winning_trades: number;
  losing_trades: number;
  win_rate: number;
  total_return: number;
  max_drawdown: number;
  sharpe_ratio: number;
  trades: Array<{
    entry_date: string;
    exit_date: string;
    entry_price: number;
    exit_price: number;
    profit_loss: number;
    type: 'long' | 'short';
  }>;
}

export interface FuturesPosition {
  symbol: string;
  side: 'long' | 'short';
  size: number;
  entry_price: number;
  mark_price: number;
  liquidation_price: number;
  unrealized_pnl: number;
  leverage: number;
  margin: number;
}

// System Types
export interface HealthStatus {
  status: 'healthy' | 'degraded' | 'down';
  uptime: number;
  version?: string;
  services?: Record<string, { status: string; latency_ms?: number }>;
}

export interface SystemStatus {
  status: string;
  timestamp: string;
  metrics: {
    cpu_usage?: number;
    memory_usage?: number;
    active_connections?: number;
    requests_per_minute?: number;
  };
}

export interface ResourceSummary {
  total_apis: number;
  active_apis: number;
  total_endpoints: number;
  data_sources: string[];
}

export interface MultiSourceData {
  symbol: string;
  sources: Array<{
    name: string;
    price: number;
    volume_24h: number;
    timestamp: string;
  }>;
  aggregated: {
    price: number;
    volume_24h: number;
    price_variance: number;
  };
}

// API Response Wrapper
export interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: number;
}

// ============================================================================
// HuggingFace Unified API Class
// ============================================================================

class HuggingFaceUnifiedAPI {
  private static instance: HuggingFaceUnifiedAPI;
  private baseUrl: string;
  private logger = Logger.getInstance();
  private timeout = 30000;
  private retryAttempts = 3;
  private retryDelay = 1000;

  private constructor() {
    this.baseUrl = getBaseUrl().replace(/\/$/, '');
    this.logger.info('HuggingFaceUnifiedAPI initialized', { baseUrl: this.baseUrl });
  }

  static getInstance(): HuggingFaceUnifiedAPI {
    if (!HuggingFaceUnifiedAPI.instance) {
      HuggingFaceUnifiedAPI.instance = new HuggingFaceUnifiedAPI();
    }
    return HuggingFaceUnifiedAPI.instance;
  }

  // ============================================================================
  // Core HTTP Methods
  // ============================================================================

  private async request<T>(
    endpoint: string,
    method: 'GET' | 'POST' = 'GET',
    body?: unknown,
    retryCount = 0
  ): Promise<APIResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const options: RequestInit = {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        signal: controller.signal,
      };

      if (body && method === 'POST') {
        options.body = JSON.stringify(body);
      }

      const response = await fetch(url, options);
      clearTimeout(timeoutId);

      if (!response.ok) {
        // Retry on server errors
        if (response.status >= 500 && retryCount < this.retryAttempts) {
          const delay = this.retryDelay * Math.pow(2, retryCount);
          await this.sleep(delay);
          return this.request<T>(endpoint, method, body, retryCount + 1);
        }

        return {
          success: false,
          error: `HTTP ${response.status}: ${response.statusText}`,
          timestamp: Date.now(),
        };
      }

      const data = await response.json();
      
      // Handle different response formats
      if (data && typeof data === 'object') {
        // If response has success field, use it
        if ('success' in data) {
          return {
            success: data.success,
            data: data.data || data.items || data.news || data.signals || data,
            error: data.error,
            message: data.message,
            timestamp: Date.now(),
          };
        }
        // Otherwise wrap the response
        return {
          success: true,
          data: data as T,
          timestamp: Date.now(),
        };
      }

      return {
        success: true,
        data: data as T,
        timestamp: Date.now(),
      };
    } catch (error: unknown) {
      clearTimeout(timeoutId);

      const err = error as Error;
      
      // Retry on timeout or network error
      if ((err.name === 'AbortError' || err.message?.includes('network')) && retryCount < this.retryAttempts) {
        const delay = this.retryDelay * Math.pow(2, retryCount);
        await this.sleep(delay);
        return this.request<T>(endpoint, method, body, retryCount + 1);
      }

      return {
        success: false,
        error: err.message || 'Unknown error',
        timestamp: Date.now(),
      };
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // ============================================================================
  // Core Market Services
  // ============================================================================

  /**
   * Get top cryptocurrencies by market cap
   * GET /api/coins/top?limit=X
   */
  async getTopMarket(): Promise<APIResponse<MarketCoin[]>> {
    return this.getTopCoins(50);
  }

  /**
   * Get trending cryptocurrencies
   * Falls back to top coins since /api/market/trending is not available
   */
  async getTrendingCoins(): Promise<APIResponse<TrendingCoin[]>> {
    const response = await this.getTopCoins(20);
    if (response.success && response.data) {
      // Sort by change_24h to get "trending" coins
      const trending = response.data
        .sort((a, b) => Math.abs(b.change_24h) - Math.abs(a.change_24h))
        .slice(0, 10)
        .map(coin => ({
          ...coin,
          trending_score: Math.abs(coin.change_24h),
        }));
      return { ...response, data: trending as TrendingCoin[] };
    }
    return response as unknown as APIResponse<TrendingCoin[]>;
  }

  /**
   * Get top coins with limit
   * GET /api/coins/top?limit=50
   */
  async getTopCoins(limit = 50): Promise<APIResponse<MarketCoin[]>> {
    const response = await this.request<{ coins: MarketCoin[] }>(`/api/coins/top?limit=${limit}`);
    if (response.success && response.data) {
      const data = response.data as any;
      const coins = data.coins || data;
      if (Array.isArray(coins)) {
        return {
          ...response,
          data: coins.map((c: any) => ({
            symbol: c.symbol || '',
            name: c.name || '',
            price: c.price || c.current_price || 0,
            change_24h: c.change_24h || c.price_change_percentage_24h || 0,
            volume_24h: c.volume_24h || c.total_volume || 0,
            market_cap: c.market_cap || 0,
            rank: c.rank || c.market_cap_rank || 0,
            last_updated: c.last_updated || new Date().toISOString(),
            image: c.image || '',
          })),
        };
      }
    }
    return response as unknown as APIResponse<MarketCoin[]>;
  }

  /**
   * Get market tickers (alias for getTopCoins)
   */
  async getMarketTickers(limit = 50): Promise<APIResponse<MarketCoin[]>> {
    return this.getTopCoins(limit);
  }

  // ============================================================================
  // AI & Sentiment Services
  // ============================================================================

  /**
   * Get global market sentiment
   * GET /api/sentiment/global
   */
  async getGlobalSentiment(): Promise<APIResponse<GlobalSentiment>> {
    return this.request<GlobalSentiment>('/api/sentiment/global');
  }

  /**
   * Get sentiment for a specific asset
   * GET /api/sentiment/asset/{symbol}
   */
  async getAssetSentiment(symbol: string): Promise<APIResponse<AssetSentiment>> {
    return this.request<AssetSentiment>(`/api/sentiment/asset/${symbol}`);
  }

  /**
   * Analyze sentiment of custom text
   * POST /api/sentiment/analyze
   */
  async analyzeSentiment(text: string): Promise<APIResponse<SentimentAnalysisResult>> {
    return this.request<SentimentAnalysisResult>('/api/sentiment/analyze', 'POST', { text });
  }

  /**
   * Get AI models status
   * GET /api/models/status
   */
  async getModelsStatus(): Promise<APIResponse<Record<string, { status: string }>>> {
    return this.request<Record<string, { status: string }>>('/api/models/status');
  }

  /**
   * List all available models
   * GET /api/models/list
   */
  async listModels(): Promise<APIResponse<ModelInfo[]>> {
    return this.request<ModelInfo[]>('/api/models/list');
  }

  /**
   * Get AI trading signals
   * GET /api/ai/signals
   */
  async getAISignals(): Promise<APIResponse<AISignal[]>> {
    const response = await this.request<{ signals: AISignal[] }>('/api/ai/signals');
    if (response.success && response.data) {
      return {
        ...response,
        data: Array.isArray(response.data) ? response.data : (response.data as any).signals || [],
      };
    }
    return response as unknown as APIResponse<AISignal[]>;
  }

  /**
   * Get AI trading decision
   * POST /api/ai/decision
   */
  async getAIDecision(symbol: string, timeframe = '1h'): Promise<APIResponse<AIDecision>> {
    return this.request<AIDecision>('/api/ai/decision', 'POST', { symbol, timeframe });
  }

  // ============================================================================
  // News Services
  // ============================================================================

  /**
   * Get latest crypto news
   * GET /api/news
   */
  async getNews(limit = 10): Promise<APIResponse<NewsArticle[]>> {
    const response = await this.request<{ articles: NewsArticle[] } | NewsArticle[]>(`/api/news?limit=${limit}`);
    if (response.success && response.data) {
      const data = response.data as any;
      return {
        ...response,
        data: Array.isArray(data) ? data : data.articles || data.news || [],
      };
    }
    return response as unknown as APIResponse<NewsArticle[]>;
  }

  /**
   * Get latest news with limit
   * GET /api/news/latest?limit=10
   */
  async getLatestNews(limit = 10): Promise<APIResponse<NewsArticle[]>> {
    const response = await this.request<{ news: NewsArticle[] }>(`/api/news/latest?limit=${limit}`);
    if (response.success && response.data) {
      return {
        ...response,
        data: (response.data as any).news || [],
      };
    }
    return response as unknown as APIResponse<NewsArticle[]>;
  }

  /**
   * Get news filtered by source
   * GET /api/news?source=CoinDesk
   */
  async getNewsBySource(source: string, limit = 10): Promise<APIResponse<NewsArticle[]>> {
    return this.request<NewsArticle[]>(`/api/news?source=${encodeURIComponent(source)}&limit=${limit}`);
  }

  // ============================================================================
  // Trading Data Services (OHLCV)
  // ============================================================================

  /**
   * Get OHLCV data for a symbol
   * GET /api/ohlcv/{symbol}
   */
  async getOHLCV(symbol: string, timeframe = '1h', limit = 100): Promise<APIResponse<OHLCVCandle[]>> {
    const normalizedSymbol = symbol.toLowerCase().replace(/[^a-z]/g, '');
    const response = await this.request<{ data: any[] }>(`/api/ohlcv/${normalizedSymbol}?timeframe=${timeframe}&limit=${limit}`);
    
    if (response.success && response.data) {
      const rawData = (response.data as any).data || response.data;
      if (Array.isArray(rawData)) {
        const candles = rawData.map((item: any) => ({
          timestamp: item.t || item.timestamp || item[0],
          open: item.o || item.open || item[1],
          high: item.h || item.high || item[2],
          low: item.l || item.low || item[3],
          close: item.c || item.close || item[4],
          volume: item.v || item.volume || item[5],
        }));
        return { ...response, data: candles };
      }
    }
    return response as unknown as APIResponse<OHLCVCandle[]>;
  }

  /**
   * Get OHLCV for multiple symbols
   * GET /api/ohlcv/multi
   */
  async getMultiOHLCV(symbols: string[], timeframe = '1h'): Promise<APIResponse<Record<string, OHLCVCandle[]>>> {
    return this.request<Record<string, OHLCVCandle[]>>(
      `/api/ohlcv/multi?symbols=${symbols.join(',')}&timeframe=${timeframe}`
    );
  }

  /**
   * Get OHLC market data
   * GET /api/market/ohlc?symbol=BTC
   */
  async getMarketOHLC(symbol: string): Promise<APIResponse<OHLCVCandle[]>> {
    return this.request<OHLCVCandle[]>(`/api/market/ohlc?symbol=${symbol}`);
  }

  // ============================================================================
  // Trading Services
  // ============================================================================

  /**
   * Run backtest for a strategy
   * GET /api/trading/backtest
   */
  async runBacktest(params: {
    symbol: string;
    strategy?: string;
    timeframe?: string;
    start_date?: string;
    end_date?: string;
  }): Promise<APIResponse<BacktestResult>> {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value) queryParams.append(key, value);
    });
    return this.request<BacktestResult>(`/api/trading/backtest?${queryParams.toString()}`);
  }

  /**
   * Get futures positions
   * GET /api/futures/positions
   */
  async getFuturesPositions(): Promise<APIResponse<FuturesPosition[]>> {
    return this.request<FuturesPosition[]>('/api/futures/positions');
  }

  // ============================================================================
  // Technical Analysis Services
  // ============================================================================

  /**
   * Get quick technical analysis
   * GET /api/technical/quick/{symbol}
   */
  async getQuickTA(symbol: string): Promise<APIResponse<QuickTAResult>> {
    return this.request<QuickTAResult>(`/api/technical/quick/${symbol}`);
  }

  /**
   * Get comprehensive technical analysis
   * GET /api/technical/comprehensive/{symbol}
   */
  async getComprehensiveTA(symbol: string): Promise<APIResponse<ComprehensiveTAResult>> {
    return this.request<ComprehensiveTAResult>(`/api/technical/comprehensive/${symbol}`);
  }

  /**
   * Get risk assessment
   * GET /api/technical/risk/{symbol}
   */
  async getRiskAssessment(symbol: string): Promise<APIResponse<RiskAssessment>> {
    return this.request<RiskAssessment>(`/api/technical/risk/${symbol}`);
  }

  // ============================================================================
  // Advanced/Multi-Source Services
  // ============================================================================

  /**
   * Get multi-source data for a symbol
   * GET /api/multi-source/data/{symbol}
   */
  async getMultiSourceData(symbol: string): Promise<APIResponse<MultiSourceData>> {
    return this.request<MultiSourceData>(`/api/multi-source/data/${symbol}`);
  }

  /**
   * Get all available data sources
   * GET /api/sources/all
   */
  async getAllSources(): Promise<APIResponse<string[]>> {
    return this.request<string[]>('/api/sources/all');
  }

  /**
   * Test a specific data source
   * GET /api/test-source/{source_id}
   */
  async testSource(sourceId: string): Promise<APIResponse<{ status: string; latency_ms: number }>> {
    return this.request<{ status: string; latency_ms: number }>(`/api/test-source/${sourceId}`);
  }

  // ============================================================================
  // System Services
  // ============================================================================

  /**
   * Get system health status
   * GET /api/health
   */
  async getHealth(): Promise<APIResponse<HealthStatus>> {
    return this.request<HealthStatus>('/api/health');
  }

  /**
   * Get system status
   * GET /api/status
   */
  async getStatus(): Promise<APIResponse<SystemStatus>> {
    return this.request<SystemStatus>('/api/status');
  }

  /**
   * Get monitoring data
   * GET /api/monitoring/status
   */
  async getMonitoringStatus(): Promise<APIResponse<Record<string, unknown>>> {
    return this.request<Record<string, unknown>>('/api/monitoring/status');
  }

  /**
   * Get resources summary
   * GET /api/resources/summary
   */
  async getResourcesSummary(): Promise<APIResponse<ResourceSummary>> {
    return this.request<ResourceSummary>('/api/resources/summary');
  }

  /**
   * Get detailed resource stats
   * GET /api/resources/stats
   */
  async getResourcesStats(): Promise<APIResponse<Record<string, unknown>>> {
    return this.request<Record<string, unknown>>('/api/resources/stats');
  }

  /**
   * Get all APIs list
   * GET /api/resources/apis
   */
  async getResourcesAPIs(): Promise<APIResponse<string[]>> {
    return this.request<string[]>('/api/resources/apis');
  }

  // ============================================================================
  // Convenience Methods
  // ============================================================================

  /**
   * Get current price for a symbol
   */
  async getPrice(symbol: string): Promise<APIResponse<MarketCoin>> {
    const response = await this.getTopCoins(100);
    if (response.success && response.data) {
      const normalizedSymbol = symbol.toUpperCase().replace(/USDT?$/, '');
      const coin = response.data.find(
        (c) =>
          c.symbol.toUpperCase() === normalizedSymbol ||
          c.symbol.toUpperCase() === `${normalizedSymbol}USDT`
      );
      if (coin) {
        return { success: true, data: coin, timestamp: Date.now() };
      }
    }
    return { success: false, error: `Symbol ${symbol} not found`, timestamp: Date.now() };
  }

  /**
   * Get all data needed for dashboard
   */
  async getDashboardData(): Promise<{
    market: APIResponse<MarketCoin[]>;
    sentiment: APIResponse<GlobalSentiment>;
    news: APIResponse<NewsArticle[]>;
    signals: APIResponse<AISignal[]>;
  }> {
    const [market, sentiment, news, signals] = await Promise.all([
      this.getTopCoins(50),
      this.getGlobalSentiment(),
      this.getLatestNews(10),
      this.getAISignals(),
    ]);

    return { market, sentiment, news, signals };
  }

  /**
   * Check if API is available
   */
  async isAvailable(): Promise<boolean> {
    const response = await this.getHealth();
    return response.success && response.data?.status === 'healthy';
  }

  /**
   * Get configuration
   */
  getConfig() {
    return {
      baseUrl: this.baseUrl,
      timeout: this.timeout,
      retryAttempts: this.retryAttempts,
    };
  }
}

// ============================================================================
// Exports
// ============================================================================

export const hfAPI = HuggingFaceUnifiedAPI.getInstance();
export default hfAPI;
export { HuggingFaceUnifiedAPI };
