/**
 * React Hooks for HuggingFace API Integration
 * 
 * These hooks provide easy access to the HuggingFace Unified API
 * with built-in loading states, error handling, and auto-refresh.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { hfAPI, type APIResponse, type MarketCoin, type GlobalSentiment, type NewsArticle, type AISignal, type OHLCVCandle, type QuickTAResult, type RiskAssessment } from '../services/HuggingFaceUnifiedAPI';

// ============================================================================
// Common Types
// ============================================================================

interface UseAPIState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  lastUpdated: number | null;
}

interface UseAPIOptions {
  autoFetch?: boolean;
  refreshInterval?: number;
  onSuccess?: (data: unknown) => void;
  onError?: (error: string) => void;
}

// ============================================================================
// Generic API Hook
// ============================================================================

function useAPICall<T>(
  apiCall: () => Promise<APIResponse<T>>,
  options: UseAPIOptions = {}
): UseAPIState<T> & { refresh: () => Promise<void> } {
  const { autoFetch = true, refreshInterval, onSuccess, onError } = options;
  
  const [state, setState] = useState<UseAPIState<T>>({
    data: null,
    loading: autoFetch,
    error: null,
    lastUpdated: null,
  });

  const mountedRef = useRef(true);
  const intervalRef = useRef<ReturnType<typeof setInterval>>();

  const fetchData = useCallback(async () => {
    if (!mountedRef.current) return;
    
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const response = await apiCall();
      
      if (!mountedRef.current) return;
      
      if (response.success && response.data) {
        setState({
          data: response.data,
          loading: false,
          error: null,
          lastUpdated: Date.now(),
        });
        onSuccess?.(response.data);
      } else {
        const error = response.error || 'Failed to fetch data';
        setState(prev => ({
          ...prev,
          loading: false,
          error,
        }));
        onError?.(error);
      }
    } catch (err) {
      if (!mountedRef.current) return;
      
      const error = err instanceof Error ? err.message : 'Unknown error';
      setState(prev => ({
        ...prev,
        loading: false,
        error,
      }));
      onError?.(error);
    }
  }, [apiCall, onSuccess, onError]);

  useEffect(() => {
    mountedRef.current = true;
    
    if (autoFetch) {
      fetchData();
    }
    
    if (refreshInterval && refreshInterval > 0) {
      intervalRef.current = setInterval(fetchData, refreshInterval);
    }
    
    return () => {
      mountedRef.current = false;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [autoFetch, refreshInterval, fetchData]);

  return {
    ...state,
    refresh: fetchData,
  };
}

// ============================================================================
// Market Data Hooks
// ============================================================================

/**
 * Hook for fetching top market coins
 */
export function useMarketData(limit = 50, options?: UseAPIOptions) {
  return useAPICall<MarketCoin[]>(
    useCallback(() => hfAPI.getTopCoins(limit), [limit]),
    options
  );
}

/**
 * Hook for fetching trending coins
 */
export function useTrendingCoins(options?: UseAPIOptions) {
  return useAPICall(
    useCallback(() => hfAPI.getTrendingCoins(), []),
    options
  );
}

/**
 * Hook for fetching price of a single coin
 */
export function useCoinPrice(symbol: string, options?: UseAPIOptions) {
  return useAPICall<MarketCoin>(
    useCallback(() => hfAPI.getPrice(symbol), [symbol]),
    options
  );
}

/**
 * Hook for fetching OHLCV data
 */
export function useOHLCV(
  symbol: string,
  timeframe = '1h',
  limit = 100,
  options?: UseAPIOptions
) {
  return useAPICall<OHLCVCandle[]>(
    useCallback(
      () => hfAPI.getOHLCV(symbol, timeframe, limit),
      [symbol, timeframe, limit]
    ),
    options
  );
}

// ============================================================================
// Sentiment Hooks
// ============================================================================

/**
 * Hook for fetching global market sentiment
 */
export function useGlobalSentiment(options?: UseAPIOptions) {
  return useAPICall<GlobalSentiment>(
    useCallback(() => hfAPI.getGlobalSentiment(), []),
    { refreshInterval: 300000, ...options } // Default 5 min refresh
  );
}

/**
 * Hook for fetching asset sentiment
 */
export function useAssetSentiment(symbol: string, options?: UseAPIOptions) {
  return useAPICall(
    useCallback(() => hfAPI.getAssetSentiment(symbol), [symbol]),
    options
  );
}

// ============================================================================
// News Hooks
// ============================================================================

/**
 * Hook for fetching latest news
 */
