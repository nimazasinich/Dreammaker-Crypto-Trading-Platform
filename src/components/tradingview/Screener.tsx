import React, { useEffect, useRef, memo } from 'react';

interface ScreenerProps {
  theme?: 'light' | 'dark';
  width?: string | number;
  height?: string | number;
  defaultColumn?: string;
  defaultScreen?: string;
  market?: string;
  showToolbar?: boolean;
  colorTheme?: 'light' | 'dark';
  locale?: string;
  isTransparent?: boolean;
  onSymbolClick?: (symbol: string) => void;
}

const Screener: React.FC<ScreenerProps> = ({
  theme = 'dark',
  width = '100%',
  height = 490,
  defaultColumn = 'overview',
  defaultScreen = 'general',
  market = 'crypto',
  showToolbar = true,
  isTransparent = false,
}) => {
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!container.current) return;

    container.current.innerHTML = '';

    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-screener.js';
    script.type = 'text/javascript';
    script.async = true;
    script.innerHTML = JSON.stringify({
      width: typeof width === 'number' ? width : undefined,
      height: typeof height === 'number' ? height : undefined,
      defaultColumn: defaultColumn,
      defaultScreen: defaultScreen,
      market: market,
      showToolbar: showToolbar,
      colorTheme: theme,
      locale: 'en',
      isTransparent: isTransparent,
    });

    container.current.appendChild(script);

    return () => {
      if (container.current) {
        container.current.innerHTML = '';
      }
    };
  }, [theme, width, height, defaultColumn, defaultScreen, market, showToolbar, isTransparent]);

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

export default memo(Screener);

