/**
 * Insights Tab - HTS Strategy Pipeline Results
 * 
 * Contains:
 * - Pipeline execution results
 * - Strategy performance analysis
 * - Comparative metrics
 * - Optimization insights
 * 
 * Source: EnhancedStrategyLabView.tsx (Insights tab)
 * 
 * @version 1.0.0
 * @since Phase 2
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Activity, TrendingUp, Award, Target, Zap, Loader2 } from 'lucide-react';
import { useStrategyPipeline } from '../../../hooks/useStrategyPipeline';
import ScoreGauge from '../../../components/strategy/ScoreGauge';
import { PerformanceChart } from '../../../components/strategy/PerformanceChart';

export const InsightsTab: React.FC = () => {
    const [symbol, setSymbol] = useState('BTCUSDT');
    const { data: results, isLoading, error, runDefaultPipeline: execute } = useStrategyPipeline();

    // Auto-execute pipeline on mount
    useEffect(() => {
        if (execute) execute();
    }, [symbol, execute]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-center space-y-4">
                    <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
                    <p className="text-muted-foreground">Running HTS Strategy Pipeline...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-6">
                <p className="text-red-500">{error}</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between bg-card p-4 rounded-lg shadow">
                <div>
                    <h3 className="text-2xl font-semibold">Pipeline Insights</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                        HTS Strategy Pipeline execution results and analysis
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <select
                        value={symbol}
                        onChange={(e) => setSymbol(e.target.value)}
                        className="px-4 py-2 rounded-lg bg-background border border-border"
                    >
                        <option value="BTCUSDT">BTC/USDT</option>
                        <option value="ETHUSDT">ETH/USDT</option>
                        <option value="SOLUSDT">SOL/USDT</option>
                    </select>

                    <button
                        onClick={() => execute && execute()}
                        className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
                    >
                        <Zap className="w-4 h-4" />
                        Run Pipeline
                    </button>
                </div>
            </div>

            {/* Strategy Results Grid */}
            {results && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Strategy 1 */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-card p-6 rounded-lg shadow-lg"
                    >
                        <div className="flex items-center gap-2 mb-4">
                            <TrendingUp className="w-5 h-5 text-blue-500" />
                            <h4 className="font-semibold">Strategy 1</h4>
                        </div>

                        {results.strategy1 && (
                            <>
                                <ScoreGauge score={results.strategy1.symbols?.[0]?.core || 0.5} size="md" />
                                <div className="mt-4 space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Symbols:</span>
                                        <span className="font-medium">{results.strategy1.symbols?.length || 0}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Avg Score:</span>
                                        <span className="font-medium">{(results.strategy1.meta?.avgScore || 0).toFixed(2)}</span>
                                    </div>
                                </div>
                            </>
                        )}
                    </motion.div>

                    {/* Strategy 2 */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-card p-6 rounded-lg shadow-lg"
                    >
                        <div className="flex items-center gap-2 mb-4">
                            <Target className="w-5 h-5 text-purple-500" />
                            <h4 className="font-semibold">Strategy 2</h4>
                        </div>

                        {results.strategy2 && (
                            <>
                                <ScoreGauge score={results.strategy2.symbols?.[0]?.core || 0.5} size="md" />
                                <div className="mt-4 space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Symbols:</span>
                                        <span className="font-medium">{results.strategy2.symbols?.length || 0}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Avg Score:</span>
                                        <span className="font-medium">{(results.strategy2.meta?.avgScore || 0).toFixed(2)}</span>
                                    </div>
                                </div>
                            </>
                        )}
                    </motion.div>

                    {/* Strategy 3 */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-card p-6 rounded-lg shadow-lg"
                    >
                        <div className="flex items-center gap-2 mb-4">
                            <Award className="w-5 h-5 text-amber-500" />
                            <h4 className="font-semibold">Strategy 3</h4>
                        </div>

                        {results.strategy3 && (
                            <>
                                <ScoreGauge score={results.strategy3.symbols?.[0]?.core || 0.5} size="md" />
                                <div className="mt-4 space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Symbols:</span>
                                        <span className="font-medium">{results.strategy3.symbols?.length || 0}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Avg Score:</span>
                                        <span className="font-medium">{(results.strategy3.meta?.avgScore || 0).toFixed(2)}</span>
                                    </div>
                                </div>
                            </>
                        )}
                    </motion.div>
                </div>
            )}

            {/* Performance Chart */}
            {results && (
                <div className="bg-card p-6 rounded-lg shadow-lg">
                    <h4 className="text-lg font-semibold mb-4">Strategy Performance Comparison</h4>
                    <PerformanceChart 
                        data={results}
                        currentScore={results.strategy1.symbols?.[0]?.core || 0.5}
                        currentConfidence={results.strategy1.symbols?.[0]?.confidence || 0.85}
                        currentAction={results.strategy1.symbols?.[0]?.action || "HOLD"}
                    />
                </div>
            )}

            {/* Optimization Insights */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-card p-6 rounded-lg shadow">
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <Activity className="w-5 h-5 text-primary" />
                        Best Performing Strategy
                    </h4>
                    <p className="text-sm text-muted-foreground">
                        Analysis shows which strategy performed best based on current market conditions and historical data.
                    </p>
                </div>

                <div className="bg-card p-6 rounded-lg shadow">
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <Zap className="w-5 h-5 text-primary" />
                        Optimization Suggestions
                    </h4>
                    <p className="text-sm text-muted-foreground">
                        Recommendations for parameter adjustments and strategy improvements based on pipeline results.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default InsightsTab;
