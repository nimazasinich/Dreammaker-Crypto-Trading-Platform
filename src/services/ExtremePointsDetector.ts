/**
 * ExtremePointsDetector Service
 * Detects potential extreme points (minima/maxima) where significant market movements may occur
 * Uses multiple strategies: Trendlines, Elliott Waves, Harmonic Patterns, Volume Analysis
 * Only considers signals with volume >= $2M
 */

import { Logger } from '../core/Logger.js';
import { MarketData } from '../types/index.js';
import { ElliottWaveAnalyzer } from './ElliottWaveAnalyzer.js';
import { HarmonicPatternDetector } from './HarmonicPatternDetector.js';

export interface ExtremePoint {
  id: string;
  symbol: string;
  timestamp: number;
  price: number;
  type: 'POTENTIAL_HIGH' | 'POTENTIAL_LOW';
  signalType: 'BUY' | 'SELL';
  confidence: number; // 0-100
  volume24h: number;
  strategies: StrategyContribution[];
  targetPrice?: number;
  stopLoss?: number;
  riskReward?: number;
  reasoning: string[];
  status: 'ACTIVE' | 'TRIGGERED' | 'EXPIRED' | 'INVALIDATED';
  expiresAt: number;
}

export interface StrategyContribution {
  name: string;
  weight: number;
  signal: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  confidence: number;
  details: string;
}

export interface TrendlineData {
  id: string;
  type: 'SUPPORT' | 'RESISTANCE';
  startPoint: { price: number; timestamp: number };
  endPoint: { price: number; timestamp: number };
  slope: number;
  strength: number;
  touches: number;
  currentPrice: number;
  breakoutProbability: number;
}

export interface VolumeProfile {
  averageVolume: number;
  currentVolume: number;
  volumeRatio: number;
  isHighVolume: boolean;
  volumeUSD: number;
}

const MIN_VOLUME_USD = 2_000_000; // $2M minimum volume requirement

export class ExtremePointsDetector {
  private static instance: ExtremePointsDetector;
  private logger = Logger.getInstance();
  private elliottWaveAnalyzer = ElliottWaveAnalyzer.getInstance();
  private harmonicDetector = HarmonicPatternDetector.getInstance();
  
  private activeSignals: Map<string, ExtremePoint> = new Map();
  private trendlines: Map<string, TrendlineData[]> = new Map();
  private subscribers: Array<(signal: ExtremePoint) => void> = [];

  private constructor() {}

  static getInstance(): ExtremePointsDetector {
    if (!ExtremePointsDetector.instance) {
      ExtremePointsDetector.instance = new ExtremePointsDetector();
    }
    return ExtremePointsDetector.instance;
  }

  /**
   * Subscribe to new signals
   */
  subscribe(callback: (signal: ExtremePoint) => void): () => void {
    this.subscribers.push(callback);
    return () => {
      const index = this.subscribers.indexOf(callback);
      if (index > -1) this.subscribers.splice(index, 1);
    };
  }

  /**
   * Get all active signals
   */
  getActiveSignals(): ExtremePoint[] {
    return Array.from(this.activeSignals.values())
      .filter(s => s.status === 'ACTIVE' && s.expiresAt > Date.now());
  }

  /**
   * Get trendlines for a symbol
   */
  getTrendlines(symbol: string): TrendlineData[] {
    return this.trendlines.get(symbol) || [];
  }

