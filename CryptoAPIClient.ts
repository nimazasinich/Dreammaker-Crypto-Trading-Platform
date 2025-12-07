/**
 * Crypto API Monitor - TypeScript Client Library
 * نسخه: 1.0.0
 * 
 * کتابخانه کامل برای ارتباط با Crypto API Monitor
 * با پشتیبانی از تمام endpoint‌ها و مدیریت خطای پیشرفته
 */

// ============================================================================
// Types & Interfaces
// ============================================================================

/**
 * تنظیمات کلاینت
 */
export interface ClientConfig {
    baseURL: string;
    timeout?: number;
    retries?: number;
    retryDelay?: number;
}

/**
 * پاسخ عمومی API
 */
export interface APIResponse<T = any> {
    success?: boolean;
    data?: T;
    error?: string;
    message?: string;
    source?: string;
    sources_tried?: string[] | number;
    count?: number;
    timestamp?: string;
}

/**
 * یک کندل OHLCV
 */
export interface OHLCVCandle {
    time: number;        // Unix timestamp
    open: number;        // قیمت باز شدن
    high: number;        // بالاترین قیمت
    low: number;         // پایین‌ترین قیمت
    close: number;       // قیمت بسته شدن
    volume: number;      // حجم معاملات
}

/**
 * پاسخ OHLCV
 */
export interface OHLCVResponse extends APIResponse<OHLCVCandle[]> {
    symbol: string;
    timeframe: string;
    count: number;
    source: string;
}

/**
 * اطلاعات یک ارز
 */
export interface CoinInfo {
    id: string;
    name: string;
    symbol: string;
    image: string;
    current_price: number;
    price_change_percentage_24h: number;
    market_cap: number;
    volume_24h?: number;
    rank?: number;
}

/**
 * پاسخ لیست ارزها
 */
export interface CoinsResponse extends APIResponse<CoinInfo[]> {
    coins?: CoinInfo[];
}

/**
 * یک خبر
 */
export interface NewsArticle {
    title: string;
    source: string;
    published_at: string;
    summary: string;
    url: string;
    sentiment?: string;
}

/**
 * پاسخ اخبار
 */
export interface NewsResponse extends APIResponse<NewsArticle[]> {
    news?: NewsArticle[];
    articles?: NewsArticle[];
}

/**
 * درخواست تحلیل احساسات
 */
export interface SentimentRequest {
    text: string;
    symbol?: string;
}

/**
 * پاسخ تحلیل احساسات
 */
export interface SentimentResponse {
    label: string;           // bullish, bearish, neutral
    score: number;           // 0-1
    model: string;
    symbol?: string;
    meta?: {
        length: number;
        timestamp: string;
        mode: string;
    };
}

/**
 * درخواست تصمیم AI
 */
export interface AIDecisionRequest {
    symbol: string;
    timeframe?: string;
    text?: string;
}

/**
 * پاسخ تصمیم AI
 */
export interface AIDecisionResponse {
    decision: 'BUY' | 'SELL' | 'HOLD';
    confidence: number;      // 0-100
    reason: string;
    indicators?: {
        rsi?: number;
        macd?: string;
        volume?: string;
        [key: string]: any;
    };
    timestamp: string;
}

/**
 * اطلاعات یک مدل AI
 */
export interface ModelInfo {
    name: string;
    status: string;
    type: string;
    description?: string;
    endpoint?: string;
}

/**
 * پاسخ لیست مدل‌ها
 */
export interface ModelsResponse {
    categories: {
        [category: string]: ModelInfo[];
    };
    total: number;
    available: number;
    timestamp: string;
}

/**
 * اطلاعات نرخ معامله
 */
export interface ServiceRateResponse {
    success: boolean;
    pair: string;
    symbol: string;
    quote: string;
    price: number;
    bid?: number;
    ask?: number;
    volume_24h?: number;
    change_24h?: number;
    source: string;
}

// ============================================================================
// Main Client Class
// ============================================================================

/**
 * کلاینت اصلی برای ارتباط با Crypto API Monitor
 * 
 * @example
 * ```typescript
 * const client = new CryptoAPIClient({
 *   baseURL: 'https://huggingface.co/spaces/Really-amin/Datasourceforcryptocurrency-2'
 * });
 * 
 * // دریافت OHLCV
 * const ohlcv = await client.getOHLCV('BTC', '1h', 100);
 * console.log(ohlcv);
 * ```
 */
export class CryptoAPIClient {
    private baseURL: string;
    private timeout: number;
    private retries: number;
    private retryDelay: number;

    /**
     * سازنده کلاینت
     * 
     * @param config - تنظیمات کلاینت
     */
    constructor(config: ClientConfig) {
        this.baseURL = config.baseURL.replace(/\/$/, ''); // حذف / از انتها
        this.timeout = config.timeout || 15000; // 15 ثانیه
        this.retries = config.retries || 3;
        this.retryDelay = config.retryDelay || 1000; // 1 ثانیه
    }

