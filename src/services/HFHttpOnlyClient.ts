/**
 * HuggingFace HTTP-Only Data Client
 * 
 * این سرویس فقط از HTTP استاندارد استفاده می‌کند (بدون WebSocket)
 * و با استفاده از Bearer Token احراز هویت می‌شود.
 * 
 * ویژگی‌ها:
 * - فقط HTTP (بدون WebSocket)
 * - احراز هویت با Bearer Token
 * - Retry logic با Exponential Backoff
 * - Validation کامل برای تمام داده‌ها
 * - Error Handling حرفه‌ای
 * - Type-safe با TypeScript
 * 
 * استفاده:
 * ```typescript
 * const client = new HFHttpOnlyClient({
 *   baseUrl: process.env.HF_API_URL,
 *   token: process.env.HF_API_TOKEN
 * });
 * 
 * const marketData = await client.getMarketData({ limit: 100 });
 * ```
 */

import { Logger } from '../core/Logger.js';

// ============================================================================
// Types & Interfaces
// ============================================================================

/**
 * پیکربندی کلاینت
 */
export interface HFHttpClientConfig {
  /** آدرس پایه API (مثال: https://really-amin-datasourceforcryptocurrency-2.hf.space) */
  baseUrl?: string;
  /** توکن احراز هویت HuggingFace */
  token?: string;
  /** تایم‌اوت درخواست (میلی‌ثانیه) */
  timeout?: number;
  /** تعداد تلاش مجدد در صورت خطا */
  maxRetries?: number;
  /** فاصله اولیه بین تلاش‌های مجدد (میلی‌ثانیه) */
  retryDelay?: number;
}

/**
 * پاسخ استاندارد API
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  status: number;
  timestamp: number;
}

/**
 * داده‌های بازار
 */
export interface MarketData {
  symbol: string;
  name: string;
  price: number;
  change_24h: number;
  volume_24h: number;
  market_cap?: number;
  rank?: number;
  last_updated?: string;
}

/**
 * داده‌های OHLCV (کندل استیک)
 */
export interface OHLCVData {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

/**
 * داده‌های خبری
 */
export interface NewsData {
  id?: string;
  title: string;
  url: string;
  source?: string;
  published_at?: string;
  sentiment?: 'positive' | 'negative' | 'neutral';
  summary?: string;
}

/**
 * داده‌های احساسات بازار
 */
export interface SentimentData {
  fearGreedIndex?: number;
  sentiment?: 'extreme_fear' | 'fear' | 'neutral' | 'greed' | 'extreme_greed';
  score?: number;
  value?: number;
  value_classification?: string;
  timestamp?: string;
}

/**
 * آمار بازار
 */
export interface MarketStats {
  totalMarketCap: number;
  totalVolume24h: number;
  btcDominance: number;
  ethDominance?: number;
  marketCapChange24h?: number;
  activeCryptocurrencies?: number;
}

/**
 * پیش‌بینی AI
 */
export interface AIPrediction {
  symbol: string;
  action: 'buy' | 'sell' | 'hold';
  confidence: number;
  prediction?: number;
  timeframe?: string;
  timestamp?: string;
  reasoning?: string;
}

// ============================================================================
// HuggingFace HTTP-Only Client
// ============================================================================

export class HFHttpOnlyClient {
  private logger = Logger.getInstance();
  private baseUrl: string;
  private token: string | undefined;
  private timeout: number;
  private maxRetries: number;
  private retryDelay: number;

  constructor(config?: HFHttpClientConfig) {
    // بارگذاری تنظیمات از environment variables یا config
    this.baseUrl = config?.baseUrl ||
                   process.env.HF_API_URL ||
                   process.env.VITE_HF_API_URL ||
                   'https://really-amin-datasourceforcryptocurrency-2.hf.space';

    this.token = config?.token ||
                 process.env.HF_API_TOKEN ||
                 process.env.VITE_HF_API_TOKEN ||
                 process.env.HF_API_TOKEN || process.env.VITE_HF_API_TOKEN || ''; // Must be set via environment variable

    this.timeout = config?.timeout || 30000; // 30 ثانیه
    this.maxRetries = config?.maxRetries || 3;
    this.retryDelay = config?.retryDelay || 1000; // 1 ثانیه

    this.logger.info('HFHttpOnlyClient initialized', {
      baseUrl: this.baseUrl,
      hasToken: !!this.token,
      timeout: this.timeout
    });
  }

