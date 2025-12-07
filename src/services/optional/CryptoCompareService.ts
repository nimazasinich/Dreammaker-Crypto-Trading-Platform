/**
 * CryptoCompare Service - HuggingFace Integration
 * 
 * DEPRECATED: This service now uses HuggingFace Crypto API instead of CryptoCompare.
 * All direct CryptoCompare API calls have been removed.
 */

import { cryptoAPI } from '../CryptoAPI';

export class CryptoCompareService {
  /**
   * Get prices for multiple symbols using HuggingFace
   */
  static async priceMulti(fsyms = "BTC,ETH", tsyms = "USD") {
    try {
      const symbols = fsyms.split(',').map(s => s.trim());
      const pairs = symbols.map(sym => `${sym}/${tsyms}`);
      
      const response = await cryptoAPI.getPrices(pairs);
      
      if (!response.data) {
        throw new Error('No price data returned');
      }

      // Convert to CryptoCompare format
      const result: any = {};
      response.data.forEach((priceData: any, index: number) => {
        result[symbols[index]] = {
          [tsyms]: priceData.price
        };
      });

      return result;
    } catch (error: any) {
      console.error('HuggingFace priceMulti fetch failed:', error.message);
      return {};
    }
  }

  /**
   * Get historical hourly data using HuggingFace
   */
  static async histoHour(fsym = "BTC", tsym = "USD", limit = 168) {
    try {
      const response = await cryptoAPI.getOHLCV(fsym, '1h', limit);
      
      if (!response.success || !response.data) {
        throw new Error(`No OHLCV data for ${fsym}`);
      }

      // Convert to CryptoCompare format
      return response.data.map((candle: any) => ({
        time: Math.floor(candle.t / 1000),
        high: candle.h,
        low: candle.l,
        open: candle.o,
        volumefrom: candle.v,
        volumeto: candle.v * candle.c,
        close: candle.c
      }));
    } catch (error: any) {
      console.error('HuggingFace histoHour fetch failed:', error.message);
      return [];
    }
  }

  /**
   * Get historical daily data using HuggingFace
   */
  static async histoDay(fsym = "BTC", tsym = "USD", limit = 30) {
    try {
      const response = await cryptoAPI.getOHLCV(fsym, '1d', limit);
      
      if (!response.success || !response.data) {
        throw new Error(`No OHLCV data for ${fsym}`);
      }

      // Convert to CryptoCompare format
      return response.data.map((candle: any) => ({
        time: Math.floor(candle.t / 1000),
        high: candle.h,
        low: candle.l,
        open: candle.o,
        volumefrom: candle.v,
        volumeto: candle.v * candle.c,
        close: candle.c
      }));
    } catch (error: any) {
      console.error('HuggingFace histoDay fetch failed:', error.message);
      return [];
    }
  }
}
