import React, { useEffect, useRef, memo } from 'react';

interface CryptoHeatmapProps {
  theme?: 'light' | 'dark';
  width?: string | number;
  height?: string | number;
  colorTheme?: 'light' | 'dark';
  dataSource?: string;
  exchange?: string;
  grouping?: string;
  blockSize?: string;
  blockColor?: string;
  locale?: string;
  symbolUrl?: string;
  hasTopBar?: boolean;
  isDataSetEnabled?: boolean;
  isZoomEnabled?: boolean;
  hasSymbolTooltip?: boolean;
  isMonoSize?: boolean;
}

const CryptoHeatmap: React.FC<CryptoHeatmapProps> = ({
  theme = 'dark',
  width = '100%',
  height = 400,
  dataSource = 'Crypto',
  exchange = 'BINANCE',
  grouping = 'no_group',
  blockSize = 'market_cap_calc',
  blockColor = 'change',
  hasTopBar = false,
  isDataSetEnabled = false,
  isZoomEnabled = true,
  hasSymbolTooltip = true,
  isMonoSize = false,
}) => {
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!container.current) return;

    container.current.innerHTML = '';

    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-crypto-coins-heatmap.js';
    script.type = 'text/javascript';
    script.async = true;
    script.innerHTML = JSON.stringify({
      dataSource: dataSource,
      exchange: exchange,
      grouping: grouping,
      blockSize: blockSize,
      blockColor: blockColor,
      locale: 'en',
      symbolUrl: '',
      colorTheme: theme,
      hasTopBar: hasTopBar,
      isDataSetEnabled: isDataSetEnabled,
      isZoomEnabled: isZoomEnabled,
      hasSymbolTooltip: hasSymbolTooltip,
      isMonoSize: isMonoSize,
      width: typeof width === 'number' ? width : undefined,
      height: typeof height === 'number' ? height : undefined,
    });

    container.current.appendChild(script);

    return () => {
      if (container.current) {
        container.current.innerHTML = '';
      }
    };
  }, [
    theme, width, height, dataSource, exchange, grouping,
    blockSize, blockColor, hasTopBar, isDataSetEnabled,
    isZoomEnabled, hasSymbolTooltip, isMonoSize
  ]);

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

export default memo(CryptoHeatmap);

