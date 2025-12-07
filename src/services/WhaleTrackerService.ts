/**
 * Whale Tracker Service - HuggingFace Integration
 * 
 * This service uses ONLY HuggingFace Crypto API for whale tracking.
 * All external API calls have been removed.
 */

import { Logger } from '../core/Logger.js';
import { cryptoAPI, WhaleTransaction } from './CryptoAPI';

export interface WhaleAlert {
  hash: string;
  from: string;
  to: string;
  amount: number;
  amountUsd: number;
  symbol: string;
  timestamp: number;
  blockchain: string;
}

export interface WhaleStats {
  totalTransactions: number;
  totalValueUsd: number;
  averageValueUsd: number;
  largestTransactionUsd: number;
  uniqueWallets: number;
  timestamp: number;
}

export class WhaleTrackerService {
  private static instance: WhaleTrackerService;
  private logger = Logger.getInstance();
  
  // Simple cache
  private whaleCache: { data: WhaleAlert[]; timestamp: number } = { data: [], timestamp: 0 };
  private statsCache: { data: WhaleStats | null; timestamp: number } = { data: null, timestamp: 0 };
  private readonly CACHE_TTL = 60000; // 1 minute

  private constructor() {
    this.logger.info('✅ WhaleTrackerService initialized with HuggingFace API');
  }

  static getInstance(): WhaleTrackerService {
    if (!WhaleTrackerService.instance) {
      WhaleTrackerService.instance = new WhaleTrackerService();
    }
    return WhaleTrackerService.instance;
  }

  /**
   * Get recent whale transactions
   */
  async getWhaleAlerts(
    chain: string = 'ethereum',
    minAmountUsd: number = 1000000,
    limit: number = 50
  ): Promise<WhaleAlert[]> {
    // Check cache
    if (this.whaleCache.data.length > 0 && Date.now() - this.whaleCache.timestamp < this.CACHE_TTL) {
      return this.whaleCache.data;
    }

    try {
      const response = await cryptoAPI.getWhales(chain, minAmountUsd, limit);
      
      if (!response.data || !Array.isArray(response.data)) {
        this.logger.warn('No whale data returned from HuggingFace');
        return [];
      }

      // Convert to WhaleAlert format
      const alerts: WhaleAlert[] = response.data.map((tx: WhaleTransaction) => ({
        hash: tx.hash || `${tx.from}_${tx.to}_${tx.timestamp}`,
        from: tx.from,
        to: tx.to,
        amount: tx.amount,
        amountUsd: tx.amount_usd,
        symbol: tx.symbol || chain,
        timestamp: typeof tx.ts === 'string' ? new Date(tx.ts).getTime() : tx.ts,
        blockchain: tx.chain || chain
      }));

      // Cache the result
      this.whaleCache = { data: alerts, timestamp: Date.now() };
      
      this.logger.info(`✅ Fetched ${alerts.length} whale transactions`);
      return alerts;
    } catch (error) {
      this.logger.error('Failed to fetch whale alerts:', {}, error);
      return [];
    }
  }

  /**
   * Get whale statistics
   */
  async getWhaleStats(hours: number = 24): Promise<WhaleStats> {
    // Check cache
    if (this.statsCache.data && Date.now() - this.statsCache.timestamp < this.CACHE_TTL) {
      return this.statsCache.data;
    }

    try {
      const response = await cryptoAPI.getWhaleStats(hours);
      
      if (!response.success || !response.data) {
        // Return default stats
        return {
          totalTransactions: 0,
          totalValueUsd: 0,
          averageValueUsd: 0,
          largestTransactionUsd: 0,
          uniqueWallets: 0,
          timestamp: Date.now()
        };
      }

      const stats: WhaleStats = {
        totalTransactions: response.data.totalTransactions || 0,
        totalValueUsd: response.data.totalValueUsd || 0,
        averageValueUsd: response.data.averageValueUsd || 0,
        largestTransactionUsd: response.data.largestTransactionUsd || 0,
        uniqueWallets: response.data.uniqueWallets || 0,
        timestamp: Date.now()
      };

      // Cache the result
      this.statsCache = { data: stats, timestamp: Date.now() };
      
      return stats;
    } catch (error) {
      this.logger.error('Failed to fetch whale stats:', {}, error);
      
      // Return default stats
      return {
        totalTransactions: 0,
        totalValueUsd: 0,
        averageValueUsd: 0,
        largestTransactionUsd: 0,
        uniqueWallets: 0,
        timestamp: Date.now()
      };
    }
  }

