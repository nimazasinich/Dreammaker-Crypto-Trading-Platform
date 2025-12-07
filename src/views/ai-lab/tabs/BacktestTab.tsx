/**
 * Backtest Tab - Historical Strategy Testing
 * 
 * Contains:
 * - Backtest configuration
 * - Strategy selection
 * - Performance charts
 * - Metrics analysis
 * 
 * Source: EnhancedStrategyLabView.tsx (Backtest tab)
 * 
 * @version 1.0.0
 * @since Phase 2
 */

import React from 'react';
import { BacktestPanel } from '../../../components/backtesting/BacktestPanel';
import { useBacktestContext } from '../../../contexts/BacktestContext';

export const BacktestTab: React.FC = () => {
    return (
        <div className="space-y-6">
            <div className="bg-card p-6 rounded-lg shadow-lg">
                <h3 className="text-2xl font-semibold mb-2">Strategy Backtesting</h3>
                <p className="text-muted-foreground mb-6">
                    Test strategies against historical data to evaluate performance and optimize parameters.
                </p>

                {/* Backtest Panel Component */}
                <BacktestPanel symbol="BTCUSDT" timeframe="1h" />
            </div>

            {/* Backtest Info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-card p-4 rounded-lg shadow">
                    <h4 className="font-semibold mb-2">Historical Data</h4>
                    <p className="text-sm text-muted-foreground">
                        Select date range, symbols, and timeframes for comprehensive historical testing.
                    </p>
                </div>

                <div className="bg-card p-4 rounded-lg shadow">
                    <h4 className="font-semibold mb-2">Performance Metrics</h4>
                    <p className="text-sm text-muted-foreground">
                        Analyze total return, Sharpe ratio, max drawdown, win rate, and more.
                    </p>
                </div>

                <div className="bg-card p-4 rounded-lg shadow">
                    <h4 className="font-semibold mb-2">Optimization</h4>
                    <p className="text-sm text-muted-foreground">
                        Fine-tune strategy parameters based on historical performance results.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default BacktestTab;
