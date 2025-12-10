/**
 * HuggingFace Data Context
 * 
 * Provides centralized access to all HuggingFace API data across the application.
 * This context manages data fetching, caching, and real-time updates.
 */

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { hfAPI, type MarketCoin, type GlobalSentiment, type NewsArticle, type AISignal, type HealthStatus } from '../services/HuggingFaceUnifiedAPI';
import { Logger } from '../core/Logger';

const logger = Logger.getInstance();

// ============================================================================
// Types
// ============================================================================

interface HuggingFaceDataState {
  // Market Data
  topCoins: MarketCoin[];
  trendingCoins: MarketCoin[];
  
  // Sentiment
  globalSentiment: GlobalSentiment | null;
  
  // News
  latestNews: NewsArticle[];
  
  // AI
  aiSignals: AISignal[];
  
  // System
  apiHealth: HealthStatus | null;
  
  // Meta
  lastUpdated: {
    market: number | null;
    sentiment: number | null;
    news: number | null;
    signals: number | null;
    health: number | null;
  };
  
  // Loading states
  loading: {
    market: boolean;
    sentiment: boolean;
    news: boolean;
    signals: boolean;
    all: boolean;
  };
  
  // Errors
  errors: {
    market: string | null;
    sentiment: string | null;
    news: string | null;
    signals: string | null;
  };
}

interface HuggingFaceDataContextValue extends HuggingFaceDataState {
  // Refresh functions
  refreshMarket: () => Promise<void>;
  refreshSentiment: () => Promise<void>;
  refreshNews: () => Promise<void>;
  refreshSignals: () => Promise<void>;
  refreshAll: () => Promise<void>;
  
  // Utility
  isConnected: boolean;
  baseUrl: string;
}

const defaultState: HuggingFaceDataState = {
  topCoins: [],
  trendingCoins: [],
  globalSentiment: null,
  latestNews: [],
  aiSignals: [],
  apiHealth: null,
  lastUpdated: {
    market: null,
    sentiment: null,
    news: null,
    signals: null,
    health: null,
  },
  loading: {
    market: false,
    sentiment: false,
    news: false,
    signals: false,
    all: true,
  },
  errors: {
    market: null,
    sentiment: null,
    news: null,
    signals: null,
  },
};

// ============================================================================
// Context
// ============================================================================

const HuggingFaceDataContext = createContext<HuggingFaceDataContextValue | null>(null);

// ============================================================================
// Provider
// ============================================================================

