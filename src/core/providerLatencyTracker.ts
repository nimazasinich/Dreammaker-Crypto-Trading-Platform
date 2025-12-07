/**
 * Provider Latency Tracker
 * Tracks latency statistics for various data providers
 */

interface LatencyStats {
  avg: number;
  min: number;
  max: number;
  last: number;
  count: number;
}

export class ProviderLatencyTracker {
  private static instance: ProviderLatencyTracker;
  private latencies: Map<string, number[]> = new Map();
  private readonly MAX_SAMPLES = 100;

  private constructor() {}

  static getInstance(): ProviderLatencyTracker {
    if (!ProviderLatencyTracker.instance) {
      ProviderLatencyTracker.instance = new ProviderLatencyTracker();
    }
    return ProviderLatencyTracker.instance;
  }

  /**
   * Record latency for a provider
   */
  recordLatency(provider: string, latency: number): void {
    if (!this.latencies.has(provider)) {
      this.latencies.set(provider, []);
    }

    const samples = this.latencies.get(provider)!;
    samples.push(latency);

    // Keep only the last MAX_SAMPLES
    if (samples.length > this.MAX_SAMPLES) {
      samples.shift();
    }
  }

  /**
   * Get latency statistics for a provider
   */
  getStats(provider: string): LatencyStats {
    const samples = this.latencies.get(provider) || [];

    if (samples.length === 0) {
      return { avg: 0, min: 0, max: 0, last: 0, count: 0 };
    }

    const sum = samples.reduce((a, b) => a + b, 0);
    const avg = sum / samples.length;
    const min = Math.min(...samples);
    const max = Math.max(...samples);
    const last = samples[samples.length - 1];

    return { avg, min, max, last, count: samples.length };
  }

  /**
   * Get all tracked providers
   */
  getProviders(): string[] {
    return Array.from(this.latencies.keys());
  }

  /**
   * Clear stats for a provider
   */
  clear(provider: string): void {
    this.latencies.delete(provider);
  }

  /**
   * Clear all stats
   */
  clearAll(): void {
    this.latencies.clear();
  }
}
