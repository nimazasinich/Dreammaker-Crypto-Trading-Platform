/**
 * Market Data Service - HuggingFace Integration
 * 
 * This service uses ONLY HuggingFace Crypto API as the data source.
 * All external API calls (Binance, CoinGecko, etc.) have been removed.
 */

import { MarketData } from '../types';
import { Logger } from '../core/Logger';
import { cryptoAPI } from './CryptoAPI';

interface TechnicalIndicators {
  sma: number[];
  ema: number[];
  rsi: number[];
  macd: {
    macd: number[];
    signal: number[];
    histogram: number[];
  };
  bollinger: {
    upper: number[];
    middle: number[];
    lower: number[];
  };
  obv: number[];
  vwap: number[];
  atr: number[];
  stochastic: {
    k: number[];
    d: number[];
  };
}

interface SmartMoneyFeatures {
  orderBlocks: Array<{
    price: number;
    timestamp: Date;
    type: 'bullish' | 'bearish';
    strength: number;
  }>;
  fairValueGaps: Array<{
    high: number;
    low: number;
    timestamp: Date;
    filled: boolean;
  }>;
  breakOfStructure: Array<{
    price: number;
    timestamp: Date;
    direction: 'up' | 'down';
    significance: number;
  }>;
  liquidityZones: Array<{
    price: number;
    volume: number;
    strength: number;
  }>;
}

interface MarketRegime {
  trend: 'bullish' | 'bearish' | 'sideways';
  strength: number;
  confidence: number;
  volatility: 'low' | 'medium' | 'high';
  volume: 'low' | 'medium' | 'high';
}

interface DataFeedHealth {
  huggingFaceStatus: 'healthy' | 'degraded' | 'down';
  lastUpdate: Date;
  latency: number;
  errorRate: number;
}

export class MarketDataService {
  private readonly logger = Logger.getInstance();
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>();
  private realTimeSubscriptions = new Map<string, (data: MarketData) => void>();
  private pollingIntervals = new Map<string, NodeJS.Timeout>();
  
  private symbolMappings = {
    'BTCUSDT': 'BTC',
    'ETHUSDT': 'ETH',
    'BNBUSDT': 'BNB',
    'ADAUSDT': 'ADA',
    'SOLUSDT': 'SOL',
    'MATICUSDT': 'MATIC',
    'DOTUSDT': 'DOT',
    'LINKUSDT': 'LINK',
    'LTCUSDT': 'LTC',
    'XRPUSDT': 'XRP'
  };

  constructor() {
    this.logger.info('✅ MarketDataService initialized with HuggingFace API');
  }

  /**
   * Get historical OHLCV data from HuggingFace
   */
  async getHistoricalData(symbol: string, timeframe: string, limit: number = 500): Promise<MarketData[]> {
    const cacheKey = `${symbol}_${timeframe}_${limit}`;
    const cached = this.getFromCache(cacheKey, 300000);
    
    if (cached) {
      return cached;
    }

    try {
      // Convert symbol to HuggingFace format (e.g., BTCUSDT -> BTC)
      const hfSymbol = this.symbolMappings[symbol as keyof typeof this.symbolMappings] || symbol.replace('USDT', '');
      
      this.logger.info(`📊 Fetching OHLCV from HuggingFace: ${hfSymbol}, ${timeframe}, ${limit}`);
      
      // Fetch from HuggingFace API
      const response = await cryptoAPI.getOHLCV(hfSymbol, timeframe, limit);
      
      if (!response.success || !response.data || response.data.length === 0) {
        this.logger.warn(`⚠️ HuggingFace returned no data for ${hfSymbol}`);
        return [];
      }
      
      // Convert HuggingFace format to MarketData
      const marketData: MarketData[] = response.data.map((candle: any) => ({
        symbol,
        timeframe,
        timestamp: new Date(candle.t),
        open: candle.o,
        high: candle.h,
        low: candle.l,
        close: candle.c,
        volume: candle.v || 0
      }));
      
      this.logger.info(`✅ HuggingFace: Fetched ${marketData.length} candles for ${symbol}`);
      
      this.setCache(cacheKey, marketData, 300000);
      return marketData;

    } catch (error) {
      this.logger.error('HuggingFace OHLCV fetch failed:', {}, error);
      return [];
    }
  }

