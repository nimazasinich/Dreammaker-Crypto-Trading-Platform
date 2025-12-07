/**
 * Dashboard Data Service
 * 
 * سرویس مخصوص داشبورد که تمام داده‌های مورد نیاز را از قبل آماده می‌کند
 * این سرویس به محض لود شدن سیستم، داده‌ها را دریافت و کش می‌کند
 */

import { dataService, ServiceResponse } from './DataService';
import { Logger } from '../core/Logger';

const logger = Logger.getInstance();

// ============================================================================
// Types
// ============================================================================

export interface DashboardStats {
  portfolioValue: number;
  portfolioChange: number;
  totalPnL: number;
  pnlPercentage: number;
  activePositions: number;
  winRate: number;
  totalTrades: number;
  avgWin: number;
  avgLoss: number;
}

export interface MarketSummary {
  totalMarketCap: number;
  totalVolume24h: number;
  btcDominance: number;
  ethDominance: number;
  marketCapChange24h: number;
  topGainer: {
    symbol: string;
    change: number;
  };
  topLoser: {
    symbol: string;
    change: number;
  };
}

export interface DashboardData {
  stats: DashboardStats;
  marketSummary: MarketSummary;
  topCoins: Array<{
    symbol: string;
    name: string;
    price: number;
    change_24h: number;
    volume_24h: number;
    market_cap: number;
    rank: number;
  }>;
  priceChart: Array<{
    timestamp: number;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
  }>;
  signals: Array<{
    symbol: string;
    action: 'buy' | 'sell' | 'hold';
    confidence: number;
    timestamp: string;
  }>;
  sentiment: {
    fearGreedIndex: number;
    sentiment: string;
    value: number;
  };
  news: Array<{
    title: string;
    url: string;
    source: string;
    published_at: string;
    sentiment?: string;
  }>;
  lastUpdate: number;
}

// ============================================================================
// Dashboard Data Service Class
// ============================================================================

class DashboardDataService {
  private logger = Logger.getInstance();
  private cachedData: DashboardData | null = null;
  private isLoading = false;
  private loadPromise: Promise<DashboardData> | null = null;
  private refreshInterval: NodeJS.Timeout | null = null;
  private readonly REFRESH_INTERVAL = 30000; // 30 ثانیه

  constructor() {
    // شروع خودکار دریافت داده‌ها
    this.startAutoRefresh();
  }

  /**
   * دریافت تمام داده‌های داشبورد
   */
  async getDashboardData(forceRefresh = false): Promise<DashboardData> {
    if (this.isLoading && this.loadPromise) {
      return this.loadPromise;
    }

    if (!forceRefresh && this.cachedData && this.isCacheValid()) {
      return this.cachedData;
    }

    this.isLoading = true;
    this.loadPromise = this.fetchAllDashboardData();

    try {
      const data = await this.loadPromise;
      this.cachedData = data;
      return data;
    } catch (error) {
      this.logger.error('getDashboardData failed, returning default data', {}, error as Error);
      const defaultData = this.getDefaultDashboardData();
      this.cachedData = defaultData;
      return defaultData;
    } finally {
      this.isLoading = false;
      this.loadPromise = null;
    }
  }

  /**
   * بررسی اعتبار کش
   */
  private isCacheValid(): boolean {
    if (!this.cachedData) return false;
    const now = Date.now();
    const cacheAge = now - this.cachedData.lastUpdate;
    return cacheAge < this.REFRESH_INTERVAL;
  }

  private async fetchAllDashboardData(): Promise<DashboardData> {
    this.logger.info('Fetching all dashboard data...');

    try {
      const result = await dataService.fetchAllRequiredData({
        marketLimit: 100,
        chartSymbol: 'BTC',
        chartTimeframe: '1h',
        chartLimit: 100,
        newsLimit: 10,
        includeAI: false
      });

      if (!result.success) {
        throw new Error(`Failed to fetch data: ${result.summary.failed}/${result.summary.total} requests failed`);
      }

      const dashboardData: DashboardData = {
        stats: this.calculateStats(result.data.market),
        marketSummary: this.calculateMarketSummary(result.data.market, result.data.stats),
        topCoins: this.extractTopCoins(result.data.market),
        priceChart: this.extractPriceChart(result.data.chart),
        signals: this.extractSignals(result.data.ai),
        sentiment: this.extractSentiment(result.data.sentiment),
        news: this.extractNews(result.data.news),
        lastUpdate: Date.now()
      };

      this.logger.info('Dashboard data fetched successfully', {
        topCoins: dashboardData.topCoins.length,
        chartPoints: dashboardData.priceChart.length,
        signals: dashboardData.signals.length,
        news: dashboardData.news.length,
        method: result.data.market.method || 'http'
      });

      return dashboardData;

    } catch (error) {
      this.logger.error('Failed to fetch dashboard data', {}, error as Error);
      throw error;
      return this.getDefaultDashboardData();
    }
  }

