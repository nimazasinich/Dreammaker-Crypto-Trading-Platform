/**
 * CORS Proxy Routes for External APIs
 * حل مشکل CORS برای Binance و CoinGecko APIs
 */

import express, { Request, Response } from 'express';
import { Logger } from '../core/Logger';

const logger = Logger.getInstance();

/**
 * Setup proxy routes for external APIs
 */
export function setupProxyRoutes(app: express.Application): void {
  /**
   * HuggingFace OHLCV Proxy - replaces Binance klines
   * GET binance/klines?symbol=BTCUSDT&interval=1h&limit=100
   */
  app.get('/binance/klines', async (req: Request, res: Response) => {
    try {
      const { symbol, interval, limit } = req.query;
      
      if (!symbol || !interval) {
        return res.status(400).json({ 
          error: 'Missing required parameters: symbol and interval' 
        });
      }

      logger.info('Fetching OHLCV from HuggingFace', { symbol, interval, limit });
      
      // Use HuggingFace unified API
      const { cryptoAPI } = await import('../services/CryptoAPI.js');
      const cleanSymbol = String(symbol).replace('USDT', '').toUpperCase();
      const ohlcvData = await cryptoAPI.getOHLCV(
        cleanSymbol,
        String(interval),
        parseInt(String(limit || '100'))
      );

      // Transform to Binance klines format
      const binanceFormat = (ohlcvData.data || []).map((candle: any) => [
        candle.timestamp || candle[0],
        String(candle.open || candle[1]),
        String(candle.high || candle[2]),
        String(candle.low || candle[3]),
        String(candle.close || candle[4]),
        String(candle.volume || candle[5]),
        0, 0, 0, "0", "0", "0"
      ]);

      res.json(binanceFormat);
      
    } catch (error) {
      logger.error('HuggingFace OHLCV proxy error', {}, error as Error);
      res.status(500).json({ 
        error: 'Failed to fetch OHLCV from HuggingFace',
        message: (error as Error).message
      });
    }
  });

  /**
   * HuggingFace 24hr Ticker Proxy - replaces Binance ticker
   * GET binance/ticker/24hr?symbol=BTCUSDT
   */
  app.get('/binance/ticker/24hr', async (req: Request, res: Response) => {
    try {
      const { symbol } = req.query;
      
      if (!symbol) {
        return res.status(400).json({ error: 'Missing symbol parameter' });
      }

      // Use HuggingFace unified API
      const { cryptoAPI } = await import('../services/CryptoAPI.js');
      const cleanSymbol = String(symbol).replace('USDT', '').toUpperCase();
      const priceData = await cryptoAPI.getPrice(`${cleanSymbol}/USDT`);

      // Transform to Binance ticker format
      const ticker = {
        symbol: symbol,
        lastPrice: String(priceData.data?.price || '0'),
        priceChange: String(priceData.data?.change_24h || '0'),
        priceChangePercent: String(priceData.data?.change_24h || '0'),
        volume: String(priceData.data?.volume_24h || '0')
      };

      res.json(ticker);
      
    } catch (error) {
      logger.error('HuggingFace ticker proxy error', {}, error as Error);
      res.status(500).json({ 
        error: 'Failed to fetch ticker from HuggingFace',
        message: (error as Error).message
      });
    }
  });

  /**
   * HuggingFace Market Chart Proxy - replaces CoinGecko
   * GET coingecko/market_chart?coinId=bitcoin&days=30&vs_currency=usd
   */
  app.get('/coingecko/market_chart', async (req: Request, res: Response) => {
    try {
      const { coinId, days = '7' } = req.query;
      
      if (!coinId) {
        return res.status(400).json({ error: 'Missing coinId parameter' });
      }

      logger.info('Fetching market chart from HuggingFace', { coinId, days });

      // Use HuggingFace unified API
      const { cryptoAPI } = await import('../services/CryptoAPI.js');
      
      // Map CoinGecko coinId to symbol
      const coinIdMap: Record<string, string> = {
        'bitcoin': 'BTC', 'ethereum': 'ETH', 'binancecoin': 'BNB',
        'cardano': 'ADA', 'solana': 'SOL', 'ripple': 'XRP',
        'polkadot': 'DOT', 'dogecoin': 'DOGE'
      };
      
      const symbol = coinIdMap[String(coinId).toLowerCase()] || String(coinId).toUpperCase();
      
      // Determine timeframe based on days
      const numDays = parseInt(String(days));
      const timeframe = numDays <= 1 ? '15m' : numDays <= 7 ? '1h' : numDays <= 30 ? '4h' : '1d';
      const limit = numDays <= 1 ? 96 : numDays <= 7 ? 168 : numDays <= 30 ? 180 : 365;
      
      const ohlcvData = await cryptoAPI.getOHLCV(symbol, timeframe, limit);
      
      // Transform to CoinGecko market_chart format
      const prices = (ohlcvData.data || []).map((candle: any) => [
        candle.timestamp || candle[0],
        parseFloat(candle.close || candle[4])
      ]);
      
      res.json({
        prices,
        market_caps: prices.map(([ts, p]: [number, number]) => [ts, p * 1000000000]),
        total_volumes: (ohlcvData.data || []).map((c: any) => [
          c.timestamp || c[0],
          parseFloat(c.volume || c[5])
        ])
      });
      
    } catch (error) {
      logger.error('HuggingFace market chart proxy error', {}, error as Error);
      res.status(500).json({ 
        error: 'Failed to fetch market chart from HuggingFace',
        message: (error as Error).message
      });
    }
  });

  /**
   * HuggingFace Simple Price Proxy - replaces CoinGecko simple price
   * GET coingecko/simple/price?ids=bitcoin,ethereum&vs_currencies=usd
   */
  app.get('/coingecko/simple/price', async (req: Request, res: Response) => {
    try {
      const { ids, vs_currencies = 'usd', include_24hr_change, include_24hr_vol } = req.query;
      
      if (!ids) {
        return res.status(400).json({ error: 'Missing ids parameter' });
      }

      // Use HuggingFace unified API
      const { cryptoAPI } = await import('../services/CryptoAPI.js');
      
      // Map CoinGecko IDs to symbols
      const coinIdMap: Record<string, string> = {
        'bitcoin': 'BTC', 'ethereum': 'ETH', 'binancecoin': 'BNB',
        'cardano': 'ADA', 'solana': 'SOL', 'ripple': 'XRP',
        'polkadot': 'DOT', 'dogecoin': 'DOGE', 'tron': 'TRX',
        'chainlink': 'LINK', 'matic-network': 'MATIC', 'avalanche-2': 'AVAX'
      };
      
      const coinIds = String(ids).split(',');
      const prices: any = {};
      
      for (const coinId of coinIds) {
        try {
          const symbol = coinIdMap[coinId.toLowerCase()] || coinId.toUpperCase();
          const priceData = await cryptoAPI.getPrice(`${symbol}/USDT`);
          
          prices[coinId] = {
            [String(vs_currencies)]: priceData.data?.price || 0
          };
          
          if (include_24hr_change === 'true') {
            prices[coinId][`${vs_currencies}_24h_change`] = priceData.data?.change_24h || 0;
          }
          
          if (include_24hr_vol === 'true') {
            prices[coinId][`${vs_currencies}_24h_vol`] = priceData.data?.volume_24h || 0;
          }
        } catch {
          // Skip failed symbols
        }
      }

      res.json(prices);
      
    } catch (error) {
      logger.error('HuggingFace price proxy error', {}, error as Error);
      res.status(500).json({ 
        error: 'Failed to fetch prices from HuggingFace',
        message: (error as Error).message
      });
    }
  });

  logger.info('✅ CORS Proxy routes initialized');
}

