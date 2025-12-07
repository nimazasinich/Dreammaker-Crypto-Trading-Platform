/**
 * Strategy Manager Component
 * Manages trading strategies with toggles, performance metrics, and configuration
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Target, TrendingUp, Waves, Activity, Zap, Play, Square,
    Settings, ChevronDown, ChevronUp, BarChart3, DollarSign,
    AlertCircle, CheckCircle2, XCircle
} from 'lucide-react';

export interface Strategy {
    id: string;
    name: string;
    description: string;
    type: 'scalping' | 'day' | 'swing';
    icon: React.ComponentType<{ className?: string }>;
    gradient: string;
    glowColor: string;
    enabled: boolean;
    signals: number;
    winRate: number;
    avgProfit: number;
    totalProfit: number;
    performance: string;
    config: {
        minScore: number;
        timeframes: string[];
        riskPerTrade: number;
        minRiskReward: number;
    };
}

interface StrategyManagerProps {
    strategies: Strategy[];
    onToggleStrategy: (id: string) => void;
    onUpdateConfig: (id: string, config: Partial<Strategy['config']>) => void;
    isRunning: boolean;
}

const StrategyManager: React.FC<StrategyManagerProps> = ({
    strategies = [],
    onToggleStrategy,
    onUpdateConfig,
    isRunning = false
}) => {
    const [expandedStrategy, setExpandedStrategy] = useState<string | null>(null);
    const [sensitivity, setSensitivity] = useState<'conservative' | 'balanced' | 'aggressive'>('balanced');

    const sensitivityThresholds = {
        conservative: 85,
        balanced: 75,
        aggressive: 65
    };

    const getStrategyTypeLabel = (type: string) => {
        switch (type) {
            case 'scalping': return 'Scalping (1-5min)';
            case 'day': return 'Day Trading (15min-1h)';
            case 'swing': return 'Swing Trading (4h-1D)';
            default: return type;
        }
    };

    const getPerformanceColor = (performance: string) => {
        const value = parseFloat(performance.replace(/[+%]/g, ''));
        if (value > 0) return 'text-green-400';
        if (value < 0) return 'text-red-400';
        return 'text-gray-400';
    };

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
    };

    return (
        <div className="space-y-4">
            {/* Sensitivity Control */}
            <div
                className="rounded-2xl p-4 border"
                style={{
                    background: lightColors.bg,
                    borderColor: lightColors.border,
                    boxShadow: `0 4px 12px ${lightColors.shadow}`,
                }}
            >
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <Activity className="w-5 h-5" style={{ color: lightColors.accent }} />
                        <span className="text-sm font-bold" style={{ color: lightColors.text }}>Signal Sensitivity</span>
                    </div>
                    <span className="text-xs" style={{ color: lightColors.textSecondary }}>
                        Min Score: {sensitivityThresholds[sensitivity]}
                    </span>
                </div>
                <div className="flex gap-2">
                    {(['conservative', 'balanced', 'aggressive'] as const).map((level) => (
                        <motion.button
                            key={level}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setSensitivity(level)}
                            className="flex-1 px-4 py-2 rounded-xl font-semibold text-sm transition-all"
                            style={sensitivity === level
                                ? {
                                    background: `linear-gradient(135deg, ${lightColors.accent} 0%, ${lightColors.accentLight} 100%)`,
                                    color: '#ffffff',
                                    boxShadow: `0 4px 12px ${lightColors.shadow}`,
                                }
                                : {
                                    background: lightColors.surface,
                                    color: lightColors.textSecondary,
                                    border: `1px solid ${lightColors.border}`,
                                }}
                            onMouseEnter={(e) => {
                                if (sensitivity !== level) {
                                    e.currentTarget.style.background = lightColors.hover;
                                    e.currentTarget.style.color = lightColors.accent;
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (sensitivity !== level) {
                                    e.currentTarget.style.background = lightColors.surface;
                                    e.currentTarget.style.color = lightColors.textSecondary;
                                }
                            }}
                        >
                            {level.charAt(0).toUpperCase() + level.slice(1)}
                        </motion.button>
                    ))}
                </div>
            </div>

            {/* Strategy Cards */}
            <div className="space-y-3">
                {strategies.map((strategy, index) => {
                    const Icon = strategy.icon;
                    const isExpanded = expandedStrategy === strategy.id;

                    return (
                        <motion.div
                            key={strategy.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="rounded-2xl overflow-hidden border"
                            style={{
                                background: lightColors.bg,
                                borderColor: lightColors.border,
                                boxShadow: `0 4px 12px ${lightColors.shadow}`,
                            }}
                        >
                            {/* Strategy Header */}
                            <div
                                className="p-4 cursor-pointer"
                                onClick={() => setExpandedStrategy(isExpanded ? null : strategy.id)}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3 flex-1">
                                        {/* Icon */}
                                        <motion.div
                                            whileHover={{ rotate: [0, -10, 10, -10, 0] }}
                                            transition={{ duration: 0.5 }}
                                            className={`w-12 h-12 rounded-xl flex items-center justify-center
                                 bg-gradient-to-r ${strategy.gradient} shadow-lg`}
                                            style={{ boxShadow: `0 10px 40px ${strategy.glowColor}` }}
                                        >
                                            <Icon className="w-6 h-6 text-white" />
                                        </motion.div>

                                        {/* Info */}
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className="text-lg font-bold" style={{ color: lightColors.text }}>{strategy.name}</h3>
                                                <span
                                                    className="text-xs px-2 py-0.5 rounded-full"
                                                    style={{
                                                        background: lightColors.surface,
                                                        color: lightColors.textSecondary,
                                                    }}
                                                >
                                                    {getStrategyTypeLabel(strategy.type)}
                                                </span>
                                            </div>
                                            <p className="text-sm" style={{ color: lightColors.textSecondary }}>{strategy.description}</p>
                                        </div>

                                        {/* Toggle */}
                                        <motion.button
                                            whileTap={{ scale: 0.9 }}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onToggleStrategy(strategy.id);
                                            }}
                                            className="relative w-14 h-7 rounded-full transition-all duration-300"
                                            style={strategy.enabled
                                                ? {
                                                    background: `linear-gradient(135deg, ${lightColors.accent} 0%, ${lightColors.accentLight} 100%)`,
                                                    boxShadow: `0 4px 12px ${lightColors.shadow}`,
                                                }
                                                : {
                                                    background: lightColors.border,
                                                }}
                                        >
                                            <motion.div
                                                animate={{ x: strategy.enabled ? 28 : 2 }}
                                                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                                                className="absolute top-1 w-5 h-5 bg-white rounded-full shadow-lg"
                                            />
                                        </motion.button>
                                    </div>
                                </div>

                                {/* Quick Stats */}
                                {!isExpanded && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        className="grid grid-cols-4 gap-3 mt-4 pt-4 border-t"
                                        style={{ borderColor: lightColors.border }}
                                    >
                                        <div className="text-center">
                                            <p className="text-xs mb-1" style={{ color: lightColors.textSecondary }}>Signals</p>
                                            <p className="text-lg font-bold" style={{ color: lightColors.text }}>{strategy.signals}</p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-xs mb-1" style={{ color: lightColors.textSecondary }}>Win Rate</p>
                                            <p className="text-lg font-bold" style={{ color: strategy.winRate >= 60 ? '#10b981' : '#f59e0b' }}>
                                                {strategy.winRate}%
                                            </p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-xs mb-1" style={{ color: lightColors.textSecondary }}>Avg Profit</p>
                                            <p className="text-lg font-bold" style={{ color: getPerformanceColor(strategy.performance).includes('green') ? '#10b981' : getPerformanceColor(strategy.performance).includes('red') ? '#ef4444' : lightColors.textSecondary }}>
                                                {strategy.avgProfit > 0 ? '+' : ''}{strategy.avgProfit.toFixed(2)}%
                                            </p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-xs mb-1" style={{ color: lightColors.textSecondary }}>Total</p>
                                            <p className="text-lg font-bold" style={{ color: getPerformanceColor(strategy.performance).includes('green') ? '#10b981' : getPerformanceColor(strategy.performance).includes('red') ? '#ef4444' : lightColors.textSecondary }}>
                                                {strategy.performance}
                                            </p>
                                        </div>
                                    </motion.div>
                                )}

                                {/* Expand/Collapse Icon */}
                                <div className="flex justify-center mt-2">
                                    <motion.div
                                        animate={{ rotate: isExpanded ? 180 : 0 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <ChevronDown className="w-5 h-5" style={{ color: lightColors.textSecondary }} />
                                    </motion.div>
                                </div>
                            </div>

                            {/* Expanded Configuration */}
                            <AnimatePresence>
                                {isExpanded && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.3 }}
                                        className="border-t"
                                        style={{ borderColor: lightColors.border }}
                                    >
                                        <div className="p-4 space-y-4">
                                            {/* Performance Metrics */}
                                            <div className="grid grid-cols-2 gap-3">
                                                <div
                                                    className="rounded-xl p-3"
                                                    style={{
                                                        background: lightColors.surface,
                                                        border: `1px solid ${lightColors.border}`,
                                                    }}
                                                >
                                                    <p className="text-xs mb-1" style={{ color: lightColors.textSecondary }}>Total Signals</p>
                                                    <p className="text-2xl font-bold" style={{ color: lightColors.text }}>{strategy.signals}</p>
                                                </div>
                                                <div
                                                    className="rounded-xl p-3"
                                                    style={{
                                                        background: lightColors.surface,
                                                        border: `1px solid ${lightColors.border}`,
                                                    }}
                                                >
                                                    <p className="text-xs mb-1" style={{ color: lightColors.textSecondary }}>Win Rate</p>
                                                    <p className="text-2xl font-bold" style={{ color: strategy.winRate >= 60 ? '#10b981' : '#f59e0b' }}>
                                                        {strategy.winRate}%
                                                    </p>
                                                </div>
                                                <div
                                                    className="rounded-xl p-3"
                                                    style={{
                                                        background: lightColors.surface,
                                                        border: `1px solid ${lightColors.border}`,
                                                    }}
                                                >
                                                    <p className="text-xs mb-1" style={{ color: lightColors.textSecondary }}>Avg Profit/Trade</p>
                                                    <p className="text-2xl font-bold" style={{ color: getPerformanceColor(strategy.performance).includes('green') ? '#10b981' : getPerformanceColor(strategy.performance).includes('red') ? '#ef4444' : lightColors.textSecondary }}>
                                                        {strategy.avgProfit > 0 ? '+' : ''}{strategy.avgProfit.toFixed(2)}%
                                                    </p>
                                                </div>
                                                <div
                                                    className="rounded-xl p-3"
                                                    style={{
                                                        background: lightColors.surface,
                                                        border: `1px solid ${lightColors.border}`,
                                                    }}
                                                >
                                                    <p className="text-xs mb-1" style={{ color: lightColors.textSecondary }}>Total Performance</p>
                                                    <p className="text-2xl font-bold" style={{ color: getPerformanceColor(strategy.performance).includes('green') ? '#10b981' : getPerformanceColor(strategy.performance).includes('red') ? '#ef4444' : lightColors.textSecondary }}>
                                                        {strategy.performance}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Configuration */}
                                            <div className="space-y-3">
                                                <h4 className="text-sm font-bold flex items-center gap-2" style={{ color: lightColors.text }}>
                                                    <Settings className="w-4 h-4" style={{ color: lightColors.accent }} />
                                                    Configuration
                                                </h4>

                                                <div className="space-y-2">
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-sm" style={{ color: lightColors.textSecondary }}>Min Score Threshold</span>
                                                        <span className="text-sm font-bold" style={{ color: lightColors.text }}>{strategy.config.minScore}</span>
                                                    </div>
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-sm" style={{ color: lightColors.textSecondary }}>Timeframes</span>
                                                        <span className="text-sm font-bold" style={{ color: lightColors.text }}>
                                                            {strategy.config.timeframes.join(', ')}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-sm" style={{ color: lightColors.textSecondary }}>Risk per Trade</span>
                                                        <span className="text-sm font-bold" style={{ color: lightColors.text }}>{strategy.config.riskPerTrade}%</span>
                                                    </div>
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-sm" style={{ color: lightColors.textSecondary }}>Min Risk/Reward</span>
                                                        <span className="text-sm font-bold" style={{ color: lightColors.text }}>1:{strategy.config.minRiskReward}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Status Badge */}
                                            <div className="flex items-center gap-2 pt-2 border-t" style={{ borderColor: lightColors.border }}>
                                                {strategy.enabled ? (
                                                    <>
                                                        <CheckCircle2 className="w-5 h-5" style={{ color: '#10b981' }} />
                                                        <span className="text-sm font-semibold" style={{ color: '#10b981' }}>Active</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <XCircle className="w-5 h-5" style={{ color: lightColors.textSecondary }} />
                                                        <span className="text-sm font-semibold" style={{ color: lightColors.textSecondary }}>Disabled</span>
                                                    </>
                                                )}
                                                {isRunning && strategy.enabled && (
                                                    <span className="ml-auto text-xs animate-pulse" style={{ color: lightColors.accent }}>
                                                        Monitoring...
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
};

export default StrategyManager;

