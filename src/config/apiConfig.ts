/**
 * API Configuration - HuggingFace Only
 * 
 * All data providers have been replaced with HuggingFace Crypto API.
 * This file maintains backward compatibility but redirects to HuggingFace.
 */

export const marketProviders = {
  primary: { 
    name: 'huggingface', 
    base: 'https://Really-amin-Datasourceforcryptocurrency-2.hf.space/api' 
  },
  fallbacks: [
    // No fallbacks needed - HuggingFace has 55 functional resources with automatic fallback
  ],
  // Cache TTL
  ttlMs: 60_000,
  backoff: { baseMs: 500, maxMs: 8000, factor: 2, jitter: 0.25 }
};

/**
 * Base URL for HuggingFace API
 */
export const HUGGINGFACE_API_BASE = 'https://Really-amin-Datasourceforcryptocurrency-2.hf.space';

/**
 * API endpoints (all from HuggingFace)
 */
export const API_ENDPOINTS = {
  // Price data
  price: '/api/service/rate',
  batchPrice: '/api/service/rate/batch',
  topCoins: '/api/service/top',
  marketStatus: '/api/service/market-status',
  tickers: '/api/market/tickers',
  
  // OHLCV data
  ohlcv: '/api/ohlcv',
  historical: '/api/historical',
  priceHistory: '/api/service/history',
  
  // News
  news: '/api/news/latest',
  
  // Sentiment
  globalSentiment: '/api/sentiment/global',
  sentiment: '/api/service/sentiment',
  analyzeSentiment: '/api/sentiment/analyze',
  
  // Whale tracking
  whales: '/api/service/whales',
  whaleStats: '/api/whales/stats',
  
  // On-chain data
  onchain: '/api/service/onchain',
  gasPrices: '/api/blockchain/gas',
  
  // Technical analysis
  quickTA: '/api/technical/ta-quick',
  comprehensive: '/api/technical/comprehensive',
  riskAssessment: '/api/technical/risk-assessment',
  
  // System
  health: '/api/health',
  status: '/api/status'
};

/**
 * Get full URL for an endpoint
 */
export function getEndpointUrl(endpoint: keyof typeof API_ENDPOINTS): string {
  return `${HUGGINGFACE_API_BASE}${API_ENDPOINTS[endpoint]}`;
}

/**
 * DEPRECATED: External API configurations (kept for backward compatibility)
 * These are no longer used - all data comes from HuggingFace
 */
export const DEPRECATED_APIS = {
  binance: 'https://api.binance.com/api/v3',
  coingecko: 'https://api.coingecko.com/api/v3',
  newsapi: 'https://newsapi.org/v2',
  cryptocompare: 'https://min-api.cryptocompare.com',
};

export default {
  marketProviders,
  HUGGINGFACE_API_BASE,
  API_ENDPOINTS,
  getEndpointUrl
};
