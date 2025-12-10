/**
 * Provider Error Log
 * Tracks and logs errors from data providers
 */

interface ErrorRecord {
  timestamp: number;
  message: string;
  endpoint?: string;
  statusCode?: number;
  details?: any;
}

interface ErrorStats {
  totalErrors: number;
  recentErrors: ErrorRecord[];
  lastError?: {
    timestamp: string;
    message: string;
    endpoint?: string;
    statusCode?: number;
  };
}

export class ProviderErrorLog {
  private static instance: ProviderErrorLog;
  private errors: Map<string, ErrorRecord[]> = new Map();
  private readonly MAX_ERRORS = 50;

  private constructor() {}

  static getInstance(): ProviderErrorLog {
    if (!ProviderErrorLog.instance) {
      ProviderErrorLog.instance = new ProviderErrorLog();
    }
    return ProviderErrorLog.instance;
  }

  /**
   * Log an error for a provider
   * @param provider Provider name
   * @param errorOrMessage Error object or message string
   * @param endpoint Optional endpoint (when using string message)
   * @param statusCode Optional status code (when using string message)
   */
  logError(
    provider: string,
    errorOrMessage: string | { message: string; endpoint?: string; statusCode?: number; details?: any },
    endpoint?: string,
    statusCode?: number
  ): void {
    if (!this.errors.has(provider)) {
      this.errors.set(provider, []);
    }

    const errors = this.errors.get(provider)!;
    
    // Handle both object and string-based signatures
    const errorRecord: ErrorRecord = typeof errorOrMessage === 'string'
      ? { timestamp: Date.now(), message: errorOrMessage, endpoint, statusCode }
      : { timestamp: Date.now(), ...errorOrMessage };

    errors.push(errorRecord);

    // Keep only the last MAX_ERRORS
    if (errors.length > this.MAX_ERRORS) {
      errors.shift();
    }
  }

  /**
   * Get error statistics for a provider
   */
  getStats(provider: string): ErrorStats {
    const errors = this.errors.get(provider) || [];
    const lastError = errors.length > 0 ? errors[errors.length - 1] : undefined;

    return {
      totalErrors: errors.length,
      recentErrors: errors.slice(-10), // Last 10 errors
      lastError: lastError ? {
        timestamp: new Date(lastError.timestamp).toISOString(),
        message: lastError.message,
        endpoint: lastError.endpoint,
        statusCode: lastError.statusCode,
      } : undefined,
    };
  }

  /**
   * Get all tracked providers
   */
  getProviders(): string[] {
    return Array.from(this.errors.keys());
  }

  /**
   * Clear errors for a provider
   */
  clear(provider: string): void {
    this.errors.delete(provider);
  }

  /**
   * Clear all errors
   */
  clearAll(): void {
    this.errors.clear();
  }

  /**
   * Get all errors for a provider
   */
  getErrors(provider: string): ErrorRecord[] {
    return this.errors.get(provider) || [];
  }
}
