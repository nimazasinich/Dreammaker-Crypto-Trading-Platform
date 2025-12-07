/**
 * BackgroundSignalService
 * Manages SignalAgent execution in the background
 * Automatically starts when app loads and runs continuously
 */

import { Logger } from '../core/Logger.js';
import { SignalAgent } from './SignalAgent.js';
import { ExtremePoint } from './ExtremePointsDetector.js';
import { MarketData } from '../types/index.js';

export interface BackgroundServiceConfig {
  autoStart: boolean;
  symbols: string[];
  checkIntervalMs: number;
  minConfidence: number;
  minVolumeUSD: number;
  notifyOnSignal: boolean;
}

const DEFAULT_CONFIG: BackgroundServiceConfig = {
  autoStart: true,
  symbols: ['BTCUSDT', 'ETHUSDT', 'SOLUSDT', 'ADAUSDT', 'MATICUSDT'],
  checkIntervalMs: 60000, // 1 minute
  minConfidence: 60,
  minVolumeUSD: 2_000_000,
  notifyOnSignal: true,
};

class BackgroundSignalService {
  private static instance: BackgroundSignalService;
  private logger = Logger.getInstance();
  private agent = SignalAgent.getInstance();
  private config: BackgroundServiceConfig = DEFAULT_CONFIG;
  private isInitialized = false;
  private signalCallbacks: Array<(signal: ExtremePoint) => void> = [];

  private constructor() {}

  static getInstance(): BackgroundSignalService {
    if (!BackgroundSignalService.instance) {
      BackgroundSignalService.instance = new BackgroundSignalService();
    }
    return BackgroundSignalService.instance;
  }

  /**
   * Initialize the background service
   */
  async initialize(config?: Partial<BackgroundServiceConfig>): Promise<void> {
    if (this.isInitialized) {
      this.logger.warn('BackgroundSignalService already initialized');
      return;
    }

    this.config = { ...DEFAULT_CONFIG, ...config };
    this.logger.info('Initializing BackgroundSignalService', { config: this.config });

    // Configure the agent
    this.agent.configure({
      enabled: false,
      symbols: this.config.symbols,
      checkIntervalMs: this.config.checkIntervalMs,
      minConfidence: this.config.minConfidence,
      minVolumeUSD: this.config.minVolumeUSD,
    });

    // Set up market data fetcher
    this.agent.setMarketDataFetcher(this.createMarketDataFetcher());

    // Subscribe to signals
    this.agent.subscribe((signal) => {
      this.handleNewSignal(signal);
    });

    this.isInitialized = true;

    // Auto-start if configured
    if (this.config.autoStart) {
      this.start();
    }
  }

  /**
   * Start the background signal detection
   */
  start(): void {
    if (!this.isInitialized) {
      this.logger.error('BackgroundSignalService not initialized');
      return;
    }
    this.agent.start();
    this.logger.info('BackgroundSignalService started');
  }

  /**
   * Stop the background signal detection
   */
  stop(): void {
    this.agent.stop();
    this.logger.info('BackgroundSignalService stopped');
  }

  /**
   * Subscribe to new signals
   */
  onSignal(callback: (signal: ExtremePoint) => void): () => void {
    this.signalCallbacks.push(callback);
    return () => {
      const index = this.signalCallbacks.indexOf(callback);
      if (index > -1) this.signalCallbacks.splice(index, 1);
    };
  }

  /**
   * Get current status
   */
  getStatus() {
    return {
      isInitialized: this.isInitialized,
      agentStatus: this.agent.getStatus(),
      config: this.config,
    };
  }

  /**
   * Get active signals
   */
  getActiveSignals(): ExtremePoint[] {
    return this.agent.getActiveSignals();
  }

  /**
   * Handle new signal
   */
  private handleNewSignal(signal: ExtremePoint): void {
    this.logger.info('New signal detected', {
      symbol: signal.symbol,
      type: signal.signalType,
      confidence: signal.confidence,
    });

    // Notify all callbacks
    for (const callback of this.signalCallbacks) {
      try {
        callback(signal);
      } catch (error) {
        this.logger.error('Error in signal callback', {}, error as Error);
      }
    }

    // Browser notification if enabled
    if (this.config.notifyOnSignal && 'Notification' in window) {
      this.showNotification(signal);
    }
  }

  /**
   * Show browser notification
   */
  private async showNotification(signal: ExtremePoint): Promise<void> {
    if (Notification.permission === 'granted') {
      new Notification(`${signal.signalType} Signal: ${signal.symbol}`, {
        body: `Confidence: ${signal.confidence}% | Price: $${signal.price.toFixed(2)}`,
        icon: signal.signalType === 'BUY' ? '📈' : '📉',
        tag: signal.id,
      });
    } else if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        this.showNotification(signal);
      }
    }
  }

  /**
   * Create market data fetcher
   */
  private createMarketDataFetcher() {
    return async (symbol: string): Promise<{
      data: MarketData[];
      currentPrice: number;
      volume24hUSD: number;
    } | null> => {
      try {
        // Try to fetch real data from API
        const response = await fetch(`/api/market/${symbol}/ohlcv?interval=1h&limit=100`);
        
        if (response.ok) {
          const result = await response.json();
          return {
            data: result.data,
            currentPrice: result.currentPrice,
            volume24hUSD: result.volume24hUSD,
          };
        }
      } catch (error) {
        this.logger.debug('API fetch failed, using mock data', { symbol });
      }

      // Fallback to mock data
      return this.generateMockData(symbol);
    };
  }

  /**
   * Generate mock market data for testing
   */
  private generateMockData(symbol: string): {
    data: MarketData[];
    currentPrice: number;
    volume24hUSD: number;
  } {
    const now = Date.now();
    const data: MarketData[] = [];
    let price = symbol.includes('BTC') ? 43000 : symbol.includes('ETH') ? 2300 : 100;

    for (let i = 100; i >= 0; i--) {
      const volatility = price * 0.02;
      const change = (Math.random() - 0.5) * volatility;
      const open = price;
      const close = price + change;
      const high = Math.max(open, close) + Math.random() * volatility * 0.5;
      const low = Math.min(open, close) - Math.random() * volatility * 0.5;
      const volume = 1000000 + Math.random() * 5000000;

      data.push({
        timestamp: now - i * 3600000,
        open,
        high,
        low,
        close,
        volume,
      });

      price = close;
    }

    return {
      data,
      currentPrice: data[data.length - 1].close,
      volume24hUSD: 50000000 + Math.random() * 100000000,
    };
  }
}

export const backgroundSignalService = BackgroundSignalService.getInstance();
export default BackgroundSignalService;