  // ============================================================================
  // Core HTTP Methods
  // ============================================================================

  /**
   * درخواست HTTP با Retry Logic
   */
  private async fetchWithRetry<T>(
    endpoint: string,
    options: RequestInit = {},
    retryCount = 0
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      // تنظیم هدرها
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'DreammakerCrypto/1.0',
        ...options.headers as Record<string, string>
      };

      // افزودن توکن احراز هویت
      if (this.token) {
        headers['Authorization'] = `Bearer ${this.token}`;
      }

      this.logger.debug(`HTTP ${options.method || 'GET'} request`, { url, retryCount });

      // ارسال درخواست
      const response = await fetch(url, {
        ...options,
        headers,
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      // بررسی وضعیت پاسخ
      if (!response.ok) {
        // اگر خطای 5xx باشد و هنوز تلاش مجدد داریم
        if (response.status >= 500 && retryCount < this.maxRetries) {
          const delay = this.retryDelay * Math.pow(2, retryCount); // Exponential backoff
          this.logger.warn(`Request failed with ${response.status}, retrying in ${delay}ms...`, {
            url,
            retryCount: retryCount + 1
          });
          await this.sleep(delay);
          return this.fetchWithRetry<T>(endpoint, options, retryCount + 1);
        }

        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      // پارس کردن JSON
      const data = await response.json();

      return {
        success: true,
        data: data as T,
        status: response.status,
        timestamp: Date.now()
      };

    } catch (error: any) {
      clearTimeout(timeoutId);

      // اگر تایم‌اوت شد
      if (error.name === 'AbortError') {
        if (retryCount < this.maxRetries) {
          const delay = this.retryDelay * Math.pow(2, retryCount);
          this.logger.warn(`Request timeout, retrying in ${delay}ms...`, {
            url,
            retryCount: retryCount + 1
          });
          await this.sleep(delay);
          return this.fetchWithRetry<T>(endpoint, options, retryCount + 1);
        }
        
        this.logger.error('Request timeout after all retries', { url, retryCount });
        return {
          success: false,
          error: `Request timeout after ${this.timeout}ms`,
          status: 408,
          timestamp: Date.now()
        };
      }

      // سایر خطاها
      this.logger.error('HTTP request failed', { url, error: error.message });
      return {
        success: false,
        error: error.message || 'Unknown error',
        status: 500,
        timestamp: Date.now()
      };
    }
  }

  /**
   * درخواست GET
   */
  private async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.fetchWithRetry<T>(endpoint, { method: 'GET' });
  }

