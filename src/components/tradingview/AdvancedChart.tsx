import React, { useEffect, useRef, useState, memo } from 'react';

interface AdvancedChartProps {
    symbol?: string;
    theme?: 'light' | 'dark';
    interval?: string;
    width?: string | number;
    height?: string | number;
    isLocked?: boolean; // قفل کردن چارت برای جلوگیری از زوم و جابجایی ناخواسته
}

// Convert our timeframe format to TradingView's expected interval format
const convertIntervalToTradingView = (interval: string): string => {
    const intervalMap: Record<string, string> = {
        '1m': '1',      // 1 minute
        '5m': '5',      // 5 minutes
        '15m': '15',    // 15 minutes
        '30m': '30',    // 30 minutes
        '1h': '60',     // 1 hour
        '2h': '120',    // 2 hours
        '4h': '240',    // 4 hours
        '6h': '360',    // 6 hours
        '8h': '480',    // 8 hours
        '12h': '720',   // 12 hours
        '1D': 'D',      // Daily
        '1d': 'D',      // Daily (lowercase)
        '1W': 'W',      // Weekly
        '1w': 'W',      // Weekly (lowercase)
        '1M': 'M',      // Monthly
    };

    // Return mapped value or the original if not found, default to 'D' (daily)
    return intervalMap[interval] || interval || 'D';
};

const AdvancedChart: React.FC<AdvancedChartProps> = ({
    symbol = 'BINANCE:BTCUSDT',
    theme = 'light', // FORCE LIGHT THEME - User's app is light themed
    interval = 'D',
    width = '100%',
    height = 500,
    isLocked = true, // به صورت پیش‌فرض قفل است
}) => {
    const container = useRef<HTMLDivElement>(null);
    const scriptRef = useRef<HTMLScriptElement | null>(null);
    const [chartError, setChartError] = React.useState(false);

    useEffect(() => {
        if (!container.current) return;

        // Clear any existing content and error state
        container.current.innerHTML = '';
        setChartError(false);

        // Remove previous script if exists
        if (scriptRef.current && scriptRef.current.parentNode) {
            scriptRef.current.parentNode.removeChild(scriptRef.current);
        }

        // Small delay to ensure DOM is ready
        const timer = setTimeout(() => {
            const script = document.createElement('script');
            script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js';
            script.type = 'text/javascript';
            script.async = true;

            script.onload = () => {
                console.log('TradingView chart script loaded successfully');
            };

            script.onerror = () => {
                console.error('Failed to load TradingView chart script');
                setChartError(true);
            };

            // Convert interval to TradingView format
            const tvInterval = convertIntervalToTradingView(interval);

            script.innerHTML = JSON.stringify({
                autosize: true, // Changed to true for better responsiveness
                symbol: symbol,
                interval: tvInterval, // Use converted interval
                timezone: 'Etc/UTC',
                theme: 'light', // FORCE LIGHT THEME
                style: '1',
                locale: 'en',
                enable_publishing: false,
                allow_symbol_change: true,
                save_image: true,
                calendar: false,
                support_host: 'https://www.tradingview.com',
                // Simplified studies to avoid protocol errors
                studies_overrides: {},
                // Light theme overrides
                overrides: {
                    'paneProperties.background': '#ffffff',
                    'paneProperties.backgroundType': 'solid',
                    'paneProperties.vertGridProperties.color': '#f1f5f9',
                    'paneProperties.horzGridProperties.color': '#f1f5f9',
                    'scalesProperties.textColor': '#64748b',
                    'scalesProperties.lineColor': '#e2e8f0',
                    'mainSeriesProperties.candleStyle.upColor': '#10b981',
                    'mainSeriesProperties.candleStyle.downColor': '#ef4444',
                    'mainSeriesProperties.candleStyle.borderUpColor': '#10b981',
                    'mainSeriesProperties.candleStyle.borderDownColor': '#ef4444',
                },
            });

            scriptRef.current = script;
            container.current.appendChild(script);
        }, 100);

        return () => {
            clearTimeout(timer);
            if (container.current) {
                container.current.innerHTML = '';
            }
            if (scriptRef.current && scriptRef.current.parentNode) {
                scriptRef.current.parentNode.removeChild(scriptRef.current);
            }
        };
    }, [symbol, interval, width, height, isLocked]);

    const handleReconnect = () => {
        setChartError(false);
        // Force re-render by clearing and re-adding
        if (container.current) {
            container.current.innerHTML = '';
        }
        // Trigger useEffect again
        const event = new Event('reconnect-chart');
        window.dispatchEvent(event);
    };

    // Listen for reconnect event
    useEffect(() => {
        const handleReconnectEvent = () => {
            if (container.current) {
                container.current.innerHTML = '';
                setChartError(false);
            }
        };
        window.addEventListener('reconnect-chart', handleReconnectEvent);
        return () => window.removeEventListener('reconnect-chart', handleReconnectEvent);
    }, []);

    return (
        <div
            className="tradingview-widget-container relative"
            ref={container}
            style={{
                width: typeof width === 'string' ? width : `${width}px`,
                height: typeof height === 'string' ? height : `${height}px`,
                background: '#ffffff',
                position: 'relative',
                ...(isLocked ? {
                    pointerEvents: 'none',
                    userSelect: 'none',
                    touchAction: 'none',
                    overflow: 'hidden',
                } : {}),
            }}
            onWheel={(e) => isLocked && e.preventDefault()}
            onMouseDown={(e) => isLocked && e.preventDefault()}
            onTouchStart={(e) => isLocked && e.preventDefault()}
            onContextMenu={(e) => isLocked && e.preventDefault()}
        >
            {/* Overlay برای قفل کردن تعاملات چارت */}
            {isLocked && (
                <div
                    className="absolute inset-0 z-[9999] cursor-not-allowed"
                    style={{
                        background: 'rgba(255, 255, 255, 0.02)',
                        pointerEvents: 'all',
                        userSelect: 'none',
                        touchAction: 'none',
                        WebkitUserSelect: 'none',
                        MozUserSelect: 'none',
                        msUserSelect: 'none',
                    }}
                    onWheel={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                    }}
                    onMouseDown={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                    }}
                    onMouseMove={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                    }}
                    onTouchStart={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                    }}
                    onTouchMove={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                    }}
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                    }}
                    title="Chart is locked. Click unlock button to enable zoom and pan."
                />
            )}
            <div
                className="tradingview-widget-container__widget"
                style={isLocked ? {
                    pointerEvents: 'none',
                    userSelect: 'none',
                    touchAction: 'none',
                    WebkitUserSelect: 'none',
                    MozUserSelect: 'none',
                    msUserSelect: 'none',
                } : {}}
            ></div>

            {/* Error State */}
            {chartError && (
                <div className="absolute inset-0 flex items-center justify-center bg-white rounded-lg border border-gray-200">
                    <div className="text-center p-8 max-w-md">
                        <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
                            <span className="text-3xl">⚠️</span>
                        </div>
                        <h3 className="text-lg font-semibold mb-2 text-gray-900">
                            Chart Loading Error
                        </h3>
                        <p className="text-sm mb-6 text-gray-600">
                            Unable to load the trading chart. This might be due to network issues or TradingView service unavailability.
                        </p>
                        <button
                            onClick={handleReconnect}
                            className="px-6 py-2.5 rounded-lg font-medium text-white transition-all hover:opacity-90"
                            style={{
                                background: 'linear-gradient(135deg, #8b5cf6 0%, #06b6d4 100%)',
                            }}
                        >
                            Reconnect
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default memo(AdvancedChart);

