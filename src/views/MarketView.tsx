import React, { useState, useEffect, useContext, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Logger } from '../core/Logger.js';
import {
    TrendingUp,
    TrendingDown,
    Activity,
    Brain,
    BarChart3,
    DollarSign,
    Search,
    Filter,
    Settings,
    AlertCircle,
    Layers,
    Maximize2,
    Download,
    Share2,
    Clock,
    RefreshCw,
    ChevronDown,
    Eye,
    EyeOff,
    Grid,
    Zap,
    Target,
    Minus,
    Plus,
    X,
    CheckCircle
} from 'lucide-react';
import { PriceChart, MarketTicker } from '../components/market';
import { NewsFeed } from '../components/news';
import { AIPredictor } from '../components/ai';
import DatasourceClient from '../services/DatasourceClient';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { LoadingSkeleton } from '../components/ui/LoadingSkeleton';
import { AnimatedCounter } from '../components/ui/AnimatedCounter';
import { TiltCard } from '../components/ui/TiltCard';
import { GlowingButton } from '../components/ui/GlowingButton';
import { FloatingParticles } from '../components/ui/FloatingParticles';
import { showToast } from '../components/ui/Toast';
import { LiveDataContext } from '../components/LiveDataContext';
import ErrorBoundary from '../components/ui/ErrorBoundary';
import ResponseHandler from '../components/ui/ResponseHandler';
import { APP_MODE, USE_MOCK_DATA } from '../config/env.js';
import { getTopPairs, searchPairs, PairItem, toBinanceSymbol, getChangePct } from '../services/marketUniverse';
import BacktestButton from '../components/backtesting/BacktestButton';
import { ExchangeSelector } from '../components/ExchangeSelector';
import { dataManager } from '../services/dataManager';
import ChartFrame from '../components/ui/ChartFrame';
import { useOHLC, OHLCBar } from '../hooks/useOHLC';
import { useDebouncedEffect } from '../hooks/useDebouncedEffect';
import { useSafeAsync } from '../hooks/useSafeAsync';
import ErrorStateCard from '../components/ui/ErrorStateCard';
import { ChartSkeleton } from '../components/ui/Skeleton';
import type { AnalysisData, SMCAnalysis, ElliottWaveAnalysis, HarmonicPattern, SentimentAnalysis } from '../types/trading';
import { usePersistedTab } from '../hooks/usePersistedTab';

// Helper function to generate sample analysis data
const generateSampleAnalysisData = (symbol: string): AnalysisData => {
    return {
        smc: {
            trend: 'BULLISH' as const,
            orderBlocks: [],
            liquidityZones: []
        },
        elliott: {
            currentWave: {
                wave: 3,
                type: 'IMPULSE' as const
            },
            nextWave: 4,
            completionProbability: 0.75,
            confidence: 0.75
        },
        harmonic: {
            name: 'Gartley',
            type: 'GARTLEY' as const,
            completion: 0.85,
            direction: 'BULLISH' as const,
            prz: { upper: 0, lower: 0 },
            confidence: 0.8
        },
        sentiment: {
            score: 0.65,
            sentiment: 'BULLISH' as const,
            sources: {
                twitter: 0.7,
                reddit: 0.6,
                news: 0.65
            },
            timestamp: Date.now()
        }
    };
};

interface MarketData {
    symbol: string;
    price: number;
    change24h: number;
    changePercent24h: number;
    volume24h: number;
    high24h: number;
    low24h: number;
}


const logger = Logger.getInstance();

// Tab type definition
type TabId = 'overview' | 'charting';

interface Tab {
    id: TabId;
    label: string;
    icon: React.ComponentType<any>;
    description: string;
}

const TABS: Tab[] = [
    {
        id: 'overview',
        label: 'Market Overview',
        icon: TrendingUp,
        description: 'Real-time market data & analysis'
    },
    {
        id: 'charting',
        label: 'Advanced Charting',
        icon: BarChart3,
        description: 'Professional charting tools'
    }
];

export const MarketView: React.FC = () => {
    // Tab navigation state with persistence
    const [activeTab, setActiveTab] = usePersistedTab<TabId>('market-view', 'overview');

    return (
        <div className="min-h-screen bg-surface p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <header className="mb-6">
                    <h1 className="text-3xl font-bold text-foreground mb-2">
                        Market Analysis
                    </h1>
                    <p className="text-muted">
                        Real-time market data and professional charting tools
                    </p>
                </header>

                {/* Tab Navigation */}
                <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                    {TABS.map(tab => {
                        const Icon = tab.icon;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`
                  flex items-center gap-2 px-6 py-3 rounded-lg font-semibold 
                  transition-all duration-200 whitespace-nowrap
                  ${activeTab === tab.id
                                        ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg transform scale-105'
                                        : 'bg-surface-muted text-foreground hover:bg-surface-hover hover:scale-102'
                                    }
                `}
                            >
                                <Icon className="w-5 h-5" />
                                <div className="text-left">
                                    <div>{tab.label}</div>
                                    <div className="text-xs opacity-75">{tab.description}</div>
                                </div>
                            </button>
                        );
                    })}
                </div>

                {/* Tab Content */}
                <div className="animate-fade-in">
                    {activeTab === 'overview' && <MarketOverviewContent />}
                    {activeTab === 'charting' && <ChartingContent />}
                </div>
            </div>
        </div>
    );
};

