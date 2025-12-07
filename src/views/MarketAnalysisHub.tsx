/**
 * Market Analysis Hub - Phase 2 Ultimate Integration
 * 
 * Unified hub combining:
 * - Advanced Charting with TradingView integration
 * - Technical Analysis Tools (pluggable dropdown menus)
 * - Market Scanner (AI-powered) - Now as a tab
 * - Real-time market data
 * 
 * @component
 * @example
 * ```tsx
 * <MarketAnalysisHub />
 * ```
 * 
 * Features:
 * - Tabbed interface: Charts + Scanner
 * - Beautiful left-side technical tools dropdown (dark sidebar)
 * - Smart Money Concepts, Elliott Wave, Fibonacci, Harmonic Patterns, SAR, Regime
 * - Light theme with Trading Hub style buttons
 * - Real-time analysis updates
 * 
 * @since 2.1.0
 * @version 2.1.1 - Phase 2: Light Theme + Scanner Tab
 */

import React, { useState, useEffect, useCallback, useMemo, Suspense, lazy } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    TrendingUp,
    Activity,
    BarChart3,
    Search,
    Zap,
    RefreshCw,
    Settings,
    Maximize2,
    Filter,
    Bell,
    Bookmark,
    Share2,
    Download,
    ChevronDown,
    ChevronRight,
    X,
    Star,
    Clock,
    Target,
    Brain,
    Layers,
    Waves,
    TrendingDown,
    Minus,
    AlertCircle,
    Grid,
    Eye,
    EyeOff,
    Plus,
    Sparkles,
    Crosshair,
    LineChart,
} from 'lucide-react';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { LoadingSkeleton } from '../components/ui/LoadingSkeleton';
import { toast } from '../components/ui/Toast';
import { COLORS } from '../styles/constants';
import { DatasourceClient } from '../services/DatasourceClient';
import { SMCAnalyzer } from '../services/SMCAnalyzer';
import { ElliottWaveAnalyzer } from '../services/ElliottWaveAnalyzer';
import { FibonacciDetector } from '../services/FibonacciDetector';
import { HarmonicPatternDetector } from '../services/HarmonicPatternDetector';
import { ParabolicSARDetector } from '../services/ParabolicSARDetector';
import { RegimeDetector } from '../services/RegimeDetector';
import { PriceChart } from '../components/market';

// Lazy load Scanner tab
const ScannerTab = lazy(() => import('./ai-lab/tabs/ScannerTab').then(m => ({ default: m.ScannerTab || m.default })));

// Tab Types
type TabId = 'charts' | 'scanner';

interface Tab {
    id: TabId;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    description: string;
    shortcut: string;
}

const TABS: Tab[] = [
    {
        id: 'charts',
        label: 'Charts',
        icon: BarChart3,
        description: 'Advanced charting & analysis',
        shortcut: '⌘1',
    },
    {
        id: 'scanner',
        label: 'Scanner',
        icon: Search,
        description: 'AI-powered market scanning',
        shortcut: '⌘3',
    },
];

// Technical Analysis Tool Types
type ToolCategory = 'patterns' | 'indicators' | 'concepts' | 'overlays';

interface TechnicalTool {
    id: string;
    name: string;
    category: ToolCategory;
    icon: React.ComponentType<{ className?: string }>;
    description: string;
    gradient: string;
    enabled: boolean;
    config?: any;
}

const TECHNICAL_TOOLS: TechnicalTool[] = [
    // Pattern Recognition
    {
        id: 'smc',
        name: 'Smart Money Concepts',
        category: 'concepts',
        icon: Layers,
        description: 'Order blocks, liquidity zones & fair value gaps',
        gradient: 'from-blue-500 to-cyan-500',
        enabled: false,
    },
    {
        id: 'elliott',
        name: 'Elliott Wave',
        category: 'patterns',
        icon: Waves,
        description: 'Wave pattern analysis & cycle prediction',
        gradient: 'from-teal-500 to-emerald-500',
        enabled: false,
    },
    {
        id: 'harmonic',
        name: 'Harmonic Patterns',
        category: 'patterns',
        icon: BarChart3,
        description: 'Gartley, Bat, Butterfly, Crab patterns',
        gradient: 'from-purple-500 to-pink-500',
        enabled: false,
    },
    {
        id: 'fibonacci',
        name: 'Fibonacci Levels',
        category: 'overlays',
        icon: Target,
        description: 'Retracement & extension levels',
        gradient: 'from-yellow-500 to-orange-500',
        enabled: false,
    },
    {
        id: 'sar',
        name: 'Parabolic SAR',
        category: 'indicators',
        icon: TrendingUp,
        description: 'Stop and reversal signals',
        gradient: 'from-green-500 to-teal-500',
        enabled: false,
    },
    {
        id: 'regime',
        name: 'Market Regime',
        category: 'indicators',
        icon: Activity,
        description: 'Bull, bear, sideways classification',
        gradient: 'from-rose-500 to-red-500',
        enabled: false,
    },
];

