/**
 * API Configuration - HuggingFace Unified API
 * 
 * Single source of truth for all API endpoints.
 * Base URL: https://really-amin-datasourceforcryptocurrency-2.hf.space
 * 
 * @version 3.0.0
 */

export const marketProviders = {
  primary: { 
    name: 'huggingface', 
    base: 'https://really-amin-datasourceforcryptocurrency-2.hf.space/api' 
  },
  fallbacks: [],
  ttlMs: 60_000,
  backoff: { baseMs: 500, maxMs: 8000, factor: 2, jitter: 0.25 }
};

/**
 * Base URL for HuggingFace API
 */
export const HUGGINGFACE_API_BASE = 'https://really-amin-datasourceforcryptocurrency-2.hf.space';

/**
 * Complete API Endpoints Configuration
 * All endpoints are from HuggingFace Space
 */
export const API_ENDPOINTS = {
  // ============================================================================
  // Core Market Services
  // ============================================================================
  topMarket: '/api/market/top',
  trending: '/api/market/trending',
  topCoins: '/api/coins/top',
  tickers: '/api/market/tickers',
  marketOHLC: '/api/market/ohlc',
  
  // ============================================================================
  // AI & Sentiment Services
  // ============================================================================
  globalSentiment: '/api/sentiment/global',
  assetSentiment: '/api/sentiment/asset', // + /{symbol}
  analyzeSentiment: '/api/sentiment/analyze',
  modelsStatus: '/api/models/status',
  modelsList: '/api/models/list',
  aiSignals: '/api/ai/signals',
  aiDecision: '/api/ai/decision',
  
  // ============================================================================
  // News Services
  // ============================================================================
  news: '/api/news',
  newsLatest: '/api/news/latest',
  
  // ============================================================================
  // Trading Data (OHLCV)
  // ============================================================================
  ohlcv: '/api/ohlcv', // + /{symbol}
  ohlcvMulti: '/api/ohlcv/multi',
  
  // ============================================================================
  // Trading Services
  // ============================================================================
  backtest: '/api/trading/backtest',
  futuresPositions: '/api/futures/positions',
  
  // ============================================================================
  // Technical Analysis Services
  // ============================================================================
  quickTA: '/api/technical/quick', // + /{symbol}
  comprehensiveTA: '/api/technical/comprehensive', // + /{symbol}
  riskAssessment: '/api/technical/risk', // + /{symbol}
  
  // ============================================================================
  // Advanced/Multi-Source Services
  // ============================================================================
  multiSourceData: '/api/multi-source/data', // + /{symbol}
  allSources: '/api/sources/all',
  testSource: '/api/test-source', // + /{source_id}
  
  // ============================================================================
  // System Services
  // ============================================================================
  health: '/api/health',
  status: '/api/status',
  monitoringStatus: '/api/monitoring/status',
  resourcesSummary: '/api/resources/summary',
  resourcesStats: '/api/resources/stats',
  resourcesAPIs: '/api/resources/apis',
};

/**
 * Get full URL for an endpoint
 */
export function getEndpointUrl(endpoint: keyof typeof API_ENDPOINTS, params?: string): string {
  const path = API_ENDPOINTS[endpoint];
  const url = `${HUGGINGFACE_API_BASE}${path}`;
  return params ? `${url}/${params}` : url;
}

/**
 * Build URL with query parameters
 */
export function buildUrl(endpoint: keyof typeof API_ENDPOINTS, queryParams?: Record<string, string | number>): string {
  const baseUrl = getEndpointUrl(endpoint);
  if (!queryParams) return baseUrl;
  
  const params = new URLSearchParams();
  Object.entries(queryParams).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      params.append(key, String(value));
    }
  });
  
  const queryString = params.toString();
  return queryString ? `${baseUrl}?${queryString}` : baseUrl;
}

/**
 * API Categories for reference
 */
export const API_CATEGORIES = {
  MARKET: ['topMarket', 'trending', 'topCoins', 'tickers', 'marketOHLC'],
  AI_SENTIMENT: ['globalSentiment', 'assetSentiment', 'analyzeSentiment', 'modelsStatus', 'modelsList', 'aiSignals', 'aiDecision'],
  NEWS: ['news', 'newsLatest'],
  OHLCV: ['ohlcv', 'ohlcvMulti'],
  TRADING: ['backtest', 'futuresPositions'],
  TECHNICAL: ['quickTA', 'comprehensiveTA', 'riskAssessment'],
  ADVANCED: ['multiSourceData', 'allSources', 'testSource'],
  SYSTEM: ['health', 'status', 'monitoringStatus', 'resourcesSummary', 'resourcesStats', 'resourcesAPIs'],
};

/**
 * Cache TTL configuration (in milliseconds)
 */
export const CACHE_TTL = {
  market: 60000,      // 1 minute
  sentiment: 300000,  // 5 minutes
  news: 120000,       // 2 minutes
  ohlcv: 60000,       // 1 minute
  signals: 30000,     // 30 seconds
  technical: 120000,  // 2 minutes
  system: 60000,      // 1 minute
};

export default {
  marketProviders,
  HUGGINGFACE_API_BASE,
  API_ENDPOINTS,
  API_CATEGORIES,
  CACHE_TTL,
  getEndpointUrl,
  buildUrl,
};
