import { Logger } from '../core/Logger';
import { DataMode } from '../types/modes';
import { API_BASE } from '../config/env.js';
import { isStrictRealData, canUseMockData, canUseSyntheticData } from '../config/dataPolicy.js';
import { hfAPI } from './HuggingFaceUnifiedAPI';
import axios from 'axios';

export interface RealPriceData {
    symbol: string;
    price: number;
    change24h: number;
    volume24h: number;
    lastUpdate: number;
    timestamp?: number;
    volume?: number;
}

type OHLCV = {
    timestamp: number;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
};

export interface Signal {
    id: string;
    symbol: string;
    direction: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
    confidence: number;
    timeframe: string;
    strength: 'STRONG' | 'MODERATE' | 'WEAK';
    timestamp: number;
}

export interface RealSignalData {
    id: string;
    symbol: string;
    action: 'BUY' | 'SELL' | 'HOLD';
    confidence: number;
    confluence: number;
    timeframe: string;
    entry?: number;
    stopLoss?: number;
    takeProfit?: number;
    reasoning?: string[];
    timestamp: number;
}

export interface RealPortfolioData {
    totalValue: number;
    totalChangePercent: number;
    dayPnL: number;
    dayPnLPercent: number;
    activePositions: number;
    totalPositions: number;
    balances?: any[];
    positions?: any[];
    lastUpdated?: number;
}

export class RealDataManager {
    private readonly logger = Logger.getInstance();
    private static instance: RealDataManager;
    private cache: Map<string, { data: any; timestamp: number }> = new Map();
    private readonly CACHE_TTL = 120000; // افزایش از 60 به 120 ثانیه

    private constructor() {}

    static getInstance(): RealDataManager {
        if (!RealDataManager.instance) {
            RealDataManager.instance = new RealDataManager();
        }
        return RealDataManager.instance;
    }

    private getCacheKey(type: string, params: any): string {
        return `${type}:${JSON.stringify(params)}`;
    }

    private getFromCache(key: string): any | null {
        const cached = this.cache.get(key);
        if (!cached) return null;
        
        if (Date.now() - cached.timestamp > this.CACHE_TTL) {
            this.cache.delete(key);
            return null;
        }
        
        return cached.data;
    }

    private setCache(key: string, data: any): void {
        this.cache.set(key, { data, timestamp: Date.now() });
    }

    async getPrice(symbol: string): Promise<RealPriceData> {
        const cacheKey = this.getCacheKey('price', { symbol });
        const cached = this.getFromCache(cacheKey);
        if (cached) return cached;

        // Normalize symbol (remove USDT suffix for API call)
        const normalizedSymbol = symbol.replace(/USDT?$/i, '').toUpperCase();

        try {
            // Use HuggingFace Unified API - Primary Method
            const response = await hfAPI.getPrice(normalizedSymbol);
            
            if (response.success && response.data) {
                const coin = response.data;
                const priceData: RealPriceData = {
                    symbol: normalizedSymbol,
                    price: coin.price || 0,
                    change24h: coin.change_24h || 0,
                    volume24h: coin.volume_24h || 0,
                    lastUpdate: Date.now()
                };

                this.setCache(cacheKey, priceData);
                return priceData;
            }
        } catch (error) {
            this.logger.warn(`HuggingFace API failed for ${symbol}, trying fallback...`);
        }

        try {
            // Fallback: Try direct market endpoint
            const response = await axios.get(`${API_BASE}/api/market-data/${normalizedSymbol}`, {
                timeout: 20000
            });

            if (response.data && response.data.data) {
                const data = response.data.data;
                const priceData: RealPriceData = {
                    symbol: normalizedSymbol,
                    price: parseFloat(data.price || data.currentPrice || 0),
                    change24h: parseFloat(data.changePercent24h || data.change24h || 0),
                    volume24h: parseFloat(data.volume24h || data.volume || 0),
                    lastUpdate: Date.now()
                };

                this.setCache(cacheKey, priceData);
                return priceData;
            }
        } catch (error) {
            this.logger.warn(`Market data endpoint failed for ${symbol}`);
        }

        try {
            // Fallback: Use top coins and find the specific one
            const topCoinsResponse = await hfAPI.getTopCoins(100);
            
            if (topCoinsResponse.success && topCoinsResponse.data) {
                const coin = topCoinsResponse.data.find(c => 
                    c.symbol?.toUpperCase() === normalizedSymbol ||
                    c.symbol?.toUpperCase() === `${normalizedSymbol}USDT`
                );
                
                if (coin) {
                    const priceData: RealPriceData = {
                        symbol: normalizedSymbol,
                        price: coin.price || 0,
                        change24h: coin.change_24h || 0,
                        volume24h: coin.volume_24h || 0,
                        lastUpdate: Date.now()
                    };

                    this.setCache(cacheKey, priceData);
                    return priceData;
                }
            }
        } catch (fallbackError) {
            this.logger.error('All price sources failed', { symbol }, fallbackError as Error);
            
            if (isStrictRealData()) {
                throw new Error(
                    `Primary data source unavailable: Unable to fetch price data for ${symbol}. ` +
                    `All data providers failed. Check your HF Engine configuration or network connectivity.`
                );
            }
        }
        
        if (isStrictRealData()) {
            throw new Error(
                `Primary data source unavailable: Cannot fetch ${symbol} price in strict real data mode. ` +
                `Ensure HF Data Engine is running and accessible.`
            );
        }
        return null as any;
    }

