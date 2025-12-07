import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, Wifi, WifiOff, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import useHealthCheck from '../../lib/useHealthCheck';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';
import { useMode } from '../../contexts/ModeContext';
import { useData } from '../../contexts/DataContext';
import { useLiveData } from '../LiveDataContext';
import { useTheme } from '../Theme/ThemeProvider';

interface StatusAccordionProps {
  collapsed: boolean;
}

export const StatusAccordion: React.FC<StatusAccordionProps> = ({ collapsed }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { state: healthState } = useHealthCheck(15000, 4000);
  const isOnline = useOnlineStatus();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  const { 
    state: { dataMode, tradingMode, dataSource: contextDataSource }, 
    setDataMode, 
    setTradingMode, 
    setDataSource 
  } = useMode();
  
  const { dataSource } = useData();
  const { isConnected } = useLiveData();
  
  // Extract status from health check
  const status = healthState.status === 'success' ? healthState.data.status :
                 healthState.status === 'error' ? 'down' : 'unknown';
  
  const primaryDataSource = healthState.status === 'success'
    ? (healthState.data.primaryDataSource || 'huggingface')
    : 'huggingface';
  
  const activeDataSource = contextDataSource || primaryDataSource;
  const error = healthState.status === 'error' ? healthState.error : null;

  // Determine overall status
  const isHealthy = status === 'healthy' && isOnline;
  const hasWarning = status === 'degraded' || !isConnected;
  const hasError = status === 'down' || !isOnline;

  const StatusIcon = hasError ? XCircle : hasWarning ? AlertCircle : CheckCircle;
  const statusColor = hasError ? '#ef4444' : hasWarning ? '#f59e0b' : '#10b981';
  const statusText = hasError ? 'Offline' : hasWarning ? 'Degraded' : 'Online';

  if (collapsed) {
    return (
      <div className="flex h-10 items-center justify-center">
        <div 
          className="h-2 w-2 rounded-full"
          style={{
            background: statusColor,
            boxShadow: `0 0 8px ${statusColor}`,
            animation: 'pulse 2s ease-in-out infinite',
          }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {/* Main Status Button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full rounded-lg transition-all duration-300 overflow-hidden"
        style={{
          background: isDark
            ? hasError 
              ? 'linear-gradient(135deg, rgba(239, 68, 68, 0.12) 0%, rgba(220, 38, 38, 0.08) 100%)'
              : hasWarning
                ? 'linear-gradient(135deg, rgba(245, 158, 11, 0.12) 0%, rgba(217, 119, 6, 0.08) 100%)'
                : 'linear-gradient(135deg, rgba(16, 185, 129, 0.12) 0%, rgba(5, 150, 105, 0.08) 100%)'
            : hasError
              ? 'linear-gradient(135deg, rgba(239, 68, 68, 0.08) 0%, rgba(220, 38, 38, 0.04) 100%)'
              : hasWarning
                ? 'linear-gradient(135deg, rgba(245, 158, 11, 0.08) 0%, rgba(217, 119, 6, 0.04) 100%)'
                : 'linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(5, 150, 105, 0.04) 100%)',
          border: `1px solid ${
            hasError 
              ? isDark ? 'rgba(239, 68, 68, 0.25)' : 'rgba(239, 68, 68, 0.15)'
              : hasWarning
                ? isDark ? 'rgba(245, 158, 11, 0.25)' : 'rgba(245, 158, 11, 0.15)'
                : isDark ? 'rgba(16, 185, 129, 0.25)' : 'rgba(16, 185, 129, 0.15)'
          }`,
        }}
      >
        <div className="flex items-center justify-between px-3 py-2">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <StatusIcon 
              className="flex-shrink-0" 
              size={16} 
              style={{ color: statusColor }}
            />
            <span 
              className="text-xs font-semibold truncate"
              style={{ color: statusColor }}
            >
              {statusText}
            </span>
          </div>
          {isExpanded ? (
            <ChevronUp className="flex-shrink-0" size={14} style={{ color: statusColor }} />
          ) : (
            <ChevronDown className="flex-shrink-0" size={14} style={{ color: statusColor }} />
          )}
        </div>
      </button>

      {/* Expanded Details */}
      {isExpanded && (
        <div 
          className="space-y-2 rounded-lg p-3 animate-slideDown"
          style={{
            background: isDark
              ? 'rgba(15, 15, 24, 0.6)'
              : 'rgba(248, 250, 252, 0.8)',
            border: `1px solid ${isDark ? 'rgba(139, 92, 246, 0.2)' : 'rgba(139, 92, 246, 0.15)'}`,
          }}
        >
          {/* Error Message */}
          {error && (
            <div 
              className="text-[10px] p-2 rounded"
              style={{
                background: isDark ? 'rgba(239, 68, 68, 0.1)' : 'rgba(239, 68, 68, 0.05)',
                color: '#ef4444',
              }}
            >
              {error}
            </div>
          )}

          {/* Network Status */}
          <div className="flex items-center justify-between text-[10px]">
            <span className={isDark ? 'text-slate-400' : 'text-slate-600'}>Network:</span>
            <div className="flex items-center gap-1">
              {isOnline ? (
                <Wifi size={12} className="text-green-500" />
              ) : (
                <WifiOff size={12} className="text-red-500" />
              )}
              <span className={isOnline ? 'text-green-500' : 'text-red-500'}>
                {isOnline ? 'Connected' : 'Disconnected'}
              </span>
            </div>
          </div>

          {/* System Health */}
          <div className="flex items-center justify-between text-[10px]">
            <span className={isDark ? 'text-slate-400' : 'text-slate-600'}>Health:</span>
            <span 
              className={
                status === 'healthy' ? 'text-green-500' :
                status === 'degraded' ? 'text-yellow-500' :
                'text-red-500'
              }
            >
              {healthState.status === 'loading' ? 'Checking...' : status}
            </span>
          </div>

          {/* WebSocket Status */}
          <div className="flex items-center justify-between text-[10px]">
            <span className={isDark ? 'text-slate-400' : 'text-slate-600'}>WebSocket:</span>
            <div className="flex items-center gap-1">
              <div 
                className="w-1.5 h-1.5 rounded-full"
                style={{
                  background: isConnected ? '#10b981' : '#6b7280',
                }}
              />
              <span className={isConnected ? 'text-green-500' : 'text-gray-500'}>
                {isConnected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
          </div>

          <div className="border-t pt-2" style={{
            borderColor: isDark ? 'rgba(139, 92, 246, 0.1)' : 'rgba(139, 92, 246, 0.05)',
          }}>
            {/* Data Source */}
            <div className="mb-2">
              <div className="text-[9px] font-semibold mb-1 uppercase tracking-wider" style={{
                color: isDark ? 'rgba(139, 92, 246, 0.7)' : 'rgba(139, 92, 246, 0.6)',
              }}>
                Data Source
              </div>
              <div className="flex gap-1">
                {(['huggingface', 'exchanges', 'mixed'] as const).map((source) => (
                  <button
                    key={source}
                    onClick={() => setDataSource(source)}
                    className="flex-1 px-2 py-1 rounded text-[9px] font-medium transition-all"
                    style={{
                      background: activeDataSource === source
                        ? 'linear-gradient(135deg, #8b5cf6, #7c3aed)'
                        : isDark ? 'rgba(139, 92, 246, 0.1)' : 'rgba(139, 92, 246, 0.05)',
                      color: activeDataSource === source ? '#fff' : isDark ? '#a78bfa' : '#8b5cf6',
                      border: `1px solid ${activeDataSource === source ? 'transparent' : isDark ? 'rgba(139, 92, 246, 0.2)' : 'rgba(139, 92, 246, 0.15)'}`,
                    }}
                  >
                    {source === 'huggingface' ? '🤗' : source === 'exchanges' ? '📊' : '🔀'}
                  </button>
                ))}
              </div>
            </div>

            {/* Data Mode */}
            <div className="mb-2">
              <div className="text-[9px] font-semibold mb-1 uppercase tracking-wider" style={{
                color: isDark ? 'rgba(139, 92, 246, 0.7)' : 'rgba(139, 92, 246, 0.6)',
              }}>
                Mode
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => setDataMode('offline')}
                  className="flex-1 px-2 py-1 rounded text-[9px] font-medium transition-all"
                  style={{
                    background: dataMode === 'offline'
                      ? 'linear-gradient(135deg, #64748b, #475569)'
                      : isDark ? 'rgba(100, 116, 139, 0.1)' : 'rgba(100, 116, 139, 0.05)',
                    color: dataMode === 'offline' ? '#fff' : isDark ? '#94a3b8' : '#64748b',
                    border: `1px solid ${dataMode === 'offline' ? 'transparent' : isDark ? 'rgba(100, 116, 139, 0.2)' : 'rgba(100, 116, 139, 0.15)'}`,
                  }}
                >
                  Offline
                </button>
                <button
                  onClick={() => setDataMode('online')}
                  className="flex-1 px-2 py-1 rounded text-[9px] font-medium transition-all"
                  style={{
                    background: dataMode === 'online'
                      ? 'linear-gradient(135deg, #06b6d4, #0891b2)'
                      : isDark ? 'rgba(6, 182, 212, 0.1)' : 'rgba(6, 182, 212, 0.05)',
                    color: dataMode === 'online' ? '#fff' : isDark ? '#67e8f9' : '#06b6d4',
                    border: `1px solid ${dataMode === 'online' ? 'transparent' : isDark ? 'rgba(6, 182, 212, 0.2)' : 'rgba(6, 182, 212, 0.15)'}`,
                  }}
                >
                  Online
                </button>
              </div>
            </div>

            {/* Trading Mode */}
            <div>
              <div className="text-[9px] font-semibold mb-1 uppercase tracking-wider" style={{
                color: isDark ? 'rgba(139, 92, 246, 0.7)' : 'rgba(139, 92, 246, 0.6)',
              }}>
                Trading
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => setTradingMode('virtual')}
                  className="flex-1 px-2 py-1 rounded text-[9px] font-medium transition-all"
                  style={{
                    background: tradingMode === 'virtual'
                      ? 'linear-gradient(135deg, #3b82f6, #2563eb)'
                      : isDark ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59, 130, 246, 0.05)',
                    color: tradingMode === 'virtual' ? '#fff' : isDark ? '#93c5fd' : '#3b82f6',
                    border: `1px solid ${tradingMode === 'virtual' ? 'transparent' : isDark ? 'rgba(59, 130, 246, 0.2)' : 'rgba(59, 130, 246, 0.15)'}`,
                  }}
                >
                  Virtual
                </button>
                <button
                  onClick={() => setTradingMode('real')}
                  className="flex-1 px-2 py-1 rounded text-[9px] font-medium transition-all"
                  style={{
                    background: tradingMode === 'real'
                      ? 'linear-gradient(135deg, #10b981, #059669)'
                      : isDark ? 'rgba(16, 185, 129, 0.1)' : 'rgba(16, 185, 129, 0.05)',
                    color: tradingMode === 'real' ? '#fff' : isDark ? '#6ee7b7' : '#10b981',
                    border: `1px solid ${tradingMode === 'real' ? 'transparent' : isDark ? 'rgba(16, 185, 129, 0.2)' : 'rgba(16, 185, 129, 0.15)'}`,
                  }}
                >
                  Real
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-slideDown {
          animation: slideDown 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default StatusAccordion;

