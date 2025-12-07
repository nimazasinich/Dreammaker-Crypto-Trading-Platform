/**
 * Advanced Signal Engine
 * 5-Layer Validation System with Mathematical Scoring
 * EXTREME SELECTIVITY: Max 2-3 signals per day per pair
 */

import { Logger } from '../core/Logger.js';

export interface SignalScore {
  layer1_priceAction: number;      // 0-30 points
  layer2_indicators: number;        // 0-25 points
  layer3_timeframes: number;        // 0-20 points
  layer4_volume: number;            // 0-15 points
  layer5_riskManagement: number;    // 0-10 points
  totalScore: number;               // 0-100
  isValid: boolean;                 // Score >= 75
}

export interface TradingSignal {
  id: string;
  symbol: string;
  type: 'BUY' | 'SELL';
  score: SignalScore;
  entryPrice: number;
  stopLoss: number;
  takeProfit1: number;
  takeProfit2: number;
  takeProfit3: number;
  riskRewardRatio: number;
  timestamp: number;
  timeframe: string;
  contributingFactors: string[];
  confidence: number;
}

export interface OHLCV {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface IndicatorValues {
  rsi: number;
  macd: { value: number; signal: number; histogram: number };
  ema50: number;
  ema200: number;
  bollingerUpper: number;
  bollingerLower: number;
  bollingerMiddle: number;
  stochK: number;
  stochD: number;
  adx: number;
  atr: number;
  volumeAvg: number;
}

const MIN_SCORE_THRESHOLD = 75;
const MIN_RISK_REWARD = 3;
const SIGNAL_COOLDOWN_MS = 4 * 60 * 60 * 1000; // 4 hours

export class AdvancedSignalEngine {
  private static instance: AdvancedSignalEngine;
  private logger = Logger.getInstance();
  private lastSignalTime: Map<string, number> = new Map();
  private signalHistory: TradingSignal[] = [];

  private constructor() {}

  static getInstance(): AdvancedSignalEngine {
    if (!AdvancedSignalEngine.instance) {
      AdvancedSignalEngine.instance = new AdvancedSignalEngine();
    }
    return AdvancedSignalEngine.instance;
  }

  /**
   * Main signal generation - runs through all 5 layers
   */
  async generateSignal(
    symbol: string,
    candles: OHLCV[],
    indicators: IndicatorValues,
    timeframe: string
  ): Promise<TradingSignal | null> {
    // Check cooldown
    const lastSignal = this.lastSignalTime.get(symbol);
    if (lastSignal && Date.now() - lastSignal < SIGNAL_COOLDOWN_MS) {
      return null;
    }

    if (candles.length < 50) return null;

    const currentPrice = candles[candles.length - 1].close;
    const factors: string[] = [];

    // Layer 1: Price Action Analysis (0-30 points)
    const layer1 = this.analyzePriceAction(candles, factors);

    // Layer 2: Technical Indicators (0-25 points)
    const layer2 = this.analyzeIndicators(indicators, currentPrice, factors);

    // Layer 3: Multi-Timeframe (0-20 points) - simplified for single TF
    const layer3 = this.analyzeTimeframeAlignment(candles, indicators, factors);

    // Layer 4: Volume Analysis (0-15 points)
    const layer4 = this.analyzeVolume(candles, indicators, factors);

    // Layer 5: Risk Management (0-10 points)
    const layer5 = this.analyzeRiskManagement(candles, indicators, factors);

    const totalScore = layer1.score + layer2.score + layer3.score + layer4.score + layer5.score;
    const isValid = totalScore >= MIN_SCORE_THRESHOLD;

    if (!isValid) return null;

    // Determine signal direction
    const direction = this.determineDirection(layer1, layer2, layer3);
    if (!direction) return null;

    // Calculate levels
    const atr = indicators.atr;
    const stopLoss = direction === 'BUY' 
      ? currentPrice - (atr * 1.5)
      : currentPrice + (atr * 1.5);
    
    const riskAmount = Math.abs(currentPrice - stopLoss);
    const tp1 = direction === 'BUY' ? currentPrice + (riskAmount * 2) : currentPrice - (riskAmount * 2);
    const tp2 = direction === 'BUY' ? currentPrice + (riskAmount * 3) : currentPrice - (riskAmount * 3);
    const tp3 = direction === 'BUY' ? currentPrice + (riskAmount * 4) : currentPrice - (riskAmount * 4);

    const riskReward = Math.abs(tp2 - currentPrice) / riskAmount;
    if (riskReward < MIN_RISK_REWARD) return null;

    const signal: TradingSignal = {
      id: `sig_${symbol}_${Date.now()}`,
      symbol,
      type: direction,
      score: {
        layer1_priceAction: layer1.score,
        layer2_indicators: layer2.score,
        layer3_timeframes: layer3.score,
        layer4_volume: layer4.score,
        layer5_riskManagement: layer5.score,
        totalScore,
        isValid
      },
      entryPrice: currentPrice,
      stopLoss,
      takeProfit1: tp1,
      takeProfit2: tp2,
      takeProfit3: tp3,
      riskRewardRatio: riskReward,
      timestamp: Date.now(),
      timeframe,
      contributingFactors: factors,
      confidence: Math.round(totalScore)
    };

    this.lastSignalTime.set(symbol, Date.now());
    this.signalHistory.unshift(signal);
    if (this.signalHistory.length > 50) this.signalHistory.pop();

    this.logger.info('Signal generated', { symbol, type: direction, score: totalScore });
    return signal;
  }

