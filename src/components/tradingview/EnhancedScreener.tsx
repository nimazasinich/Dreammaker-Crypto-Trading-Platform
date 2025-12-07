import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Filter, TrendingUp, TrendingDown, Star, Zap,
  BarChart3, DollarSign, Activity, ArrowUpRight, ArrowDownRight,
  RefreshCw, Download, Settings, X
} from 'lucide-react';
import Screener from './Screener';

interface CryptoData {
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  volume24h: number;
  marketCap: number;
  rank: number;
  sparkline?: number[];
}

interface EnhancedScreenerProps {
  theme?: 'light' | 'dark';
}

const EnhancedScreener: React.FC<EnhancedScreenerProps> = ({ theme = 'light' }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'price' | 'change' | 'volume' | 'marketCap'>('marketCap');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [filterChange, setFilterChange] = useState<'all' | 'gainers' | 'losers'>('all');
  const [selectedMarket, setSelectedMarket] = useState<'crypto' | 'forex' | 'stocks'>('crypto');
  const [isLoading, setIsLoading] = useState(false);
  const [cryptoData, setCryptoData] = useState<CryptoData[]>([]);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

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
  };

  // Fetch crypto data from HuggingFace API
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Use HuggingFace API to get top coins
        const response = await fetch('https://Really-amin-Datasourceforcryptocurrency-2.hf.space/api/service/top?n=50');
        if (response.ok) {
          const data = await response.json();
          if (data.data && Array.isArray(data.data)) {
            const formatted = data.data.map((coin: any, index: number) => ({
              symbol: coin.symbol || coin.name,
              name: coin.name || coin.symbol,
              price: coin.price || 0,
              change24h: coin.change_24h || 0,
              volume24h: coin.volume_24h || 0,
              marketCap: coin.market_cap || 0,
              rank: index + 1,
            }));
            setCryptoData(formatted);
          }
        }
      } catch (error) {
        console.error('Failed to fetch crypto data from HuggingFace:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  // Filter and sort data
  const filteredData = useMemo(() => {
    let filtered = [...cryptoData];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(
        item => item.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Change filter
    if (filterChange === 'gainers') {
      filtered = filtered.filter(item => item.change24h > 0);
    } else if (filterChange === 'losers') {
      filtered = filtered.filter(item => item.change24h < 0);
    }

    // Sort
    filtered.sort((a, b) => {
      let aVal: number, bVal: number;
      switch (sortBy) {
        case 'price':
          aVal = a.price;
          bVal = b.price;
          break;
        case 'change':
          aVal = a.change24h;
          bVal = b.change24h;
          break;
        case 'volume':
          aVal = a.volume24h;
          bVal = b.volume24h;
          break;
        case 'marketCap':
          aVal = a.marketCap;
          bVal = b.marketCap;
          break;
        default:
          return 0;
      }
      return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
    });

    return filtered;
  }, [cryptoData, searchQuery, filterChange, sortBy, sortOrder]);

  const toggleFavorite = (symbol: string) => {
    setFavorites(prev => {
      const newSet = new Set(prev);
      if (newSet.has(symbol)) {
        newSet.delete(symbol);
      } else {
        newSet.add(symbol);
      }
      return newSet;
    });
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
                Advanced Crypto Screener
              </span>
            </h1>
            <p className="text-sm" style={{ color: lightColors.textSecondary }}>
              Real-time market analysis with AI-powered insights
            </p>
          </div>
          <div className="flex items-center gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 rounded-lg"
              style={{
                background: lightColors.surface,
                border: `1px solid ${lightColors.border}`,
                color: lightColors.textSecondary,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = lightColors.hover;
                e.currentTarget.style.color = lightColors.accent;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = lightColors.surface;
                e.currentTarget.style.color = lightColors.textSecondary;
              }}
            >
              <Settings className="w-5 h-5" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 rounded-lg"
              style={{
                background: lightColors.surface,
                border: `1px solid ${lightColors.border}`,
                color: lightColors.textSecondary,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = lightColors.hover;
                e.currentTarget.style.color = lightColors.accent;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = lightColors.surface;
                e.currentTarget.style.color = lightColors.textSecondary;
              }}
            >
              <Download className="w-5 h-5" />
            </motion.button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: lightColors.textSecondary }} />
            <input
              type="text"
              placeholder="Search coins..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border focus:outline-none focus:ring-2 transition-all"
              style={{
                background: lightColors.bg,
                borderColor: lightColors.border,
                color: lightColors.text,
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = lightColors.accent;
                e.currentTarget.style.boxShadow = `0 0 0 3px ${lightColors.accent}20`;
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = lightColors.border;
                e.currentTarget.style.boxShadow = 'none';
              }}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded"
                style={{ color: lightColors.textSecondary }}
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Market Selector */}
          <select
            value={selectedMarket}
            onChange={(e) => setSelectedMarket(e.target.value as any)}
            className="px-4 py-2.5 rounded-xl border focus:outline-none focus:ring-2 transition-all cursor-pointer"
            style={{
              background: lightColors.bg,
              borderColor: lightColors.border,
              color: lightColors.text,
            }}
          >
            <option value="crypto">Cryptocurrency</option>
            <option value="forex">Forex</option>
            <option value="stocks">Stocks</option>
          </select>

          {/* Change Filter */}
          <div className="flex gap-2">
            {(['all', 'gainers', 'losers'] as const).map((filter) => (
              <motion.button
                key={filter}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setFilterChange(filter)}
                className="flex-1 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all"
                style={filterChange === filter
                  ? {
                      background: filter === 'gainers'
                        ? `linear-gradient(135deg, ${lightColors.success} 0%, #059669 100%)`
                        : filter === 'losers'
                        ? `linear-gradient(135deg, ${lightColors.danger} 0%, #dc2626 100%)`
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
                {filter === 'all' ? 'All' : filter === 'gainers' ? '↑ Gainers' : '↓ Losers'}
              </motion.button>
            ))}
          </div>

          {/* Sort */}
          <div className="flex gap-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="flex-1 px-4 py-2.5 rounded-xl border focus:outline-none focus:ring-2 transition-all cursor-pointer"
              style={{
                background: lightColors.bg,
                borderColor: lightColors.border,
                color: lightColors.text,
              }}
            >
              <option value="marketCap">Market Cap</option>
              <option value="price">Price</option>
              <option value="change">24h Change</option>
              <option value="volume">Volume</option>
            </select>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="p-2.5 rounded-xl border"
              style={{
                background: lightColors.surface,
                borderColor: lightColors.border,
                color: lightColors.textSecondary,
              }}
            >
              {sortOrder === 'asc' ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
            </motion.button>
          </div>
        </div>
      </div>

      {/* Content Area - با ارتفاع بیشتر */}
      <div className="flex-1 flex gap-4 p-6 overflow-hidden" style={{ minHeight: 'calc(100vh - 300px)' }}>
        {/* TradingView Screener - ارتفاع بیشتر برای دسترسی به تمام ویژگی‌ها */}
        <div className="flex-1 rounded-2xl overflow-hidden border" style={{ borderColor: lightColors.border, minHeight: 'calc(100vh - 300px)' }}>
          <Screener 
            theme="light" 
            height={typeof window !== 'undefined' ? Math.max(window.innerHeight - 300, 800) : 800}
            showToolbar={true}
          />
        </div>

        {/* Quick Stats Panel */}
        <div className="w-80 space-y-4 overflow-y-auto">
          <div
            className="rounded-2xl p-4 border"
            style={{
              background: lightColors.bg,
              borderColor: lightColors.border,
              boxShadow: `0 4px 12px ${lightColors.shadow}`,
            }}
          >
            <h3 className="font-bold mb-3 flex items-center gap-2" style={{ color: lightColors.text }}>
              <BarChart3 className="w-5 h-5" style={{ color: lightColors.accent }} />
              Top Movers
            </h3>
            <div className="space-y-2">
              {filteredData.slice(0, 10).map((item, index) => (
                <motion.div
                  key={item.symbol}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ scale: 1.02, x: 4 }}
                  className="p-3 rounded-lg cursor-pointer transition-all"
                  style={{
                    background: lightColors.surface,
                    border: `1px solid ${lightColors.border}`,
                  }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleFavorite(item.symbol)}
                        className="p-1 rounded"
                        style={{ color: favorites.has(item.symbol) ? '#fbbf24' : lightColors.textSecondary }}
                      >
                        <Star className={`w-4 h-4 ${favorites.has(item.symbol) ? 'fill-current' : ''}`} />
                      </button>
                      <span className="font-bold text-sm" style={{ color: lightColors.text }}>{item.symbol}</span>
                    </div>
                    <span className="text-sm font-bold" style={{ color: lightColors.text }}>
                      ${item.price.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      {item.change24h >= 0 ? (
                        <ArrowUpRight className="w-4 h-4" style={{ color: lightColors.success }} />
                      ) : (
                        <ArrowDownRight className="w-4 h-4" style={{ color: lightColors.danger }} />
                      )}
                      <span
                        className="text-xs font-semibold"
                        style={{ color: item.change24h >= 0 ? lightColors.success : lightColors.danger }}
                      >
                        {item.change24h >= 0 ? '+' : ''}{item.change24h.toFixed(2)}%
                      </span>
                    </div>
                    <span className="text-xs" style={{ color: lightColors.textSecondary }}>
                      Vol: ${(item.volume24h / 1000000).toFixed(1)}M
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedScreener;

