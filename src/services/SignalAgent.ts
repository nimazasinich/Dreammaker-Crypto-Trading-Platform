/**
 * SignalAgent Service
 * Automated agent that periodically checks cryptocurrencies for potential
 * reversal or breakout points and generates trading signals
 */

import { Logger } from '../core/Logger.js';
import { ExtremePointsDetector, ExtremePoint } from './ExtremePointsDetector.js';
import { MarketData } from '../types/index.js';

export interface AgentConfig {
  enabled: boolean;
  symbols: string[];
  checkIntervalMs: number;
  minConfidence: number;
  minVolumeUSD: number;
}

export interface AgentStatus {
  isRunning: boolean;
  lastCheck: number;
  checksPerformed: number;
  signalsGenerated: number;
  activeSignals: number;
  currentSymbol: string | null;
}

type MarketDataFetcher = (symbol: string) => Promise<{
  data: MarketData[];
  currentPrice: number;
  volume24hUSD: number;
} | null>;

export class SignalAgent {
  private static instance: SignalAgent;
  private logger = Logger.getInstance();
  private detector = ExtremePointsDetector.getInstance();
  
  private config: AgentConfig = {
    enabled: false,
    symbols: ['BTCUSDT', 'ETHUSDT', 'SOLUSDT', 'ADAUSDT', 'MATICUSDT'],
    checkIntervalMs: 60000, // 1 minute
    minConfidence: 60,
    minVolumeUSD: 2_000_000
  };

  private status: AgentStatus = {
    isRunning: false,
    lastCheck: 0,
    checksPerformed: 0,
    signalsGenerated: 0,
    activeSignals: 0,
    currentSymbol: null
  };

  private intervalId: NodeJS.Timeout | null = null;
  private marketDataFetcher: MarketDataFetcher | null = null;
  private subscribers: Array<(signal: ExtremePoint) => void> = [];

  private constructor() {
    // Subscribe to detector signals
    this.detector.subscribe((signal) => {
      this.status.signalsGenerated++;
      this.notifySubscribers(signal);
    });
  }

  static getInstance(): SignalAgent {
    if (!SignalAgent.instance) {
      SignalAgent.instance = new SignalAgent();
    }
    return SignalAgent.instance;
  }

  /**
   * Configure the agent
   */
  configure(config: Partial<AgentConfig>): void {
    this.config = { ...this.config, ...config };
    this.logger.info('Signal agent configured', { config: this.config });
  }

  /**
   * Set the market data fetcher function
   */
  setMarketDataFetcher(fetcher: MarketDataFetcher): void {
    this.marketDataFetcher = fetcher;
  }

  /**
   * Subscribe to signals
   */
  subscribe(callback: (signal: ExtremePoint) => void): () => void {
    this.subscribers.push(callback);
    return () => {
      const index = this.subscribers.indexOf(callback);
      if (index > -1) this.subscribers.splice(index, 1);
    };
  }

  /**
   * Start the agent
   */
  start(): void {
    if (this.status.isRunning) {
      this.logger.warn('Signal agent already running');
      return;
    }

    if (!this.marketDataFetcher) {
      this.logger.error('Market data fetcher not set');
      return;
    }

    this.config.enabled = true;
    this.status.isRunning = true;
    this.logger.info('Starting signal agent', { symbols: this.config.symbols });

    // Run initial check
    this.runCheck();

    // Set up periodic checks
    this.intervalId = setInterval(() => {
      this.runCheck();
    }, this.config.checkIntervalMs);
  }

  /**
   * Stop the agent
   */
  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.config.enabled = false;
    this.status.isRunning = false;
    this.status.currentSymbol = null;
    this.logger.info('Signal agent stopped');
  }

  /**
   * Get agent status
   */
  getStatus(): AgentStatus {
    this.status.activeSignals = this.detector.getActiveSignals().length;
    return { ...this.status };
  }

  /**
   * Get active signals
   */
  getActiveSignals(): ExtremePoint[] {
    return this.detector.getActiveSignals();
  }

  /**
   * Get configuration
   */
  getConfig(): AgentConfig {
    return { ...this.config };
  }

  /**
   * Run a single check cycle
   */
  private async runCheck(): Promise<void> {
    if (!this.marketDataFetcher) return;

    this.detector.cleanupExpiredSignals();

    for (const symbol of this.config.symbols) {
      try {
        this.status.currentSymbol = symbol;
        
        const marketData = await this.marketDataFetcher(symbol);
        if (!marketData) {
          this.logger.warn('Failed to fetch market data', { symbol });
          continue;
        }

        const { data, currentPrice, volume24hUSD } = marketData;

        // Skip if volume below threshold
        if (volume24hUSD < this.config.minVolumeUSD) {
          this.logger.debug('Volume below threshold', { symbol, volume24hUSD });
          continue;
        }

        // Analyze for extreme points
        const signal = await this.detector.analyzeMarket(
          symbol,
          data,
          currentPrice,
          volume24hUSD
        );

        if (signal && signal.confidence >= this.config.minConfidence) {
          this.logger.info('Signal generated', {
            symbol,
            type: signal.signalType,
            confidence: signal.confidence
          });
        }

      } catch (error) {
        this.logger.error('Error checking symbol', { symbol }, error as Error);
      }
    }

    this.status.lastCheck = Date.now();
    this.status.checksPerformed++;
    this.status.currentSymbol = null;
  }

  /**
   * Manually trigger a check for a specific symbol
   */
  async checkSymbol(symbol: string): Promise<ExtremePoint | null> {
    if (!this.marketDataFetcher) {
      this.logger.error('Market data fetcher not set');
      return null;
    }

    try {
      const marketData = await this.marketDataFetcher(symbol);
      if (!marketData) return null;

      const { data, currentPrice, volume24hUSD } = marketData;
      return await this.detector.analyzeMarket(symbol, data, currentPrice, volume24hUSD);
    } catch (error) {
      this.logger.error('Error checking symbol', { symbol }, error as Error);
      return null;
    }
  }

  /**
   * Notify subscribers of new signal
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
}
