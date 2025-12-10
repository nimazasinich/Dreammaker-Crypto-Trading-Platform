/**
 * Services Export Index - HuggingFace Integration
 * 
 * Centralized export of all services.
 * All services now use HuggingFace Crypto API as the single data source.
 * 
 * Base URL: https://really-amin-datasourceforcryptocurrency-2.hf.space
 */

// ============================================
// PRIMARY API CLIENT - HUGGINGFACE UNIFIED API (RECOMMENDED)
// ============================================
export { 
  hfAPI, 
  HuggingFaceUnifiedAPI,
  default as HuggingFaceAPI 
} from './HuggingFaceUnifiedAPI';
export type { 
  MarketCoin,
  TrendingCoin,
  OHLCVCandle as HFOHLCVCandle,
  GlobalSentiment,
  AssetSentiment,
  SentimentAnalysisResult,
  AISignal,
  AIDecision,
  ModelInfo,
  NewsArticle as HFNewsArticle,
  QuickTAResult,
  ComprehensiveTAResult,
  RiskAssessment,
  BacktestResult,
  FuturesPosition,
  HealthStatus,
  SystemStatus,
  ResourceSummary,
  MultiSourceData,
  APIResponse,
} from './HuggingFaceUnifiedAPI';

// ============================================
// LEGACY PRIMARY API CLIENT (for backward compatibility)
// ============================================
export { cryptoAPI, default as CryptoAPI } from './CryptoAPI';
export type { 
  PriceData, 
  OHLCVCandle, 
  NewsArticle, 
  SentimentResult, 
  WhaleTransaction 
} from './CryptoAPI';

// ============================================
// CORE SERVICES (HuggingFace-based)
// ============================================
export { marketDataService, MarketDataService } from './marketDataService';
export { SentimentNewsService } from './SentimentNewsService';
export { HistoricalDataService } from './HistoricalDataService';
export { WhaleTrackerService } from './WhaleTrackerService';
export { realDataManager, RealDataManager } from './RealDataManager';
export { default as DatasourceClient } from './DatasourceClient';

// ============================================
// LEGACY SERVICES (Deprecated - use hfAPI instead)
// ============================================
export { BinanceService } from './BinanceService';

// ============================================
// OPTIONAL SERVICES (Updated to use HuggingFace)
// ============================================
export { NewsApiService } from './optional/NewsApiService';
export { BinancePublicService } from './optional/BinancePublicService';
export { CryptoCompareService } from './optional/CryptoCompareService';

// ============================================
// UTILITY SERVICES
// ============================================
export { WebSocketManager, wsManager } from './WebSocketManager';
export { RealTimeDataService } from './RealTimeDataService';

/**
 * MIGRATION GUIDE:
 * 
 * Old way (DEPRECATED):
 * ```typescript
 * import { BinanceService } from '@/services/BinanceService';
 * const data = await binanceService.getPrice('BTCUSDT');
 * ```
 * 
 * New way (RECOMMENDED):
 * ```typescript
 * import { hfAPI } from '@/services';
 * const data = await hfAPI.getPrice('BTC');
 * // or
 * const coins = await hfAPI.getTopCoins(50);
 * const news = await hfAPI.getLatestNews(10);
 * const signals = await hfAPI.getAISignals();
 * ```
 * 
 * For backward compatibility, old services still work but redirect to HuggingFace.
 * 
 * HuggingFace API Base URL:
 * https://really-amin-datasourceforcryptocurrency-2.hf.space
 */