    /**
     * درخواست عمومی با مدیریت خطا و retry
     * 
     * @private
     */
    private async request<T = any>(
        endpoint: string,
        options: RequestInit = {}
    ): Promise<T> {
        const url = `${this.baseURL}${endpoint}`;
        let lastError: Error | null = null;

        for (let attempt = 0; attempt < this.retries; attempt++) {
            try {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), this.timeout);

                const response = await fetch(url, {
                    ...options,
                    signal: controller.signal,
                    headers: {
                        'Content-Type': 'application/json',
                        ...options.headers,
                    },
                });

                clearTimeout(timeoutId);

                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }

                const data = await response.json();
                return data as T;

            } catch (error) {
                lastError = error as Error;

                // اگر آخرین تلاش بود، خطا را پرتاب کن
                if (attempt === this.retries - 1) {
                    throw lastError;
                }

                // منتظر بمان قبل از تلاش مجدد
                await this.sleep(this.retryDelay * (attempt + 1));
            }
        }

        throw lastError || new Error('Unknown error');
    }

    /**
     * تابع کمکی برای sleep
     * 
     * @private
     */
    private sleep(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // ========================================================================
    // Public Methods - OHLCV
    // ========================================================================

    /**
     * دریافت داده OHLCV (کندل استیک)
     * 
     * این endpoint از 20+ صرافی با fallback خودکار استفاده می‌کند:
     * Binance → CoinGecko → CoinCap → Kraken → Bitfinex → ...
     * 
     * @param symbol - نماد ارز (مثلاً BTC, ETH, BTCUSDT)
     * @param timeframe - بازه زمانی (1m, 5m, 15m, 30m, 1h, 4h, 1d, 1w)
     * @param limit - تعداد کندل (1-1000، پیش‌فرض: 100)
     * @returns پاسخ حاوی آرایه کندل‌ها
     * 
     * @example
     * ```typescript
     * const ohlcv = await client.getOHLCV('BTC', '1h', 100);
     * console.log(`دریافت ${ohlcv.count} کندل از ${ohlcv.source}`);
     * ohlcv.data.forEach(candle => {
     *   console.log(`زمان: ${candle.time}, بسته: ${candle.close}`);
     * });
     * ```
     */
    async getOHLCV(
        symbol: string,
        timeframe: string = '1h',
        limit: number = 100
    ): Promise<OHLCVResponse> {
        const params = new URLSearchParams({
            symbol,
            timeframe,
            limit: limit.toString(),
        });

        return this.request<OHLCVResponse>(`/api/ohlcv?${params}`);
    }

    /**
     * دریافت OHLCV با path parameter (روش جایگزین)
     * 
     * @param symbol - نماد ارز
     * @param interval - بازه زمانی
     * @param limit - تعداد کندل
     * @returns پاسخ حاوی آرایه کندل‌ها
     * 
     * @example
     * ```typescript
     * const ohlcv = await client.getOHLCVByPath('ETH', '4h', 50);
     * ```
     */
    async getOHLCVByPath(
        symbol: string,
        interval: string = '1h',
        limit: number = 100
    ): Promise<OHLCVResponse> {
        const params = new URLSearchParams({
            interval,
            limit: limit.toString(),
        });

        return this.request<OHLCVResponse>(`/api/ohlcv/${symbol}?${params}`);
    }

    /**
     * دریافت OHLCV از endpoint market (alias)
     * 
     * @param symbol - نماد ارز
     * @param interval - بازه زمانی
     * @param limit - تعداد کندل
     * @returns پاسخ حاوی آرایه کندل‌ها
     */
    async getMarketOHLC(
        symbol: string,
        interval: string = '1h',
        limit: number = 100
    ): Promise<OHLCVResponse> {
        const params = new URLSearchParams({
            symbol,
            interval,
            limit: limit.toString(),
        });

        return this.request<OHLCVResponse>(`/api/market/ohlc?${params}`);
    }

    // ========================================================================
    // Public Methods - Market Data
    // ========================================================================

    /**
     * دریافت لیست ارزهای برتر
     * 
     * این endpoint از 15+ منبع با fallback استفاده می‌کند
     * 
     * @param limit - تعداد ارز (پیش‌فرض: 50)
     * @returns پاسخ حاوی لیست ارزها
     * 
     * @example
     * ```typescript
     * const coins = await client.getTopCoins(10);
     * coins.data.forEach(coin => {
     *   console.log(`${coin.name}: $${coin.current_price}`);
     * });
     * ```
     */
    async getTopCoins(limit: number = 50): Promise<CoinsResponse> {
        const params = new URLSearchParams({
            limit: limit.toString(),
        });

        return this.request<CoinsResponse>(`/api/coins/top?${params}`);
    }

    /**
     * دریافت نرخ معامله برای یک جفت ارز
     * 
     * @param pair - جفت ارز (مثلاً BTC/USDT, ETH/USDT)
     * @returns اطلاعات نرخ معامله
     * 
     * @example
     * ```typescript
     * const rate = await client.getServiceRate('BTC/USDT');
     * console.log(`قیمت: $${rate.price}`);
     * console.log(`تغییر 24 ساعته: ${rate.change_24h}%`);
     * ```
     */
    async getServiceRate(pair: string): Promise<ServiceRateResponse> {
        const params = new URLSearchParams({ pair });
        return this.request<ServiceRateResponse>(`/api/service/rate?${params}`);
    }

    // ========================================================================
    // Public Methods - News
    // ========================================================================

    /**
     * دریافت آخرین اخبار
     * 
     * این endpoint از 15+ منبع خبری با fallback استفاده می‌کند
     * 
     * @param limit - تعداد خبر (پیش‌فرض: 6)
     * @returns پاسخ حاوی لیست اخبار
     * 
     * @example
     * ```typescript
     * const news = await client.getNews(20);
     * news.news.forEach(article => {
     *   console.log(`📰 ${article.title}`);
     *   console.log(`   منبع: ${article.source}`);
     * });
     * ```
     */
    async getNews(limit: number = 20): Promise<NewsResponse> {
        const params = new URLSearchParams({
            limit: limit.toString(),
        });

        return this.request<NewsResponse>(`/api/news/latest?${params}`);
    }

    // ========================================================================
    // Public Methods - Sentiment Analysis
    // ========================================================================

    /**
     * تحلیل احساسات یک متن
     * 
     * @param text - متن برای تحلیل
     * @param symbol - نماد ارز (اختیاری)
     * @returns نتیجه تحلیل احساسات
     * 
     * @example
     * ```typescript
     * const sentiment = await client.analyzeSentiment(
     *   'Bitcoin is showing strong bullish momentum!',
     *   'BTC'
     * );
     * console.log(`احساسات: ${sentiment.label}`);
     * console.log(`امتیاز: ${(sentiment.score * 100).toFixed(1)}%`);
     * ```
     */
    async analyzeSentiment(
        text: string,
        symbol?: string
    ): Promise<SentimentResponse> {
        const payload: SentimentRequest = { text };
        if (symbol) {
            payload.symbol = symbol;
        }

        return this.request<SentimentResponse>('/api/sentiment/analyze', {
            method: 'POST',
            body: JSON.stringify(payload),
        });
    }

    // ========================================================================
    // Public Methods - AI Decision
    // ========================================================================

    /**
     * دریافت تصمیم AI برای معامله
     * 
     * @param symbol - نماد ارز (مثلاً BTC)
     * @param timeframe - بازه زمانی (پیش‌فرض: 1h)
     * @param text - متن اضافی برای تحلیل (اختیاری)
     * @returns تصمیم AI
     * 
     * @example
     * ```typescript
     * const decision = await client.getAIDecision('BTC', '1h');
     * console.log(`🤖 تصمیم: ${decision.decision}`);
     * console.log(`📊 اطمینان: ${decision.confidence}%`);
     * console.log(`💡 دلیل: ${decision.reason}`);
     * ```
     */
    async getAIDecision(
        symbol: string,
        timeframe: string = '1h',
        text?: string
    ): Promise<AIDecisionResponse> {
        const payload: AIDecisionRequest = { symbol, timeframe };
        if (text) {
            payload.text = text;
        }

        return this.request<AIDecisionResponse>('/api/ai/decision', {
            method: 'POST',
            body: JSON.stringify(payload),
        });
    }

    // ========================================================================
    // Public Methods - Models
    // ========================================================================

    /**
     * دریافت خلاصه مدل‌های AI موجود
     * 
     * @returns اطلاعات مدل‌های AI
     * 
     * @example
     * ```typescript
     * const models = await client.getModelsSummary();
     * console.log(`تعداد کل مدل‌ها: ${models.total}`);
     * console.log(`مدل‌های فعال: ${models.available}`);
     * 
     * Object.entries(models.categories).forEach(([category, modelList]) => {
     *   console.log(`\n${category}:`);
     *   modelList.forEach(model => {
     *     console.log(`  - ${model.name}: ${model.status}`);
     *   });
     * });
     * ```
     */
    async getModelsSummary(): Promise<ModelsResponse> {
        return this.request<ModelsResponse>('/api/models/summary');
    }

    // ========================================================================
    // Public Methods - System
    // ========================================================================

    /**
     * بررسی سلامت سیستم
     * 
     * @returns وضعیت سلامت
     * 
     * @example
     * ```typescript
     * const health = await client.checkHealth();
     * console.log(`وضعیت: ${health.status}`);
     * ```
     */
    async checkHealth(): Promise<{ status: string; service: string }> {
        return this.request('/api/health');
    }

    /**
     * دریافت وضعیت سیستم
     * 
     * @returns اطلاعات وضعیت سیستم
     */
    async getStatus(): Promise<any> {
        return this.request('/api/status');
    }
}

// ============================================================================
// Export Default Instance
// ============================================================================

/**
 * نمونه پیش‌فرض کلاینت برای استفاده سریع
 * 
 * @example
 * ```typescript
 * import { defaultClient } from './CryptoAPIClient';
 * 
 * const ohlcv = await defaultClient.getOHLCV('BTC', '1h', 100);
 * ```
 */
export const defaultClient = new CryptoAPIClient({
    baseURL: 'https://huggingface.co/spaces/Really-amin/Datasourceforcryptocurrency-2',
    timeout: 15000,
    retries: 3,
    retryDelay: 1000,
});

export default CryptoAPIClient;