  /**
   * Layer 1: Price Action Analysis (0-30 points)
   * Analyzes candlestick patterns, support/resistance, trend structure
   */
  private analyzePriceAction(
    candles: OHLCV[],
    factors: string[]
  ): { score: number; direction: 'BUY' | 'SELL' | null } {
    let score = 0;
    let bullishPoints = 0;
    let bearishPoints = 0;

    const recent = candles.slice(-20);
    const current = candles[candles.length - 1];
    const prev = candles[candles.length - 2];

    // 1. Trend Analysis (0-10 points)
    const highs = recent.map(c => c.high);
    const lows = recent.map(c => c.low);
    const higherHighs = highs.slice(-5).every((h, i, arr) => i === 0 || h >= arr[i - 1]);
    const higherLows = lows.slice(-5).every((l, i, arr) => i === 0 || l >= arr[i - 1]);
    const lowerHighs = highs.slice(-5).every((h, i, arr) => i === 0 || h <= arr[i - 1]);
    const lowerLows = lows.slice(-5).every((l, i, arr) => i === 0 || l <= arr[i - 1]);

    if (higherHighs && higherLows) {
      score += 8;
      bullishPoints += 8;
      factors.push('Uptrend structure (HH/HL)');
    } else if (lowerHighs && lowerLows) {
      score += 8;
      bearishPoints += 8;
      factors.push('Downtrend structure (LH/LL)');
    }

    // 2. Candlestick Patterns (0-10 points)
    if (prev.close < prev.open && current.close > current.open &&
        current.open <= prev.close && current.close >= prev.open) {
      score += 6;
      bullishPoints += 6;
      factors.push('Bullish Engulfing');
    }
    if (prev.close > prev.open && current.close < current.open &&
        current.open >= prev.close && current.close <= prev.open) {
      score += 6;
      bearishPoints += 6;
      factors.push('Bearish Engulfing');
    }

    // Hammer/Shooting Star
    const bodySize = Math.abs(current.close - current.open);
    const upperWick = current.high - Math.max(current.open, current.close);
    const lowerWick = Math.min(current.open, current.close) - current.low;

    if (lowerWick > bodySize * 2 && upperWick < bodySize * 0.5) {
      score += 5;
      bullishPoints += 5;
      factors.push('Hammer pattern');
    }
    if (upperWick > bodySize * 2 && lowerWick < bodySize * 0.5) {
      score += 5;
      bearishPoints += 5;
      factors.push('Shooting Star');
    }

    // 3. Support/Resistance (0-10 points)
    const recentLows = candles.slice(-50).map(c => c.low);
    const recentHighs = candles.slice(-50).map(c => c.high);
    const support = Math.min(...recentLows);
    const resistance = Math.max(...recentHighs);
    const range = resistance - support;

    if (current.close < support + range * 0.05) {
      score += 6;
      bullishPoints += 6;
      factors.push('Near key support');
    }
    if (current.close > resistance - range * 0.05) {
      score += 6;
      bearishPoints += 6;
      factors.push('Near key resistance');
    }

    const direction = bullishPoints > bearishPoints ? 'BUY' : 
                      bearishPoints > bullishPoints ? 'SELL' : null;

    return { score: Math.min(score, 30), direction };
  }

