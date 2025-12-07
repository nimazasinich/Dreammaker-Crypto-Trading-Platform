/**
 * Charts Tab - TradingView Widgets and Screener
 * 
 * Contains:
 * - TradingView Advanced Chart Widget
 * - Market Screener
 * - Forex Calendar
 * - News Feed
 * - Drawing Tools
 * 
 * @version 1.0.0
 * @since Phase 1
 */

import React, { useState, useEffect, Suspense, lazy } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Newspaper, Search, Layers } from 'lucide-react';
import LoadingSpinner from '../../../components/ui/LoadingSpinner';

// Lazy load heavy TradingView components
const EnhancedChartWrapper = lazy(() => import('../../../components/tradingview/EnhancedChartWrapper'));
const ForexCalendar = lazy(() => import('../../../components/tradingview/ForexCalendar'));
const AdvancedNews = lazy(() => import('../../../components/tradingview/AdvancedNews'));

// Regular imports
import Screener from '../../../components/tradingview/Screener';
import EnhancedScreener from '../../../components/tradingview/EnhancedScreener';
import DrawingToolsPanel from '../../../components/tradingview/DrawingToolsPanel';

interface ChartsTabProps {
    selectedSymbol: string;
    onSymbolChange: (symbol: string) => void;
    wsData?: any;
}

type SubTabId = 'chart' | 'screener' | 'calendar' | 'news';

interface SubTab {
    id: SubTabId;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
}

const SUB_TABS: SubTab[] = [
    { id: 'chart', label: 'Chart', icon: Layers },
    { id: 'screener', label: 'Screener', icon: Search },
    { id: 'calendar', label: 'Calendar', icon: Calendar },
    { id: 'news', label: 'News', icon: Newspaper }
];

export const ChartsTab: React.FC<ChartsTabProps> = ({
    selectedSymbol,
    onSymbolChange,
    wsData
}) => {
    const [activeSubTab, setActiveSubTab] = useState<SubTabId>('chart');
    const [chartSymbol, setChartSymbol] = useState(selectedSymbol);
    const [activeTool, setActiveTool] = useState<string | null>(null);

    // Sync chart symbol with parent selected symbol
    useEffect(() => {
        setChartSymbol(selectedSymbol);
    }, [selectedSymbol]);

    const handleSymbolClick = (symbol: string) => {
        const formattedSymbol = symbol.includes(':') ? symbol : `BINANCE:${symbol}`;
        setChartSymbol(formattedSymbol);
        onSymbolChange(formattedSymbol);
    };

    return (
        <div className="space-y-4">
            {/* Sub-tab Navigation */}
            <div className="flex gap-2">
                {SUB_TABS.map(tab => {
                    const Icon = tab.icon;
                    const isActive = activeSubTab === tab.id;

                    return (
                        <motion.button
                            key={tab.id}
                            onClick={() => setActiveSubTab(tab.id)}
                            className={`
                flex items-center gap-2 px-4 py-2 rounded-lg font-medium
                transition-all duration-200
                ${isActive
                                    ? 'bg-primary text-primary-foreground shadow-md'
                                    : 'bg-card hover:bg-accent text-muted-foreground hover:text-foreground'
                                }
              `}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <Icon className="w-4 h-4" />
                            <span>{tab.label}</span>
                        </motion.button>
                    );
                })}
            </div>

            {/* Sub-tab Content */}
            <div className="min-h-[600px]">
                {activeSubTab === 'chart' && (
                    <div className="space-y-4">
                        {/* Drawing Tools Panel */}
                    <DrawingToolsPanel 
                        activeTool={activeTool}
                        onToolSelect={setActiveTool}
                        onToolChange={setActiveTool}
                    />

                        {/* TradingView Chart */}
                        <Suspense fallback={<LoadingSpinner message="Loading chart..." />}>
                            <div className="bg-card rounded-lg shadow-lg p-4">
                                <EnhancedChartWrapper
                                    symbol={chartSymbol}
                                    interval={'1D'}
                                    theme="light"
                                    height={'600'}
                                />
                            </div>
                        </Suspense>
                    </div>
                )}

                {activeSubTab === 'screener' && (
                    <div className="space-y-4">
                        {/* Enhanced Screener */}
                        <EnhancedScreener
                            onSymbolClick={handleSymbolClick}
                        />

                        {/* Basic Screener */}
                        <Screener
                            onSymbolClick={handleSymbolClick}
                        />
                    </div>
                )}

                {activeSubTab === 'calendar' && (
                    <Suspense fallback={<LoadingSpinner message="Loading calendar..." />}>
                        <div className="bg-card rounded-lg shadow-lg p-4">
                            <ForexCalendar />
                        </div>
                    </Suspense>
                )}

                {activeSubTab === 'news' && (
                    <Suspense fallback={<LoadingSpinner message="Loading news..." />}>
                        <div className="bg-card rounded-lg shadow-lg p-4">
                            <AdvancedNews />
                        </div>
                    </Suspense>
                )}
            </div>
        </div>
    );
};

export default ChartsTab;
