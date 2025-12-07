/**
 * Binance Public Service - HuggingFace Integration
 * 
 * DEPRECATED: This service now uses HuggingFace Crypto API instead of Binance.
 * All direct Binance API calls have been removed.
 */

import { cryptoAPI } from '../CryptoAPI';

export class BinancePublicService {
  /**
   * Get current price for a symbol using HuggingFace
   */
  static async price(symbol: string) {
    try {
      // Convert Binance symbol format to HuggingFace (e.g., BTCUSDT -> BTC/USDT)
      const base = symbol.replace('USDT', '').replace('BUSD', '');
      const pair = `${base}/USDT`;
      
      const response = await cryptoAPI.getPrice(pair);
      
      if (!response.data || !response.data.price) {
        throw new Error(`No price data for ${pair}`);
      }

      return {
        symbol,
        price: response.data.price
      };
    } catch (error: any) {
      console.error('HuggingFace price fetch failed:', error.message);
      throw error;
    }
  }

  /**
   * Get klines/candlestick data using HuggingFace
   */
  static async klines(symbol: string, interval = "1h", limit = 500) {
    try {
      const base = symbol.replace('USDT', '').replace('BUSD', '');
      
      const response = await cryptoAPI.getOHLCV(base, interval, limit);
      
      if (!response.success || !response.data) {
        throw new Error(`No OHLCV data for ${symbol}`);
      }

      // Convert HuggingFace format to Binance klines format
      return response.data.map((candle: any) => [
        candle.t,           // Open time
        candle.o.toString(), // Open
        candle.h.toString(), // High
        candle.l.toString(), // Low
        candle.c.toString(), // Close
        candle.v.toString(), // Volume
        0,                   // Close time
        "0",                 // Quote asset volume
        0,                   // Number of trades
        "0",                 // Taker buy base asset volume
        "0",                 // Taker buy quote asset volume
        "0"                  // Ignore
      ]);
    } catch (error: any) {
      console.error('HuggingFace klines fetch failed:', error.message);
      throw error;
    }
  }

  /**
   * Get exchange info - Returns minimal info since we use HuggingFace
   */
  static async exchangeInfo() {
    return {
      timezone: "UTC",
      serverTime: Date.now(),
      symbols: [] // HuggingFace handles symbol info internally
    };
  }
}
