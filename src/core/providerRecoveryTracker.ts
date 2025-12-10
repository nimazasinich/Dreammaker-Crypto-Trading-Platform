/**
 * Provider Recovery Tracker
 * Tracks recovery and health status for data providers
 */

interface RecoveryStats {
  uptime: number;
  successRate: number;
  failureRate: number;
  isHealthy: boolean;
  consecutiveFailures: number;
  lastStatus: string;
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
}

interface ProviderRecord {
  startTime: number;
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  consecutiveFailures: number;
  lastStatus: 'success' | 'failure' | 'unknown';
  lastUpdate: number;
}

export class ProviderRecoveryTracker {
  private static instance: ProviderRecoveryTracker;
  private providers: Map<string, ProviderRecord> = new Map();
  private readonly FAILURE_THRESHOLD = 3;

  private constructor() {}

  static getInstance(): ProviderRecoveryTracker {
    if (!ProviderRecoveryTracker.instance) {
      ProviderRecoveryTracker.instance = new ProviderRecoveryTracker();
    }
    return ProviderRecoveryTracker.instance;
  }

  /**
   * Record a successful request
   */
  recordSuccess(provider: string): void {
    this.ensureProvider(provider);
    const record = this.providers.get(provider)!;

    record.totalRequests++;
    record.successfulRequests++;
    record.consecutiveFailures = 0;
    record.lastStatus = 'success';
    record.lastUpdate = Date.now();
  }

  /**
   * Record a failed request
   */
  recordFailure(provider: string): void {
    this.ensureProvider(provider);
    const record = this.providers.get(provider)!;

    record.totalRequests++;
    record.failedRequests++;
    record.consecutiveFailures++;
    record.lastStatus = 'failure';
    record.lastUpdate = Date.now();
  }

  /**
   * Get recovery statistics for a provider
   */
  getStats(provider: string): RecoveryStats {
    this.ensureProvider(provider);
    const record = this.providers.get(provider)!;

    const uptime = (Date.now() - record.startTime) / 1000; // seconds
    const successRate = record.totalRequests > 0
      ? (record.successfulRequests / record.totalRequests) * 100
      : 0;
    const failureRate = record.totalRequests > 0
      ? (record.failedRequests / record.totalRequests) * 100
      : 0;
    const isHealthy = record.consecutiveFailures < this.FAILURE_THRESHOLD;

    return {
      uptime,
      successRate,
      failureRate,
      isHealthy,
      consecutiveFailures: record.consecutiveFailures,
      lastStatus: record.lastStatus,
      totalRequests: record.totalRequests,
      successfulRequests: record.successfulRequests,
      failedRequests: record.failedRequests,
    };
  }

  /**
   * Get all tracked providers
   */
  getProviders(): string[] {
    return Array.from(this.providers.keys());
  }

  /**
   * Reset stats for a provider
   */
  reset(provider: string): void {
    this.providers.delete(provider);
  }

  /**
   * Clear stats for a provider (alias for reset)
   */
  clearStats(provider: string): void {
    this.reset(provider);
  }

  /**
   * Reset all stats
   */
  resetAll(): void {
    this.providers.clear();
  }

  /**
   * Ensure a provider record exists
   */
  private ensureProvider(provider: string): void {
    if (!this.providers.has(provider)) {
      this.providers.set(provider, {
        startTime: Date.now(),
        totalRequests: 0,
        successfulRequests: 0,
        failedRequests: 0,
        consecutiveFailures: 0,
        lastStatus: 'unknown',
        lastUpdate: Date.now(),
      });
    }
  }
}
