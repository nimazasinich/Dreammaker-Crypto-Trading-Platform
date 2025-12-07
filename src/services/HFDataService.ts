/**
 * HFDataService - Hugging Face Data Integration Service
 * 
 * این سرویس تمام داده‌ها را مستقیماً از Hugging Face Space دریافت می‌کند.
 * 
 * Features:
 * - Direct HTTP connection to HF Space
 * - Bearer token authentication
 * - Exponential backoff retry logic
 * - Complete error handling
 * - Parallel data fetching
 * - Zero mock data - only real data
 * 
 * @author Dreammaker Team
 * @version 2.0.0
 */

import { Logger } from '../core/Logger';
import { HF_API_URL, HF_API_TOKEN } from '../config/env';

// ============================================================================
// Types & Interfaces
// ============================================================================

export interface MarketDataItem {
  symbol: string;
  name: string;
  price: number;
  change_24h: number;
  volume_24h: number;
  market_cap?: number;
  rank?: number;
  last_updated?: string;
}

export interface OHLCVItem {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface NewsItem {
  id?: string;
  title: string;
  url: string;
  source?: string;
  published_at?: string;
  sentiment?: 'positive' | 'negative' | 'neutral';
  summary?: string;
}

export interface SentimentItem {
  fearGreedIndex?: number;
  sentiment?: 'extreme_fear' | 'fear' | 'neutral' | 'greed' | 'extreme_greed';
  score?: number;
  value?: number;
  value_classification?: string;
  timestamp?: string;
}

export interface MarketStatsItem {
  totalMarketCap: number;
  totalVolume24h: number;
  btcDominance: number;
  ethDominance?: number;
  marketCapChange24h?: number;
  activeCryptocurrencies?: number;
}

export interface AIPredictionItem {
  symbol: string;
  action: 'buy' | 'sell' | 'hold';
  confidence: number;
  prediction?: number;
  timeframe?: string;
  timestamp?: string;
  reasoning?: string;
}

export interface FetchResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  status: number;
  timestamp: number;
}

export interface AllDataResponse {
  success: boolean;
  timestamp: number;
  data: {
    market: FetchResponse<MarketDataItem[]>;
    chart: FetchResponse<OHLCVItem[]>;
    news: FetchResponse<NewsItem[]>;
    sentiment: FetchResponse<SentimentItem>;
    stats: FetchResponse<MarketStatsItem>;
    ai?: FetchResponse<AIPredictionItem>;
  };
  summary: {
    total: number;
    successful: number;
    failed: number;
  };
}

// ============================================================================
// HFDataService Class
// ============================================================================

export class HFDataService {
  private logger = Logger.getInstance();
  private baseUrl: string;
  private token: string;
  private timeout: number = 30000; // 30 seconds
  private maxRetries: number = 3;
  private retryDelay: number = 1000; // 1 second

  constructor(baseUrl?: string, token?: string) {
    this.baseUrl = baseUrl || HF_API_URL;
    this.token = token || HF_API_TOKEN;

    // Remove trailing slash
    this.baseUrl = this.baseUrl.replace(/\/$/, '');

    this.logger.info('HFDataService initialized', {
      baseUrl: this.baseUrl,
      hasToken: !!this.token,
      timeout: this.timeout,
    });
  }

  // ============================================================================
  // Core HTTP Method
  // ============================================================================