  /**
   * Layer 2: Technical Indicators (0-25 points)
   */
  private analyzeIndicators(
    indicators: IndicatorValues,
    currentPrice: number,
    factors: string[]
  ): { score: number; direction: 'BUY' | 'SELL' | null } {
    let score = 0;
    let bullishPoints = 0;
    let bearishPoints = 0;

    // RSI (0-5 points)
    if (indicators.rsi < 30) {
      score += 5;
      bullishPoints += 5;
      factors.push(`RSI oversold (${indicators.rsi.toFixed(1)})`);
    } else if (indicators.rsi > 70) {
      score += 5;
      bearishPoints += 5;
      factors.push(`RSI overbought (${indicators.rsi.toFixed(1)})`);
    }

    // MACD (0-5 points)
    if (indicators.macd.histogram > 0 && indicators.macd.value > indicators.macd.signal) {
      score += 4;
      bullishPoints += 4;
      factors.push('MACD bullish');
    } else if (indicators.macd.histogram < 0 && indicators.macd.value < indicators.macd.signal) {
      score += 4;
      bearishPoints += 4;
      factors.push('MACD bearish');
    }

    // EMA (0-5 points)
    if (currentPrice > indicators.ema50 && indicators.ema50 > indicators.ema200) {
      score += 5;
      bullishPoints += 5;
      factors.push('Above EMA50/200');
    } else if (currentPrice < indicators.ema50 && indicators.ema50 < indicators.ema200) {
      score += 5;
      bearishPoints += 5;
      factors.push('Below EMA50/200');
    }

    // Bollinger (0-5 points)
    if (currentPrice <= indicators.bollingerLower) {
      score += 4;
      bullishPoints += 4;
      factors.push('At lower BB');
    } else if (currentPrice >= indicators.bollingerUpper) {
      score += 4;
      bearishPoints += 4;
      factors.push('At upper BB');
    }

    // Stochastic (0-3 points)
    if (indicators.stochK < 20 && indicators.stochD < 20) {
      score += 3;
      bullishPoints += 3;
      factors.push('Stoch oversold');
    } else if (indicators.stochK > 80 && indicators.stochD > 80) {
      score += 3;
      bearishPoints += 3;
      factors.push('Stoch overbought');
    }

    // ADX (0-2 points)
    if (indicators.adx > 25) {
      score += 2;
      factors.push(`Strong trend (ADX: ${indicators.adx.toFixed(1)})`);
    }

    const direction = bullishPoints > bearishPoints ? 'BUY' : 
                      bearishPoints > bullishPoints ? 'SELL' : null;

    return { score: Math.min(score, 25), direction };
  }

  /**
   * Layer 3: Multi-Timeframe Alignment (0-20 points)
   */
  private analyzeTimeframeAlignment(
    candles: OHLCV[],
    _indicators: IndicatorValues,
    factors: string[]
  ): { score: number; direction: 'BUY' | 'SELL' | null } {
    let score = 0;
    let bullishPoints = 0;
    let bearishPoints = 0;

    const shortTerm = candles.slice(-10);
    const mediumTerm = candles.slice(-30);
    const longTerm = candles.slice(-50);

    const shortTrend = this.calculateTrend(shortTerm);
    const mediumTrend = this.calculateTrend(mediumTerm);
    const longTrend = this.calculateTrend(longTerm);

    if (shortTrend > 0 && mediumTrend > 0 && longTrend > 0) {
      score += 15;
      bullishPoints += 15;
      factors.push('Multi-TF bullish');
    } else if (shortTrend < 0 && mediumTrend < 0 && longTrend < 0) {
      score += 15;
      bearishPoints += 15;
      factors.push('Multi-TF bearish');
    } else if ((shortTrend > 0 && mediumTrend > 0) || (shortTrend < 0 && mediumTrend < 0)) {
      score += 8;
      if (shortTrend > 0) bullishPoints += 8;
      else bearishPoints += 8;
    }

    const momentum = this.calculateMomentum(candles.slice(-20));
    if (Math.abs(momentum) > 0.02) {
      score += 5;
      if (momentum > 0) bullishPoints += 5;
      else bearishPoints += 5;
      factors.push(`Momentum ${momentum > 0 ? '+' : '-'}`);
    }

    const direction = bullishPoints > bearishPoints ? 'BUY' : 
                      bearishPoints > bullishPoints ? 'SELL' : null;

    return { score: Math.min(score, 20), direction };
  }

