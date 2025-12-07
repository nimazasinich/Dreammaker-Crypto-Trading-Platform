/**
 * ExtremePointsOverlay Component
 * Displays detected extreme points as visual markers
 */

import React from 'react';
import { ExtremePoint } from '../../services/ExtremePointsDetector';
import { ArrowUp, ArrowDown, Target, AlertTriangle } from 'lucide-react';

interface ExtremePointsOverlayProps {
  signals: ExtremePoint[];
  onSignalClick?: (signal: ExtremePoint) => void;
  isDark?: boolean;
}

const ExtremePointsOverlay: React.FC<ExtremePointsOverlayProps> = ({
  signals,
  onSignalClick,
  isDark = true
}) => {
  if (signals.length === 0) return null;

  const formatPrice = (price: number) => {
    if (price >= 1000) return `$${price.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
    if (price >= 1) return `$${price.toFixed(2)}`;
    return `$${price.toFixed(6)}`;
  };

  return (
    <div className="absolute top-4 right-4 z-20 flex flex-col gap-2 max-h-[300px] overflow-y-auto">
      {signals.slice(0, 5).map(signal => (
        <div
          key={signal.id}
          onClick={() => onSignalClick?.(signal)}
          className={`
            flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer
            transition-all duration-200 hover:scale-105
            ${signal.signalType === 'BUY' 
              ? 'bg-green-500/90 hover:bg-green-500' 
              : 'bg-red-500/90 hover:bg-red-500'
            }
          `}
          style={{
            boxShadow: signal.signalType === 'BUY'
              ? '0 4px 12px rgba(34, 197, 94, 0.4)'
              : '0 4px 12px rgba(239, 68, 68, 0.4)',
          }}
        >
          {/* Signal Icon */}
          <div className="flex-shrink-0">
            {signal.signalType === 'BUY' ? (
              <ArrowUp className="h-5 w-5 text-white" />
            ) : (
              <ArrowDown className="h-5 w-5 text-white" />
            )}
          </div>

          {/* Signal Info */}
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-white font-bold text-sm">
                {signal.symbol.replace('USDT', '')}
              </span>
              <span className="text-white/80 text-xs">
                {signal.confidence}%
              </span>
            </div>
            <span className="text-white/90 text-xs">
              {formatPrice(signal.price)}
            </span>
          </div>

          {/* Target indicator */}
          {signal.targetPrice && (
            <div className="flex items-center gap-1 ml-2 pl-2 border-l border-white/30">
              <Target className="h-3 w-3 text-white/80" />
              <span className="text-white/80 text-xs">
                {formatPrice(signal.targetPrice)}
              </span>
            </div>
          )}
        </div>
      ))}

      {signals.length > 5 && (
        <div className={`text-center text-xs py-1 rounded ${
          isDark ? 'text-slate-400 bg-slate-800/80' : 'text-slate-600 bg-white/80'
        }`}>
          +{signals.length - 5} more signals
        </div>
      )}
    </div>
  );
};

export default ExtremePointsOverlay;
