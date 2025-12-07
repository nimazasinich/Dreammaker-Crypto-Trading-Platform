import React, { useState, useEffect, useRef } from 'react';
import { BTCIcon, ETHIcon, SOLIcon, BNBIcon, ADAIcon, DOTIcon } from '../icons/CryptoIcons';
import { useTheme } from '../Theme/ThemeProvider';
import { hfDataService } from '../../services/HFDataService';

interface CryptoAsset {
  symbol: string;
  name: string;
  icon: React.ComponentType<{ className?: string; size?: number }>;
  price?: number;
  change24h?: number;
  isLoading?: boolean;
}

interface ModernSymbolRibbonProps {
  selectedSymbol: string;
  onSymbolChange: (symbol: string) => void;
  isLoading?: boolean;
}

const CRYPTO_ASSETS: CryptoAsset[] = [
  { symbol: 'BTC', name: 'Bitcoin', icon: BTCIcon },
  { symbol: 'ETH', name: 'Ethereum', icon: ETHIcon },
  { symbol: 'BNB', name: 'BNB', icon: BNBIcon },
  { symbol: 'SOL', name: 'Solana', icon: SOLIcon },
  { symbol: 'ADA', name: 'Cardano', icon: ADAIcon },
  { symbol: 'DOT', name: 'Polkadot', icon: DOTIcon },
];

