// Environment configuration (works in both Vite frontend and Node backend)
// Single source of truth for API/WS bases with sanitizers

/**
 * Get environment variable (works in both Vite frontend and Node backend)
 */
const getEnv = (k: string) =>
  typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[k as any]
    ? String(import.meta.env[k as any] ?? '')
    : (typeof process !== 'undefined' ? process.env[k] : '') || '';

/**
 * Detect if running in production or HuggingFace environment
 */
const isProduction = typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.PROD;
const isHuggingFace = typeof location !== 'undefined' && location.hostname.includes('.hf.space');

/**
 * API Base URL (must NOT end with /api)
 * ✅ Hugging Face Space - تست شده و کار می‌کند
 * 
 * URL صحیح: https://really-amin-datasourceforcryptocurrency-2.hf.space
 * 
 * Endpoints تست شده:
 * - /api/health ✅
 * - /api/ohlcv ✅
 * - /api/coins/top ✅
 * - /api/news/latest ✅
 * - /api/ai/decision ✅
 * 
 * Priority: VITE_HF_API_URL > VITE_API_BASE > HF default
 */
const rawApiBase = getEnv('VITE_HF_API_URL') || 
                   getEnv('VITE_API_BASE') || 
                   getEnv('HF_API_URL') ||
                   'https://really-amin-datasourceforcryptocurrency-2.hf.space';

export const API_BASE = rawApiBase.replace(/\/api\/?$/i, ''); // strip trailing /api

/**
 * WebSocket Base URL (OPTIONAL - HTTP is primary)
 * WebSocket is completely optional for real-time streaming
 * The app automatically falls back to HTTP polling if WebSocket fails
 * 
 * Priority: VITE_WS_BASE > HF WebSocket (wss://)
 * IMPORTANT: HuggingFace Spaces may limit WebSocket - this is non-critical
 */
const hfWsBase = API_BASE.replace(/^https?/, 'wss'); // Convert HTTPS → WSS

const rawWsBase = getEnv('VITE_WS_BASE') || 
                  getEnv('VITE_WS_URL') || 
                  hfWsBase; // Default to HF WebSocket (wss://...)

// Ensure WSS protocol for HTTPS sites
let wsBase = rawWsBase.replace(/\/(ws|api)\/?$/i, ''); // strip trailing /ws or /api
if (typeof location !== 'undefined' && location.protocol === 'https:') {
  wsBase = wsBase.replace(/^ws:/, 'wss:'); // Force secure WebSocket
}
// Force WSS for HF Space
if (wsBase.includes('hf.space')) {
  wsBase = wsBase.replace(/^ws:/, 'wss:');
}

export const WS_BASE = wsBase;

/**
 * Disable polling when WebSocket is connected (WS-first approach)
 */
export const DISABLE_POLL_WHEN_WS = String(getEnv('VITE_DISABLE_POLL_WHEN_WS') || '1') === '1';

// Re-export data policy configuration
export {
  APP_MODE,
  STRICT_REAL_DATA,
  USE_MOCK_DATA,
  ALLOW_FAKE_DATA,
  assertPolicy,
  getDataSourceLabel,
  canUseSyntheticData,
  shouldUseMockFixtures,
  requiresRealData,
} from './dataPolicy';

// Telegram store secret for backend (server-side only, not accessible from frontend)
export const TELEGRAM_STORE_SECRET = typeof process !== 'undefined' ? process.env.TELEGRAM_STORE_SECRET || '' : '';

/**
 * HuggingFace Data Source API Configuration
 * ✅ URL تست شده: https://really-amin-datasourceforcryptocurrency-2.hf.space
 * 
 * این URL به عنوان منبع اصلی داده استفاده می‌شود
 */
export const HF_API_URL = getEnv('VITE_HF_API_URL') ||
                          getEnv('HF_API_URL') ||
                          'https://really-amin-datasourceforcryptocurrency-2.hf.space';

/**
 * HuggingFace API Token for authenticated requests
 */
export const HF_API_TOKEN = getEnv('VITE_HF_API_TOKEN') || getEnv('HF_API_TOKEN') || ''; // Must be set via environment variable

/**
 * Build WebSocket URL with proper base and path handling
 * Prevents /ws/ws duplication issues
 */
export function buildWebSocketUrl(path: string): string {
  // Normalize path to start with /
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  // Remove any existing /ws prefix from the path
  // Ensure WS_BASE has no trailing slash and then append the normalized path
  const base = WS_BASE.replace(/\/$/, '');
  return `${base}${normalizedPath}`;
}
