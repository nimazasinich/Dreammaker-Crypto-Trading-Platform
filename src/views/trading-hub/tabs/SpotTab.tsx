/**
 * Spot Tab - Spot Trading with Scoring System
 * 
 * Contains:
 * - Scoring system and confluence analysis
 * - Multi-timeframe analysis
 * - Entry plan visualization
 * - Spot order form
 * - Strategy toggle
 * 
 * Source: EnhancedTradingView.tsx (Spot mode)
 * 
 * @version 1.0.0
 * @since Phase 1
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { ScoringSnapshot, ConfluenceInfo, EntryPlan, Direction, Action } from '../../../types/index';
import { showToast } from '../../../components/ui/Toast';
import { Logger } from '../../../core/Logger';
import LoadingSpinner from '../../../components/ui/LoadingSpinner';
import { GlowingButton } from '../../../components/ui/GlowingButton';
import { AnimatedCounter } from '../../../components/ui/AnimatedCounter';
import { TiltCard } from '../../../components/ui/TiltCard';
import Confetti from 'react-confetti';
import { useWindowSize } from 'react-use';

const logger = Logger.getInstance();

interface SpotTabProps {
    selectedSymbol: string;
    onSymbolChange: (symbol: string) => void;
    wsData?: any;
}

const SYMBOLS = ['BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'SOLUSDT', 'XRPUSDT', 'ADAUSDT', 'DOGEUSDT'];
const TIMEFRAMES = ['15m', '1h', '4h'];

export const SpotTab: React.FC<SpotTabProps> = ({
    selectedSymbol,
    onSymbolChange,
    wsData
}) => {
    const [strategyEnabled, setStrategyEnabled] = useState(false);
    const [symbol, setSymbol] = useState(selectedSymbol.replace('BINANCE:', ''));
    const [snapshot, setSnapshot] = useState<ScoringSnapshot | null>(null);
    const [loading, setLoading] = useState(false);
    const [positionSize, setPositionSize] = useState('100');
    const [orderType, setOrderType] = useState<'market' | 'limit'>('market');
    const [limitPrice, setLimitPrice] = useState('');
    const [showConfetti, setShowConfetti] = useState(false);
    const { width, height } = useWindowSize();

    // Fetch scoring snapshot
    useEffect(() => {
        fetchSnapshot();
        const interval = setInterval(fetchSnapshot, 30000); // Refresh every 30s
        return () => clearInterval(interval);
    }, [symbol]);

    // Update from WebSocket
    useEffect(() => {
        if (wsData?.scoringSnapshot && wsData.scoringSnapshot.symbol === symbol) {
            setSnapshot(wsData.scoringSnapshot);
        }
    }, [wsData, symbol]);

    const fetchSnapshot = async () => {
        try {
            const tfsParam = TIMEFRAMES.map(tf => `tfs=${tf}`).join('&');
            const response = await fetch(`/api/scoring/snapshot?symbol=${symbol}&${tfsParam}`, {
                mode: "cors",
                headers: { "Content-Type": "application/json" }
            });

            const data = await response.json();
            if (data.success && data.snapshot) {
                setSnapshot(data.snapshot);
            } else {
                // Set empty snapshot
                setSnapshot({
                    symbol,
                    timestamp: Date.now(),
                    results: [],
                    final_score: 0,
                    direction: 'NEUTRAL' as Direction,
                    action: 'HOLD' as Action,
                    rationale: '',
                    confluence: {} as ConfluenceInfo,
                    entryPlan: {} as EntryPlan
                });
            }
        } catch (error) {
            logger.error('Failed to fetch snapshot:', {}, error as Error);
            setSnapshot({
                symbol,
                timestamp: Date.now(),
                results: [],
                final_score: 0,
                direction: 'NEUTRAL' as Direction,
                action: 'HOLD' as Action,
                rationale: '',
                confluence: {} as ConfluenceInfo,
                entryPlan: {} as EntryPlan
            });
        }
    };

    const handlePlaceOrder = async () => {
        if (!snapshot || !strategyEnabled) {
            showToast('warning', 'Strategy Disabled', 'Enable strategy to execute trades.');
            return;
        }

        if (snapshot.action === 'HOLD') {
            showToast('info', 'Hold Signal', 'Current signal is HOLD. No order placed.');
            return;
        }

        setLoading(true);

        try {
            const backendPort = import.meta.env.VITE_BACKEND_PORT || '3001';
            const response = await fetch(`http://localhost:${backendPort}/api/orders`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    symbol: symbol,
                    side: snapshot.action,
                    type: orderType.toUpperCase(),
                    qty: parseFloat(positionSize),
                    price: orderType === 'limit' ? parseFloat(limitPrice) : undefined,
                    stopLoss: snapshot.entryPlan?.sl,
                    takeProfit: snapshot.entryPlan?.tp?.[0]
                })
            });

            const data = await response.json();

            if (data.success) {
                showToast('success', 'Order Placed', 'Spot order placed successfully.');
                setShowConfetti(true);
                setTimeout(() => setShowConfetti(false), 5000);
            } else {
                showToast('error', 'Order Failed', data.message || 'Failed to place order.');
            }
        } catch (error) {
            logger.error('Failed to place order:', {}, error as Error);
            showToast('error', 'Order Failed', 'An error occurred while placing order.');
        } finally {
            setLoading(false);
        }
    };

    const getDirectionIcon = () => {
        if (!snapshot) return <Minus className="w-6 h-6" />;

        switch (snapshot.direction) {
            case 'LONG':
                return <TrendingUp className="w-6 h-6 text-green-500" />;
            case 'SHORT':
                return <TrendingDown className="w-6 h-6 text-red-500" />;
            default:
                return <Minus className="w-6 h-6 text-gray-500" />;
        }
    };

    const getScoreColor = (score: number) => {
        if (score >= 7) return 'text-green-500';
        if (score >= 4) return 'text-yellow-500';
        return 'text-red-500';
    };

    return (
        <div className="space-y-6">
            {showConfetti && (
                <Confetti
                    width={width}
                    height={height}
                    recycle={false}
                    numberOfPieces={200}
                />
            )}
            {/* Symbol Selector and Strategy Toggle */}
            <div className="flex items-center justify-between gap-4 bg-card p-4 rounded-lg shadow">
                <div className="flex items-center gap-4">
                    <label className="text-sm font-medium text-muted-foreground">Symbol:</label>
                    <select
                        value={symbol}
                        onChange={(e) => {
                            setSymbol(e.target.value);
                            onSymbolChange(e.target.value);
                        }}
                        className="px-4 py-2 rounded-lg bg-background border border-border focus:ring-2 focus:ring-primary"
                    >
                        {SYMBOLS.map(s => (
                            <option key={s} value={s}>{s}</option>
                        ))}
                    </select>
                </div>

                <div className="flex items-center gap-2">
                    <label className="text-sm font-medium text-muted-foreground">Strategy Enabled:</label>
                    <button
                        onClick={() => setStrategyEnabled(!strategyEnabled)}
                        className={`
              relative w-12 h-6 rounded-full transition-colors duration-200
              ${strategyEnabled ? 'bg-green-500' : 'bg-gray-300'}
            `}
                    >
                        <div className={`
              absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform duration-200
              ${strategyEnabled ? 'transform translate-x-6' : ''}
            `} />
                    </button>
                </div>
            </div>

            {/* Scoring Display */}
            {snapshot && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="grid grid-cols-1 md:grid-cols-3 gap-4"
                >
                    {/* Score Card */}
                    <div className="bg-card p-6 rounded-lg shadow-lg">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-muted-foreground">Final Score</span>
                            {getDirectionIcon()}
                        </div>
                        <div className={`text-4xl font-bold ${getScoreColor(snapshot.final_score)}`}>
                            {snapshot.final_score.toFixed(1)}/10
                        </div>
                        <div className="mt-2 text-sm">
                            <span className={`
                px-2 py-1 rounded-full font-medium
                ${snapshot.action === 'LONG' ? 'bg-green-500/20 text-green-500' : ''}
                ${snapshot.action === 'SHORT' ? 'bg-red-500/20 text-red-500' : ''}
                ${snapshot.action === 'HOLD' ? 'bg-gray-500/20 text-gray-500' : ''}
              `}>
                                {snapshot.action}
                            </span>
                        </div>
                    </div>

                    {/* Entry Plan */}
                    <div className="bg-card p-6 rounded-lg shadow-lg">
                        <h3 className="text-sm font-medium text-muted-foreground mb-4">Entry Plan</h3>
                        {snapshot.entryPlan && snapshot.entryPlan.entry ? (
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Entry:</span>
                                    <span className="font-medium">${snapshot.entryPlan.entry.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Stop Loss:</span>
                                    <span className="font-medium text-red-500">${snapshot.entryPlan.sl?.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Take Profit:</span>
                                    <span className="font-medium text-green-500">${snapshot.entryPlan.tp?.[0]?.toFixed(2)}</span>
                                </div>
                                {snapshot.entryPlan.rrr && (
                                    <div className="flex justify-between pt-2 border-t">
                                        <span className="text-muted-foreground">Risk/Reward:</span>
                                        <span className="font-medium">1:{snapshot.entryPlan.rrr.toFixed(2)}</span>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <p className="text-sm text-muted-foreground">No entry plan available</p>
                        )}
                    </div>

                    {/* Confluence */}
                    <div className="bg-card p-6 rounded-lg shadow-lg">
                        <h3 className="text-sm font-medium text-muted-foreground mb-4">Confluence</h3>
                        {snapshot.confluence && Object.keys(snapshot.confluence).length > 0 ? (
                            <div className="space-y-2 text-sm">
                                {Object.entries(snapshot.confluence).map(([key, value]) => (
                                    <div key={key} className="flex items-center gap-2">
                                        {value ? (
                                            <CheckCircle2 className="w-4 h-4 text-green-500" />
                                        ) : (
                                            <AlertCircle className="w-4 h-4 text-red-500" />
                                        )}
                                        <span className="capitalize">{key.replace('_', ' ')}</span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-muted-foreground">No confluence data</p>
                        )}
                    </div>
                </motion.div>
            )}

            {/* Order Form */}
            <div className="bg-card p-6 rounded-lg shadow-lg">
                <h3 className="text-lg font-semibold mb-4">Place Spot Order</h3>

                <div className="space-y-4">
                    {/* Order Type */}
                    <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-2">Order Type</label>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setOrderType('market')}
                                className={`
                  flex-1 px-4 py-2 rounded-lg font-medium transition-colors
                  ${orderType === 'market' ? 'bg-primary text-primary-foreground' : 'bg-background hover:bg-accent'}
                `}
                            >
                                Market
                            </button>
                            <button
                                onClick={() => setOrderType('limit')}
                                className={`
                  flex-1 px-4 py-2 rounded-lg font-medium transition-colors
                  ${orderType === 'limit' ? 'bg-primary text-primary-foreground' : 'bg-background hover:bg-accent'}
                `}
                            >
                                Limit
                            </button>
                        </div>
                    </div>

                    {/* Position Size */}
                    <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-2">
                            Position Size (USDT)
                        </label>
                        <input
                            type="number"
                            value={positionSize}
                            onChange={(e) => setPositionSize(e.target.value)}
                            className="w-full px-4 py-2 rounded-lg bg-background border border-border focus:ring-2 focus:ring-primary"
                            placeholder="100"
                        />
                    </div>

                    {/* Limit Price (if limit order) */}
                    {orderType === 'limit' && (
                        <div>
                            <label className="block text-sm font-medium text-muted-foreground mb-2">
                                Limit Price (USDT)
                            </label>
                            <input
                                type="number"
                                value={limitPrice}
                                onChange={(e) => setLimitPrice(e.target.value)}
                                className="w-full px-4 py-2 rounded-lg bg-background border border-border focus:ring-2 focus:ring-primary"
                                placeholder="Enter price"
                            />
                        </div>
                    )}

                    {/* Submit Button */}
                    <GlowingButton
                        onClick={handlePlaceOrder}
                        disabled={loading || !strategyEnabled}
                        variant={snapshot?.action === 'LONG' ? 'success' : snapshot?.action === 'SHORT' ? 'danger' : 'primary'}
                        size="lg"
                        className="w-full"
                    >
                        {loading && <Loader2 className="w-5 h-5 animate-spin mr-2" />}
                        {loading ? 'Placing Order...' : 'Place Order'}
                    </GlowingButton>
                </div>
            </div>

            {/* Rationale */}
            {snapshot?.rationale && (
                <div className="bg-card p-6 rounded-lg shadow-lg">
                    <h3 className="text-lg font-semibold mb-2">Analysis Rationale</h3>
                    <p className="text-sm text-muted-foreground">{snapshot.rationale}</p>
                </div>
            )}
        </div>
    );
};

export default SpotTab;
