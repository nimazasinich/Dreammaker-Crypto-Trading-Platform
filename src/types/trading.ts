/**
 * Trading Types - Comprehensive TypeScript Interfaces
 *
 * This file contains all trading-related type definitions to ensure
 * type safety across the application and eliminate `any` types.
 *
 * @version 1.0.0
 */

// ==================== Position Types ====================

export interface Position {
    id: string;
    symbol: string;
    side: 'LONG' | 'SHORT' | 'BUY' | 'SELL';
    size: number;
    entryPrice: number;
    markPrice: number;
    sl?: number;
    tp?: number[];
    leverage: number;
    pnl: number;
    pnlPercent: number;
}

export interface FuturesPosition extends Position {
    marginType?: 'ISOLATED' | 'CROSS';
    liquidationPrice?: number;
    unrealizedPnl?: number;
    realizedPnl?: number;
}

// ==================== Order Types ====================

export interface Order {
    id: string;
    symbol: string;
    side: 'BUY' | 'SELL';
    type: 'MARKET' | 'LIMIT' | 'STOP_LOSS' | 'TAKE_PROFIT' | 'STOP_LOSS_LIMIT' | 'TAKE_PROFIT_LIMIT';
    qty: number;
    price?: number;
    stopPrice?: number;
    status: 'NEW' | 'PENDING' | 'PARTIALLY_FILLED' | 'FILLED' | 'CANCELED' | 'REJECTED' | 'EXPIRED';
    timestamp: number;
    filledQty?: number;
    averageFillPrice?: number;
}

// ==================== Trade History Types ====================

export interface Trade {
    id: string;
    symbol: string;
    side: 'BUY' | 'SELL';
    qty: number;
    price: number;
    pnl?: number;
    pnlPercent?: number;
    timestamp: number;
    fee?: number;
    commission?: number;
}

// ==================== Balance Types ====================

export interface Balance {
    availableBalance: number;
    usedMargin: number;
    totalBalance: number;
    unrealizedPnl?: number;
    walletBalance?: number;
}

// ==================== Order Book Types ====================

export interface OrderBookEntry {
    price: number;
    quantity: number;
}

export interface OrderBook {
    symbol: string;
    bids: OrderBookEntry[];
    asks: OrderBookEntry[];
    timestamp: number;
}

// ==================== Entry Plan Types ====================

export interface EntryPlan {
    symbol: string;
    positionSize: number;
    riskAmount: number;
    entry: number;
    sl: number;
    tp: number[];
    riskRewardRatio: number;
    confidence?: number;
}

// ==================== Market Snapshot Types ====================

export interface MarketSnapshot {
    symbol: string;
    price: number;
    volume24h: number;
    change24h: number;
    changePercent24h: number;
    high24h: number;
    low24h: number;
    entryPlan?: EntryPlan;
    timestamp: number;
}

// ==================== Portfolio Types ====================

export interface PortfolioData {
    positions: Position[];
    balance: number;
    totalValue: number;
    totalPnl: number;
    totalPnlPercent: number;
    timestamp: number;
}

// ==================== Analysis Types ====================

export interface SMCAnalysis {
    trend: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
    orderBlocks: Array<{
        type: 'BULLISH' | 'BEARISH';
        price: number;
        timestamp: number;
        strength: number;
    }>;
    liquidityZones: Array<{
        type: 'SUPPORT' | 'RESISTANCE';
        price: number;
        strength: number;
    }>;
    fvg?: Array<{
        type: 'BULLISH' | 'BEARISH';
        upperPrice: number;
        lowerPrice: number;
    }>;
}

export interface ElliottWaveAnalysis {
    currentWave: {
        wave: number | string;
        type: 'IMPULSE' | 'CORRECTIVE';
    };
    nextWave?: number | string;
    completionProbability: number;
    nextExpectedDirection?: 'UP' | 'DOWN' | 'SIDEWAYS';
    confidence: number;
}

export interface HarmonicPattern {
    name: string;
    type: 'GARTLEY' | 'BAT' | 'BUTTERFLY' | 'CRAB' | 'SHARK' | 'CYPHER';
    completion: number;
    direction: 'BULLISH' | 'BEARISH';
    prz: {
        upper: number;
        lower: number;
    };
    confidence: number;
    points?: {
        X: number;
        A: number;
        B: number;
        C: number;
        D: number;
    };
}

export interface SentimentAnalysis {
    score: number; // -1 to 1
    sentiment: 'VERY_BEARISH' | 'BEARISH' | 'NEUTRAL' | 'BULLISH' | 'VERY_BULLISH';
    sources: {
        twitter?: number;
        reddit?: number;
        news?: number;
        social?: number;
    };
    timestamp: number;
}

export interface FibonacciLevel {
    level: number;
    price: number;
    label: string;
}

export interface FibonacciAnalysis {
    isValid: boolean;
    signal: 'BUY' | 'SELL' | 'NEUTRAL';
    confidence: number;
    levels: FibonacciLevel[];
    swingHigh: number;
    swingLow: number;
}

export interface ParabolicSARAnalysis {
    signal: 'BUY' | 'SELL' | 'NEUTRAL';
    confidence: number;
    score: number;
    currentValue: number;
    reasoning: string[];
}

export interface MarketRegimeAnalysis {
    regime: 'bull' | 'bear' | 'sideways';
    confidence: number;
    score: number;
    indicators?: {
        atrPercent: number;
        volumeTrend: number;
        priceAction: string;
    };
}

export interface AnalysisData {
    smc?: SMCAnalysis;
    elliott?: ElliottWaveAnalysis;
    harmonic?: HarmonicPattern;
    sentiment?: SentimentAnalysis;
    fibonacci?: FibonacciAnalysis;
    sar?: ParabolicSARAnalysis;
    regime?: MarketRegimeAnalysis;
}

// ==================== WebSocket Data Types ====================

export interface WebSocketPositionUpdate {
    positionsUpdate?: Position[];
    timestamp: number;
}

export interface WebSocketData {
    type: 'POSITION_UPDATE' | 'PRICE_UPDATE' | 'ORDER_UPDATE';
    data: WebSocketPositionUpdate | any;
}

// ==================== API Response Types ====================

export interface APIResponse<T = any> {
    success: boolean;
    data?: T;
    message?: string;
    error?: string;
    timestamp?: number;
}

export interface PositionsAPIResponse extends APIResponse {
    positions?: Position[];
}

export interface OrdersAPIResponse extends APIResponse {
    orders?: Order[];
}

export interface TradesAPIResponse extends APIResponse {
    trades?: Trade[];
}

export interface BalanceAPIResponse extends APIResponse {
    balance?: Balance;
}

// ==================== Component Prop Types ====================

export interface TradingTabProps {
    selectedSymbol: string;
    onSymbolChange: (symbol: string) => void;
    wsData?: WebSocketData;
}

// ==================== Export All ====================

export type {
    // Re-export for convenience
    OrderBookEntry as PriceLevel,
};
