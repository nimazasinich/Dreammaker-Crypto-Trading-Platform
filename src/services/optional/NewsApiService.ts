/**
 * News Service - HuggingFace Integration
 * 
 * DEPRECATED: This service now uses HuggingFace Crypto API instead of NewsAPI.
 * All external API calls have been removed.
 */

import { cryptoAPI } from '../CryptoAPI';

export type NewsArticle = {
  title?: string;
  description?: string;
  content?: string;
  url?: string;
  source?: { name?: string };
  publishedAt?: string;
};

export class NewsApiService {
  /**
   * Search for news articles using HuggingFace API
   */
  static async search(
    query: string,
    pageSize = 50,
    language = "en"
  ): Promise<NewsArticle[]> {
    try {
      // Use HuggingFace API for news
      const response = await cryptoAPI.getNews(query, pageSize);
      
      if (!response.success || !response.news) {
        console.warn('No news data returned from HuggingFace');
        return [];
      }

      // Convert HuggingFace format to NewsArticle format
      return response.news.map((article: any) => ({
        title: article.title,
        description: article.summary || article.content?.substring(0, 200),
        content: article.content,
        url: article.url,
        source: { name: article.source },
        publishedAt: article.published_at
      }));
    } catch (error: any) {
      console.error('HuggingFace news fetch failed:', error.message);
      return [];
    }
  }

  /**
   * No longer needed - API key validation removed
   */
  static assertKey(): boolean {
    return true; // Always returns true since we use HuggingFace
  }
}
