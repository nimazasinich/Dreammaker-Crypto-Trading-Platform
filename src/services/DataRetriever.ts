/**
 * DataRetriever Service
 *
 * Implements HTTP-first data retrieval with automatic WebSocket fallback.
 * Always prefers HTTP requests for reliability and performance, only falling
 * back to WebSocket when HTTP requests fail or are unavailable.
 *
 * Features:
 * - HTTP-first approach with fetch API
 * - Automatic WebSocket fallback on HTTP failure
 * - Bearer token authentication
 * - Promise-based API for consistent async handling
 * - Configurable endpoints and methods
 * - Uses native browser WebSocket (no 'ws' package needed)
 */
export class DataRetriever {
  private apiBase: string;
  private apiToken: string | undefined;
  private wsBase: string;
  private connectionTimeout: number;
  private requestTimeout: number;

  constructor(config?: {
    apiBase?: string;
    apiToken?: string;
    connectionTimeout?: number;
    requestTimeout?: number;
  }) {
    // Use environment variables with fallbacks
    this.apiBase = config?.apiBase ||
                   process.env.HF_API_URL ||
                   process.env.VITE_HF_API_URL ||
                   'https://really-amin-datasourceforcryptocurrency-2.hf.space';

    this.apiToken = config?.apiToken ||
                    process.env.HF_API_TOKEN ||
                    process.env.VITE_HF_API_TOKEN ||
                    process.env.HF_API_TOKEN || process.env.VITE_HF_API_TOKEN || ''; // Must be set via environment variable

    // Convert HTTP(S) URL to WebSocket URL
    this.wsBase = this.apiBase.replace(/^http/, 'ws');

    // Timeouts
    this.connectionTimeout = config?.connectionTimeout || 10000; // 10 seconds
    this.requestTimeout = config?.requestTimeout || 30000; // 30 seconds
  }

  /**
   * Unified function to check HTTP availability and fallback to WebSocket
   *
   * @param endpoint - API endpoint path (e.g., '/api/market?limit=100')
   * @param method - HTTP method (GET, POST, PUT, DELETE)
   * @param payload - Request payload for POST/PUT requests
   * @returns Promise resolving to the data response
   */
  async getDataWithFallback<T = any>(
    endpoint: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
    payload: any = null
  ): Promise<T> {
    try {
      // First, try the direct HTTP request
      console.log(`[DataRetriever] Attempting HTTP ${method} request to: ${endpoint}`);
      const data = await this.makeApiRequest<T>(endpoint, method, payload);
      console.log(`[DataRetriever] HTTP request successful for: ${endpoint}`);
      return data;
    } catch (error) {
      console.warn(`[DataRetriever] HTTP request failed for ${endpoint}, trying WebSocket fallback:`, error);

      // If HTTP fails, fall back to WebSocket
      return await this.getDataViaWebSocket<T>(endpoint, payload);
    }
  }