  /**
   * Main analysis function - detects extreme points
   */
  async analyzeMarket(
    symbol: string,
    data: MarketData[],
    currentPrice: number,
    volume24hUSD: number
  ): Promise<ExtremePoint | null> {
    if (data.length < 50) {
      this.logger.warn('Insufficient data for extreme point detection', { symbol });
      return null;
    }

    // Check volume requirement
    if (volume24hUSD < MIN_VOLUME_USD) {
      this.logger.debug('Volume below threshold', { symbol, volume24hUSD, required: MIN_VOLUME_USD });
      return null;
    }

    const strategies: StrategyContribution[] = [];
    const reasoning: string[] = [];

    // 1. Trendline Analysis
    const trendlineResult = this.analyzeTrendlines(symbol, data, currentPrice);
    if (trendlineResult) {
      strategies.push(trendlineResult);
      reasoning.push(trendlineResult.details);
    }

    // 2. Elliott Wave Analysis
    const elliottResult = this.analyzeElliottWaves(data);
    if (elliottResult) {
      strategies.push(elliottResult);
      reasoning.push(elliottResult.details);
    }

    // 3. Harmonic Pattern Analysis
    const harmonicResult = this.analyzeHarmonicPatterns(data);
    if (harmonicResult) {
      strategies.push(harmonicResult);
      reasoning.push(harmonicResult.details);
    }

    // 4. Support/Resistance Analysis
    const srResult = this.analyzeSupportResistance(data, currentPrice);
    if (srResult) {
      strategies.push(srResult);
      reasoning.push(srResult.details);
    }

    // 5. Volume Profile Analysis
    const volumeResult = this.analyzeVolumeProfile(data, volume24hUSD);
    if (volumeResult) {
      strategies.push(volumeResult);
      reasoning.push(volumeResult.details);
    }

    // Calculate combined signal
    if (strategies.length < 2) {
      return null; // Need at least 2 confirming strategies
    }

    const combinedSignal = this.combineStrategies(strategies);
    if (combinedSignal.confidence < 60) {
      return null; // Below confidence threshold
    }

    // Create extreme point signal
    const signal = this.createSignal(
      symbol,
      currentPrice,
      volume24hUSD,
      combinedSignal,
      strategies,
      reasoning
    );

    // Store and notify
    this.activeSignals.set(signal.id, signal);
    this.notifySubscribers(signal);

    return signal;
  }


  /**
   * Analyze trendlines for support/resistance breaks
   */
  private analyzeTrendlines(
    symbol: string,
    data: MarketData[],
    currentPrice: number
  ): StrategyContribution | null {
    const trendlines = this.detectTrendlines(data);
    this.trendlines.set(symbol, trendlines);

    if (trendlines.length === 0) return null;

    // Find nearest trendline
    let nearestTrendline: TrendlineData | null = null;
    let minDistance = Infinity;

    for (const tl of trendlines) {
      const distance = Math.abs(currentPrice - tl.currentPrice) / currentPrice;
      if (distance < minDistance && distance < 0.02) { // Within 2%
        minDistance = distance;
        nearestTrendline = tl;
      }
    }

    if (!nearestTrendline) return null;

    const isNearSupport = nearestTrendline.type === 'SUPPORT';
    const signal: 'BULLISH' | 'BEARISH' = isNearSupport ? 'BULLISH' : 'BEARISH';
    const confidence = nearestTrendline.strength * nearestTrendline.touches * 10;

    return {
      name: 'Trendline',
      weight: 0.25,
      signal,
      confidence: Math.min(confidence, 100),
      details: `Price near ${nearestTrendline.type.toLowerCase()} trendline (${nearestTrendline.touches} touches, ${(nearestTrendline.breakoutProbability * 100).toFixed(0)}% breakout probability)`
    };
  }

  /**
   * Detect trendlines from price data
   */
  private detectTrendlines(data: MarketData[]): TrendlineData[] {
    const trendlines: TrendlineData[] = [];
    const pivots = this.findPivotPoints(data);

    // Find support trendlines (connecting lows)
    const lows = pivots.filter(p => p.type === 'LOW');
    for (let i = 0; i < lows.length - 1; i++) {
      for (let j = i + 1; j < lows.length; j++) {
        const tl = this.createTrendline(lows[i], lows[j], data, 'SUPPORT');
        if (tl && tl.touches >= 2) {
          trendlines.push(tl);
        }
      }
    }

    // Find resistance trendlines (connecting highs)
    const highs = pivots.filter(p => p.type === 'HIGH');
    for (let i = 0; i < highs.length - 1; i++) {
      for (let j = i + 1; j < highs.length; j++) {
        const tl = this.createTrendline(highs[i], highs[j], data, 'RESISTANCE');
        if (tl && tl.touches >= 2) {
          trendlines.push(tl);
        }
      }
    }

    // Sort by strength and return top trendlines
    return trendlines.sort((a, b) => b.strength - a.strength).slice(0, 5);
  }

