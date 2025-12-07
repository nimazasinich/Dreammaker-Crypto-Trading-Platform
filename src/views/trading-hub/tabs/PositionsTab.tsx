/**
 * Positions Tab - Position and Order Management
 * 
 * Contains:
 * - Open positions table
 * - Pending orders
 * - Trade history
 * - Real-time updates via WebSocket
 * 
 * Source: PositionsView.tsx
 * 
 * @version 1.0.0
 * @since Phase 1
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Clock, History, X, Loader2 } from 'lucide-react';
import { Logger } from '../../../core/Logger';
import { showToast } from '../../../components/ui/Toast';
import { useConfirmModal } from '../../../components/ui/ConfirmModal';
import LoadingSpinner from '../../../components/ui/LoadingSpinner';
import { TiltCard } from '../../../components/ui/TiltCard';
import { AnimatedCounter } from '../../../components/ui/AnimatedCounter';
import type { Position, Order, Trade, TradingTabProps } from '../../../types/trading';

const logger = Logger.getInstance();

type SubTab = 'positions' | 'orders' | 'history';

export const PositionsTab: React.FC<TradingTabProps> = ({
    selectedSymbol,
    onSymbolChange,
    wsData
}) => {
    const { confirm, ModalComponent } = useConfirmModal();

    const [activeSubTab, setActiveSubTab] = useState<SubTab>('positions');
    const [positions, setPositions] = useState<Position[]>([]);
    const [orders, setOrders] = useState<Order[]>([]);
    const [history, setHistory] = useState<Trade[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Load data periodically
    useEffect(() => {
        loadData();
        const interval = setInterval(loadData, 5000);
        return () => clearInterval(interval);
    }, []);

    // Update from WebSocket
    useEffect(() => {
        if (wsData?.positionsUpdate) {
            setPositions(wsData.positionsUpdate);
        }
    }, [wsData]);

    const loadData = async () => {
        setLoading(true);
        setError(null);

        try {
            const [posRes, ordRes, histRes] = await Promise.all([
                fetch('/api/positions', { credentials: 'include' }),
                fetch('/api/orders?status=PENDING', { credentials: 'include' }),
                fetch('/api/trades/history?limit=50', { credentials: 'include' })
            ]);

            if (posRes.ok) {
                const posData = await posRes.json();
                if (posData.success) {
                    setPositions(posData.positions || []);
                }
            }

            if (ordRes.ok) {
                const ordData = await ordRes.json();
                if (ordData.success) {
                    setOrders(ordData.orders || []);
                }
            }

            if (histRes.ok) {
                const histData = await histRes.json();
                if (histData.success) {
                    setHistory(histData.trades || []);
                }
            }
        } catch (error) {
            logger.error('Failed to load data', {}, error as Error);
            setError('Failed to load positions and orders');
        } finally {
            setLoading(false);
        }
    };

    const handleClosePosition = async (positionId: string) => {
        const confirmed = await confirm(
            'Close Position',
            'Are you sure you want to close this position?',
            'warning'
        );

        if (!confirmed) return;

        setLoading(true);
        try {
            const response = await fetch('/api/positions/close', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ id: positionId })
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

    const handleCancelOrder = async (orderId: string) => {
        const confirmed = await confirm(
            'Cancel Order',
            'Are you sure you want to cancel this order?',
            'warning'
        );

        if (!confirmed) return;

        setLoading(true);
        try {
            const response = await fetch('/api/orders/cancel', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ id: orderId })
            });

            const data = await response.json();

            if (data.success) {
                showToast('success', 'Order Cancelled', 'Order cancelled successfully.');
                loadData();
            } else {
                showToast('error', 'Cancel Failed', data.message || 'Failed to cancel order.');
            }
        } catch (error) {
            logger.error('Failed to cancel order:', {}, error as Error);
            showToast('error', 'Cancel Failed', 'An error occurred.');
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (timestamp: number) => {
        return new Date(timestamp).toLocaleString();
    };

    return (
        <div className="space-y-6">
            {ModalComponent}

            {/* Sub-tab Navigation */}
            <div className="flex gap-2 border-b">
                {[
                    { id: 'positions', label: 'Positions', icon: TrendingUp },
                    { id: 'orders', label: 'Orders', icon: Clock },
                    { id: 'history', label: 'History', icon: History }
                ].map(tab => {
                    const Icon = tab.icon;
                    const isActive = activeSubTab === tab.id;

                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveSubTab(tab.id as SubTab)}
                            className={`
                flex items-center gap-2 px-4 py-3 font-medium transition-all
                border-b-2
                ${isActive
                                    ? 'border-primary text-primary'
                                    : 'border-transparent text-muted-foreground hover:text-foreground'
                                }
              `}
                        >
                            <Icon className="w-4 h-4" />
                            <span>{tab.label}</span>
                            {tab.id === 'positions' && positions.length > 0 && (
                                <span className="px-2 py-0.5 text-xs bg-primary text-primary-foreground rounded-full">
                                    {positions.length}
                                </span>
                            )}
                            {tab.id === 'orders' && orders.length > 0 && (
                                <span className="px-2 py-0.5 text-xs bg-primary text-primary-foreground rounded-full">
                                    {orders.length}
                                </span>
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Error Display */}
            {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                    <p className="text-red-500">{error}</p>
                </div>
            )}

            {/* Sub-tab Content */}
            {activeSubTab === 'positions' && (
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold">Open Positions ({positions.length})</h3>
                        {loading && <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />}
                    </div>

                    {positions.length > 0 ? (
                        <div className="space-y-2">
                            {positions.map((pos) => (
                                <motion.div
                                    key={pos.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="bg-card p-4 rounded-lg shadow border border-border hover:border-primary/50 transition-colors"
                                >
                                    <div className="flex items-center justify-between">
                                        {/* Left: Position Info */}
                                        <div className="flex items-center gap-4">
                                            {pos.side === 'LONG' ? (
                                                <div className="p-2 bg-green-500/20 rounded-lg">
                                                    <TrendingUp className="w-5 h-5 text-green-500" />
                                                </div>
                                            ) : (
                                                <div className="p-2 bg-red-500/20 rounded-lg">
                                                    <TrendingDown className="w-5 h-5 text-red-500" />
                                                </div>
                                            )}

                                            <div>
                                                <div className="font-semibold text-lg">{pos.symbol}</div>
                                                <div className="text-sm text-muted-foreground">
                                                    {pos.size} @ ${pos.entryPrice?.toFixed(2)} • {pos.leverage}x
                                                </div>
                                            </div>
                                        </div>

                                        {/* Middle: Price Info */}
                                        <div className="text-center">
                                            <div className="text-sm text-muted-foreground">Mark Price</div>
                                            <div className="font-medium">${pos.markPrice?.toFixed(2)}</div>
                                            {pos.sl && (
                                                <div className="text-xs text-red-500">SL: ${pos.sl.toFixed(2)}</div>
                                            )}
                                            {pos.tp && pos.tp.length > 0 && (
                                                <div className="text-xs text-green-500">TP: ${pos.tp[0].toFixed(2)}</div>
                                            )}
                                        </div>

                                        {/* Right: PnL and Actions */}
                                        <div className="text-right flex items-center gap-4">
                                            <div>
                                                <div className={`text-xl font-bold ${pos.pnl >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                                    {pos.pnl >= 0 ? '+' : ''}{pos.pnl?.toFixed(2)} USDT
                                                </div>
                                                <div className={`text-sm ${pos.pnlPercent >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                                    {pos.pnlPercent >= 0 ? '+' : ''}{pos.pnlPercent?.toFixed(2)}%
                                                </div>
                                            </div>

                                            <button
                                                onClick={() => handleClosePosition(pos.id)}
                                                disabled={loading}
                                                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 
                          transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                            >
                                                <X className="w-4 h-4" />
                                                Close
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-card p-12 rounded-lg text-center">
                            <TrendingUp className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                            <p className="text-muted-foreground">No open positions</p>
                        </div>
                    )}
                </div>
            )}

            {activeSubTab === 'orders' && (
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold">Pending Orders ({orders.length})</h3>
                        {loading && <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />}
                    </div>

                    {orders.length > 0 ? (
                        <div className="space-y-2">
                            {orders.map((order) => (
                                <motion.div
                                    key={order.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="bg-card p-4 rounded-lg shadow border border-border hover:border-primary/50 transition-colors"
                                >
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <div className="font-semibold">{order.symbol}</div>
                                            <div className="text-sm text-muted-foreground">
                                                {order.type} • {order.side} • {order.qty}
                                                {order.price && ` @ $${order.price.toFixed(2)}`}
                                            </div>
                                            <div className="text-xs text-muted-foreground mt-1">
                                                {formatDate(order.timestamp)}
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => handleCancelOrder(order.id)}
                                            disabled={loading}
                                            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 
                        transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                        >
                                            <X className="w-4 h-4" />
                                            Cancel
                                        </button>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-card p-12 rounded-lg text-center">
                            <Clock className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                            <p className="text-muted-foreground">No pending orders</p>
                        </div>
                    )}
                </div>
            )}

            {activeSubTab === 'history' && (
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold">Trade History ({history.length})</h3>
                        {loading && <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />}
                    </div>

                    {history.length > 0 ? (
                        <div className="bg-card rounded-lg shadow overflow-hidden">
                            <table className="w-full">
                                <thead className="bg-muted">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-sm font-medium">Date</th>
                                        <th className="px-4 py-3 text-left text-sm font-medium">Symbol</th>
                                        <th className="px-4 py-3 text-left text-sm font-medium">Side</th>
                                        <th className="px-4 py-3 text-left text-sm font-medium">Size</th>
                                        <th className="px-4 py-3 text-left text-sm font-medium">Price</th>
                                        <th className="px-4 py-3 text-right text-sm font-medium">PnL</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {history.map((trade, idx) => (
                                        <tr key={idx} className="border-t border-border hover:bg-accent/50 transition-colors">
                                            <td className="px-4 py-3 text-sm">{formatDate(trade.timestamp)}</td>
                                            <td className="px-4 py-3 text-sm font-medium">{trade.symbol}</td>
                                            <td className="px-4 py-3 text-sm">
                                                <span className={`
                          px-2 py-0.5 rounded-full text-xs font-medium
                          ${trade.side === 'BUY' ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}
                        `}>
                                                    {trade.side}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-sm">{trade.qty}</td>
                                            <td className="px-4 py-3 text-sm">${trade.price?.toFixed(2)}</td>
                                            <td className={`px-4 py-3 text-sm text-right font-medium ${trade.pnl >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                                {trade.pnl >= 0 ? '+' : ''}{trade.pnl?.toFixed(2)} USDT
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="bg-card p-12 rounded-lg text-center">
                            <History className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                            <p className="text-muted-foreground">No trade history</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default PositionsTab;
