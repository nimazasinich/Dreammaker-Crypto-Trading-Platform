/**
 * Services Export Index - HuggingFace Integration
 * 
 * Centralized export of all services.
 * All services now use HuggingFace Crypto API as the single data source.
 */

// ============================================
// PRIMARY API CLIENT
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

// ============================================
// LEGACY SERVICES (Deprecated - use CryptoAPI instead)
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
 * import { cryptoAPI } from '@/services';
 * const data = await cryptoAPI.getPrice('BTC/USDT');
 * ```
 * 
 * For backward compatibility, old services still work but redirect to HuggingFace.
 */
