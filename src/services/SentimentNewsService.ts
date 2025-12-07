/**
 * Sentiment & News Service - HuggingFace Integration
 * 
 * This service uses ONLY HuggingFace Crypto API for sentiment and news data.
 * All external API calls (NewsAPI, CryptoPanic, Alternative.me) have been removed.
 */

import { Logger } from '../core/Logger.js';
import { cryptoAPI } from './CryptoAPI';

export interface NewsItem {
  title: string;
  url: string;
  source: string;
  published: Date;
  sentiment: 'positive' | 'negative' | 'neutral';
  sentimentScore?: number;
}

export interface FearGreedIndex {
  value: number; // 0-100
  classification: string;
  timestamp: Date;
}

export interface SentimentData {
  fearGreedIndex: FearGreedIndex;
  newsSentiment: {
    positive: number;
    negative: number;
    neutral: number;
    total: number;
  };
  overallSentiment: 'bullish' | 'bearish' | 'neutral';
  overallScore: number; // -100 to 100
  timestamp: number;
}

export class SentimentNewsService {
  private static instance: SentimentNewsService;
  private logger = Logger.getInstance();
  
  // Simple in-memory caches
  private fearGreedCache: { data: FearGreedIndex | null; timestamp: number } = { data: null, timestamp: 0 };
  private newsCache: { data: NewsItem[]; timestamp: number } = { data: [], timestamp: 0 };
  private sentimentCache: { data: SentimentData | null; timestamp: number } = { data: null, timestamp: 0 };

  private constructor() {
    this.logger.info('✅ SentimentNewsService initialized with HuggingFace API');
  }

  static getInstance(): SentimentNewsService {
    if (!SentimentNewsService.instance) {
      SentimentNewsService.instance = new SentimentNewsService();
    }
    return SentimentNewsService.instance;
  }

  /**
   * Get Fear & Greed Index from HuggingFace
   */
  async getFearGreedIndex(): Promise<FearGreedIndex> {
    // Check cache (5 minutes)
    if (this.fearGreedCache.data && Date.now() - this.fearGreedCache.timestamp < 300000) {
      return this.fearGreedCache.data;
    }

    try {
      const response = await cryptoAPI.getGlobalSentiment();
      
      // Map HuggingFace sentiment to Fear & Greed Index format
      const value = response.fearGreedIndex || 50; // Default to neutral
      
      let classification = 'Neutral';
      if (value < 20) classification = 'Extreme Fear';
      else if (value < 40) classification = 'Fear';
      else if (value > 80) classification = 'Extreme Greed';
      else if (value > 60) classification = 'Greed';
      
      const result: FearGreedIndex = {
        value,
        classification,
        timestamp: new Date()
      };

      this.fearGreedCache = { data: result, timestamp: Date.now() };
      return result;
    } catch (error) {
      this.logger.error('Failed to fetch Fear & Greed Index:', {}, error);
      
      // Return neutral default on error
      return {
        value: 50,
        classification: 'Neutral',
        timestamp: new Date()
      };
    }
  }

  /**
   * Get crypto news from HuggingFace
   */
  async getNews(symbol?: string, limit: number = 20): Promise<NewsItem[]> {
    // Check cache (1 minute)
    const cacheKey = `${symbol || 'all'}_${limit}`;
    if (this.newsCache.data.length > 0 && Date.now() - this.newsCache.timestamp < 60000) {
      return this.newsCache.data;
    }

    try {
      const response = await cryptoAPI.getNews(symbol, limit);
      
      if (!response.success || !response.news) {
        return [];
      }

      // Convert to NewsItem format and analyze sentiment
      const newsItems: NewsItem[] = await Promise.all(
        response.news.map(async (article: any) => {
          // Analyze sentiment using HuggingFace
          let sentiment: 'positive' | 'negative' | 'neutral' = 'neutral';
          let sentimentScore = 0;

          try {
            const sentimentResult = await cryptoAPI.analyzeSentiment(article.title + ' ' + (article.content || ''));
            
            if (sentimentResult.label === 'positive') {
              sentiment = 'positive';
              sentimentScore = sentimentResult.score;
            } else if (sentimentResult.label === 'negative') {
              sentiment = 'negative';
              sentimentScore = -sentimentResult.score;
            }
          } catch {
            // Default to neutral if sentiment analysis fails
          }

          return {
            title: article.title,
            url: article.url,
            source: article.source,
            published: new Date(article.published_at),
            sentiment,
            sentimentScore
          };
        })
      );

      this.newsCache = { data: newsItems, timestamp: Date.now() };
      return newsItems;
    } catch (error) {
      this.logger.error('Failed to fetch news:', {}, error);
      return [];
    }
  }