  /**
   * Subscribe to real-time whale alerts (using polling)
   */
  subscribeToWhaleAlerts(
    callback: (alert: WhaleAlert) => void,
    chain: string = 'ethereum',
    minAmountUsd: number = 1000000,
    intervalMs: number = 30000
  ): () => void {
    let lastAlerts: WhaleAlert[] = [];

    const poll = async () => {
      try {
        const currentAlerts = await this.getWhaleAlerts(chain, minAmountUsd, 20);
        
        // Find new alerts
        const newAlerts = currentAlerts.filter(alert => 
          !lastAlerts.some(last => last.hash === alert.hash)
        );
        
        // Notify about new alerts
        newAlerts.forEach(callback);
        
        lastAlerts = currentAlerts;
      } catch (error) {
        this.logger.error('Whale alert polling error:', {}, error);
      }
    };

    // Initial poll
    poll();
    
    // Set up interval
    const interval = setInterval(poll, intervalMs);
    
    // Return cleanup function
    return () => clearInterval(interval);
  }

  /**
   * Track whale activity for a specific symbol
   */
  async trackWhaleActivity(symbol: string = 'BTC'): Promise<{
    largeTransactions: Array<{
      amount: number;
      timestamp: number;
      type: 'buy' | 'sell';
      exchange: string;
    }>;
    summary: {
      totalBuyVolume: number;
      totalSellVolume: number;
      netFlow: number;
      averageTransactionSize: number;
    };
  }> {
    try {
      // Get whale alerts for the symbol's blockchain
      const chain = symbol === 'BTC' ? 'bitcoin' : 'ethereum';
      const alerts = await this.getWhaleAlerts(chain, 1000000, 50);
      
      // Convert whale alerts to transactions
      const largeTransactions = alerts.map(alert => ({
        amount: alert.amountUsd,
        timestamp: alert.timestamp,
        type: (alert.from.toLowerCase().includes('exchange') ? 'sell' : 'buy') as 'buy' | 'sell',
        exchange: 'unknown'
      }));
      
      // Calculate summary statistics
      const totalBuyVolume = largeTransactions
        .filter(t => t.type === 'buy')
        .reduce((sum, t) => sum + t.amount, 0);
      
      const totalSellVolume = largeTransactions
        .filter(t => t.type === 'sell')
        .reduce((sum, t) => sum + t.amount, 0);
      
      const netFlow = totalBuyVolume - totalSellVolume;
      
      const averageTransactionSize = largeTransactions.length > 0
        ? largeTransactions.reduce((sum, t) => sum + t.amount, 0) / largeTransactions.length
        : 0;
      
      return {
        largeTransactions,
        summary: {
          totalBuyVolume,
          totalSellVolume,
          netFlow,
          averageTransactionSize
        }
      };
    } catch (error) {
      this.logger.error('Whale tracking error:', { symbol }, error);
      // Return empty data on error
      return {
        largeTransactions: [],
        summary: {
          totalBuyVolume: 0,
          totalSellVolume: 0,
          netFlow: 0,
          averageTransactionSize: 0
        }
      };
    }
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.whaleCache = { data: [], timestamp: 0 };
    this.statsCache = { data: null, timestamp: 0 };
    this.logger.info('Whale tracker cache cleared');
  }
}
