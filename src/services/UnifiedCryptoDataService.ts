/**
 * Unified Crypto Data Service
 * 
 * This is the SINGLE SOURCE OF TRUTH for all crypto data in the application.
 * Uses the crypto-api client internally to fetch all data from HuggingFace Space.
 * 
 * NO component should fetch data directly - everyone must use this service.
 * 
 * @version 2.0.0
 */

import { CryptoDataClient, CryptoAPIError } from '../clients/crypto-api/crypto-client';
import type {
  HealthResponse,
  RateResponse,
  TopCoinsResponse,
  TrendingResponse,
  MarketResponse,
  SentimentResponse,
  NewsResponse,
  AISignal,
  SignalsResponse,
  AIDecisionRequest,
  AIDecisionResponse,
  OHLCVCandle,
  HistoryResponse,
  ModelsListResponse,
  ModelsStatusResponse,
  ProvidersResponse,
  CoinData,
} from '../clients/crypto-api/types';
import { Logger } from '../core/Logger';

// Export types for use in components
export type {
  HealthResponse,
  RateResponse,
  CoinData,
  TopCoinsResponse,
  TrendingResponse,
  MarketResponse,
  SentimentResponse,
  NewsResponse,
  AISignal,
  SignalsResponse,
  AIDecisionRequest,
  AIDecisionResponse,
  OHLCVCandle,
  HistoryResponse,
  ModelsListResponse,
  ModelsStatusResponse,
  ProvidersResponse,
};

export { CryptoAPIError };

/**
 * Unified Crypto Data Service Class
 * Singleton pattern - only one instance exists
 */
class UnifiedCryptoDataService {
  private static instance: UnifiedCryptoDataService;
  private client: CryptoDataClient;
  private logger = Logger.getInstance();
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private cacheTimeout = 30000; // 30 seconds

  private constructor() {
    this.client = new CryptoDataClient({
      baseUrl: 'https://really-amin-datasourceforcryptocurrency-2.hf.space',
      timeout: 30000,
      retries: 3,
      retryDelay: 1000,
    });
    this.logger.info('UnifiedCryptoDataService initialized');
  }

  static getInstance(): UnifiedCryptoDataService {
    if (!UnifiedCryptoDataService.instance) {
      UnifiedCryptoDataService.instance = new UnifiedCryptoDataService();
    }
    return UnifiedCryptoDataService.instance;
  }

  // ============================================================================
  // Cache Management
  // ============================================================================