interface HuggingFaceDataProviderProps {
  children: React.ReactNode;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export const HuggingFaceDataProvider: React.FC<HuggingFaceDataProviderProps> = ({
  children,
  autoRefresh = true,
  refreshInterval = 30000, // 30 seconds default
}) => {
  const [state, setState] = useState<HuggingFaceDataState>(defaultState);
  const [isConnected, setIsConnected] = useState(false);
  
  const mountedRef = useRef(true);
  const refreshIntervalRef = useRef<ReturnType<typeof setInterval>>();

  // Refresh market data
  const refreshMarket = useCallback(async () => {
    if (!mountedRef.current) return;
    
    setState(prev => ({
      ...prev,
      loading: { ...prev.loading, market: true },
      errors: { ...prev.errors, market: null },
    }));

    try {
      const [topCoinsResponse, trendingResponse] = await Promise.all([
        hfAPI.getTopCoins(50),
        hfAPI.getTrendingCoins(),
      ]);

      if (!mountedRef.current) return;

      setState(prev => ({
        ...prev,
        topCoins: topCoinsResponse.success && topCoinsResponse.data ? topCoinsResponse.data : prev.topCoins,
        trendingCoins: trendingResponse.success && trendingResponse.data ? trendingResponse.data : prev.trendingCoins,
        loading: { ...prev.loading, market: false },
        lastUpdated: { ...prev.lastUpdated, market: Date.now() },
      }));
    } catch (error) {
      if (!mountedRef.current) return;
      
      logger.error('Failed to refresh market data', {}, error as Error);
      setState(prev => ({
        ...prev,
        loading: { ...prev.loading, market: false },
        errors: { ...prev.errors, market: 'Failed to load market data' },
      }));
    }
  }, []);

  // Refresh sentiment
  const refreshSentiment = useCallback(async () => {
    if (!mountedRef.current) return;
    
    setState(prev => ({
      ...prev,
      loading: { ...prev.loading, sentiment: true },
      errors: { ...prev.errors, sentiment: null },
    }));

    try {
      const response = await hfAPI.getGlobalSentiment();

      if (!mountedRef.current) return;

      setState(prev => ({
        ...prev,
        globalSentiment: response.success && response.data ? response.data : prev.globalSentiment,
        loading: { ...prev.loading, sentiment: false },
        lastUpdated: { ...prev.lastUpdated, sentiment: Date.now() },
      }));
    } catch (error) {
      if (!mountedRef.current) return;
      
      logger.error('Failed to refresh sentiment', {}, error as Error);
      setState(prev => ({
        ...prev,
        loading: { ...prev.loading, sentiment: false },
        errors: { ...prev.errors, sentiment: 'Failed to load sentiment' },
      }));
    }
  }, []);

  // Refresh news
  const refreshNews = useCallback(async () => {
    if (!mountedRef.current) return;
    
    setState(prev => ({
      ...prev,
      loading: { ...prev.loading, news: true },
      errors: { ...prev.errors, news: null },
    }));

    try {
      const response = await hfAPI.getLatestNews(20);

      if (!mountedRef.current) return;

      setState(prev => ({
        ...prev,
        latestNews: response.success && response.data ? response.data : prev.latestNews,
        loading: { ...prev.loading, news: false },
        lastUpdated: { ...prev.lastUpdated, news: Date.now() },
      }));
    } catch (error) {
      if (!mountedRef.current) return;
      
      logger.error('Failed to refresh news', {}, error as Error);
      setState(prev => ({
        ...prev,
        loading: { ...prev.loading, news: false },
        errors: { ...prev.errors, news: 'Failed to load news' },
      }));
    }
  }, []);

  // Refresh AI signals
  const refreshSignals = useCallback(async () => {
    if (!mountedRef.current) return;
    
    setState(prev => ({
      ...prev,
      loading: { ...prev.loading, signals: true },
      errors: { ...prev.errors, signals: null },
    }));

    try {
      const response = await hfAPI.getAISignals();

      if (!mountedRef.current) return;

      setState(prev => ({
        ...prev,
        aiSignals: response.success && response.data ? response.data : prev.aiSignals,
        loading: { ...prev.loading, signals: false },
        lastUpdated: { ...prev.lastUpdated, signals: Date.now() },
      }));
    } catch (error) {
      if (!mountedRef.current) return;
      
      logger.error('Failed to refresh AI signals', {}, error as Error);
      setState(prev => ({
        ...prev,
        loading: { ...prev.loading, signals: false },
        errors: { ...prev.errors, signals: 'Failed to load AI signals' },
      }));
    }
  }, []);

  // Refresh all data
  const refreshAll = useCallback(async () => {
    if (!mountedRef.current) return;
    
    setState(prev => ({
      ...prev,
      loading: { ...prev.loading, all: true },
    }));

    // Check health first
    const healthResponse = await hfAPI.getHealth();
    if (healthResponse.success && healthResponse.data) {
      setIsConnected(healthResponse.data.status === 'healthy');
      setState(prev => ({
        ...prev,
        apiHealth: healthResponse.data!,
        lastUpdated: { ...prev.lastUpdated, health: Date.now() },
      }));
    }

    // Fetch all data in parallel
    await Promise.all([
      refreshMarket(),
      refreshSentiment(),
      refreshNews(),
      refreshSignals(),
    ]);

    if (!mountedRef.current) return;

    setState(prev => ({
      ...prev,
      loading: { ...prev.loading, all: false },
    }));
  }, [refreshMarket, refreshSentiment, refreshNews, refreshSignals]);

  // Initial fetch and auto-refresh setup
  useEffect(() => {
    mountedRef.current = true;
    
    // Initial fetch
    refreshAll();

    // Setup auto-refresh
    if (autoRefresh && refreshInterval > 0) {
      refreshIntervalRef.current = setInterval(() => {
        refreshAll();
      }, refreshInterval);
    }

    return () => {
      mountedRef.current = false;
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, [autoRefresh, refreshInterval, refreshAll]);

  const value: HuggingFaceDataContextValue = {
    ...state,
    refreshMarket,
    refreshSentiment,
    refreshNews,
    refreshSignals,
    refreshAll,
    isConnected,
    baseUrl: hfAPI.getConfig().baseUrl,
  };

  return (
    <HuggingFaceDataContext.Provider value={value}>
      {children}
    </HuggingFaceDataContext.Provider>
  );
};

// ============================================================================
// Hook
// ============================================================================

export function useHuggingFaceData(): HuggingFaceDataContextValue {
  const context = useContext(HuggingFaceDataContext);
  
  if (!context) {
    throw new Error('useHuggingFaceData must be used within a HuggingFaceDataProvider');
  }
  
  return context;
}

// ============================================================================
// Selector Hooks
// ============================================================================

export function useMarketCoins() {
  const { topCoins, loading, errors, refreshMarket, lastUpdated } = useHuggingFaceData();
  return {
    coins: topCoins,
    loading: loading.market,
    error: errors.market,
    refresh: refreshMarket,
    lastUpdated: lastUpdated.market,
  };
}

export function useTrendingCoins() {
  const { trendingCoins, loading, refreshMarket, lastUpdated } = useHuggingFaceData();
  return {
    coins: trendingCoins,
    loading: loading.market,
    refresh: refreshMarket,
    lastUpdated: lastUpdated.market,
  };
}

export function useMarketSentiment() {
  const { globalSentiment, loading, errors, refreshSentiment, lastUpdated } = useHuggingFaceData();
  return {
    sentiment: globalSentiment,
    loading: loading.sentiment,
    error: errors.sentiment,
    refresh: refreshSentiment,
    lastUpdated: lastUpdated.sentiment,
  };
}

export function useNewsData() {
  const { latestNews, loading, errors, refreshNews, lastUpdated } = useHuggingFaceData();
  return {
    news: latestNews,
    loading: loading.news,
    error: errors.news,
    refresh: refreshNews,
    lastUpdated: lastUpdated.news,
  };
}

export function useAISignalsData() {
  const { aiSignals, loading, errors, refreshSignals, lastUpdated } = useHuggingFaceData();
  return {
    signals: aiSignals,
    loading: loading.signals,
    error: errors.signals,
    refresh: refreshSignals,
    lastUpdated: lastUpdated.signals,
  };
}

export function useAPIStatus() {
  const { apiHealth, isConnected, baseUrl, lastUpdated } = useHuggingFaceData();
  return {
    health: apiHealth,
    isConnected,
    baseUrl,
    lastUpdated: lastUpdated.health,
  };
}
