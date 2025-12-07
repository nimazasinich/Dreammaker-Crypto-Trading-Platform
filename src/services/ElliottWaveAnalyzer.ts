/**
 * ElliottWaveAnalyzer Service
 * Analyzes price data to identify Elliott Wave patterns
 */

import { MarketData } from '../types/index.js';

export interface WavePoint {
  price: number;
  timestamp: number;
  wave: string; // '1', '2', '3', '4', '5', 'A', 'B', 'C'
  type: 'IMPULSE' | 'CORRECTIVE';
}

export interface ElliottWaveAnalysis {
  currentWave: WavePoint;
  waveSequence: WavePoint[];
  nextExpectedDirection: 'UP' | 'DOWN' | 'NEUTRAL';
  completionProbability: number;
  confidence?: number;
  targetPrice?: number;
  invalidationLevel?: number;
}

export class ElliottWaveAnalyzer {
  private static instance: ElliottWaveAnalyzer;

  private constructor() {}

  static getInstance(): ElliottWaveAnalyzer {
    if (!ElliottWaveAnalyzer.instance) {
      ElliottWaveAnalyzer.instance = new ElliottWaveAnalyzer();
    }
    return ElliottWaveAnalyzer.instance;
  }

  /**
   * Analyze price data for Elliott Wave patterns
   */
  analyzeElliottWaves(data: MarketData[]): ElliottWaveAnalysis | null {
    if (data.length < 50) return null;

    const pivots = this.findPivots(data);
    if (pivots.length < 5) return null;

    // Try to identify wave sequence
    const waveSequence = this.identifyWaveSequence(pivots);
    if (!waveSequence || waveSequence.length < 3) return null;

    const currentWave = waveSequence[waveSequence.length - 1];
    const nextDirection = this.predictNextDirection(currentWave);
    const probability = this.calculateCompletionProbability(waveSequence, data);

    return {
      currentWave,
      waveSequence,
      nextExpectedDirection: nextDirection,
      completionProbability: probability,
      targetPrice: this.calculateTarget(waveSequence, data),
      invalidationLevel: this.calculateInvalidation(waveSequence)
    };
  }


  /**
   * Find pivot points (swing highs/lows)
   */
  private findPivots(data: MarketData[]): Array<{ price: number; timestamp: number; type: 'HIGH' | 'LOW' }> {
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
   * Identify Elliott Wave sequence from pivots
   */
  private identifyWaveSequence(pivots: Array<{ price: number; timestamp: number; type: 'HIGH' | 'LOW' }>): WavePoint[] {
    const waves: WavePoint[] = [];
    const impulseWaves = ['1', '2', '3', '4', '5'];
    const correctiveWaves = ['A', 'B', 'C'];
    
    // Simplified wave identification
    let waveIndex = 0;
    let isImpulse = true;
    let lastType: 'HIGH' | 'LOW' | null = null;

    for (const pivot of pivots.slice(-8)) { // Look at last 8 pivots
      if (lastType === pivot.type) continue; // Skip consecutive same types
      
      const waveLabels = isImpulse ? impulseWaves : correctiveWaves;
      const waveLabel = waveLabels[waveIndex % waveLabels.length];
      
      waves.push({
        price: pivot.price,
        timestamp: pivot.timestamp,
        wave: waveLabel,
        type: isImpulse ? 'IMPULSE' : 'CORRECTIVE'
      });

      waveIndex++;
      lastType = pivot.type;

      // Switch to corrective after wave 5
      if (isImpulse && waveIndex >= 5) {
        isImpulse = false;
        waveIndex = 0;
      }
    }

    return waves;
  }

  /**
   * Predict next direction based on current wave
   */
  private predictNextDirection(currentWave: WavePoint): 'UP' | 'DOWN' | 'NEUTRAL' {
    const { wave, type } = currentWave;
    
    if (type === 'IMPULSE') {
      switch (wave) {
        case '1': return 'DOWN'; // Wave 2 correction
        case '2': return 'UP';   // Wave 3 impulse
        case '3': return 'DOWN'; // Wave 4 correction
        case '4': return 'UP';   // Wave 5 impulse
        case '5': return 'DOWN'; // Corrective A
        default: return 'NEUTRAL';
      }
    } else {
      switch (wave) {
        case 'A': return 'UP';   // Wave B correction
        case 'B': return 'DOWN'; // Wave C impulse
        case 'C': return 'UP';   // New impulse cycle
        default: return 'NEUTRAL';
      }
    }
  }

  /**
   * Calculate wave completion probability
   */
  private calculateCompletionProbability(waves: WavePoint[], data: MarketData[]): number {
    if (waves.length < 3) return 0.3;

    // Check Fibonacci relationships
    let fibScore = 0;
    const fibRatios = [0.236, 0.382, 0.5, 0.618, 0.786, 1.0, 1.272, 1.618];

    for (let i = 2; i < waves.length; i++) {
      const wave1 = waves[i - 2];
      const wave2 = waves[i - 1];
      const wave3 = waves[i];

      const move1 = Math.abs(wave2.price - wave1.price);
      const move2 = Math.abs(wave3.price - wave2.price);
      
      if (move1 === 0) continue;
      
      const ratio = move2 / move1;
      
      // Check if ratio is close to any Fibonacci ratio
      for (const fib of fibRatios) {
        if (Math.abs(ratio - fib) < 0.05) {
          fibScore += 0.15;
          break;
        }
      }
    }

    return Math.min(0.5 + fibScore, 0.95);
  }

  /**
   * Calculate target price
   */
  private calculateTarget(waves: WavePoint[], data: MarketData[]): number | undefined {
    if (waves.length < 2) return undefined;

    const lastWave = waves[waves.length - 1];
    const prevWave = waves[waves.length - 2];
    const move = Math.abs(lastWave.price - prevWave.price);

    // Use 1.618 Fibonacci extension
    if (lastWave.price > prevWave.price) {
      return lastWave.price + (move * 0.618);
    } else {
      return lastWave.price - (move * 0.618);
    }
  }

  /**
   * Calculate invalidation level
   */
  private calculateInvalidation(waves: WavePoint[]): number | undefined {
    if (waves.length < 2) return undefined;
    
    // Invalidation is typically the start of the current wave
    return waves[waves.length - 2].price;
  }
}