export const ModernSymbolRibbon: React.FC<ModernSymbolRibbonProps> = ({
  selectedSymbol,
  onSymbolChange,
  isLoading = false,
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const scrollRef = useRef<HTMLDivElement>(null);
  const [assets, setAssets] = useState<CryptoAsset[]>(CRYPTO_ASSETS);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  // Fetch real prices with error handling
  useEffect(() => {
    let errorCount = 0;
    let intervalId: NodeJS.Timeout | null = null;
    
    const fetchPrices = async () => {
      try {
        // Fetch market data from HF service
        const response = await hfDataService.getMarketData(20);
        
        if (!response.success || !response.data) {
          errorCount++;
          // Stop trying after 3 consecutive errors
          if (errorCount >= 3) {
            console.warn('Too many errors, stopping price updates');
            if (intervalId) clearInterval(intervalId);
            setAssets(CRYPTO_ASSETS.map(a => ({ ...a, isLoading: false })));
            return;
          }
          throw new Error(response.error || 'Failed to fetch market data');
        }
        
        const data = response.data;
        
        // Reset error count on success
        errorCount = 0;
        
        // Update assets with real prices from HF
        const updatedAssets = CRYPTO_ASSETS.map(asset => {
          const ticker = data.find((t: any) => t.symbol === asset.symbol);
          if (ticker) {
            return {
              ...asset,
              price: ticker.price,
              change24h: ticker.change_24h,
              isLoading: false,
            };
          }
          return { ...asset, isLoading: false };
        });
        
        setAssets(updatedAssets);
      } catch (error) {
        // Only log first error to avoid console spam
        if (errorCount === 1) {
          console.warn('Price fetch failed, will retry:', error);
        }
        setAssets(CRYPTO_ASSETS.map(a => ({ ...a, isLoading: false })));
      }
    };

    fetchPrices();
    intervalId = setInterval(fetchPrices, 60000); // Increased to 60 seconds
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, []);

  // Handle scroll arrows visibility
  const handleScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setShowLeftArrow(scrollLeft > 0);
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 300;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  useEffect(() => {
    const ref = scrollRef.current;
    if (ref) {
      ref.addEventListener('scroll', handleScroll);
      handleScroll();
      return () => ref.removeEventListener('scroll', handleScroll);
    }
  }, []);

  return (
    <div className="relative">
      {/* Scroll Left Arrow */}
      {showLeftArrow && (
        <button
          onClick={() => scroll('left')}
          className="absolute left-0 top-1/2 z-10 -translate-y-1/2 rounded-r-xl p-3 shadow-2xl transition-all duration-300 hover:scale-110"
          style={{
            background: isDark
              ? 'linear-gradient(90deg, rgba(26, 26, 40, 0.98) 0%, rgba(26, 26, 40, 0.8) 100%)'
              : 'linear-gradient(90deg, rgba(255, 255, 255, 0.98) 0%, rgba(255, 255, 255, 0.8) 100%)',
            backdropFilter: 'blur(10px)',
          }}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={isDark ? 'text-white' : 'text-slate-900'}
          >
            <path
              d="M15 18L9 12L15 6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      )}

      {/* Scroll Right Arrow */}
      {showRightArrow && (
        <button
          onClick={() => scroll('right')}
          className="absolute right-0 top-1/2 z-10 -translate-y-1/2 rounded-l-xl p-3 shadow-2xl transition-all duration-300 hover:scale-110"
          style={{
            background: isDark
              ? 'linear-gradient(90deg, rgba(26, 26, 40, 0.8) 0%, rgba(26, 26, 40, 0.98) 100%)'
              : 'linear-gradient(90deg, rgba(255, 255, 255, 0.8) 0%, rgba(255, 255, 255, 0.98) 100%)',
            backdropFilter: 'blur(10px)',
          }}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={isDark ? 'text-white' : 'text-slate-900'}
          >
            <path
              d="M9 18L15 12L9 6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      )}

      {/* Ribbon Container */}
      <div
        ref={scrollRef}
        className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide"
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
      >
        {assets.map((asset, index) => {
          const Icon = asset.icon;
          const isSelected = selectedSymbol === asset.symbol;
          const isPositive = (asset.change24h || 0) >= 0;

          return (
            <button
              key={asset.symbol}
              onClick={() => !isLoading && onSymbolChange(asset.symbol)}
              disabled={isLoading}
              className="group relative flex min-w-[180px] flex-shrink-0 flex-col overflow-hidden rounded-2xl p-4 transition-all duration-300 disabled:opacity-50"
              style={{
                background: isSelected
                  ? isDark
                    ? 'linear-gradient(135deg, rgba(139, 92, 246, 0.25) 0%, rgba(124, 58, 237, 0.25) 100%)'
                    : 'linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, rgba(124, 58, 237, 0.15) 100%)'
                  : isDark
                    ? 'linear-gradient(135deg, rgba(30, 30, 45, 0.8) 0%, rgba(25, 25, 40, 0.8) 100%)'
                    : 'linear-gradient(135deg, rgba(248, 250, 252, 0.9) 0%, rgba(241, 245, 249, 0.9) 100%)',
                border: isSelected
                  ? '2px solid rgba(139, 92, 246, 0.6)'
                  : `1px solid ${isDark ? 'rgba(139, 92, 246, 0.15)' : 'rgba(139, 92, 246, 0.1)'}`,
                boxShadow: isSelected
                  ? '0 8px 32px rgba(139, 92, 246, 0.3), inset 0 1px 2px rgba(255, 255, 255, 0.1)'
                  : '0 2px 8px rgba(0, 0, 0, 0.05)',
                transform: isSelected ? 'scale(1.02)' : 'scale(1)',
                animationDelay: `${index * 50}ms`,
              }}
            >
              {/* Background glow effect */}
              {isSelected && (
                <div
                  className="absolute inset-0 opacity-30 blur-xl"
                  style={{
                    background: 'radial-gradient(circle at 50% 50%, rgba(139, 92, 246, 0.4) 0%, transparent 70%)',
                  }}
                />
              )}

              {/* Shimmer effect on hover */}
              <div
                className="absolute inset-0 translate-x-[-100%] bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-700 group-hover:translate-x-[100%]"
              />

              <div className="relative z-10 flex items-start justify-between">
                <div className="flex items-center gap-3">
                  {/* Crypto Icon */}
                  <div
                    className="relative flex h-12 w-12 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110"
                    style={{
                      boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
                    }}
                  >
                    <Icon size={32} className="drop-shadow-lg" />
                    {isSelected && (
                      <div
                        className="absolute inset-0 animate-ping rounded-xl opacity-20"
                        style={{
                          background: 'radial-gradient(circle, rgba(139, 92, 246, 0.6) 0%, transparent 70%)',
                        }}
                      />
                    )}
                  </div>

                  {/* Asset Info */}
                  <div className="flex flex-col items-start">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-base font-bold ${
                          isDark ? 'text-white' : 'text-slate-900'
                        }`}
                      >
                        {asset.symbol}
                      </span>
                      {isSelected && (
                        <div
                          className="h-1.5 w-1.5 animate-pulse rounded-full"
                          style={{
                            background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                            boxShadow: '0 0 8px rgba(139, 92, 246, 0.8)',
                          }}
                        />
                      )}
                    </div>
                    <span
                      className={`text-xs ${
                        isDark ? 'text-slate-400' : 'text-slate-600'
                      }`}
                    >
                      {asset.name}
                    </span>
                  </div>
                </div>
              </div>

              {/* Price & Change */}
              <div className="relative z-10 mt-3 flex items-end justify-between">
                {asset.price !== undefined ? (
                  <>
                    <div className="flex flex-col">
                      <span
                        className={`text-sm font-bold ${
                          isDark ? 'text-white' : 'text-slate-900'
                        }`}
                      >
                        ${asset.price.toLocaleString('en-US', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </span>
                    </div>
                    <div
                      className={`flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold ${
                        isPositive
                          ? 'bg-green-500/20 text-green-500'
                          : 'bg-red-500/20 text-red-500'
                      }`}
                      style={{
                        boxShadow: isPositive
                          ? '0 0 10px rgba(34, 197, 94, 0.2)'
                          : '0 0 10px rgba(239, 68, 68, 0.2)',
                      }}
                    >
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        style={{
                          transform: isPositive ? 'rotate(0deg)' : 'rotate(180deg)',
                        }}
                      >
                        <path
                          d="M12 5L19 12L17.6 13.4L13 8.8V19H11V8.8L6.4 13.4L5 12L12 5Z"
                          fill="currentColor"
                        />
                      </svg>
                      {Math.abs(asset.change24h || 0).toFixed(2)}%
                    </div>
                  </>
                ) : (
                  <div className="h-6 w-full animate-pulse rounded bg-slate-300/20" />
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Hide scrollbar using standard CSS */}
      <style dangerouslySetInnerHTML={{
        __html: `
          .scrollbar-hide::-webkit-scrollbar {
            display: none;
          }
          .scrollbar-hide {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
        `
      }} />
    </div>
  );
};

