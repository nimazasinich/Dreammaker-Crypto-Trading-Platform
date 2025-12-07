/**
 * HF Working Endpoints Service
 * 
 * Based on Python script testing: c:\Users\Dreammaker\Desktop\smoke_test_working_endpoints.py
 * Only uses endpoints that are confirmed to work on HF Space
 * 
 * Working Endpoints:
 * ✅ GET /api/health - Health check
 * ✅ GET /api/market/tickers - Market tickers (with limit, sort)
 * ✅ GET /api/news/latest - Latest news (with symbol, limit)
 * ✅ GET /api/news/headlines - Top headlines (with limit)
 * ✅ GET /api/news - Get news (with limit)
 */

import { Logger } from '../core/Logger';
import { HF_API_URL, HF_API_TOKEN } from '../config/env';

const logger = Logger.getInstance();

export interface MarketTicker {
  symbol: string;
  name?: string;
  price: number;
  change_24h: number;
  volume_24h?: number;
  market_cap?: number;
}

export interface NewsArticle {
  id: string;
  title: string;
  url: string;
  source?: string;
  published_at?: string;
  sentiment?: string;
  description?: string;
  summary?: string;
}

/**
 * Fetch market tickers (WORKING ✅)
 */
export async function fetchMarketTickers(params: {
  limit?: number;
  sort?: 'market_cap' | 'volume' | 'price';
} = {}): Promise<MarketTicker[]> {
  const { limit = 50, sort = 'market_cap' } = params;
  
  try {
    const url = new URL(`${HF_API_URL}/api/market/tickers`);
    url.searchParams.set('limit', limit.toString());
    url.searchParams.set('sort', sort);
    
    const response = await fetch(url.toString(), {
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${HF_API_TOKEN}`,
      },
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    const data = await response.json();
    logger.info(`✅ Fetched ${data.length || 0} market tickers`);
    
    return data;
  } catch (error: any) {
    logger.error('Failed to fetch market tickers', {}, error);
    return [];
  }
}

/**
 * Fetch latest news for a symbol (WORKING ✅)
 */
export async function fetchLatestNews(params: {
  symbol?: string;
  limit?: number;
} = {}): Promise<NewsArticle[]> {
  const { symbol = 'BTC', limit = 5 } = params;
  
  try {
    const url = new URL(`${HF_API_URL}/api/news/latest`);
    url.searchParams.set('symbol', symbol);
    url.searchParams.set('limit', limit.toString());
    
    const response = await fetch(url.toString(), {
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${HF_API_TOKEN}`,
      },
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    const data = await response.json();
    
    // Extract news array from response
    if (data.success && data.news) {
      logger.info(`✅ Fetched ${data.news.length} latest news for ${symbol}`);
      return data.news;
    }
    
    return [];
  } catch (error: any) {
    logger.error('Failed to fetch latest news', {}, error);
    return [];
  }
}

/**
 * Fetch top headlines (WORKING ✅)
 */
export async function fetchTopHeadlines(params: {
  limit?: number;
} = {}): Promise<NewsArticle[]> {
  const { limit = 10 } = params;
  
  try {
    const url = new URL(`${HF_API_URL}/api/news/headlines`);
    url.searchParams.set('limit', limit.toString());
    
    const response = await fetch(url.toString(), {
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${HF_API_TOKEN}`,
      },
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    const data = await response.json();
    logger.info(`✅ Fetched ${data.length || 0} top headlines`);
    
    return data;
  } catch (error: any) {
    logger.error('Failed to fetch top headlines', {}, error);
    return [];
  }
}

/**
 * Fetch general news (WORKING ✅)
 */
export async function fetchNews(params: {
  limit?: number;
} = {}): Promise<NewsArticle[]> {
  const { limit = 10 } = params;
  
  try {
    const url = new URL(`${HF_API_URL}/api/news`);
    url.searchParams.set('limit', limit.toString());
    
    const response = await fetch(url.toString(), {
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${HF_API_TOKEN}`,
      },
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    const data = await response.json();
    
    // Extract articles from response
    if (data.success && data.articles) {
      logger.info(`✅ Fetched ${data.articles.length} news articles`);
      return data.articles;
    }
    
    return [];
  } catch (error: any) {
    logger.error('Failed to fetch news', {}, error);
    return [];
  }
}

/**
 * Check API health (WORKING ✅)
 */
export async function checkHealth(): Promise<{
  status: 'healthy' | 'degraded' | 'down';
  details?: any;
}> {
  try {
    const response = await fetch(`${HF_API_URL}/api/health`, {
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${HF_API_TOKEN}`,
      },
    });
    
    if (!response.ok) {
      return { status: 'down' };
    }
    
    const data = await response.json();
    
    if (data.status === 'healthy') {
      logger.info('✅ HF API is healthy');
      return { status: 'healthy', details: data };
    }
    
    return { status: 'degraded', details: data };
  } catch (error: any) {
    logger.error('Health check failed', {}, error);
    return { status: 'down' };
  }
}

/**
 * Export all working endpoints
 */
export const HFWorkingEndpoints = {
  fetchMarketTickers,
  fetchLatestNews,
  fetchTopHeadlines,
  fetchNews,
  checkHealth,
};

export default HFWorkingEndpoints;