  /**
   * Get real-time price from HuggingFace
   */
  async getRealTimePrice(symbol: string): Promise<MarketData> {
    try {
      const hfSymbol = this.symbolMappings[symbol as keyof typeof this.symbolMappings] || symbol.replace('USDT', '');
      const pair = `${hfSymbol}/USDT`;
      
      const response = await cryptoAPI.getPrice(pair);
      
      if (!response.data || !response.data.price) {
        throw new Error(`No price data returned for ${pair}`);
      }
      
      return {
        symbol,
        timeframe: '1m',
        timestamp: new Date(response.data.ts || Date.now()),
        open: response.data.price,
        high: response.data.price,
        low: response.data.price,
        close: response.data.price,
        volume: 0
      };
    } catch (error) {
      this.logger.error('HuggingFace real-time price fetch failed:', {}, error);
      throw error;
    }
  }

  /**
   * Subscribe to real-time price updates using polling
   * (HuggingFace doesn't support WebSockets for external connections)
   */
  async subscribeToRealTime(symbols: string[], callback: (data: MarketData) => void): Promise<void> {
    this.logger.info(`🔄 Starting real-time polling for ${symbols.length} symbols`);
    
    symbols.forEach(symbol => {
      // Clear existing interval if any
      const existingInterval = this.pollingIntervals.get(symbol);
      if (existingInterval) {
        clearInterval(existingInterval);
      }
      
      // Create polling interval (every 10 seconds for real-time feel)
      const interval = setInterval(async () => {
        try {
          const marketData = await this.getRealTimePrice(symbol);
          callback(marketData);
        } catch (error) {
          this.logger.error(`Polling error for ${symbol}:`, {}, error);
        }
      }, 10000);
      
      this.pollingIntervals.set(symbol, interval);
      this.realTimeSubscriptions.set(symbol, callback);
      
      // Initial fetch
      this.getRealTimePrice(symbol)
        .then(callback)
        .catch(err => this.logger.error(`Initial fetch error for ${symbol}:`, {}, err));
    });
  }

  /**
   * Get multiple prices at once (batch request)
   */
  async getBatchPrices(symbols: string[]): Promise<Map<string, number>> {
    const prices = new Map<string, number>();
    
    try {
      const hfSymbols = symbols.map(symbol => {
        const base = this.symbolMappings[symbol as keyof typeof this.symbolMappings] || symbol.replace('USDT', '');
        return `${base}/USDT`;
      });
      
      const response = await cryptoAPI.getPrices(hfSymbols);
      
      if (response.data && Array.isArray(response.data)) {
        response.data.forEach((priceData: any, index: number) => {
          prices.set(symbols[index], priceData.price);
        });
      }
    } catch (error) {
      this.logger.error('Batch price fetch failed:', {}, error);
    }
    
    return prices;
  }

  async calculateIndicators(data: MarketData[]): Promise<TechnicalIndicators> {
    if (data.length < 50) {
      this.logger.warn('Insufficient data for technical indicators');
    }

    const closes = (data || []).map(d => d.close);
    const highs = (data || []).map(d => d.high);
    const lows = (data || []).map(d => d.low);
    const volumes = (data || []).map(d => d.volume);

    return {
      sma: this.calculateSMA(closes, 20),
      ema: this.calculateEMA(closes, 20),
      rsi: this.calculateRSI(closes, 14),
      macd: this.calculateMACD(closes),
      bollinger: this.calculateBollingerBands(closes, 20, 2),
      obv: this.calculateOBV(closes, volumes),
      vwap: this.calculateVWAP(data),
      atr: this.calculateATR(highs, lows, closes, 14),
      stochastic: this.calculateStochastic(highs, lows, closes, 14)
    };
  }

  async getSmartMoneyFeatures(data: MarketData[]): Promise<SmartMoneyFeatures> {
    return {
      orderBlocks: this.detectOrderBlocks(data),
      fairValueGaps: this.detectFairValueGaps(data),
      breakOfStructure: this.detectBreakOfStructure(data),
      liquidityZones: this.detectLiquidityZones(data)
    };
  }

