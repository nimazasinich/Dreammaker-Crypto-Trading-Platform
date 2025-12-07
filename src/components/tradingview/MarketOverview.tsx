import React, { useEffect, useRef, memo } from 'react';

interface MarketOverviewProps {
  theme?: 'light' | 'dark';
  width?: string | number;
  height?: string | number;
  colorTheme?: 'light' | 'dark';
  dateRange?: '1D' | '1M' | '3M' | '12M' | '60M' | 'ALL';
  showChart?: boolean;
  locale?: string;
  largeChartUrl?: string;
  isTransparent?: boolean;
}

const MarketOverview: React.FC<MarketOverviewProps> = ({
  theme = 'dark',
  width = '100%',
  height = 400,
  dateRange = '12M',
  showChart = true,
  isTransparent = false,
}) => {
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!container.current) return;

    container.current.innerHTML = '';

    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-market-overview.js';
    script.type = 'text/javascript';
    script.async = true;
    script.innerHTML = JSON.stringify({
      colorTheme: theme,
      dateRange: dateRange,
      showChart: showChart,
      locale: 'en',
      width: typeof width === 'number' ? width : undefined,
      height: typeof height === 'number' ? height : undefined,
      largeChartUrl: '',
      isTransparent: isTransparent,
      showSymbolLogo: true,
      showFloatingTooltip: false,
      plotLineColorGrowing: 'rgba(41, 98, 255, 1)',
      plotLineColorFalling: 'rgba(41, 98, 255, 1)',
      gridLineColor: 'rgba(240, 243, 250, 0)',
      scaleFontColor: 'rgba(106, 109, 120, 1)',
      belowLineFillColorGrowing: 'rgba(41, 98, 255, 0.12)',
      belowLineFillColorFalling: 'rgba(41, 98, 255, 0.12)',
      belowLineFillColorGrowingBottom: 'rgba(41, 98, 255, 0)',
      belowLineFillColorFallingBottom: 'rgba(41, 98, 255, 0)',
      symbolActiveColor: 'rgba(41, 98, 255, 0.12)',
      tabs: [
        {
          title: 'Crypto',
          symbols: [
            { s: 'BINANCE:BTCUSDT', d: 'Bitcoin' },
            { s: 'BINANCE:ETHUSDT', d: 'Ethereum' },
            { s: 'BINANCE:BNBUSDT', d: 'BNB' },
            { s: 'BINANCE:SOLUSDT', d: 'Solana' },
            { s: 'BINANCE:XRPUSDT', d: 'Ripple' },
            { s: 'BINANCE:ADAUSDT', d: 'Cardano' },
          ],
          originalTitle: 'Crypto',
        },
        {
          title: 'Indices',
          symbols: [
            { s: 'FOREXCOM:SPXUSD', d: 'S&P 500' },
            { s: 'FOREXCOM:NSXUSD', d: 'US 100' },
            { s: 'FOREXCOM:DJI', d: 'Dow 30' },
            { s: 'INDEX:NKY', d: 'Nikkei 225' },
            { s: 'INDEX:DEU40', d: 'DAX Index' },
            { s: 'FOREXCOM:UKXGBP', d: 'UK 100' },
          ],
          originalTitle: 'Indices',
        },
        {
          title: 'Forex',
          symbols: [
            { s: 'FX:EURUSD', d: 'EUR to USD' },
            { s: 'FX:GBPUSD', d: 'GBP to USD' },
            { s: 'FX:USDJPY', d: 'USD to JPY' },
            { s: 'FX:USDCHF', d: 'USD to CHF' },
            { s: 'FX:AUDUSD', d: 'AUD to USD' },
            { s: 'FX:USDCAD', d: 'USD to CAD' },
          ],
          originalTitle: 'Forex',
        },
      ],
    });

    container.current.appendChild(script);

    return () => {
      if (container.current) {
        container.current.innerHTML = '';
      }
    };
  }, [theme, width, height, dateRange, showChart, isTransparent]);

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

export default memo(MarketOverview);

