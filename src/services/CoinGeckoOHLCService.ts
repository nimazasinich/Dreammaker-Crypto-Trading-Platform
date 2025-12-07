/**
 * CoinGecko OHLC Service
 * Direct integration with CoinGecko API for real OHLC data
 * Bypasses HF Space's demo data
 */

import { Logger } from '../core/Logger';

const logger = Logger.getInstance();

export interface OHLCCandle {
  t: number;  // timestamp
  o: number;  // open
  h: number;  // high
  l: number;  // low
  c: number;  // close
  v?: number; // volume (CoinGecko doesn't provide this in OHLC endpoint)
}

export interface OHLCResponse {
  success: boolean;
  data: OHLCCandle[];
  symbol: string;
  source: string;
  count: number;
}

/**
 * Symbol mapping: Frontend symbol → CoinGecko ID
 */
const SYMBOL_TO_COINGECKO_ID: Record<string, string> = {
  'BTC': 'bitcoin',
  'ETH': 'ethereum',
  'BNB': 'binancecoin',
  'SOL': 'solana',
  'ADA': 'cardano',
  'DOT': 'polkadot',
  'MATIC': 'matic-network',
  'AVAX': 'avalanche-2',
  'LINK': 'chainlink',
  'UNI': 'uniswap',
  'XRP': 'ripple',
  'DOGE': 'dogecoin',
  'LTC': 'litecoin',
  'BCH': 'bitcoin-cash',
  'ATOM': 'cosmos',
  'ETC': 'ethereum-classic',
  'XLM': 'stellar',
  'FIL': 'filecoin',
  'TRX': 'tron',
  'EOS': 'eos',
};

/**
 * Timeframe mapping: Frontend format → CoinGecko days
 */
const TIMEFRAME_TO_DAYS: Record<string, number> = {
  '1m': 1,
  '5m': 1,
  '15m': 1,
  '30m': 1,
  '1h': 1,
  '4h': 7,
  '1d': 30,
  '1w': 90,
};

class CoinGeckoOHLCService {
  private baseUrl = 'https://api.coingecko.com/api/v3';
  private rateLimitDelay = 1200; // CoinGecko free tier: 50 calls/minute = 1.2s between calls
  private lastCallTime = 0;

  /**
   * Enforces rate limiting for CoinGecko API
   */
  private async enforceRateLimit(): Promise<void> {
    const now = Date.now();
    const timeSinceLastCall = now - this.lastCallTime;
    
    if (timeSinceLastCall < this.rateLimitDelay) {
      const waitTime = this.rateLimitDelay - timeSinceLastCall;
      logger.info(`Rate limiting: waiting ${waitTime}ms`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
    
    this.lastCallTime = Date.now();
  }

  /**
   * Fetches OHLC data from CoinGecko
   */
  async getOHLCData(
    symbol: string,
    timeframe: string = '1h',
    limit: number = 100
  ): Promise<OHLCResponse> {
    try {
      // Convert symbol to CoinGecko ID
      const coinId = SYMBOL_TO_COINGECKO_ID[symbol.toUpperCase()] || symbol.toLowerCase();
      
      // Convert timeframe to days
      const days = TIMEFRAME_TO_DAYS[timeframe] || 1;
      
      // Enforce rate limiting
      await this.enforceRateLimit();
      
      // Fetch from CoinGecko
      const url = `${this.baseUrl}/coins/${coinId}/ohlc?vs_currency=usd&days=${days}`;
      
      logger.info(`Fetching OHLC from CoinGecko`, { symbol, coinId, days, limit });
      
      const response = await fetch(url, {
        headers: {
          'Accept': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`CoinGecko API error: ${response.status} ${response.statusText}`);
      }
      
      const data: number[][] = await response.json();
      
      // Convert CoinGecko format to our format
      // CoinGecko: [timestamp, open, high, low, close]
      const candles: OHLCCandle[] = data
        .map(candle => ({
          t: candle[0],
          o: candle[1],
          h: candle[2],
          l: candle[3],
          c: candle[4],
          // CoinGecko doesn't provide volume in OHLC endpoint
        }))
        .slice(-limit); // Take last N candles
      
      logger.info(`✅ Fetched ${candles.length} REAL candles from CoinGecko`, {
        symbol,
        firstPrice: candles[0]?.o,
        lastPrice: candles[candles.length - 1]?.c,
        source: 'coingecko'
      });
      
      // Log sample for debugging
      if (candles.length > 0) {
        const sample = candles[0];
        logger.info(`📊 Sample CoinGecko candle:`, {
          timestamp: new Date(sample.t).toISOString(),
          open: sample.o,
          high: sample.h,
          low: sample.l,
          close: sample.c,
          priceRange: sample.h - sample.l
        });
      }
      
      return {
        success: true,
        data: candles,
        symbol: symbol.toUpperCase(),
        source: 'coingecko',
        count: candles.length,
      };
    } catch (error) {
      logger.error('CoinGecko OHLC fetch failed', { error, symbol, timeframe });
      
      return {
        success: false,
        data: [],
        symbol: symbol.toUpperCase(),
        source: 'coingecko',
        count: 0,
      };
    }
  }

  /**
   * Fetches current price from CoinGecko (for validation)
   */
  async getCurrentPrice(symbol: string): Promise<number | null> {
    try {
      const coinId = SYMBOL_TO_COINGECKO_ID[symbol.toUpperCase()] || symbol.toLowerCase();
      
      await this.enforceRateLimit();
      
      const url = `${this.baseUrl}/simple/price?ids=${coinId}&vs_currencies=usd`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`CoinGecko API error: ${response.status}`);
      }
      
      const data = await response.json();
      return data[coinId]?.usd || null;
    } catch (error) {
      logger.error('CoinGecko price fetch failed', { error, symbol });
      return null;
    }
  }
}

// Singleton instance
export const coinGeckoOHLCService = new CoinGeckoOHLCService();