  async detectMarketRegime(data: MarketData[]): Promise<MarketRegime> {
    if (data.length < 50) {
      this.logger.warn('Insufficient data for regime detection');
    }

    const closes = (data || []).map(d => d.close);
    const volumes = (data || []).map(d => d.volume);
    
    const sma20 = this.calculateSMA(closes, 20);
    const sma50 = this.calculateSMA(closes, 50);
    const currentPrice = closes[closes.length - 1];
    const currentSMA20 = sma20[sma20.length - 1];
    const currentSMA50 = sma50[sma50.length - 1];
    
    let trend: 'bullish' | 'bearish' | 'sideways';
    let strength = 0;
    
    if (currentPrice > currentSMA20 && currentSMA20 > currentSMA50) {
      trend = 'bullish';
      strength = Math.min(1, (currentPrice - currentSMA50) / currentSMA50 * 10);
    } else if (currentPrice < currentSMA20 && currentSMA20 < currentSMA50) {
      trend = 'bearish';
      strength = Math.min(1, (currentSMA50 - currentPrice) / currentSMA50 * 10);
    } else {
      trend = 'sideways';
      strength = 0.5;
    }
    
    const returns = closes.slice(1).map((close, i) => Math.log(close / closes[i]));
    const volatility = Math.sqrt(returns.reduce((sum, r) => sum + r * r, 0) / returns.length);
    
    let volatilityLevel: 'low' | 'medium' | 'high';
    if (volatility < 0.02) volatilityLevel = 'low';
    else if (volatility < 0.05) volatilityLevel = 'medium';
    else volatilityLevel = 'high';
    
    const avgVolume = volumes.reduce((sum, v) => sum + v, 0) / volumes.length;
    const recentVolume = volumes.slice(-10).reduce((sum, v) => sum + v, 0) / 10;
    
    let volumeLevel: 'low' | 'medium' | 'high';
    if (recentVolume < avgVolume * 0.8) volumeLevel = 'low';
    else if (recentVolume < avgVolume * 1.2) volumeLevel = 'medium';
    else volumeLevel = 'high';
    
    return {
      trend,
      strength,
      confidence: Math.min(1, strength + (volumeLevel === 'high' ? 0.2 : 0)),
      volatility: volatilityLevel,
      volume: volumeLevel
    };
  }

  async validateDataQuality(data: MarketData[]): Promise<DataFeedHealth> {
    let huggingFaceStatus: 'healthy' | 'degraded' | 'down' = 'healthy';
    let latency = 0;
    let errorRate = 0;

    try {
      const start = Date.now();
      await cryptoAPI.getHealth();
      latency = Date.now() - start;
      
      if (latency > 2000) huggingFaceStatus = 'degraded';
      if (latency > 5000) huggingFaceStatus = 'down';
    } catch (error) {
      huggingFaceStatus = 'down';
      errorRate = 1.0;
    }

    return {
      huggingFaceStatus,
      lastUpdate: new Date(),
      latency,
      errorRate
    };
  }

