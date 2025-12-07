import React, { useEffect, useRef, memo } from 'react';

interface SymbolInfoProps {
  symbol?: string;
  theme?: 'light' | 'dark';
  width?: string | number;
  height?: string | number;
  colorTheme?: 'light' | 'dark';
  locale?: string;
  isTransparent?: boolean;
}

const SymbolInfo: React.FC<SymbolInfoProps> = ({
  symbol = 'BINANCE:BTCUSDT',
  theme = 'dark',
  width = '100%',
  height = 400,
  isTransparent = false,
}) => {
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!container.current) return;

    container.current.innerHTML = '';

    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-symbol-info.js';
    script.type = 'text/javascript';
    script.async = true;
    script.innerHTML = JSON.stringify({
      symbol: symbol,
      width: typeof width === 'number' ? width : undefined,
      height: typeof height === 'number' ? height : undefined,
      locale: 'en',
      colorTheme: theme,
      isTransparent: isTransparent,
    });

    container.current.appendChild(script);

    return () => {
      if (container.current) {
        container.current.innerHTML = '';
      }
    };
  }, [symbol, theme, width, height, isTransparent]);

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

export default memo(SymbolInfo);