  /**
   * Create a trendline from two points
   */
  private createTrendline(
    p1: { price: number; timestamp: number; type: string },
    p2: { price: number; timestamp: number; type: string },
    data: MarketData[],
    type: 'SUPPORT' | 'RESISTANCE'
  ): TrendlineData | null {
    const slope = (p2.price - p1.price) / (p2.timestamp - p1.timestamp);
    let touches = 2;
    let strength = 0;

    // Count additional touches
    for (const candle of data) {
      const ts = typeof candle.timestamp === 'number' ? candle.timestamp : candle.timestamp.getTime();
      const expectedPrice = p1.price + slope * (ts - p1.timestamp);
      const actualPrice = type === 'SUPPORT' ? candle.low : candle.high;
      const tolerance = expectedPrice * 0.005; // 0.5% tolerance

      if (Math.abs(actualPrice - expectedPrice) <= tolerance) {
        touches++;
        strength += 1;
      }
    }

    if (touches < 2) return null;

    const lastCandle = data[data.length - 1];
    const lastTs = typeof lastCandle.timestamp === 'number' ? lastCandle.timestamp : lastCandle.timestamp.getTime();
    const currentTrendPrice = p1.price + slope * (lastTs - p1.timestamp);

    return {
      id: `tl_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
      type,
      startPoint: { price: p1.price, timestamp: p1.timestamp },
      endPoint: { price: p2.price, timestamp: p2.timestamp },
      slope,
      strength: Math.min(strength / 5, 1),
      touches,
      currentPrice: currentTrendPrice,
      breakoutProbability: Math.min(0.3 + (touches - 2) * 0.1, 0.8)
    };
  }

  /**
   * Analyze Elliott Waves
   */
  private analyzeElliottWaves(data: MarketData[]): StrategyContribution | null {
    try {
      const analysis = this.elliottWaveAnalyzer.analyzeElliottWaves(data);
      
      if (!analysis || analysis.completionProbability < 0.5) return null;

      const { currentWave, nextExpectedDirection, completionProbability } = analysis;
      
      let signal: 'BULLISH' | 'BEARISH' | 'NEUTRAL' = 'NEUTRAL';
      let details = '';

      if (nextExpectedDirection === 'UP') {
        signal = 'BULLISH';
        details = `Elliott Wave ${currentWave.wave} completing, expecting upward move (${(completionProbability * 100).toFixed(0)}% completion)`;
      } else if (nextExpectedDirection === 'DOWN') {
        signal = 'BEARISH';
        details = `Elliott Wave ${currentWave.wave} completing, expecting downward move (${(completionProbability * 100).toFixed(0)}% completion)`;
      }

      return {
        name: 'Elliott Wave',
        weight: 0.20,
        signal,
        confidence: completionProbability * 100,
        details
      };
    } catch (error) {
      this.logger.error('Elliott Wave analysis failed', {}, error as Error);
      return null;
    }
  }

  /**
   * Analyze Harmonic Patterns
   */
  private analyzeHarmonicPatterns(data: MarketData[]): StrategyContribution | null {
    try {
      const patterns = this.harmonicDetector.detectHarmonicPatterns(data);
      
      if (patterns.length === 0) return null;

      const bestPattern = patterns[0]; // Already sorted by reliability
      const lastPrice = data[data.length - 1].close;
      
      // Determine signal based on PRZ
      let signal: 'BULLISH' | 'BEARISH' | 'NEUTRAL' = 'NEUTRAL';
      let details = '';

      if (lastPrice >= bestPattern.prz.lower && lastPrice <= bestPattern.prz.upper) {
        // Price is in PRZ - potential reversal
        const isNearLow = lastPrice < (bestPattern.prz.lower + bestPattern.prz.upper) / 2;
        signal = isNearLow ? 'BULLISH' : 'BEARISH';
        details = `${bestPattern.type} pattern detected in PRZ (${(bestPattern.reliabilityScore * 100).toFixed(0)}% reliability)`;
      } else if (lastPrice < bestPattern.prz.lower) {
        signal = 'BULLISH';
        details = `${bestPattern.type} pattern: Price approaching PRZ from below`;
      } else {
        signal = 'BEARISH';
        details = `${bestPattern.type} pattern: Price approaching PRZ from above`;
      }

      return {
        name: 'Harmonic Pattern',
        weight: 0.20,
        signal,
        confidence: bestPattern.reliabilityScore * 100,
        details
      };
    } catch (error) {
      this.logger.error('Harmonic pattern analysis failed', {}, error as Error);
      return null;
    }
  }

  /**
   * Analyze Support/Resistance levels
   */
  private analyzeSupportResistance(
    data: MarketData[],
    currentPrice: number
  ): StrategyContribution | null {
    const levels = this.findSRLevels(data);
    
    // Find nearest level
    let nearestLevel: { price: number; type: 'SUPPORT' | 'RESISTANCE'; strength: number } | null = null;
    let minDistance = Infinity;

    for (const level of levels) {
      const distance = Math.abs(currentPrice - level.price) / currentPrice;
      if (distance < minDistance && distance < 0.03) { // Within 3%
        minDistance = distance;
        nearestLevel = level;
      }
    }

    if (!nearestLevel) return null;

    const signal: 'BULLISH' | 'BEARISH' = nearestLevel.type === 'SUPPORT' ? 'BULLISH' : 'BEARISH';
    const confidence = nearestLevel.strength * 100;

    return {
      name: 'Support/Resistance',
      weight: 0.20,
      signal,
      confidence: Math.min(confidence, 100),
      details: `Price near key ${nearestLevel.type.toLowerCase()} at $${nearestLevel.price.toFixed(2)} (${(minDistance * 100).toFixed(1)}% away)`
    };
  }

  /**
   * Find support/resistance levels
   */
  private findSRLevels(data: MarketData[]): Array<{ price: number; type: 'SUPPORT' | 'RESISTANCE'; strength: number }> {
    const levels: Array<{ price: number; type: 'SUPPORT' | 'RESISTANCE'; strength: number }> = [];
    const pivots = this.findPivotPoints(data);

    // Cluster pivots into levels
    const tolerance = 0.01; // 1% tolerance for clustering
    const clusters: Map<number, { prices: number[]; type: 'SUPPORT' | 'RESISTANCE' }> = new Map();

    for (const pivot of pivots) {
      let foundCluster = false;
      for (const [key, cluster] of clusters) {
        if (Math.abs(pivot.price - key) / key < tolerance) {
          cluster.prices.push(pivot.price);
          foundCluster = true;
          break;
        }
      }
      if (!foundCluster) {
        clusters.set(pivot.price, {
          prices: [pivot.price],
          type: pivot.type === 'HIGH' ? 'RESISTANCE' : 'SUPPORT'
        });
      }
    }

    // Convert clusters to levels
    for (const [_, cluster] of clusters) {
      if (cluster.prices.length >= 2) {
        const avgPrice = cluster.prices.reduce((a, b) => a + b, 0) / cluster.prices.length;
        levels.push({
          price: avgPrice,
          type: cluster.type,
          strength: Math.min(cluster.prices.length / 5, 1)
        });
      }
    }

    return levels.sort((a, b) => b.strength - a.strength);
  }


  /**
   * Analyze Volume Profile
   */
  private analyzeVolumeProfile(
    data: MarketData[],
    volume24hUSD: number
  ): StrategyContribution | null {
    const volumes = data.map(d => d.volume);
    const avgVolume = volumes.reduce((a, b) => a + b, 0) / volumes.length;
    const currentVolume = volumes[volumes.length - 1];
    const volumeRatio = currentVolume / avgVolume;

    // High volume indicates potential significant move
    if (volumeRatio < 1.5) return null;

    const recentPriceChange = (data[data.length - 1].close - data[data.length - 5].close) / data[data.length - 5].close;
    
    let signal: 'BULLISH' | 'BEARISH' | 'NEUTRAL' = 'NEUTRAL';
    if (recentPriceChange > 0.01 && volumeRatio > 2) {
      signal = 'BULLISH';
    } else if (recentPriceChange < -0.01 && volumeRatio > 2) {
      signal = 'BEARISH';
    }

    const confidence = Math.min((volumeRatio - 1) * 30 + 40, 90);

    return {
      name: 'Volume Profile',
      weight: 0.15,
      signal,
      confidence,
      details: `Volume ${volumeRatio.toFixed(1)}x average ($${(volume24hUSD / 1_000_000).toFixed(1)}M 24h volume)`
    };
  }

  /**
   * Find pivot points (swing highs/lows)
   */
  private findPivotPoints(
    data: MarketData[]
  ): Array<{ price: number; timestamp: number; type: 'HIGH' | 'LOW' }> {
    const pivots: Array<{ price: number; timestamp: number; type: 'HIGH' | 'LOW' }> = [];
    const window = 5;

    for (let i = window; i < data.length - window; i++) {
      const center = data[i];
      const leftWindow = data.slice(i - window, i);
      const rightWindow = data.slice(i + 1, i + window + 1);

      const isHigh = leftWindow.every(d => d.high <= center.high) &&
                    rightWindow.every(d => d.high <= center.high);

      const isLow = leftWindow.every(d => d.low >= center.low) &&
                   rightWindow.every(d => d.low >= center.low);

      const ts = typeof center.timestamp === 'number' ? center.timestamp : center.timestamp.getTime();

      if (isHigh) {
        pivots.push({ price: center.high, timestamp: ts, type: 'HIGH' });
      }
      if (isLow) {
        pivots.push({ price: center.low, timestamp: ts, type: 'LOW' });
      }
    }

    return pivots;
  }

  /**
   * Combine multiple strategy signals
   */
  private combineStrategies(strategies: StrategyContribution[]): {
    signal: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
    confidence: number;
  } {
    let bullishScore = 0;
    let bearishScore = 0;
    let totalWeight = 0;

    for (const strategy of strategies) {
      const weightedConfidence = strategy.confidence * strategy.weight;
      totalWeight += strategy.weight;

      if (strategy.signal === 'BULLISH') {
        bullishScore += weightedConfidence;
      } else if (strategy.signal === 'BEARISH') {
        bearishScore += weightedConfidence;
      }
    }

    const normalizedBullish = bullishScore / (totalWeight * 100);
    const normalizedBearish = bearishScore / (totalWeight * 100);

    let signal: 'BULLISH' | 'BEARISH' | 'NEUTRAL' = 'NEUTRAL';
    let confidence = 0;

    if (normalizedBullish > normalizedBearish && normalizedBullish > 0.3) {
      signal = 'BULLISH';
      confidence = normalizedBullish * 100;
    } else if (normalizedBearish > normalizedBullish && normalizedBearish > 0.3) {
      signal = 'BEARISH';
      confidence = normalizedBearish * 100;
    }

    return { signal, confidence };
  }

  /**
   * Create a signal from analysis results
   */
  private createSignal(
    symbol: string,
    currentPrice: number,
    volume24hUSD: number,
    combinedSignal: { signal: 'BULLISH' | 'BEARISH' | 'NEUTRAL'; confidence: number },
    strategies: StrategyContribution[],
    reasoning: string[]
  ): ExtremePoint {
    const isBullish = combinedSignal.signal === 'BULLISH';
    
    // Calculate target and stop loss based on ATR
    const atrValue = this.calculateATR(currentPrice);
    const targetPrice = isBullish 
      ? currentPrice + (atrValue * 1.5) // 1.5x ATR target
      : currentPrice - (atrValue * 1.5);
    const stopLoss = isBullish
      ? currentPrice - (atrValue * 0.75) // 0.75x ATR stop
      : currentPrice + (atrValue * 0.75);
    const riskReward = Math.abs(targetPrice - currentPrice) / Math.abs(currentPrice - stopLoss);

    return {
      id: `ep_${symbol}_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
      symbol,
      timestamp: Date.now(),
      price: currentPrice,
      type: isBullish ? 'POTENTIAL_LOW' : 'POTENTIAL_HIGH',
      signalType: isBullish ? 'BUY' : 'SELL',
      confidence: Math.round(combinedSignal.confidence),
      volume24h: volume24hUSD,
      strategies,
      targetPrice,
      stopLoss,
      riskReward,
      reasoning,
      status: 'ACTIVE',
      expiresAt: Date.now() + 4 * 60 * 60 * 1000 // 4 hours expiry
    };
  }

  /**
   * Simple ATR calculation
   */
  private calculateATR(price: number): number {
    return price * 0.02; // Simplified 2% ATR
  }

  /**
   * Notify all subscribers of new signal
   */
  private notifySubscribers(signal: ExtremePoint): void {
    for (const callback of this.subscribers) {
      try {
        callback(signal);
      } catch (error) {
        this.logger.error('Error notifying subscriber', {}, error as Error);
      }
    }
  }

  /**
   * Update signal status
   */
  updateSignalStatus(signalId: string, status: ExtremePoint['status']): void {
    const signal = this.activeSignals.get(signalId);
    if (signal) {
      signal.status = status;
      this.activeSignals.set(signalId, signal);
    }
  }

  /**
   * Clean up expired signals
   */
  cleanupExpiredSignals(): void {
    const now = Date.now();
    for (const [id, signal] of this.activeSignals) {
      if (signal.expiresAt < now && signal.status === 'ACTIVE') {
        signal.status = 'EXPIRED';
        this.activeSignals.set(id, signal);
      }
    }
  }
}
