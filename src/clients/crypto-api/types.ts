/**
 * Type definitions for Crypto Data API Client
 * Base URL: https://really-amin-datasourceforcryptocurrency-2.hf.space
 */

// ============================================
// Health & Status Types
// ============================================

export interface HealthResponse {
  status: string;
  timestamp: string;
  service: string;
  version: string;
}

export interface StatusResponse {
  status: string;
  uptime: number;
  timestamp: string;
  services?: Record<string, any>;
}

export interface RouterInfo {
  path: string;
  method: string;
  status: string;
  description?: string;
}

export interface RoutersResponse {
  routers: RouterInfo[];
  total: number;
  timestamp: string;
}

// ============================================
// Price & Rate Types
// ============================================

export interface RateResponse {
  pair: string;
  price: number;
  change24h: number;
  volume24h: number;
  timestamp: string;
}

export interface BatchRatesResponse {
  rates: RateResponse[];
  count: number;
  timestamp: string;
}

export interface CoinData {
  id: string;
  rank: number;
  symbol: string;
  name: string;
  price: number;
  market_cap: number;
  volume_24h: number;
  change_24h: number;
  change_7d: number;
  image?: string;
}

export interface TopCoinsResponse {
  coins: CoinData[];
  count: number;
  timestamp: string;
}

export interface TrendingCoin {
  id: string;
  symbol: string;
  name: string;
  rank: number;
  score: number;
  market_cap_rank?: number;
  thumb?: string;
}

export interface TrendingResponse {
  coins: TrendingCoin[];
  timestamp: string;
}

// ============================================
// Market Data Types
// ============================================

export interface MarketResponse {
  total_market_cap: number;
  total_volume: number;
  btc_dominance: number;
  eth_dominance: number;
  active_coins: number;
  timestamp: string;
}

export interface MarketStatusResponse {
  status: string;
  markets_count: number;
  active_exchanges: number;
  timestamp: string;
  details?: Record<string, any>;
}

export interface HistoryDataPoint {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface HistoryResponse {
  symbol: string;
  interval: string;
  data: HistoryDataPoint[];
  count: number;
  timestamp: string;
}

// ============================================
// Sentiment Analysis Types
// ============================================

export type SentimentValue = "extreme_fear" | "fear" | "neutral" | "greed" | "extreme_greed";

export interface SentimentHistoryPoint {
  timestamp: number;
  sentiment: number;
  volume: number;
}

export interface SentimentResponse {
  fear_greed_index: number;
  sentiment: SentimentValue;
  market_mood: string;
  confidence: number;
  history: SentimentHistoryPoint[];
  timestamp: string;
}

export interface AssetSentimentResponse {
  symbol: string;
  sentiment: SentimentValue;
  score: number;
  confidence: number;
  sources: number;
  timestamp: string;
}

export interface TextAnalysisResponse {
  text: string;
  sentiment: SentimentValue;
  score: number;
  confidence: number;
  keywords: string[];
  entities?: string[];
  timestamp: string;
}

// ============================================
// News Types
// ============================================

export interface NewsArticle {
  id: string;
  title: string;
  description: string;
  content: string;
  source: string;
  published_at: string;
  url: string;
  sentiment: string;
  tags: string[];
}

export interface NewsResponse {
  articles: NewsArticle[];
  count: number;
  timestamp: string;
}

// ============================================
// AI Models Types
// ============================================

export interface ModelInfo {
  key: string;
  model_id: string;
  name: string;
  task: string;
  category: string;
  loaded: boolean;
  status: string;
}

export interface ModelsListResponse {
  models: ModelInfo[];
  count: number;
  timestamp: string;
}

export interface ModelStatusInfo {
  key: string;
  status: string;
  loaded: boolean;
  last_used?: string;
  error?: string;
}

export interface ModelsStatusResponse {
  models: ModelStatusInfo[];
  total: number;
  loaded: number;
  timestamp: string;
}

export interface ModelHealthInfo {
  key: string;
  health: string;
  latency_ms?: number;
  error_rate?: number;
}

export interface ModelsHealthResponse {
  models: ModelHealthInfo[];
  overall_health: string;
  timestamp: string;
}

export interface ModelsSummaryResponse {
  total_models: number;
  loaded_models: number;
  categories: Record<string, number>;
  tasks: Record<string, number>;
  timestamp: string;
}

export interface ModelTestResponse {
  model: string;
  test_result: any;
  success: boolean;
  latency_ms: number;
  timestamp: string;
}

export interface ReinitializeResponse {
  message: string;
  success: boolean;
  models_reinitialized: number;
  timestamp: string;
}

// ============================================
// AI Signals Types
// ============================================

export type SignalType = "buy" | "sell" | "hold";

export interface AISignal {
  id: string;
  symbol: string;
  type: SignalType;
  score: number;
  model: string;
  confidence: number;
  created_at: string;
}

export interface SignalsResponse {
  signals: AISignal[];
  count: number;
  timestamp: string;
}

export type TradingHorizon = "scalp" | "swing" | "position";
export type RiskTolerance = "conservative" | "moderate" | "aggressive";
export type DecisionType = "BUY" | "SELL" | "HOLD";

export interface AIDecisionRequest {
  symbol: string;
  horizon: TradingHorizon;
  risk_tolerance: RiskTolerance;
  context?: string;
}

export interface AIDecisionTargets {
  support: number;
  resistance: number;
  target: number;
}

export interface AIDecisionSignal {
  type: string;
  text: string;
}

export interface AIDecisionResponse {
  decision: DecisionType;
  confidence: number;
  summary: string;
  signals: AIDecisionSignal[];
  risks: string[];
  targets: AIDecisionTargets;
  timestamp: string;
}

// ============================================
// Resources Types
// ============================================

export interface ResourceStats {
  cpu_percent: number;
  memory_percent: number;
  disk_percent: number;
  network_active: boolean;
}

export interface ResourcesResponse {
  stats: ResourceStats;
  timestamp: string;
}

export interface ResourcesSummaryResponse {
  total_resources: number;
  available_resources: number;
  usage_percent: number;
  details: Record<string, any>;
  timestamp: string;
}

export interface ResourceCategory {
  name: string;
  count: number;
  types: string[];
}

export interface ResourceCategoriesResponse {
  categories: ResourceCategory[];
  total: number;
  timestamp: string;
}

export type ProviderStatus = "online" | "offline" | "degraded";

export interface ProviderInfo {
  id: string;
  name: string;
  status: ProviderStatus;
  type: string;
  latency_ms?: number;
  last_check?: string;
}

export interface ProvidersResponse {
  providers: ProviderInfo[];
  count: number;
  timestamp: string;
}

// ============================================
// Error Types
// ============================================

export interface APIErrorResponse {
  error: string;
  message: string;
  statusCode: number;
  timestamp: string;
}

// ============================================
// Client Configuration
// ============================================

export interface CryptoClientConfig {
  baseUrl?: string;
  timeout?: number;
  retries?: number;
  retryDelay?: number;
}
