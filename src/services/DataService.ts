/**
 * DataService - Central Data Management Service
 * 
 * این سرویس مرکزی برای مدیریت تمام درخواست‌های داده است.
 * از HTTP به عنوان روش اصلی استفاده می‌کند و در صورت خطا به WebSocket متصل می‌شود.
 * 
 * ویژگی‌ها:
 * - HTTP-First با WebSocket Fallback
 * - احراز هویت با Bearer Token
 * - Validation کامل داده‌ها
 * - Error Handling حرفه‌ای
 * - Retry Logic با Exponential Backoff
 * - دریافت موازی تمام داده‌ها
 * 
 * استفاده:
 * ```typescript
 * import { dataService } from './services/DataService';
 * 
 * // دریافت تمام داده‌ها به صورت موازی
 * const allData = await dataService.fetchAllRequiredData();
 * 
 * // دریافت داده‌های خاص
 * const marketData = await dataService.getMarketData();
 * const priceChart = await dataService.getPriceChart('BTC', '1h', 100);
 * ```
 */

import { Logger } from '../core/Logger.js';

// ============================================================================
// Types & Interfaces
// ============================================================================

/**
 * پیکربندی سرویس
 */
export interface DataServiceConfig {
  /** آدرس پایه API */
  baseUrl?: string;
  /** توکن احراز هویت */
  token?: string;
  /** تایم‌اوت درخواست (میلی‌ثانیه) */
  timeout?: number;
  /** تعداد تلاش مجدد */
  maxRetries?: number;
  /** فاصله اولیه بین تلاش‌های مجدد (میلی‌ثانیه) */
  retryDelay?: number;
}

/**
 * پاسخ استاندارد
 */
export interface ServiceResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  status: number;
  timestamp: number;
  method?: 'http' | 'websocket';
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
 * داده‌های OHLCV
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
 * داده‌های احساسات
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

/**
 * نتیجه دریافت تمام داده‌ها
 */
export interface AllDataResult {
  success: boolean;
  timestamp: number;
  data: {
    market: ServiceResponse<MarketData[]>;
    chart: ServiceResponse<OHLCVData[]>;
    news: ServiceResponse<NewsData[]>;
    sentiment: ServiceResponse<SentimentData>;
    stats: ServiceResponse<MarketStats>;
    ai?: ServiceResponse<AIPrediction>;
  };
  summary: {
    total: number;
    successful: number;
    failed: number;
  };
}

// ============================================================================
// DataService Class
// ============================================================================

export class DataService {
  private logger = Logger.getInstance();
  private baseUrl: string;
  private token: string | undefined;
  private wsBase: string;
  private timeout: number;
  private maxRetries: number;
  private retryDelay: number;

  constructor(config?: DataServiceConfig) {
    // بارگذاری تنظیمات از environment variables
    this.baseUrl = config?.baseUrl ||
                   this.getEnv('HF_API_URL') ||
                   this.getEnv('VITE_HF_API_URL') ||
                   'https://really-amin-datasourceforcryptocurrency-2.hf.space';

    this.token = config?.token ||
                 this.getEnv('HF_API_TOKEN') ||
                 this.getEnv('VITE_HF_API_TOKEN');

    // تبدیل HTTP به WebSocket
    this.wsBase = this.baseUrl.replace(/^http/, 'ws');

    this.timeout = config?.timeout || 30000; // 30 ثانیه
    this.maxRetries = config?.maxRetries || 3;
    this.retryDelay = config?.retryDelay || 1000; // 1 ثانیه

    this.logger.info('DataService initialized', {
      baseUrl: this.baseUrl,
      hasToken: !!this.token,
      timeout: this.timeout
    });
  }

  /**
   * دریافت متغیر محیطی
   */
  private getEnv(key: string): string | undefined {
    if (typeof import.meta !== 'undefined' && import.meta.env) {
      return import.meta.env[key];
    }
    if (typeof process !== 'undefined' && process.env) {
      return process.env[key];
    }
    return undefined;
  }

