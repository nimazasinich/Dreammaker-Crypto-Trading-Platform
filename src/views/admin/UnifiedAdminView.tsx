/**
 * Unified Admin View - Phase 3 Implementation
 * 
 * Consolidates 2 admin pages into one unified interface with 3 tabs:
 * - Health: System health metrics (DEFAULT)
 * - Monitoring: Performance and error tracking
 * - Diagnostics: Provider diagnostics
 * 
 * Features:
 * - Tab-based navigation with deep linking support
 * - Real-time monitoring and updates
 * - Keyboard shortcuts (Cmd/Ctrl + 1-3)
 * - Admin-only access control
 * - Backward compatibility via route redirects
 * 
 * @version 1.0.0
 * @since Phase 3
 */

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Activity,
    BarChart3,
    Stethoscope,
    Loader2
} from 'lucide-react';

// Import tab components
import { HealthTab } from './tabs/HealthTab';
import { MonitoringTab } from './tabs/MonitoringTab';
import { DiagnosticsTab } from './tabs/DiagnosticsTab';

type TabId = 'health' | 'monitoring' | 'diagnostics';

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
        id: 'health',
        label: 'System Health',
        icon: Activity,
        component: HealthTab,
        gradient: 'from-green-500 to-emerald-500',
        glowColor: 'rgba(34, 197, 94, 0.5)',
        description: 'System status & metrics'
    },
    {
        id: 'monitoring',
        label: 'Monitoring',
        icon: BarChart3,
        component: MonitoringTab,
        gradient: 'from-blue-500 to-cyan-500',
        glowColor: 'rgba(59, 130, 246, 0.5)',
        description: 'Performance & errors'
    },
    {
        id: 'diagnostics',
        label: 'Diagnostics',
        icon: Stethoscope,
        component: DiagnosticsTab,
        gradient: 'from-purple-500 to-pink-500',
        glowColor: 'rgba(168, 85, 247, 0.5)',
        description: 'Provider diagnostics'
    }
];

export const UnifiedAdminView: React.FC = () => {
    // Get initial tab from URL params or default to 'health'
    const getInitialTab = (): TabId => {
        const params = new URLSearchParams(window.location.search);
        const tabParam = params.get('tab') as TabId;
        return TABS.find(t => t.id === tabParam)?.id || 'health';
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

    // Keyboard shortcuts: Cmd/Ctrl + 1-3
    useEffect(() => {
        const handleKeyPress = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key >= '1' && e.key <= '3') {
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
        <div className="container mx-auto p-4 space-y-4">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between"
            >
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-green-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                        Admin Hub
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        System monitoring and diagnostics • 3 tabs • Admin only
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
                transition-all duration-300 whitespace-nowrap min-w-[160px]
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
    );
};

export default UnifiedAdminView;