  /**
   * درخواست POST
   */
  private async post<T>(endpoint: string, body: any): Promise<ApiResponse<T>> {
    return this.fetchWithRetry<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(body)
    });
  }

  /**
   * تابع کمکی برای تاخیر
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // ============================================================================
  // Data Validation Methods
  // ============================================================================

  /**
   * اعتبارسنجی داده‌های بازار
   */
  private validateMarketData(data: any): boolean {
    if (!data) return false;
    
    const items = Array.isArray(data) ? data : data.items || data.data || [];
    if (!Array.isArray(items) || items.length === 0) return false;

    const firstItem = items[0];
    return !!(firstItem.symbol && typeof firstItem.price === 'number');
  }

  /**
   * اعتبارسنجی داده‌های OHLCV
   */
  private validateOHLCVData(data: any): boolean {
    if (!Array.isArray(data) || data.length === 0) return false;

    const firstItem = data[0];
    return !!(
      firstItem.open !== undefined &&
      firstItem.high !== undefined &&
      firstItem.low !== undefined &&
      firstItem.close !== undefined &&
      firstItem.volume !== undefined
    );
  }

  /**
   * اعتبارسنجی داده‌های خبری
   */
  private validateNewsData(data: any): boolean {
    if (!data) return false;

    const items = Array.isArray(data) ? data : data.news || data.items || data.data || [];
    if (!Array.isArray(items) || items.length === 0) return false;

    const firstItem = items[0];
    return !!(firstItem.title && firstItem.url);
  }

  /**
   * اعتبارسنجی داده‌های احساسات
   */
  private validateSentimentData(data: any): boolean {
    if (!data || typeof data !== 'object') return false;

    return !!(
      typeof data.fearGreedIndex === 'number' ||
      typeof data.sentiment === 'string' ||
      typeof data.score === 'number' ||
      typeof data.value === 'number'
    );
  }

  // ============================================================================
  // Public API Methods
  // ============================================================================

  /**
   * دریافت داده‌های بازار (لیست ارزها)
   * 
   * @param params - پارامترهای درخواست
   * @returns داده‌های بازار
   */
  async getMarketData(params?: {
    limit?: number;
    sort?: 'market_cap' | 'volume' | 'price';
    order?: 'asc' | 'desc';
  }): Promise<ApiResponse<MarketData[]>> {
    const { limit = 100, sort = 'market_cap', order = 'desc' } = params || {};
    const endpoint = `/api/market?limit=${limit}&sort=${sort}&order=${order}`;

    const response = await this.get<MarketData[]>(endpoint);

    if (response.success && response.data) {
      if (!this.validateMarketData(response.data)) {
        this.logger.warn('Market data validation failed');
        return {
          success: false,
          error: 'Invalid market data format',
          status: 422,
          timestamp: Date.now()
        };
      }
    }

    return response;
  }

  /**
   * دریافت داده‌های نمودار قیمت (OHLCV)
   * 
   * @param params - پارامترهای درخواست
   * @returns داده‌های OHLCV
   */
  async getPriceChart(params: {
    symbol: string;
    timeframe?: '1m' | '5m' | '15m' | '1h' | '4h' | '1d' | '1w';
    limit?: number;
  }): Promise<ApiResponse<OHLCVData[]>> {
    const { symbol, timeframe = '1h', limit = 100 } = params;
    const endpoint = `/api/ohlcv?symbol=${symbol}&timeframe=${timeframe}&limit=${limit}`;

    const response = await this.get<OHLCVData[]>(endpoint);

    if (response.success && response.data) {
      if (!this.validateOHLCVData(response.data)) {
        this.logger.warn('OHLCV data validation failed');
        return {
          success: false,
          error: 'Invalid OHLCV data format',
          status: 422,
          timestamp: Date.now()
        };
      }
    }

    return response;
  }

  /**
   * دریافت آخرین اخبار
   * 
   * @param params - پارامترهای درخواست
   * @returns داده‌های خبری
   */
  async getNews(params?: {
    limit?: number;
    category?: string;
    sentiment?: 'positive' | 'negative' | 'neutral';
  }): Promise<ApiResponse<NewsData[]>> {
    const { limit = 10, category, sentiment } = params || {};
    let endpoint = `/api/news/latest?limit=${limit}`;
    
    if (category) endpoint += `&category=${category}`;
    if (sentiment) endpoint += `&sentiment=${sentiment}`;

    const response = await this.get<NewsData[]>(endpoint);

    if (response.success && response.data) {
      if (!this.validateNewsData(response.data)) {
        this.logger.warn('News data validation failed');
        return {
          success: false,
          error: 'Invalid news data format',
          status: 422,
          timestamp: Date.now()
        };
      }
    }

    return response;
  }

  /**
   * دریافت احساسات بازار
   * 
   * @returns داده‌های احساسات
   */
  async getSentiment(): Promise<ApiResponse<SentimentData>> {
    const endpoint = '/api/sentiment/global';
    const response = await this.get<SentimentData>(endpoint);

    if (response.success && response.data) {
      if (!this.validateSentimentData(response.data)) {
        this.logger.warn('Sentiment data validation failed');
        return {
          success: false,
          error: 'Invalid sentiment data format',
          status: 422,
          timestamp: Date.now()
        };
      }
    }

    return response;
  }

  /**
   * دریافت آمار بازار
   * 
   * @returns آمار بازار
   */
  async getMarketStats(): Promise<ApiResponse<MarketStats>> {
    const endpoint = '/api/stats';
    return this.get<MarketStats>(endpoint);
  }

  /**
   * دریافت پیش‌بینی AI
   * 
   * @param params - پارامترهای درخواست
   * @returns پیش‌بینی AI
   */
  async getAIPrediction(params: {
    symbol: string;
    timeframe?: string;
    indicators?: string[];
  }): Promise<ApiResponse<AIPrediction>> {
    const endpoint = '/api/ai/predict';
    return this.post<AIPrediction>(endpoint, params);
  }

  /**
   * بررسی سلامت سرویس
   * 
   * @returns وضعیت سلامت
   */
  async healthCheck(): Promise<ApiResponse<{ status: string; uptime?: number }>> {
    const endpoint = '/health';
    return this.get(endpoint);
  }

  // ============================================================================
  // Batch Operations
  // ============================================================================

  /**
   * دریافت تمام داده‌های مورد نیاز به صورت موازی
   * 
   * این متد تمام endpoint‌های ضروری را به صورت همزمان فراخوانی می‌کند
   * و نتایج را در یک شیء واحد برمی‌گرداند.
   * 
   * @param options - تنظیمات درخواست
   * @returns تمام داده‌های دریافت شده
   */
  async fetchAllData(options?: {
    marketLimit?: number;
    chartSymbol?: string;
    chartTimeframe?: '1m' | '5m' | '15m' | '1h' | '4h' | '1d' | '1w';
    chartLimit?: number;
    newsLimit?: number;
    includeAI?: boolean;
  }): Promise<{
    success: boolean;
    timestamp: number;
    data: {
      market: ApiResponse<MarketData[]>;
      chart: ApiResponse<OHLCVData[]>;
      news: ApiResponse<NewsData[]>;
      sentiment: ApiResponse<SentimentData>;
      stats: ApiResponse<MarketStats>;
      ai?: ApiResponse<AIPrediction>;
    };
    summary: {
      total: number;
      successful: number;
      failed: number;
    };
  }> {
    const {
      marketLimit = 100,
      chartSymbol = 'BTC',
      chartTimeframe = '1h',
      chartLimit = 100,
      newsLimit = 10,
      includeAI = false
    } = options || {};

    this.logger.info('Fetching all data in parallel...');

    // فراخوانی موازی تمام endpoint‌ها
    const requests = [
      this.getMarketData({ limit: marketLimit }),
      this.getPriceChart({ symbol: chartSymbol, timeframe: chartTimeframe, limit: chartLimit }),
      this.getNews({ limit: newsLimit }),
      this.getSentiment(),
      this.getMarketStats()
    ];

    if (includeAI) {
      requests.push(this.getAIPrediction({ symbol: chartSymbol, timeframe: chartTimeframe }));
    }

    const results = await Promise.allSettled(requests);

    // پردازش نتایج
    const [market, chart, news, sentiment, stats, ai] = results.map(result =>
      result.status === 'fulfilled' ? result.value : {
        success: false,
        error: result.status === 'rejected' ? result.reason?.message : 'Unknown error',
        status: 500,
        timestamp: Date.now()
      }
    );

    const successful = results.filter(r => r.status === 'fulfilled' && (r.value as any).success).length;
    const failed = results.length - successful;

    this.logger.info('Batch fetch complete', {
      total: results.length,
      successful,
      failed
    });

    return {
      success: successful > 0,
      timestamp: Date.now(),
      data: {
        market: market as ApiResponse<MarketData[]>,
        chart: chart as ApiResponse<OHLCVData[]>,
        news: news as ApiResponse<NewsData[]>,
        sentiment: sentiment as ApiResponse<SentimentData>,
        stats: stats as ApiResponse<MarketStats>,
        ...(includeAI && { ai: ai as ApiResponse<AIPrediction> })
      },
      summary: {
        total: results.length,
        successful,
        failed
      }
    };
  }

  // ============================================================================
  // Configuration Methods
  // ============================================================================

  /**
   * به‌روزرسانی تنظیمات
   */
  updateConfig(config: Partial<HFHttpClientConfig>): void {
    if (config.baseUrl) this.baseUrl = config.baseUrl;
    if (config.token !== undefined) this.token = config.token;
    if (config.timeout) this.timeout = config.timeout;
    if (config.maxRetries) this.maxRetries = config.maxRetries;
    if (config.retryDelay) this.retryDelay = config.retryDelay;

    this.logger.info('Configuration updated', {
      baseUrl: this.baseUrl,
      hasToken: !!this.token
    });
  }

  /**
   * دریافت تنظیمات فعلی
   */
  getConfig(): {
    baseUrl: string;
    hasToken: boolean;
    timeout: number;
    maxRetries: number;
    retryDelay: number;
  } {
    return {
      baseUrl: this.baseUrl,
      hasToken: !!this.token,
      timeout: this.timeout,
      maxRetries: this.maxRetries,
      retryDelay: this.retryDelay
    };
  }
}

// ============================================================================
// Export Singleton Instance
// ============================================================================

export const hfHttpClient = new HFHttpOnlyClient();

export default HFHttpOnlyClient;
