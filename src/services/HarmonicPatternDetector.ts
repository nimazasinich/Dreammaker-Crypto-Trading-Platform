/**
 * HarmonicPatternDetector Service
 * Detects harmonic patterns (Gartley, Butterfly, Bat, Crab, etc.)
 */

import { MarketData } from '../types/index.js';

export interface HarmonicPattern {
  type: 'GARTLEY' | 'BUTTERFLY' | 'BAT' | 'CRAB' | 'SHARK' | 'CYPHER';
  direction: 'BULLISH' | 'BEARISH';
  points: {
    X: { price: number; timestamp: number };
    A: { price: number; timestamp: number };
    B: { price: number; timestamp: number };
    C: { price: number; timestamp: number };
    D: { price: number; timestamp: number };
  };
  prz: { // Potential Reversal Zone
    upper: number;
    lower: number;
  };
  reliabilityScore: number;
  confidence?: number;
  targetLevels: number[];
  stopLoss: number;
}

// Fibonacci ratios for each pattern
const PATTERN_RATIOS = {
  GARTLEY: { XB: [0.618], AC: [0.382, 0.886], BD: [1.272, 1.618], XD: [0.786] },
  BUTTERFLY: { XB: [0.786], AC: [0.382, 0.886], BD: [1.618, 2.618], XD: [1.272, 1.618] },
  BAT: { XB: [0.382, 0.5], AC: [0.382, 0.886], BD: [1.618, 2.618], XD: [0.886] },
  CRAB: { XB: [0.382, 0.618], AC: [0.382, 0.886], BD: [2.618, 3.618], XD: [1.618] },
  SHARK: { XB: [0.446, 0.618], AC: [1.13, 1.618], BD: [1.618, 2.24], XD: [0.886, 1.13] },
  CYPHER: { XB: [0.382, 0.618], AC: [1.272, 1.414], BD: [1.272, 2.0], XD: [0.786] }
};

export class HarmonicPatternDetector {
  private static instance: HarmonicPatternDetector;

  private constructor() {}

  static getInstance(): HarmonicPatternDetector {
    if (!HarmonicPatternDetector.instance) {
      HarmonicPatternDetector.instance = new HarmonicPatternDetector();
    }
    return HarmonicPatternDetector.instance;
  }

  /**
   * Detect harmonic patterns in price data
   */
  detectHarmonicPatterns(data: MarketData[]): HarmonicPattern[] {
    if (data.length < 50) return [];

    const pivots = this.findPivots(data);
    if (pivots.length < 5) return [];

    const patterns: HarmonicPattern[] = [];

    // Try to find patterns using last pivots
    for (let i = 0; i <= pivots.length - 5; i++) {
      const points = pivots.slice(i, i + 5);
      
      for (const patternType of Object.keys(PATTERN_RATIOS) as Array<keyof typeof PATTERN_RATIOS>) {
        const pattern = this.checkPattern(points, patternType);
        if (pattern) {
          patterns.push(pattern);
        }
      }
    }

    // Sort by reliability and return top patterns
    return patterns.sort((a, b) => b.reliabilityScore - a.reliabilityScore).slice(0, 3);
  }


  /**
   * Find pivot points
   */
  private findPivots(data: MarketData[]): Array<{ price: number; timestamp: number; type: 'HIGH' | 'LOW' }> {
    const pivots: Array<{ price: number; timestamp: number; type: 'HIGH' | 'LOW' }> = [];
    const window = 3;

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
      } else if (isLow) {
        pivots.push({ price: center.low, timestamp: ts, type: 'LOW' });
      }
    }

    return pivots;
  }

  /**
   * Check if points form a specific pattern
   */
  private checkPattern(
    points: Array<{ price: number; timestamp: number; type: 'HIGH' | 'LOW' }>,
    patternType: keyof typeof PATTERN_RATIOS
  ): HarmonicPattern | null {
    if (points.length < 5) return null;

    const [X, A, B, C, D] = points;
    const ratios = PATTERN_RATIOS[patternType];

    // Calculate actual ratios
    const XA = Math.abs(A.price - X.price);
    const AB = Math.abs(B.price - A.price);
    const BC = Math.abs(C.price - B.price);
    const CD = Math.abs(D.price - C.price);
    const XD = Math.abs(D.price - X.price);

    if (XA === 0) return null;

    const actualXB = AB / XA;
    const actualAC = BC / AB;
    const actualBD = CD / BC;
    const actualXD = XD / XA;

    // Check if ratios match pattern
    const tolerance = 0.1;
    let matchScore = 0;

    if (this.isInRange(actualXB, ratios.XB, tolerance)) matchScore += 0.25;
    if (this.isInRange(actualAC, ratios.AC, tolerance)) matchScore += 0.25;
    if (this.isInRange(actualBD, ratios.BD, tolerance)) matchScore += 0.25;
    if (this.isInRange(actualXD, ratios.XD, tolerance)) matchScore += 0.25;

    if (matchScore < 0.5) return null;

    // Determine direction
    const direction: 'BULLISH' | 'BEARISH' = D.type === 'LOW' ? 'BULLISH' : 'BEARISH';

    // Calculate PRZ
    const przRange = XA * 0.02; // 2% of XA move
    const prz = {
      upper: D.price + przRange,
      lower: D.price - przRange
    };

    // Calculate targets
    const targetLevels = [
      D.price + (direction === 'BULLISH' ? 1 : -1) * CD * 0.382,
      D.price + (direction === 'BULLISH' ? 1 : -1) * CD * 0.618,
      D.price + (direction === 'BULLISH' ? 1 : -1) * CD * 1.0
    ];

    // Calculate stop loss
    const stopLoss = direction === 'BULLISH' 
      ? D.price - (przRange * 2)
      : D.price + (przRange * 2);

    return {
      type: patternType,
      direction,
      points: {
        X: { price: X.price, timestamp: X.timestamp },
        A: { price: A.price, timestamp: A.timestamp },
        B: { price: B.price, timestamp: B.timestamp },
        C: { price: C.price, timestamp: C.timestamp },
        D: { price: D.price, timestamp: D.timestamp }
      },
      prz,
      reliabilityScore: matchScore,
      targetLevels,
      stopLoss
    };
  }

  /**
   * Check if value is within range of any target ratio
   */
  private isInRange(value: number, targets: number[], tolerance: number): boolean {
    return targets.some(target => Math.abs(value - target) <= tolerance);
  }
}
