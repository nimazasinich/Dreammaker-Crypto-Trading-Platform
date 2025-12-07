import React, { useState, useCallback } from 'react';
import { ExtremePoint, StrategyContribution } from '../../services/ExtremePointsDetector';
import { useSignals } from '../../contexts/SignalContext';

interface SignalPanelProps {
  className?: string;
  onSignalClick?: (signal: ExtremePoint) => void;
}

const SignalPanel: React.FC<SignalPanelProps> = ({ className = '', onSignalClick }) => {
  const { signals, isRunning, status, start, stop } = useSignals();
  const [isExpanded, setIsExpanded] = useState(true);
  const [filter, setFilter] = useState<'ALL' | 'BUY' | 'SELL'>('ALL');

  const toggleAgent = useCallback(() => {
    if (isRunning) {
      stop();
    } else {
      start();
    }
  }, [isRunning, start, stop]);

  const agentStatus = status ? {
    isRunning,
    lastCheck: status.lastCheck,
    checksPerformed: status.checksPerformed,
    signalsGenerated: status.signalsGenerated,
    activeSignals: signals.length,
    currentSymbol: status.currentSymbol,
  } : null;

  const filteredSignals = signals.filter(s => {
    if (filter === 'ALL') return true;
    return s.signalType === filter;
  });

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' });
  };

  const formatPrice = (price: number) => {
    if (price >= 1000) return price.toLocaleString('en-US', { maximumFractionDigits: 2 });
    if (price >= 1) return price.toFixed(4);
    return price.toFixed(8);
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'text-green-400';
    if (confidence >= 60) return 'text-yellow-400';
    return 'text-orange-400';
  };

  const getSignalBgColor = (type: 'BUY' | 'SELL') => {
    return type === 'BUY' 
      ? 'bg-green-900/30 border-green-700/50 hover:bg-green-900/50'
      : 'bg-red-900/30 border-red-700/50 hover:bg-red-900/50';
  };

  return (
    <div className={`bg-gray-900 rounded-lg border border-gray-700 ${className}`}>
      {/* Header */}
      <div 
        className="flex items-center justify-between p-3 border-b border-gray-700 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          <span className="text-lg">📡</span>
          <h3 className="text-white font-semibold">سیگنال‌های هوشمند</h3>
          {agentStatus?.isRunning && (
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400">
            {filteredSignals.length} سیگنال فعال
          </span>
          <span className="text-gray-400">{isExpanded ? '▼' : '▶'}</span>
        </div>
      </div>

      {isExpanded && (
        <>
          {/* Agent Controls */}
          <div className="p-3 border-b border-gray-700 bg-gray-800/50">
            <div className="flex items-center justify-between mb-2">
              <button
                onClick={(e) => { e.stopPropagation(); toggleAgent(); }}
                className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                  agentStatus?.isRunning
                    ? 'bg-red-600 hover:bg-red-700 text-white'
                    : 'bg-green-600 hover:bg-green-700 text-white'
                }`}
              >
                {agentStatus?.isRunning ? '⏹ توقف' : '▶ شروع'}
              </button>
              
              {/* Filter Buttons */}
              <div className="flex gap-1">
                {(['ALL', 'BUY', 'SELL'] as const).map(f => (
                  <button
                    key={f}
                    onClick={(e) => { e.stopPropagation(); setFilter(f); }}
                    className={`px-2 py-1 text-xs rounded transition-colors ${
                      filter === f
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    {f === 'ALL' ? 'همه' : f === 'BUY' ? 'خرید' : 'فروش'}
                  </button>
                ))}
              </div>
            </div>

            {/* Status Info */}
            {agentStatus && (
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="text-center p-1 bg-gray-700/50 rounded">
                  <div className="text-gray-400">بررسی‌ها</div>
                  <div className="text-white font-medium">{agentStatus.checksPerformed}</div>
                </div>
                <div className="text-center p-1 bg-gray-700/50 rounded">
                  <div className="text-gray-400">سیگنال‌ها</div>
                  <div className="text-white font-medium">{agentStatus.signalsGenerated}</div>
                </div>
                <div className="text-center p-1 bg-gray-700/50 rounded">
                  <div className="text-gray-400">در حال بررسی</div>
                  <div className="text-white font-medium">{agentStatus.currentSymbol || '-'}</div>
                </div>
              </div>
            )}
          </div>

          {/* Signals List */}
          <div className="max-h-96 overflow-y-auto">
            {filteredSignals.length === 0 ? (
              <div className="p-6 text-center text-gray-400">
                <span className="text-3xl mb-2 block">📊</span>
                <p>هنوز سیگنالی تولید نشده</p>
                <p className="text-xs mt-1">
                  {agentStatus?.isRunning 
                    ? 'در حال تحلیل بازار...' 
                    : 'برای شروع، دکمه "شروع" را بزنید'}
                </p>
              </div>
            ) : (
              filteredSignals.map(signal => (
                <SignalCard
                  key={signal.id}
                  signal={signal}
                  onClick={() => onSignalClick?.(signal)}
                  formatTime={formatTime}
                  formatPrice={formatPrice}
                  getConfidenceColor={getConfidenceColor}
                  getSignalBgColor={getSignalBgColor}
                />
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
};


// Signal Card Component
interface SignalCardProps {
  signal: ExtremePoint;
  onClick: () => void;
  formatTime: (ts: number) => string;
  formatPrice: (price: number) => string;
  getConfidenceColor: (conf: number) => string;
  getSignalBgColor: (type: 'BUY' | 'SELL') => string;
}

const SignalCard: React.FC<SignalCardProps> = ({
  signal,
  onClick,
  formatTime,
  formatPrice,
  getConfidenceColor,
  getSignalBgColor
}) => {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div
      className={`p-3 border-b border-gray-700/50 cursor-pointer transition-colors ${getSignalBgColor(signal.signalType)}`}
      onClick={onClick}
    >
      {/* Main Info */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className={`text-lg ${signal.signalType === 'BUY' ? 'text-green-400' : 'text-red-400'}`}>
            {signal.signalType === 'BUY' ? '📈' : '📉'}
          </span>
          <div>
            <span className="text-white font-bold">{signal.symbol}</span>
            <span className={`ml-2 px-2 py-0.5 rounded text-xs font-medium ${
              signal.signalType === 'BUY' 
                ? 'bg-green-600 text-white' 
                : 'bg-red-600 text-white'
            }`}>
              {signal.signalType === 'BUY' ? 'خرید' : 'فروش'}
            </span>
          </div>
        </div>
        <div className="text-right">
          <div className={`font-bold ${getConfidenceColor(signal.confidence)}`}>
            {signal.confidence}%
          </div>
          <div className="text-xs text-gray-400">{formatTime(signal.timestamp)}</div>
        </div>
      </div>

      {/* Price Info */}
      <div className="grid grid-cols-3 gap-2 text-xs mb-2">
        <div>
          <span className="text-gray-400">قیمت: </span>
          <span className="text-white">${formatPrice(signal.price)}</span>
        </div>
        {signal.targetPrice && (
          <div>
            <span className="text-gray-400">هدف: </span>
            <span className="text-green-400">${formatPrice(signal.targetPrice)}</span>
          </div>
        )}
        {signal.stopLoss && (
          <div>
            <span className="text-gray-400">حد ضرر: </span>
            <span className="text-red-400">${formatPrice(signal.stopLoss)}</span>
          </div>
        )}
      </div>

      {/* Risk/Reward */}
      {signal.riskReward && (
        <div className="flex items-center gap-2 text-xs mb-2">
          <span className="text-gray-400">ریسک/ریوارد:</span>
          <span className={`font-medium ${signal.riskReward >= 2 ? 'text-green-400' : 'text-yellow-400'}`}>
            1:{signal.riskReward.toFixed(1)}
          </span>
          <span className="text-gray-500">|</span>
          <span className="text-gray-400">حجم 24h:</span>
          <span className="text-white">${(signal.volume24h / 1_000_000).toFixed(1)}M</span>
        </div>
      )}

      {/* Expand/Collapse Details */}
      <button
        onClick={(e) => { e.stopPropagation(); setShowDetails(!showDetails); }}
        className="text-xs text-blue-400 hover:text-blue-300"
      >
        {showDetails ? '▲ بستن جزئیات' : '▼ نمایش جزئیات'}
      </button>

      {/* Strategy Details */}
      {showDetails && (
        <div className="mt-2 pt-2 border-t border-gray-700/50">
          <div className="text-xs text-gray-400 mb-1">استراتژی‌های تأیید کننده:</div>
          <div className="space-y-1">
            {signal.strategies.map((strategy, idx) => (
              <StrategyBadge key={idx} strategy={strategy} />
            ))}
          </div>
          
          {signal.reasoning.length > 0 && (
            <div className="mt-2">
              <div className="text-xs text-gray-400 mb-1">دلایل:</div>
              <ul className="text-xs text-gray-300 space-y-0.5">
                {signal.reasoning.map((reason, idx) => (
                  <li key={idx} className="flex items-start gap-1">
                    <span className="text-blue-400">•</span>
                    <span>{reason}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};


// Strategy Badge Component
interface StrategyBadgeProps {
  strategy: StrategyContribution;
}

const StrategyBadge: React.FC<StrategyBadgeProps> = ({ strategy }) => {
  const getSignalColor = (signal: string) => {
    switch (signal) {
      case 'BULLISH': return 'bg-green-700/50 text-green-300 border-green-600';
      case 'BEARISH': return 'bg-red-700/50 text-red-300 border-red-600';
      default: return 'bg-gray-700/50 text-gray-300 border-gray-600';
    }
  };

  return (
    <div className={`flex items-center justify-between p-1.5 rounded border text-xs ${getSignalColor(strategy.signal)}`}>
      <div className="flex items-center gap-2">
        <span className="font-medium">{strategy.name}</span>
        <span className={`px-1 rounded text-[10px] ${
          strategy.signal === 'BULLISH' ? 'bg-green-600' : 
          strategy.signal === 'BEARISH' ? 'bg-red-600' : 'bg-gray-600'
        }`}>
          {strategy.signal === 'BULLISH' ? 'صعودی' : 
           strategy.signal === 'BEARISH' ? 'نزولی' : 'خنثی'}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-gray-400">اطمینان:</span>
        <span className="font-medium">{strategy.confidence.toFixed(0)}%</span>
      </div>
    </div>
  );
};

export default SignalPanel;
