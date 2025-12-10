// src/services/DatasourceClient.ts
// UNIVERSAL DATA SOURCE CLIENT - THE SINGLE SOURCE OF TRUTH
// All data flows through HuggingFace Unified API
import { DataRetriever } from './DataRetriever';
import { hfAPI } from './HuggingFaceUnifiedAPI';

interface MarketPrice {
    symbol: string;
    price: number;
    change24h: number;
    changePercent24h: number;
    volume: number;
    marketCap?: number;
    timestamp: number;
}

interface PriceChart {
    timestamp: number;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
}

interface MarketStats {
    totalMarketCap: number;
    totalVolume24h: number;
    btcDominance: number;
    activeCoins: number;
    timestamp: number;
}

interface NewsItem {
    id: string;
    title: string;
    description: string;
    url: string;
    source: string;
    publishedAt: string;
    sentiment?: string;
}

interface MarketSentiment {
    fearGreedIndex: number;
    classification: string;
    timestamp: number;
    indicators: {
        volatility: number;
        marketMomentum: number;
        socialSentiment: number;
        surveys: number;
        dominance: number;
        trends: number;
    };
}

interface AIPrediction {
    symbol: string;
    action: 'BUY' | 'SELL' | 'HOLD';
    confidence: number;
    price: number;
    timeframe: string;
    indicators: Record<string, number>;
    timestamp: number;
}

interface PortfolioPosition {
    symbol: string;
    quantity: number;
    averagePrice: number;
    currentPrice: number;
    pnl: number;
    pnlPercent: number;
    allocation: number;
}

interface PortfolioData {
    positions: PortfolioPosition[];
    totalValue: number;
    totalPnL: number;
    totalPnLPercent: number;
}

interface ScoringSnapshot {
    timestamp: string;
    symbol: string;
    judicialProceedings: {
        supremeVerdict: {
            direction: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
            quantumScore: number;
            action: string;
            conviction: number;
        };
        timeframeCourts: Array<{
            tf: string;
            direction: string;
            final_score: number;
        }>;
    };
    detectorPerformance: Array<{
        detector: string;
        currentScore: number;
        historicalAccuracy: number;
        confidenceLevel: number;
    }>;
}

interface ScoringWeights {
    detector_weights: {
        technical_analysis: Record<string, number>;
        fundamental_analysis: Record<string, number>;
    };
    timeframe_weights: Record<string, number>;
}

interface TrainingJobResponse {
    job_id: string;
    status: string;
    message: string;
}

interface TrainingStatusResponse {
    job_id: string;
    status: 'pending' | 'running' | 'completed' | 'failed';
    progress: number;
    metrics?: {
        epoch: number;
        loss: number;
        accuracy: number;
    };
}

export class DatasourceClient {
    private static instance: DatasourceClient;
    private baseUrl: string;
    private timeoutMs: number = 35000; // Increased to 35s to account for server + HF Space latency
    private maxRetries: number = 1;
    private dataRetriever: DataRetriever | null = null;
    private enableFallback: boolean = true;