  // Technical Indicator Calculations (unchanged from original)
  private calculateSMA(data: number[], period: number): number[] {
    const result: number[] = [];
    for (let i = period - 1; i < data.length; i++) {
      const sum = data.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0);
      result.push(sum / period);
    }
    return result;
  }

  private calculateEMA(data: number[], period: number): number[] {
    const result: number[] = [];
    const multiplier = 2 / (period + 1);
    
    let ema = data.slice(0, period).reduce((a, b) => a + b, 0) / period;
    result.push(ema);
    
    for (let i = period; i < data.length; i++) {
      ema = (data[i] - ema) * multiplier + ema;
      result.push(ema);
    }
    
    return result;
  }

  private calculateRSI(data: number[], period: number): number[] {
    const result: number[] = [];
    const gains: number[] = [];
    const losses: number[] = [];
    
    for (let i = 1; i < data.length; i++) {
      const change = data[i] - data[i - 1];
      gains.push(change > 0 ? change : 0);
      losses.push(change < 0 ? -change : 0);
    }
    
    for (let i = period - 1; i < gains.length; i++) {
      const avgGain = gains.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0) / period;
      const avgLoss = losses.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0) / period;
      
      if (avgLoss === 0) {
        result.push(100);
      } else {
        const rs = avgGain / avgLoss;
        result.push(100 - (100 / (1 + rs)));
      }
    }
    
    return result;
  }

  private calculateMACD(data: number[]): { macd: number[]; signal: number[]; histogram: number[] } {
    const ema12 = this.calculateEMA(data, 12);
    const ema26 = this.calculateEMA(data, 26);
    
    const macd: number[] = [];
    const startIndex = 26 - 12;
    
    for (let i = startIndex; i < ema12.length; i++) {
      macd.push(ema12[i] - ema26[i - startIndex]);
    }
    
    const signal = this.calculateEMA(macd, 9);
    const histogram: number[] = [];
    
    const signalStartIndex = macd.length - signal.length;
    for (let i = signalStartIndex; i < macd.length; i++) {
      histogram.push(macd[i] - signal[i - signalStartIndex]);
    }
    
    return { macd, signal, histogram };
  }

  private calculateBollingerBands(data: number[], period: number, stdDev: number): { upper: number[]; middle: number[]; lower: number[] } {
    const sma = this.calculateSMA(data, period);
    const upper: number[] = [];
    const lower: number[] = [];
    
    for (let i = period - 1; i < data.length; i++) {
      const slice = data.slice(i - period + 1, i + 1);
      const mean = sma[i - period + 1];
      const variance = slice.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / period;
      const standardDeviation = Math.sqrt(variance);
      
      upper.push(mean + (standardDeviation * stdDev));
      lower.push(mean - (standardDeviation * stdDev));
    }
    
    return { upper, middle: sma, lower };
  }

  private calculateOBV(closes: number[], volumes: number[]): number[] {
    const result: number[] = [volumes[0]];
    
    for (let i = 1; i < closes.length; i++) {
      if (closes[i] > closes[i - 1]) {
        result.push(result[i - 1] + volumes[i]);
      } else if (closes[i] < closes[i - 1]) {
        result.push(result[i - 1] - volumes[i]);
      } else {
        result.push(result[i - 1]);
      }
    }
    
    return result;
  }

  private calculateVWAP(data: MarketData[]): number[] {
    const result: number[] = [];
    let cumulativeVolume = 0;
    let cumulativeVolumePrice = 0;
    
    for (const candle of data) {
      const typicalPrice = (candle.high + candle.low + candle.close) / 3;
      cumulativeVolumePrice += typicalPrice * candle.volume;
      cumulativeVolume += candle.volume;
      
      result.push(cumulativeVolumePrice / cumulativeVolume);
    }
    
    return result;
  }

  private calculateATR(highs: number[], lows: number[], closes: number[], period: number): number[] {
    const trueRanges: number[] = [];
    
    for (let i = 1; i < highs.length; i++) {
      const tr1 = highs[i] - lows[i];
      const tr2 = Math.abs(highs[i] - closes[i - 1]);
      const tr3 = Math.abs(lows[i] - closes[i - 1]);
      trueRanges.push(Math.max(tr1, tr2, tr3));
    }
    
    return this.calculateSMA(trueRanges, period);
  }

  private calculateStochastic(highs: number[], lows: number[], closes: number[], period: number): { k: number[]; d: number[] } {
    const k: number[] = [];
    
    for (let i = period - 1; i < closes.length; i++) {
      const highestHigh = Math.max(...highs.slice(i - period + 1, i + 1));
      const lowestLow = Math.min(...lows.slice(i - period + 1, i + 1));
      
      if (highestHigh === lowestLow) {
        k.push(50);
      } else {
        k.push(((closes[i] - lowestLow) / (highestHigh - lowestLow)) * 100);
      }
    }
    
    const d = this.calculateSMA(k, 3);
    
    return { k, d };
  }

  // Smart Money Concepts (unchanged from original)
  private detectOrderBlocks(data: MarketData[]): Array<{ price: number; timestamp: Date; type: 'bullish' | 'bearish'; strength: number }> {
    const orderBlocks: Array<{ price: number; timestamp: Date; type: 'bullish' | 'bearish'; strength: number }> = [];
    
    for (let i = 2; i < data.length - 2; i++) {
      const current = data[i];
      const prev = data[i - 1];
      
      if (current.close > current.open &&
          current.volume > data.slice(Math.max(0, i - 10), i).reduce((sum, d) => sum + d.volume, 0) / 10 * 1.5 &&
          prev.close < prev.open) {
        orderBlocks.push({
          price: current.low,
          timestamp: current.timestamp instanceof Date ? current.timestamp : new Date(current.timestamp),
          type: 'bullish',
          strength: (current.close - current.open) / current.open
        });
      }

      if (current.close < current.open &&
          current.volume > data.slice(Math.max(0, i - 10), i).reduce((sum, d) => sum + d.volume, 0) / 10 * 1.5 &&
          prev.close > prev.open) {
        orderBlocks.push({
          price: current.high,
          timestamp: current.timestamp instanceof Date ? current.timestamp : new Date(current.timestamp),
          type: 'bearish',
          strength: (current.open - current.close) / current.open
        });
      }
    }
    
    return orderBlocks;
  }

  private detectFairValueGaps(data: MarketData[]): Array<{ high: number; low: number; timestamp: Date; filled: boolean }> {
    const gaps: Array<{ high: number; low: number; timestamp: Date; filled: boolean }> = [];
    
    for (let i = 1; i < data.length - 1; i++) {
      const prev = data[i - 1];
      const current = data[i];
      
      if (current.low > prev.high) {
        gaps.push({
          high: current.low,
          low: prev.high,
          timestamp: current.timestamp instanceof Date ? current.timestamp : new Date(current.timestamp),
          filled: false
        });
      }

      if (current.high < prev.low) {
        gaps.push({
          high: prev.low,
          low: current.high,
          timestamp: current.timestamp instanceof Date ? current.timestamp : new Date(current.timestamp),
          filled: false
        });
      }
    }
    
    gaps.forEach(gap => {
      const gapIndex = data.findIndex(d => d.timestamp >= gap.timestamp);
      for (let i = gapIndex + 1; i < data.length; i++) {
        if (data[i].low <= gap.low && data[i].high >= gap.high) {
          gap.filled = true;
          break;
        }
      }
    });
    
    return gaps;
  }

  private detectBreakOfStructure(data: MarketData[]): Array<{ price: number; timestamp: Date; direction: 'up' | 'down'; significance: number }> {
    const breaks: Array<{ price: number; timestamp: Date; direction: 'up' | 'down'; significance: number }> = [];
    const swingHighs: Array<{ price: number; index: number }> = [];
    const swingLows: Array<{ price: number; index: number }> = [];
    
    for (let i = 2; i < data.length - 2; i++) {
      const current = data[i];
      const isSwingHigh = data.slice(i - 2, i + 3).every((d, idx) => idx === 2 || d.high <= current.high);
      const isSwingLow = data.slice(i - 2, i + 3).every((d, idx) => idx === 2 || d.low >= current.low);
      
      if (isSwingHigh) {
        swingHighs.push({ price: current.high, index: i });
      }
      if (isSwingLow) {
        swingLows.push({ price: current.low, index: i });
      }
    }
    
    for (let i = 1; i < data.length; i++) {
      const current = data[i];
      
      const lastSwingHigh = swingHighs.filter(sh => sh.index < i).pop();
      if (lastSwingHigh && current.close > lastSwingHigh.price) {
        breaks.push({
          price: lastSwingHigh.price,
          timestamp: current.timestamp instanceof Date ? current.timestamp : new Date(current.timestamp),
          direction: 'up',
          significance: (current.close - lastSwingHigh.price) / lastSwingHigh.price
        });
      }

      const lastSwingLow = swingLows.filter(sl => sl.index < i).pop();
      if (lastSwingLow && current.close < lastSwingLow.price) {
        breaks.push({
          price: lastSwingLow.price,
          timestamp: current.timestamp instanceof Date ? current.timestamp : new Date(current.timestamp),
          direction: 'down',
          significance: (lastSwingLow.price - current.close) / lastSwingLow.price
        });
      }
    }
    
    return breaks;
  }

  private detectLiquidityZones(data: MarketData[]): Array<{ price: number; volume: number; strength: number }> {
    const zones: Array<{ price: number; volume: number; strength: number }> = [];
    const priceVolumeMap = new Map<number, number>();
    
    data.forEach(candle => {
      const priceLevel = Math.round(candle.close * 100) / 100;
      const existingVolume = priceVolumeMap.get(priceLevel) || 0;
      priceVolumeMap.set(priceLevel, existingVolume + candle.volume);
    });
    
    const avgVolume = Array.from(priceVolumeMap.values()).reduce((sum, vol) => sum + vol, 0) / priceVolumeMap.size;
    
    priceVolumeMap.forEach((volume, price) => {
      if (volume > avgVolume * 2) {
        zones.push({
          price,
          volume,
          strength: volume / avgVolume
        });
      }
    });
    
    return zones.sort((a, b) => b.strength - a.strength).slice(0, 10);
  }

  // Utility methods
  private getFromCache(key: string, maxAge: number): any | null {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < maxAge) {
      return cached.data;
    }
    return null;
  }

  private setCache(key: string, data: any, ttl: number): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  disconnect(): void {
    // Clear all polling intervals
    this.pollingIntervals.forEach(interval => clearInterval(interval));
    this.pollingIntervals.clear();
    this.realTimeSubscriptions.clear();
    this.logger.info('Disconnected all real-time subscriptions');
  }

  getSupportedSymbols(): string[] {
    return Object.keys(this.symbolMappings);
  }

  getSupportedTimeframes(): string[] {
    return ['1m', '5m', '15m', '1h', '4h', '1d', '1w'];
  }
}

export const marketDataService = new MarketDataService();