  /**
   * محاسبه آمار داشبورد
   */
  private calculateStats(marketResponse: ServiceResponse<any>): DashboardStats {
    // این داده‌ها معمولاً از API کاربر می‌آید
    // فعلاً داده‌های نمونه برمی‌گردانیم
    return {
      portfolioValue: 125430.50,
      portfolioChange: 2.34,
      totalPnL: 12430.50,
      pnlPercentage: 10.98,
      activePositions: 8,
      winRate: 68,
      totalTrades: 156,
      avgWin: 245.50,
      avgLoss: -123.20
    };
  }

  /**
   * محاسبه خلاصه بازار
   */
  private calculateMarketSummary(
    marketResponse: ServiceResponse<any>,
    statsResponse: ServiceResponse<any>
  ): MarketSummary {
    const stats = statsResponse.data || {};
    const marketData = this.extractMarketArray(marketResponse);

    // پیدا کردن بیشترین و کمترین تغییر
    let topGainer = { symbol: 'BTC', change: 0 };
    let topLoser = { symbol: 'ETH', change: 0 };

    if (marketData.length > 0) {
      marketData.forEach(coin => {
        if (coin.change_24h > topGainer.change) {
          topGainer = { symbol: coin.symbol, change: coin.change_24h };
        }
        if (coin.change_24h < topLoser.change) {
          topLoser = { symbol: coin.symbol, change: coin.change_24h };
        }
      });
    }

    return {
      totalMarketCap: stats.totalMarketCap || 0,
      totalVolume24h: stats.totalVolume24h || 0,
      btcDominance: stats.btcDominance || 0,
      ethDominance: stats.ethDominance || 0,
      marketCapChange24h: stats.marketCapChange24h || 0,
      topGainer,
      topLoser
    };
  }

  /**
   * استخراج لیست ارزهای برتر
   */
  private extractTopCoins(marketResponse: ServiceResponse<any>) {
    const marketData = this.extractMarketArray(marketResponse);
    return marketData.slice(0, 20).map(coin => ({
      symbol: coin.symbol || '',
      name: coin.name || coin.symbol || '',
      price: coin.price || 0,
      change_24h: coin.change_24h || 0,
      volume_24h: coin.volume_24h || 0,
      market_cap: coin.market_cap || 0,
      rank: coin.rank || 0
    }));
  }

  /**
   * استخراج داده‌های نمودار
   */
  private extractPriceChart(chartResponse: ServiceResponse<any>) {
    if (!chartResponse.success || !chartResponse.data) {
      return [];
    }

    const chartData = Array.isArray(chartResponse.data) 
      ? chartResponse.data 
      : [];

    return chartData.map(candle => ({
      timestamp: candle.timestamp || Date.now(),
      open: candle.open || 0,
      high: candle.high || 0,
      low: candle.low || 0,
      close: candle.close || 0,
      volume: candle.volume || 0
    }));
  }

  /**
   * استخراج سیگنال‌های AI
   */
  private extractSignals(aiResponse?: ServiceResponse<any>) {
    if (!aiResponse || !aiResponse.success || !aiResponse.data) {
      return [];
    }

    const aiData = aiResponse.data;
    
    // اگر یک سیگنال واحد است
    if (aiData.symbol && aiData.action) {
      return [{
        symbol: aiData.symbol,
        action: aiData.action,
        confidence: aiData.confidence || 0,
        timestamp: aiData.timestamp || new Date().toISOString()
      }];
    }

    // اگر آرایه‌ای از سیگنال‌ها است
    if (Array.isArray(aiData)) {
      return aiData.map(signal => ({
        symbol: signal.symbol || '',
        action: signal.action || 'hold',
        confidence: signal.confidence || 0,
        timestamp: signal.timestamp || new Date().toISOString()
      }));
    }

    return [];
  }

