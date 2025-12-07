/**
 * Historical Data Service - HuggingFace Integration
 * 
 * This service uses ONLY HuggingFace Crypto API for historical data.
 * All external API calls (CoinGecko, CryptoCompare, Binance) have been removed.
 */

import { Logger } from '../core/Logger.js';
import { cryptoAPI } from './CryptoAPI';

export interface HistoricalDataPoint {
  timestamp: number;
  open?: number;
  high?: number;
  low?: number;
  close: number;
  price?: number;
  volume?: number;
  symbol: string;
}

export class HistoricalDataService {
  private static instance: HistoricalDataService;
  private logger = Logger.getInstance();
  
  // Simple in-memory cache
  private cache = new Map<string, { data: HistoricalDataPoint[]; timestamp: number }>();
  private readonly CACHE_TTL = 300000; // 5 minutes

  static getInstance(): HistoricalDataService {
    if (!HistoricalDataService.instance) {
      HistoricalDataService.instance = new HistoricalDataService();
    }
    return HistoricalDataService.instance;
  }

  constructor() {
    this.logger.info('✅ HistoricalDataService initialized with HuggingFace API');
  }

  /**
   * Get historical OHLCV data from HuggingFace
   */
  async getHistoricalData(
    symbol: string,
    interval: string = '1h',
    limit: number = 200
  ): Promise<HistoricalDataPoint[]> {
    const cacheKey = `${symbol}_${interval}_${limit}`;
    
    // Check cache
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return cached.data;
    }

    try {
      this.logger.info(`Fetching historical data for ${symbol} (${interval}, ${limit})`);
      
      const response = await cryptoAPI.getOHLCV(symbol, interval, limit);
      
      if (!response.success || !response.data) {
        this.logger.warn(`No historical data returned for ${symbol}`);
        return [];
      }

      // Convert to HistoricalDataPoint format
      const data: HistoricalDataPoint[] = response.data.map((candle: any) => ({
        timestamp: candle.t,
        open: candle.o,
        high: candle.h,
        low: candle.l,
        close: candle.c,
        price: candle.c, // For backward compatibility
        volume: candle.v,
        symbol
      }));

      // Cache the result
      this.cache.set(cacheKey, { data, timestamp: Date.now() });
      
      this.logger.info(`✅ Fetched ${data.length} data points for ${symbol}`);
      return data;
    } catch (error) {
      this.logger.error(`Failed to fetch historical data for ${symbol}:`, {}, error);
      return [];
    }
  }

  /**
   * Get price history with specific interval (in minutes)
   */
  async getPriceHistory(
    symbol: string,
    intervalMinutes: number = 60,
    limit: number = 200
  ): Promise<HistoricalDataPoint[]> {
    // Convert interval minutes to timeframe string
    let timeframe = '1h';
    if (intervalMinutes <= 1) timeframe = '1m';
    else if (intervalMinutes <= 5) timeframe = '5m';
    else if (intervalMinutes <= 15) timeframe = '15m';
    else if (intervalMinutes <= 60) timeframe = '1h';
    else if (intervalMinutes <= 240) timeframe = '4h';
    else if (intervalMinutes <= 1440) timeframe = '1d';
    else timeframe = '1w';

    try {
      const response = await cryptoAPI.getPriceHistory(symbol, intervalMinutes);
      
      if (!response.success || !response.data) {
        return [];
      }

      return response.data.map((point: any) => ({
        timestamp: point.timestamp,
        price: point.price,
        close: point.price,
        symbol
      }));
    } catch (error) {
      this.logger.error(`Failed to fetch price history for ${symbol}:`, {}, error);
      
      // Fallback to OHLCV
      return this.getHistoricalData(symbol, timeframe, limit);
    }
  }

  /**
   * Get historical data for multiple symbols
   */
  async getMultipleHistoricalData(
    symbols: string[],
    interval: string = '1h',
    limit: number = 200
  ): Promise<Map<string, HistoricalDataPoint[]>> {
    const results = new Map<string, HistoricalDataPoint[]>();

    await Promise.all(
      symbols.map(async symbol => {
        const data = await this.getHistoricalData(symbol, interval, limit);
        results.set(symbol, data);
      })
    );

    return results;
  }

  /**
   * Clear cache for a specific symbol or all symbols
   */
  clearCache(symbol?: string): void {
    if (symbol) {
      // Clear all cache entries for this symbol
      const keysToDelete: string[] = [];
      this.cache.forEach((_, key) => {
        if (key.startsWith(symbol + '_')) {
          keysToDelete.push(key);
        }
      });
      keysToDelete.forEach(key => this.cache.delete(key));
      this.logger.info(`Cleared cache for ${symbol}`);
    } else {
      // Clear all cache
      this.cache.clear();
      this.logger.info('Cleared all historical data cache');
    }
  }
}