  /**
   * Layer 4: Volume Analysis (0-15 points)
   */
  private analyzeVolume(
    candles: OHLCV[],
    indicators: IndicatorValues,
    factors: string[]
  ): { score: number } {
    let score = 0;
    const current = candles[candles.length - 1];
    const avgVolume = indicators.volumeAvg;

    if (current.volume > avgVolume * 1.5) {
      score += 8;
      factors.push(`Volume spike (${(current.volume / avgVolume).toFixed(1)}x)`);
    } else if (current.volume > avgVolume) {
      score += 4;
    }

    const recentVolumes = candles.slice(-5).map(c => c.volume);
    const volumeIncreasing = recentVolumes.every((v, i, arr) => i === 0 || v >= arr[i - 1] * 0.9);
    if (volumeIncreasing) {
      score += 5;
      factors.push('Volume increasing');
    }

    const priceUp = current.close > current.open;
    const highVolume = current.volume > avgVolume;
    if ((priceUp && highVolume) || (!priceUp && highVolume)) {
      score += 2;
    }

    return { score: Math.min(score, 15) };
  }

  /**
   * Layer 5: Risk Management (0-10 points)
   */
  private analyzeRiskManagement(
    candles: OHLCV[],
    indicators: IndicatorValues,
    factors: string[]
  ): { score: number } {
    let score = 0;
    const current = candles[candles.length - 1];
    const atr = indicators.atr;
    const avgPrice = (current.high + current.low + current.close) / 3;

    const atrPercent = (atr / avgPrice) * 100;
    if (atrPercent >= 1 && atrPercent <= 5) {
      score += 5;
      factors.push(`Good volatility (${atrPercent.toFixed(2)}%)`);
    } else if (atrPercent > 0.5 && atrPercent < 8) {
      score += 3;
    }

    const recentLows = candles.slice(-10).map(c => c.low);
    const recentHighs = candles.slice(-10).map(c => c.high);
    const swingLow = Math.min(...recentLows);
    const swingHigh = Math.max(...recentHighs);
    const stopDistance = Math.min(
      Math.abs(current.close - swingLow),
      Math.abs(swingHigh - current.close)
    );

    if (stopDistance > atr * 0.5 && stopDistance < atr * 2) {
      score += 5;
      factors.push('Clear SL level');
    } else if (stopDistance > atr * 0.3) {
      score += 2;
    }

    return { score: Math.min(score, 10) };
  }

  /**
   * Determine final direction
   */
  private determineDirection(
    layer1: { score: number; direction: 'BUY' | 'SELL' | null },
    layer2: { score: number; direction: 'BUY' | 'SELL' | null },
    layer3: { score: number; direction: 'BUY' | 'SELL' | null }
  ): 'BUY' | 'SELL' | null {
    const directions = [layer1.direction, layer2.direction, layer3.direction].filter(Boolean);
    if (directions.length < 2) return null;

    const buyCount = directions.filter(d => d === 'BUY').length;
    const sellCount = directions.filter(d => d === 'SELL').length;

    if (buyCount >= 2) return 'BUY';
    if (sellCount >= 2) return 'SELL';
    return null;
  }

  private calculateTrend(candles: OHLCV[]): number {
    if (candles.length < 2) return 0;
    const first = candles[0].close;
    const last = candles[candles.length - 1].close;
    return (last - first) / first;
  }

  private calculateMomentum(candles: OHLCV[]): number {
    if (candles.length < 10) return 0;
    const recent = candles.slice(-5);
    const older = candles.slice(-10, -5);
    const recentAvg = recent.reduce((sum, c) => sum + c.close, 0) / recent.length;
    const olderAvg = older.reduce((sum, c) => sum + c.close, 0) / older.length;
    return (recentAvg - olderAvg) / olderAvg;
  }

  getSignalHistory(): TradingSignal[] {
    return [...this.signalHistory];
  }

  clearCooldown(symbol?: string): void {
    if (symbol) {
      this.lastSignalTime.delete(symbol);
    } else {
      this.lastSignalTime.clear();
    }
  }
}

export default AdvancedSignalEngine;