    async getOHLCV(symbol: string, timeframe: string, limit: number = 100): Promise<OHLCV[]> {
        const cacheKey = this.getCacheKey('ohlcv', { symbol, timeframe, limit });
        const cached = this.getFromCache(cacheKey);
        if (cached) return cached;

        // Normalize symbol
        const normalizedSymbol = symbol.replace(/USDT?$/i, '').toLowerCase();

        try {
            // Use HuggingFace Unified API - Primary Method
            const response = await hfAPI.getOHLCV(normalizedSymbol, timeframe, limit);
            
            if (response.success && response.data && Array.isArray(response.data)) {
                const data: OHLCV[] = response.data.map((item: any) => ({
                    timestamp: item.timestamp || 0,
                    open: parseFloat(String(item.open || 0)),
                    high: parseFloat(String(item.high || 0)),
                    low: parseFloat(String(item.low || 0)),
                    close: parseFloat(String(item.close || 0)),
                    volume: parseFloat(String(item.volume || 0))
                }));

                this.setCache(cacheKey, data);
                return data;
            }
        } catch (error) {
            this.logger.warn(`HuggingFace OHLCV failed for ${symbol}, trying fallback...`);
        }

        try {
            // Fallback: Direct API call
            const response = await axios.get(`${API_BASE}/api/ohlcv/${normalizedSymbol}`, {
                params: { timeframe, limit },
                timeout: 25000
            });

            if (response.data && response.data.data && Array.isArray(response.data.data)) {
                const data: OHLCV[] = response.data.data.map((item: any) => ({
                    timestamp: item.t || item.timestamp || item[0] || 0,
                    open: parseFloat(String(item.o || item.open || item[1] || 0)),
                    high: parseFloat(String(item.h || item.high || item[2] || 0)),
                    low: parseFloat(String(item.l || item.low || item[3] || 0)),
                    close: parseFloat(String(item.c || item.close || item[4] || 0)),
                    volume: parseFloat(String(item.v || item.volume || item[5] || 0))
                }));

                this.setCache(cacheKey, data);
                return data;
            }
        } catch (fallbackError) {
            this.logger.error('All OHLCV sources failed', { symbol, timeframe }, fallbackError as Error);
            
            if (isStrictRealData()) {
                throw new Error(
                    `Primary data source unavailable: Cannot fetch OHLCV data for ${symbol} (${timeframe}). ` +
                    `All data providers failed. Check your HF Engine configuration or network connectivity.`
                );
            }
        }
        
        return [];
    }

