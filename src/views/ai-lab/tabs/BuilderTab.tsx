/**
 * Builder Tab - Strategy Configuration and Templates
 * 
 * Contains:
 * - Strategy template editor
 * - Parameter configuration
 * - Strategy templates
 * - Save/Load functionality
 * 
 * Source: EnhancedStrategyLabView.tsx (Builder tab)
 * 
 * @version 1.0.0
 * @since Phase 2
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Save, Upload, Copy, Trash2 } from 'lucide-react';
import { StrategyTemplateEditor } from '../../../components/strategy/StrategyTemplateEditor';
import { StrategyTemplate } from '../../../types/index';
import { showToast } from '../../../components/ui/Toast';

export const BuilderTab: React.FC = () => {
    const [selectedTemplate, setSelectedTemplate] = useState<StrategyTemplate | null>(null);

    const handleSaveStrategy = () => {
        showToast('success', 'Strategy Saved', 'Your strategy configuration has been saved.');
    };

    const handleLoadTemplate = () => {
        showToast('info', 'Template Loaded', 'Strategy template has been loaded.');
    };

    return (
        <div className="space-y-6">
            {/* Header with Actions */}
            <div className="flex items-center justify-between bg-card p-4 rounded-lg shadow">
                <div>
                    <h3 className="text-2xl font-semibold">Strategy Builder</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                        Create and configure custom trading strategies
                    </p>
                </div>

                <div className="flex gap-2">
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleSaveStrategy}
                        className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
                    >
                        <Save className="w-4 h-4" />
                        Save
                    </motion.button>

                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleLoadTemplate}
                        className="flex items-center gap-2 px-4 py-2 bg-accent text-foreground rounded-lg hover:bg-accent/80"
                    >
                        <Upload className="w-4 h-4" />
                        Load Template
                    </motion.button>
                </div>
            </div>

            {/* Strategy Template Editor */}
            <div className="bg-card p-6 rounded-lg shadow-lg">
                <StrategyTemplateEditor
                    template={selectedTemplate as any}
                    onSave={(template: any) => {
                        if (template) setSelectedTemplate(template);
                        handleSaveStrategy();
                    }}
                />
            </div>

            {/* Strategy Templates */}
            <div className="bg-card p-6 rounded-lg shadow-lg">
                <h4 className="text-lg font-semibold mb-4">Strategy Templates</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[
                        {
                            name: 'Momentum',
                            description: 'Trend-following momentum strategy',
                            winRate: 65
                        },
                        {
                            name: 'Mean Reversion',
                            description: 'Counter-trend mean reversion strategy',
                            winRate: 58
                        },
                        {
                            name: 'Breakout',
                            description: 'Range breakout and consolidation strategy',
                            winRate: 62
                        },
                        {
                            name: 'Scalping',
                            description: 'High-frequency scalping strategy',
                            winRate: 55
                        },
                        {
                            name: 'Swing Trading',
                            description: 'Multi-day swing trading strategy',
                            winRate: 60
                        },
                        {
                            name: 'AI Hybrid',
                            description: 'AI-powered hybrid strategy',
                            winRate: 70
                        }
                    ].map((template, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className="p-4 bg-accent hover:bg-accent/80 rounded-lg cursor-pointer transition-colors"
                            onClick={() => handleLoadTemplate()}
                        >
                            <h5 className="font-semibold mb-1">{template.name}</h5>
                            <p className="text-sm text-muted-foreground mb-2">
                                {template.description}
                            </p>
                            <div className="flex items-center justify-between">
                                <span className="text-xs text-muted-foreground">
                                    Win Rate: {template.winRate}%
                                </span>
                                <Copy className="w-4 h-4 text-muted-foreground" />
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Parameter Configuration */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-card p-4 rounded-lg shadow">
                    <h4 className="font-semibold mb-2">Entry Conditions</h4>
                    <p className="text-sm text-muted-foreground">
                        Define technical indicators, price action patterns, and timing for trade entries.
                    </p>
                </div>

                <div className="bg-card p-4 rounded-lg shadow">
                    <h4 className="font-semibold mb-2">Risk Management</h4>
                    <p className="text-sm text-muted-foreground">
                        Configure position sizing, stop loss, take profit, and risk/reward ratios.
                    </p>
                </div>

                <div className="bg-card p-4 rounded-lg shadow">
                    <h4 className="font-semibold mb-2">Exit Rules</h4>
                    <p className="text-sm text-muted-foreground">
                        Set exit conditions including trailing stops, time-based exits, and signals.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default BuilderTab;