  private getCached<T>(key: string): T | null {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data as T;
    }
    return null;
  }

  private setCache(key: string, data: any): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  private clearCache(): void {
    this.cache.clear();
  }

  // ============================================================================
  // Health & System
  // ============================================================================

  async getHealth(): Promise<HealthResponse> {
    try {
      return await this.client.health();
    } catch (error) {
      this.logger.error('Health check failed', error);
      throw error;
    }
  }

  async getStatus() {
    try {
      return await this.client.status();
    } catch (error) {
      this.logger.error('Status check failed', error);
      throw error;
    }
  }

  async isAvailable(): Promise<boolean> {
    try {
      const health = await this.getHealth();
      return health.status === 'healthy';
    } catch {
      return false;
    }
  }

  // ============================================================================
  // Market Data
  // ============================================================================

  async getTopCoins(limit: number = 50): Promise<TopCoinsResponse> {
    const cacheKey = `top_coins_${limit}`;
    const cached = this.getCached<TopCoinsResponse>(cacheKey);
    if (cached) return cached;

    try {
      const response = await this.client.getTopCoins(limit);
      this.setCache(cacheKey, response);
      return response;
    } catch (error) {
      this.logger.error('Failed to get top coins', error);
      throw error;
    }
  }

  async getTopMarket(): Promise<CoinData[]> {
    const response = await this.getTopCoins(50);
    return response.coins || [];
  }

  async getTrendingCoins(): Promise<TrendingResponse> {
    const cacheKey = 'trending_coins';
    const cached = this.getCached<TrendingResponse>(cacheKey);
    if (cached) return cached;

    try {
      const response = await this.client.getTrending();
      this.setCache(cacheKey, response);
      return response;
    } catch (error) {
      this.logger.error('Failed to get trending coins', error);
      throw error;
    }
  }

  async getMarket(): Promise<MarketResponse> {
    const cacheKey = 'market_overview';
    const cached = this.getCached<MarketResponse>(cacheKey);
    if (cached) return cached;

    try {
      const response = await this.client.getMarket();
      this.setCache(cacheKey, response);
      return response;
    } catch (error) {
      this.logger.error('Failed to get market overview', error);
      throw error;
    }
  }

  async getMarketStatus() {
    try {
      return await this.client.getMarketStatus();
    } catch (error) {
      this.logger.error('Failed to get market status', error);
      throw error;
    }
  }

  async getRate(pair: string): Promise<RateResponse> {
    const cacheKey = `rate_${pair}`;
    const cached = this.getCached<RateResponse>(cacheKey);
    if (cached) return cached;

    try {
      const response = await this.client.getRate(pair);
      this.setCache(cacheKey, response);
      return response;
    } catch (error) {
      this.logger.error(`Failed to get rate for ${pair}`, error);
      throw error;
    }
  }

  async getBatchRates(pairs: string[]) {
    try {
      return await this.client.getBatchRates(pairs);
    } catch (error) {
      this.logger.error('Failed to get batch rates', error);
      throw error;
    }
  }

  async getPrice(symbol: string): Promise<number> {
    try {
      const pair = symbol.includes('/') ? symbol : `${symbol}/USDT`;
      const response = await this.getRate(pair);
      return response.price;
    } catch (error) {
      this.logger.error(`Failed to get price for ${symbol}`, error);
      throw error;
    }
  }

  // ============================================================================
  // OHLCV Data
  // ============================================================================

  async getHistory(symbol: string, interval: string, limit: number): Promise<HistoryResponse> {
    try {
      return await this.client.getHistory(symbol, interval, limit);
    } catch (error) {
      this.logger.error(`Failed to get history for ${symbol}`, error);
      throw error;
    }
  }

  async getOHLCV(symbol: string, timeframe: string = '1h', limit: number = 100): Promise<OHLCVCandle[]> {
    try {
      const response = await this.getHistory(symbol, timeframe, limit);
      return response.data || [];
    } catch (error) {
      this.logger.error(`Failed to get OHLCV for ${symbol}`, error);
      throw error;
    }
  }

  // ============================================================================
  // Sentiment Analysis
  // ============================================================================

  async getGlobalSentiment(timeframe: '1D' | '7D' | '30D' = '1D'): Promise<SentimentResponse> {
    const cacheKey = `sentiment_global_${timeframe}`;
    const cached = this.getCached<SentimentResponse>(cacheKey);
    if (cached) return cached;

    try {
      const response = await this.client.getGlobalSentiment(timeframe);
      this.setCache(cacheKey, response);
      return response;
    } catch (error) {
      this.logger.error('Failed to get global sentiment', error);
      throw error;
    }
  }

  async getAssetSentiment(symbol: string) {
    try {
      return await this.client.getAssetSentiment(symbol);
    } catch (error) {
      this.logger.error(`Failed to get sentiment for ${symbol}`, error);
      throw error;
    }
  }

  async analyzeSentiment(text: string) {
    try {
      return await this.client.analyzeText(text);
    } catch (error) {
      this.logger.error('Failed to analyze sentiment', error);
      throw error;
    }
  }

  // ============================================================================
  // News
  // ============================================================================

  async getNews(limit: number = 10): Promise<NewsResponse> {
    const cacheKey = `news_${limit}`;
    const cached = this.getCached<NewsResponse>(cacheKey);
    if (cached) return cached;

    try {
      const response = await this.client.getNews(limit);
      this.setCache(cacheKey, response);
      return response;
    } catch (error) {
      this.logger.error('Failed to get news', error);
      throw error;
    }
  }

  async getLatestNews(limit: number = 10): Promise<NewsResponse> {
    try {
      return await this.client.getLatestNews(limit);
    } catch (error) {
      this.logger.error('Failed to get latest news', error);
      throw error;
    }
  }

  // ============================================================================
  // AI & Models
  // ============================================================================

  async getModels(): Promise<ModelsListResponse> {
    try {
      return await this.client.getModels();
    } catch (error) {
      this.logger.error('Failed to get models', error);
      throw error;
    }
  }

  async getModelsStatus(): Promise<ModelsStatusResponse> {
    try {
      return await this.client.getModelsStatus();
    } catch (error) {
      this.logger.error('Failed to get models status', error);
      throw error;
    }
  }

  async getModelsHealth() {
    try {
      return await this.client.getModelsHealth();
    } catch (error) {
      this.logger.error('Failed to get models health', error);
      throw error;
    }
  }

  async getModelsSummary() {
    try {
      return await this.client.getModelsSummary();
    } catch (error) {
      this.logger.error('Failed to get models summary', error);
      throw error;
    }
  }

  // ============================================================================
  // AI Signals & Decisions
  // ============================================================================

  async getSignals(symbol?: string): Promise<SignalsResponse> {
    const cacheKey = `signals_${symbol || 'all'}`;
    const cached = this.getCached<SignalsResponse>(cacheKey);
    if (cached) return cached;

    try {
      const response = await this.client.getSignals(symbol);
      this.setCache(cacheKey, response);
      return response;
    } catch (error) {
      this.logger.error('Failed to get signals', error);
      throw error;
    }
  }

  async getAISignals(): Promise<AISignal[]> {
    const response = await this.getSignals();
    return response.signals || [];
  }

  async getDecision(options: AIDecisionRequest): Promise<AIDecisionResponse> {
    try {
      return await this.client.getDecision(options);
    } catch (error) {
      this.logger.error('Failed to get AI decision', error);
      throw error;
    }
  }

  // ============================================================================
  // Resources & Providers
  // ============================================================================

  async getProviders(): Promise<ProvidersResponse> {
    try {
      return await this.client.getProviders();
    } catch (error) {
      this.logger.error('Failed to get providers', error);
      throw error;
    }
  }

  async getResources() {
    try {
      return await this.client.getResources();
    } catch (error) {
      this.logger.error('Failed to get resources', error);
      throw error;
    }
  }

  async getResourcesSummary() {
    try {
      return await this.client.getResourcesSummary();
    } catch (error) {
      this.logger.error('Failed to get resources summary', error);
      throw error;
    }
  }

  // ============================================================================
  // Dashboard Data (all-in-one)
  // ============================================================================

  async getDashboardData() {
    try {
      const [market, sentiment, news, signals] = await Promise.all([
        this.getTopCoins(50),
        this.getGlobalSentiment('1D'),
        this.getLatestNews(10),
        this.getSignals(),
      ]);

      return {
        success: true,
        market: market.coins || [],
        sentiment,
        news: news.articles || [],
        signals: signals.signals || [],
        timestamp: Date.now(),
      };
    } catch (error) {
      this.logger.error('Failed to get dashboard data', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: Date.now(),
      };
    }
  }

  // ============================================================================
  // Utility Methods
  // ============================================================================

  getConfig() {
    return this.client.getConfig();
  }

  updateConfig(config: any) {
    this.client.updateConfig(config);
  }

  clearAllCache() {
    this.clearCache();
    this.logger.info('Cache cleared');
  }
}

// Export singleton instance
export const unifiedDataService = UnifiedCryptoDataService.getInstance();
export default unifiedDataService;