    async getMarketData(symbols: string[]): Promise<Map<string, RealPriceData>> {
        const results = new Map<string, RealPriceData>();
        
        for (const symbol of symbols) {
            try {
                const data = await this.getPrice(symbol);
                if (data) {
                    results.set(symbol, data);
                }
            } catch (error) {
                this.logger.error(`Failed to fetch data for ${symbol}`, { symbol }, error as Error);
                // Continue with other symbols instead of failing completely
            }
        }
        
        return results;
    }

    // Alias for compatibility
    async getSignals(): Promise<any[]> {
        return this.getAISignals(10);
    }

    async getPrices(symbols: string[]): Promise<RealPriceData[]> {
        const results: RealPriceData[] = [];

        // Check cache first for all symbols
        const uncachedSymbols: string[] = [];
        for (const symbol of symbols) {
            const cacheKey = this.getCacheKey('price', { symbol });
            const cached = this.getFromCache(cacheKey);
            if (cached) {
                results.push(cached);
            } else {
                uncachedSymbols.push(symbol);
            }
        }

        // If all symbols are cached, return immediately
        if (uncachedSymbols.length === 0) {
            this.logger.info('All prices served from cache', { symbols });
            return results;
        }

        // Try batch endpoint first for uncached symbols (single request)
        try {
            const normalizedSymbols = uncachedSymbols.map(s =>
                s.includes('USDT') ? s : `${s}USDT`
            );

            const response = await axios.get(`${API_BASE}/api/market-data/batch`, {
                params: { symbols: normalizedSymbols.join(',') },
                timeout: 15000
            });

            if (response.data && response.data.data) {
                const batchData = response.data.data;
                for (const symbol of uncachedSymbols) {
                    const normalizedSymbol = symbol.includes('USDT') ? symbol : `${symbol}USDT`;
                    const data = batchData[normalizedSymbol] || batchData[symbol];
                    if (data) {
                        const priceData: RealPriceData = {
                            symbol: symbol.replace('USDT', ''),
                            price: parseFloat(data.price || data.currentPrice || 0),
                            change24h: parseFloat(data.changePercent24h || data.change24h || 0),
                            volume24h: parseFloat(data.volume24h || data.volume || 0),
                            lastUpdate: Date.now()
                        };
                        results.push(priceData);
                        const cacheKey = this.getCacheKey('price', { symbol });
                        this.setCache(cacheKey, priceData);
                    }
                }
                return results;
            }
        } catch (batchError) {
            this.logger.warn('Batch endpoint failed, falling back to sequential requests', {
                error: batchError instanceof Error ? batchError.message : 'Unknown error'
            });
        }

        // Fallback: Sequential requests with rate limiting
        // Process in small batches to avoid overwhelming the server
        const BATCH_SIZE = 2; // Process 2 symbols at a time
        const BATCH_DELAY = 150; // 150ms between batches

        for (let i = 0; i < uncachedSymbols.length; i += BATCH_SIZE) {
            const batch = uncachedSymbols.slice(i, i + BATCH_SIZE);

            // Process batch concurrently
            const batchPromises = batch.map(async (symbol) => {
                try {
                    const data = await this.getPrice(symbol);
                    if (data) {
                        return data;
                    }
                } catch (error) {
                    this.logger.error(`Failed to fetch price for ${symbol}`, { symbol }, error as Error);
                }
                return null;
            });

            const batchResults = await Promise.all(batchPromises);
            results.push(...batchResults.filter((r): r is RealPriceData => r !== null));

            // Add delay between batches to prevent request storm
            if (i + BATCH_SIZE < uncachedSymbols.length) {
                await new Promise(resolve => setTimeout(resolve, BATCH_DELAY));
            }
        }

        return results;
    }