  /**
   * Get overall sentiment data combining news and market sentiment
   */
  async getSentimentData(symbol?: string): Promise<SentimentData> {
    // Check cache (5 minutes)
    if (this.sentimentCache.data && Date.now() - this.sentimentCache.timestamp < 300000) {
      return this.sentimentCache.data;
    }

    try {
      const [fearGreed, news] = await Promise.all([
        this.getFearGreedIndex(),
        this.getNews(symbol, 50)
      ]);

      // Calculate news sentiment distribution
      const positive = news.filter(n => n.sentiment === 'positive').length;
      const negative = news.filter(n => n.sentiment === 'negative').length;
      const neutral = news.filter(n => n.sentiment === 'neutral').length;
      const total = news.length;

      // Calculate overall score (-100 to 100)
      const newsScore = total > 0 ? ((positive - negative) / total) * 100 : 0;
      const fearGreedScore = (fearGreed.value - 50) * 2; // Convert 0-100 to -100 to 100
      const overallScore = (newsScore + fearGreedScore) / 2;

      // Determine overall sentiment
      let overallSentiment: 'bullish' | 'bearish' | 'neutral';
      if (overallScore > 20) overallSentiment = 'bullish';
      else if (overallScore < -20) overallSentiment = 'bearish';
      else overallSentiment = 'neutral';

      const result: SentimentData = {
        fearGreedIndex: fearGreed,
        newsSentiment: { positive, negative, neutral, total },
        overallSentiment,
        overallScore,
        timestamp: Date.now()
      };

      this.sentimentCache = { data: result, timestamp: Date.now() };
      return result;
    } catch (error) {
      this.logger.error('Failed to get sentiment data:', {}, error);
      
      // Return neutral default
      return {
        fearGreedIndex: { value: 50, classification: 'Neutral', timestamp: new Date() },
        newsSentiment: { positive: 0, negative: 0, neutral: 0, total: 0 },
        overallSentiment: 'neutral',
        overallScore: 0,
        timestamp: Date.now()
      };
    }
  }

  /**
   * Analyze sentiment of arbitrary text
   */
  async analyzeSentiment(text: string): Promise<{ sentiment: string; score: number; confidence: number }> {
    try {
      return await cryptoAPI.analyzeSentiment(text);
    } catch (error) {
      this.logger.error('Sentiment analysis failed:', {}, error);
      return { sentiment: 'neutral', score: 0, confidence: 0 };
    }
  }

  /**
   * Get crypto news with detailed information
   */
  async getCryptoNews(symbol: string = 'BTC', limit: number = 20): Promise<{
    articles: Array<{
      title: string;
      description: string;
      url: string;
      source: string;
      publishedAt: string;
      sentiment?: number;
    }>;
    totalResults: number;
  }> {
    try {
      const newsItems = await this.getNews(symbol, limit);
      
      const articles = newsItems.map(item => ({
        title: item.title,
        description: '', // HuggingFace might not provide descriptions
        url: item.url,
        source: item.source,
        publishedAt: item.published.toISOString(),
        sentiment: item.sentimentScore
      }));

      return {
        articles,
        totalResults: articles.length
      };
    } catch (error) {
      this.logger.error('Failed to fetch crypto news:', { symbol }, error);
      return {
        articles: [],
        totalResults: 0
      };
    }
  }

  /**
   * Analyze sentiment for a specific keyword
   */
  async analyzeKeywordSentiment(keyword: string): Promise<{
    sentiment: number; // -1 to 1
    confidence: number; // 0 to 1
    sources: number;
  }> {
    try {
      const result = await this.analyzeSentiment(keyword);
      return {
        sentiment: result.score || 0,
        confidence: result.confidence || 0,
        sources: 1
      };
    } catch (error) {
      this.logger.error('Keyword sentiment analysis failed:', { keyword }, error);
      return {
        sentiment: 0,
        confidence: 0,
        sources: 0
      };
    }
  }

  /**
   * Get aggregated sentiment across multiple symbols
   */
  async getAggregatedSentiment(symbols: string[]): Promise<{
    overall: number;
    bySymbol: Record<string, { sentiment: number; confidence: number }>;
    timestamp: number;
  }> {
    try {
      const bySymbol: Record<string, { sentiment: number; confidence: number }> = {};
      let totalSentiment = 0;
      
      for (const symbol of symbols) {
        const result = await this.analyzeSentiment(symbol);
        bySymbol[symbol] = {
          sentiment: result.score || 0,
          confidence: result.confidence || 0
        };
        totalSentiment += result.score || 0;
      }
      
      return {
        overall: symbols.length > 0 ? totalSentiment / symbols.length : 0,
        bySymbol,
        timestamp: Date.now()
      };
    } catch (error) {
      this.logger.error('Aggregated sentiment failed:', { symbols }, error);
      return {
        overall: 0,
        bySymbol: {},
        timestamp: Date.now()
      };
    }
  }

  /**
   * Start a news stream for given symbols
   */
  startNewsStream(symbols: string[], callback: (news: any) => void): () => void {
    // Placeholder for news streaming using polling
    const interval = setInterval(async () => {
      for (const symbol of symbols) {
        const news = await this.getCryptoNews(symbol, 5);
        if (news.articles.length > 0) {
          callback({ symbol, articles: news.articles });
        }
      }
    }, 300000); // Every 5 minutes
    
    return () => clearInterval(interval);
  }
}