// ==========================================
// Market Overview Content (Original MarketView)
// ==========================================
const MarketOverviewContent: React.FC = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [selectedSymbol, setSelectedSymbol] = useState('BTC/USDT');
    const [timeframe, setTimeframe] = useState('1h');
    const [marketData, setMarketData] = useState<MarketData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [analysisData, setAnalysisData] = useState<AnalysisData>({});
    const [showFilters, setShowFilters] = useState(false);
    const [pairs, setPairs] = useState<PairItem[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [topGainers, setTopGainers] = useState<Array<{ symbol: string; changePct: number; price?: number }>>([]);
    const [topLosers, setTopLosers] = useState<Array<{ symbol: string; changePct: number; price?: number }>>([]);

    // Get live data context
    const liveDataContext = useContext(LiveDataContext);

    const timeframes = ['1m', '5m', '15m', '1h', '4h', '1d'];
    const displayPairs = searchQuery ? searchPairs(searchQuery) : (pairs || []).slice(0, 50); // Limit display for performance

    // Load top pairs on mount
    useEffect(() => {
        getTopPairs('USDT', 300)
            .then(result => setPairs(result || []))
            .catch(err => {
                logger.error('Failed to load top pairs:', {}, err);
                setPairs([]); // Set empty array on error
            });
    }, []);

    // Define fetchAnalysisData first so it can be used in callbacks
    const fetchAnalysisData = React.useCallback(async (symbol: string) => {
        const binanceSymbol = toBinanceSymbol(symbol);
        try {
            // Use existing analysis endpoints (direct fetch for now)
            const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8001';
            const [smcResult, elliottResult, harmonicResult] = await Promise.allSettled([
                fetch(`${API_BASE}/api/analysis/smc?symbol=${binanceSymbol}`).then(r => r.json()),
                fetch(`${API_BASE}/api/analysis/elliott`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ symbol: binanceSymbol })
                }).then(r => r.json()),
                fetch(`${API_BASE}/api/analysis/harmonic`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ symbol: binanceSymbol })
                }).then(r => r.json())
            ]);

            const analysis: AnalysisData = {};

            if (smcResult.status === 'fulfilled' && (smcResult.value as any)?.success) {
                analysis.smc = (smcResult.value as any).data;
            }
            if (elliottResult.status === 'fulfilled' && (elliottResult.value as any)?.success) {
                analysis.elliott = (elliottResult.value as any).data;
            }
            if (harmonicResult.status === 'fulfilled' && (harmonicResult.value as any)?.success) {
                analysis.harmonic = (harmonicResult.value as any).data;
            }

            if (Object.keys(analysis).length > 0) {
                setAnalysisData(analysis);
            } else {
                // Only use sample data when explicitly in demo mode
                if (APP_MODE === 'demo') {
                    setAnalysisData(generateSampleAnalysisData(symbol));
                } else {
                    logger.warn('No analysis data available for symbol:', { symbol });
                    setAnalysisData({});
                }
            }
        } catch (err) {
            logger.error('Failed to fetch analysis data:', {}, err);
            // Only use sample data when explicitly in demo mode
            if (APP_MODE === 'demo') {
                setAnalysisData(generateSampleAnalysisData(symbol));
            } else {
                setAnalysisData({});
            }
        }
    }, []);

    // Handle real-time market data updates - defined before useEffect
    const handleRealTimeUpdate = React.useCallback((data: any) => {
        if (data && data.symbol && data.price) {
            setMarketData(prevData => {
                const updatedData = [...prevData];
                const index = updatedData.findIndex(item => item.symbol === data.symbol);

                if (index !== -1) {
                    // Calculate change based on previous price
                    const prevPrice = updatedData[index].price;
                    const change = data.price - prevPrice;
                    const changePercent = (change / prevPrice) * 100;

                    // Update existing entry
                    updatedData[index] = {
                        ...updatedData[index],
                        price: data.price,
                        change24h: updatedData[index].change24h + change,
                        changePercent24h: data.changePercent24h || updatedData[index].changePercent24h,
                        volume24h: data.volume ? updatedData[index].volume24h + data.volume : updatedData[index].volume24h,
                        high24h: Math.max(updatedData[index].high24h, data.price),
                        low24h: Math.min(updatedData[index].low24h, data.price)
                    };
                }

                return updatedData;
            });

            // If this is the selected symbol, update analysis data
            if (data.symbol === selectedSymbol) {
                fetchAnalysisData(selectedSymbol);
            }
        }
    }, [selectedSymbol, fetchAnalysisData]);

    const fetchMarketData = React.useCallback(async () => {
        if (pairs.length === 0) return;

        try {
            setLoading(true);
            setError(null);

            // Fetch prices using DatasourceClient
            const datasource = DatasourceClient;
            const symbolsList = pairs.slice(0, 20).map(p => p.symbolBinance.replace('USDT', ''));
            const priceData = await datasource.getTopCoins(20, symbolsList);

            if (priceData && priceData.length > 0) {
                const formatted = priceData.map((p: any) => ({
                    symbol: p.symbol,
                    price: p.price,
                    change24h: p.change24h || 0,
                    changePercent24h: p.changePercent24h || 0,
                    volume24h: p.volume || 0,
                    high24h: p.price * 1.02,
                    low24h: p.price * 0.98
                }));
                setMarketData(formatted);
                showToast('success', 'Market Data Loaded', 'Successfully fetched latest market data');
            } else {
                logger.error('No market data available from API', {});
                setError('No market data available');
                showToast('error', 'No Data', 'No market data available. Please ensure backend is running.');
            }

            // Fetch analysis data for selected symbol
            await fetchAnalysisData(selectedSymbol);
        } catch (err) {
            logger.error('Failed to fetch market data:', {}, err);
            setError('Failed to fetch market data');
            showToast('error', 'Fetch Failed', 'Failed to fetch market data. Please check your connection.');
        } finally {
            setLoading(false);
        }
    }, [pairs, selectedSymbol, fetchAnalysisData]);


    // Compute top gainers/losers from real OHLC data
    const computeGainersLosers = React.useCallback(async () => {
        if (pairs.length === 0) return;

        try {
            // Compute from real OHLC across top pairs
            const universe = pairs.slice(0, 60);
            const changes = await Promise.all(
                (universe || []).map(async (p) => {
                    try {
                        const pct = await getChangePct(p.symbolUI, timeframe);
                        return { symbol: p.symbolUI, changePct: pct };
                    } catch {
                        return { symbol: p.symbolUI, changePct: Number.NEGATIVE_INFINITY };
                    }
                })
            );

            const valid = changes.filter(x => Number.isFinite(x.changePct));
            valid.sort((a, b) => b.changePct - a.changePct);

            setTopGainers(valid.slice(0, 10));
            setTopLosers(valid.slice(-10).reverse());
        } catch (err) {
            logger.error('Failed to compute gainers/losers:', {}, err);
            setTopGainers([]);
            setTopLosers([]);
        }
    }, [pairs, timeframe]);

    // Compute gainers/losers when pairs or timeframe changes
    useEffect(() => {
        if ((pairs?.length || 0) > 0) {
            computeGainersLosers();
        }
    }, [pairs, timeframe, computeGainersLosers]);

    // Subscribe to live data updates
    useEffect(() => {
        if (liveDataContext && liveDataContext.subscribeToMarketData) {
            try {
                const binanceSymbol = toBinanceSymbol(selectedSymbol);
                const unsubscribe = liveDataContext.subscribeToMarketData([binanceSymbol], handleRealTimeUpdate);

                return () => {
                    if (unsubscribe) {
                        unsubscribe();
                    }
                };
            } catch (error) {
                logger.error('Failed to subscribe to market data:', {}, error);
                setError('Failed to subscribe to real-time updates');
            }
        }
    }, [liveDataContext, handleRealTimeUpdate, selectedSymbol]);

    // Fetch market data on mount and when pairs are loaded
    useEffect(() => {
        if ((pairs?.length || 0) > 0) {
            fetchMarketData();

            // Set up interval to refresh data every 30 seconds
            const interval = setInterval(() => {
                fetchMarketData();
            }, 30000);

            return () => clearInterval(interval);
        }
    }, [pairs, selectedSymbol, timeframe, fetchMarketData]);

    // Fetch analysis data when symbol or timeframe changes
    useEffect(() => {
        fetchAnalysisData(selectedSymbol);
    }, [selectedSymbol, timeframe, fetchAnalysisData]);

    const currentSymbolData = marketData.find(d => d.symbol === toBinanceSymbol(selectedSymbol));

    return (
        <div className="w-full min-h-full animate-fade-in">
            <style>{`
                @keyframes shimmer {
                    0% { background-position: -1000px 0; }
                    100% { background-position: 1000px 0; }
                }
                
                .animate-shimmer {
                    animation: shimmer 8s infinite linear;
                    background: linear-gradient(
                        90deg,
                        transparent 0%,
                        rgba(255, 255, 255, 0.03) 50%,
                        transparent 100%
                    );
                    background-size: 1000px 100%;
                }
            `}</style>

            {/* Header */}
            <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent mb-2 drop-shadow-[0_0_30px_rgba(59,130,246,0.4)]">
                            Market Analysis
                        </h1>
                        <p className="text-slate-400 text-xs">Comprehensive market intelligence and trading insights</p>
                        {error && (
                            <div className="mt-3 animate-fade-in">
                                <div className="group relative flex items-center gap-3 px-4 py-3 rounded-xl overflow-hidden transition-all duration-300 hover:scale-[1.01]"
                                    style={{
                                        background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(220, 38, 38, 0.15) 100%)',
                                        border: '1px solid rgba(239, 68, 68, 0.3)',
                                        boxShadow: '0 4px 16px rgba(239, 68, 68, 0.2)'
                                    }}>
                                    <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" style={{
                                        filter: 'drop-shadow(0 0 8px rgba(239, 68, 68, 0.6))'
                                    }} />
                                    <span className="text-red-300 text-xs font-medium flex-1">{error}</span>
                                    <button
                                        onClick={() => setError(null)}
                                        className="ml-2 p-1 rounded-lg hover:bg-red-500/20 transition-all duration-200"
                                        aria-label="Dismiss error"
                                    >
                                        <svg className="w-4 h-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Backtest Button */}
                        <div className="transform transition-all hover:scale-105">
                            <BacktestButton
                                symbolUI={selectedSymbol}
                                timeframe={timeframe}
                                className="text-purple-400"
                            />
                        </div>

                        {/* Filter Button */}
                        <GlowingButton
                            variant="primary"
                            size="sm"
                            onClick={() => setShowFilters(!showFilters)}
                        >
                            <Filter className="w-4 h-4" aria-hidden="true" />
                        </GlowingButton>

                        {/* Refresh Button */}
                        <GlowingButton
                            variant="secondary"
                            size="sm"
                            onClick={() => fetchMarketData()}
                        >
                            <RefreshCw className="w-4 h-4" />
                        </GlowingButton>
                    </div>
                </div>

                {/* Filters */}
                {showFilters && (
                    <div
                        className="mt-4 p-4 rounded-xl backdrop-blur-sm"
                        style={{
                            background: 'rgba(15, 15, 24, 0.9)',
                            border: '1px solid rgba(139, 92, 246, 0.3)',
                            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.6)'
                        }}
                    >
                        <div className="flex items-center gap-4">
                            <div className="flex-1">
                                <label className="text-xs text-slate-400 mb-2 block">Search Symbol</label>
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Type to search (e.g., BTC, MATIC)..."
                                    className="w-full px-3 py-2 rounded-lg text-sm transition-all"
                                    style={{
                                        background: 'rgba(20, 20, 30, 0.8)',
                                        border: '1px solid rgba(139, 92, 246, 0.3)',
                                        color: 'white'
                                    }}
                                />
                            </div>

                            <div className="flex-1">
                                <label className="text-xs text-slate-400 mb-2 block">Symbol ({displayPairs.length} pairs)</label>
                                <select
                                    value={selectedSymbol}
                                    onChange={(e) => setSelectedSymbol(e.target.value)}
                                    className="w-full px-3 py-2 rounded-lg text-sm font-semibold transition-all"
                                    style={{
                                        background: 'rgba(20, 20, 30, 0.8)',
                                        border: '1px solid rgba(139, 92, 246, 0.3)',
                                        color: 'white'
                                    }}
                                >
                                    {(displayPairs || []).map(pair => (
                                        <option key={pair.symbolBinance} value={pair.symbolUI}>{pair.symbolUI}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex-1">
                                <label className="text-xs text-slate-400 mb-2 block">Timeframe</label>
                                <select
                                    value={timeframe}
                                    onChange={(e) => setTimeframe(e.target.value)}
                                    className="w-full px-3 py-2 rounded-lg text-sm font-semibold transition-all"
                                    style={{
                                        background: 'rgba(20, 20, 30, 0.8)',
                                        border: '1px solid rgba(139, 92, 246, 0.3)',
                                        color: 'white'
                                    }}
                                >
                                    {(timeframes || []).map(tf => (
                                        <option key={tf} value={tf}>{tf}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>
                )}

                {/* Exchange Selector */}
                <div className="mt-4">
                    <ExchangeSelector />
                </div>
            </div>

            {/* Market Overview Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6 relative">
                {/* Floating Particles Background */}
                <div className="absolute inset-0 opacity-20 pointer-events-none">
                    <FloatingParticles count={15} color="rgba(16, 185, 129, 0.3)" />
                </div>

                {/* Top Gainers */}
                <TiltCard tiltDegree={8}>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="rounded-xl p-6 backdrop-blur-sm h-full"
                        style={{
                            background: 'linear-gradient(135deg, rgba(15, 15, 24, 0.95) 0%, rgba(20, 20, 30, 0.95) 100%)',
                            border: '1px solid rgba(16, 185, 129, 0.2)',
                            boxShadow: '0 12px 40px rgba(0, 0, 0, 0.5), 0 0 60px rgba(16, 185, 129, 0.15)'
                        }}
                    >
                        <div className="flex items-center gap-3 mb-4">
                            <TrendingUp className="w-5 h-5 text-emerald-400" />
                            <h3 className="text-lg font-bold text-white">Top Gainers</h3>
                        </div>

                    {loading ? (
                        <LoadingSkeleton variant="card" count={3} className="space-y-3" />
                    ) : (
                        <div className="space-y-3">
                            {topGainers.length === 0 && (
                                <div className="text-center text-slate-400 text-sm py-4">
                                    {APP_MODE === 'online' ? 'Loading real data...' : 'No data available'}
                                </div>
                            )}
                            {(topGainers || []).map((item, idx) => (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.1 }}
                                    className="flex items-center justify-between p-3 rounded-lg hover:bg-white/5 transition-all hover:scale-105"
                                    style={{ background: 'rgba(16, 185, 129, 0.1)' }}
                                >
                                    <div>
                                        <span className="text-white font-semibold text-sm">{item.symbol}</span>
                                        <div className="text-emerald-400 font-bold text-xs">
                                            <AnimatedCounter value={item.changePct} prefix="+" suffix="%" decimals={2} />
                                        </div>
                                    </div>
                                    {item.price && (
                                        <span className="text-white font-bold">
                                            <AnimatedCounter value={item.price} prefix="$" decimals={2} />
                                        </span>
                                    )}
                                </motion.div>
                            ))}
                        </div>
                    )}
                    </motion.div>
                </TiltCard>

                {/* Top Losers */}
                <TiltCard tiltDegree={8}>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="rounded-xl p-6 backdrop-blur-sm h-full"
                        style={{
                            background: 'linear-gradient(135deg, rgba(15, 15, 24, 0.95) 0%, rgba(20, 20, 30, 0.95) 100%)',
                            border: '1px solid rgba(239, 68, 68, 0.2)',
                            boxShadow: '0 12px 40px rgba(0, 0, 0, 0.5), 0 0 60px rgba(239, 68, 68, 0.15)'
                        }}
                    >
                        <div className="flex items-center gap-3 mb-4">
                            <TrendingDown className="w-5 h-5 text-rose-400" />
                            <h3 className="text-lg font-bold text-white">Top Losers</h3>
                        </div>

                    {loading ? (
                        <LoadingSkeleton variant="card" count={3} className="space-y-3" />
                    ) : (
                        <div className="space-y-3">
                            {topLosers.length === 0 && (
                                <div className="text-center text-slate-400 text-sm py-4">
                                    {APP_MODE === 'online' ? 'Loading real data...' : 'No data available'}
                                </div>
                            )}
                            {(topLosers || []).map((item, idx) => (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.1 }}
                                    className="flex items-center justify-between p-3 rounded-lg hover:bg-white/5 transition-all hover:scale-105"
                                    style={{ background: 'rgba(239, 68, 68, 0.1)' }}
                                >
                                    <div>
                                        <span className="text-white font-semibold text-sm">{item.symbol}</span>
                                        <div className="text-rose-400 font-bold text-xs">
                                            <AnimatedCounter value={item.changePct} suffix="%" decimals={2} />
                                        </div>
                                    </div>
                                    {item.price && (
                                        <span className="text-white font-bold">
                                            <AnimatedCounter value={item.price} prefix="$" decimals={2} />
                                        </span>
                                    )}
                                </motion.div>
                            ))}
                        </div>
                    )}
                    </motion.div>
                </TiltCard>

                {/* Market Stats */}
                <TiltCard tiltDegree={8}>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="rounded-xl p-6 backdrop-blur-sm h-full"
                        style={{
                            background: 'linear-gradient(135deg, rgba(15, 15, 24, 0.95) 0%, rgba(20, 20, 30, 0.95) 100%)',
                            border: '1px solid rgba(139, 92, 246, 0.2)',
                            boxShadow: '0 12px 40px rgba(0, 0, 0, 0.5), 0 0 60px rgba(139, 92, 246, 0.15)'
                        }}
                    >
                        <div className="flex items-center gap-3 mb-4">
                            <Activity className="w-5 h-5 text-purple-400" />
                            <h3 className="text-lg font-bold text-white">Market Stats</h3>
                        </div>

                    {loading ? (
                        <LoadingSkeleton variant="text" count={4} className="space-y-4" />
                    ) : (
                        <div className="space-y-4">
                            <motion.div
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.3 }}
                            >
                                <span className="text-slate-400 text-xs">Total Markets</span>
                                <div className="text-white font-bold text-2xl">
                                    <AnimatedCounter value={marketData.length} decimals={0} />
                                </div>
                            </motion.div>
                            <motion.div
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.4 }}
                            >
                                <span className="text-slate-400 text-xs">24h Volume</span>
                                <div className="text-white font-bold text-2xl">
                                    <AnimatedCounter 
                                        value={marketData.reduce((sum, d) => sum + d.volume24h, 0)} 
                                        prefix="$" 
                                        decimals={0}
                                    />
                                </div>
                            </motion.div>
                            <motion.div
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.5 }}
                            >
                                <span className="text-slate-400 text-xs">Active Analysis</span>
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
                                    <span className="text-emerald-400 font-bold text-lg">Live</span>
                                </div>
                            </motion.div>
                        </div>
                    )}
                    </motion.div>
                </TiltCard>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                {/* Chart - Takes 2 columns */}
                <div className="lg:col-span-2">
                    <div className="rounded-2xl overflow-hidden backdrop-blur-sm"
                        style={{
                            background: 'linear-gradient(135deg, rgba(15, 15, 24, 0.95) 0%, rgba(20, 20, 30, 0.95) 100%)',
                            border: '1px solid rgba(139, 92, 246, 0.2)',
                            boxShadow: '0 12px 40px rgba(0, 0, 0, 0.5)'
                        }}
                    >
                        <PriceChart
                            symbol={selectedSymbol}
                            autoFetch={true}
                            initialTimeframe={timeframe}
                        />
                    </div>
                </div>

                {/* AI Predictions - Takes 1 column */}
                <div>
                    <div className="rounded-2xl overflow-hidden backdrop-blur-sm"
                        style={{
                            background: 'linear-gradient(135deg, rgba(15, 15, 24, 0.95) 0%, rgba(20, 20, 30, 0.95) 100%)',
                            border: '1px solid rgba(139, 92, 246, 0.2)',
                            boxShadow: '0 12px 40px rgba(0, 0, 0, 0.5)'
                        }}
                    >
                        <AIPredictor
                            symbol={selectedSymbol}
                            autoFetch={true}
                            refreshInterval={60000}
                        />
                    </div>
                </div>
            </div>

            {/* Bottom Section - News Feed */}
            <div className="mb-6">
                <NewsFeed autoRefresh={true} refreshInterval={60000} />
            </div>

            {/* Status Banner */}
            <div
                className="rounded-2xl p-4 backdrop-blur-sm"
                style={{
                    background: 'linear-gradient(90deg, rgba(59, 130, 246, 0.15) 0%, rgba(139, 92, 246, 0.15) 50%, rgba(236, 72, 153, 0.15) 100%)',
                    border: '1px solid rgba(139, 92, 246, 0.3)',
                    boxShadow: '0 12px 40px rgba(99, 102, 241, 0.25)'
                }}
            >
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div
                            className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"
                            style={{ boxShadow: '0 0 20px rgba(52, 211, 153, 1)' }}
                        />
                        <span className="font-bold text-sm text-white">
                            Real-time Market Data Active
                        </span>
                        <span className="text-xs text-slate-400">
                            • {marketData.length} markets monitored • AI analysis enabled
                        </span>
                    </div>
                    <div className="text-xs text-slate-400 flex items-center gap-2">
                        Updated: {new Date().toLocaleTimeString()}
                    </div>
                </div>
            </div>
        </div>
    );
};