    async getPortfolio(): Promise<RealPortfolioData> {
        try {
            const response = await axios.get(`${API_BASE}/api/portfolio`, {
                timeout: 10000
            });
            return {
                totalValue: response.data.totalValue || 0,
                totalChangePercent: response.data.totalChangePercent || 0,
                dayPnL: response.data.dayPnL || 0,
                dayPnLPercent: response.data.dayPnLPercent || 0,
                activePositions: response.data.activePositions || 0,
                totalPositions: response.data.totalPositions || 0,
                balances: response.data.balances || [],
                positions: response.data.positions || [],
                lastUpdated: Date.now()
            };
        } catch (error) {
            this.logger.error('Failed to fetch portfolio', error);
            // Return default portfolio structure
            return {
                totalValue: 0,
                totalChangePercent: 0,
                dayPnL: 0,
                dayPnLPercent: 0,
                activePositions: 0,
                totalPositions: 0,
                balances: [],
                positions: [],
                lastUpdated: Date.now()
            };
        }
    }

    async getPositions(): Promise<any[]> {
        try {
            const response = await axios.get(`${API_BASE}/api/positions`, {
                timeout: 10000
            });
            return response.data.positions || response.data || [];
        } catch (error) {
            this.logger.error('Failed to fetch positions', error);
            return [];
        }
    }

    async getAISignals(limit: number = 10): Promise<Signal[]> {
        try {
            // Use HuggingFace Unified API - Primary Method
            const response = await hfAPI.getAISignals();
            
            if (response.success && response.data) {
                const signals = response.data.slice(0, limit);
                return signals.map((s: any) => ({
                    id: s.id || `${s.symbol}-${Date.now()}`,
                    symbol: s.symbol || 'BTCUSDT',
                    direction: s.type === 'buy' ? 'BULLISH' : s.type === 'sell' ? 'BEARISH' : 'NEUTRAL',
                    confidence: s.confidence || s.score || 0.5,
                    timeframe: s.timeframe || '1h',
                    strength: (s.confidence || s.score || 0.5) >= 0.85 ? 'STRONG' : 
                              (s.confidence || s.score || 0.5) >= 0.70 ? 'MODERATE' : 'WEAK',
                    timestamp: s.timestamp ? new Date(s.timestamp).getTime() : Date.now()
                }));
            }
        } catch (error) {
            this.logger.warn('HuggingFace AI signals failed, trying fallback...');
        }

        try {
            // Fallback: Direct API call
            const response = await axios.get(`${API_BASE}/api/ai/signals`, {
                params: { limit },
                timeout: 10000
            });
            
            const signals = response.data.signals || response.data || [];
            
            return signals.map((s: any) => ({
                id: s.id || `${s.symbol}-${Date.now()}`,
                symbol: s.symbol || 'BTCUSDT',
                direction: s.direction || (s.action === 'BUY' ? 'BULLISH' : s.action === 'SELL' ? 'BEARISH' : 'NEUTRAL'),
                confidence: s.confidence || 0.5,
                timeframe: s.timeframe || '1h',
                strength: s.strength || (s.confidence >= 0.85 ? 'STRONG' : s.confidence >= 0.70 ? 'MODERATE' : 'WEAK'),
                timestamp: s.timestamp || Date.now()
            }));
        } catch (error) {
            this.logger.error('Failed to fetch AI signals', error);
            return [];
        }
    }

    private mapTimeframe(tf: string): string {
        const map: Record<string, string> = {
            '1m': '1m',
            '5m': '5m',
            '15m': '15m',
            '30m': '30m',
            '1h': '1h',
            '4h': '4h',
            '1d': '1d',
            '1w': '1w'
        };
        return map[tf] || '1h';
    }

    private mapTimeframeToKraken(tf: string): number {
        const map: Record<string, number> = {
            '1m': 1,
            '5m': 5,
            '15m': 15,
            '30m': 30,
            '1h': 60,
            '4h': 240,
            '1d': 1440,
            '1w': 10080
        };
        return map[tf] || 60;
    }

