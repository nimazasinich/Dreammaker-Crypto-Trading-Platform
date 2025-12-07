import React, { useState, useEffect } from 'react';
import useHealthCheck from '../../lib/useHealthCheck';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';
import { t } from '../../i18n';
import { useMode } from '../../contexts/ModeContext';
import { useData } from '../../contexts/DataContext';
import { useLiveData } from '../LiveDataContext';
import { DataSourceIndicator } from './DataSourceBadge';
import { TradingMode, TradingMarket } from '../../types/index';

const STATUS_STYLES: Record<string, string> = {
  healthy: 'bg-green-100 text-green-800 border-green-300',
  degraded: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  down: 'bg-red-100 text-red-800 border-red-300',
  unknown: 'bg-slate-100 text-slate-700 border-slate-300',
};

export function StatusRibbon() {
  const { state: healthState, refresh: refreshHealth } = useHealthCheck(15000, 4000);
  const isOnline = useOnlineStatus();
  const { state: { dataMode, tradingMode, dataSource: contextDataSource }, setDataMode, setTradingMode, setDataSource } = useMode();
  const { dataSource } = useData();
  const { isConnected } = useLiveData();
  const [systemTradingMode, setSystemTradingMode] = useState<TradingMode>('OFF');
  const [systemTradingMarket, setSystemTradingMarket] = useState<TradingMarket>('FUTURES');

  // Extract data from health state
  const status = healthState.status === 'success' ? healthState.data.status :
                 healthState.status === 'error' ? 'down' : 'unknown';
  const providers = healthState.status === 'success' ? healthState.data.providers : undefined;
  const primaryDataSource = healthState.status === 'success'
    ? (healthState.data.primaryDataSource || 'huggingface')
    : 'huggingface';
  const error = healthState.status === 'error' ? healthState.error : null;

  // Use context data source or primary from health
  const activeDataSource = contextDataSource || primaryDataSource;

  // Fetch system trading config from API
  useEffect(() => {
    const fetchSystemStatus = async () => {
      try {
        const response = await fetch('/api/system/health');
        if (!response.ok) {
          console.warn(`System health check returned ${response.status}`);
          return;
        }
        const data = await response.json();

        if (data.trading) {
          setSystemTradingMode(data.trading.mode || 'OFF');
          setSystemTradingMarket(data.trading.market || 'FUTURES');
        }
      } catch (error) {
        console.error('Failed to fetch system trading status:', error);
      }
    };

    fetchSystemStatus();
    const interval = setInterval(fetchSystemStatus, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);

  if (import.meta?.env?.VITE_SHOW_STATUS_RIBBON === 'false') {
    return null;
  }

  const style = STATUS_STYLES[status] ?? STATUS_STYLES.unknown;

  return (
    <>
      {/* Offline Banner - Compact */}
      {!isOnline && (
        <div
          className="w-full bg-gradient-to-r from-red-600 to-red-500 text-white text-xs px-3 py-1.5 flex items-center justify-center gap-1.5 shadow-sm"
          role="alert"
          aria-live="assertive"
        >
          <span className="font-semibold">📴</span>
          <span className="font-medium">No internet connection</span>
        </div>
      )}

      {/* Compact Professional Status Ribbon */}
      <div
        className={`w-full border-b ${style} text-xs px-3 py-1.5 flex items-center justify-between bg-white/95 dark:bg-slate-900/95 backdrop-blur-md shadow-sm`}
        dir="ltr"
        role="status"
        aria-live="polite"
        style={{ minHeight: '32px' }}
      >
        {/* Left: Status & Error */}
        <div className="flex items-center gap-2 min-w-0 flex-shrink">
          <div className="flex items-center gap-1.5">
            <div 
              className={`w-1.5 h-1.5 rounded-full ${
                status === 'healthy' ? 'bg-green-500' : 
                status === 'degraded' ? 'bg-yellow-500' : 
                status === 'down' ? 'bg-red-500' : 'bg-gray-400'
              }`}
              title={`System: ${status}`}
            />
            <span className="font-medium text-[10px] uppercase tracking-wide">
              {healthState.status === 'loading' ? 'Checking...' : status}
            </span>
          </div>
          
          {error && (
            <span 
              className="truncate max-w-[200px] text-red-600 dark:text-red-400 text-[10px]" 
              title={error}
            >
              {error}
            </span>
          )}
        </div>

        {/* Right: Compact Controls */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {/* Data Source Badge */}
          <div 
            className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
              activeDataSource === 'huggingface' ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400' :
              activeDataSource === 'exchanges' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' :
              'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-400'
            }`}
            title={`Data: ${activeDataSource}`}
          >
            {activeDataSource === 'huggingface' ? '🤗' : activeDataSource === 'exchanges' ? '📊' : '🔀'}
          </div>

          {/* Trading Mode */}
          <div 
            className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
              systemTradingMode === 'OFF' ? 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400' :
              'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
            }`}
            title={`Trading: ${systemTradingMode} | ${systemTradingMarket}`}
          >
            {systemTradingMode}
          </div>

          {/* WebSocket Indicator */}
          <div 
            className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-green-500' : 'bg-gray-400'}`}
            title={isConnected ? 'Connected' : 'Disconnected'}
          />

          {/* Divider */}
          <div className="w-px h-4 bg-gray-300 dark:bg-gray-600" />

          {/* Compact Toggle Group */}
          <div className="flex items-center gap-1">
            {/* Online/Offline Toggle */}
            <div className="flex rounded overflow-hidden border border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setDataMode('offline')}
                className={`px-2 py-0.5 text-[10px] font-medium transition-colors ${
                  dataMode === 'offline'
                    ? 'bg-slate-600 text-white'
                    : 'bg-transparent text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
                aria-pressed={dataMode === 'offline'}
                title="Offline mode"
              >
                OFF
              </button>
              <button
                onClick={() => setDataMode('online')}
                className={`px-2 py-0.5 text-[10px] font-medium transition-colors border-l border-gray-200 dark:border-gray-700 ${
                  dataMode === 'online'
                    ? 'bg-cyan-600 text-white'
                    : 'bg-transparent text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
                aria-pressed={dataMode === 'online'}
                title="Online mode"
              >
                ON
              </button>
            </div>

            {/* Virtual/Real Toggle */}
            <div className="flex rounded overflow-hidden border border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setTradingMode('virtual')}
                className={`px-2 py-0.5 text-[10px] font-medium transition-colors ${
                  tradingMode === 'virtual'
                    ? 'bg-blue-600 text-white'
                    : 'bg-transparent text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
                aria-pressed={tradingMode === 'virtual'}
                title="Virtual trading"
              >
                VRT
              </button>
              <button
                onClick={() => setTradingMode('real')}
                className={`px-2 py-0.5 text-[10px] font-medium transition-colors border-l border-gray-200 dark:border-gray-700 ${
                  tradingMode === 'real'
                    ? 'bg-green-600 text-white'
                    : 'bg-transparent text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
                aria-pressed={tradingMode === 'real'}
                title="Real trading"
              >
                REAL
              </button>
            </div>

            {/* Data Source Dropdown-style Toggle */}
            <div className="flex rounded overflow-hidden border border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setDataSource('huggingface')}
                className={`px-1.5 py-0.5 text-[10px] font-medium transition-colors ${
                  activeDataSource === 'huggingface'
                    ? 'bg-amber-600 text-white'
                    : 'bg-transparent text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
                aria-pressed={activeDataSource === 'huggingface'}
                title="HuggingFace"
              >
                🤗
              </button>
              <button
                onClick={() => setDataSource('exchanges')}
                className={`px-1.5 py-0.5 text-[10px] font-medium transition-colors border-l border-gray-200 dark:border-gray-700 ${
                  activeDataSource === 'exchanges'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-transparent text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
                aria-pressed={activeDataSource === 'exchanges'}
                title="Exchanges"
              >
                📊
              </button>
              <button
                onClick={() => setDataSource('mixed')}
                className={`px-1.5 py-0.5 text-[10px] font-medium transition-colors border-l border-gray-200 dark:border-gray-700 ${
                  activeDataSource === 'mixed'
                    ? 'bg-teal-600 text-white'
                    : 'bg-transparent text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
                aria-pressed={activeDataSource === 'mixed'}
                title="Mixed sources"
              >
                🔀
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default StatusRibbon;
