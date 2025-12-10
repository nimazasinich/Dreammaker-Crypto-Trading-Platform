/**
 * CryptoDataClient - TypeScript/JavaScript Client for Crypto Data API
 * 
 * This client provides a comprehensive interface to interact with the
 * cryptocurrency data service hosted on HuggingFace Space.
 * 
 * Base URL: https://really-amin-datasourceforcryptocurrency-2.hf.space
 * 
 * @author Auto-generated
 * @version 1.0.0
 */

import axios, { AxiosInstance, AxiosError } from 'axios';
import type {
  HealthResponse,
  StatusResponse,
  RoutersResponse,
  RateResponse,
  BatchRatesResponse,
  TopCoinsResponse,
  TrendingResponse,
  MarketResponse,
  MarketStatusResponse,
  HistoryResponse,
  SentimentResponse,
  AssetSentimentResponse,
  TextAnalysisResponse,
  NewsResponse,
  ModelsListResponse,
  ModelsStatusResponse,
  ModelsHealthResponse,
  ModelsSummaryResponse,
  ModelTestResponse,
  ReinitializeResponse,
  SignalsResponse,
  AIDecisionRequest,
  AIDecisionResponse,
  ResourcesResponse,
  ResourcesSummaryResponse,
  ResourceCategoriesResponse,
  ProvidersResponse,
  CryptoClientConfig,
} from './types';

/**
 * Custom error class for Crypto API errors
 */
export class CryptoAPIError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public endpoint: string,
    public details?: any
  ) {
    super(message);
    this.name = 'CryptoAPIError';
    Object.setPrototypeOf(this, CryptoAPIError.prototype);
  }
}

/**
 * Main client class for interacting with Crypto Data API
 */
export class CryptoDataClient {
  private baseUrl: string;
  private timeout: number;
  private retries: number;
  private retryDelay: number;
  private axiosInstance: AxiosInstance;

  /**
   * Creates a new instance of CryptoDataClient
   * 
   * @param config - Configuration options for the client
   * @example
   * ```typescript
   * const client = new CryptoDataClient({
   *   baseUrl: 'https://really-amin-datasourceforcryptocurrency-2.hf.space',
   *   timeout: 30000
   * });
   * ```
   */
  constructor(config: CryptoClientConfig = {}) {
    this.baseUrl = config.baseUrl || 'https://really-amin-datasourceforcryptocurrency-2.hf.space';
    this.timeout = config.timeout || 30000;
    this.retries = config.retries || 3;
    this.retryDelay = config.retryDelay || 1000;

    // Create axios instance with default configuration
    this.axiosInstance = axios.create({
      baseURL: this.baseUrl,
      timeout: this.timeout,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });
  }