  /**
   * استخراج احساسات بازار
   */
  private extractSentiment(sentimentResponse: ServiceResponse<any>) {
    if (!sentimentResponse.success || !sentimentResponse.data) {
      return {
        fearGreedIndex: 50,
        sentiment: 'neutral',
        value: 50
      };
    }

    const data = sentimentResponse.data;
    return {
      fearGreedIndex: data.fearGreedIndex || data.value || 50,
      sentiment: data.sentiment || data.value_classification || 'neutral',
      value: data.value || data.score || 50
    };
  }

  /**
   * استخراج اخبار
   */
  private extractNews(newsResponse: ServiceResponse<any>) {
    if (!newsResponse.success || !newsResponse.data) {
      return [];
    }

    const newsData = Array.isArray(newsResponse.data)
      ? newsResponse.data
      : newsResponse.data.news || newsResponse.data.items || newsResponse.data.data || [];

    return newsData.slice(0, 10).map(news => ({
      title: news.title || '',
      url: news.url || '',
      source: news.source || 'Unknown',
      published_at: news.published_at || new Date().toISOString(),
      sentiment: news.sentiment
    }));
  }

  /**
   * استخراج آرایه داده‌های بازار
   */
  private extractMarketArray(marketResponse: ServiceResponse<any>): any[] {
    if (!marketResponse.success || !marketResponse.data) {
      return [];
    }

    return Array.isArray(marketResponse.data)
      ? marketResponse.data
      : marketResponse.data.items || marketResponse.data.data || [];
  }

  /**
   * داده‌های پیش‌فرض در صورت خطا
   */
  private getDefaultDashboardData(): DashboardData {
    return {
      stats: {
        portfolioValue: 0,
        portfolioChange: 0,
        totalPnL: 0,
        pnlPercentage: 0,
        activePositions: 0,
        winRate: 0,
        totalTrades: 0,
        avgWin: 0,
        avgLoss: 0
      },
      marketSummary: {
        totalMarketCap: 0,
        totalVolume24h: 0,
        btcDominance: 0,
        ethDominance: 0,
        marketCapChange24h: 0,
        topGainer: { symbol: '', change: 0 },
        topLoser: { symbol: '', change: 0 }
      },
      topCoins: [],
      priceChart: [],
      signals: [],
      sentiment: {
        fearGreedIndex: 50,
        sentiment: 'neutral',
        value: 50
      },
      news: [],
      lastUpdate: Date.now()
    };
  }

  /**
   * شروع به‌روزرسانی خودکار
   */
  startAutoRefresh(): void {
    // دریافت اولیه
    this.getDashboardData().catch(err => {
      this.logger.error('Initial dashboard data fetch failed', {}, err);
    });

    // تنظیم interval برای به‌روزرسانی دوره‌ای
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }

    this.refreshInterval = setInterval(() => {
      this.getDashboardData(true).catch(err => {
        this.logger.error('Auto refresh failed', {}, err);
      });
    }, this.REFRESH_INTERVAL);

    this.logger.info('Dashboard auto-refresh started', {
      interval: this.REFRESH_INTERVAL
    });
  }

  /**
   * توقف به‌روزرسانی خودکار
   */
  stopAutoRefresh(): void {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
      this.refreshInterval = null;
      this.logger.info('Dashboard auto-refresh stopped');
    }
  }

  /**
   * پاک کردن کش
   */
  clearCache(): void {
    this.cachedData = null;
    this.logger.info('Dashboard cache cleared');
  }

  /**
   * دریافت وضعیت سرویس
   */
  getStatus() {
    return {
      isLoading: this.isLoading,
      hasCachedData: !!this.cachedData,
      cacheAge: this.cachedData ? Date.now() - this.cachedData.lastUpdate : null,
      autoRefreshActive: !!this.refreshInterval
    };
  }
}

// ============================================================================
// Export Singleton
// ============================================================================

export const dashboardDataService = new DashboardDataService();

export default DashboardDataService;