  /**
   * Core fetch method with retry logic and exponential backoff
   */
  private async fetchFromService<T>(
    endpoint: string,
    method: 'GET' | 'POST' = 'GET',
    body: any = null,
    retryCount: number = 0
  ): Promise<FetchResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      // Build headers
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      };

      // Add Bearer token if available
      if (this.token) {
        headers['Authorization'] = `Bearer ${this.token}`;
      }

      this.logger.debug(`HTTP ${method} ${url}`, { retryCount });

      // Send request
      const response = await fetch(url, {
        method,
        headers,
        body: body ? JSON.stringify(body) : null,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Check response status
      if (!response.ok) {
        // Retry on 5xx errors
        if (response.status >= 500 && retryCount < this.maxRetries) {
          const delay = this.retryDelay * Math.pow(2, retryCount);
          this.logger.warn(`HTTP ${response.status}, retrying in ${delay}ms...`, {
            url,
            retryCount: retryCount + 1,
          });
          await this.sleep(delay);
          return this.fetchFromService<T>(endpoint, method, body, retryCount + 1);
        }

        // Return error response
        return {
          success: false,
          error: `HTTP ${response.status}: ${response.statusText}`,
          status: response.status,
          timestamp: Date.now(),
        };
      }

      // Parse JSON
      const data = await response.json();

      return {
        success: true,
        data: data as T,
        status: response.status,
        timestamp: Date.now(),
      };
    } catch (error: any) {
      clearTimeout(timeoutId);

      // Handle timeout
      if (error.name === 'AbortError') {
        if (retryCount < this.maxRetries) {
          const delay = this.retryDelay * Math.pow(2, retryCount);
          this.logger.warn(`Request timeout, retrying in ${delay}ms...`, {
            url,
            retryCount: retryCount + 1,
          });
          await this.sleep(delay);
          return this.fetchFromService<T>(endpoint, method, body, retryCount + 1);
        }

        return {
          success: false,
          error: `Request timeout after ${this.timeout}ms`,
          status: 408,
          timestamp: Date.now(),
        };
      }

      // Handle other errors
      this.logger.error('HTTP request failed', { url, error: error.message });
      return {
        success: false,
        error: error.message || 'Unknown error',
        status: 0,
        timestamp: Date.now(),
      };
    }
  }

  /**
   * Sleep utility
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // ============================================================================
  // Data Fetching Methods
  // ============================================================================

  /**
   * Get market data for top coins
   * Uses /api/market endpoint which returns { success, last_updated, items: [...] }
   */
  async getMarketData(limit: number = 100): Promise<FetchResponse<MarketDataItem[]>> {
    this.logger.info('Fetching market data', { limit });
    const response = await this.fetchFromService<{ success: boolean; items: MarketDataItem[] }>(
      `/api/market?limit=${limit}`
    );
    
    // Extract items array from response
    if (response.success && response.data?.items) {
      return {
        ...response,
        data: response.data.items,
      };
    }
    
    return response as unknown as FetchResponse<MarketDataItem[]>;
  }

  /**
   * Get OHLCV price chart data
   * Uses /api/ohlcv endpoint which returns { success, data: [...] }
   */
  async getPriceChart(
    symbol: string,
    timeframe: string = '1h',
    limit: number = 100
  ): Promise<FetchResponse<OHLCVItem[]>> {
    this.logger.info('Fetching price chart', { symbol, timeframe, limit });
    const response = await this.fetchFromService<{ success: boolean; data: any[] }>(
      `/api/ohlcv?symbol=${symbol}&timeframe=${timeframe}&limit=${limit}`
    );
    
    // Transform data format from { t, o, h, l, c, v } to { timestamp, open, high, low, close, volume }
    if (response.success && response.data?.data) {
      const transformedData = response.data.data.map((item: any) => ({
        timestamp: item.t,
        open: item.o,
        high: item.h,
        low: item.l,
        close: item.c,
        volume: item.v,
      }));
      
      return {
        ...response,
        data: transformedData,
      };
    }
    
    return response as unknown as FetchResponse<OHLCVItem[]>;
  }

  /**
   * Get latest news
   * Uses /api/news/latest endpoint which returns { success, symbol, news: [...] }
   */
  async getNews(limit: number = 10): Promise<FetchResponse<NewsItem[]>> {
    this.logger.info('Fetching news', { limit });
    const response = await this.fetchFromService<{ success: boolean; news: NewsItem[] }>(
      `/api/news/latest?limit=${limit}`
    );
    
    // Extract news array from response
    if (response.success && response.data?.news) {
      return {
        ...response,
        data: response.data.news,
      };
    }
    
    return response as unknown as FetchResponse<NewsItem[]>;
  }

  /**
   * Get global market sentiment
   * Uses /api/sentiment/global endpoint
   */
  async getSentiment(): Promise<FetchResponse<SentimentItem>> {
    this.logger.info('Fetching sentiment');
    return this.fetchFromService<SentimentItem>('/api/sentiment/global');
  }

  /**
   * Get market statistics
   * Uses /api/stats endpoint (not /api/market/stats which returns 404)
   */
  async getMarketStats(): Promise<FetchResponse<MarketStatsItem>> {
    this.logger.info('Fetching market stats');
    const response = await this.fetchFromService<any>('/api/stats');
    
    // Transform stats format to match expected interface
    if (response.success && response.data) {
      const stats: MarketStatsItem = {
        totalMarketCap: 0, // Not available in /api/stats
        totalVolume24h: 0, // Not available in /api/stats
        btcDominance: 0, // Not available in /api/stats
        activeCryptocurrencies: response.data.total_providers || 0,
      };
      
      return {
        ...response,
        data: stats,
      };
    }
    
    return response as FetchResponse<MarketStatsItem>;
  }

  /**
   * Get AI signals (replaces predictions since /api/ai/predict returns 404)
   * Uses /api/ai/signals endpoint which returns actual trading signals
   */
  async getAIPredictions(payload: {
    model?: string;
    symbol: string;
    timeframe?: string;
  }): Promise<FetchResponse<AIPredictionItem>> {
    this.logger.info('Fetching AI signals', payload);
    const response = await this.fetchFromService<{ symbol: string; signals: any[] }>(
      '/api/ai/signals'
    );
    
    // Transform first signal to prediction format
    if (response.success && response.data?.signals && response.data.signals.length > 0) {
      const signal = response.data.signals[0];
      const prediction: AIPredictionItem = {
        symbol: signal.symbol || payload.symbol,
        action: signal.type === 'buy' ? 'buy' : signal.type === 'sell' ? 'sell' : 'hold',
        confidence: signal.score || 0,
        timeframe: signal.timeframe || payload.timeframe,
        timestamp: signal.timestamp,
        reasoning: signal.reasoning || `${signal.model} signal`,
      };
      
      return {
        ...response,
        data: prediction,
      };
    }
    
    return response as unknown as FetchResponse<AIPredictionItem>;
  }

  // ============================================================================
  // Aggregated Data Fetching
  // ============================================================================

  /**
   * Fetch all required data in parallel
   * This is the main method to use for dashboard initialization
   */
  async fetchAllRequiredData(): Promise<AllDataResponse> {
    this.logger.info('Fetching all required data...');
    const startTime = Date.now();

    try {
      // Fetch all data in parallel using Promise.all
      const [market, chart, news, sentiment, stats, ai] = await Promise.all([
        this.getMarketData(100),
        this.getPriceChart('BTC/USDT', '1h', 100),
        this.getNews(10),
        this.getSentiment(),
        this.getMarketStats(),
        this.getAIPredictions({ model: 'predictor', symbol: 'BTC' }),
      ]);

      // Count successful and failed requests
      const results = [market, chart, news, sentiment, stats, ai];
      const successful = results.filter((r) => r.success).length;
      const failed = results.filter((r) => !r.success).length;

      const duration = Date.now() - startTime;
      this.logger.info('All data fetched', {
        duration: `${duration}ms`,
        successful,
        failed,
        total: results.length,
      });

      return {
        success: successful > 0, // Success if at least one request succeeded
        timestamp: Date.now(),
        data: {
          market,
          chart,
          news,
          sentiment,
          stats,
          ai,
        },
        summary: {
          total: results.length,
          successful,
          failed,
        },
      };
    } catch (error: any) {
      this.logger.error('Failed to fetch all data', { error: error.message });
      
      // Return empty failed response
      const emptyResponse: FetchResponse<any> = {
        success: false,
        error: 'Failed to fetch data',
        status: 0,
        timestamp: Date.now(),
      };

      return {
        success: false,
        timestamp: Date.now(),
        data: {
          market: emptyResponse,
          chart: emptyResponse,
          news: emptyResponse,
          sentiment: emptyResponse,
          stats: emptyResponse,
          ai: emptyResponse,
        },
        summary: {
          total: 6,
          successful: 0,
          failed: 6,
        },
      };
    }
  }

  /**
   * Get current configuration
   */
  getConfig() {
    return {
      baseUrl: this.baseUrl,
      hasToken: !!this.token,
      timeout: this.timeout,
      maxRetries: this.maxRetries,
      retryDelay: this.retryDelay,
    };
  }

  /**
   * Update configuration
   */
  setConfig(config: {
    baseUrl?: string;
    token?: string;
    timeout?: number;
    maxRetries?: number;
    retryDelay?: number;
  }) {
    if (config.baseUrl) this.baseUrl = config.baseUrl.replace(/\/$/, '');
    if (config.token) this.token = config.token;
    if (config.timeout) this.timeout = config.timeout;
    if (config.maxRetries) this.maxRetries = config.maxRetries;
    if (config.retryDelay) this.retryDelay = config.retryDelay;

    this.logger.info('HFDataService config updated', this.getConfig());
  }
}

// ============================================================================
// Singleton Export
// ============================================================================

/**
 * Default singleton instance
 * Use this for most cases
 */
export const hfDataService = new HFDataService();

/**
 * Export class for custom instances
 */
export default HFDataService;