    private symbolToCoinGeckoId(symbol: string): string {
        const map: Record<string, string> = {
            'BTCUSDT': 'bitcoin',
            'ETHUSDT': 'ethereum',
            'BNBUSDT': 'binancecoin',
            'ADAUSDT': 'cardano',
            'DOGEUSDT': 'dogecoin',
            'XRPUSDT': 'ripple',
            'DOTUSDT': 'polkadot',
            'SOLUSDT': 'solana',
            'MATICUSDT': 'matic-network',
            'LINKUSDT': 'chainlink'
        };
        return map[symbol.toUpperCase()] || 'bitcoin';
    }

    private symbolToKrakenPair(symbol: string): string {
        const map: Record<string, string> = {
            'BTCUSDT': 'XBTUSD',
            'ETHUSDT': 'ETHUSD',
            'ADAUSDT': 'ADAUSD',
            'DOGEUSDT': 'DOGEUSD',
            'XRPUSDT': 'XRPUSD',
            'DOTUSDT': 'DOTUSD',
            'SOLUSDT': 'SOLUSD',
            'LINKUSDT': 'LINKUSD'
        };
        return map[symbol.toUpperCase()] || 'XBTUSD';
    }

    // Alias methods for connector compatibility
    async fetchRealChartData(symbol: string, timeframe: string, limit: number = 100): Promise<any[]> {
        return this.getOHLCV(symbol, timeframe, limit);
    }

    async fetchRealPrices(symbols: string[]): Promise<RealPriceData[]> {
        return this.getPrices(symbols);
    }

    async fetchRealSignals(limit: number = 20): Promise<RealSignalData[]> {
        const signals = await this.getAISignals(limit);
        return signals.map(s => ({
            id: s.id,
            symbol: s.symbol,
            action: s.direction === 'BULLISH' ? 'BUY' : s.direction === 'BEARISH' ? 'SELL' : 'HOLD',
            confidence: s.confidence,
            confluence: Math.round(s.confidence * 10),
            timeframe: s.timeframe,
            timestamp: s.timestamp,
            reasoning: []
        }));
    }

    async fetchRealPortfolio(): Promise<RealPortfolioData> {
        return this.getPortfolio();
    }

    async fetchRealBlockchainBalances(blockchain?: string): Promise<any> {
        try {
            const url = blockchain
                ? `${API_BASE}/api/blockchain/balances/${blockchain}`
                : `${API_BASE}/api/blockchain/balances`;
            const response = await axios.get(url, {
                timeout: 10000
            });
            return response.data;
        } catch (error) {
            this.logger.error('Failed to fetch blockchain balances', error);
            return {};
        }
    }

    // Subscription methods (simple polling-based implementation)
    subscribeToPrice(symbol: string, callback: (price: RealPriceData) => void): () => void {
        const interval = setInterval(async () => {
            try {
                const price = await this.getPrice(symbol);
                if (price) {
                    callback(price);
                }
            } catch (error) {
                this.logger.error(`Subscription error for ${symbol}`, { symbol }, error as Error);
            }
        }, 5000);

        return () => clearInterval(interval);
    }

    subscribeToSignals(callback: (signal: RealSignalData) => void): () => void {
        const interval = setInterval(async () => {
            try {
                const signals = await this.fetchRealSignals(1);
                if (signals.length > 0) {
                    callback(signals[0]);
                }
            } catch (error) {
                this.logger.error('Subscription error for signals', error);
            }
        }, 15000);

        return () => clearInterval(interval);
    }

    subscribeToPortfolio(callback: (portfolio: RealPortfolioData) => void): () => void {
        const interval = setInterval(async () => {
            try {
                const portfolio = await this.getPortfolio();
                callback(portfolio);
            } catch (error) {
                this.logger.error('Subscription error for portfolio', error);
            }
        }, 10000);

        return () => clearInterval(interval);
    }
}

export const realDataManager = RealDataManager.getInstance();