  /**
   * Makes a direct HTTP API request using fetch
   *
   * @param endpoint - API endpoint path
   * @param method - HTTP method
   * @param payload - Request payload for POST/PUT requests
   * @returns Promise resolving to parsed JSON response
   * @throws Error if request fails or times out
   */
  private async makeApiRequest<T = any>(
    endpoint: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
    payload: any = null
  ): Promise<T> {
    // Create AbortController for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.requestTimeout);

    try {
      const url = `${this.apiBase}${endpoint}`;
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      };

      // Add authorization header if token is available
      if (this.apiToken) {
        headers['Authorization'] = `Bearer ${this.apiToken}`;
      }

      const response = await fetch(url, {
        method,
        headers,
        body: payload ? JSON.stringify(payload) : null,
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}, statusText: ${response.statusText}`);
      }

      const data = await response.json();
      return data as T;
    } catch (error: any) {
      if (error.name === 'AbortError') {
        throw new Error(`Request timeout after ${this.requestTimeout}ms`);
      }
      throw error;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  /**
   * Retrieves data via WebSocket connection (fallback method)
   *
   * @param endpoint - API endpoint to subscribe to
   * @param payload - Optional payload to send with subscription
   * @returns Promise resolving to WebSocket response data
   * @throws Error if WebSocket connection fails or times out
   */
  private async getDataViaWebSocket<T = any>(
    endpoint: string,
    payload: any = null
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      let isResolved = false;
      let ws: WebSocket | null = null;

      // Connection timeout
      const connectionTimeoutId = setTimeout(() => {
        if (!isResolved) {
          isResolved = true;
          if (ws) {
            ws.close();
          }
          reject(new Error(`WebSocket connection timeout after ${this.connectionTimeout}ms`));
        }
      }, this.connectionTimeout);

      // Data receive timeout
      let dataTimeoutId: ReturnType<typeof setTimeout>;

      try {
        const wsUrl = `${this.wsBase}/ws`;
        console.log(`[DataRetriever] Connecting to WebSocket: ${wsUrl}`);

        // Use native browser WebSocket (not 'ws' package)
        ws = new WebSocket(wsUrl);

        // Browser WebSocket uses addEventListener, not .on()
        ws.addEventListener('open', () => {
          console.log('[DataRetriever] WebSocket connected successfully');
          clearTimeout(connectionTimeoutId);

          // Start data timeout
          dataTimeoutId = setTimeout(() => {
            if (!isResolved) {
              isResolved = true;
              ws?.close();
              reject(new Error(`WebSocket data timeout after ${this.requestTimeout}ms`));
            }
          }, this.requestTimeout);

          // Subscribe to the relevant service
          const subscriptionMessage = {
            action: 'subscribe',
            service: endpoint,
            ...(payload && { data: payload }),
          };

          ws?.send(JSON.stringify(subscriptionMessage));
        });

        ws.addEventListener('message', (event: MessageEvent) => {
          if (isResolved) return;

          try {
            const parsedData = JSON.parse(event.data);
            console.log('[DataRetriever] WebSocket data received:', parsedData);

            clearTimeout(dataTimeoutId);
            isResolved = true;

            resolve(parsedData as T);
            ws?.close();
          } catch (parseError) {
            console.error('[DataRetriever] Failed to parse WebSocket message:', parseError);
          }
        });

        ws.addEventListener('error', (event: Event) => {
          if (!isResolved) {
            console.error('[DataRetriever] WebSocket error:', event);
            clearTimeout(connectionTimeoutId);
            clearTimeout(dataTimeoutId);
            isResolved = true;
            reject(new Error('WebSocket connection error'));
          }
        });

        ws.addEventListener('close', () => {
          if (!isResolved) {
            clearTimeout(connectionTimeoutId);
            clearTimeout(dataTimeoutId);
            isResolved = true;
            reject(new Error('WebSocket closed before receiving data'));
          }
        });
      } catch (error) {
        clearTimeout(connectionTimeoutId);
        if (dataTimeoutId!) {
          clearTimeout(dataTimeoutId);
        }
        if (!isResolved) {
          isResolved = true;
          reject(error);
        }
      }
    });
  }

  /**
   * Example method: Fetch market data
   *
   * @param limit - Number of top coins to fetch
   * @returns Promise resolving to market data array
   */
  async getMarketData(limit: number = 100): Promise<any> {
    return await this.getDataWithFallback(`/api/market?limit=${limit}`);
  }

  /**
   * Example method: Fetch price chart data
   *
   * @param symbol - Cryptocurrency symbol
   * @param timeframe - Timeframe (e.g., '1h', '4h', '1d')
   * @param limit - Number of data points
   * @returns Promise resolving to chart data
   */
  async getPriceChart(symbol: string, timeframe: string = '1h', limit: number = 100): Promise<any> {
    return await this.getDataWithFallback(
      `/api/market/history?symbol=${symbol}&timeframe=${timeframe}&limit=${limit}`
    );
  }

  /**
   * Example method: Fetch market statistics
   *
   * @returns Promise resolving to market stats
   */
  async getMarketStats(): Promise<any> {
    return await this.getDataWithFallback('/api/stats');
  }

  /**
   * Example method: Fetch latest news
   *
   * @param limit - Number of news items to fetch
   * @returns Promise resolving to news array
   */
  async getLatestNews(limit: number = 10): Promise<any> {
    return await this.getDataWithFallback(`/api/news/latest?limit=${limit}`);
  }

  /**
   * Example method: Fetch market sentiment
   *
   * @returns Promise resolving to sentiment data
   */
  async getMarketSentiment(): Promise<any> {
    return await this.getDataWithFallback('/api/sentiment');
  }

  /**
   * Example method: Get AI prediction
   *
   * @param payload - Prediction request payload
   * @returns Promise resolving to prediction data
   */
  async getAIPrediction(payload: any): Promise<any> {
    return await this.getDataWithFallback('/api/ai/predict', 'POST', payload);
  }

  /**
   * Update configuration at runtime
   *
   * @param config - Partial configuration to update
   */
  updateConfig(config: {
    apiBase?: string;
    apiToken?: string;
    connectionTimeout?: number;
    requestTimeout?: number;
  }): void {
    if (config.apiBase) {
      this.apiBase = config.apiBase;
      this.wsBase = this.apiBase.replace(/^http/, 'ws');
    }
    if (config.apiToken !== undefined) {
      this.apiToken = config.apiToken;
    }
    if (config.connectionTimeout) {
      this.connectionTimeout = config.connectionTimeout;
    }
    if (config.requestTimeout) {
      this.requestTimeout = config.requestTimeout;
    }
  }

  /**
   * Get current configuration
   *
   * @returns Current configuration object
   */
  getConfig(): {
    apiBase: string;
    wsBase: string;
    hasToken: boolean;
    connectionTimeout: number;
    requestTimeout: number;
  } {
    return {
      apiBase: this.apiBase,
      wsBase: this.wsBase,
      hasToken: !!this.apiToken,
      connectionTimeout: this.connectionTimeout,
      requestTimeout: this.requestTimeout,
    };
  }

  // ============================================================================
  // COMPREHENSIVE DATA VALIDATION & HEALTH CHECKS
  // ============================================================================

  /**
   * Validate market data structure
   *
   * @param data - Data to validate
   * @returns True if valid, false otherwise
   */
  private validateMarketData(data: any): boolean {
    if (!data) return false;

    // Handle both direct array and wrapped response
    const items = Array.isArray(data) ? data : data.items || data.data;

    if (!Array.isArray(items) || items.length === 0) {
      console.warn('[DataRetriever] Invalid market data: not an array or empty');
      return false;
    }

    // Validate first item has required fields
    const firstItem = items[0];
    const hasRequiredFields = firstItem.symbol && typeof firstItem.price === 'number';

    if (!hasRequiredFields) {
      console.warn('[DataRetriever] Invalid market data: missing required fields (symbol, price)');
      return false;
    }

    return true;
  }

  /**
   * Validate OHLCV chart data structure
   *
   * @param data - Data to validate
   * @returns True if valid, false otherwise
   */
  private validateChartData(data: any): boolean {
    if (!Array.isArray(data) || data.length === 0) {
      console.warn('[DataRetriever] Invalid chart data: not an array or empty');
      return false;
    }

    // Validate first item has OHLCV fields
    const firstItem = data[0];
    const hasOHLCV = firstItem.open !== undefined &&
                     firstItem.high !== undefined &&
                     firstItem.low !== undefined &&
                     firstItem.close !== undefined &&
                     firstItem.volume !== undefined;

    if (!hasOHLCV) {
      console.warn('[DataRetriever] Invalid chart data: missing OHLCV fields');
      return false;
    }

    return true;
  }

  /**
   * Validate news data structure
   *
   * @param data - Data to validate
   * @returns True if valid, false otherwise
   */
  private validateNewsData(data: any): boolean {
    if (!data) return false;

    // Handle both direct array and wrapped response
    const items = Array.isArray(data) ? data : data.news || data.items || data.data;

    if (!Array.isArray(items) || items.length === 0) {
      console.warn('[DataRetriever] Invalid news data: not an array or empty');
      return false;
    }

    // Validate first item has required fields
    const firstItem = items[0];
    const hasRequiredFields = firstItem.title && firstItem.url;

    if (!hasRequiredFields) {
      console.warn('[DataRetriever] Invalid news data: missing required fields (title, url)');
      return false;
    }

    return true;
  }

  /**
   * Validate sentiment data structure
   *
   * @param data - Data to validate
   * @returns True if valid, false otherwise
   */
  private validateSentimentData(data: any): boolean {
    if (!data || typeof data !== 'object') {
      console.warn('[DataRetriever] Invalid sentiment data: not an object');
      return false;
    }

    // Check for common sentiment fields
    const hasValidFields = typeof data.fearGreedIndex === 'number' ||
                          typeof data.sentiment === 'string' ||
                          typeof data.score === 'number';

    if (!hasValidFields) {
      console.warn('[DataRetriever] Invalid sentiment data: missing sentiment fields');
      return false;
    }

    return true;
  }

  /**
   * Validate market stats data structure
   *
   * @param data - Data to validate
   * @returns True if valid, false otherwise
   */
  private validateMarketStats(data: any): boolean {
    if (!data || typeof data !== 'object') {
      console.warn('[DataRetriever] Invalid market stats: not an object');
      return false;
    }

    // Check for common market stats fields
    const hasValidFields = data.totalMarketCap !== undefined ||
                          data.totalVolume24h !== undefined ||
                          data.btcDominance !== undefined;

    if (!hasValidFields) {
      console.warn('[DataRetriever] Invalid market stats: missing stats fields');
      return false;
    }

    return true;
  }

  /**
   * Validate AI prediction data structure
   *
   * @param data - Data to validate
   * @returns True if valid, false otherwise
   */
  private validateAIPrediction(data: any): boolean {
    if (!data || typeof data !== 'object') {
      console.warn('[DataRetriever] Invalid AI prediction: not an object');
      return false;
    }

    // Check for prediction fields
    const hasValidFields = data.action !== undefined ||
                          data.prediction !== undefined ||
                          data.confidence !== undefined;

    if (!hasValidFields) {
      console.warn('[DataRetriever] Invalid AI prediction: missing prediction fields');
      return false;
    }

    return true;
  }

  /**
   * Check health of a single data endpoint
   *
   * @param endpoint - Endpoint to check
   * @param validator - Validation function
   * @param name - Human-readable name for logging
   * @returns Health check result
   */
  private async checkEndpointHealth(
    endpoint: string,
    validator: (data: any) => boolean,
    name: string
  ): Promise<{ endpoint: string; name: string; status: 'healthy' | 'unhealthy'; error?: string; method: 'http' | 'websocket' | 'failed' }> {
    try {
      const data = await this.getDataWithFallback(endpoint);
      const isValid = validator(data);

      if (!isValid) {
        return {
          endpoint,
          name,
          status: 'unhealthy',
          error: 'Invalid data format',
          method: 'failed'
        };
      }

      return {
        endpoint,
        name,
        status: 'healthy',
        method: 'http' // Simplified - would need to track which method succeeded
      };
    } catch (error: any) {
      return {
        endpoint,
        name,
        status: 'unhealthy',
        error: error.message,
        method: 'failed'
      };
    }
  }

  /**
   * Comprehensive health check for all data sources
   *
   * Checks all critical data endpoints to ensure they're accessible
   * and returning valid data via HTTP or WebSocket fallback.
   *
   * @returns Health check results for all endpoints
   */
  async healthCheckAllDataSources(): Promise<{
    overall: 'healthy' | 'degraded' | 'unhealthy';
    timestamp: number;
    results: Array<{
      endpoint: string;
      name: string;
      status: 'healthy' | 'unhealthy';
      error?: string;
      method: 'http' | 'websocket' | 'failed';
    }>;
  }> {
    console.log('[DataRetriever] Starting comprehensive health check for all data sources...');

    const checks = [
      { endpoint: '/api/market?limit=10', validator: this.validateMarketData.bind(this), name: 'Market Data' },
      { endpoint: '/api/market/history?symbol=BTC&timeframe=1h&limit=10', validator: this.validateChartData.bind(this), name: 'Price Charts (OHLCV)' },
      { endpoint: '/api/news/latest?limit=5', validator: this.validateNewsData.bind(this), name: 'News' },
      { endpoint: '/api/sentiment', validator: this.validateSentimentData.bind(this), name: 'Sentiment' },
      { endpoint: '/api/stats', validator: this.validateMarketStats.bind(this), name: 'Market Stats' },
    ];

    const results = await Promise.all(
      checks.map(({ endpoint, validator, name }) =>
        this.checkEndpointHealth(endpoint, validator, name)
      )
    );

    // Determine overall health
    const healthyCount = results.filter(r => r.status === 'healthy').length;
    const totalCount = results.length;

    let overall: 'healthy' | 'degraded' | 'unhealthy';
    if (healthyCount === totalCount) {
      overall = 'healthy';
    } else if (healthyCount >= totalCount / 2) {
      overall = 'degraded';
    } else {
      overall = 'unhealthy';
    }

    console.log(`[DataRetriever] Health check complete: ${overall} (${healthyCount}/${totalCount} healthy)`);

    return {
      overall,
      timestamp: Date.now(),
      results,
    };
  }

  /**
   * Check and fetch all required data sources
   *
   * This method systematically fetches all critical data needed by the application:
   * - Market Data (top coins with prices)
   * - Price Charts (OHLCV data)
   * - Latest News
   * - Market Sentiment
   * - Market Statistics
   * - AI Predictions (optional)
   *
   * Uses Promise.all for parallel fetching and includes validation for each data type.
   *
   * @param options - Configuration for data fetching
   * @returns Object containing all fetched data with validation results
   */
  async checkAndFetchAllData(options?: {
    marketDataLimit?: number;
    chartSymbol?: string;
    chartTimeframe?: string;
    chartLimit?: number;
    newsLimit?: number;
    includeAIPrediction?: boolean;
    aiPredictionSymbol?: string;
  }): Promise<{
    success: boolean;
    timestamp: number;
    data: {
      marketData: { data: any; valid: boolean; error?: string };
      priceChart: { data: any; valid: boolean; error?: string };
      news: { data: any; valid: boolean; error?: string };
      sentiment: { data: any; valid: boolean; error?: string };
      marketStats: { data: any; valid: boolean; error?: string };
      aiPrediction?: { data: any; valid: boolean; error?: string };
    };
    summary: {
      total: number;
      successful: number;
      failed: number;
      validationPassed: number;
      validationFailed: number;
    };
  }> {
    console.log('[DataRetriever] Starting comprehensive data fetch for all sources...');

    const {
      marketDataLimit = 100,
      chartSymbol = 'BTC',
      chartTimeframe = '1h',
      chartLimit = 100,
      newsLimit = 10,
      includeAIPrediction = false,
      aiPredictionSymbol = 'BTC',
    } = options || {};

    // Define all data requests
    const dataRequests = [
      {
        name: 'marketData',
        fetch: () => this.getMarketData(marketDataLimit),
        validate: (data: any) => this.validateMarketData(data),
      },
      {
        name: 'priceChart',
        fetch: () => this.getPriceChart(chartSymbol, chartTimeframe, chartLimit),
        validate: (data: any) => this.validateChartData(data),
      },
      {
        name: 'news',
        fetch: () => this.getLatestNews(newsLimit),
        validate: (data: any) => this.validateNewsData(data),
      },
      {
        name: 'sentiment',
        fetch: () => this.getMarketSentiment(),
        validate: (data: any) => this.validateSentimentData(data),
      },
      {
        name: 'marketStats',
        fetch: () => this.getMarketStats(),
        validate: (data: any) => this.validateMarketStats(data),
      },
    ];

    // Add AI prediction if requested
    if (includeAIPrediction) {
      dataRequests.push({
        name: 'aiPrediction',
        fetch: () => this.getAIPrediction({ symbol: aiPredictionSymbol, timeframe: chartTimeframe }),
        validate: (data: any) => this.validateAIPrediction(data),
      });
    }

    // Fetch all data in parallel
    const results = await Promise.allSettled(
      dataRequests.map(async ({ name, fetch, validate }) => {
        try {
          const data = await fetch();
          const valid = validate(data);
          return { name, data, valid, error: valid ? undefined : 'Validation failed' };
        } catch (error: any) {
          return { name, data: null, valid: false, error: error.message };
        }
      })
    );

    // Process results
    const data: any = {};
    let successful = 0;
    let failed = 0;
    let validationPassed = 0;
    let validationFailed = 0;

    results.forEach((result, index) => {
      const { name } = dataRequests[index];

      if (result.status === 'fulfilled') {
        const { data: fetchedData, valid, error } = result.value;
        data[name] = { data: fetchedData, valid, error };

        if (fetchedData !== null) successful++;
        else failed++;

        if (valid) validationPassed++;
        else validationFailed++;
      } else {
        data[name] = { data: null, valid: false, error: result.reason?.message || 'Unknown error' };
        failed++;
        validationFailed++;
      }
    });

    const summary = {
      total: dataRequests.length,
      successful,
      failed,
      validationPassed,
      validationFailed,
    };

    const success = successful >= dataRequests.length / 2; // Success if at least half succeeded

    console.log(`[DataRetriever] Data fetch complete: ${successful}/${dataRequests.length} successful, ${validationPassed}/${dataRequests.length} validated`);

    return {
      success,
      timestamp: Date.now(),
      data,
      summary,
    };
  }

  /**
   * Quick availability check for the data source
   *
   * @returns True if at least one endpoint is accessible
   */
  async isAvailable(): Promise<boolean> {
    try {
      // Try to fetch market stats as a quick health check
      const stats = await this.getMarketStats();
      return this.validateMarketStats(stats);
    } catch {
      return false;
    }
  }
}

// Export singleton instance
export const dataRetriever = new DataRetriever();

// Export default for convenient importing
export default DataRetriever;
