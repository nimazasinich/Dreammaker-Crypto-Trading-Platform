import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Shield, Activity, TrendingDown, Zap, AlertCircle, RefreshCw, AlertTriangle, Target, BarChart3 } from 'lucide-react';
import { RiskGauge } from '../components/risk/RiskGauge';
import { LiquidationBar } from '../components/risk/LiquidationBar';
import { StressTestCard } from '../components/risk/StressTestCard';
import { RiskAlertCard } from '../components/risk/RiskAlertCard';
import { Logger } from '../core/Logger';
import { API_BASE, USE_MOCK_DATA } from '../config/env';
import { TradingDashboard } from '../components/trading/TradingDashboard';
import { Portfolio } from '../components/portfolio/Portfolio';
import { RealPortfolioConnector } from '../components/connectors/RealPortfolioConnector';
import { useTheme } from '../components/Theme/ThemeProvider';
import DatasourceClient from '../services/DatasourceClient';
import { showToast } from '../components/ui/Toast';
import { useLiveData } from '../components/LiveDataContext';
import ErrorBoundary from '../components/ui/ErrorBoundary';
import ResponseHandler from '../components/ui/ResponseHandler';

const logger = Logger.getInstance();

// Type definitions for risk metrics
interface Position {
  symbol: string;
  liquidationPrice: number;
  currentPrice: number;
  side: 'long' | 'short';
  leverage: number;
  riskScore: number;
  liquidationDistance: string;
}