export function useLatestNews(limit = 10, options?: UseAPIOptions) {
  return useAPICall<NewsArticle[]>(
    useCallback(() => hfAPI.getLatestNews(limit), [limit]),
    { refreshInterval: 60000, ...options } // Default 1 min refresh
  );
}

/**
 * Hook for fetching news by source
 */
export function useNewsBySource(source: string, limit = 10, options?: UseAPIOptions) {
  return useAPICall<NewsArticle[]>(
    useCallback(() => hfAPI.getNewsBySource(source, limit), [source, limit]),
    options
  );
}

// ============================================================================
// AI Hooks
// ============================================================================

/**
 * Hook for fetching AI trading signals
 */
export function useAISignals(options?: UseAPIOptions) {
  return useAPICall<AISignal[]>(
    useCallback(() => hfAPI.getAISignals(), []),
    { refreshInterval: 30000, ...options } // Default 30 sec refresh
  );
}

/**
 * Hook for fetching AI decision for a symbol
 */
export function useAIDecision(symbol: string, timeframe = '1h', options?: UseAPIOptions) {
  return useAPICall(
    useCallback(() => hfAPI.getAIDecision(symbol, timeframe), [symbol, timeframe]),
    options
  );
}

/**
 * Hook for fetching models status
 */
export function useModelsStatus(options?: UseAPIOptions) {
  return useAPICall(
    useCallback(() => hfAPI.getModelsStatus(), []),
    options
  );
}

// ============================================================================
// Technical Analysis Hooks
// ============================================================================

/**
 * Hook for quick technical analysis
 */
export function useQuickTA(symbol: string, options?: UseAPIOptions) {
  return useAPICall<QuickTAResult>(
    useCallback(() => hfAPI.getQuickTA(symbol), [symbol]),
    options
  );
}

/**
 * Hook for comprehensive technical analysis
 */
export function useComprehensiveTA(symbol: string, options?: UseAPIOptions) {
  return useAPICall(
    useCallback(() => hfAPI.getComprehensiveTA(symbol), [symbol]),
    options
  );
}

/**
 * Hook for risk assessment
 */
export function useRiskAssessment(symbol: string, options?: UseAPIOptions) {
  return useAPICall<RiskAssessment>(
    useCallback(() => hfAPI.getRiskAssessment(symbol), [symbol]),
    options
  );
}

// ============================================================================
// System Hooks
// ============================================================================

/**
 * Hook for API health status
 */
export function useAPIHealth(options?: UseAPIOptions) {
  return useAPICall(
    useCallback(() => hfAPI.getHealth(), []),
    { refreshInterval: 60000, ...options }
  );
}

/**
 * Hook for system status
 */
export function useSystemStatus(options?: UseAPIOptions) {
  return useAPICall(
    useCallback(() => hfAPI.getStatus(), []),
    options
  );
}

// ============================================================================
// Dashboard Hook (Combined Data)
// ============================================================================

interface DashboardData {
  market: MarketCoin[] | null;
  sentiment: GlobalSentiment | null;
  news: NewsArticle[] | null;
  signals: AISignal[] | null;
}

/**
 * Hook for fetching all dashboard data at once
 */
export function useDashboardData(options?: UseAPIOptions) {
  const [state, setState] = useState<UseAPIState<DashboardData>>({
    data: null,
    loading: true,
    error: null,
    lastUpdated: null,
  });

  const mountedRef = useRef(true);
  const intervalRef = useRef<ReturnType<typeof setInterval>>();

  const fetchData = useCallback(async () => {
    if (!mountedRef.current) return;

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const result = await hfAPI.getDashboardData();

      if (!mountedRef.current) return;

      const data: DashboardData = {
        market: result.market.success ? result.market.data ?? null : null,
        sentiment: result.sentiment.success ? result.sentiment.data ?? null : null,
        news: result.news.success ? result.news.data ?? null : null,
        signals: result.signals.success ? result.signals.data ?? null : null,
      };

      setState({
        data,
        loading: false,
        error: null,
        lastUpdated: Date.now(),
      });
    } catch (err) {
      if (!mountedRef.current) return;

      setState(prev => ({
        ...prev,
        loading: false,
        error: err instanceof Error ? err.message : 'Unknown error',
      }));
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;

    if (options?.autoFetch !== false) {
      fetchData();
    }

    const interval = options?.refreshInterval || 30000;
    if (interval > 0) {
      intervalRef.current = setInterval(fetchData, interval);
    }

    return () => {
      mountedRef.current = false;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [fetchData, options?.autoFetch, options?.refreshInterval]);

  return {
    ...state,
    refresh: fetchData,
  };
}

// ============================================================================
// Export All
// ============================================================================

export {
  useAPICall,
  type UseAPIState,
  type UseAPIOptions,
};
