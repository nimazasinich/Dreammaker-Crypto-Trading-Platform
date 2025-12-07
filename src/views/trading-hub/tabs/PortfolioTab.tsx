/**
 * Portfolio Tab - Portfolio Overview and Risk Center
 * 
 * Contains:
 * - Portfolio value and PnL summary
 * - Holdings table
 * - Risk center integration
 * - Asset allocation chart
 * 
 * Source: PortfolioPage.tsx
 * 
 * @version 1.0.0
 * @since Phase 1
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Wallet, TrendingUp, TrendingDown, PieChart, Shield, Loader2, X } from 'lucide-react';
import { Logger } from '../../../core/Logger';
import { MarketData } from '../../../types';
import { API_BASE } from '../../../config/env';
import { REFRESH_BASE_MS } from '../../../config/risk';
import { RealPortfolioConnector } from '../../../components/connectors/RealPortfolioConnector';
import RiskCenterPro from '../../../components/portfolio/RiskCenterPro';
import { showToast } from '../../../components/ui/Toast';
import { useConfirmModal } from '../../../components/ui/ConfirmModal';
import DatasourceClient from '../../../services/DatasourceClient';
import type { Position, TradingTabProps, PortfolioData } from '../../../types/trading';

const logger = Logger.getInstance();

export const PortfolioTab: React.FC<TradingTabProps> = ({
    selectedSymbol,
    onSymbolChange,
    wsData
}) => {
    const { confirm, ModalComponent } = useConfirmModal();

    const [marketData, setMarketData] = useState<MarketData[]>([]);
    const [positions, setPositions] = useState<Position[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Calculate portfolio summary
    const portfolioValue = positions.reduce((sum, pos) => {
        return sum + (pos.markPrice * pos.size);
    }, 0);

    const totalPnL = positions.reduce((sum, pos) => sum + (pos.pnl || 0), 0);
    const totalPnLPercent = portfolioValue > 0 ? (totalPnL / portfolioValue) * 100 : 0;

    useEffect(() => {
        loadData();
        const interval = setInterval(loadData, REFRESH_BASE_MS);
        return () => clearInterval(interval);
    }, []);

    const loadData = async () => {
        setLoading(true);
        setError(null);

        try {
            const datasource = DatasourceClient;

            // Fetch market data and positions in parallel
            const [marketDataResult, positionsRes] = await Promise.allSettled([
                datasource.getTopCoins(20),
                fetch(`${API_BASE}/positions/open`, { credentials: 'include' })
                    .then((r) => r.ok ? r.json() : null)
            ]);

            // Handle market data
            if (marketDataResult.status === 'fulfilled' && marketDataResult.value) {
                const data = marketDataResult.value;
                if (Array.isArray(data) && data.length > 0) {
                    setMarketData(data as MarketData[]);
                }
            }

            // Handle positions
            if (positionsRes.status === 'fulfilled' && positionsRes.value) {
                const data = positionsRes.value;
                let posArray: Position[] = [];
                if (Array.isArray(data)) {
                    posArray = data;
                } else if (data.success && Array.isArray(data.positions)) {
                    posArray = data.positions;
                } else if (Array.isArray(data.positions)) {
                    posArray = data.positions;
                }
                setPositions(posArray);
            }
        } catch (error) {
            logger.error('Failed to load portfolio data:', {}, error as Error);
            setError('Failed to load portfolio data');
        } finally {
            setLoading(false);
        }
    };

    const handleClosePosition = async (id: string) => {
        const confirmed = await confirm(
            'Close Position',
            'Are you sure you want to close this position?',
            'warning'
        );

        if (!confirmed) return;

        setLoading(true);
        try {
            const response = await fetch(`${API_BASE}/positions/close`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ id })
            });

            const data = await response.json();

            if (data.success) {
                showToast('success', 'Position Closed', 'Position closed successfully.');
                loadData();
            } else {
                showToast('error', 'Close Failed', data.message || 'Failed to close position.');
            }
        } catch (error) {
            logger.error('Failed to close position:', {}, error as Error);
            showToast('error', 'Close Failed', 'An error occurred.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            {ModalComponent}

            {/* Portfolio Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Total Value */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gradient-to-br from-purple-500 to-indigo-600 p-6 rounded-lg shadow-lg text-white"
                >
                    <div className="flex items-center gap-2 mb-2">
                        <Wallet className="w-5 h-5" />
                        <span className="text-sm font-medium opacity-90">Total Value</span>
                    </div>
                    <div className="text-3xl font-bold">${portfolioValue.toFixed(2)}</div>
                    {loading && <Loader2 className="w-4 h-4 animate-spin mt-2" />}
                </motion.div>

                {/* Total PnL */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className={`p-6 rounded-lg shadow-lg ${totalPnL >= 0
                            ? 'bg-gradient-to-br from-green-500 to-emerald-600'
                            : 'bg-gradient-to-br from-red-500 to-rose-600'
                        } text-white`}
                >
                    <div className="flex items-center gap-2 mb-2">
                        {totalPnL >= 0 ? (
                            <TrendingUp className="w-5 h-5" />
                        ) : (
                            <TrendingDown className="w-5 h-5" />
                        )}
                        <span className="text-sm font-medium opacity-90">Total PnL</span>
                    </div>
                    <div className="text-3xl font-bold">
                        {totalPnL >= 0 ? '+' : ''}{totalPnL.toFixed(2)} USDT
                    </div>
                    <div className="text-sm opacity-90 mt-1">
                        {totalPnLPercent >= 0 ? '+' : ''}{totalPnLPercent.toFixed(2)}%
                    </div>
                </motion.div>

                {/* Active Positions */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-gradient-to-br from-cyan-500 to-blue-600 p-6 rounded-lg shadow-lg text-white"
                >
                    <div className="flex items-center gap-2 mb-2">
                        <PieChart className="w-5 h-5" />
                        <span className="text-sm font-medium opacity-90">Active Positions</span>
                    </div>
                    <div className="text-3xl font-bold">{positions.length}</div>
                    <div className="text-sm opacity-90 mt-1">Holdings</div>
                </motion.div>
            </div>

            {/* Holdings Table */}
            <div className="bg-card rounded-lg shadow-lg overflow-hidden">
                <div className="p-6 border-b border-border">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold">Holdings</h3>
                        {loading && <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />}
                    </div>
                </div>

                {positions.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-muted">
                                <tr>
                                    <th className="px-6 py-3 text-left text-sm font-medium">Asset</th>
                                    <th className="px-6 py-3 text-left text-sm font-medium">Size</th>
                                    <th className="px-6 py-3 text-left text-sm font-medium">Entry Price</th>
                                    <th className="px-6 py-3 text-left text-sm font-medium">Mark Price</th>
                                    <th className="px-6 py-3 text-left text-sm font-medium">Value</th>
                                    <th className="px-6 py-3 text-right text-sm font-medium">PnL</th>
                                    <th className="px-6 py-3 text-right text-sm font-medium">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {positions.map((pos, idx) => {
                                    const value = pos.markPrice * pos.size;

                                    return (
                                        <motion.tr
                                            key={pos.id}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: idx * 0.05 }}
                                            className="border-t border-border hover:bg-accent/50 transition-colors"
                                        >
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    {pos.side === 'LONG' || pos.side === 'BUY' ? (
                                                        <div className="p-1.5 bg-green-500/20 rounded">
                                                            <TrendingUp className="w-4 h-4 text-green-500" />
                                                        </div>
                                                    ) : (
                                                        <div className="p-1.5 bg-red-500/20 rounded">
                                                            <TrendingDown className="w-4 h-4 text-red-500" />
                                                        </div>
                                                    )}
                                                    <div>
                                                        <div className="font-medium">{pos.symbol}</div>
                                                        <div className="text-xs text-muted-foreground">
                                                            {pos.side} • {pos.leverage}x
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm">{pos.size.toFixed(4)}</td>
                                            <td className="px-6 py-4 text-sm">${pos.entryPrice?.toFixed(2)}</td>
                                            <td className="px-6 py-4 text-sm font-medium">${pos.markPrice?.toFixed(2)}</td>
                                            <td className="px-6 py-4 text-sm">${value.toFixed(2)}</td>
                                            <td className={`px-6 py-4 text-sm text-right font-medium ${pos.pnl >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                                <div>{pos.pnl >= 0 ? '+' : ''}{pos.pnl?.toFixed(2)} USDT</div>
                                                <div className="text-xs">
                                                    {pos.pnlPercent >= 0 ? '+' : ''}{pos.pnlPercent?.toFixed(2)}%
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button
                                                    onClick={() => handleClosePosition(pos.id)}
                                                    disabled={loading}
                                                    className="px-3 py-1.5 bg-red-500 text-white text-sm rounded hover:bg-red-600 
                            transition-colors disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-1.5"
                                                >
                                                    <X className="w-3.5 h-3.5" />
                                                    Close
                                                </button>
                                            </td>
                                        </motion.tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="p-12 text-center">
                        <Wallet className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                        <p className="text-muted-foreground">No holdings</p>
                        <p className="text-sm text-muted-foreground mt-2">
                            Open positions will appear here
                        </p>
                    </div>
                )}
            </div>

            {/* Risk Center Integration */}
            <div className="bg-card rounded-lg shadow-lg overflow-hidden">
                <div className="p-6 border-b border-border">
                    <div className="flex items-center gap-2">
                        <Shield className="w-5 h-5 text-primary" />
                        <h3 className="text-lg font-semibold">Risk Center</h3>
                    </div>
                </div>

                <div className="p-6">
                    <RealPortfolioConnector>
                        {(portfolioData: PortfolioData | null) => (
                            <RiskCenterPro
                                positions={portfolioData?.positions || []}
                                balance={portfolioData?.balance || 0}
                                marketData={marketData}
                            />
                        )}
                    </RealPortfolioConnector>
                </div>
            </div>

            {/* Error Display */}
            {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                    <p className="text-red-500">{error}</p>
                </div>
            )}
        </div>
    );
};

export default PortfolioTab;
