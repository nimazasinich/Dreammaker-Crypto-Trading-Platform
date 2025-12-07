/**
 * SignalTable Component
 * Displays trading signals in a professional table format
 */

import React, { useState, useMemo } from 'react';
import { ExtremePoint } from '../../services/ExtremePointsDetector';
import { 
  ArrowUpCircle, 
  ArrowDownCircle, 
  Clock, 
  TrendingUp, 
  Filter,
  ChevronDown,
  ChevronUp,
  AlertCircle
} from 'lucide-react';

interface SignalTableProps {
  signals: ExtremePoint[];
  onSignalSelect?: (signal: ExtremePoint) => void;
  selectedSignalId?: string;
  className?: string;
  isDark?: boolean;
}

type SortField = 'timestamp' | 'confidence' | 'symbol' | 'volume24h';
type SortDirection = 'asc' | 'desc';

const SignalTable: React.FC<SignalTableProps> = ({
  signals,
  onSignalSelect,
  selectedSignalId,
  className = '',
  isDark = true
}) => {
  const [sortField, setSortField] = useState<SortField>('timestamp');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [filterType, setFilterType] = useState<'ALL' | 'BUY' | 'SELL'>('ALL');

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const sortedSignals = useMemo(() => {
    let filtered = signals;
    if (filterType !== 'ALL') {
      filtered = signals.filter(s => s.signalType === filterType);
    }

    return [...filtered].sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case 'timestamp':
          comparison = a.timestamp - b.timestamp;
          break;
        case 'confidence':
          comparison = a.confidence - b.confidence;
          break;
        case 'symbol':
          comparison = a.symbol.localeCompare(b.symbol);
          break;
        case 'volume24h':
          comparison = a.volume24h - b.volume24h;
          break;
      }
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [signals, sortField, sortDirection, filterType]);


  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  };

  const formatPrice = (price: number) => {
    if (price >= 1000) return `$${price.toLocaleString('en-US', { maximumFractionDigits: 2 })}`;
    if (price >= 1) return `$${price.toFixed(4)}`;
    return `$${price.toFixed(8)}`;
  };

  const formatVolume = (volume: number) => {
    if (volume >= 1_000_000_000) return `$${(volume / 1_000_000_000).toFixed(1)}B`;
    if (volume >= 1_000_000) return `$${(volume / 1_000_000).toFixed(1)}M`;
    return `$${(volume / 1_000).toFixed(0)}K`;
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'text-green-400';
    if (confidence >= 60) return 'text-yellow-400';
    return 'text-orange-400';
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' 
      ? <ChevronUp className="h-3 w-3 inline ml-1" />
      : <ChevronDown className="h-3 w-3 inline ml-1" />;
  };

  const headerClass = `px-3 py-2 text-left text-xs font-semibold cursor-pointer hover:bg-purple-500/10 transition-colors ${
    isDark ? 'text-slate-400' : 'text-slate-600'
  }`;

  const cellClass = `px-3 py-2.5 text-sm ${isDark ? 'text-slate-300' : 'text-slate-700'}`;

  return (
    <div className={`rounded-xl overflow-hidden ${className}`} style={{
      background: isDark ? 'rgba(26, 26, 40, 0.98)' : 'rgba(255, 255, 255, 0.98)',
      border: `1px solid ${isDark ? 'rgba(139, 92, 246, 0.2)' : 'rgba(139, 92, 246, 0.15)'}`,
    }}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b" style={{
        borderColor: isDark ? 'rgba(139, 92, 246, 0.2)' : 'rgba(139, 92, 246, 0.15)',
        background: isDark ? 'rgba(139, 92, 246, 0.1)' : 'rgba(139, 92, 246, 0.05)',
      }}>
        <div className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-purple-400" />
          <h3 className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Trading Signals
          </h3>
          <span className={`text-xs px-2 py-0.5 rounded-full ${
            isDark ? 'bg-purple-500/20 text-purple-300' : 'bg-purple-100 text-purple-700'
          }`}>
            {sortedSignals.length} active
          </span>
        </div>

        {/* Filter */}
        <div className="flex items-center gap-1">
          <Filter className="h-4 w-4 text-slate-400 mr-1" />
          {(['ALL', 'BUY', 'SELL'] as const).map(type => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-2 py-1 text-xs rounded transition-colors ${
                filterType === type
                  ? type === 'BUY' 
                    ? 'bg-green-600 text-white'
                    : type === 'SELL'
                    ? 'bg-red-600 text-white'
                    : 'bg-purple-600 text-white'
                  : isDark 
                  ? 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
              }`}
            >
              {type === 'ALL' ? 'All' : type}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      {sortedSignals.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12">
          <AlertCircle className="h-12 w-12 text-slate-500 mb-3" />
          <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            No signals detected yet
          </p>
          <p className={`text-xs mt-1 ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>
            Signals will appear when market conditions are met
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b" style={{ borderColor: isDark ? 'rgba(139, 92, 246, 0.15)' : 'rgba(139, 92, 246, 0.1)' }}>
                <th className={headerClass} onClick={() => handleSort('symbol')}>
                  Symbol <SortIcon field="symbol" />
                </th>
                <th className={headerClass}>Type</th>
                <th className={headerClass}>Price</th>
                <th className={headerClass}>Target</th>
                <th className={headerClass}>Stop Loss</th>
                <th className={headerClass} onClick={() => handleSort('confidence')}>
                  Confidence <SortIcon field="confidence" />
                </th>
                <th className={headerClass} onClick={() => handleSort('volume24h')}>
                  Volume <SortIcon field="volume24h" />
                </th>
                <th className={headerClass} onClick={() => handleSort('timestamp')}>
                  Time <SortIcon field="timestamp" />
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedSignals.map(signal => (
                <tr
                  key={signal.id}
                  onClick={() => onSignalSelect?.(signal)}
                  className={`border-b cursor-pointer transition-colors ${
                    selectedSignalId === signal.id
                      ? isDark ? 'bg-purple-500/20' : 'bg-purple-100'
                      : isDark ? 'hover:bg-white/5' : 'hover:bg-slate-50'
                  }`}
                  style={{ borderColor: isDark ? 'rgba(139, 92, 246, 0.1)' : 'rgba(139, 92, 246, 0.08)' }}
                >
                  <td className={cellClass}>
                    <span className="font-semibold">{signal.symbol.replace('USDT', '')}</span>
                    <span className="text-slate-500">/USDT</span>
                  </td>
                  <td className={cellClass}>
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${
                      signal.signalType === 'BUY'
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-red-500/20 text-red-400'
                    }`}>
                      {signal.signalType === 'BUY' 
                        ? <ArrowUpCircle className="h-3 w-3" />
                        : <ArrowDownCircle className="h-3 w-3" />
                      }
                      {signal.signalType}
                    </span>
                  </td>
                  <td className={cellClass}>{formatPrice(signal.price)}</td>
                  <td className={`${cellClass} text-green-400`}>
                    {signal.targetPrice ? formatPrice(signal.targetPrice) : '-'}
                  </td>
                  <td className={`${cellClass} text-red-400`}>
                    {signal.stopLoss ? formatPrice(signal.stopLoss) : '-'}
                  </td>
                  <td className={cellClass}>
                    <span className={`font-semibold ${getConfidenceColor(signal.confidence)}`}>
                      {signal.confidence}%
                    </span>
                  </td>
                  <td className={cellClass}>{formatVolume(signal.volume24h)}</td>
                  <td className={cellClass}>
                    <span className="inline-flex items-center gap-1 text-slate-400">
                      <Clock className="h-3 w-3" />
                      {formatTime(signal.timestamp)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default SignalTable;