  /**
   * Private method to handle GET requests
   * 
   * @param endpoint - API endpoint path
   * @param params - Query parameters
   * @returns Promise with typed response
   */
  private async get<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt < this.retries; attempt++) {
      try {
        const response = await this.axiosInstance.get<T>(endpoint, { params });
        return response.data;
      } catch (error) {
        lastError = error as Error;
        
        if (axios.isAxiosError(error)) {
          const axiosError = error as AxiosError;
          
          // Don't retry on client errors (4xx)
          if (axiosError.response && axiosError.response.status >= 400 && axiosError.response.status < 500) {
            throw new CryptoAPIError(
              axiosError.message || 'API request failed',
              axiosError.response.status,
              endpoint,
              axiosError.response.data
            );
          }
        }

        // Wait before retrying
        if (attempt < this.retries - 1) {
          await this.sleep(this.retryDelay * (attempt + 1));
        }
      }
    }

    // If all retries failed
    throw new CryptoAPIError(
      lastError?.message || 'Request failed after multiple retries',
      500,
      endpoint
    );
  }

  /**
   * Private method to handle POST requests
   * 
   * @param endpoint - API endpoint path
   * @param data - Request body data
   * @returns Promise with typed response
   */
  private async post<T>(endpoint: string, data?: Record<string, any>): Promise<T> {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt < this.retries; attempt++) {
      try {
        const response = await this.axiosInstance.post<T>(endpoint, data);
        return response.data;
      } catch (error) {
        lastError = error as Error;
        
        if (axios.isAxiosError(error)) {
          const axiosError = error as AxiosError;
          
          // Don't retry on client errors (4xx)
          if (axiosError.response && axiosError.response.status >= 400 && axiosError.response.status < 500) {
            throw new CryptoAPIError(
              axiosError.message || 'API request failed',
              axiosError.response.status,
              endpoint,
              axiosError.response.data
            );
          }
        }

        // Wait before retrying
        if (attempt < this.retries - 1) {
          await this.sleep(this.retryDelay * (attempt + 1));
        }
      }
    }

    // If all retries failed
    throw new CryptoAPIError(
      lastError?.message || 'Request failed after multiple retries',
      500,
      endpoint
    );
  }

  /**
   * Helper method to sleep for a specified duration
   * 
   * @param ms - Milliseconds to sleep
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // ============================================
  // GROUP 1: Health & Status Endpoints
  // ============================================

  /**
   * Check the health status of the API service
   * 
   * @returns Health status information
   * @example
   * ```typescript
   * const health = await client.health();
   * console.log('Service status:', health.status);
   * ```
   */
  async health(): Promise<HealthResponse> {
    return this.get<HealthResponse>('/api/health');
  }

  /**
   * Get the current system status
   * 
   * @returns System status information
   * @example
   * ```typescript
   * const status = await client.status();
   * console.log('Uptime:', status.uptime);
   * ```
   */
  async status(): Promise<StatusResponse> {
    return this.get<StatusResponse>('/api/status');
  }

  /**
   * Get the status of all API routers
   * 
   * @returns Router status information
   * @example
   * ```typescript
   * const routers = await client.getRouters();
   * console.log('Available routes:', routers.total);
   * ```
   */
  async getRouters(): Promise<RoutersResponse> {
    return this.get<RoutersResponse>('/api/routers');
  }

  // ============================================
  // GROUP 2: Price & Rate Endpoints
  // ============================================

  /**
   * Get the current rate for a specific trading pair
   * 
   * @param pair - Trading pair (e.g., "BTC/USDT")
   * @returns Current rate information
   * @example
   * ```typescript
   * const rate = await client.getRate('BTC/USDT');
   * console.log('BTC Price:', rate.price);
   * ```
   */
  async getRate(pair: string): Promise<RateResponse> {
    return this.get<RateResponse>('/api/service/rate', { pair });
  }

  /**
   * Get rates for multiple trading pairs in a single request
   * 
   * @param pairs - Array of trading pairs
   * @returns Batch rates information
   * @example
   * ```typescript
   * const rates = await client.getBatchRates(['BTC/USDT', 'ETH/USDT']);
   * console.log('Rates:', rates.rates);
   * ```
   */
  async getBatchRates(pairs: string[]): Promise<BatchRatesResponse> {
    return this.get<BatchRatesResponse>('/api/service/rate/batch', { pairs: pairs.join(',') });
  }

  /**
   * Get top cryptocurrencies by market cap
   * 
   * @param limit - Number of coins to retrieve (default: 50)
   * @returns Top coins information
   * @example
   * ```typescript
   * const topCoins = await client.getTopCoins(10);
   * console.log('Top 10 coins:', topCoins.coins);
   * ```
   */
  async getTopCoins(limit: number = 50): Promise<TopCoinsResponse> {
    return this.get<TopCoinsResponse>('/api/coins/top', { limit });
  }

  /**
   * Get currently trending cryptocurrencies
   * 
   * @returns Trending coins information
   * @example
   * ```typescript
   * const trending = await client.getTrending();
   * console.log('Trending coins:', trending.coins);
   * ```
   */
  async getTrending(): Promise<TrendingResponse> {
    return this.get<TrendingResponse>('/api/trending');
  }

  // ============================================
  // GROUP 3: Market Data Endpoints
  // ============================================

  /**
   * Get global market overview
   * 
   * @returns Market overview data
   * @example
   * ```typescript
   * const market = await client.getMarket();
   * console.log('Total Market Cap:', market.total_market_cap);
   * ```
   */
  async getMarket(): Promise<MarketResponse> {
    return this.get<MarketResponse>('/api/market');
  }

  /**
   * Get current market status
   * 
   * @returns Market status information
   * @example
   * ```typescript
   * const status = await client.getMarketStatus();
   * console.log('Active exchanges:', status.active_exchanges);
   * ```
   */
  async getMarketStatus(): Promise<MarketStatusResponse> {
    return this.get<MarketStatusResponse>('/api/service/market-status');
  }

  /**
   * Get historical price data for a symbol
   * 
   * @param symbol - Cryptocurrency symbol (e.g., "BTC")
   * @param interval - Time interval (e.g., "1h", "1d")
   * @param limit - Number of data points to retrieve
   * @returns Historical price data
   * @example
   * ```typescript
   * const history = await client.getHistory('BTC', '1h', 24);
   * console.log('24h history:', history.data);
   * ```
   */
  async getHistory(symbol: string, interval: string, limit: number): Promise<HistoryResponse> {
    return this.get<HistoryResponse>('/api/service/history', { symbol, interval, limit });
  }

  // ============================================
  // GROUP 4: Sentiment Analysis Endpoints
  // ============================================

  /**
   * Get global market sentiment
   * 
   * @param timeframe - Time period ("1D", "7D", or "30D")
   * @returns Global sentiment data
   * @example
   * ```typescript
   * const sentiment = await client.getGlobalSentiment('1D');
   * console.log('Fear & Greed Index:', sentiment.fear_greed_index);
   * ```
   */
  async getGlobalSentiment(timeframe: '1D' | '7D' | '30D' = '1D'): Promise<SentimentResponse> {
    return this.get<SentimentResponse>('/api/sentiment/global', { timeframe });
  }

  /**
   * Get sentiment for a specific asset
   * 
   * @param symbol - Asset symbol (e.g., "BTC")
   * @returns Asset-specific sentiment data
   * @example
   * ```typescript
   * const sentiment = await client.getAssetSentiment('BTC');
   * console.log('BTC Sentiment:', sentiment.sentiment);
   * ```
   */
  async getAssetSentiment(symbol: string): Promise<AssetSentimentResponse> {
    return this.get<AssetSentimentResponse>(`/api/sentiment/asset/${symbol}`);
  }

  /**
   * Analyze sentiment of a text using AI
   * 
   * @param text - Text to analyze
   * @param mode - Analysis mode (optional)
   * @returns Sentiment analysis results
   * @example
   * ```typescript
   * const analysis = await client.analyzeText('Bitcoin is pumping!');
   * console.log('Sentiment:', analysis.sentiment);
   * ```
   */
  async analyzeText(text: string, mode?: string): Promise<TextAnalysisResponse> {
    return this.post<TextAnalysisResponse>('/api/service/sentiment', { text, mode });
  }

  // ============================================
  // GROUP 5: News Endpoints
  // ============================================

  /**
   * Get latest cryptocurrency news
   * 
   * @param limit - Number of articles to retrieve
   * @returns News articles
   * @example
   * ```typescript
   * const news = await client.getNews(10);
   * console.log('Latest news:', news.articles);
   * ```
   */
  async getNews(limit?: number): Promise<NewsResponse> {
    return this.get<NewsResponse>('/api/news', limit ? { limit } : undefined);
  }

  /**
   * Get the most recent news articles
   * 
   * @param limit - Number of articles to retrieve
   * @returns Latest news articles
   * @example
   * ```typescript
   * const news = await client.getLatestNews(5);
   * console.log('Latest 5 articles:', news.articles);
   * ```
   */
  async getLatestNews(limit?: number): Promise<NewsResponse> {
    return this.get<NewsResponse>('/api/news/latest', limit ? { limit } : undefined);
  }

  // ============================================
  // GROUP 6: AI Models Endpoints
  // ============================================

  /**
   * Get list of available AI models
   * 
   * @returns List of AI models
   * @example
   * ```typescript
   * const models = await client.getModels();
   * console.log('Available models:', models.count);
   * ```
   */
  async getModels(): Promise<ModelsListResponse> {
    return this.get<ModelsListResponse>('/api/models/list');
  }

  /**
   * Get status of all AI models
   * 
   * @returns Models status information
   * @example
   * ```typescript
   * const status = await client.getModelsStatus();
   * console.log('Loaded models:', status.loaded);
   * ```
   */
  async getModelsStatus(): Promise<ModelsStatusResponse> {
    return this.get<ModelsStatusResponse>('/api/models/status');
  }

  /**
   * Get health status of AI models
   * 
   * @returns Models health information
   * @example
   * ```typescript
   * const health = await client.getModelsHealth();
   * console.log('Overall health:', health.overall_health);
   * ```
   */
  async getModelsHealth(): Promise<ModelsHealthResponse> {
    return this.get<ModelsHealthResponse>('/api/models/health');
  }

  /**
   * Get summary of AI models
   * 
   * @returns Models summary information
   * @example
   * ```typescript
   * const summary = await client.getModelsSummary();
   * console.log('Total models:', summary.total_models);
   * ```
   */
  async getModelsSummary(): Promise<ModelsSummaryResponse> {
    return this.get<ModelsSummaryResponse>('/api/models/summary');
  }

  /**
   * Test an AI model
   * 
   * @param modelKey - Key of the model to test (optional)
   * @returns Test results
   * @example
   * ```typescript
   * const result = await client.testModel();
   * console.log('Test success:', result.success);
   * ```
   */
  async testModel(modelKey?: string): Promise<ModelTestResponse> {
    return this.post<ModelTestResponse>('/api/models/test', modelKey ? { model: modelKey } : undefined);
  }

  /**
   * Reinitialize all AI models
   * 
   * @returns Reinitialization results
   * @example
   * ```typescript
   * const result = await client.reinitializeModels();
   * console.log('Models reinitialized:', result.models_reinitialized);
   * ```
   */
  async reinitializeModels(): Promise<ReinitializeResponse> {
    return this.post<ReinitializeResponse>('/api/models/reinitialize');
  }

  // ============================================
  // GROUP 7: AI Signals Endpoints
  // ============================================

  /**
   * Get AI trading signals
   * 
   * @param symbol - Optional symbol to filter signals
   * @returns AI trading signals
   * @example
   * ```typescript
   * const signals = await client.getSignals('BTC');
   * console.log('BTC signals:', signals.signals);
   * ```
   */
  async getSignals(symbol?: string): Promise<SignalsResponse> {
    return this.get<SignalsResponse>('/api/ai/signals', symbol ? { symbol } : undefined);
  }

  /**
   * Get AI trading decision for a specific setup
   * 
   * @param options - Decision request parameters
   * @returns AI trading decision
   * @example
   * ```typescript
   * const decision = await client.getDecision({
   *   symbol: 'BTC',
   *   horizon: 'swing',
   *   risk_tolerance: 'moderate'
   * });
   * console.log('Decision:', decision.decision);
   * ```
   */
  async getDecision(options: AIDecisionRequest): Promise<AIDecisionResponse> {
    return this.post<AIDecisionResponse>('/api/ai/decision', options);
  }

  // ============================================
  // GROUP 8: Resources Endpoints
  // ============================================

  /**
   * Get system resources statistics
   * 
   * @returns Resource statistics
   * @example
   * ```typescript
   * const resources = await client.getResources();
   * console.log('CPU:', resources.stats.cpu_percent);
   * ```
   */
  async getResources(): Promise<ResourcesResponse> {
    return this.get<ResourcesResponse>('/api/resources');
  }

  /**
   * Get resources summary
   * 
   * @returns Resources summary
   * @example
   * ```typescript
   * const summary = await client.getResourcesSummary();
   * console.log('Usage:', summary.usage_percent);
   * ```
   */
  async getResourcesSummary(): Promise<ResourcesSummaryResponse> {
    return this.get<ResourcesSummaryResponse>('/api/resources/summary');
  }

  /**
   * Get resource categories
   * 
   * @returns Resource categories
   * @example
   * ```typescript
   * const categories = await client.getResourceCategories();
   * console.log('Categories:', categories.total);
   * ```
   */
  async getResourceCategories(): Promise<ResourceCategoriesResponse> {
    return this.get<ResourceCategoriesResponse>('/api/resources/categories');
  }

  /**
   * Get list of data providers
   * 
   * @returns Data providers information
   * @example
   * ```typescript
   * const providers = await client.getProviders();
   * console.log('Providers:', providers.count);
   * ```
   */
  async getProviders(): Promise<ProvidersResponse> {
    return this.get<ProvidersResponse>('/api/providers');
  }

  // ============================================
  // Utility Methods
  // ============================================

  /**
   * Update client configuration
   * 
   * @param config - New configuration options
   * @example
   * ```typescript
   * client.updateConfig({ timeout: 60000 });
   * ```
   */
  updateConfig(config: Partial<CryptoClientConfig>): void {
    if (config.baseUrl) {
      this.baseUrl = config.baseUrl;
      this.axiosInstance.defaults.baseURL = this.baseUrl;
    }
    if (config.timeout) {
      this.timeout = config.timeout;
      this.axiosInstance.defaults.timeout = this.timeout;
    }
    if (config.retries !== undefined) {
      this.retries = config.retries;
    }
    if (config.retryDelay !== undefined) {
      this.retryDelay = config.retryDelay;
    }
  }

  /**
   * Get current client configuration
   * 
   * @returns Current configuration
   */
  getConfig(): CryptoClientConfig {
    return {
      baseUrl: this.baseUrl,
      timeout: this.timeout,
      retries: this.retries,
      retryDelay: this.retryDelay,
    };
  }
}

export default CryptoDataClient;
export { CryptoAPIError };