interface RiskAlert {
  symbol?: string;
  type: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

interface StressTest {
  scenario: string;
  impact: number;
}

interface SignalUpdate {
  type: string;
  metrics?: Record<string, any>;
}

// Tab type definition
type TabId = 'professional' | 'portfolio';

interface Tab {
  id: TabId;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}

const TABS: Tab[] = [
  { 
    id: 'professional', 
    label: 'Professional Metrics', 
    icon: Shield,
    description: 'Advanced risk analytics'
  },
  { 
    id: 'portfolio', 
    label: 'Portfolio Overview', 
    icon: Activity,
    description: 'Position sizing & optimization'
  }
];

interface ProfessionalRiskMetrics {
  totalLiquidationRisk: number;
  aggregateLeverage: number;
  marginUtilization: number;
  marketDepthRisk: number;
  volatilityRisk: number;
  fundingRateRisk: number;
  concentrationRisk: number;
  correlationRisk: number;
  portfolioVaR: number;
  maxDrawdown: number;
  sharpeRatio: number;
  positions: Position[];
  alerts: RiskAlert[];
  alertCounts: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  stressTests: StressTest[];
  totalValue: number;
  totalPositions: number;
  leveragedPositions: number;
  positionsAtRisk: number;
}

export const ProfessionalRiskView: React.FC = () => {
  // Tab navigation state - Check URL params for initial tab
  const [activeTab, setActiveTab] = useState<TabId>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const tab = params.get('tab');
      return (tab as TabId) || 'professional';
    }
    return 'professional';
  });

  // Update URL when tab changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.set('tab', activeTab);
      window.history.replaceState({}, '', url.toString());
    }
  }, [activeTab]);

  return (
    <div className="min-h-screen bg-surface p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="mb-6">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Risk Management Center
          </h1>
          <p className="text-muted">
            Advanced risk metrics and portfolio analysis
          </p>
        </header>

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {TABS.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center gap-2 px-6 py-3 rounded-lg font-semibold 
                  transition-all duration-200 whitespace-nowrap
                  ${activeTab === tab.id
                    ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg transform scale-105'
                    : 'bg-surface-muted text-foreground hover:bg-surface-hover hover:scale-102'
                  }
                `}
              >
                <Icon className="w-5 h-5" />
                <div className="text-left">
                  <div>{tab.label}</div>
                  <div className="text-xs opacity-75">{tab.description}</div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div className="animate-fade-in">
          {activeTab === 'professional' && <ProfessionalMetricsContent />}
          {activeTab === 'portfolio' && <PortfolioOverviewContent />}
        </div>
      </div>
    </div>
  );
};

// ==========================================
// Professional Metrics Content (Original ProfessionalRiskView)
// ==========================================
const ProfessionalMetricsContent: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [metrics, setMetrics] = useState<ProfessionalRiskMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<number>(Date.now());

  const fetchRiskMetrics = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${API_BASE}/api/professional-risk/metrics`, { mode: "cors", headers: { "Content-Type": "application/json" } });

      if (!response.ok) {
        logger.error('Failed to fetch risk metrics', { status: response.status, statusText: response.statusText });
        // Don't throw, just set empty metrics to show UI
        setMetrics({
          totalLiquidationRisk: 0,
          aggregateLeverage: 0,
          marginUtilization: 0,
          marketDepthRisk: 0,
          volatilityRisk: 0,
          fundingRateRisk: 0,
          concentrationRisk: 0,
          correlationRisk: 0,
          portfolioVaR: 0,
          maxDrawdown: 0,
          sharpeRatio: 0,
          positions: [],
          alerts: [],
          alertCounts: { critical: 0, high: 0, medium: 0, low: 0 },
          stressTests: [],
          totalValue: 0,
          totalPositions: 0,
          leveragedPositions: 0,
          positionsAtRisk: 0
        });
        setLastUpdate(Date.now());
        return;
      }

      const data = await response.json();

      if (!data.success) {
        logger.error('Failed to fetch risk metrics', { error: data.error });
        // Still set empty metrics to show UI
        setMetrics({
          totalLiquidationRisk: 0,
          aggregateLeverage: 0,
          marginUtilization: 0,
          marketDepthRisk: 0,
          volatilityRisk: 0,
          fundingRateRisk: 0,
          concentrationRisk: 0,
          correlationRisk: 0,
          portfolioVaR: 0,
          maxDrawdown: 0,
          sharpeRatio: 0,
          positions: [],
          alerts: [],
          alertCounts: { critical: 0, high: 0, medium: 0, low: 0 },
          stressTests: [],
          totalValue: 0,
          totalPositions: 0,
          leveragedPositions: 0,
          positionsAtRisk: 0
        });
        setLastUpdate(Date.now());
        return;
      }

      setMetrics(data.metrics || {
        totalLiquidationRisk: 0,
        aggregateLeverage: 0,
        marginUtilization: 0,
        marketDepthRisk: 0,
        volatilityRisk: 0,
        fundingRateRisk: 0,
        concentrationRisk: 0,
        correlationRisk: 0,
        portfolioVaR: 0,
        maxDrawdown: 0,
        sharpeRatio: 0,
        positions: [],
        alerts: [],
        alertCounts: { critical: 0, high: 0, medium: 0, low: 0 },
        stressTests: [],
        totalValue: 0,
        totalPositions: 0,
        leveragedPositions: 0,
        positionsAtRisk: 0
      });
      setLastUpdate(Date.now());
      logger.info('Risk metrics updated successfully');
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error(String(err));
      logger.error('Failed to fetch risk metrics', {}, error);
      // Set empty metrics instead of error to show UI
      setMetrics({
        totalLiquidationRisk: 0,
        aggregateLeverage: 0,
        marginUtilization: 0,
        marketDepthRisk: 0,
        volatilityRisk: 0,
        fundingRateRisk: 0,
        concentrationRisk: 0,
        correlationRisk: 0,
        portfolioVaR: 0,
        maxDrawdown: 0,
        sharpeRatio: 0,
        positions: [],
        alerts: [],
        alertCounts: { critical: 0, high: 0, medium: 0, low: 0 },
        stressTests: [],
        totalValue: 0,
        totalPositions: 0,
        leveragedPositions: 0,
        positionsAtRisk: 0
      });
      setLastUpdate(Date.now());
      setError(null); // Clear error to show UI with empty data
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRiskMetrics();

    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchRiskMetrics, 30000);

    return () => clearInterval(interval);
  }, []);

  if (loading && !metrics) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-xl text-gray-300">Loading risk analysis...</p>
        </div>
      </div>
    );
  }

  if (error || !metrics) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
        <div className="text-center max-w-md">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Error Loading Risk Data</h2>
          <p className="text-gray-400 mb-6">{error || 'No portfolio data available'}</p>
          <button
            onClick={fetchRiskMetrics}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Calculate overall risk score (0-100)
  const overallRiskScore = Math.round(
    (metrics.totalLiquidationRisk * 0.3 +
      (metrics.aggregateLeverage / 10) * 100 * 0.2 +
      metrics.marginUtilization * 0.15 +
      metrics.concentrationRisk * 0.15 +
      metrics.volatilityRisk * 0.1 +
      metrics.marketDepthRisk * 0.1) /
      1
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black p-4 md:p-8">
      <style>{`
        @keyframes glow-pulse {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }
        .animate-glow-pulse {
          animation: glow-pulse 2s ease-in-out infinite;
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold mb-2 bg-gradient-to-r from-red-400 via-orange-400 to-yellow-400 bg-clip-text text-transparent">
              Professional Risk Management
            </h1>
            <p className="text-gray-400 text-lg">
              Real-time crypto risk analysis with liquidation monitoring
            </p>
          </div>

          <button
            onClick={fetchRiskMetrics}
            disabled={loading}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded-lg transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>

        {/* Last update */}
        <p className="text-sm text-gray-500">
          Last updated: {new Date(lastUpdate).toLocaleTimeString()}
        </p>
      </div>

      {/* Critical Alerts Banner */}
      {metrics.alertCounts.critical > 0 && (
        <div className="mb-6 p-4 bg-gradient-to-r from-red-950/80 to-red-900/60 border border-red-500 rounded-xl animate-pulse">
          <div className="flex items-center space-x-3">
            <AlertCircle className="w-6 h-6 text-red-500" />
            <div>
              <p className="text-lg font-bold text-red-400">
                {metrics.alertCounts.critical} CRITICAL ALERT{metrics.alertCounts.critical > 1 ? 'S' : ''}
              </p>
              <p className="text-sm text-red-300">Immediate action required - liquidation risk detected</p>
            </div>
          </div>
        </div>
      )}

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* Portfolio Value */}
        <div className="p-5 rounded-xl bg-gradient-to-br from-blue-950/60 to-blue-900/40 border border-blue-500/50">
          <p className="text-sm text-gray-400 mb-1">Portfolio Value</p>
          <p className="text-3xl font-bold text-white">
            ${metrics.totalValue.toLocaleString()}
          </p>
          <p className="text-xs text-blue-400 mt-2">
            {metrics.totalPositions} positions • {metrics.leveragedPositions} leveraged
          </p>
        </div>

        {/* Risk Score */}
        <div className="p-5 rounded-xl bg-gradient-to-br from-red-950/60 to-red-900/40 border border-red-500/50">
          <p className="text-sm text-gray-400 mb-1">Overall Risk Score</p>
          <p className={`text-3xl font-bold ${
            overallRiskScore > 70 ? 'text-red-400' :
            overallRiskScore > 40 ? 'text-yellow-400' : 'text-green-400'
          }`}>
            {overallRiskScore}/100
          </p>
          <p className="text-xs text-gray-400 mt-2">
            {metrics.positionsAtRisk} positions at risk
          </p>
        </div>

        {/* Leverage */}
        <div className="p-5 rounded-xl bg-gradient-to-br from-orange-950/60 to-orange-900/40 border border-orange-500/50">
          <p className="text-sm text-gray-400 mb-1">Aggregate Leverage</p>
          <p className="text-3xl font-bold text-orange-400">
            {metrics.aggregateLeverage.toFixed(1)}x
          </p>
          <p className="text-xs text-gray-400 mt-2">
            Margin: {metrics.marginUtilization.toFixed(1)}%
          </p>
        </div>

        {/* VaR */}
        <div className="p-5 rounded-xl bg-gradient-to-br from-purple-950/60 to-purple-900/40 border border-purple-500/50">
          <p className="text-sm text-gray-400 mb-1">Value at Risk (95%)</p>
          <p className="text-3xl font-bold text-purple-400">
            ${metrics.portfolioVaR.toLocaleString()}
          </p>
          <p className="text-xs text-gray-400 mt-2">
            Max DD: {metrics.maxDrawdown.toFixed(1)}%
          </p>
        </div>
      </div>

      {/* Risk Gauges */}
      <div className="mb-8 p-6 rounded-2xl bg-gradient-to-br from-gray-900/80 to-gray-800/60 border border-gray-700">
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
          <Activity className="w-6 h-6 mr-2 text-blue-500" />
          Risk Metrics Dashboard
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          <RiskGauge value={metrics.totalLiquidationRisk} label="Liquidation Risk" />
          <RiskGauge value={metrics.concentrationRisk} label="Concentration" />
          <RiskGauge value={metrics.volatilityRisk} label="Volatility" />
          <RiskGauge value={metrics.marketDepthRisk} label="Market Depth" />
          <RiskGauge value={metrics.correlationRisk} label="Correlation" />
          <RiskGauge value={Math.min(100, metrics.aggregateLeverage * 10)} label="Leverage Impact" />
        </div>
      </div>

      {/* Liquidation Monitor */}
      {(metrics.positions?.length || 0) > 0 && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
            <TrendingDown className="w-6 h-6 mr-2 text-red-500" />
            Liquidation Monitor
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {metrics.positions
              .filter((p: Position) => p.liquidationPrice)
              .sort((a: Position, b: Position) => b.riskScore - a.riskScore)
              .slice(0, 6)
              .map((pos: Position, idx: number) => (
                <LiquidationBar
                  key={idx}
                  symbol={pos.symbol}
                  currentPrice={pos.currentPrice}
                  liquidationPrice={pos.liquidationPrice}
                  side={pos.side}
                  leverage={pos.leverage}
                  distancePercent={parseFloat(pos.liquidationDistance)}
                />
              ))}
          </div>
        </div>
      )}

      {/* Risk Alerts */}
      {(metrics.alerts?.length || 0) > 0 && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
            <Shield className="w-6 h-6 mr-2 text-yellow-500" />
            Active Risk Alerts
            <span className="ml-3 px-3 py-1 bg-red-500/20 text-red-400 text-sm rounded-full">
              {metrics.alerts.length}
            </span>
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {metrics.alerts.slice(0, 6).map((alert: RiskAlert, idx: number) => (
              <RiskAlertCard key={idx} {...alert} />
            ))}
          </div>
        </div>
      )}

      {/* Stress Tests */}
      <div>
        <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
          <Zap className="w-6 h-6 mr-2 text-purple-500" />
          Real Crypto Market Scenarios
          <span className="ml-3 text-sm text-gray-400 font-normal">
            Based on historical events
          </span>
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          {(metrics.stressTests || []).map((test: StressTest, idx: number) => (
            <StressTestCard key={idx} {...test} />
          ))}
        </div>
      </div>

      {/* Footer Info */}
      <div className="mt-8 p-4 bg-gray-900/50 border border-gray-700 rounded-xl text-center text-sm text-gray-400">
        <p>
          💡 <strong>Pro Tip:</strong> Keep liquidation distance above 30% and limit leverage to 5x or less for safer trading
        </p>
      </div>
    </div>
  );
};

// ==========================================
// Portfolio Overview Content (Original RiskView)
// ==========================================
const PortfolioOverviewContent: React.FC = () => {
  const { theme } = useTheme();
  const { subscribeToSignals } = useLiveData();
  
  interface RiskMetrics {
    valueAtRisk: number;
    maxDrawdown: number;
    sharpeRatio: number;
    alerts: Array<{
      type: string;
      title: string;
      description: string;
      severity: string;
    }>;
    stressTests: Array<{
      scenario: string;
      impact: number;
    }>;
  }
  
  const [riskMetrics, setRiskMetrics] = useState<RiskMetrics>({
    valueAtRisk: -2450,
    maxDrawdown: -12.3,
    sharpeRatio: 1.45,
    alerts: [
      {
        type: 'warning',
        title: 'High Correlation',
        description: 'BTC and ETH correlation at 0.89',
        severity: 'medium'
      },
      {
        type: 'danger',
        title: 'Position Size',
        description: 'BTC position exceeds 25% limit',
        severity: 'high'
      }
    ],
    stressTests: [
      { scenario: '2008 Crisis Scenario', impact: -34.2 },
      { scenario: 'COVID-19 Crash', impact: -28.7 },
      { scenario: 'Flash Crash', impact: -15.3 }
    ]
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  // Fetch risk metrics data
  useEffect(() => {
    const fetchRiskData = async () => {
      try {
        setLoading(true);
        // Note: Risk metrics endpoint not yet implemented in DatasourceClient
        // Keeping existing mock data for now
        setError(null);
        showToast('info', 'Risk Metrics', 'Using default risk metrics');
      } catch (err) {
        logger.error('Error fetching risk data:', {}, err);
        setError(err instanceof Error ? err : new Error('Failed to load risk metrics'));
        showToast('error', 'Load Failed', 'Failed to load risk metrics');
      } finally {
        setLoading(false);
      }
    };

    fetchRiskData();

    // Set up interval for refreshing data
    const intervalId = setInterval(fetchRiskData, 60000); // Refresh every minute

    // Subscribe to real-time risk updates
    const unsubscribe = subscribeToSignals(['BTCUSDT'], (data: SignalUpdate) => {
      if (data && data.type === 'risk-update') {
        setRiskMetrics(prevMetrics => ({
          ...prevMetrics,
          ...data.metrics
        }));
      }
    });

    // Cleanup
    return () => {
      clearInterval(intervalId);
      unsubscribe();
    };
  }, [subscribeToSignals]);

  return (
    <ErrorBoundary>
      <ResponseHandler isLoading={loading} error={error} data={riskMetrics}>
        {(data) => (
          <div className="w-full animate-fade-in">
          <style>{`
            @keyframes glow-pulse {
              0%, 100% { opacity: 0.5; }
              50% { opacity: 1; }
            }
            .animate-glow-pulse {
              animation: glow-pulse 2s ease-in-out infinite;
            }
          `}</style>

          {/* Mock Data Warning Banner */}
          {USE_MOCK_DATA && (
            <div 
              className="mb-6 p-4 rounded-xl border border-amber-500 bg-amber-50"
              role="alert"
              data-testid="mock-data-banner"
            >
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
                <div>
                  <h3 className="font-bold text-amber-900">Using Mock Risk Data</h3>
                  <p className="text-sm text-amber-800">
                    Displaying simulated risk metrics. Connect real portfolio data to see actual risk calculations.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* VaR Card */}
            <div
              className="rounded-2xl p-6 backdrop-blur-sm transform hover:scale-105 transition-all duration-300"
              style={{
                background: 'linear-gradient(135deg, rgba(15, 15, 24, 0.95) 0%, rgba(20, 20, 30, 0.95) 100%)',
                border: '1px solid rgba(139, 92, 246, 0.3)',
                boxShadow: '0 12px 40px rgba(0, 0, 0, 0.4)'
              }}
            >
              <div className="flex items-center justify-between mb-4">
                <Target className="w-8 h-8 text-purple-400" />
                <div className="w-3 h-3 rounded-full bg-green-400 animate-pulse" />
              </div>
              <h3 className="text-slate-400 text-sm font-semibold mb-2">Value at Risk (VaR)</h3>
              <p className="text-3xl font-bold text-white mb-2">
                ${Math.abs(data.valueAtRisk).toLocaleString()}
              </p>
              <p className="text-xs text-slate-500">95% confidence, 1-day horizon</p>
            </div>

            {/* Max Drawdown Card */}
            <div
              className="rounded-2xl p-6 backdrop-blur-sm transform hover:scale-105 transition-all duration-300"
              style={{
                background: 'linear-gradient(135deg, rgba(15, 15, 24, 0.95) 0%, rgba(20, 20, 30, 0.95) 100%)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                boxShadow: '0 12px 40px rgba(0, 0, 0, 0.4)'
              }}
            >
              <div className="flex items-center justify-between mb-4">
                <TrendingDown className="w-8 h-8 text-red-400" />
                <div className="w-3 h-3 rounded-full bg-red-400 animate-pulse" />
              </div>
              <h3 className="text-slate-400 text-sm font-semibold mb-2">Max Drawdown</h3>
              <p className="text-3xl font-bold text-white mb-2">
                {data.maxDrawdown}%
              </p>
              <p className="text-xs text-slate-500">Historical peak-to-trough</p>
            </div>

            {/* Sharpe Ratio Card */}
            <div
              className="rounded-2xl p-6 backdrop-blur-sm transform hover:scale-105 transition-all duration-300"
              style={{
                background: 'linear-gradient(135deg, rgba(15, 15, 24, 0.95) 0%, rgba(20, 20, 30, 0.95) 100%)',
                border: '1px solid rgba(34, 197, 94, 0.3)',
                boxShadow: '0 12px 40px rgba(0, 0, 0, 0.4)'
              }}
            >
              <div className="flex items-center justify-between mb-4">
                <BarChart3 className="w-8 h-8 text-green-400" />
                <div className="w-3 h-3 rounded-full bg-green-400 animate-pulse" />
              </div>
              <h3 className="text-slate-400 text-sm font-semibold mb-2">Sharpe Ratio</h3>
              <p className="text-3xl font-bold text-white mb-2">
                {data.sharpeRatio.toFixed(2)}
              </p>
              <p className="text-xs text-slate-500">Risk-adjusted returns</p>
            </div>
          </div>

          {/* Portfolio & Risk Alerts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Portfolio Component */}
            <div
              className="rounded-2xl overflow-hidden backdrop-blur-sm"
              style={{
                background: 'linear-gradient(135deg, rgba(15, 15, 24, 0.95) 0%, rgba(20, 20, 30, 0.95) 100%)',
                border: '1px solid rgba(139, 92, 246, 0.2)',
                boxShadow: '0 12px 40px rgba(0, 0, 0, 0.4)'
              }}
            >
              <Portfolio marketData={[]} />
            </div>

            {/* Risk Alerts */}
            <div
              className="rounded-2xl p-6 backdrop-blur-sm"
              style={{
                background: 'linear-gradient(135deg, rgba(15, 15, 24, 0.95) 0%, rgba(20, 20, 30, 0.95) 100%)',
                border: '1px solid rgba(239, 68, 68, 0.2)',
                boxShadow: '0 12px 40px rgba(0, 0, 0, 0.4)'
              }}
            >
              <h3 className="text-white text-xl font-bold mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5 text-red-400" />
                Active Risk Alerts
              </h3>
              <div className="space-y-3">
                {data.alerts.map((alert, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-xl border transition-all duration-300 ${
                      alert.severity === 'high'
                        ? 'bg-red-500/10 border-red-500/30 hover:border-red-500/50'
                        : 'bg-yellow-500/10 border-yellow-500/30 hover:border-yellow-500/50'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <AlertCircle
                        className={`w-5 h-5 mt-0.5 ${
                          alert.severity === 'high' ? 'text-red-400' : 'text-yellow-400'
                        }`}
                      />
                      <div className="flex-1">
                        <h4 className="font-semibold text-white mb-1">{alert.title}</h4>
                        <p className="text-sm text-slate-400">{alert.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Stress Test Results */}
          <div
            className="rounded-2xl p-6 backdrop-blur-sm"
            style={{
              background: 'linear-gradient(135deg, rgba(15, 15, 24, 0.95) 0%, rgba(20, 20, 30, 0.95) 100%)',
              border: '1px solid rgba(139, 92, 246, 0.2)',
              boxShadow: '0 12px 40px rgba(0, 0, 0, 0.4)'
            }}
          >
            <h3 className="text-white text-xl font-bold mb-6">Stress Test Scenarios</h3>
            <div className="space-y-4">
              {data.stressTests.map((test, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-300 font-medium">{test.scenario}</span>
                    <span className={`font-bold ${test.impact < -25 ? 'text-red-400' : test.impact < -15 ? 'text-orange-400' : 'text-yellow-400'}`}>
                      {test.impact}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-800/50 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ${test.impact < -25 ? 'bg-gradient-to-r from-red-600 to-red-500' : test.impact < -15 ? 'bg-gradient-to-r from-orange-600 to-orange-500' : 'bg-gradient-to-r from-yellow-600 to-yellow-500'}`}
                      style={{ width: `${Math.abs(test.impact)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Real Portfolio Connector */}
          <div className="mt-8">
            <RealPortfolioConnector />
          </div>
        </div>
        )}
      </ResponseHandler>
    </ErrorBoundary>
  );
};

export default ProfessionalRiskView;