export const MarketAnalysisHub: React.FC = () => {
    // State management
    const [activeTab, setActiveTab] = useState<TabId>('charts');
    const [symbol, setSymbol] = useState('BTCUSDT');
    const [timeframe, setTimeframe] = useState('4h');
    const [tools, setTools] = useState<TechnicalTool[]>(TECHNICAL_TOOLS);
    const [activeCategory, setActiveCategory] = useState<ToolCategory | null>(null);
    const [loading, setLoading] = useState(false);
    const [analysisData, setAnalysisData] = useState<any>({});
    const [showToolsPanel, setShowToolsPanel] = useState(true);

    // Grouped tools by category
    const groupedTools = useMemo(() => {
        const categories: Record<ToolCategory, { label: string; icon: React.ComponentType<any>; tools: TechnicalTool[] }> = {
            patterns: { label: 'Pattern Recognition', icon: Sparkles, tools: [] },
            indicators: { label: 'Technical Indicators', icon: LineChart, tools: [] },
            concepts: { label: 'Advanced Concepts', icon: Brain, tools: [] },
            overlays: { label: 'Chart Overlays', icon: Crosshair, tools: [] },
        };

        tools.forEach(tool => {
            categories[tool.category].tools.push(tool);
        });

        return categories;
    }, [tools]);

    // Enable/disable tool
    const toggleTool = useCallback(async (toolId: string) => {
        setTools(prev => prev.map(tool => 
            tool.id === toolId ? { ...tool, enabled: !tool.enabled } : tool
        ));

        // Run analysis for this tool
        const tool = tools.find(t => t.id === toolId);
        if (tool && !tool.enabled) {
            await runToolAnalysis(toolId);
            toast({ type: 'success', message: `${tool.name} enabled`, duration: 2000 });
        } else {
            toast({ type: 'info', message: `${tool?.name} disabled`, duration: 2000 });
        }
    }, [tools]);

    // Run analysis for specific tool
    const runToolAnalysis = async (toolId: string) => {
        setLoading(true);
        try {
            const datasource = DatasourceClient.getInstance();
            const ohlcv = await datasource.getPriceChart(symbol, timeframe, 200);

            if (!ohlcv || ohlcv.length === 0) {
                throw new Error(`No data available for ${symbol}`);
            }

            const transformedData = ohlcv.map(candle => ({
                timestamp: candle.timestamp,
                open: candle.open,
                high: candle.high,
                low: candle.low,
                close: candle.close,
                volume: candle.volume
            }));

            let result;
            switch (toolId) {
                case 'smc':
                    const smcAnalyzer = SMCAnalyzer.getInstance();
                    result = {
                        liquidityZones: smcAnalyzer.detectLiquidityZones(transformedData as any),
                        orderBlocks: smcAnalyzer.detectOrderBlocks(transformedData as any),
                        fvg: smcAnalyzer.detectFairValueGaps(transformedData as any)
                    };
                    break;
                case 'elliott':
                    const elliottAnalyzer = ElliottWaveAnalyzer.getInstance();
                    result = elliottAnalyzer.analyzeElliottWaves(transformedData as any);
                    break;
                case 'fibonacci':
                    const fibDetector = FibonacciDetector.getInstance();
                    result = fibDetector.detect(transformedData as any);
                    break;
                case 'harmonic':
                    const harmonicDetector = HarmonicPatternDetector.getInstance();
                    result = harmonicDetector.detectHarmonicPatterns(transformedData as any);
                    break;
                case 'sar':
                    const sarDetector = ParabolicSARDetector.getInstance();
                    result = sarDetector.detect(transformedData as any);
                    break;
                case 'regime':
                    const regimeDetector = RegimeDetector.getInstance();
                    result = regimeDetector.detect(transformedData as any);
                    break;
            }

            setAnalysisData(prev => ({ ...prev, [toolId]: result }));
        } catch (err: any) {
            console.error(`Analysis failed for ${toolId}:`, err);
            toast({ type: 'error', message: `Failed to analyze ${toolId}`, duration: 3000 });
        } finally {
            setLoading(false);
        }
    };

    // Run all enabled tools
    const runAllTools = async () => {
        setLoading(true);
        try {
            const enabledTools = tools.filter(t => t.enabled);
            await Promise.all(enabledTools.map(tool => runToolAnalysis(tool.id)));
            toast({ type: 'success', message: 'All analyses complete', duration: 2000 });
        } catch (err) {
            toast({ type: 'error', message: 'Some analyses failed', duration: 3000 });
        } finally {
            setLoading(false);
        }
    };

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyPress = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey)) {
                if (e.key === 'k') {
                    e.preventDefault();
                    setShowToolsPanel(prev => !prev);
                } else if (e.key === '1') {
                    e.preventDefault();
                    setActiveTab('charts');
                } else if (e.key === '3') {
                    e.preventDefault();
                    setActiveTab('scanner');
                }
            }
        };

        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, []);

    return (
        <div className="min-h-screen bg-white dark:bg-[color:var(--surface-page)]">
            {/* Header - Less Transparent, Coordinated with Tab Panel */}
            <header className="sticky top-0 z-40 relative overflow-hidden"
                style={{
                    background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.12) 0%, rgba(6, 182, 212, 0.14) 25%, rgba(20, 184, 166, 0.12) 50%, rgba(139, 92, 246, 0.14) 75%, rgba(6, 182, 212, 0.12) 100%), rgba(255, 255, 255, 0.96)',
                    backdropFilter: 'blur(32px) saturate(160%) contrast(104%)',
                    WebkitBackdropFilter: 'blur(32px) saturate(160%) contrast(104%)',
                    borderBottom: '1px solid rgba(139, 92, 246, 0.20)',
                    boxShadow: '0 6px 24px rgba(139, 92, 246, 0.10), 0 2px 8px rgba(0, 0, 0, 0.04), inset 0 2px 0 rgba(255, 255, 255, 0.6), inset 0 -1px 0 rgba(139, 92, 246, 0.08)',
                }}
            >
                {/* Coordinated color overlays */}
                <div className="absolute inset-0 bg-gradient-to-br from-violet-500/8 via-cyan-500/6 to-teal-500/8 pointer-events-none" />
                <div className="absolute inset-0 bg-gradient-to-t from-violet-700/5 via-transparent to-cyan-400/4 pointer-events-none" />
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(139,92,246,0.06),transparent_55%)] pointer-events-none" />
                {/* Top light highlight */}
                <div className="absolute inset-0 bg-gradient-to-b from-white/15 via-white/3 to-transparent pointer-events-none" />
                {/* Side light accents */}
                <div className="absolute inset-0 bg-gradient-to-r from-white/8 via-transparent to-white/8 pointer-events-none" />
                {/* Bottom subtle shadow */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/2 via-transparent to-transparent pointer-events-none" />
                
                <div className="max-w-[2000px] mx-auto px-8 py-5 relative z-10">
                    <div className="flex items-center justify-between">
                        {/* Title with sidebar-coordinated purple/cyan icon - Moved forward */}
                        <div className="flex items-center gap-5 ml-2">
                                <motion.div
                                whileHover={{ scale: 1.05, rotate: 8 }}
                                whileTap={{ scale: 0.98 }}
                                className="p-3.5 rounded-xl shadow-xl relative overflow-hidden"
                                    style={{
                                    background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.96) 0%, rgba(96, 165, 250, 0.94) 50%, rgba(37, 99, 235, 0.96) 100%)',
                                    boxShadow: '0 8px 24px rgba(59, 130, 246, 0.35), 0 4px 12px rgba(0, 0, 0, 0.10), inset 0 2px 0 rgba(255, 255, 255, 0.30), inset 0 -2px 8px rgba(0, 0, 0, 0.12)',
                                }}
                            >
                                {/* Professional multi-layer light shading */}
                                <div className="absolute inset-0 bg-gradient-to-br from-white/28 via-transparent to-black/18 rounded-xl" />
                                <div className="absolute inset-0 bg-gradient-to-t from-blue-900/20 via-transparent to-white/18 rounded-xl" />
                                <div className="absolute inset-0 bg-gradient-to-r from-white/12 via-transparent to-white/12 rounded-xl" />
                                {/* Top highlight shine */}
                                <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/22 via-white/8 to-transparent rounded-t-xl" />
                                
                                <BarChart3 className="w-7 h-7 text-white relative z-10" 
                                    style={{ 
                                        filter: 'drop-shadow(0 3px 6px rgba(0,0,0,0.4)) drop-shadow(0 0 12px rgba(255,255,255,0.35)) drop-shadow(0 0 18px rgba(59,130,246,0.25))',
                                        strokeWidth: '2.5px',
                                    }} 
                                />
                            </motion.div>
                                <div>
                                <h1 className="text-xl font-black tracking-tight"
                                    style={{
                                        background: 'linear-gradient(135deg, rgba(139, 92, 246, 1) 0%, rgba(6, 182, 212, 1) 50%, rgba(20, 184, 166, 1) 100%)',
                                        WebkitBackgroundClip: 'text',
                                        WebkitTextFillColor: 'transparent',
                                        backgroundClip: 'text',
                                        letterSpacing: '-0.01em',
                                        fontWeight: 900,
                                        WebkitFontSmoothing: 'antialiased',
                                        MozOsxFontSmoothing: 'grayscale',
                                        textRendering: 'optimizeLegibility',
                                    }}
                                >
                                        Market Analysis Hub
                                    </h1>
                                <p className="text-sm font-semibold mt-0.5 tracking-wide"
                                    style={{
                                        color: 'rgba(139, 92, 246, 0.85)',
                                        WebkitFontSmoothing: 'antialiased',
                                        textRendering: 'optimizeLegibility',
                                        letterSpacing: '0.02em',
                                    }}
                                >
                                    Advanced charting with technical analysis tools
                                    </p>
                                </div>
                            </div>

                        {/* Symbol & Timeframe Controls - Reduced Size */}
                        <div className="flex items-center gap-3">
                                            <motion.div
                                whileHover={{ scale: 1.01, y: -0.5 }}
                                whileTap={{ scale: 0.99 }}
                                className="flex items-center gap-3 rounded-xl px-4 py-2 relative overflow-hidden min-w-[220px]"
                                                style={{
                                    background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.92) 0%, rgba(250, 245, 255, 0.95) 50%, rgba(255, 255, 255, 0.92) 100%)',
                                    backdropFilter: 'blur(20px) saturate(160%)',
                                    WebkitBackdropFilter: 'blur(20px) saturate(160%)',
                                    border: '1.5px solid rgba(139, 92, 246, 0.25)',
                                    boxShadow: '0 6px 18px rgba(139, 92, 246, 0.12), 0 3px 8px rgba(0, 0, 0, 0.04), inset 0 1px 0 rgba(255, 255, 255, 0.9), inset 0 -1px 0 rgba(139, 92, 246, 0.08)',
                                }}
                            >
                                {/* Professional light shading */}
                                <div className="absolute inset-0 bg-gradient-to-b from-white/28 via-transparent to-violet-100/6 rounded-xl" />
                                <div className="absolute inset-0 bg-gradient-to-r from-white/12 via-transparent to-white/12 rounded-xl" />
                                <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/18 via-transparent to-transparent rounded-t-xl" />
                                
                                {/* Symbol Input Section */}
                                <div className="flex items-center gap-1.5 relative z-10">
                                    <div className="p-1 rounded-md" style={{
                                        background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.12) 0%, rgba(124, 58, 237, 0.08) 100%)',
                                    }}>
                                        <TrendingUp className="w-3.5 h-3.5 text-violet-600" />
                                    </div>
                                    <input
                                        type="text"
                                        value={symbol}
                                        onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                                        className="bg-transparent px-1.5 py-0.5 focus:outline-none text-sm w-28 font-black relative z-10"
                                        placeholder="BTCUSDT"
                                        style={{
                                            color: COLORS.primary.darker,
                                            letterSpacing: '0.03em',
                                            WebkitFontSmoothing: 'antialiased',
                                            textRendering: 'optimizeLegibility',
                                        }}
                                    />
                                </div>
                                
                                {/* Divider */}
                                <div className="w-px h-6 relative z-10" style={{
                                    background: 'linear-gradient(to bottom, transparent 0%, rgba(139, 92, 246, 0.30) 20%, rgba(139, 92, 246, 0.30) 80%, transparent 100%)',
                                }} />
                                
                                {/* Timeframe Section */}
                                <div className="flex items-center gap-1.5 relative z-10">
                                    <Clock className="w-3.5 h-3.5 text-violet-600" />
                                    <select
                                        value={timeframe}
                                        onChange={(e) => setTimeframe(e.target.value)}
                                        className="bg-transparent focus:outline-none text-sm font-bold cursor-pointer relative z-10 pr-0.5"
                                        style={{
                                            color: COLORS.primary.darker,
                                            letterSpacing: '0.015em',
                                            WebkitFontSmoothing: 'antialiased',
                                            textRendering: 'optimizeLegibility',
                                        }}
                                    >
                                        <option value="15m" className="bg-white text-violet-700">15m</option>
                                        <option value="1h" className="bg-white text-violet-700">1h</option>
                                        <option value="4h" className="bg-white text-violet-700">4h</option>
                                        <option value="1d" className="bg-white text-violet-700">1d</option>
                                    </select>
                                    <ChevronDown className="w-3.5 h-3.5 -ml-0.5 text-violet-500" />
                                </div>
                                            </motion.div>
                                </div>

                        {/* Quick Actions - Smaller Buttons */}
                        <div className="flex items-center gap-3">
                            <motion.button
                                whileHover={{ scale: 1.04, y: -1 }}
                                whileTap={{ scale: 0.96 }}
                                onClick={() => setShowToolsPanel(!showToolsPanel)}
                                className="px-3.5 py-1.5 rounded-lg text-white font-bold text-xs shadow-lg transition-all relative overflow-hidden"
                                style={{
                                    background: 'linear-gradient(135deg, rgba(6, 182, 212, 1) 0%, rgba(20, 184, 166, 1) 50%, rgba(45, 212, 191, 1) 100%)',
                                    border: '1.5px solid rgba(255, 255, 255, 0.50)',
                                    boxShadow: '0 4px 16px rgba(6, 182, 212, 0.35), 0 2px 8px rgba(20, 184, 166, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.40), inset 0 -1px 4px rgba(0, 0, 0, 0.10)',
                                }}
                                title="Toggle Tools Panel (⌘K)"
                            >
                                {/* Glass effect layers */}
                                <div className="absolute inset-0 bg-gradient-to-b from-white/30 via-transparent to-black/12 rounded-lg" />
                                <div className="absolute inset-0 bg-gradient-to-r from-white/12 via-transparent to-white/12 rounded-lg" />
                                <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/20 via-white/8 to-transparent rounded-t-lg" />
                                
                                <div className="flex items-center gap-1.5 relative z-10">
                                    {showToolsPanel ? 
                                        <EyeOff className="w-3.5 h-3.5 text-white" style={{ 
                                            filter: 'drop-shadow(0 1px 3px rgba(0,0,0,0.3))',
                                            strokeWidth: '2.5px',
                                        }} /> : 
                                        <Eye className="w-3.5 h-3.5 text-white" style={{ 
                                            filter: 'drop-shadow(0 1px 3px rgba(0,0,0,0.3))',
                                            strokeWidth: '2.5px',
                                        }} />
                                    }
                                    <span className="text-white font-bold" style={{ 
                                        textShadow: '0 1px 3px rgba(0, 0, 0, 0.3)',
                                        letterSpacing: '0.02em',
                                    }}>Tools</span>
                                </div>
                            </motion.button>
                                <motion.button
                                whileHover={{ scale: 1.04, y: -1 }}
                                whileTap={{ scale: 0.96 }}
                                onClick={runAllTools}
                                disabled={loading}
                                className="px-3.5 py-1.5 rounded-lg text-white font-bold text-xs shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all relative overflow-hidden"
                                style={{
                                    background: 'linear-gradient(135deg, rgba(124, 58, 237, 1) 0%, rgba(139, 92, 246, 1) 50%, rgba(167, 139, 250, 1) 100%)',
                                    border: '1.5px solid rgba(255, 255, 255, 0.50)',
                                    boxShadow: '0 4px 16px rgba(124, 58, 237, 0.35), 0 2px 8px rgba(139, 92, 246, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.40), inset 0 -1px 4px rgba(0, 0, 0, 0.10)',
                                }}
                            >
                                {/* Glass effect layers */}
                                <div className="absolute inset-0 bg-gradient-to-b from-white/30 via-transparent to-black/12 rounded-lg" />
                                <div className="absolute inset-0 bg-gradient-to-r from-white/12 via-transparent to-white/12 rounded-lg" />
                                <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/20 via-white/8 to-transparent rounded-t-lg" />
                                
                                <div className="flex items-center gap-1.5 relative z-10">
                                    <RefreshCw className={`w-3.5 h-3.5 text-white ${loading ? 'animate-spin' : ''}`} 
                                        style={{ 
                                            filter: 'drop-shadow(0 1px 3px rgba(0,0,0,0.3))',
                                            strokeWidth: '2.5px',
                                        }} 
                                    />
                                    <span className="text-white font-bold" style={{ 
                                        textShadow: '0 1px 3px rgba(0, 0, 0, 0.3)',
                                        letterSpacing: '0.02em',
                                    }}>Analyze</span>
                                </div>
                                </motion.button>
                            </div>
                        </div>
                </div>

                {/* Tab Navigation - Matching Header Style */}
                <div className="relative overflow-hidden"
                    style={{
                        background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.12) 0%, rgba(6, 182, 212, 0.14) 25%, rgba(20, 184, 166, 0.12) 50%, rgba(139, 92, 246, 0.14) 75%, rgba(6, 182, 212, 0.12) 100%), rgba(255, 255, 255, 0.96)',
                        backdropFilter: 'blur(32px) saturate(160%) contrast(104%)',
                        WebkitBackdropFilter: 'blur(32px) saturate(160%) contrast(104%)',
                        borderTop: '1px solid rgba(139, 92, 246, 0.12)',
                        boxShadow: 'inset 0 2px 0 rgba(255, 255, 255, 0.6), inset 0 -1px 0 rgba(139, 92, 246, 0.06), 0 4px 16px rgba(139, 92, 246, 0.08), 0 2px 8px rgba(0, 0, 0, 0.02)',
                    }}
                >
                    {/* Coordinated color overlays - Matching header */}
                    <div className="absolute inset-0 bg-gradient-to-br from-violet-500/8 via-cyan-500/6 to-teal-500/8 pointer-events-none" />
                    <div className="absolute inset-0 bg-gradient-to-t from-violet-700/5 via-transparent to-cyan-400/4 pointer-events-none" />
                    {/* Top light highlight */}
                    <div className="absolute inset-0 bg-gradient-to-b from-white/15 via-white/3 to-transparent pointer-events-none" />
                    {/* Bottom subtle shadow */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/2 via-transparent to-transparent pointer-events-none" />
                    {/* Side light accents */}
                    <div className="absolute inset-0 bg-gradient-to-r from-white/8 via-transparent to-white/8 pointer-events-none" />
                    
                    <div className="max-w-[2000px] mx-auto px-8 relative z-10">
                        <div className="flex gap-3 overflow-x-auto py-1.5" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                            {TABS.map(tab => {
                                const Icon = tab.icon;
                                return (
                                    <motion.button
                                        key={tab.id}
                                        whileHover={{ scale: 1.02, y: -1.5 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`
                                            flex items-center gap-2.5 px-4 py-2 rounded-xl font-bold
                                            transition-all duration-300 whitespace-nowrap relative overflow-hidden
                                            ${activeTab === tab.id
                                                ? 'text-white'
                                                : ''
                                            }
                                        `}
                        style={activeTab === tab.id ? (
                            tab.id === 'charts' ? {
                                // Charts button - Purple - Reduced diffuse light
                                background: 'linear-gradient(135deg, rgba(109, 40, 217, 1) 0%, rgba(124, 58, 237, 1) 35%, rgba(139, 92, 246, 1) 50%, rgba(124, 58, 237, 1) 65%, rgba(109, 40, 217, 1) 100%)',
                                backdropFilter: 'blur(14px) saturate(180%)',
                                WebkitBackdropFilter: 'blur(14px) saturate(180%)',
                                border: '1.5px solid rgba(255, 255, 255, 0.45)',
                                boxShadow: '0 6px 18px rgba(109, 40, 217, 0.30), 0 3px 9px rgba(124, 58, 237, 0.20), 0 1px 4px rgba(0, 0, 0, 0.10), inset 0 1px 0 rgba(255, 255, 255, 0.35), inset 0 -1px 4px rgba(0, 0, 0, 0.10)',
                                WebkitFontSmoothing: 'antialiased',
                                MozOsxFontSmoothing: 'grayscale',
                                textRendering: 'optimizeLegibility',
                            } : {
                                // Scanner button - Vibrant Cyan/Teal - Eye-catching
                                background: 'linear-gradient(135deg, rgba(6, 182, 212, 1) 0%, rgba(20, 184, 166, 1) 30%, rgba(45, 212, 191, 1) 50%, rgba(20, 184, 166, 1) 70%, rgba(6, 182, 212, 1) 100%)',
                                backdropFilter: 'blur(16px) saturate(200%)',
                                WebkitBackdropFilter: 'blur(16px) saturate(200%)',
                                border: '1.5px solid rgba(255, 255, 255, 0.60)',
                                boxShadow: '0 8px 28px rgba(6, 182, 212, 0.40), 0 4px 14px rgba(20, 184, 166, 0.30), 0 2px 6px rgba(0, 0, 0, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.50), inset 0 -2px 6px rgba(0, 0, 0, 0.12)',
                                WebkitFontSmoothing: 'antialiased',
                                MozOsxFontSmoothing: 'grayscale',
                                textRendering: 'optimizeLegibility',
                            }
                        ) : {
                            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.85) 0%, rgba(250, 245, 255, 0.90) 50%, rgba(255, 255, 255, 0.85) 100%)',
                            backdropFilter: 'blur(20px) saturate(160%)',
                            WebkitBackdropFilter: 'blur(20px) saturate(160%)',
                            border: '1px solid rgba(139, 92, 246, 0.25)',
                            boxShadow: '0 4px 14px rgba(139, 92, 246, 0.12), 0 2px 6px rgba(0, 0, 0, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.90), inset 0 -1px 0 rgba(139, 92, 246, 0.08)',
                            WebkitFontSmoothing: 'antialiased',
                            MozOsxFontSmoothing: 'grayscale',
                            textRendering: 'optimizeLegibility',
                        }}
                    >
                        {/* Light shading - Charts tab has reduced diffuse light */}
                        {activeTab === tab.id && (
                            <>
                                {/* Top highlight - reduced for Charts */}
                                <div className="absolute inset-0 bg-gradient-to-b rounded-xl" style={{
                                    background: tab.id === 'charts'
                                        ? 'linear-gradient(to bottom, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0.08) 30%, transparent 60%)'
                                        : 'linear-gradient(to bottom, rgba(255,255,255,0.40) 0%, rgba(255,255,255,0.15) 30%, transparent 60%)',
                                }} />
                                {/* Side shimmer - reduced for Charts */}
                                <div className="absolute inset-0 rounded-xl" style={{
                                    background: tab.id === 'charts'
                                        ? 'linear-gradient(to right, rgba(255,255,255,0.10) 0%, transparent 30%, transparent 70%, rgba(255,255,255,0.10) 100%)'
                                        : 'linear-gradient(to right, rgba(255,255,255,0.20) 0%, transparent 30%, transparent 70%, rgba(255,255,255,0.20) 100%)',
                                }} />
                                {/* Center glow - reduced for Charts */}
                                <div className="absolute inset-0 rounded-xl" style={{
                                    background: tab.id === 'charts' 
                                        ? 'radial-gradient(ellipse at center, rgba(255,255,255,0.08) 0%, rgba(139,92,246,0.06) 40%, transparent 65%)'
                                        : 'radial-gradient(ellipse at center, rgba(255,255,255,0.20) 0%, rgba(45,212,191,0.15) 40%, transparent 70%)',
                                }} />
                                {/* Bottom depth shadow */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent rounded-xl" />
                                {/* Top edge highlight - reduced for Charts */}
                                <div className="absolute top-0 left-0 right-0 h-1/3 rounded-t-xl" style={{
                                    background: tab.id === 'charts'
                                        ? 'linear-gradient(to bottom, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.05) 50%, transparent 100%)'
                                        : 'linear-gradient(to bottom, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0.08) 50%, transparent 100%)',
                                }} />
                                {/* Outer glow - reduced for Charts */}
                                <div className="absolute -inset-0.5 rounded-xl blur-sm" style={{
                                    background: tab.id === 'charts' 
                                        ? 'linear-gradient(135deg, rgba(124, 58, 237, 0.20) 0%, rgba(139, 92, 246, 0.15) 100%)'
                                        : 'linear-gradient(135deg, rgba(6, 182, 212, 0.40) 0%, rgba(45, 212, 191, 0.30) 100%)',
                                    opacity: tab.id === 'charts' ? 0.3 : 0.5,
                                    zIndex: -1,
                                }} />
                            </>
                        )}
                        
                        {/* Professional light shading for inactive tabs - subtle but visible */}
                        {activeTab !== tab.id && (
                            <>
                                <div className="absolute inset-0 bg-gradient-to-b from-white/30 via-transparent to-violet-100/10 rounded-xl" />
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-violet-100/8 to-transparent rounded-xl" />
                                <div className="absolute inset-0 bg-gradient-to-br from-white/12 via-transparent to-violet-200/6 rounded-xl" />
                                {/* Top subtle highlight */}
                                <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/20 via-transparent to-transparent rounded-t-xl" />
                            </>
                        )}
                                        
                                        {/* Icon - Smaller Proportionally */}
                                        <div className="relative z-10 p-1 rounded-md" style={activeTab === tab.id ? {
                                            background: 'rgba(255, 255, 255, 0.20)',
                                            boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.30)',
                                        } : {}}>
                                            <Icon 
                                                className={`transition-all duration-300 ${
                                                    activeTab === tab.id 
                                                        ? 'w-6 h-6 text-white drop-shadow-lg' 
                                                        : 'w-5 h-5 text-purple-400 drop-shadow'
                                                }`}
                                            />
                                        </div>

                                        {/* Text - Smaller Proportionally */}
                                        <div className="text-left relative z-10"
                                                style={{
                                                WebkitFontSmoothing: 'antialiased',
                                                MozOsxFontSmoothing: 'grayscale',
                                                textRendering: 'optimizeLegibility',
                                            }}
                                        >
                                            <div 
                                                className={`transition-all duration-300 ${activeTab === tab.id ? 'text-sm' : 'text-xs'}`}
                                                style={activeTab === tab.id ? {
                                                    color: '#ffffff',
                                                    textShadow: '0 1px 3px rgba(0, 0, 0, 0.3), 0 0 8px rgba(255, 255, 255, 0.3)',
                                                    letterSpacing: '0.018em',
                                                    fontWeight: 900,
                                                } : {
                                                    color: COLORS.primary.darker,
                                                    letterSpacing: '0.012em',
                                                    fontWeight: 700,
                                                }}
                                            >
                                                {tab.label}
                                            </div>
                                            <div 
                                                className={`transition-all duration-300 ${activeTab === tab.id ? 'text-[10px]' : 'text-[9px]'}`}
                                                style={activeTab === tab.id ? {
                                                    color: 'rgba(255, 255, 255, 0.95)',
                                                    textShadow: '0 1px 2px rgba(0, 0, 0, 0.2)',
                                                    letterSpacing: '0.02em',
                                                    fontWeight: 600,
                                                } : {
                                                    color: 'rgba(109, 40, 217, 0.70)',
                                                    letterSpacing: '0.018em',
                                                    fontWeight: 500,
                                                }}
                                            >
                                                {tab.description}
                                            </div>
                                        </div>
                                    </motion.button>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <div className="flex gap-0 h-[calc(100vh-160px)]">
                {/* Left Sidebar - Technical Tools - Light Background (matching page) */}
                <AnimatePresence>
                    {showToolsPanel && activeTab === 'charts' && (
                        <motion.aside
                            initial={{ x: -320, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: -320, opacity: 0 }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="w-80 bg-white dark:bg-[color:var(--surface)] border-r border-gray-200 dark:border-[color:var(--border)] overflow-y-auto shadow-xl"
                        >
                            <div className="p-6 space-y-4">
                                {/* Tools Header */}
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">Technical Tools</h2>
                                    <span className="text-xs text-purple-700 dark:text-purple-300 bg-purple-100 dark:bg-purple-500/20 px-2.5 py-1 rounded-full font-semibold border border-purple-200 dark:border-purple-400/30">
                                        {tools.filter(t => t.enabled).length} Active
                                    </span>
                                </div>

                                {/* Tool Categories */}
                                {Object.entries(groupedTools).map(([categoryId, category]) => (
                                    <div key={categoryId} className="space-y-2">
                                        {/* Category Header */}
                                        <button
                                            onClick={() => setActiveCategory(activeCategory === categoryId ? null : categoryId as ToolCategory)}
                                            className="w-full flex items-center justify-between p-3 rounded-xl bg-gray-50 hover:bg-gray-100 dark:bg-slate-800/80 dark:hover:bg-slate-700/80 border border-gray-200 dark:border-slate-700/50 transition-all group"
                                        >
                                            <div className="flex items-center gap-3">
                                                <category.icon className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                                                <span className="text-gray-900 dark:text-white font-semibold text-sm">{category.label}</span>
                                            </div>
                                            <ChevronRight className={`w-4 h-4 text-purple-600 dark:text-purple-400 transition-transform ${activeCategory === categoryId ? 'rotate-90' : ''}`} />
                                </button>

                                        {/* Category Tools */}
                                        <AnimatePresence>
                                            {activeCategory === categoryId && (
                                                <motion.div
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: 'auto', opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    transition={{ duration: 0.2 }}
                                                    className="space-y-2 overflow-hidden"
                                                >
                                                    {category.tools.map(tool => {
                                                        const Icon = tool.icon;
                                                        return (
                                                            <motion.div
                                                                key={tool.id}
                                                                initial={{ x: -20, opacity: 0 }}
                                                                animate={{ x: 0, opacity: 1 }}
                                                                transition={{ delay: 0.05 }}
                                                                className={`p-3 rounded-xl border transition-all cursor-pointer ${
                                                                    tool.enabled
                                                                        ? 'bg-gradient-to-r ' + tool.gradient + ' border-white/30 shadow-xl'
                                                                        : 'bg-gray-50 hover:bg-gray-100 dark:bg-slate-800/50 dark:hover:bg-slate-700/50 border-gray-200 dark:border-slate-700/50'
                                                                }`}
                                                                onClick={() => toggleTool(tool.id)}
                                                            >
                                                                <div className="flex items-start justify-between">
                                                                    <div className="flex items-start gap-3 flex-1">
                                                                        <Icon className={`w-5 h-5 mt-0.5 ${tool.enabled ? 'text-white' : 'text-purple-600 dark:text-purple-300'}`} />
                                                                        <div className="flex-1">
                                                                            <h4 className={`font-semibold text-sm ${tool.enabled ? 'text-white' : 'text-gray-900 dark:text-purple-100'}`}>
                                                                                {tool.name}
                                                                            </h4>
                                                                            <p className={`text-xs mt-1 ${tool.enabled ? 'text-white/90' : 'text-gray-600 dark:text-purple-200/60'}`}>
                                                                                {tool.description}
                                                                            </p>
                                                                            {tool.enabled && analysisData[tool.id] && (
                                                                                <div className="mt-2 pt-2 border-t border-white/20">
                                                                                    <ToolResults toolId={tool.id} data={analysisData[tool.id]} />
                            </div>
                        )}
                    </div>
                </div>
                                                                    <div className={`w-10 h-5 rounded-full transition-all ${tool.enabled ? 'bg-white/30' : 'bg-gray-300 dark:bg-slate-700'}`}>
                                                                        <div className={`w-4 h-4 rounded-full bg-white shadow-md transition-all transform ${tool.enabled ? 'translate-x-5' : 'translate-x-0.5'} mt-0.5`} />
                                                                    </div>
                                                                </div>
                                                            </motion.div>
                                                        );
                                                    })}
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                ))}
                            </div>
                        </motion.aside>
                    )}
                </AnimatePresence>

                {/* Main Content Area - Light Theme */}
                <main className="flex-1 overflow-hidden bg-white dark:bg-[color:var(--surface-page)]">
                <AnimatePresence mode="wait">
                        {activeTab === 'charts' && (
                        <motion.div
                                key="charts"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.2 }}
                                className="h-full p-6"
                            >
                                <div className="h-full bg-white dark:bg-[color:var(--surface)] rounded-2xl border border-gray-200 dark:border-[color:var(--border)] shadow-xl overflow-hidden">
                                    {/* Chart Container */}
                                    <div className="h-full relative">
                                        <PriceChart
                                            symbol={symbol}
                                            interval={timeframe as any}
                                            height={800}
                                        />
                                        
                                        {/* Loading Overlay */}
                                        {loading && (
                                            <div className="absolute inset-0 backdrop-blur-sm bg-white/80 dark:bg-black/30 flex items-center justify-center">
                                                <div className="bg-white dark:bg-white/10 backdrop-blur-md rounded-xl p-6 border border-gray-200 dark:border-white/20 shadow-2xl">
                                                    <LoadingSpinner size="lg" />
                                                    <p className="text-gray-900 dark:text-white mt-4 text-center font-medium">Running analysis...</p>
                                                </div>
                                            </div>
                                        )}
                                </div>
                            </div>
                        </motion.div>
                        )}

                        {activeTab === 'scanner' && (
                        <motion.div
                                key="scanner"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.2 }}
                                className="h-full p-6"
                        >
                            <Suspense fallback={
                                    <div className="h-full flex items-center justify-center bg-white dark:bg-[color:var(--surface)] rounded-2xl border border-gray-200 dark:border-[color:var(--border)]">
                                        <div className="text-center">
                                            <LoadingSpinner size="lg" />
                                            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading Scanner...</p>
                                        </div>
                                </div>
                            }>
                                    <div className="h-full">
                                        <ScannerTab />
                                    </div>
                            </Suspense>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>
                                </div>
                            </div>
    );
};

// Tool Results Component
const ToolResults: React.FC<{ toolId: string; data: any }> = ({ toolId, data }) => {
    if (!data) return null;

    const renderContent = () => {
        switch (toolId) {
            case 'smc':
                return (
                    <div className="space-y-1 text-xs text-white/90">
                        <div>Liquidity Zones: {data.liquidityZones?.length || 0}</div>
                        <div>Order Blocks: {data.orderBlocks?.length || 0}</div>
                        <div>FVG: {data.fvg?.length || 0}</div>
                    </div>
                );
            case 'elliott':
                return (
                    <div className="space-y-1 text-xs text-white/90">
                        <div>Wave: {data.currentWave?.wave || 'N/A'}</div>
                        <div>Direction: {data.nextExpectedDirection || 'N/A'}</div>
                    </div>
                );
            case 'fibonacci':
                return (
                    <div className="space-y-1 text-xs text-white/90">
                        <div>Signal: <span className={data.signal === 'BUY' ? 'text-green-200' : 'text-red-200'}>{data.signal}</span></div>
                        <div>Levels: {data.levels?.length || 0}</div>
                    </div>
                );
            case 'harmonic':
                return (
                    <div className="space-y-1 text-xs text-white/90">
                        <div>Patterns: {data?.length || 0}</div>
                        {data && data[0] && <div>Top: {data[0].name || data[0].type}</div>}
                    </div>
                );
            case 'sar':
                return (
                    <div className="space-y-1 text-xs text-white/90">
                        <div>Signal: <span className={data.signal === 'BUY' ? 'text-green-200' : 'text-red-200'}>{data.signal}</span></div>
                        <div>Confidence: {((data.confidence || 0) * 100).toFixed(0)}%</div>
                </div>
                );
            case 'regime':
                return (
                    <div className="space-y-1 text-xs text-white/90">
                        <div>Regime: <span className="uppercase">{data.regime}</span></div>
                        <div>Confidence: {((data.confidence || 0) * 100).toFixed(0)}%</div>
        </div>
    );
            default:
                return null;
        }
    };

    return <div className="animate-fade-in">{renderContent()}</div>;
};

export default MarketAnalysisHub;
