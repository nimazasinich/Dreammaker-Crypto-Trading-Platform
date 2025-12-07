/**
 * Advanced News Component - Premium formatted news section
 * Features: Real-time updates, sentiment analysis, impact indicators, beautiful UI
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Newspaper, ExternalLink, TrendingUp, TrendingDown, Minus, RefreshCw, AlertCircle, Clock, Globe, Filter } from 'lucide-react';

interface NewsItem {
  id: string;
  title: string;
  description: string;
  url: string;
  source: string;
  publishedAt: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  impact: 'high' | 'medium' | 'low';
}

interface AdvancedNewsProps {
  theme?: 'light' | 'dark';
}

const AdvancedNews: React.FC<AdvancedNewsProps> = ({ theme = 'light' }) => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'positive' | 'negative' | 'neutral'>('all');
  const [impactFilter, setImpactFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all');

  // Light theme colors
  const lightColors = {
    bg: '#ffffff',
    surface: '#f8fafc',
    border: '#e2e8f0',
    text: '#1e293b',
    textSecondary: '#64748b',
    accent: '#8b5cf6',
    accentLight: '#a78bfa',
    hover: '#f1f5f9',
    shadow: 'rgba(139, 92, 246, 0.1)',
    success: '#10b981',
    danger: '#ef4444',
    warning: '#f59e0b',
  };

  // Fetch news from multiple sources
  useEffect(() => {
    const fetchNews = async () => {
      setIsLoading(true);
      try {
        // Try to fetch from backend API first
        const response = await fetch('/api/news/latest?limit=30');
        if (response.ok) {
          const data = await response.json();
          setNews(data);
        } else {
          // Fallback: Use mock data for demo
          const mockNews: NewsItem[] = [
            {
              id: '1',
              title: 'Bitcoin Surges Past $45,000 as Institutional Adoption Accelerates',
              description: 'Major corporations announce Bitcoin treasury allocations, driving price momentum and market confidence.',
              url: '#',
              source: 'CoinDesk',
              publishedAt: new Date(Date.now() - 30 * 60000).toISOString(),
              sentiment: 'positive',
              impact: 'high',
            },
            {
              id: '2',
              title: 'Ethereum 2.0 Staking Reaches New Milestone',
              description: 'Over 30 million ETH now staked in the network, strengthening security and decentralization.',
              url: '#',
              source: 'CryptoNews',
              publishedAt: new Date(Date.now() - 2 * 60 * 60000).toISOString(),
              sentiment: 'positive',
              impact: 'medium',
            },
            {
              id: '3',
              title: 'Regulatory Clarity Improves Market Sentiment',
              description: 'New guidelines provide framework for crypto trading, reducing uncertainty for investors.',
              url: '#',
              source: 'Bloomberg',
              publishedAt: new Date(Date.now() - 4 * 60 * 60000).toISOString(),
              sentiment: 'positive',
              impact: 'high',
            },
            {
              id: '4',
              title: 'Market Correction Expected After Recent Rally',
              description: 'Analysts suggest potential pullback as technical indicators show overbought conditions.',
              url: '#',
              source: 'TradingView',
              publishedAt: new Date(Date.now() - 6 * 60 * 60000).toISOString(),
              sentiment: 'negative',
              impact: 'medium',
            },
            {
              id: '5',
              title: 'DeFi Protocol Launches New Yield Farming Opportunities',
              description: 'Innovative staking mechanism offers competitive APY for liquidity providers.',
              url: '#',
              source: 'DeFi Pulse',
              publishedAt: new Date(Date.now() - 8 * 60 * 60000).toISOString(),
              sentiment: 'positive',
              impact: 'low',
            },
          ];
          setNews(mockNews);
        }
      } catch (error) {
        console.error('Failed to fetch news:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchNews();
    const interval = setInterval(fetchNews, 5 * 60 * 1000); // Refresh every 5 minutes
    return () => clearInterval(interval);
  }, []);

  const filteredNews = news.filter(item => {
    if (filter !== 'all' && item.sentiment !== filter) return false;
    if (impactFilter !== 'all' && item.impact !== impactFilter) return false;
    return true;
  });

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return <TrendingUp className="w-4 h-4" style={{ color: lightColors.success }} />;
      case 'negative': return <TrendingDown className="w-4 h-4" style={{ color: lightColors.danger }} />;
      default: return <Minus className="w-4 h-4" style={{ color: lightColors.textSecondary }} />;
    }
  };

  return (
    <div className="h-full flex flex-col" style={{ background: lightColors.bg }}>
      {/* Advanced Header */}
      <div
        className="p-6 border-b"
        style={{
          background: `linear-gradient(135deg, ${lightColors.surface} 0%, ${lightColors.bg} 100%)`,
          borderColor: lightColors.border,
          boxShadow: `0 2px 8px ${lightColors.shadow}`,
        }}
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-black mb-2" style={{ color: lightColors.text }}>
              <span style={{
                background: `linear-gradient(135deg, ${lightColors.accent} 0%, ${lightColors.accentLight} 100%)`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}>
                Market News & Analysis
              </span>
            </h1>
            <p className="text-sm" style={{ color: lightColors.textSecondary }}>
              Real-time financial news with sentiment analysis
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05, rotate: 180 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => window.location.reload()}
            className="p-2.5 rounded-xl"
            style={{
              background: lightColors.surface,
              border: `1px solid ${lightColors.border}`,
              color: lightColors.textSecondary,
            }}
          >
            <RefreshCw className="w-5 h-5" />
          </motion.button>
        </div>

        {/* Advanced Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4" style={{ color: lightColors.textSecondary }} />
            <span className="text-sm font-semibold" style={{ color: lightColors.textSecondary }}>Sentiment:</span>
            {(['all', 'positive', 'negative', 'neutral'] as const).map((sentiment) => (
              <motion.button
                key={sentiment}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setFilter(sentiment)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                style={filter === sentiment
                  ? {
                      background: sentiment === 'positive'
                        ? `linear-gradient(135deg, ${lightColors.success} 0%, #059669 100%)`
                        : sentiment === 'negative'
                        ? `linear-gradient(135deg, ${lightColors.danger} 0%, #dc2626 100%)`
                        : sentiment === 'neutral'
                        ? `linear-gradient(135deg, ${lightColors.textSecondary} 0%, #475569 100%)`
                        : `linear-gradient(135deg, ${lightColors.accent} 0%, ${lightColors.accentLight} 100%)`,
                      color: '#ffffff',
                      boxShadow: `0 4px 12px ${lightColors.shadow}`,
                    }
                  : {
                      background: lightColors.surface,
                      color: lightColors.textSecondary,
                      border: `1px solid ${lightColors.border}`,
                    }}
              >
                {sentiment === 'all' ? 'All' : sentiment.charAt(0).toUpperCase() + sentiment.slice(1)}
              </motion.button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold" style={{ color: lightColors.textSecondary }}>Impact:</span>
            {(['all', 'high', 'medium', 'low'] as const).map((impact) => (
              <motion.button
                key={impact}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setImpactFilter(impact)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                style={impactFilter === impact
                  ? {
                      background: impact === 'high'
                        ? `linear-gradient(135deg, ${lightColors.danger} 0%, #dc2626 100%)`
                        : impact === 'medium'
                        ? `linear-gradient(135deg, ${lightColors.warning} 0%, #d97706 100%)`
                        : impact === 'low'
                        ? `linear-gradient(135deg, ${lightColors.success} 0%, #059669 100%)`
                        : `linear-gradient(135deg, ${lightColors.accent} 0%, ${lightColors.accentLight} 100%)`,
                      color: '#ffffff',
                      boxShadow: `0 4px 12px ${lightColors.shadow}`,
                    }
                  : {
                      background: lightColors.surface,
                      color: lightColors.textSecondary,
                      border: `1px solid ${lightColors.border}`,
                    }}
              >
                {impact === 'all' ? 'All' : impact.charAt(0).toUpperCase() + impact.slice(1)}
              </motion.button>
            ))}
          </div>
        </div>
      </div>

      {/* News Content */}
      <div className="flex-1 overflow-y-auto p-6" style={{ scrollbarWidth: 'thin' }}>
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4].map((idx) => (
              <div key={idx} className="rounded-xl p-5 animate-pulse" style={{
                background: lightColors.surface,
                border: `1px solid ${lightColors.border}`,
              }}>
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-3"></div>
                <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              </div>
            ))}
          </div>
        ) : filteredNews.length === 0 ? (
          <div className="text-center py-12">
            <Newspaper className="w-16 h-16 mx-auto mb-4" style={{ color: lightColors.textSecondary }} />
            <p className="text-lg font-semibold mb-2" style={{ color: lightColors.text }}>No news found</p>
            <p className="text-sm" style={{ color: lightColors.textSecondary }}>Try adjusting your filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredNews.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02, y: -4 }}
                className="rounded-xl p-5 cursor-pointer transition-all"
                style={{
                  background: lightColors.bg,
                  border: `1.5px solid ${lightColors.border}`,
                  boxShadow: `0 4px 12px ${lightColors.shadow}`,
                }}
                onClick={() => window.open(item.url, '_blank')}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {getSentimentIcon(item.sentiment)}
                    <span className="text-xs font-bold uppercase" style={{ color: lightColors.textSecondary }}>
                      {item.source}
                    </span>
                    <span
                      className="px-2 py-0.5 rounded text-[10px] font-bold uppercase"
                      style={{
                        background: item.impact === 'high'
                          ? `${lightColors.danger}20`
                          : item.impact === 'medium'
                          ? `${lightColors.warning}20`
                          : `${lightColors.success}20`,
                        color: item.impact === 'high'
                          ? lightColors.danger
                          : item.impact === 'medium'
                          ? lightColors.warning
                          : lightColors.success,
                      }}
                    >
                      {item.impact}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-xs" style={{ color: lightColors.textSecondary }}>
                    <Clock className="w-3 h-3" />
                    {formatTimeAgo(item.publishedAt)}
                  </div>
                </div>

                <h3 className="text-lg font-bold mb-2 leading-tight" style={{ color: lightColors.text }}>
                  {item.title}
                </h3>
                <p className="text-sm mb-4 line-clamp-2" style={{ color: lightColors.textSecondary }}>
                  {item.description}
                </p>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{
                        background: item.sentiment === 'positive'
                          ? lightColors.success
                          : item.sentiment === 'negative'
                          ? lightColors.danger
                          : lightColors.textSecondary,
                        boxShadow: `0 0 8px ${item.sentiment === 'positive'
                          ? lightColors.success + '60'
                          : item.sentiment === 'negative'
                          ? lightColors.danger + '60'
                          : lightColors.textSecondary + '60'}`,
                      }}
                    />
                    <span
                      className="text-xs font-semibold capitalize"
                      style={{
                        color: item.sentiment === 'positive'
                          ? lightColors.success
                          : item.sentiment === 'negative'
                          ? lightColors.danger
                          : lightColors.textSecondary,
                      }}
                    >
                      {item.sentiment}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-xs font-semibold" style={{ color: lightColors.accent }}>
                    <span>Read More</span>
                    <ExternalLink className="w-3 h-3" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdvancedNews;