    private constructor() {
        // Use Hugging Face Space as primary data source
        let apiBase = 'https://really-amin-datasourceforcryptocurrency-2.hf.space';

        try {
            // Try Vite environment first (browser/frontend)
            if (typeof import.meta !== 'undefined' && import.meta.env?.VITE_HF_API_URL) {
                apiBase = import.meta.env.VITE_HF_API_URL;
            } else if (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_BASE) {
                apiBase = import.meta.env.VITE_API_BASE;
            }
        } catch (e) {
            // Not in Vite environment, try Node.js
            try {
                if (typeof process !== 'undefined' && process.env?.VITE_HF_API_URL) {
                    apiBase = process.env.VITE_HF_API_URL;
                } else if (typeof process !== 'undefined' && process.env?.VITE_API_BASE) {
                    apiBase = process.env.VITE_API_BASE;
                }
            } catch (e2) {
                // Neither environment available, use HF default
                console.warn('DatasourceClient: Could not access environment variables, using HF default:', apiBase);
            }
        }

        this.baseUrl = apiBase;
        // Allow configuring timeout and retry behavior via env
        try {
            // Vite env (frontend)
            if (typeof import.meta !== 'undefined' && import.meta.env?.VITE_DATASOURCE_TIMEOUT) {
                const t = Number(import.meta.env.VITE_DATASOURCE_TIMEOUT);
                if (!Number.isNaN(t) && t > 0) this.timeoutMs = t;
            }
            if (typeof import.meta !== 'undefined' && import.meta.env?.VITE_DATASOURCE_RETRIES) {
                const r = Number(import.meta.env.VITE_DATASOURCE_RETRIES);
                if (!Number.isNaN(r) && r >= 0) this.maxRetries = r;
            }
        } catch (e) {
            try {
                // Node env (scripts)
                if (typeof process !== 'undefined' && process.env?.DATASOURCE_TIMEOUT) {
                    const t = Number(process.env.DATASOURCE_TIMEOUT);
                    if (!Number.isNaN(t) && t > 0) this.timeoutMs = t;
                }
                if (typeof process !== 'undefined' && process.env?.DATASOURCE_RETRIES) {
                    const r = Number(process.env.DATASOURCE_RETRIES);
                    if (!Number.isNaN(r) && r >= 0) this.maxRetries = r;
                }
            } catch (e2) {
                // ignore and keep defaults
            }
        }
        console.info(`DatasourceClient initialized with baseUrl: ${this.baseUrl}`);

        // Initialize DataRetriever for HTTP-first with WebSocket fallback
        try {
            this.dataRetriever = new DataRetriever({
                requestTimeout: this.timeoutMs,
                connectionTimeout: 10000,
            });
            console.info('DataRetriever fallback initialized');
        } catch (error) {
            console.warn('Failed to initialize DataRetriever fallback:', error);
            this.dataRetriever = null;
        }

        // Check if fallback is enabled via environment variable
        try {
            if (typeof import.meta !== 'undefined' && import.meta.env?.VITE_DISABLE_FALLBACK === 'true') {
                this.enableFallback = false;
            } else if (typeof process !== 'undefined' && process.env?.DISABLE_FALLBACK === 'true') {
                this.enableFallback = false;
            }
        } catch (e) {
            // Keep fallback enabled by default
        }
    }

    public static getInstance(): DatasourceClient {
        if (!DatasourceClient.instance) {
            DatasourceClient.instance = new DatasourceClient();
        }
        return DatasourceClient.instance;
    }

    // Helper method for fetch requests with error handling
    private async fetchJSON<T>(url: string, options?: RequestInit): Promise<T> {
        // Retry loop for transient errors (timeouts/network)
        const sleep = (ms: number) => new Promise(res => setTimeout(res, ms));
        let attempt = 0;
        const maxAttempts = Math.max(1, this.maxRetries + 1);
        let lastError: any = null;

        while (attempt < maxAttempts) {
            attempt++;
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), this.timeoutMs);