  /**
   * تاخیر
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // ============================================================================
  // Core HTTP Method
  // ============================================================================

  /**
   * درخواست HTTP با Retry Logic
   */
  private async fetchFromService<T>(
    endpoint: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
    body: any = null,
    retryCount = 0
  ): Promise<ServiceResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      // تنظیم هدرها
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'DreammakerCrypto/1.0'
      };

      // افزودن توکن احراز هویت
      if (this.token) {
        headers['Authorization'] = `Bearer ${this.token}`;
      }

      this.logger.debug(`HTTP ${method} request`, { url, retryCount });

      // ارسال درخواست
      const response = await fetch(url, {
        method,
        headers,
        body: body ? JSON.stringify(body) : null,
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      // بررسی وضعیت پاسخ
      if (!response.ok) {
        // اگر خطای 5xx باشد و هنوز تلاش مجدد داریم
        if (response.status >= 500 && retryCount < this.maxRetries) {
          const delay = this.retryDelay * Math.pow(2, retryCount);
          this.logger.warn(`Request failed with ${response.status}, retrying in ${delay}ms...`, {
            url,
            retryCount: retryCount + 1
          });
          await this.sleep(delay);
          return this.fetchFromService<T>(endpoint, method, body, retryCount + 1);
        }

        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      // پارس کردن JSON
      const data = await response.json();

      return {
        success: true,
        data: data as T,
        status: response.status,
        timestamp: Date.now(),
        method: 'http'
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
          return this.fetchFromService<T>(endpoint, method, body, retryCount + 1);
        }
        
        // اگر HTTP شکست خورد، سعی کن از WebSocket استفاده کنی
        this.logger.warn('HTTP failed after all retries, trying WebSocket fallback...', { url });
        return this.fetchViaWebSocket<T>(endpoint, body);
      }

      // سایر خطاها - سعی کن از WebSocket استفاده کنی
      this.logger.warn('HTTP request failed, trying WebSocket fallback...', { url, error: error.message });
      return this.fetchViaWebSocket<T>(endpoint, body);
    }
  }

  // ============================================================================
  // WebSocket Fallback
  // ============================================================================

  /**
   * درخواست از طریق WebSocket (Fallback)
   */
  private async fetchViaWebSocket<T>(
    endpoint: string,
    payload: any = null
  ): Promise<ServiceResponse<T>> {
    return new Promise((resolve) => {
      let isResolved = false;
      let ws: WebSocket | null = null;

      // تایم‌اوت اتصال
      const connectionTimeoutId = setTimeout(() => {
        if (!isResolved) {
          isResolved = true;
          if (ws) ws.close();
          resolve({
            success: false,
            error: `WebSocket connection timeout after ${this.timeout}ms`,
            status: 408,
            timestamp: Date.now(),
            method: 'websocket'
          });
        }
      }, this.timeout);

      try {
        const wsUrl = `${this.wsBase}/ws`;
        this.logger.debug('Connecting to WebSocket', { wsUrl });

        ws = new WebSocket(wsUrl);

        ws.addEventListener('open', () => {
          this.logger.debug('WebSocket connected');
          clearTimeout(connectionTimeoutId);

          // ارسال درخواست
          const message = {
            action: 'subscribe',
            service: endpoint,
            ...(payload && { data: payload })
          };

          ws?.send(JSON.stringify(message));
        });

        ws.addEventListener('message', (event: MessageEvent) => {
          if (isResolved) return;

          try {
            const data = JSON.parse(event.data);
            this.logger.debug('WebSocket data received');

            clearTimeout(connectionTimeoutId);
            isResolved = true;

            resolve({
              success: true,
              data: data as T,
              status: 200,
              timestamp: Date.now(),
              method: 'websocket'
            });

            ws?.close();
          } catch (parseError) {
            this.logger.error('Failed to parse WebSocket message', { error: parseError });
          }
        });

        ws.addEventListener('error', (event: Event) => {
          if (!isResolved) {
            this.logger.error('WebSocket error', { event });
            clearTimeout(connectionTimeoutId);
            isResolved = true;
            resolve({
              success: false,
              error: 'WebSocket connection error',
              status: 500,
              timestamp: Date.now(),
              method: 'websocket'
            });
          }
        });

        ws.addEventListener('close', () => {
          if (!isResolved) {
            clearTimeout(connectionTimeoutId);
            isResolved = true;
            resolve({
              success: false,
              error: 'WebSocket closed before receiving data',
              status: 500,
              timestamp: Date.now(),
              method: 'websocket'
            });
          }
        });
      } catch (error: any) {
        clearTimeout(connectionTimeoutId);
        if (!isResolved) {
          isResolved = true;
          resolve({
            success: false,
            error: error.message || 'WebSocket error',
            status: 500,
            timestamp: Date.now(),
            method: 'websocket'
          });
        }
      }
    });
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
   * دریافت داده‌های بازار
   */
  async getMarketData(limit: number = 100): Promise<ServiceResponse<MarketData[]>> {
    const endpoint = `/api/market?limit=${limit}`;
    const response = await this.fetchFromService<MarketData[]>(endpoint);

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
   * دریافت نمودار قیمت
   */
  async getPriceChart(
    symbol: string,
    timeframe: '1m' | '5m' | '15m' | '1h' | '4h' | '1d' | '1w' = '1h',
    limit: number = 100
  ): Promise<ServiceResponse<OHLCVData[]>> {
    const endpoint = `/api/ohlcv?symbol=${symbol}&timeframe=${timeframe}&limit=${limit}`;
    const response = await this.fetchFromService<OHLCVData[]>(endpoint);

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
   * دریافت اخبار
   */
  async getNews(limit: number = 10): Promise<ServiceResponse<NewsData[]>> {
    const endpoint = `/api/news/latest?limit=${limit}`;
    const response = await this.fetchFromService<NewsData[]>(endpoint);

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
   */
  async getSentiment(): Promise<ServiceResponse<SentimentData>> {
    const endpoint = '/api/sentiment/global';
    const response = await this.fetchFromService<SentimentData>(endpoint);

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
   */
  async getMarketStats(): Promise<ServiceResponse<MarketStats>> {
    const endpoint = '/api/stats';
    return this.fetchFromService<MarketStats>(endpoint);
  }

  /**
   * دریافت پیش‌بینی AI
   */
  async getAIPredictions(payload: {
    model?: string;
    symbol: string;
    timeframe?: string;
    indicators?: string[];
  }): Promise<ServiceResponse<AIPrediction>> {
    const endpoint = '/api/ai/predict';
    return this.fetchFromService<AIPrediction>(endpoint, 'POST', payload);
  }

  // ============================================================================
  // Batch Operations
  // ============================================================================

  /**
   * دریافت تمام داده‌های مورد نیاز به صورت موازی
   * 
   * این متد تمام endpoint‌های ضروری را به صورت همزمان فراخوانی می‌کند
   */
  async fetchAllRequiredData(options?: {
    marketLimit?: number;
    chartSymbol?: string;
    chartTimeframe?: '1m' | '5m' | '15m' | '1h' | '4h' | '1d' | '1w';
    chartLimit?: number;
    newsLimit?: number;
    includeAI?: boolean;
  }): Promise<AllDataResult> {
    const {
      marketLimit = 100,
      chartSymbol = 'BTC',
      chartTimeframe = '1h',
      chartLimit = 100,
      newsLimit = 5,
      includeAI = false
    } = options || {};

    this.logger.info('Fetching all required data in parallel...');

    // فراخوانی موازی تمام endpoint‌ها
    const requests = [
      this.getMarketData(marketLimit),
      this.getPriceChart(chartSymbol, chartTimeframe, chartLimit),
      this.getNews(newsLimit),
      this.getSentiment(),
      this.getMarketStats()
    ];

    if (includeAI) {
      requests.push(this.getAIPredictions({ model: 'predictor', symbol: chartSymbol }));
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
        market: market as ServiceResponse<MarketData[]>,
        chart: chart as ServiceResponse<OHLCVData[]>,
        news: news as ServiceResponse<NewsData[]>,
        sentiment: sentiment as ServiceResponse<SentimentData>,
        stats: stats as ServiceResponse<MarketStats>,
        ...(includeAI && { ai: ai as ServiceResponse<AIPrediction> })
      },
      summary: {
        total: results.length,
        successful,
        failed
      }
    };
  }

  /**
   * بررسی سلامت سرویس
   */
  async healthCheck(): Promise<ServiceResponse<{ status: string; uptime?: number }>> {
    const endpoint = '/health';
    return this.fetchFromService(endpoint);
  }

  /**
   * به‌روزرسانی تنظیمات
   */
  updateConfig(config: Partial<DataServiceConfig>): void {
    if (config.baseUrl) {
      this.baseUrl = config.baseUrl;
      this.wsBase = this.baseUrl.replace(/^http/, 'ws');
    }
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
    wsBase: string;
    hasToken: boolean;
    timeout: number;
    maxRetries: number;
    retryDelay: number;
  } {
    return {
      baseUrl: this.baseUrl,
      wsBase: this.wsBase,
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

export const dataService = new DataService();

export default DataService;
