/**
 * Scanner Tab - AI-Powered Market Scanner
 * 
 * Contains:
 * - AI Signals Scanner
 * - Technical Patterns Scanner
 * - Smart Money Scanner
 * - News Sentiment Scanner
 * - Whale Activity Scanner
 * - Scanner Feed Panel
 * 
 * Source: ScannerView.tsx
 * 
 * @version 1.0.0
 * @since Phase 2
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Brain, TrendingUp, DollarSign, Newspaper, Waves } from 'lucide-react';

// Import scanner components
import { AISignalsScanner } from '../../../components/scanner/AISignalsScanner';
import { TechnicalPatternsScanner } from '../../../components/scanner/TechnicalPatternsScanner';
import { SmartMoneyScanner } from '../../../components/scanner/SmartMoneyScanner';
import { NewsSentimentScanner } from '../../../components/scanner/NewsSentimentScanner';
import { WhaleActivityScanner } from '../../../components/scanner/WhaleActivityScanner';
import ScannerFeedPanel from '../../../components/scanner/ScannerFeedPanel';

type ScannerSubTab = 'overview' | 'ai-signals' | 'patterns' | 'smart-money' | 'sentiment' | 'whales' | 'feed';

interface SubTab {
    id: ScannerSubTab;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
}

const SUB_TABS: SubTab[] = [
    { id: 'overview', label: 'Overview', icon: Search },
    { id: 'ai-signals', label: 'AI Signals', icon: Brain },
    { id: 'patterns', label: 'Patterns', icon: TrendingUp },
    { id: 'smart-money', label: 'Smart Money', icon: DollarSign },
    { id: 'sentiment', label: 'Sentiment', icon: Newspaper },
    { id: 'whales', label: 'Whales', icon: Waves }
];

export const ScannerTab: React.FC = () => {
    const [activeSubTab, setActiveSubTab] = useState<ScannerSubTab>('overview');

    return (
        <div className="space-y-6">
            {/* Sub-tab Navigation */}
            <div className="flex gap-2 overflow-x-auto pb-2">
                {SUB_TABS.map(tab => {
                    const Icon = tab.icon;
                    const isActive = activeSubTab === tab.id;

                    return (
                        <motion.button
                            key={tab.id}
                            onClick={() => setActiveSubTab(tab.id)}
                            className={`
                flex items-center gap-2 px-4 py-2 rounded-lg font-medium
                transition-all duration-200 whitespace-nowrap
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
            <div className="min-h-[500px]">
                {activeSubTab === 'overview' && (
                    <div className="space-y-4">
                        <div className="bg-card p-6 rounded-lg shadow-lg">
                            <h3 className="text-lg font-semibold mb-4">Market Scanner Overview</h3>
                            <p className="text-muted-foreground mb-4">
                                Access multiple scanner engines to identify trading opportunities across different strategies and timeframes.
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {SUB_TABS.slice(1).map(tab => {
                                    const Icon = tab.icon;
                                    return (
                                        <button
                                            key={tab.id}
                                            onClick={() => setActiveSubTab(tab.id)}
                                            className="p-4 bg-accent hover:bg-accent/80 rounded-lg text-left transition-colors"
                                        >
                                            <Icon className="w-8 h-8 mb-2 text-primary" />
                                            <h4 className="font-semibold">{tab.label}</h4>
                                            <p className="text-sm text-muted-foreground mt-1">
                                                {tab.id === 'ai-signals' && 'AI-powered signal detection'}
                                                {tab.id === 'patterns' && 'Technical pattern recognition'}
                                                {tab.id === 'smart-money' && 'Institutional flow tracking'}
                                                {tab.id === 'sentiment' && 'News sentiment analysis'}
                                                {tab.id === 'whales' && 'Large transaction monitoring'}
                                            </p>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Quick Scanner Feed */}
                        <ScannerFeedPanel />
                    </div>
                )}

                {activeSubTab === 'ai-signals' && (
                    <div className="bg-card p-6 rounded-lg shadow-lg">
                        <AISignalsScanner />
                    </div>
                )}

                {activeSubTab === 'patterns' && (
                    <div className="bg-card p-6 rounded-lg shadow-lg">
                        <TechnicalPatternsScanner />
                    </div>
                )}

                {activeSubTab === 'smart-money' && (
                    <div className="bg-card p-6 rounded-lg shadow-lg">
                        <SmartMoneyScanner />
                    </div>
                )}

                {activeSubTab === 'sentiment' && (
                    <div className="bg-card p-6 rounded-lg shadow-lg">
                        <NewsSentimentScanner />
                    </div>
                )}

                {activeSubTab === 'whales' && (
                    <div className="bg-card p-6 rounded-lg shadow-lg">
                        <WhaleActivityScanner />
                    </div>
                )}
            </div>
        </div>
    );
};

export default ScannerTab;