            try {
                const response = await fetch(url, {
                    ...options,
                    signal: controller.signal,
                    headers: {
                        'Content-Type': 'application/json',
                        ...options?.headers
                    }
                });

                clearTimeout(timeoutId);

                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}`);
                }

                const data = await response.json();

                if (data === null || data === undefined) {
                    throw new Error('Empty response');
                }

                return data;
            } catch (error: any) {
                clearTimeout(timeoutId);
                lastError = error;

                const isAbort = error && (error.name === 'AbortError' || error.message === 'The operation was aborted');
                const isNetwork = error && error.message && error.message.toLowerCase().includes('network');

                // If we can retry on abort or network error, do exponential backoff
                if ((isAbort || isNetwork) && attempt < maxAttempts) {
                    const backoff = 200 * Math.pow(2, attempt - 1);
                    await sleep(backoff);
                    continue;
                }

                // Don't throw yet, let it exit the loop to try fallback
                break;
            }
        }

        // All retries failed, try DataRetriever fallback if enabled
        if (this.enableFallback && this.dataRetriever) {
            try {
                console.warn('[DatasourceClient] Primary HTTP failed, trying DataRetriever fallback');

                // Extract endpoint from full URL (remove baseUrl)
                const endpoint = url.replace(this.baseUrl, '');
                const method = (options?.method as 'GET' | 'POST' | 'PUT' | 'DELETE') || 'GET';

                // Parse body if present
                let payload = null;
                if (options?.body && typeof options.body === 'string') {
                    try {
                        payload = JSON.parse(options.body);
                    } catch (e) {
                        payload = options.body;
                    }
                }

                const fallbackData = await this.dataRetriever.getDataWithFallback<T>(
                    endpoint,
                    method,
                    payload
                );

                console.info('[DatasourceClient] DataRetriever fallback succeeded');
                return fallbackData;
            } catch (fallbackError: any) {
                console.error('[DatasourceClient] DataRetriever fallback also failed:', fallbackError);
                // Continue to throw original error
            }
        }

        // If we reach here, everything failed
        throw lastError || new Error('DATASOURCE_FETCH_FAILED');
    }

    // Get top coins with real-time prices
    async getTopCoins(limit = 10, symbols?: string[]): Promise<MarketPrice[]> {
        try {
            // Use HuggingFace Unified API
            const response = await hfAPI.getTopCoins(limit);
            
            if (!response.success || !response.data) {
                // Fallback to direct fetch
                let url = `${this.baseUrl}/api/market/top?limit=${limit}`;
                if (symbols && symbols.length > 0) {
                    url += `&symbol=${symbols.join(',')}`;
                }

                const fallbackResponse = await this.fetchJSON<{ success: boolean; items: any[] } | any[]>(url);
                
                let items: any[];
                if (Array.isArray(fallbackResponse)) {
                    items = fallbackResponse;
                } else if (fallbackResponse && typeof fallbackResponse === 'object' && Array.isArray((fallbackResponse as any).items)) {
                    items = (fallbackResponse as any).items;
                } else {
                    return [];
                }

                return items.map((item: any) => ({
                    symbol: item.symbol || '',
                    price: item.price || 0,
                    change24h: item.change_24h || item.change24h || 0,
                    changePercent24h: item.change_24h || item.changePercent24h || 0,
                    volume: item.volume_24h || item.volume || 0,
                    marketCap: item.market_cap || item.marketCap || 0,
                    timestamp: Date.now()
                }));
            }

            // Map HuggingFace API response to MarketPrice format
            let items = response.data;
            
            // Filter by symbols if provided
            if (symbols && symbols.length > 0) {
                const normalizedSymbols = symbols.map(s => s.toUpperCase());
                items = items.filter(item => 
                    normalizedSymbols.includes(item.symbol?.toUpperCase() || '')
                );
            }

            return items.map((item: any) => ({
                symbol: item.symbol || '',
                price: item.price || 0,
                change24h: item.change_24h || 0,
                changePercent24h: item.change_24h || 0,
                volume: item.volume_24h || 0,
                marketCap: item.market_cap || 0,
                timestamp: Date.now()
            }));
        } catch (error: any) {
            return []; // Always return empty array, never undefined
        }
    }

    // Get price chart data (OHLCV)
    async getPriceChart(symbol: string, timeframe = '1h', limit = 100): Promise<PriceChart[]> {
        try {
            // Validate input
            if (!symbol || typeof symbol !== 'string') {
                return [];
            }

            // Use HuggingFace Unified API
            const response = await hfAPI.getOHLCV(symbol, timeframe, limit);
            
            if (response.success && response.data && Array.isArray(response.data)) {
                return response.data.map((item: any) => ({
                    timestamp: item.timestamp || 0,
                    open: item.open || 0,
                    high: item.high || 0,
                    low: item.low || 0,
                    close: item.close || 0,
                    volume: item.volume || 0
                }));
            }

            // Fallback to direct fetch
            const url = `${this.baseUrl}/api/ohlcv/${symbol.toLowerCase()}?timeframe=${timeframe}&limit=${limit}`;
            const fallbackData = await this.fetchJSON<{ data: any[] } | any[]>(url);

            let items: any[];
            if (Array.isArray(fallbackData)) {
                items = fallbackData;
            } else if (fallbackData && typeof fallbackData === 'object' && Array.isArray((fallbackData as any).data)) {
                items = (fallbackData as any).data;
            } else {
                return [];
            }

            return items.map((item: any) => ({
                timestamp: item.t || item.timestamp || item[0] || 0,
                open: item.o || item.open || item[1] || 0,
                high: item.h || item.high || item[2] || 0,
                low: item.l || item.low || item[3] || 0,
                close: item.c || item.close || item[4] || 0,
                volume: item.v || item.volume || item[5] || 0
            }));
        } catch (error: any) {
            return []; // Always return empty array, never undefined
        }
    }

    // Get market statistics
    async getMarketStats(): Promise<MarketStats | null> {
        try {
            const url = `${this.baseUrl}/api/stats`;
            const data = await this.fetchJSON<MarketStats>(url);

            // Validate data structure
            if (!data || typeof data !== 'object') {
                return null;
            }

            return data;
        } catch (error: any) {
            return null; // Return null on error
        }
    }

    // Get latest news
    async getLatestNews(limit = 20): Promise<NewsItem[]> {
        try {
            // Use HuggingFace Unified API
            const response = await hfAPI.getLatestNews(limit);
            
            if (response.success && response.data) {
                return response.data.map((item: any) => ({
                    id: item.id || `news-${Date.now()}-${Math.random()}`,
                    title: item.title || '',
                    description: item.description || item.content || '',
                    url: item.url || '#',
                    source: item.source || item.source_name || 'Unknown',
                    publishedAt: item.published_at || new Date().toISOString(),
                    sentiment: item.sentiment || 'neutral'
                }));
            }

            // Fallback to direct fetch
            const url = `${this.baseUrl}/api/news/latest?limit=${limit}`;
            const fallbackResponse = await this.fetchJSON<{ success: boolean; news: NewsItem[] }>(url);

            if (!fallbackResponse || typeof fallbackResponse !== 'object') {
                return [];
            }

            if (!Array.isArray((fallbackResponse as any).news)) {
                return [];
            }

            return (fallbackResponse as any).news;
        } catch (error: any) {
            return []; // Always return empty array, never undefined
        }
    }

    // Get market sentiment
    async getMarketSentiment(): Promise<MarketSentiment | null> {
        try {
            // Use HuggingFace Unified API
            const response = await hfAPI.getGlobalSentiment();
            
            if (response.success && response.data) {
                const data = response.data;
                return {
                    fearGreedIndex: data.fear_greed_index || data.value || 50,
                    classification: data.value_classification || data.market_sentiment || 'neutral',
                    timestamp: Date.now(),
                    indicators: {
                        volatility: 0,
                        marketMomentum: 0,
                        socialSentiment: 0,
                        surveys: 0,
                        dominance: 0,
                        trends: 0
                    }
                };
            }

            // Fallback to direct fetch
            const url = `${this.baseUrl}/api/sentiment/global`;
            const fallbackData = await this.fetchJSON<any>(url);

            if (!fallbackData || typeof fallbackData !== 'object') {
                return null;
            }

            return {
                fearGreedIndex: fallbackData.value || fallbackData.fearGreedIndex || 50,
                classification: fallbackData.value_classification || fallbackData.classification || 'neutral',
                timestamp: Date.now(),
                indicators: fallbackData.indicators || {
                    volatility: 0,
                    marketMomentum: 0,
                    socialSentiment: 0,
                    surveys: 0,
                    dominance: 0,
                    trends: 0
                }
            };
        } catch (error: any) {
            return null; // Return null on error
        }
    }

    // Get AI prediction
    async getAIPrediction(symbol: string, timeframe = '1h'): Promise<AIPrediction | null> {
        try {
            // Use HuggingFace Unified API
            const response = await hfAPI.getAIDecision(symbol, timeframe);
            
            if (response.success && response.data) {
                const data = response.data;
                return {
                    symbol: data.symbol || symbol,
                    action: data.decision || 'HOLD',
                    confidence: data.confidence || 0.5,
                    price: 0,
                    timeframe: timeframe,
                    indicators: {
                        technical: data.analysis?.technical_score || 0,
                        sentiment: data.analysis?.sentiment_score || 0,
                        risk: data.analysis?.risk_score || 0
                    },
                    timestamp: Date.now()
                };
            }

            // Fallback to direct fetch
            const url = `${this.baseUrl}/api/ai/decision`;
            const fallbackResponse = await this.fetchJSON<AIPrediction>(url, {
                method: 'POST',
                body: JSON.stringify({ symbol, timeframe })
            });
            return fallbackResponse;
        } catch (error) {
            return null;
        }
    }

    // Convenience methods for specific use cases
    async getBitcoinPrice(): Promise<number> {
        const coins = await this.getTopCoins(1, ['BTC']);
        return coins.length > 0 ? coins[0].price : 0;
    }

    async getTopGainers(limit = 5): Promise<MarketPrice[]> {
        const coins = await this.getTopCoins(50);
        return coins
            .filter(coin => coin.changePercent24h > 0)
            .sort((a, b) => b.changePercent24h - a.changePercent24h)
            .slice(0, limit);
    }

    async getTopLosers(limit = 5): Promise<MarketPrice[]> {
        const coins = await this.getTopCoins(50);
        return coins
            .filter(coin => coin.changePercent24h < 0)
            .sort((a, b) => a.changePercent24h - b.changePercent24h)
            .slice(0, limit);
    }

    // Check if the datasource is available
    async isAvailable(): Promise<boolean> {
        try {
            const stats = await this.getMarketStats();
            return stats !== null;
        } catch {
            return false;
        }
    }

    // Portfolio Management
    async getPortfolio(): Promise<PortfolioData | null> {
        try {
            const url = `${this.baseUrl}/api/trading/portfolio`;
            const response = await this.fetchJSON<{ success: boolean; portfolio: PortfolioData }>(url);
            return response.success ? response.portfolio : null;
        } catch (error) {
            console.error('getPortfolio error:', error);
            return null;
        }
    }

    // Scoring System
    async getScoringSnapshot(symbol: string): Promise<ScoringSnapshot | null> {
        try {
            const url = `${this.baseUrl}/api/scoring/snapshot?symbol=${symbol}`;
            const response = await this.fetchJSON<{ success: boolean; snapshot: ScoringSnapshot }>(url);
            return response.success ? response.snapshot : null;
        } catch (error) {
            console.error('getScoringSnapshot error:', error);
            return null;
        }
    }

    async getScoringWeights(): Promise<ScoringWeights | null> {
        try {
            const url = `${this.baseUrl}/api/scoring/weights`;
            const response = await this.fetchJSON<{ success: boolean; weights: ScoringWeights }>(url);
            return response.success ? response.weights : null;
        } catch (error) {
            console.error('getScoringWeights error:', error);
            return null;
        }
    }

    async updateScoringWeights(weights: ScoringWeights): Promise<boolean> {
        try {
            const url = `${this.baseUrl}/api/scoring/weights`;
            const response = await this.fetchJSON<{ success: boolean }>(url, {
                method: 'POST',
                body: JSON.stringify(weights)
            });
            return response.success;
        } catch (error) {
            console.error('updateScoringWeights error:', error);
            return false;
        }
    }

    async resetScoringWeights(): Promise<boolean> {
        try {
            const url = `${this.baseUrl}/api/scoring/weights/reset`;
            const response = await this.fetchJSON<{ success: boolean }>(url, {
                method: 'POST'
            });
            return response.success;
        } catch (error) {
            console.error('resetScoringWeights error:', error);
            return false;
        }
    }

    // AI Training
    async startTraining(config: {
        dataset: string;
        symbols: string[];
        timeframe: string;
        task: 'classification' | 'regression';
        model: string;
    }): Promise<TrainingJobResponse | null> {
        try {
            const url = `${this.baseUrl}/api/ai/train-epoch`;
            const response = await this.fetchJSON<TrainingJobResponse>(url, {
                method: 'POST',
                body: JSON.stringify(config)
            });
            return response;
        } catch (error) {
            console.error('startTraining error:', error);
            return null;
        }
    }

    async getTrainingStatus(jobId: string): Promise<TrainingStatusResponse | null> {
        try {
            const url = `${this.baseUrl}/api/ai/training-status?job_id=${jobId}`;
            const response = await this.fetchJSON<TrainingStatusResponse>(url);
            return response;
        } catch (error) {
            console.error('getTrainingStatus error:', error);
            return null;
        }
    }

    async getTrainingMetrics(): Promise<any[]> {
        try {
            const url = `${this.baseUrl}/api/training-metrics`;
            const response = await this.fetchJSON<{ metrics: any[] }>(url);
            return response.metrics || [];
        } catch (error) {
            console.error('getTrainingMetrics error:', error);
            return [];
        }
    }

    // Historical Market Data (for AI training and analysis)
    async getHistoricalData(symbol: string, timeframe: string, limit: number): Promise<any[]> {
        try {
            const url = `${this.baseUrl}/api/market/historical?symbol=${symbol}&timeframe=${timeframe}&limit=${limit}`;
            const response = await this.fetchJSON<any[]>(url);
            return Array.isArray(response) ? response : [];
        } catch (error) {
            console.error('getHistoricalData error:', error);
            return [];
        }
    }
}

// Export singleton instance for convenience
export default DatasourceClient.getInstance();