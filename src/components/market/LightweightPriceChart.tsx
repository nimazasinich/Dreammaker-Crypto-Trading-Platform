import React, { useEffect, useRef, useState, useCallback } from 'react';
import { createChart, IChartApi, ISeriesApi, CandlestickData as LWCandlestickData } from 'lightweight-charts';
import { Logger } from '../../core/Logger';
import { CandlestickData } from '../../types';
import { hfAPI } from '../../services/HuggingFaceUnifiedAPI';
import { RefreshCw } from 'lucide-react';

interface LightweightPriceChartProps {
  symbol: string;
  data?: CandlestickData[];
  autoFetch?: boolean;
  initialTimeframe?: string;
}

const logger = Logger.getInstance();

export const LightweightPriceChart: React.FC<LightweightPriceChartProps> = ({
  symbol,
  data: propData,
  autoFetch = false,
  initialTimeframe = '1h'
}) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candlestickSeriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  
  const [loading, setLoading] = useState(false);
  const [timeframe, setTimeframe] = useState(initialTimeframe);
  const [chartData, setChartData] = useState<CandlestickData[]>(propData || []);

  // Fetch chart data using HuggingFace Unified API
  const fetchChartData = useCallback(async () => {
    setLoading(true);
    try {
      if (import.meta.env.DEV) logger.info(`📊 Loading REAL chart data for ${symbol} (${timeframe}) from HuggingFace...`);
      
      // Use HuggingFace Unified API directly
      const response = await hfAPI.getOHLCV(symbol, timeframe, 100);
      
      if (response.success && response.data && Array.isArray(response.data) && response.data.length > 0) {
        const candles: CandlestickData[] = response.data.map((d: any) => ({
          timestamp: typeof d.timestamp === 'number' ? d.timestamp :
                    typeof d.timestamp === 'string' ? new Date(d.timestamp).getTime() :
                    Date.now(),
          open: d.open || 0,
          high: d.high || 0,
          low: d.low || 0,
          close: d.close || 0,
          volume: d.volume || 0
        }));
        
        // Validate candles
        const symbolName = symbol.toUpperCase();
        const minReasonablePrice = symbolName.includes('BTC') ? 1000 :
                                   symbolName.includes('ETH') ? 100 :
                                   symbolName.includes('BNB') ? 10 :
                                   0.01;
        
        const validCandles = candles.filter(c => {
          const hasValidData = c.open > 0 && c.high > 0 && c.low > 0 && c.close > 0 &&
                              c.high >= c.open && c.high >= c.close &&
                              c.low <= c.open && c.low <= c.close;
          const hasReasonablePrice = c.close >= minReasonablePrice;
          return hasValidData && hasReasonablePrice;
        });
        
        if (validCandles.length > 10) {
          setChartData(validCandles);
          if (import.meta.env.DEV) logger.info(`✅ Loaded ${validCandles.length} valid candles for ${symbol}`);
        } else {
          logger.warn(`⚠️ Not enough valid candles: ${validCandles.length}`);
        }
      }
    } catch (error) {
      logger.error('Failed to fetch chart data', {}, error as Error);
    } finally {
      setLoading(false);
    }
  }, [symbol, timeframe]);

  // Auto-fetch on mount and timeframe change
  useEffect(() => {
    if (autoFetch && symbol) {
      fetchChartData();
    }
  }, [symbol, timeframe, autoFetch, fetchChartData]);

  // Update from prop data
  useEffect(() => {
    if (propData && propData.length > 0) {
      setChartData(propData);
    }
  }, [propData]);

  // Initialize chart
  useEffect(() => {
    if (!chartContainerRef.current) return;

    // Create chart
    // Get CSS variables for theme-aware colors
    const getCSSVar = (varName: string) => {
      return getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
    };

    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: 400,
      layout: {
        background: { color: getCSSVar('--surface-page') || '#0a0a0f' },
        textColor: getCSSVar('--text-secondary') || '#d1d5db',
      },
      grid: {
        vertLines: { color: getCSSVar('--border-subtle') || '#1f2937', style: 1, visible: true },
        horzLines: { color: getCSSVar('--border-subtle') || '#1f2937', style: 1, visible: true },
      },
      crosshair: {
        mode: 1,
        vertLine: {
          color: getCSSVar('--text-muted') || '#6b7280',
          width: 1,
          style: 3,
          labelBackgroundColor: getCSSVar('--color-info-500') || '#3b82f6',
        },
        horzLine: {
          color: getCSSVar('--text-muted') || '#6b7280',
          width: 1,
          style: 3,
          labelBackgroundColor: getCSSVar('--color-info-500') || '#3b82f6',
        },
      },
      rightPriceScale: {
        borderColor: getCSSVar('--border-default') || '#374151',
        scaleMargins: {
          top: 0.1,
          bottom: 0.2,
        },
      },
      timeScale: {
        borderColor: getCSSVar('--border-default') || '#374151',
        timeVisible: true,
        secondsVisible: false,
      },
    });

    // Get theme-aware candlestick colors
    const upColor = getCSSVar('--color-success-500') || '#10b981';
    const downColor = getCSSVar('--color-danger-500') || '#ef4444';

    // Add candlestick series (v4 API)
    const candlestickSeries = (chart as any).addCandlestickSeries ? 
      (chart as any).addCandlestickSeries({
        upColor,
        downColor,
        borderUpColor: upColor,
        borderDownColor: downColor,
        wickUpColor: upColor,
        wickDownColor: downColor,
      }) : 
      chart.addSeries({ type: 'Candlestick' } as any, {
        upColor,
        downColor,
        borderUpColor: upColor,
        borderDownColor: downColor,
        wickUpColor: upColor,
        wickDownColor: downColor,
      } as any);

    chartRef.current = chart;
    candlestickSeriesRef.current = candlestickSeries;

    // Handle resize
    const handleResize = () => {
      if (chartContainerRef.current && chartRef.current) {
        chartRef.current.applyOptions({
          width: chartContainerRef.current.clientWidth,
        });
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, []);

  // Update chart data
  useEffect(() => {
    if (!candlestickSeriesRef.current || chartData.length === 0) return;

    try {
      // Convert to Lightweight Charts format
      const lwcData: LWCandlestickData[] = chartData.map(candle => ({
        time: Math.floor(candle.timestamp / 1000) as any, // Convert to seconds
        open: candle.open,
        high: candle.high,
        low: candle.low,
        close: candle.close,
      }));

      // Sort by time
      lwcData.sort((a, b) => (a.time as number) - (b.time as number));

      // Set data
      candlestickSeriesRef.current.setData(lwcData);

      // Fit content
      if (chartRef.current) {
        chartRef.current.timeScale().fitContent();
      }
    } catch (error) {
      logger.error('Failed to update chart', {}, error as Error);
    }
  }, [chartData]);

  // Calculate stats
  const latestCandle = chartData[chartData.length - 1];
  const firstCandle = chartData[0];
  const priceChange = latestCandle && firstCandle ? latestCandle.close - firstCandle.close : 0;
  const priceChangePercent = latestCandle && firstCandle && firstCandle.close > 0
    ? ((priceChange / firstCandle.close) * 100)
    : 0;

  return (
    <div className="bg-gray-900 rounded-lg border border-gray-800 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-800 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h3 className="text-lg font-bold text-white">{symbol}/USDT</h3>
          {latestCandle && (
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-white">
                ${latestCandle.close.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              <span className={`text-sm font-semibold ${priceChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {priceChange >= 0 ? '▲' : '▼'} {Math.abs(priceChangePercent).toFixed(2)}%
              </span>
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          {/* Timeframe selector */}
          <select
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value)}
            className="bg-gray-800 text-white px-3 py-1.5 rounded border border-gray-700 text-sm focus:outline-none focus:border-blue-500"
          >
            <option value="1m">1m</option>
            <option value="5m">5m</option>
            <option value="15m">15m</option>
            <option value="1h">1h</option>
            <option value="4h">4h</option>
            <option value="1d">1d</option>
          </select>
          
          {/* Refresh button */}
          <button
            onClick={fetchChartData}
            disabled={loading}
            className="p-2 bg-gray-800 hover:bg-gray-700 text-white rounded border border-gray-700 transition-colors disabled:opacity-50"
            title="Refresh data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Chart */}
      <div className="relative">
        {loading && (
          <div className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center z-10">
            <div className="text-white text-sm">Loading chart data...</div>
          </div>
        )}
        <div ref={chartContainerRef} className="w-full" />
      </div>
    </div>
  );
};

