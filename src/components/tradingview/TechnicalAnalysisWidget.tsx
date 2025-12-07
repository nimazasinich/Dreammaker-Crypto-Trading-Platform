import React, { useEffect, useRef, memo } from 'react';

interface TechnicalAnalysisWidgetProps {
  symbol?: string;
  theme?: 'light' | 'dark';
  width?: string | number;
  height?: string | number;
  interval?: string;
  colorTheme?: 'light' | 'dark';
  isTransparent?: boolean;
  showIntervalTabs?: boolean;
  locale?: string;
}

const TechnicalAnalysisWidget: React.FC<TechnicalAnalysisWidgetProps> = ({
  symbol = 'BINANCE:BTCUSDT',
  theme = 'dark',
  width = '100%',
  height = 400,
  interval = '1m',
  showIntervalTabs = true,
  isTransparent = false,
}) => {
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!container.current) return;

    container.current.innerHTML = '';

    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-technical-analysis.js';
    script.type = 'text/javascript';
    script.async = true;
    script.innerHTML = JSON.stringify({
      interval: interval,
      width: typeof width === 'number' ? width : undefined,
      height: typeof height === 'number' ? height : undefined,
      isTransparent: isTransparent,
      symbol: symbol,
      showIntervalTabs: showIntervalTabs,
      locale: 'en',
      colorTheme: theme,
    });

    container.current.appendChild(script);

    return () => {
      if (container.current) {
        container.current.innerHTML = '';
      }
    };
  }, [symbol, theme, width, height, interval, showIntervalTabs, isTransparent]);

  return (
    <div 
      className="tradingview-widget-container" 
      ref={container}
      style={{ 
        width: typeof width === 'string' ? width : `${width}px`,
        height: typeof height === 'string' ? height : `${height}px`,
      }}
    >
      <div className="tradingview-widget-container__widget"></div>
    </div>
  );
};

export default memo(TechnicalAnalysisWidget);

