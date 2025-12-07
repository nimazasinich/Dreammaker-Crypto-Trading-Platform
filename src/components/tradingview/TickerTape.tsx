import React, { useEffect, useRef, memo } from 'react';

interface TickerTapeProps {
  theme?: 'light' | 'dark';
  symbols?: Array<{ proName: string; title: string }>;
  showSymbolLogo?: boolean;
  colorTheme?: 'light' | 'dark';
  isTransparent?: boolean;
}

const TickerTape: React.FC<TickerTapeProps> = ({
  theme = 'dark',
  showSymbolLogo = true,
  isTransparent = false,
}) => {
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!container.current) return;

    container.current.innerHTML = '';

    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-ticker-tape.js';
    script.type = 'text/javascript';
    script.async = true;
    script.innerHTML = JSON.stringify({
      symbols: [
        { proName: 'BINANCE:BTCUSDT', title: 'Bitcoin' },
        { proName: 'BINANCE:ETHUSDT', title: 'Ethereum' },
        { proName: 'BINANCE:BNBUSDT', title: 'BNB' },
        { proName: 'BINANCE:SOLUSDT', title: 'Solana' },
        { proName: 'BINANCE:ADAUSDT', title: 'Cardano' },
        { proName: 'BINANCE:XRPUSDT', title: 'Ripple' },
        { proName: 'BINANCE:DOTUSDT', title: 'Polkadot' },
        { proName: 'BINANCE:MATICUSDT', title: 'Polygon' },
        { proName: 'BINANCE:AVAXUSDT', title: 'Avalanche' },
        { proName: 'BINANCE:LINKUSDT', title: 'Chainlink' },
      ],
      showSymbolLogo: showSymbolLogo,
      colorTheme: theme,
      isTransparent: isTransparent,
      displayMode: 'adaptive',
      locale: 'en',
    });

    container.current.appendChild(script);

    return () => {
      if (container.current) {
        container.current.innerHTML = '';
      }
    };
  }, [theme, showSymbolLogo, isTransparent]);

  return (
    <div className="tradingview-widget-container" ref={container}>
      <div className="tradingview-widget-container__widget"></div>
    </div>
  );
};

export default memo(TickerTape);

