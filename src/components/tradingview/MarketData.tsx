import React, { useEffect, useRef, memo } from 'react';

interface MarketDataProps {
  symbol?: string;
  theme?: 'light' | 'dark';
  width?: string | number;
  height?: string | number;
  colorTheme?: 'light' | 'dark';
  isTransparent?: boolean;
  locale?: string;
}

const MarketData: React.FC<MarketDataProps> = ({
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
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-market-quotes.js';
    script.type = 'text/javascript';
    script.async = true;
    script.innerHTML = JSON.stringify({
      width: typeof width === 'number' ? width : undefined,
      height: typeof height === 'number' ? height : undefined,
      symbolsGroups: [
        {
          name: 'Top Cryptocurrencies',
          originalName: 'Crypto',
          symbols: [
            { name: 'BINANCE:BTCUSDT', displayName: 'Bitcoin' },
            { name: 'BINANCE:ETHUSDT', displayName: 'Ethereum' },
            { name: 'BINANCE:BNBUSDT', displayName: 'BNB' },
            { name: 'BINANCE:SOLUSDT', displayName: 'Solana' },
            { name: 'BINANCE:XRPUSDT', displayName: 'Ripple' },
            { name: 'BINANCE:ADAUSDT', displayName: 'Cardano' },
          ],
        },
      ],
      showSymbolLogo: true,
      colorTheme: theme,
      isTransparent: isTransparent,
      locale: 'en',
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

export default memo(MarketData);