// ==========================================
// Charting Content
// ==========================================
const ChartingContent: React.FC = () => {
    const { run } = useSafeAsync();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [symbol, setSymbol] = useState('BTC/USDT');
    const [timeframe, setTimeframe] = useState('1h');
    const [currentPrice, setCurrentPrice] = useState<number>(0);
    const [priceChange, setPriceChange] = useState<number>(0);
    const [searchQuery, setSearchQuery] = useState('');
    const [showSymbolPicker, setShowSymbolPicker] = useState(false);

    // Use useOHLC hook for resilient data loading
    const { state: ohlcState, reload } = useOHLC(symbol, timeframe, 500);

    // Extract data from state
    const chartData = ohlcState.status === 'success' ? ohlcState.data.bars : null;
    const loading = ohlcState.status === 'loading';
    const ohlcError = ohlcState.status === 'error' ? ohlcState.error : null;
    const updatedAt = ohlcState.status === 'success' ? ohlcState.data.updatedAt : null;

    interface Indicator {
        id: string;
        name: string;
        enabled: boolean;
        color: string;
        values?: number[];
    }

    interface ChartSettings {
        chartType: 'candlestick' | 'line' | 'area';
        showVolume: boolean;
        showGrid: boolean;
        indicators: Indicator[];
    }

    const [settings, setSettings] = useState<ChartSettings>({
        chartType: 'candlestick',
        showVolume: true,
        showGrid: true,
        indicators: [
            { id: 'ma20', name: 'MA 20', enabled: true, color: '#22c55e' },
            { id: 'ma50', name: 'MA 50', enabled: true, color: '#f59e0b' },
            { id: 'rsi', name: 'RSI', enabled: false, color: '#8b5cf6' },
            { id: 'macd', name: 'MACD', enabled: false, color: '#3b82f6' },
            { id: 'bb', name: 'Bollinger Bands', enabled: false, color: '#ec4899' }
        ]
    });
    const [showSettings, setShowSettings] = useState(false);
    const [analysis, setAnalysis] = useState<any>(null);

    // Extended symbol list
    const ALL_SYMBOLS = [
        { value: 'BTC/USDT', label: 'Bitcoin', ticker: 'BTC' },
        { value: 'ETH/USDT', label: 'Ethereum', ticker: 'ETH' },
        { value: 'BNB/USDT', label: 'BNB', ticker: 'BNB' },
        { value: 'SOL/USDT', label: 'Solana', ticker: 'SOL' },
        { value: 'ADA/USDT', label: 'Cardano', ticker: 'ADA' },
        { value: 'DOGE/USDT', label: 'Dogecoin', ticker: 'DOGE' },
        { value: 'XRP/USDT', label: 'Ripple', ticker: 'XRP' },
        { value: 'DOT/USDT', label: 'Polkadot', ticker: 'DOT' },
        { value: 'AVAX/USDT', label: 'Avalanche', ticker: 'AVAX' },
        { value: 'MATIC/USDT', label: 'Polygon', ticker: 'MATIC' },
        { value: 'LINK/USDT', label: 'Chainlink', ticker: 'LINK' },
        { value: 'UNI/USDT', label: 'Uniswap', ticker: 'UNI' },
        { value: 'ATOM/USDT', label: 'Cosmos', ticker: 'ATOM' },
        { value: 'LTC/USDT', label: 'Litecoin', ticker: 'LTC' },
        { value: 'NEAR/USDT', label: 'NEAR Protocol', ticker: 'NEAR' },
        { value: 'APT/USDT', label: 'Aptos', ticker: 'APT' },
        { value: 'ARB/USDT', label: 'Arbitrum', ticker: 'ARB' },
        { value: 'OP/USDT', label: 'Optimism', ticker: 'OP' },
        { value: 'SUI/USDT', label: 'Sui', ticker: 'SUI' },
        { value: 'INJ/USDT', label: 'Injective', ticker: 'INJ' }
    ];

    // Available timeframes
    const timeframes = [
        { value: '1m', label: '1m' },
        { value: '5m', label: '5m' },
        { value: '15m', label: '15m' },
        { value: '1h', label: '1h' },
        { value: '4h', label: '4h' },
        { value: '1d', label: '1d' }
    ];

    // Filter symbols based on search
    const filteredSymbols = useMemo(() => {
        if (!searchQuery) return ALL_SYMBOLS;
        const query = searchQuery.toLowerCase();
        return ALL_SYMBOLS.filter(s =>
            s.label.toLowerCase().includes(query) ||
            s.ticker.toLowerCase().includes(query) ||
            s.value.toLowerCase().includes(query)
        );
    }, [searchQuery, ALL_SYMBOLS]);

    // Update current price when chart data changes
    useEffect(() => {
        if (chartData && chartData.length > 0) {
            const latestBar = chartData[chartData.length - 1];
            setCurrentPrice(latestBar.c);

            if (chartData.length > 1) {
                const previousBar = chartData[chartData.length - 2];
                const change = latestBar.c - previousBar.c;
                setPriceChange(change);
            }
        }
    }, [chartData]);

    const toggleIndicator = (id: string) => {
        setSettings(prev => ({
            ...prev,
            indicators: prev.indicators.map(ind =>
                ind.id === id ? { ...ind, enabled: !ind.enabled } : ind
            )
        }));
    };

    const handleExport = () => {
        showToast('info', 'Export', 'Chart export feature coming soon');
    };

    const handleShare = () => {
        showToast('info', 'Share', 'Share feature coming soon');
    };

    return (
        <ErrorBoundary>
            <div className="space-y-4">
                {/* Chart Controls */}
                <div className="flex flex-wrap items-center justify-between gap-4 bg-surface border border-border rounded-lg p-4">
                    {/* Symbol Selector */}
                    <div className="relative">
                        <button
                            onClick={() => setShowSymbolPicker(!showSymbolPicker)}
                            className="flex items-center gap-2 px-4 py-2 bg-surface-muted border border-border rounded-lg hover:bg-surface-hover transition-colors"
                        >
                            <BarChart3 className="w-4 h-4" />
                            <span className="font-semibold">{symbol}</span>
                            <ChevronDown className="w-4 h-4" />
                        </button>

                        {showSymbolPicker && (
                            <div className="absolute top-full left-0 mt-2 w-72 bg-surface border border-border rounded-lg shadow-lg z-50 max-h-96 overflow-hidden flex flex-col">
                                <div className="p-3 border-b border-border">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                                        <input
                                            type="text"
                                            placeholder="Search symbols..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="w-full pl-10 pr-3 py-2 bg-surface-muted border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                                        />
                                    </div>
                                </div>
                                <div className="overflow-y-auto">
                                    {filteredSymbols.map(s => (
                                        <button
                                            key={s.value}
                                            onClick={() => {
                                                setSymbol(s.value);
                                                setShowSymbolPicker(false);
                                                setSearchQuery('');
                                            }}
                                            className="w-full px-4 py-3 text-left hover:bg-surface-hover transition-colors flex items-center justify-between"
                                        >
                                            <div>
                                                <div className="font-medium">{s.label}</div>
                                                <div className="text-xs text-muted">{s.value}</div>
                                            </div>
                                            {symbol === s.value && <CheckCircle className="w-4 h-4 text-accent" />}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Timeframe Selector */}
                    <div className="flex gap-1">
                        {timeframes.map(tf => (
                            <button
                                key={tf.value}
                                onClick={() => setTimeframe(tf.value)}
                                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${timeframe === tf.value
                                    ? 'bg-accent text-accent-foreground'
                                    : 'bg-surface-muted text-foreground hover:bg-surface-hover'
                                    }`}
                            >
                                {tf.label}
                            </button>
                        ))}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setShowSettings(!showSettings)}
                            className="p-2 bg-surface-muted border border-border rounded-lg hover:bg-surface-hover transition-colors"
                            title="Settings"
                        >
                            <Settings className="w-4 h-4" />
                        </button>
                        <button
                            onClick={reload}
                            className="p-2 bg-surface-muted border border-border rounded-lg hover:bg-surface-hover transition-colors"
                            title="Refresh"
                        >
                            <RefreshCw className="w-4 h-4" />
                        </button>
                        <button
                            onClick={handleExport}
                            className="p-2 bg-surface-muted border border-border rounded-lg hover:bg-surface-hover transition-colors"
                            title="Export"
                        >
                            <Download className="w-4 h-4" />
                        </button>
                        <button
                            onClick={handleShare}
                            className="p-2 bg-surface-muted border border-border rounded-lg hover:bg-surface-hover transition-colors"
                            title="Share"
                        >
                            <Share2 className="w-4 h-4" />
                        </button>
                        <BacktestButton symbolUI={symbol} timeframe={timeframe} />
                    </div>
                </div>

                {/* Price Info */}
                {currentPrice > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center gap-6 bg-surface border border-border rounded-lg p-4"
                    >
                        <div>
                            <div className="text-sm text-muted">Current Price</div>
                            <div className="text-2xl font-bold">
                                <AnimatedCounter value={currentPrice} prefix="$" decimals={2} />
                            </div>
                        </div>
                        <div>
                            <div className="text-sm text-muted">24h Change</div>
                            <div className={`text-xl font-semibold ${priceChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                <AnimatedCounter 
                                    value={priceChange} 
                                    prefix={priceChange >= 0 ? '+' : ''} 
                                    decimals={2}
                                /> ({((priceChange / currentPrice) * 100).toFixed(2)}%)
                            </div>
                        </div>
                        {updatedAt && (
                            <div className="ml-auto">
                                <div className="text-sm text-muted flex items-center gap-2">
                                    <Clock className="w-4 h-4" />
                                    Updated: {new Date(updatedAt).toLocaleTimeString()}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Settings Panel */}
                {showSettings && (
                    <div className="bg-surface border border-border rounded-lg p-4">
                        <h3 className="text-lg font-semibold mb-4">Chart Settings</h3>
                        <div className="space-y-4">
                            {/* Chart Type */}
                            <div>
                                <label className="text-sm font-medium text-muted mb-2 block">Chart Type</label>
                                <div className="flex gap-2">
                                    {(['candlestick', 'line', 'area'] as const).map(type => (
                                        <button
                                            key={type}
                                            onClick={() => setSettings(prev => ({ ...prev, chartType: type }))}
                                            className={`px-4 py-2 rounded-lg text-sm capitalize ${settings.chartType === type
                                                ? 'bg-accent text-accent-foreground'
                                                : 'bg-surface-muted text-foreground hover:bg-surface-hover'
                                                }`}
                                        >
                                            {type}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Indicators */}
                            <div>
                                <label className="text-sm font-medium text-muted mb-2 block">Indicators</label>
                                <div className="space-y-2">
                                    {settings.indicators.map(indicator => (
                                        <div key={indicator.id} className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <div
                                                    className="w-3 h-3 rounded-full"
                                                    style={{ backgroundColor: indicator.color }}
                                                />
                                                <span className="text-sm">{indicator.name}</span>
                                            </div>
                                            <button
                                                onClick={() => toggleIndicator(indicator.id)}
                                                className="p-1 hover:bg-surface-hover rounded"
                                            >
                                                {indicator.enabled ? (
                                                    <Eye className="w-4 h-4 text-accent" />
                                                ) : (
                                                    <EyeOff className="w-4 h-4 text-muted" />
                                                )}
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Options */}
                            <div className="space-y-2">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={settings.showVolume}
                                        onChange={(e) => setSettings(prev => ({ ...prev, showVolume: e.target.checked }))}
                                        className="rounded"
                                    />
                                    <span className="text-sm">Show Volume</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={settings.showGrid}
                                        onChange={(e) => setSettings(prev => ({ ...prev, showGrid: e.target.checked }))}
                                        className="rounded"
                                    />
                                    <span className="text-sm">Show Grid</span>
                                </label>
                            </div>
                        </div>
                    </div>
                )}

                {/* Chart */}
                <div className="bg-surface border border-border rounded-lg overflow-hidden">
                    {loading && <ChartSkeleton />}
                    {ohlcError && <ErrorStateCard message={ohlcError} onRetry={reload} />}
                    {chartData && chartData.length > 0 ? (
                        <ChartFrame
                            title={`${symbol} Chart`}
                            subtitle={timeframe}
                            loading={loading}
                            error={ohlcError}
                            onReload={reload}
                        >
                            <PriceChart
                                symbol={symbol.replace('/USDT', '')}
                                autoFetch={true}
                                initialTimeframe={timeframe}
                                key={`${symbol}-${timeframe}`}
                            />
                        </ChartFrame>
                    ) : !loading && !ohlcError ? (
                        <ChartFrame
                            title={`${symbol} Chart`}
                            subtitle={timeframe}
                            loading={false}
                            error={null}
                            onReload={reload}
                        >
                            <PriceChart
                                symbol={symbol.replace('/USDT', '')}
                                autoFetch={true}
                                initialTimeframe={timeframe}
                                key={`${symbol}-${timeframe}`}
                            />
                        </ChartFrame>
                    ) : null}
                </div>
            </div>
        </ErrorBoundary>
    );
};

export default MarketView;



