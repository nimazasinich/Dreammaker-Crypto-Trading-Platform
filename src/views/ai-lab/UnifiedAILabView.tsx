/**
 * Unified AI Lab View - Phase 2 Implementation
 * 
 * Consolidates 3 AI/ML pages into one unified interface with 5 tabs:
 * - Scanner: AI-powered market scanner (DEFAULT)
 * - Training: Model training interface
 * - Backtest: Historical strategy testing
 * - Builder: Strategy configuration and templates
 * - Insights: HTS Strategy Pipeline results
 * 
 * Features:
 * - Tab-based navigation with deep linking support
 * - Seamless AI/ML workflow integration
 * - Keyboard shortcuts (Cmd/Ctrl + 1-5)
 * - Backward compatibility via route redirects
 * 
 * @version 1.0.0
 * @since Phase 2
 */

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search,
    GraduationCap,
    TestTube,
    Wrench,
    Lightbulb,
    Loader2
} from 'lucide-react';

// Import visual enhancement components
import { NeuralBackground } from '../../components/effects/NeuralBackground';

// Import tab components
import { ScannerTab } from './tabs/ScannerTab';
import { TrainingTab } from './tabs/TrainingTab';
import { BacktestTab } from './tabs/BacktestTab';
import { BuilderTab } from './tabs/BuilderTab';
import { InsightsTab } from './tabs/InsightsTab';

type TabId = 'scanner' | 'training' | 'backtest' | 'builder' | 'insights';

interface TabConfig {
    id: TabId;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    component: React.ComponentType;
    gradient: string;
    glowColor: string;
    description: string;
}

const TABS: TabConfig[] = [
    {
        id: 'scanner',
        label: 'Scanner',
        icon: Search,
        component: ScannerTab,
        gradient: 'from-cyan-500 to-blue-500',
        glowColor: 'rgba(6, 182, 212, 0.5)',
        description: 'AI-powered market scanner'
    },
    {
        id: 'training',
        label: 'Training',
        icon: GraduationCap,
        component: TrainingTab,
        gradient: 'from-purple-500 to-pink-500',
        glowColor: 'rgba(168, 85, 247, 0.5)',
        description: 'Train ML models'
    },
    {
        id: 'backtest',
        label: 'Backtest',
        icon: TestTube,
        component: BacktestTab,
        gradient: 'from-orange-500 to-red-500',
        glowColor: 'rgba(249, 115, 22, 0.5)',
        description: 'Historical testing'
    },
    {
        id: 'builder',
        label: 'Builder',
        icon: Wrench,
        component: BuilderTab,
        gradient: 'from-emerald-500 to-teal-500',
        glowColor: 'rgba(16, 185, 129, 0.5)',
        description: 'Build strategies'
    },
    {
        id: 'insights',
        label: 'Insights',
        icon: Lightbulb,
        component: InsightsTab,
        gradient: 'from-yellow-500 to-amber-500',
        glowColor: 'rgba(234, 179, 8, 0.5)',
        description: 'Pipeline results'
    }
];

export const UnifiedAILabView: React.FC = () => {
    // Get initial tab from URL params or default to 'scanner'
    const getInitialTab = (): TabId => {
        const params = new URLSearchParams(window.location.search);
        const tabParam = params.get('tab') as TabId;
        return TABS.find(t => t.id === tabParam)?.id || 'scanner';
    };

    const [activeTab, setActiveTab] = useState<TabId>(getInitialTab());

    // Handle tab changes
    const handleTabChange = useCallback((tabId: TabId) => {
        setActiveTab(tabId);

        // Update URL params without page reload
        const url = new URL(window.location.href);
        url.searchParams.set('tab', tabId);
        window.history.replaceState({}, '', url.toString());
    }, []);

    // Sync active tab with URL params
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const tabParam = params.get('tab') as TabId;
        if (tabParam && TABS.find(t => t.id === tabParam)) {
            setActiveTab(tabParam);
        }
    }, []);

    // Keyboard shortcuts: Cmd/Ctrl + 1-5
    useEffect(() => {
        const handleKeyPress = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key >= '1' && e.key <= '5') {
                e.preventDefault();
                const index = parseInt(e.key) - 1;
                if (TABS[index]) {
                    handleTabChange(TABS[index].id);
                }
            }
        };

        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [handleTabChange]);

    const ActiveComponent = TABS.find(t => t.id === activeTab)?.component;

    return (
        <div className="relative min-h-screen">
            {/* Neural network background */}
            <div className="absolute inset-0 opacity-20 pointer-events-none">
                <NeuralBackground />
            </div>

            {/* Content */}
            <div className="relative z-10 container mx-auto p-4 space-y-4">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-between"
                >
                    <div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                            AI Lab
                        </h1>
                        <p className="text-sm text-muted-foreground mt-1">
                            AI-powered strategy development • 5 tabs • Complete workflow
                        </p>
                    </div>
                </motion.div>

                {/* Tab Navigation */}
                <div className="flex gap-2 overflow-x-auto pb-2">
                    {TABS.map((tab, index) => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;

                        return (
                            <motion.button
                                key={tab.id}
                                onClick={() => handleTabChange(tab.id)}
                                className={`
                relative flex flex-col items-start gap-1 px-4 py-3 rounded-lg font-medium
                transition-all duration-300 whitespace-nowrap min-w-[140px]
                ${isActive
                                        ? 'bg-gradient-to-r ' + tab.gradient + ' text-white shadow-lg'
                                        : 'bg-card hover:bg-accent text-muted-foreground hover:text-foreground'
                                    }
              `}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                style={{
                                    boxShadow: isActive ? `0 4px 20px ${tab.glowColor}` : undefined
                                }}
                            >
                                <div className="flex items-center gap-2 w-full">
                                    <Icon className="w-5 h-5" />
                                    <span>{tab.label}</span>

                                    {/* Keyboard shortcut hint */}
                                    <span className={`
                  ml-auto text-xs px-1.5 py-0.5 rounded
                  ${isActive ? 'bg-white/20' : 'bg-muted'}
                `}>
                                        ⌘{index + 1}
                                    </span>
                                </div>

                                {/* Description */}
                                <span className={`text-xs ${isActive ? 'opacity-90' : 'opacity-60'}`}>
                                    {tab.description}
                                </span>
                            </motion.button>
                        );
                    })}
                </div>

                {/* Tab Content */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.2 }}
                        className="min-h-[600px]"
                    >
                        {ActiveComponent && <ActiveComponent />}
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
};

export default UnifiedAILabView;
